// 预设剧情数据。文本、触发条件、消息顺序、延迟与引用关系都放在这里。
// 新增剧情时使用不同的 id 和 contact.id；不要改现有普通联系人的 id。
window.PHONE_CHAT_STORIES = [
  {
    id: 'wuxiao-dinner',
    app: 'wechat',
    contact: { id: 'story-wuxiao', name: '五小', pet: 1, scripted: true, seed: [] },
    ui: {
      initialHint: '轻点输入框回复',
      busyHint: '轻点输入框回复',
      nextHint: '轻点输入框回复',
      completeHint: '轻点输入框回复',
      typingLabel: '正在输入中'
    },
    initialMessages: [
      { id: 'invitation', out: false, text: '周末一起吃饭吗？我知道有一家新开的云南菜' }
    ],
    typing: { characterMs: 165 },
    stages: [
      {
        id: 'dinner-and-gossip',
        trigger: { type: 'inputTap' },
        actions: [
          { type: 'typeDraft', message: { id: 'user-dinner', out: true, text: '好呀，晚餐么？周五还是周六呀？' } },
          { type: 'wait', delayMs: [500, 1000] },
          { type: 'typeDraft', message: { id: 'user-gossip', out: true, text: '刚好有八卦想要跟你分享' } },
          { type: 'keyboard', visible: false },
          { type: 'wait', delayMs: [1000, 3000], typing: true },
          { type: 'send', message: { id: 'reply-time', out: false, text: '周五下班后吧，7点怎么样？' } },
          { type: 'wait', delayMs: [1000, 2000], typing: true },
          { type: 'send', message: { id: 'reply-quote', out: false, text: '好呀好呀！正愁着没瓜吃', quote: { messageId: 'user-gossip', author: '我' } } }
        ]
      },
      {
        id: 'confirm-friday',
        trigger: { type: 'inputTap' },
        actions: [
          { type: 'typeDraft', message: { id: 'user-confirm', out: true, text: '没问题，那周五7点见' } },
          { type: 'keyboard', visible: false }
        ]
      }
    ]
  },
  {
    id: 'honey-home', app: 'wechat',
    contact: { id: 'honey', name: '哈尼', pet: 1, scripted: true, seed: [] },
    ui: { initialHint: '轻点输入框回复', busyHint: '轻点输入框回复', completeHint: '轻点输入框回复', typingLabel: '正在输入中' },
    typing: { characterMs: 165 },
    initialTimeLabel: '17:48',
    initialMessages: [
      { id: 'seed-1', out: false, text: '估计要晚20分钟到家，路上堵车' },
      { id: 'seed-2', out: true, text: '好的，我也刚从办公室离开' },
      { id: 'seed-3', out: false, text: '晚上想吃什么？我一会顺路去买菜' },
      { id: 'seed-4', out: true, text: '烤牛排吧！好久没吃了' },
      { id: 'seed-5', out: true, text: '要不我们直接在超市见面吧？' },
      { id: 'seed-6', out: false, text: '也行，看看还有什么别的想吃的' },
      { id: 'seed-7', out: true, text: '那一会见' }
    ],
    proactive: { afterUnlockMs: 12000, message: { id: 'arrival', out: false, timeLabel: '18:15', text: '你到哪儿了？我刚停好车' }, readyHint: '轻点输入框回复' },
    stages: [{ id: 'meet-at-market', trigger: { type: 'inputTap' }, actions: [
      { type: 'typeDraft', message: { id: 'five-minutes', out: true, text: '还有5分钟，我刚出地铁站' } },
      { type: 'keyboard', visible: false },
      { type: 'wait', delayMs: [1000, 2000], typing: true },
      { type: 'send', message: { id: 'wait-at-door', out: false, text: '好，那我在门口等你' } }
    ] }]
  }
];
// 普通聊天仍由原来的数据和自动回复引擎管理；剧情联系人明确关闭通用自动回复。
for (const story of window.PHONE_CHAT_STORIES) {
  const existing = PHONE_CHAT_PRESETS.wechat.find(c => c.id === story.contact.id);
  if (existing) Object.assign(existing, story.contact);
  else {
    PHONE_CHAT_PRESETS.wechat.push({ ...story.contact, seed: story.initialMessages.map(m => ({ ...m })) });
  }
  PHONE_CHAT_PRESETS.replies.wechat[story.contact.id] = { enabled: false, rules: [], fallback: [] };
}

// 哈尼的主动消息由剧情执行器单独安排，避免旧关键词/主动规则打断剧情。
PHONE_CHAT_PRESETS.proactive.rules = PHONE_CHAT_PRESETS.proactive.rules.filter(rule => !(rule.app === 'wechat' && rule.contactId === 'honey'));
