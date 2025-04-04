import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToR2 } from '@/services/r2Service';

export async function POST(req: NextRequest) {
  try {
    // 確保請求是 multipart/form-data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '沒有上傳文件' },
        { status: 400 }
      );
    }

    // 檢查文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件類型，僅支持 JPEG, PNG, GIF 和 WEBP' },
        { status: 400 }
      );
    }

    // 檢查文件大小 (限制為 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件過大，最大支持 5MB' },
        { status: 400 }
      );
    }

    // 獲取文件 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上傳到 Cloudflare R2
    const result = await uploadFileToR2(
      buffer,
      file.name,
      file.type
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('文件上傳失敗:', error);
    return NextResponse.json(
      { error: '文件上傳失敗', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 設置上傳大小限制 (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 