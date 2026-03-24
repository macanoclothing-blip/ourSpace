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
    character: 'normalGuy'};
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

function drawClashRoyaleKnight(x, y, w, h, style = {}) {
    ctx.save();

    // move origin (x=0, y=0) to the person center
    ctx.translate(x, y);
    const startX = -w/2;
    const startY = -h/2;

    // +head (Elmo rosso)
    const headH = h * 0.3;

    // Viso
    ctx.beginPath();
    ctx.fillStyle = "#d4a574"; // pelle
    ctx.rect(startX, startY + headH*0.4, w, headH*0.6);
    ctx.fill();

    // Elmo rosso
    ctx.beginPath();
    ctx.fillStyle = "#e32f2f"; // rosso brillante
    ctx.rect(startX, startY, w, headH*0.5);
    ctx.fill();

    // Visiera dorata
    ctx.beginPath();
    ctx.fillStyle = "#ffd700";
    ctx.rect(startX, startY + headH*0.35, w, headH*0.15);
    ctx.fill();

    // Occhi (sfondo scuro)
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    const eyeW = w * 0.12;
    const eyeH = w * 0.1;
    ctx.rect(startX + w*0.2, startY + headH*0.5, eyeW, eyeH);
    ctx.rect(startX + w*0.68, startY + headH*0.5, eyeW, eyeH);
    ctx.fill();

    // Bocca
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.moveTo(startX + w*0.25, startY + headH*0.75);
    ctx.lineTo(startX + w*0.75, startY + headH*0.75);
    ctx.stroke();
    // -head

    // +body (Armatura grigia/nera)
    const bodyStartY = startY + headH;
    const bodyH = h * 0.35;
    const armLen = 0.4 * w;

    // Corpo armatura
    ctx.beginPath();
    ctx.fillStyle = "#4a4a4a"; // grigio scuro armatura
    ctx.rect(startX, bodyStartY, w, bodyH);
    ctx.fill();

    // Dettagli armatura (crocchia)
    ctx.beginPath();
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 2;
    ctx.moveTo(startX + w*0.25, bodyStartY);
    ctx.lineTo(startX + w*0.25, bodyStartY + bodyH);
    ctx.moveTo(startX + w*0.75, bodyStartY);
    ctx.lineTo(startX + w*0.75, bodyStartY + bodyH);
    ctx.stroke();

    // Braccia con armatura
    ctx.beginPath();
    ctx.fillStyle = "#4a4a4a";
    ctx.rect(startX - armLen, bodyStartY + 5, armLen - 5, 0.4*bodyH);
    ctx.rect(startX + w + 5, bodyStartY + 5, armLen - 5, 0.4*bodyH);
    ctx.fill();

    // Guanti scuri
    ctx.beginPath();
    ctx.fillStyle = "#1a1a1a";
    ctx.arc(startX - armLen + 3, bodyStartY + 0.2*bodyH, 5, 0, Math.PI * 2);
    ctx.arc(startX + w + armLen - 3, bodyStartY + 0.2*bodyH, 5, 0, Math.PI * 2);
    ctx.fill();

    // Scudo sulla sinistra
    ctx.beginPath();
    ctx.fillStyle = "#3a3a3a";
    ctx.rect(startX - armLen - 8, bodyStartY, 10, 0.6*bodyH);
    ctx.fill();
    
    ctx.beginPath();
    ctx.fillStyle = "#ffd700";
    ctx.rect(startX - armLen - 6, bodyStartY + 5, 6, 0.5*bodyH);
    ctx.fill();

    // Spada sulla destra
    ctx.beginPath();
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 3;
    ctx.moveTo(startX + w + armLen, bodyStartY);
    ctx.lineTo(startX + w + armLen + 5, bodyStartY - 15);
    ctx.stroke();

    // Punta spada
    ctx.beginPath();
    ctx.fillStyle = "#c0c0c0";
    ctx.moveTo(startX + w + armLen + 5, bodyStartY - 15);
    ctx.lineTo(startX + w + armLen + 8, bodyStartY - 25);
    ctx.lineTo(startX + w + armLen + 2, bodyStartY - 18);
    ctx.fill();
    // -body

    // +legs (Armatura e stivali)
    const legH = h - headH - bodyH;
    const legStartY = bodyStartY + bodyH;
    const legW = w * 0.35;

    // Pantaloni armatura
    ctx.beginPath();
    ctx.fillStyle = "#4a4a4a";
    ctx.rect(startX, legStartY, legW, legH*0.7); // sinistra
    ctx.rect(startX + w - legW, legStartY, legW, legH*0.7); // destra
    ctx.fill();

    // Unione pantaloni
    ctx.beginPath();
    ctx.fillStyle = "#4a4a4a";
    ctx.rect(startX, legStartY, w, legH*0.2);
    ctx.fill();

    // Stivali neri
    ctx.beginPath();
    ctx.fillStyle = "#1a1a1a";
    ctx.rect(startX, legStartY + legH*0.7, legW, legH*0.3);
    ctx.rect(startX + w - legW, legStartY + legH*0.7, legW, legH*0.3);
    ctx.fill();

    // Dettagli stivali (dorature)
    ctx.beginPath();
    ctx.fillStyle = "#ffd700";
    ctx.rect(startX + 3, legStartY + legH*0.75, legW - 6, 3);
    ctx.rect(startX + w - legW + 3, legStartY + legH*0.75, legW - 6, 3);
    ctx.fill();
    // -legs

    // +bounding box
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();
    // -bounding box

    ctx.restore();
}




