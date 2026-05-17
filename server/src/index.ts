import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO(2단계): POST /api/analyze 라우트 연결

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
});
