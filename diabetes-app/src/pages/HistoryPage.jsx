import DiabetesPrediction from '../DiabetesPrediction';
import Reminders from "../components/Reminders";
import ExternalDataMock from "../components/ExternalDataMock";
import { Typography, Paper, Box, Stack, Divider } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import TimelineIcon from '@mui/icons-material/Timeline';

const CARD_STYLE = {
  p: { xs: 2, sm: 3 },
  borderRadius: 5,
  minHeight: { xs: 260, sm: 340 },
  boxShadow: '0 2px 12px #e6eaf0',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  bgcolor: '#fff',
  width: '100%',
};

export default function HistoryPage() {
  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 600, md: 1200 }, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
      <Typography variant="h4" fontWeight={800} sx={{ color: '#3182f6', mb: { xs: 2, sm: 3 }, letterSpacing: -1, fontSize: { xs: 22, sm: 32 } }}>
        내 기록 & 트렌드
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 }, width: '100%' }} alignItems="stretch">
        <Paper sx={{ ...CARD_STYLE, flex: 1, minWidth: 0, width: '100%', p: { xs: 1.5, sm: 3 }, minHeight: { xs: 180, sm: 340 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
            <NotificationsActiveIcon sx={{ color: '#3182f6', mr: 1, fontSize: { xs: 22, sm: 28 } }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: { xs: 15, sm: 20 } }}>
              내 리마인더/알림
            </Typography>
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <Reminders titleVisible={false} />
          </Box>
        </Paper>
        <Paper sx={{ ...CARD_STYLE, flex: 1, minWidth: 0, width: '100%', p: { xs: 1.5, sm: 3 }, minHeight: { xs: 180, sm: 340 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
            <DevicesOtherIcon sx={{ color: '#3182f6', mr: 1, fontSize: { xs: 22, sm: 28 } }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: { xs: 15, sm: 20 } }}>
              외부 건강앱/웨어러블 연동
            </Typography>
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <ExternalDataMock />
          </Box>
        </Paper>
      </Stack>
      <Paper sx={{ ...CARD_STYLE, minHeight: { xs: 220, sm: 380 }, mb: { xs: 2, sm: 4 }, width: '100%', p: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
          <TimelineIcon sx={{ color: '#3182f6', mr: 1, fontSize: { xs: 22, sm: 28 } }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#3182f6', fontSize: { xs: 15, sm: 20 } }}>
            내 예측 기록 & 트렌드
          </Typography>
        </Box>
        <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
        <Box sx={{ width: '100%' }}>
          <DiabetesPrediction historyOnly />
        </Box>
      </Paper>
    </Box>
  );
} 