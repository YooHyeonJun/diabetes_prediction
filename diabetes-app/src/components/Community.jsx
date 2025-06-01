import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Box, Typography, TextField, Button, Paper, Divider, List, ListItem, ListItemText, Alert } from "@mui/material";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/api/community/posts");
      setPosts(data);
    } catch (err) {
      setError("게시글 목록을 불러올 수 없습니다.");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const { data } = await api.get(`/api/community/comments?post_id=${postId}`);
      setComments(data);
    } catch (err) {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !content) {
      setError("제목과 내용을 모두 입력하세요.");
      return;
    }
    try {
      await api.post("/api/community/posts", { title, content });
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (err) {
      setError("게시글 등록에 실패했습니다.");
    }
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment) return;
    try {
      await api.post("/api/community/comments", { post_id: selectedPost.id, content: comment });
      setComment("");
      fetchComments(selectedPost.id);
    } catch (err) {}
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        커뮤니티/상담
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        {/* 폼 렌더링 부분 완전히 삭제 (제목/내용/등록) */}
      </Paper>
      <Divider sx={{ mb: 2 }} />
      <List>
        {posts.length === 0 && <ListItem><ListItemText primary="게시글이 없습니다." /></ListItem>}
        {posts.map(post => (
          <ListItem key={post.id} button onClick={() => handleSelectPost(post)} selected={selectedPost && selectedPost.id === post.id}>
            <ListItemText
              primary={post.title}
              secondary={post.content.length > 40 ? post.content.slice(0, 40) + "..." : post.content}
            />
          </ListItem>
        ))}
      </List>
      {selectedPost && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>{selectedPost.title}</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{selectedPost.content}</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>댓글</Typography>
          <form onSubmit={handleComment} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextField label="댓글" value={comment} onChange={e => setComment(e.target.value)} size="small" sx={{ flex: 4 }} />
            <Button type="submit" variant="contained">등록</Button>
          </form>
          <List>
            {comments.length === 0 && <ListItem><ListItemText primary="댓글이 없습니다." /></ListItem>}
            {comments.map(c => (
              <ListItem key={c.id}>
                <ListItemText primary={c.content} secondary={new Date(c.created_at).toLocaleString()} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
} 