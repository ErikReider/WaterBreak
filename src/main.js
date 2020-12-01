'use strict'
const { app, BrowserWindow, Menu, Tray } = require('electron');

const prod = false;

var force_quit = false;

/**@type {BrowserWindow} */
let overlayWindow;
/**@type {BrowserWindow} */
let settingsWindow;

function createOverlayWindow() {
    if (overlayWindow !== undefined && !overlayWindow.isVisible()) {
        overlayWindow.show();
        return;
    }
    overlayWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        show: false,
        alwaysOnTop: true,
        kiosk: true,
        autoHideMenuBar: true,
        closable: false,
        frame: false,
        fullscreen: prod ? true : false,
        thickFrame: false,
        hasShadow: false,
    });

    overlayWindow.loadFile('./src/settings/settings.html');
    overlayWindow.once('ready-to-show', () => { overlayWindow.show(); overlayWindow.focus(); });
    overlayWindow.on('close', (e) => {
        if (!force_quit) {
            e.preventDefault();
            overlayWindow.hide();
        }
    });
}

function createSettingsWindow() {
    if (settingsWindow !== undefined && !settingsWindow.isVisible()) {
        console.log("eue")
        settingsWindow.show();
        return;
    }
    settingsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
        show: false,
        alwaysOnTop: true,
    });

    settingsWindow.loadFile('./src/settings/settings.html');
    settingsWindow.once('ready-to-show', () => { settingsWindow.show(); settingsWindow.focus(); });
    settingsWindow.on('close', (e) => {
        if (!force_quit) {
            e.preventDefault();
            settingsWindow.hide();
        }
    });
}

function openSettings() {
    createSettingsWindow();
}

let tray = null
app.whenReady().then(() => {
    app.on('before-quit', function (e) {
        if (!force_quit) {
            e.preventDefault();
            if (settingsWindow !== undefined) settingsWindow.hide();
            if (overlayWindow !== undefined) overlayWindow.hide();
        }
    });
    app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
    app.on('activate-with-no-open-windows', function () {
        settingsWindow.show();
    });


    tray = new Tray('./src/assets/icon_256.png')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', type: "normal", click: () => createOverlayWindow() },
        { label: 'Settings', type: "normal", click: () => openSettings() },
        { label: 'Quit', type: "normal", click: () => { force_quit = true; app.quit(); } },
    ]);
    tray.setToolTip('Water Reminder');
    tray.setContextMenu(contextMenu);
});
