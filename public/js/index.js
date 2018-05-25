const { ipcRenderer } = require('electron')
const log = require('electron-log')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  log.info(arg)
})

window.addEventListener('keyup', e => {
  log.info('code: ', e.code) // like 'keyA'
  ipcRenderer.send('asynchronous-message', e.code)
})
