// 每次打开 / 刷新模拟器都开始新的聊天体验，只重置聊天，不影响其它应用。
// 初始内容仍从 chat-data.js / story-data.js 读取，不拼接上一次体验的记录。
(() => {
 const chatKeys=['messages-v1','message-threads-v2','message-read','wechat-messages','wechat-threads-v2','phone-chat-unread-v1','phone-chat-pending-v1','phone-chat-reply-counters-v1'];
 for(const key of chatKeys){try{localStorage.removeItem(key)}catch{}}
 try{sessionStorage.removeItem('phone-chat-proactive-session-v1')}catch{}
 // 浏览器返回到缓存页面也算重新打开，重新建立默认对话与来信规则。
 window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
})();
