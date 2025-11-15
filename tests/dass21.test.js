// DASS-21 量表单元测试
import { DASS21ScoringEngine, DASS_21_SCALE, DASS_21_CITATIONS } from '../src/scales/dass21.js';

describe('DASS-21 量表测试', () => {
  let engine;

  beforeEach(() => {
    engine = new DASS21ScoringEngine();
  });

  describe('DASS21ScoringEngine', () => {
    test('应该正确初始化评分引擎', () => {
      expect(engine).toBeInstanceOf(DASS21ScoringEngine);
      expect(engine.scoringRules).toBeDefined();
      expect(engine.interpretationMatrix).toBeDefined();
    });

    test('应该正确计算原始分数', () => {
      // 模拟答案：所有问题回答0分（最低分）
      const lowAnswers = Array(21).fill(0);
      const lowScore = engine.calculateRawScore(lowAnswers);
      expect(lowScore.depression).toBeGreaterThanOrEqual(0);
      expect(lowScore.anxiety).toBeGreaterThanOrEqual(0);
      expect(lowScore.stress).toBeGreaterThanOrEqual(0);

      // 模拟答案：所有问题回答2分（中等分）
      const mediumAnswers = Array(21).fill(2);
      const mediumScore = engine.calculateRawScore(mediumAnswers);
      expect(mediumScore.depression).toBeGreaterThan(0);
      expect(mediumScore.anxiety).toBeGreaterThan(0);
      expect(mediumScore.stress).toBeGreaterThan(0);

      // 模拟答案：所有问题回答3分（最高分）
      const highAnswers = Array(21).fill(3);
      const highScore = engine.calculateRawScore(highAnswers);
      expect(highScore.depression).toBeGreaterThan(mediumScore.depression);
      expect(highScore.anxiety).toBeGreaterThan(mediumScore.anxiety);
      expect(highScore.stress).toBeGreaterThan(mediumScore.stress);
    });

    test('应该正确确定严重程度', () => {
      // 测试正常范围
      const normalScore = { depression: 7, anxiety: 6, stress: 10 };
      const normalSeverity = engine.determineSeverity(normalScore);
      expect(normalSeverity.depression.level).toBe('中度');
      expect(normalSeverity.anxiety.level).toBe('中度');
      expect(normalSeverity.stress.level).toBe('中度');

      // 测试轻度范围
      const mildScore = { depression: 10, anxiety: 8, stress: 15 };
      const mildSeverity = engine.determineSeverity(mildScore);
      expect(mildSeverity.depression.level).toBe('轻度');
      expect(mildSeverity.anxiety.level).toBe('轻度');
      expect(mildSeverity.stress.level).toBe('轻度');

      // 测试中度范围
      const moderateScore = { depression: 15, anxiety: 12, stress: 20 };
      const moderateSeverity = engine.determineSeverity(moderateScore);
      expect(moderateSeverity.depression.level).toBe('中度');
      expect(moderateSeverity.anxiety.level).toBe('中度');
      expect(moderateSeverity.stress.level).toBe('中度');

      // 测试重度范围
      const severeScore = { depression: 22, anxiety: 16, stress: 28 };
      const severeSeverity = engine.determineSeverity(severeScore);
      expect(severeSeverity.depression.level).toBe('重度');
      expect(severeSeverity.anxiety.level).toBe('重度');
      expect(severeSeverity.stress.level).toBe('重度');
    });

    test('应该生成个性化建议', () => {
      // 测试正常建议
      const normalSeverity = {
        depression: { level: '正常', score: 5 },
        anxiety: { level: '正常', score: 4 },
        stress: { level: '正常', score: 8 }
      };
      const normalRecommendations = engine.generateRecommendations(normalSeverity);
      expect(normalRecommendations.length).toBeGreaterThan(0);
      expect(normalRecommendations[0].priority).toBe('general');

      // 测试高风险建议
      const highRiskSeverity = {
        depression: { level: '重度', score: 25 },
        anxiety: { level: '中度', score: 12 },
        stress: { level: '轻度', score: 12 }
      };
      const highRiskRecommendations = engine.generateRecommendations(highRiskSeverity);
      expect(highRiskRecommendations.length).toBeGreaterThan(0);
      expect(highRiskRecommendations.some(rec => rec.priority === 'high')).toBe(true);
    });

    test('应该生成风险预警', () => {
      // 测试高风险预警
      const highRiskSeverity = {
        depression: { level: '重度', score: 25 },
        anxiety: { level: '重度', score: 18 },
        stress: { level: '中度', score: 22 }
      };
      const riskAlerts = engine.generateRiskAlerts(highRiskSeverity);
      expect(riskAlerts.length).toBeGreaterThan(0);
      expect(riskAlerts.some(alert => alert.type === 'warning')).toBe(true);

      // 测试无风险情况
      const normalSeverity = {
        depression: { level: '正常', score: 5 },
        anxiety: { level: '正常', score: 4 },
        stress: { level: '正常', score: 8 }
      };
      const noRiskAlerts = engine.generateRiskAlerts(normalSeverity);
      expect(noRiskAlerts.length).toBe(0);
    });

    test('应该执行完整评估流程', () => {
      // 模拟中等程度的答案
      const answers = [
        2, 2, 1, 2, 1, 2, 1, // 抑郁维度 (中等)
        2, 1, 2, 1, 2, 1, 2, // 焦虑维度 (轻度)
        2, 2, 1, 2, 2, 1, 2  // 压力维度 (中等)
      ];

      const result = engine.assess(answers);

      expect(result).toBeDefined();
      expect(result.rawScores).toBeDefined();
      expect(result.standardizedScores).toBeDefined();
      expect(result.interpretation).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.riskAlerts).toBeDefined();

      // 验证分数计算
      expect(result.rawScores.depression).toBeGreaterThan(0);
      expect(result.rawScores.anxiety).toBeGreaterThan(0);
      expect(result.rawScores.stress).toBeGreaterThan(0);

      // 验证解释
      expect(result.interpretation.subscaleAnalysis).toBeDefined();
      expect(result.interpretation.summary).toBeDefined();

      // 验证建议
      expect(result.recommendations.length).toBeGreaterThan(0);

      // 验证风险预警
      expect(Array.isArray(result.riskAlerts)).toBe(true);
    });

    test('应该处理边界情况', () => {
      // 测试空答案数组
      expect(() => engine.assess([])).toThrow();

      // 测试答案长度不正确
      expect(() => engine.assess(Array(20).fill(1))).toThrow();

      // 测试答案值超出范围
      expect(() => engine.assess(Array(21).fill(5))).not.toThrow();

      // 测试负值
      expect(() => engine.assess(Array(21).fill(-1))).toThrow();
    });

    test('应该生成标准化分数', () => {
      const answers = Array(21).fill(2); // 中等分数
      const result = engine.assess(answers);

      expect(result.standardizedScores).toBeDefined();
      expect(result.standardizedScores.total).toBeDefined();
      expect(result.standardizedScores.max).toBe(63); // DASS-21总分最大值
      expect(result.standardizedScores.percentile).toBeDefined();
    });
  });

  describe('DASS_21_SCALE 常量', () => {
    test('应该包含完整的量表定义', () => {
      expect(DASS_21_SCALE).toBeDefined();
      expect(DASS_21_SCALE.id).toBe('dass21');
      expect(DASS_21_SCALE.title).toContain('DASS-21');
      expect(DASS_21_SCALE.questions).toHaveLength(21);
      expect(DASS_21_SCALE.subscales).toBeDefined();
      expect(DASS_21_SCALE.subscales.depression).toBeDefined();
      expect(DASS_21_SCALE.subscales.anxiety).toBeDefined();
      expect(DASS_21_SCALE.subscales.stress).toBeDefined();
    });

    test('应该正确分类问题到各维度', () => {
      const depressionQuestions = DASS_21_SCALE.questions.filter(q => q.category === 'depression');
      const anxietyQuestions = DASS_21_SCALE.questions.filter(q => q.category === 'anxiety');
      const stressQuestions = DASS_21_SCALE.questions.filter(q => q.category === 'stress');

      expect(depressionQuestions).toHaveLength(9);
      expect(anxietyQuestions).toHaveLength(7);
      expect(stressQuestions).toHaveLength(7);
    });

    test('应该包含正确的严重程度范围', () => {
      const depression = DASS_21_SCALE.subscales.depression;
      const anxiety = DASS_21_SCALE.subscales.anxiety;
      const stress = DASS_21_SCALE.subscales.stress;

      expect(depression.severityRanges).toBeDefined();
      expect(anxiety.severityRanges).toBeDefined();
      expect(stress.severityRanges).toBeDefined();

      // 验证范围定义
      expect(depression.severityRanges).toBeDefined();
      expect(depression.severityRanges.mild).toBeDefined();
      expect(depression.severityRanges.moderate).toBeDefined();
      expect(depression.severityRanges.severe).toBeDefined();
    });
  });

  describe('DASS21_CITATIONS 常量', () => {
    test('应该包含完整的参考文献', () => {
      expect(DASS21_CITATIONS).toBeDefined();
      expect(Array.isArray(DASS21_CITATIONS)).toBe(true);
      expect(DASS21_CITATIONS.length).toBeGreaterThan(0);

      DASS21_CITATIONS.forEach(citation => {
        expect(citation).toHaveProperty('text');
        expect(citation).toHaveProperty('url');
        expect(typeof citation.text).toBe('string');
        expect(typeof citation.url).toBe('string');
      });
    });
  });
});