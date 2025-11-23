const SCALES = {
  phq9: {
    id: 'phq9',
    title: 'PHQ-9 抑郁筛查量表',
    desc: '过去两周内下列问题在多大程度上困扰你。',
    options: ['一点也没有(0)', '几天(1)', '一半以上的天数(2)', '几乎每天(3)'],
    questions: [
      { id: 1, text: '做事时提不起劲或没有兴趣' },
      { id: 2, text: '感到心情低落、沮丧或绝望' },
      { id: 3, text: '入睡困难、易醒或睡眠过多' },
      { id: 4, text: '感到疲倦或没有活力' },
      { id: 5, text: '食欲不振或吃得过多' },
      { id: 6, text: '觉得自己很糟糕，或觉得自己失败了，或让自己或家人失望' },
      { id: 7, text: '对事情专注有困难，例如读报或看电视时' },
      { id: 8, text: '动作或说话比平时缓慢，或相反，坐立不安、动来动去' },
      { id: 9, text: '有不如死了或以某种方式伤害自己的念头' }
    ]
  },
  gad7: {
    id: 'gad7',
    title: 'GAD-7 广泛性焦虑量表',
    desc: '过去两周内下列问题在多大程度上困扰你。',
    options: ['一点也没有(0)', '几天(1)', '一半以上的天数(2)', '几乎每天(3)'],
    questions: [
      { id: 1, text: '感到紧张、焦虑或烦躁' },
      { id: 2, text: '无法停止或控制担忧' },
      { id: 3, text: '对各种不同的事情过度担忧' },
      { id: 4, text: '很难放松下来' },
      { id: 5, text: '因焦虑而坐立不安、难以静坐' },
      { id: 6, text: '容易烦恼或易怒' },
      { id: 7, text: '感到害怕，好像会发生不好的事情' }
    ]
  },
  pss10: {
    id: 'pss10',
    title: 'PSS-10 主观压力量表',
    desc: '在过去一个月里，你对以下情况的感觉与想法。',
    options: ['从不(0)', '很少(1)', '有时(2)', '经常(3)', '总是(4)'],
    questions: [
      { id: 1, text: '因为意外发生的事情而感到心烦意乱' },
      { id: 2, text: '觉得自己无法控制生活中的重要事情' },
      { id: 3, text: '感到紧张和压力' },
      { id: 4, text: '对自己个人的事情感到自信', reverse: true },
      { id: 5, text: '觉得事情进展顺利', reverse: true },
      { id: 6, text: '觉得无法应付你必须要做的一切' },
      { id: 7, text: '能够控制烦恼', reverse: true },
      { id: 8, text: '觉得事情都在按照你的意愿进行', reverse: true },
      { id: 9, text: '因为事情超出你的控制而感到生气' },
      { id: 10, text: '觉得困难堆积如山，无法克服' }
    ]
  }
};

const CITATIONS = {
  phq9: [
    { text: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: Validity of a brief depression severity measure. J Gen Intern Med. 2001.', url: 'https://pubmed.ncbi.nlm.nih.gov/11556941/' }
  ],
  gad7: [
    { text: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: The GAD-7. Arch Intern Med. 2006.', url: 'https://pubmed.ncbi.nlm.nih.gov/16717171/' }
  ],
  pss10: [
    { text: 'Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. J Health Soc Behav. 1983.', url: 'https://www.jstor.org/stable/2136404' },
    { text: 'Perceived Stress Scale (PSS) - Mind Garden', url: 'https://www.mindgarden.com/132-perceived-stress-scale' }
  ]
};

const state = {
  view: 'home',
  current: null,
  answers: [],
  step: 0
};

const el = (id) => document.getElementById(id);

// --- VIEW MANAGEMENT ---

function switchView(v) {
  const oldView = state.view;
  state.view = v;
  
  // Simple fade transition logic
  const views = ['view-home', 'view-test', 'view-result'];
  views.forEach(id => {
    const element = el(id);
    if (id === `view-${v}`) {
      element.classList.remove('hidden');
      // Add entry animation
      element.classList.add('fade-enter');
      requestAnimationFrame(() => {
        element.classList.add('fade-enter-active');
        element.classList.remove('fade-enter');
      });
    } else {
      element.classList.add('hidden');
      element.classList.remove('fade-enter', 'fade-enter-active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SCORING LOGIC ---

function reversePSS(v) { return 4 - v; }

function gradePHQ9(sum) {
  if (sum <= 4) return { level: '最轻度/无', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 9) return { level: '轻度', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (sum <= 14) return { level: '中度', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  if (sum <= 19) return { level: '中重度', color: 'bg-red-50 text-red-700 border-red-200' };
  return { level: '重度', color: 'bg-red-50 text-red-700 border-red-200' };
}

function advisePHQ9(sum) {
  if (sum <= 4) return ['您的心理状态良好。建议继续保持规律作息、适量运动与良好社交。']
  if (sum <= 9) return ['您似乎有一些轻微的情绪困扰。可尝试行为激活、运动与睡眠卫生等自助策略，如持续两周以上或影响功能建议咨询专业人士。']
  if (sum <= 14) return ['您可能正经历中度的抑郁症状。建议尽快预约专业心理咨询或评估，认知行为疗法（CBT）可能对您有帮助。']
  if (sum <= 19) return ['您的症状较为明显。建议尽快寻求专业医生的帮助，遵循医嘱进行系统治疗与随访。']
  return ['您的症状严重，请务必尽快就医。如出现自伤想法，请立即联系应急援助或前往急诊。']
}

function gradeGAD7(sum) {
  if (sum <= 4) return { level: '最轻度/无', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 9) return { level: '轻度', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (sum <= 14) return { level: '中度', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { level: '重度', color: 'bg-red-50 text-red-700 border-red-200' };
}

function adviseGAD7(sum) {
  if (sum <= 4) return ['您的状态很放松。建议保持健康生活方式与放松训练。']
  if (sum <= 9) return ['您似乎有些许焦虑。可尝试呼吸放松、正念练习与时间管理等方法来缓解压力。']
  if (sum <= 14) return ['您可能正经历中度的焦虑。建议尽快咨询专业人士，系统化开展心理咨询或治疗。']
  return ['您的焦虑症状较重，可能已影响生活。请尽快就医进行评估与治疗。']
}

function gradePSS10(sum) {
  if (sum <= 13) return { level: '低压力', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (sum <= 26) return { level: '中等压力', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  return { level: '高压力', color: 'bg-orange-50 text-orange-800 border-orange-200' };
}

function advisePSS10(sum) {
  if (sum <= 13) return ['您的压力水平较低，应对压力的能力较好。建议继续保持。']
  if (sum <= 26) return ['您处于中等压力水平。建议优化睡眠、运动与社交支持，并合理安排任务优先级，给自己一些喘息空间。']
  return ['您的压力水平较高，可能已不堪重负。建议及时调整工作生活节奏，必要时寻求家人、同事与专业人士支持。']
}

function score(scaleId, answers) {
  if (scaleId === 'phq9') {
    const sum = answers.reduce((a, b) => a + b, 0);
    const grade = gradePHQ9(sum);
    const advice = advisePHQ9(sum);
    let safety = null;
    if (answers[8] >= 1) {
      safety = '安全提示：您在第9题（关于自伤念头）的回答中选择了非“完全没有”。请务必重视，如存在自伤或伤人想法，请立即联系当地应急援助或前往医院急诊。';
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
    const scored = answers.map((v, i) => (SCALES.pss10.questions[i].reverse ? reversePSS(v) : v));
    const sum = scored.reduce((a, b) => a + b, 0);
    const grade = gradePSS10(sum);
    const advice = advisePSS10(sum);
    return { sum, max: 40, grade, advice };
  }
  return null;
}

// --- HOME CONTROLLER ---

function renderHome() {
  const container = el('cards-container');
  container.innerHTML = '';
  Object.values(SCALES).forEach((s) => {
    const card = document.createElement('div');
    card.className = 'group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden';
    
    // Decorative background
    const bg = document.createElement('div');
    bg.className = 'absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -mr-4 -mt-4 z-0 group-hover:scale-110 transition-transform';
    card.appendChild(bg);

    const content = document.createElement('div');
    content.className = 'relative z-10 flex-1 flex flex-col';
    content.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <h3 class="font-bold text-xl text-slate-800 group-hover:text-emerald-700 transition-colors">${s.title}</h3>
      </div>
      <p class="text-slate-500 text-sm leading-relaxed mb-6 flex-1">${s.desc}</p>
      <div class="flex items-center justify-between mt-auto">
        <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">${s.questions.length} 题 · 约 ${Math.ceil(s.questions.length*0.5)} 分钟</span>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    `;
    card.appendChild(content);
    
    card.addEventListener('click', () => startTest(s.id));
    container.appendChild(card);
  });
  renderHistory();
  switchView('home');
}

// --- TEST CONTROLLER (WIZARD) ---

function startTest(scaleId) {
  state.current = SCALES[scaleId];
  state.answers = Array(state.current.questions.length).fill(null);
  state.step = 0;
  renderTestUI();
  renderQuestion();
  switchView('test');
}

function renderTestUI() {
  // Update static parts of test view if needed
}

function renderQuestion(direction = 'next') {
  const qIndex = state.step;
  const qData = state.current.questions[qIndex];
  const total = state.current.questions.length;
  
  // Update Progress
  const pct = Math.round(((qIndex) / total) * 100);
  el('progress-bar').style.width = `${pct}%`;
  el('progress-text').textContent = `${pct}%`;
  el('test-step-indicator').textContent = `Question ${qIndex + 1} / ${total}`;

  // Update Buttons
  el('prev-btn').disabled = qIndex === 0;
  el('prev-btn').style.opacity = qIndex === 0 ? '0' : '1';
  el('next-btn').textContent = qIndex === total - 1 ? '查看结果' : '下一题';
  el('next-btn').classList.toggle('hidden', state.answers[qIndex] === null); // Hide next until answered? Or just disable. We'll use auto-advance mostly.

  // Render Card
  const container = el('question-card-container');
  
  // Create new card
  const card = document.createElement('div');
  card.className = 'absolute inset-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8';
  if (direction) {
    card.classList.add('slide-enter');
    // Trigger reflow
    void card.offsetWidth;
    requestAnimationFrame(() => card.classList.add('slide-enter-active'));
  }

  // Question Text
  const title = document.createElement('h3');
  title.className = 'text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug';
  title.textContent = qData.text;
  card.appendChild(title);

  // Options
  const optsContainer = document.createElement('div');
  optsContainer.className = 'space-y-3';
  
  state.current.options.forEach((optText, val) => {
    const btn = document.createElement('button');
    const isSelected = state.answers[qIndex] === val;
    
    btn.className = `w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center group ${
      isSelected 
        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-inner' 
        : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50 text-slate-600'
    }`;
    
    // Keyboard shortcut index
    const keyIndex = document.createElement('span');
    keyIndex.className = `flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium mr-4 border transition-colors ${
      isSelected ? 'border-emerald-200 bg-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-400 group-hover:border-emerald-200'
    }`;
    keyIndex.textContent = String.fromCharCode(65 + val); // A, B, C...

    const textSpan = document.createElement('span');
    textSpan.className = 'font-medium text-base';
    textSpan.textContent = optText;

    btn.appendChild(keyIndex);
    btn.appendChild(textSpan);

    btn.onclick = () => handleAnswer(val);
    optsContainer.appendChild(btn);
  });
  card.appendChild(optsContainer);

  // Replace old card
  container.innerHTML = '';
  container.appendChild(card);
}

function handleAnswer(val) {
  state.answers[state.step] = val;
  
  // Visual feedback - re-render current question to show selection state briefly
  renderQuestion(null);

  setTimeout(() => {
    if (state.step < state.current.questions.length - 1) {
      state.step++;
      renderQuestion('next');
    } else {
      finishTest();
    }
  }, 250); // Small delay for user to see feedback
}

function prevQuestion() {
  if (state.step > 0) {
    state.step--;
    renderQuestion('prev');
  }
}

function finishTest() {
  // Calculate full progress for a moment
  el('progress-bar').style.width = '100%';
  el('progress-text').textContent = '100%';
  
  setTimeout(() => {
    const res = score(state.current.id, state.answers);
    renderResult(res);
    switchView('result');
  }, 400);
}

// --- RESULT CONTROLLER ---

function renderResult(res) {
  el('result-title').textContent = state.current.title;
  
  // Animate Score
  const scoreEl = el('result-score');
  const startVal = 0;
  const endVal = res.sum;
  const duration = 1000;
  const startTime = performance.now();

  function updateScore(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease out
    
    const currentScore = Math.floor(startVal + (endVal - startVal) * ease);
    scoreEl.textContent = currentScore;

    if (progress < 1) {
      requestAnimationFrame(updateScore);
    }
  }
  requestAnimationFrame(updateScore);

  // Update Gauge
  const pct = Math.round((res.sum / res.max) * 100);
  el('score-circle').style.setProperty('--score-pct', pct);

  // Severity Info
  // el('result-severity').textContent = res.grade.level;
  // el('result-severity').className = `text-3xl md:text-4xl font-bold ${res.grade.color.replace('bg-', 'text-').split(' ')[1]}`; // Hacky color extraction or just reset text color
  // Let's just use text-slate-800 for main text and colored tag
  el('result-severity').textContent = res.grade.level;
  el('result-severity').className = 'text-3xl md:text-4xl font-bold text-slate-900';
  
  const tag = el('result-tag');
  tag.textContent = res.grade.level;
  // Extract color classes
  // grade.color is like "bg-emerald-50 text-emerald-700 border-emerald-200"
  tag.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${res.grade.color}`;

  // Advice
  const advice = el('result-advice');
  advice.innerHTML = res.advice.map((p) => `<p class="mb-3">${p}</p>`).join('');

  // Citations
  const citations = el('result-citations');
  citations.innerHTML = '';
  (CITATIONS[state.current.id] || []).forEach((c) => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="text-slate-400 hover:text-emerald-600 hover:underline transition-colors" href="${c.url}" target="_blank" rel="noopener">${c.text}</a>`;
    citations.appendChild(li);
  });

  // Details
  const detail = el('result-detail');
  detail.innerHTML = '';
  state.current.questions.forEach((q, i) => {
    const v = state.answers[i];
    const label = state.current.options[v]; // e.g. "几乎每天(3)"
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm';
    item.innerHTML = `<span class="text-slate-600 truncate flex-1 mr-4">${i + 1}. ${q.text}</span><span class="font-medium text-slate-800 flex-shrink-0">${label.split('(')[0]}</span>`;
    detail.appendChild(item);
  });

  // Safety
  const safety = el('safety-note');
  if (res.safety) {
    el('safety-text').textContent = res.safety;
    safety.classList.remove('hidden');
  } else {
    safety.classList.add('hidden');
  }
  
  // Reset toggle
  el('detailSection').classList.add('hidden');
  el('detailChevron').style.transform = 'rotate(0deg)';

  // Save History
  const record = {
    id: state.current.id,
    title: state.current.title,
    sum: res.sum,
    max: res.max,
    level: res.grade.level,
    at: Date.now()
  };
  saveHistory(record);
}

// --- HISTORY MANAGER ---

function saveHistory(rec) {
  const key = 'mindself_studio_history';
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : {};
  if (!data[rec.id]) data[rec.id] = [];
  data[rec.id].unshift(rec);
  data[rec.id] = data[rec.id].slice(0, 10);
  localStorage.setItem(key, JSON.stringify(data));
}

function renderHistory() {
  const key = 'mindself_studio_history';
  const raw = localStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : {};
  const container = el('history-container');
  container.innerHTML = '';
  
  let hasAny = false;
  // Flatten history for display sorted by time
  let allRecs = [];
  Object.values(data).forEach(list => allRecs = allRecs.concat(list));
  allRecs.sort((a, b) => b.at - a.at);

  if (allRecs.length > 0) {
    hasAny = true;
    allRecs.slice(0, 5).forEach(rec => {
      const card = document.createElement('div');
      card.className = 'flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all';
      
      const d = new Date(rec.at);
      const timeStr = `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      
      card.innerHTML = `
        <div>
          <div class="font-bold text-slate-800">${rec.title}</div>
          <div class="text-xs text-slate-400 mt-1">${timeStr}</div>
        </div>
        <div class="text-right">
          <div class="font-bold text-emerald-600">${rec.sum} <span class="text-xs text-slate-400 font-normal">/ ${rec.max}</span></div>
          <div class="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-1">${rec.level}</div>
        </div>
      `;
      // Allow clicking history to maybe retake? Or just view? For now just display.
      container.appendChild(card);
    });
  }

  el('history-block').classList.toggle('hidden', !hasAny);
}

function clearHistory() {
  if(confirm('确定要清空所有历史记录吗？')) {
    localStorage.removeItem('mindself_studio_history');
    renderHistory();
  }
}

// --- INIT ---

function initPrivacy() {
  const modal = el('privacyModal');
  const open = () => {
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.children[0].classList.remove('scale-95');
      modal.children[0].classList.add('scale-100');
    });
  };
  const close = () => {
    modal.classList.add('opacity-0');
    modal.children[0].classList.remove('scale-100');
    modal.children[0].classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
  };

  el('privacyBtn').addEventListener('click', open);
  el('privacyClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function init() {
  renderHome();
  initPrivacy();

  el('backHomeFromTest').addEventListener('click', () => switchView('home'));
  el('backHomeFromResult').addEventListener('click', () => switchView('home'));
  el('retakeBtn').addEventListener('click', () => startTest(state.current.id));
  el('printBtn').addEventListener('click', () => window.print());
  
  el('prev-btn').addEventListener('click', prevQuestion);
  el('next-btn').addEventListener('click', () => {
    // Manual next if needed
  });
  
  el('toggleDetailsBtn').addEventListener('click', () => {
    const section = el('detailSection');
    const icon = el('detailChevron');
    const isHidden = section.classList.contains('hidden');
    
    if (isHidden) {
      section.classList.remove('hidden');
      icon.style.transform = 'rotate(180deg)';
    } else {
      section.classList.add('hidden');
      icon.style.transform = 'rotate(0deg)';
    }
  });

  el('clearHistoryBtn').addEventListener('click', clearHistory);
}

document.addEventListener('DOMContentLoaded', init);
