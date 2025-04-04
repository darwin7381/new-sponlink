'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ImageUploadExample() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleUploadComplete = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">圖片上傳示例</h1>
      
      <Tabs defaultValue="basic" className="mb-6">
        <TabsList>
          <TabsTrigger value="basic">基礎上傳</TabsTrigger>
          <TabsTrigger value="advanced">高級上傳（拖放）</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>基礎上傳組件</CardTitle>
                <CardDescription>
                  使用 Cloudflare R2 存儲服務，支持 JPEG、PNG、GIF 和 WEBP 格式，最大 5MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onUploadComplete={handleUploadComplete}
                  buttonText="選擇圖片上傳"
                  className="mb-4"
                />
                
                <div className="text-sm mt-4">
                  <p>使用說明：</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>點擊按鈕選擇一張圖片</li>
                    <li>圖片將上傳到 Cloudflare R2 存儲服務</li>
                    <li>上傳成功後，圖片將顯示在右側</li>
                    <li>圖片將通過 img.blockmeet.io 自定義域名訪問</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>預覽上傳的圖片</CardTitle>
                <CardDescription>
                  上傳後的圖片將顯示在這裡
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedImageUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={uploadedImageUrl} 
                      alt="已上傳的圖片" 
                      className="max-w-full max-h-[300px] object-contain rounded-md border border-gray-200"
                    />
                    <p className="mt-4 text-sm break-all">{uploadedImageUrl}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] border border-dashed border-gray-200 rounded-md bg-gray-50">
                    <p className="text-gray-400">暫無上傳的圖片</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>高級上傳組件（拖放）</CardTitle>
                <CardDescription>
                  支持拖放上傳和圖片預覽功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadDropzone 
                  onUploadComplete={handleUploadComplete}
                  className="mb-4"
                  dropzoneText="拖放圖片到此處上傳"
                  buttonText="或點擊選擇圖片"
                  showPreview={true}
                />
                
                <div className="text-sm mt-4">
                  <p>高級功能：</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>支持拖放文件上傳</li>
                    <li>上傳前預覽圖片</li>
                    <li>顯示上傳進度條</li>
                    <li>文件類型和大小驗證</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>預覽上傳的圖片</CardTitle>
                <CardDescription>
                  上傳後的圖片將顯示在這裡
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedImageUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={uploadedImageUrl} 
                      alt="已上傳的圖片" 
                      className="max-w-full max-h-[300px] object-contain rounded-md border border-gray-200"
                    />
                    <p className="mt-4 text-sm break-all">{uploadedImageUrl}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] border border-dashed border-gray-200 rounded-md bg-gray-50">
                    <p className="text-gray-400">暫無上傳的圖片</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>實現說明</CardTitle>
            <CardDescription>
              使用 Cloudflare R2 和自定義域名 img.blockmeet.io 實現圖片上傳功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">技術實現</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>前端使用兩種組件處理圖片上傳：基礎按鈕組件和高級拖放組件</li>
              <li>通過 /api/upload API 端點處理圖片上傳請求</li>
              <li>在服務端使用 Cloudflare R2 SDK 將圖片上傳到 R2 存儲空間</li>
              <li>使用自定義域名 img.blockmeet.io 提供圖片訪問服務</li>
              <li>所有上傳的圖片都生成唯一文件名，確保不會發生衝突</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 