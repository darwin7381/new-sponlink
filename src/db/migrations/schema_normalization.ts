import { db } from '../index';
import { userProfiles, userStatistics, organizationProfiles } from '../schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface ProfileData {
  userType?: 'organizer' | 'sponsor';
  avatar?: string;
  companyName?: string;
  logo?: string;
  description?: string;
  statistics?: {
    totalEvents?: number;
    upcomingEvents?: number;
    averageAttendees?: number;
    totalRevenue?: string;
  };
  analytics?: {
    totalSponsored?: number;
    activeSponsorship?: number;
    totalInvestment?: string;
    averageRoi?: string;
  };
}

/**
 * 數據庫正規化遷移：將JSON數據從profile_data遷移到適當的表
 */
export async function migrateProfileDataToNormalizedTables() {
  console.log('開始遷移 profile_data JSON 數據到規範化表結構...');

  try {
    // 1. 獲取所有用戶資料
    const profiles = await db.execute<{ user_id: string; profile_data: string; activity_id?: string }>(
      `SELECT user_id, profile_data, activity_id FROM user_profiles WHERE profile_data IS NOT NULL`
    );

    console.log(`找到 ${profiles.length} 條有 profile_data 的記錄`);

    // 2. 遍歷並遷移每個用戶的數據
    for (const profile of profiles) {
      const userId = profile.user_id;
      let profileData: ProfileData;

      try {
        // 嘗試解析JSON數據
        profileData = JSON.parse(profile.profile_data);
      } catch (err) {
        const error = err as Error;
        console.error(`無法解析用戶 ${userId} 的 profile_data: ${error.message}`);
        continue; // 跳過此用戶
      }

      // 如果成功解析數據，開始遷移
      try {
        // 3. 更新 userProfiles 表 - 只更新頭像，不再設置preferred_view
        await db.update(userProfiles)
          .set({
            avatar_url: profileData.avatar || null
          })
          .where(eq(userProfiles.user_id, userId));

        console.log(`已更新用戶 ${userId} 的基本資料`);

        // 4. 創建或更新 userStatistics 記錄
        const statistics = {
          user_id: userId,
          // 根據用戶類型判斷統計數據來源
          ...(profileData.statistics && {
            total_events: profileData.statistics.totalEvents || 0,
            upcoming_events: profileData.statistics.upcomingEvents || 0,
            average_attendees: profileData.statistics.averageAttendees || 0,
            total_revenue: profileData.statistics.totalRevenue || '$0',
          }),
          ...(profileData.analytics && {
            total_sponsored: profileData.analytics.totalSponsored || 0,
            active_sponsorships: profileData.analytics.activeSponsorship || 0,
            total_investment: profileData.analytics.totalInvestment || '$0',
            average_roi: profileData.analytics.averageRoi || '0%',
          })
        };

        // 使用upsert確保記錄存在
        await db.insert(userStatistics)
          .values(statistics)
          .onConflictDoUpdate({
            target: userStatistics.user_id,
            set: statistics
          });

        console.log(`已更新用戶 ${userId} 的統計數據`);

        // 5. 如果是贊助商用戶且有公司信息，創建組織資料
        if (profileData.userType === 'sponsor' && profileData.companyName) {
          const orgId = uuidv4();
          const orgProfile = {
            id: orgId,
            user_id: userId,
            name: profileData.companyName || '未命名組織',
            description: profileData.description || null,
            logo_url: profileData.logo || null,
            website: null,
            activity_id: profile.activity_id || 'default'
          };

          // 查詢是否已存在組織資料
          const existingOrgs = await db.execute<{ id: string }>(
            `SELECT id FROM organization_profiles WHERE user_id = $1`,
            [userId]
          );

          if (existingOrgs.length === 0) {
            // 創建新的組織資料
            await db.insert(organizationProfiles)
              .values(orgProfile);
            console.log(`已為用戶 ${userId} 創建組織資料`);
          } else {
            const existingOrgId = existingOrgs[0].id;
            // 更新現有組織資料
            await db.update(organizationProfiles)
              .set({
                name: orgProfile.name,
                description: orgProfile.description,
                logo_url: orgProfile.logo_url
              })
              .where(eq(organizationProfiles.id, existingOrgId));
            console.log(`已更新用戶 ${userId} 的組織資料`);
          }
        }

      } catch (err) {
        const error = err as Error;
        console.error(`遷移用戶 ${userId} 數據時出錯: ${error.message}`);
      }
    }

    console.log('數據遷移完成!');
  } catch (err) {
    const error = err as Error;
    console.error('數據遷移失敗:', error);
    throw error;
  }
}

// 執行此文件時運行遷移
if (require.main === module) {
  migrateProfileDataToNormalizedTables()
    .then(() => {
      console.log('✅ JSON 數據已成功遷移到規範化表結構');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 遷移過程中發生錯誤:', error);
      process.exit(1);
    });
} 