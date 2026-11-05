// 本地模拟消息引擎：只管理脚本、计时、未读和通知，不连接任何真实消息服务。
(() => {
  'use strict';
  const presets = window.PHONE_CHAT_PRESETS;
  const adapters = window.PhoneChatAdapters;
  const keys = { unread:'phone-chat-unread-v1', pending:'phone-chat-pending-v1', options:'phone-chat-options-v1', counters:'phone-chat-reply-counters-v1' };
  const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  let unreadCounts = object(readJSON(keys.unread, {}));
  let counters = object(readJSON(keys.counters, {}));
  let options = { autoReply:true, proactive:true, ...object(readJSON(keys.options, {})) };
  let jobs = readJSON(keys.pending, []);
  if (!Array.isArray(jobs)) jobs = [];
  const timers = new Map();
  let deferredChat = null;
  let bannerTimer = null;
  let currentNotice = null;
  let notices = [];
  let panel = null;
  const sessionKey = 'phone-chat-proactive-session-v1';
  let scheduledRules;
  try { scheduledRules = JSON.parse(sessionStorage.getItem(sessionKey) || '[]'); } catch { scheduledRules = []; }
  if (!Array.isArray(scheduledRules)) scheduledRules = [];
  const keyFor = (app,id) => app + ':' + id;
  const contact = (app,id) => ['messages','wechat'].includes(app) ? adapters.contacts(app).find(c => c.id === id) : null;
  const saveCounts = () => storage.setItem(keys.unread, JSON.stringify(unreadCounts));
  const saveJobs = () => storage.setItem(keys.pending, JSON.stringify(jobs));
  const emit = (app,id,type,extra={}) => document.dispatchEvent(new CustomEvent('phone-chat-update',{ detail:{app,id,type,...extra} }));
  const active = (app,id) => { const thread = adapters.active(); return thread?.app === app && thread?.id === id; };
  const nextId = () => 'mock-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const count = (app,id) => Math.max(0, Number(unreadCounts[keyFor(app,id)]) || 0);
  const total = app => adapters.contacts(app).reduce((sum,c) => sum + count(app,c.id),0);
  const isTyping = (app,id) => jobs.some(job => job.kind === 'reply' && job.app === app && job.contactId === id);
  for (const app of ['messages','wechat']) for (const c of adapters.contacts(app)) {
    const key = keyFor(app,c.id);
    if (!Number.isFinite(unreadCounts[key])) unreadCounts[key] = adapters.seedUnread(app,c.id);
  }
  saveCounts();
  function updateBadges() {
    for (const [app,name] of [['messages','信息'],['wechat','微信']]) {
      document.querySelectorAll('.app[data-open="'+name+'"]').forEach(button => {
        let badge = button.querySelector('.app-unread-badge'); const n = total(app);
        if (!n) { badge?.remove(); return; }
        if (!badge) { badge = document.createElement('span'); badge.className='app-unread-badge'; button.append(badge); }
        badge.textContent = n > 99 ? '99+' : String(n); badge.setAttribute('aria-label',n+' 条未读消息');
      });
    }
  }
  function closeBanner() {
    clearTimeout(bannerTimer); document.querySelector('#chat-notification')?.remove(); currentNotice=null;
    if (notices.length) showNextNotice();
  }
  function showNextNotice() {
    if (currentNotice || !notices.length) return;
    currentNotice=notices.shift(); const notice=currentNotice,c=contact(notice.app,notice.id); if (!c) { currentNotice=null; return showNextNotice(); }
    const banner=document.createElement('section'); banner.id='chat-notification'; banner.className='chat-notification'; banner.setAttribute('role','status'); banner.setAttribute('aria-live','polite');
    const open=document.createElement('button'); open.className='chat-notification-open'; open.setAttribute('aria-label','打开'+c.name+'的新消息');
    const icon=document.createElement('span'); icon.className='chat-notification-icon'; icon.innerHTML=adapters.icon(notice.app);
    const body=document.createElement('span');body.className='chat-notification-body';const head=document.createElement('span');head.className='chat-notification-heading';
    const sender=document.createElement('b');sender.textContent=c.name;const appLabel=document.createElement('small');appLabel.textContent=(notice.app==='messages'?'信息':'WeChat')+' · 现在';head.append(sender,appLabel);
    const text=document.createElement('span');text.className='chat-notification-text';text.textContent=notice.text;body.append(head,text);open.append(icon,body);
    const dismiss=document.createElement('button');dismiss.className='chat-notification-dismiss';dismiss.textContent='×';dismiss.setAttribute('aria-label','关闭消息通知');dismiss.onclick=closeBanner;
    open.onclick=()=>{ const target={app:notice.app,id:notice.id};notices=notices.filter(n=>!(n.app===target.app&&n.id===target.id));closeBanner();openChat(target.app,target.id); };
    banner.append(open,dismiss);document.querySelector('#screen').append(banner);bannerTimer=setTimeout(closeBanner,6000);
  }
  function notify(app,id,text) { notices.push({app,id,text}); if(notices.length>12)notices.shift();showNextNotice(); }
  function markRead(app,id) {
    if (!contact(app,id)) return;
    unreadCounts[keyFor(app,id)]=0;adapters.legacyRead(app,id);saveCounts();updateBadges();
    notices=notices.filter(n=>!(n.app===app&&n.id===id));
    if(currentNotice?.app===app&&currentNotice?.id===id)closeBanner();
    emit(app,id,'read');
  }
  function openChat(app,id) {
    if(!contact(app,id))return;
    if(adapters.isLocked()){deferredChat={app,id};adapters.requestUnlock();return}
    adapters.openChat(app,id);
  }
  function receive(app,id,text,messageId=nextId()) {
    if(!contact(app,id)||contact(app,id).scripted||typeof text!=='string'||!text.trim())return false;
    if(adapters.hasMessage(app,id,messageId))return false;
    const message=adapters.receive(app,id,text.slice(0,2000),messageId);
    if(active(app,id)){unreadCounts[keyFor(app,id)]=0;adapters.legacyRead(app,id)}else unreadCounts[keyFor(app,id)]=count(app,id)+1;
    saveCounts();updateBadges();emit(app,id,'incoming',{message});
    if(!active(app,id))notify(app,id,message.text);
    return true;
  }
  function finishJob(id) {
    const job=jobs.find(j=>j.id===id);if(!job)return;
    timers.delete(id);
    // 先保留任务直至消息写入成功；刷新后利用 messageId 去重。
    receive(job.app,job.contactId,job.text,job.id);
    jobs=jobs.filter(j=>j.id!==id);saveJobs();emit(job.app,job.contactId,'typing');
  }
  function arm(job) { timers.set(job.id,setTimeout(()=>finishJob(job.id),Math.max(0,job.dueAt-Date.now()))); }
  function enqueue(app,id,text,delayMs,kind='manual') {
    if(!contact(app,id)||contact(app,id).scripted||typeof text!=='string'||!text.trim())return null;
    const job={id:nextId(),app,contactId:id,text:text.slice(0,2000),dueAt:Date.now()+Math.max(0,delayMs),kind};
    jobs.push(job);saveJobs();arm(job);emit(app,id,'typing');return job.id;
  }
  function cancelJobs(predicate) {
    const removed=jobs.filter(predicate);removed.forEach(job=>{clearTimeout(timers.get(job.id));timers.delete(job.id)});
    jobs=jobs.filter(job=>!predicate(job));saveJobs();removed.forEach(job=>emit(job.app,job.contactId,'typing'));
  }
  function chooseReply(app,id,text) {
    const profile=presets.replies?.[app]?.[id];if(profile?.enabled===false)return null;
    const input=text.toLocaleLowerCase();const ruleIndex=profile?.rules?.findIndex(rule=>Array.isArray(rule.keywords)&&rule.keywords.some(word=>input.includes(String(word).toLocaleLowerCase())))??-1;
    const choices=ruleIndex>=0?profile.rules[ruleIndex].responses:profile?.fallback;
    const responses=Array.isArray(choices)&&choices.filter(s=>typeof s==='string'&&s.trim()).length?choices.filter(s=>typeof s==='string'&&s.trim()):['收到，我看到了。','好呀，晚点再聊～'];
    const key=keyFor(app,id)+':'+ruleIndex,index=Math.max(0,Number(counters[key])||0);counters[key]=index+1;storage.setItem(keys.counters,JSON.stringify(counters));return responses[index%responses.length];
  }
  function afterUserSend(app,id,text) {
    if(!options.autoReply||!contact(app,id)||contact(app,id).scripted)return;
    const reply=chooseReply(app,id,text);if(!reply)return;
    const min=Math.max(1000,Math.min(3000,Number(presets.replyDelay?.minMs)||1000));
    const max=Math.max(min,Math.min(3000,Number(presets.replyDelay?.maxMs)||3000));
    enqueue(app,id,reply,Math.round(min+Math.random()*(max-min)),'reply');
  }
  function onUnlock() {
    if(adapters.isLocked())return;
    if(deferredChat){const target=deferredChat;deferredChat=null;openChat(target.app,target.id)}
    if(!options.proactive||!presets.proactive?.enabled)return;
    for(const rule of presets.proactive.rules||[]){
      if(!rule.id||scheduledRules.includes(rule.id)||!contact(rule.app,rule.contactId)||!Array.isArray(rule.texts)||!rule.texts.length)continue;
      scheduledRules.push(rule.id);try{sessionStorage.setItem(sessionKey,JSON.stringify(scheduledRules))}catch{}
      enqueue(rule.app,rule.contactId,String(rule.texts[0]),Math.max(0,Math.min(86400000,Number(rule.afterUnlockMs)||0)),'proactive');
    }
  }
  function setOptions(patch) {
    options={...options,...patch};storage.setItem(keys.options,JSON.stringify(options));
    if(!options.autoReply)cancelJobs(j=>j.kind==='reply');if(!options.proactive)cancelJobs(j=>j.kind==='proactive');else if(!adapters.isLocked())onUnlock();
  }
  function sendManual(app,id,text,delay=0) {return enqueue(app,id,text,Math.min(30000,Math.max(0,Number(delay)||0)),'manual');}
  function closePanel() { panel?.remove();panel=null;document.querySelector('#chat-test-launcher')?.focus();document.dispatchEvent(new Event('phone-chat-panel-close')); }
  function openPanel() {
    if(adapters.isLocked()){adapters.requestUnlock();return}
    if(panel)return;
    panel=document.createElement('div');panel.className='chat-dev-backdrop';panel.innerHTML='<section id="chat-dev-panel" class="chat-dev-panel" role="dialog" aria-modal="true" aria-labelledby="chat-dev-title"><header><h2 id="chat-dev-title">聊天开发测试</h2><button id="chat-test-close" aria-label="关闭测试面板">×</button></header><p>仅模拟本地消息，不连接真实账号。</p><form id="chat-test-form"><label>应用<select id="chat-test-app"><option value="wechat">WeChat</option><option value="messages">信息</option></select></label><label>联系人<select id="chat-test-contact"></select></label><label>消息内容<textarea id="chat-test-text" maxlength="1000" required></textarea></label><label>延迟（秒，0–30）<input id="chat-test-delay" type="number" min="0" max="30" value="0" step="1" required></label><button class="chat-test-send" type="submit">触发模拟消息</button><div id="chat-test-result" role="status"></div></form><label class="chat-test-switch"><input id="chat-auto-replies" type="checkbox">启用关键词自动回复</label><label class="chat-test-switch"><input id="chat-proactive" type="checkbox">启用解锁后主动消息</label><button id="chat-proactive-reset" class="chat-test-reset">重新安排主动消息</button><p class="chat-test-help">聊天资料和脚本见 chat-data.js。不会清空已有聊天。</p></section>';
    document.querySelector('#screen').append(panel);panel.querySelector('#chat-test-close').onclick=closePanel;
    const app=panel.querySelector('#chat-test-app'),select=panel.querySelector('#chat-test-contact'),text=panel.querySelector('#chat-test-text');
    function fillText(){const id=select.value;const rule=(presets.proactive.rules||[]).find(r=>r.app===app.value&&r.contactId===id);text.value=rule?.texts?.[0]||presets.replies?.[app.value]?.[id]?.fallback?.[0]||'在吗？这是一条模拟消息。'}
    function fillContacts(){select.replaceChildren();adapters.contacts(app.value).filter(c=>!c.scripted).forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.name;select.append(o)});fillText()}
    fillContacts();app.onchange=fillContacts;select.onchange=fillText;
    panel.querySelector('#chat-test-form').onsubmit=event=>{event.preventDefault();const value=text.value.trim();if(!value)return;sendManual(app.value,select.value,value,Number(panel.querySelector('#chat-test-delay').value)*1000);panel.querySelector('#chat-test-result').textContent='已安排模拟消息；关闭面板查看通知或聊天。'};
    const auto=panel.querySelector('#chat-auto-replies'),proactive=panel.querySelector('#chat-proactive');auto.checked=!!options.autoReply;proactive.checked=!!options.proactive;auto.onchange=()=>setOptions({autoReply:auto.checked});proactive.onchange=()=>setOptions({proactive:proactive.checked});
    panel.querySelector('#chat-proactive-reset').onclick=()=>{scheduledRules=[];try{sessionStorage.removeItem(sessionKey)}catch{}cancelJobs(j=>j.kind==='proactive');onUnlock();panel.querySelector('#chat-test-result').textContent=options.proactive?'已重新安排，延迟见 chat-data.js。':'请先启用主动消息。'};
    panel.addEventListener('click',event=>{if(event.target===panel)closePanel()});app.focus();document.dispatchEvent(new CustomEvent('phone-chat-panel-open',{detail:{panel:panel.querySelector('#chat-dev-panel')}}));
  }
  document.addEventListener('phone-locked',()=>{if(panel)closePanel()});
  document.addEventListener('keydown',event=>{
    if(!panel)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closePanel();return}
    if(event.key==='Tab'){
      const focusable=[...panel.querySelectorAll('button,input,select,textarea')].filter(e=>!e.disabled),first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  },true);
  const launcher=document.createElement('button');launcher.id='chat-test-launcher';launcher.className='chat-test-launcher';launcher.textContent='聊天开发测试';launcher.onclick=openPanel;adapters.mountPanelLauncher(launcher);
  jobs=jobs.filter(job=>job&&typeof job.id==='string'&&contact(job.app,job.contactId)&&!contact(job.app,job.contactId).scripted&&typeof job.text==='string'&&Number.isFinite(job.dueAt)&&(job.kind!=='reply'||options.autoReply)&&(job.kind!=='proactive'||(options.proactive&&presets.proactive?.enabled))&&!adapters.hasMessage(job.app,job.contactId,job.id));saveJobs();
  window.PhoneChatEngine={afterUserSend,markRead,unread:count,total,isTyping,onUnlock,receive,sendManual,openChat,setOptions,options:()=>({...options}),openPanel,closePanel,pending:()=>jobs.map(job=>({...job}))};
  updateBadges();jobs.forEach(arm);
})();
