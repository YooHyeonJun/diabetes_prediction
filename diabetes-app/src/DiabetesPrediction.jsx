import React, { useState, useEffect } from "react";
import {
  Container, Typography, TextField, Checkbox, FormControlLabel,
  Select, MenuItem, Radio, RadioGroup, FormControl, FormLabel,
  Button, Grid, Paper, Box, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Slider, Tooltip, InputAdornment, Alert, Divider
} from "@mui/material";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { predictDiabetes, fetchRecords, logout, api } from "./api";
import { FEATURE_META, FEATURE_NAMES, buildPayload } from "./utils/payLoad";
import ShapChart from "./components/ShapChart";
import { LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer as RContainer } from "recharts";
import CoachAdvice from "./components/CoachAdvice";
import PdfReportButton from "./components/PdfReportButton";
import TrendChart from "./components/TrendChart";

// 체크박스 타입을 예/아니요 라디오로 변환할 키
const yesNoKeys = [
  "HighBP", "HighChol", "CholCheck", "Smoker", "Stroke", "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "DiffWalk"
];

// 주요 변화 요인 한글 요약 생성 함수
const getFactorSummary = (shapArr) => {
  if (!shapArr || shapArr.length === 0) return '데이터가 충분하지 않습니다.';
  return shapArr.slice(0, 3).map(({ feature, impact }) => {
    const meta = FEATURE_META.find(f => f.key === feature);
    if (!meta) return feature;
    if (feature === 'BMI') return `체질량지수(BMI)가 ${impact > 0 ? '높음' : '낮음'}`;
    if (feature === 'PhysActivity') return `운동이 ${impact > 0 ? '부족함' : '충분함'}`;
    if (feature === 'Smoker') return `흡연 ${impact > 0 ? '중' : '안 함'}`;
    if (feature === 'HvyAlcoholConsump') return `과음(폭음) ${impact > 0 ? '중' : '안 함'}`;
    if (feature === 'Fruits' || feature === 'Veggies') return `${meta.label} ${impact > 0 ? '부족' : '충분'}`;
    if (feature === 'HighBP') return `고혈압 ${impact > 0 ? '있음' : '없음'}`;
    if (feature === 'HighChol') return `고콜레스테롤 ${impact > 0 ? '있음' : '없음'}`;
    if (feature === 'HeartDiseaseorAttack') return `심장병/심근경색 ${impact > 0 ? '있음' : '없음'}`;
    if (feature === 'NoDocbcCost') return `진료비 부담 ${impact > 0 ? '있음' : '없음'}`;
    if (feature === 'Age') return `연령대 영향`; // 좀 더 구체화 가능
    return meta.label;
  }).join(', ');
};

export default function DiabetesPrediction({ historyOnly }) {
  /* --- state ------------------------------------------------- */
  const [form, setForm] = useState(
    Object.fromEntries(FEATURE_NAMES.map((k) => [k, ""]))
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [compare, setCompare] = useState(null);
  const [compareError, setCompareError] = useState("");

  /* --- load history ----------------------------------------- */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await fetchRecords(3);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const fetchCompare = async () => {
      try {
        const { data } = await api.get("/api/records/compare");
        setCompare(data);
      } catch (err) {
        setCompareError("비교 기록을 불러올 수 없습니다.");
      }
    };
    fetchCompare();
  }, []);

  /* --- handlers --------------------------------------------- */
  const handleChange = (key) => (e, value) => {
    // Slider는 value, 나머지는 e.target.value
    const v = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : value;
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  // 필수 입력 체크
  const requiredKeys = [
    ...yesNoKeys,
    "GenHlth", "MentHlth", "PhysHlth", "BMI", "Sex", "Age", "Education", "Income"
  ];
  const isFormValid = requiredKeys.every((k) => form[k] !== "" && form[k] !== undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isFormValid) {
      setError("모든 필수 항목을 입력해 주세요.");
      return;
    }
    try {
      setLoading(true);
      const payload = buildPayload(form);
      const { data } = await predictDiabetes(payload);
      const shapArr = Object.entries(data.shap)
        .map(([feature, impact]) => ({ feature, impact }))
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 10);
      setResult({
        risk: +(data.prob * 100).toFixed(1),
        interpretation: data.prob > 0.5 ? "High" : "Low",
        shap: shapArr,
      });
      const { data: newHistory } = await fetchRecords(3);
      setHistory(newHistory);
    } catch (err) {
      console.error(err);
      alert("예측 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* --- render field ----------------------------------------- */
  const renderField = (m) => {
    // helperText가 너무 길면 Tooltip으로
    const helper = m.helper && m.helper.length > 22 ? (
      <Tooltip title={m.helper} placement="top" arrow>
        <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: '#3182f6', verticalAlign: 'middle', cursor: 'pointer' }} />
      </Tooltip>
    ) : m.helper ? <span style={{ color: '#888', fontSize: 13 }}>{m.helper}</span> : null;

    // 체크박스 타입을 예/아니요 라디오로 변환
    if (yesNoKeys.includes(m.key)) {
      return (
        <FormControl required sx={{ width: '100%' }}>
          <FormLabel sx={{ fontWeight: 500 }}>{m.label} <span style={{ color: '#3182f6' }}>*</span> {helper}</FormLabel>
          <RadioGroup
            row
            value={form[m.key]}
            onChange={handleChange(m.key)}
            sx={{ mt: 0.5 }}
          >
            <FormControlLabel value="1" control={<Radio color="primary" />} label="예" sx={{ mr: 2 }} />
            <FormControlLabel value="0" control={<Radio color="primary" />} label="아니요" />
          </RadioGroup>
        </FormControl>
      );
    }
    switch (m.type) {
      case "slider":
        return (
          <Box sx={{ px: 1, pt: 1, pb: 0 }}>
            <FormLabel component="legend" sx={{ fontWeight: 500 }}>{m.label} <span style={{ color: '#3182f6' }}>*</span> {helper}</FormLabel>
            <Slider
              value={form[m.key] === "" ? m.min : Number(form[m.key])}
              min={m.min}
              max={m.max}
              step={m.step}
              marks={m.marks ? Array.from({length: m.max - m.min + 1}, (_, i) => ({ value: m.min + i, label: (i % 5 === 0 ? String(m.min + i) : "") })) : false}
              valueLabelDisplay="auto"
              onChange={handleChange(m.key)}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case "select":
        return (
          <FormControl fullWidth required>
            <FormLabel sx={{ fontWeight: 500 }}>{m.label} <span style={{ color: '#3182f6' }}>*</span> {helper}</FormLabel>
            <Select
              value={form[m.key]}
              onChange={handleChange(m.key)}
              displayEmpty
              sx={{ borderRadius: 2, bgcolor: '#f5f7fa', mt: 1 }}
            >
              <MenuItem value="" disabled>
                <em>선택하세요</em>
              </MenuItem>
              {m.opts.map(([v, lab]) => (
                <MenuItem key={v} value={v}>{lab}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "radio":
        return (
          <FormControl required>
            <FormLabel sx={{ fontWeight: 500 }}>{m.label} <span style={{ color: '#3182f6' }}>*</span> {helper}</FormLabel>
            <RadioGroup
              row
              value={form[m.key]}
              onChange={handleChange(m.key)}
            >
              {m.opts.map(([v, lab]) => (
                <FormControlLabel
                  key={v}
                  value={v}
                  control={<Radio color="primary" />}
                  label={lab}
                  sx={{ mr: 2 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      default: // number
        return (
          <TextField
            type="number"
            label={<span>{m.label} <span style={{ color: '#3182f6' }}>*</span></span>}
            value={form[m.key]}
            onChange={handleChange(m.key)}
            helperText={helper}
            placeholder={m.placeholder}
            fullWidth
            required
            inputProps={{ min: m.min, max: m.max, step: m.step }}
            sx={{ borderRadius: 2, bgcolor: '#f5f7fa' }}
          />
        );
    }
  };

  /* --- render history comparison ----------------------------- */
  const renderHistoryComparison = () => {
    if (compareError) return <Alert severity="warning">{compareError}</Alert>;
    if (!compare) return null;
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          최근 예측 기록 비교
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#888' }}>이전 위험도</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#3182f6' }}>{compare.prev_prob !== null ? (compare.prev_prob * 100).toFixed(1) + '%' : '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#888' }}>현재 위험도</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: compare.prob_change > 0 ? '#f44336' : '#3182f6' }}>{(compare.curr_prob * 100).toFixed(1)}%</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>위험도 변화</Typography>
          <Typography variant="body1" fontWeight={600} sx={{ color: compare.prob_change > 0 ? '#f44336' : '#3182f6' }}>
            {compare.prob_change !== null ? `${compare.prob_change > 0 ? '+' : ''}${(compare.prob_change * 100).toFixed(1)}%p` : '첫 기록'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>주요 변화 요인</Typography>
          <Typography variant="body1" fontWeight={600}>
            {compare.top_changed_features && compare.top_changed_features.length > 0
              ? compare.top_changed_features.join(', ')
              : '데이터 없음'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>맞춤 피드백</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>{compare.feedback}</Typography>
          <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>맞춤 추천</Typography>
          <Typography variant="body1">{compare.recommendation}</Typography>
        </Paper>
      </Box>
    );
  };

  /* --- 입력 그룹화: 건강/생활습관, 인구통계 --- */
  // BMI를 건강/생활습관 정보로 이동
  const healthKeys = [
    ...yesNoKeys, "GenHlth", "MentHlth", "PhysHlth", "BMI"
  ];
  const demoKeys = ["Sex", "Age", "Education", "Income"];

  // BMI 유효성 검사
  const bmiValue = form.BMI;
  const bmiError = bmiValue !== "" && (isNaN(Number(bmiValue)) || Number(bmiValue) < 12 || Number(bmiValue) > 98);

  /* --- UI ---------------------------------------------------- */
  if (historyOnly) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#3182f6', mb: 2 }}>
          내 예측 기록 & 트렌드
        </Typography>
        {/* 기록 비교 표 */}
        {renderHistoryComparison()}
        {/* 트렌드 라인차트 */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            예측 결과 트렌드
          </Typography>
          <RContainer width="100%" height={220}>
            <LineChart data={history.slice().reverse().map(h => ({
              date: new Date(h.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
              prob: +(h.prob * 100).toFixed(1),
            }))}>
              <XAxis dataKey="date" tick={{ fontSize: 13 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} />
              <RTooltip formatter={v => v + '%'} />
              <Line type="monotone" dataKey="prob" stroke="#3182f6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </RContainer>
        </Box>
        {/* 주요 변화 요인/피드백: 최근 기록 기준 */}
        {history[0] && history[0].shap && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              최근 예측의 주요 변화 요인
            </Typography>
            <Typography variant="body1" sx={{ color: '#333' }}>
              {getFactorSummary(Object.entries(history[0].shap).map(([feature, impact]) => ({ feature, impact })))}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                맞춤 피드백
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {(() => {
                  const shapArr = Object.entries(history[0].shap)
                    .map(([feature, impact]) => ({ feature, impact }))
                    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                    .slice(0, 5);
                  const top = shapArr.map(({ feature }) => feature);
                  const recs = [];
                  if (top.includes('BMI')) recs.push('BMI(체질량지수)를 낮추기 위해 식단 조절과 운동을 실천해보세요.');
                  if (top.includes('PhysActivity')) recs.push('규칙적인 운동을 늘려보세요.');
                  if (top.includes('Smoker')) recs.push('흡연을 줄이거나 금연을 시도해보세요.');
                  if (top.includes('HvyAlcoholConsump')) recs.push('과음(폭음)을 줄이세요.');
                  if (top.includes('Fruits') || top.includes('Veggies')) recs.push('과일과 채소 섭취를 늘려보세요.');
                  if (top.includes('HighBP')) recs.push('혈압 관리를 위해 저염식과 운동을 실천하세요.');
                  if (top.includes('HighChol')) recs.push('콜레스테롤 수치를 관리하세요.');
                  if (top.includes('HeartDiseaseorAttack')) recs.push('심장 건강을 위해 정기 검진을 받으세요.');
                  if (top.includes('NoDocbcCost')) recs.push('진료비 부담이 있다면 공공의료 지원을 알아보세요.');
                  if (recs.length === 0) recs.push('건강한 생활습관을 유지하세요!');
                  return recs.map((r, i) => <li key={i}>{r}</li>);
                })()}
              </ul>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
        <Paper elevation={0} sx={{ mb: { xs: 2, sm: 4 }, p: { xs: 1.5, sm: 3 }, borderRadius: 4, bgcolor: '#e6eaf0', textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: '#3182f6', mb: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 20 } }}>
            쉽고 정확한 건강 예측, 믿을 수 있는 AI 서비스
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', fontSize: { xs: 13, sm: 15 } }}>
            입력만 하면 내 건강 위험도와 맞춤 피드백, 실시간 트렌드까지 한눈에!
          </Typography>
        </Paper>
        {/* 건강/생활습관 입력 */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 2px 16px #e6eaf0', bgcolor: '#fff' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#222', letterSpacing: -0.5 }}>
            건강 및 생활습관 정보
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {/* 예/아니요 라디오 질문 2개씩 한 줄에 배치 */}
            {(() => {
              const yesNoRows = [];
              for (let i = 0; i < yesNoKeys.length; i += 2) {
                yesNoRows.push(
                  <React.Fragment key={i}>
                    <Grid item xs={12} sm={6}>
                      {renderField(FEATURE_META.find(f => f.key === yesNoKeys[i]))}
                    </Grid>
                    {yesNoKeys[i + 1] && (
                      <Grid item xs={12} sm={6}>
                        {renderField(FEATURE_META.find(f => f.key === yesNoKeys[i + 1]))}
                      </Grid>
                    )}
                  </React.Fragment>
                );
              }
              return yesNoRows;
            })()}
            {/* 나머지 건강/생활습관 필드 (GenHlth, MentHlth, PhysHlth, BMI) */}
            {["GenHlth", "MentHlth", "PhysHlth", "BMI"].map((k) => {
              const m = FEATURE_META.find((f) => f.key === k);
              return (
                <Grid item xs={12} key={k}>
                  {k === "BMI"
                    ? (
                      <TextField
                        type="number"
                        label={<span>BMI (체질량지수) <span style={{ color: '#3182f6' }}>*</span></span>}
                        value={form.BMI}
                        onChange={handleChange("BMI")}
                        helperText={bmiError ? "12~98 사이의 올바른 BMI 값을 입력해 주세요." : "12~98 사이의 값을 입력하세요. (kg/㎡)"}
                        placeholder="예: 23.5"
                        fullWidth
                        required
                        error={!!bmiError}
                        inputProps={{ min: 12, max: 98, step: 0.1 }}
                        sx={{ borderRadius: 2, bgcolor: '#f5f7fa', mt: 1 }}
                      />
                    )
                    : renderField(m)
                  }
                </Grid>
              );
            })}
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </Paper>
        {/* 인구통계 입력 */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 4, boxShadow: '0 2px 16px #e6eaf0', bgcolor: '#fff' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#222', letterSpacing: -0.5 }}>
            인구 통계 정보
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {demoKeys.map((k) => {
              const m = FEATURE_META.find((f) => f.key === k);
              return (
                <Grid item xs={12} sm={6} key={k}>
                  {renderField(m)}
                </Grid>
              );
            })}
          </Grid>
          {/* 예측 버튼을 인구통계 카드 하단에 배치 */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ borderRadius: 3, fontWeight: 700, fontSize: 18, py: 1.7, bgcolor: '#3182f6', '&:hover': { bgcolor: '#2563eb' }, boxShadow: 'none', mt: 2, letterSpacing: -0.5 }}
              endIcon={<EmojiEventsIcon />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "예측하기"}
            </Button>
          </Box>
        </Paper>
        {/* 결과 카드 */}
        {result && (
          <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              당뇨병 위험도: {result.risk}% ({result.interpretation})
            </Typography>
            <ShapChart
              shap={Object.fromEntries(
                result.shap.map(({ feature, impact }) => [feature, impact])
              )}
            />
            {/* 주요 변화 요인 요약 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                주요 변화 요인
              </Typography>
              <Typography variant="body1" sx={{ color: '#333' }}>
                {getFactorSummary(result.shap)}
              </Typography>
            </Box>
            {/* AI 건강 코칭 */}
            <CoachAdvice />
            {/* PDF 저장 버튼 */}
            <PdfReportButton result={result} trend={[]} feedback={""} />
            {/* 트렌드 그래프 */}
            <Box sx={{ mt: 5 }}>
              <TrendChart />
            </Box>
          </Paper>
        )}
        {/* 기록 비교 */}
        {renderHistoryComparison()}
      </Container>
      {/* 하단 고정 건강정보/뉴스/교육 콘텐츠 플로팅 카드 */}
      <Box sx={{ position: 'fixed', bottom: 24, left: 0, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 100 }}>
        <Paper elevation={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.2, borderRadius: 99, bgcolor: '#3182f6', color: '#fff', pointerEvents: 'auto', boxShadow: '0 4px 24px #3182f633' }}>
          <MenuBookIcon sx={{ fontSize: 24, color: '#fff' }} />
          <Typography variant="body1" fontWeight={600} sx={{ color: '#fff' }}>
            건강정보 더 알아보기: <a href="https://www.diabetes.or.kr/general/" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 400 }}>식단 가이드</a>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
