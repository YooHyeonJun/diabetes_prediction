# ----------------------------- 2. 데이터 로딩 및 이진 분류 변환 -----------------------------
path = "diabetes_012_health_indicators_BRFSS2015.csv"
df = pd.read_csv(path)

# 이진 분류로 변환 (0: 정상, 1: 전당뇨 또는 당뇨)
df['Diabetes_012'] = df['Diabetes_012'].apply(lambda x: 1 if x > 0 else 0)

y = df['Diabetes_012']
X = df.drop(columns=['Diabetes_012'])

# 정규화
for col in X.columns:
    if X[col].dtype in ['int64', 'float64']:
        X[col] = (X[col] - X[col].mean()) / X[col].std()

X_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2, random_state=7, stratify=y)
import numpy as np
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ----------------------------- 1. 전처리 (스케일링 → Tensor 변환) -----------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_valid_scaled = scaler.transform(X_valid)

# numpy → torch.Tensor
from torch import from_numpy
X_train_t = torch.from_numpy(X_train_scaled).float()
y_train_t = torch.from_numpy(y_train.values).long()
X_valid_t = torch.from_numpy(X_valid_scaled).float()
y_valid_t = torch.from_numpy(y_valid.values).long()

# DataLoader
train_ds = TensorDataset(X_train_t, y_train_t)
valid_ds = TensorDataset(X_valid_t, y_valid_t)
train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_ds, batch_size=32)

# ----------------------------- 2. 모델 정의 -----------------------------
class MLP(nn.Module):
    def __init__(self, input_dim, hidden1=128, hidden2=64, num_classes=2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden1),
            nn.ReLU(),
            nn.Linear(hidden1, hidden2),
            nn.ReLU(),
            nn.Linear(hidden2, num_classes)
        )
    def forward(self, x):
        return self.net(x)

input_dim   = X_train.shape[1]
num_classes = len(np.unique(y_train))
model = MLP(input_dim, hidden1=128, hidden2=64, num_classes=num_classes)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# ----------------------------- 3. 학습 설정 -----------------------------
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
num_epochs = 20
print("processing...")
for epoch in range(1, num_epochs+1):
    model.train()
    total_loss = 0.0
    for Xb, yb in train_loader:
        Xb, yb = Xb.to(device), yb.to(device)
        optimizer.zero_grad()
        out = model(Xb)
        loss = criterion(out, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * Xb.size(0)
    avg_loss = total_loss / len(train_loader.dataset)

    # 검증
    model.eval()
    correct = 0
    with torch.no_grad():
        for Xb, yb in valid_loader:
            Xb, yb = Xb.to(device), yb.to(device)
            preds = model(Xb).argmax(dim=1)
            correct += (preds == yb).sum().item()
    val_acc = correct / len(valid_loader.dataset)

    print(f"Epoch {epoch:02d}/{num_epochs}   Loss: {avg_loss:.4f}   Val Acc: {val_acc:.4f}")

# ----------------------------- 4. 최종 평가 -----------------------------
model.eval()
with torch.no_grad():
    logits = model(X_valid_t.to(device))
    y_pred = logits.argmax(dim=1).cpu().numpy()

acc  = accuracy_score(y_valid, y_pred)
prec = precision_score(y_valid, y_pred)
rec  = recall_score(y_valid, y_pred)
f1   = f1_score(y_valid, y_pred)

print("\n📊 PyTorch MLP 최종 성능")
print(f"Accuracy : {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall   : {rec:.4f}")
print(f"F1-score : {f1:.4f}")

# ----------------------------- 5. 모델 Export (TorchScript) -----------------------------
#  - 상태 사전만 저장: torch.save(model.state_dict(), 'model.pth')
#  - TorchScript: 
dummy_input = torch.randn(1, input_dim).to(device)
traced_model = torch.jit.trace(model, dummy_input)
traced_model.save("model_traced.pt")
print("\n✅ 모델을 TorchScript 형식으로 저장했습니다: model_traced.pt")
