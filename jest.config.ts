import { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // 指向 Next.js 應用的路徑
  dir: './',
});

// 自定義 Jest 配置
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
};

// 創建並導出 Jest 配置
export default createJestConfig(config);