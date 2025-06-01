import { useState } from "react";
import {
  Container, TextField, Button, Typography, Box, Alert, InputAdornment
} from "@mui/material";
import { registerUser, loginUser } from "../api";
import { useNavigate } from "react-router-dom";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

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
      localStorage.setItem("access_token", data.access_token);
      window.location.href = "/";
    } catch (ex) {
      setErr(ex.response?.data?.detail || "오류가 발생했습니다.");
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <Container maxWidth="xs" sx={{
        py: 5,
        px: 4,
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#222' }}>
          {isRegister ? "회원가입" : "로그인"}
        </Typography>

        {err && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{err}</Alert>}

        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: "flex", flexDirection: "column", gap: 2, width: '100%' }}>
          <TextField 
            label="이메일"
            placeholder="예: test@email.com"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="primary" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: '#f5f7fa' }
            }}
          />
          <TextField 
            label="비밀번호"
            placeholder="영문, 숫자 포함 8자 이상"
            type="password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="primary" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: '#f5f7fa' }
            }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth
            sx={{
              mt: 1,
              borderRadius: 2,
              bgcolor: '#3182f6',
              fontWeight: 700,
              fontSize: 18,
              py: 1.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2563eb' }
            }}>
            {isRegister ? "회원가입" : "로그인"}
          </Button>
        </Box>
        <Button onClick={() => setMode(!isRegister)} sx={{ mt: 3, color: '#3182f6', fontWeight: 600, fontSize: 15, boxShadow: 'none' }}>
          {isRegister ? "이미 계정이 있습니다" : "회원가입하기"}
        </Button>
      </Container>
    </Box>
  );
}
