/* eslint no-console: 0 */
/* globals io */
/* globals moment */
/* globals Vue */

let settings = {
  printKey: 'KeyP',
  nextKey: 'KeyN'
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
socketio.on('connected', name => {
  console.log('socket.io connected: ', name)
})
socketio.on('message', msg => {
  console.log('socket.io message: ', msg)
})
socketio.on('currentNo', msg => {
  console.log('currentNo: ', msg)
  currentNo.currentNo = msg
})
socketio.on('bookableTime', msg => {
  console.log('bookableTime: ', msg)
  bookableTime.bookableTime = msg
})

/**
 * Keyboard Events
 */
window.addEventListener('keyup', e => {
  switch (e.code) {
  case settings.printKey:
  case settings.nextKey:
    socketio.json.emit('message', { code: e.code }, response => {
      console.log('socket.io response: ', response)
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
    currentNo: 0
  }
})

const bookableTime = new Vue({
  el: '#bookableTime',
  data: {
    bookableTime: '00:00'
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
