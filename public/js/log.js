/* eslint no-console: 0 */
/* globals io */
/* globals moment */
/* globals Vue */

const is_local =
  0 <= ['localhost', '127.0.0.1', '0.0.0.0'].indexOf(window.location.hostname)

/**
 * Socket.IO
 */
const socketio = io.connect()
console.log('socketio:', socketio)
socketio.on('connected', name => {
  console.log('socket.io connected:', name)
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
  currentNo.currentNo = msg
  booksList.currentNo = msg
})
socketio.on('bookableTime', msg => {
  bookableTime.bookableTime = msg
})
socketio.on('books', msg => {
  booksList.books = msg
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
      let now = moment()
      currentTime.currentTime = now.format('HH:mm')
    }, 1000)
  }
})

const booksList = new Vue({
  el: '#books',
  data: {
    currentNo,
    books: []
  }
})
