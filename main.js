let settings = {
  exhibitorName: '吉開菜央 | YOSHIGAI Nao',
  exhibitionTitle:
    '《Grand Bouquet／いま いちばん美しいあなたたちへ》\n“Grand Bouquet”',
  experienceTime: 10,
  file_prefix: 'yoshigai',
  keyNext: 'KeyN',
  keyPrint: 'KeyP',
  keyReprint: 'KeyR',
  lastOrder: '17:45', // = 閉館時刻5分前(ex. 17:55) - experienceTime
  note: '予定時刻の5分前にお越しください。',
  port: 1997
}

let currentNo = 0
let latestNo = 0
let books = []
let bookableTime = ''

const moment = require('moment')
const path = require('path')

const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')
log.transports.console.level = 'silly'
log.transports.file.level = 'debug'
log.transports.file.file = path.join(
  app.getPath('userData'),
  settings.file_prefix + '_' + moment().format('YYYYMMDDddd') + '.txt'
)

const printer = require('./printer')

/**
 * DataStore w/ nedb
 */
// const Datastore = require('nedb')
// const db = new Datastore({
//   autoload: true,
//   filename: path.join(
//     app.getPath('userData'),
//     settings.file_prefix + '_' + moment().format('YYYYMMDDddd') + '.db'
//   ),
//   timestampData: true
// })
// log.silly('nedb:', db)

function getBookableTime() {
  log.silly('getBookableTime()')
  const lastOrder = moment(settings.lastOrder, 'HH:mm')
  const currentTime = moment()
  if (books.length) {
    const latestBook = books[books.length - 1]
    const latestBookedTime = moment(latestBook.bookedTime, 'HH:mm')
    const bookableTime = latestBookedTime.add(
      settings.experienceTime,
      'minutes'
    )
    if (bookableTime.isBefore(lastOrder)) {
      if (bookableTime.isBefore(currentTime)) {
        return currentTime.format('HH:mm')
      } else {
        return bookableTime.format('HH:mm')
      }
    } else {
      return 'CLOSE'
    }
  } else {
    if (currentTime.isBefore(lastOrder)) {
      return currentTime.format('HH:mm')
    } else {
      return 'CLOSE'
    }
  }
}

function book() {
  log.silly('book()')
  bookableTime = getBookableTime()
  if (bookableTime == 'CLOSE') {
    return false
  }
  let book = {
    no: latestNo,
    bookedTime: bookableTime
  }
  books.push(book)
  print(latestNo, bookableTime)
  latestNo += 1
}

function next() {
  log.silly('next()')
  if (currentNo < latestNo) {
    currentNo += 1
  }
}

function print(no = latestNo, bookedTime = bookableTime) {
  log.silly('print():', no, bookedTime)
  new printer().print(
    settings.exhibitorName,
    settings.exhibitionTitle,
    no,
    bookedTime,
    settings.note
  )
}

/**
 * Internal Server
 */
const HTTP = require('http')
const NodeStatic = require('node-static')
const nodeStaticServer = new NodeStatic.Server(
  path.join(__dirname, '/public'),
  {
    cache: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  }
)
log.debug('nodeStaticServer: ', nodeStaticServer)
const httpServer = HTTP.createServer((request, response) => {
  request
    .addListener('error', err => {
      log.error('HTTP ERROR:', err)
    })
    .addListener('end', () => {
      nodeStaticServer.serve(request, response)
    })
    .resume()
}).listen(settings.port)
log.debug('httpServer:', httpServer)

/**
 * Socket.IO
 */
const socketio = require('socket.io')
const io = socketio.listen(httpServer)
io.sockets.on('connection', socket => {
  log.silly('Socket.IO:', socket)

  io.sockets.json.emit('settings', settings)
  update()

  socket.on('message', data => {
    log.silly('message: ', data)

    switch (data.code) {
    case settings.keyPrint:
      book()
      break
    case settings.keyNext:
      next()
      break
    case settings.keyReprint:
      print()
      break
    default:
      break
    }

    io.sockets.emit('message', data)
    update()
  })

  socket.on('update', data => {
    log.debug('update: ', data)
    update()
  })
})

function update() {
  log.silly('update()')
  io.sockets.emit('currentNo', currentNo)
  io.sockets.emit('bookableTime', getBookableTime())
}

/**
 * Electron
 */
let mainWindow
const psb = powerSaveBlocker.start('prevent-display-sleep')
function createWindow() {
  log.silly('createWindow()')
  mainWindow = new BrowserWindow({
    acceptFirstMouse: true,
    allowRunningInsecureContent: true,
    alwaysOnTop: true,
    fullscreen: true,
    width: 1920,
    height: 1080,
    frame: false,
    kiosk: true,
    title: 'Numbered Ticket Terminal',
    webSecurity: false,
    webPreferences: {
      experimentalFeatures: true
    }
  })

  mainWindow.loadURL(`http://0.0.0.0:${settings.port}/index.html`)

  if (!process.env.CI && !(process.env.NODE_ENV === 'production')) {
    // Open the DevTools
    // mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  log.silly('app.on("ready")')
  createWindow()
})

app.on('activate', () => {
  log.silly('app.on("activate")')
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  log.info('---- window-all-closed -----')
  powerSaveBlocker.stop(psb)
  Electron.session.defaultSession.clearCache(() => {})
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
