const playground = document.getElementById('playground');
const ctx = playground.getContext("2d");

const mod = (n, m) => ((n % m) + m) % m;

let screenW = 0, screenH = 0; // larghezza ed altezza del canvas
const worldW = 1000, worldH = 600; // larghezza ed altezza dello spazio di gioco
const worldBounds = {
    top: -worldH/2,
    left: -worldW/2,
    bottom: worldH/2,
    right: worldW/2,
};
const camera = { x: 0, y: 0, zoom: 1.0 };

function resize() {
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    playground.width = screenW;
    playground.height = screenH;
}
resize();
window.addEventListener('resize', resize);

let me = null;
let people = []; // TODO riempire con i dati che arrivano dal server

const personW = 40;
const personH = 120;

function createButton(text, onclick) {
    // +state
    let rect = { x: 0, y: 0, w: 0, h: 0 };
    let isPressed = false;
    // -state

    // +click_handling
    const getPointerPos = (e) => {
        const bounds = playground.getBoundingClientRect();
        return {
            x: e.clientX - bounds.left - screenW/2,
            y: e.clientY - bounds.top - screenH/2
        };
    };
    const isInside = (pos) => {
        return pos.x >= rect.x && pos.x <= rect.x + rect.w &&
               pos.y >= rect.y && pos.y <= rect.y + rect.h;
    };
    playground.addEventListener('pointerdown', (e) => {
        if (isInside(getPointerPos(e))) {
            isPressed = true;
        }
    });
    playground.addEventListener('pointerup', (e) => {
        if (isPressed && isInside(getPointerPos(e))) {
            onclick();
        }
        isPressed = false;
    });
    playground.addEventListener('pointercancel', () => isPressed = false);
    window.addEventListener('pointerup', () => isPressed = false);
    // -click_handling

    const drawButton = (newRect, ctx) => {
        rect = newRect; 

        const { x, y, w, h } = rect;
        const shadowOffset = Math.min(w, h) * 0.07;
        const pushOffset = isPressed ? shadowOffset * 0.5 : 0;

        // ombra
        ctx.beginPath();
        ctx.rect(x + shadowOffset, y + shadowOffset, w, h);
        ctx.fillStyle = "#161616";
        ctx.fill();

        // bottone
        ctx.beginPath();
        ctx.rect(x + pushOffset, y + pushOffset, w, h);
        ctx.fillStyle = "#d18800";
        ctx.fill();

        // testo
        ctx.fillStyle = "#e6e6e6";
        ctx.font = `bold ${Math.floor(Math.min(w, h) * 0.5)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + w / 2 + pushOffset, y + h / 2 + pushOffset);
    }

    return drawButton;
}


const characters = {
    normalGuy: drawNormalGuy,
    rect: drawRect,
}
const characterNames = Object.keys(characters);
let selectedCharacterIdx = 0;

const leftArrow = createButton('<', () => {
    selectedCharacterIdx = mod(selectedCharacterIdx + 1, characterNames.length);
});
const rightArrow = createButton('>', () => {
    selectedCharacterIdx = mod(selectedCharacterIdx - 1, characterNames.length);
});
const okBtn = createButton('ok', () => {
    me = {
        x: 0,
        y: 0,
        speed: 5,
        character: characterNames[selectedCharacterIdx],
    };
});


function draw() {
    if (me) {
        // gestione movimento
        if (goingUp) me.y -= me.speed;
        if (goingLeft) me.x -= me.speed;
        if (goingDown) me.y += me.speed;
        if (goingRight) me.x += me.speed;

        // controllo che il giocatore non esca dallo spazio di gioco
        if (me.y - personH/2 < worldBounds.top) me.y = worldBounds.top + personH/2;
        if (me.y + personH/2 > worldBounds.bottom) me.y = worldBounds.bottom - personH/2;
        if (me.x - personW/2 < worldBounds.left) me.x = worldBounds.left + personW/2;
        if (me.x + personW/2 > worldBounds.right) me.x = worldBounds.right - personW/2;

        // la camera segue il giocatore
        camera.x = me.x;
        camera.y = me.y;

        // pulisci lo schermo
        ctx.beginPath();
        ctx.rect(0, 0, screenW, screenH);
        ctx.fillStyle = "#000";
        ctx.fill();

        ctx.save(); // sistema di coordinate world-space
            ctx.translate(screenW/2, screenH/2); // centra lo schermo
            ctx.scale(camera.zoom, camera.zoom); // applica lo zoom
            ctx.translate(-camera.x, -camera.y); // sposta relativamente alla camera

            // disegna lo sfondo del "mondo" (campo da gioco)
            ctx.beginPath();
            ctx.rect(worldBounds.left, worldBounds.top, worldW, worldH);
            ctx.fillStyle = "#58a515";
            ctx.fill();

            if (me) drawPerson(me.x, me.y, personW, personH, me.character);
        ctx.restore();
    } else {
        let side = Math.min(screenH, screenW);
        ctx.save();
            ctx.translate(screenW/2, screenH/2); // centra lo schermo

            const borderWidth = 20;
            ctx.beginPath();
            ctx.rect(-side/2, -side/2, side, side);
            ctx.clip();
            ctx.strokeStyle = "#161616";
            ctx.lineWidth = borderWidth;
            ctx.fillStyle = "#fafafa";
            ctx.fill();
            ctx.stroke();

            const btnWidth = side * 0.1;
            const btnHeight = side  * 0.4;
            const btnSpacing = borderWidth + 5;
            rightArrow({ x: side/2 - btnWidth - btnSpacing, y: -btnHeight/2, w: btnWidth, h: btnHeight }, ctx);
            leftArrow({ x: -side/2 + btnSpacing, y: -btnHeight/2, w: btnWidth, h: btnHeight }, ctx);

            const characterName = characterNames[selectedCharacterIdx];
            const characterH = side * 0.7;
            const characterW = characterH * personW / personH;
            drawPerson(0, -side*0.1, characterW, characterH, characterName);

            const okBtnW = side * 0.4;
            const okBtnH = side * 0.1;
            okBtn({ x: -okBtnW/2, y: side/2 - okBtnH - side*0.1, w: okBtnW, h: okBtnH }, ctx);

        ctx.restore();
    }
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function drawPerson(x, y, w, h, style) {
    const drawFunction = characters[style];
    drawFunction(x, y, w, h, style);
}

const socket = new WebSocket(`ws://localhost:4242`);
socket.addEventListener("message", async event => {
    // TODO aggiornare lo stato in base ai messaggi del server
});

// TODO spostare la gestione dei movimenti sul server
let goingUp = false;
let goingLeft = false;
let goingDown = false;
let goingRight = false;

document.addEventListener("keydown", (event) => {
    if (event.code == "KeyW") goingUp = true;
    else if (event.code == "KeyA") goingLeft = true;
    else if (event.code == "KeyS") goingDown = true;
    else if (event.code == "KeyD") goingRight = true;
});
document.addEventListener("keyup", (event) => {
    if (event.code == "KeyW") goingUp = false;
    else if (event.code == "KeyA") goingLeft = false;
    else if (event.code == "KeyS") goingDown = false;
    else if (event.code == "KeyD") goingRight = false;
});

// gestione dello zoom
const minZoom = 0.1, maxZoom = 4;
const zoomSpeed = 0.035;
window.addEventListener('wheel', (event) => {
    event.preventDefault();
    
    if (event.deltaY > 0) {
        camera.zoom *= (1 - zoomSpeed);
    } else {
        camera.zoom *= (1 + zoomSpeed);
    }

    camera.zoom = Math.min(Math.max(minZoom, camera.zoom), maxZoom);
}, { passive: false });

function drawNormalGuy(x, y, w, h, style = {}) {
    ctx.save();

    // move origin (x=0, y=0) to the person center
    ctx.translate(x, y);
    const startX = -w/2;
    const startY = -h/2;


    // +head
    const headH = h * 0.3;

    ctx.beginPath();
    ctx.fillStyle = style.skinColor || "#eaa66e";
    ctx.rect(startX, startY, w, headH);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#151514";
    ctx.rect(startX, startY, w, headH/4);
    ctx.fill();
    // -head

    // +body
    const bodyStartY = startY + headH;
    const bodyH = h * 0.35;
    const armLen = 0.4 * w;

    ctx.beginPath();
    ctx.fillStyle = "#04097f";
    ctx.rect(startX, bodyStartY, w, bodyH); // body
    ctx.rect(startX - armLen, bodyStartY, armLen, 0.35*bodyH); // left arm
    ctx.rect(startX + w, bodyStartY, armLen, 0.35*bodyH); // left arm
    ctx.fill();
    // -body

    // +legs
    const legH = h - headH - bodyH;
    const legStartY = bodyStartY + bodyH;
    const legW = w * 0.35;

    ctx.beginPath();
    ctx.fillStyle = "#100712";
    ctx.rect(startX, legStartY, w, legH/3); // top
    ctx.rect(startX, legStartY, legW, legH); // left leg
    ctx.rect(startX + w - legW, legStartY, legW, legH); // right leg
    ctx.fill();
    // -legs

    // +bounding box
    // ctx.beginPath();
    // ctx.rect(startX, startY, w, h);
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = "#f620ef";
    // ctx.stroke();
    /*
    */
    // -bounding box

    ctx.restore();
}


function drawRect(x, y, w, h, style = {}) {
    ctx.save();
    ctx.translate(x, y);
    const startX = -w/2;
    const startY = -h/2;
    ctx.beginPath();
    ctx.fillStyle = style.skinColor || "#eaa66e";
    ctx.rect(startX, startY, w, h);
    ctx.fill();
    ctx.restore();
}
