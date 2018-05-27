const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')

const moment = require('moment')

const printer = require('./printer')

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
  socket.on('message', data => {
    log.info('message: ', data)
    io.sockets.emit('message', data)

    let p = new printer()
    p.print(
      '吉開菜央 | YOSHIGAI Nao',
      '《Grand Bouquet／いま 一番うつくしいあなたたちへ》',
      10,
      '12:34'
    )
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
