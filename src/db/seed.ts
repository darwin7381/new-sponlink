import { db } from './index';
import { users, userProfiles, userSettings } from './schema';
import { events } from './schema/events';
import { savedEvents } from './schema/savedEvents';
import { followedEvents } from './schema/followedEvents';
import { USER_ROLES } from '@/lib/types/users';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 開始填充數據...');

  // 為系統帳號創建固定UUID (確保多次運行seed生成相同ID)
  const ORGANIZER_UUID = '7f9e15a5-d7c1-4b8c-9db0-4ac3f0f3d0b3';
  const SPONSOR_UUID = '3e8d9176-d5b2-4e92-a20f-2f39f77d0bb9';
  
  // 創建測試用戶
  const testUsers = [
    {
      id: ORGANIZER_UUID,
      email: 'organizer@example.com',
      name: '組織者用戶',
      role: USER_ROLES.ORGANIZER,
      preferred_language: 'zh-TW',
      activity_id: 'default',
    },
    {
      id: SPONSOR_UUID,
      email: 'sponsor@example.com',
      name: '贊助商用戶',
      role: USER_ROLES.SPONSOR,
      preferred_language: 'zh-TW',
      activity_id: 'default',
    }
  ];

  // 插入用戶
  for (const user of testUsers) {
    await db.insert(users).values(user).onConflictDoUpdate({
      target: users.id,
      set: user,
    });
  }

  // 創建用戶設置
  for (const user of testUsers) {
    await db.insert(userSettings).values({
      user_id: user.id,
      email_notifications: true,
      browser_notifications: true,
      in_app_notifications: true,
      activity_id: user.activity_id,
    }).onConflictDoUpdate({
      target: userSettings.user_id,
      set: {
        email_notifications: true,
        browser_notifications: true,
        in_app_notifications: true,
      },
    });
  }

  // 創建用戶資料
  await db.insert(userProfiles).values({
    user_id: ORGANIZER_UUID,
    bio: '擁有超過10年經驗的活動組織者',
    contact_info: 'organizer@example.com',
    activity_id: 'default',
  }).onConflictDoUpdate({
    target: userProfiles.user_id,
    set: {
      bio: '擁有超過10年經驗的活動組織者',
      contact_info: 'organizer@example.com',
    },
  });

  await db.insert(userProfiles).values({
    user_id: SPONSOR_UUID,
    bio: '全球科技公司，支持創新活動',
    contact_info: 'sponsor@example.com',
    activity_id: 'default',
  }).onConflictDoUpdate({
    target: userProfiles.user_id,
    set: {
      bio: '全球科技公司，支持創新活動',
      contact_info: 'sponsor@example.com',
    },
  });

  // 創建測試活動 (使用UUID作為ID)
  const EVENT_UUID_1 = 'e5b6a676-a30f-4e95-b6a1-d23deeac7d40';
  
  const testEvents = [
    {
      id: EVENT_UUID_1,
      title: 'ETH Global 台北',
      description: '全球最大以太坊開發者聚會，在台北舉行的盛大活動。',
      image_url: 'https://example.com/eth-taipei.jpg',
      start_date: new Date('2023-03-15'),
      end_date: new Date('2023-03-17'),
      location: '台北南港展覽館',
      status: 'published',
      is_public: true,
      owner_id: ORGANIZER_UUID,
      owner_type: 'USER',
      activity_id: 'default',
      created_at: new Date(),
      updated_at: new Date()
    },
    // 更多測試活動...
  ];

  // 插入活動
  for (const event of testEvents) {
    await db.insert(events).values(event).onConflictDoUpdate({
      target: events.id,
      set: event,
    });
  }

  // 創建收藏關係
  const testSavedEvents = [
    {
      user_id: ORGANIZER_UUID,
      event_id: EVENT_UUID_1,
      metadata: JSON.stringify({
        title: 'ETH Global 台北',
        thumbnail: 'https://example.com/eth-taipei.jpg',
        date: '2023-03-15',
      }),
      activity_id: 'default',
    }
  ];

  // 插入收藏關係
  for (const savedEvent of testSavedEvents) {
    await db.insert(savedEvents).values(savedEvent).onConflictDoUpdate({
      target: [savedEvents.user_id, savedEvents.event_id],
      set: savedEvent,
    });
  }

  // 創建關注關係
  const testFollowedEvents = [
    {
      user_id: ORGANIZER_UUID,
      event_id: EVENT_UUID_1,
      notification_settings: JSON.stringify({
        frequency: 'immediately',
        channels: {
          email: true,
          browser: true,
          in_app: true,
        },
      }),
      activity_id: 'default',
    }
  ];

  // 插入關注關係
  for (const followedEvent of testFollowedEvents) {
    await db.insert(followedEvents).values(followedEvent).onConflictDoUpdate({
      target: [followedEvents.user_id, followedEvents.event_id],
      set: followedEvent,
    });
  }

  console.log('✅ 數據填充完成！');
  console.log(`組織者UUID: ${ORGANIZER_UUID}`);
  console.log(`贊助商UUID: ${SPONSOR_UUID}`);
}

// 執行種子腳本
seed()
  .catch(e => {
    console.error('❌ 填充數據時出錯:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  }); 