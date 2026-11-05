// 微信界面增强：排序、统一底栏、发现和朋友圈；继续使用原有聊天存储。
function wechatLineIcon(name) {
 const paths={chat:'<path d="M20.8 11c0 4.5-4 7.7-8.8 7.7-1.2 0-2.4-.2-3.4-.5L4 20l1.2-4C3.8 14.8 3 13 3 11c0-4.4 4-7.8 9-7.8s8.8 3.4 8.8 7.8Z"/>',contacts:'<path d="M15 9a4 4 0 1 0-8 0c0 2 1 3 2 4v2l-6 4v2h17v-2l-6-4v-2c1-1 1-2 1-4ZM19 7h3m-3 4h3m-3 4h3"/>',discover:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.4 5.6L8 16l2.4-5.6Z"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2c0-3 3-5 7-5s7 2 7 5v2Z"/>',heart:'<path d="M12 21 3.8 13C-2 7 6 1 12 7c6-6 14 0 8.2 6Z"/>',comment:'<path d="M3 4h18v13H11l-5 4v-4H3Z"/>',voice:'<circle cx="12" cy="12" r="9"/><path d="M9 8q5 4 0 8m4-11q8 7 0 14"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M7 14q5 6 10 0M8 9h1m6 0h1"/>',plus:'<circle cx="12" cy="12" r="9"/><path d="M7 12h10m-5-5v10"/>'};
 return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+(paths[name]||paths.chat)+'</svg>';
}
function wechatBottomTabs(tab){return '<nav class="wechat-native-tabs" aria-label="微信导航">'+['微信','通讯录','发现','我'].map((t,i)=>'<button data-wx-tab="'+t+'" class="'+(t===tab?'selected':'')+'" aria-current="'+(t===tab?'page':'false')+'"><span>'+wechatLineIcon(['chat','contacts','discover','me'][i])+'</span>'+(t==='微信'?'WeChat':t)+'</button>').join('')+'</nav>'}
function bindWechatTabs(){document.querySelectorAll('[data-wx-tab]').forEach(b=>b.onclick=()=>showWeChat(b.dataset.wxTab))}
function wechatLatestTime(c){return wechatThreads[c.id].reduce((latest,m)=>Math.max(latest,Date.parse(m.at)||0),0)}
function wechatTimeLabel(time){if(!time)return '';const d=new Date(time),today=new Date();return d.toDateString()===today.toDateString()?d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}):d.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})}
showWeChat=function(tab='微信') {
 if(tab==='发现')return showWechatDiscovery();
 if(tab==='我'){
  oldWeChatPages(tab);const tabs=document.querySelector('.wechat-tabs');if(tabs){tabs.outerHTML=wechatBottomTabs(tab);bindWechatTabs()}return;
 }
 layout('WeChat','<div class="wechat-native-heading"><b>'+(tab==='微信'?'WeChat':'通讯录')+'</b><button id="wechat-plus" aria-label="选择联系人发消息">⊕</button></div><input id="wechat-query" class="wechat-query" aria-label="搜索微信联系人" placeholder="⌕ 搜索"><div class="wechat-native-content" id="wechat-native-content"></div>'+wechatBottomTabs(tab));
 view.dataset.app='微信新版';view.dataset.wechatTab=tab;view.classList.remove('wechat-app');bindWechatTabs();$('#wechat-plus').onclick=()=>showWeChat('通讯录');
 function render(){
  const q=$('#wechat-query').value.trim(),people=wechatPeople.filter(c=>c.name.includes(q));
  if(tab==='微信')people.sort((a,b)=>(b.id==='honey')-(a.id==='honey')||wechatLatestTime(b)-wechatLatestTime(a)||wechatPeople.indexOf(a)-wechatPeople.indexOf(b));
  $('#wechat-native-content').replaceChildren();
  people.forEach(c=>{
   const row=document.createElement('button');row.className='wechat-thread'+(tab==='微信'&&c.id==='honey'?' pinned':'');row.dataset.wxContact=c.id;
   if(c.assistant)row.id=tab==='微信'?'wx-chat':'wx-person';
   const avatar=document.createElement('span');avatar.className='wechat-thread-avatar';avatar.innerHTML=wechatAvatar(c);
   const summary=document.createElement('span');summary.className='wechat-thread-summary';const name=document.createElement('b');name.textContent=c.name;summary.append(name);
   if(tab==='微信'){const preview=document.createElement('small');preview.textContent=wechatThreads[c.id].at(-1)?.text||'可以在这里保存临时文字';summary.append(preview)}
   const time=document.createElement('small');time.className='wechat-thread-time';time.textContent=tab==='微信'?wechatTimeLabel(wechatLatestTime(c)):'';row.append(avatar,summary,time);
   if(c.id==='honey'&&tab==='微信')row.setAttribute('aria-label','哈尼，置顶对话');
   const unread=window.PhoneChatEngine?.unread('wechat',c.id)||0;if(unread&&tab==='微信'){const badge=document.createElement('span');badge.className='wechat-unread-count';badge.textContent=unread>99?'99+':unread;row.append(badge)}
   row.onclick=()=>showWeChatConversation(c.id);$('#wechat-native-content').append(row);
  });
 }
 render();$('#wechat-query').oninput=render;
};
function showWechatDiscovery(){
 layout('发现','<div class="wechat-native-heading"><b>发现</b></div><div class="wechat-native-content discovery-content"><button id="wx-moments" class="discovery-row"><span class="moments-flower">✿</span><b>朋友圈</b><span>›</span></button><div class="discovery-row disabled" aria-disabled="true"><span class="discovery-search">⌕</span><b>搜一搜</b><span>›</span></div></div>'+wechatBottomTabs('发现'));
 view.dataset.app='微信发现';view.dataset.wechatTab='发现';bindWechatTabs();$('#wx-moments').onclick=showWechatMoments;
 $('#back').onclick=()=>showWeChat();
}
const wechatMoments=[
 {id:'weekend',name:'朋友C',pet:0,text:'把周末交给阳光和好天气。☀️',photo:0,time:'20分钟前',likes:['小A','五小','林林']},
 {id:'dinner',name:'哈尼',pet:1,text:'下班后的快乐，是和喜欢的人一起逛超市。',time:'1小时前',likes:['朋友C','同事A']},
 {id:'coffee',name:'五小',pet:1,text:'找到一家很不错的小店，周五见！',photo:2,time:'2小时前',likes:['阿橙','小A','五小老师']},
 {id:'walk',name:'同事A',pet:0,text:'今天也认真生活了。晚风很舒服。',photo:3,time:'3小时前',likes:['悠悠','小林']}
];
let momentLikes=readJSON('wechat-moment-likes-v1',{});if(!momentLikes||typeof momentLikes!=='object'||Array.isArray(momentLikes))momentLikes={};
function showWechatMoments(){
 layout('朋友圈','<div class="moments-top"><button id="moments-back" aria-label="返回发现">‹</button><b>朋友圈</b><span aria-hidden="true">▣</span></div><div class="moments-scroll" id="moments-feed"><header class="moments-cover">'+referenceCrop('pengyouquan.jpg',0,160,1179,860)+'<div class="moments-self"><b>我</b><span class="wechat-thread-avatar">'+petAvatar(0)+'</span></div></header><div class="moments-posts"></div></div>');
 view.dataset.app='微信朋友圈';$('#back').onclick=()=>showWeChat('发现');$('#moments-back').onclick=()=>showWeChat('发现');
 wechatMoments.forEach(post=>{
  const article=document.createElement('article');article.className='moment-post';article.dataset.momentId=post.id;
  article.innerHTML='<span class="wechat-thread-avatar">'+petAvatar(post.pet)+'</span><div class="moment-post-body"><b class="moment-author"></b><p class="moment-text"></p>'+(post.photo!==undefined?'<div class="moment-photo"></div>':'')+'<div class="moment-meta"><small></small><div class="moment-action-area"><div class="moment-action-menu" hidden><button class="moment-like"></button><button class="moment-comment" disabled>'+wechatLineIcon('comment')+'评论</button></div><button class="moment-more" aria-label="打开点赞菜单" aria-expanded="false"><svg viewBox="0 0 24 16" aria-hidden="true"><circle cx="8" cy="8" r="2" fill="currentColor"/><circle cx="16" cy="8" r="2" fill="currentColor"/></svg></button></div></div><div class="moment-likes"></div></div>';
  article.querySelector('.moment-author').textContent=post.name;article.querySelector('.moment-text').textContent=post.text;article.querySelector('.moment-meta small').textContent=post.time;
  if(post.photo!==undefined)article.querySelector('.moment-photo').style.backgroundImage=samplePhoto(post.photo);
  const menu=article.querySelector('.moment-action-menu'),more=article.querySelector('.moment-more'),like=article.querySelector('.moment-like'),likes=article.querySelector('.moment-likes');
  function render(){const liked=!!momentLikes[post.id];like.innerHTML=wechatLineIcon('heart')+(liked?'取消':'赞');like.setAttribute('aria-pressed',String(liked));likes.replaceChildren();const names=document.createElement('span');names.textContent=[...post.likes,...(liked?['我']:[])].join('，');likes.innerHTML=wechatLineIcon('heart');likes.append(names)}
  more.onclick=()=>{const opening=menu.hidden;document.querySelectorAll('.moment-action-menu').forEach(m=>m.hidden=true);document.querySelectorAll('.moment-more').forEach(b=>b.setAttribute('aria-expanded','false'));menu.hidden=!opening;more.setAttribute('aria-expanded',String(opening))};
  like.onclick=()=>{momentLikes[post.id]=!momentLikes[post.id];storage.setItem('wechat-moment-likes-v1',JSON.stringify(momentLikes));render();menu.hidden=true;more.setAttribute('aria-expanded','false')};render();$('.moments-posts').append(article);
 });
}
// 装饰已有聊天界面，不替换发送、记录、剧情或自动回复逻辑。
const wechatConversationBeforeStyle=showWeChatConversation;
showWeChatConversation=function(id='assistant'){
 wechatConversationBeforeStyle(id);
 if(view.dataset.app!=='微信聊天')return;
 $('#wx-back').innerHTML='‹';$('#wx-back').setAttribute('aria-label','返回微信');
 const form=$('#wx-form');
 for(const [icon,label] of [['voice','语音'],['smile','表情'],['plus','更多']]){
  const button=document.createElement('button');button.type='button';button.className='wx-composer-tool wx-'+icon;button.innerHTML=wechatLineIcon(icon);button.setAttribute('aria-label',label);button.onclick=()=>toast(label+'功能暂未配置，仍可使用文字聊天');
  if(icon==='voice')form.prepend(button);else form.insertBefore(button,form.querySelector('[type=submit]'));
 }
};
