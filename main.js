let settings = {
  exhibitorName: '吉開菜央 | YOSHIGAI Nao',
  exhibitionTitle:
    '《Grand Bouquet／いま いちばん美しいあなたたちへ》\n“Grand Bouquet”',
  experienceTime: 10,
  file_prefix: 'yoshigai',
  keyNext: 'KeyN',
  keyPrint: 'KeyP',
  keyReprint: 'KeyR',
  lastOrder: '17:45', // = 閉館時刻(ex. 17:55) - experienceTime
  note: '予定時刻の5分前にお越しください。',
  port: 1997
}

let currentNo = 0
let latestNo = 0

const moment = require('moment')
const path = require('path')

const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')
log.transports.file.level = 'silly'
log.transports.file.file = path.join(
  app.getPath('userData'),
  settings.file_prefix + '_' + moment().format('YYYYMMDDddd') + '.txt'
)

const printer = require('./printer')

/**
 * DataStore w/ nedb
 */
const Datastore = require('nedb')
const db = new Datastore({
  autoload: true,
  filename: path.join(
    app.getPath('userData'),
    settings.file_prefix + '_' + moment().format('YYYYMMDDddd') + '.db'
  ),
  timestampData: true
})
// log.debug('nedb:', db)

function getLatestBook() {
  log.silly('getLatestBook()')
  db
    .find({ currentNo: { $exists: false } })
    .sort({ no: -1 })
    .limit(1)
    .exec((err, book) => {
      if (err) log.error('getLatestBook() ERROR:', err)
      if (book == []) return false
      log.info('latestBook:', book)
      return book
    })
}

function getBookableTime() {
  log.silly('getBookableTime()')
  const lastOrder = moment(settings.lastOrder, 'HH:mm')
  const latestBook = getLatestBook()
  if (latestBook) {
    const latestBookedTime = moment(latestBook.bookedTime, 'HH:mm')
    const bookableTime = latestBookedTime.add(
      settings.experienceTime,
      'minutes'
    )
    if (bookableTime.isBefore(moment())) {
      return bookableTime('SOON')
    }
    if (bookableTime.isBefore(lastOrder)) {
      return bookableTime.format('HH:mm')
    } else {
      return 'END'
    }
  }
}

function book() {
  log.silly('book()')
  const bookableTime = getBookableTime()
  if (!bookableTime) {
    return
  }
  let ticket = {
    no: latestNo + 1,
    bookedTime: bookableTime.format('HH:mm')
  }
  db.insert(ticket, () => {
    log.info('nedb.insert():', ticket)
  })
}

function next() {
  log.silly('next()')
  currentNo += 1
}

function print(no, bookedTime) {
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
  // log.debug('Socket.IO:', socket)

  io.sockets.json.emit('settings', settings)
  update()

  socket.on('message', data => {
    log.debug('message: ', data)

    switch (data.code) {
    case settings.keyPrint:
      book()
      print()
      break
    case settings.keyNext:
      next()
      break
    case settings.keyReprint:
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

async function update() {
  log.silly('update()')
  io.sockets.emit('currentNo', currentNo)
  io.sockets.emit('bookableTime', await getBookableTime())
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
    // width: 1920,
    // height: 1080,
    frame: false,
    kiosk: true,
    title: 'Numbered Ticket Terminal',
    webSecurity: false
  })

  mainWindow.loadURL(`http://0.0.0.0:${settings.port}/index.html`)

  if (!process.env.CI && !(process.env.NODE_ENV === 'production')) {
    // Open the DevTools
    mainWindow.webContents.openDevTools()
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
