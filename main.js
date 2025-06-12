const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./server');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  expressApp(); // מפעיל את השרת של וואטסאפ
  createWindow();
});