import { Grid, Paper, Box, Typography, Fab, Dialog } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ShapChart from "./components/ShapChart";
import CoachAdvice from "./components/CoachAdvice";
import Reminders from "./components/Reminders";
import Missions from "./components/Missions";
import TrendChart from "./components/TrendChart";
import PdfReportButton from "./components/PdfReportButton";
import Community from "./components/Community";
import HealthChatbot from "./components/HealthChatbot";
import ExternalDataMock from "./components/ExternalDataMock";
import { useState } from "react";

export default function Dashboard({ result, trend, feedback }) {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 8 }}>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ maxWidth: { xs: '100%', sm: 600, md: 1200 }, mx: 'auto', pt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
        {/* 예측 결과/SHAP/AI 코칭 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: 16, sm: 20 } }}>
              당뇨병 위험도: {result?.risk}% ({result?.interpretation})
            </Typography>
            <ShapChart shap={result?.shap} />
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                주요 변화 요인
              </Typography>
              <Typography variant="body1" sx={{ color: "#333" }}>
                {result?.shap && result.shap.slice(0, 3).map(s => s.feature).join(", ")}
              </Typography>
            </Box>
            <CoachAdvice />
            <PdfReportButton result={result} trend={trend} feedback={feedback} />
          </Paper>
        </Grid>
        {/* 리마인더/미션/외부연동 */}
        <Grid item xs={12} md={4}>
          <Reminders />
          <Missions />
          <ExternalDataMock />
        </Grid>
        {/* 트렌드 그래프 */}
        <Grid item xs={12}>
          <TrendChart />
        </Grid>
        {/* 커뮤니티 */}
        <Grid item xs={12}>
          <Community />
        </Grid>
      </Grid>
      {/* 챗봇 플로팅 버튼 */}
      <Fab color="primary" sx={{ position: "fixed", bottom: 32, right: 32 }} onClick={() => setChatbotOpen(true)}>
        <ChatIcon />
      </Fab>
      <Dialog open={chatbotOpen} onClose={() => setChatbotOpen(false)}>
        <HealthChatbot />
      </Dialog>
    </Box>
  );
} 