# Cloudflare R2 圖片上傳與 CDN 優化實現指南

## 概述

本文檔詳細說明如何使用 Cloudflare R2 存儲服務實現圖片上傳、存儲和優化分發功能。通過 Cloudflare CDN，我們能夠實現全球範圍內的快速圖片訪問，並利用多種優化策略提高性能和用戶體驗。

## 目錄

1. [系統架構](#系統架構)
2. [檔案結構](#檔案結構)
3. [實現步驟](#實現步驟)
4. [關鍵代碼說明](#關鍵代碼說明)
5. [環境變量配置](#環境變量配置)
6. [Cloudflare 設定指南](#cloudflare-設定指南)
7. [效能優化策略](#效能優化策略)
8. [使用指南](#使用指南)
9. [性能驗證方法](#性能驗證方法)
10. [注意事項與限制](#注意事項與限制)

## 系統架構

系統採用以下架構來實現圖片上傳與優化分發：

```
[前端組件] → [Next.js API 路由] → [Cloudflare R2 存儲] → [Cloudflare CDN] → [用戶瀏覽器]
```

- **前端組件**: 提供上傳介面和優化圖片顯示
- **API 路由**: 處理上傳請求和圖片處理
- **R2 存儲**: 安全存儲圖片文件
- **Cloudflare CDN**: 全球分發和快取圖片
- **用戶瀏覽器**: 接收優化後的圖片並顯示

## 檔案結構

```
project/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── image-upload.tsx             # 基本圖片上傳按鈕組件
│   │       ├── image-upload-dropzone.tsx    # 高級拖放上傳組件
│   │       └── optimized-image.tsx          # 優化圖片顯示組件
│   ├── services/
│   │   └── r2Service.ts                     # Cloudflare R2 服務
│   └── app/
│       ├── api/
│       │   ├── upload/
│       │   │   └── route.ts                 # 上傳 API 路由
│       │   └── image/
│       │       └── [...path]/
│       │           └── route.ts             # 圖片處理與優化 API
│       └── image-upload-example/
│           └── page.tsx                     # 示例頁面
├── .env.local                              # 環境變量配置
└── docs/
    └── image-upload-r2-cdn-guide.md        # 本文檔
```

## 實現步驟

### 1. 設定 Cloudflare R2 存儲

1. 創建 Cloudflare 帳戶並啟用 R2 服務
2. 創建存儲桶（例如 `blockmeet`）
3. 設定 CORS 政策，允許從指定域名訪問
4. 創建 API 令牌，具有對象讀寫權限
5. 連接自定義域名 (img.blockmeet.io)

### 2. 安裝必要依賴

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp uuid
```

### 3. 實現 R2 服務層

創建 R2 服務層處理與 Cloudflare R2 的交互。

### 4. 實現上傳 API

創建處理文件上傳的 API 端點。

### 5. 實現圖片處理 API

創建動態調整圖片大小和格式的 API。

### 6. 創建前端組件

實現上傳組件和優化圖片顯示組件。

### 7. 配置 Cloudflare CDN

設定頁面規則優化圖片分發。

## 關鍵代碼說明

### R2 服務 (r2Service.ts)

```typescript
// 初始化 S3 客戶端
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

// 上傳文件到 R2
export async function uploadFileToR2(file: Buffer, fileName: string, contentType: string) {
  try {
    // 生成唯一文件名
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    
    // 設置 Cache-Control 頭部，圖片快取一年
    const cacheControl = 'public, max-age=31536000, immutable';
    
    // 上傳文件
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: file,
        ContentType: contentType,
        CacheControl: cacheControl,
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
```

### 圖片處理 API (api/image/[...path]/route.ts)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 獲取圖片路徑和查詢參數
    const fullPath = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : null;
    const height = searchParams.get('height') ? parseInt(searchParams.get('height')!) : null;
    const quality = searchParams.get('quality') ? parseInt(searchParams.get('quality')!) : 80;
    const format = searchParams.get('format') || null;

    // 獲取原始圖片
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fullPath,
      })
    );

    // 使用 sharp 處理圖片
    let sharpInstance = sharp(imageBuffer);
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
        // ... 其他格式
      }
    }
    
    // 設置快取控制
    const headers = new Headers();
    const cacheControl = 'public, max-age=2592000'; // 30 天快取
    headers.set('Cache-Control', cacheControl);
    
    return new NextResponse(processedImageBuffer, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('處理圖片失敗:', error);
    return NextResponse.json({ error: '處理圖片失敗' }, { status: 500 });
  }
}
```

### 優化圖片組件 (optimized-image.tsx)

```typescript
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  format = 'webp',
  quality = 80,
  // ... 其他屬性
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    // 檢查是否為 R2 圖片並構建 API URL
    if (src.startsWith('http')) {
      const urlParts = src.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const customDomain = process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN;
      if (customDomain && src.includes(customDomain)) {
        let apiUrl = `/api/image/${fileName}`;
        const params = new URLSearchParams();
        
        if (width) params.append('width', width.toString());
        if (height) params.append('height', height.toString());
        if (quality) params.append('quality', quality.toString());
        if (format) params.append('format', format);
        
        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }
        
        setImgSrc(apiUrl);
      } else {
        setImgSrc(src);
      }
    } else {
      setImgSrc(src);
    }
  }, [src, width, height, quality, format]);

  // ... 處理加載和錯誤情況

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 0}
      height={height || 0}
      // ... 其他屬性
    />
  );
}
```

## 環境變量配置

在 `.env.local` 文件中需要配置：

```
# Cloudflare R2 配置
R2_ACCESS_KEY_ID=您的訪問密鑰ID
R2_SECRET_ACCESS_KEY=您的秘密訪問密鑰
R2_BUCKET_NAME=blockmeet
R2_ACCOUNT_ID=您的Cloudflare帳戶ID
R2_ENDPOINT=https://您的Cloudflare帳戶ID.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_CUSTOM_DOMAIN=img.blockmeet.io
```

## Cloudflare 設定指南

### 設定自定義域名

1. 在 Cloudflare R2 儀表板選擇您的桶
2. 點擊「設定」標籤
3. 在「公共訪問」下設置為允許公共訪問
4. 點擊「連接域名」，輸入 `img.blockmeet.io`

### 設定頁面規則（最重要）

**注意：** Cloudflare Edge Cache TTL 目前最長可設置為一個月

1. 登錄 Cloudflare 儀表板，選擇您的域名
2. 點擊「規則」>「頁面規則」

#### 第一條規則：圖片域名全局快取

- URL 匹配模式: `img.blockmeet.io/*`
- 設定:
  - Browser Cache TTL: 1 year
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month (Cloudflare 限制)

#### 第二條規則：API 圖片處理快取

- URL 匹配模式: `blockmeet.io/api/image/*`
- 設定:
  - Browser Cache TTL: 4 days
  - Cache Level: Cache Everything
  - Edge Cache TTL: 4 days

### 設定 CORS 政策

確保 R2 存儲桶的 CORS 政策正確配置：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://blockmeet.io",
      "https://sponlink.blockmeet.io",
      "https://admin.blockmeet.io"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Authorization",
      "x-content-type-options",
      "x-requested-with"
    ],
    "MaxAgeSeconds": 3600,
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

## 效能優化策略

### 1. 快取策略

- **長期快取 + 唯一文件名**：通過生成唯一文件名實現有效的長期快取
- **分層快取**：
  - 原始圖片：一年快取
  - 處理後圖片：30天快取
  - API 處理：4天快取

### 2. 圖片優化

- **按需調整尺寸**：根據設備和需求提供最合適尺寸
- **格式轉換**：自動轉換為更高效的格式 (WebP, AVIF)
- **質量優化**：根據需求動態調整圖片質量

### 3. 分發優化

- **Cloudflare 全球 CDN**：利用全球節點網絡
- **預加載關鍵圖片**：對重要圖片設置 priority 屬性
- **漸進式加載**：先顯示佔位元素，圖片加載完成後顯示

## 使用指南

### 基本上傳組件

```jsx
import { ImageUpload } from '@/components/ui/image-upload';

function YourComponent() {
  const handleUploadComplete = (imageUrl) => {
    console.log('上傳完成，圖片URL:', imageUrl);
    // 處理上傳完成後的邏輯
  };

  return (
    <ImageUpload 
      onUploadComplete={handleUploadComplete}
      buttonText="上傳圖片"
      className="mb-4"
    />
  );
}
```

### 拖放上傳區域

```jsx
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';

function YourComponent() {
  const handleUploadComplete = (imageUrl) => {
    console.log('上傳完成，圖片URL:', imageUrl);
  };

  return (
    <ImageUploadDropzone 
      onUploadComplete={handleUploadComplete}
      dropzoneText="拖放圖片到此處上傳"
      buttonText="或點擊選擇圖片"
      showPreview={true}
    />
  );
}
```

### 優化圖片顯示

```jsx
import { OptimizedImage } from '@/components/ui/optimized-image';

function YourComponent({ imageUrl }) {
  return (
    <OptimizedImage
      src={imageUrl}
      alt="優化圖片"
      width={300}
      height={200}
      format="webp"
      quality={85}
      objectFit="cover"
      className="rounded-md"
    />
  );
}
```

## 性能驗證方法

### 1. 瀏覽器開發者工具檢查

1. 打開 Chrome DevTools > Network 標籤
2. 加載包含圖片的頁面
3. 檢查圖片請求：
   - Status: 200 OK 或 304 Not Modified
   - Size: 應該顯示 "(from disk cache)" 或 "(from memory cache)"
   - Response Headers:
     - Cache-Control: public, max-age=31536000, immutable
     - CF-Cache-Status: HIT (如果被 CDN 快取)

### 2. 快取命中率檢查

```bash
curl -I https://img.blockmeet.io/your-image-name.jpg
```

輸出應該包含：
```
CF-Cache-Status: HIT
Cache-Control: public, max-age=31536000, immutable
```

### 3. 性能測試工具

使用 [PageSpeed Insights](https://pagespeed.web.dev/) 或 [WebPageTest](https://www.webpagetest.org/) 檢查圖片加載時間和優化建議。

## 注意事項與限制

1. **Cloudflare Edge Cache 限制**：
   - Edge Cache TTL 目前最長只能設置為一個月
   - 超過此限制需通過定期手動更新或使用 Worker 腳本解決

2. **存儲限制**：
   - Cloudflare R2 免費層級提供 10GB 存儲和每日 10GB 流出流量
   - 超出限制將產生額外費用

3. **圖片處理注意事項**：
   - 過多的圖片處理請求可能會增加服務器負載
   - 調整圖片大小和質量時應平衡文件大小和視覺質量

4. **CORS 政策設定**：
   - 確保正確配置 CORS 策略，否則可能導致跨域問題
   - 不支持通配符域名 (*.blockmeet.io)，需要明確列出所有需要訪問的域名

5. **圖片格式兼容性**：
   - WebP 和 AVIF 格式在老舊瀏覽器可能不支持
   - 需要考慮提供適當的回退方案

---

**文檔作者**: 系統自動生成  
**最後更新**: 2025年4月5日  
**版本**: 1.0 