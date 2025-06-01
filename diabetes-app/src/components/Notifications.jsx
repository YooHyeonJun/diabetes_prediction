import { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge, Menu, MenuItem, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicationIcon from '@mui/icons-material/Medication';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Notifications() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'goal',
      title: 'BMI 목표 달성 임박',
      message: 'BMI 25 달성까지 2kg 남았습니다!',
      time: '10분 전',
      read: false,
      icon: <EmojiEventsIcon color="primary" />
    },
    {
      id: 2,
      type: 'exercise',
      title: '오늘의 운동 리마인더',
      message: '30분 걷기 챌린지를 잊지 마세요!',
      time: '1시간 전',
      read: false,
      icon: <DirectionsRunIcon color="success" />
    },
    {
      id: 3,
      type: 'diet',
      title: '식단 기록 알림',
      message: '오늘의 식단을 기록해보세요.',
      time: '2시간 전',
      read: true,
      icon: <RestaurantIcon color="warning" />
    },
    {
      id: 4,
      type: 'checkup',
      title: '정기 검진 알림',
      message: '다음 주 정기 검진이 예정되어 있습니다.',
      time: '어제',
      read: true,
      icon: <LocalHospitalIcon color="error" />
    },
    {
      id: 5,
      type: 'medication',
      title: '약 복용 리마인더',
      message: '오늘 저녁 약 복용 시간입니다.',
      time: '어제',
      read: true,
      icon: <MedicationIcon color="info" />
    }
  ]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 }
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#f5f7fa' }}>
          <Typography variant="h6" fontWeight={600}>알림</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read ? 'inherit' : '#f0f7ff',
                '&:hover': { bgcolor: '#f5f7fa' }
              }}
              onClick={() => handleRead(notification.id)}
            >
              <ListItemIcon>{notification.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{notification.title}</Typography>
                    {!notification.read && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3182f6' }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </>
  );
} 