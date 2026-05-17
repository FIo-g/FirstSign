import { Router } from 'express';
import multer, { MulterError } from 'multer';
import { analyzeContract, AnalysisRejectedError } from '../services/gemini';
import type { AnalyzeResponse } from '../types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다. (jpg, png, jpeg만 가능)'));
    }
  },
});

const router = Router();

router.post('/analyze', (req, res) => {
  upload.single('image')(req, res, async (uploadErr: unknown) => {
    if (uploadErr) {
      const tooLarge = uploadErr instanceof MulterError && uploadErr.code === 'LIMIT_FILE_SIZE';
      const body: AnalyzeResponse = {
        success: false,
        error: tooLarge
          ? '파일 크기가 너무 큽니다. (최대 10MB)'
          : uploadErr instanceof Error
            ? uploadErr.message
            : '파일 업로드에 실패했습니다.',
      };
      res.status(tooLarge ? 413 : 400).json(body);
      return;
    }

    if (!req.file) {
      const body: AnalyzeResponse = {
        success: false,
        error: '이미지 파일이 필요합니다. (필드명: image)',
      };
      res.status(400).json(body);
      return;
    }

    try {
      const data = await analyzeContract(req.file.buffer, req.file.mimetype);
      const body: AnalyzeResponse = { success: true, data };
      res.json(body);
    } catch (err) {
      if (err instanceof AnalysisRejectedError) {
        const body: AnalyzeResponse = { success: false, error: err.message };
        res.status(422).json(body);
        return;
      }
      console.error('[analyze] 분석 실패:', err);
      const body: AnalyzeResponse = {
        success: false,
        error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      };
      res.status(500).json(body);
    }
  });
});

export default router;
