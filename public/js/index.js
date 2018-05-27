const { ipcRenderer, remote } = require('electron')
const log = require('electron-log')

const sound_ok = document.getElementById('sound_ok')
const sound_ng = document.getElementById('sound_ng')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  log.info(arg)
})

window.addEventListener('keyup', e => {
  log.info('code: ', e.code) // like 'keyA'
  ipcRenderer.send('asynchronous-message', e.code)
  connection.send(e.code)
  sound_ok.currentTime = 0
  sound_ok.play()
})

const connection = new WebSocket('ws://0.0.0.0:8080')
connection.onopen = () => {
  log.info('onopen()')
  connection.send('Ping')
}

connection.onerror = error => {
  log.info('onerror()')
  log.error(error)
}

connection.onmessage = e => {
  log.info('onmessage()')
  log.info(e.data)
}

const currentNo = new Vue({
  el: '#currentNo',
  data: {
    currentNo: 0
  }
})

ipcRenderer.on('update-currentNo', (event, arg) => {
  log.info('update-currentNo()', arg)
  currentNo.currentNo = arg
})

const bookableTime = new Vue({
  el: '#bookableTime',
  data: {
    bookableTime: '00:00'
  }
})

ipcRenderer.on('update-bookableTime', (event, arg) => {
  log.info('update-bookableTime', arg)
  bookableTime.bookableTime = arg
})

const currentTime = new Vue({
  el: '#currentTime',
  data: {
    currentTime: moment().format('HH:mm')
  },
  mounted: function() {
    setInterval(() => {
      currentTime.currentTime = moment().format('HH:mm')
    }, 1000)
  }
})
