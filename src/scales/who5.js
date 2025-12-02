// WHO-5 幸福感指数量表定义
// 基于 World Health Organization. (1998). Well-being measures in primary health care: the DepCare project.

const WHO5_SCALE = {
  id: 'who5',
  title: 'WHO-5 幸福感指数量表',
  shortTitle: 'WHO-5',
  description: '请根据过去两周内的实际感受，选择最符合您情况的选项。',
  timeFrame: '过去两周内',
  
  // 评分选项 (0-5分制，正向计分)
  options: [
    { value: 5, text: '所有时间 (5分)' },
    { value: 4, text: '大部分时间 (4分)' },
    { value: 3, text: '一半以上的时间 (3分)' },
    { value: 2, text: '少于一半的时间 (2分)' },
    { value: 1, text: '有些时候 (1分)' },
    { value: 0, text: '从未 (0分)' }
  ],
  
  // 量表条目 (5个正向条目)
  questions: [
    { id: 1, text: '我感到愉快和兴致高昂', category: 'positive_mood', reverse: false },
    { id: 2, text: '我感到平静和放松', category: 'calmness', reverse: false },
    { id: 3, text: '我感到充满活力和精力', category: 'vitality', reverse: false },
    { id: 4, text: '我醒来时感到清新和休息充分', category: 'rested', reverse: false },
    { id: 5, text: '我的日常生活充满了有趣的事情', category: 'interest', reverse: false }
  ],
  
  // 子维度定义 (可选，WHO-5通常是整体评分)
  dimensions: {
    positive_mood: {
      name: '积极情绪',
      description: '评估愉快、高兴等积极情绪体验'
    },
    calmness: {
      name: '平静感',
      description: '评估内心的平静和放松状态'
    },
    vitality: {
      name: '活力感',
      description: '评估精力、活力和身体状态'
    },
    rested: {
      name: '休息充分',
      description: '评估睡眠质量和休息恢复'
    },
    interest: {
      name: '生活兴趣',
      description: '评估对生活事物的兴趣和参与度'
    }
  },
  
  // 评分标准和解释
  scoring: {
    rawScoreRange: { min: 0, max: 25 },
    
    // 幸福感水平分级 (基于百分制转换)
    happinessLevels: [
      { 
        min: 0, 
        max: 28, 
        level: '低幸福感', 
        description: '幸福感水平较低，建议关注心理健康',
        color: 'bg-red-50 text-red-700 border-red-200',
        percentile: 'bottom 25%'
      },
      { 
        min: 29, 
        max: 52, 
        level: '中等幸福感', 
        description: '幸福感水平中等，有改善空间',
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        percentile: '25%-75%'
      },
      { 
        min: 53, 
        max: 100, 
        level: '高幸福感', 
        description: '幸福感水平较高，继续保持',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        percentile: 'top 25%'
      }
    ],
    
    // 临床意义阈值
    clinicalThresholds: {
      depressionScreening: 50,  // 低于50分可能需要进一步抑郁筛查
      wellBeingTarget: 70       // 70分以上表示良好的心理健康状态
    }
  }
};

// WHO-5 评分和解释引擎
class WHO5ScoringEngine {
  constructor() {
    this.scale = WHO5_SCALE;
  }
  
  // 计算原始分数 (0-25分)
  calculateRawScore(answers) {
    let totalScore = 0;
    const dimensionScores = {};
    
    // 初始化各维度分数
    Object.keys(this.scale.dimensions).forEach(dim => {
      dimensionScores[dim] = 0;
    });
    
    // 计算总分和各维度分数
    this.scale.questions.forEach((question, index) => {
      const answer = answers[index] || 0;
      totalScore += answer;
      
      if (question.category && dimensionScores.hasOwnProperty(question.category)) {
        dimensionScores[question.category] += answer;
      }
    });
    
    return {
      total: totalScore,
      dimensions: dimensionScores,
      maxPossible: this.scale.scoring.rawScoreRange.max
    };
  }
  
  // 转换为百分制 (0-100分)
  convertToPercentage(rawScore) {
    const percentage = (rawScore / this.scale.scoring.rawScoreRange.max) * 100;
    return Math.round(percentage * 10) / 10; // 保留一位小数
  }
  
  // 确定幸福感水平
  determineHappinessLevel(percentageScore) {
    const levels = [
      { min: 0, max: 28, level: '低幸福感', description: '幸福感水平较低，建议关注心理健康' },
      { min: 29, max: 52, level: '中等幸福感', description: '幸福感水平中等，有改善空间' },
      { min: 53, max: 100, level: '优秀', description: '幸福感水平较高，继续保持' }
    ];
    
    return levels.find(level => 
      percentageScore >= level.min && percentageScore <= level.max
    ) || levels[levels.length - 1];
  }
  
  // 临床意义评估
  assessClinicalSignificance(percentageScore) {
    const thresholds = this.scale.scoring.clinicalThresholds;
    const assessment = {
      requiresScreening: false,
      wellBeingStatus: '',
      recommendations: []
    };
    
    if (percentageScore < thresholds.depressionScreening) {
      assessment.requiresScreening = true;
      assessment.wellBeingStatus = '需要进一步心理健康评估';
      assessment.recommendations.push({
        type: 'clinical',
        priority: 'high',
        suggestion: '建议进行专业的心理健康评估，如PHQ-9抑郁筛查'
      });
    } else if (percentageScore >= thresholds.wellBeingTarget) {
      assessment.wellBeingStatus = '良好的心理健康状态';
      assessment.recommendations.push({
        type: 'maintenance',
        priority: 'low',
        suggestion: '继续保持当前的生活方式和积极心态'
      });
    } else {
      assessment.wellBeingStatus = '中等的心理健康状态';
      assessment.recommendations.push({
        type: 'improvement',
        priority: 'medium',
        suggestion: '可以通过一些积极的心理健康干预来提升幸福感'
      });
    }
    
    return assessment;
  }
  
  // 临床筛查评估（测试兼容性）
  performClinicalScreening(percentageScore) {
    const thresholds = this.scale.scoring.clinicalThresholds;
    
    return {
      depressionScreening: {
        result: percentageScore <= thresholds.depressionScreening ? '阳性' : '阴性',
        recommendation: percentageScore <= thresholds.depressionScreening ? '建议进一步评估' : '无需进一步筛查'
      },
      wellBeingStatus: percentageScore >= thresholds.wellBeingTarget ? '良好' : '需要关注'
    };
  }
  
  // 生成个性化建议（测试兼容性）
  generateRecommendations(rawScore, happinessLevel) {
    const percentageScore = this.convertToPercentage(rawScore);
    
    if (percentageScore <= 28) {
      return [
        {
          priority: 'high',
          category: 'mood',
          suggestion: '幸福感水平较低，建议寻求专业心理健康支持'
        }
      ];
    } else if (percentageScore <= 52) {
      return [
        {
          priority: 'medium',
          category: 'lifestyle',
          suggestion: '可以尝试增加日常愉悦活动和社交联系'
        }
      ];
    } else {
      return [
        {
          priority: 'low',
          category: 'maintenance',
          suggestion: '继续保持当前积极的生活方式'
        }
      ];
    }
  }
  
  // 生成详细的幸福感报告
  generateWellBeingReport(scores, happinessLevel, clinicalAssessment) {
    const report = {
      summary: {
        rawScore: scores.total,
        percentageScore: this.convertToPercentage(scores.total),
        happinessLevel: happinessLevel.level,
        maxScore: this.scale.scoring.rawScoreRange.max
      },
      
      interpretation: {
        levelDescription: happinessLevel.description,
        percentile: happinessLevel.percentile,
        clinicalStatus: clinicalAssessment.wellBeingStatus
      },
      
      dimensionAnalysis: this.analyzeDimensions(scores.dimensions),
      
      recommendations: [
        ...clinicalAssessment.recommendations,
        ...this.generateGeneralRecommendations(happinessLevel.level)
      ],
      
      nextSteps: this.suggestNextSteps(clinicalAssessment)
    };
    
    return report;
  }
  
  // 分析各维度表现
  analyzeDimensions(dimensionScores) {
    const analysis = {};
    const maxPerDimension = this.scale.scoring.rawScoreRange.max / Object.keys(dimensionScores).length;
    
    Object.keys(dimensionScores).forEach(dimension => {
      const score = dimensionScores[dimension];
      const percentage = (score / maxPerDimension) * 100;
      const dimensionInfo = this.scale.dimensions[dimension];
      
      analysis[dimension] = {
        name: dimensionInfo.name,
        description: dimensionInfo.description,
        score: score,
        percentage: Math.round(percentage * 10) / 10,
        performance: this.evaluateDimensionPerformance(percentage)
      };
    });
    
    return analysis;
  }
  
  // 评估单个维度的表现
  evaluateDimensionPerformance(percentage) {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    if (percentage >= 20) return 'below_average';
    return 'poor';
  }
  
  // 生成通用建议
  generateGeneralRecommendations(happinessLevel) {
    const recommendations = [];
    
    if (happinessLevel === '低幸福感') {
      recommendations.push(
        {
          type: 'lifestyle',
          priority: 'high',
          suggestion: '增加日常活动中的愉悦体验，如听音乐、看喜剧、与朋友聚会'
        },
        {
          type: 'social',
          priority: 'high',
          suggestion: '加强与亲友的联系，寻求社会支持'
        },
        {
          type: 'health',
          priority: 'medium',
          suggestion: '保持规律的睡眠和运动习惯，这些都有助于提升幸福感'
        }
      );
    } else if (happinessLevel === '中等幸福感') {
      recommendations.push(
        {
          type: 'mindfulness',
          priority: 'medium',
          suggestion: '尝试正念冥想或放松训练，提升内在的平静感'
        },
        {
          type: 'gratitude',
          priority: 'medium',
          suggestion: '每天记录3件值得感恩的事情，培养积极思维'
        },
        {
          type: 'growth',
          priority: 'low',
          suggestion: '设定小目标并努力实现，体验成就感'
        }
      );
    } else {
      recommendations.push(
        {
          type: 'maintenance',
          priority: 'low',
          suggestion: '继续保持现有的积极生活方式'
        },
        {
          type: 'sharing',
          priority: 'low',
          suggestion: '与他人分享您的积极体验，传播正能量'
        }
      );
    }
    
    return recommendations;
  }
  
  // 建议下一步行动
  suggestNextSteps(clinicalAssessment) {
    const steps = [];
    
    if (clinicalAssessment.requiresScreening) {
      steps.push({
        action: 'complete_depression_screening',
        description: '完成PHQ-9抑郁症状筛查量表',
        timeline: '1-2天内',
        priority: 'high'
      });
    }
    
    steps.push({
      action: 'track_progress',
      description: '定期使用WHO-5量表追踪幸福感变化',
      timeline: '每周一次',
      priority: 'medium'
    });
    
    if (clinicalAssessment.recommendations.some(rec => rec.priority === 'high')) {
      steps.push({
        action: 'seek_support',
        description: '考虑寻求专业心理健康支持',
        timeline: '根据情况决定',
        priority: 'high'
      });
    }
    
    return steps;
  }
  
  // 完整的评估流程
  assess(answers) {
    // 验证输入
    if (!answers || answers.length !== 5) {
      throw new Error('WHO-5 requires exactly 5 answers');
    }
    
    // 验证答案值范围
    answers.forEach(answer => {
      if (answer < 0 || answer > 5) {
        throw new Error('Answer values must be between 0 and 5');
      }
    });
    
    // 1. 计算分数
    const scores = this.calculateRawScore(answers);
    
    // 2. 转换为百分制
    const percentageScore = this.convertToPercentage(scores.total);
    
    // 3. 确定幸福感水平
    const happinessLevel = this.determineHappinessLevel(percentageScore);
    
    // 4. 临床意义评估
    const clinicalAssessment = this.assessClinicalSignificance(percentageScore);
    
    // 5. 生成完整报告
    const report = this.generateWellBeingReport(scores, happinessLevel, clinicalAssessment);
    
    return {
      rawScore: scores.total,
      percentageScore,
      happinessLevel,
      report,
      recommendations: this.generateRecommendations(scores.total, happinessLevel),
      clinicalAssessment,
      timestamp: new Date().toISOString()
    };
  }
}

// 参考文献
const WHO5_CITATIONS = [
  {
    text: 'World Health Organization. (1998). Well-being measures in primary health care: the DepCare project. Health for All Update, 5, 1-6.',
    url: 'https://www.euro.who.int/__data/assets/pdf_file/0010/134240/Health_for_All_Update_5.pdf'
  },
  {
    text: 'Topp, C. W., Østergaard, S. D., Søndergaard, S., & Bech, P. (2015). The WHO-5 Well-Being Index: a systematic review of the literature. Psychotherapy and Psychosomatics, 84(3), 167-176.',
    url: 'https://www.karger.com/Article/Abstract/376585'
  },
  {
    text: 'World Health Organization. (2021). WHO-5 Well-Being Index: validation and applications. WHO Regional Office for Europe.',
    url: 'https://www.euro.who.int/en/health-topics/noncommunicable-diseases/mental-health/data-and-resources/who-5-well-being-index'
  }
];

// 导出模块
module.exports = { WHO5_SCALE, WHO5ScoringEngine, WHO5_CITATIONS };