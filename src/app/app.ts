import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, Tray } from "electron";
import Functions from "../functions/functions";
import * as cron from "node-cron";

const args: string[] = process.argv.slice(2);

let prod = true;
let force_quit = false;

let webPreferences: Electron.WebPreferences;

let overlayWindow: Electron.BrowserWindow;
let settingsWindow: Electron.BrowserWindow;

function createOverlayWindow() {
    if (overlayWindow) overlayWindow.hide();
    overlayWindow = new BrowserWindow({
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
        if (!prod) return;
        if (input.code == "Escape") {
            overlayWindow.hide();
            return;
        }
        event.preventDefault();
    });
}

function createSettingsWindow() {
    if (settingsWindow) settingsWindow.hide();
    settingsWindow = new BrowserWindow({
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
    const interval = (<string>await Functions.getSetting("interval")).split(" ")[0];
    const times = (<[string]>await Functions.getSetting("times")).map((str: string) => str.split(":")[0]).join("-");
    const result = `*/${interval} ${times} * * *`;
    return !cron.validate(result) || args.includes("--fake-cron") ? "* * * * *" : result;
}

/**
 * TODO: Implement to return false when computer is sleeping
 */
const canShow = () => (prod ? true : false);

app.on("ready", async () => {
    await Functions.setDefault(args);
    prod = <boolean>await Functions.getSetting("prod");

    app.on("before-quit", function (e) {
        if (!force_quit) {
            e.preventDefault();
            if (settingsWindow !== undefined) settingsWindow.hide();
            if (overlayWindow !== undefined) overlayWindow.hide();
        }
    });
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });

    const debugShowOverlay: (MenuItemConstructorOptions | MenuItem)[] = !prod
        ? [{ label: "Show", type: "normal", click: () => createOverlayWindow() }]
        : [];
    const contextMenu = Menu.buildFromTemplate([
        ...debugShowOverlay,
        { label: "Settings", type: "normal", click: () => createSettingsWindow() },
        {
            label: "Quit",
            type: "normal",
            click: () => {
                force_quit = true;
                app.quit();
            }
        }
    ]);
    const tray = new Tray("./src/assets/icon_256.png");
    tray.setToolTip("Water Reminder");
    tray.setContextMenu(contextMenu);
    cron.schedule(await getCronString(), () => {
        if (canShow()) createOverlayWindow();
    });

    webPreferences = {
        nodeIntegration: true,
        devTools: prod ? false : true,
        contextIsolation: false,
        enableRemoteModule: true
    };
});
