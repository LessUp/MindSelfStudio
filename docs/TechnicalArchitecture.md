# MindSelf Studio 技术架构设计文档

## 1. 架构概述

### 1.1 架构原则
- **模块化设计**：采用组件化架构，确保各功能模块独立开发和测试
- **渐进增强**：在保持现有功能的基础上，平滑添加新功能
- **性能优先**：优化加载速度和运行效率，确保流畅用户体验
- **数据安全**：本地存储加密，保护用户隐私

### 1.2 技术栈选型

#### 前端技术栈
```
核心框架：原生JavaScript (ES2020+)
样式框架：Tailwind CSS (CDN版本)
图表库：Chart.js (轻量级，易于集成)
数据可视化：D3.js (高级定制需求)
状态管理：原生JavaScript + LocalStorage
构建工具：Vite (现代化构建)
测试框架：Jest + Testing Library
```

#### 架构决策分析
| 技术方案 | 优势 | 劣势 | 适用性评分 |
|---------|------|------|-----------|
| 原生JS + Tailwind | 轻量级、无依赖、加载快 | 需要手动管理复杂度 | ⭐⭐⭐⭐⭐ |
| React + 组件库 | 生态丰富、开发效率高 | 包体积大、学习成本高 | ⭐⭐⭐ |
| Vue 3 + Vite | 渐进式、易上手 | 需要构建步骤 | ⭐⭐⭐⭐ |

**决策结论：** 基于项目轻量级和性能优先的原则，选择原生JavaScript + Tailwind CSS方案

## 2. 系统架构设计

### 2.1 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    MindSelf Studio                         │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (展示层)                                │
│  ┌─────────────┬──────────────┬──────────────────────┐    │
│  │   量表界面   │   EMA界面     │    数据可视化界面     │    │
│  └─────────────┴──────────────┴──────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer (业务逻辑层)                           │
│  ┌─────────────┬──────────────┬──────────────┬──────────┐   │
│  │ 量表引擎    │  EMA引擎     │ 数据分析引擎  │ 推荐引擎  │   │
│  └─────────────┴──────────────┴──────────────┴──────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (数据层)                                        │
│  ┌──────────────┬──────────────┬────────────────────┐       │
│  │ LocalStorage │  IndexDB     │  Cache Storage     │       │
│  └──────────────┴──────────────┴────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 模块架构设计

#### 2.2.1 量表引擎模块
```javascript
class AssessmentEngine {
  constructor(config) {
    this.scales = config.scales;
    this.scoringAlgorithms = config.algorithms;
    this.validationRules = config.rules;
  }
  
  // 量表渲染
  renderScale(scaleId) { /* 实现 */ }
  
  // 评分计算
  calculateScore(answers, scaleId) { /* 实现 */ }
  
  // 结果解释
  interpretResults(score, scaleId) { /* 实现 */ }
  
  // 数据验证
  validateResponse(response, scaleId) { /* 实现 */ }
}
```

#### 2.2.2 EMA引擎模块
```javascript
class EMAEngine {
  constructor(config) {
    this.schedule = config.schedule;
    this.notificationService = config.notificationService;
    this.dataCollector = config.dataCollector;
  }
  
  // 智能调度
  scheduleAssessments(userPattern) { /* 实现 */ }
  
  // 通知管理
  sendNotification(type, content) { /* 实现 */ }
  
  // 数据收集
  collectMomentaryData(data) { /* 实现 */ }
  
  // 响应分析
  analyzeResponseRate() { /* 实现 */ }
}
```

#### 2.2.3 数据可视化引擎
```javascript
class VisualizationEngine {
  constructor(config) {
    this.chartTypes = config.chartTypes;
    this.colorScheme = config.colorScheme;
    this.interactionConfig = config.interactions;
  }
  
  // 趋势图渲染
  renderTrendChart(data, options) { /* 实现 */ }
  
  // 仪表板生成
  generateDashboard(metrics) { /* 实现 */ }
  
  // 交互处理
  handleInteraction(event) { /* 实现 */ }
  
  // 导出功能
  exportChart(format, quality) { /* 实现 */ }
}
```

## 3. 数据架构设计

### 3.1 数据模型设计

#### 3.1.1 量表数据模型
```javascript
const ScaleSchema = {
  id: 'string',           // 量表唯一标识
  name: 'string',         // 量表名称
  description: 'string',  // 量表描述
  questions: [{
    id: 'number',         // 问题编号
    text: 'string',       // 问题文本
    category: 'string',   // 所属维度
    reverse: 'boolean'    // 是否反向计分
  }],
  options: ['string'],    // 选项文本
  scoring: {
    method: 'string',     // 计分方法
    ranges: [{           // 分数区间
      min: 'number',
      max: 'number',
      level: 'string',
      description: 'string'
    }]
  }
};
```

#### 3.1.2 EMA数据模型
```javascript
const EMADataSchema = {
  timestamp: 'datetime',  // 记录时间
  userId: 'string',      // 用户标识
  emotion: {
    type: 'string',      // 情绪类型
    intensity: 'number', // 情绪强度(1-10)
    valence: 'number'    // 情绪效价(-1到1)
  },
  context: {
    activity: 'string',  // 当前活动
    location: 'string',  // 位置信息
    social: 'string',    // 社交情况
    weather: 'string'    // 天气信息
  },
  physiological: {
    heartRate: 'number', // 心率
    steps: 'number'     // 步数
  }
};
```

#### 3.1.3 用户数据模型
```javascript
const UserDataSchema = {
  profile: {
    age: 'number',       // 年龄
    gender: 'string',    // 性别
    occupation: 'string' // 职业
  },
  preferences: {
    language: 'string',  // 语言偏好
    theme: 'string',     // 主题偏好
    notifications: {     // 通知设置
      enabled: 'boolean',
      frequency: 'string',
      quietHours: {
        start: 'string',
        end: 'string'
      }
    }
  },
  history: [{           // 评估历史
    date: 'datetime',
    scaleId: 'string',
    score: 'number',
    results: 'object'
  }]
};
```

### 3.2 存储架构

#### 3.2.1 本地存储策略
```javascript
// 分层存储策略
const StorageStrategy = {
  // 高频访问数据 - LocalStorage
  hotData: ['currentSession', 'userPreferences', 'cachedResults'],
  
  // 大量结构化数据 - IndexDB
  warmData: ['assessmentHistory', 'emaData', 'trends'],
  
  // 静态资源 - Cache Storage
  coldData: ['scaleDefinitions', 'staticAssets', 'documentation']
};
```

#### 3.2.2 数据同步机制
```javascript
class DataSyncManager {
  constructor() {
    this.syncQueue = [];
    this.conflictResolver = new ConflictResolver();
  }
  
  // 本地变更同步
  syncLocalChanges() { /* 实现 */ }
  
  // 冲突解决
  resolveConflicts(local, remote) { /* 实现 */ }
  
  // 数据备份
  backupData() { /* 实现 */ }
  
  // 数据恢复
  restoreData(backup) { /* 实现 */ }
}
```

## 4. 性能优化策略

### 4.1 加载性能优化
```javascript
// 代码分割和懒加载
const PerformanceOptimization = {
  // 按需加载量表定义
  lazyLoadScale: async function(scaleId) {
    const scale = await import(`./scales/${scaleId}.js`);
    return scale.default;
  },
  
  // 预加载关键资源
  preloadCriticalResources: function() {
    const criticalResources = [
      'coreScales',
      'scoringAlgorithms',
      'visualizationEngine'
    ];
    // 实现预加载逻辑
  },
  
  // 缓存策略
  implementCaching: function() {
    // Service Worker缓存
    // 内存缓存
    // 本地存储缓存
  }
};
```

### 4.2 运行性能优化
```javascript
// 虚拟化长列表
const ListVirtualization = {
  virtualizeQuestions: function(questions, viewportHeight) {
    // 只渲染可见区域的问题
    return visibleQuestions;
  },
  
  // 防抖和节流
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};
```

## 5. 安全设计

### 5.1 数据安全
```javascript
// 数据加密
const DataSecurity = {
  encrypt: function(data, key) {
    // 使用AES-256加密
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  },
  
  decrypt: function(encryptedData, key) {
    // 解密数据
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  },
  
  // 敏感数据脱敏
  maskSensitiveData: function(data) {
    // 实现数据脱敏逻辑
    return maskedData;
  }
};
```

### 5.2 隐私保护
```javascript
// 隐私保护机制
const PrivacyProtection = {
  // 数据匿名化
  anonymizeData: function(userData) {
    // 移除或混淆个人标识信息
    return anonymizedData;
  },
  
  // 数据最小化
  minimizeDataCollection: function() {
    // 只收集必要的数据
    return essentialDataOnly;
  },
  
  // 用户同意管理
  manageConsent: function(userId, consentType) {
    // 记录和管理用户同意
    return consentStatus;
  }
};
```

## 6. 测试策略

### 6.1 单元测试架构
```javascript
// 测试框架配置
const TestingFramework = {
  unitTests: {
    // 量表引擎测试
    scaleEngine: ['scoringAccuracy', 'validationRules', 'edgeCases'],
    
    // EMA引擎测试
    emaEngine: ['schedulingLogic', 'notificationDelivery', 'dataCollection'],
    
    // 可视化引擎测试
    visualizationEngine: ['chartRendering', 'dataTransformation', 'exportFunctionality']
  },
  
  integrationTests: {
    // 模块集成测试
    moduleIntegration: ['scaleWithVisualization', 'emaWithStorage'],
    
    // 端到端测试
    e2eTests: ['completeAssessmentFlow', 'emaNotificationFlow']
  }
};
```

### 6.2 性能测试
```javascript
// 性能基准测试
const PerformanceBenchmarks = {
  loadTime: {
    initial: '<= 1s',
    scaleSwitching: '<= 300ms',
    chartRendering: '<= 2s'
  },
  
  runtimePerformance: {
    memoryUsage: '<= 100MB',
    cpuUsage: '<= 30%',
    batteryImpact: 'minimal'
  }
};
```

## 7. 部署架构

### 7.1 构建配置
```javascript
// Vite配置
const BuildConfiguration = {
  development: {
    // 开发环境配置
    hotReload: true,
    sourceMap: true,
    minification: false
  },
  
  production: {
    // 生产环境配置
    optimization: true,
    compression: 'gzip',
    codeSplitting: true,
    lazyLoading: true
  }
};
```

### 7.2 部署策略
```javascript
// 部署流程
const DeploymentPipeline = {
  stages: [
    'build',
    'test',
    'securityScan',
    'performanceTest',
    'deployStaging',
    'smokeTest',
    'deployProduction'
  ],
  
  rollbackStrategy: {
    automatic: true,
    conditions: ['errorRate > 1%', 'performanceDegradation > 20%'],
    procedure: 'blueGreenDeployment'
  }
};
```

## 8. 监控与维护

### 8.1 性能监控
```javascript
// 监控指标
const MonitoringMetrics = {
  performance: ['loadTime', 'renderTime', 'memoryUsage'],
  errors: ['javascriptErrors', 'apiFailures', 'validationErrors'],
  usage: ['activeUsers', 'featureUsage', 'completionRates']
};
```

### 8.2 日志管理
```javascript
// 日志策略
const LoggingStrategy = {
  levels: ['error', 'warn', 'info', 'debug'],
  
  categories: {
    userActions: 'user behavior tracking',
    systemEvents: 'system performance',
    errors: 'error details and stack traces'
  },
  
  retention: '30 days',
  
  privacy: 'anonymize user data'
};
```