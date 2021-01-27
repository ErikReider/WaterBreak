import Functions from "../functions/functions";

let gifContainer: HTMLDivElement;
let progressBar: HTMLProgressElement;
let timeSpan: HTMLSpanElement;
let snoozeButton: HTMLDivElement;

let prod = true;

onload = async () => {
    prod = <boolean>await Functions.getSetting("prod");

    gifContainer = <HTMLDivElement>document.getElementById("GifContainer");
    progressBar = <HTMLProgressElement>document.getElementById("progressBar");
    timeSpan = <HTMLSpanElement>document.getElementById("timeSpan");
    snoozeButton = <HTMLDivElement>document.getElementById("snoozeButton");

    if (<boolean>await Functions.getSetting("showGif")) {
        await gifInit();
    } else {
        gifContainer.style.display = "none";
    }

    snoozeButton.onclick = (() => window.close());
    const time = (<string>await Functions.getSetting("timeout")).split(" ");
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

    const gifList = (await (await fetch(url)).json())["data"].map((data: { images: { original: { url: string } } }) => data["images"]["original"]["url"]);
    const gif = gifList[Math.floor(Math.random() * gifList.length)];

    gifContainer.style.backgroundImage = "url(" + gif + ")";
}

type Callback = () => void;
function initProgressBar(callback: Callback, seconds: number, suffix: string) {
    if (seconds === 0) {
        if (progressBar.parentElement) progressBar.parentElement.style.display = "none";
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
