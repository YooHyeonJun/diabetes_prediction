# test_model.py
import torch
import numpy as np

# 모델 로드
model = torch.jit.load("model_traced.pt")
model.eval()

# 입력 예시: 나이, BMI, 혈당, 혈압 등 22개 특성값 (정규화 전)
# 이 예시는 전체 22개의 입력 중 일부를 예로 든 것입니다.
# 실제 입력 순서와 개수는 학습 데이터셋과 일치해야 합니다.
# 아래는 예시용 입력 (평균 중심 정규화된 상태로 넣어야 함)
example_input = np.array([
    -0.4,   # HighBP (0 또는 1 → 정규화)
    0.6,    # HighChol
    0.1,    # CholCheck
    -0.3,   # BMI
    0.5,    # Smoker
    0.2,    # Stroke
    -0.1,   # HeartDiseaseorAttack
    0.4,    # PhysActivity
    -0.2,   # Fruits
    0.0,    # Veggies
    -0.3,   # HvyAlcoholConsump
    0.2,    # AnyHealthcare
    0.3,    # NoDocbcCost
    0.0,    # GenHlth
    -0.5,   # MentHlth
    -0.4,   # PhysHlth
    0.3,    # DiffWalk
    0.1,    # Sex
    -0.1,   # Age
    0.0,    # Education
    0.2,    # Income
], dtype=np.float32)

# 텐서 변환
input_tensor = torch.tensor(example_input).unsqueeze(0)  # shape: [1, 22]

# 예측
with torch.no_grad():
    output = model(input_tensor)
    prob = torch.softmax(output, dim=1)
    predicted_class = prob.argmax(dim=1).item()
    confidence = prob.max().item()

# 출력
print("🔍 예측 결과")
print(f"예측 클래스 (0=정상, 1=당뇨/전당뇨): {predicted_class}")
print(f"모델 Confidence: {confidence * 100:.2f}%")
