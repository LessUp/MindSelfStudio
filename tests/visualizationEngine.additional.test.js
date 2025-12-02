// 可视化引擎额外单元测试 - 提高覆盖率
const { VisualizationEngine } = require('../src/visualization/visualizationEngine.js');

// 模拟 Chart.js
class MockChart {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.canvas = ctx.canvas;
    MockChart.instances.push(this);
  }
  
  destroy() {
    MockChart.destroyed.push(this);
  }
  
  update() {}
  
  static instances = [];
  static destroyed = [];
  
  static clearInstances() {
    this.instances = [];
    this.destroyed = [];
  }
}

global.Chart = MockChart;

describe('VisualizationEngine 高级功能测试', () => {
  let engine;
  let mockCanvas;
  let mockContext;
  
  beforeEach(() => {
    // 创建模拟 canvas 和 context
    mockContext = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillStyle: '',
      font: '',
      textAlign: ''
    };
    
    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      width: 800,
      height: 600
    };
    
    // 模拟 document.getElementById
    global.document = {
      getElementById: jest.fn().mockReturnValue(mockCanvas),
      createElement: jest.fn().mockReturnValue({
        src: '',
        onload: null,
        onerror: null
      }),
      head: {
        appendChild: jest.fn()
      }
    };
    
    engine = new VisualizationEngine({
      defaultChartType: 'line',
      colorScheme: 'modern',
      animationDuration: 1000
    });
  });
  
  afterEach(() => {
    if (engine) {
      engine.destroyAllCharts();
    }
  });
  
  test('应该确保 Chart.js 可用', () => {
    // 测试 Chart.js 未定义的情况
    global.Chart = undefined;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const newEngine = new VisualizationEngine();
    
    expect(consoleSpy).toHaveBeenCalledWith('Chart.js not loaded. Loading from CDN...');
    expect(global.document.createElement).toHaveBeenCalledWith('script');
    expect(global.document.head.appendChild).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
  
  test('应该从 CDN 加载 Chart.js', () => {
    const mockScript = {
      src: '',
      onload: null,
      onerror: null
    };
    
    global.document.createElement = jest.fn().mockReturnValue(mockScript);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    engine.loadChartJSFromCDN();
    
    expect(mockScript.src).toContain('cdn.jsdelivr.net/npm/chart.js');
    expect(mockScript.onload).toBeDefined();
    expect(mockScript.onerror).toBeDefined();
    
    // 触发 onload 事件
    mockScript.onload();
    expect(consoleSpy).toHaveBeenCalledWith('Chart.js loaded successfully');
    
    consoleSpy.mockRestore();
  });
  
  test('应该处理 Chart.js 加载失败', () => {
    const mockScript = {
      src: '',
      onload: null,
      onerror: null
    };
    
    global.document.createElement = jest.fn().mockReturnValue(mockScript);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    engine.loadChartJSFromCDN();
    
    // 触发 onerror 事件
    mockScript.onerror();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load Chart.js');
    
    consoleSpy.mockRestore();
  });
  
  test('应该初始化颜色方案', () => {
    const palettes = engine.initializeColorPalettes();
    
    expect(palettes).toBeDefined();
    expect(palettes.modern).toBeDefined();
    expect(palettes.pastel).toBeDefined();
    expect(palettes.professional).toBeDefined();
    
    // 验证颜色数组
    expect(Array.isArray(palettes.modern.primary)).toBe(true);
    expect(palettes.modern.primary.length).toBeGreaterThan(0);
  });
  
  test('应该初始化图表默认配置', () => {
    // 模拟 Chart.js 存在
    global.Chart = {};
    
    const defaults = engine.initializeChartDefaults();
    
    expect(defaults).toBeDefined();
    expect(defaults.global).toBeDefined();
    expect(defaults.global.responsive).toBe(true);
    expect(defaults.global.plugins).toBeDefined();
    expect(defaults.global.scales).toBeDefined();
  });
  
  test('应该合并未知对象的配置', () => {
    const defaultOptions = {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    };
    
    const customOptions = {
      responsive: false,
      plugins: {
        legend: { display: false, position: 'bottom' },
        tooltip: { enabled: true }
      }
    };
    
    const merged = engine.mergeOptions(defaultOptions, customOptions);
    
    expect(merged.responsive).toBe(false);
    expect(merged.plugins.legend.display).toBe(false);
    expect(merged.plugins.legend.position).toBe('bottom');
    expect(merged.plugins.tooltip.enabled).toBe(true);
  });
  
  test('应该处理 canvas 元素不存在的情况', () => {
    global.document.getElementById = jest.fn().mockReturnValue(null);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = engine.createMentalHealthTrendChart('nonexistent-canvas', {});
    
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Canvas element with id 'nonexistent-canvas' not found");
    
    consoleSpy.mockRestore();
  });
  
  test('应该准备趋势图数据', () => {
    const data = {
      labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
      depression: [5, 6, 4],
      anxiety: [3, 4, 2],
      stress: [6, 7, 5],
      wellbeing: [7, 8, 9]
    };
    
    const chartData = engine.prepareTrendChartData(data);
    
    expect(chartData).toBeDefined();
    expect(chartData.labels).toEqual(data.labels);
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets.length).toBe(4); // depression, anxiety, stress, wellbeing
    
    // 验证数据集
    const depressionDataset = chartData.datasets.find(d => d.label === '抑郁水平');
    expect(depressionDataset).toBeDefined();
    expect(depressionDataset.data).toEqual(data.depression);
  });
  
  test('应该处理雷达图 canvas 不存在的情况', () => {
    global.document.getElementById = jest.fn().mockReturnValue(null);
    
    const result = engine.createWellbeingRadarChart('nonexistent-radar', {});
    
    expect(result).toBeNull();
  });
  
  test('应该准备雷达图数据', () => {
    const data = {
      dimensions: ['抑郁', '焦虑', '压力', '幸福感'],
      current: [60, 45, 70, 80],
      target: [80, 80, 80, 90]
    };
    
    const chartData = engine.prepareRadarChartData(data);
    
    expect(chartData).toBeDefined();
    expect(chartData.labels).toEqual(data.dimensions);
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets.length).toBe(2); // current and target
    
    const currentDataset = chartData.datasets.find(d => d.label === '当前状态');
    expect(currentDataset).toBeDefined();
    expect(currentDataset.data).toEqual(data.current);
  });
  
  test('应该处理柱状图 canvas 不存在的情况', () => {
    global.document.getElementById = jest.fn().mockReturnValue(null);
    
    const result = engine.createScaleComparisonChart('nonexistent-bar', {});
    
    expect(result).toBeNull();
  });
  
  test('应该准备柱状图数据', () => {
    const data = {
      labels: ['PHQ-9', 'GAD-7', 'PSS-10'],
      scores: [45, 38, 62]
    };
    
    const chartData = engine.prepareBarChartData(data);
    
    expect(chartData).toBeDefined();
    expect(chartData.labels).toEqual(data.labels);
    expect(chartData.datasets).toBeDefined();
    expect(chartData.datasets.length).toBe(1);
    
    const dataset = chartData.datasets[0];
    expect(dataset.data).toEqual(data.scores);
    expect(Array.isArray(dataset.backgroundColor)).toBe(true);
  });
  
  test('应该处理热力图 canvas 不存在的情况', () => {
    global.document.getElementById = jest.fn().mockReturnValue(null);
    
    const result = engine.createEmotionHeatmapChart('nonexistent-heatmap', {});
    
    expect(result).toBeNull();
  });
  
  test('应该创建自定义热力图', () => {
    const data = {
      days: ['周一', '周二'],
      hours: ['9:00', '10:00'],
      values: [[5, 6], [7, 8]]
    };
    
    const result = engine.createCustomHeatmap(mockContext, data);
    
    expect(result).toBeDefined();
    expect(result.canvas).toBe(mockCanvas);
    expect(result.days).toEqual(data.days);
    expect(result.hours).toEqual(data.hours);
    expect(result.values).toEqual(data.values);
    
    // 验证绘制调用
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
  });
  
  test('应该生成热力图示例数据', () => {
    const data = engine.generateSampleHeatmapData(3, 4);
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(3); // 3天
    expect(data[0].length).toBe(4); // 4小时
    
    // 验证数据范围
    data.forEach(day => {
      day.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      });
    });
  });
  
  test('应该获取热力图颜色', () => {
    const colors = [
      '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
      '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
      '#d97706', '#b45309'
    ];
    
    // 测试不同值的颜色
    expect(engine.getHeatmapColor(0)).toBe(colors[0]);
    expect(engine.getHeatmapColor(5)).toBe(colors[5]);
    expect(engine.getHeatmapColor(10)).toBe(colors[colors.length - 1]);
    expect(engine.getHeatmapColor(15)).toBe(colors[colors.length - 1]); // 超过最大值
  });
  
  test('应该创建健康仪表板', () => {
    const data = {
      overview: {
        overallHealth: '良好',
        overallScore: 85,
        moodStatus: '稳定',
        moodScore: 78,
        stressLevel: '低',
        stressScore: 32,
        sleepQuality: '优秀',
        sleepScore: 92
      },
      trendData: {
        labels: ['1月', '2月', '3月'],
        depression: [5, 4, 3],
        anxiety: [3, 2, 2],
        stress: [6, 5, 4],
        wellbeing: [7, 8, 9]
      },
      radarData: {
        current: [70, 65, 60, 85],
        target: [80, 80, 75, 90]
      },
      comparisonData: {
        labels: ['DASS-21', 'WHO-5'],
        scores: [45, 78]
      },
      recommendations: [
        {
          priority: 'high',
          suggestion: '建议增加运动量',
          action: '每天至少运动30分钟'
        }
      ]
    };
    
    const container = {
      innerHTML: ''
    };
    
    global.document.getElementById = jest.fn().mockReturnValue(container);
    
    const result = engine.createHealthDashboard('dashboard-container', data);
    
    expect(result).toBe(container);
    expect(container.innerHTML).toContain('health-dashboard');
    expect(container.innerHTML).toContain('整体健康');
    expect(container.innerHTML).toContain('85分');
  });
  
  test('应该生成概览卡片 HTML', () => {
    const overview = {
      overallHealth: '良好',
      overallScore: 85,
      moodStatus: '稳定',
      moodScore: 78,
      stressLevel: '低',
      stressScore: 32,
      sleepQuality: '优秀',
      sleepScore: 92
    };
    
    const cardsHTML = engine.generateOverviewCards(overview);
    
    expect(cardsHTML).toContain('整体健康');
    expect(cardsHTML).toContain('85分');
    expect(cardsHTML).toContain('情绪状态');
    expect(cardsHTML).toContain('78分');
    expect(cardsHTML).toContain('压力水平');
    expect(cardsHTML).toContain('32分');
    expect(cardsHTML).toContain('睡眠质量');
    expect(cardsHTML).toContain('92分');
  });
  
  test('应该生成建议 HTML - 有建议的情况', () => {
    const recommendations = [
      {
        priority: 'high',
        suggestion: '建议增加运动量',
        action: '每天至少运动30分钟'
      },
      {
        priority: 'medium',
        suggestion: '注意睡眠质量',
        action: '保持规律作息'
      }
    ];
    
    const html = engine.generateRecommendationsHTML(recommendations);
    
    expect(html).toContain('建议增加运动量');
    expect(html).toContain('每天至少运动30分钟');
    expect(html).toContain('注意睡眠质量');
    expect(html).toContain('保持规律作息');
    expect(html).toContain('高');
    expect(html).toContain('中');
  });
  
  test('应该生成建议 HTML - 无建议的情况', () => {
    const html = engine.generateRecommendationsHTML([]);
    
    expect(html).toContain('暂无个性化建议');
  });
  
  test('应该生成建议 HTML - 空输入', () => {
    const html = engine.generateRecommendationsHTML(null);
    
    expect(html).toContain('暂无个性化建议');
  });
  
  test('应该销毁指定图表', () => {
    // 创建模拟图表
    const mockChart = {
      destroy: jest.fn()
    };
    
    engine.charts.set('test-chart', mockChart);
    
    engine.destroyChart('test-chart');
    
    expect(mockChart.destroy).toHaveBeenCalled();
    expect(engine.charts.has('test-chart')).toBe(false);
  });
  
  test('应该销毁所有图表', () => {
    // 创建多个模拟图表
    const mockChart1 = { destroy: jest.fn() };
    const mockChart2 = { destroy: jest.fn() };
    
    engine.charts.set('chart1', mockChart1);
    engine.charts.set('chart2', mockChart2);
    
    engine.destroyAllCharts();
    
    expect(mockChart1.destroy).toHaveBeenCalled();
    expect(mockChart2.destroy).toHaveBeenCalled();
    expect(engine.charts.size).toBe(0);
  });
  
  test('应该更新图表数据', () => {
    const mockChart = {
      data: {},
      update: jest.fn()
    };
    
    engine.charts.set('test-chart', mockChart);
    
    const newData = { labels: ['新数据'], datasets: [{ data: [10] }] };
    engine.updateChart('test-chart', newData);
    
    expect(mockChart.data).toBe(newData);
    expect(mockChart.update).toHaveBeenCalledWith('active');
  });
  
  test('应该处理更新不存在的图表', () => {
    // 尝试更新不存在的图表
    expect(() => engine.updateChart('nonexistent-chart', {})).not.toThrow();
  });
  
  test('应该导出图表为 PNG 格式', () => {
    const mockChart = {
      canvas: mockCanvas
    };
    
    mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockdata');
    
    engine.charts.set('export-chart', mockChart);
    
    const result = engine.exportChart('export-chart', 'png', 'test-chart');
    
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(result).toBe('data:image/png;base64,mockdata');
  });
  
  test('应该导出图表为 JPEG 格式', () => {
    const mockChart = {
      canvas: mockCanvas
    };
    
    mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,mockdata');
    
    engine.charts.set('export-chart', mockChart);
    
    const result = engine.exportChart('export-chart', 'jpeg', 'test-chart');
    
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.9);
    expect(result).toBe('data:image/jpeg;base64,mockdata');
  });
  
  test('应该处理 PDF 导出（回退到 PNG）', () => {
    const mockChart = {
      canvas: mockCanvas
    };
    
    mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockdata');
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    engine.charts.set('export-chart', mockChart);
    
    const result = engine.exportChart('export-chart', 'pdf', 'test-chart');
    
    expect(consoleSpy).toHaveBeenCalledWith('PDF export requires additional library');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    expect(result).toBe('data:image/png;base64,mockdata');
    
    consoleSpy.mockRestore();
  });
  
  test('应该处理导出不存在图表的情况', () => {
    const result = engine.exportChart('nonexistent-chart', 'png');
    
    expect(result).toBeNull();
  });
  
  test('应该初始化仪表板图表', () => {
    const data = {
      trendData: { labels: ['1月'], depression: [5] },
      radarData: { current: [70], target: [80] },
      comparisonData: { labels: ['DASS-21'], scores: [45] }
    };
    
    // 模拟 querySelector 找到 canvas 元素
    const mockTrendCanvas = { id: 'trend-canvas' };
    const mockRadarCanvas = { id: 'radar-canvas' };
    const mockComparisonCanvas = { id: 'comparison-canvas' };
    
    global.document.querySelector = jest.fn()
      .mockReturnValueOnce(mockTrendCanvas)
      .mockReturnValueOnce(mockRadarCanvas)
      .mockReturnValueOnce(mockComparisonCanvas);
    
    // 模拟图表创建方法
    engine.createMentalHealthTrendChart = jest.fn();
    engine.createWellbeingRadarChart = jest.fn();
    engine.createScaleComparisonChart = jest.fn();
    
    jest.useFakeTimers();
    
    engine.initializeDashboardCharts(data);
    
    // 推进时间以触发 setTimeout
    jest.advanceTimersByTime(150);
    
    expect(engine.createMentalHealthTrendChart).toHaveBeenCalled();
    expect(engine.createWellbeingRadarChart).toHaveBeenCalled();
    expect(engine.createScaleComparisonChart).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
  
  test('应该处理初始化仪表板时找不到 canvas 的情况', () => {
    const data = {
      trendData: { labels: ['1月'], depression: [5] }
    };
    
    global.document.querySelector = jest.fn().mockReturnValue(null);
    
    jest.useFakeTimers();
    
    // 不应该抛出错误
    expect(() => engine.initializeDashboardCharts(data)).not.toThrow();
    
    jest.advanceTimersByTime(150);
    jest.useRealTimers();
  });
});