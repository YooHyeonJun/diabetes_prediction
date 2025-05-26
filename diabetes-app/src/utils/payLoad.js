/* --- 피처 메타데이터 -------------------------------------------
   • key      : CSV/모델 컬럼명 (순서는 그대로 유지)
   • label    : 사용자에게 보일 한글 라벨
   • type     : checkbox | number | select | radio
   • opts     : select/radio 옵션  [값, 라벨] 배열
   • helper   : TextField helperText
------------------------------------------------------------------*/
export const FEATURE_META = [
  { key: "HighBP",              label: "고혈압",              type: "checkbox" },
  { key: "HighChol",            label: "고콜레스테롤",        type: "checkbox" },
  { key: "CholCheck",           label: "5년내 콜레스테롤 검사",type: "checkbox" },
  { key: "BMI",                 label: "BMI(12-98)",          type: "number", helper: "kg/m²" },
  { key: "Smoker",              label: "현재 흡연",            type: "checkbox" },
  { key: "Stroke",              label: "뇌졸중 기왕력",        type: "checkbox" },
  { key: "HeartDiseaseorAttack",label: "심장병/심근경색",      type: "checkbox" },
  { key: "PhysActivity",        label: "최근 30일 운동",       type: "checkbox" },
  { key: "Fruits",              label: "하루 1회 이상 과일",   type: "checkbox" },
  { key: "Veggies",             label: "하루 1회 이상 채소",   type: "checkbox" },
  { key: "HvyAlcoholConsump",   label: "과음(주)",             type: "checkbox" },
  { key: "AnyHealthcare",       label: "의료보험 보유",        type: "checkbox" },
  { key: "NoDocbcCost",         label: "비용 때문에 진료 미이용",type: "checkbox" },
  { key: "GenHlth",             label: "전반적 건강(1좋음-5나쁨)", type: "select",
    opts: [[1,"1"],[2,"2"],[3,"3"],[4,"4"],[5,"5"]] },
  { key: "MentHlth",            label: "정신건강 불량일수(0-30)", type: "number" },
  { key: "PhysHlth",            label: "신체건강 불량일수(0-30)", type: "number" },
  { key: "DiffWalk",            label: "보행 곤란",            type: "checkbox" },
  { key: "Sex",                 label: "성별",                 type: "radio",
    opts: [[1,"남"],[0,"여"]] },
  { key: "Age",                 label: "연령코드(1:18-24 … 13:80+)", type: "select",
    opts: Array.from({length:13},(_,i)=>[i+1,String(i+1)]) },
  { key: "Education",           label: "학력코드(1-6)",        type: "select",
    opts: [[1,"1"],[2,"2"],[3,"3"],[4,"4"],[5,"5"],[6,"6"]] },
  { key: "Income",              label: "소득코드(1-8)",        type: "select",
    opts: Array.from({length:8},(_,i)=>[i+1,String(i+1)]) },
];

// CSV 피처 순서 그대로
export const FEATURE_NAMES = FEATURE_META.map((m) => m.key);

/* formState → 모델 입력(21 길이 배열) */
export const buildPayload = (state) =>
  FEATURE_META.map((m) => {
    const v = state[m.key];
    if (m.type === "checkbox") return v ? 1 : 0;
    return Number(v) || 0;
  });
