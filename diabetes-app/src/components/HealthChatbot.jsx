import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, CircularProgress } from "@mui/material";

const sampleAnswers = [
  { q: /운동|운동량/, a: "주 3회 이상 유산소 운동을 권장합니다. 걷기, 수영, 자전거 타기 등이 좋습니다." },
  { q: /식단|음식|먹/, a: "채소와 통곡물 위주의 식단이 당뇨병 예방에 도움이 됩니다. 가공식품과 당분 섭취를 줄이세요." },
  { q: /혈당|위험도/, a: "정기적으로 혈당을 체크하고, 위험도가 높으면 전문가 상담을 권장합니다. 공복 혈당 100mg/dL 이상이면 주의가 필요합니다." },
  { q: /약|복용/, a: "약 복용은 반드시 의사와 상의 후 결정하세요. 처방전 없이 구매할 수 있는 약도 전문가와 상담 후 복용하세요." },
  { q: /암|종양/, a: "암은 정상 세포가 비정상적으로 성장하는 질환입니다. 조기 발견이 중요하며, 정기적인 검진이 필요합니다. 흡연, 음주, 비만 등이 주요 위험 요인입니다." },
  { q: /고혈압|혈압/, a: "고혈압은 혈관에 과도한 압력이 가해지는 상태입니다. 저염식, 운동, 금연, 절주가 예방에 도움이 됩니다." },
  { q: /당뇨|당뇨병/, a: "당뇨병은 혈당 조절에 문제가 생기는 만성 질환입니다. 식단 관리, 운동, 정기적인 혈당 체크가 중요합니다." },
  { q: /비만|체중/, a: "비만은 BMI 25 이상을 의미합니다. 식단 조절과 규칙적인 운동으로 관리할 수 있습니다." },
  { q: /스트레스|우울/, a: "스트레스와 우울증은 신체적, 정신적 건강에 큰 영향을 미칩니다. 충분한 수면, 운동, 취미 활동이 도움이 됩니다." },
  { q: /수면|잠/, a: "하루 7-8시간의 충분한 수면이 필요합니다. 규칙적인 수면 시간과 편안한 환경이 중요합니다." },
  { q: /금연|흡연/, a: "흡연은 다양한 질병의 주요 원인입니다. 금연은 전문가의 도움을 받으면 더 효과적입니다." },
  { q: /음주|술/, a: "과도한 음주는 간 질환, 고혈압 등의 원인이 됩니다. 하루 1-2잔 이하로 제한하세요." },
  { q: /검진|검사/, a: "정기적인 건강검진은 질병의 조기 발견에 중요합니다. 연령과 성별에 따라 필요한 검사가 다릅니다." },
  { q: /영양|비타민/, a: "균형 잡힌 식단과 적절한 영양소 섭취가 중요합니다. 과일, 채소, 단백질, 통곡물을 골고루 섭취하세요." },
  { q: /심장|심근/, a: "심장 질환은 주요 사망 원인 중 하나입니다. 건강한 식단, 운동, 스트레스 관리가 예방에 도움이 됩니다." },
  { q: /뇌졸중|뇌혈관/, a: "뇌졸중은 뇌혈관이 막히거나 터지는 질환입니다. 고혈압, 당뇨, 흡연이 주요 위험 요인입니다." },
  { q: /관절|근육/, a: "관절과 근육 건강은 규칙적인 운동과 적절한 영양 섭취로 유지할 수 있습니다. 무리한 운동은 피하세요." },
  { q: /면역력|감기/, a: "면역력 강화를 위해 충분한 수면, 운동, 영양 섭취가 중요합니다. 손 씻기와 마스크 착용도 도움이 됩니다." },
  { q: /노화|노인/, a: "건강한 노화를 위해 규칙적인 운동, 균형 잡힌 식단, 사회적 활동이 중요합니다." },
  { q: /임신|출산/, a: "임신 중에는 정기적인 산전 검진이 필요합니다. 엽산, 철분 등 영양소 섭취에 주의하세요." }
];

function getSampleAnswer(q) {
  for (const { q: regex, a } of sampleAnswers) {
    if (regex.test(q)) return a;
  }
  return "죄송합니다. 해당 질문에 대한 답변을 준비 중입니다. 다른 건강 관련 질문을 해보시겠어요?";
}

export default function HealthChatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "안녕하세요! 건강 관련 궁금한 점을 물어보세요." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    // 새 메시지가 추가될 때 스크롤을 아래로 이동
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setMessages(msgs => [...msgs, { from: "user", text: input }]);
    setLoading(true);
    setError("");
    const question = input;
    setInput("");
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question })
      });
      if (!res.ok) throw new Error("서버 오류가 발생했습니다.");
      const data = await res.json();
      setMessages(msgs => [...msgs, { from: "bot", text: data.response || "답변을 생성하지 못했습니다." }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { from: "bot", text: "AI 답변을 가져오지 못했습니다. 다시 시도해 주세요." }]);
      setError("AI 답변을 가져오지 못했습니다. 서버 상태를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 4, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        건강 챗봇 상담
      </Typography>
      <List ref={listRef} sx={{ minHeight: 120, maxHeight: 220, overflowY: "auto", mb: 2 }}>
        {messages.map((m, i) => (
          <ListItem key={i} alignItems={m.from === "user" ? "right" : "left"}>
            <ListItemText
              primary={m.text}
              sx={{ textAlign: m.from === "user" ? "right" : "left", color: m.from === "user" ? "#1976d2" : "#222" }}
            />
          </ListItem>
        ))}
        {loading && (
          <ListItem>
            <ListItemText primary={<CircularProgress size={20} />} sx={{ textAlign: "left" }} />
          </ListItem>
        )}
      </List>
      <Box component="form" onSubmit={handleSend} sx={{ display: "flex", gap: 1 }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="건강 관련 질문을 입력하세요"
          size="small"
          fullWidth
          disabled={loading}
        />
        <Button type="submit" variant="contained" disabled={loading}>전송</Button>
      </Box>
      {error && <Typography color="error" sx={{ mt: 1, fontSize: 14 }}>{error}</Typography>}
    </Paper>
  );
} 