import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import NewspaperIcon from '@mui/icons-material/Newspaper';

export default function HealthInfo() {
  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 600 }, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#3182f6', mb: { xs: 1, sm: 2 }, fontSize: { xs: 20, sm: 28 } }}>
          당뇨병 건강정보
        </Typography>
        <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: 14, sm: 16 } }}>
          당뇨병 예방과 관리를 위한 생활습관, 운동, 혈당 관리, 스트레스 관리 팁을 확인하세요!
        </Typography>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          생활습관/운동법
        </Typography>
        <List>
          <ListItem><ListItemIcon><DirectionsRunIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>주 3회 이상, 30분 이상 걷기/운동 실천</span>} /></ListItem>
          <ListItem><ListItemIcon><FavoriteIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>금연, 절주, 스트레스 관리</span>} /></ListItem>
          <ListItem><ListItemIcon><EmojiEmotionsIcon color="warning" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>긍정적인 마음가짐, 충분한 수면</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          혈당 관리 팁
        </Typography>
        <List>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>식사 후 30분 산책하기</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>혈당 자주 체크, 기록하기</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>스트레스 받지 않기, 충분한 수분 섭취</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          최신 건강뉴스
        </Typography>
        <List>
          <ListItem><ListItemIcon><NewspaperIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<a href="https://www.kdca.go.kr/board/board.es?mid=a20507020000&bid=0019" target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>질병관리청 건강뉴스 바로가기</a>} /></ListItem>
        </List>
      </Paper>
    </Box>
  );
} 