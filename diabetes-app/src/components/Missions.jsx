import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Box, Typography, Button, LinearProgress, Paper, Alert } from "@mui/material";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      const { data } = await api.get("/api/missions");
      setMissions(data);
    } catch (err) {
      setError("미션 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleJoin = async (id) => {
    try {
      await api.post("/api/missions/join", { mission_id: id });
      fetchMissions();
    } catch (err) {
      setError("미션 참여에 실패했습니다.");
    }
  };

  const handleProgress = async (id, progress, status) => {
    try {
      await api.post("/api/missions/progress", { mission_id: id, progress, status });
      fetchMissions();
    } catch (err) {
      setError("진행률 업데이트에 실패했습니다.");
    }
  };

  if (loading) return <Typography sx={{ mt: 4 }}>로딩 중...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        건강 미션/챌린지
      </Typography>
      {missions.length === 0 && <Alert severity="info">진행 가능한 미션이 없습니다.</Alert>}
      {missions.map(m => (
        <Paper key={m.id} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>{m.title}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>{m.description}</Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>목표: {m.goal}</Typography>
          <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>보상: {m.reward}</Typography>
          {m.status ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>진행상태: {m.status} ({m.progress ?? 0}%)</Typography>
              <LinearProgress variant="determinate" value={m.progress ?? 0} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
              {m.status !== "완료" && (
                <Button size="small" variant="contained" sx={{ mt: 1, mr: 1 }} onClick={() => handleProgress(m.id, Math.min(100, (m.progress ?? 0) + 20), Math.min(100, (m.progress ?? 0) + 20) >= 100 ? "완료" : "진행중")}>+20% 진행</Button>
              )}
            </>
          ) : (
            <Button variant="contained" onClick={() => handleJoin(m.id)}>참여하기</Button>
          )}
        </Paper>
      ))}
    </Box>
  );
} 