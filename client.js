const playgorund = document.getElementById('playground');
const ctx = playground.getContext("2d");

let W = 0, H = 0; // larghezza ed altezza del canvas
function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    playground.width = W;
    playground.height = H;
}
resize();
window.addEventListener('resize', resize);

let me = {
    x: W/2,
    y: H/2,
    speed: 5,
    character: 'normalGuy'
};
let others = []; // TODO riempire con i dati che arrivano dal server

const personW = 40;
const personH = 120;

function draw() {
    // gestione movimento
    if (goingUp) me.y -= me.speed;
    if (goingLeft) me.x -= me.speed;
    if (goingDown) me.y += me.speed;
    if (goingRight) me.x += me.speed;

    // pulisci lo sfondo
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.fillStyle = "#58a515";
    ctx.fill();

    others.forEach(p => drawPerson(p.x, p.y, personW, personH, p.character));
    drawPerson(me.x, me.y, personW, personH, me.character);

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

const characters = {
    normalGuy: drawNormalGuy,
}

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
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();
    /*
    */
    // -bounding box

    ctx.restore();
}

function drawBatman(x, y, w, h, style = {}) {
    ctx.save();
    ctx.translate(x, y);

    const startX = -w / 2;
    const startY = -h / 2;

    const headH = h * 0.25;
    const bodyH = h * 0.40;
    const legH = h - headH - bodyH;
    
    const bodyStartY = startY + headH;
    const legStartY = bodyStartY + bodyH;

    // --- MANTELLO (Effetto "Scalloped") ---
    ctx.beginPath();
    ctx.fillStyle = "#1a1a1a";
    const capeW = w * 1.3;
    ctx.moveTo(startX - w * 0.15, bodyStartY);
    ctx.lineTo(startX + w * 1.15, bodyStartY);
    ctx.lineTo(startX + capeW, legStartY + legH);
    // Creazione delle punte del mantello in basso
    for (let i = 0; i <= 3; i++) {
        ctx.quadraticCurveTo(
            startX + capeW - (i * capeW / 3) - (capeW / 6), legStartY + legH * 0.8,
            startX + capeW - ((i + 1) * capeW / 3), legStartY + legH
        );
    }
    ctx.fill();

    // --- CORPO (Muscolatura e Busto) ---
    ctx.beginPath();
    ctx.fillStyle = "#333333";
    // Spalle più arrotondate
    ctx.roundRect(startX, bodyStartY, w, bodyH, [10, 10, 0, 0]);
    ctx.fill();

    // Braccia muscolose
    const armW = w * 0.35;
    ctx.beginPath();
    ctx.roundRect(startX - armW + 5, bodyStartY + 5, armW, bodyH * 0.6, 8); // Braccio sx
    ctx.roundRect(startX + w - 5, bodyStartY + 5, armW, bodyH * 0.6, 8); // Braccio dx
    ctx.fill();

    // --- TESTA (Maschera Sagomata) ---
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    // Maschera con orecchie a punta integrate
    ctx.moveTo(startX, startY + headH); // Angolo basso sx
    ctx.lineTo(startX, startY); // Lato sx
    ctx.lineTo(startX + w * 0.15, startY - headH * 0.4); // Punta orecchia sx
    ctx.lineTo(startX + w * 0.3, startY); // Interno orecchia sx
    ctx.lineTo(startX + w * 0.7, startY); // Interno orecchia dx
    ctx.lineTo(startX + w * 0.85, startY - headH * 0.4); // Punta orecchia dx
    ctx.lineTo(startX + w, startY); // Lato dx
    ctx.lineTo(startX + w, startY + headH); // Angolo basso dx
    ctx.closePath();
    ctx.fill();

    // Viso (Mascella squadrata)
    ctx.beginPath();
    ctx.fillStyle = style.skinColor || "#eaa66e";
    ctx.moveTo(startX + w * 0.2, startY + headH);
    ctx.lineTo(startX + w * 0.8, startY + headH);
    ctx.lineTo(startX + w * 0.75, startY + headH * 0.55);
    ctx.lineTo(startX + w * 0.25, startY + headH * 0.55);
    ctx.closePath();
    ctx.fill();

    // Occhi bianchi (Fessure iconiche)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(startX + w * 0.25, startY + headH * 0.35);
    ctx.lineTo(startX + w * 0.45, startY + headH * 0.4);
    ctx.lineTo(startX + w * 0.25, startY + headH * 0.45);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(startX + w * 0.75, startY + headH * 0.35);
    ctx.lineTo(startX + w * 0.55, startY + headH * 0.4);
    ctx.lineTo(startX + w * 0.75, startY + headH * 0.45);
    ctx.fill();

    // --- DETTAGLI PETTO ---
    // Logo (Pipistrello stilizzato dentro l'ovale)
    ctx.beginPath();
    ctx.fillStyle = "#ffcc00";
    ctx.ellipse(startX + w / 2, bodyStartY + bodyH * 0.3, w * 0.28, bodyH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sagoma pipistrello nera semplificata
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(startX + w / 2, bodyStartY + bodyH * 0.3, w * 0.1, 0, Math.PI, true);
    ctx.fill();

    // Cintura con tasche
    ctx.fillStyle = "#d4af37";
    const beltY = bodyStartY + bodyH - (bodyH * 0.2);
    ctx.fillRect(startX, beltY, w, bodyH * 0.18);
    // Tasche sulla cintura
    ctx.fillStyle = "#b8952e";
    for(let i=0; i<4; i++) {
        ctx.fillRect(startX + (i * w/4) + 2, beltY + 2, w/4 - 4, bodyH * 0.14);
    }

    // --- GAMBE ---
    const legW = w * 0.38;
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.roundRect(startX, legStartY, legW, legH, [0, 0, 5, 5]);
    ctx.roundRect(startX + w - legW, legStartY, legW, legH, [0, 0, 5, 5]);
    ctx.fill();

    // +bounding box
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();

    ctx.restore();
}

