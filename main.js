const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('renderer/index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('select-file', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel', extensions: ['xls', 'xlsx'] }]
  });
  return res.filePaths[0];
});

ipcMain.handle('select-folder', async () => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return res.filePaths[0];
});

ipcMain.handle('run-script', (_evt, args) => {
  return new Promise((resolve) => {
    const scriptArgs = ['xlstobtech.js', '-x', args.inputFile];

    if (args.mode === 'push') {
      scriptArgs.push('-p', args.probe, '-s', args.sheet);
    } else {
      scriptArgs.push('-d', args.outputDir);
    }

    const child = spawn('node', scriptArgs, { cwd: __dirname });
    let output = '';

    child.stdout.on('data', data => output += data);
    child.stderr.on('data', data => output += data);
    child.on('close', code => resolve({ code, output }));
  });
});