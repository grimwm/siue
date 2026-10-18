// Copy button for a newly made key: one click puts the key on the clipboard.
// Without script, or when the browser refuses, the key is selected for a manual copy.
(function () {
  'use strict';
  var button = document.getElementById('copykey');
  var status = document.getElementById('copystatus');
  if (!button || !status) {
    return;
  }
  var key = button.querySelector('code');
  var timer = 0;

  function say(text) {
    status.textContent = text;
    clearTimeout(timer);
    timer = setTimeout(function () {
      status.textContent = '';
    }, 6000);
  }

  function select() {
    var range = document.createRange();
    range.selectNodeContents(key);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function manual() {
    select();
    say('Press ⌘C (Ctrl+C) to copy');
  }

  button.addEventListener('click', function () {
    var text = key.textContent.trim();
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      manual();
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      select();
      say('Copied — paste it into the terminal');
    }, manual);
  });
})();
