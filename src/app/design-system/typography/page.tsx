"use client";

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

function FontSample({ name, description, className, sampleText = "中文排版示範文字 Aa Bb Cc 123" }: {
  name: string;
  description: string;
  className: string;
  sampleText?: string;
}) {
  const copyCSS = () => {
    navigator.clipboard.writeText(className);
    toast.success('已複製 CSS 類', { description: className });
  };

  return (
    <div className="mb-8 p-6 border border-border rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button 
          onClick={copyCSS}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="複製 CSS 類名"
        >
          <Copy size={18} />
        </button>
      </div>
      <div className="mt-4">
        <p className={className}>{sampleText}</p>
      </div>
      <div className="mt-4">
        <code className="px-2 py-1 bg-muted rounded text-sm">{className}</code>
      </div>
    </div>
  );
}

function TextSample({ 
  description, 
  className, 
  sample = "這是一個文字範例" 
}: {
  title?: string;
  description: string;
  className: string;
  sample?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-4 mb-2">
        <span className={`${className} truncate max-w-[600px]`}>{sample}</span>
        <code className="text-xs bg-muted px-2 py-1 rounded">{className}</code>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ResponsiveTypographyGuide() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">響應式排版</h2>
      <p className="mb-4">
        SponLink 的排版系統是響應式的，使用 Tailwind CSS 的響應式前綴 (sm:, md:, lg:, xl:, 2xl:) 來針對不同螢幕尺寸調整文字大小。
      </p>
      
      <div className="p-4 bg-muted rounded-lg mb-6">
        <p className="mb-2 font-medium">範例:</p>
        <code className="text-sm">
          &lt;h1 className=&quot;text-2xl md:text-3xl lg:text-4xl font-bold&quot;&gt;響應式標題&lt;/h1&gt;
        </code>
      </div>
      
      <p>在小螢幕上標題將使用 text-2xl (1.5rem)，在中型螢幕上使用 text-3xl (1.875rem)，在大螢幕上使用 text-4xl (2.25rem)。</p>
    </div>
  );
}

export default function TypographyPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">文字排版</h1>
        <p className="text-lg text-muted-foreground mt-2">
          SponLink 文字排版指南，確保整個平台上的文字呈現一致且易於閱讀。
        </p>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">字體家族</h2>
        <p className="mb-6">SponLink 使用系統原生字體堆疊，確保最佳性能和在所有設備上的一致性。</p>
        
        <FontSample 
          name="主要字體" 
          description="用於大多數界面文字，包括段落、標籤等" 
          className="font-sans"
        />
        
        <FontSample 
          name="等寬字體" 
          description="用於程式碼塊、代碼等" 
          className="font-mono"
          sampleText="const message = 'Hello, SponLink!'; // 程式碼示範"
        />
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">文字大小</h2>
        <p className="mb-6">使用一致的文字大小階層來創建視覺層次感。</p>
        
        <div className="space-y-6">
          <TextSample 
            title="text-xs" 
            description="超小字體 (0.75rem / 12px) - 用於次要信息、註腳" 
            className="text-xs"
          />
          
          <TextSample 
            title="text-sm" 
            description="小字體 (0.875rem / 14px) - 用於輔助文字、說明" 
            className="text-sm"
          />
          
          <TextSample 
            title="text-base" 
            description="基本字體 (1rem / 16px) - 用於正文內容" 
            className="text-base"
          />
          
          <TextSample 
            title="text-lg" 
            description="大字體 (1.125rem / 18px) - 用於重點內容" 
            className="text-lg"
          />
          
          <TextSample 
            title="text-xl" 
            description="特大字體 (1.25rem / 20px) - 用於小標題" 
            className="text-xl"
          />
          
          <TextSample 
            title="text-2xl" 
            description="2倍大字體 (1.5rem / 24px) - 用於二級標題" 
            className="text-2xl"
          />
          
          <TextSample 
            title="text-3xl" 
            description="3倍大字體 (1.875rem / 30px) - 用於一級標題" 
            className="text-3xl"
          />
          
          <TextSample 
            title="text-4xl" 
            description="4倍大字體 (2.25rem / 36px) - 用於頁面標題" 
            className="text-4xl"
          />
          
          <TextSample 
            title="text-5xl" 
            description="5倍大字體 (3rem / 48px) - 用於大型標語" 
            className="text-5xl"
          />
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">字重</h2>
        <p className="mb-6">字重可以增強視覺層次並強調重要內容。</p>
        
        <div className="space-y-6">
          <TextSample 
            title="font-light" 
            description="輕量字重 (300) - 用於大型展示文字" 
            className="font-light text-xl"
          />
          
          <TextSample 
            title="font-normal" 
            description="正常字重 (400) - 用於大多數正文內容" 
            className="font-normal text-xl"
          />
          
          <TextSample 
            title="font-medium" 
            description="中等字重 (500) - 用於稍微強調" 
            className="font-medium text-xl"
          />
          
          <TextSample 
            title="font-semibold" 
            description="半粗字重 (600) - 用於按鈕和重要內容" 
            className="font-semibold text-xl"
          />
          
          <TextSample 
            title="font-bold" 
            description="粗體字重 (700) - 用於標題和強調" 
            className="font-bold text-xl"
          />
        </div>
      </section>
      
      <ResponsiveTypographyGuide />
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">行高</h2>
        <p className="mb-6">適當的行高可以提高文字的可讀性。</p>
        
        <div className="space-y-8">
          <div>
            <h3 className="font-medium mb-2">leading-none (行高 1)</h3>
            <p className="leading-none p-4 bg-muted rounded-lg">
              這是一段使用極小行高的文字。這種設置對於標題或需要緊湊排版的地方很有用。
              但對於長段落來說可能會影響可讀性，因為行與行之間沒有足夠的空間。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">leading-tight (行高 1.25)</h3>
            <p className="leading-tight p-4 bg-muted rounded-lg">
              這是一段使用較緊湊行高的文字。這種設置在需要節省空間但又不想完全犧牲可讀性的情況下很有用。
              對於短段落或中型文字來說比較適合。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">leading-normal (行高 1.5)</h3>
            <p className="leading-normal p-4 bg-muted rounded-lg">
              這是一段使用標準行高的文字。這是大多數正文內容的理想設置，提供了良好的可讀性和適當的空間。
              大多數情況下，這應該是段落文字的默認選擇。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">leading-relaxed (行高 1.75)</h3>
            <p className="leading-relaxed p-4 bg-muted rounded-lg">
              這是一段使用寬鬆行高的文字。當需要提高可讀性，特別是在較長的段落中，這種設置非常有效。
              它為文字提供了充足的呼吸空間，減少視覺疲勞。
            </p>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">文字對齊</h2>
        <p className="mb-6">根據內容和設計需求選擇適當的文字對齊方式。</p>
        
        <div className="space-y-8">
          <div>
            <h3 className="font-medium mb-2">text-left (左對齊)</h3>
            <p className="text-left p-4 bg-muted rounded-lg">
              這是左對齊文字。這是西方語言和中文的默認設置，最適合大多數閱讀場景。
              左對齊創造了一個一致的起點，使讀者的眼睛可以輕鬆地找到每行的開始。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">text-center (居中對齊)</h3>
            <p className="text-center p-4 bg-muted rounded-lg">
              這是居中對齊文字。適用於標題、引用和短段落，可以創造一種正式或平衡的外觀。
              但不建議用於長段落，因為會使閱讀變得困難。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">text-right (右對齊)</h3>
            <p className="text-right p-4 bg-muted rounded-lg">
              這是右對齊文字。不常用於主要內容，但適合特定情況，如日期、時間標記，或在RTL語言中。
              也可用於創造特殊的設計效果或視覺對比。
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">text-justify (兩端對齊)</h3>
            <p className="text-justify p-4 bg-muted rounded-lg">
              這是兩端對齊文字。它創造了整齊的左右邊緣，但可能導致單詞間距不均。
              在某些正式文檔中可能有用，但在網頁上應謹慎使用，尤其是在狹窄的容器中。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 