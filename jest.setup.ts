// 導入 Jest DOM 擴展
import '@testing-library/jest-dom';

// 模擬 localStorage
class LocalStorageMock implements Storage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // 必要的索引簽名，允許Storage接口的動態屬性訪問
  private store: Record<string, string>;
  length: number;

  constructor() {
    this.store = {};
    this.length = 0;
  }

  clear(): void {
    this.store = {};
    this.length = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// 設置全局 localStorage 模擬
global.localStorage = new LocalStorageMock();

// 模擬 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 已棄用
    removeListener: jest.fn(), // 已棄用
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 