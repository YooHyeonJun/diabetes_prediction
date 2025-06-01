import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line, LineChart } from "recharts";

export default function TrendChart() {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const { data } = await api.get("/api/records/trend");
        setTrend(data);
      } catch (err) {
        setError("트렌드 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrend();
  }, []);

  if (loading) return <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!trend.length) return <Alert severity="info">트렌드 데이터가 없습니다.</Alert>;

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        월별 위험도 트렌드
      </Typography>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trend} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <XAxis dataKey="month" tick={{ fontSize: 13 }} />
          <YAxis yAxisId="left" domain={[0, 1]} tickFormatter={v => (v * 100).toFixed(0) + "%"} tick={{ fontSize: 13 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} />
          <Tooltip formatter={(v, n) => n === "avg_prob" ? [(v * 100).toFixed(1) + "%", "평균 위험도"] : [v, "예측 건수"]} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="avg_prob" name="평균 위험도" stroke="#3182f6" strokeWidth={3} dot={{ r: 4 }} />
          <Bar yAxisId="right" dataKey="count" name="예측 건수" fill="#f44336" barSize={24} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
} 