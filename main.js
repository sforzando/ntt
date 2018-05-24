const Electron = require('electron')
const HTTP = require('http')
const NodeStatic = require('node-static')

const App = Electron.app
const BrowserWindow = Electron.BrowserWindow

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
  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  mainWindow.loadURL('http://0.0.0.0:1997/main.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
App.on('ready', () => {
  createWindow()
})

App.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
App.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    App.quit()
  }
})
