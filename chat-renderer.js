// 微信消息内容组件：纯文字、独立引用区域、静态/动态表情包。
// GIF 使用原生 img 播放，不转成静态图片。只允许本项目 assets 下的图片。
window.ChatMessageRenderer = (() => {
  function assetImageURL(source) {
    if (typeof source !== 'string') return null;
    try {
      const url = new URL(source, document.baseURI);
      const assets = new URL('assets/', document.baseURI);
      if (url.origin !== assets.origin || !url.pathname.startsWith(assets.pathname)) return null;
      if (!/\.(png|jpe?g|webp|gif)$/i.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  function append(container, message) {
    container.replaceChildren();
    container.classList.toggle('sticker-bubble', message.type === 'sticker');
    if (message.type === 'sticker') {
      const source = assetImageURL(message.src);
      if (!source) { container.textContent = '[表情包路径无效]'; return; }
      const image = document.createElement('img');
      image.className = 'chat-sticker'; image.src = source; image.alt = message.alt || '表情包';
      image.draggable = false;
      image.addEventListener('error', () => { image.replaceWith(document.createTextNode('[表情包图片未找到]')); }, { once: true });
      image.addEventListener('load', () => {
        const history = container.closest('.message-history');
        if (history && history.scrollHeight - history.scrollTop - history.clientHeight < 220) history.scrollTop = history.scrollHeight;
      });
      container.append(image);
    } else {
      const text = document.createElement('div'); text.className = 'message-body-text'; text.textContent = message.text || '';
      container.append(text);
    }
    if (message.quote) {
      const quote = document.createElement('blockquote'); quote.className = 'wechat-quote';
      quote.setAttribute('aria-label', '引用回复');
      if (message.quote.messageId) quote.dataset.quoteMessageId = message.quote.messageId;
      const author = document.createElement('b'); author.textContent = (message.quote.author || '引用消息') + '：';
      const text = document.createElement('span'); text.textContent = message.quote.text || '';
      quote.append(author, text); container.append(quote);
    }
  }
  return { append, assetImageURL };
})();
