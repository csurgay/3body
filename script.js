let running = true;
let NO_PLANETS = 3;
const weights = [1, 1, 1, 1, 1, 1, 1, 1];
let canvas=null;
let ctx=null;
let bodies = [];
let tracks = [];
const L_TRACK = 200;
const COLOR = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];
let cx = cy = 0;

class Particle {   
    constructor(x, y, size, color, weight, vx, vy) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.weight = weight;
        this.vx = vx;
        this.vy = vy;
    }
}

function pause() {
    if (!running) {
        running = true;
        animate();
    }
    else {
        running = false;
    }
}

function main() {
    console.log('init');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    init();
    animate();
}

function init() {
    bodies = [];
    tracks = [];
    // Get the number of planets from the input field
    NO_PLANETS = parseInt(document.getElementById('bodies').value);
    // Create random planets into bodies array
    for (let i = 0; i < NO_PLANETS; i++) {
        let size = Math.random() * 5 + 1; size = 5;
        let x = canvas.width / 2 +(Math.random() - 0.5) * 200;
        let y = canvas.height / 2 +(Math.random() - 0.5) * 200;
        let color = COLOR[i];
        let weight = Math.random() * 0.5 + 0.5; weight = weights[i];
        weight = parseFloat(document.getElementById('b' + (i+1)).value);
        let vx = 1 * (Math.random() - 0.5);
        let vy = 1 * (Math.random() - 0.5);
        bodies.push(new Particle(x, y, size, color, weight, vx, vy));
        tracks.push([]);
    }
    // Set the velocity of the last body to ensure the center of mass is stationary
    let vx = vy = 0;
    for (let i = 0; i < bodies.length-1; i++) {
        vx += bodies[i].vx;
        vy += bodies[i].vy;
    }
    bodies[bodies.length-1].vx = -vx;
    bodies[bodies.length-1].vy = -vy;
}

function animate() {
    for (let i = 0; i < document.getElementById("speed").value; i++) {
        calc();
    }
    draw();
    if (running) requestAnimationFrame(animate);
}

function calc() {
    // Calculate the center of mass - should be stationary
    cx = cy = mass = 0;
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        cx += p.x * p.weight;
        cy += p.y * p.weight;
        mass += p.weight;
    }
    cx /= mass;
    cy /= mass;
    // Calculate the new speed vectors from the gravitational forces between bodies
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        for (let j=0; j<bodies.length; j++) {
            if (i !== j) {
                let p2 = bodies[j];
                let dx = p2.x - p.x;
                let dy = p2.y - p.y;
                let r2 = dx*dx + dy*dy;
                if (r2 < 10) r2 = 10; // Avoid too large forces at close distances
                let force = p.weight * p2.weight / r2;
                p.vx += dx * force;
                p.vy += dy * force;
            }
        }
    }
    // Update the positions of the bodies based on their speed vectors
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        p.x += p.vx / p.weight;
        p.y += p.vy / p.weight;
    }
    // Update the positions of the bodies based on their speed vectors
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        p.x += p.vx / p.weight;
        p.y += p.vy / p.weight;
        // Add the current position to the track
        tracks[i].push({x: p.x, y: p.y});
        // Limit the length of the track
        if (tracks[i].length > L_TRACK) {
            tracks[i].shift();
        }
    }
}

function draw() {
    ctx.beginPath();
    ctx.fillStyle = "#bbbbbb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        for (let j = tracks[i].length - 1; j >= 0; j--) {
            ctx.lineTo(tracks[i][j].x, tracks[i][j].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
