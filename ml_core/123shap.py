"""
apply_shap_explainer.py
-----------------------
(1) 저장된 MLP 분류 모델(state_dict) 로드
(2) SHAP GradientExplainer 로 단일 샘플 해석
(3) SHAP 값 상위 중요도 순으로 출력

# 실행 예
$ python apply_shap_explainer.py
"""

import torch
import torch.nn as nn
import shap
import numpy as np
import pandas as pd
import pickle
from pathlib import Path

# ------------------------------------------------
# 1) MLP 클래스 정의 (train_save_shap.py 동일)
# ------------------------------------------------
class MLP(nn.Module):
    def __init__(
        self,
        input_dim: int,
        hidden1: int = 128,
        hidden2: int = 64,
        num_classes: int = 2,
    ):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden1),
            nn.ReLU(),
            nn.Linear(hidden1, hidden2),
            nn.ReLU(),
            nn.Linear(hidden2, num_classes),
        )

    def forward(self, x):
        return self.net(x)

# ------------------------------------------------
# 2) 설정
# ------------------------------------------------
MODEL_WEIGHTS   = "model_weights.pth"      # state_dict 파일
BACKGROUND_FILE = "background_data.pkl"    # pickle.dump 된 NumPy 2D 배열
FEATURE_NAMES   = [
    "HighBP","HighChol","CholCheck","BMI",
    "Smoker","Stroke","HeartDiseaseorAttack","PhysActivity",
    "Fruits","Veggies","HvyAlcoholConsump","AnyHealthcare",
    "NoDocbcCost","GenHlth","MentHlth","PhysHlth",
    "DiffWalk","Sex","Age","Education","Income"
]

# ------------------------------------------------
# 3) 모델 로드
# ------------------------------------------------
def load_model(path: str | Path) -> nn.Module:
    model = MLP(input_dim=len(FEATURE_NAMES), hidden1=128, hidden2=64, num_classes=2)
    state = torch.load(path, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    return model

# ------------------------------------------------
# 4) 배경 데이터 로드
# ------------------------------------------------
def load_background(path: str | Path | None = None) -> torch.Tensor:
    if path and Path(path).exists():
        with open(path, "rb") as f:
            arr = pickle.load(f)
        print(f"[INFO] Loaded background data from '{path}'")
        return torch.from_numpy(arr).float()

    print("[WARN] Using random background data (50 × features)")
    return torch.rand(50, len(FEATURE_NAMES))

# ------------------------------------------------
# 5) SHAP 계산 & 출력
# ------------------------------------------------
def explain_sample(model, background, sample_np, class_idx: int = 1):
    explainer = shap.GradientExplainer(model, background)
    data      = torch.from_numpy(sample_np.astype(np.float32))

    shap_vals = explainer.shap_values(data)          # list 또는 ndarray
    # ------------------------------------------------------------------------
    if isinstance(shap_vals, list):                  # (구버전) list[k][samples, features]
        vals = shap_vals[class_idx][0]               # (features,)
    else:
        arr = np.asarray(shap_vals)

        # ───── 3-D 배열 처리 ────────────────────────────────────────────────
        if arr.ndim == 3:
            # (samples, classes, features)
            if arr.shape[-1] == len(FEATURE_NAMES):
                vals = arr[0, class_idx, :]

            # (samples, features, classes)  ←★ 이번 오류 케이스 (1, 21, 2)
            elif arr.shape[1] == len(FEATURE_NAMES):
                vals = arr[0, :, class_idx]

            else:
                raise ValueError(f"Unsupported 3-D shape: {arr.shape}")

        # ───── 2-D 배열 처리 ────────────────────────────────────────────────
        elif arr.ndim == 2:
            if arr.shape[1] == len(FEATURE_NAMES):          # (n, 21)
                vals = arr[0] if arr.shape[0] == 1 else arr[class_idx]
            elif arr.shape[0] == len(FEATURE_NAMES):        # (21, n)
                vals = arr[:, class_idx]
            else:
                raise ValueError(f"Unsupported 2-D shape: {arr.shape}")

        # ───── 1-D 배열 처리 ────────────────────────────────────────────────
        elif arr.ndim == 1 and arr.shape[0] == len(FEATURE_NAMES):
            vals = arr

        else:
            raise ValueError(f"Unsupported shap_values shape: {arr.shape}")
    # ------------------------------------------------------------------------

    if len(vals) != len(FEATURE_NAMES):
        raise ValueError(
            f"Length mismatch: feature_names={len(FEATURE_NAMES)}, shap_values={len(vals)}"
        )

    df = (pd.DataFrame({"feature": FEATURE_NAMES, "shap_value": vals})
          .assign(abs_shap=lambda d: d.shap_value.abs())
          .sort_values("abs_shap", ascending=False))

    print("\n====== SHAP Values (class={}) ======".format(class_idx))
    for _, r in df.iterrows():
        print(f"{r.feature:25s}: {r.shap_value:+.6f}")
    print("=====================================")

# ------------------------------------------------
# 6) 메인
# ------------------------------------------------
if __name__ == "__main__":
    # 6-1. 모델 · 배경 데이터
    model      = load_model(MODEL_WEIGHTS)
    background = load_background(BACKGROUND_FILE)

    # 6-2. 테스트 샘플 (shape = [1, 21])
    sample = np.array([[  
        1,0,1,28.5,0,0,0,1,1,1,0,1,0,3,0,0,0,1,45,4,3
    ]], dtype=np.float32)

    # 6-3. SHAP 해석 실행
    explain_sample(model, background, sample, class_idx=1)
