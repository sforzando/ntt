const { ipcRenderer } = require('electron')
ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})
window.addEventListener('keyup', e => {
  console.log('code: ', e.code) // like 'keyA'
  ipcRenderer.send('asynchronous-message', e.code)
})
