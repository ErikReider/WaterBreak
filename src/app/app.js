"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const functions_1 = __importDefault(require("../functions/functions"));
const cron = __importStar(require("node-cron"));
// import * as fs from "fs";
// import * as lessToJs from "less-vars-to-js";
const args = process.argv.slice(2);
let prod = true;
let force_quit = false;
let webPreferences;
let overlayWindow;
let settingsWindow;
function createOverlayWindow() {
    if (overlayWindow)
        overlayWindow.hide();
    overlayWindow = new electron_1.BrowserWindow({
        webPreferences: webPreferences,
        show: false,
        alwaysOnTop: prod ? true : false,
        kiosk: prod ? true : false,
        autoHideMenuBar: true,
        closable: false,
        fullscreen: prod ? true : false
    });
    overlayWindow.setBackgroundColor("#272727");
    overlayWindow.loadFile("./src/overlay/overlay.html");
    overlayWindow.once("ready-to-show", () => {
        overlayWindow.show();
        overlayWindow.focus();
    });
    overlayWindow.on("close", (event) => {
        if (!force_quit) {
            event.preventDefault();
            overlayWindow.hide();
        }
    });
    overlayWindow.webContents.on("before-input-event", (event, input) => {
        if (!prod)
            return;
        if (input.code == "Escape") {
            overlayWindow.hide();
            return;
        }
        event.preventDefault();
    });
}
function createSettingsWindow() {
    if (settingsWindow)
        settingsWindow.hide();
    settingsWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: webPreferences,
        show: false,
        alwaysOnTop: true
    });
    settingsWindow.setBackgroundColor("#272727");
    settingsWindow.loadFile("./src/settings/settings.html");
    settingsWindow.once("ready-to-show", () => {
        settingsWindow.show();
        settingsWindow.focus();
    });
    settingsWindow.on("close", (e) => {
        if (!force_quit) {
            e.preventDefault();
            settingsWindow.hide();
        }
    });
}
async function getCronString() {
    const interval = (await functions_1.default.getSetting("interval")).split(" ")[0];
    const times = (await functions_1.default.getSetting("times")).map((str) => str.split(":")[0]).join("-");
    const result = `*/${interval} ${times} * * *`;
    return !cron.validate(result) || args.includes("--fake-cron") ? "* * * * *" : result;
}
/**
 * TODO: Implement to return false when computer is sleeping
 */
const canShow = () => (prod ? true : false);
electron_1.app.on("ready", async () => {
    await functions_1.default.setDefault(args);
    prod = await functions_1.default.getSetting("prod");
    electron_1.app.on("before-quit", function (e) {
        if (!force_quit) {
            e.preventDefault();
            if (settingsWindow !== undefined)
                settingsWindow.hide();
            if (overlayWindow !== undefined)
                overlayWindow.hide();
        }
    });
    electron_1.app.on("window-all-closed", () => {
        if (process.platform !== "darwin")
            electron_1.app.quit();
    });
    const debugShowOverlay = !prod
        ? [{ label: "Show", type: "normal", click: () => createOverlayWindow() }]
        : [];
    const contextMenu = electron_1.Menu.buildFromTemplate([
        ...debugShowOverlay,
        { label: "Settings", type: "normal", click: () => createSettingsWindow() },
        {
            label: "Quit",
            type: "normal",
            click: () => {
                force_quit = true;
                electron_1.app.quit();
            }
        }
    ]);
    const tray = new electron_1.Tray("./src/assets/icon_256.png");
    tray.setToolTip("Water Reminder");
    tray.setContextMenu(contextMenu);
    cron.schedule(await getCronString(), () => {
        if (canShow())
            createOverlayWindow();
    });
    webPreferences = {
        nodeIntegration: true,
        devTools: prod ? false : true,
        contextIsolation: false,
        enableRemoteModule: true
    };
});
