import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Button, LinearProgress, Avatar, List, ListItem, Stack, Alert, Divider } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import StarIcon from '@mui/icons-material/Star';
import Missions from "../components/Missions";

const INIT_CHALLENGES = [
  { id: 1, type: '일일', icon: <DirectionsRunIcon />, title: '오늘 30분 걷기', desc: '하루 30분 걷기로 건강한 생활습관을 만들어보세요!', total: 1, done: 0, point: 100, badge: '걷기 뱃지', dday: 1 },
  { id: 2, type: '주간', icon: <RestaurantIcon />, title: '일주일 채식 식단 실천', desc: '일주일 동안 하루 한 끼 이상 채식 식단을 실천해보세요!', total: 7, done: 2, point: 500, badge: '채식 뱃지', dday: 5 },
  { id: 3, type: '월간', icon: <LocalHospitalIcon />, title: 'BMI 25 달성하기', desc: '한 달 동안 식단 조절과 운동으로 BMI 25 달성을 목표로 합니다!', total: 30, done: 10, point: 1000, badge: '골드 뱃지', dday: 20 }
];

const RANKING = [
  { rank: 1, name: '김건강', points: 2500, avatar: '김' },
  { rank: 2, name: '이운동', points: 2000, avatar: '이' },
  { rank: 3, name: '박식단', points: 1800, avatar: '박' },
];

const REWARDS = [
  { icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#ffd700', mb: 1 }} />, label: '초보자 뱃지' },
  { icon: <DirectionsRunIcon sx={{ fontSize: 40, color: '#3182f6', mb: 1 }} />, label: '운동왕 뱃지' },
  { icon: <RestaurantIcon sx={{ fontSize: 40, color: '#3182f6', mb: 1 }} />, label: '식단관리 뱃지' },
];

export default function Challenges() {
  const [challenges, setChallenges] = useState(INIT_CHALLENGES);
  const handleCheck = (id) => {
    setChallenges(challenges.map(c =>
      c.id === id && c.done < c.total ? { ...c, done: c.done + 1 } : c
    ));
  };
  const ongoing = challenges.filter(c => c.done < c.total);
  const completed = challenges.filter(c => c.done >= c.total);

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 600, md: 800 }, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
      {/* 상단 타이틀/소개 */}
      <Box sx={{ mb: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#3182f6', mb: { xs: 0.5, sm: 1 }, textAlign: 'left', letterSpacing: -1, fontSize: { xs: 22, sm: 32 } }}>
          챌린지
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#555', mb: { xs: 1, sm: 2 }, textAlign: 'left', fontSize: { xs: 14, sm: 16 } }}>
          나만의 건강 미션에 도전해보세요!
        </Typography>
      </Box>
      {/* 미션 안내 (없을 때만) */}
      {ongoing.length === 0 && (
        <Alert severity="info" sx={{ mb: 4, fontWeight: 600, borderRadius: 2, bgcolor: '#e6f7ff', color: '#1976d2' }}>
          진행 가능한 미션이 없습니다.
        </Alert>
      )}
      {/* 진행중인 챌린지 */}
      {ongoing.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3, mt: 2, color: '#222', textAlign: 'left' }}>진행중인 챌린지</Typography>
          <Stack spacing={3}>
            {ongoing.map(c => (
              <Paper elevation={3} sx={{ borderRadius: 4, p: 3, boxShadow: '0 2px 12px #e6eaf0' }} key={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip icon={c.icon} label={c.type + ' 챌린지'} size="small" sx={{ bgcolor: '#e6f3ff', color: '#3182f6', mr: 1, fontWeight: 600 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>D-{c.dday}</Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{c.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{c.desc}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip icon={<StarIcon sx={{ color: '#ffd700' }} />} label={`포인트 ${c.point}`} size="small" sx={{ bgcolor: '#f5f7fa' }} />
                  <Chip icon={<EmojiEventsIcon sx={{ color: '#3182f6' }} />} label={c.badge} size="small" sx={{ bgcolor: '#f5f7fa' }} />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>진행률: {Math.round((c.done / c.total) * 100)}%</Typography>
                  <LinearProgress variant="determinate" value={Math.round((c.done / c.total) * 100)} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                <Button variant="contained" onClick={() => handleCheck(c.id)} disabled={c.done >= c.total}>오늘 완료 체크</Button>
              </Paper>
            ))}
          </Stack>
        </>
      )}
      {/* 완료된 챌린지 */}
      {completed.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3, mt: 5, color: '#222', textAlign: 'left' }}>완료된 챌린지</Typography>
          <Stack spacing={3}>
            {completed.map(c => (
              <Paper elevation={2} sx={{ mb: 0, borderRadius: 4, p: 3, bgcolor: '#f5f7fa', boxShadow: '0 2px 8px #e6eaf0' }} key={c.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip icon={c.icon} label={c.type + ' 챌린지'} size="small" sx={{ bgcolor: '#e6f3ff', color: '#3182f6', mr: 1, fontWeight: 600 }} />
                  <Chip icon={<EmojiEventsIcon />} label="완료" size="small" sx={{ ml: 1, bgcolor: '#ffd700', color: '#fff' }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>{c.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{c.desc}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip icon={<StarIcon sx={{ color: '#ffd700' }} />} label={`포인트 ${c.point}`} size="small" sx={{ bgcolor: '#fffbe6' }} />
                  <Chip icon={<EmojiEventsIcon sx={{ color: '#3182f6' }} />} label={c.badge} size="small" sx={{ bgcolor: '#fffbe6' }} />
                </Box>
                <Typography variant="body2" color="success.main">축하합니다! 챌린지를 완료했습니다.</Typography>
              </Paper>
            ))}
          </Stack>
        </>
      )}
      {/* 랭킹 */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, mt: 5, color: '#222', textAlign: 'left' }}>이번 주 랭킹</Typography>
      <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden', mb: 5, px: 3, py: 2, boxShadow: '0 2px 8px #e6eaf0' }}>
        <List>
          {RANKING.map((user) => (
            <ListItem key={user.rank} sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ width: 40, color: user.rank === 1 ? '#ffd700' : user.rank === 2 ? '#c0c0c0' : '#cd7f32' }}>
                  {user.rank}
                </Typography>
                <Avatar sx={{ bgcolor: '#3182f6', mr: 2 }}>{user.avatar}</Avatar>
                <Typography variant="subtitle1" sx={{ flex: 1 }}>{user.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: '#ffd700' }} />
                  <Typography variant="subtitle1" fontWeight={600}>{user.points}</Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* 보상 섹션 */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3, mt: 5, color: '#222', textAlign: 'left' }}>획득한 보상</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {REWARDS.map((r, i) => (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 4, width: 120, textAlign: 'center', boxShadow: '0 2px 8px #e6eaf0' }} key={i}>
            {r.icon}
            <Typography variant="subtitle2">{r.label}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
} 