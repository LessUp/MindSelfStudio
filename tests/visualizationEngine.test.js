// 数据可视化引擎单元测试
import { VisualizationEngine } from '../src/visualization/visualizationEngine.js';

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

describe('VisualizationEngine 测试', () => {
  let engine;
  let mockCanvas;
  let mockContext;
  
  beforeEach(() => {
    MockChart.clearInstances();
    
    // 创建模拟canvas元素
    mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'test-chart';
    mockContext = {
      canvas: mockCanvas,
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn()
    };
    
    // 模拟 getContext 方法 - 完全模拟canvas行为
    mockCanvas.getContext = jest.fn((type) => {
      if (type === '2d') {
        return mockContext;
      }
      return null;
    });
    
    // 模拟canvas的完整属性
    mockCanvas.width = 300;
    mockCanvas.height = 150;
    mockCanvas.style = {};
    
    document.body.appendChild(mockCanvas);
    
    engine = new VisualizationEngine({
      colorScheme: 'modern',
      animationDuration: 1000,
      responsive: true
    });
  });
  
  afterEach(() => {
    if (mockCanvas && mockCanvas.parentNode) {
      document.body.removeChild(mockCanvas);
    }
  });
  
  describe('VisualizationEngine', () => {
    test('应该正确初始化可视化引擎', () => {
      expect(engine).toBeInstanceOf(VisualizationEngine);
      expect(engine.config).toBeDefined();
      expect(engine.config.colorScheme).toBe('modern');
      expect(engine.config.animationDuration).toBe(1000);
      expect(engine.config.responsive).toBe(true);
      expect(engine.charts).toBeInstanceOf(Map);
      expect(engine.colorPalettes).toBeDefined();
      expect(engine.chartDefaults).toBeDefined();
    });
    
    test('应该初始化颜色方案', () => {
      const palettes = engine.colorPalettes;
      
      expect(palettes).toBeDefined();
      expect(palettes.modern).toBeDefined();
      expect(palettes.pastel).toBeDefined();
      expect(palettes.professional).toBeDefined();
      
      // 验证现代颜色方案
      const modern = palettes.modern;
      expect(Array.isArray(modern.primary)).toBe(true);
      expect(Array.isArray(modern.secondary)).toBe(true);
      expect(Array.isArray(modern.tertiary)).toBe(true);
      expect(modern.primary.length).toBeGreaterThan(0);
    });
    
    test('应该初始化图表默认配置', () => {
      const defaults = engine.chartDefaults;
      
      expect(defaults).toBeDefined();
      expect(defaults.global).toBeDefined();
      expect(defaults.global.responsive).toBe(true);
      expect(defaults.global.plugins).toBeDefined();
      expect(defaults.global.scales).toBeDefined();
    });
    
    test('应该创建心理健康趋势图', () => {
      const trendData = {
        labels: ['2024-01-01', '2024-01-02', '2024-01-03'],
        depression: [5, 6, 4],
        anxiety: [3, 4, 3],
        stress: [7, 8, 6],
        wellbeing: [60, 55, 65]
      };
      
      const chart = engine.createMentalHealthTrendChart('test-chart', trendData);
      
      expect(chart).toBeDefined();
      expect(MockChart.instances.length).toBe(1);
      expect(MockChart.instances[0].config.type).toBe('line');
      expect(MockChart.instances[0].config.data.labels).toEqual(trendData.labels);
      expect(MockChart.instances[0].config.data.datasets.length).toBe(4);
    });
    
    test('应该创建雷达图', () => {
      const radarData = {
        dimensions: ['抑郁', '焦虑', '压力', '幸福感', '睡眠质量', '社交功能'],
        current: [60, 45, 70, 80, 65, 75],
        target: [80, 80, 80, 90, 85, 85]
      };
      
      const chart = engine.createWellbeingRadarChart('test-chart', radarData);
      
      expect(chart).toBeDefined();
      expect(MockChart.instances.length).toBe(1);
      expect(MockChart.instances[0].config.type).toBe('radar');
      expect(MockChart.instances[0].config.data.labels).toEqual(radarData.dimensions);
      expect(MockChart.instances[0].config.data.datasets.length).toBe(2);
    });
    
    test('应该创建柱状图', () => {
      const barData = {
        labels: ['PHQ-9', 'GAD-7', 'PSS-10', 'DASS-21', 'WHO-5'],
        scores: [45, 38, 62, 55, 78]
      };
      
      const chart = engine.createScaleComparisonChart('test-chart', barData);
      
      expect(chart).toBeDefined();
      expect(MockChart.instances.length).toBe(1);
      expect(MockChart.instances[0].config.type).toBe('bar');
      expect(MockChart.instances[0].config.data.labels).toEqual(barData.labels);
      expect(MockChart.instances[0].config.data.datasets.length).toBe(1);
    });
    
    test('应该创建情绪热力图', () => {
      const heatmapData = {
        days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        hours: ['9:00', '12:00', '15:00', '18:00', '21:00'],
        values: [
          [5, 6, 4, 7, 3],
          [4, 5, 3, 6, 4],
          [6, 7, 5, 8, 5],
          [3, 4, 2, 5, 2],
          [7, 8, 6, 9, 6],
          [8, 9, 7, 10, 7],
          [6, 7, 5, 8, 5]
        ]
      };
      
      const chart = engine.createEmotionHeatmap('test-chart', heatmapData);
      
      expect(chart).toBeDefined();
      expect(chart.canvas).toBe(mockCanvas);
      expect(chart.days).toEqual(heatmapData.days);
      expect(chart.hours).toEqual(heatmapData.hours);
      expect(chart.values).toBeDefined();
    });
    
    test('应该生成热力图颜色', () => {
      // 测试不同值的颜色生成
      expect(engine.getHeatmapColor(0)).toBe('#3b82f6'); // 最低值 - 蓝色
      expect(engine.getHeatmapColor(5)).toBe('#fef3c7'); // 中等值 - 黄色
      expect(engine.getHeatmapColor(10)).toBe('#d97706'); // 最高值 - 橙色 (index 10)
      
      // 测试边界值
      expect(engine.getHeatmapColor(0)).toBe('#3b82f6'); // 最低值 - 蓝色
      expect(engine.getHeatmapColor(15)).toBe('#b45309'); // 超范围 - 最高颜色 (index 11)
    });
    
    test('应该生成示例热力图数据', () => {
      const sampleData = engine.generateSampleHeatmapData(7, 24);
      
      expect(Array.isArray(sampleData)).toBe(true);
      expect(sampleData.length).toBe(7); // 7天
      expect(sampleData[0].length).toBe(24); // 24小时
      
      // 验证数据范围
      sampleData.forEach(dayData => {
        dayData.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(10);
        });
      });
    });
    
    test('应该创建健康仪表板', () => {
      const dashboardData = {
        overview: {
          overallHealth: '良好',
          overallScore: 75,
          moodStatus: '稳定',
          moodScore: 70,
          stressLevel: '中等',
          stressScore: 60,
          sleepQuality: '良好',
          sleepScore: 80
        },
        trendData: {
          labels: ['1月', '2月', '3月', '4月', '5月'],
          datasets: [{ label: '整体健康', data: [70, 72, 75, 73, 75] }]
        },
        radarData: {
          dimensions: ['抑郁', '焦虑', '压力', '幸福感'],
          current: [60, 45, 70, 80]
        },
        comparisonData: {
          labels: ['PHQ-9', 'GAD-7', 'PSS-10'],
          scores: [45, 38, 62]
        },
        recommendations: [
          { priority: 'medium', suggestion: '保持规律作息', action: '每天23点前睡觉' }
        ]
      };
      
      const container = document.createElement('div');
      container.id = 'dashboard-container';
      document.body.appendChild(container);
      
      const dashboard = engine.createHealthDashboard('dashboard-container', dashboardData);
      
      expect(dashboard).toBeDefined();
      expect(container.innerHTML).toContain('整体健康');
      expect(container.innerHTML).toContain('75分');
      expect(container.innerHTML).toContain('保持规律作息');
      
      document.body.removeChild(container);
    });
    
    test('应该正确销毁图表', () => {
      // 创建图表
      const chart = engine.createMentalHealthTrendChart('test-chart', {
        labels: ['1月', '2月'],
        depression: [5, 6],
        anxiety: [3, 4],
        stress: [7, 8],
        wellbeing: [60, 55]
      });
      
      expect(MockChart.instances.length).toBe(1);
      
      // 销毁图表
      engine.destroyChart('test-chart');
      
      expect(MockChart.destroyed.length).toBe(1);
      expect(engine.charts.has('test-chart')).toBe(false);
    });
    
    test('应该销毁所有图表', () => {
      // 创建第二个canvas元素
      const mockCanvas2 = document.createElement('canvas');
      mockCanvas2.id = 'test-chart2';
      mockCanvas2.width = 300;
      mockCanvas2.height = 150;
      mockCanvas2.style = {};
      mockCanvas2.getContext = jest.fn(() => mockContext);
      document.body.appendChild(mockCanvas2);
      
      // 创建多个图表
      engine.createMentalHealthTrendChart('test-chart', {
        labels: ['1月', '2月'],
        depression: [5, 6],
        anxiety: [3, 4],
        stress: [7, 8],
        wellbeing: [60, 55]
      });
      
      engine.createWellbeingRadarChart('test-chart2', {
        dimensions: ['抑郁', '焦虑'],
        current: [60, 45]
      });
      
      expect(MockChart.instances.length).toBe(2);
      
      // 销毁所有图表
      engine.destroyAllCharts();
      
      expect(MockChart.destroyed.length).toBe(2);
      expect(engine.charts.size).toBe(0);
      
      // 清理第二个canvas
      if (mockCanvas2 && mockCanvas2.parentNode) {
        document.body.removeChild(mockCanvas2);
      }
    });
    
    test('应该更新图表数据', () => {
      const chart = engine.createMentalHealthTrendChart('test-chart', {
        labels: ['1月', '2月'],
        depression: [5, 6],
        anxiety: [3, 4],
        stress: [7, 8],
        wellbeing: [60, 55]
      });
      
      const newData = {
        labels: ['1月', '2月', '3月'],
        datasets: [{ data: [5, 6, 7] }]
      };
      
      engine.updateChart('test-chart', newData);
      
      expect(chart.data).toEqual(newData);
    });
    
    test('应该导出图表', () => {
      const chart = engine.createMentalHealthTrendChart('test-chart', {
        labels: ['1月', '2月'],
        depression: [5, 6],
        anxiety: [3, 4],
        stress: [7, 8],
        wellbeing: [60, 55]
      });
      
      // 模拟 toDataURL 方法
      chart.canvas.toDataURL = jest.fn((format) => `data:${format};base64,test`);
      
      const pngData = engine.exportChart('test-chart', 'png');
      expect(pngData).toContain('data:image/png;base64');
      
      const jpgData = engine.exportChart('test-chart', 'jpg');
      expect(jpgData).toContain('data:image/jpeg;base64');
    });
    
    test('应该处理不存在的canvas元素', () => {
      const chart = engine.createMentalHealthTrendChart('non-existent-chart', {
        labels: ['1月', '2月'],
        depression: [5, 6],
        anxiety: [3, 4],
        stress: [7, 8],
        wellbeing: [60, 55]
      });
      
      expect(chart).toBeNull();
    });
    
    test('应该处理不存在的图表', () => {
      const chart = engine.updateChart('non-existent-chart', {});
      expect(chart).toBeUndefined();
      
      const data = engine.exportChart('non-existent-chart', 'png');
      expect(data).toBeNull();
    });
    
    test('应该合并配置选项', () => {
      const defaultOptions = { responsive: true, plugins: { title: { display: true } } };
      const customOptions = { plugins: { title: { text: '自定义标题' } } };
      
      const merged = engine.mergeOptions(defaultOptions, customOptions);
      
      expect(merged.responsive).toBe(true);
      expect(merged.plugins.title.display).toBe(true);
      expect(merged.plugins.title.text).toBe('自定义标题');
    });
  });
  
  describe('图表数据准备', () => {
    test('应该准备趋势图数据', () => {
      const data = {
        labels: ['1月', '2月', '3月'],
        depression: [5, 6, 4],
        anxiety: [3, 4, 3],
        stress: [7, 8, 6],
        wellbeing: [60, 55, 65]
      };
      
      const chartData = engine.prepareTrendChartData(data);
      
      expect(chartData.labels).toEqual(data.labels);
      expect(chartData.datasets.length).toBe(4);
      expect(chartData.datasets[0].label).toBe('抑郁水平');
      expect(chartData.datasets[0].data).toEqual(data.depression);
      expect(chartData.datasets[3].label).toBe('幸福感');
      expect(chartData.datasets[3].data).toEqual(data.wellbeing);
    });
    
    test('应该准备雷达图数据', () => {
      const data = {
        dimensions: ['抑郁', '焦虑', '压力', '幸福感'],
        current: [60, 45, 70, 80],
        target: [80, 80, 80, 90]
      };
      
      const chartData = engine.prepareRadarChartData(data);
      
      expect(chartData.labels).toEqual(data.dimensions);
      expect(chartData.datasets.length).toBe(2);
      expect(chartData.datasets[0].label).toBe('当前状态');
      expect(chartData.datasets[0].data).toEqual(data.current);
      expect(chartData.datasets[1].label).toBe('目标状态');
      expect(chartData.datasets[1].data).toEqual(data.target);
    });
    
    test('应该准备柱状图数据', () => {
      const data = {
        labels: ['PHQ-9', 'GAD-7', 'PSS-10'],
        scores: [45, 38, 62]
      };
      
      const chartData = engine.prepareBarChartData(data);
      
      expect(chartData.labels).toEqual(data.labels);
      expect(chartData.datasets.length).toBe(1);
      expect(chartData.datasets[0].label).toBe('得分');
      expect(chartData.datasets[0].data).toEqual(data.scores);
    });
  });
  
  describe('补充测试 - 提高覆盖率', () => {
    let engine;
    let mockCanvas;
    let mockContext;
    
    beforeEach(() => {
      MockChart.clearInstances();
      
      // 创建模拟canvas元素
      mockCanvas = document.createElement('canvas');
      mockCanvas.id = 'test-chart';
      mockContext = {
        canvas: mockCanvas,
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        fillText: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn()
      };
      
      mockCanvas.getContext = jest.fn(() => mockContext);
      mockCanvas.width = 300;
      mockCanvas.height = 150;
      mockCanvas.style = {};
      mockCanvas.toDataURL = jest.fn((format) => `data:${format};base64,test`);
      
      document.body.appendChild(mockCanvas);
    });
    
    afterEach(() => {
      if (mockCanvas && mockCanvas.parentNode) {
        document.body.removeChild(mockCanvas);
      }
    });
    
    describe('Chart.js 加载和错误处理', () => {
      test('应该处理 Chart.js 未加载的情况', () => {
        // 临时删除 Chart 全局变量
        const originalChart = global.Chart;
        delete global.Chart;
        
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        engine = new VisualizationEngine();
        
        expect(consoleSpy).toHaveBeenCalledWith('Chart.js not loaded. Loading from CDN...');
        expect(engine.chartDefaults).toBeDefined();
        
        // 恢复 Chart 全局变量
        global.Chart = originalChart;
        consoleSpy.mockRestore();
      });
      
      test('应该从 CDN 加载 Chart.js', () => {
        const originalChart = global.Chart;
        delete global.Chart;
        
        // 模拟 document.createElement 和 appendChild
        const mockScript = {
          src: '',
          onload: null,
          onerror: null
        };
        
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockScript);
        const appendChildSpy = jest.spyOn(document.head, 'appendChild').mockImplementation();
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        engine = new VisualizationEngine();
        
        // 验证 CDN 加载调用
        expect(createElementSpy).toHaveBeenCalledWith('script');
        expect(mockScript.src).toBe('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js');
        expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
        
        // 测试 onload 回调
        mockScript.onload();
        expect(consoleLogSpy).toHaveBeenCalledWith('Chart.js loaded successfully');
        
        // 测试 onerror 回调
        mockScript.onerror();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load Chart.js');
        
        // 恢复
        global.Chart = originalChart;
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
      });
    });
    
    describe('图表更新和导出功能', () => {
      beforeEach(() => {
        engine = new VisualizationEngine();
      });
      
      test('应该导出不同格式的图表', () => {
        const chart = engine.createMentalHealthTrendChart('test-chart', {
          labels: ['1月', '2月'],
          depression: [5, 6],
          anxiety: [3, 4],
          stress: [7, 8],
          wellbeing: [60, 55]
        });
        
        // 测试 PNG 格式
        const pngData = engine.exportChart('test-chart', 'png', 'test-chart');
        expect(pngData).toContain('data:image/png;base64');
        
        // 测试 JPEG 格式
        const jpgData = engine.exportChart('test-chart', 'jpg', 'test-chart');
        expect(jpgData).toContain('data:image/jpeg;base64');
        
        // 测试 PDF 格式（需要额外库）
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        const pdfData = engine.exportChart('test-chart', 'pdf', 'test-chart');
        expect(consoleSpy).toHaveBeenCalledWith('PDF export requires additional library');
        expect(pdfData).toContain('data:image/png;base64'); // PDF 会回退到 PNG
        consoleSpy.mockRestore();
      });
    });
    
    describe('热力图高级功能', () => {
      beforeEach(() => {
        engine = new VisualizationEngine();
      });
      
      test('应该创建带有数值标签的热力图', () => {
        const heatmapData = {
          days: ['周一', '周二'],
          hours: ['9:00', '12:00'],
          values: [[5, 6], [4, 7]]
        };
        
        const chart = engine.createEmotionHeatmapChart('test-chart', heatmapData, {
          showValues: true,
          showLabels: true
        });
        
        expect(chart).toBeDefined();
        expect(mockContext.fillRect).toHaveBeenCalled();
        expect(mockContext.fillText).toHaveBeenCalled();
      });
      
      test('应该处理热力图缺少数据的情况', () => {
        const chart = engine.createEmotionHeatmapChart('test-chart', {}, {});
        
        expect(chart).toBeDefined();
        expect(chart.days).toEqual(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);
        expect(chart.hours).toBeDefined();
        expect(chart.values).toBeDefined();
      });
      
      test('应该处理热力图颜色边界值', () => {
        // 测试边界值
        expect(engine.getHeatmapColor(-1)).toBe('#3b82f6'); // 负值 - 最低颜色
        expect(engine.getHeatmapColor(20)).toBe('#b45309'); // 超范围 - 最高颜色
      });
    });
    
    describe('健康仪表板功能', () => {
      beforeEach(() => {
        engine = new VisualizationEngine();
      });
      
      test('应该处理缺少概览数据的情况', () => {
        const container = document.createElement('div');
        container.id = 'dashboard-container';
        document.body.appendChild(container);
        
        const dashboardData = {
          overview: {}, // 空数据
          trendData: {},
          radarData: {},
          comparisonData: {},
          recommendations: []
        };
        
        const dashboard = engine.createHealthDashboard('dashboard-container', dashboardData);
        
        expect(dashboard).toBeDefined();
        expect(container.innerHTML).toContain('整体健康');
        expect(container.innerHTML).toContain('75分'); // 默认值
        expect(container.innerHTML).toContain('暂无个性化建议');
        
        document.body.removeChild(container);
      });
      
      test('应该生成带有不同优先级的建议', () => {
        const recommendations = [
          { priority: 'high', suggestion: '立即就医', action: '联系心理医生' },
          { priority: 'medium', suggestion: '保持运动', action: '每天散步30分钟' },
          { priority: 'low', suggestion: '多喝水', action: '每天至少8杯水' }
        ];
        
        const container = document.createElement('div');
        container.id = 'dashboard-container';
        document.body.appendChild(container);
        
        const dashboardData = {
          overview: {},
          trendData: {},
          radarData: {},
          comparisonData: {},
          recommendations: recommendations
        };
        
        const dashboard = engine.createHealthDashboard('dashboard-container', dashboardData);
        
        expect(container.innerHTML).toContain('立即就医');
        expect(container.innerHTML).toContain('保持运动');
        expect(container.innerHTML).toContain('多喝水');
        expect(container.innerHTML).toContain('高');
        expect(container.innerHTML).toContain('中');
        expect(container.innerHTML).toContain('低');
        
        document.body.removeChild(container);
      });
    });
    
    describe('配置合并边界情况', () => {
      beforeEach(() => {
        engine = new VisualizationEngine();
      });
      
      test('应该处理嵌套对象合并', () => {
        const defaultOptions = {
          plugins: {
            title: {
              display: true,
              text: '默认标题'
            },
            legend: {
              position: 'top'
            }
          },
          scales: {
            x: {
              display: true
            }
          }
        };
        
        const customOptions = {
          plugins: {
            title: {
              text: '自定义标题'
            }
          },
          scales: {
            y: {
              display: false
            }
          }
        };
        
        const merged = engine.mergeOptions(defaultOptions, customOptions);
        
        expect(merged.plugins.title.display).toBe(true); // 保留默认值
        expect(merged.plugins.title.text).toBe('自定义标题'); // 被覆盖
        expect(merged.plugins.legend.position).toBe('top'); // 保持不变
        expect(merged.scales.x.display).toBe(true); // 保持不变
        expect(merged.scales.y.display).toBe(false); // 新增
      });
    });
    
    describe('边界情况和错误处理', () => {
      beforeEach(() => {
        engine = new VisualizationEngine();
      });
      
      test('应该处理不完整的趋势图数据', () => {
        const incompleteData = {
          labels: ['1月', '2月'],
          // 缺少某些数据数组
          depression: [5, 6],
          anxiety: [3, 4]
          // stress 和 wellbeing 缺失
        };
        
        const chart = engine.createMentalHealthTrendChart('test-chart', incompleteData);
        
        expect(chart).toBeDefined();
        expect(MockChart.instances[0].config.data.datasets.length).toBe(4);
        expect(MockChart.instances[0].config.data.datasets[2].data).toEqual([]); // stress 数据为空
        expect(MockChart.instances[0].config.data.datasets[3].data).toEqual([]); // wellbeing 数据为空
      });
      
      test('应该处理不完整的雷达图数据', () => {
        const incompleteData = {
          dimensions: ['抑郁', '焦虑'],
          current: [60, 45]
          // target 数据缺失
        };
        
        const chart = engine.createWellbeingRadarChart('test-chart', incompleteData);
        
        expect(chart).toBeDefined();
        expect(MockChart.instances[0].config.data.datasets.length).toBe(2);
        expect(MockChart.instances[0].config.data.datasets[1].data).toEqual([80, 80, 80, 90, 85, 85]); // 使用默认目标值
      });
      
      test('应该处理不完整的柱状图数据', () => {
        const incompleteData = {
          labels: ['PHQ-9', 'GAD-7']
          // scores 数据缺失
        };
        
        const chart = engine.createScaleComparisonChart('test-chart', incompleteData);
        
        expect(chart).toBeDefined();
        expect(MockChart.instances[0].config.data.datasets[0].data).toEqual([45, 38, 62, 55, 78]); // 使用默认分数
      });
    });
  });
});