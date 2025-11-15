// 测试环境设置
// 模拟 DOM API 和全局对象

import { jest } from '@jest/globals';

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

global.sessionStorage = sessionStorageMock;

// 模拟地理位置 API
const geolocationMock = {
  getCurrentPosition: jest.fn((success, error, options) => {
    // 默认返回北京的位置
    success({
      coords: {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      },
      timestamp: Date.now()
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

global.navigator = {
  geolocation: geolocationMock,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  platform: 'Win32'
};

// 模拟 fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    clone: () => global.fetch()
  })
);

// 模拟 Notification API
global.Notification = class MockNotification {
  constructor(title, options) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
  
  static requestPermission() {
    return Promise.resolve('granted');
  }
  
  static get instances() {
    if (!this._instances) {
      this._instances = [];
    }
    return this._instances;
  }
  
  static clearInstances() {
    this._instances = [];
  }
  
  close() {
    this.closed = true;
  }
};

// 模拟 Web Storage API
class MockStorageEvent extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict);
    this.key = eventInitDict?.key || null;
    this.oldValue = eventInitDict?.oldValue || null;
    this.newValue = eventInitDict?.newValue || null;
    this.url = eventInitDict?.url || '';
    this.storageArea = eventInitDict?.storageArea || localStorage;
  }
}

global.StorageEvent = MockStorageEvent;

// 模拟 DOM 事件
global.DOMException = class MockDOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
};

// 模拟 URL API
global.URL = class MockURL {
  constructor(url, base) {
    this.href = url;
    this.protocol = 'https:';
    this.host = 'example.com';
    this.hostname = 'example.com';
    this.port = '';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
  
  static createObjectURL(blob) {
    return 'blob:https://example.com/test';
  }
  
  static revokeObjectURL(url) {
    // 空实现
  }
};

// 模拟 Blob API
global.Blob = class MockBlob {
  constructor(parts, options) {
    this.size = parts?.join('').length || 0;
    this.type = options?.type || '';
  }
};

// 模拟 File API
global.File = class MockFile extends Blob {
  constructor(parts, name, options) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified || Date.now();
  }
};

// 模拟 FileReader API
global.FileReader = class MockFileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.error = null;
  }
  
  readAsText(blob) {
    this.readyState = 2;
    this.result = 'file content';
    setTimeout(() => {
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  readAsDataURL(blob) {
    this.readyState = 2;
    this.result = 'data:text/plain;base64,ZmlsZSBjb250ZW50';
    setTimeout(() => {
      this.readyState = 2;
      if (this.onload) this.onload({ target: this });
    }, 0);
  }
  
  abort() {
    this.readyState = 0;
    if (this.onabort) this.onabort({ target: this });
  }
};

// 模拟 crypto API
global.crypto = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  randomUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// 模拟 performance API
global.performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// 模拟 matchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
});

// 模拟 IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  
  observe() {
    return this;
  }
  
  unobserve() {
    return this;
  }
  
  disconnect() {
    return this;
  }
  
  takeRecords() {
    return [];
  }
};

// 模拟 ResizeObserver
global.ResizeObserver = class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return this;
  }
  
  unobserve() {
    return this;
  }
  
  disconnect() {
    return this;
  }
};

// 模拟 CSS 支持检测
global.CSS = {
  supports: (property, value) => {
    return true;
  }
};

// 清除所有模拟
beforeEach(() => {
  // 清除 localStorage 模拟
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // 清除 fetch 模拟
  fetch.mockClear();
  
  // 清除 Notification 实例
  if (global.Notification.clearInstances) {
    global.Notification.clearInstances();
  }
  
  // 清除地理位置模拟
  geolocationMock.getCurrentPosition.mockClear();
  geolocationMock.watchPosition.mockClear();
  geolocationMock.clearWatch.mockClear();
});

// 全局测试工具
global.testUtils = {
  // 创建模拟事件
  createMockEvent: (type, options = {}) => {
    return new Event(type, options);
  },
  
  // 等待异步操作
  waitFor: (callback, options = {}) => {
    const { timeout = 1000, interval = 50 } = options;
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      check();
    });
  },
  
  // 模拟延迟
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 生成随机数据
  generateRandomData: (length, min = 0, max = 100) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  },
  
  // 模拟用户输入
  simulateUserInput: (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
};