// 预设剧情数据。文本、触发条件、消息顺序、延迟与引用关系都放在这里。
// 新增剧情时使用不同的 id 和 contact.id；不要改现有普通联系人的 id。
window.PHONE_CHAT_STORIES = [
  {
    id: 'wuxiao-dinner',
    app: 'wechat',
    contact: { id: 'story-wuxiao', name: '五小', pet: 1, scripted: true, seed: [] },
    ui: {
      initialHint: '轻点输入框，回复五小',
      busyHint: '正在自动输入…',
      nextHint: '轻点输入框，继续回复',
      completeHint: '这段聊天已结束',
      typingLabel: '五小正在输入中……'
    },
    initialMessages: [
      { id: 'invitation', out: false, text: '周末一起吃饭吗？我知道有一家新开的云南菜' }
    ],
    typing: { characterMs: 65 },
    stages: [
      {
        id: 'dinner-and-gossip',
        trigger: { type: 'inputTap' },
        actions: [
          { type: 'typeAndSend', message: { id: 'user-dinner', out: true, text: '好呀，晚餐么？周五还是周六呀？' } },
          { type: 'wait', delayMs: [500, 1000] },
          { type: 'typeAndSend', message: { id: 'user-gossip', out: true, text: '刚好有八卦想要跟你分享' } },
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
          { type: 'typeAndSend', message: { id: 'user-confirm', out: true, text: '没问题，那周五7点见' } },
          { type: 'keyboard', visible: false }
        ]
      }
    ]
  }
];
// 普通聊天仍由原来的数据和自动回复引擎管理；剧情联系人明确关闭通用自动回复。
for (const story of window.PHONE_CHAT_STORIES) {
  if (!PHONE_CHAT_PRESETS.wechat.some(c => c.id === story.contact.id)) {
    PHONE_CHAT_PRESETS.wechat.push({ ...story.contact, seed: story.initialMessages.map(m => ({ ...m })) });
  }
  PHONE_CHAT_PRESETS.replies.wechat[story.contact.id] = { enabled: false, rules: [], fallback: [] };
}
