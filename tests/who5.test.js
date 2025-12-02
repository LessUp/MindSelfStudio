// WHO-5 幸福感量表单元测试
import { WHO5ScoringEngine, WHO5_SCALE, WHO5_CITATIONS } from '../src/scales/who5.js';

describe('WHO-5 幸福感量表测试', () => {
  let engine;
  
  beforeEach(() => {
    engine = new WHO5ScoringEngine();
  });
  
  describe('WHO5ScoringEngine', () => {
    test('应该正确初始化评分引擎', () => {
      expect(engine).toBeInstanceOf(WHO5ScoringEngine);
      expect(engine.scale).toBeDefined();
    });
    
    test('应该正确计算原始分数', () => {
      // 测试最低分 (所有问题回答0分)
      const lowAnswers = Array(5).fill(0);
      const lowScore = engine.calculateRawScore(lowAnswers);
      expect(lowScore.total).toBe(0);
      
      // 测试中等分 (所有问题回答2分)
      const mediumAnswers = Array(5).fill(2);
      const mediumScore = engine.calculateRawScore(mediumAnswers);
      expect(mediumScore.total).toBe(10);
      
      // 测试最高分 (所有问题回答5分)
      const highAnswers = Array(5).fill(5);
      const highScore = engine.calculateRawScore(highAnswers);
      expect(highScore.total).toBe(25);
      
      // 测试混合答案
      const mixedAnswers = [5, 4, 3, 2, 1];
      const mixedScore = engine.calculateRawScore(mixedAnswers);
      expect(mixedScore.total).toBe(15);
    });
    
    test('应该正确转换为百分比分数', () => {
      // 测试最低分转换为百分比
      const lowPercentage = engine.convertToPercentage(0);
      expect(lowPercentage).toBe(0); // 0/25 * 100
      
      // 测试中等分转换为百分比
      const mediumPercentage = engine.convertToPercentage(12);
      expect(mediumPercentage).toBeCloseTo(48, 1); // 12/25 * 100
      
      // 测试最高分转换为百分比
      const highPercentage = engine.convertToPercentage(25);
      expect(highPercentage).toBe(100); // 25/25 * 100
      
      // 测试边界值
      expect(engine.convertToPercentage(12.5)).toBe(50);
      expect(engine.convertToPercentage(20)).toBe(80);
    });
    
    test('应该正确确定幸福感水平', () => {
      // 测试低幸福感
      const lowWellbeing = engine.determineHappinessLevel(20);
      expect(lowWellbeing.level).toBe('低幸福感');
      expect(lowWellbeing.description).toContain('幸福感水平较低');
      
      // 测试中等幸福感
      const mediumWellbeing = engine.determineHappinessLevel(50);
      expect(mediumWellbeing.level).toBe('中等幸福感');
      expect(mediumWellbeing.description).toContain('幸福感水平中等');
      
      // 测试高幸福感
      const highWellbeing = engine.determineHappinessLevel(80);
      expect(highWellbeing.level).toBe('优秀');
      expect(highWellbeing.description).toContain('幸福感水平较高');
      
      // 测试优秀幸福感
      const excellentWellbeing = engine.determineHappinessLevel(95);
      expect(excellentWellbeing.level).toBe('优秀');
      expect(excellentWellbeing.description).toContain('继续保持');
    });
    
    test('应该进行临床筛查评估', () => {
      // 测试抑郁筛查阳性（分数≤50）
      const depressionPositive = engine.performClinicalScreening(45);
      expect(depressionPositive.depressionScreening.result).toBe('阳性');
      expect(depressionPositive.depressionScreening.recommendation).toContain('进一步评估');
      
      // 测试抑郁筛查阴性（分数>50）
      const depressionNegative = engine.performClinicalScreening(55);
      expect(depressionNegative.depressionScreening.result).toBe('阴性');
      expect(depressionNegative.depressionScreening.recommendation).toContain('无需进一步筛查');
      
      // 测试边界值
      const boundaryResult = engine.performClinicalScreening(50);
      expect(boundaryResult.depressionScreening.result).toBe('阳性');
    });
    
    test('应该生成个性化建议', () => {
      // 测试低幸福感建议
      const lowScore = 5; // 5/25 = 20% which is <= 28
      const lowHappiness = engine.determineHappinessLevel(engine.convertToPercentage(lowScore));
      const lowRecommendations = engine.generateRecommendations(lowScore, lowHappiness);
      
      expect(lowRecommendations.length).toBeGreaterThan(0);
      expect(lowRecommendations.some(rec => rec.priority === 'high')).toBe(true);
      
      // 测试中等幸福感建议
      const mediumScore = 60;
      const mediumHappiness = engine.determineHappinessLevel(mediumScore);
      const mediumRecommendations = engine.generateRecommendations(mediumScore, mediumHappiness);
      
      expect(mediumRecommendations.length).toBeGreaterThan(0);
      expect(mediumRecommendations.some(rec => rec.priority === 'low')).toBe(true);
      expect(mediumRecommendations.some(rec => rec.category === 'maintenance')).toBe(true);
      
      // 测试高幸福感建议
      const highScore = 85;
      const highHappiness = engine.determineHappinessLevel(highScore);
      const highRecommendations = engine.generateRecommendations(highScore, highHappiness);
      
      expect(highRecommendations.length).toBeGreaterThan(0);
      expect(highRecommendations.some(rec => rec.priority === 'low')).toBe(true);
      expect(highRecommendations.some(rec => rec.category === 'maintenance')).toBe(true);
    });
    
    test('应该执行完整评估流程', () => {
      // 测试中等幸福感评估
      const answers = [3, 4, 3, 2, 4]; // 中等分数
      const result = engine.assess(answers);
      
      expect(result).toBeDefined();
      expect(result.rawScore).toBeDefined();
      expect(result.percentageScore).toBeDefined();
      expect(result.report).toBeDefined();
      expect(result.recommendations).toBeDefined();
      
      // 验证分数计算
      expect(result.rawScore).toBe(16); // 3+4+3+2+4
      expect(result.percentageScore).toBeCloseTo(64, 0); // 16/25 * 100
      
      // 验证报告
      expect(result.report.summary).toBeDefined();
      expect(result.report.interpretation).toBeDefined();
      expect(result.clinicalAssessment).toBeDefined();
      
      // 验证建议
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
    
    test('应该处理边界情况', () => {
      // 测试空答案数组
      expect(() => engine.assess([])).toThrow();
      
      // 测试答案长度不正确
      expect(() => engine.assess(Array(4).fill(3))).toThrow();
      expect(() => engine.assess(Array(6).fill(3))).toThrow();
      
      // 测试答案值超出范围
      expect(() => engine.assess(Array(5).fill(6))).toThrow();
      expect(() => engine.assess(Array(5).fill(-1))).toThrow();
      
      // 测试负值
      expect(() => engine.assess([-1, 3, 2, 4, 1])).toThrow();
    });
    
    test('应该处理反向计分问题', () => {
      // WHO-5所有问题都是正向计分，不需要反向计分
      const answers = [5, 5, 5, 5, 5]; // 最高分
      const result = engine.assess(answers);
      
      expect(result.rawScore).toBe(25);
      expect(result.percentageScore).toBe(100);
    });
  });
  
  describe('WHO5_SCALE 常量', () => {
    test('应该包含完整的量表定义', () => {
      expect(WHO5_SCALE).toBeDefined();
      expect(WHO5_SCALE.id).toBe('who5');
      expect(WHO5_SCALE.title).toContain('WHO-5');
      expect(WHO5_SCALE.questions).toHaveLength(5);
      expect(WHO5_SCALE.scoring).toBeDefined();
      expect(WHO5_SCALE.scoring.happinessLevels).toBeDefined();
      expect(WHO5_SCALE.scoring.clinicalThresholds).toBeDefined();
    });
    
    test('应该包含正确的幸福感水平定义', () => {
      const happinessLevels = WHO5_SCALE.scoring.happinessLevels;
      
      expect(happinessLevels).toBeDefined();
      expect(Array.isArray(happinessLevels)).toBe(true);
      expect(happinessLevels.length).toBeGreaterThan(0);
      
      happinessLevels.forEach(level => {
        expect(level).toHaveProperty('min');
        expect(level).toHaveProperty('max');
        expect(level).toHaveProperty('level');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('color');
      });
    });
    
    test('应该包含正确的临床阈值', () => {
      const clinicalThresholds = WHO5_SCALE.scoring.clinicalThresholds;
      
      expect(clinicalThresholds).toBeDefined();
      expect(clinicalThresholds).toHaveProperty('depressionScreening');
      expect(clinicalThresholds).toHaveProperty('wellBeingTarget');
      
      expect(clinicalThresholds.depressionScreening).toBe(50);
      expect(clinicalThresholds.wellBeingTarget).toBe(70);
    });
  });
  
  describe('WHO5_CITATIONS 常量', () => {
    test('应该包含完整的参考文献', () => {
      expect(WHO5_CITATIONS).toBeDefined();
      expect(Array.isArray(WHO5_CITATIONS)).toBe(true);
      expect(WHO5_CITATIONS.length).toBeGreaterThan(0);
      
      WHO5_CITATIONS.forEach(citation => {
        expect(citation).toHaveProperty('text');
        expect(citation).toHaveProperty('url');
        expect(typeof citation.text).toBe('string');
        expect(typeof citation.url).toBe('string');
      });
    });
  });
});