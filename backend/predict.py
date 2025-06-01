from datetime import datetime, timedelta
from pathlib import Path
from typing import List

import numpy as np, torch, pickle, shap
from fastapi import FastAPI, Depends, Query, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, extract, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse

from backend.database import init_db, AsyncSessionLocal
from backend.auth import (
    fastapi_users, auth_backend, current_user,
    User, UserRead, UserCreate
)
from backend.models import Record, Reminder, Mission, UserMission, Post, Comment
from ml_core.model import MLP
from backend.faq_data import FAQ_LIST, HEALTH_KEYWORD_ANSWERS

# ── 모델·SHAP 로드 ─────────────────────────────────────────
ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH, SCALER_PATH, BG_PATH = (
    ROOT / "models" / name for name in (
        "model_weights.pth", "scaler.pkl", "background_data.pkl"
    )
)

FEATURE_NAMES = [
    "HighBP","HighChol","CholCheck","BMI","Smoker","Stroke",
    "HeartDiseaseorAttack","PhysActivity","Fruits","Veggies",
    "HvyAlcoholConsump","AnyHealthcare","NoDocbcCost","GenHlth",
    "MentHlth","PhysHlth","DiffWalk","Sex","Age","Education","Income"
]
model = MLP(len(FEATURE_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()
scaler = pickle.load(open(SCALER_PATH, "rb"))
background = torch.from_numpy(pickle.load(open(BG_PATH, "rb"))).float()
explainer = shap.GradientExplainer(model, background)

# FAQ 샘플 (실제 운영 시 1000개까지 확장 가능)
FAQ_LIST = [
    ("당뇨병이란?", "당뇨병은 혈당 조절에 문제가 생기는 만성 질환입니다. 식단 관리와 운동이 중요합니다."),
    ("고혈압이란?", "고혈압은 혈관에 높은 압력이 지속되는 상태로, 저염식과 운동이 도움이 됩니다."),
    ("비만이란?", "비만은 체지방이 과도하게 축적된 상태로, 식단 조절과 운동이 필요합니다."),
    ("콜레스테롤이 높으면 어떻게 해야 하나요?", "식이섬유가 풍부한 식단과 규칙적인 운동이 콜레스테롤 관리에 도움이 됩니다."),
    ("혈당을 낮추는 방법은?", "채소 위주의 식단과 규칙적인 운동, 스트레스 관리가 혈당 조절에 도움이 됩니다."),
    ("운동은 얼마나 해야 하나요?", "주 3회 이상, 30분 이상 유산소 운동을 권장합니다."),
    ("금연이 건강에 미치는 영향은?", "금연은 심혈관 질환, 암 등 다양한 질병 예방에 매우 중요합니다."),
    ("스트레스 해소법은?", "규칙적인 운동, 취미 생활, 충분한 수면이 스트레스 해소에 도움이 됩니다."),
    ("수면은 얼마나 해야 하나요?", "성인은 하루 7~8시간의 충분한 수면이 필요합니다."),
    ("정기 건강검진이 필요한가요?", "정기적인 건강검진은 질병의 조기 발견과 예방에 매우 중요합니다."),
]

import difflib

def find_faq_answer(question, threshold=0.6):  # 임계값 낮춤
    # 가장 유사한 질문을 찾아 threshold 이상이면 답변 반환
    questions = [q for q, a in FAQ_LIST]
    matches = difflib.get_close_matches(question, questions, n=1, cutoff=threshold)
    if matches:
        idx = questions.index(matches[0])
        return FAQ_LIST[idx][1]
    return None

MEDICAL_PROMPT = (
    "You are a medical expert. Please provide a professional and accurate answer to the following health-related question.\n\n"
    "Question: {question}\n"
    "Answer:"
)

# ───────────────────────
app = FastAPI(title="Diabetes XAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.0.28:3000", "http://121.160.28.246:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])

# ───────────────────────
class Input(BaseModel):
    data: List[float] = Field(..., min_items=21, max_items=21)

class Output(BaseModel):
    prob: float
    shap: dict

class RecordOut(BaseModel):
    id: int
    created_at: datetime
    inputs: List[float]
    prob: float

class CompareOut(BaseModel):
    prev_prob: float | None = None
    curr_prob: float
    prob_change: float | None = None
    prev_shap: dict | None = None
    curr_shap: dict
    top_changed_features: list[str]
    feedback: str
    recommendation: str

class ReminderIn(BaseModel):
    message: str
    remind_at: datetime

class ReminderOut(BaseModel):
    id: int
    message: str
    remind_at: datetime
    is_sent: bool

class TrendPoint(BaseModel):
    month: str  # 'YYYY-MM'
    avg_prob: float
    count: int

class MissionOut(BaseModel):
    id: int
    title: str
    description: str
    goal: str
    reward: str
    status: str | None = None
    progress: int | None = None

class PostOut(BaseModel):
    id: int
    user_id: str
    title: str
    content: str
    created_at: datetime

class PostIn(BaseModel):
    title: str
    content: str

class CommentOut(BaseModel):
    id: int
    post_id: int
    user_id: str
    content: str
    created_at: datetime

class CommentIn(BaseModel):
    post_id: int
    content: str

class ChatRequest(BaseModel):
    message: str

# ───────────────────────
@app.post("/predict", response_model=Output)
async def predict(item: Input, user: User = Depends(current_user)):
    X_scaled = scaler.transform([item.data])
    x = torch.tensor(X_scaled, dtype=torch.float32)

    with torch.no_grad():
        prob = torch.softmax(model(x), dim=1)[0, 1].item()

    sv_arr = np.asarray(explainer.shap_values(x))
    vals = sv_arr[1][0] if isinstance(sv_arr, list) else sv_arr[0, :, 1]
    shap_dict = {k: float(v) for k, v in zip(FEATURE_NAMES, vals)}

    async with AsyncSessionLocal() as session:
        record = Record(user_id=user.id, created_at=datetime.utcnow(), inputs=item.data, prob=prob, shap=shap_dict)
        session.add(record)
        await session.commit()

    return {"prob": prob, "shap": shap_dict}

@app.get("/records", response_model=List[RecordOut])
async def get_records(limit: int = Query(10, le=50), user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Record).where(Record.user_id == user.id).order_by(Record.created_at.desc()).limit(limit)
        )
        return result.scalars().all()

@app.get("/api/records/compare", response_model=CompareOut)
async def compare_records(user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Record).where(Record.user_id == user.id).order_by(Record.created_at.desc()).limit(2)
        )
        records = result.scalars().all()
        if not records:
            return JSONResponse(status_code=404, content={"detail": "No records found."})
        curr = records[0]
        prev = records[1] if len(records) > 1 else None

        # 변화량 계산
        prev_prob = prev.prob if prev else None
        curr_prob = curr.prob
        prob_change = (curr_prob - prev_prob) if prev else None
        prev_shap = prev.shap if prev else None
        curr_shap = curr.shap

        # SHAP 변화량 큰 feature 상위 3개
        top_changed_features = []
        if prev_shap:
            diffs = {k: abs(curr_shap.get(k, 0) - prev_shap.get(k, 0)) for k in curr_shap}
            top_changed_features = sorted(diffs, key=diffs.get, reverse=True)[:3]

        # 피드백/추천 예시
        feedback = ""
        recommendation = ""
        if prob_change is not None:
            if prob_change > 0.03:
                feedback = f"최근 예측 위험도가 {prob_change*100:.1f}%p 증가했습니다. 건강 관리에 주의하세요."
            elif prob_change < -0.03:
                feedback = f"최근 예측 위험도가 {abs(prob_change)*100:.1f}%p 감소했습니다. 좋은 변화입니다!"
            else:
                feedback = "예측 위험도에 큰 변화가 없습니다. 현재 상태를 유지하세요."
        else:
            feedback = "첫 예측 기록입니다."
        if top_changed_features:
            recommendation = f"최근 '{', '.join(top_changed_features)}' 항목에서 변화가 큽니다. 해당 항목을 집중 관리해보세요."
        else:
            recommendation = "입력값을 꾸준히 기록하며 변화를 관찰하세요."

        return CompareOut(
            prev_prob=prev_prob,
            curr_prob=curr_prob,
            prob_change=prob_change,
            prev_shap=prev_shap,
            curr_shap=curr_shap,
            top_changed_features=top_changed_features,
            feedback=feedback,
            recommendation=recommendation
        )

@app.post("/api/reminders", response_model=ReminderOut)
async def create_reminder(reminder: ReminderIn, user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        r = Reminder(user_id=user.id, message=reminder.message, remind_at=reminder.remind_at, is_sent=False)
        session.add(r)
        await session.commit()
        await session.refresh(r)
        return ReminderOut(id=r.id, message=r.message, remind_at=r.remind_at, is_sent=r.is_sent)

@app.get("/api/reminders", response_model=list[ReminderOut])
async def get_reminders(user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Reminder).where(Reminder.user_id == user.id).order_by(Reminder.remind_at.desc())
        )
        reminders = result.scalars().all()
        return [ReminderOut(id=r.id, message=r.message, remind_at=r.remind_at, is_sent=r.is_sent) for r in reminders]

@app.get("/api/records/trend", response_model=list[TrendPoint])
async def get_trend(user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        now = datetime.utcnow()
        year_ago = now - timedelta(days=365)
        result = await session.execute(
            select(
                func.strftime('%Y-%m', Record.created_at).label('month'),
                func.avg(Record.prob).label('avg_prob'),
                func.count().label('count')
            ).where(
                Record.user_id == user.id,
                Record.created_at >= year_ago
            ).group_by('month').order_by('month')
        )
        rows = result.all()
        return [TrendPoint(month=row.month, avg_prob=row.avg_prob, count=row.count) for row in rows]

@app.get("/api/missions", response_model=list[MissionOut])
async def get_missions(user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        missions = (await session.execute(select(Mission))).scalars().all()
        user_missions = (await session.execute(
            select(UserMission).where(UserMission.user_id == user.id)
        )).scalars().all()
        umap = {um.mission_id: um for um in user_missions}
        out = []
        for m in missions:
            um = umap.get(m.id)
            out.append(MissionOut(
                id=m.id, title=m.title, description=m.description, goal=m.goal, reward=m.reward,
                status=um.status if um else None, progress=um.progress if um else None
            ))
        return out

class MissionJoinIn(BaseModel):
    mission_id: int

@app.post("/api/missions/join")
async def join_mission(data: MissionJoinIn, user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        exists = (await session.execute(
            select(UserMission).where(UserMission.user_id == user.id, UserMission.mission_id == data.mission_id)
        )).scalar_one_or_none()
        if exists:
            return {"detail": "이미 참여 중입니다."}
        um = UserMission(user_id=user.id, mission_id=data.mission_id, status="진행중", progress=0)
        session.add(um)
        await session.commit()
        return {"detail": "참여 완료"}

class MissionProgressIn(BaseModel):
    mission_id: int
    progress: int
    status: str

@app.post("/api/missions/progress")
async def update_mission_progress(data: MissionProgressIn, user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        um = (await session.execute(
            select(UserMission).where(UserMission.user_id == user.id, UserMission.mission_id == data.mission_id)
        )).scalar_one_or_none()
        if not um:
            return {"detail": "참여 기록 없음"}
        um.progress = data.progress
        um.status = data.status
        await session.commit()
        return {"detail": "업데이트 완료"}

@app.get("/api/community/posts", response_model=list[PostOut])
async def get_posts():
    async with AsyncSessionLocal() as session:
        posts = (await session.execute(select(Post).order_by(Post.created_at.desc()))).scalars().all()
        return [PostOut(id=p.id, user_id=str(p.user_id), title=p.title, content=p.content, created_at=p.created_at) for p in posts]

@app.post("/api/community/posts", response_model=PostOut)
async def create_post(post: PostIn, user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        p = Post(user_id=user.id, title=post.title, content=post.content)
        session.add(p)
        await session.commit()
        await session.refresh(p)
        return PostOut(id=p.id, user_id=str(p.user_id), title=p.title, content=p.content, created_at=p.created_at)

@app.get("/api/community/comments", response_model=list[CommentOut])
async def get_comments(post_id: int):
    async with AsyncSessionLocal() as session:
        comments = (await session.execute(
            select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at)
        )).scalars().all()
        return [CommentOut(id=c.id, post_id=c.post_id, user_id=str(c.user_id), content=c.content, created_at=c.created_at) for c in comments]

@app.post("/api/community/comments", response_model=CommentOut)
async def create_comment(comment: CommentIn, user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        c = Comment(post_id=comment.post_id, user_id=user.id, content=comment.content)
        session.add(c)
        await session.commit()
        await session.refresh(c)
        return CommentOut(id=c.id, post_id=c.post_id, user_id=str(c.user_id), content=c.content, created_at=c.created_at)

@app.get("/api/coach")
async def get_coach(user: User = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        # 최근 기록 1개 불러오기
        result = await session.execute(
            select(Record).where(Record.user_id == user.id).order_by(Record.created_at.desc()).limit(1)
        )
        rec = result.scalar_one_or_none()
        if not rec:
            return {"advice": "예측 기록이 없습니다. 먼저 예측을 진행해 주세요."}
        # 샘플: BMI, 운동, 음주 등 주요 feature 기반 임의 피드백
        bmi = rec.shap.get("BMI", 0)
        alcohol = rec.shap.get("HvyAlcoholConsump", 0)
        act = rec.shap.get("PhysActivity", 0)
        advice = []
        if bmi > 0.15:
            advice.append("유사 사용자들은 BMI를 2 이상 낮추면 위험도가 평균 5% 감소했습니다.")
        if alcohol > 0.1:
            advice.append("음주 빈도를 줄이면 위험도가 크게 감소할 수 있습니다.")
        if act > 0.1:
            advice.append("운동을 주 2회 이상 실천한 그룹은 위험도가 4%p 낮았습니다.")
        if not advice:
            advice.append("현재 건강 습관을 잘 유지하고 계십니다!")
        return {"advice": "\n".join(advice)}

@app.post("/api/account/request-2fa")
async def request_2fa(user: User = Depends(current_user)):
    # 실제로는 이메일/SMS로 코드 발송, 여기선 샘플 코드 반환
    return {"code": "123456", "message": "2단계 인증 코드가 발송되었습니다. (샘플)"}

@app.post("/api/account/verify-2fa")
async def verify_2fa(code: str, user: User = Depends(current_user)):
    # 실제로는 DB/캐시에서 코드 검증, 여기선 샘플
    if code == "123456":
        return {"result": "success"}
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"result": "fail", "message": "코드가 올바르지 않습니다."})

@app.delete("/api/account/delete")
async def delete_account(user: User = Depends(current_user)):
    # 실제로는 user 및 관련 데이터 삭제, 여기선 샘플 메시지
    return {"result": "success", "message": "계정 및 데이터 삭제가 요청되었습니다. (샘플)"}

@app.post("/api/chatbot")
async def chat(request: ChatRequest):
    question = request.message.lower()
    matched = None
    for keyword in HEALTH_KEYWORD_ANSWERS:
        if keyword in question:
            matched = keyword
            break
    if matched:
        return {"response": HEALTH_KEYWORD_ANSWERS[matched]}
    else:
        return {"response": "죄송합니다. 해당 건강 정보는 준비되어 있지 않습니다. 다른 건강 관련 키워드로 질문해 주세요."}