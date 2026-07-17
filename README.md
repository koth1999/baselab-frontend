# BASELAB

KBO 공식 기록실을 요청 시점에 크롤링해 선수를 분석하는 무DB 웹앱입니다. 데이터는 Python 프로세스 메모리에 10분만 캐시되며 디스크나 데이터베이스에 저장하지 않습니다.

## 구성

- `backend/`: FastAPI, BeautifulSoup 기반 KBO 기록 수집 및 분석 API
- `app/`: Next.js 선수 검색·랭킹·분석 대시보드
- `start.sh`: 프런트엔드와 백엔드 개발 서버 실행

## 실행

Node.js 22 이상과 Python 3.10 이상이 필요합니다.

```bash
chmod +x start.sh
./start.sh
```

브라우저에서 프런트엔드가 출력한 주소(기본 `http://localhost:5173`)를 엽니다. API 문서는 `http://localhost:8000/docs`에서 볼 수 있습니다.

KBO 사이트의 이용 정책과 robots 지침을 확인하고, 공개 서비스로 확장할 때는 수집 주기를 충분히 길게 설정하세요.
