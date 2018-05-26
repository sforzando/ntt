const { ipcRenderer } = require('electron')
const log = require('electron-log')
// const moment = require('moment')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  log.info(arg)
})

window.addEventListener('keyup', e => {
  log.info('code: ', e.code) // like 'keyA'
  ipcRenderer.send('asynchronous-message', e.code)
})

const currentTime = new Vue({
  el: '#currentTime',
  data: {
    currentTime: moment().format()
  },
  mounted: function() {
    setInterval(() => {
      currentTime.currentTime = moment().format()
    }, 1000)
  }
})
