const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineJoin = "round";

canvas.width = 1920;
canvas.height = 1080;

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

const h100 = canvas.height / 100;
const w100 = canvas.width / 100;
const ar = canvas.width / canvas.height;//16/9
const settings = {
    //misc
    screenshakeMult: h100,
    gravity: new Vect(0, 0.15),

    playerSpeed: 0.2,
    playerAirSpeed: 0.09,
    playerJump: 3,
    coyoteTime: 8,
    jumpBufferTime: 4,
    grappleBufferTime: 10,
    bounceTime: 5,
    bouncePower: 1,//how much your velocity gets multiplied by after a bounce
    ropeParticleTimer: 60,

    platformSnap: 10,//grid snap (for god mode)
    godSpeed: 8,
};

//LA GAME STATE FOR STAT MACHINEINE
var gameState = "playing";


//assets lol
var assets = {

};

for(var i in assets) {
    let bob = new Image();
    bob.src = "assets/"+assets[i];
    assets[i] = bob;
}

const fonts = [
    {path: "assets/bytebounce-font/ByteBounce.ttf", name: "pixelFont"},
    {path: "assets/lowerpixel-font/LowresPixel-Regular.otf", name: "pixelFontSmall"}
]

async function loadFont() {
    //font time
    try {
        // 1. Define the font face (Font Family Name, URL source)
        for(var i = 0; i < fonts.length; i ++) {
            let myFont = new FontFace(
                fonts[i].name,
                'url("' + fonts[i].path + '")'
            );

            let loadedFont = await myFont.load();
            document.fonts.add(loadedFont);
        }
        console.log("yay font worked");
    }
    catch(error) {
        console.error("uhhhh the fon't:" + error);
    }
};
loadFont();
