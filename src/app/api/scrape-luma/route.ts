import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * 處理抓取 Luma 頁面的 API 路由
 * 這在服務器端運行，可以避免前端的 CORS 限制
 * 
 * 使用 __NEXT_DATA__ 獲取結構化數據
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('https://lu.ma/')) {
    return NextResponse.json({ error: '無效的 Luma URL' }, { status: 400 });
  }

  try {
    // 從 Luma 網站抓取數據
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      throw new Error(`抓取 Luma 頁面失敗: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取 __NEXT_DATA__ 腳本內容
    const nextDataScript = $('#__NEXT_DATA__').html();
    
    if (!nextDataScript) {
      throw new Error('找不到 Luma 頁面的 __NEXT_DATA__ 數據');
    }
    
    // 解析 JSON 數據
    const nextData = JSON.parse(nextDataScript);
    
    // 提取事件數據
    const eventData = nextData.props.pageProps.initialData.data;
    const event = eventData.event;
    
    // 提取標題
    const title = event.name;
    
    // 直接使用 ISO 時間戳，不進行任何處理
    const startAt = event.start_at; 
    const endAt = event.end_at;
    const timezone = event.timezone || 'UTC';
    
    // 完全不處理時間數據，由前端處理
    
    // 提取地點信息，保持原始格式
    const geoAddressInfo = event.geo_address_info || {};
    
    // 確保獲取完整地址包含所有細節
    const fullAddress = [
      geoAddressInfo.full_address,
      geoAddressInfo.address,
      geoAddressInfo.description
    ].filter(Boolean).join(' ');
    
    // 構建完整的地點數據
    const locationData = {
      place_id: geoAddressInfo.place_id || '',
      name: geoAddressInfo.name || '',
      address: geoAddressInfo.address || '',
      full_address: fullAddress || '',
      city: geoAddressInfo.city || '',
      country: geoAddressInfo.country || '',
      description: geoAddressInfo.description || '',
      latitude: geoAddressInfo.latitude,
      longitude: geoAddressInfo.longitude,
      raw_geo_data: geoAddressInfo // 保留完整原始數據
    };
    
    // 提取描述
    let description = '';
    if (eventData.description_mirror) {
      // 構建描述字符串
      const descMirror = eventData.description_mirror;
      
      if (descMirror.content && Array.isArray(descMirror.content)) {
        // 處理所有類型的內容（段落、列表等）
        description = descMirror.content
          .map((item: { type: string; content?: unknown; attrs?: Record<string, unknown> }) => {
            // 處理段落
            if (item.type === 'paragraph' && item.content) {
              if (Array.isArray(item.content)) {
                return item.content
                  .map((textItem: { text?: string }) => textItem.text || '')
                  .join(' ');
              }
            }
            // 處理列表
            else if (item.type === 'bulletList' && item.content) {
              if (Array.isArray(item.content)) {
                return item.content
                  .map((listItem: { content?: Array<{ content?: Array<{ text?: string }> }> }) => {
                    if (listItem.content && Array.isArray(listItem.content)) {
                      const listItemContent = listItem.content[0];
                      if (listItemContent && listItemContent.content && Array.isArray(listItemContent.content)) {
                        return '• ' + listItemContent.content
                          .map((textItem: { text?: string }) => textItem.text || '')
                          .join(' ');
                      }
                    }
                    return '';
                  })
                  .filter((text: string) => text.length > 0)
                  .join('\n');
              }
            }
            // 處理標題
            else if (item.type.match(/heading/) && item.content) {
              if (Array.isArray(item.content)) {
                return '\n' + item.content
                  .map((textItem: { text?: string }) => textItem.text || '')
                  .join(' ') + '\n';
              }
            }
            return '';
          })
          .filter((text: string) => text.length > 0)
          .join('\n\n')
          .trim();
      }
    }
    
    // 提取封面圖片
    const coverImage = event.cover_url || '';
    
    // 提取標籤和分類
    let category = '其他';
    const tags: string[] = [];
    
    if (eventData.categories && eventData.categories.length > 0) {
      category = eventData.categories[0].name || '其他';
      // 提取分類名稱作為標籤
      eventData.categories.forEach((cat: { name?: string }) => {
        if (cat.name) {
          tags.push(cat.name);
        }
      });
    }
    
    // 提取主辦方作為標籤
    if (eventData.hosts && eventData.hosts.length > 0) {
      eventData.hosts.forEach((host: { name?: string }) => {
        if (host.name && !tags.includes(host.name)) {
          tags.push(host.name);
        }
      });
    }
    
    // 從標題提取關鍵詞作為標籤
    const keywordPatterns = [
      /workshop/i, /conference/i, /meetup/i, /hackathon/i, 
      /webinar/i, /summit/i, /forum/i, /seminar/i,
      /crypto/i, /blockchain/i, /web3/i, /nft/i,
      /ethereum/i, /bitcoin/i, /defi/i, /dao/i
    ];
    
    keywordPatterns.forEach(pattern => {
      if (pattern.test(title) && !tags.includes(pattern.source.replace(/[i\/]/g, ''))) {
        tags.push(pattern.source.replace(/[i\/]/g, ''));
      }
    });
    
    // 如果有城市，添加為標籤
    if (locationData.city && !tags.includes(locationData.city)) {
      tags.push(locationData.city);
    }
    
    // 返回結構化數據
    return NextResponse.json({
      success: true,
      eventData: {
        title,
        description,
        coverImage,
        // 僅提供原始時間戳，不做任何加工
        startAt,
        endAt,
        timezone,
        // 提供完整地點數據
        location: locationData,
        category,
        tags: tags.slice(0, 10), // 最多保留10個標籤
      },
      // 提供完整的原始資料，方便前端處理
      rawData: {
        event: event,
        descriptionMirror: eventData.description_mirror,
        geoAddressInfo: geoAddressInfo
      }
    });
  } catch (error) {
    console.error('抓取 Luma 事件錯誤:', error);
    return NextResponse.json({ error: '抓取 Luma 頁面失敗', details: (error as Error).message }, { status: 500 });
  }
} 