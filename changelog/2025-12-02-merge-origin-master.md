# 2025-12-02 合并远端 master 分支

- 合并 `origin/master` 上的架构重构与多量表支持：
  - 新增数据定义文件：`data/scales.js`、`data/scoring.js`
  - 新增 PWA 相关文件：`manifest.json`、`sw.js`、`icons/icon.svg`
  - 使用远端版本的 `app.js` 与 `index.html`，采用向导式测试流程与新 UI
- 保留并增强本地逻辑与测试：
  - 将 `src/ema/emaEngine.js`、`src/scales/dass21.js`、`src/scales/who5.js`、`src/visualization/visualizationEngine.js` 导出改为 CommonJS，便于 Node/测试环境使用
  - 为 DASS-21 与 WHO-5 增加答案取值范围校验
  - 为 `VisualizationEngine` 增强在无 `document` 环境下的健壮性
  - 更新并扩展测试用例：`tests/*.test.js`，新增覆盖 EMA 与可视化引擎的额外测试
- 未将 `coverage-report/` 目录纳入版本控制，仅作为本地测试报告保留
