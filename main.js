const { app, BrowserWindow, Electron, powerSaveBlocker } = require('electron')
const log = require('electron-log')

const moment = require('moment')
const Datastore = require('nedb')
const path = require('path')
const DB_PREFIX = 'yoshigai'
const db = new Datastore({
  autoload: true,
  filename: path.join(
    app.getPath('desktop'),
    DB_PREFIX + '_' + moment().format('YYYYMMDDddd') + '.db'
  ),
  timestampData: true
})
log.debug(db)

const HTTP = require('http')
const NodeStatic = require('node-static')

const server = new NodeStatic.Server(__dirname + '/public', {
  'cache-control': false,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
})
HTTP.createServer((request, response) => {
  request
    .addListener('error', err => {
      log.error(err)
    })
    .addListener('end', () => {
      server.serve(request, response)
    })
    .resume()
}).listen(1997, '0.0.0.0')

const WebSocket = require('ws')
const wss = new WebSocket.Server({
  port: 8080
})
wss.on('connection', ws => {
  ws.on('message', message => {
    log.info('ws.on:', message)
  })
  ws.send('connection()')
})

const psb = powerSaveBlocker.start('prevent-display-sleep')

let mainWindow

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
