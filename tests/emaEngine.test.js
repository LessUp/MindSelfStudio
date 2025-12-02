// EMA (生态瞬时评估) 引擎单元测试
import { EMAEngine, EMA_FORM_CONFIG } from '../src/ema/emaEngine.js';

// 确保 Notification API 可用
if (!global.Notification) {
  global.Notification = class MockNotification {
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }
    
    static requestPermission() {
      return Promise.resolve('granted');
    }
    
    static get permission() {
      return 'granted';
    }
    
    close() {
      this.closed = true;
    }
  };
  
  global.window = global.window || {};
  global.window.Notification = global.Notification;
}

describe('EMA 引擎测试', () => {
  let engine;
  
  beforeEach(() => {
    engine = new EMAEngine({
      dailyAssessments: 4,
      quietHours: { start: 22, end: 7 },
      assessmentWindow: 30,
      reminderInterval: 5
    });
  });
  
  describe('EMAEngine', () => {
    test('应该正确初始化EMA引擎', () => {
      expect(engine).toBeInstanceOf(EMAEngine);
      expect(engine.config).toBeDefined();
      expect(engine.config.dailyAssessments).toBe(4);
      expect(engine.config.quietHours).toEqual({ start: 22, end: 7 });
      expect(engine.config.assessmentWindow).toBe(30);
      expect(engine.config.reminderInterval).toBe(5);
    });
    
    test('应该生成智能时间表', () => {
      const userPattern = {
        wakeTime: 7,
        sleepTime: 23,
        activeHours: [8, 9, 10, 14, 15, 16, 19, 20, 21]
      };
      
      const schedule = engine.generateSmartSchedule(userPattern);
      
      expect(schedule).toBeDefined();
      expect(Array.isArray(schedule.assessments)).toBe(true);
      expect(schedule.assessments.length).toBeLessThanOrEqual(4);
      expect(schedule.assessments.length).toBeGreaterThan(0);
      
      // 验证时间表在活跃时间内
      schedule.assessments.forEach(assessment => {
        expect(assessment.hour).toBeGreaterThanOrEqual(7); // 不在安静时间内
        expect(assessment.hour).toBeLessThanOrEqual(21); // 不在安静时间内
      });
    });
    
    test('应该分析用户行为模式', () => {
      const mockHistory = [
        { timestamp: Date.now() - 3600000, completed: true }, // 1小时前完成
        { timestamp: Date.now() - 7200000, completed: false }, // 2小时前未完成
        { timestamp: Date.now() - 10800000, completed: true }, // 3小时前完成
      ];
      
      const pattern = engine.analyzeUserPattern(mockHistory);
      
      expect(pattern).toBeDefined();
      expect(pattern.completionRate).toBeDefined();
      expect(pattern.averageResponseTime).toBeDefined();
      expect(pattern.preferredTimes).toBeDefined();
      expect(pattern.optimalInterval).toBeDefined();
      
      expect(pattern.completionRate).toBeCloseTo(0.67, 2); // 2/3完成率
      expect(Array.isArray(pattern.preferredTimes)).toBe(true);
    });
    
    test('应该生成自适应通知', () => {
      const assessment = {
        id: 'test-1',
        scheduledTime: Date.now() + 300000, // 5分钟后
        type: 'mood',
        priority: 'normal'
      };
      
      const userPattern = {
        completionRate: 0.8,
        averageResponseTime: 15,
        preferredTimes: [9, 14, 18, 21]
      };
      
      const notification = engine.generateAdaptiveNotification(assessment, userPattern);
      
      expect(notification).toBeDefined();
      expect(notification.id).toBe('test-1');
      expect(notification.type).toBe('mood');
      expect(notification.message).toBeDefined();
      expect(notification.actions).toBeDefined();
      expect(Array.isArray(notification.actions)).toBe(true);
      expect(notification.actions.length).toBeGreaterThan(0);
    });
    
    test('应该收集情境数据', async () => {
      // 模拟地理位置API
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          success({
            coords: { latitude: 39.9042, longitude: 116.4074, accuracy: 10 }
          });
        })
      };
      global.navigator = { geolocation: mockGeolocation };
      
      const contextData = await engine.collectContextData();
      
      expect(contextData).toBeDefined();
      expect(contextData.timestamp).toBeDefined();
      expect(contextData.timezone).toBeDefined();
      expect(contextData.location).toBeDefined();
      expect(contextData.weather).toBeDefined();
      expect(contextData.deviceInfo).toBeDefined();
      
      // 验证时间数据
      expect(typeof contextData.timestamp).toBe('number');
      expect(typeof contextData.timezone).toBe('string');
      
      // 验证设备信息
      expect(contextData.deviceInfo).toHaveProperty('userAgent');
      expect(contextData.deviceInfo).toHaveProperty('platform');
    });
    
    test('应该处理EMA评估完成', () => {
      const assessmentId = 'test-assessment-1';
      const responses = {
        mood: 3,
        anxiety: 2,
        stress: 4,
        energy: 3,
        sleep: 4
      };
      const context = {
        timestamp: Date.now(),
        location: { latitude: 39.9042, longitude: 116.4074 },
        weather: { temperature: 22, condition: 'sunny' }
      };
      
      const result = engine.completeAssessment(assessmentId, responses, context);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(assessmentId);
      expect(result.responses).toEqual(responses);
      expect(result.context).toEqual(context);
      expect(result.completedAt).toBeDefined();
      expect(result.analysis).toBeDefined();
      
      // 验证分析结果
      expect(result.analysis.moodScore).toBeDefined();
      expect(result.analysis.trend).toBeDefined();
      expect(result.analysis.insights).toBeDefined();
      expect(Array.isArray(result.analysis.insights)).toBe(true);
    });
    
    test('应该生成EMA洞察报告', () => {
      const recentAssessments = [
        {
          responses: { mood: 3, anxiety: 2, stress: 4 },
          timestamp: Date.now() - 86400000, // 1天前
          context: { weather: { condition: 'sunny' } }
        },
        {
          responses: { mood: 2, anxiety: 3, stress: 5 },
          timestamp: Date.now() - 172800000, // 2天前
          context: { weather: { condition: 'rainy' } }
        },
        {
          responses: { mood: 4, anxiety: 1, stress: 2 },
          timestamp: Date.now() - 259200000, // 3天前
          context: { weather: { condition: 'cloudy' } }
        }
      ];
      
      const insights = engine.generateEMAInsights(recentAssessments);
      
      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      expect(insights.trends).toBeDefined();
      expect(insights.patterns).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      
      expect(Array.isArray(insights.trends)).toBe(true);
      expect(Array.isArray(insights.patterns)).toBe(true);
      expect(Array.isArray(insights.recommendations)).toBe(true);
      
      expect(insights.trends.length).toBeGreaterThan(0);
      expect(insights.patterns.length).toBeGreaterThan(0);
    });
    
    test('应该处理边界情况', () => {
      // 测试空答案
      expect(() => engine.completeAssessment('test-1', {}, {})).not.toThrow();
      
      // 测试无效评估ID
      expect(() => engine.completeAssessment('', { mood: 3 }, {})).toThrow();
      
      // 测试空历史数据
      const emptyInsights = engine.generateEMAInsights([]);
      expect(emptyInsights.summary).toContain('暂无足够数据');
      
      // 测试单条历史数据
      const singleInsights = engine.generateEMAInsights([
        { responses: { mood: 3 }, timestamp: Date.now() }
      ]);
      expect(singleInsights.summary).toBeDefined();
    });
    
    test('应该遵守安静时间设置', () => {
      const userPattern = { wakeTime: 6, sleepTime: 23 };
      
      // 测试深夜时间 (应该避免)
      const lateNightSchedule = engine.generateSmartSchedule(userPattern, 23);
      expect(lateNightSchedule.assessments.every(a => a.hour < 22)).toBe(true);
      
      // 测试清晨时间 (应该避免)
      const earlyMorningSchedule = engine.generateSmartSchedule(userPattern, 5);
      expect(earlyMorningSchedule.assessments.every(a => a.hour >= 7)).toBe(true);
    });
  });
  
  describe('EMA_FORM_CONFIG 常量', () => {
    test('应该包含完整的表单配置', () => {
      expect(EMA_FORM_CONFIG).toBeDefined();
      expect(EMA_FORM_CONFIG.id).toBe('ema');
      expect(EMA_FORM_CONFIG.title).toContain('生态瞬时评估');
      expect(EMA_FORM_CONFIG.questions).toBeDefined();
      expect(Array.isArray(EMA_FORM_CONFIG.questions)).toBe(true);
      expect(EMA_FORM_CONFIG.questions.length).toBeGreaterThan(0);
    });
    
    test('应该包含正确的问题定义', () => {
      const questions = EMA_FORM_CONFIG.questions;
      
      questions.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('type');
        expect(question).toHaveProperty('options');
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options.length).toBeGreaterThan(0);
      });
    });
    
    test('应该包含评分配置', () => {
      expect(EMA_FORM_CONFIG).toHaveProperty('scoring');
      expect(EMA_FORM_CONFIG.scoring).toHaveProperty('scales');
      expect(EMA_FORM_CONFIG.scoring).toHaveProperty('weights');
      expect(Array.isArray(EMA_FORM_CONFIG.scoring.scales)).toBe(true);
    });
  });
  
  describe('EMA 引擎高级功能测试', () => {
    test('应该设置通知系统', () => {
      // 模拟 Notification API
      const mockNotification = {
        permission: 'granted',
        requestPermission: jest.fn().mockResolvedValue('granted')
      };
      global.Notification = mockNotification;
      
      engine.setupNotificationSystem();
      
      expect(engine.notificationEnabled).toBe(true);
      expect(engine.checkInterval).toBeDefined();
    });
    
    test('应该检查计划评估', () => {
      // 设置模拟时间表
      const now = new Date();
      const pastTime = new Date(now.getTime() - 300000); // 5分钟前
      const futureTime = new Date(now.getTime() + 300000); // 5分钟后
      
      engine.currentSchedule = [
        {
          id: 'test-1',
          status: 'pending',
          windowStart: pastTime,
          windowEnd: new Date(now.getTime() - 100000) // 已过期
        },
        {
          id: 'test-2',
          status: 'pending',
          windowStart: pastTime,
          windowEnd: futureTime // 在窗口期内
        }
      ];
      
      engine.checkScheduledAssessments();
      
      // 验证状态更新
      expect(engine.currentSchedule[0].status).toBe('missed');
      expect(engine.currentSchedule[1].status).toBe('pending');
    });
    
    test('应该触发评估', () => {
      const assessment = {
        id: 'test-assessment',
        sentReminders: 0,
        status: 'pending'
      };
      
      // 模拟发送通知
      engine.sendAssessmentNotification = jest.fn();
      
      engine.triggerAssessment(assessment);
      
      expect(assessment.sentReminders).toBe(1);
      expect(engine.sendAssessmentNotification).toHaveBeenCalledWith(assessment);
    });
    
    test('应该发送评估通知', () => {
      const assessment = {
        id: 'test-notification',
        type: 'mood'
      };
      
      // 模拟通知功能
      engine.notificationEnabled = true;
      global.Notification = jest.fn().mockImplementation((title, options) => ({
        title,
        options,
        onclick: null
      }));
      
      engine.showInAppNotification = jest.fn();
      
      engine.sendAssessmentNotification(assessment);
      
      expect(global.Notification).toHaveBeenCalledWith(
        '心理健康小调查',
        expect.objectContaining({
          body: expect.stringContaining('30秒'),
          icon: '/favicon.ico',
          tag: 'test-notification'
        })
      );
      expect(engine.showInAppNotification).toHaveBeenCalledWith(assessment);
    });
    
    test('应该显示应用内通知', () => {
      const assessment = {
        id: 'in-app-test',
        type: 'mood'
      };
      
      // 模拟回调函数
      window.emaNotificationCallback = jest.fn();
      
      engine.showInAppNotification(assessment);
      
      expect(window.emaNotificationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'in-app-test',
          title: '心理健康小调查',
          message: expect.stringContaining('30秒'),
          actions: expect.arrayContaining([
            expect.objectContaining({ text: '开始评估', action: 'start' })
          ])
        })
      );
    });
    
    test('应该打开评估界面', () => {
      const assessment = {
        id: 'open-test',
        scheduledTime: new Date().toISOString()
      };
      
      window.emaAssessmentCallback = jest.fn();
      
      engine.openAssessment(assessment);
      
      expect(engine.activeAssessment).toBeDefined();
      expect(engine.activeAssessment.id).toBe('open-test');
      expect(engine.activeAssessment.startTime).toBeDefined();
      expect(window.emaAssessmentCallback).toHaveBeenCalledWith(engine.activeAssessment);
    });
    
    test('应该记录EMA响应', () => {
      // 设置活跃的评估
      engine.activeAssessment = {
        id: 'response-test',
        startTime: new Date().toISOString()
      };
      
      // 设置模拟时间表
      engine.currentSchedule = [{
        id: 'response-test',
        status: 'pending'
      }];
      
      engine.collectContextData = jest.fn().mockResolvedValue({
        timestamp: Date.now(),
        timezone: 'Asia/Shanghai'
      });
      
      engine.analyzeResponse = jest.fn();
      
      const responseData = {
        mood: 7,
        anxiety: 3,
        stress: 4
      };
      
      engine.recordResponse(responseData);
      
      // 验证响应被记录
      expect(engine.responseHistory.length).toBe(1);
      expect(engine.responseHistory[0].assessmentId).toBe('response-test');
      expect(engine.responseHistory[0].data).toEqual(responseData);
      expect(engine.activeAssessment).toBeNull(); // 应该清空活跃评估
    });
    
    test('应该分析情绪趋势', () => {
      // 设置历史响应数据
      engine.responseHistory = [
        { data: { mood: 5 }, timestamp: Date.now() - 86400000 },
        { data: { mood: 6 }, timestamp: Date.now() - 172800000 },
        { data: { mood: 4 }, timestamp: Date.now() - 259200000 },
        { data: { mood: 7 }, timestamp: Date.now() - 345600000 },
        { data: { mood: 3 }, timestamp: Date.now() - 432000000 }
      ];
      
      const currentResponse = {
        data: { mood: 8 },
        timestamp: new Date().toISOString()
      };
      
      const moodTrend = engine.analyzeMoodTrend(currentResponse);
      
      expect(moodTrend).toBeDefined();
      expect(moodTrend.current).toBe(8);
      expect(moodTrend.average).toBeDefined();
      expect(moodTrend.trend).toBeDefined();
      expect(['improving', 'declining', 'stable']).toContain(moodTrend.trend);
    });
    
    test('应该分析响应模式', () => {
      // 设置历史响应数据
      engine.responseHistory = [
        { responseTime: 15000, data: { completed: true } },
        { responseTime: 25000, data: { completed: true } },
        { responseTime: 35000, data: { completed: true } }
      ];
      
      const response = {
        responseTime: 20000,
        data: { completed: true }
      };
      
      const pattern = engine.analyzeResponsePattern(response);
      
      expect(pattern).toBeDefined();
      expect(pattern.responseTime).toBe(20000);
      expect(pattern.completionRate).toBeDefined();
      expect(pattern.quickResponse).toBe(true); // 小于30秒
      expect(pattern.pattern).toBeDefined();
    });
    
    test('应该识别响应模式', () => {
      // 测试不足数据的情况
      engine.responseHistory = [];
      expect(engine.identifyResponsePattern()).toBe('insufficient_data');
      
      // 测试快速响应者
      engine.responseHistory = [
        { responseTime: 10000 },
        { responseTime: 15000 },
        { responseTime: 12000 }
      ];
      expect(engine.identifyResponsePattern()).toBe('quick_responder');
      
      // 测试深思熟虑响应者
      engine.responseHistory = [
        { responseTime: 70000 },
        { responseTime: 80000 },
        { responseTime: 90000 }
      ];
      expect(engine.identifyResponsePattern()).toBe('thoughtful_responder');
      
      // 测试一致响应者
      engine.responseHistory = [
        { responseTime: 30000 },
        { responseTime: 35000 },
        { responseTime: 40000 }
      ];
      expect(engine.identifyResponsePattern()).toBe('consistent_responder');
    });
    
    test('应该生成洞察', () => {
      const moodChange = {
        trend: 'declining',
        change: -3
      };
      
      const responsePattern = {
        completionRate: 0.3
      };
      
      const insights = engine.generateInsights(moodChange, responsePattern);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      
      // 验证情绪下降洞察
      const moodInsight = insights.find(i => i.type === 'mood_decline');
      expect(moodInsight).toBeDefined();
      expect(moodInsight.severity).toBe('medium');
      
      // 验证完成率低洞察
      const completionInsight = insights.find(i => i.type === 'low_completion');
      expect(completionInsight).toBeDefined();
      expect(completionInsight.severity).toBe('low');
    });
    
    test('应该获取EMA统计', () => {
      // 设置测试数据
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const twoDaysAgo = new Date(now.getTime() - 172800000);
      
      engine.currentSchedule = [
        { scheduledTime: yesterday, status: 'completed' },
        { scheduledTime: twoDaysAgo, status: 'completed' },
        { scheduledTime: now, status: 'pending' }
      ];
      
      engine.responseHistory = [
        { timestamp: yesterday.toISOString(), responseTime: 15000, data: { mood: 6 } },
        { timestamp: twoDaysAgo.toISOString(), responseTime: 20000, data: { mood: 5 } }
      ];
      
      const stats = engine.getEMAStatistics(7);
      
      expect(stats).toBeDefined();
      expect(stats.totalAssessments).toBe(3);
      expect(stats.completedAssessments).toBe(2);
      expect(stats.completionRate).toBeCloseTo(0.67, 1);
      expect(stats.averageResponseTime).toBe(17500);
      expect(stats.moodTrend).toBeDefined();
      expect(stats.insights).toBeDefined();
    });
    
    test('应该处理数据持久化', () => {
      // 测试保存和加载时间表
      const testSchedule = [
        { id: 'test-1', scheduledTime: new Date().toISOString(), status: 'pending' }
      ];
      
      engine.currentSchedule = testSchedule;
      engine.saveSchedule();
      
      // 创建新引擎实例来测试加载
      const newEngine = new EMAEngine();
      newEngine.loadSchedule();
      
      expect(newEngine.currentSchedule.length).toBeGreaterThan(0);
      
      // 测试响应历史保存和加载
      const testHistory = [
        { assessmentId: 'test-1', timestamp: new Date().toISOString(), data: { mood: 5 } }
      ];
      
      engine.responseHistory = testHistory;
      engine.saveResponseHistory();
      
      newEngine.loadResponseHistory();
      expect(newEngine.responseHistory.length).toBeGreaterThan(0);
    });
    
    test('应该启动评估调度器', () => {
      // 模拟 setTimeout 和 setInterval
      jest.useFakeTimers();
      
      engine.generateSmartSchedule = jest.fn().mockReturnValue({
        assessments: [{ id: 'test-schedule' }]
      });
      
      engine.startAssessmentScheduler();
      
      // 验证调度器被设置
      expect(engine.generateSmartSchedule).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
    
    test('应该处理地理位置错误', async () => {
      // 模拟地理位置API错误
      const mockGeolocation = {
        getCurrentPosition: jest.fn((success, error) => {
          error(new Error('Geolocation permission denied'));
        })
      };
      global.navigator = { geolocation: mockGeolocation };
      
      const contextData = await engine.collectContextData();
      
      expect(contextData).toBeDefined();
      expect(contextData.locationError).toBe('Geolocation permission denied');
      expect(contextData.location).toBeNull();
    });
    
    test('应该记录错过的评估', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const assessment = { id: 'missed-test' };
      engine.logMissedAssessment(assessment);
      
      expect(consoleSpy).toHaveBeenCalledWith('Missed assessment:', 'missed-test');
      consoleSpy.mockRestore();
    });
    
    test('应该清理资源', () => {
      // 设置定时器
      engine.checkInterval = setInterval(() => {}, 1000);
      
      engine.destroy();
      
      expect(engine.checkInterval).toBeUndefined();
    });
  });
});