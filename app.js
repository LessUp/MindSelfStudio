// MindSelf Studio 主应用 - 模块化重构版本
// 集成DASS-21、WHO-5、EMA和数据可视化功能

// 导入模块 (使用动态导入确保兼容性)
let DASS21_SCALE, DASS21ScoringEngine, DASS21_CITATIONS;
let WHO5_SCALE, WHO5ScoringEngine, WHO5_CITATIONS;
let EMAEngine, EMA_FORM_CONFIG;
let VisualizationEngine;

// 动态加载模块
async function loadModules() {
  try {
    // 加载DASS-21模块
    const dass21Module = await import('./src/scales/dass21.js');
    DASS21_SCALE = dass21Module.DASS_21_SCALE;
    DASS21ScoringEngine = dass21Module.DASS21ScoringEngine;
    DASS21_CITATIONS = dass21Module.DASS21_CITATIONS;
    
    // 加载WHO-5模块
    const who5Module = await import('./src/scales/who5.js');
    WHO5_SCALE = who5Module.WHO5_SCALE;
    WHO5ScoringEngine = who5Module.WHO5ScoringEngine;
    WHO5_CITATIONS = who5Module.WHO5_CITATIONS;
    
    // 加载EMA模块
    const emaModule = await import('./src/ema/emaEngine.js');
    EMAEngine = emaModule.EMAEngine;
    EMA_FORM_CONFIG = emaModule.EMA_FORM_CONFIG;
    
    // 加载可视化模块
    const vizModule = await import('./src/visualization/visualizationEngine.js');
    VisualizationEngine = vizModule.VisualizationEngine;
    
    console.log('All modules loaded successfully');
  } catch (error) {
    console.error('Failed to load modules:', error);
    // 回退到原始量表定义
    loadFallbackModules();
  }
}

// 回退模块定义
function loadFallbackModules() {
  // 如果动态加载失败，使用原始定义
  console.log('Using fallback module definitions');
}

// 扩展现有量表定义
const EXTENDED_SCALES = {
  ...SCALES, // 保留原始量表
  dass21: DASS21_SCALE,
  who5: WHO5_SCALE
};

// 扩展引用文献
const EXTENDED_CITATIONS = {
  ...CITATIONS,
  dass21: DASS21_CITATIONS,
  who5: WHO5_CITATIONS
};

// 应用状态管理
const appState = {
  view: 'home',
  current: null,
  answers: [],
  history: [],
  emaEngine: null,
  visualizationEngine: null,
  modulesLoaded: false
};

// 初始化函数
async function initializeApp() {
  console.log('Initializing MindSelf Studio...');
  
  // 加载模块
  await loadModules();
  
  // 初始化引擎
  initializeEngines();
  
  // 渲染界面
  renderHome();
  
  // 初始化事件监听
  initializeEventListeners();
  
  // 初始化EMA系统
  initializeEMA();
  
  // 初始化隐私设置
  initPrivacy();
  
  appState.modulesLoaded = true;
  console.log('MindSelf Studio initialized successfully');
}

// 初始化引擎
function initializeEngines() {
  // 初始化EMA引擎
  if (EMAEngine) {
    appState.emaEngine = new EMAEngine({
      dailyAssessments: 4,
      quietHours: { start: 22, end: 7 },
      assessmentWindow: 30,
      reminderInterval: 5
    });
  }
  
  // 初始化可视化引擎
  if (VisualizationEngine) {
    appState.visualizationEngine = new VisualizationEngine({
      colorScheme: 'modern',
      animationDuration: 1000,
      responsive: true
    });
  }
}

// 初始化事件监听器
function initializeEventListeners() {
  // 量表相关事件
  document.addEventListener('click', handleGlobalClick);
  
  // 仪表板相关事件
  document.getElementById('exportDashboard')?.addEventListener('click', exportDashboardReport);
  document.getElementById('refreshDashboard')?.addEventListener('click', refreshDashboard);
  document.getElementById('backHomeFromDashboard')?.addEventListener('click', () => switchView('home'));
  
  // EMA相关回调
  if (window.emaNotificationCallback) {
    window.emaNotificationCallback = handleEMANotification;
  }
  
  if (window.emaAssessmentCallback) {
    window.emaAssessmentCallback = handleEMAAssessment;
  }
  
  if (window.emaInsightCallback) {
    window.emaInsightCallback = handleEMAInsight;
  }
}

// 全局点击处理
function handleGlobalClick(event) {
  const target = event.target;
  
  // 处理量表卡片点击
  if (target.dataset.scale) {
    startTest(target.dataset.scale);
    return;
  }
  
  // 处理EMA相关点击
  if (target.dataset.emaAction) {
    handleEMAAction(target.dataset.emaAction, target.dataset);
    return;
  }
  
  // 处理可视化相关点击
  if (target.dataset.vizAction) {
    handleVisualizationAction(target.dataset.vizAction, target.dataset);
    return;
  }
}

// EMA动作处理
function handleEMAAction(action, data) {
  switch (action) {
    case 'start_ema':
      startEMAAssessment();
      break;
    case 'snooze_ema':
      snoozeEMAAssessment(data.assessmentId);
      break;
    case 'complete_ema':
      completeEMAAssessment();
      break;
    case 'view_ema_stats':
      viewEMAStatistics();
      break;
    default:
      console.warn('Unknown EMA action:', action);
  }
}

// 可视化动作处理
function handleVisualizationAction(action, data) {
  switch (action) {
    case 'export_chart':
      exportChart(data.chartId, data.format);
      break;
    case 'toggle_chart_type':
      toggleChartType(data.chartId, data.chartType);
      break;
    case 'view_dashboard':
      viewHealthDashboard();
      break;
    default:
      console.warn('Unknown visualization action:', action);
  }
}

// 查看健康仪表板
function viewHealthDashboard() {
  switchView('dashboard');
  renderHealthDashboard();
}

// 渲染健康仪表板
function renderHealthDashboard() {
  const container = el('dashboard-container');
  if (!container) return;
  
  // 更新仪表板时间
  el('dashboard-update-time').textContent = new Date().toLocaleString('zh-CN');
  
  // 获取历史数据
  const history = getHistory();
  if (!history || history.length === 0) {
    renderEmptyDashboard();
    return;
  }
  
  // 计算统计数据
  const stats = calculateDashboardStats(history);
  
  // 更新统计卡片
  updateDashboardCards(stats);
  
  // 渲染图表
  renderDashboardCharts(history, stats);
  
  // 渲染历史记录表格
  renderAssessmentHistory(history);
}

// 渲染空仪表板
function renderEmptyDashboard() {
  const container = el('dashboard-container');
  container.innerHTML = `
    <div class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">暂无评估数据</h3>
      <p class="text-gray-600 mb-6">完成心理健康评估后，您将看到详细的数据分析和趋势图表。</p>
      <button onclick="switchView('home')" class="inline-flex items-center px-4 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
        开始评估
      </button>
    </div>
  `;
}

// 计算仪表板统计数据
function calculateDashboardStats(history) {
  const recent = history.slice(-30); // 最近30条记录
  const dass21Records = recent.filter(r => r.id === 'dass21');
  const who5Records = recent.filter(r => r.id === 'who5');
  const phq9Records = recent.filter(r => r.id === 'phq9');
  const gad7Records = recent.filter(r => r.id === 'gad7');
  const pss10Records = recent.filter(r => r.id === 'pss10');
  
  // 计算总体心理健康指数（基于WHO-5和最近评估）
  const overallWellbeing = calculateOverallWellbeing(who5Records, recent);
  
  // 计算抑郁风险（基于PHQ-9和DASS-21）
  const depressionRisk = calculateDepressionRisk(phq9Records, dass21Records);
  
  // 计算焦虑水平（基于GAD-7和DASS-21）
  const anxietyLevel = calculateAnxietyLevel(gad7Records, dass21Records);
  
  // 计算压力指数（基于PSS-10）
  const stressIndex = calculateStressIndex(pss10Records);
  
  return {
    overallWellbeing,
    depressionRisk,
    anxietyLevel,
    stressIndex,
    recentRecords: recent,
    dass21Records,
    who5Records,
    phq9Records,
    gad7Records,
    pss10Records
  };
}

// 计算总体心理健康指数
function calculateOverallWellbeing(who5Records, allRecords) {
  if (who5Records.length > 0) {
    const latest = who5Records[who5Records.length - 1];
    if (latest.detailedResults?.report?.summary?.happinessLevel) {
      return latest.detailedResults.report.summary.happinessLevel.level;
    }
  }
  
  // 如果没有WHO-5数据，基于最近评估估算
  if (allRecords.length > 0) {
    const latest = allRecords[allRecords.length - 1];
    if (latest.level.includes('轻度')) return '一般';
    if (latest.level.includes('中度')) return '较差';
    if (latest.level.includes('重度')) return '很差';
    return '良好';
  }
  
  return '未知';
}

// 计算抑郁风险
function calculateDepressionRisk(phq9Records, dass21Records) {
  let riskLevel = '低风险';
  let hasHighRisk = false;
  
  // 基于PHQ-9评估
  if (phq9Records.length > 0) {
    const latest = phq9Records[phq9Records.length - 1];
    if (latest.level.includes('中度') || latest.level.includes('重度')) {
      riskLevel = '高风险';
      hasHighRisk = true;
    } else if (latest.level.includes('轻度')) {
      riskLevel = '中等风险';
    }
  }
  
  // 基于DASS-21评估
  if (dass21Records.length > 0 && !hasHighRisk) {
    const latest = dass21Records[dass21Records.length - 1];
    if (latest.detailedResults?.interpretation?.subscaleAnalysis?.depression) {
      const depression = latest.detailedResults.interpretation.subscaleAnalysis.depression;
      if (depression.level.includes('中度') || depression.level.includes('重度')) {
        riskLevel = '高风险';
      } else if (depression.level.includes('轻度') && riskLevel === '低风险') {
        riskLevel = '中等风险';
      }
    }
  }
  
  return riskLevel;
}

// 计算焦虑水平
function calculateAnxietyLevel(gad7Records, dass21Records) {
  let anxietyLevel = '正常';
  
  // 基于GAD-7评估
  if (gad7Records.length > 0) {
    const latest = gad7Records[gad7Records.length - 1];
    if (latest.level.includes('中度') || latest.level.includes('重度')) {
      anxietyLevel = '较高';
    } else if (latest.level.includes('轻度')) {
      anxietyLevel = '轻微';
    }
  }
  
  // 基于DASS-21评估
  if (dass21Records.length > 0 && anxietyLevel === '正常') {
    const latest = dass21Records[dass21Records.length - 1];
    if (latest.detailedResults?.interpretation?.subscaleAnalysis?.anxiety) {
      const anxiety = latest.detailedResults.interpretation.subscaleAnalysis.anxiety;
      if (anxiety.level.includes('中度') || anxiety.level.includes('重度')) {
        anxietyLevel = '较高';
      } else if (anxiety.level.includes('轻度')) {
        anxietyLevel = '轻微';
      }
    }
  }
  
  return anxietyLevel;
}

// 计算压力指数
function calculateStressIndex(pss10Records) {
  if (pss10Records.length === 0) return '未知';
  
  const latest = pss10Records[pss10Records.length - 1];
  if (latest.level.includes('高')) return '高';
  if (latest.level.includes('中')) return '中等';
  if (latest.level.includes('低')) return '低';
  
  return '未知';
}

// 更新仪表板卡片
function updateDashboardCards(stats) {
  el('overall-wellbeing').textContent = stats.overallWellbeing;
  el('depression-risk').textContent = stats.depressionRisk;
  el('anxiety-level').textContent = stats.anxietyLevel;
  el('stress-index').textContent = stats.stressIndex;
  
  // 根据风险级别设置颜色
  const cards = [
    { element: 'overall-wellbeing', value: stats.overallWellbeing },
    { element: 'depression-risk', value: stats.depressionRisk },
    { element: 'anxiety-level', value: stats.anxietyLevel },
    { element: 'stress-index', value: stats.stressIndex }
  ];
  
  cards.forEach(card => {
    const element = el(card.element);
    const parent = element.closest('.bg-white');
    
    // 重置颜色
    parent.className = 'bg-white rounded-xl border border-gray-200 p-6';
    
    // 根据值设置颜色
    if (card.value.includes('高') || card.value.includes('较差') || card.value.includes('很差')) {
      parent.classList.add('border-red-200', 'bg-red-50');
    } else if (card.value.includes('中等') || card.value.includes('轻微')) {
      parent.classList.add('border-yellow-200', 'bg-yellow-50');
    } else if (card.value.includes('良好') || card.value.includes('正常') || card.value.includes('低')) {
      parent.classList.add('border-green-200', 'bg-green-50');
    }
  });
}

// 渲染仪表板图表
function renderDashboardCharts(history, stats) {
  if (!appState.visualizationEngine) return;
  
  try {
    // 心理健康趋势图
    const trendData = prepareTrendData(history);
    appState.visualizationEngine.createMentalHealthTrendChart('mental-health-trend-chart', trendData);
    
    // 多维度雷达图
    const radarData = prepareRadarData(stats);
    appState.visualizationEngine.createWellbeingRadarChart('wellbeing-radar-chart', radarData);
    
    // 量表对比图
    const comparisonData = prepareComparisonData(stats);
    appState.visualizationEngine.createScaleComparisonChart('scale-comparison-chart', comparisonData);
    
    // 情绪热力图
    const heatmapData = prepareHeatmapData(history);
    appState.visualizationEngine.createEmotionHeatmap('emotion-heatmap', heatmapData);
    
  } catch (error) {
    console.error('Error rendering dashboard charts:', error);
    // 显示错误信息或回退到简单图表
  }
}

// 准备趋势数据
function prepareTrendData(history) {
  const last30Days = history.filter(record => {
    const recordDate = new Date(record.at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  }).sort((a, b) => a.at - b.at);
  
  return {
    labels: last30Days.map(record => new Date(record.at).toLocaleDateString('zh-CN')),
    datasets: [
      {
        label: 'PHQ-9',
        data: last30Days.filter(r => r.id === 'phq9').map(r => ({ x: new Date(r.at).toLocaleDateString('zh-CN'), y: r.sum })),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)'
      },
      {
        label: 'GAD-7',
        data: last30Days.filter(r => r.id === 'gad7').map(r => ({ x: new Date(r.at).toLocaleDateString('zh-CN'), y: r.sum })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      },
      {
        label: 'WHO-5',
        data: last30Days.filter(r => r.id === 'who5').map(r => ({ x: new Date(r.at).toLocaleDateString('zh-CN'), y: r.detailedResults?.report?.summary?.percentageScore || 0 })),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      }
    ]
  };
}

// 准备雷达图数据
function prepareRadarData(stats) {
  const latestDASS21 = stats.dass21Records[stats.dass21Records.length - 1];
  const latestWHO5 = stats.who5Records[stats.who5Records.length - 1];
  const latestPHQ9 = stats.phq9Records[stats.phq9Records.length - 1];
  const latestGAD7 = stats.gad7Records[stats.gad7Records.length - 1];
  const latestPSS10 = stats.pss10Records[stats.pss10Records.length - 1];
  
  return {
    labels: ['抑郁', '焦虑', '压力', '幸福感', '整体健康'],
    datasets: [{
      label: '当前状态',
      data: [
        latestPHQ9 ? (latestPHQ9.sum / 27) * 100 : 0,
        latestGAD7 ? (latestGAD7.sum / 21) * 100 : 0,
        latestPSS10 ? (latestPSS10.sum / 40) * 100 : 0,
        latestWHO5?.detailedResults?.report?.summary?.percentageScore || 0,
        latestWHO5?.detailedResults?.report?.summary?.percentageScore || 50
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)'
    }]
  };
}

// 准备对比数据
function prepareComparisonData(stats) {
  const scaleNames = {
    phq9: 'PHQ-9',
    gad7: 'GAD-7',
    pss10: 'PSS-10',
    who5: 'WHO-5',
    dass21: 'DASS-21'
  };
  
  const data = [];
  
  ['phq9', 'gad7', 'pss10', 'who5', 'dass21'].forEach(scaleId => {
    const records = stats[`${scaleId}Records`];
    if (records.length > 0) {
      const latest = records[records.length - 1];
      const score = latest.detailedResults?.standardizedScores?.total || latest.sum || 0;
      const max = latest.detailedResults?.standardizedScores?.max || latest.max || 100;
      data.push({
        scale: scaleNames[scaleId],
        score: (score / max) * 100,
        rawScore: score,
        maxScore: max
      });
    }
  });
  
  return {
    labels: data.map(d => d.scale),
    datasets: [{
      label: '标准化得分 (%)',
      data: data.map(d => d.score),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };
}

// 准备热力图数据
function prepareHeatmapData(history) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString('zh-CN'));
  }
  
  const emotions = ['快乐', '平静', '焦虑', '抑郁', '愤怒', '压力'];
  const data = [];
  
  emotions.forEach((emotion, emotionIndex) => {
    last7Days.forEach((date, dayIndex) => {
      // 模拟情绪数据，实际应该从EMA数据中获取
      const intensity = Math.random() * 100;
      data.push({
        x: dayIndex,
        y: emotionIndex,
        v: intensity,
        date: date,
        emotion: emotion
      });
    });
  });
  
  return {
    labels: last7Days,
    emotions: emotions,
    data: data
  };
}

// 渲染评估历史表格
function renderAssessmentHistory(history) {
  const tbody = el('assessment-history-tbody');
  if (!tbody) return;
  
  const recentHistory = history.slice(-20).reverse(); // 最近20条，倒序显示
  
  tbody.innerHTML = recentHistory.map(record => {
    const date = new Date(record.at);
    const dateStr = date.toLocaleDateString('zh-CN');
    const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    const scaleNames = {
      phq9: 'PHQ-9抑郁量表',
      gad7: 'GAD-7焦虑量表',
      pss10: 'PSS-10压力量表',
      who5: 'WHO-5幸福感量表',
      dass21: 'DASS-21综合量表'
    };
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>${dateStr}</div>
          <div class="text-gray-500">${timeStr}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${scaleNames[record.id] || record.title}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div class="font-medium">${record.sum}/${record.max}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColorClass(record.level)}">
            ${record.level}
          </span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">
          ${getBriefAdvice(record)}
        </td>
      </tr>
    `;
  }).join('');
}

// 获取严重程度颜色类
function getSeverityColorClass(level) {
  if (level.includes('重度') || level.includes('高')) {
    return 'bg-red-100 text-red-800';
  } else if (level.includes('中度') || level.includes('中等')) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (level.includes('轻度') || level.includes('轻微')) {
    return 'bg-blue-100 text-blue-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
}

// 获取简要建议
function getBriefAdvice(record) {
  if (record.level.includes('重度') || record.level.includes('高')) {
    return '建议寻求专业帮助';
  } else if (record.level.includes('中度') || record.level.includes('中等')) {
    return '建议关注心理健康';
  } else if (record.level.includes('轻度') || record.level.includes('轻微')) {
    return '保持良好状态';
  } else {
    return '继续保持';
  }
}

// 导出仪表板报告
function exportDashboardReport() {
  const history = getHistory();
  if (!history || history.length === 0) {
    alert('暂无数据可导出');
    return;
  }
  
  const stats = calculateDashboardStats(history);
  const report = generateDashboardReport(history, stats);
  
  // 创建下载链接
  const blob = new Blob([report], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `心理健康报告_${new Date().toLocaleDateString('zh-CN')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 生成仪表板报告
function generateDashboardReport(history, stats) {
  const reportDate = new Date().toLocaleString('zh-CN');
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>心理健康报告 - MindSelf Studio</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 40px; }
    .section { margin-bottom: 30px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1e40af; }
    .stat-label { color: #64748b; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>心理健康评估报告</h1>
    <p>生成时间：${reportDate}</p>
  </div>
  
  <div class="section">
    <h2>总体概况</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${stats.overallWellbeing}</div>
        <div class="stat-label">总体心理健康</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.depressionRisk}</div>
        <div class="stat-label">抑郁风险</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.anxietyLevel}</div>
        <div class="stat-label">焦虑水平</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.stressIndex}</div>
        <div class="stat-label">压力指数</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2>评估历史</h2>
    <table>
      <thead>
        <tr>
          <th>评估日期</th>
          <th>量表类型</th>
          <th>得分</th>
          <th>严重程度</th>
          <th>建议</th>
        </tr>
      </thead>
      <tbody>
        ${history.slice(-20).reverse().map(record => {
          const date = new Date(record.at);
          const scaleNames = {
            phq9: 'PHQ-9抑郁量表',
            gad7: 'GAD-7焦虑量表',
            pss10: 'PSS-10压力量表',
            who5: 'WHO-5幸福感量表',
            dass21: 'DASS-21综合量表'
          };
          
          return `
            <tr>
              <td>${date.toLocaleString('zh-CN')}</td>
              <td>${scaleNames[record.id] || record.title}</td>
              <td>${record.sum}/${record.max}</td>
              <td>${record.level}</td>
              <td>${getBriefAdvice(record)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <p><strong>免责声明：</strong></p>
    <p>本报告基于您的心理健康自评数据生成，仅供参考，不能替代专业医疗诊断。如有明显心理困扰，请及时寻求专业医生或心理咨询师的帮助。</p>
    <p>本报告生成于 ${reportDate}，MindSelf Studio 心理健康评估平台。</p>
  </div>
</body>
</html>
  `;
}

// 刷新仪表板
function refreshDashboard() {
  const button = el('refreshDashboard');
  const originalText = button.innerHTML;
  
  button.innerHTML = '<svg class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>刷新中...';
  button.disabled = true;
  
  setTimeout(() => {
    renderHealthDashboard();
    button.innerHTML = originalText;
    button.disabled = false;
  }, 1500);
}

// 扩展主页渲染
function renderHome() {
  const container = el('cards-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 渲染量表卡片
  Object.values(EXTENDED_SCALES).forEach(scale => {
    if (!scale) return; // 跳过未加载的量表
    
    const card = createScaleCard(scale);
    container.appendChild(card);
  });
  
  // 添加EMA卡片
  if (appState.emaEngine) {
    const emaCard = createEMACard();
    container.appendChild(emaCard);
  }
  
  // 添加仪表板卡片
  if (appState.visualizationEngine) {
    const dashboardCard = createDashboardCard();
    container.appendChild(dashboardCard);
  }
  
  // 绑定事件
  bindHomeEvents();
  renderHistory();
  renderEMAStatus();
  
  switchView('home');
}

// 创建量表卡片
function createScaleCard(scale) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow';
  
  const btn = document.createElement('button');
  btn.dataset.scale = scale.id;
  btn.className = 'mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 w-full transition-colors';
  btn.textContent = '开始评估';
  
  card.innerHTML = `
    <div class="flex-1">
      <h3 class="font-semibold text-lg text-gray-900">${scale.title}</h3>
      <p class="text-gray-600 mt-1 text-sm">${scale.description || scale.desc}</p>
      <div class="mt-3 flex items-center text-xs text-gray-500">
        <span class="bg-gray-100 px-2 py-1 rounded">${scale.questions?.length || 0}题</span>
        <span class="mx-2">•</span>
        <span>约${Math.ceil((scale.questions?.length || 0) * 0.7)}分钟</span>
      </div>
    </div>
  `;
  
  card.appendChild(btn);
  return card;
}

// 创建EMA卡片
function createEMACard() {
  const card = document.createElement('div');
  card.className = 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 flex flex-col hover:shadow-md transition-shadow';
  
  card.innerHTML = `
    <div class="flex-1">
      <div class="flex items-center mb-2">
        <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
        <h3 class="font-semibold text-lg text-blue-900">生态瞬时评估</h3>
      </div>
      <p class="text-blue-700 text-sm mb-3">实时记录情绪状态，追踪日常心理健康变化</p>
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-blue-600">
          <span>今日评估</span>
          <span id="ema-today-count">0/4</span>
        </div>
        <div class="w-full bg-blue-100 rounded-full h-2">
          <div id="ema-progress" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    </div>
    <button data-ema-action="view_ema_stats" class="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 w-full transition-colors">
      查看统计
    </button>
  `;
  
  return card;
}

// 创建仪表板卡片
function createDashboardCard() {
  const card = document.createElement('div');
  card.className = 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-5 flex flex-col hover:shadow-md transition-shadow';
  
  card.innerHTML = `
    <div class="flex-1">
      <div class="flex items-center mb-2">
        <div class="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
        <h3 class="font-semibold text-lg text-purple-900">健康仪表板</h3>
      </div>
      <p class="text-purple-700 text-sm mb-3">可视化展示心理健康趋势和多维度分析</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="bg-white bg-opacity-50 rounded p-2 text-center">
          <div class="text-purple-600 font-medium">趋势分析</div>
          <div class="text-purple-800 text-lg font-bold">7天</div>
        </div>
        <div class="bg-white bg-opacity-50 rounded p-2 text-center">
          <div class="text-purple-600 font-medium">量表对比</div>
          <div class="text-purple-800 text-lg font-bold">6项</div>
        </div>
      </div>
    </div>
    <button data-viz-action="view_dashboard" class="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 w-full transition-colors">
      查看仪表板
    </button>
  `;
  
  return card;
}

// 扩展量表评分函数
function score(scaleId, answers) {
  // 处理新量表
  if (scaleId === 'dass21' && DASS21ScoringEngine) {
    const engine = new DASS21ScoringEngine();
    return engine.assess(answers);
  }
  
  if (scaleId === 'who5' && WHO5ScoringEngine) {
    const engine = new WHO5ScoringEngine();
    return engine.assess(answers);
  }
  
  // 处理原有量表
  if (scaleId === 'phq9') {
    const sum = answers.reduce((a, b) => a + b, 0);
    const grade = gradePHQ9(sum);
    const advice = advisePHQ9(sum);
    let safety = null;
    if (answers[8] >= 1) {
      safety = '提示：第9题涉及安全风险。如存在自伤或伤人想法，请立即联系当地应急援助或前往医院急诊。';
    }
    return { sum, max: 27, grade, advice, safety };
  }
  
  if (scaleId === 'gad7') {
    const sum = answers.reduce((a, b) => a + b, 0);
    const grade = gradeGAD7(sum);
    const advice = adviseGAD7(sum);
    return { sum, max: 21, grade, advice };
  }
  
  if (scaleId === 'pss10') {
    const scored = answers.map((v, i) => (EXTENDED_SCALES.pss10.questions[i].reverse ? reversePSS(v) : v));
    const sum = scored.reduce((a, b) => a + b, 0);
    const grade = gradePSS10(sum);
    const advice = advisePSS10(sum);
    return { sum, max: 40, grade, advice };
  }
  
  return null;
}

// 扩展结果渲染
function renderResult(result) {
  if (!result) return;
  
  el('result-title').textContent = state.current.title;
  
  // 处理不同类型的结果
  if (result.interpretation) {
    // 新量表结果（如DASS-21、WHO-5）
    renderAdvancedResults(result);
  } else {
    // 原有量表结果
    renderBasicResults(result);
  }
  
  // 保存历史记录
  const record = {
    id: state.current.id,
    title: state.current.title,
    sum: result.sum || result.standardizedScores?.total || 0,
    max: result.max || 100,
    level: result.grade?.level || result.happinessLevel?.level || '评估完成',
    at: Date.now(),
    detailedResults: result
  };
  
  saveHistory(record);
  switchView('result');
}

// 渲染高级结果（新量表）
function renderAdvancedResults(result) {
  if (result.interpretation) {
    // DASS-21结果
    renderDASS21Results(result);
  } else if (result.report) {
    // WHO-5结果
    renderWHO5Results(result);
  }
}

// 渲染DASS-21结果
function renderDASS21Results(result) {
  const interpretation = result.interpretation;
  
  el('result-score').innerHTML = `
    <div class="text-sm text-gray-600 mb-2">多维度评估结果</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${Object.keys(interpretation.subscaleAnalysis).map(key => {
        const subscale = interpretation.subscaleAnalysis[key];
        return `
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-900">${subscale.score}</div>
            <div class="text-sm text-gray-600">${subscale.name}</div>
            <div class="mt-2 inline-block px-2 py-1 rounded text-xs ${subscale.color}">
              ${subscale.level}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // 总体评估
  const sev = el('result-severity');
  sev.className = 'mt-4 inline-block px-3 py-2 rounded text-sm bg-blue-50 text-blue-700 border border-blue-200';
  sev.textContent = interpretation.summary;
  
  // 建议
  const advice = el('result-advice');
  advice.innerHTML = interpretation.recommendations.map(rec => 
    `<div class="mb-3 p-3 bg-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-50 border border-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-200 rounded">
      <div class="font-medium text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-800">${rec.category} - ${rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'}</div>
      <div class="text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-700 text-sm mt-1">${rec.suggestion}</div>
    </div>`
  ).join('');
  
  // 风险预警
  if (interpretation.riskAlerts && interpretation.riskAlerts.length > 0) {
    const safetyDiv = el('safety-note');
    safetyDiv.innerHTML = interpretation.riskAlerts.map(alert => 
      `<div class="mb-2 p-3 bg-red-50 border border-red-200 rounded">
        <div class="font-medium text-red-800">${alert.message}</div>
        <div class="text-red-700 text-sm mt-1">${alert.action}</div>
      </div>`
    ).join('');
    safetyDiv.classList.remove('hidden');
  }
}

// 渲染WHO-5结果
function renderWHO5Results(result) {
  const report = result.report;
  
  el('result-score').innerHTML = `
    <div class="text-center">
      <div class="text-4xl font-bold text-emerald-600">${report.summary.percentageScore}分</div>
      <div class="text-sm text-gray-600 mt-1">幸福感指数 (满分100分)</div>
      <div class="mt-2 inline-block px-3 py-1 rounded text-sm ${report.summary.happinessLevel.color}">
        ${report.summary.happinessLevel.level}
      </div>
    </div>
  `;
  
  const sev = el('result-severity');
  sev.className = `mt-4 inline-block px-3 py-2 rounded text-sm ${report.summary.happinessLevel.color}`;
  sev.textContent = report.interpretation.levelDescription;
  
  const advice = el('result-advice');
  advice.innerHTML = report.recommendations.map(rec => 
    `<div class="mb-3 p-3 bg-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-50 border border-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-200 rounded">
      <div class="font-medium text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-800">${rec.type}</div>
      <div class="text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-700 text-sm mt-1">${rec.suggestion}</div>
    </div>`
  ).join('');
}

// 渲染基本结果（原有量表）
function renderBasicResults(result) {
  el('result-score').textContent = `总分 ${result.sum} / ${result.max}`;
  
  const sev = el('result-severity');
  sev.className = `mt-1 inline-block px-2 py-1 rounded text-sm border ${result.grade.color}`;
  sev.textContent = result.grade.level;
  
  const advice = el('result-advice');
  advice.innerHTML = result.advice.map(p => `<p>${p}</p>`).join('');
  
  const citations = el('result-citations');
  citations.innerHTML = '';
  (EXTENDED_CITATIONS[state.current.id] || []).forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="text-emerald-700 hover:underline" href="${c.url}" target="_blank" rel="noopener">${c.text}</a>`;
    citations.appendChild(li);
  });
  
  const safety = el('safety-note');
  if (result.safety) {
    safety.textContent = result.safety;
    safety.classList.remove('hidden');
  } else {
    safety.classList.add('hidden');
  }
}

// EMA功能实现
function initializeEMA() {
  if (!appState.emaEngine) return;
  
  renderEMAStatus();
  
  // 设置EMA回调
  window.emaNotificationCallback = handleEMANotification;
  window.emaAssessmentCallback = handleEMAAssessment;
  window.emaInsightCallback = handleEMAInsight;
}

// 渲染EMA状态
function renderEMAStatus() {
  const stats = appState.emaEngine.getEMAStatistics(1); // 今日统计
  const progress = stats.totalAssessments > 0 ? (stats.completedAssessments / stats.totalAssessments) * 100 : 0;
  
  const countElement = el('ema-today-count');
  if (countElement) {
    countElement.textContent = `${stats.completedAssessments}/${stats.totalAssessments}`;
  }
  
  const progressElement = el('ema-progress');
  if (progressElement) {
    progressElement.style.width = `${progress}%`;
  }
}

// 处理EMA通知
function handleEMANotification(notification) {
  console.log('EMA Notification:', notification);
  // 显示通知UI
  showEMANotification(notification);
}

// 处理EMA评估
function handleEMAAssessment(assessment) {
  console.log('EMA Assessment:', assessment);
  // 显示评估界面
  showEMAAssessmentUI(assessment);
}

// 处理EMA洞察
function handleEMAInsight(insights) {
  console.log('EMA Insights:', insights);
  // 显示洞察信息
  showEMAInsights(insights);
}

// 显示EMA通知
function showEMANotification(notification) {
  // 创建通知UI元素
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-blue-200 p-4 max-w-sm z-50';
  notificationDiv.innerHTML = `
    <div class="flex items-start">
      <div class="flex-1">
        <h4 class="text-sm font-medium text-blue-900">${notification.title}</h4>
        <p class="text-sm text-blue-700 mt-1">${notification.message}</p>
        <div class="mt-3 flex space-x-2">
          <button data-ema-action="start_ema" class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            开始评估
          </button>
          <button data-ema-action="snooze_ema" data-assessment-id="${notification.id}" class="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">
            稍后提醒
          </button>
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(notificationDiv);
  
  // 5秒后自动移除
  setTimeout(() => {
    if (notificationDiv.parentElement) {
      notificationDiv.remove();
    }
  }, 5000);
}

// 健康仪表板功能
function viewHealthDashboard() {
  switchView('dashboard');
  renderHealthDashboard();
}

// 渲染健康仪表板
function renderHealthDashboard() {
  if (!appState.visualizationEngine) return;
  
  // 准备仪表板数据
  const dashboardData = prepareDashboardData();
  
  // 创建仪表板
  const dashboardContainer = el('dashboard-container');
  if (dashboardContainer) {
    appState.visualizationEngine.createHealthDashboard('dashboard-container', dashboardData);
  }
}

// 准备仪表板数据
function prepareDashboardData() {
  // 获取历史数据
  const history = getAssessmentHistory();
  
  // 准备趋势数据
  const trendData = prepareTrendData(history);
  
  // 准备雷达图数据
  const radarData = prepareRadarData(history);
  
  // 准备对比数据
  const comparisonData = prepareComparisonData(history);
  
  // 准备概览数据
  const overviewData = prepareOverviewData(history);
  
  // 准备建议数据
  const recommendations = prepareRecommendations(history);
  
  return {
    overview: overviewData,
    trendData: trendData,
    radarData: radarData,
    comparisonData: comparisonData,
    recommendations: recommendations
  };
}

// 准备趋势数据
function prepareTrendData(history) {
  const last7Days = getLastNDaysData(history, 7);
  
  return {
    labels: last7Days.map(d => d.date),
    depression: last7Days.map(d => d.scores?.phq9 || d.scores?.dass21?.depression || null),
    anxiety: last7Days.map(d => d.scores?.gad7 || d.scores?.dass21?.anxiety || null),
    stress: last7Days.map(d => d.scores?.pss10 || d.scores?.dass21?.stress || null),
    wellbeing: last7Days.map(d => d.scores?.who5 || null)
  };
}

// 准备雷达图数据
function prepareRadarData(history) {
  const latest = history[0];
  if (!latest) return {};
  
  return {
    dimensions: ['抑郁', '焦虑', '压力', '幸福感', '睡眠质量', '社交功能'],
    current: [
      latest.scores?.phq9 || latest.scores?.dass21?.depression || 50,
      latest.scores?.gad7 || latest.scores?.dass21?.anxiety || 50,
      latest.scores?.pss10 || latest.scores?.dass21?.stress || 50,
      latest.scores?.who5 || 50,
      70, // 睡眠质量（默认值）
      75  // 社交功能（默认值）
    ],
    target: [80, 80, 80, 90, 85, 85]
  };
}

// 准备对比数据
function prepareComparisonData(history) {
  const latest = history[0];
  if (!latest) return {};
  
  return {
    labels: ['PHQ-9', 'GAD-7', 'PSS-10', 'DASS-21', 'WHO-5'],
    scores: [
      latest.scores?.phq9 || 0,
      latest.scores?.gad7 || 0,
      latest.scores?.pss10 || 0,
      latest.scores?.dass21?.total || 0,
      latest.scores?.who5 || 0
    ]
  };
}

// 准备概览数据
function prepareOverviewData(history) {
  const latest = history[0];
  if (!latest) return {};
  
  // 计算整体健康分数
  const overallScore = calculateOverallHealthScore(latest.scores);
  
  return {
    overallHealth: getHealthLevel(overallScore),
    overallScore: overallScore,
    moodStatus: getMoodStatus(latest.scores),
    moodScore: latest.scores?.who5 || 70,
    stressLevel: getStressLevel(latest.scores),
    stressScore: latest.scores?.pss10 || latest.scores?.dass21?.stress || 60,
    sleepQuality: '良好',
    sleepScore: 80
  };
}

// 计算整体健康分数
function calculateOverallHealthScore(scores) {
  if (!scores) return 50;
  
  // 简化的健康分数计算
  let total = 0;
  let count = 0;
  
  if (scores.phq9) {
    total += (27 - scores.phq9) / 27 * 100; // 反向计分
    count++;
  }
  
  if (scores.gad7) {
    total += (21 - scores.gad7) / 21 * 100; // 反向计分
    count++;
  }
  
  if (scores.who5) {
    total += scores.who5;
    count++;
  }
  
  if (scores.pss10) {
    total += (40 - scores.pss10) / 40 * 100; // 反向计分
    count++;
  }
  
  return count > 0 ? Math.round(total / count) : 50;
}

// 获取健康等级
function getHealthLevel(score) {
  if (score >= 80) return '优秀';
  if (score >= 60) return '良好';
  if (score >= 40) return '中等';
  return '需关注';
}

// 获取情绪状态
function getMoodStatus(scores) {
  if (!scores) return '稳定';
  
  const who5 = scores.who5 || 50;
  if (who5 >= 70) return '积极';
  if (who5 >= 50) return '稳定';
  return '低落';
}

// 获取压力水平
function getStressLevel(scores) {
  if (!scores) return '中等';
  
  const pss10 = scores.pss10 || scores.dass21?.stress || 20;
  if (pss10 <= 13) return '低';
  if (pss10 <= 26) return '中等';
  return '高';
}

// 准备建议数据
function prepareRecommendations(history) {
  if (!history || history.length === 0) return [];
  
  const latest = history[0];
  const recommendations = [];
  
  // 基于最新结果生成建议
  if (latest.scores?.who5 && latest.scores.who5 < 50) {
    recommendations.push({
      priority: 'high',
      type: '情绪提升',
      suggestion: '您的幸福感指数偏低，建议增加日常愉悦活动，如听音乐、与朋友聚会等。',
      action: '尝试每天做一件让自己开心的事情'
    });
  }
  
  if (latest.scores?.phq9 && latest.scores.phq9 > 9) {
    recommendations.push({
      priority: 'high',
      type: '抑郁筛查',
      suggestion: 'PHQ-9得分提示可能存在抑郁症状，建议寻求专业心理健康评估。',
      action: '联系心理健康专业人士'
    });
  }
  
  if (latest.scores?.pss10 && latest.scores.pss10 > 26) {
    recommendations.push({
      priority: 'medium',
      type: '压力管理',
      suggestion: '压力水平较高，建议学习压力管理技巧，如深呼吸、冥想等。',
      action: '每天进行10分钟放松练习'
    });
  }
  
  return recommendations;
}

// 辅助函数
function getAssessmentHistory() {
  const key = 'mindself_studio_history';
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  
  try {
    const data = JSON.parse(raw);
    const allRecords = [];
    
    Object.values(data).forEach(scaleRecords => {
      if (Array.isArray(scaleRecords)) {
        allRecords.push(...scaleRecords);
      }
    });
    
    // 按时间倒序排列
    return allRecords.sort((a, b) => b.at - a.at);
  } catch (error) {
    console.error('Error parsing history:', error);
    return [];
  }
}

function getLastNDaysData(history, days) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  const recentData = history.filter(record => record.at >= cutoff);
  
  // 按日期分组
  const groupedByDate = {};
  recentData.forEach(record => {
    const date = new Date(record.at).toLocaleDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(record);
  });
  
  // 返回每日平均数据
  return Object.keys(groupedByDate).map(date => {
    const dayRecords = groupedByDate[date];
    const avgRecord = {
      date: date,
      scores: {}
    };
    
    // 计算平均分
    const scoreTypes = ['phq9', 'gad7', 'pss10', 'who5'];
    scoreTypes.forEach(type => {
      const scores = dayRecords.map(r => r.detailedResults?.scores?.[type] || r.sum).filter(s => s != null);
      if (scores.length > 0) {
        avgRecord.scores[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });
    
    return avgRecord;
  });
}

// 页面切换函数
function switchView(view) {
  appState.view = view;
  
  // 隐藏所有视图
  ['view-home', 'view-test', 'view-result', 'view-dashboard'].forEach(viewId => {
    const element = el(viewId);
    if (element) {
      element.classList.toggle('hidden', viewId !== `view-${view}`);
    }
  });
  
  // 特殊处理仪表板视图
  if (view === 'dashboard') {
    renderHealthDashboard();
  }
}

// 辅助函数
function el(id) {
  return document.getElementById(id);
}

// 启动应用
document.addEventListener('DOMContentLoaded', initializeApp);
