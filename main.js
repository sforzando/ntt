let currentNo = 0
let books = []

const fs = require('fs')
const moment = require('moment')
const path = require('path')

const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')
log.transports.console.level = 'debug'
log.transports.file.level = 'debug'
log.transports.file.file = path.join(
  app.getPath('userData'),
  'log',
  'ntt_' + moment().format('YYYYMMDDddd') + '.txt'
)

let settings = JSON.parse(
  fs.readFileSync(path.join(app.getPath('desktop'), 'ntt_settings.json'))
)
log.debug('settings:', settings)

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
      return '00:00' // First TEST Book by Navigator Staff
    } else {
      return 'CLOSE'
    }
  }
}

function book() {
  const bookableTime = getBookableTime()
  log.debug(
    'book() -> currentNo:',
    currentNo,
    'books.length:',
    books.length,
    'bookableTime:',
    bookableTime
  )
  if (bookableTime == 'CLOSE') {
    return false
  }
  let book = {
    no: books.length,
    bookedTime: bookableTime
  }
  books.push(book)
  if (moment(bookableTime, 'HH:mm').diff(moment()) < 3500) {
    next()
  }
  log.debug(
    'print() -> no(= books.length - 1):',
    parseInt(books[books.length - 1].no),
    'bookableTime:',
    bookableTime
  )
  print(
    parseInt(books[books.length - 1].no),
    books[books.length - 1].bookedTime
  )
}

function next() {
  log.debug('next()')
  if (books.length) {
    if (currentNo < books[books.length - 1].no) {
      currentNo += 1
    }
  }
}

function print(
  no = parseInt(books[books.length - 1].no),
  bookedTime = books[books.length - 1].bookedTime
) {
  log.silly('print():', no, bookedTime)
  if (process.env.NODE_ENV != 'development') {
    const printer = require('./printer')
    new printer(
      parseInt(settings.printer_vendorID, 16),
      parseInt(settings.printer_productID, 16)
    ).print(
      settings.exhibitorName,
      settings.exhibitionTitle,
      no,
      bookedTime,
      settings.print_note
    )
  } else {
    log.info('No Printer!')
  }
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
      // print()
      break
    default:
      break
    }

    io.sockets.emit('message', data)
    update()
  })

  socket.on('update', data => {
    log.silly('update: ', data)
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
    frame: false,
    kiosk: true,
    title: 'Numbered Ticket Terminal',
    webSecurity: false,
    webPreferences: {
      experimentalFeatures: true
      // nodeIntegration: false
    }
  })

  mainWindow.loadURL(`http://0.0.0.0:${settings.port}/index.html`)

  if (process.env.NODE_ENV == 'development') {
    // Open DevTools
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
