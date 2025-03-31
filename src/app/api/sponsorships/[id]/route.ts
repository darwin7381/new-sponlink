import { NextRequest, NextResponse } from 'next/server';
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 正確處理 Next.js 15.2.3 中的路由參數
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    console.log(`[API] 查詢贊助計劃, ID: ${id}`);
    
    // 根據ID查找贊助計劃，首先嘗試完全匹配
    let sponsorshipPlan = mockSponsorshipPlans.find(plan => plan.id === id);
    
    // 如果找不到，嘗試從不同格式的ID中找（例如，sp8-1、sp1、plan-1）
    if (!sponsorshipPlan) {
      console.log(`[API] 未找到完全匹配的贊助計劃，嘗試匹配子字符串 ${id}`);
      
      // 如果包含連字符，拆分檢查前綴
      const idParts = id.split('-');
      if (idParts.length > 1) {
        const idPrefix = idParts[0];
        console.log(`[API] 嘗試匹配 ID 前綴 ${idPrefix}`);
        
        // 檢查是否有匹配此前綴的計劃
        const matchingPlans = mockSponsorshipPlans.filter(plan => 
          plan.id.startsWith(idPrefix) || plan.id === id
        );
        
        if (matchingPlans.length > 0) {
          console.log(`[API] 找到 ${matchingPlans.length} 個匹配前綴的計劃`);
          sponsorshipPlan = matchingPlans[0]; // 使用第一個匹配項
        }
      }
    }
    
    // 如果仍然找不到，嘗試查找任何可能的部分匹配
    if (!sponsorshipPlan) {
      console.log(`[API] 仍未找到匹配，嘗試部分匹配`);
      
      // 檢查 ID 是否包含在任何計劃的 ID 中，或任何計劃的 ID 是否包含在請求的 ID 中
      const possibleMatches = mockSponsorshipPlans.filter(plan => 
        plan.id.includes(id) || id.includes(plan.id)
      );
      
      if (possibleMatches.length > 0) {
        console.log(`[API] 找到 ${possibleMatches.length} 個部分匹配的計劃`);
        sponsorshipPlan = possibleMatches[0]; // 使用第一個匹配項
      }
    }
    
    // 輸出當前可用的所有贊助計劃列表，以便調試
    console.log(`[API] 可用贊助計劃列表: ${mockSponsorshipPlans.map(p => p.id).join(', ')}`);
    
    if (!sponsorshipPlan) {
      console.error(`[API] 找不到贊助計劃 ID: ${id}`);
      return NextResponse.json(
        { error: '找不到贊助計劃', requestedId: id },
        { status: 404 }
      );
    }
    
    console.log(`[API] 成功找到贊助計劃: ${sponsorshipPlan.id}`);
    return NextResponse.json(sponsorshipPlan);
  } catch (error) {
    console.error('[API] 獲取贊助計劃時出錯:', error);
    return NextResponse.json(
      { error: '獲取贊助計劃時出錯', message: (error as Error).message },
      { status: 500 }
    );
  }
} 