s = document.createElement('script');
s.src = chrome.extension.getURL('scripts/addSac.js');
(document.head || document.documentElement).appendChild(s);

console.log('Content Script cs.js injected properly!');