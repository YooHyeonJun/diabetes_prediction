from datetime import datetime
from pathlib import Path
from typing import List

import numpy as np, torch, pickle, shap
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import init_db, AsyncSessionLocal
from backend.auth import (
    fastapi_users, auth_backend, current_user,
    User, UserRead, UserCreate
)
from backend.models import Record
from ml_core.model import MLP

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

# ───────────────────────
app = FastAPI(title="Diabetes XAI API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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