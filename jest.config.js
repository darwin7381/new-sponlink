const nextJest = require('next/jest.js');

const createJestConfig = nextJest({
  // 指向 Next.js 應用的路徑
  dir: './',
});

// 自定義 Jest 配置
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// 創建並導出 Jest 配置
module.exports = createJestConfig(customJestConfig); 