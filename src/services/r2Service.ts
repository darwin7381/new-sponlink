import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// 初始化 S3 客戶端 (R2 兼容 S3 API)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.R2_BUCKET_NAME || '';

/**
 * 上傳文件到 Cloudflare R2
 */
export async function uploadFileToR2(file: Buffer, fileName: string, contentType: string) {
  try {
    // 生成唯一文件名
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    
    // 設置 Cache-Control 頭部，圖片快取 1 年
    const cacheControl = 'public, max-age=31536000, immutable';
    
    // 決定是否允許壓縮
    const contentEncoding = shouldCompressFile(contentType) ? 'gzip' : undefined;

    // 上傳文件
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file,
        ContentType: contentType,
        CacheControl: cacheControl,
        ContentEncoding: contentEncoding,
        Metadata: {
          'original-filename': encodeURIComponent(fileName),
          'upload-date': new Date().toISOString(),
        },
      })
    );

    // 返回文件的公共URL
    const customDomain = process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN;
    const fileUrl = customDomain
      ? `https://${customDomain}/${uniqueFileName}`
      : `${process.env.R2_ENDPOINT}/${uniqueFileName}`;

    return {
      url: fileUrl,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error('上傳文件到 R2 失敗:', error);
    throw error;
  }
}

/**
 * 從 R2 刪除文件
 */
export async function deleteFileFromR2(fileName: string) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      })
    );

    return { success: true };
  } catch (error) {
    console.error('從 R2 刪除文件失敗:', error);
    throw error;
  }
}

/**
 * 根據文件類型判斷是否需要壓縮
 */
function shouldCompressFile(contentType: string): boolean {
  // 圖片格式如 JPEG, PNG 通常已經壓縮，不需要進一步壓縮
  const noCompressTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  return !noCompressTypes.includes(contentType);
}

export default {
  uploadFileToR2,
  deleteFileFromR2,
}; 