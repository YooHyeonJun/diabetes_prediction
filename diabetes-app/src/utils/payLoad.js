/* --- 피처 메타데이터 -------------------------------------------
   • key      : CSV/모델 컬럼명 (순서는 그대로 유지)
   • label    : 사용자에게 보일 한글 라벨
   • type     : checkbox | number | select | radio
   • opts     : select/radio 옵션  [값, 라벨] 배열
   • helper   : TextField helperText
------------------------------------------------------------------*/
export const FEATURE_META = [
  { key: "HighBP", label: "고혈압 진단을 받은 적이 있나요?", type: "checkbox", helper: "의사에게 고혈압 진단을 받은 적이 있다면 체크하세요." },
  { key: "HighChol", label: "고콜레스테롤 진단을 받은 적이 있나요?", type: "checkbox", helper: "의사에게 고콜레스테롤 진단을 받은 적이 있다면 체크하세요." },
  { key: "CholCheck", label: "최근 5년 내 콜레스테롤 검사를 받았나요?", type: "checkbox", helper: "최근 5년 이내에 콜레스테롤 검사를 받은 적이 있다면 체크하세요." },
  { key: "BMI", label: "BMI (체질량지수)", type: "number", helper: "12~98 사이의 값을 입력하세요. (kg/㎡)", placeholder: "예: 23.5", min: 12, max: 98, step: 0.1 },
  { key: "Smoker", label: "현재 흡연 중이신가요?", type: "checkbox", helper: "현재 흡연을 하고 있다면 체크하세요." },
  { key: "Stroke", label: "뇌졸중 진단을 받은 적이 있나요?", type: "checkbox", helper: "의사에게 뇌졸중 진단을 받은 적이 있다면 체크하세요." },
  { key: "HeartDiseaseorAttack", label: "심장병 또는 심근경색 진단을 받은 적이 있나요?", type: "checkbox", helper: "의사에게 심장병 또는 심근경색 진단을 받은 적이 있다면 체크하세요." },
  { key: "PhysActivity", label: "최근 30일 내 운동을 하셨나요?", type: "checkbox", helper: "최근 30일 내에 운동을 한 적이 있다면 체크하세요." },
  { key: "Fruits", label: "하루 1회 이상 과일을 섭취하나요?", type: "checkbox", helper: "하루에 한 번 이상 과일을 먹는다면 체크하세요." },
  { key: "Veggies", label: "하루 1회 이상 채소를 섭취하나요?", type: "checkbox", helper: "하루에 한 번 이상 채소를 먹는다면 체크하세요." },
  { key: "HvyAlcoholConsump", label: "주 1회 이상 과음(폭음)하나요?", type: "checkbox", helper: "주 1회 이상 과음(폭음)한다면 체크하세요." },
  { key: "AnyHealthcare", label: "의료보험이 있으신가요?", type: "checkbox", helper: "의료보험이 있다면 체크하세요." },
  { key: "NoDocbcCost", label: "비용 때문에 진료를 미룬 적이 있나요?", type: "checkbox", helper: "비용 문제로 진료를 받지 못한 적이 있다면 체크하세요." },
  { key: "GenHlth", label: "전반적인 건강 상태는 어떤가요?", type: "select", helper: "1: 매우 좋음 ~ 5: 매우 나쁨", opts: [[1,"매우 좋음"],[2,"좋음"],[3,"보통"],[4,"나쁨"],[5,"매우 나쁨"]] },
  { key: "MentHlth", label: "최근 한 달간 정신적으로 힘들었던 날(0~30일)", type: "slider", helper: "0~30일 중 며칠이나 정신적으로 힘들었나요?", min: 0, max: 30, step: 1, marks: true },
  { key: "PhysHlth", label: "최근 한 달간 신체적으로 힘들었던 날(0~30일)", type: "slider", helper: "0~30일 중 며칠이나 신체적으로 힘들었나요?", min: 0, max: 30, step: 1, marks: true },
  { key: "DiffWalk", label: "보행에 어려움이 있으신가요?", type: "checkbox", helper: "걷는 데 어려움이 있다면 체크하세요." },
  { key: "Sex", label: "성별을 선택해 주세요.", type: "radio", opts: [[1,"남성"],[0,"여성"]] },
  { key: "Age", label: "연령대", type: "select", helper: "해당하는 연령대를 선택하세요.", opts: [
    [1, "18-24세"], [2, "25-29세"], [3, "30-34세"], [4, "35-39세"], [5, "40-44세"],
    [6, "45-49세"], [7, "50-54세"], [8, "55-59세"], [9, "60-64세"], [10, "65-69세"],
    [11, "70-74세"], [12, "75-79세"], [13, "80세 이상"]
  ] },
  { key: "Education", label: "최종 학력", type: "select", helper: "해당하는 학력을 선택하세요.", opts: [
    [1, "초등학교 졸업 이하"], [2, "중학교 졸업"], [3, "고등학교 졸업"],
    [4, "전문대 졸업"], [5, "대학교 졸업"], [6, "대학원 졸업 이상"]
  ] },
  { key: "Income", label: "가구 월 소득 수준", type: "select", helper: "해당하는 월 소득 구간을 선택하세요.", opts: [
    [1, "100만원 미만"], [2, "100~200만원"], [3, "200~300만원"], [4, "300~400만원"],
    [5, "400~500만원"], [6, "500~600만원"], [7, "600~700만원"], [8, "700만원 이상"]
  ] },
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
