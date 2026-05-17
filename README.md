# 계약서 AI 검토 서비스 (MVP)

계약서 사진을 업로드하면 Gemini API가 종류를 분류하고 위험 조항을 검출하여 위험도·근거를 알려주는 웹 서비스입니다.

> 알바·인턴하는 대학생이 계약서에 사인하기 전 30초 안에 자신의 권리를 알 수 있게 합니다.

## 지원 계약서 종류

업로드한 계약서의 종류를 자동 분류한 뒤, 종류별 객관적 규칙을 적용합니다.

- **근로계약서** — 최저임금, 휴게시간, 주휴수당, 위약금, 필수 기재사항
- **주택 임대차계약서** — 계약기간, 수선의무, 보증금 반환, 위약금, 필수 기재사항
- **용역·프리랜서·도급 계약서** — 대금 조건, 저작권 양도, 위약금, 일방적 해지권, 무상 수정
- **기타 계약서** — 위 종류에 해당하지 않으면 일반적인 불공정 조항 관점에서 범용 검토

## 기술 스택

- **프론트엔드**: React + Vite + TypeScript + TailwindCSS
- **백엔드**: Node.js + Express + TypeScript
- **LLM/OCR**: Google Gemini API (멀티모달 — 이미지 직접 입력)

## 폴더 구조

```
.
├── client/        # React 프론트엔드
├── server/        # Express 백엔드
└── package.json   # 루트 (concurrently로 동시 실행)
```

## 실행 방법

### 1. 의존성 설치

```bash
npm run install:all
```

### 2. 환경 변수 설정

`server/.env.example`를 복사해 `server/.env`를 만들고 Gemini API 키를 입력합니다.

```bash
cp server/.env.example server/.env
```

```
GEMINI_API_KEY=여기에_API_키_입력
PORT=4000
```

API 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

- 클라이언트: http://localhost:5173
- 서버: http://localhost:4000

## API 명세

### POST /api/analyze

계약서 이미지를 분석합니다.

- **요청**: `multipart/form-data`, 필드명 `image` (jpg/png/jpeg, 최대 10MB)
- **응답**: JSON (위험도, 위험 점수, 조항별 분석 결과)

## MVP 원칙

- DB 없음 (모든 검증 규칙은 프롬프트에 하드코딩)
- 회원가입 없음 (세션 메모리만)
- 핵심 기능 1개: 사진 업로드 → AI 검토 결과 표시
