
export const LOCATIONS = ["강남", "충남", "전남", "전북", "제주", "기타"];

// 고소작업 하위 유형별 영상 설정
export const HEIGHT_WORK_VIDEOS = {
  ladder: {
    title: '사다리, 작업발판 안전교육',
    url: 'placeholder-ladder-video-url', // 나중에 제공될 영상 링크
  },
  scaffold: {
    title: '틀비계 안전교육',
    url: 'placeholder-scaffold-video-url', // 나중에 제공될 영상 링크
  },
  hangingScaffold: {
    title: '달비계 안전교육',
    url: 'placeholder-hanging-scaffold-video-url', // 나중에 제공될 영상 링크
  }
} as const;

export const SAFETY_CHECK_LIST_ITEMS = [
    { id: 'gen1', category: '일반항목', text: '해당 작업 관리감독자 배치' },
    { id: 'gen2', category: '일반항목', text: '작업 전 안전교육 실시' },
    { id: 'gen3', category: '일반항목', text: '근로자 작업준비상태 확인(작업복장, 보호구, 안전장치 등)' },
    { id: 'gen4', category: '일반항목', text: '작업장 주위 안전표시 및 관련자 외 출입금지 조치' },
    { id: 'gen5', category: '일반항목', text: '작업장 정리정돈 실시(미끄럼 방지 조치, 요철 확인 등)' },
    { id: 'gen6', category: '일반항목', text: '중량물 낙하 및 구름 방지 조치, 적재상태 확인' },
    { id: 'gen7', category: '일반항목', text: '조도, 채광 및 조명 상태' },
    // 고소작업 - 사다리, 작업발판
    { id: 'high-ladder1', category: '고소작업-사다리', text: '아웃트리거, 미끄럼방지 등 안전조치 실시' },
    { id: 'high-ladder2', category: '고소작업-사다리', text: '사다리 안전수칙 준수(2인 1조, 작업 위치 등)' },
    // 고소작업 - 틀비계
    { id: 'high-scaffold1', category: '고소작업-틀비계', text: '아웃트리거 및 안전난간 등 안전장치 설치' },
    { id: 'high-scaffold2', category: '고소작업-틀비계', text: '최대적재하중 표시' },
    // 고소작업 - 달비계
    { id: 'high-hanging1', category: '고소작업-달비계', text: '로프 2점 이상 견고하게 결속 및 로프 보호대, 풀림방지장치' },
    { id: 'high-hanging2', category: '고소작업-달비계', text: '수직구명줄 설치 및 안전대 및 추락방지대(로립) 체결' },
    { id: 'high-hanging3', category: '고소작업-달비계', text: '공구 추락방지조치(하부인원 통제, 이탈방지끈 체결)' },
    { id: 'high-hanging4', category: '고소작업-달비계', text: '로프, 결속장치 등 마모/손상 여부 확인' },
    { id: 'high-hanging5', category: '고소작업-달비계', text: '지상/옥상 작업지휘자 배치' },
] as const;

export const HAZARDOUS_SAFETY_CHECK_ITEMS = [
    // 일반항목
    { id: 'haz-gen1', category: '일반항목', text: '해당 작업 관리감독자 배치' },
    { id: 'haz-gen2', category: '일반항목', text: '작업 전 안전교육 실시' },
    { id: 'haz-gen3', category: '일반항목', text: '근로자 작업준비상태 확인(작업복장, 보호구, 안전장치 등)' },
    { id: 'haz-gen4', category: '일반항목', text: '작업장 주위 안전표시 및 관련자 외 출입금지 조치' },
    { id: 'haz-gen5', category: '일반항목', text: '작업장 정리정돈 실시(미끄럼 방지 조치, 요철 확인 등)' },
    { id: 'haz-gen6', category: '일반항목', text: '중량물 낙하 및 구름 방지 조치, 적재상태 확인' },
    { id: 'haz-gen7', category: '일반항목', text: '조도, 채광 및 조명 상태' },
    // 화기작업
    { id: 'haz-hot1', category: '화기작업', text: '용접·용단작업 중 화재감시자 배치 및 방역장비 지급' },
    { id: 'haz-hot2', category: '화기작업', text: '작업구역 설정(작업장 주위에 경계표지 및 안전표지)' },
    { id: 'haz-hot3', category: '화기작업', text: '작업장 주위 인화성 물질 제거(용접방호포 등 방호조치)' },
    { id: 'haz-hot4', category: '화기작업', text: '작업장 주위 소화기 비치 및 소화시설 기능 확인' },
    { id: 'haz-hot5', category: '화기작업', text: '화기작업 중 용접불티, 불꽃 등 비산방지조치' },
    { id: 'haz-hot6', category: '화기작업', text: '인화성 물질의 증기·가스 환기조치(밀폐공간 강제환기)' },
    { id: 'haz-hot7', category: '화기작업', text: '밀폐공간 내 화기 작업 전 및 작업 중 가스농도의 측정' },
    { id: 'haz-hot8', category: '화기작업', text: '배관계통도 검토를 통한 맨판 설치, 밸브차단 등의 조치' },
    // 고소작업 - 사다리, 작업발판
    { id: 'haz-high-ladder1', category: '고소작업-사다리', text: '아웃트리거, 미끄럼방지 등 안전조치 실시' },
    { id: 'haz-high-ladder2', category: '고소작업-사다리', text: '사다리 안전수칙 준수(2인 1조, 작업 위치 등)' },
    // 고소작업 - 틀비계
    { id: 'haz-high-scaffold1', category: '고소작업-틀비계', text: '아웃트리거 및 안전난간 등 안전장치 설치' },
    { id: 'haz-high-scaffold2', category: '고소작업-틀비계', text: '최대적재하중 표시' },
    // 고소작업 - 달비계
    { id: 'haz-high-hanging1', category: '고소작업-달비계', text: '로프 2점 이상 견고하게 결속 및 로프 보호대, 풀림방지장치' },
    { id: 'haz-high-hanging2', category: '고소작업-달비계', text: '수직구명줄 설치 및 안전대 및 추락방지대(로립) 체결' },
    { id: 'haz-high-hanging3', category: '고소작업-달비계', text: '공구 추락방지조치(하부인원 통제, 이탈방지끈 체결)' },
    { id: 'haz-high-hanging4', category: '고소작업-달비계', text: '로프, 결속장치 등 마모/손상 여부 확인' },
    { id: 'haz-high-hanging5', category: '고소작업-달비계', text: '지상/옥상 작업지휘자 배치' },
] as const;

export const CONFINED_SPACE_SAFETY_CHECK_ITEMS = [
    { id: 'conf1', text: '관리감독자 지정 및 감시인 배치' },
    { id: 'conf2', text: '밀폐공간작업 관계자 외 출입금지 표지판 게시' },
    { id: 'conf3', text: '밸브차단, 명판 설치, 불활성가스 치환, 용기 세정' },
    { id: 'conf4', text: '전기회로, 기계장비 가동정지, 유압, 압축공기 잠금 및 시건조치' },
    { id: 'conf5', text: '산소농도 및 유해가스 측정' },
    { id: 'conf6', text: '환기시설 설치 및 환기 실시여부' },
    { id: 'conf7', text: '전화 및 무선기기 구비' },
    { id: 'conf8', text: '방폭형 전기기계기구의 사용' },
    { id: 'conf9', text: '소화기 비치' },
    { id: 'conf10', text: '공기호흡기 또는 송기마스크 비치' },
    { id: 'conf11', text: '필요한 안전장구 구비' },
    { id: 'conf12', text: '안전보건교육 실시' },
] as const;


export const PLEDGE_ITEMS = {
  item1: "사업장 내 이상 발생 시(물적,인적) 시행부서 팀장/안전·보건관리자에게 알린다.",
  item2: "작업 시 안전보건관계법령에 따른 안전수칙을 준수하고 이를 위반할 경우 작업이 중지될 수 있다.",
  item3: "작업 시 음주 및 지정된 장소 외 흡연은 절대 금지한다.",
  item4: "비상 시 직원의 안내에 적극 협조하여야 한다.",
  item5: "공사, 설비·보수 등의 모든 작업은 위험성 평가와 작업허가서 승인을 득한 후 작업을 실시한다.",
  item6: "작업 전 작업과 관련된 일체의 안전사항을 점검하고 이상 발생 시 조치 후 작업을 실시한다.",
  item7: "작업 전 해당 작업의 위험성 및 안전대책을 충분히 숙지한 후 작업을 실시한다.",
  item8: "작업 시 안전보호구를 필히 착용하고 안전 작업 절차에 따라 작업을 실시한다.",
  item9: "작업 전/후 작업장은 항시 정리정돈을 한다.",
  item10: "모든 기계는 담당자 외 조작 및 사용을 금지한다."
};

export const DISASTER_TYPES = [
  "떨어짐",
  "끼임",
  "부딪힘",
  "넘어짐",
  "화학물질 누출·접촉",
  "폭발·화재",
  "감전",
  "절단·베임·찔림",
  "산소결핍·질식",
  "불균형·무리한 동작",
  "깔림",
  "맞음",
  "무너짐",
  "이상온도·물체접촉",
  "기타",
];