# inspect_model.py
import torch

# 1) 모델 로드
model = torch.jit.load('model_traced.pt')
model.eval()

# 2) 더미 입력 생성
#    – 모델이 (batch_size, 4) 형태의 입력을 받는다고 가정
dummy_input = torch.rand(1, 21)

# 3) 추론 실행
with torch.no_grad():
    output = model(dummy_input)

# 4) 출력 정보 확인
print("▶️ output:", output)
print("▶️ output type:", type(output))
# tensor 일 경우 shape 출력
try:
    print("▶️ output shape:", output.shape)
except:
    pass

# 5) (옵션) TorchScript graph 보기
print("\n=== TorchScript Graph ===")
print(model.graph)
