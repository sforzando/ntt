/* eslint no-console: 0 */
/* globals io */
/* globals moment */
/* globals Vue */

let settings = {
  keyPrint: '',
  keyNext: '',
  keyReprint: ''
}

/**
 * Sound Effects
 */
const sound_ok = document.getElementById('sound_ok')
function play_ok() {
  sound_ok.currentTime = 0
  sound_ok.play()
}
const sound_ng = document.getElementById('sound_ng')
function play_ng() {
  sound_ng.currentTime = 0
  sound_ng.play()
}

/**
 * Socket.IO
 */
const socketio = io.connect()
console.log('socketio:', socketio)
socketio.on('connected', name => {
  console.log('socket.io connected:', name)
  socketio.emit('update', 'update', response => {
    console.log('initial update:', response)
  })
})
socketio.on('settings', msg => {
  console.log('socket.io settings:', msg)
  settings = msg
  new Vue({
    el: '#exhibitorName',
    data: {
      exhibitorName: settings.exhibitorName
    }
  })
  new Vue({
    el: '#exhibitionTitle',
    data: {
      exhibitionTitle: settings.exhibitionTitle
    }
  })
})
socketio.on('message', msg => {
  console.log('socket.io message:', msg)
})
socketio.on('currentNo', msg => {
  console.log('currentNo:', msg)
  currentNo.currentNo = msg
})
socketio.on('bookableTime', msg => {
  console.log('bookableTime:', msg)
  bookableTime.bookableTime = msg
})

/**
 * Keyboard Events
 */
window.addEventListener('keyup', e => {
  console.info(e)
  switch (e.code) {
  case settings.keyPrint:
  case settings.keyNext:
  case settings.keyReprint:
    socketio.json.emit('message', { code: e.code }, response => {
      console.log('socket.io response:', response)
    })
    play_ok()
    break
  default:
    play_ng()
    break
  }
})

/**
 * Create Components w/ Vue
 */
const currentNo = new Vue({
  el: '#currentNo',
  data: {
    currentNo: 9999
  }
})

const bookableTime = new Vue({
  el: '#bookableTime',
  data: {
    bookableTime: '99:99'
  }
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
