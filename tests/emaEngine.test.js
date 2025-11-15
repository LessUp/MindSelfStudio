// EMA (生态瞬时评估) 引擎单元测试
import { EMAEngine, EMA_FORM_CONFIG } from '../src/ema/emaEngine.js';
import { jest } from '@jest/globals';

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
});