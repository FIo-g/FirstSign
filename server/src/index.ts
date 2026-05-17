import 'dotenv/config';
import app from './app';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[server] 경고: GEMINI_API_KEY가 설정되지 않았습니다. server/.env를 확인하세요.');
  }
});
