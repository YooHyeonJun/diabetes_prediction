import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Divider, Alert } from "@mui/material";

export default function Reminders({ titleVisible = true }) {
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [error, setError] = useState("");

  const fetchReminders = async () => {
    try {
      const { data } = await api.get("/api/reminders");
      setReminders(data);
    } catch (err) {
      setError("알림 목록을 불러올 수 없습니다.");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!message || !remindAt) {
      setError("메시지와 알림 시간을 모두 입력하세요.");
      return;
    }
    try {
      await api.post("/api/reminders", { message, remind_at: remindAt });
      setMessage("");
      setRemindAt("");
      fetchReminders();
    } catch (err) {
      setError("알림 등록에 실패했습니다.");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      {titleVisible && (
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          내 리마인더/알림
        </Typography>
      )}
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <TextField
          label="알림 메시지"
          value={message}
          onChange={e => setMessage(e.target.value)}
          size="small"
          sx={{ flex: 2 }}
        />
        <TextField
          label="알림 시간"
          type="datetime-local"
          value={remindAt}
          onChange={e => setRemindAt(e.target.value)}
          size="small"
          sx={{ flex: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button type="submit" variant="contained" sx={{ flex: 1 }}>
          등록
        </Button>
      </form>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Divider sx={{ mb: 2 }} />
      <List>
        {reminders.length === 0 && <ListItem><ListItemText primary="등록된 알림이 없습니다." /></ListItem>}
        {reminders.map(r => (
          <ListItem key={r.id}>
            <ListItemText
              primary={r.message}
              secondary={`알림 시간: ${new Date(r.remind_at).toLocaleString()}${r.is_sent ? " (전송됨)" : ""}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 