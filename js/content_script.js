var result = 50;
//alert(result+"from content script");
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction',
  value: result
});
