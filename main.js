const { app, BrowserWindow, ipcMain, Electron } = require('electron')
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

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    acceptFirstMouse: true,
    allowRunningInsecureContent: true,
    alwaysOnTop: true,
    // fullscreen: true,
    frame: false,
    // kiosk: true,
    title: 'Numbered Ticket Terminal',
    webSecurity: false
  })
  mainWindow.loadURL('http://0.0.0.0:1997/index.html')

  if (!process.env.CI && !(process.env.NODE_ENV === 'production')) {
    // Open the DevTools
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    Electron.session.defaultSession.clearCache(() => {
      console.log('Electron.session.defaultSession.clearCache()')
    })
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
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
