const MUTE_BUTTON = 'div[role="button"][aria-label][data-is-muted]'
const CAMERA_BUTTON = 'div[role="button"][aria-label*=camera][data-is-muted]'

// types of events
const MICROPHONE = 'microphone'
const CAMERA = 'camera'

const waitUntilElementExists = (DOMSelector, MAX_TIME = 5000) => {
  let timeout = 0

  const waitForContainerElement = (resolve, reject) => {
    const container = document.querySelector(DOMSelector)
    timeout += 100

    if (timeout >= MAX_TIME) reject('Element not found')

    if (!container || container.length === 0) {
      setTimeout(waitForContainerElement.bind(this, resolve, reject), 100)
    } else {
      resolve(container)
    }
  }

  return new Promise((resolve, reject) => {
    waitForContainerElement(resolve, reject);
  })
}

var waitingForMuteButton = false

function waitForMuteButton() {
  if (waitingForMuteButton) {
    return
  }
  waitingForMuteButton = true
  waitUntilElementExists(MUTE_BUTTON)
    .then((el) => {
      waitingForMuteButton = false
      updateMuted()
      watchIsMuted(el)
    })
    .catch((error) => {
      chrome.extension.sendMessage({ message: 'disconnected' })
    })
}

var muted = false

function isMuted() {
  let dataIsMuted = document.querySelector(MUTE_BUTTON)
      .getAttribute('data-is-muted')
  return dataIsMuted == 'true'
}

function updateMuted(newValue) {
  muted = newValue || isMuted()
  chrome.extension.sendMessage({ message: muted ? 'muted' : 'unmuted' })
}

var isMutedObserver

function watchIsMuted(el) {
  if (isMutedObserver) {
    isMutedObserver.disconnect()
  }
  isMutedObserver = new MutationObserver((mutations) => {
    let newValue = mutations[0].target.getAttribute('data-is-muted') == 'true'

    if (newValue != muted) {
      updateMuted(newValue)
    }
  })
  isMutedObserver.observe(el, {
    attributes: true,
    attributeFilter: ['data-is-muted']
  })
}

function watchBodyClass() {
  const bodyClassObserver = new MutationObserver((mutations) => {
    let newClass = mutations[0].target.getAttribute('class')
    if (mutations[0].oldValue != newClass) {
      waitForMuteButton()
    }
  })
  bodyClassObserver.observe(document.querySelector('body'), {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true
  })
}

watchBodyClass()

window.onbeforeunload = (event) => {
  chrome.extension.sendMessage({ message: 'disconnected' })
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    muted = isMuted()
    if (request && request.command && request.command === 'toggle_mute') {
      muted = !muted
      sendKeyboardCommand(MICROPHONE)
    } else if (request && request.command && request.command === 'mute') {
      if (!muted) {
        muted = !muted
        sendKeyboardCommand(MICROPHONE)
      }
    } else if (request && request.command && request.command === 'unmute') {
      if (muted) {
        muted = !muted
        sendKeyboardCommand(MICROPHONE)
      }
    } else if (request && request.command && request.command === 'toggle_camera') {
      sendKeyboardCommand(CAMERA)
    }

    sendResponse({ message: muted ? 'muted' : 'unmuted' });
  })

const microphoneKeydownEvent = new KeyboardEvent('keydown', {
  "key": "d",
  "code": "KeyD",
  "metaKey": true,
  "charCode": 100,
  "keyCode": 100,
  "which": 100
})

const cameraKeydownEvent = new KeyboardEvent('keydown', {
  "key": "e",
  "code": "KeyE",
  "metaKey": true,
  "charCode": 100,
  "keyCode": 100,
  "which": 100
})

function sendKeyboardCommand(typeOfCommand) {
  if (typeOfCommand === MICROPHONE) {
    document.dispatchEvent(microphoneKeydownEvent)
  } else if ((typeOfCommand === CAMERA)) {
    document.dispatchEvent(cameraKeydownEvent)
  }
}