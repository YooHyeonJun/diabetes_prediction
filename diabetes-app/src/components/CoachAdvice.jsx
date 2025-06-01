import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Box, Typography, CircularProgress, Alert, Paper } from "@mui/material";

export default function CoachAdvice() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const { data } = await api.get("/api/coach");
        setAdvice(data.advice);
      } catch (err) {
        setError("AI 코칭 결과를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, []);

  if (loading) return <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 3, mt: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        AI 건강 코칭
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>{advice}</Typography>
    </Paper>
  );
} 