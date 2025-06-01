import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { FEATURE_META } from "../utils/payLoad";
import { Box, Typography } from '@mui/material';
import MuiTooltip from '@mui/material/Tooltip';

// 영향 방향(좋음/나쁨) 색상 (0이면 연한 회색)
const getBarColor = (v, isZero) => isZero ? '#e0e0e0' : (v >= 0 ? '#f44336' : '#3182f6');
const getArrow = (v) => v >= 0 ? '↑' : '↓';
const getDirText = (v) => v >= 0 ? '위험↑ (나쁜 영향)' : '위험↓ (좋은 영향)';

// featureKey → 한글 키워드 매핑
const keywordMap = {
  HvyAlcoholConsump: '과음',
  Smoker: '흡연',
  PhysActivity: '운동',
  HighBP: '혈압',
  HighChol: '콜레스',
  CholCheck: '콜검',
  DiffWalk: '보행',
  Age: '연령',
  Income: '소득',
  BMI: 'BMI',
  HeartDiseaseorAttack: '심장',
  Stroke: '뇌졸',
  Fruits: '과일',
  Veggies: '채소',
  NoDocbcCost: '진료비',
  AnyHealthcare: '의료',
  GenHlth: '건강',
  MentHlth: '정신',
  PhysHlth: '신체',
  Sex: '성별',
  Education: '학력',
};

function shortLabel(label) {
  if (label.length <= 10) return label;
  return label.slice(0, 10) + '…';
}

// featureKey → 한글 키워드 매핑
function getKeyword(key) {
  if (keywordMap[key]) return keywordMap[key];
  const meta = FEATURE_META.find(f => f.key === key);
  if (meta) {
    // label에서 한글 키워드 추출 (예: '고혈압 진단을 받은 적이 있나요?' → '고혈압')
    const m = meta.label.match(/[가-힣A-Za-z0-9]+/g);
    if (m && m.length > 0) return m[0].length > 4 ? m[0].slice(0, 4) : m[0];
    return meta.label;
  }
  return key;
}

function getFullLabel(key) {
  const meta = FEATURE_META.find(f => f.key === key);
  return meta ? meta.label : '';
}

// Y축Tick: Y축에 feature key(영어)만 표시, Tooltip에도 key만
const YAxisTick = (props) => {
  const { x, y, payload } = props;
  const featureKey = typeof payload.value === 'string' ? payload.value.split('_')[0] : '';
  const fullLabel = getFullLabel(featureKey);
  return (
    <g transform={`translate(${x},${y})`}>
      <MuiTooltip title={featureKey + (fullLabel ? ': ' + fullLabel : '')} arrow placement="left">
        <text x={0} y={0} dy={4} textAnchor="end" fontSize={10} fontWeight={700} fill="#222" style={{ cursor: 'pointer' }}>
          {featureKey}
        </text>
      </MuiTooltip>
    </g>
  );
};

// Bar 끝에 영어+한글 label+수치 (수치만 색상 강조)
const renderBarLabel = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const featureKey = typeof payload.feature === 'string' ? payload.feature.split('_')[0] : '';
  const fullLabel = getFullLabel(featureKey);
  const keyword = getKeyword(featureKey);
  const raw = payload.raw;
  const valueStr = `${raw >= 0 ? '+' : '-'}${Math.abs(raw).toFixed(2)}`;
  const arrow = getArrow(raw);
  return (
    <text
      x={x + width + 8}
      y={y + height / 2 + 4}
      fontSize={11}
      fontWeight={600}
      fill="#222"
    >
      {`${featureKey}${keyword ? ' (' + keyword + ')' : ''} : `}
      <tspan fill={raw >= 0 ? '#f44336' : '#3182f6'}>{valueStr}</tspan>
      {` ${arrow}`}
    </text>
  );
};

// SHAP 툴팁: 영어 key, 한글 키워드, 한글 전체 설명, 영향 수치/방향
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length || !payload[0].payload) return null;
  const d = payload[0].payload;
  const featureKey = typeof d.feature === 'string' ? d.feature.split('_')[0] : '';
  const keyword = getKeyword(featureKey);
  const fullLabel = getFullLabel(featureKey);
  const valueStr = `${d.raw >= 0 ? '+' : '-'}${Math.abs(d.raw).toFixed(2)}`;
  const dirText = getDirText(d.raw);
  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', padding: 10, fontSize: 14, borderRadius: 6, maxWidth: 320 }}>
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{featureKey}{keyword ? ` (${keyword})` : ''}</div>
      {fullLabel && <div style={{ color: '#444', marginBottom: 4 }}>{fullLabel}</div>}
      <div style={{ color: d.raw >= 0 ? '#f44336' : '#3182f6', fontWeight: 600 }}>{valueStr} <span style={{ color: '#222', fontWeight: 400 }}>({dirText})</span></div>
    </div>
  );
};

export default function ShapChart({ shap }) {
  if (!shap) return null;

  // 영향도 상위 10개 feature 각각이 Y축에 한 번씩(중복 허용)
  const data = Object.entries(shap)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 10)
    .map(([f, v], i) => ({
      feature: f + '_' + i, // 영어 feature key
      value: Math.abs(v),
      sign: v,
      raw: v
    }));

  const max = Math.max(...data.map(d => Math.abs(d.raw)));

  return (
    <Box sx={{ width: '100%', minHeight: 340, py: 1 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        주요 예측 영향 요인 (SHAP)
      </Typography>
      <ResponsiveContainer width="100%" height={Math.max(320, data.length * 32)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
          barCategoryGap={16}
        >
          {/* Y축: 영어 feature key만, Tooltip도 key만 */}
          <YAxis dataKey="feature" type="category" width={120} tick={YAxisTick} />
          {/* X축: 영향도(절대값) */}
          <XAxis
            type="number"
            domain={[0, max * 1.1]}
            tick={{ fontSize: 13 }}
            label={{ value: '영향도(절대값)', position: 'insideBottomRight', offset: -5, fontSize: 13 }}
            tickFormatter={v => v.toFixed(2)}
          />
          {/* Tooltip: 영향 방향/수치 설명 */}
          <RechartsTooltip
            content={CustomTooltip}
          />
          {/* Bar: 영향 방향별 색상, 끝에 수치/방향 표시 */}
          <Bar
            dataKey="value"
            radius={[6, 6, 6, 6]}
            barSize={18}
            isAnimationActive={false}
            label={renderBarLabel}
          >
            {data.map((entry, idx) => (
              <cell key={idx} fill={getBarColor(entry.raw, entry.raw === 0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
        빨간색: 위험↑(나쁜 영향), 파란색: 위험↓(좋은 영향) — 오른쪽으로 갈수록 영향이 큼
      </Typography>
    </Box>
  );
}
