# 고속버스 좌석 체크 대시보드

Playwright를 사용하여 코버스 사이트에서 고속버스 빈 좌석을 확인하고, Next.js 웹 대시보드로 결과를 시각화하는 프로젝트입니다.

## 주요 기능

- **실시간 좌석 확인**: 웹 UI에서 버튼 클릭으로 즉시 좌석 확인
- **히스토리 대시보드**: 과거 확인 기록을 시각적으로 표시
- **통계 분석**: 총 체크 횟수, 성공률, 좌석 발견률 등
- **자동 스케줄링**: GitHub Actions로 5분마다 자동 체크
- **데이터 저장**: JSON 파일로 히스토리 보존

## 시작하기

### 필수 요구사항

- Node.js 20 이상
- npm

### 설치

```bash
# 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install --with-deps
```

### 개발 서버 실행

```bash
# Next.js 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 대시보드를 확인하세요.

### 수동으로 좌석 확인

```bash
# CLI에서 좌석 확인 (GitHub Actions와 동일)
npm run check
```

## 프로젝트 구조

```
kobusCheckSeats/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 메인 대시보드 페이지
│   │   ├── layout.tsx         # 레이아웃
│   │   ├── globals.css        # 전역 스타일
│   │   └── api/               # API Routes
│   │       ├── check/         # 좌석 확인 API
│   │       ├── history/       # 히스토리 조회 API
│   │       └── stats/         # 통계 API
│   ├── components/            # React 컴포넌트
│   │   ├── Header.tsx         # 헤더 컴포넌트
│   │   ├── StatsCards.tsx     # 통계 카드
│   │   ├── CheckButton.tsx    # 좌석 확인 버튼
│   │   ├── HistoryList.tsx    # 히스토리 리스트
│   │   ├── HistoryItem.tsx    # 히스토리 아이템
│   │   └── BusTimeCard.tsx    # 버스 시간 카드
│   └── lib/
│       ├── scraper.ts         # 스크래핑 로직
│       ├── db.ts              # 데이터 저장/조회
│       └── types.ts           # TypeScript 타입 정의
├── data/
│   └── history.json           # 확인 결과 저장
├── .github/
│   └── workflows/
│       └── check-seats.yml    # GitHub Actions 워크플로우
├── index.js                   # CLI 스크립트 (GitHub Actions용)
└── package.json
```

## API 엔드포인트

### `GET /api/check`
기본 설정으로 좌석을 확인합니다.

### `POST /api/check`
커스텀 설정으로 좌석을 확인합니다.

```json
{
  "departure": "서울경부",
  "arrival": "상주",
  "targetMonth": "10",
  "targetDate": "2",
  "targetTimes": ["18:40", "19:40"]
}
```

### `GET /api/history`
히스토리를 조회합니다.

Query Parameters:
- `limit`: 가져올 개수 (기본: 50)
- `foundOnly`: true이면 좌석이 있었던 것만
- `startDate`: 시작 날짜 (ISO 형식)
- `endDate`: 종료 날짜 (ISO 형식)

### `GET /api/stats`
통계 정보를 조회합니다.

## 설정 변경

[src/lib/scraper.ts](src/lib/scraper.ts)에서 `DEFAULT_CONFIG`를 수정하여 기본 검색 조건을 변경할 수 있습니다:

```typescript
export const DEFAULT_CONFIG: BusCheckConfig = {
  departure: "서울경부",
  arrival: "상주",
  targetMonth: "10",
  targetDate: "2",
  targetTimes: ["18:40", "19:40"],
};
```

## GitHub Actions 자동 실행

`.github/workflows/check-seats.yml` 파일에서 스케줄을 설정할 수 있습니다:

```yaml
schedule:
  - cron: "*/5 * * * *"  # 5분마다 실행
```

결과는 자동으로 `data/history.json`에 저장되고 저장소에 커밋됩니다.

## 배포

### Vercel 배포

```bash
npm run build
```

Vercel에 배포하면 웹 대시보드를 공개적으로 호스팅할 수 있습니다.

**주의사항**:
- Vercel의 무료 플랜은 Serverless Function 실행 시간이 제한되어 있습니다 (10초).
- Playwright 실행 시간이 긴 경우 Pro 플랜 필요할 수 있습니다.
- 또는 Vercel Cron Jobs를 사용하여 스케줄링할 수 있습니다.

## 기술 스택

- **Next.js 15**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **Playwright**: 웹 스크래핑
- **GitHub Actions**: 자동 스케줄링

## 라이선스

ISC

## 작성자

DonggunLim
