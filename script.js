const NO_PLANETS = 5;
const weights = [5, 1, 1, 1, 1, 1, 1, 1];
let canvas=null;
let ctx=null;
let particlesArray = [];
let tracksArray = [];
const L_TRACK = 300;
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

function init() {
    console.log('init');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    for (let i = 0; i < NO_PLANETS; i++) {
        let size = Math.random() * 5 + 1; size = 5;
        let x = canvas.width / 2 +(Math.random() - 0.5) * 200;
        let y = canvas.height / 2 +(Math.random() - 0.5) * 200;
        let color = COLOR[i];
        let weight = Math.random() * 0.5 + 0.5; weight = weights[i];
        let vx = 1 * (Math.random() - 0.5);
        let vy = 1 * (Math.random() - 0.5);
        particlesArray.push(new Particle(x, y, size, color, weight, vx, vy));
        tracksArray.push([]);
    }
    cx = cy = 0;
    for (let i = 0; i < particlesArray.length-1; i++) {
        cx += particlesArray[i].vx;
        cy += particlesArray[i].vy;
    }
    particlesArray[particlesArray.length-1].vx = -cx;
    particlesArray[particlesArray.length-1].vy = -cy;
    animate();
}

function animate() {
    ctx.beginPath();
    ctx.fillStyle = "#bbbbbb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    cx = cy = mass = 0;
    for (let i = 0; i < particlesArray.length; i++) {
        cx += particlesArray[i].x * particlesArray[i].weight;
        cy += particlesArray[i].y * particlesArray[i].weight;
        mass += particlesArray[i].weight;
    }
    cx /= mass;
    cy /= mass;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();
    for (let i = 0; i < particlesArray.length; i++) {
        let p = particlesArray[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        tracksArray[i].push({x: p.x, y: p.y});
        // Limit the length of the track
        if (tracksArray[i].length > L_TRACK) {
            tracksArray[i].shift();
        }
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        for (let j = tracksArray[i].length - 1; j >= 0; j--) {
            ctx.lineTo(tracksArray[i][j].x, tracksArray[i][j].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        for (let j=0; j<particlesArray.length; j++) {
            if (i !== j) {
                let p2 = particlesArray[j];
                let dx = p2.x - p.x;
                let dy = p2.y - p.y;
                let r2 = dx*dx + dy*dy;
                if (r2 < 10) r2 = 10; // Avoid division by zero
                let force = p.weight * p2.weight / r2;
                p.vx += dx * force;
                p.vy += dy * force;
            }
        }
    }
    for (let i = 0; i < particlesArray.length; i++) {
        let p = particlesArray[i];
        p.x += p.vx / p.weight;
        p.y += p.vy / p.weight;
    }
    requestAnimationFrame(animate);
}
