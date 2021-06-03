const BROWSER = chrome || browser; // polyfill

function saveOptions(e) {
  e.preventDefault();
  BROWSER.storage.sync.set({
    sound: document.querySelector("#sound").checked
  });
}

function restoreOptions() {
  BROWSER.storage.sync.get('sound', ({ sound }) => {
    document.querySelector("#sound").checked = Boolean(sound);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
