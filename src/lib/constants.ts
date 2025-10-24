/**
 * 코버스 고속버스 터미널 목록
 */

export interface Terminal {
  value: string;
  label: string;
  region: string;
}

export const TERMINALS: Terminal[] = [
  // 서울
  { value: "서울경부", label: "서울경부", region: "서울" },
  { value: "센트럴시티", label: "센트럴시티", region: "서울" },
  { value: "동서울", label: "동서울", region: "서울" },
  { value: "상봉", label: "상봉", region: "서울" },

  // 경기
  { value: "고양", label: "고양(화정)", region: "경기" },
  { value: "성남", label: "성남(분당)", region: "경기" },
  { value: "수원", label: "수원", region: "경기" },
  { value: "안산", label: "안산", region: "경기" },
  { value: "안성", label: "안성", region: "경기" },
  { value: "여주", label: "여주", region: "경기" },
  { value: "여주종합", label: "여주종합", region: "경기" },
  { value: "의정부", label: "의정부", region: "경기" },
  { value: "용인", label: "용인", region: "경기" },
  { value: "용인유방", label: "용인유방", region: "경기" },
  { value: "이천", label: "이천", region: "경기" },
  { value: "평택", label: "평택", region: "경기" },
  { value: "평택대", label: "평택대", region: "경기" },
  { value: "광명", label: "광명", region: "경기" },
  { value: "오산", label: "오산", region: "경기" },
  { value: "시흥시화", label: "시흥시화", region: "경기" },

  // 인천
  { value: "인천", label: "인천", region: "인천" },

  // 강원
  { value: "원주", label: "원주", region: "강원" },
  { value: "강릉", label: "강릉", region: "강원" },
  { value: "가톨릭관동대강릉", label: "가톨릭관동대강릉", region: "강원" },
  { value: "속초", label: "속초", region: "강원" },
  { value: "동해", label: "동해", region: "강원" },
  { value: "삼척", label: "삼척", region: "강원" },
  { value: "춘천", label: "춘천", region: "강원" },
  { value: "양양", label: "양양", region: "강원" },

  // 충남/대전
  { value: "공주", label: "공주", region: "충남" },
  { value: "금산", label: "금산", region: "충남" },
  { value: "논산", label: "논산", region: "충남" },
  { value: "온양", label: "온양", region: "충남" },
  { value: "연무대", label: "연무대", region: "충남" },
  { value: "조치원", label: "조치원", region: "충남" },
  { value: "세종시", label: "세종시", region: "충남" },
  { value: "천안", label: "천안", region: "충남" },
  { value: "천안종합운동장", label: "천안종합운동장", region: "충남" },
  { value: "예산", label: "예산", region: "충남" },
  { value: "홍성", label: "홍성", region: "충남" },
  { value: "보령", label: "보령", region: "충남" },
  { value: "당진", label: "당진", region: "충남" },
  { value: "서산", label: "서산", region: "충남" },
  { value: "태안", label: "태안", region: "충남" },
  { value: "안면도", label: "안면도", region: "충남" },
  { value: "덕산스파", label: "덕산스파", region: "충남" },
  { value: "청양", label: "청양", region: "충남" },
  { value: "대전", label: "대전", region: "대전" },
  { value: "대전청사", label: "대전청사(샘머리)", region: "대전" },
  { value: "유성", label: "유성", region: "대전" },

  // 충북
  { value: "제천", label: "제천", region: "충북" },
  { value: "청주", label: "청주", region: "충북" },
  { value: "충주", label: "충주", region: "충북" },
  { value: "황간(상행)", label: "황간(상행)", region: "충북" },
  { value: "황간(하행)", label: "황간(하행)", region: "충북" },

  // 전북
  { value: "전주공용", label: "전주공용", region: "전북" },
  { value: "고창", label: "고창", region: "전북" },
  { value: "군산", label: "군산", region: "전북" },
  { value: "김제", label: "김제", region: "전북" },
  { value: "남원", label: "남원", region: "전북" },
  { value: "부안", label: "부안", region: "전북" },
  { value: "순창", label: "순창", region: "전북" },
  { value: "익산", label: "익산", region: "전북" },
  { value: "정읍", label: "정읍", region: "전북" },
  { value: "진안", label: "진안", region: "전북" },

  // 경북/대구
  { value: "구미", label: "구미", region: "경북" },
  { value: "김천", label: "김천", region: "경북" },
  { value: "경주", label: "경주", region: "경북" },
  { value: "상주", label: "상주", region: "경북" },
  { value: "영주", label: "영주", region: "경북" },
  { value: "영천", label: "영천", region: "경북" },
  { value: "안동", label: "안동", region: "경북" },
  { value: "점촌", label: "점촌", region: "경북" },
  { value: "포항", label: "포항(천일)", region: "경북" },
  { value: "대구금호", label: "대구금호", region: "대구" },
  { value: "대구동양", label: "대구동양", region: "대구" },
  { value: "대구중앙", label: "대구중앙", region: "대구" },
  { value: "대구한진", label: "대구한진", region: "대구" },
  { value: "서대구", label: "서대구", region: "대구" },

  // 광주/전남
  { value: "광주", label: "광주", region: "광주" },
  { value: "강진", label: "강진", region: "전남" },
  { value: "고흥", label: "고흥", region: "전남" },
  { value: "광양", label: "광양", region: "전남" },
  { value: "동광양", label: "동광양", region: "전남" },
  { value: "나주", label: "나주", region: "전남" },
  { value: "녹동", label: "녹동", region: "전남" },
  { value: "담양", label: "담양", region: "전남" },
  { value: "목포", label: "목포", region: "전남" },
  { value: "문장", label: "문장", region: "전남" },
  { value: "무안", label: "무안", region: "전남" },
  { value: "보성", label: "보성", region: "전남" },
  { value: "벌교", label: "벌교", region: "전남" },
  { value: "순천", label: "순천", region: "전남" },
  { value: "여수", label: "여수", region: "전남" },
  { value: "여천", label: "여천", region: "전남" },
  { value: "영광", label: "영광", region: "전남" },
  { value: "영산포", label: "영산포", region: "전남" },
  { value: "영암", label: "영암", region: "전남" },
  { value: "완도", label: "완도", region: "전남" },
  { value: "장흥", label: "장흥", region: "전남" },
  { value: "진도", label: "진도", region: "전남" },
  { value: "함평", label: "함평", region: "전남" },
  { value: "해남", label: "해남", region: "전남" },
  { value: "삼호", label: "삼호", region: "전남" },

  // 경남/울산/부산
  { value: "마산", label: "마산", region: "경남" },
  { value: "내서", label: "내서", region: "경남" },
  { value: "진주", label: "진주", region: "경남" },
  { value: "창원", label: "창원", region: "경남" },
  { value: "김해", label: "김해", region: "경남" },
  { value: "통영", label: "통영", region: "경남" },
  { value: "울산", label: "울산", region: "울산" },
  { value: "울산신북", label: "울산신북", region: "울산" },
  { value: "부산", label: "부산", region: "부산" },
  { value: "서부산", label: "서부산(사상)", region: "부산" },
];

/**
 * 버스 시간대 목록 (30분 단위)
 */
export const TIME_OPTIONS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];
