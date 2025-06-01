import React, { useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Avatar, Chip, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, List, ListItem, Divider, Input, Stack
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import CommunityWidget from "../components/Community";

const CATEGORY = [
  { label: '전체', value: 'all' },
  { label: '목표 공유', value: 'goal' },
  { label: '식단/운동', value: 'diet' },
  { label: 'Q&A', value: 'qna' },
  { label: '성공 사례', value: 'success' }
];

const INIT_POSTS = [
  {
    id: 1, user: '김건강', avatar: '김', category: 'goal', title: '이번 달 목표: BMI 25 달성하기!',
    content: '현재 BMI 27에서 25까지 낮추는 것이 목표입니다. 주 3회 운동과 식단 조절로 달성해보겠습니다! 💪',
    likes: 12, liked: false, comments: [
      { id: 1, user: '이운동', text: '응원합니다!' }
    ], created: '2시간 전', image: null
  },
  {
    id: 2, user: '이운동', avatar: '이', category: 'diet', title: '오늘의 식단과 운동 기록',
    content: '아침: 현미밥, 두부구이, 나물\n점심: 귀리밥, 생선구이, 쌈채소\n저녁: 보리밥, 닭가슴살, 버섯볶음\n운동: 30분 걷기, 20분 스트레칭',
    likes: 8, liked: false, comments: [], created: '어제', image: null
  },
  {
    id: 3, user: '박질문', avatar: '박', category: 'qna', title: '당뇨병 예방을 위한 운동 추천해주세요!',
    content: '당뇨병 예방을 위해 시작할 수 있는 운동이 있을까요? 초보자도 할 수 있는 운동 추천 부탁드립니다.',
    likes: 5, liked: false, comments: [
      { id: 1, user: '김건강', text: '걷기부터 시작해보세요!' }
    ], created: '3일 전', image: null
  }
];

export default function Community() {
  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState(INIT_POSTS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'goal', title: '', content: '', image: null, imageUrl: '' });
  const [commentInput, setCommentInput] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  // 탭 필터
  const filtered = tab === 0 ? posts : posts.filter(p => p.category === CATEGORY[tab].value);

  // 글 작성
  const handlePost = () => {
    setPosts([
      {
        id: Date.now(),
        user: '나',
        avatar: '나',
        category: form.category,
        title: form.title,
        content: form.content,
        likes: 0,
        liked: false,
        comments: [],
        created: '방금 전',
        image: form.imageUrl || null
      },
      ...posts
    ]);
    setOpen(false);
    setForm({ category: 'goal', title: '', content: '', image: null, imageUrl: '' });
  };

  // 이미지 업로드
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(f => ({ ...f, image: file, imageUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // 좋아요
  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  // 댓글 열기
  const handleCommentOpen = (id) => setCommentOpen(commentOpen === id ? null : id);

  // 댓글 작성
  const handleComment = (id) => {
    if (!commentInput[id]) return;
    setPosts(posts.map(p => p.id === id ? {
      ...p,
      comments: [...p.comments, { id: Date.now(), user: '나', text: commentInput[id] }]
    } : p));
    setCommentInput({ ...commentInput, [id]: '' });
  };

  // 공유
  const handleShare = (id) => {
    const post = posts.find(p => p.id === id);
    navigator.clipboard.writeText(`${post.title}\n${post.content}`);
    alert('글이 클립보드에 복사되었습니다!');
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 600, md: 800 }, mx: 'auto', py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#3182f6', flex: 1, fontSize: { xs: 20, sm: 28 } }}>
          커뮤니티
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 3, bgcolor: '#3182f6', minWidth: { xs: 80, sm: 120 }, fontWeight: 600, fontSize: { xs: 13, sm: 16 }, px: { xs: 1.5, sm: 3 }, py: { xs: 0.5, sm: 1 } }} onClick={() => setOpen(true)}>
          새 글 작성
        </Button>
      </Box>
      <Paper elevation={0} sx={{ mb: { xs: 2, sm: 4 }, borderRadius: 4, bgcolor: '#f5f7fa' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: { xs: 36, sm: 48 } }}>
          {CATEGORY.map((c, i) => <Tab key={c.value} label={c.label} sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 16 }, minWidth: { xs: 60, sm: 120 } }} />)}
        </Tabs>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>새 글 작성</DialogTitle>
        <DialogContent>
          <Tabs value={CATEGORY.findIndex(c => c.value === form.category)} onChange={(_, v) => setForm(f => ({ ...f, category: CATEGORY[v].value }))} sx={{ mb: 2 }}>
            {CATEGORY.slice(1).map((c, i) => <Tab key={c.value} label={c.label} />)}
          </Tabs>
          <TextField label="제목" fullWidth sx={{ mb: 2 }} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <TextField label="내용" fullWidth multiline rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
            <Button component="label" startIcon={<ImageIcon />} variant="outlined">
              사진 추가
              <Input type="file" inputProps={{ accept: 'image/*' }} sx={{ display: 'none' }} onChange={handleImage} />
            </Button>
            {form.imageUrl && <img src={form.imageUrl} alt="preview" style={{ maxHeight: 60, borderRadius: 8 }} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handlePost} variant="contained" disabled={!form.title || !form.content}>등록</Button>
        </DialogActions>
      </Dialog>
      {filtered.length === 0 && (
        <Typography sx={{ textAlign: 'center', color: '#888', my: 4 }}>게시글이 없습니다.</Typography>
      )}
      <Stack spacing={{ xs: 2, sm: 3 }}>
        {filtered.map(post => (
          <Paper elevation={3} sx={{ borderRadius: 4, p: { xs: 1.5, sm: 3 }, boxShadow: '0 2px 12px #e6eaf0' }} key={post.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: '#3182f6', mr: 2, width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, fontSize: { xs: 16, sm: 20 } }}>{post.avatar}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: 15, sm: 18 } }}>{post.user}</Typography>
                <Typography variant="caption" color="text.secondary">{post.created}</Typography>
              </Box>
              <Chip label={CATEGORY.find(c => c.value === post.category)?.label} size="small" sx={{ bgcolor: '#e6f3ff', color: '#3182f6', fontWeight: 600, fontSize: { xs: 11, sm: 13 } }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: 16, sm: 20 } }}>{post.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2, color: '#333', whiteSpace: 'pre-line', fontSize: { xs: 14, sm: 16 } }}>{post.content}</Typography>
            {post.image && (
              <Box sx={{ mb: 2 }}>
                <img src={post.image} alt="post" style={{ maxWidth: '100%', borderRadius: 10, boxShadow: '0 2px 8px #e6eaf0' }} />
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 1 }}>
              <IconButton size="small" onClick={() => handleLike(post.id)}>
                {post.liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 20, fontSize: { xs: 13, sm: 15 } }}>{post.likes}</Typography>
              <IconButton size="small" onClick={() => handleCommentOpen(post.id)}>
                <CommentIcon />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 20, fontSize: { xs: 13, sm: 15 } }}>{post.comments.length}</Typography>
              <IconButton size="small" onClick={() => handleShare(post.id)}>
                <ShareIcon />
              </IconButton>
            </Box>
            {commentOpen === post.id && (
              <Box sx={{ mt: 2, bgcolor: '#f5f7fa', borderRadius: 2, p: { xs: 1, sm: 2 } }}>
                <List>
                  {post.comments.map(c => (
                    <ListItem key={c.id} sx={{ pl: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mr: 1, fontSize: { xs: 13, sm: 15 } }}>{c.user}</Typography>
                      <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 15 } }}>{c.text}</Typography>
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    placeholder="댓글을 입력하세요"
                    value={commentInput[post.id] || ''}
                    onChange={e => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                    sx={{ flex: 1, fontSize: { xs: 13, sm: 15 } }}
                  />
                  <Button variant="contained" sx={{ fontSize: { xs: 13, sm: 15 }, px: { xs: 1, sm: 2 } }} onClick={() => handleComment(post.id)} disabled={!commentInput[post.id]}>등록</Button>
                </Box>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
} 