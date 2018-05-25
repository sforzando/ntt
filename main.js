const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron')
const log = require('electron-log')

const HTTP = require('http')
const NodeStatic = require('node-static')

const file = new NodeStatic.Server(__dirname + '/public')
HTTP.createServer((request, response) => {
  request
    .addListener('end', () => {
      file.serve(request, response)
    })
    .resume()
}).listen(1997, '0.0.0.0')

const psb = powerSaveBlocker.start('prevent-display-sleep')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    acceptFirstMouse: true,
    allowRunningInsecureContent: true,
    alwaysOnTop: true,
    fullscreen: true,
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

ipcMain.on('asynchronous-message', (event, arg) => {
  log.debug(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  log.debug(arg) // prints "ping"
  event.returnValue = 'pong'
})

app.on('window-all-closed', () => {
  powerSaveBlocker.stop(psb)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
