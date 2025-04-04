import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// 初始化 S3 客戶端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';

// 使用字串URL直接處理而非動態路由參數
export async function GET(
  request: NextRequest
) {
  try {
    // 直接從 URL 路徑獲取圖片路徑
    const fullUrl = new URL(request.url);
    const pathParts = fullUrl.pathname.split('/');
    // 移除 /api/image/ 部分 (前3個元素)
    const imagePath = pathParts.slice(3).join('/');
    
    if (!imagePath) {
      return NextResponse.json({ error: '無效的圖片路徑' }, { status: 400 });
    }
    
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : null;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : null;
    const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : 80;
    const format = searchParams.get('format') || null;

    console.log('處理圖片請求:', { imagePath, width, height, quality, format });

    // 從 R2 獲取原始圖片
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: imagePath,
      })
    );

    if (!response.Body) {
      return NextResponse.json({ error: '圖片不存在' }, { status: 404 });
    }

    // 將 S3 響應轉換為 buffer
    const arrayBuffer = await response.Body.transformToByteArray();
    const imageBuffer = Buffer.from(arrayBuffer);

    // 如果沒有指定尺寸或格式轉換，直接返回圖片
    if (!width && !height && !format) {
      const headers = new Headers();
      
      // 設置內容類型
      if (response.ContentType) {
        headers.set('Content-Type', response.ContentType);
      }
      
      // 設置快取控制
      const cacheControl = response.CacheControl || 'public, max-age=31536000, immutable';
      headers.set('Cache-Control', cacheControl);
      
      // 設置 CDN 相關頭部
      headers.set('CDN-Cache-Control', cacheControl);
      headers.set('Cloudflare-CDN-Cache-Control', cacheControl);

      return new NextResponse(imageBuffer, {
        headers,
        status: 200,
      });
    }

    // 使用 sharp 處理圖片
    let sharpInstance = sharp(imageBuffer);

    // 調整大小
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width: width || undefined,
        height: height || undefined,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // 轉換格式
    if (format) {
      switch (format.toLowerCase()) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png();
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality });
          break;
      }
    }

    // 處理圖片並轉換為 buffer
    const processedImageBuffer = await sharpInstance.toBuffer();

    // 設置響應頭
    const headers = new Headers();
    
    // 設置內容類型
    if (format) {
      switch (format.toLowerCase()) {
        case 'webp':
          headers.set('Content-Type', 'image/webp');
          break;
        case 'jpeg':
        case 'jpg':
          headers.set('Content-Type', 'image/jpeg');
          break;
        case 'png':
          headers.set('Content-Type', 'image/png');
          break;
        case 'avif':
          headers.set('Content-Type', 'image/avif');
          break;
        default:
          if (response.ContentType) {
            headers.set('Content-Type', response.ContentType);
          }
      }
    } else if (response.ContentType) {
      headers.set('Content-Type', response.ContentType);
    }
    
    // 設置快取控制
    const cacheControl = 'public, max-age=2592000'; // 30 天快取
    headers.set('Cache-Control', cacheControl);
    
    // 設置 CDN 相關頭部
    headers.set('CDN-Cache-Control', cacheControl);
    headers.set('Cloudflare-CDN-Cache-Control', cacheControl);

    return new NextResponse(processedImageBuffer, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('獲取或處理圖片失敗:', error);
    return NextResponse.json(
      { error: '獲取或處理圖片失敗', details: (error as Error).message },
      { status: 500 }
    );
  }
} 