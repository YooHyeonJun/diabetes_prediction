import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import DiabetesPrediction from "./DiabetesPrediction";
import Login from "./pages/Login";
import DietGuide from "./pages/DietGuide";
import HealthInfo from "./pages/HealthInfo";
import HistoryPage from "./pages/HistoryPage";
import Community from "./pages/Community";
import Challenges from "./pages/Challenges";
import Notifications from "./components/Notifications";
import { Tabs, Tab, Box, Button, Typography, Fab, Drawer, IconButton } from "@mui/material";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { logout } from "./api";
import HealthChatbot from "./components/HealthChatbot";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

function TopTabs() {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const tabValue =
    location.pathname.startsWith("/diet") ? 1 :
    location.pathname.startsWith("/info") ? 2 :
    location.pathname.startsWith("/history") ? 3 :
    location.pathname.startsWith("/community") ? 4 :
    location.pathname.startsWith("/challenges") ? 5 : 0;
  if (!token) return null;
  return (
    <Box sx={{ bgcolor: '#fff', borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 }, gap: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <LocalHospitalIcon sx={{ fontSize: { xs: 24, sm: 36 }, color: '#3182f6' }} />
          <Typography variant="h5" fontWeight={700} sx={{ color: '#222', letterSpacing: -1, fontSize: { xs: 18, sm: 28 } }}>
            XAI 당뇨병 예측 플랫폼
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Notifications />
          <Button variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 600, px: { xs: 1.5, sm: 3 }, fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 100 } }} onClick={logout}>
            로그아웃
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={tabValue}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: { xs: 36, sm: 48 }, width: { xs: '100%', sm: 'auto' } }}
          centered={window.innerWidth >= 600}
        >
          <Tab label="예측" component={Link} to="/" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
          <Tab label="식단 가이드" component={Link} to="/diet" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
          <Tab label="건강정보" component={Link} to="/info" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
          <Tab label="내 기록" component={Link} to="/history" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
          <Tab label="커뮤니티" component={Link} to="/community" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
          <Tab label="챌린지" component={Link} to="/challenges" sx={{ fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />
        </Tabs>
      </Box>
    </Box>
  );
}

function App() {
  const token = localStorage.getItem("access_token");
  const [chatbotOpen, setChatbotOpen] = useState(false);
  return (
    <>
      <BrowserRouter>
        <TopTabs />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/diet" element={token ? <DietGuide /> : <Navigate to="/login" />} />
          <Route path="/info" element={token ? <HealthInfo /> : <Navigate to="/login" />} />
          <Route path="/history" element={token ? <HistoryPage /> : <Navigate to="/login" />} />
          <Route path="/community" element={token ? <Community /> : <Navigate to="/login" />} />
          <Route path="/challenges" element={token ? <Challenges /> : <Navigate to="/login" />} />
          <Route path="/" element={token ? <DiabetesPrediction /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      {/* 챗봇 플로팅 버튼 */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1300 }} onClick={() => setChatbotOpen(true)}>
        <ChatIcon />
      </Fab>
      {/* Drawer로 챗봇 위치 개선 */}
      <Drawer anchor="right" open={chatbotOpen} onClose={() => setChatbotOpen(false)}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 370 }, maxWidth: '90vw', boxShadow: 6, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, p: 0 } }}>
        <Box sx={{ p: { xs: 1, sm: 2 }, height: '100%', display: 'flex', flexDirection: 'column', minWidth: { xs: 0, sm: 320 }, maxHeight: '100vh' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ fontWeight: 700, fontSize: 18, color: '#3182f6', pl: 1 }}>AI 건강 챗봇</Box>
            <IconButton onClick={() => setChatbotOpen(false)} size="large"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <HealthChatbot />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default App;