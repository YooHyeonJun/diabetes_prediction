# backend/predict.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch, shap, pickle, numpy as np
from pathlib import Path

# ── 모델/데이터 경로 ─────────────────────────────
ROOT      = Path(__file__).resolve().parents[1]
MODEL_PATH= ROOT / "models" / "model_weights.pth"
BG_PATH   = ROOT / "models" / "background_data.pkl"
SCALER_PATH = ROOT / "models" / "scaler.pkl"
scaler = pickle.load(open(SCALER_PATH, "rb"))
from ml_core.model import MLP
FEATURE_NAMES = [
    "HighBP","HighChol","CholCheck","BMI","Smoker","Stroke",
    "HeartDiseaseorAttack","PhysActivity","Fruits","Veggies",
    "HvyAlcoholConsump","AnyHealthcare","NoDocbcCost","GenHlth",
    "MentHlth","PhysHlth","DiffWalk","Sex","Age","Education","Income"
]

# ── 모델 정의 재사용 ─────────────────────────────

model = MLP(len(FEATURE_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()

background = torch.from_numpy(pickle.load(open(BG_PATH, "rb"))).float()
explainer  = shap.GradientExplainer(model, background)

# ── FastAPI 인스턴스 ────────────────────────────
app = FastAPI(title="Diabetes XAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Input(BaseModel):
    data: list[float]                 # 21개

class Output(BaseModel):
    prob: float                       # 양성(당뇨) 확률
    shap: dict                        # {feature: shap_value}

# ── 엔드포인트 ──────────────────────────────────
@app.post("/predict", response_model=Output)
def predict(item: Input):
    X_raw = np.array([item.data], dtype=np.float32)

    # ② 스케일링
    X_scaled = scaler.transform(X_raw)
    x = torch.tensor(X_scaled, dtype=torch.float32)
    with torch.no_grad():
        prob = torch.softmax(model(x), dim=1)[0, 1].item()

    sv = explainer.shap_values(x)
    sv_arr = np.asarray(sv)
    # (samples, features, classes) 형태 대응
    if sv_arr.ndim == 3 and sv_arr.shape[1] == len(FEATURE_NAMES):
        vals = sv_arr[0, :, 1]
    elif sv_arr.ndim == 3 and sv_arr.shape[-1] == len(FEATURE_NAMES):
        vals = sv_arr[0, 1, :]
    elif isinstance(sv, list):        # 구버전 list
        vals = sv[1][0]
    else:
        raise RuntimeError(f"Unknown SHAP shape {sv_arr.shape}")

    shap_dict = {k: float(v) for k, v in zip(FEATURE_NAMES, vals)}
    return {"prob": prob, "shap": shap_dict}
