// MindSelf Studio v2.0
const CATEGORIES = {
  all: { name: '全部', icon: '📋' }, depression: { name: '抑郁', icon: '🌧️' },
  anxiety: { name: '焦虑', icon: '😰' }, stress: { name: '压力', icon: '💫' },
  self: { name: '自我', icon: '🪞' }, sleep: { name: '睡眠', icon: '😴' }, wellbeing: { name: '幸福', icon: '🌈' }
};

const SCALES = {
  phq9: { id: 'phq9', category: 'depression', title: 'PHQ-9 抑郁筛查', shortTitle: 'PHQ-9', desc: '过去两周内下列问题困扰程度', icon: '🌧️', color: 'blue', time: 3, options: ['完全没有', '几天', '一半以上', '几乎每天'], questions: ['做事时提不起劲或没有兴趣', '感到心情低落、沮丧或绝望', '入睡困难、易醒或睡眠过多', '感到疲倦或没有活力', '食欲不振或吃得过多', '觉得自己很糟糕或让家人失望', '对事情专注有困难', '动作或说话比平时缓慢，或坐立不安', '有不如死了或伤害自己的念头'], citation: 'Kroenke K, et al. The PHQ-9. 2001.' },
  gad7: { id: 'gad7', category: 'anxiety', title: 'GAD-7 焦虑量表', shortTitle: 'GAD-7', desc: '过去两周内下列问题困扰程度', icon: '😰', color: 'purple', time: 2, options: ['完全没有', '几天', '一半以上', '几乎每天'], questions: ['感到紧张、焦虑或烦躁', '无法停止或控制担忧', '对各种事情过度担忧', '很难放松下来', '因焦虑而坐立不安', '容易烦恼或易怒', '感到害怕，好像会发生不好的事'], citation: 'Spitzer RL, et al. The GAD-7. 2006.' },
  pss10: { id: 'pss10', category: 'stress', title: 'PSS-10 压力量表', shortTitle: 'PSS-10', desc: '过去一个月的感受与想法', icon: '💫', color: 'orange', time: 4, options: ['从不', '很少', '有时', '经常', '总是'], questions: ['因意外事情感到心烦', '觉得无法控制生活重要事情', '感到紧张和压力', { text: '对个人事情感到自信', reverse: true }, { text: '觉得事情进展顺利', reverse: true }, '觉得无法应付要做的事', { text: '能够控制烦恼', reverse: true }, { text: '觉得事情按意愿进行', reverse: true }, '因事情超出控制而生气', '觉得困难堆积如山'], citation: 'Cohen S. 1983.' },
  sds: { id: 'sds', category: 'depression', title: 'SDS 抑郁自评', shortTitle: 'SDS', desc: '最近一周的感受', icon: '🌧️', color: 'blue', time: 5, options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'], questions: ['我觉得闷闷不乐', { text: '早晨感觉最好', reverse: true }, '我一阵阵地哭或想哭', '我晚上睡眠不好', { text: '我吃的跟平常一样多', reverse: true }, { text: '与异性接触感到愉快', reverse: true }, '我发觉体重在下降', '我有便秘苦恼', '我心跳比平常快', '我无缘无故感到疲乏', { text: '我头脑像平常一样清楚', reverse: true }, { text: '做事情并没有困难', reverse: true }, '我不安而平静不下来', { text: '我对将来抱有希望', reverse: true }, '我比平常容易激动', { text: '我觉得作出决定很容易', reverse: true }, { text: '我觉得自己有用', reverse: true }, { text: '我的生活很有意思', reverse: true }, '我认为如果我死了别人会更好', { text: '平常感兴趣的事我仍感兴趣', reverse: true }], citation: 'Zung WWK. 1965.' },
  sas: { id: 'sas', category: 'anxiety', title: 'SAS 焦虑自评', shortTitle: 'SAS', desc: '最近一周的感受', icon: '😰', color: 'purple', time: 5, options: ['没有或很少', '小部分时间', '相当多时间', '绝大部分时间'], questions: ['我觉得比平时容易紧张', '我无缘无故感到害怕', '我容易心里烦乱或惊恐', '我觉得我可能要发疯', { text: '一切都很好不会发生不幸', reverse: true }, '我手脚发抖打颤', '我因为头痛等而苦恼', '我感觉容易衰弱和疲乏', { text: '我心平气和容易安静坐着', reverse: true }, '我觉得心跳得很快', '我因为一阵阵头晕而苦恼', '我有晕倒发作或觉得要晕倒', { text: '我呼吸感到很容易', reverse: true }, '我的手脚麻木和刺痛', '我因为胃痛消化不良而苦恼', '我常常要小便', { text: '我的手干燥温暖', reverse: true }, '我脸红发热', { text: '我容易入睡并睡得很好', reverse: true }, '我做恶梦'], citation: 'Zung WWK. 1971.' },
  rosenberg: { id: 'rosenberg', category: 'self', title: 'Rosenberg自尊量表', shortTitle: 'RSES', desc: '对自己的真实感受', icon: '🪞', color: 'teal', time: 3, options: ['非常不同意', '不同意', '同意', '非常同意'], questions: ['我是一个有价值的人', '我有许多好的品质', { text: '我倾向于觉得自己是失败者', reverse: true }, '我能像大多数人一样把事做好', { text: '我值得自豪的地方不多', reverse: true }, '我对自己持肯定态度', '总的来说我对自己满意', { text: '我希望能为自己赢得更多尊重', reverse: true }, { text: '我确实时常感到自己毫无用处', reverse: true }, { text: '我时常认为自己一无是处', reverse: true }], citation: 'Rosenberg M. 1965.' },
  who5: { id: 'who5', category: 'wellbeing', title: 'WHO-5 幸福感', shortTitle: 'WHO-5', desc: '过去两周的感受', icon: '🌈', color: 'pink', time: 2, options: ['从不', '有时', '少于一半', '超过一半', '大部分', '所有时间'], questions: ['我感到快乐和精神愉快', '我感到平静和放松', '我感到精力充沛和活跃', '我醒来时感到神清气爽', '我的日常生活充满让我感兴趣的事'], citation: 'WHO. WHO-5.' },
  psqi: { id: 'psqi', category: 'sleep', title: 'PSQI 睡眠质量', shortTitle: 'PSQI', desc: '过去一个月的睡眠情况', icon: '😴', color: 'indigo', time: 4, options: ['没有', '少于每周1次', '每周1-2次', '每周3次以上'], questions: ['入睡困难（30分钟内无法入睡）', '夜间醒来或早醒', '夜间需要起床去厕所', '呼吸不畅', '咳嗽或打鼾', '感觉太冷', '感觉太热', '做噩梦', '感到疼痛不适', '白天感到困倦或精力不足'], citation: 'Buysse DJ. 1989.' }
};

const SCORING = {
  phq9: (ans) => { const sum = ans.reduce((a,b)=>a+b,0); let grade; if(sum<=4) grade={level:'无/极轻微',color:'emerald',emoji:'😊',advice:'心理状态良好，继续保持。'}; else if(sum<=9) grade={level:'轻度',color:'yellow',emoji:'😐',advice:'有轻微情绪困扰，可尝试运动调整。'}; else if(sum<=14) grade={level:'中度',color:'orange',emoji:'😟',advice:'可能正经历中度抑郁，建议咨询。'}; else if(sum<=19) grade={level:'中重度',color:'red',emoji:'😢',advice:'症状较明显，建议尽快寻求帮助。'}; else grade={level:'重度',color:'red',emoji:'🆘',advice:'症状严重，请务必尽快就医。'}; const safety=ans[8]>=1?'⚠️ 如存在自伤想法，请立即联系应急援助。':null; return {sum,max:27,grade,safety}; },
  gad7: (ans) => { const sum = ans.reduce((a,b)=>a+b,0); let grade; if(sum<=4) grade={level:'无/极轻微',color:'emerald',emoji:'😌',advice:'状态放松，保持健康生活。'}; else if(sum<=9) grade={level:'轻度',color:'yellow',emoji:'😐',advice:'有些焦虑，可尝试放松练习。'}; else if(sum<=14) grade={level:'中度',color:'orange',emoji:'😟',advice:'可能正经历中度焦虑，建议咨询。'}; else grade={level:'重度',color:'red',emoji:'😰',advice:'焦虑较重，请尽快就医。'}; return {sum,max:21,grade}; },
  pss10: (ans,qs) => { const scored=ans.map((v,i)=>(typeof qs[i]==='object'&&qs[i].reverse)?(4-v):v); const sum=scored.reduce((a,b)=>a+b,0); let grade; if(sum<=13) grade={level:'低压力',color:'emerald',emoji:'😊',advice:'压力较低，应对良好。'}; else if(sum<=26) grade={level:'中等压力',color:'yellow',emoji:'😐',advice:'处于中等压力，建议优化作息。'}; else grade={level:'高压力',color:'orange',emoji:'😣',advice:'压力较高，建议调整节奏。'}; return {sum,max:40,grade}; },
  sds: (ans,qs) => { const scored=ans.map((v,i)=>{const s=v+1;return(typeof qs[i]==='object'&&qs[i].reverse)?(5-s):s;}); const raw=scored.reduce((a,b)=>a+b,0); const sum=Math.round(raw*1.25); let grade; if(sum<53) grade={level:'正常',color:'emerald',emoji:'😊',advice:'没有明显抑郁症状。'}; else if(sum<63) grade={level:'轻度抑郁',color:'yellow',emoji:'��',advice:'可能存在轻度抑郁。'}; else if(sum<73) grade={level:'中度抑郁',color:'orange',emoji:'😟',advice:'可能正经历中度抑郁。'}; else grade={level:'重度抑郁',color:'red',emoji:'🆘',advice:'抑郁症状较重，请就医。'}; const safety=ans[18]>=2?'⚠️ 如存在自伤想法，请立即寻求帮助。':null; return {sum,max:100,grade,safety}; },
  sas: (ans,qs) => { const scored=ans.map((v,i)=>{const s=v+1;return(typeof qs[i]==='object'&&qs[i].reverse)?(5-s):s;}); const raw=scored.reduce((a,b)=>a+b,0); const sum=Math.round(raw*1.25); let grade; if(sum<50) grade={level:'正常',color:'emerald',emoji:'😌',advice:'没有明显焦虑症状。'}; else if(sum<60) grade={level:'轻度焦虑',color:'yellow',emoji:'😐',advice:'可能存在轻度焦虑。'}; else if(sum<70) grade={level:'中度焦虑',color:'orange',emoji:'😟',advice:'可能正经历中度焦虑。'}; else grade={level:'重度焦虑',color:'red',emoji:'😰',advice:'焦虑症状较重，请就医。'}; return {sum,max:100,grade}; },
  rosenberg: (ans,qs) => { const scored=ans.map((v,i)=>{const s=v+1;return(typeof qs[i]==='object'&&qs[i].reverse)?(5-s):s;}); const sum=scored.reduce((a,b)=>a+b,0); let grade; if(sum>=30) grade={level:'高自尊',color:'emerald',emoji:'��',advice:'拥有健康的自尊水平。'}; else if(sum>=20) grade={level:'中等自尊',color:'yellow',emoji:'😊',advice:'自尊水平正常。'}; else grade={level:'低自尊',color:'orange',emoji:'😔',advice:'对自己评价偏低。'}; return {sum,max:40,grade}; },
  who5: (ans) => { const sum=ans.reduce((a,b)=>a+b,0); const pct=Math.round((sum/25)*100); let grade; if(pct>=50) grade={level:'良好',color:'emerald',emoji:'🌟',advice:'幸福感良好。'}; else if(pct>=28) grade={level:'一般',color:'yellow',emoji:'😐',advice:'幸福感一般。'}; else grade={level:'偏低',color:'orange',emoji:'😔',advice:'幸福感偏低，请关注状态。'}; return {sum:pct,max:100,grade}; },
  psqi: (ans) => { const sum=ans.reduce((a,b)=>a+b,0); let grade; if(sum<=5) grade={level:'睡眠质量好',color:'emerald',emoji:'😴',advice:'睡眠良好。'}; else if(sum<=10) grade={level:'睡眠一般',color:'yellow',emoji:'😐',advice:'睡眠有待改善。'}; else if(sum<=15) grade={level:'睡眠较差',color:'orange',emoji:'😣',advice:'睡眠问题较明显。'}; else grade={level:'睡眠障碍',color:'red',emoji:'😫',advice:'建议就医。'}; return {sum,max:30,grade}; }
};

const state = { view: 'home', scale: null, answers: [], step: 0, filter: 'all', result: null };
const $ = id => document.getElementById(id);
const colorMap = { emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: '#10b981' }, yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', ring: '#eab308' }, orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: '#f97316' }, red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: '#ef4444' } };

// ================== 视图管理 ==================
function switchView(v) {
  ['view-home', 'view-test', 'view-result'].forEach(id => {
    const el = $(id);
    if (id === `view-${v}`) { el.classList.remove('hidden'); } 
    else { el.classList.add('hidden'); }
  });
  state.view = v;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() { renderHome(); switchView('home'); }

// ================== 首页 ==================
function renderHome() { renderCategories(); renderScaleCards(); renderStats(); }

function renderCategories() {
  const container = $('category-filter');
  container.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
    <button onclick="filterCategory('${key}')" class="cat-pill flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
      ${state.filter === key ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'}">
      ${cat.icon} ${cat.name}
    </button>
  `).join('');
}

function filterCategory(cat) { state.filter = cat; renderCategories(); renderScaleCards(); }

function renderScaleCards() {
  const container = $('cards-container');
  const scales = Object.values(SCALES).filter(s => state.filter === 'all' || s.category === state.filter);
  container.innerHTML = scales.map(s => `
    <div onclick="startTest('${s.id}')" class="scale-card bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-xl hover:border-emerald-200 active:scale-[0.98] transition-all">
      <div class="flex items-start justify-between mb-3">
        <div class="text-2xl">${s.icon}</div>
        <span class="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">${s.questions.length}题·${s.time}分钟</span>
      </div>
      <h3 class="font-bold text-gray-800 mb-1">${s.title}</h3>
      <p class="text-sm text-gray-500 line-clamp-2">${s.desc}</p>
    </div>
  `).join('');
}

function renderStats() {
  const history = getHistory();
  const total = Object.values(history).flat().length;
  const scales = Object.keys(history).length;
  if (total > 0) {
    $('stats-summary').classList.remove('hidden');
    $('stat-total').textContent = total;
    $('stat-scales').textContent = scales;
    $('stat-streak').textContent = calcStreak(history);
  } else { $('stats-summary').classList.add('hidden'); }
}

function calcStreak(history) {
  const dates = Object.values(history).flat().map(r => new Date(r.at).toDateString());
  const unique = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toDateString();
    if (unique[i] === expected) streak++; else break;
  }
  return streak || (unique[0] === new Date().toDateString() ? 1 : 0);
}

// ================== 测试 ==================
function startTest(id) {
  state.scale = SCALES[id];
  state.answers = Array(state.scale.questions.length).fill(null);
  state.step = 0;
  $('test-title').textContent = state.scale.shortTitle;
  renderQuestion();
  switchView('test');
}

function renderQuestion() {
  const q = state.scale.questions[state.step];
  const text = typeof q === 'object' ? q.text : q;
  const total = state.scale.questions.length;
  const pct = Math.round(((state.step + 1) / total) * 100);
  
  $('progress-bar').style.width = `${pct}%`;
  $('progress-text').textContent = `${state.step + 1}/${total}`;
  $('prev-btn').disabled = state.step === 0;
  $('prev-btn').style.opacity = state.step === 0 ? '0.3' : '1';
  $('next-btn').disabled = state.answers[state.step] === null;
  $('next-btn').textContent = state.step === total - 1 ? '查看结果' : '下一题';
  
  const container = $('question-container');
  container.innerHTML = `
    <div class="mb-6"><h2 class="text-xl font-bold text-gray-900 leading-relaxed">${text}</h2></div>
    <div class="space-y-3">
      ${state.scale.options.map((opt, i) => `
        <button onclick="selectOption(${i})" class="option-btn w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center gap-3
          ${state.answers[state.step] === i ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}">
          <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
            ${state.answers[state.step] === i ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}">${String.fromCharCode(65 + i)}</span>
          <span class="font-medium text-gray-700">${opt}</span>
        </button>
      `).join('')}
    </div>
  `;
  
  $('question-dots').innerHTML = state.scale.questions.map((_, i) => `
    <div class="w-2 h-2 rounded-full transition-all ${i === state.step ? 'bg-emerald-500 w-4' : state.answers[i] !== null ? 'bg-emerald-300' : 'bg-gray-200'}"></div>
  `).join('');
}

function selectOption(val) {
  state.answers[state.step] = val;
  renderQuestion();
  setTimeout(() => {
    if (state.step < state.scale.questions.length - 1) { state.step++; renderQuestion(); }
    else { finishTest(); }
  }, 250);
}

function prevQuestion() { if (state.step > 0) { state.step--; renderQuestion(); } }
function nextQuestion() {
  if (state.answers[state.step] === null) return;
  if (state.step < state.scale.questions.length - 1) { state.step++; renderQuestion(); }
  else finishTest();
}

function exitTest() { if (confirm('确定要退出吗？当前进度将丢失。')) goHome(); }
function retakeTest() { startTest(state.scale.id); }

function finishTest() {
  const result = SCORING[state.scale.id](state.answers, state.scale.questions);
  state.result = result;
  renderResult(result);
  saveHistory(result);
  switchView('result');
}

// ================== 结果 ==================
function renderResult(res) {
  const c = colorMap[res.grade.color];
  const pct = Math.round((res.sum / res.max) * 100);
  
  $('score-ring').style.setProperty('--pct', pct);
  $('score-ring').setAttribute('stroke', c.ring);
  $('result-emoji').textContent = res.grade.emoji;
  
  let score = 0;
  const scoreEl = $('result-score');
  const duration = 800;
  const start = performance.now();
  function animateScore(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    score = Math.floor(res.sum * progress);
    scoreEl.textContent = `${score}/${res.max}`;
    if (progress < 1) requestAnimationFrame(animateScore);
  }
  requestAnimationFrame(animateScore);
  
  $('result-title').textContent = state.scale.title;
  $('result-level-badge').className = `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${c.bg} ${c.text} ${c.border} border`;
  $('result-level-badge').textContent = res.grade.level;
  $('result-advice').textContent = res.grade.advice;
  
  if (res.safety) { $('safety-alert').classList.remove('hidden'); $('safety-text').textContent = res.safety; }
  else { $('safety-alert').classList.add('hidden'); }
  
  // 详情
  $('result-detail').innerHTML = state.scale.questions.map((q, i) => {
    const text = typeof q === 'object' ? q.text : q;
    return `<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
      <span class="text-gray-600 truncate flex-1 mr-4">${i + 1}. ${text}</span>
      <span class="font-medium text-gray-800 flex-shrink-0">${state.scale.options[state.answers[i]]}</span>
    </div>`;
  }).join('');
  
  $('result-citations').innerHTML = `<li><a href="#" class="text-gray-400 hover:text-emerald-600">${state.scale.citation}</a></li>`;
  $('detail-section').classList.add('hidden');
  $('detail-chevron').style.transform = 'rotate(0deg)';
}

function toggleDetail() {
  const section = $('detail-section');
  const chevron = $('detail-chevron');
  if (section.classList.contains('hidden')) {
    section.classList.remove('hidden');
    chevron.style.transform = 'rotate(180deg)';
  } else {
    section.classList.add('hidden');
    chevron.style.transform = 'rotate(0deg)';
  }
}

// ================== 历史记录 ==================
function getHistory() {
  const raw = localStorage.getItem('mindself_history');
  return raw ? JSON.parse(raw) : {};
}

function saveHistory(result) {
  const history = getHistory();
  const record = {
    id: state.scale.id, title: state.scale.title, shortTitle: state.scale.shortTitle,
    sum: result.sum, max: result.max, level: result.grade.level, emoji: result.grade.emoji,
    color: result.grade.color, at: Date.now()
  };
  if (!history[state.scale.id]) history[state.scale.id] = [];
  history[state.scale.id].unshift(record);
  history[state.scale.id] = history[state.scale.id].slice(0, 20);
  localStorage.setItem('mindself_history', JSON.stringify(history));
}

function showHistory() {
  const modal = $('history-modal');
  const sheet = modal.querySelector('.bottom-sheet');
  modal.classList.remove('hidden');
  setTimeout(() => sheet.classList.add('open'), 10);
  renderHistoryList();
}

function hideHistory() {
  const modal = $('history-modal');
  const sheet = modal.querySelector('.bottom-sheet');
  sheet.classList.remove('open');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function renderHistoryList() {
  const history = getHistory();
  const list = $('history-list');
  let allRecs = [];
  Object.values(history).forEach(arr => allRecs = allRecs.concat(arr));
  allRecs.sort((a, b) => b.at - a.at);
  
  if (allRecs.length === 0) {
    list.innerHTML = '<div class="text-center text-gray-400 py-8">暂无历史记录</div>';
    return;
  }
  
  list.innerHTML = allRecs.slice(0, 20).map(rec => {
    const d = new Date(rec.at);
    const time = `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const c = colorMap[rec.color];
    return `<div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div class="flex items-center gap-3">
        <span class="text-2xl">${rec.emoji}</span>
        <div>
          <div class="font-bold text-gray-800">${rec.shortTitle || rec.title}</div>
          <div class="text-xs text-gray-400">${time}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="font-bold text-gray-900">${rec.sum}<span class="text-xs text-gray-400 font-normal">/${rec.max}</span></div>
        <span class="text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}">${rec.level}</span>
      </div>
    </div>`;
  }).join('');
}

function clearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    localStorage.removeItem('mindself_history');
    renderHistoryList();
    renderStats();
  }
}

// ================== 分享功能 ==================
let currentCardStyle = 'gradient';
const cardStyles = {
  gradient: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);',
  calm: 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);',
  warm: 'background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);',
  cool: 'background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);',
  nature: 'background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%);'
};

function showShareModal() {
  const modal = $('share-modal');
  modal.classList.remove('hidden');
  renderShareCard();
  generateQRCode();
}

function hideShareModal() { $('share-modal').classList.add('hidden'); }

function setCardStyle(style) {
  currentCardStyle = style;
  document.querySelectorAll('.card-style-btn').forEach(btn => btn.classList.remove('ring-2', 'ring-emerald-500'));
  event.target.classList.add('ring-2', 'ring-emerald-500');
  renderShareCard();
}

function renderShareCard() {
  const card = $('share-card-preview');
  const res = state.result;
  const isDark = currentCardStyle === 'gradient';
  card.style = cardStyles[currentCardStyle];
  card.className = `rounded-2xl p-6 shadow-lg ${isDark ? 'text-white' : 'text-gray-800'}`;
  
  $('share-emoji').textContent = res.grade.emoji;
  $('share-title').textContent = state.scale.title;
  $('share-level').textContent = res.grade.level;
  $('share-score').textContent = `${res.sum}/${res.max}`;
  $('share-date').textContent = new Date().toLocaleDateString('zh-CN');
}

function generateQRCode() {
  const qrContainer = $('qr-code');
  qrContainer.innerHTML = '';
  const url = window.location.href.split('?')[0];
  if (typeof QRCode !== 'undefined') {
    QRCode.toCanvas(qrContainer, url, { width: 64, margin: 0 }, (err) => {
      if (err) console.error(err);
    });
  }
}

async function downloadCard() {
  const card = $('share-card-preview');
  try {
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: null });
    const link = document.createElement('a');
    link.download = `mindself-${state.scale.id}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) { alert('生成图片失败，请截图保存'); }
}

async function shareCard() {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'MindSelf Studio 测评结果', text: `我在 ${state.scale.title} 测评中得到了 ${state.result.grade.level} 的结果`, url: window.location.href });
    } catch (e) { console.log('Share cancelled'); }
  } else { downloadCard(); }
}

// ================== 隐私弹窗 ==================
function showPrivacy() {
  const modal = $('privacy-modal');
  modal.classList.remove('hidden');
  setTimeout(() => { modal.classList.remove('opacity-0'); modal.querySelector('.modal-content').classList.remove('scale-95'); }, 10);
}

function hidePrivacy() {
  const modal = $('privacy-modal');
  modal.classList.add('opacity-0');
  modal.querySelector('.modal-content').classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

// ================== 初始化 ==================
function init() {
  renderHome();
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
