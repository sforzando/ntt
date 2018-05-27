/* eslint no-console: 0 */
/* globals io */
/* globals moment */
/* globals Vue */

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

const socketio = io.connect()
socketio.on('connected', name => {
  console.log('socket.io connected: ', name)
})
socketio.on('message', data => {
  console.log('socket.io message: ', data)
})

/**
 * Keyboard Events
 */
window.addEventListener('keyup', e => {
  socketio.json.emit('message', { code: e.code }, response => {
    console.log('socket.io response: ', response)
  })
  play_ok()
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
