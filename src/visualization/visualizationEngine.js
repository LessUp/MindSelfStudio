// 数据可视化引擎 - 基于Chart.js
// 心理健康趋势图表和健康仪表板

class VisualizationEngine {
  constructor(config = {}) {
    this.config = {
      defaultChartType: 'line',
      colorScheme: 'modern',
      animationDuration: 1000,
      responsive: true,
      maintainAspectRatio: false,
      ...config
    };
    
    this.charts = new Map(); // 存储图表实例
    this.colorPalettes = this.initializeColorPalettes();
    this.chartDefaults = this.initializeChartDefaults();
    
    // 确保Chart.js已加载
    this.ensureChartJS();
  }
  
  // 确保Chart.js可用
  ensureChartJS() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded. Loading from CDN...');
      this.loadChartJSFromCDN();
    }
  }
  
  // 从CDN加载Chart.js
  loadChartJSFromCDN() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    script.onload = () => {
      console.log('Chart.js loaded successfully');
      this.chartDefaults = this.initializeChartDefaults();
    };
    script.onerror = () => {
      console.error('Failed to load Chart.js');
    };
    document.head.appendChild(script);
  }
  
  // 初始化颜色方案
  initializeColorPalettes() {
    return {
      modern: {
        primary: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        secondary: ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'],
        tertiary: ['#6ee7b7', '#93c5fd', '#fcd34d', '#fca5a5', '#c4b5fd']
      },
      pastel: {
        primary: ['#a7f3d0', '#bfdbfe', '#fde68a', '#fecaca', '#e9d5ff'],
        secondary: ['#d1fae5', '#dbeafe', '#fef3c7', '#fee2e2', '#f3e8ff'],
        tertiary: ['#ecfdf5', '#eff6ff', '#fffbeb', '#fef2f2', '#faf5ff']
      },
      professional: {
        primary: ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'],
        secondary: ['#065f46', '#1d4ed8', '#b45309', '#b91c1c', '#6d28d9'],
        tertiary: ['#064e3b', '#1e40af', '#92400e', '#991b1b', '#5b21b6']
      }
    };
  }
  
  // 初始化图表默认配置
  initializeChartDefaults() {
    if (typeof Chart === 'undefined') return {};
    
    return {
      global: {
        responsive: this.config.responsive,
        maintainAspectRatio: this.config.maintainAspectRatio,
        animation: {
          duration: this.config.animationDuration,
          easing: 'easeInOutQuart'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#10b981',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `日期: ${context[0].label}`;
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}分`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              }
            }
          }
        }
      }
    };
  }

  // 合并配置选项
  mergeOptions(defaultOptions, customOptions) {
    const merged = { ...defaultOptions };
    
    for (const key in customOptions) {
      if (typeof customOptions[key] === 'object' && customOptions[key] !== null && !Array.isArray(customOptions[key])) {
        merged[key] = this.mergeOptions(merged[key] || {}, customOptions[key]);
      } else {
        merged[key] = customOptions[key];
      }
    }
    
    return merged;
  }
  
  // 创建心理健康趋势图
  createMentalHealthTrendChart(containerId, data, options = {}) {
    const canvas = document.getElementById(containerId);
    if (!canvas) {
      console.error(`Canvas element with id '${containerId}' not found`);
      return null;
    }
    
    const ctx = canvas.getContext('2d');
    const chartData = this.prepareTrendChartData(data);
    const chartOptions = this.mergeOptions(this.chartDefaults.global, {
      plugins: {
        title: {
          display: true,
          text: options.title || '心理健康趋势',
          font: { size: 16, weight: 'bold' }
        }
      },
      ...options
    });
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });
    
    this.charts.set(containerId, chart);
    return chart;
  }
  
  // 准备趋势图数据
  prepareTrendChartData(data) {
    const colors = this.colorPalettes[this.config.colorScheme].primary;
    
    return {
      labels: data.labels, // 日期标签
      datasets: [
        {
          label: '抑郁水平',
          data: data.depression || [],
          borderColor: colors[3],
          backgroundColor: colors[3] + '20',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '焦虑水平',
          data: data.anxiety || [],
          borderColor: colors[1],
          backgroundColor: colors[1] + '20',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '压力水平',
          data: data.stress || [],
          borderColor: colors[2],
          backgroundColor: colors[2] + '20',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '幸福感',
          data: data.wellbeing || [],
          borderColor: colors[0],
          backgroundColor: colors[0] + '20',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1' // 使用右侧Y轴
        }
      ]
    };
  }
  
  // 创建雷达图（多维度评估）
  createWellbeingRadarChart(containerId, data, options = {}) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const chartData = this.prepareRadarChartData(data);
    
    const chart = new Chart(ctx, {
      type: 'radar',
      data: chartData,
      options: {
        responsive: this.config.responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: options.title || '心理健康综合评估',
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: { size: 10 }
            },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            pointLabels: {
              font: { size: 12, family: 'Inter, sans-serif' }
            }
          }
        },
        ...options
      }
    });
    
    this.charts.set(containerId, chart);
    return chart;
  }
  
  // 准备雷达图数据
  prepareRadarChartData(data) {
    const colors = this.colorPalettes[this.config.colorScheme];
    
    return {
      labels: data.dimensions || ['抑郁', '焦虑', '压力', '幸福感', '睡眠质量', '社交功能'],
      datasets: [
        {
          label: '当前状态',
          data: data.current || [60, 45, 70, 80, 65, 75],
          borderColor: colors.primary[0],
          backgroundColor: colors.primary[0] + '30',
          pointBackgroundColor: colors.primary[0],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: colors.primary[0]
        },
        {
          label: '目标状态',
          data: data.target || [80, 80, 80, 90, 85, 85],
          borderColor: colors.primary[1],
          backgroundColor: colors.primary[1] + '20',
          pointBackgroundColor: colors.primary[1],
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: colors.primary[1]
        }
      ]
    };
  }
  
  // 创建柱状图（量表对比）
  createScaleComparisonChart(containerId, data, options = {}) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const chartData = this.prepareBarChartData(data);
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: this.config.responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: options.title || '各量表评估结果对比',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '分';
              }
            }
          }
        },
        ...options
      }
    });
    
    this.charts.set(containerId, chart);
    return chart;
  }
  
  // 准备柱状图数据
  prepareBarChartData(data) {
    const colors = this.colorPalettes[this.config.colorScheme].primary;
    
    return {
      labels: data.labels || ['PHQ-9', 'GAD-7', 'PSS-10', 'DASS-21', 'WHO-5'],
      datasets: [
        {
          label: '得分',
          data: data.scores || [45, 38, 62, 55, 78],
          backgroundColor: colors,
          borderColor: colors.map(color => color + 'CC'),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    };
  }
  
  // 创建情绪热力图
  createEmotionHeatmapChart(containerId, data, options = {}) {
    const canvas = document.getElementById(containerId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    
    // 自定义热力图实现
    const chart = this.createCustomHeatmap(ctx, data, options);
    
    this.charts.set(containerId, chart);
    return chart;
  }
  
  // 创建情绪热力图（简化版）
  createEmotionHeatmap(containerId, data, options = {}) {
    return this.createEmotionHeatmapChart(containerId, data, options);
  }
  
  // 创建自定义热力图
  createCustomHeatmap(ctx, data, options) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    const days = data.days || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const hours = data.hours || Array.from({length: 24}, (_, i) => `${i}:00`);
    const values = data.values || this.generateSampleHeatmapData(days.length, hours.length);
    
    const cellWidth = width / hours.length;
    const cellHeight = height / days.length;
    
    // 绘制热力图
    days.forEach((day, dayIndex) => {
      hours.forEach((hour, hourIndex) => {
        const value = values[dayIndex][hourIndex];
        const color = this.getHeatmapColor(value);
        
        ctx.fillStyle = color;
        ctx.fillRect(hourIndex * cellWidth, dayIndex * cellHeight, cellWidth - 1, cellHeight - 1);
        
        // 添加数值标签
        if (options.showValues) {
          ctx.fillStyle = value > 5 ? 'white' : 'black';
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(value.toFixed(1), hourIndex * cellWidth + cellWidth / 2, dayIndex * cellHeight + cellHeight / 2);
        }
      });
    });
    
    // 添加标签
    if (options.showLabels) {
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter';
      
      // 日期标签
      days.forEach((day, index) => {
        ctx.fillText(day, 5, index * cellHeight + cellHeight / 2);
      });
      
      // 时间标签
      hours.forEach((hour, index) => {
        ctx.save();
        ctx.translate(index * cellWidth + cellWidth / 2, height - 5);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(hour, 0, 0);
        ctx.restore();
      });
    }
    
    return { canvas, days, hours, values }; // 返回热力图对象
  }
  
  // 生成热力图示例数据
  generateSampleHeatmapData(days, hours) {
    const data = [];
    for (let i = 0; i < days; i++) {
      const dayData = [];
      for (let j = 0; j < hours; j++) {
        // 模拟情绪强度 (0-10)
        const baseIntensity = 5;
        const timeFactor = Math.sin((j - 6) * Math.PI / 12) * 2; // 日间变化
        const randomFactor = (Math.random() - 0.5) * 2;
        const intensity = Math.max(0, Math.min(10, baseIntensity + timeFactor + randomFactor));
        dayData.push(Math.round(intensity * 10) / 10);
      }
      data.push(dayData);
    }
    return data;
  }
  
  // 获取热力图颜色
  getHeatmapColor(value) {
    const colors = [
      '#3b82f6', // 蓝色 (低)
      '#60a5fa',
      '#93c5fd',
      '#bfdbfe',
      '#dbeafe',
      '#fef3c7', // 黄色 (中)
      '#fde68a',
      '#fcd34d',
      '#fbbf24',
      '#f59e0b', // 橙色 (高)
      '#d97706',
      '#b45309'
    ];
    
    const index = Math.min(colors.length - 1, Math.floor(value));
    return colors[index];
  }
  
  // 创建健康仪表板
  createHealthDashboard(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建仪表板HTML结构
    const dashboardHTML = this.generateDashboardHTML(data, options);
    container.innerHTML = dashboardHTML;
    
    // 初始化仪表板中的图表
    this.initializeDashboardCharts(data, options);
    
    return container;
  }
  
  // 生成仪表板HTML
  generateDashboardHTML(data, options) {
    return `
      <div class="health-dashboard space-y-6">
        <!-- 概览卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${this.generateOverviewCards(data.overview)}
        </div>
        
        <!-- 趋势图 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">心理健康趋势</h3>
          <div class="h-64">
            <canvas id="trend-chart-${Date.now()}"></canvas>
          </div>
        </div>
        
        <!-- 雷达图和对比图 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">多维度评估</h3>
            <div class="h-64">
              <canvas id="radar-chart-${Date.now()}"></canvas>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">量表对比</h3>
            <div class="h-64">
              <canvas id="comparison-chart-${Date.now()}"></canvas>
            </div>
          </div>
        </div>
        
        <!-- 建议和行动 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">个性化建议</h3>
          ${this.generateRecommendationsHTML(data.recommendations)}
        </div>
      </div>
    `;
  }
  
  // 生成概览卡片
  generateOverviewCards(overview) {
    const cards = [
      {
        title: '整体健康',
        value: overview.overallHealth || '良好',
        score: overview.overallScore || 75,
        color: 'emerald',
        icon: 'heart'
      },
      {
        title: '情绪状态',
        value: overview.moodStatus || '稳定',
        score: overview.moodScore || 70,
        color: 'blue',
        icon: 'smile'
      },
      {
        title: '压力水平',
        value: overview.stressLevel || '中等',
        score: overview.stressScore || 60,
        color: 'yellow',
        icon: 'activity'
      },
      {
        title: '睡眠质量',
        value: overview.sleepQuality || '良好',
        score: overview.sleepScore || 80,
        color: 'purple',
        icon: 'moon'
      }
    ];
    
    return cards.map(card => `
      <div class="bg-${card.color}-50 rounded-lg border border-${card.color}-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-${card.color}-600">${card.title}</p>
            <p class="text-2xl font-bold text-${card.color}-900">${card.score}分</p>
            <p class="text-sm text-${card.color}-700">${card.value}</p>
          </div>
          <div class="text-${card.color}-500">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // 生成建议HTML
  generateRecommendationsHTML(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '<p class="text-gray-600">暂无个性化建议</p>';
    }
    
    return `
      <div class="space-y-3">
        ${recommendations.map(rec => `
          <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-100 text-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green'}-600 text-xs font-medium">
                ${rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
              </span>
            </div>
            <div class="flex-1">
              <p class="text-sm text-gray-900">${rec.suggestion}</p>
              ${rec.action ? `<p class="text-xs text-gray-600 mt-1">建议行动: ${rec.action}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  // 初始化仪表板图表
  initializeDashboardCharts(data, options) {
    // 这里应该根据实际数据创建图表
    // 由于HTML是动态生成的，我们需要等待DOM更新
    setTimeout(() => {
      // 创建趋势图
      const trendCanvas = document.querySelector(`#trend-chart-${Date.now()}`);
      if (trendCanvas) {
        this.createMentalHealthTrendChart(trendCanvas.id, data.trendData || {});
      }
      
      // 创建雷达图
      const radarCanvas = document.querySelector(`#radar-chart-${Date.now()}`);
      if (radarCanvas) {
        this.createWellbeingRadarChart(radarCanvas.id, data.radarData || {});
      }
      
      // 创建对比图
      const comparisonCanvas = document.querySelector(`#comparison-chart-${Date.now()}`);
      if (comparisonCanvas) {
        this.createScaleComparisonChart(comparisonCanvas.id, data.comparisonData || {});
      }
    }, 100);
  }
  
  // 销毁图表
  destroyChart(chartId) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }
  
  // 销毁所有图表
  destroyAllCharts() {
    this.charts.forEach((chart, chartId) => {
      chart.destroy();
    });
    this.charts.clear();
  }
  
  // 更新图表数据
  updateChart(chartId, newData) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.data = newData;
      chart.update('active');
    }
  }
  
  // 导出图表
  exportChart(chartId, format = 'png', filename = 'chart') {
    const chart = this.charts.get(chartId);
    if (!chart) return null;
    
    const canvas = chart.canvas;
    
    if (format === 'png') {
      return canvas.toDataURL('image/png');
    } else if (format === 'jpg' || format === 'jpeg') {
      return canvas.toDataURL('image/jpeg', 0.9);
    } else if (format === 'pdf') {
      // 需要额外的PDF生成库
      console.warn('PDF export requires additional library');
      return canvas.toDataURL('image/png');
    }
    
    return null;
  }
}

// 导出模块
export { VisualizationEngine };