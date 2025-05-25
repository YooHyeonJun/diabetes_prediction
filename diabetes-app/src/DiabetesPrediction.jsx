import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box, Paper, List, ListItem, ListItemText } from "@mui/material";

export default function DiabetesPrediction() {
  const [formData, setFormData] = useState({
    age: "",
    bmi: "",
    glucose: "",
    bloodPressure: ""
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: 여기에 AI 예측 API 연동 로직 추가
    // 예: fetch('/api/predict', { method: 'POST', body: JSON.stringify(formData) }) ...

    const mockResult = {
      risk: 85,
      interpretation: "High",
      shapLime: [
        { feature: "Age", impact: "+20% 영향 (High 영향)" },
        { feature: "BMI", impact: "+15% 영향 (High 영향)" },
        { feature: "Glucose", impact: "+25% 영향 (Critical 영향)" },
        { feature: "Blood Pressure", impact: "+10% 영향 (Moderate 영향)" }
      ]
    };
    setResult(mockResult);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        XAI 당뇨병 예측 플랫폼
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="나이"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <TextField
          label="BMI"
          name="bmi"
          type="number"
          value={formData.bmi}
          onChange={handleChange}
          required
        />
        <TextField
          label="혈당 수치"
          name="glucose"
          type="number"
          value={formData.glucose}
          onChange={handleChange}
          required
        />
        <TextField
          label="혈압"
          name="bloodPressure"
          type="number"
          value={formData.bloodPressure}
          onChange={handleChange}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          예측하기
        </Button>
      </Box>

      {result && (
        <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">[예측 결과]</Typography>
          <Typography>당뇨병 위험도: {result.risk}% ({result.interpretation})</Typography>

          <Box mt={2}>
            <Typography variant="subtitle1">[XAI 해석 결과 - SHAP & LIME]</Typography>
            <List>
              {result.shapLime.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${item.feature}: ${item.impact}`} />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box mt={2}>
            <Typography variant="subtitle1">[개인 맞춤 건강 가이드]</Typography>
            <List>
              <ListItem><ListItemText primary="혈당 수치가 높으므로 식단을 조정하고 정기적인 운동을 권장합니다." /></ListItem>
              <ListItem><ListItemText primary="나이 50세 이상은 추가적인 건강검진이 필요합니다." /></ListItem>
              <ListItem><ListItemText primary="BMI가 높다면 체중 관리도 함께 고려해야 합니다." /></ListItem>
            </List>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
