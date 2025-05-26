import torch
import torch.nn.functional as F

# 모델 로드
model = torch.jit.load('model_traced.pt')
model.eval()

# 더미 입력 (21 차원)
dummy_input = torch.rand(1, 21)

with torch.no_grad():
    output = model(dummy_input)         # output shape = [1, 2]
    probs  = F.softmax(output, dim=1)   # 확률로 변환
    neg_p, pos_p = probs[0].tolist()    # 음성·양성 확률

print(f"음성 확률: {neg_p:.4f},  양성 확률: {pos_p:.4f}")
print(f"당뇨병 위험도: {pos_p*100:.2f}%")
