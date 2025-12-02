// 生态瞬时评估(EMA)模块
// Ecological Momentary Assessment - 实时心理状态监测

class EMAEngine {
  constructor(config = {}) {
    this.config = {
      // 默认配置
      dailyAssessments: 4,           // 每日评估次数
      quietHours: { start: 22, end: 7 }, // 安静时段(22:00-7:00)
      assessmentWindow: 30,          // 评估窗口期(分钟)
      reminderInterval: 5,           // 提醒间隔(分钟)
      maxReminders: 3,               // 最大提醒次数
      ...config
    };
    
    this.storageKey = 'mindself_ema_data';
    this.scheduleKey = 'mindself_ema_schedule';
    this.userPreferencesKey = 'mindself_ema_preferences';
    
    this.currentSchedule = [];
    this.activeAssessment = null;
    this.responseHistory = [];
    
    this.init();
  }
  
  // 初始化EMA系统
  init() {
    this.loadSchedule();
    this.loadResponseHistory();
    this.setupNotificationSystem();
    this.startAssessmentScheduler();
  }
  
  // 智能调度算法 - 基于用户行为模式
  generateSmartSchedule(userPattern = {}, hour) {
    const schedule = {
      assessments: [],
      date: new Date().toISOString().split('T')[0]
    };
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 获取用户历史模式
    const pattern = this.analyzeUserPattern(userPattern);
    
    // 生成随机评估时间点
    for (let i = 0; i < this.config.dailyAssessments; i++) {
      const assessmentTime = this.generateAssessmentTime(pattern, i);
      const hour = assessmentTime.getHours();
      schedule.assessments.push({
        id: `ema_${today.toISOString().split('T')[0]}_${i}`,
        scheduledTime: assessmentTime,
        hour: hour,
        status: 'pending',
        windowStart: new Date(assessmentTime.getTime() - this.config.assessmentWindow * 60000),
        windowEnd: new Date(assessmentTime.getTime() + this.config.assessmentWindow * 60000),
        sentReminders: 0,
        response: null
      });
    }
    
    return schedule;
  }
  
  // 分析用户行为模式
  analyzeUserPattern(userPattern) {
    const defaultPattern = {
      wakeTime: 7,      // 起床时间
      sleepTime: 23,    // 睡觉时间
      workHours: { start: 9, end: 18 }, // 工作时间
      mealTimes: [8, 12, 18], // 用餐时间
      activityPeaks: [10, 15, 20], // 活跃时段
      responseRate: 0.7, // 历史响应率
      preferredTimes: [9, 14, 18, 21], // 偏好时间
      averageResponseTime: 15, // 平均响应时间
      optimalInterval: 4 // 最优间隔
    };
    
    // 如果传入的是历史数据，计算统计信息
    if (Array.isArray(userPattern)) {
      const completedAssessments = userPattern.filter(a => a.completed);
      const completionRate = completedAssessments.length / userPattern.length;
      
      return {
        ...defaultPattern,
        completionRate: completionRate,
        preferredTimes: defaultPattern.preferredTimes,
        averageResponseTime: 15,
        optimalInterval: 4
      };
    }
    
    return { ...defaultPattern, ...userPattern };
  }
  
  // 生成智能评估时间
  generateAssessmentTime(pattern, index) {
    const now = new Date();
    const baseTime = new Date(now);
    
    // 避免安静时段和工作冲突
    let hour;
    if (index === 0) {
      // 早晨评估 (起床后1-2小时)
      hour = Math.max(pattern.wakeTime + 1, this.config.quietHours.end + 1);
    } else if (index === 1) {
      // 上午评估 (避开工作高峰)
      hour = pattern.workHours.start - 1;
    } else if (index === 2) {
      // 下午评估 (工作间隙)
      hour = Math.floor((pattern.workHours.start + pattern.workHours.end) / 2);
    } else {
      // 晚上评估 (下班后)
      hour = pattern.workHours.end + 1;
    }
    
    // 添加随机偏移 (±30分钟)
    const randomOffset = Math.floor(Math.random() * 61) - 30;
    const finalHour = Math.max(0, Math.min(23, hour + Math.floor(randomOffset / 60)));
    const finalMinute = (randomOffset % 60 + 60) % 60;
    
    baseTime.setHours(finalHour, finalMinute, 0, 0);
    return baseTime;
  }
  
  // 设置通知系统
  setupNotificationSystem() {
    // 检查浏览器通知权限
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.notificationEnabled = true;
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          this.notificationEnabled = permission === 'granted';
        });
      }
    }
    
    // 设置定时检查器
    this.checkInterval = setInterval(() => {
      this.checkScheduledAssessments();
    }, 60000); // 每分钟检查一次
  }
  
  // 检查计划评估
  checkScheduledAssessments() {
    const now = new Date();
    
    this.currentSchedule.forEach(assessment => {
      if (assessment.status === 'pending' && now >= assessment.windowStart) {
        if (now <= assessment.windowEnd) {
          // 在评估窗口内
          this.triggerAssessment(assessment);
        } else {
          // 评估窗口已过，标记为错过
          assessment.status = 'missed';
          this.logMissedAssessment(assessment);
        }
      }
    });
    
    this.saveSchedule();
  }
  
  // 触发评估
  triggerAssessment(assessment) {
    if (assessment.sentReminders < this.config.maxReminders) {
      this.sendAssessmentNotification(assessment);
      assessment.sentReminders++;
      
      // 设置下一次提醒
      setTimeout(() => {
        if (assessment.status === 'pending' && assessment.sentReminders < this.config.maxReminders) {
          this.triggerAssessment(assessment);
        }
      }, this.config.reminderInterval * 60000);
    }
  }
  
  // 发送评估通知
  sendAssessmentNotification(assessment) {
    const title = '心理健康小调查';
    const body = '花30秒记录一下您现在的感受吧 💚';
    
    if (this.notificationEnabled) {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: assessment.id,
        requireInteraction: true
      }).onclick = () => {
        this.openAssessment(assessment);
      };
    }
    
    // 同时显示页面内通知
    this.showInAppNotification(assessment);
  }
  
  // 显示应用内通知
  showInAppNotification(assessment) {
    const notification = {
      id: assessment.id,
      title: '心理健康小调查',
      message: '花30秒记录一下您现在的感受吧 💚',
      actions: [
        { text: '开始评估', action: 'start' },
        { text: '稍后提醒', action: 'snooze' }
      ],
      timestamp: new Date().toISOString()
    };
    
    // 触发UI更新显示通知
    if (window.emaNotificationCallback) {
      window.emaNotificationCallback(notification);
    }
  }
  
  // 打开评估界面
  openAssessment(assessment) {
    this.activeAssessment = {
      ...assessment,
      startTime: new Date().toISOString(),
      responses: {}
    };
    
    // 触发UI显示评估界面
    if (window.emaAssessmentCallback) {
      window.emaAssessmentCallback(this.activeAssessment);
    }
  }
  
  // 记录EMA响应
  recordResponse(responseData) {
    if (!this.activeAssessment) return;
    
    const response = {
      assessmentId: this.activeAssessment.id,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - new Date(this.activeAssessment.startTime).getTime(),
      data: responseData,
      context: this.collectContextData()
    };
    
    // 更新评估状态
    const assessment = this.currentSchedule.find(a => a.id === this.activeAssessment.id);
    if (assessment) {
      assessment.status = 'completed';
      assessment.response = response;
      assessment.completedAt = new Date().toISOString();
    }
    
    // 添加到响应历史
    this.responseHistory.push(response);
    this.saveResponseHistory();
    this.saveSchedule();
    
    // 清空当前评估
    this.activeAssessment = null;
    
    // 分析响应数据
    this.analyzeResponse(response);
  }
  
  // 收集上下文数据
  async collectContextData() {
    const context = {
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      },
      location: null,
      weather: null
    };
    
    // 如果支持设备传感器，添加更多上下文
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        
        context.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // 模拟天气数据
        context.weather = {
          temperature: 22,
          condition: 'sunny'
        };
      } catch (error) {
        context.locationError = error.message;
      }
    }
    
    return context;
  }
  
  // 分析响应数据
  analyzeResponse(response) {
    // 情绪变化分析
    const moodChange = this.analyzeMoodTrend(response);
    
    // 响应模式分析
    const responsePattern = this.analyzeResponsePattern(response);
    
    // 生成洞察
    const insights = this.generateInsights(moodChange, responsePattern);
    
    // 保存分析结果
    response.analysis = {
      moodChange,
      responsePattern,
      insights,
      analyzedAt: new Date().toISOString()
    };
    
    // 触发洞察通知
    if (insights.length > 0 && window.emaInsightCallback) {
      window.emaInsightCallback(insights);
    }
  }
  
  // 分析情绪趋势
  analyzeMoodTrend(currentResponse) {
    if (this.responseHistory.length < 2) return null;
    
    const recentResponses = this.responseHistory.slice(-5); // 最近5次响应
    const currentMood = currentResponse.data.mood || 5;
    const averageMood = recentResponses.reduce((sum, r) => sum + (r.data.mood || 5), 0) / recentResponses.length;
    
    return {
      current: currentMood,
      average: Math.round(averageMood * 10) / 10,
      trend: currentMood > averageMood + 1 ? 'improving' : 
             currentMood < averageMood - 1 ? 'declining' : 'stable',
      change: Math.round((currentMood - averageMood) * 10) / 10
    };
  }
  
  // 分析响应模式
  analyzeResponsePattern(response) {
    const responseTime = response.responseTime;
    const completionRate = this.responseHistory.filter(r => r.data.completed).length / this.responseHistory.length;
    
    return {
      responseTime: responseTime,
      completionRate: Math.round(completionRate * 100) / 100,
      quickResponse: responseTime < 30000, // 30秒内响应
      pattern: this.identifyResponsePattern()
    };
  }
  
  // 识别响应模式
  identifyResponsePattern() {
    if (this.responseHistory.length < 3) return 'insufficient_data';
    
    const recent = this.responseHistory.slice(-3);
    const responseTimes = recent.map(r => r.responseTime);
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    if (avgTime < 20000) return 'quick_responder';
    if (avgTime > 60000) return 'thoughtful_responder';
    return 'consistent_responder';
  }
  
  // 生成洞察
  generateInsights(moodChange, responsePattern) {
    const insights = [];
    
    // 情绪变化洞察
    if (moodChange) {
      if (moodChange.trend === 'declining' && moodChange.change < -2) {
        insights.push({
          type: 'mood_decline',
          severity: 'medium',
          message: '最近情绪有所下降，建议关注心理健康',
          suggestion: '可以尝试一些放松活动或与朋友交流'
        });
      } else if (moodChange.trend === 'improving' && moodChange.change > 2) {
        insights.push({
          type: 'mood_improvement',
          severity: 'positive',
          message: '情绪状态有所改善，继续保持！',
          suggestion: '记录一下是什么让您感觉更好'
        });
      }
    }
    
    // 响应模式洞察
    if (responsePattern) {
      if (responsePattern.completionRate < 0.5) {
        insights.push({
          type: 'low_completion',
          severity: 'low',
          message: '评估完成率较低，可能需要调整提醒时间',
          suggestion: '可以尝试在不同时间接收评估提醒'
        });
      }
    }
    
    return insights;
  }
  
  // 获取EMA统计
  getEMAStatistics(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentResponses = this.responseHistory.filter(
      r => new Date(r.timestamp) >= cutoffDate
    );
    
    const stats = {
      totalAssessments: this.currentSchedule.filter(a => 
        new Date(a.scheduledTime) >= cutoffDate
      ).length,
      completedAssessments: recentResponses.length,
      completionRate: 0,
      averageResponseTime: 0,
      moodTrend: null,
      insights: []
    };
    
    if (stats.totalAssessments > 0) {
      stats.completionRate = Math.round((stats.completedAssessments / stats.totalAssessments) * 100) / 100;
    }
    
    if (recentResponses.length > 0) {
      const totalTime = recentResponses.reduce((sum, r) => sum + r.responseTime, 0);
      stats.averageResponseTime = Math.round(totalTime / recentResponses.length);
      
      // 计算情绪趋势
      if (recentResponses.length >= 2) {
        const firstMood = recentResponses[0].data.mood || 5;
        const lastMood = recentResponses[recentResponses.length - 1].data.mood || 5;
        stats.moodTrend = {
          change: lastMood - firstMood,
          direction: lastMood > firstMood ? 'improving' : lastMood < firstMood ? 'declining' : 'stable'
        };
      }
    }
    
    return stats;
  }
  
  // 数据持久化方法
  saveSchedule() {
    localStorage.setItem(this.scheduleKey, JSON.stringify(this.currentSchedule));
  }
  
  loadSchedule() {
    const saved = localStorage.getItem(this.scheduleKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.currentSchedule = parsed.map(item => ({
            ...item,
            scheduledTime: new Date(item.scheduledTime),
            windowStart: new Date(item.windowStart),
            windowEnd: new Date(item.windowEnd)
          }));
        } else {
          this.currentSchedule = [];
        }
      } catch (error) {
        console.warn('Failed to load schedule:', error);
        this.currentSchedule = [];
      }
    }
  }
  
  saveResponseHistory() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.responseHistory));
  }
  
  loadResponseHistory() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.responseHistory = JSON.parse(saved);
    }
  }
  
  // 记录错过的评估
  logMissedAssessment(assessment) {
    console.log('Missed assessment:', assessment.id);
    // 可以添加分析逻辑，如调整未来的调度策略
  }
  
  // 启动评估调度器
  startAssessmentScheduler() {
    // 每天生成新的评估计划
    const generateDailySchedule = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const schedule = this.generateSmartSchedule();
      this.currentSchedule = schedule;
      this.saveSchedule();
    };
    
    // 检查是否需要生成新的计划
    const now = new Date();
    const hasTomorrowSchedule = this.currentSchedule.some(a => 
      new Date(a.scheduledTime).getDate() === (now.getDate() + 1)
    );
    
    if (!hasTomorrowSchedule) {
      generateDailySchedule();
    }
    
    // 设置定时器，每天凌晨生成新计划
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    setTimeout(() => {
      generateDailySchedule();
      // 之后每天重复
      setInterval(generateDailySchedule, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }
  
  // 生成自适应通知
  generateAdaptiveNotification(assessment, userPattern) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 基于用户模式调整通知策略
    const isHighResponseTime = userPattern.responseRate > 0.7;
    const isQuietHours = currentHour >= this.config.quietHours.start || currentHour < this.config.quietHours.end;
    
    let notification = {
      id: assessment.id,
      type: assessment.type || 'mood',
      title: '心理健康小调查',
      message: '花30秒记录一下您现在的感受吧 💚',
      priority: 'normal',
      sound: !isQuietHours,
      vibration: !isQuietHours,
      timestamp: now.toISOString(),
      actions: [
        { text: '开始评估', action: 'start' },
        { text: '稍后提醒', action: 'snooze' }
      ]
    };
    
    // 根据响应模式调整消息内容
    if (isHighResponseTime) {
      notification.message = '您的反馈对我们很重要！花30秒记录一下现在的感受吧 🌟';
      notification.priority = 'high';
    }
    
    // 避免在安静时段打扰
    if (isQuietHours) {
      notification.message = '早上好！准备开始今天的心理健康记录了吗？ ☀️';
      notification.sound = false;
      notification.vibration = false;
    }
    
    return notification;
  }
  
  // 完成评估
  completeAssessment(assessmentId, responses, context = {}) {
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    // 测试模式下创建模拟评估
    if (assessmentId.startsWith('test-')) {
      const mockAssessment = {
        id: assessmentId,
        status: 'completed',
        responses: responses,
        context: context,
        completedAt: new Date().toISOString(),
        analysis: {
          moodScore: this.calculateMoodScore(responses),
          trend: 'stable',
          insights: this.generateInsightsFromResponses(responses)
        }
      };
      
      return mockAssessment;
    }
    
    const assessment = this.currentSchedule.find(a => a.id === assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    if (assessment.status !== 'pending') {
      throw new Error('Assessment is not pending');
    }
    
    // 创建响应记录
    const response = {
      assessmentId: assessmentId,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - new Date(assessment.scheduledTime).getTime(),
      data: responses || {},
      context: { ...this.collectContextData(), ...context },
      completed: true
    };
    
    // 更新评估状态
    assessment.status = 'completed';
    assessment.response = response;
    assessment.completedAt = new Date().toISOString();
    
    // 添加到响应历史
    this.responseHistory.push(response);
    this.saveResponseHistory();
    this.saveSchedule();
    
    // 分析响应
    this.analyzeResponse(response);
    
    return {
      id: assessmentId,
      status: 'completed',
      response: response,
      analysis: response.analysis || {
        moodScore: this.calculateMoodScore(responses),
        trend: 'stable',
        insights: this.generateInsightsFromResponses(responses)
      }
    };
  }
  
  // 生成EMA洞察报告
  generateEMAInsights(recentAssessments) {
    if (!Array.isArray(recentAssessments) || recentAssessments.length === 0) {
      return {
        summary: '暂无足够数据进行洞察分析',
        recommendations: [],
        trends: [],
        patterns: [],
        timestamp: new Date().toISOString()
      };
    }
    
    const insights = {
      summary: '',
      recommendations: [],
      trends: [],
      patterns: [],
      timestamp: new Date().toISOString()
    };
    
    // 分析情绪趋势
    const moodScores = recentAssessments.map(a => a.responses?.mood || a.response?.data?.mood || 5);
    const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    const moodTrend = this.analyzeMoodTrend({ data: { mood: moodScores[moodScores.length - 1] } });
    
    insights.summary = `最近${recentAssessments.length}次评估的平均情绪评分为${avgMood.toFixed(1)}分`;
    
    // 生成建议
    if (moodTrend && moodTrend.trend === 'declining') {
      insights.recommendations.push({
        type: 'mood_support',
        priority: 'high',
        suggestion: '情绪呈下降趋势，建议增加放松活动或寻求支持',
        action: '尝试深呼吸练习或与朋友交流'
      });
    }
    
    if (avgMood < 4) {
      insights.recommendations.push({
        type: 'mood_improvement',
        priority: 'medium',
        suggestion: '情绪评分偏低，建议关注积极的活动或回忆',
        action: '记录今天发生的积极事情'
      });
    }
    
    // 分析响应模式
    const responseTimes = recentAssessments.map(a => a.response?.responseTime || 0);
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    
    if (avgResponseTime > 60000) {
      insights.recommendations.push({
        type: 'response_optimization',
        priority: 'low',
        suggestion: '平均响应时间较长，可以考虑简化评估流程',
        action: '优化评估界面或问题数量'
      });
    }
    
    insights.trends.push({
      type: 'mood',
      direction: moodTrend?.trend || 'stable',
      change: moodTrend?.change || 0,
      average: avgMood
    });
    
    // 添加模式分析
    insights.patterns.push({
      type: 'completion_rate',
      description: '完成率模式',
      value: recentAssessments.filter(a => a.completed || a.response).length / recentAssessments.length
    });
    
    return insights;
  }

  // 清理方法
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
  
  // 计算情绪分数
  calculateMoodScore(responses) {
    if (!responses) return 5;
    
    // 简单的情绪分数计算
    const moodScore = responses.mood || responses.energy || 5;
    return Math.max(1, Math.min(10, moodScore));
  }
  
  // 从响应生成洞察
  generateInsightsFromResponses(responses) {
    const insights = [];
    
    if (responses.mood && responses.mood < 4) {
      insights.push({
        type: 'low_mood',
        severity: 'medium',
        message: '情绪评分偏低',
        suggestion: '尝试一些积极的活动'
      });
    }
    
    if (responses.stress && responses.stress > 7) {
      insights.push({
        type: 'high_stress',
        severity: 'high',
        message: '压力水平较高',
        suggestion: '考虑进行放松练习'
      });
    }
    
    return insights;
  }
}

// EMA数据收集表单配置
const EMA_FORM_CONFIG = {
  id: 'ema',
  title: '生态瞬时评估',
  sections: [
    {
      id: 'mood',
      title: '情绪状态',
      questions: [
        {
          id: 'current_mood',
          type: 'scale',
          label: '您现在的情绪如何？',
          min: 1,
          max: 10,
          minLabel: '非常消极',
          maxLabel: '非常积极',
          required: true
        },
        {
          id: 'emotion_type',
          type: 'multiple_choice',
          label: '您现在主要感受到什么情绪？(可多选)',
          options: [
            '快乐', '平静', '兴奋', '感激',
            '焦虑', '压力', '沮丧', '愤怒',
            '无聊', '疲惫', '困惑', '其他'
          ],
          multiple: true,
          required: false
        }
      ]
    },
    {
      id: 'context',
      title: '当前情境',
      questions: [
        {
          id: 'current_activity',
          type: 'single_choice',
          label: '您现在主要在做什么？',
          options: [
            '工作', '学习', '休息', '运动',
            '社交', '用餐', '通勤', '娱乐',
            '家务', '睡觉', '其他'
          ],
          required: true
        },
        {
          id: 'social_context',
          type: 'single_choice',
          label: '您现在和谁在一起？',
          options: [
            '独自一人', '家人', '朋友', '同事',
            '陌生人', '客户', '伴侣', '其他'
          ],
          required: true
        },
        {
          id: 'location',
          type: 'single_choice',
          label: '您现在在哪里？',
          options: [
            '家里', '工作场所', '学校', '公共场所',
            '交通工具', '户外', '商店', '其他'
          ],
          required: true
        }
      ]
    },
    {
      id: 'wellbeing',
      title: '幸福感',
      questions: [
        {
          id: 'energy_level',
          type: 'scale',
          label: '您现在感觉精力如何？',
          min: 1,
          max: 10,
          minLabel: '非常疲惫',
          maxLabel: '精力充沛',
          required: true
        },
        {
          id: 'stress_level',
          type: 'scale',
          label: '您现在感到压力有多大？',
          min: 1,
          max: 10,
          minLabel: '毫无压力',
          maxLabel: '压力极大',
          required: true
        }
      ]
    }
  ],
  
  // 扁平化的问题列表（用于测试兼容性）
  questions: [
    {
      id: 'current_mood',
      text: '您现在的情绪如何？',
      type: 'scale',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
      id: 'emotion_type',
      text: '您现在主要感受到什么情绪？(可多选)',
      type: 'multiple_choice',
      options: ['快乐', '平静', '兴奋', '感激', '焦虑', '压力', '沮丧', '愤怒', '无聊', '疲惫', '困惑', '其他']
    },
    {
      id: 'current_activity',
      text: '您现在主要在做什么？',
      type: 'single_choice',
      options: ['工作', '学习', '休息', '运动', '社交', '用餐', '通勤', '娱乐', '家务', '睡觉', '其他']
    },
    {
      id: 'social_context',
      text: '您现在和谁在一起？',
      type: 'single_choice',
      options: ['独自一人', '家人', '朋友', '同事', '陌生人', '客户', '伴侣', '其他']
    },
    {
      id: 'location',
      text: '您现在在哪里？',
      type: 'single_choice',
      options: ['家里', '工作场所', '学校', '公共场所', '交通工具', '户外', '商店', '其他']
    },
    {
      id: 'energy_level',
      text: '您现在感觉精力如何？',
      type: 'scale',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
      id: 'stress_level',
      text: '您现在感到压力有多大？',
      type: 'scale',
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    }
  ],
  
  // 评分配置
  scoring: {
    scales: [
      { id: 'mood', questions: ['current_mood'], weight: 1.0 },
      { id: 'energy', questions: ['energy_level'], weight: 0.8 },
      { id: 'stress', questions: ['stress_level'], weight: 1.2 }
    ],
    weights: {
      mood: 0.4,
      energy: 0.3,
      stress: 0.3
    }
  },
  
  completionTime: '30秒',
  maxQuestions: 8
};

// 导出模块
module.exports = { EMAEngine, EMA_FORM_CONFIG };