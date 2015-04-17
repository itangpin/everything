chrome.app.runtime.onLaunched.addListener(function() {
  var height = chrome.app.window.height;
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 900,
      'height': window.screen.availHeight
    }
  });
});