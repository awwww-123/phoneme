// 串行、可暂停的剧情执行器。只操作剧情联系人的记录，普通聊天仍由 chat-engine.js 管理。
(() => {
  'use strict';
  const definitions = window.PHONE_CHAT_STORIES || [];
  const states = new Map();
  const originalOpenConversation = showWeChatConversation;
  let revision = 0;
  const findStory = id => definitions.find(s => s.id === id || s.contact.id === id);
  const persist = () => storage.setItem('wechat-threads-v2', JSON.stringify(wechatThreads));
  const current = state => states.get(state.definition.id) === state;
  function visible(state) {
    const active = PhoneChatAdapters.active();
    return current(state) && !document.hidden && !document.querySelector('#chat-dev-panel') && active?.app === 'wechat' && active.id === state.definition.contact.id;
  }
  function scrollToLatest() { const history = document.querySelector('#wx-history'); if (history) history.scrollTop = history.scrollHeight; }
  function emitMessage(state, message) {
    document.dispatchEvent(new CustomEvent('phone-chat-update', { detail:{app:'wechat', id:state.definition.contact.id, type:'incoming', message} }));
  }
  function messageFrom(state, definition) {
    const story = state.definition;
    const message = { ...definition, id:'story:' + story.id + ':' + definition.id, storyId:story.id, storyStep:definition.id, at:new Date().toISOString() };
    if (message.type === 'sticker') message.text = message.text || '[表情包]';
    if (definition.quote) {
      const source = (wechatThreads[story.contact.id] || []).find(m => m.storyStep === definition.quote.messageId || m.id === definition.quote.messageId);
      message.quote = { messageId:source?.id || definition.quote.messageId, author:definition.quote.author || (source?.out ? '我' : story.contact.name), text:source?.text || definition.quote.text || '' };
    }
    return message;
  }
  function append(state, definition) {
    if (!current(state)) return;
    const list = wechatThreads[state.definition.contact.id];
    const id = 'story:' + state.definition.id + ':' + definition.id;
    if (list.some(m => m.id === id)) return;
    const message = messageFrom(state, definition); list.push(message); persist(); emitMessage(state, message); scrollToLatest();
  }
  function keyboardHTML() {
    const key = value => '<span class="story-key">' + value + '</span>';
    return '<div class="story-keyboard-candidates"><span>拼音</span><b id="story-candidate">自动输入</b><small>简体拼音</small></div>' +
      '<div class="story-keyboard-row">' + [...'qwertyuiop'].map(key).join('') + '</div>' +
      '<div class="story-keyboard-row middle">' + [...'asdfghjkl'].map(key).join('') + '</div>' +
      '<div class="story-keyboard-row"><span class="story-key special">⇧</span>' + [...'zxcvbnm'].map(key).join('') + '<span class="story-key special">⌫</span></div>' +
      '<div class="story-keyboard-row bottom"><span class="story-key special">123</span><span class="story-key special">🌐</span><span class="story-key space">空格</span><span class="story-key return">发送</span></div><div class="story-keyboard-caption"><span>◉</span><span>模拟键盘 · 自动输入</span><span>♩</span></div>';
  }
  function render(state) {
    if (!current(state)) return;
    const active = PhoneChatAdapters.active();
    if (active?.app !== 'wechat' || active.id !== state.definition.contact.id) return;
    const input = document.querySelector('#wx-input'); if (!input) return;
    const ui = state.definition.ui || {};
    input.readOnly = true; input.inputMode = 'none'; input.setAttribute('inputmode','none'); input.autocomplete = 'off'; input.value = state.draft;
    input.placeholder = state.status === 'complete' ? ui.completeHint || '这段聊天已结束' : state.status === 'running' ? ui.busyHint || '正在自动输入…' : state.stageIndex ? ui.nextHint || '轻点继续回复' : (state.ready && state.definition.proactive ? state.definition.proactive.readyHint : ui.initialHint) || '轻点输入框开始';
    const keyboard = document.querySelector('#story-keyboard');
    if (keyboard) keyboard.hidden = !(state.keyboard && visible(state));
    view.classList.toggle('story-keyboard-visible', !!(state.keyboard && visible(state)));
    const candidate = document.querySelector('#story-candidate'); if (candidate) candidate.textContent = state.draft ? [...state.draft].slice(-5).join('') : '自动输入';
    const title = document.querySelector('#wechat-chat-name');
    if (title) { title.textContent = state.typing && visible(state) ? ui.typingLabel || state.definition.contact.name + '正在输入中……' : state.definition.contact.name; title.setAttribute('aria-live','polite'); }
    const send = document.querySelector('#wx-form button[type=submit]'); if (send) send.disabled = state.status !== 'waiting' || !state.ready;
    view.dataset.storyStatus = state.status;
    updateTestPanel();
  }
  function pause(state) {
    if (!state || !current(state)) return;
    if (state.timer !== null) {
      clearTimeout(state.timer); state.timer = null;
      state.remaining = Math.max(0, state.remaining - (performance.now() - state.scheduledAt));
    }
    render(state);
  }
  function schedule(state, delay, continuation) {
    if (!current(state)) return;
    state.continuation = continuation; state.remaining = Math.max(0, delay);
    if (!visible(state)) return;
    state.scheduledAt = performance.now();
    state.timer = setTimeout(() => {
      state.timer = null; if (!current(state)) return;
      if (!visible(state)) { state.remaining = 0; return; }
      state.continuation = null; state.remaining = 0; continuation();
    }, state.remaining);
  }
  function resume(state) {
    if (!current(state) || !visible(state) || state.timer !== null) return;
    render(state);
    if (state.continuation) schedule(state, state.remaining, state.continuation);
    else if (state.status === 'running') run(state);
  }
  function randomDelay(value) {
    if (Array.isArray(value)) { const low=Math.max(0,Number(value[0])||0),high=Math.max(low,Number(value[1])||low);return Math.round(low+Math.random()*(high-low)); }
    return Math.max(0,Number(value)||0);
  }
  function advance(state) { if(!current(state))return;state.actionIndex++;state.characterIndex=0;run(state); }
  function run(state) {
    if (!current(state) || state.status !== 'running') return;
    if (!visible(state)) { state.continuation = () => run(state); state.remaining = 0; return; }
    const stage = state.definition.stages[state.stageIndex];
    if (state.actionIndex >= stage.actions.length) {
      state.stageIndex++;state.actionIndex=0;state.characterIndex=0;state.draft='';state.keyboard=false;state.typing=false;
      state.status=state.stageIndex>=state.definition.stages.length?'complete':'waiting';render(state);scrollToLatest();
      if(state.status==='complete')document.dispatchEvent(new CustomEvent('phone-story-complete',{detail:{storyId:state.definition.id,contactId:state.definition.contact.id}}));
      return;
    }
    const action = stage.actions[state.actionIndex];
    if (action.type === 'typeAndSend') {
      state.keyboard=true;state.typing=false;const characters=Array.from(action.message.text||'');
      if (state.characterIndex < characters.length) {
        state.characterIndex++;state.draft=characters.slice(0,state.characterIndex).join('');render(state);scrollToLatest();
        schedule(state,Math.max(15,Number(action.characterMs??state.definition.typing?.characterMs)||65),()=>run(state));
      } else { append(state,action.message);state.draft='';state.characterIndex=0;render(state);advance(state); }
    } else if (action.type === 'wait') {
      state.typing=!!action.typing;render(state);schedule(state,randomDelay(action.delayMs),()=>{state.typing=false;advance(state)});
    } else if (action.type === 'send') {
      state.typing=false;append(state,action.message);render(state);advance(state);
    } else if (action.type === 'keyboard') {
      state.keyboard=!!action.visible;render(state);advance(state);
    } else if (action.type === 'event') {
      document.dispatchEvent(new CustomEvent(action.name||'phone-story-event',{detail:{storyId:state.definition.id,contactId:state.definition.contact.id,...action.detail}}));advance(state);
    } else { console.warn('未识别的剧情动作：',action.type);advance(state); }
  }
  function trigger(id,event={type:'inputTap'}) {
    const story=findStory(id),state=story&&states.get(story.id);if(!state||!state.ready||state.status!=='waiting'||!visible(state))return false;
    const condition=story.stages[state.stageIndex]?.trigger;
    if(condition?.type!==event.type||(condition.messageId&&condition.messageId!==event.messageId))return false;
    // 在任何计时器启动前立即锁住触发，连续点击不会安排第二条执行链。
    state.status='running';state.actionIndex=0;state.characterIndex=0;state.draft='';render(state);run(state);return true;
  }
  function mount(state) {
    if(!current(state))return;
    view.classList.add('story-chat');view.dataset.storyId=state.definition.id;
    const input=document.querySelector('#wx-input'),form=document.querySelector('#wx-form');
    input.readOnly=true;input.inputMode='none';input.setAttribute('inputmode','none');input.autocomplete='off';
    let lastTouch=-Infinity;
    input.addEventListener('pointerdown',event=>event.preventDefault());
    input.addEventListener('pointerup',event=>{if(event.pointerType==='touch'){event.preventDefault();lastTouch=performance.now();trigger(state.definition.id)}});
    input.onclick=event=>{event.preventDefault();if(event.detail&&performance.now()-lastTouch<500)return;trigger(state.definition.id)};
    input.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();trigger(state.definition.id)}};
    form.onsubmit=event=>{event.preventDefault();trigger(state.definition.id)};
    const keyboard=document.createElement('section');keyboard.id='story-keyboard';keyboard.className='story-keyboard';keyboard.setAttribute('role','group');keyboard.setAttribute('aria-label','模拟 iOS 中文拼音26键键盘，文字自动输入');keyboard.innerHTML=keyboardHTML();keyboard.hidden=true;form.insertAdjacentElement('afterend',keyboard);
    render(state);resume(state);scrollToLatest();
  }
  function reset(id,refresh=true) {
    const story=findStory(id);if(!story)return false;
    const old=states.get(story.id);if(old){clearTimeout(old.timer);clearTimeout(old.proactiveTimer);old.continuation=null;}
    const state={ready:!story.proactive,proactiveTimer:null,definition:story,revision:++revision,status:'waiting',stageIndex:0,actionIndex:0,characterIndex:0,draft:'',keyboard:false,typing:false,timer:null,continuation:null,remaining:0,scheduledAt:0};
    states.set(story.id,state);wechatThreads[story.contact.id]=[];
    story.initialMessages.forEach((message,index)=>{const raw=messageFrom(state,message);raw.at=new Date(Date.now()-3600000+(index-story.initialMessages.length)*60000).toISOString();wechatThreads[story.contact.id].push(raw)});persist();
    PhoneChatEngine.markRead('wechat',story.contact.id);
    if(refresh){const active=PhoneChatAdapters.active();if(active?.app==='wechat'&&active.id===story.contact.id){originalOpenConversation(story.contact.id);mount(state)}else if(view.classList.contains('open')&&view.dataset.app==='微信新版'){showWeChat(view.dataset.wechatTab||'微信')}}
    armProactive(state);updateTestPanel();return true;
  }

  function deliverProactive(state) {
    if(!current(state)||state.ready)return false;
    clearTimeout(state.proactiveTimer);state.proactiveTimer=null;
    const message=messageFrom(state,state.definition.proactive.message);
    state.ready=true;
    PhoneChatEngine.receiveStory(state.definition.contact.id,message);
    render(state);scrollToLatest();return true;
  }
  function armProactive(state) {
    if(!state.definition.proactive||state.ready||state.proactiveTimer!==null||PhoneChatAdapters.isLocked())return;
    state.proactiveTimer=setTimeout(()=>deliverProactive(state),randomDelay(state.definition.proactive.afterUnlockMs));
  }
  document.addEventListener('phone-unlocked',()=>states.forEach(armProactive));
  function pauseActive(){states.forEach(pause)}
  function resumeActive(){states.forEach(resume)}
  showWeChatConversation=function(id='assistant') {
    pauseActive();originalOpenConversation(id);const story=findStory(id);if(story)mount(states.get(story.id));
  };
  function snapshot(id){const story=findStory(id),s=story&&states.get(story.id);return s?{storyId:story.id,contactId:story.contact.id,status:s.status,stageIndex:s.stageIndex,actionIndex:s.actionIndex,draft:s.draft,keyboard:s.keyboard,typing:s.typing,paused:s.status==='running'&&s.timer===null,ready:s.ready,messageCount:wechatThreads[story.contact.id].length}:null}
  function updateTestPanel(){const status=document.querySelector('#story-test-status'),select=document.querySelector('#story-test-select');if(status&&select){const s=snapshot(select.value);status.textContent=s&&!s.ready?'等待主动来信':s?({waiting:'等待点击输入框',running:'执行中（离开聊天会暂停）',complete:'剧情已完成'})[s.status]:''}}
  document.addEventListener('phone-chat-panel-open',event=>{
    pauseActive();const host=event.detail.panel;const section=document.createElement('section');section.className='story-test-controls';
    const title=document.createElement('h3');title.textContent='剧情测试';const select=document.createElement('select');select.id='story-test-select';select.setAttribute('aria-label','选择剧情');definitions.forEach(story=>{const option=document.createElement('option');option.value=story.id;option.textContent=story.contact.name;select.append(option)});
    const status=document.createElement('p');status.id='story-test-status';status.setAttribute('role','status');const button=document.createElement('button');button.id='story-reset';button.type='button';button.textContent='重置选中剧情';button.onclick=()=>{reset(select.value);updateTestPanel()};const incoming=document.createElement('button');incoming.id='story-incoming';incoming.textContent='立即触发剧情来信';incoming.onclick=()=>{const story=findStory(select.value),state=story&&states.get(story.id);if(state?.definition.proactive)deliverProactive(state);else status.textContent='此剧情没有主动来信'};section.append(title,select,status,button,incoming);host.append(section);select.onchange=updateTestPanel;updateTestPanel();
  });
  document.addEventListener('phone-chat-panel-close',resumeActive);
  document.addEventListener('phone-locked',pauseActive);
  document.addEventListener('visibilitychange',()=>document.hidden?pauseActive():resumeActive());
  document.addEventListener('phone-story-trigger',event=>trigger(event.detail.contactId||event.detail.storyId,event.detail));
  view.addEventListener('click',event=>{const row=event.target.closest('.wechat-chat-row[data-story-step]');if(row&&view.dataset.storyId)trigger(view.dataset.storyId,{type:'messageTap',messageId:row.dataset.storyStep})});
  window.PhoneStoryChat={deliverProactive:id=>{const story=findStory(id);return story?deliverProactive(states.get(story.id)):false},trigger,reset,pauseActive,state:snapshot,open:id=>{const story=findStory(id);if(story)PhoneChatEngine.openChat('wechat',story.contact.id)},
    sendSticker:(id,source,alt='表情包',out=true)=>{const story=findStory(id);if(!story||!ChatMessageRenderer.assetImageURL(source))return false;append(states.get(story.id),{id:'sticker-'+Date.now()+'-'+Math.random().toString(36).slice(2),type:'sticker',src:source,alt,out,text:'[表情包]'});return true;}
  };
  // 只有剧情联系人在刷新时重置；普通聊天、备忘录及所有其它数据保持不动。
  definitions.forEach(story=>reset(story.id,false));
})();
