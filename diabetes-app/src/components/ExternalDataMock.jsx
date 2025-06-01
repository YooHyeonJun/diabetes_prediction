import React, { useState } from "react";
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Alert } from "@mui/material";

const mockData = [
  { type: "걸음 수", value: "8,200보", date: "2024-06-01" },
  { type: "수면 시간", value: "7시간 10분", date: "2024-06-01" },
  { type: "심박수", value: "72bpm", date: "2024-06-01" },
  { type: "혈압", value: "120/78mmHg", date: "2024-06-01" },
];

export default function ExternalDataMock() {
  const [linked, setLinked] = useState(false);
  const [error, setError] = useState("");

  const handleLink = () => {
    setError("");
    setTimeout(() => {
      setLinked(true);
    }, 800);
  };

  return (
    <Paper sx={{ p: 3, mt: 4, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        외부 건강앱/웨어러블 연동
      </Typography>
      {!linked ? (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            삼성헬스, 애플헬스, 스마트워치 등과 연동하여 건강 데이터를 자동으로 불러올 수 있습니다.
          </Typography>
          <Button variant="contained" onClick={handleLink}>연동 시작</Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </>
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>연동이 완료되었습니다! (샘플 데이터)</Alert>
          <List>
            {mockData.map((d, i) => (
              <ListItem key={i}>
                <ListItemText primary={d.type} secondary={`${d.value} (${d.date})`} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
} 