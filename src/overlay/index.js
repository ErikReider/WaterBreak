"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = __importDefault(require("../functions/functions"));
let gifContainer;
let progressBar;
let timeSpan;
let snoozeButton;
let prod = true;
onload = async () => {
    prod = await functions_1.default.getSetting("prod");
    gifContainer = document.getElementById("GifContainer");
    progressBar = document.getElementById("progressBar");
    timeSpan = document.getElementById("timeSpan");
    snoozeButton = document.getElementById("snoozeButton");
    if (await functions_1.default.getSetting("showGif")) {
        await gifInit();
    }
    else {
        gifContainer.style.display = "none";
    }
    snoozeButton.onclick = (() => window.close());
    const time = (await functions_1.default.getSetting("timeout")).split(" ");
    let timeout = Number(time[0]);
    timeout = time[1] == "sec" ? timeout : (time[1] == "min" ? timeout * 60 : 0);
    initProgressBar(() => prod ? window.close() : "", timeout, time[1]);
    document.body.style.opacity = "1";
};
async function gifInit() {
    const ref = "https://api.giphy.com/v1/gifs/search?api_key=";
    const apiKey = "3eFQvabDx69SMoOemSPiYfh9FY0nzO9x";
    const query = "hydrate";
    const limit = 1;
    const offset = Math.floor(Math.random() * 20);
    const url = ref + apiKey + "&q=" + query.split(" ").join("-") + "&offset=" + offset + "&limit=" + limit;
    const gifList = (await (await fetch(url)).json())["data"].map((data) => data["images"]["original"]["url"]);
    const gif = gifList[Math.floor(Math.random() * gifList.length)];
    gifContainer.style.backgroundImage = "url(" + gif + ")";
}
function initProgressBar(callback, seconds, suffix) {
    if (seconds === 0) {
        if (progressBar.parentElement)
            progressBar.parentElement.style.display = "none";
        return;
    }
    const interval = 10;
    const step = 10 / (seconds * interval);
    const baseString = (suffix == "sec" ? " seconds" : (suffix == "min" ? " minutes" : "")) + " remaining...";
    timeSpan.textContent = seconds.toString() + baseString;
    const timeID = setInterval((() => timeSpan.textContent = (--seconds).toString() + baseString), 1e3);
    const id = setInterval(() => {
        const width = Number(progressBar.style.width.replace("%", "")) + step;
        progressBar.style.width = width + "%";
        if (width === 100) {
            clearInterval(id);
            clearInterval(timeID);
            callback();
        }
    }, interval);
}
