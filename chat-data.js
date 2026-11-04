// 聊天资料与脚本集中配置：不需要 API。保留 id，避免已有聊天记录换人。
// messages: 信息联系人；wechat: 微信联系人。可修改 name、头像和 seed/lines。
window.PHONE_CHAT_PRESETS = {
  messages: [
  {id:'a',name:'小A',initial:'A',color:'#b5a5e3',unread:true,lines:[['in','今天下班要不要一起去吃火锅？'],['out','好呀！还是上次那家吗？'],['in','对，我订了六点半的位置，到了给我发消息～']]},
  {id:'honey',name:'哈尼',initial:'♡',color:'#efa9b9',unread:true,lines:[['in','早上好，记得吃早餐哦 ☀️'],['out','吃过啦，今天带了你买的面包。'],['in','我晚上买菜，想吃番茄炒蛋还是咖喱？'],['out','咖喱！我下班顺路买水果。'],['in','好，那我等你回家一起吃饭 ❤️']]},
  {id:'mom',name:'妈妈',initial:'妈',color:'#e6ae83',lines:[['in','这几天降温，出门多穿一件衣服。'],['out','知道啦，今天穿了外套。你们也注意保暖！'],['in','周末有空就回来吃饭，给你做好吃的。']]},
  {id:'weekend',name:'周末出游',initial:'☀',color:'#8bbeb0',lines:[['in','周六去公园怎么样？天气预报说是晴天。'],['out','可以呀，我带点零食。'],['in','那就十点在地铁站见！']]},
  {id:'assistant',name:'文件传输助手',initial:'▤',color:'#85b1dd',lines:[['in','可以在这里保存临时文字。消息只会保存在当前浏览器。']]}
],
  wechat: [{id:'honey',name:'哈尼',pet:1,seed:[{out:false,text:'晚上想吃什么？我顺路买菜。'},{out:true,text:'想吃咖喱，回家见～'}]},{id:'coworker',name:'同事A',pet:0,seed:[{out:false,text:'明天的资料我整理好了，早上一起确认一下吧。'}]},{id:'friendc',name:'朋友C',pet:1,seed:[{out:false,text:'周末一起喝咖啡吗？发现了一家新店。'}]},{id:'friday',name:'周五打球群',group:true,seed:[{out:false,text:'朋友C：这周五还是七点，老地方球馆见！'},{out:true,text:'收到，我带球。'},{out:false,text:'同事A：我也来，打完一起吃饭～'}]},{id:'assistant',name:'文件传输助手',assistant:true,seed:[]}],
  replyDelay: { minMs: 1000, maxMs: 3000 },
  // 每条规则按顺序匹配；keywords 任意一个出现在消息中即可命中。
  // 同一规则可以写多条 responses，系统会轮流选用。
  replies: {
    messages: {
      a: { rules: [
        { keywords: ['吃','饭','火锅','饿'], responses: ['走呀，我已经开始想吃火锅了！你想几点？','那就老地方见，我先去看看有没有位置。'] },
        { keywords: ['到','见','出发'], responses: ['好，我也快到了，门口见！','收到，路上注意安全，我等你。'] },
        { keywords: ['你好','早','嗨'], responses: ['嗨！今天过得怎么样？','早呀，今天也要元气满满！'] }
      ], fallback: ['收到！等会儿见面再聊～','哈哈，听起来不错，详细说说？','好呀，我这边都可以。'] },
      honey: { rules: [
        { keywords: ['吃','饭','饿','咖喱'], responses: ['给你留着饭呢，回来记得先洗手 ❤️','那我准备做咖喱啦，等你一起吃。'] },
        { keywords: ['想你','爱你','喜欢'], responses: ['我也想你，忙完早点回家呀 ❤️','收到你的想念啦，给你一个抱抱。'] },
        { keywords: ['晚安','睡'], responses: ['晚安，今天辛苦了，做个好梦呀。','快休息吧，明天见 ❤️'] }
      ], fallback: ['好呀，我听着呢，慢慢说。','知道啦，你也要记得照顾好自己 ❤️','嗯嗯，等你忙完我们再聊。'] },
      mom: { rules: [
        { keywords: ['吃','饭'], responses: ['吃饱了吗？别总是凑合，记得多吃点蔬菜。','周末回来吃饭吧，给你做爱吃的。'] },
        { keywords: ['忙','工作'], responses: ['工作再忙也要休息，别熬夜。','好的，你先忙，有空给家里打个电话。'] }
      ], fallback: ['知道啦，出门注意安全。','好的，记得按时吃饭。','我们都挺好的，你放心。'] },
      weekend: { rules: [{ keywords: ['周末','公园','几点'], responses: ['那就周六十点地铁站见！','天气不错的话去公园吧，我带零食。'] }], fallback: ['收到，大家一起商量一下～','可以呀，我周末有空。'] },
      assistant: { enabled: false, rules: [], fallback: [] }
    },
    wechat: {
      honey: { rules: [
        { keywords: ['吃','饭','饿','咖喱'], responses: ['我刚买好菜，晚上一起吃咖喱吧 ❤️','给你留了好吃的，快回来～'] },
        { keywords: ['想你','爱你','喜欢'], responses: ['我也想你啦 ❤️','抱抱，忙完记得来找我。'] },
        { keywords: ['晚安','睡'], responses: ['晚安，给你盖好被子，明天见。','早点休息呀，今天辛苦啦。'] }
      ], fallback: ['嗯嗯，我在呢，继续说～','好呀，听你的 ❤️','收到啦，等你回家。'] },
      coworker: { rules: [
        { keywords: ['工作','资料','项目','会议'], responses: ['收到，我整理好资料后发你，明早一起确认。','好的，我会在会议前准备好，有更新再同步。'] },
        { keywords: ['谢谢','辛苦'], responses: ['不客气，互相配合！','应该的，有问题随时沟通。'] }
      ], fallback: ['收到，稍后确认后回复你。','好的，我这边记下了。','没问题，我们按这个安排推进。'] },
      friendc: { rules: [
        { keywords: ['咖啡','周末','出去'], responses: ['走走走，周末我有空！','新开的那家咖啡店不错，要不要去试试？'] },
        { keywords: ['哈哈','好笑'], responses: ['哈哈哈哈我也是这样！','笑死，太有画面了 😂'] }
      ], fallback: ['哈哈好呀，安排！','在呢，怎么啦？','可以可以，我都行～'] },
      friday: { rules: [
        { keywords: ['打球','周五','几点','七点'], responses: ['朋友C：还是周五七点，老地方球馆！','同事A：收到，我带水，大家别迟到～'] },
        { keywords: ['来','参加','收到'], responses: ['朋友C：好耶，又齐一位！','同事A：收到，到时候球场见。'] }
      ], fallback: ['朋友C：收到，大家群里再确认一下～','同事A：没问题，周五见！'] },
      assistant: { enabled: false, rules: [], fallback: [] }
    }
  },
  // 首次解锁后触发；同一浏览器标签页每条规则只安排一次，刷新不会重复安排。
  proactive: {
    enabled: true,
    rules: [
      { id: 'honey-check-in', app: 'wechat', contactId: 'honey', afterUnlockMs: 15000, texts: ['下班想吃什么？我准备买菜啦 ❤️','记得喝水，今天也要照顾好自己。'] },
      { id: 'a-weekend', app: 'messages', contactId: 'a', afterUnlockMs: 30000, texts: ['周末有空吗？一起出去走走吧！','我发现一家不错的小店，下次一起去？'] }
    ]
  }
};
