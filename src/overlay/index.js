"use strict"

/** @type {HTMLDivElement} */
let gifContainer;

/**@type {Array} */
let gifs = [];

let gif = "";
onload = (async () => {
    gifContainer = document.getElementById("GifContainer");

    const url = 'https://api.giphy.com/v1/gifs/search?api_key=3eFQvabDx69SMoOemSPiYfh9FY0nzO9x&q=hydrate';
    gifs = (await (await fetch(url)).json())["data"].map(data => data["images"]["original"]["url"]);
    gif = gifs[Math.floor(Math.random() * gifs.length)];

    let img = new Image();
    img.src = gifs[Math.floor(Math.random() * gifs.length)];
    gifContainer.append(img);
});