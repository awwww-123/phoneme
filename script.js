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
$('#apps-second').innerHTML=[['微信'],['计算器'],['Fitness'],['Google Maps'],['Gmail'],['Instagram'],['Weibo']].map(icon).join('');
let timer,clockTimer;function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',2300)}function home(){if(typeof phoneLocked!=='undefined'&&phoneLocked){showPasscode();return}$('#screen').classList.remove('in-app');$('#app-view').classList.remove('open');$('#lock').classList.remove('open');$('.home-indicator').style.color='white';clearInterval(clockTimer)}$('#home').onclick=home;$('#reset').onclick=home;document.addEventListener('keydown',e=>{if(e.key==='Escape'||((e.metaKey||e.ctrlKey)&&e.key==='h')){e.preventDefault();home()}});
const names=['暮光紫','海盐蓝','落日粉','苔原绿'],walls=['radial-gradient(ellipse at 10% 0%,#d6cef2,transparent 48%),radial-gradient(ellipse at 94% 62%,#9c70c2,transparent 52%),linear-gradient(160deg,#9e9cd2,#aca2d8 45%,#6b5a9f)','linear-gradient(145deg,#a6d5dd,#83b4c5 40%,#3e7396)','linear-gradient(145deg,#f5d4bc,#e9b8b8 40%,#b67494)','linear-gradient(145deg,#c4d4b9,#9cbba9 40%,#56786c)'];function wallpaper(i){$('#wallpaper').style.background=walls[i];$('#wallpaper-name').textContent=names[i];document.querySelectorAll('.swatch').forEach((b,j)=>b.classList.toggle('active',i===j));storage.setItem('wallpaper',i)}document.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>wallpaper(+b.dataset.wall));wallpaper(Math.max(0,Math.min(3,+storage.getItem('wallpaper')||0)));$('#brightness').oninput=e=>{$('#screen').style.filter=`brightness(${e.target.value}%)`;$('#brightness-value').textContent=e.target.value+'%'};function updateTime(){const d=new Date(),t=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});$('#clock').textContent=d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');$('#lock-time').textContent=t;$('#lock-date').textContent=d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});if($('#widget-date'))$('#widget-date').textContent=d.getDate();if($('#widget-day'))$('#widget-day').textContent=d.toLocaleDateString('zh-CN',{weekday:'long'})}updateTime();setInterval(updateTime,10000);$('#lock-button').onclick=lockPhone;$('#unlock').onclick=showPasscode;
const view=$('#app-view');function layout(name,html){home();delete view.dataset.clockMode;view.scrollTop=0;$('#screen').classList.add('in-app');view.dataset.app=name;view.innerHTML=`<div class="app-top"><button class="back" id="back">‹ 主屏幕</button><span></span></div><h2>${name}</h2>${html}`;view.classList.add('open');$('.home-indicator').style.color='#33283e';$('#back').onclick=home}
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
function showMessages() { showMessageList(); }
function legacySettings() {
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
  $('.signals').innerHTML = (airplane?'<span class="status-airplane" aria-label="飞行模式">✈</span>':'<svg class="status-cellular" aria-label="蜂窝信号" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".7"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7"/><rect x="10" y="3" width="3" height="9" rx=".7"/><rect x="15" y="0" width="3" height="12" rx=".7"/></svg>')+'<svg class="status-wifi" aria-label="Wi-Fi" viewBox="0 0 20 15" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M1 4q9-7 18 0M4.5 8q5.5-4.5 11 0M8 11.3q2-1.5 4 0"/><circle cx="10" cy="13.5" r="1" fill="currentColor" stroke="none"/></svg><svg class="status-battery" aria-label="电量86%" viewBox="0 0 28 13" fill="none"><rect x=".7" y=".7" width="23" height="11.6" rx="3" stroke="currentColor" stroke-opacity=".5" stroke-width="1.3"/><rect x="2.4" y="2.4" width="18" height="8.2" rx="1.5" fill="currentColor"/><path d="M25.4 4v5q2-1 2-2.5T25.4 4" fill="currentColor" fill-opacity=".55"/></svg>';
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
$('#island-lock').onclick = lockPhone;

// 使用内嵌矢量绘制 iOS 风格图标，避免字体或 emoji 在不同电脑上变化。
function classicIosIcon(name) {
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
    case '时钟':return svg(bg('#f9f9f9')+'<circle cx="32" cy="32" r="27" fill="white"/>'+Array.from({length:12},(_,i)=>`<path d="M32 8v4" transform="rotate(${i*30} 32 32)" stroke="#222" stroke-width="1.8"/>`).join('')+'<path d="M32 17v15l12 8" stroke="#171717" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M32 13v28" stroke="#ff8d21" stroke-width="1.3" transform="rotate(45 32 32)"/><circle cx="32" cy="32" r="2.5" fill="#ff8d21"/>');
    case '地图':return svg(bg('#e9eddf')+'<path d="M38 0v64" stroke="#75c4ed" stroke-width="21"/><path d="M-6 48L66 11" stroke="white" stroke-width="17"/><path d="M-6 48L66 11" stroke="#ffe47c" stroke-width="8"/><path d="M12 0v64" stroke="white" stroke-width="9"/><path d="M51 0q-3 14 13 19M56 0q-1 9 8 12" fill="none" stroke="white" stroke-width="1.5"/><circle cx="31" cy="40" r="19" fill="#fff" opacity=".8"/><circle cx="31" cy="40" r="16" fill="#3987ed" stroke="white" stroke-width="2"/><path d="M31 27L20 49l11-5 11 5z" fill="white"/>');
    case '备忘录':return svg(bg('#fff')+'<path fill="#ffda42" d="M0 0h64v19H0z"/><path d="M0 22h64" stroke="#d9d6ce" stroke-dasharray="2 2"/><path d="M10 32h44M10 42h44M10 52h34" stroke="#ccc" stroke-width="1"/>');
    case 'App Store':return svg(bg('#178cf4')+'<g fill="none" stroke="white" stroke-width="5" stroke-linecap="round"><path d="M24 14l24 39M39 14L16 53M12 42h40"/></g>');
    case '健康':return svg(bg('#fff')+'<defs><linearGradient id="health-heart" x2="0" y2="1"><stop stop-color="#ed3987"/><stop offset="1" stop-color="#f02e35"/></linearGradient></defs><path fill="url(#health-heart)" d="M32 47L16 32C3 17 24 7 32 20c9-13 29-3 16 12z"/>');
    case '钱包':return svg(bg('#222225')+'<rect x="9" y="13" width="46" height="29" rx="4" fill="#d99d49"/><rect x="9" y="20" width="46" height="26" rx="4" fill="#72b8c8"/><rect x="9" y="27" width="46" height="24" rx="4" fill="#9caac1"/><rect x="8" y="35" width="48" height="20" rx="4" fill="#39393b"/><path d="M10 38h13l4 5h10l4-5h13" fill="none" stroke="#717174" stroke-width="2"/>');
    case '设置':return svg(bg('#b5b7bd')+'<circle cx="32" cy="32" r="25" fill="#686b72"/>'+Array.from({length:12},(_,i)=>`<rect x="29" y="5" width="6" height="13" rx="1" fill="#d5d6d9" transform="rotate(${i*30} 32 32)"/>`).join('')+'<circle cx="32" cy="32" r="18" fill="#d5d6d9"/><circle cx="32" cy="32" r="14" fill="#696c73"/><circle cx="32" cy="32" r="9" fill="#b9bbc1"/><circle cx="32" cy="32" r="5" fill="#71747b"/>');
    case 'Safari':return svg(bg('#fff')+'<circle cx="32" cy="32" r="28" fill="#1ba9ed"/>'+Array.from({length:24},(_,i)=>`<path d="M32 6v4" stroke="white" stroke-width="1" transform="rotate(${i*15} 32 32)"/>`).join('')+'<path d="M45 16L36 36 19 48l9-22z" fill="white"/><path d="M45 16L36 36l-8-10z" fill="#f33d4d"/>');
    case '音乐':return svg(bg('#fc3558')+'<path fill="white" d="M27 18v25c-12-3-18 11-6 12 6 0 10-4 10-9V28l17-4v15c-12-2-17 11-6 12 7 0 10-4 10-9V12z"/>');
    case 'Fitness':return svg(bg('#080808')+'<g fill="none" stroke-width="7" stroke-linecap="round" transform="rotate(-90 32 32)"><circle cx="32" cy="32" r="24" stroke="#531326"/><circle cx="32" cy="32" r="24" stroke="#fa2f75" stroke-dasharray="131 151"/><circle cx="32" cy="32" r="16" stroke="#254d06"/><circle cx="32" cy="32" r="16" stroke="#a5fa27" stroke-dasharray="90 101"/><circle cx="32" cy="32" r="8" stroke="#104748"/><circle cx="32" cy="32" r="8" stroke="#4fe5dd" stroke-dasharray="43 51"/></g>');
    case '计算器':return svg(bg('#d0d0d2')+'<rect x="13" y="6" width="38" height="53" rx="5" fill="#252528"/><rect x="17" y="10" width="30" height="13" rx="2" fill="#77787a"/>'+[0,1,2].map(r=>[0,1,2].map(c=>`<circle cx="${22+c*10}" cy="${32+r*9}" r="3.4" fill="${c===2?'#ff9f0b':'#d4d4d5'}"/>`).join('')).join(''));
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

// iOS 分组设置：保留原有存储键和设置行为。
function settingsPage(title, html) {
  layout(title, html);
  view.dataset.app='设置';
  $('#back').textContent='‹ 设置';$('#back').onclick=showSettings;
}
function showSettings(){
  layout('设置', `<div class="ios-profile"><div class="ios-profile-avatar">${deviceName().slice(0,1).replace(/[<>&]/g,'')}</div><div><b id="settings-device"></b><small>Apple 账户、iCloud 与更多</small></div></div><p class="ios-section-label">连接</p><div class="ios-group"><div class="ios-row"><span class="settings-symbol airplane-symbol">✈</span><span>飞行模式</span><button class="toggle" id="airplane-toggle" aria-label="飞行模式"></button></div><div class="ios-row"><span class="settings-symbol bluetooth-symbol">ᛒ</span><span>蓝牙</span><button class="toggle" id="bluetooth-toggle" aria-label="蓝牙"></button></div></div><div class="ios-group"><button class="ios-row" id="general-settings"><span class="settings-symbol gray-symbol">⚙</span><span>通用</span><span class="disclosure">›</span></button><button class="ios-row" id="display-settings"><span class="settings-symbol blue-symbol">Aᴀ</span><span>显示与亮度</span><span class="disclosure">›</span></button><button class="ios-row" id="wallpaper-settings"><span class="settings-symbol wallpaper-symbol">▧</span><span>墙纸</span><span class="disclosure">›</span></button></div><p class="ios-section-label">所有设置仅保存在当前浏览器</p>`);
  $('#settings-device').textContent=deviceName();
  for(const [id,key,initial] of [['airplane-toggle','airplane',false],['bluetooth-toggle','bluetooth',true]]){
    const button=$('#'+id);let on=storage.getItem(key)===null?initial:storage.getItem(key)==='true';
    function sync(){button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(on))}sync();
    button.onclick=()=>{on=!on;storage.setItem(key,String(on));sync();if(key==='airplane')updateSignals()};
  }
  $('#general-settings').onclick=()=>{
    settingsPage('通用','<div class="ios-group"><button class="ios-row" id="about-device"><span>关于本机</span><span class="disclosure">›</span></button></div>');
    $('#about-device').onclick=()=>{
      settingsPage('关于本机','<div class="ios-group"><div class="ios-row"><span>名称</span><input id="device-name" aria-label="手机名称" maxlength="30"></div><div class="ios-row"><span>机型名称</span><span class="row-value">iPhone 15 Pro</span></div><div class="ios-row"><span>系统版本</span><span class="row-value">iOS 模拟器</span></div></div><button class="ios-full-button" id="save-name">保存名称</button>');
      $('#device-name').value=deviceName();$('#save-name').onclick=()=>{const n=$('#device-name').value.trim();if(!n)return toast('请填写手机名称');storage.setItem('device-name',n);updateDeviceLabel();toast('名称已保存')};
    };
  };
  $('#display-settings').onclick=()=>{
    settingsPage('显示与亮度','<p class="ios-section-label">外观</p><div class="appearance-options"><button id="light-theme" class="appearance"><span class="appearance-preview light-preview"></span>浅色</button><button id="dark-theme" class="appearance"><span class="appearance-preview dark-preview"></span>深色</button></div><div class="ios-group"><div class="ios-row"><span>深色模式</span><button id="dark-toggle" class="toggle" aria-label="深色模式"></button></div></div><p class="ios-section-label">亮度</p><div class="ios-group brightness-group"><span>☀</span><input type="range" id="native-brightness" min="40" max="100" aria-label="亮度"><span>☀</span></div>');
    function sync(){const on=$('#screen').classList.contains('dark');$('#dark-toggle').classList.toggle('on',on);$('#dark-toggle').setAttribute('aria-pressed',String(on));$('#light-theme').classList.toggle('chosen',!on);$('#dark-theme').classList.toggle('chosen',on)}sync();
    $('#light-theme').onclick=()=>{applyTheme(false);sync()};$('#dark-theme').onclick=()=>{applyTheme(true);sync()};$('#dark-toggle').onclick=()=>{applyTheme(!$('#screen').classList.contains('dark'));sync()};
    $('#native-brightness').value=$('#brightness').value;$('#native-brightness').oninput=e=>{$('#brightness').value=e.target.value;$('#brightness').dispatchEvent(new Event('input'))};
  };
  $('#wallpaper-settings').onclick=()=>{
    settingsPage('墙纸','<div class="wallpaper-current"><span>当前墙纸</span><div id="current-wallpaper"></div></div><p class="ios-section-label">选择新墙纸</p><div id="settings-wallpapers" class="wallpaper-options"></div><p id="selected-wallpaper" class="ios-section-label"></p>');
    const sync=()=>{const i=+storage.getItem('wallpaper')||0;$('#current-wallpaper').style.background=walls[i];$('#selected-wallpaper').textContent='当前墙纸：'+names[i]};sync();
    names.forEach((name,i)=>{const b=document.createElement('button');b.className='wallpaper-option';b.style.background=walls[i];b.textContent=name;b.onclick=()=>{wallpaper(i);sync()};$('#settings-wallpapers').append(b)});
  };
}

// 每天独立保存模拟运动数据，可切换日期和调整目标。
function fitnessDate(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function activityFor(date){
  const data=readJSON('fitness-day-'+date,null);
  if(data&&Array.isArray(data.values)&&data.values.length===3&&data.values.every(n=>Number.isFinite(n)&&n>=0))return data;
  return {values:date===fitnessDate()?[320,18,7]:[0,0,0]};
}
function fitnessGoals(){const g=readJSON('fitness-goals',[500,30,12]);return Array.isArray(g)&&g.length===3&&g.every(x=>Number.isFinite(x)&&x>0)?g:[500,30,12]}
function ringGraphic(values,goals){return `<svg class="activity-rings" viewBox="0 0 240 240" role="img" aria-label="活动、锻炼、站立三色运动环">${[94,70,46].map((r,i)=>{const c=2*Math.PI*r,p=Math.min(values[i]/goals[i],1);return `<circle class="ring-track ring-${i}" cx="120" cy="120" r="${r}"/><circle class="ring-progress ring-${i}" cx="120" cy="120" r="${r}" stroke-dasharray="${c*p} ${c}" transform="rotate(-90 120 120)"/>`}).join('')}</svg>`}
function showFitness(date=fitnessDate()){
  const goals=fitnessGoals(),activity=activityFor(date),v=activity.values;
  layout('Fitness',`<div class="fitness-header"><span>摘要</span><span class="fitness-avatar">●</span></div><div class="fitness-date-nav"><button id="fitness-prev" aria-label="前一天">‹</button><span id="fitness-date"></span><button id="fitness-next" aria-label="后一天">›</button></div><div class="fitness-week">${Array.from({length:7},(_,i)=>{const day=fitnessDate(i-6),a=activityFor(day);return `<button data-fitness-date="${day}" class="${day===date?'selected':''}" aria-label="${day}"><span>${['日','一','二','三','四','五','六'][new Date(day+'T12:00:00').getDay()]}</span>${ringGraphic(a.values,goals)}</button>`}).join('')}</div><section class="fitness-card"><h3>健身记录圆环</h3>${ringGraphic(v,goals)}<div class="activity-values">${['活动','锻炼','站立'].map((label,i)=>`<div class="metric metric-${i}"><span>${label}</span><b>${v[i]}<small> / ${goals[i]} ${['千卡','分钟','小时'][i]}</small></b></div>`).join('')}</div></section><section class="fitness-card fitness-details"><div><span>步数</span><b>${Math.round(v[0]*16).toLocaleString()}</b></div><div><span>距离</span><b>${(v[0]*.011).toFixed(2)} <small>公里</small></b></div></section><button class="fitness-button" id="fitness-log">＋ 记录活动</button><button class="fitness-button secondary" id="fitness-goals">更改每日目标</button><p class="fitness-disclaimer">模拟运动数据 · 不读取真实健康记录</p>`);
  view.dataset.app='Fitness';$('#fitness-date').textContent=new Date(date+'T12:00:00').toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});
  function shift(delta){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+delta);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  $('#fitness-prev').onclick=()=>showFitness(shift(-1));$('#fitness-next').onclick=()=>showFitness(shift(1));if(date>=fitnessDate())$('#fitness-next').disabled=true;
  document.querySelectorAll('[data-fitness-date]').forEach(b=>b.onclick=()=>showFitness(b.dataset.fitnessDate));
  function editor(isGoals){
    const initial=isGoals?goals:v;
    layout(isGoals?'每日目标':'记录活动',`<form id="fitness-form">${['活动（千卡）','锻炼（分钟）','站立（小时）'].map((label,i)=>`<label class="fitness-input-label">${label}<input type="number" id="fitness-value-${i}" min="${isGoals?1:0}" max="${[10000,1440,24][i]}" step="1" value="${initial[i]}" required></label>`).join('')}<p class="fitness-disclaimer">${isGoals?'设置每日目标':'填写这一天累计完成的运动量'}</p><button class="fitness-button" type="submit">保存</button><button class="fitness-button secondary" type="button" id="fitness-cancel">取消</button></form>`);view.dataset.app='Fitness';$('#back').textContent='‹ 摘要';$('#back').onclick=()=>showFitness(date);$('#fitness-cancel').onclick=()=>showFitness(date);
    $('#fitness-form').onsubmit=e=>{e.preventDefault();const values=[0,1,2].map(i=>Number($('#fitness-value-'+i).value));if(values.some((x,i)=>!Number.isInteger(x)||x<(isGoals?1:0)||x>[10000,1440,24][i]))return toast('请输入有效的整数');storage.setItem(isGoals?'fitness-goals':'fitness-day-'+date,JSON.stringify(isGoals?values:{values}));showFitness(date)};
  }
  $('#fitness-log').onclick=()=>editor(false);$('#fitness-goals').onclick=()=>editor(true);
}
const openBeforeFitness=openApp;
openApp=function(name){if(name==='Fitness'){view.classList.remove('wechat-app');return showFitness()}openBeforeFitness(name)};

// 信息：每位联系人都有独立记录。旧版本已发送的消息迁入文件传输助手。
const messageContacts = [
  {id:'a',name:'小A',initial:'A',color:'#b5a5e3',unread:true,lines:[['in','今天下班要不要一起去吃火锅？'],['out','好呀！还是上次那家吗？'],['in','对，我订了六点半的位置，到了给我发消息～']]},
  {id:'honey',name:'哈尼',initial:'♡',color:'#efa9b9',unread:true,lines:[['in','早上好，记得吃早餐哦 ☀️'],['out','吃过啦，今天带了你买的面包。'],['in','我晚上买菜，想吃番茄炒蛋还是咖喱？'],['out','咖喱！我下班顺路买水果。'],['in','好，那我等你回家一起吃饭 ❤️']]},
  {id:'mom',name:'妈妈',initial:'妈',color:'#e6ae83',lines:[['in','这几天降温，出门多穿一件衣服。'],['out','知道啦，今天穿了外套。你们也注意保暖！'],['in','周末有空就回来吃饭，给你做好吃的。']]},
  {id:'weekend',name:'周末出游',initial:'☀',color:'#8bbeb0',lines:[['in','周六去公园怎么样？天气预报说是晴天。'],['out','可以呀，我带点零食。'],['in','那就十点在地铁站见！']]},
  {id:'assistant',name:'文件传输助手',initial:'▤',color:'#85b1dd',lines:[['in','可以在这里保存临时文字。消息只会保存在当前浏览器。']]}
];
let messageThreads = readJSON('message-threads-v2', {});
if(!messageThreads || typeof messageThreads!=='object' || Array.isArray(messageThreads))messageThreads={};
messageContacts.forEach((contact,index)=>{
  if(!Array.isArray(messageThreads[contact.id])) {
    messageThreads[contact.id]=contact.lines.map(([direction,text],i)=>({direction,text,at:new Date(Date.now()-(index*3600+contact.lines.length*120-i*120)*1000).toISOString()}));
    if(contact.id==='assistant')messages.forEach(text=>messageThreads.assistant.push({direction:'out',text,at:new Date().toISOString()}));
  }
  messageThreads[contact.id]=messageThreads[contact.id].filter(m=>m&&typeof m.text==='string'&&['in','out'].includes(m.direction));
});
const saveMessageThreads=()=>storage.setItem('message-threads-v2',JSON.stringify(messageThreads));
saveMessageThreads();
let pinnedContacts=readJSON('message-pins',[]);if(!Array.isArray(pinnedContacts))pinnedContacts=[];
let readContacts=readJSON('message-read',[]);if(!Array.isArray(readContacts))readContacts=[];
let messagesFilterUnread=false;
function messageTime(at){const d=new Date(at);return Number.isNaN(d.getTime())?'现在':d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}
function showMessageList(){
  layout('信息','<div class="messages-actions"><button id="messages-edit">编辑</button><button id="messages-filter" aria-label="筛选信息">☰</button></div><h1 class="messages-title">Messages</h1><div class="thread-list" id="thread-list"></div><div class="messages-bottom"><label class="messages-search"><span>⌕</span><input id="messages-search" aria-label="搜索信息" placeholder="搜索"></label><button id="messages-compose" aria-label="新建信息"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5H5v15h15v-8M10 14l1-4L20 1l3 3-9 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button></div>');
  view.dataset.app='信息列表';let editing=false;
  function render(){
    const q=$('#messages-search').value.trim().toLowerCase();$('#thread-list').replaceChildren();
    const sorted=[...messageContacts].sort((a,b)=>Number(pinnedContacts.includes(b.id))-Number(pinnedContacts.includes(a.id)));
    for(const c of sorted){const history=messageThreads[c.id],last=history.at(-1),unread=c.unread&&!readContacts.includes(c.id);if(messagesFilterUnread&&!unread)continue;if(q&&!c.name.toLowerCase().includes(q)&&!history.some(m=>m.text.toLowerCase().includes(q)))continue;
      const row=document.createElement('button');row.className='message-thread';row.dataset.thread=c.id;row.setAttribute('aria-label','打开与'+c.name+'的聊天');
      const dot=document.createElement('span');dot.className='unread-dot'+(unread?' visible':'');
      const avatar=document.createElement('span');avatar.className='contact-avatar';avatar.style.background=c.color;avatar.textContent=c.initial;
      const summary=document.createElement('span');summary.className='thread-summary';
      const heading=document.createElement('span');heading.className='thread-heading';
      const name=document.createElement('b');name.textContent=(pinnedContacts.includes(c.id)?'⌖ ':'')+c.name;
      const time=document.createElement('small');time.textContent=editing?(pinnedContacts.includes(c.id)?'取消置顶':'置顶'):messageTime(last?.at);
      heading.append(name,time);const snippet=document.createElement('span');snippet.className='thread-snippet';snippet.textContent=last?.text||'暂无消息';summary.append(heading,snippet);
      const arrow=document.createElement('span');arrow.className='thread-arrow';arrow.textContent='›';row.append(dot,avatar,summary,arrow);
      row.onclick=()=>{if(editing){pinnedContacts=pinnedContacts.includes(c.id)?pinnedContacts.filter(id=>id!==c.id):[...pinnedContacts,c.id];storage.setItem('message-pins',JSON.stringify(pinnedContacts));render()}else showMessageChat(c.id)};
      $('#thread-list').append(row);
    }
    if(!$('#thread-list').children.length)$('#thread-list').innerHTML='<p class="messages-empty">没有符合条件的信息</p>';
    $('#messages-filter').classList.toggle('is-active',messagesFilterUnread);$('#messages-filter').setAttribute('aria-label',messagesFilterUnread?'显示所有信息':'仅显示未读信息');
  }
  render();$('#messages-search').oninput=render;
  $('#messages-edit').onclick=()=>{editing=!editing;$('#messages-edit').textContent=editing?'完成':'编辑';render()};
  $('#messages-filter').onclick=()=>{messagesFilterUnread=!messagesFilterUnread;render()};
  $('#messages-compose').onclick=()=>{messagesFilterUnread=false;showMessageRecipients()};
}
function showMessageRecipients(){
  layout('新信息','<p class="muted">选择收件人</p><div id="message-recipients" class="ios-group"></div>');view.dataset.app='信息';$('#back').textContent='‹ 信息';$('#back').onclick=showMessageList;
  messageContacts.forEach(c=>{const b=document.createElement('button');b.className='ios-row';b.textContent=c.name+'  ›';b.onclick=()=>showMessageChat(c.id);$('#message-recipients').append(b)});
}
function showMessageChat(id){
  const c=messageContacts.find(c=>c.id===id);if(!c)return showMessageList();
  if(!readContacts.includes(id)){readContacts.push(id);storage.setItem('message-read',JSON.stringify(readContacts))}
  layout(c.name,'<div class="chat-contact-header"><span class="contact-avatar" id="chat-avatar"></span><b id="chat-name"></b><span>›</span></div><p class="chat-date">iMessage · 本地模拟</p><div id="messages" class="native-chat-history" aria-live="polite"></div><form id="message-form" class="native-message-form"><span class="message-plus" aria-hidden="true">＋</span><input id="message" aria-label="输入消息" placeholder="iMessage" maxlength="2000" autocomplete="off"><button type="submit" aria-label="发送信息">↑</button></form>');
  view.dataset.app='信息聊天';$('#back').textContent='‹ 信息';$('#back').onclick=showMessageList;
  $('#chat-avatar').textContent=c.initial;$('#chat-avatar').style.background=c.color;$('#chat-name').textContent=c.name;
  function append(m){const p=document.createElement('p');p.className='bubble '+(m.direction==='out'?'sent':'received');p.textContent=m.text;$('#messages').append(p)}
  messageThreads[id].forEach(append);$('#messages').scrollTop=$('#messages').scrollHeight;
  $('#message-form').onsubmit=e=>{e.preventDefault();const text=$('#message').value.trim();if(!text)return;const m={direction:'out',text,at:new Date().toISOString()};messageThreads[id].push(m);saveMessageThreads();append(m);$('#messages').scrollTop=$('#messages').scrollHeight;$('#message').value='';$('#message').focus()};
}

// 世界时钟使用 IANA 时区，浏览器自动处理夏令时和日期跨越。
const worldCities=[{id:'beijing',name:'北京',zone:'Asia/Shanghai'},{id:'chicago',name:'芝加哥',zone:'America/Chicago'},{id:'newyork',name:'纽约',zone:'America/New_York'},{id:'pittsburgh',name:'匹兹堡',zone:'America/New_York'},{id:'xiamen',name:'厦门',zone:'Asia/Shanghai'},{id:'london',name:'伦敦',zone:'Europe/London'}];
let cityOrder=readJSON('world-clock-order',worldCities.map(c=>c.id));if(!Array.isArray(cityOrder))cityOrder=[];cityOrder=[...new Set([...cityOrder,...worldCities.map(c=>c.id)])].filter(id=>worldCities.some(c=>c.id===id));
let clock24=storage.getItem('world-clock-24')!=='false';let clockTab='世界时钟';
function zonedClock(zone,now=new Date()){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t)?.value;return {hour:+get('hour'),minute:get('minute'),second:get('second'),day:Math.floor(Date.UTC(+get('year'),+get('month')-1,+get('day'))/86400000),offset:(Date.UTC(+get('year'),+get('month')-1,+get('day'),+get('hour'),+get('minute'),+get('second'))-Math.floor(now.getTime()/1000)*1000)/3600000};
}
function clockShell(tab,html){
  layout(tab,'<div class="clock-content">'+html+'</div><nav class="clock-tabs" aria-label="时钟导航">'+['世界时钟','闹钟','秒表','计时器'].map((name,i)=>`<button data-clock-tab="${name}" class="${tab===name?'selected':''}"><span>${clockTabSymbol(i)}</span>${['World Clock','Alarms','Stopwatch','Timers'][i]}</button>`).join('')+'</nav>');view.dataset.app='时钟';view.dataset.clockMode=tab;document.querySelectorAll('.clock-tabs [data-clock-tab]').forEach(b=>b.onclick=()=>showClockTab(b.dataset.clockTab));
}
function showWorldClock(){
  clockTab='世界时钟';clockShell('世界时钟','<div class="clock-actions"><button id="clock-edit">编辑</button><button id="clock-format" aria-label="切换12或24小时制">'+(clock24?'24小时':'12小时')+'</button></div><h1 class="clock-title">World Clock</h1><div id="world-clock-list"></div>');
  let edit=false;
  function tick(){
    const now=new Date(),localZone=Intl.DateTimeFormat().resolvedOptions().timeZone,local=zonedClock(localZone,now);const list=$('#world-clock-list');if(!list)return;list.replaceChildren();
    cityOrder.forEach((id,index)=>{const c=worldCities.find(c=>c.id===id),z=zonedClock(c.zone,now),dayDelta=z.day-local.day,diff=z.offset-local.offset;
      const row=document.createElement('div');row.className='world-clock-row';row.dataset.city=c.id;
      const left=document.createElement('div');const detail=document.createElement('small');detail.textContent=(dayDelta===0?'今天':dayDelta===1?'明天':dayDelta===-1?'昨天':dayDelta>0?'之后':'之前')+'，'+(diff>=0?'+':'')+Number(diff.toFixed(2))+' 小时';const name=document.createElement('b');name.textContent=c.name;left.append(detail,name);
      const right=document.createElement('div');right.className='world-time';right.dataset.zone=c.zone;const digits=document.createElement('span');digits.textContent=(clock24?String(z.hour).padStart(2,'0'):String(z.hour%12||12))+':'+z.minute;right.append(digits);if(!clock24){const period=document.createElement('small');period.textContent=z.hour>=12?'PM':'AM';right.append(period)}
      row.append(left,right);
      if(edit){const up=document.createElement('button');up.className='clock-reorder';up.textContent='↑';up.setAttribute('aria-label','上移'+c.name);up.disabled=index===0;up.onclick=()=>{[cityOrder[index-1],cityOrder[index]]=[cityOrder[index],cityOrder[index-1]];storage.setItem('world-clock-order',JSON.stringify(cityOrder));tick()};row.append(up)}list.append(row);
    });
  }
  tick();clockTimer=setInterval(tick,1000);$('#clock-format').onclick=()=>{clock24=!clock24;storage.setItem('world-clock-24',String(clock24));$('#clock-format').textContent=clock24?'24小时':'12小时';tick()};$('#clock-edit').onclick=()=>{edit=!edit;$('#clock-edit').textContent=edit?'完成':'编辑';tick()};
}
let stopwatchStart=null,stopwatchElapsed=0,timerEnd=null,timerRemaining=0;
function showClockTab(tab){
  clockTab=tab;if(tab==='世界时钟')return showWorldClock();
  if(tab==='闹钟'){
    let alarms=readJSON('simulator-alarms',[]);if(!Array.isArray(alarms))alarms=[];
    clockShell(tab,'<h1 class="clock-title">Alarms</h1><section class="sleep-schedule"><h3>▰ Sleep | Wake Up</h3><div><span id="sleep-time"></span><button id="sleep-change">CHANGE</button></div><small>Tomorrow Morning · 模拟睡眠计划</small></section><h3 class="alarm-other">Other</h3><p class="clock-hint">模拟闹钟列表，不在后台响铃</p><form id="alarm-form" class="alarm-form"><input id="alarm-time" type="time" value="07:30" aria-label="闹钟时间" required><button type="submit">添加</button></form><div id="alarm-list"></div>');
    const save=()=>storage.setItem('simulator-alarms',JSON.stringify(alarms));
    function render(){const list=$('#alarm-list');list.replaceChildren();alarms.forEach((a,i)=>{const row=document.createElement('div');row.className='alarm-row';const t=document.createElement('span');t.textContent=a.time;const toggle=document.createElement('button');toggle.className='toggle'+(a.on?' on':'');toggle.setAttribute('aria-label','切换'+a.time+'闹钟');toggle.setAttribute('aria-pressed',String(a.on));toggle.onclick=()=>{a.on=!a.on;save();render()};const del=document.createElement('button');del.textContent='删除';del.className='alarm-delete';del.onclick=()=>{alarms.splice(i,1);save();render()};row.append(t,toggle,del);list.append(row)});if(!alarms.length)list.innerHTML='<p class="clock-hint">没有闹钟</p>'}render();$('#alarm-form').onsubmit=e=>{e.preventDefault();alarms.push({time:$('#alarm-time').value,on:true});save();render()};
  }else if(tab==='秒表'){
    clockShell(tab,'<h1 class="clock-title stopwatch-title">Stopwatch</h1><div class="stopwatch-digits" id="stopwatch-display"></div><div class="stopwatch-actions"><button id="stopwatch-reset">复位</button><button id="stopwatch-start"></button></div>');
    const tick=()=>{const ms=stopwatchElapsed+(stopwatchStart?Date.now()-stopwatchStart:0);$('#stopwatch-display').textContent=String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+'.'+String(Math.floor(ms/10)%100).padStart(2,'0');$('#stopwatch-start').textContent=stopwatchStart?'停止':'启动'};tick();clockTimer=setInterval(tick,50);$('#stopwatch-start').onclick=()=>{if(stopwatchStart){stopwatchElapsed+=Date.now()-stopwatchStart;stopwatchStart=null}else stopwatchStart=Date.now();tick()};$('#stopwatch-reset').onclick=()=>{stopwatchElapsed=0;stopwatchStart=null;tick()};
  }else{
    clockShell(tab,'<h1 class="clock-title">Timers</h1><label class="timer-input">时长（分钟）<input id="timer-minutes" type="number" value="5" min="1" max="180" step="1"></label><div class="stopwatch-digits" id="timer-display"></div><div class="stopwatch-actions"><button id="timer-reset">取消</button><button id="timer-start"></button></div>');
    function tick(){if(timerEnd){timerRemaining=Math.max(0,timerEnd-Date.now());if(!timerRemaining){timerEnd=null;toast('计时结束')}}const seconds=Math.ceil(timerRemaining/1000);$('#timer-display').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');$('#timer-start').textContent=timerEnd?'暂停':timerRemaining?'继续':'开始';$('#timer-minutes').disabled=!!timerEnd}
    tick();clockTimer=setInterval(tick,200);$('#timer-start').onclick=()=>{if(timerEnd){timerRemaining=Math.max(0,timerEnd-Date.now());timerEnd=null}else{if(!timerRemaining){const minutes=+$('#timer-minutes').value;if(!Number.isInteger(minutes)||minutes<1||minutes>180)return toast('请输入 1–180 分钟');timerRemaining=minutes*60000}timerEnd=Date.now()+timerRemaining}tick()};$('#timer-reset').onclick=()=>{timerEnd=null;timerRemaining=0;tick()};
  }
}

// 照片图库：三列照片墙、年月浏览、搜索、收藏、选择和大图预览。
const demoPhotos=[
  ['绿丘与蓝天','春日草地'],['雪山湖泊','山间旅行'],['金色沙丘','沙漠日落'],['薰衣草花田','夏日花园'],['森林晨光','林间散步'],['海边石拱','海岸假期'],['极光雪夜','冬日夜空'],['秋日湖畔','秋天树叶'],['山谷瀑布','溪流森林'],['雏菊草地','晴天花朵'],['海岸暮色','蓝色时刻'],['高山碧湖','湖畔松林']
].map(([title,subtitle],i)=>({id:'landscape-'+i,title,subtitle,tile:i,date:`${new Date().getFullYear()}-${String([4,2,6,7,5,8,1,10,9,4,8,6][i]).padStart(2,'0')}-${String(10+i).padStart(2,'0')}`}));
let favoritePhotos=readJSON('photo-favorites',[]);if(!Array.isArray(favoritePhotos))favoritePhotos=[];
let photoMode='全部',photoOnlyFavorites=false,photoSelecting=false,photoSearch='',selectedPhotos=new Set();
function atlasStyle(photo){return `background-image:url('assets/landscapes.png');background-size:300% 400%;background-position:${photo.tile%3*50}% ${Math.floor(photo.tile/3)*100/3}%`}
function filteredPhotos(){return demoPhotos.filter(p=>(!photoOnlyFavorites||favoritePhotos.includes(p.id))&&(!photoSearch||(p.title+p.subtitle+p.date).includes(photoSearch)))}
function showPhotoLibrary(){
  layout('图库','<div class="library-header"><div><h1>图库</h1><p id="library-caption"></p></div><button id="photo-filter" aria-label="切换全部或收藏照片">☰</button><button id="photo-select">'+(photoSelecting?'完成':'选择')+'</button></div><label class="library-search" id="library-search" hidden><input id="photo-query" placeholder="搜索照片、季节或日期" aria-label="搜索照片"></label><div class="library-grid" id="library-grid"></div><div class="library-count" id="library-count"></div><div class="photo-selection-actions" id="photo-selection-actions" hidden><span id="photo-selection-count"></span><button id="favorite-selection">收藏所选</button></div><nav class="library-bottom" aria-label="照片浏览"><button id="photo-library-home" aria-label="所有照片">▧</button><div class="library-segments">'+['年','月','全部'].map(t=>`<button data-photo-mode="${t}" class="${photoMode===t?'selected':''}">${t}</button>`).join('')+'</div><button id="photo-search-button" aria-label="搜索图库"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M15 15l7 7"/></svg></button></nav>');view.dataset.app='照片图库';
  $('#library-caption').textContent=photoOnlyFavorites?'个人收藏':new Date().getFullYear()+' 年 · 风景精选';$('#photo-filter').classList.toggle('is-active',photoOnlyFavorites);
  $('#photo-query').value=photoSearch;if(photoSearch)$('#library-search').hidden=false;
  function selectionState(){$('#photo-selection-actions').hidden=!photoSelecting;$('#photo-selection-count').textContent='已选 '+selectedPhotos.size+' 张';$('#favorite-selection').disabled=!selectedPhotos.size}
  function tile(photo,large=false){
    const b=document.createElement('button');b.className='library-photo'+(large?' album-cover':'');b.dataset.photo=photo.id;b.setAttribute('aria-label',photo.title);b.style.cssText=atlasStyle(photo);
    if(favoritePhotos.includes(photo.id)){const heart=document.createElement('span');heart.className='photo-favorite-mark';heart.textContent='♥';b.append(heart)}
    if(photoSelecting){const tick=document.createElement('span');tick.className='photo-select-mark'+(selectedPhotos.has(photo.id)?' checked':'');tick.textContent=selectedPhotos.has(photo.id)?'✓':'';b.append(tick);b.setAttribute('aria-pressed',String(selectedPhotos.has(photo.id)))}
    b.onclick=()=>{if(photoSelecting){selectedPhotos.has(photo.id)?selectedPhotos.delete(photo.id):selectedPhotos.add(photo.id);render()}else showPhotoViewer(photo.id)};return b;
  }
  function render(){const list=filteredPhotos(),grid=$('#library-grid');grid.replaceChildren();grid.classList.toggle('album-mode',photoMode!=='全部');
    if(photoMode==='全部')list.forEach(photo=>grid.append(tile(photo)));
    else {const grouped=new Map();list.forEach(photo=>{const key=photoMode==='年'?photo.date.slice(0,4):photo.date.slice(0,7);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(photo)});[...grouped].sort((a,b)=>b[0].localeCompare(a[0])).forEach(([key,photos])=>{const item=document.createElement('section');item.className='photo-album';const cover=tile(photos[0],true);const label=document.createElement('span');label.className='album-label';label.textContent=key.replace('-',' 年 ')+' · '+photos.length+' 张';cover.append(label);cover.onclick=()=>{photoMode='全部';photoSearch=key;showPhotoLibrary()};item.append(cover);grid.append(item)})}
    $('#library-count').textContent=list.length?list.length+' 张照片 · 示例图库':'没有匹配的照片';selectionState();
  }
  render();$('#photo-select').onclick=()=>{photoSelecting=!photoSelecting;selectedPhotos.clear();showPhotoLibrary()};$('#photo-filter').onclick=()=>{photoOnlyFavorites=!photoOnlyFavorites;showPhotoLibrary()};
  $('#photo-search-button').onclick=()=>{$('#library-search').hidden=!$('#library-search').hidden;if(!$('#library-search').hidden)$('#photo-query').focus();else{photoSearch='';$('#photo-query').value='';render()}};
  $('#photo-query').oninput=e=>{photoSearch=e.target.value.trim();render()};
  document.querySelectorAll('[data-photo-mode]').forEach(b=>b.onclick=()=>{photoMode=b.dataset.photoMode;photoSelecting=false;selectedPhotos.clear();showPhotoLibrary()});
  $('#photo-library-home').onclick=()=>{photoMode='全部';photoSearch='';photoOnlyFavorites=false;photoSelecting=false;selectedPhotos.clear();showPhotoLibrary()};
  $('#favorite-selection').onclick=()=>{favoritePhotos=[...new Set([...favoritePhotos,...selectedPhotos])];storage.setItem('photo-favorites',JSON.stringify(favoritePhotos));photoSelecting=false;selectedPhotos.clear();showPhotoLibrary();toast('已加入个人收藏')};
}
function showPhotoViewer(id){
  const libraryScroll=view.scrollTop;view.scrollTop=0;
  const list=filteredPhotos();let index=list.findIndex(p=>p.id===id);if(index<0)return;
  const overlay=document.createElement('div');overlay.className='native-photo-viewer';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','照片预览');
  overlay.innerHTML='<div class="photo-viewer-top"><button id="photo-viewer-close" aria-label="关闭照片">‹ 图库</button><div><b id="photo-viewer-title"></b><small id="photo-viewer-date"></small></div></div><div class="photo-viewer-image" id="photo-viewer-image" role="img"></div><div class="photo-viewer-actions"><button id="photo-previous" aria-label="上一张照片">‹</button><button id="photo-like" aria-label="收藏照片">♡</button><button id="photo-zoom" aria-label="放大照片">⊕</button><button id="photo-next" aria-label="下一张照片">›</button></div>';
  view.append(overlay);let zoom=false;
  function render(){const photo=list[index];$('#photo-viewer-title').textContent=photo.title;$('#photo-viewer-date').textContent=photo.date;$('#photo-viewer-image').style.cssText=atlasStyle(photo);$('#photo-viewer-image').setAttribute('aria-label',photo.title);$('#photo-like').textContent=favoritePhotos.includes(photo.id)?'♥':'♡';$('#photo-like').setAttribute('aria-pressed',String(favoritePhotos.includes(photo.id)));$('#photo-previous').disabled=index===0;$('#photo-next').disabled=index===list.length-1;zoom=false;$('#photo-viewer-image').classList.remove('zoomed');$('#photo-zoom').setAttribute('aria-pressed','false')}
  $('#photo-viewer-close').onclick=()=>{overlay.remove();showPhotoLibrary();view.scrollTop=libraryScroll};$('#photo-previous').onclick=()=>{if(index>0){index--;render()}};$('#photo-next').onclick=()=>{if(index<list.length-1){index++;render()}};
  $('#photo-like').onclick=()=>{const photo=list[index];favoritePhotos=favoritePhotos.includes(photo.id)?favoritePhotos.filter(id=>id!==photo.id):[...favoritePhotos,photo.id];storage.setItem('photo-favorites',JSON.stringify(favoritePhotos));$('#photo-like').textContent=favoritePhotos.includes(photo.id)?'♥':'♡';$('#photo-like').setAttribute('aria-pressed',String(favoritePhotos.includes(photo.id)))};
  $('#photo-zoom').onclick=()=>{zoom=!zoom;$('#photo-viewer-image').classList.toggle('zoomed',zoom);$('#photo-zoom').setAttribute('aria-pressed',String(zoom))};render();$('#photo-viewer-close').focus();
}
const openBeforeNativeApps=openApp;
openApp=function(name){view.classList.remove('wechat-app');if(name==='信息')return showMessageList();if(name==='时钟')return showClockTab('世界时钟');if(name==='照片')return showPhotoLibrary();openBeforeNativeApps(name)};

// 重新绘制关键系统图标：保留图标的可访问名称和原有点击入口。
function detailedLegacyIcon(name){
  const uid='native-icon-'+(iosIcon.serial=(iosIcon.serial||0)+1);
  const gradient=(id,top,bottom)=>`<linearGradient id="${uid}-${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
  const shell=(top,bottom,body,defs='')=>`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${gradient('bg',top,bottom)}${defs}</defs><rect width="64" height="64" rx="14" fill="url(#${uid}-bg)"/>${body}</svg>`;
  if(name==='信息')return shell('#79eb77','#28c944','<path d="M54 30c0 11-10 19-22 19-4 0-7-.5-10-2l-11 4 3-10c-3-3-5-7-5-11 0-11 10-19 23-19s22 8 22 19z" fill="white"/>');
  if(name==='时钟'){
    const marks=Array.from({length:60},(_,i)=>`<path d="M32 4v${i%5===0?5:2.5}" transform="rotate(${i*6} 32 32)" stroke="${i%5===0?'#444':'#9b9b9b'}" stroke-width="${i%5===0?1.15:.6}"/>`).join('');
    const nums=Array.from({length:12},(_,i)=>{const n=i+1,a=(n*30-90)*Math.PI/180;return `<text x="${32+20*Math.cos(a)}" y="${34.8+20*Math.sin(a)}" text-anchor="middle" font-family="Arial" font-size="7.5" fill="#151515">${n}</text>`}).join('');
    return shell('#fff','#f8f8f8',marks+nums+'<path d="M32 32l-10-4M32 32l17-6" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round"/><path d="M17 33l32-3" stroke="#f4a029" stroke-width=".9"/><circle cx="32" cy="32" r="1.8" fill="#171717"/>');
  }
  if(name==='设置'){
    const points=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2;const r=i%4===0||i%4===3?23:26;points.push(`${32+Math.cos(a)*r},${32+Math.sin(a)*r}`)}
    const spokes=Array.from({length:6},(_,i)=>`<path d="M30 18l2 14 4-14" fill="#d6d8dc" transform="rotate(${i*60} 32 32)"/>`).join('');
    return shell('#bcbec3','#747780',`<circle cx="32" cy="32" r="28" fill="#70737a" stroke="#d7d9df" stroke-width=".6"/><polygon points="${points.join(' ')}" fill="url(#${uid}-gear)" stroke="#f2f3f5" stroke-width=".35"/><circle cx="32" cy="32" r="19" fill="#5b5e66" stroke="#c9ccd2" stroke-width="1.2"/><circle cx="32" cy="32" r="14" fill="#8d9099"/>${spokes}<circle cx="32" cy="32" r="6.3" fill="#5d6069" stroke="#eee" stroke-width="1.1"/>`,gradient('gear','#f0f1f4','#a7aab1'));
  }
  if(name==='相机')return shell('#d7d9df','#a8abb3',`<path fill="#585b64" d="M12 15h9l4-5h15l4 5h8c3 0 4 2 4 5v31H8V20c0-3 1-5 4-5z"/><circle cx="32" cy="34" r="23" fill="#252833" stroke="#7b7e8c" stroke-width="2"/><circle cx="32" cy="34" r="18" fill="url(#${uid}-lens)" stroke="#11141b" stroke-width="2.5"/><circle cx="32" cy="34" r="11" fill="#121827" stroke="#50557e"/><ellipse cx="27" cy="26" rx="6" ry="4" fill="#739df1" opacity=".8" transform="rotate(-25 27 26)"/><ellipse cx="37" cy="42" rx="5" ry="3" fill="#59428f" opacity=".8"/><circle cx="50" cy="20" r="2" fill="#f4d9a9"/>`,`<radialGradient id="${uid}-lens"><stop stop-color="#254972"/><stop offset=".45" stop-color="#24334f"/><stop offset=".7" stop-color="#696b9e"/><stop offset="1" stop-color="#1a1d2c"/></radialGradient>`);
  if(name==='照片')return shell('#fff','#fafafa',Array.from({length:8},(_,i)=>`<ellipse cx="32" cy="19.5" rx="8" ry="13" transform="rotate(${i*45} 32 32)" fill="${['#ffa72b','#ffd432','#99cf48','#40bf9d','#4aace0','#777ad9','#c15dc3','#f06489'][i]}" fill-opacity=".78"/>`).join(''));
  if(name==='备忘录')return shell('#fff','#f5f5f5','<path d="M0 14Q0 0 14 0h36q14 0 14 14v5H0z" fill="url(#'+uid+'-yellow)"/><path d="M0 21h64" stroke="#c5c5c5" stroke-dasharray="1.5 1.5" stroke-width="1"/><path d="M9 33h46M9 44h46M9 55h46" stroke="#bfc0c2" stroke-width="1.1"/>',gradient('yellow','#ffe76a','#f8cd30'));
  if(name==='健康')return shell('#fff','#f6f6f7',`<path d="M32 45L19 33C3 18 24 8 32 21c8-13 29-3 13 12z" fill="url(#${uid}-heart)"/>`,gradient('heart','#ed3c91','#ef2f39'));
  let old=classicIosIcon(name);
  // 保留其它图标的熟悉轮廓，同时统一光泽与边缘。
  return old.replace('</svg>','<path d="M14 .5h36Q63.5.5 63.5 14" fill="none" stroke="white" stroke-opacity=".3" stroke-width=".8"/></svg>');
}

// 锁屏密码仅用于本地模拟，不作为真实设备安全机制。
let phoneLocked=false,passcodeValue='',passcodePending=false,passcodeTimeout=null;
function lockInert(locked){for(const selector of ['#home-pages','#dock','.dots','#app-view'])$(selector).inert=locked;$('#home').setAttribute('aria-label',locked?'上滑输入锁屏密码':'返回主屏幕')}
function lockPhone(){
  document.querySelectorAll('.locked-camera').forEach(el=>el.remove());
  clearTimeout(passcodeTimeout);phoneLocked=true;passcodeValue='';passcodePending=false;clearInterval(clockTimer);
  $('#screen').classList.add('phone-locked');$('#screen').classList.remove('in-app');$('#app-view').classList.remove('open');$('#lock').classList.add('open');$('#lock-face').hidden=false;$('#passcode-panel').hidden=true;$('#lock').classList.remove('showing-passcode','lock-camera-open');$('#home').style.color='white';lockInert(true);updateTime();
}
function showPasscode(){if(!phoneLocked)return;document.querySelectorAll('.locked-camera').forEach(el=>el.remove());$('#lock-face').hidden=true;$('#passcode-panel').hidden=false;$('#lock').classList.add('showing-passcode');passcodeValue='';passcodePending=false;clearTimeout(passcodeTimeout);$('#passcode-status').textContent='输入四位密码以解锁';renderPasscode()}
function renderPasscode(){document.querySelectorAll('#passcode-dots span').forEach((dot,i)=>dot.classList.toggle('filled',i<passcodeValue.length));$('#passcode-dots').setAttribute('aria-label','已输入'+passcodeValue.length+'位密码')}
function enterPasscode(digit){
  if(!phoneLocked||$('#passcode-panel').hidden||passcodePending||passcodeValue.length>=4)return;
  passcodeValue+=digit;renderPasscode();
  if(passcodeValue.length===4){passcodePending=true;passcodeTimeout=setTimeout(()=>{
    if(passcodeValue==='1228'){phoneLocked=false;passcodeValue='';passcodePending=false;$('#screen').classList.remove('phone-locked');$('#lock').classList.remove('open','showing-passcode');$('#passcode-panel').hidden=true;lockInert(false);home()}
    else{passcodeValue='';passcodePending=false;$('#passcode-status').textContent='密码不正确，请重试';$('#passcode-dots').classList.remove('wrong');void $('#passcode-dots').offsetWidth;$('#passcode-dots').classList.add('wrong');renderPasscode()}
  },180)}
}
$('#passcode-keypad').innerHTML=[1,2,3,4,5,6,7,8,9,'',0,''].map(n=>n===''?'<span></span>':`<button data-passcode="${n}" aria-label="密码数字${n}"><b>${n}</b><small>${({2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ'})[n]||' '}</small></button>`).join('');
document.querySelectorAll('[data-passcode]').forEach(b=>b.onclick=()=>enterPasscode(b.dataset.passcode));
$('#passcode-delete').onclick=()=>{if(!passcodePending){passcodeValue=passcodeValue.slice(0,-1);renderPasscode()}};
$('#passcode-cancel').onclick=()=>{clearTimeout(passcodeTimeout);passcodePending=false;passcodeValue='';$('#passcode-panel').hidden=true;$('#lock-face').hidden=false;$('#lock').classList.remove('showing-passcode')};
document.addEventListener('keydown',e=>{if(!phoneLocked||$('#passcode-panel').hidden)return;if(/^\d$/.test(e.key)){e.preventDefault();e.stopImmediatePropagation();enterPasscode(e.key)}else if(e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();$('#passcode-delete').click()}else if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();$('#passcode-cancel').click()}},true);
$('#lock-flashlight').onclick=()=>{const on=$('#lock-flashlight').getAttribute('aria-pressed')!=='true';$('#lock-flashlight').setAttribute('aria-pressed',String(on));$('#lock-flashlight').classList.toggle('on',on);$('#lock').classList.toggle('flashlight-on',on)};
$('#lock-camera').onclick=()=>{
  const overlay=document.createElement('div');overlay.className='locked-camera';overlay.innerHTML='<button class="locked-camera-close" aria-label="返回锁屏">‹ 返回锁屏</button><div class="locked-camera-preview">相机预览<small>锁屏模拟拍照 · 不访问相册</small></div><button class="shutter" aria-label="锁屏拍照"></button>';
  $('#lock').append(overlay);overlay.querySelector('.locked-camera-close').onclick=()=>overlay.remove();overlay.querySelector('.shutter').onclick=()=>{overlay.classList.add('capture-flash');setTimeout(()=>overlay.classList.remove('capture-flash'),160)};
};

// 底部上滑返回。桌面支持鼠标拖动；触屏保留应用内部正常纵向滚动。
let homeSwipe=null,swipeConsumed=false;
const phoneScreen=$('#screen');
phoneScreen.addEventListener('pointerdown',e=>{
  swipeConsumed=false;homeSwipe=null;
  if(e.button&&e.button!==0)return;
  const rect=phoneScreen.getBoundingClientRect(),fromBottom=e.clientY>rect.bottom-42;
  const isControl=e.target.closest('button,input,textarea,select,a');
  if(phoneLocked){if($('#passcode-panel').hidden&&!isControl)homeSwipe={x:e.clientX,y:e.clientY,bottom:true,locked:true,pointer:e.pointerId};return}
  if(fromBottom||(!e.target.closest('input,textarea,select,a')&&e.pointerType==='mouse'&&!e.target.closest('.native-chat-history,.message-history,.library-grid,.library-search,.photos,.thread-list,#weibo-content,.clock-content'))){homeSwipe={x:e.clientX,y:e.clientY,bottom:fromBottom,locked:false,pointer:e.pointerId}}
},{capture:true});
phoneScreen.addEventListener('pointermove',e=>{if(!homeSwipe||homeSwipe.pointer!==e.pointerId)return;const dy=homeSwipe.y-e.clientY,dx=Math.abs(homeSwipe.x-e.clientX);if(dy>55&&dy>dx*1.4){if(homeSwipe.locked){if(phoneLocked)showPasscode()}else if(!phoneLocked)home();homeSwipe=null;swipeConsumed=e.pointerType==='mouse';setTimeout(()=>swipeConsumed=false,350);if(e.cancelable)e.preventDefault()}},{capture:true});
window.addEventListener('pointerup',()=>homeSwipe=null);window.addEventListener('pointercancel',()=>homeSwipe=null);
phoneScreen.addEventListener('click',e=>{if(swipeConsumed){e.preventDefault();e.stopPropagation()}},true);
// 启动时展示锁屏。上滑或点击提示后输入 1228。
lockPhone();

// 参考图四的经典 iOS 默认图标：纯净形状、渐变底色与统一圆角。
function vectorIosIcon(name){
 const id='ios-classic-'+(iosIcon.serial=(iosIcon.serial||0)+1);
 const gradient=(key,a,b)=>`<linearGradient id="${id}-${key}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
 const draw=(a,b,body,defs='')=>`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${gradient('bg',a,b)}${defs}</defs><rect width="64" height="64" rx="14" fill="url(#${id}-bg)"/>${body}</svg>`;
 if(name==='信息')return draw('#65e775','#23c948','<path fill="#fff" d="M54 30c0 11-10 19-22 19-4 0-7-.5-10-2l-11 4 3-10c-3-3-5-7-5-11 0-11 10-19 23-19s22 8 22 19z"/>');
 if(name==='电话')return draw('#61e873','#22c74b','<path fill="#fff" d="M18 11c-4 0-8 6-7 12 3 15 16 28 30 30 6 1 12-3 12-7l-2-6-11-5-5 6c-7-3-12-8-15-15l6-5-5-10z"/>');
 if(name==='相机')return draw('#e0e0e2','#aaaab0','<path d="M9 20h12l4-6h14l4 6h12v30H9z" fill="#353538"/><rect x="11" y="22" width="42" height="26" rx="3" fill="#3f3f42"/><circle cx="32" cy="35" r="13" fill="#9d9da2"/><circle cx="32" cy="35" r="10.5" fill="#1c1d23"/><circle cx="32" cy="35" r="7.3" fill="#28384e"/><circle cx="32" cy="35" r="4.2" fill="#17202d"/><ellipse cx="29" cy="32" rx="2.5" ry="1.5" fill="#688cb7"/><circle cx="48" cy="25" r="2" fill="#f2d879"/><rect x="13" y="16" width="7" height="3" rx="1" fill="#737378"/>');
 if(name==='照片')return draw('#fff','#fff',Array.from({length:8},(_,i)=>`<ellipse cx="32" cy="19" rx="8.2" ry="13" fill="${['#ffbe2d','#ff8b26','#f35c75','#b975ce','#7e8ede','#70c5d7','#82cd82','#dadc4a'][i]}" fill-opacity=".8" transform="rotate(${i*45} 32 32)"/>`).join(''));
 if(name==='备忘录')return draw('#fff','#f9f9f9',`<path d="M14 0h36q14 0 14 14v5H0v-5Q0 0 14 0" fill="url(#${id}-yellow)"/><path d="M0 21h64" stroke="#c6c6ca" stroke-width="1" stroke-dasharray="1.4 1.4"/><path d="M9 33h46M9 43h46M9 53h46" stroke="#c6c6ca" stroke-width="1"/>`,gradient('yellow','#ffe35d','#ffcc31'));
 if(name==='健康')return draw('#fff','#fff',`<path d="M40 34L29 24C18 13 33 6 40 15c7-9 22-2 11 9z" fill="url(#${id}-heart)"/>`,gradient('heart','#f64784','#ed3048'));
 if(name==='钱包')return draw('#242426','#151517','<rect x="10" y="12" width="44" height="30" rx="4" fill="#c5c6c8"/><rect x="12" y="15" width="40" height="23" rx="2" fill="#5baccb"/><rect x="12" y="20" width="40" height="23" rx="2" fill="#f4bd45"/><rect x="12" y="25" width="40" height="23" rx="2" fill="#ed7351"/><rect x="10" y="33" width="44" height="21" rx="4" fill="#c7c2b7"/><path d="M10 33h12l4 5h12l4-5h12" fill="none" stroke="#f2dfc4" stroke-width="1.5"/>');
 if(name==='地图')return draw('#e6ecd8','#d8e6cc','<path d="M39 0v64" stroke="#8dcae4" stroke-width="22"/><path d="M-4 47L65 12" stroke="white" stroke-width="17"/><path d="M-4 47L65 12" stroke="#fbd56a" stroke-width="8"/><path d="M14 0v64" stroke="white" stroke-width="10"/><path d="M14 0v64" stroke="#b5c2b1" stroke-width="1"/><rect x="5" y="7" width="23" height="15" rx="4" fill="#377bd4" stroke="white" stroke-width="1"/><path d="M6 11h21" stroke="#ee5456" stroke-width="2"/><text x="16.5" y="19" text-anchor="middle" font-family="Arial" font-size="8" font-weight="700" fill="white">280</text><path d="M38 29L26 56l12-5 12 5z" fill="#267df5" stroke="white" stroke-width="2"/>');
 if(name==='Safari')return draw('#fff','#fff',`<circle cx="32" cy="32" r="27.5" fill="url(#${id}-blue)"/>`+Array.from({length:60},(_,i)=>`<path d="M32 6v${i%5===0?4.5:2.5}" transform="rotate(${i*6} 32 32)" stroke="white" stroke-width="${i%5===0?1.1:.6}"/>`).join('')+'<path d="M45 15L36 36 19 49l9-21z" fill="white"/><path d="M45 15L36 36l-8-8z" fill="#f1414c"/>',gradient('blue','#46c4ed','#0079de'));
 if(name==='音乐')return draw('#ff5c78','#fa244b','<path fill="white" d="M27 18v25c-12-3-18 11-6 12 6 0 10-4 10-9V28l17-4v15c-12-2-17 11-6 12 7 0 10-4 10-9V12z"/>');
 if(name==='天气')return draw('#219af1','#0879de','<circle cx="24" cy="23" r="12.5" fill="#ffd538"/><path d="M13 48a10 10 0 010-20 14 14 0 0125-4 12 12 0 1110 24z" fill="white"/>');
 if(name==='时钟')return detailedLegacyIcon(name);
 if(name==='设置'){
  const teeth=Array.from({length:112},(_,i)=>{const a=i/112*Math.PI*2,r=(i%4===0||i%4===3)?24:26;return `${32+r*Math.cos(a)},${32+r*Math.sin(a)}`}).join(' ');
  return draw('#c7c7cc','#8d8e94',`<circle cx="32" cy="32" r="28.5" fill="#55575b"/><polygon points="${teeth}" fill="url(#${id}-metal)"/><circle cx="32" cy="32" r="20" fill="#5c5d61" stroke="#bdbdc1" stroke-width="1.5"/><circle cx="32" cy="32" r="15.2" fill="#9a9ba1"/>`+Array.from({length:6},(_,i)=>`<path d="M30 18l2 14 4-14" fill="#dedee1" transform="rotate(${i*60} 32 32)"/>`).join('')+'<circle cx="32" cy="32" r="6" fill="#5b5c62" stroke="#e0e0e3" stroke-width="1.2"/>',gradient('metal','#ededf0','#b0b0b6'));
 }
 return detailedLegacyIcon(name);
}
// 部分触屏浏览器在一次上滑之后会省略首个 click，密码键使用 touch pointerup 直接响应。
document.querySelectorAll('#passcode-keypad button,#passcode-cancel,#passcode-delete').forEach(button=>{
 const activate=button.onclick;let lastTouch=-Infinity;
 button.addEventListener('pointerup',event=>{if(event.pointerType==='touch'){event.preventDefault();lastTouch=performance.now();activate.call(button,event)}});
 button.onclick=event=>{if(event.detail!==0&&performance.now()-lastTouch<500)return;activate.call(button,event)};
});

// 直接展示用户上传的原图图标；SVG 视窗仅做浏览器裁切，原素材保持不变。
function iosIcon(name){
 const icons={
  'Google Maps':['Google Maps icon.jpg',317,344,41,30,192,192],
  'Gmail':['Gmail icon.jpg',266,263,33,16,192,192],
  'Instagram':['Instagram & Weibo icon.jpg',522,304,29,49,193,193],
  'Weibo':['Instagram & Weibo icon.jpg',522,304,302,49,192,193],
  '相机':['Camera icon.jpg',244,216,14,28,192,188],
  '时钟':['Clock icon.jpg',226,278,11,34,193,193],
  '信息':['Messages icon.jpg',275,308,41,46,192,193],
  '健康':['Health icon.jpg',307,312,46,51,192,192],
  '音乐':['Music icon.jpg',340,334,85,45,193,193],
  '备忘录':['Notes icon.jpg',291,324,40,62,192,192],
  '天气':['Weather icon.jpg',231,264,18,21,192,192],
  '钱包':['Wallet icon.jpg',296,260,27,17,192,192],
  '设置':['Settings icon.jpg',320,302,45,34,192,192],
  '微信':['WeChat icon.jpg',257,308,20,43,192,192],
  'Safari':['Safari icon.jpg',271,280,35,16,192,192],
  '电话':['Phone icon.jpg',254,294,28,17,192,192],
  '地图':['Maps icon.jpg',248,306,18,51,192,193],
  '照片':['Photo icon.jpg',229,286,21,44,192,193]
 };
 const spec=icons[name];if(!spec)return vectorIosIcon(name);
 const [file,w,h,x,y,cw,ch]=spec;
 return `<svg class="uploaded-app-icon" data-icon-file="${file}" viewBox="${x} ${y} ${cw} ${ch}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><image href="assets/${encodeURIComponent(file)}" x="0" y="0" width="${w}" height="${h}"/></svg>`;
}
function clockTabSymbol(index){const shapes=[
 '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
 '<circle cx="12" cy="13" r="8"/><path d="M12 7v6H8M5 20l-2 2M19 20l2 2M2 5l4-3M18 2l4 3"/>',
 '<circle cx="12" cy="14" r="8"/><path d="M12 10v5M9 2h6M12 2v4M18 6l2-2"/>',
 '<path d="M5 5a9 9 0 11-2 6M5 1v5H1M12 6v7l4 3"/>'
 ];return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${shapes[index]}</svg>`}

// 保留计时逻辑，只补充参考图中的睡眠计划、计次和交互布局。
const clockTabBeforeAssets=showClockTab;
let stopwatchLaps=[];
showClockTab=function(tab){
 clockTabBeforeAssets(tab);
 if(tab==='闹钟'){
  $('#sleep-time').textContent=storage.getItem('sleep-wake-time')||'07:30';
  $('#sleep-change').onclick=()=>{const sheet=document.createElement('form');sheet.className='clock-sheet';sheet.innerHTML='<h3>Sleep | Wake Up</h3><label>起床时间<input id="sleep-input" type="time" value="'+($('#sleep-time').textContent)+'" required></label><button type="submit">保存</button><button type="button" id="sleep-cancel">取消</button>';view.append(sheet);sheet.onsubmit=e=>{e.preventDefault();storage.setItem('sleep-wake-time',$('#sleep-input').value);$('#sleep-time').textContent=$('#sleep-input').value;sheet.remove()};$('#sleep-cancel').onclick=()=>sheet.remove()};
 }else if(tab==='秒表'){
  const laps=document.createElement('div');laps.id='stopwatch-laps';$('.clock-content').append(laps);
  const lapButton=document.createElement('button');lapButton.id='stopwatch-lap';lapButton.textContent='计次';$('.stopwatch-actions').prepend(lapButton);
  function render(){laps.replaceChildren();stopwatchLaps.forEach((ms,i)=>{const row=document.createElement('div');row.className='stopwatch-lap-row';row.textContent='Lap '+(i+1)+'        '+String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+'.'+String(Math.floor(ms/10)%100).padStart(2,'0');laps.prepend(row)})}
  render();lapButton.onclick=()=>{if(!stopwatchStart)return toast('先启动秒表，再记录计次');stopwatchLaps.push(stopwatchElapsed+Date.now()-stopwatchStart);render()};
  const reset=$('#stopwatch-reset').onclick;$('#stopwatch-reset').onclick=()=>{reset();stopwatchLaps=[];render()};
 }
};

// 新应用均为本地模拟，不连接真实账号，不发送网络消息。
const socialDefaults=[{id:'daily',author:'日常记录员',avatar:'日',text:'从未想过，认真热烈这四个字能和我挂钩。把普通的日子过得闪闪发亮。',quote:'你的朋友圈\n的生活着',image:0},{id:'walk',author:'周末去散步',avatar:'周',text:'今天也要记得抬头看看天空。收藏一点沿途的好风景。',image:7}];
let weiboPosts=readJSON('weibo-posts',socialDefaults);if(!Array.isArray(weiboPosts))weiboPosts=[...socialDefaults];
let socialLikes=readJSON('social-likes',{});if(!socialLikes||typeof socialLikes!=='object'||Array.isArray(socialLikes))socialLikes={};
function toggleSocialLike(id){socialLikes[id]=!socialLikes[id];storage.setItem('social-likes',JSON.stringify(socialLikes));return socialLikes[id]}
function showWeibo(tab='Weibo',feed='Follow'){
 layout('Weibo','<div class="weibo-heading"><button id="weibo-calendar" aria-label="每日签到">♧</button><button data-wb-feed="Follow" class="'+(feed==='Follow'?'selected':'')+'">Follow<span>⌄</span></button><button data-wb-feed="For You" class="'+(feed==='For You'?'selected':'')+'">For You</button><button id="weibo-compose" aria-label="发布微博">＋</button></div><div id="weibo-content"></div><nav class="weibo-tabs" aria-label="微博导航">'+['Weibo','Super Group','Discover','Message','Me'].map((t,i)=>`<button data-weibo-tab="${t}" class="${t===tab?'selected':''}"><span>${['⌂','◇','⌕','✉','♙'][i]}</span>${t}</button>`).join('')+'</nav>');view.dataset.app='Weibo';
 document.querySelectorAll('[data-weibo-tab]').forEach(b=>b.onclick=()=>showWeibo(b.dataset.weiboTab));document.querySelectorAll('[data-wb-feed]').forEach(b=>b.onclick=()=>showWeibo(tab,b.dataset.wbFeed));
 $('#weibo-calendar').onclick=()=>{const today=fitnessDate();if(storage.getItem('weibo-checkin')===today)return toast('今天已签到');storage.setItem('weibo-checkin',today);showWeibo(tab,feed);toast('签到成功 · 本地模拟')};
 $('#weibo-compose').onclick=()=>{
  const sheet=document.createElement('form');sheet.className='social-compose';sheet.innerHTML='<div><b>发微博</b><button type="button" id="weibo-compose-cancel">取消</button></div><textarea id="weibo-text" aria-label="微博内容" placeholder="分享你的新鲜事…" maxlength="1000" required></textarea><button type="submit">发布</button>';view.append(sheet);$('#weibo-compose-cancel').onclick=()=>sheet.remove();sheet.onsubmit=e=>{e.preventDefault();const text=$('#weibo-text').value.trim();if(!text)return;weiboPosts.unshift({id:'post-'+Date.now(),author:deviceName(),avatar:'我',text});storage.setItem('weibo-posts',JSON.stringify(weiboPosts));showWeibo();toast('已发布到本地模拟微博')};$('#weibo-text').focus();
 };
 const content=$('#weibo-content');
 if(tab==='Weibo'||tab==='Discover'){
  content.innerHTML=(tab==='Weibo'?'<section class="weibo-checkin"><div>连签 7 天，记录生活<button id="weibo-checkin">'+(storage.getItem('weibo-checkin')===fitnessDate()?'已签到':'签到')+'</button></div><div class="weibo-red-packets">'+Array.from({length:7},(_,i)=>`<span><b>福</b><small>${i+1} 天</small></span>`).join('')+'</div></section>':'<label class="weibo-search"><input id="weibo-search" placeholder="搜索微博内容" aria-label="搜索微博"></label><p class="weibo-hot">热搜 · 今日生活灵感 &nbsp; #日常的小美好#</p>')+'<div id="weibo-feed"></div>';
  if($('#weibo-checkin'))$('#weibo-checkin').onclick=()=>$('#weibo-calendar').click();
  function renderPosts(query=''){
   $('#weibo-feed').replaceChildren();const posts=(feed==='For You'?[...weiboPosts].reverse():weiboPosts).filter(p=>(p.text+p.author).includes(query));
   posts.forEach(post=>{
    const card=document.createElement('article');card.className='weibo-post';
    const header=document.createElement('div');header.className='weibo-post-header';const avatar=document.createElement('span');avatar.className='weibo-avatar';avatar.textContent=post.avatar||'我';const author=document.createElement('div');const name=document.createElement('b');name.textContent=post.author;const time=document.createElement('small');time.textContent='刚刚 · 来自 iPhone 客户端';author.append(name,time);header.append(avatar,author);
    const text=document.createElement('p');text.textContent=post.text;card.append(header,text);
    if(post.quote){const quote=document.createElement('div');quote.className='weibo-quote';quote.textContent=post.quote;card.append(quote)}else if(Number.isInteger(post.image)){const pic=document.createElement('div');pic.className='weibo-post-image';pic.style.cssText=atlasStyle(demoPhotos[post.image]);card.append(pic)}
    const actions=document.createElement('div');actions.className='weibo-post-actions';const repost=document.createElement('button');repost.textContent='↗ Repost';repost.onclick=()=>{storage.setItem('weibo-repost-'+post.id,'true');repost.textContent='✓ 已转发';toast('已保存本地转发记录')};const comment=document.createElement('button');comment.textContent='▤ 评论';comment.onclick=()=>showWeiboComments(post);const like=document.createElement('button');like.textContent=socialLikes['wb-'+post.id]?'♥ 2':'♡ 1';like.classList.toggle('liked',!!socialLikes['wb-'+post.id]);like.onclick=()=>{const on=toggleSocialLike('wb-'+post.id);like.textContent=on?'♥ 2':'♡ 1';like.classList.toggle('liked',on)};actions.append(repost,comment,like);card.append(actions);$('#weibo-feed').append(card);
   });if(!posts.length)$('#weibo-feed').innerHTML='<p class="muted" style="padding:25px">没有找到相关微博</p>';
  }
  renderPosts();if($('#weibo-search'))$('#weibo-search').oninput=e=>renderPosts(e.target.value.trim());
 }else if(tab==='Super Group'){
  content.innerHTML='<section class="social-card"><h3>发现超话</h3><p>日常生活 · 旅行摄影 · 音乐分享</p><button id="weibo-follow">'+(storage.getItem('weibo-group-follow')==='true'?'已关注':'＋ 关注生活超话')+'</button></section>';$('#weibo-follow').onclick=()=>{const on=storage.getItem('weibo-group-follow')!=='true';storage.setItem('weibo-group-follow',String(on));$('#weibo-follow').textContent=on?'已关注':'＋ 关注生活超话'};
 }else if(tab==='Message'){
  content.innerHTML='<section class="social-card"><h3>消息</h3><p>系统通知</p><p class="muted">欢迎来到本地微博模拟器。点赞、评论和发布仅保存在当前浏览器。</p></section>';
 }else{
  content.innerHTML='<section class="social-card"><span class="weibo-avatar">我</span><h3 id="weibo-profile"></h3><p>微博 '+weiboPosts.filter(p=>p.id.startsWith('post-')).length+' &nbsp; · &nbsp; 关注 '+(storage.getItem('weibo-group-follow')==='true'?1:0)+'</p><p class="muted">本地模拟账号</p></section>';$('#weibo-profile').textContent=deviceName();
 }
}
function showWeiboComments(post){
 let comments=readJSON('weibo-comments-'+post.id,[]);if(!Array.isArray(comments))comments=[];
 layout('评论','<div class="social-card"><b id="wb-comment-author"></b><p id="wb-comment-post"></p></div><div id="wb-comments"></div><form class="social-comment-form" id="wb-comment-form"><input id="wb-comment-input" aria-label="微博评论" placeholder="写评论…" maxlength="500" required><button>发送</button></form>');view.dataset.app='Weibo评论';$('#back').textContent='‹ 微博';$('#back').onclick=()=>showWeibo();$('#wb-comment-author').textContent=post.author;$('#wb-comment-post').textContent=post.text;
 function render(){$('#wb-comments').replaceChildren();comments.forEach(c=>{const p=document.createElement('p');p.className='social-card';p.textContent=c;$('#wb-comments').append(p)})}render();$('#wb-comment-form').onsubmit=e=>{e.preventDefault();const t=$('#wb-comment-input').value.trim();if(!t)return;comments.push(t);storage.setItem('weibo-comments-'+post.id,JSON.stringify(comments));render();$('#wb-comment-input').value=''};
}
function showInstagram(){
 layout('Instagram','<h1 class="instagram-title">Instagram</h1><div class="instagram-stories"><span>＋<small>你的快拍</small></span><span>☀<small>周末出游</small></span><span>♡<small>生活日常</small></span></div><div id="instagram-feed"></div>');view.dataset.app='Instagram';
 [0,5,7].forEach((image,i)=>{const card=document.createElement('article');card.className='instagram-post';const title=document.createElement('b');title.textContent=['daily.moments','weekend.walk','little.world'][i];const photo=document.createElement('div');photo.className='instagram-photo';photo.style.cssText=atlasStyle(demoPhotos[image]);const like=document.createElement('button');const key='ig-'+i;like.textContent=socialLikes[key]?'♥ 已赞':'♡ 赞';like.onclick=()=>like.textContent=toggleSocialLike(key)?'♥ 已赞':'♡ 赞';const caption=document.createElement('p');caption.textContent=['把今天的阳光收藏起来。','沿着海岸线，慢慢走。','记录身边的小美好。'][i];card.append(title,photo,like,caption);$('#instagram-feed').append(card)});
}
let localMail=readJSON('gmail-sent',[]);if(!Array.isArray(localMail))localMail=[];
function showGmail(sent=false){
 layout('Gmail','<div class="gmail-heading"><span>☰</span><input id="gmail-search" placeholder="搜索邮件" aria-label="搜索邮件"><span class="gmail-avatar">G</span></div><div class="gmail-folders"><button id="gmail-inbox" class="'+(!sent?'selected':'')+'">收件箱</button><button id="gmail-sent" class="'+(sent?'selected':'')+'">已发送</button></div><div id="gmail-list"></div><button class="gmail-compose" id="gmail-compose">✎ 写邮件</button>');view.dataset.app='Gmail';
 const inbox=[{to:'Google',subject:'欢迎使用 Gmail',body:'这是模拟收件箱。你可以查看邮件，或尝试撰写一封本地邮件。'},{to:'小A',subject:'周末见！',body:'周末十点在公园门口见，记得带相机。'},{to:'旅行清单',subject:'出发之前的小提醒',body:'充电器、外套和一本喜欢的书，都准备好了吗？'}];
 function render(){const q=$('#gmail-search').value.toLowerCase();$('#gmail-list').replaceChildren();(sent?localMail:inbox).filter(m=>(m.to+m.subject+m.body).toLowerCase().includes(q)).forEach(m=>{const row=document.createElement('button');row.className='gmail-row';const avatar=document.createElement('span');avatar.textContent=m.to.slice(0,1);const summary=document.createElement('span');const name=document.createElement('b');name.textContent=m.to;const subject=document.createElement('strong');subject.textContent=m.subject;const body=document.createElement('small');body.textContent=m.body;summary.append(name,subject,body);row.append(avatar,summary);row.onclick=()=>{layout('邮件','<div class="social-card"><h3 id="mail-subject"></h3><p class="muted" id="mail-person"></p><p id="mail-body"></p></div>');view.dataset.app='Gmail';$('#back').textContent='‹ Gmail';$('#back').onclick=()=>showGmail(sent);$('#mail-subject').textContent=m.subject;$('#mail-person').textContent=m.to;$('#mail-body').textContent=m.body};$('#gmail-list').append(row)});if(!$('#gmail-list').children.length)$('#gmail-list').innerHTML='<p class="muted" style="padding:20px">没有邮件</p>'}render();$('#gmail-search').oninput=render;$('#gmail-inbox').onclick=()=>showGmail();$('#gmail-sent').onclick=()=>showGmail(true);
 $('#gmail-compose').onclick=()=>{layout('写邮件','<form id="gmail-form" class="gmail-form"><label>收件人<input id="mail-to" type="email" required placeholder="name@example.com"></label><label>主题<input id="mail-title" required maxlength="120"></label><textarea id="mail-content" aria-label="邮件正文" required placeholder="撰写邮件" maxlength="3000"></textarea><p class="muted">仅保存在本地，不会发送真实邮件。</p><button type="submit">保存到已发送</button></form>');view.dataset.app='Gmail';$('#back').textContent='‹ Gmail';$('#back').onclick=()=>showGmail();$('#gmail-form').onsubmit=e=>{e.preventDefault();localMail.unshift({to:$('#mail-to').value,subject:$('#mail-title').value,body:$('#mail-content').value});storage.setItem('gmail-sent',JSON.stringify(localMail));showGmail(true);toast('已保存本地模拟邮件')}};
}
function showGoogleMaps(query='Pittsburgh'){
 layout('Google Maps','<form class="gm-search" id="gm-search"><span>⌕</span><input id="gm-query" aria-label="搜索地图" placeholder="在这里搜索" maxlength="100"><button>搜索</button></form><div class="gm-map" id="gm-map"><div class="gm-river"></div><span class="gm-street s1">FIFTH AVENUE</span><span class="gm-street s2">LIBERTY AVENUE</span><span class="gm-park">Point State Park</span><div class="gm-pin">●<small id="gm-pin-name"></small></div></div><div class="gm-zoom"><button id="gm-zoom-in" aria-label="放大地图">＋</button><button id="gm-zoom-out" aria-label="缩小地图">−</button></div><div class="gm-location"><b id="gm-location"></b><p>本地示意地图 · 不使用真实定位</p><button id="gm-open">在 Google Maps 中打开 ↗</button></div>');view.dataset.app='Google Maps';$('#gm-query').value=query;$('#gm-pin-name').textContent=query;$('#gm-location').textContent=query;
 $('#gm-search').onsubmit=e=>{e.preventDefault();const q=$('#gm-query').value.trim();if(q)showGoogleMaps(q)};let zoom=1;const update=()=>{$('#gm-map').style.backgroundSize=(54*zoom)+'px '+(54*zoom)+'px'};$('#gm-zoom-in').onclick=()=>{zoom=Math.min(zoom+.2,2);update()};$('#gm-zoom-out').onclick=()=>{zoom=Math.max(zoom-.2,.6);update()};$('#gm-open').onclick=()=>window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query),'_blank','noopener,noreferrer');
}
function showPittsburghWeather(){
 layout('天气','<section class="pittsburgh-weather"><span>Pittsburgh</span><strong>16°</strong><b>Clear</b><small>H:25° &nbsp; L:13°</small></section><div class="weather-forecast-card"><p>今晚晴朗，晚间逐渐转凉。</p><div class="weather-hourly">'+['22','23','00','01','02','03'].map((h,i)=>`<div><span>${h}</span><b>☾</b><strong>${[16,15,15,14,14,13][i]}°</strong></div>`).join('')+'</div></div><p class="weather-data-note">模拟天气 · 不连接真实天气服务</p>');view.dataset.app='天气';
}
const openBeforeUploadedApps=openApp;
openApp=function(name){view.classList.remove('wechat-app');if(name==='Weibo')return showWeibo();if(name==='Instagram')return showInstagram();if(name==='Gmail')return showGmail();if(name==='Google Maps')return showGoogleMaps();if(name==='天气')return showPittsburghWeather();openBeforeUploadedApps(name)};

// 第七版：天气使用固定示例数据，主屏幕与 Chicago 城市保持一致。
const weatherCities=[{id:'chicago',name:'Chicago',cn:'芝加哥',temp:19,condition:'Drizzle',hi:22,lo:16,icon:'☂'},{id:'beijing',name:'Beijing',cn:'北京',temp:23,condition:'Sunny',hi:26,lo:17,icon:'☀'},{id:'pittsburgh',name:'Pittsburgh',cn:'匹兹堡',temp:16,condition:'Clear',hi:25,lo:13,icon:'☾'}];
function showWeatherCity(id='chicago'){
 const city=weatherCities.find(c=>c.id===id)||weatherCities[0];
 layout('天气','<div class="weather-city-content"><section class="weather-city-summary"><h1>'+city.name+'</h1><strong>'+city.temp+'°</strong><b>'+city.condition+'</b><small>H:'+city.hi+'° L:'+city.lo+'°</small></section><section class="conditions-card"><div class="conditions-heading"><span><b>Conditions</b><small id="weather-metric-label">Temperature (°C)</small></span><div>'+['☁','♦','≋'].map((s,i)=>`<button data-weather-metric="${i}" class="${i===0?'selected':''}" aria-label="${['温度','降水','风速'][i]}">${s}</button>`).join('')+'</div></div><div class="weather-hourly weather-detail-hours" id="weather-detail-hours"></div></section><section class="conditions-card weather-days">'+['Today','Wed','Thu','Fri','Sat','Sun','Mon'].map((day,i)=>`<div><span>${day}</span><b>${city.icon}<small>${[75,100,85,70,40,20,30][i]}%</small></b><small>${city.lo-i}°</small><span class="temperature-span"><i style="margin-left:${i*3}%;width:${60-i*4}%"></i></span><strong>${city.hi-i}°</strong></div>`).join('')+'</section><p class="weather-data-note">示例天气 · 不连接实时服务</p></div><nav class="weather-city-nav"><button id="weather-map" aria-label="查看天气地图">▧</button><div>'+weatherCities.map(c=>`<button data-weather-city="${c.id}" aria-label="${c.cn}天气" class="${c.id===city.id?'selected':''}">●</button>`).join('')+'</div><button id="weather-cities" aria-label="城市列表">☷</button></nav>');view.dataset.app='天气城市';
 function hours(metric=0){$('#weather-detail-hours').innerHTML=['Now','22','23','00','01','02'].map((h,i)=>`<div><span>${h}</span><b>${city.icon}</b><small class="rain-chance">${[30,75,40,45,70,80][i]}%</small><strong>${metric===0?(city.temp-(i?1:0))+'°':metric===1?[30,75,40,45,70,80][i]+'%':(8+i)+'km/h'}</strong></div>`).join('');$('#weather-metric-label').textContent=['Temperature (°C)','Precipitation (%)','Wind (km/h)'][metric];document.querySelectorAll('[data-weather-metric]').forEach((b,i)=>b.classList.toggle('selected',i===metric))}hours();document.querySelectorAll('[data-weather-metric]').forEach(b=>b.onclick=()=>hours(+b.dataset.weatherMetric));document.querySelectorAll('[data-weather-city]').forEach(b=>b.onclick=()=>showWeatherCity(b.dataset.weatherCity));
 $('#weather-cities').onclick=()=>{layout('Weather','<div id="weather-city-list"></div>');view.dataset.app='天气城市';$('#back').textContent='‹ 天气';$('#back').onclick=()=>showWeatherCity(id);weatherCities.forEach(c=>{const b=document.createElement('button');b.className='weather-city-tile';b.innerHTML='<span><b>'+c.name+'</b><small>'+c.condition+' · H:'+c.hi+'° L:'+c.lo+'°</small></span><strong>'+c.temp+'°</strong>';b.onclick=()=>showWeatherCity(c.id);$('#weather-city-list').append(b)})};
 $('#weather-map').onclick=()=>{layout('天气地图','<div class="weather-demo-map"><span>Chicago 19°</span><span>Beijing 23°</span><span>Pittsburgh 16°</span></div><p class="weather-data-note">示意地图 · 固定模拟数据</p>');view.dataset.app='天气城市';$('#back').textContent='‹ 天气';$('#back').onclick=()=>showWeatherCity(id)};
}
// 同步主屏幕小组件的示例数值。
$('.weather-wide-temp').textContent='19°';$('.weather-moon').textContent='☂';$('.weather-wide-condition>b').textContent='Drizzle';$('.weather-wide-condition small').textContent='H:22° L:16°';document.querySelectorAll('.weather-wide .weather-hourly>div').forEach((d,i)=>{d.querySelector('b').textContent='☂';d.querySelector('strong').textContent=[19,18,18,18,18,18][i]+'°'});

// 月历：实际日期、农历辅助标签、示例日程及本地添加/编辑。
function localDateKey(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
let calendarEvents=readJSON('calendar-events-v1',null);
if(!Array.isArray(calendarEvents)){const now=new Date();calendarEvents=[{id:'dinner',date:localDateKey(new Date(now.getFullYear(),now.getMonth(),6)),time:'18:30',title:'和哈尼吃晚饭',color:'pink'},{id:'basketball',date:localDateKey(new Date(now.getFullYear(),now.getMonth(),13)),time:'19:00',title:'周五打球',color:'blue'},{id:'weekend',date:localDateKey(new Date(now.getFullYear(),now.getMonth(),21)),time:'10:00',title:'周末散步',color:'blue'}];storage.setItem('calendar-events-v1',JSON.stringify(calendarEvents))}
let calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear(),calendarList=false;
function lunarLabel(d){try{const parts=new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{month:'long',day:'numeric'}).formatToParts(d);const n=+(parts.find(x=>x.type==='day')?.value);if(n===1)return parts.find(x=>x.type==='month')?.value||'初一';const digits=['','一','二','三','四','五','六','七','八','九','十'];return n<=10?'初'+digits[n]:n<20?'十'+digits[n-10]:n===20?'二十':n<30?'廿'+digits[n-20]:'三十'}catch{return ''}}
function showCalendar(){
 const first=new Date(calendarYear,calendarMonth,1),today=localDateKey(new Date());
 layout('日历','<div class="calendar-toolbar"><button id="calendar-years">‹ '+calendarYear+'</button><div><button id="calendar-view" aria-label="切换日程列表">☷</button><button id="calendar-search" aria-label="搜索日程">⌕</button><button id="calendar-add" aria-label="添加日程">＋</button></div></div><div class="calendar-month-heading"><h1>'+first.toLocaleDateString('en-US',{month:'long'})+'</h1><button id="calendar-prev" aria-label="上个月">‹</button><button id="calendar-next" aria-label="下个月">›</button></div><div id="calendar-body"></div><div class="calendar-footer"><button id="calendar-today">Today</button><span>个人日历</span><button id="calendar-agenda">☷ 日程</button></div>');view.dataset.app='日历新版';
 const body=$('#calendar-body');
 if(calendarList){const list=calendarEvents.filter(e=>e.date.startsWith(calendarYear+'-'+String(calendarMonth+1).padStart(2,'0'))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));if(!list.length)body.innerHTML='<p class="calendar-empty">本月没有日程</p>';list.forEach(e=>{const b=document.createElement('button');b.className='calendar-event-row';b.textContent=e.date+' '+e.time+' · '+e.title;b.onclick=()=>editCalendarEvent(e);body.append(b)})}
 else{body.innerHTML='<div class="calendar-weekdays">'+['S','M','T','W','T','F','S'].map(s=>'<span>'+s+'</span>').join('')+'</div><div class="calendar-month-grid" id="calendar-grid"></div>';const days=new Date(calendarYear,calendarMonth+1,0).getDate();for(let i=0;i<first.getDay();i++){const blank=document.createElement('span');blank.className='calendar-day blank';$('#calendar-grid').append(blank)}for(let n=1;n<=days;n++){const d=new Date(calendarYear,calendarMonth,n),key=localDateKey(d);const cell=document.createElement('div');cell.className='calendar-day'+([0,6].includes(d.getDay())?' weekend':'');const date=document.createElement('button');date.className='calendar-date'+(key===today?' today':'');date.innerHTML='<b>'+n+'</b><small>'+lunarLabel(d)+'</small>';date.setAttribute('aria-label',key+' 添加日程');date.onclick=()=>editCalendarEvent(null,key);cell.append(date);calendarEvents.filter(e=>e.date===key).forEach(e=>{const b=document.createElement('button');b.className='calendar-event-chip '+(e.color||'blue');b.textContent=e.title;b.title=e.title;b.onclick=()=>editCalendarEvent(e);cell.append(b)});$('#calendar-grid').append(cell)}}
 function shift(delta){const d=new Date(calendarYear,calendarMonth+delta,1);calendarYear=d.getFullYear();calendarMonth=d.getMonth();showCalendar()}$('#calendar-prev').onclick=()=>shift(-1);$('#calendar-next').onclick=()=>shift(1);$('#calendar-today').onclick=()=>{calendarYear=new Date().getFullYear();calendarMonth=new Date().getMonth();showCalendar()};$('#calendar-view').onclick=$('#calendar-agenda').onclick=()=>{calendarList=!calendarList;showCalendar()};$('#calendar-add').onclick=()=>editCalendarEvent();
 $('#calendar-years').onclick=()=>{layout(String(calendarYear),'<div class="calendar-year-grid" id="calendar-year-grid"></div>');view.dataset.app='日历新版';$('#back').onclick=showCalendar;for(let m=0;m<12;m++){const b=document.createElement('button');b.textContent=(m+1)+' 月';b.onclick=()=>{calendarMonth=m;showCalendar()};$('#calendar-year-grid').append(b)}};
 $('#calendar-search').onclick=()=>{layout('搜索日程','<input id="calendar-query" class="calendar-query" placeholder="输入日程关键词" aria-label="搜索日程"><div id="calendar-results"></div>');view.dataset.app='日历新版';$('#back').onclick=showCalendar;$('#calendar-query').oninput=e=>{$('#calendar-results').replaceChildren();const q=e.target.value.trim();if(!q)return;calendarEvents.filter(event=>event.title.includes(q)).forEach(event=>{const b=document.createElement('button');b.className='calendar-event-row';b.textContent=event.date+' · '+event.title;b.onclick=()=>editCalendarEvent(event);$('#calendar-results').append(b)})}};
}
function editCalendarEvent(event=null,date=localDateKey(new Date())){
 layout(event?'编辑日程':'新建日程','<form id="calendar-event-form" class="native-editor-form"><label>标题<input id="event-title" required maxlength="60"></label><label>日期<input id="event-date" type="date" required></label><label>时间<input id="event-time" type="time" required value="09:00"></label><button type="submit">保存</button>'+(event?'<button id="event-delete" type="button" class="destructive">删除日程</button>':'')+'</form>');view.dataset.app='日历新版';$('#back').textContent='‹ 日历';$('#back').onclick=showCalendar;$('#event-title').value=event?.title||'';$('#event-date').value=event?.date||date;$('#event-time').value=event?.time||'09:00';$('#calendar-event-form').onsubmit=e=>{e.preventDefault();const title=$('#event-title').value.trim();if(!title)return;const updated={id:event?.id||'event-'+Date.now(),title,date:$('#event-date').value,time:$('#event-time').value,color:event?.color||'pink'};calendarEvents=event?calendarEvents.map(x=>x.id===event.id?updated:x):[...calendarEvents,updated];storage.setItem('calendar-events-v1',JSON.stringify(calendarEvents));showCalendar()};if(event)$('#event-delete').onclick=()=>{if(!confirm('删除这条日程吗？'))return;calendarEvents=calendarEvents.filter(x=>x.id!==event.id);storage.setItem('calendar-events-v1',JSON.stringify(calendarEvents));showCalendar()};
}

function referenceCrop(file,x,y,w,h,cls=''){return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><image href="assets/${encodeURIComponent(file)}" width="1179" height="2556"/></svg>`}
function petAvatar(index=0){return index%2?referenceCrop('apple music library.jpg',790,369,330,330,'pet-avatar'):referenceCrop('contacts.jpg',52,385,128,128,'pet-avatar')}
const defaultPhoneContacts=[{id:'a',name:'小A',number:'+1 (312) 555-0101',avatar:0},{id:'honey',name:'哈尼',number:'+1 (312) 555-0102',avatar:1},{id:'friendc',name:'朋友C',number:'+1 (312) 555-0103',avatar:0},{id:'teacher',name:'五小老师',number:'+1 (312) 555-0104',avatar:1}];
let phoneContacts=readJSON('phone-contacts-v1',defaultPhoneContacts);if(!Array.isArray(phoneContacts))phoneContacts=defaultPhoneContacts;
let recentCalls=readJSON('phone-calls-v1',null);if(!Array.isArray(recentCalls)){recentCalls=[{id:'call1',contact:'honey',type:'incoming',date:'今天 18:32'},{id:'call2',contact:'a',type:'outgoing',date:'今天 12:15'},{id:'call3',contact:'teacher',type:'missed',date:'昨天'},{id:'call4',contact:'friendc',type:'incoming',date:'昨天'},{id:'call5',contact:'honey',type:'outgoing',date:'星期一'}];storage.setItem('phone-calls-v1',JSON.stringify(recentCalls))}
let phoneDigits='',phoneTab='Calls',phoneMissed=false;
function phoneShell(tab,html){layout('电话','<div class="phone-app-content">'+html+'</div><nav class="phone-app-tabs">'+[['Calls','◷'],['Contacts','♙'],['Keypad','⠿']].map(([t,i])=>`<button data-phone-tab="${t}" class="${t===tab?'selected':''}"><span>${i}</span>${t}</button>`).join('')+'<button id="phone-search" aria-label="搜索联系人">⌕</button></nav>');view.dataset.app='电话新版';phoneTab=tab;document.querySelectorAll('[data-phone-tab]').forEach(b=>b.onclick=()=>showPhone(b.dataset.phoneTab));$('#phone-search').onclick=()=>{showPhone('Contacts');$('#phone-contact-query').focus()}}
function showPhone(tab='Calls'){
 if(tab==='Keypad'){
  phoneShell(tab,'<input id="number" class="native-phone-number" readonly aria-label="电话号码"><div class="native-phone-keypad">'+['1','2','3','4','5','6','7','8','9','*','0','#'].map(n=>`<button data-num="${n}"><b>${n}</b><small>${({2:'ABC',3:'DEF',4:'GHI',5:'JKL',6:'MNO',7:'PQRS',8:'TUV',9:'WXYZ',0:'+'})[n]||' '}</small></button>`).join('')+'</div><div class="phone-dial-actions"><button id="call" aria-label="拨打模拟电话">☎</button><button id="delete-number" aria-label="删除号码">⌫</button></div>');$('#number').value=phoneDigits;document.querySelectorAll('[data-num]').forEach(b=>b.onclick=()=>{if(phoneDigits.length<22)phoneDigits+=b.dataset.num;$('#number').value=phoneDigits});$('#delete-number').onclick=()=>{$('#number').value=phoneDigits=phoneDigits.slice(0,-1)};$('#call').onclick=()=>{if(!phoneDigits)return toast('请先输入电话号码');const contact=phoneContacts.find(c=>c.number.replace(/\D/g,'')===phoneDigits.replace(/\D/g,''));startSimulatedCall(contact||{name:phoneDigits,number:phoneDigits,avatar:0})};
 }else if(tab==='Contacts'){
  phoneShell(tab,'<div class="native-phone-heading"><span></span><b>Contacts</b><button id="phone-add" aria-label="添加联系人">＋</button></div><div class="my-contact-card">'+petAvatar(0)+'<div><b id="my-contact-name"></b><small>My Card</small></div></div><input class="phone-contact-query" id="phone-contact-query" placeholder="搜索联系人" aria-label="搜索联系人"><div id="phone-contacts"></div>');$('#my-contact-name').textContent=deviceName();
  function render(){const q=$('#phone-contact-query').value.trim();$('#phone-contacts').replaceChildren();phoneContacts.filter(c=>!q||(c.name+c.number).includes(q)).forEach(c=>{const row=document.createElement('button');row.className='native-contact-row';const avatar=document.createElement('span');avatar.innerHTML=petAvatar(c.avatar);const name=document.createElement('b');name.textContent=c.name;row.append(avatar,name);row.onclick=()=>showPhoneContact(c);$('#phone-contacts').append(row)})}render();$('#phone-contact-query').oninput=render;$('#phone-add').onclick=()=>{layout('新建联系人','<form id="phone-contact-form" class="native-editor-form"><label>姓名<input id="contact-name" required maxlength="30"></label><label>电话号码<input id="contact-number" type="tel" required maxlength="25"></label><button>保存</button></form>');view.dataset.app='电话新版';$('#back').textContent='‹ Contacts';$('#back').onclick=()=>showPhone('Contacts');$('#phone-contact-form').onsubmit=e=>{e.preventDefault();const name=$('#contact-name').value.trim(),number=$('#contact-number').value.trim();if(!name||!number)return;phoneContacts.push({id:'contact-'+Date.now(),name,number,avatar:phoneContacts.length%2});storage.setItem('phone-contacts-v1',JSON.stringify(phoneContacts));showPhone('Contacts')}};
 }else{
  phoneShell('Calls','<div class="native-phone-heading"><button id="phone-edit">Edit</button><b>Calls</b><button id="phone-filter" aria-label="切换未接来电">☰</button></div><div id="native-recent-calls"></div>');let editing=false;
  function render(){const list=$('#native-recent-calls');list.replaceChildren();recentCalls.filter(c=>!phoneMissed||c.type==='missed').forEach(call=>{const c=phoneContacts.find(c=>c.id===call.contact)||{name:call.number||'未知联系人',number:call.number,avatar:0};const row=document.createElement('div');row.className='native-call-row';const avatar=document.createElement('span');avatar.innerHTML=petAvatar(c.avatar);const detail=document.createElement('button');detail.className='call-detail';const name=document.createElement('b');name.textContent=c.name;name.classList.toggle('missed',call.type==='missed');const sub=document.createElement('small');sub.textContent=({incoming:'↙ 接听',outgoing:'↗ 拨出',missed:'↙ 未接来电'})[call.type]+' · mobile';detail.append(name,sub);detail.onclick=()=>showPhoneContact(c);const date=document.createElement('span');date.className='call-date';date.textContent=call.date;const action=document.createElement('button');action.className='recent-call-action';action.textContent=editing?'−':'☎';action.setAttribute('aria-label',editing?'删除通话记录':'回拨'+c.name);action.onclick=()=>{if(editing){recentCalls=recentCalls.filter(x=>x.id!==call.id);storage.setItem('phone-calls-v1',JSON.stringify(recentCalls));render()}else startSimulatedCall(c)};row.append(avatar,detail,date,action);list.append(row)});if(!list.children.length)list.innerHTML='<p class="calendar-empty">没有通话记录</p>'}render();$('#phone-edit').onclick=()=>{editing=!editing;$('#phone-edit').textContent=editing?'Done':'Edit';render()};$('#phone-filter').onclick=()=>{phoneMissed=!phoneMissed;$('#phone-filter').classList.toggle('selected',phoneMissed);render()};
 }
}
function showPhoneContact(c){phoneShell('Contacts','<section class="phone-contact-detail">'+petAvatar(c.avatar)+'<h1 id="phone-detail-name"></h1><p id="phone-detail-number"></p><button id="phone-detail-call">☎ 呼叫</button></section>');$('#phone-detail-name').textContent=c.name;$('#phone-detail-number').textContent=c.number;$('#phone-detail-call').onclick=()=>startSimulatedCall(c)}
function startSimulatedCall(c){
 const overlay=document.createElement('section');overlay.className='simulated-call';overlay.setAttribute('aria-label','模拟通话');overlay.innerHTML='<div>'+petAvatar(c.avatar)+'<h1 id="calling-name"></h1><p>正在模拟呼叫…</p><small>不会拨打真实电话</small></div><button id="end-simulated-call" aria-label="挂断模拟电话">☎</button>';view.append(overlay);$('#calling-name').textContent=c.name;recentCalls.unshift({id:'call-'+Date.now(),contact:c.id,number:c.number,type:'outgoing',date:'刚刚'});storage.setItem('phone-calls-v1',JSON.stringify(recentCalls));$('#end-simulated-call').onclick=()=>{overlay.remove();showPhone('Calls')};
}

// 微信多会话：保留文件传输助手的旧记录，新增联系人与群聊。
const wechatPeople=[{id:'honey',name:'哈尼',pet:1,seed:[{out:false,text:'晚上想吃什么？我顺路买菜。'},{out:true,text:'想吃咖喱，回家见～'}]},{id:'coworker',name:'同事A',pet:0,seed:[{out:false,text:'明天的资料我整理好了，早上一起确认一下吧。'}]},{id:'friendc',name:'朋友C',pet:1,seed:[{out:false,text:'周末一起喝咖啡吗？发现了一家新店。'}]},{id:'friday',name:'周五打球群',group:true,seed:[{out:false,text:'朋友C：这周五还是七点，老地方球馆见！'},{out:true,text:'收到，我带球。'},{out:false,text:'同事A：我也来，打完一起吃饭～'}]},{id:'assistant',name:'文件传输助手',assistant:true,seed:[]}];
let wechatThreads=readJSON('wechat-threads-v2',{});if(!wechatThreads||Array.isArray(wechatThreads)||typeof wechatThreads!=='object')wechatThreads={};wechatPeople.forEach(c=>{if(!Array.isArray(wechatThreads[c.id]))wechatThreads[c.id]=c.assistant?wechatHistory.map(text=>({out:true,text})):c.seed.map(x=>({...x}));});storage.setItem('wechat-threads-v2',JSON.stringify(wechatThreads));
function wechatAvatar(c){return c.assistant?iosIcon('微信'):c.group?'<span class="wechat-group-avatar">'+[0,1,1,0].map(i=>petAvatar(i)).join('')+'</span>':petAvatar(c.pet)}
const oldWeChatPages=showWeChat;
showWeChat=function(tab='微信'){
 if(!['微信','通讯录'].includes(tab))return oldWeChatPages(tab);
 layout('WeChat','<div class="wechat-native-heading"><b>'+(tab==='微信'?'WeChat':'通讯录')+'</b><button id="wechat-plus" aria-label="选择联系人发消息">⊕</button></div><input id="wechat-query" class="wechat-query" aria-label="搜索微信联系人" placeholder="⌕ 搜索"><div class="wechat-native-content" id="wechat-native-content"></div><nav class="wechat-native-tabs">'+['微信','通讯录','发现','我'].map((t,i)=>`<button data-wx-tab="${t}" class="${t===tab?'selected':''}"><span>${['●','♧','◎','♙'][i]}</span>${t==='微信'?'WeChat':t}</button>`).join('')+'</nav>');view.dataset.app='微信新版';view.classList.remove('wechat-app');document.querySelectorAll('[data-wx-tab]').forEach(b=>b.onclick=()=>showWeChat(b.dataset.wxTab));$('#wechat-plus').onclick=()=>showWeChat('通讯录');
 function render(){const q=$('#wechat-query').value.trim();$('#wechat-native-content').replaceChildren();wechatPeople.filter(c=>c.name.includes(q)).forEach((c,i)=>{const row=document.createElement('button');row.className='wechat-thread';if(c.assistant)row.id=tab==='微信'?'wx-chat':'wx-person';row.dataset.wxContact=c.id;const avatar=document.createElement('span');avatar.className='wechat-thread-avatar';avatar.innerHTML=wechatAvatar(c);const content=document.createElement('span');content.className='wechat-thread-summary';const name=document.createElement('b');name.textContent=c.name;content.append(name);if(tab==='微信'){const preview=document.createElement('small');preview.textContent=wechatThreads[c.id].at(-1)?.text||'可以在这里保存临时文字';content.append(preview)}const time=document.createElement('small');time.className='wechat-thread-time';time.textContent=tab==='微信'?['22:15','22:03','21:28','20:59','10:24'][i]:'';row.append(avatar,content,time);row.onclick=()=>showWeChatConversation(c.id);$('#wechat-native-content').append(row)})}render();$('#wechat-query').oninput=render;
};
function showWeChatConversation(id='assistant'){
 const c=wechatPeople.find(p=>p.id===id);if(!c)return showWeChat();layout(c.name,'<div class="wechat-chat-title"><button id="wx-back">‹ WeChat</button><b id="wechat-chat-name"></b><span>···</span></div><div class="message-history wx-history" id="wx-history" aria-live="polite"></div><form class="message-form" id="wx-form"><input id="wx-input" aria-label="微信消息" placeholder="输入消息" maxlength="2000" autocomplete="off"><button class="wx-send" type="submit">发送</button></form>');view.dataset.app='微信聊天';view.classList.add('wechat-app');$('#wechat-chat-name').textContent=c.name;$('#wx-back').onclick=()=>showWeChat();
 function append(m){const row=document.createElement('div');row.className='wechat-chat-row'+(m.out?' outgoing':'');const avatar=document.createElement('span');avatar.className='wechat-thread-avatar';avatar.innerHTML=m.out?petAvatar(0):wechatAvatar(c);const text=document.createElement('p');text.className='bubble '+(m.out?'sent':'received');text.textContent=m.text;row.append(avatar,text);$('#wx-history').append(row)}wechatThreads[id].forEach(append);$('#wx-history').scrollTop=$('#wx-history').scrollHeight;$('#wx-form').onsubmit=e=>{e.preventDefault();const t=$('#wx-input').value.trim();if(!t)return;const m={out:true,text:t};wechatThreads[id].push(m);storage.setItem('wechat-threads-v2',JSON.stringify(wechatThreads));if(c.assistant){wechatHistory.push(t);storage.setItem('wechat-messages',JSON.stringify(wechatHistory))}append(m);$('#wx-history').scrollTop=$('#wx-history').scrollHeight;$('#wx-input').value='';$('#wx-input').focus()};
}
showWeChatChat=()=>showWeChatConversation('assistant');

// 音乐统一播放状态：进度独立于应用视图，因此回到主屏幕后仍会继续。
const exampleTrack={title:'Kiss Goodbye',artist:'Wang Leehom',duration:262};
const musicPlayer={playing:false,position:Math.max(0,Math.min(262,Number(storage.getItem('music-position'))||0)),started:0,volume:.35,favorite:storage.getItem('music-favorite')==='true'};
function albumCover(cls=''){return referenceCrop('Apple Music play screen.jpg',72,277,1035,1035,cls)}
function musicPosition(){return Math.min(exampleTrack.duration,musicPlayer.position+(musicPlayer.playing?(performance.now()-musicPlayer.started)/1000:0))}
function formatMusicTime(seconds){seconds=Math.floor(seconds);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
function toggleMusic(){
 const position=musicPosition();musicPlayer.position=position>=exampleTrack.duration?0:position;musicPlayer.playing=!musicPlayer.playing;musicPlayer.started=performance.now();storage.setItem('music-position',String(musicPlayer.position));if(window.musicCtx){if(musicPlayer.playing)musicCtx.resume();else musicCtx.suspend()}updateMusicUI();
}
function seekMusic(position){musicPlayer.position=Math.max(0,Math.min(exampleTrack.duration,position));musicPlayer.started=performance.now();storage.setItem('music-position',String(musicPlayer.position));updateMusicUI()}
function musicMiniPlayer(){return '<div class="music-mini"><button id="music-mini-open">'+albumCover()+'<span><b>Kiss Goodbye</b><small>Wang Leehom</small></span></button><button id="music-mini-play" aria-label="播放或暂停">▶</button></div>'}
function bindMusicMini(){$('#music-mini-open').onclick=showNowPlaying;$('#music-mini-play').onclick=toggleMusic;updateMusicUI()}
function showMusicLibrary(section='Library'){
 layout('音乐','<div class="music-library-scroll"><div class="music-library-heading"><h1>'+section+'</h1><button id="music-library-menu" aria-label="音乐菜单">···</button>'+petAvatar(0)+'</div><div id="music-library-content"></div></div>'+musicMiniPlayer()+'<nav class="music-navigation">'+['Home','New','Radio','Library','Search'].map((t,i)=>`<button data-music-nav="${t}" class="${t===section?'selected':''}"><span>${['⌂','⊞','◉','▣','⌕'][i]}</span>${t}</button>`).join('')+'</nav>');view.dataset.app='音乐资料库';
 const body=$('#music-library-content');
 if(section==='Library'||section==='Home'||section==='New'){
  body.innerHTML='<div class="playlist-grid"><button data-playlist="华语金曲"><span class="playlist-cover chinese">华语<br>金曲<span>♫</span></span><b>华语金曲</b></button><button data-playlist="K-pop"><span class="playlist-cover kpop">K-pop<span>✦</span></span><b>K-pop</b></button></div><div class="music-library-categories">'+['Playlists','Artists','Albums','Songs','TV & Movies','Downloaded'].map((t,i)=>`<button data-library-category="${t}"><span>${['☷','♩','▣','♪','▭','↓'][i]}</span>${t}<b>›</b></button>`).join('')+'</div><h2>Recently Added</h2><button class="recent-album" id="music-recent">'+albumCover()+'<span>Heroes of Earth<small>Wang Leehom</small></span></button>';
  document.querySelectorAll('[data-playlist]').forEach(b=>b.onclick=()=>showMusicPlaylist(b.dataset.playlist));document.querySelectorAll('[data-library-category]').forEach(b=>b.onclick=()=>showMusicCollection(b.dataset.libraryCategory));$('#music-recent').onclick=showNowPlaying;
 }else if(section==='Search'){
  body.innerHTML='<input id="music-search" class="music-search" placeholder="搜索歌曲、艺人或播放列表" aria-label="搜索音乐"><div id="music-search-results"></div>';$('#music-search').oninput=e=>{const q=e.target.value.trim().toLowerCase();$('#music-search-results').replaceChildren();if(!q)return;['华语金曲','K-pop','Kiss Goodbye','Wang Leehom'].filter(t=>t.toLowerCase().includes(q)).forEach(t=>{const b=document.createElement('button');b.className='music-search-row';b.textContent=t;b.onclick=()=>['华语金曲','K-pop'].includes(t)?showMusicPlaylist(t):showNowPlaying();$('#music-search-results').append(b)})};
 }else{
  body.innerHTML='<section class="music-radio-card"><h2>iPhone Radio</h2><p>安静的午后</p><button id="music-synth">试听模拟音效</button><small>合成和弦体验，不是示例歌曲原声。</small></section>';$('#music-synth').onclick=toggleSyntheticAudio;
 }
 document.querySelectorAll('[data-music-nav]').forEach(b=>b.onclick=()=>showMusicLibrary(b.dataset.musicNav));$('#music-library-menu').onclick=()=>toast('已收藏 '+(musicPlayer.favorite?1:0)+' 首歌曲 · 2 个播放列表');bindMusicMini();
}
function showMusicPlaylist(name){
 layout(name,'<div class="music-playlist-detail"><div class="playlist-cover '+(name==='K-pop'?'kpop':'chinese')+'">'+name+'</div><h1 id="playlist-name"></h1><p>示例播放列表 · 1 首歌</p><button id="playlist-play">▶ 播放</button></div><button id="playlist-track" class="playlist-track">'+albumCover()+'<span><b>Kiss Goodbye</b><small>Wang Leehom</small></span><span>4:22</span></button>'+musicMiniPlayer());view.dataset.app='音乐播放列表';$('#back').textContent='‹ Library';$('#back').onclick=()=>showMusicLibrary();$('#playlist-name').textContent=name;$('#playlist-play').onclick=()=>{if(!musicPlayer.playing)toggleMusic();showNowPlaying()};$('#playlist-track').onclick=showNowPlaying;bindMusicMini();
}
function showMusicCollection(category){if(category==='Playlists')return showMusicLibrary();layout(category,'<p class="muted">'+(category==='TV & Movies'?'还没有影片。':'本地示例音乐资料库')+'</p>'+(category!=='TV & Movies'?'<button id="collection-track" class="playlist-track">'+albumCover()+'<span><b>Kiss Goodbye</b><small>Wang Leehom</small></span></button>':''));view.dataset.app='音乐播放列表';$('#back').textContent='‹ Library';$('#back').onclick=()=>showMusicLibrary();if($('#collection-track'))$('#collection-track').onclick=showNowPlaying}
function showNowPlaying(){
 layout('正在播放','<button class="music-player-dismiss" id="music-dismiss" aria-label="返回资料库"></button><div class="now-playing-cover">'+albumCover()+'</div><div class="now-playing-title"><div><h1>Kiss Goodbye</h1><p>Wang Leehom</p></div><button id="music-favorite" aria-label="收藏歌曲">☆</button><button id="music-more" aria-label="播放说明">···</button></div><input id="music-progress" type="range" min="0" max="262" step=".1" value="0" aria-label="歌曲播放进度"><div class="music-time-labels"><span id="music-elapsed"></span><span id="music-remaining"></span></div><div class="music-transport"><button id="music-restart" aria-label="从头播放">◀◀</button><button id="music-play" aria-label="播放或暂停歌曲">▶</button><button id="music-next" aria-label="重新播放示例歌曲">▶▶</button></div><label class="music-volume"><span>◖</span><input id="music-volume" type="range" min="0" max="1" step=".01" aria-label="音量"><span>◗</span></label><div class="music-player-footer"><button id="music-lyrics" aria-label="歌词说明">▤</button><button id="music-output" aria-label="音频输出说明">◎</button><button id="music-queue" aria-label="播放列表">☷</button></div>');view.dataset.app='音乐播放器';$('#music-dismiss').onclick=()=>showMusicLibrary();$('#music-play').onclick=toggleMusic;$('#music-progress').oninput=e=>seekMusic(+e.target.value);$('#music-volume').value=musicPlayer.volume;$('#music-volume').oninput=e=>{musicPlayer.volume=+e.target.value;if(window.syntheticGain)syntheticGain.gain.value=musicPlayer.volume*.08};$('#music-restart').onclick=()=>seekMusic(0);$('#music-next').onclick=()=>{seekMusic(0);toast('当前为单曲示例，已重新开始')};$('#music-favorite').onclick=()=>{musicPlayer.favorite=!musicPlayer.favorite;storage.setItem('music-favorite',String(musicPlayer.favorite));updateMusicUI()};$('#music-more').onclick=()=>toast('封面来自参考图 · 当前模拟播放进度，未加载原曲音频');$('#music-lyrics').onclick=()=>toast('此示例暂未提供歌词');$('#music-output').onclick=()=>toast(window.musicCtx&&musicCtx.state==='running'?'正在输出模拟合成音效':'未加载原曲音频，可在 Radio 中试听合成音效');$('#music-queue').onclick=()=>showMusicPlaylist('华语金曲');updateMusicUI();
}
function toggleSyntheticAudio(){
 const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return toast('此浏览器不支持音效');
 if(!window.musicCtx){window.musicCtx=new AudioCtx();window.syntheticGain=musicCtx.createGain();syntheticGain.gain.value=musicPlayer.volume*.08;syntheticGain.connect(musicCtx.destination);[261.63,329.63,392].forEach(f=>{const o=musicCtx.createOscillator();o.frequency.value=f;o.type='sine';o.connect(syntheticGain);o.start()});toast('模拟音效已开启');return}
 if(musicCtx.state==='running'){musicCtx.suspend();toast('模拟音效已暂停')}else{musicCtx.resume();toast('模拟音效已开启')}
}
function updateMusicUI(){
 const position=musicPosition();if(musicPlayer.playing&&position>=exampleTrack.duration){musicPlayer.position=exampleTrack.duration;musicPlayer.playing=false;if(window.musicCtx)musicCtx.suspend();storage.setItem('music-position',String(musicPlayer.position))}
 if($('#music-progress'))$('#music-progress').value=position;if($('#music-elapsed'))$('#music-elapsed').textContent=formatMusicTime(position);if($('#music-remaining'))$('#music-remaining').textContent='−'+formatMusicTime(exampleTrack.duration-position);
 for(const selector of ['#music-play','#music-mini-play'])if($(selector)){$(selector).textContent=musicPlayer.playing?'Ⅱ':'▶';$(selector).setAttribute('aria-label',musicPlayer.playing?'暂停歌曲':'播放歌曲')}
 if($('#music-favorite')){$('#music-favorite').textContent=musicPlayer.favorite?'★':'☆';$('#music-favorite').setAttribute('aria-pressed',String(musicPlayer.favorite))}
 const island=$('#island-lock'),playing=musicPlayer.playing&&!phoneLocked;island.classList.toggle('music-island',playing);if(playing&&!island.querySelector('.island-album'))island.innerHTML='<span class="island-album">'+albumCover()+'</span><span class="island-equalizer"><i></i><i></i><i></i><i></i><i></i></span>';else if(!playing&&island.firstChild)island.replaceChildren();island.setAttribute('aria-label',playing?'打开正在播放的音乐':'锁定手机屏幕');island.title=playing?'Kiss Goodbye · 点击打开播放器':'点击灵动岛锁屏';
}
$('#island-lock').onclick=()=>{if(musicPlayer.playing&&!phoneLocked)showNowPlaying();else lockPhone()};
const physicalPower=document.createElement('button');physicalPower.id='phone-power';physicalPower.className='physical-power';physicalPower.setAttribute('aria-label','锁定手机');physicalPower.title='锁定手机';physicalPower.onclick=lockPhone;$('.phone').append(physicalPower);
setInterval(updateMusicUI,250);
const openBeforeV7=openApp;
openApp=function(name){view.classList.remove('wechat-app');if(name==='天气')return showWeatherCity('chicago');if(name==='日历')return showCalendar();if(name==='电话')return showPhone('Calls');if(name==='音乐')return showMusicLibrary();if(name==='微信')return showWeChat();openBeforeV7(name)};
