// 浏览器本地保存；存储不可用时，仍可在本次打开期间使用。
const memoryStore = new Map();
const storage = {
  getItem(key) { try { return localStorage.getItem(key); } catch { return memoryStore.get(key) ?? null; } },
  setItem(key, value) { memoryStore.set(key, String(value)); try { localStorage.setItem(key, String(value)); } catch {} }
};

const $=s=>document.querySelector(s);const appData=[['信息','▰','green'],['日历','calendar','white'],['照片','🌸','white'],['相机','◉','gray'],['天气','☀','blue'],['时钟','◷','black'],['地图','map','white'],['备忘录','☰','note-icon'],['App Store','A','blue'],['健康','♥','white'],['钱包','▤','black'],['设置','⚙','gray']];const dockData=[['电话','☎','green'],['Safari','◈','white'],['音乐','♫','pink'],['计算器','▦','black']];
function icon(a){return `<button class="app" data-open="${a[0]}" aria-label="打开${a[0]}"><span class="icon ios-icon">${iosIcon(a[0])}</span><span class="app-label">${a[0]}</span></button>`}
$('#apps').innerHTML=appData.map(icon).join('');
$('#dock').innerHTML=[dockData[0],dockData[1],appData[0],dockData[2]].map(icon).join('');
$('#apps-second').innerHTML=[['微信'],['计算器']].map(icon).join('');
let timer,clockTimer;function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',2300)}function home(){$('#app-view').classList.remove('open');$('#lock').classList.remove('open');$('.home-indicator').style.color='white';clearInterval(clockTimer)}$('#home').onclick=home;$('#reset').onclick=home;document.addEventListener('keydown',e=>{if(e.key==='Escape'||((e.metaKey||e.ctrlKey)&&e.key==='h')){e.preventDefault();home()}});
const names=['暮光紫','海盐蓝','落日粉','苔原绿'],walls=['radial-gradient(ellipse at 10% 0%,#d6cef2,transparent 48%),radial-gradient(ellipse at 94% 62%,#9c70c2,transparent 52%),linear-gradient(160deg,#9e9cd2,#aca2d8 45%,#6b5a9f)','linear-gradient(145deg,#a6d5dd,#83b4c5 40%,#3e7396)','linear-gradient(145deg,#f5d4bc,#e9b8b8 40%,#b67494)','linear-gradient(145deg,#c4d4b9,#9cbba9 40%,#56786c)'];function wallpaper(i){$('#wallpaper').style.background=walls[i];$('#wallpaper-name').textContent=names[i];document.querySelectorAll('.swatch').forEach((b,j)=>b.classList.toggle('active',i===j));storage.setItem('wallpaper',i)}document.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>wallpaper(+b.dataset.wall));wallpaper(Math.max(0,Math.min(3,+storage.getItem('wallpaper')||0)));$('#brightness').oninput=e=>{$('#screen').style.filter=`brightness(${e.target.value}%)`;$('#brightness-value').textContent=e.target.value+'%'};function updateTime(){const d=new Date(),t=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});$('#clock').textContent=t;$('#lock-time').textContent=t;$('#lock-date').textContent=d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});$('#widget-date').textContent=d.getDate();$('#widget-day').textContent=d.toLocaleDateString('zh-CN',{weekday:'long'})}updateTime();setInterval(updateTime,10000);$('#lock-button').onclick=()=>{$('#lock').classList.add('open');updateTime()};$('#unlock').onclick=home;
const view=$('#app-view');function layout(name,html){home();view.innerHTML=`<div class="app-top"><button class="back" id="back">‹ 主屏幕</button><span>iPhone</span></div><h2>${name}</h2>${html}`;view.classList.add('open');$('.home-indicator').style.color='#33283e';$('#back').onclick=home}
function baseOpenApp(name){switch(name){case '备忘录':layout(name,'<p style="font-size:11px;color:#9d91a6">随手记录，自动保存在此浏览器</p><textarea id="note" placeholder="今天有什么新想法？"></textarea>');$('#note').value=storage.getItem('note')||'';$('#note').oninput=e=>storage.setItem('note',e.target.value);break;
case '计算器':layout(name,'<div class="calc-display" id="display">0</div><div class="calc-grid">'+['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','⌫','0','.','='].map(x=>`<button data-key="${x}">${x}</button>`).join('')+'</div>');initCalc();break;
case '天气':layout(name,'<div style="text-align:center;background:linear-gradient(#7297c3,#b4c6df);border-radius:20px;color:white;padding:30px 10px"><div>北京市</div><div style="font-size:75px">23°</div><div>☀ 晴朗</div><small>最高 26° · 最低 17°</small></div><div class="content-card">适合散步的好天气<br><small style="color:#aaa">模拟天气数据</small><div style="display:flex;justify-content:space-between;margin-top:20px">'+['现在 ☀ 23°','15时 ☀ 25°','16时 ☀ 24°'].map(x=>`<span style="font-size:11px">${x}</span>`).join('')+'</div></div>');break;
case '照片':layout(name,'<p style="font-size:12px;color:#988da4">生活里的小美好 · 示例图库</p><div class="photos">'+['🏔','🌅','🌸','🌊','🌿','☁'].map((x,i)=>`<button class="photo" data-photo="${i}" aria-label="查看照片${i+1}">${x}</button>`).join('')+'</div>');document.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{b.style.gridColumn=b.style.gridColumn?'':'span 2';b.style.height=b.style.gridColumn?'280px':'142px'});break;
case '相机':layout(name,'<div class="camera-preview" id="camera-preview"><div style="font-size:70px">🌿<div style="font-size:12px">捕捉此刻的小美好</div></div></div><button class="shutter" aria-label="拍照" id="shutter"></button><div style="text-align:center;font-size:11px;color:#9c90a5">模拟相机 · 无需摄像头权限</div>');$('#shutter').onclick=()=>{toast('咔嚓！已记录此刻 ✧');$('#camera-preview').style.opacity='.3';setTimeout(()=>{if($('#camera-preview'))$('#camera-preview').style.opacity='1'},150)};break;
case '日历':{let d=new Date(),year=d.getFullYear(),month=d.getMonth();layout(name,`<div class="content-card"><b>${year} 年 ${month+1} 月</b><div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;gap:12px 3px;margin-top:20px;font-size:12px">${['日','一','二','三','四','五','六'].map(x=>'<span style="color:#aaa">'+x+'</span>').join('')}${'<span></span>'.repeat(new Date(year,month,1).getDay())}${Array.from({length:new Date(year,month+1,0).getDate()},(_,i)=>`<span style="${i+1===d.getDate()?'background:#9e83bc;color:white;border-radius:50%':''}">${i+1}</span>`).join('')}</div></div><div class="content-card">今天没有日程<br><small style="color:#a79aaa">给自己留一点自由的时间。</small></div>`);break}
case '时钟':layout(name,'<div class="content-card" style="text-align:center"><div style="font-size:13px">本地时间</div><div id="live-clock" style="font-size:48px;margin:25px 0"></div><div id="seconds" style="color:#a492b5"></div></div>');const tick=()=>{if($('#live-clock')){$('#live-clock').textContent=new Date().toLocaleTimeString('zh-CN');$('#seconds').textContent=new Date().toLocaleDateString('zh-CN',{dateStyle:'full'})}};tick();clockTimer=setInterval(tick,1000);break;
case '设置':layout(name,'<div class="content-card"><b>你的 iPhone</b><div style="font-size:11px;color:#a59aaa">iPhone · 模拟设备</div></div><div class="content-card"><div class="list-row">飞行模式<button class="toggle" aria-label="飞行模式" aria-pressed="false"></button></div><div class="list-row">无线局域网 <span style="color:#9c8daa">Playground</span></div><div class="list-row">蓝牙<button class="toggle on" aria-label="蓝牙" aria-pressed="true"></button></div><div class="list-row">声音<button class="toggle on" aria-label="声音" aria-pressed="true"></button></div><div class="list-row">关于本机 <span>iOS 17.0</span></div></div>');document.querySelectorAll('.toggle').forEach(b=>b.onclick=()=>{b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'))});break;
case '电话':layout(name,'<input id="number" aria-label="电话号码" readonly style="width:100%;border:0;background:none;text-align:center;font-size:27px;height:80px"><div class="calc-grid" style="grid-template-columns:repeat(3,1fr)">'+['1','2','3','4','5','6','7','8','9','*','0','#'].map(n=>`<button data-num="${n}">${n}</button>`).join('')+'</div><button class="primary" id="call" style="display:block;margin:20px auto;background:#66b87b">☎ 呼叫</button><button class="back" id="delete-number">删除</button>');document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>$('#number').value+=b.dataset.num);$('#delete-number').onclick=()=>$('#number').value=$('#number').value.slice(0,-1);$('#call').onclick=()=>toast($('#number').value?'模拟呼叫：'+$('#number').value:'请先输入电话号码');break;
case '信息':layout(name,'<div class="content-card"><b>文件传输助手</b><p>欢迎来到你的小世界！试试备忘录和计算器吧 ✨</p><div id="messages"></div><form id="message-form" style="display:flex;gap:6px"><input id="message" aria-label="输入消息" placeholder="发送一条消息…" style="min-width:0;width:100%;border:1px solid #e6dfee;border-radius:8px;padding:8px"><button class="primary" style="padding:8px">↑</button></form></div>');$('#message-form').onsubmit=e=>{e.preventDefault();if(!$('#message').value.trim())return;const p=document.createElement('p');p.textContent=$('#message').value;p.style.cssText='background:#e4dbef;padding:10px;border-radius:12px;text-align:right';$('#messages').append(p);$('#message').value=''};break;
case '音乐':layout(name,'<div class="photo" style="height:230px;font-size:90px;background:linear-gradient(140deg,#dbc7e3,#9477b2)">♫</div><h3 style="text-align:center;margin-bottom:5px">留白的午后</h3><p style="text-align:center;font-size:12px;color:#aa9ab4">iPhone电台 · 合成音体验</p><button id="play" class="primary" style="display:block;margin:25px auto">▶ 播放</button>');$('#play').onclick=()=>{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!window.musicCtx){window.musicCtx=new AudioCtx();let g=musicCtx.createGain();g.gain.value=.035;g.connect(musicCtx.destination);[261.63,329.63,392].forEach(f=>{let o=musicCtx.createOscillator();o.frequency.value=f;o.type='sine';o.connect(g);o.start()});$('#play').textContent='Ⅱ 暂停';return}if(musicCtx.state==='running'){musicCtx.suspend();$('#play').textContent='▶ 播放'}else{musicCtx.resume();$('#play').textContent='Ⅱ 暂停'}};break;
case 'Safari':layout(name,'<div class="content-card"><div style="text-align:center;font-size:45px">◈</div><h3 style="text-align:center">探索，从这里开始</h3><form id="search"><input id="query" aria-label="搜索内容" placeholder="输入关键词，搜索网页" style="width:100%;padding:12px;border:1px solid #e6deef;border-radius:12px"><button class="primary" style="width:100%;margin-top:12px">搜索 ↗</button></form><p style="font-size:11px;color:#a99cb4">搜索结果将在新标签页打开</p></div>');$('#search').onsubmit=e=>{e.preventDefault();if($('#query').value.trim())window.open('https://www.bing.com/search?q='+encodeURIComponent($('#query').value),'_blank','noopener,noreferrer')};break;
case '健康':layout(name,'<div class="content-card"><span style="color:#ed7388">♥ 今日步数</span><div style="font-size:40px">6,280 <small style="font-size:12px">步</small></div><div style="height:9px;background:#f5e3e9;border-radius:10px"><div style="width:63%;background:#ed8aa3;height:100%;border-radius:10px"></div></div><p style="font-size:11px;color:#ab9fac">每日目标 10,000 步 · 示例数据</p></div><div class="content-card">每一小步，都是对自己的照顾。</div>');break;
case '钱包':layout(name,'<div style="border-radius:18px;background:linear-gradient(120deg,#393444,#74607f);padding:25px;color:#e9dce9;height:170px"><small>iPhone PAY · 演示卡</small><div style="font-size:22px;margin:35px 0 5px">•••• &nbsp; •••• &nbsp; 2048</div><small>PLAYGROUND MEMBER</small></div><div class="content-card">你的随身小钱包<br><small style="color:#a497af">仅用于展示，不提供支付功能。</small></div>');break;
case '地图':layout(name,'<div style="height:340px;border-radius:16px;background:repeating-linear-gradient(30deg,transparent 0 50px,#fff9 51px 60px),repeating-linear-gradient(110deg,#c9d9c7 0 60px,#f6f1df 61px 70px);display:grid;place-items:center"><div style="background:white;padding:12px;border-radius:14px;box-shadow:0 5px 15px #0001">📍 你的小世界</div></div><div class="content-card">下一站：美好的一天<br><small style="color:#9c8ea7">示意地图 · 不获取真实位置</small></div>');break;
case 'App Store':layout(name,'<div class="photo" style="height:200px;background:linear-gradient(135deg,#b5bfe6,#907cb6);color:white;font-size:25px">发现日常的小惊喜 ✧</div><div class="content-card"><b>为你精选</b>'+['备忘录','计算器','天气'].map(x=>`<div class="list-row">${x}<button class="back" data-open="${x}">打开</button></div>`).join('')+'</div>');break;
default:toast('探索这个小世界吧') }}
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openApp(b.dataset.open)});
function initCalc(){let current='0',stored=null,op=null,fresh=false;const display=()=>$('#display').textContent=current;function calculate(){const a=Number(stored),b=Number(current);const n=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:b===0?NaN:a/b;current=Number.isFinite(n)?String(+n.toPrecision(10)):'错误';stored=null;op=null}document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const k=b.dataset.key;if(k==='AC'){current='0';stored=null;op=null;fresh=false}else if(k==='±')current=String(-Number(current));else if(k==='%')current=String(Number(current)/100);else if(k==='⌫')current=current.slice(0,-1)||'0';else if(['+','−','×','÷'].includes(k)){if(stored!==null&&!fresh)calculate();stored=current;op=k;fresh=true}else if(k==='='){if(op&&stored!==null)calculate();fresh=true}else{if(fresh||current==='错误'){current='0';fresh=false}if(k==='.'&&current.includes('.'))return;current=current==='0'&&k!=='.'?k:current.length<12?current+k:current}display()})}

// 第一阶段：设置、多篇备忘录和可持续保存的消息。
function readJSON(key, fallback) {
  try { const value = JSON.parse(storage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}
let notes = readJSON('notes-v1', []);
if (!Array.isArray(notes)) notes = [];
notes = notes.filter(n => n && typeof n.id === 'string' && typeof n.text === 'string');
if (!notes.length && storage.getItem('note') && !storage.getItem('notes-v1')) {
  notes = [{ id: String(Date.now()), text: storage.getItem('note') }];
  storage.setItem('notes-v1', JSON.stringify(notes));
}
let messages = readJSON('messages-v1', []);
if (!Array.isArray(messages)) messages = [];
messages = messages.filter(m => typeof m === 'string');
function saveNotes() { storage.setItem('notes-v1', JSON.stringify(notes)); }
function applyTheme(dark) {
  $('#screen').classList.toggle('dark', dark);
  storage.setItem('dark-mode', dark ? 'true' : 'false');
}
applyTheme(storage.getItem('dark-mode') === 'true');
function deviceName() { return storage.getItem('device-name') || 'iPhone'; }
function updateDeviceLabel() {
  $('.under-phone').textContent = deviceName() + '';
}
updateDeviceLabel();
function showNotes() {
  layout('备忘录', '<div class="notes-toolbar"><span id="note-count"></span><button class="primary" id="new-note">＋ 新建</button></div><div id="notes-list"></div>');
  $('#note-count').textContent = notes.length + ' 篇备忘录';
  if (!notes.length) {
    $('#notes-list').innerHTML = '<div class="content-card empty-state">还没有备忘录<br>点击“新建”，记录第一个想法。</div>';
  }
  notes.forEach(note => {
    const row = document.createElement('div'); row.className = 'content-card note-row';
    const button = document.createElement('button'); button.className = 'note-open';
    button.textContent = note.text.trim().split('\n')[0].slice(0, 35) || '新备忘录';
    button.onclick = () => editNote(note.id);
    const remove = document.createElement('button'); remove.className = 'delete-note';
    remove.textContent = '删除'; remove.setAttribute('aria-label', '删除备忘录');
    remove.onclick = () => {
      if (!window.confirm('确定删除这篇备忘录吗？')) return;
      notes = notes.filter(n => n.id !== note.id); saveNotes(); showNotes();
    };
    row.append(button, remove); $('#notes-list').append(row);
  });
  $('#new-note').onclick = () => {
    const note = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), text: '' };
    notes.unshift(note); saveNotes(); editNote(note.id);
  };
}
function editNote(id) {
  const note = notes.find(n => n.id === id); if (!note) return showNotes();
  layout('编辑备忘录', '<button class="back" id="notes-back">‹ 所有备忘录</button><p class="muted">输入后自动保存到当前浏览器</p><textarea id="note" aria-label="备忘录内容" placeholder="今天有什么新想法？"></textarea><div id="save-state" class="muted" role="status">已保存</div>');
  $('#note').value = note.text;
  $('#note').oninput = e => { note.text = e.target.value; saveNotes(); $('#save-state').textContent = '已自动保存'; };
  $('#notes-back').onclick = showNotes; $('#note').focus();
}
function showMessages() {
  layout('信息', '<div class="conversation"><div class="conversation-title">文件传输助手 <span>模拟聊天</span></div><div id="messages" class="message-history" aria-live="polite"><p class="bubble received">欢迎来到你的小世界！有什么想记录或分享的吗？✨</p><p class="bubble received">可以在下面输入消息，点击发送。</p></div><form id="message-form" class="message-form"><input id="message" aria-label="输入消息" placeholder="输入消息…" maxlength="2000" autocomplete="off"><button class="primary" type="submit">发送</button></form></div>');
  function append(text) { const bubble = document.createElement('p'); bubble.className = 'bubble sent'; bubble.textContent = text; $('#messages').append(bubble); $('#messages').scrollTop = $('#messages').scrollHeight; }
  messages.forEach(append);
  $('#message-form').onsubmit = e => { e.preventDefault(); const text = $('#message').value.trim(); if (!text) return; messages.push(text); storage.setItem('messages-v1', JSON.stringify(messages)); append(text); $('#message').value = ''; $('#message').focus(); };
}
function showSettings() {
  layout('设置', '<div class="content-card"><label for="device-name">手机名称</label><div class="name-form"><input id="device-name" maxlength="30" aria-label="手机名称"><button class="primary" id="save-name">保存</button></div></div><div class="content-card"><div class="list-row"><span>深色模式</span><button class="toggle" id="dark-toggle" aria-label="深色模式" aria-pressed="false"></button></div><div class="list-row"><span>飞行模式</span><button class="toggle" id="airplane-toggle" aria-label="飞行模式" aria-pressed="false"></button></div><div class="list-row"><span>蓝牙</span><button class="toggle" id="bluetooth-toggle" aria-label="蓝牙" aria-pressed="false"></button></div></div><div class="content-card"><div>预设壁纸</div><div id="settings-wallpapers" class="wallpaper-options"></div><p class="muted" id="selected-wallpaper"></p></div><div class="content-card muted">iPhone 模拟器 · 第一版<br>设置会保存在当前浏览器中。</div>');
  $('#device-name').value = deviceName();
  $('#save-name').onclick = () => { const name = $('#device-name').value.trim(); if (!name) { toast('请填写手机名称'); return; } storage.setItem('device-name', name); updateDeviceLabel(); toast('手机名称已保存'); };
  const dark = $('#dark-toggle');
  const syncDark = () => { const on = $('#screen').classList.contains('dark'); dark.classList.toggle('on', on); dark.setAttribute('aria-pressed', String(on)); };
  syncDark(); dark.onclick = () => { applyTheme(!$('#screen').classList.contains('dark')); syncDark(); };
  for (const [id, key, initial] of [['airplane-toggle','airplane',false],['bluetooth-toggle','bluetooth',true]]) {
    const b = $('#' + id); let on = storage.getItem(key) === null ? initial : storage.getItem(key) === 'true';
    const sync = () => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }; sync();
    b.onclick = () => { on = !on; storage.setItem(key, String(on)); sync(); if (key === 'airplane') updateSignals(); };
  }
  names.forEach((name, i) => { const b = document.createElement('button'); b.className = 'wallpaper-option'; b.style.background = walls[i]; b.textContent = name; b.onclick = () => { wallpaper(i); $('#selected-wallpaper').textContent = '当前壁纸：' + name; }; $('#settings-wallpapers').append(b); });
  $('#selected-wallpaper').textContent = '当前壁纸：' + names[+storage.getItem('wallpaper') || 0];
}
function updateSignals() {
  const airplane = storage.getItem('airplane') === 'true';
  $('.signals').innerHTML = `<span aria-label="${airplane ? '飞行模式' : '蜂窝信号'}">${airplane ? '✈' : '▂▄▆'}</span><svg aria-label="Wi-Fi" width="14" height="12" viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M1 4 Q10 -2 19 4 M4 8 Q10 3 16 8 M7 11 Q10 8 13 11"/><circle cx="10" cy="14" r="1" fill="currentColor" stroke="none"/></svg><span class="battery" aria-label="电池电量 85%"></span>`;
}
updateSignals();
function openApp(name) {
  if (name === '设置') return showSettings();
  if (name === '备忘录') return showNotes();
  if (name === '信息') return showMessages();
  baseOpenApp(name);
  if (name === '照片') {
    document.querySelectorAll('[data-photo]').forEach(b => {
      b.onclick = () => {
        const overlay = document.createElement('div'); overlay.className = 'photo-overlay'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-label','照片预览'); overlay.setAttribute('aria-modal','true');
        const close = document.createElement('button'); close.className = 'photo-close'; close.textContent = '关闭 ×';
        const enlarged = b.cloneNode(true); enlarged.className = 'enlarged-photo'; enlarged.removeAttribute('data-photo'); enlarged.removeAttribute('aria-label'); enlarged.setAttribute('aria-label','关闭照片预览');
        const background = getComputedStyle(b).background; enlarged.style.background = background;
        const dismiss = () => { overlay.remove(); b.focus(); }; close.onclick = dismiss; enlarged.onclick = dismiss;
        overlay.append(close, enlarged); view.append(overlay); close.focus();
      };
    });
  }
}

// 内嵌风景示例图，不依赖外部图片服务。
function samplePhoto(index) {
  const palettes = [['#8db7d6','#f6ddc1','#536e8b','#314e66'],['#e9ad9b','#f7d38c','#956b8c','#554f79'],['#c6b7d9','#f4e1e4','#8c84a8','#595b7b'],['#91c5ca','#d9e5d0','#508f9c','#316779'],['#adc5aa','#e6e3bb','#668a70','#3f6655'],['#b1c9e0','#f4e1cc','#8894b2','#586c92']];
  const [sky,light,mountain,front] = palettes[index % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${light}"/></linearGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${front}"/></linearGradient></defs><path fill="url(#sky)" d="M0 0h400v500H0z"/><circle fill="${light}" cx="285" cy="133" r="44"/><path fill="${mountain}" d="M0 315L85 159l89 139 57-95 91 114 78-73v256H0z"/><path fill="${light}" opacity=".65" d="M60 205l25-46 31 49-28-13-10 13z"/><path fill="url(#water)" d="M0 332q100-20 200 0t200 0v168H0z"/><path fill="none" stroke="${light}" opacity=".35" stroke-width="3" d="M180 359h156m-190 20h142m-112 27h180m-260 33h110m-43 30h177"/><path fill="${front}" d="M0 291q42 37 60 84L0 458zm400 61q-63 31-87 148h87z"/></svg>`;
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}
const originalOpenApp = openApp;
openApp = function(name) {
  originalOpenApp(name);
  if (name === '照片') document.querySelectorAll('[data-photo]').forEach((b,i) => {
    b.textContent = ''; b.style.background = samplePhoto(i); b.style.backgroundSize = 'cover'; b.style.backgroundPosition = 'center';
  });
};

// 手机窄屏布局也可以点击灵动岛锁屏。
$('#island-lock').onclick = () => { $('#lock').classList.add('open'); updateTime(); };

// 使用内嵌矢量绘制 iOS 风格图标，避免字体或 emoji 在不同电脑上变化。
function iosIcon(name) {
  const svg = body => `<svg viewBox="0 0 64 64" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const bg = color => `<rect width="64" height="64" rx="14" fill="${color}"/>`;
  const bubble = '<path fill="white" d="M53 29c0 11-10 19-22 19-3 0-6-.5-8-1.5L12 51l3-10C4 26 14 11 32 11c12 0 21 8 21 18z"/>';
  switch(name) {
    case '信息': return svg(bg('#32d653')+bubble);
    case '微信':return svg(bg('#07c160')+'<path fill="white" d="M29 13C17 13 8 20 8 29c0 5 3 10 8 13l-2 7 8-4 7 1c-2-3-3-6-3-9 0-10 10-18 22-17-4-4-11-7-19-7z"/><path fill="#e9f6ec" d="M44 23c-10 0-18 6-18 14s8 14 18 14l6-1 6 3-1-6c4-3 6-6 6-10 0-8-7-14-17-14z"/><g fill="#078d3e"><circle cx="21" cy="26" r="2"/><circle cx="36" cy="26" r="2"/><circle cx="38" cy="35" r="1.8"/><circle cx="50" cy="35" r="1.8"/></g>');
    case '电话':return svg(bg('#31d657')+'<path fill="white" d="M18 12c-3 0-7 5-6 12 3 15 15 27 29 29 6 1 11-3 11-6l-1-7-11-5-5 5c-7-3-11-7-14-14l5-4-5-10z"/>');
    case '日历':return svg(bg('#fff')+`<text x="32" y="19" text-anchor="middle" fill="#fa3b35" font-size="10" font-family="Arial">${new Date().toLocaleDateString('zh-CN',{weekday:'long'})}</text><text x="32" y="52" text-anchor="middle" fill="#111" font-size="36" font-family="Arial" font-weight="300">${new Date().getDate()}</text>`);
    case '照片':return svg(bg('#fff')+Array.from({length:8},(_,i)=>`<ellipse cx="32" cy="20" rx="8" ry="13" transform="rotate(${i*45} 32 32)" fill="${['#ffbe2f','#ff8d2b','#f75b72','#bb73c7','#7a8edd','#6bc6d1','#86cb82','#e1d74c'][i]}" opacity=".82"/>`).join(''));
    case '相机':return svg(bg('#d5d5d7')+'<path fill="#38383a" d="M10 21h12l4-6h13l4 6h11v30H10z"/><circle cx="33" cy="36" r="13" fill="#aaaeb3"/><circle cx="33" cy="36" r="10" fill="#20242b"/><circle cx="33" cy="36" r="6" fill="#253a52"/><circle cx="30" cy="33" r="2.5" fill="#617e9c"/><circle cx="48" cy="26" r="2.5" fill="#f2d45e"/>');
    case '天气':return svg(bg('#198bea')+'<circle cx="23" cy="23" r="12" fill="#ffcc36"/><path fill="white" d="M14 47a10 10 0 010-20 14 14 0 0125-4 12 12 0 117 24z"/>');
    case '时钟':return svg(bg('#080808')+'<circle cx="32" cy="32" r="27" fill="white"/>'+Array.from({length:12},(_,i)=>`<path d="M32 8v4" transform="rotate(${i*30} 32 32)" stroke="#222" stroke-width="1.8"/>`).join('')+'<path d="M32 17v15l12 8" stroke="#171717" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 13v28" stroke="#ff8d21" stroke-width="1.3" transform="rotate(45 32 32)"/><circle cx="32" cy="32" r="2.5" fill="#ff8d21"/>');
    case '地图':return svg(bg('#e5eedb')+'<path d="M43 0v64" stroke="#b6daeb" stroke-width="20"/><path d="M-5 48L64 12" stroke="white" stroke-width="15"/><path d="M16 0v64" stroke="white" stroke-width="10"/><path d="M-5 48L64 12" stroke="#ffd46d" stroke-width="7"/><path d="M16 0v64" stroke="#a6aab2" stroke-width="2"/><path d="M26 55l12-32 13 32-13-6z" fill="#287af6" stroke="white" stroke-width="2"/><rect x="3" y="7" width="24" height="15" rx="4" fill="#4685d5"/><text x="15" y="18" text-anchor="middle" fill="white" font-family="Arial" font-size="10">280</text>');
    case '备忘录':return svg(bg('#fff')+'<path fill="#ffda42" d="M0 0h64v19H0z"/><path d="M0 22h64" stroke="#d9d6ce" stroke-dasharray="2 2"/><path d="M10 32h44M10 42h44M10 52h34" stroke="#ccc" stroke-width="1"/>');
    case 'App Store':return svg(bg('#178cf4')+'<g fill="none" stroke="white" stroke-width="5" stroke-linecap="round"><path d="M24 14l24 39M39 14L16 53M12 42h40"/></g>');
    case '健康':return svg(bg('#fff')+'<path fill="#ff4561" d="M32 47L16 32C3 17 24 7 32 20c9-13 29-3 16 12z"/>');
    case '钱包':return svg(bg('#222225')+'<rect x="9" y="13" width="46" height="29" rx="4" fill="#d99d49"/><rect x="9" y="20" width="46" height="26" rx="4" fill="#72b8c8"/><rect x="9" y="27" width="46" height="24" rx="4" fill="#9caac1"/><rect x="8" y="35" width="48" height="20" rx="4" fill="#39393b"/><path d="M10 38h13l4 5h10l4-5h13" fill="none" stroke="#717174" stroke-width="2"/>');
    case '设置':return svg(bg('#b5b7bd')+'<circle cx="32" cy="32" r="25" fill="#686b72"/>'+Array.from({length:12},(_,i)=>`<rect x="29" y="5" width="6" height="13" rx="1" fill="#d5d6d9" transform="rotate(${i*30} 32 32)"/>`).join('')+'<circle cx="32" cy="32" r="18" fill="#d5d6d9"/><circle cx="32" cy="32" r="14" fill="#696c73"/><circle cx="32" cy="32" r="9" fill="#b9bbc1"/><circle cx="32" cy="32" r="5" fill="#71747b"/>');
    case 'Safari':return svg(bg('#fff')+'<circle cx="32" cy="32" r="28" fill="#1ba9ed"/>'+Array.from({length:24},(_,i)=>`<path d="M32 6v4" stroke="white" stroke-width="1" transform="rotate(${i*15} 32 32)"/>`).join('')+'<path d="M45 16L36 36 19 48l9-22z" fill="white"/><path d="M45 16L36 36l-8-10z" fill="#f33d4d"/>');
    case '音乐':return svg(bg('#fc3558')+'<path fill="white" d="M27 18v25c-12-3-18 11-6 12 6 0 10-4 10-9V28l17-4v15c-12-2-17 11-6 12 7 0 10-4 10-9V12z"/>');
    case '计算器':return svg(bg('#252528')+'<rect x="9" y="8" width="46" height="14" rx="3" fill="#77787a"/>'+[0,1,2].map(r=>[0,1,2].map(c=>`<circle cx="${17+c*15}" cy="${32+r*11}" r="4.5" fill="${c===2?'#ff9f0b':'#a5a5a5'}"/>`).join('')).join(''));
    default:return svg(bg('#ccc'));
  }
}

// 横向分页：触摸滑动、鼠标拖动、分页圆点和左右方向键。
const homePages = $('#home-pages');
function showPage(page) { homePages.scrollTo({left:page * homePages.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); }
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>showPage(+b.dataset.page));
homePages.addEventListener('scroll',()=>{
  const active = Math.round(homePages.scrollLeft / homePages.clientWidth);
  document.querySelectorAll('[data-page]').forEach((b,i)=>{b.classList.toggle('active',i===active);if(i===active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
},{passive:true});
homePages.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showPage(e.key==='ArrowRight'?1:0);}});
let dragStart=null,dragScroll=0,didDrag=false;
homePages.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){dragStart=e.clientX;dragScroll=homePages.scrollLeft;didDrag=false;}});
homePages.addEventListener('pointermove',e=>{if(dragStart!==null&&Math.abs(e.clientX-dragStart)>8){didDrag=true;homePages.style.scrollSnapType='none';homePages.scrollLeft=dragScroll+dragStart-e.clientX;}});
function endDrag(){if(dragStart===null)return;dragStart=null;homePages.style.scrollSnapType='';if(didDrag){showPage(homePages.scrollLeft>homePages.clientWidth/2?1:0);setTimeout(()=>didDrag=false,0);}}
window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
homePages.addEventListener('click',e=>{if(didDrag){e.preventDefault();e.stopPropagation();}},true);

// 微信为本地模拟应用，不连接真实账号。
let wechatHistory=readJSON('wechat-messages',[]);
if(!Array.isArray(wechatHistory))wechatHistory=[];
wechatHistory=wechatHistory.filter(x=>typeof x==='string');
let wechatTab='微信';
function showWeChat(tab='微信'){
  wechatTab=tab;
  layout('微信','<div class="wechat-body" id="wechat-content"></div><nav class="wechat-tabs" aria-label="微信导航">'+['微信','通讯录','发现','我'].map((t,i)=>`<button data-wx-tab="${t}" class="${t===tab?'selected':''}"><span>${['◯','♧','◎','♙'][i]}</span>${t}</button>`).join('')+'</nav>');
  view.classList.add('wechat-app');
  document.querySelectorAll('[data-wx-tab]').forEach(b=>b.onclick=()=>showWeChat(b.dataset.wxTab));
  const content=$('#wechat-content');
  if(tab==='微信'){
    content.innerHTML='<p class="wx-caption">本地模拟聊天</p><button class="wx-contact" id="wx-chat"><span class="wx-avatar">'+iosIcon('微信')+'</span><span><b>文件传输助手</b><small id="wx-preview">欢迎使用微信，点击开始聊天</small></span><span class="wx-time">现在</span></button>';
    if(wechatHistory.length)$('#wx-preview').textContent=wechatHistory.at(-1);
    $('#wx-chat').onclick=showWeChatChat;
  }else if(tab==='通讯录'){
    content.innerHTML='<p class="wx-caption">我的联系人</p><button class="wx-contact" id="wx-person"><span class="wx-avatar">'+iosIcon('微信')+'</span><b>文件传输助手</b></button>';
    $('#wx-person').onclick=showWeChatChat;
  }else if(tab==='发现'){
    content.innerHTML='<button class="wx-discover" id="wx-moments">🌄 <span>朋友圈</span> ›</button>';
    $('#wx-moments').onclick=()=>{layout('朋友圈','<div class="content-card"><b>微信团队</b><p>记录生活里的每一个美好瞬间。</p><div class="moment-image"></div><button class="back" id="like-moment">♡ 赞</button></div><button class="back" id="wx-discover-back">‹ 返回发现</button>');$('.moment-image').style.backgroundImage=samplePhoto(0);let liked=false;$('#like-moment').onclick=()=>{liked=!liked;$('#like-moment').textContent=liked?'♥ 已赞':'♡ 赞'};$('#wx-discover-back').onclick=()=>showWeChat('发现')};
  }else{
    content.innerHTML='<div class="content-card wx-profile"><span class="profile-avatar">☺</span><div><b id="wx-profile-name"></b><p class="muted">微信号：iphone_simulator</p></div></div><div class="content-card muted">本地体验版<br>聊天记录保存在当前浏览器，不连接真实微信服务。</div>';
    $('#wx-profile-name').textContent=deviceName();
  }
}
function showWeChatChat(){
  layout('文件传输助手','<button class="back" id="wx-back">‹ 微信</button><div class="message-history wx-history" id="wx-history" aria-live="polite"><p class="bubble received">欢迎！你可以在这里发送文字消息。这里只保存本地模拟记录。</p></div><form class="message-form" id="wx-form"><input id="wx-input" aria-label="微信消息" placeholder="输入消息" maxlength="2000" autocomplete="off"><button class="wx-send" type="submit">发送</button></form>');
  view.classList.add('wechat-app');
  function append(text){const p=document.createElement('p');p.className='bubble sent';p.textContent=text;$('#wx-history').append(p);$('#wx-history').scrollTop=$('#wx-history').scrollHeight;}
  wechatHistory.forEach(append);$('#wx-back').onclick=()=>showWeChat();
  $('#wx-form').onsubmit=e=>{e.preventDefault();const t=$('#wx-input').value.trim();if(!t)return;wechatHistory.push(t);storage.setItem('wechat-messages',JSON.stringify(wechatHistory));append(t);$('#wx-input').value='';$('#wx-input').focus();};
}
const openBeforeWeChat=openApp;
openApp=function(name){view.classList.remove('wechat-app');if(name==='微信')return showWeChat();openBeforeWeChat(name);};
