/**
 * 數據庫遷移執行腳本
 * 
 * 此腳本執行以下步驟：
 * 1. 運行SQL遷移，創建新表和新欄位
 * 2. 運行數據遷移，將JSON數據遷移到新表結構
 */

import { migrateProfileDataToNormalizedTables } from './db/migrations/schema_normalization';
import { db } from './db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('========================================');
    console.log('開始數據庫規範化遷移');
    console.log('========================================');
    
    // 步驟1: 執行SQL遷移
    console.log('\n[步驟1] 執行SQL遷移，創建新表和新欄位');
    const sqlMigrationPath = path.join(__dirname, 'db', 'migrations', '0003_normalization.sql');
    const sqlMigration = fs.readFileSync(sqlMigrationPath, 'utf8');
    
    // 按分號分割SQL語句並執行
    const sqlStatements = sqlMigration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const stmt of sqlStatements) {
      try {
        await db.execute(stmt + ';');
        console.log(`SQL執行成功: ${stmt.substring(0, 50)}...`);
      } catch (err) {
        console.error(`SQL執行失敗: ${stmt}`);
        console.error(err);
        // 繼續執行其他語句，不中止整個遷移
      }
    }
    
    console.log('SQL遷移完成！');
    
    // 步驟2: 執行數據遷移
    console.log('\n[步驟2] 執行數據遷移，將JSON數據遷移到新表結構');
    await migrateProfileDataToNormalizedTables();
    
    console.log('\n========================================');
    console.log('數據庫規範化遷移完成！');
    console.log('========================================');
    
    console.log('\n後續步驟：');
    console.log('1. 檢查數據遷移結果是否符合預期');
    console.log('2. 若一切正常，可取消註釋 0003_normalization.sql 中刪除 profile_data 欄位的語句，並重新運行此遷移');
    
  } catch (error) {
    console.error('遷移過程中發生錯誤:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// 執行遷移
runMigration(); 