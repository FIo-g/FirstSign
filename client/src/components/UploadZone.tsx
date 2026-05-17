import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB (선택 가능한 원본 크기 한도)
const MAX_DIMENSION = 2000; // 압축 후 가장 긴 변의 최대 픽셀

/**
 * 업로드 전 이미지를 축소·재인코딩한다.
 * 서버리스 환경의 요청 본문 한도(약 4.5MB)를 넘지 않게 하고,
 * AI 분석 비용·지연도 줄인다. 실패하면 원본을 그대로 반환한다.
 */
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    const longest = Math.max(width, height);
    if (longest > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / longest;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

function UploadZone({ onFile, disabled = false }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function validateAndSend(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('jpg, png 이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('파일 크기가 너무 큽니다. (최대 10MB)');
      return;
    }
    setError(null);
    onFile(await compressImage(file));
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSend(file);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSend(file);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
            : dragging
              ? 'cursor-pointer border-blue-400 bg-blue-50'
              : 'cursor-pointer border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50'
        }`}
      >
        <p className="text-lg font-semibold text-slate-700">
          계약서 사진을 올려주세요
        </p>
        <p className="mt-1 text-sm text-slate-500">
          이미지를 드래그하거나 클릭해서 선택하세요 (jpg, png · 최대 10MB)
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            파일 선택
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            사진 촬영
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default UploadZone;
