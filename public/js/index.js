/* eslint no-console: 0 */
/* globals moment */
/* globals Vue */

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

const connection = new WebSocket('ws://0.0.0.0:8080')
connection.onopen = () => {
  connection.send('connection.onopen()')
}

connection.onerror = error => {
  console.error(error)
  play_ng()
}

connection.onmessage = e => {
  console.info(e.data)
}

window.addEventListener('keyup', e => {
  connection.send(e.code)
  play_ok()
})

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
