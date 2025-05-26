import { useState } from "react";
import {
  Container, TextField, Button, Typography, Box, Alert
} from "@mui/material";
import { registerUser, loginUser } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegister, setMode] = useState(false);
  const [email, setEmail]     = useState("");
  const [pw, setPw]           = useState("");
  const [err, setErr]         = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      if (isRegister) await registerUser(email, pw);
      const { data } = await loginUser(email, pw);
      console.log("Login response:", data);  // 응답 데이터 확인
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "/";  // 강제로 페이지 새로고침
    } catch (ex) {
      console.error("Login error:", ex);  // 에러 상세 정보 출력
      setErr(ex.response?.data?.detail || "오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {isRegister ? "회원가입" : "로그인"}
      </Typography>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Box component="form" onSubmit={handleSubmit}
           sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField label="E-mail"  value={email} onChange={e=>setEmail(e.target.value)} required />
        <TextField label="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} required />
        <Button type="submit" variant="contained">
          {isRegister ? "회원가입" : "로그인"}
        </Button>
        <Button onClick={() => setMode(!isRegister)}>
          {isRegister ? "이미 계정이 있습니다" : "회원가입하기"}
        </Button>
      </Box>
    </Container>
  );
}
