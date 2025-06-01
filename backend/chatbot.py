from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os

app = FastAPI()

# 모델과 토크나이저 로드
MODEL_NAME = "beomi/KoAlpaca-Polyglot-12.8B"  # 한국어 모델
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

class ChatRequest(BaseModel):
    message: str

# 건강 관련 프롬프트 템플릿
HEALTH_PROMPT = """당신은 건강 상담 전문가입니다. 사용자의 질문에 전문적이고 친절하게 답변해주세요.
질문: {question}
답변:"""

@app.post("/api/chatbot")
async def chat(request: ChatRequest):
    try:
        # 프롬프트 생성
        prompt = HEALTH_PROMPT.format(question=request.message)
        
        # 입력 토큰화
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # 응답 생성
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=512,
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # 응답 디코딩
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # 프롬프트 제거하고 답변만 추출
        response = response.replace(prompt, "").strip()
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 