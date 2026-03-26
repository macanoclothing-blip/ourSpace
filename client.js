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
    character: 'personaggio13'
    //character: 'normalGuy'
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
    personaggio13: drawPersonaggio13,
}


/* CANIATO
function drawPersonaggio13(x, y, w, h, style = {}) {
    ctx.save();
    // Sposta l'origine (x=0, y=0) al centro del personaggio
    ctx.translate(x, y);
    const startX = -w / 2;
    const startY = -h / 2;

    // Definiamo le proporzioni base
    const headH = h * 0.3;
    const bodyH = h * 0.35;
    const legH = h - headH - bodyH; // 0.35h

    // Colori
    const hairColor = style.hairColor || "#fbc02d"; // Biondo
    const skinColor = style.skinColor || "#eaa66e"; // Pelle
    const hoodieColor = style.hoodieColor || "#d32f2f"; // Rosso felpa
    const jeansColor = style.jeansColor || "#151514"; // Nero jeans
    const shoeColor = style.shoeColor || "#8a5a19"; // Marrone scarpe

    // +TESTA (Capelli ricci, Occhiali)
    // 1. Capelli ricci biondi (base e blocchi per la consistenza)
    ctx.beginPath();
    ctx.fillStyle = hairColor;
    // Base capelli
    ctx.rect(startX, startY, w, headH * 0.8);
    // Ricci laterali
    ctx.rect(startX - w * 0.05, startY + headH * 0.1, w * 0.1, headH * 0.6); // Sx
    ctx.rect(startX + w, startY + headH * 0.1, w * 0.1, headH * 0.6); // Dx
    // Ricci superiori sfalsati
    ctx.rect(startX + w * 0.1, startY - headH * 0.05, w * 0.3, headH * 0.1);
    ctx.rect(startX + w * 0.6, startY - headH * 0.05, w * 0.3, headH * 0.1);
    ctx.fill();

    // 2. Viso (sotto i capelli)
    const faceStartY = startY + headH * 0.4; // Inizia sotto la frangia/capelli
    const faceH = headH * 0.6;
    ctx.beginPath();
    ctx.fillStyle = skinColor;
    ctx.rect(startX + w * 0.1, faceStartY, w * 0.8, faceH);
    ctx.fill();

    // 3. Occhiali
    ctx.beginPath();
    ctx.fillStyle = "#37474f"; // Grigio scuro/Metallo
    const glassesY = faceStartY + faceH * 0.25;
    const lensW = w * 0.3;
    const lensH = faceH * 0.3;
    // Lenti
    ctx.rect(startX + w * 0.15, glassesY, lensW, lensH); // Sx
    ctx.rect(startX + w * 0.55, glassesY, lensW, lensH); // Dx
    // Barra centrale
    ctx.rect(startX + w * 0.45, glassesY + lensH * 0.3, w * 0.1, lensH * 0.4);
    ctx.fill();

    // 4. Dettaglio: Occhi sotto gli occhiali (opzionale ma carino)
    ctx.beginPath();
    ctx.fillStyle = "#151514";
    ctx.rect(startX + w * 0.25, glassesY + lensH * 0.35, w * 0.1, lensH * 0.3); // Occhio sx
    ctx.rect(startX + w * 0.65, glassesY + lensH * 0.35, w * 0.1, lensH * 0.3); // Occhio dx
    ctx.fill();
    // -testa

    // +CORPO (Felpa Rossa)
    const bodyStartY = startY + headH;
    const armLen = 0.35 * w;
    const hoodiePocketH = bodyH * 0.3;

    ctx.beginPath();
    ctx.fillStyle = hoodieColor;
    ctx.rect(startX, bodyStartY, w, bodyH); // Torso felpa
    // Braccia felpa
    ctx.rect(startX - armLen, bodyStartY, armLen, 0.35 * bodyH); // Sx
    ctx.rect(startX + w, bodyStartY, armLen, 0.35 * bodyH); // Dx
    ctx.fill();

    // 1. Tasca a marsupio (un rettangolo rosso più scuro/diverso)
    ctx.beginPath();
    ctx.fillStyle = "#a31d1d"; // Rosso più scuro
    ctx.rect(startX + w * 0.15, bodyStartY + bodyH * 0.5, w * 0.7, hoodiePocketH);
    ctx.fill();

    // 2. Polsini delle maniche
    ctx.beginPath();
    ctx.fillStyle = "#a31d1d"; // Come la tasca
    ctx.rect(startX - armLen, bodyStartY + 0.25 * bodyH, armLen, 0.1 * bodyH); // Sx
    ctx.rect(startX + w, bodyStartY + 0.25 * bodyH, armLen, 0.1 * bodyH); // Dx
    ctx.fill();

    // 3. Mani che spuntano
    ctx.beginPath();
    ctx.fillStyle = skinColor;
    ctx.rect(startX - armLen, bodyStartY + 0.35 * bodyH, 0.2 * armLen, 0.15 * bodyH); // Mano sx
    ctx.rect(startX + w + armLen * 0.8, bodyStartY + 0.35 * bodyH, 0.2 * armLen, 0.15 * bodyH); // Mano dx
    ctx.fill();
    // -corpo

    // +GAMBE (Jeans Neri)
    const legStartY = bodyStartY + bodyH;
    const legW = w * 0.35;

    ctx.beginPath();
    ctx.fillStyle = jeansColor;
    // Gambe separate
    ctx.rect(startX, legStartY, legW, legH); // Gamba sinistra
    ctx.rect(startX + w - legW, legStartY, legW, legH); // Gamba destra
    ctx.fill();

    // Dettaglio: Cuciture jeans (opzionale)
    ctx.beginPath();
    ctx.fillStyle = "#37474f"; // Grigio scuro per cuciture
    ctx.rect(startX + legW * 0.1, legStartY + legH * 0.1, legW * 0.8, legH * 0.05); // Tasca sx
    ctx.rect(startX + w - legW * 0.9, legStartY + legH * 0.1, legW * 0.8, legH * 0.05); // Tasca dx
    ctx.fill();
    // -gambe

    // +PIEDI (Scarpe Marroni)
    const shoeH = h * 0.1;
    const shoeStartY = startY + h - shoeH;
    const shoeW = legW * 1.1; // Leggermente più larghe delle gambe

    ctx.beginPath();
    ctx.fillStyle = shoeColor;
    // Scarpe
    ctx.rect(startX - w * 0.05, shoeStartY, shoeW, shoeH); // Piede sx
    ctx.rect(startX + w - legW - w * 0.05, shoeStartY, shoeW, shoeH); // Piede dx
    ctx.fill();

    // Dettaglio: Suola bianca
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5"; // Bianco
    ctx.rect(startX - w * 0.05, shoeStartY + shoeH * 0.8, shoeW, shoeH * 0.2); // Suola sx
    ctx.rect(startX + w - legW - w * 0.05, shoeStartY + shoeH * 0.8, shoeW, shoeH * 0.2); // Suola dx
    ctx.fill();
    // -piedi

    // +bounding box (debug)
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();
    // -bounding box

    ctx.restore();
}*/

// MAGO
function drawPersonaggio13(x, y, w, h, style = {}) {
    ctx.save();
    // Sposta l'origine (x=0, y=0) al centro del personaggio
    ctx.translate(x, y);
    const startX = -w / 2;
    const startY = -h / 2;

    // Definiamo le proporzioni per farci stare tutto
    const hatH = h * 0.25;
    const headH = h * 0.15;
    const bodyH = h * 0.50;
    const feetH = h * 0.10;

    const robeColor = style.robeColor || "#2c1b4d"; // Viola scuro per la tunica
    const skinColor = style.skinColor || "#eaa66e";
    const magicColor = style.magicColor || "#00e5ff"; // Ciano brillante per la magia

    // +BASTONE MAGICO (Dietro il corpo, lato destro)
    const staffX = startX + w * 1.2;
    // Asta di legno
    ctx.beginPath();
    ctx.fillStyle = "#5c4033"; // Marrone scuro
    ctx.rect(staffX, startY + hatH * 0.5, w * 0.15, h * 0.85);
    ctx.fill();
    // Gemma magica (Esterna)
    ctx.beginPath();
    ctx.fillStyle = "#008b8b"; // Ciano scuro
    ctx.rect(staffX - w * 0.075, startY + hatH * 0.1, w * 0.3, hatH * 0.5);
    ctx.fill();
    // Gemma magica (Luce interna)
    ctx.beginPath();
    ctx.fillStyle = magicColor; 
    ctx.rect(staffX - w * 0.025, startY + hatH * 0.15, w * 0.2, hatH * 0.3);
    ctx.fill();
    // -bastone

    // +CAPPELLO (A strati per fare la punta)
    ctx.beginPath();
    ctx.fillStyle = robeColor;
    // Punta del cappello
    ctx.rect(startX + w * 0.35, startY, w * 0.3, hatH * 0.4);
    // Centro del cappello
    ctx.rect(startX + w * 0.15, startY + hatH * 0.4, w * 0.7, hatH * 0.4);
    // Tesa larga del cappello (Nota: questa sporge ancora dalla bounding box!)
    ctx.rect(startX - w * 0.3, startY + hatH * 0.8, w * 1.6, hatH * 0.2);
    ctx.fill();

    // Fascia del cappello
    ctx.beginPath();
    ctx.fillStyle = "#fbc02d"; // Giallo oro
    ctx.rect(startX + w * 0.15, startY + hatH * 0.7, w * 0.7, hatH * 0.1);
    ctx.fill();
    // -cappello

    // +TESTA E VISO
    const headStartY = startY + hatH;
    ctx.beginPath();
    ctx.fillStyle = skinColor;
    ctx.rect(startX + w * 0.15, headStartY, w * 0.7, headH);
    ctx.fill();

    // Ombra degli occhi sotto il cappello
    ctx.beginPath();
    ctx.fillStyle = "#151514";
    ctx.rect(startX + w * 0.2, headStartY + headH * 0.2, w * 0.6, headH * 0.2);
    ctx.fill();

    // Occhietti brillanti (magici)
    ctx.beginPath();
    ctx.fillStyle = magicColor;
    ctx.rect(startX + w * 0.3, headStartY + headH * 0.25, w * 0.1, headH * 0.1); // Occhio sx
    ctx.rect(startX + w * 0.6, headStartY + headH * 0.25, w * 0.1, headH * 0.1); // Occhio dx
    ctx.fill();
    // -testa

    // +TUNICA E CORPO (Modificato: Braccia più strette)
    const bodyStartY = startY + hatH + headH;
    const sleeveW = w * 0.25; // Larghezza maniche (prima era 0.5)
    const handW = w * 0.15;   // Larghezza mani
    
    // Maniche
    ctx.beginPath();
    ctx.fillStyle = robeColor;
    ctx.rect(startX - sleeveW, bodyStartY, sleeveW, bodyH * 0.7); // Manica sx
    ctx.rect(startX + w, bodyStartY, sleeveW, bodyH * 0.7); // Manica dx
    ctx.fill();

    // Mani che spuntano (centrate sotto la rispettiva manica)
    ctx.beginPath();
    ctx.fillStyle = skinColor;
    ctx.rect(startX - sleeveW + (sleeveW - handW)/2, bodyStartY + bodyH * 0.7, handW, bodyH * 0.15); // Mano sx
    ctx.rect(startX + w + (sleeveW - handW)/2, bodyStartY + bodyH * 0.7, handW, bodyH * 0.15); // Mano dx
    ctx.fill();

    // Corpo principale (Tunica)
    ctx.beginPath();
    ctx.fillStyle = robeColor;
    ctx.rect(startX, bodyStartY, w, bodyH);
    ctx.fill();

    // Cintura con fibbia
    ctx.beginPath();
    ctx.fillStyle = "#151514"; // Cintura nera
    ctx.rect(startX, bodyStartY + bodyH * 0.4, w, bodyH * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#fbc02d"; // Fibbia d'oro
    ctx.rect(startX + w * 0.3, bodyStartY + bodyH * 0.35, w * 0.4, bodyH * 0.2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "#151514"; // Buco fibbia
    ctx.rect(startX + w * 0.4, bodyStartY + bodyH * 0.4, w * 0.2, bodyH * 0.1);
    ctx.fill();
    // -tunica

    // +BARBA MAESTOSA
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5"; // Bianco/Grigio chiarissimo
    // Barba principale
    ctx.rect(startX + w * 0.05, headStartY + headH * 0.5, w * 0.9, headH * 0.5 + bodyH * 0.3);
    // Baffi
    ctx.rect(startX + w * 0.15, headStartY + headH * 0.6, w * 0.7, headH * 0.2);
    ctx.fill();

    // Bocca buia sotto i baffi
    ctx.beginPath();
    ctx.fillStyle = "#151514";
    ctx.rect(startX + w * 0.4, headStartY + headH * 0.75, w * 0.2, headH * 0.15);
    ctx.fill();
    // -barba

    // +PIEDI
    const feetStartY = startY + h - feetH;
    ctx.beginPath();
    ctx.fillStyle = "#5c4033"; // Scarpe di cuoio
    ctx.rect(startX + w * 0.1, feetStartY, w * 0.3, feetH); // Piede sx
    ctx.rect(startX + w * 0.6, feetStartY, w * 0.3, feetH); // Piede dx
    ctx.fill();
    // -piedi

    // +BOUNDING BOX (Debug)
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();
    // -bounding box

    ctx.restore();
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
