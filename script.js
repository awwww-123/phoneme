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
$('#apps-second').innerHTML=[['微信'],['计算器'],['Fitness']].map(icon).join('');
let timer,clockTimer;function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',2300)}function home(){$('#screen').classList.remove('in-app');$('#app-view').classList.remove('open');$('#lock').classList.remove('open');$('.home-indicator').style.color='white';clearInterval(clockTimer)}$('#home').onclick=home;$('#reset').onclick=home;document.addEventListener('keydown',e=>{if(e.key==='Escape'||((e.metaKey||e.ctrlKey)&&e.key==='h')){e.preventDefault();home()}});
const names=['暮光紫','海盐蓝','落日粉','苔原绿'],walls=['radial-gradient(ellipse at 10% 0%,#d6cef2,transparent 48%),radial-gradient(ellipse at 94% 62%,#9c70c2,transparent 52%),linear-gradient(160deg,#9e9cd2,#aca2d8 45%,#6b5a9f)','linear-gradient(145deg,#a6d5dd,#83b4c5 40%,#3e7396)','linear-gradient(145deg,#f5d4bc,#e9b8b8 40%,#b67494)','linear-gradient(145deg,#c4d4b9,#9cbba9 40%,#56786c)'];function wallpaper(i){$('#wallpaper').style.background=walls[i];$('#wallpaper-name').textContent=names[i];document.querySelectorAll('.swatch').forEach((b,j)=>b.classList.toggle('active',i===j));storage.setItem('wallpaper',i)}document.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>wallpaper(+b.dataset.wall));wallpaper(Math.max(0,Math.min(3,+storage.getItem('wallpaper')||0)));$('#brightness').oninput=e=>{$('#screen').style.filter=`brightness(${e.target.value}%)`;$('#brightness-value').textContent=e.target.value+'%'};function updateTime(){const d=new Date(),t=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});$('#clock').textContent=t;$('#lock-time').textContent=t;$('#lock-date').textContent=d.toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'});$('#widget-date').textContent=d.getDate();$('#widget-day').textContent=d.toLocaleDateString('zh-CN',{weekday:'long'})}updateTime();setInterval(updateTime,10000);$('#lock-button').onclick=()=>{$('#lock').classList.add('open');updateTime()};$('#unlock').onclick=home;
const view=$('#app-view');function layout(name,html){home();view.scrollTop=0;$('#screen').classList.add('in-app');view.dataset.app=name;view.innerHTML=`<div class="app-top"><button class="back" id="back">‹ 主屏幕</button><span></span></div><h2>${name}</h2>${html}`;view.classList.add('open');$('.home-indicator').style.color='#33283e';$('#back').onclick=home}
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
  layout('信息','<div class="messages-actions"><button id="messages-edit">编辑</button><button id="messages-filter" aria-label="筛选信息">☰</button></div><h1 class="messages-title">信息</h1><div class="thread-list" id="thread-list"></div><div class="messages-bottom"><label class="messages-search"><span>⌕</span><input id="messages-search" aria-label="搜索信息" placeholder="搜索"></label><button id="messages-compose" aria-label="新建信息"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5H5v15h15v-8M10 14l1-4L20 1l3 3-9 9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button></div>');
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
  layout(tab,html+'<nav class="clock-tabs" aria-label="时钟导航">'+['世界时钟','闹钟','秒表','计时器'].map((name,i)=>`<button data-clock-tab="${name}" class="${tab===name?'selected':''}"><span>${['◎','◷','◴','◶'][i]}</span>${name}</button>`).join('')+'</nav>');view.dataset.app='时钟';document.querySelectorAll('[data-clock-tab]').forEach(b=>b.onclick=()=>showClockTab(b.dataset.clockTab));
}
function showWorldClock(){
  clockTab='世界时钟';clockShell('世界时钟','<div class="clock-actions"><button id="clock-edit">编辑</button><button id="clock-format" aria-label="切换12或24小时制">'+(clock24?'24小时':'12小时')+'</button></div><h1 class="clock-title">世界时钟</h1><div id="world-clock-list"></div>');
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
    clockShell(tab,'<h1 class="clock-title">闹钟</h1><p class="clock-hint">模拟闹钟列表，不在后台响铃</p><form id="alarm-form" class="alarm-form"><input id="alarm-time" type="time" value="07:30" aria-label="闹钟时间" required><button type="submit">添加</button></form><div id="alarm-list"></div>');
    const save=()=>storage.setItem('simulator-alarms',JSON.stringify(alarms));
    function render(){const list=$('#alarm-list');list.replaceChildren();alarms.forEach((a,i)=>{const row=document.createElement('div');row.className='alarm-row';const t=document.createElement('span');t.textContent=a.time;const toggle=document.createElement('button');toggle.className='toggle'+(a.on?' on':'');toggle.setAttribute('aria-label','切换'+a.time+'闹钟');toggle.setAttribute('aria-pressed',String(a.on));toggle.onclick=()=>{a.on=!a.on;save();render()};const del=document.createElement('button');del.textContent='删除';del.className='alarm-delete';del.onclick=()=>{alarms.splice(i,1);save();render()};row.append(t,toggle,del);list.append(row)});if(!alarms.length)list.innerHTML='<p class="clock-hint">没有闹钟</p>'}render();$('#alarm-form').onsubmit=e=>{e.preventDefault();alarms.push({time:$('#alarm-time').value,on:true});save();render()};
  }else if(tab==='秒表'){
    clockShell(tab,'<h1 class="clock-title">秒表</h1><div class="stopwatch-digits" id="stopwatch-display"></div><div class="stopwatch-actions"><button id="stopwatch-reset">复位</button><button id="stopwatch-start"></button></div>');
    const tick=()=>{const ms=stopwatchElapsed+(stopwatchStart?Date.now()-stopwatchStart:0);$('#stopwatch-display').textContent=String(Math.floor(ms/60000)).padStart(2,'0')+':'+String(Math.floor(ms/1000)%60).padStart(2,'0')+'.'+String(Math.floor(ms/10)%100).padStart(2,'0');$('#stopwatch-start').textContent=stopwatchStart?'停止':'启动'};tick();clockTimer=setInterval(tick,50);$('#stopwatch-start').onclick=()=>{if(stopwatchStart){stopwatchElapsed+=Date.now()-stopwatchStart;stopwatchStart=null}else stopwatchStart=Date.now();tick()};$('#stopwatch-reset').onclick=()=>{stopwatchElapsed=0;stopwatchStart=null;tick()};
  }else{
    clockShell(tab,'<h1 class="clock-title">计时器</h1><label class="timer-input">时长（分钟）<input id="timer-minutes" type="number" value="5" min="1" max="180" step="1"></label><div class="stopwatch-digits" id="timer-display"></div><div class="stopwatch-actions"><button id="timer-reset">取消</button><button id="timer-start"></button></div>');
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
function iosIcon(name){
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
