const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')

const moment = require('moment')

const printer = require('./printer')

let settings = {
  exhibitorName: '吉開菜央 | YOSHIGAI Nao',
  exhibitionTitle:
    '《Grand Bouquet／いま いちばん美しいあなたたちへ》\n“Grand Bouquet”',
  printKey: 'KeyP',
  nextKey: 'KeyN',
  note: '予定時刻の5分前にお越しください。'
}

/**
 * DataStore w/ nedb
 */
const DB_PREFIX = 'yoshigai'
const Datastore = require('nedb')
const path = require('path')
const db = new Datastore({
  autoload: true,
  filename: path.join(
    app.getPath('desktop'),
    DB_PREFIX + '_' + moment().format('YYYYMMDDddd') + '.db'
  ),
  timestampData: true
})
log.debug('nedb: ', db)

function getLatestBook() {
  return db
    .find({})
    .sort({ no: -1 })
    .exec((err, docs) => {
      log.info(docs)
    })
}

function getCurrentNo() {
  log.info('getLatestBook(): ', getLatestBook())
  return 0
}

function getBookableTime() {
  return '00:00'
}

function print() {
  let doc = {
    no: getCurrentNo() + 1
  }
  db.insert(doc, () => {
    log.info('db insert()')
  })
  new printer().print(
    // XXX: Just Debug!!
    settings.exhibitorName,
    settings.exhibitionTitle,
    getCurrentNo(),
    getBookableTime(),
    settings.note
  )
}

/**
 * Internal Server
 */
const HTTP = require('http')
const NodeStatic = require('node-static')
const nodeStaticServer = new NodeStatic.Server(__dirname + '/public', {
  cache: false,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
})
log.debug('nodeStaticServer: ', nodeStaticServer)
const httpServer = HTTP.createServer((request, response) => {
  request
    .addListener('error', err => {
      log.error('HTTP ERROR: ', err)
    })
    .addListener('end', () => {
      nodeStaticServer.serve(request, response)
    })
    .resume()
}).listen(1997)
log.debug('httpServer: ', httpServer)

/**
 * Socket.IO
 */
const socketio = require('socket.io')
const io = socketio.listen(httpServer)
io.sockets.on('connection', socket => {
  log.debug('Socket.IO: ', socket)

  io.sockets.json.emit('settings', settings)
  io.sockets.emit('currentNo', getCurrentNo())
  io.sockets.emit('bookableTime', getBookableTime())

  socket.on('message', data => {
    log.debug('message: ', data)

    switch (data.code) {
    case settings.printKey:
      print()
      break
    case settings.nextKey:
      break
    default:
      break
    }

    io.sockets.emit('message', data)
  })
})

/**
 * Electron
 */
let mainWindow
const psb = powerSaveBlocker.start('prevent-display-sleep')

function createWindow() {
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
    webSecurity: false
  })

  mainWindow.loadURL('http://0.0.0.0:1997/index.html')

  if (!process.env.CI && !(process.env.NODE_ENV === 'production')) {
    // Open the DevTools
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  powerSaveBlocker.stop(psb)
  Electron.session.defaultSession.clearCache(() => {})
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
