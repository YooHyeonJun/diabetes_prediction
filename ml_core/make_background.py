# make_background.py

import pandas as pd
import pickle

# 1) 원본 CSV 로드
df = pd.read_csv('../diabetes_012_health_indicators_BRFSS2015.csv')
df['Diabetes_012'] = df['Diabetes_012'].apply(lambda x: 1 if x>0 else 0)
X = df.drop(columns=['Diabetes_012'])

# 2) 스케일러 로드
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# 3) 스케일링
X_scaled = scaler.transform(X)  # shape (n_samples, 21)

# 4) 상위 50개 샘플만 뽑아 배경 데이터로 사용
background = X_scaled[:50]

# 5) pickle로 저장
with open('background_data.pkl', 'wb') as f:
    pickle.dump(background, f)

print("✅ background_data.pkl 생성 완료")
