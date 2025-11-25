// ============================================
// 评分逻辑 - MindSelf Studio
// ============================================

const SCORING = {
  phq9: (answers) => {
    const sum = answers.reduce((a, b) => a + b, 0);
    let grade, advice;
    if (sum <= 4) {
      grade = { level: '无/极轻微', color: 'emerald', emoji: '😊' };
      advice = ['您的心理状态良好。建议继续保持规律作息、适量运动与良好社交。'];
    } else if (sum <= 9) {
      grade = { level: '轻度', color: 'yellow', emoji: '😐' };
      advice = ['您似乎有一些轻微的情绪困扰。可尝试行为激活、运动与睡眠卫生等自助策略。'];
    } else if (sum <= 14) {
      grade = { level: '中度', color: 'orange', emoji: '😟' };
      advice = ['您可能正经历中度的抑郁症状。建议尽快预约专业心理咨询或评估。'];
    } else if (sum <= 19) {
      grade = { level: '中重度', color: 'red', emoji: '😢' };
      advice = ['您的症状较为明显。建议尽快寻求专业医生的帮助。'];
    } else {
      grade = { level: '重度', color: 'red', emoji: '🆘' };
      advice = ['您的症状严重，请务必尽快就医。'];
    }
    let safety = answers[8] >= 1 ? '安全提示：请务必重视，如存在自伤想法，请立即联系应急援助。' : null;
    return { sum, max: 27, grade, advice, safety };
  },

  gad7: (answers) => {
    const sum = answers.reduce((a, b) => a + b, 0);
    let grade, advice;
    if (sum <= 4) {
      grade = { level: '无/极轻微', color: 'emerald', emoji: '😌' };
      advice = ['您的状态很放松。建议保持健康生活方式。'];
    } else if (sum <= 9) {
      grade = { level: '轻度', color: 'yellow', emoji: '😐' };
      advice = ['您似乎有些许焦虑。可尝试呼吸放松、正念练习。'];
    } else if (sum <= 14) {
      grade = { level: '中度', color: 'orange', emoji: '😟' };
      advice = ['您可能正经历中度的焦虑。建议咨询专业人士。'];
    } else {
      grade = { level: '重度', color: 'red', emoji: '😰' };
      advice = ['您的焦虑症状较重。请尽快就医进行评估与治疗。'];
    }
    return { sum, max: 21, grade, advice };
  },

  pss10: (answers, questions) => {
    const scored = answers.map((v, i) => questions[i].reverse ? (4 - v) : v);
    const sum = scored.reduce((a, b) => a + b, 0);
    let grade, advice;
    if (sum <= 13) {
      grade = { level: '低压力', color: 'emerald', emoji: '😊' };
      advice = ['您的压力水平较低，应对能力较好。'];
    } else if (sum <= 26) {
      grade = { level: '中等压力', color: 'yellow', emoji: '😐' };
      advice = ['您处于中等压力水平。建议优化睡眠、运动与社交支持。'];
    } else {
      grade = { level: '高压力', color: 'orange', emoji: '😣' };
      advice = ['您的压力水平较高。建议及时调整节奏，寻求支持。'];
    }
    return { sum, max: 40, grade, advice };
  },

  sds: (answers, questions) => {
    const scored = answers.map((v, i) => {
      const score = v + 1;
      return questions[i].reverse ? (5 - score) : score;
    });
    const rawSum = scored.reduce((a, b) => a + b, 0);
    const sum = Math.round(rawSum * 1.25);
    let grade, advice;
    if (sum < 53) {
      grade = { level: '正常', color: 'emerald', emoji: '😊' };
      advice = ['您目前没有明显的抑郁症状。'];
    } else if (sum < 63) {
      grade = { level: '轻度抑郁', color: 'yellow', emoji: '😐' };
      advice = ['您可能存在轻度抑郁倾向。建议适当调整作息。'];
    } else if (sum < 73) {
      grade = { level: '中度抑郁', color: 'orange', emoji: '😟' };
      advice = ['您可能正经历中度抑郁症状。强烈建议寻求专业帮助。'];
    } else {
      grade = { level: '重度抑郁', color: 'red', emoji: '🆘' };
      advice = ['您的抑郁症状较为严重，请务必尽快就医。'];
    }
    let safety = answers[18] >= 2 ? '安全提示：如存在自伤想法，请立即寻求帮助。' : null;
    return { sum, max: 100, grade, advice, safety, rawSum };
  },

  sas: (answers, questions) => {
    const scored = answers.map((v, i) => {
      const score = v + 1;
      return questions[i].reverse ? (5 - score) : score;
    });
    const rawSum = scored.reduce((a, b) => a + b, 0);
    const sum = Math.round(rawSum * 1.25);
    let grade, advice;
    if (sum < 50) {
      grade = { level: '正常', color: 'emerald', emoji: '😌' };
      advice = ['您目前没有明显的焦虑症状。'];
    } else if (sum < 60) {
      grade = { level: '轻度焦虑', color: 'yellow', emoji: '😐' };
      advice = ['您可能存在轻度焦虑。建议尝试放松技巧。'];
    } else if (sum < 70) {
      grade = { level: '中度焦虑', color: 'orange', emoji: '😟' };
      advice = ['您可能正经历中度焦虑症状。建议寻求专业咨询。'];
    } else {
      grade = { level: '重度焦虑', color: 'red', emoji: '😰' };
      advice = ['您的焦虑症状较为严重，请尽快就医。'];
    }
    return { sum, max: 100, grade, advice, rawSum };
  },

  rosenberg: (answers, questions) => {
    const scored = answers.map((v, i) => {
      const score = v + 1;
      return questions[i].reverse ? (5 - score) : score;
    });
    const sum = scored.reduce((a, b) => a + b, 0);
    let grade, advice;
    if (sum >= 30) {
      grade = { level: '高自尊', color: 'emerald', emoji: '🌟' };
      advice = ['您拥有健康的自尊水平。继续保持积极的自我认知。'];
    } else if (sum >= 20) {
      grade = { level: '中等自尊', color: 'yellow', emoji: '😊' };
      advice = ['您的自尊水平属于正常范围。可以更多关注自己的优点。'];
    } else {
      grade = { level: '低自尊', color: 'orange', emoji: '😔' };
      advice = ['您可能对自己的评价偏低。建议学会欣赏自己的优点。'];
    }
    return { sum, max: 40, grade, advice };
  },

  who5: (answers) => {
    const sum = answers.reduce((a, b) => a + b, 0);
    const percent = Math.round((sum / 25) * 100);
    let grade, advice;
    if (percent >= 50) {
      grade = { level: '良好', color: 'emerald', emoji: '🌟' };
      advice = ['您的幸福感水平良好。继续保持积极的生活态度。'];
    } else if (percent >= 28) {
      grade = { level: '一般', color: 'yellow', emoji: '😐' };
      advice = ['您的幸福感水平一般。建议增加让自己愉快的活动。'];
    } else {
      grade = { level: '偏低', color: 'orange', emoji: '😔' };
      advice = ['您的幸福感水平偏低，可能提示有情绪问题。建议关注自身状态。'];
    }
    return { sum: percent, max: 100, grade, advice, rawSum: sum };
  },

  psqi: (answers) => {
    const sum = answers.reduce((a, b) => a + b, 0);
    let grade, advice;
    if (sum <= 5) {
      grade = { level: '睡眠质量好', color: 'emerald', emoji: '😴' };
      advice = ['您的睡眠质量良好。请继续保持。'];
    } else if (sum <= 10) {
      grade = { level: '睡眠质量一般', color: 'yellow', emoji: '😐' };
      advice = ['您的睡眠质量有待改善。建议建立规律作息。'];
    } else if (sum <= 15) {
      grade = { level: '睡眠质量较差', color: 'orange', emoji: '😣' };
      advice = ['您的睡眠问题较为明显。建议进行睡眠卫生教育。'];
    } else {
      grade = { level: '睡眠障碍', color: 'red', emoji: '😫' };
      advice = ['您可能存在较严重的睡眠问题。强烈建议尽快就医。'];
    }
    return { sum, max: 30, grade, advice };
  }
};
