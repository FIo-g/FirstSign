// Vercel 서버리스 함수 진입점.
// Express 앱은 (req, res) 핸들러이므로 그대로 export하면 Vercel이 호출한다.
import app from '../server/src/app';

export default app;
