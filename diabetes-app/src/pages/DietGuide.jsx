import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

export default function DietGuide() {
  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 600 }, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 4 }, borderRadius: 4, mb: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#3182f6', mb: { xs: 1, sm: 2 }, fontSize: { xs: 20, sm: 28 } }}>
          당뇨병에 좋은 식단 가이드
        </Typography>
        <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: 14, sm: 16 } }}>
          건강한 식습관은 혈당 관리의 핵심입니다. 아래 식단 원칙과 추천 식품을 참고해보세요!
        </Typography>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          식사 원칙
        </Typography>
        <List>
          <ListItem><ListItemIcon><CheckCircleIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>규칙적으로 3끼 식사하기</span>} /></ListItem>
          <ListItem><ListItemIcon><CheckCircleIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>채소, 통곡물, 단백질(생선, 두부, 콩 등) 위주로 구성</span>} /></ListItem>
          <ListItem><ListItemIcon><CheckCircleIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>과일은 하루 1~2회, 소량만</span>} /></ListItem>
          <ListItem><ListItemIcon><CheckCircleIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>음식은 싱겁게, 튀김/가공식품 줄이기</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          추천 식품
        </Typography>
        <List>
          <ListItem><ListItemIcon><RestaurantIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>채소, 버섯, 해조류</span>} /></ListItem>
          <ListItem><ListItemIcon><RestaurantIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>통곡물(현미, 귀리 등)</span>} /></ListItem>
          <ListItem><ListItemIcon><RestaurantIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>생선, 두부, 콩, 닭가슴살</span>} /></ListItem>
          <ListItem><ListItemIcon><RestaurantIcon color="success" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>견과류, 올리브유</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          피해야 할 식품
        </Typography>
        <List>
          <ListItem><ListItemIcon><BlockIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>설탕, 과자, 케이크 등 단 음식</span>} /></ListItem>
          <ListItem><ListItemIcon><BlockIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>튀김, 가공육, 인스턴트 식품</span>} /></ListItem>
          <ListItem><ListItemIcon><BlockIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>탄산음료, 과일주스</span>} /></ListItem>
          <ListItem><ListItemIcon><BlockIcon color="error" sx={{ fontSize: { xs: 20, sm: 24 } }} /></ListItemIcon><ListItemText primary={<span style={{ fontSize: 14 }}>짠 음식, 염장식품</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          하루 식단 샘플
        </Typography>
        <List>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>아침: 현미밥, 두부구이, 나물, 김치</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>점심: 귀리밥, 생선구이, 쌈채소, 된장국</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>저녁: 보리밥, 닭가슴살, 버섯볶음, 나물</span>} /></ListItem>
        </List>
        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
        <Typography variant="h6" fontWeight={600} sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
          간단 레시피
        </Typography>
        <List>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>닭가슴살 샐러드: 닭가슴살+채소+올리브유</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>두부구이: 두부+소금/후추+올리브유에 구워내기</span>} /></ListItem>
          <ListItem><ListItemText primary={<span style={{ fontSize: 14 }}>귀리밥: 쌀+귀리 7:3 비율로 밥짓기</span>} /></ListItem>
        </List>
      </Paper>
    </Box>
  );
} 