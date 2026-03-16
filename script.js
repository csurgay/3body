const DEBUG = 0;
let running = true;
let NO_PLANETS = 3;
const weights = [1, 1, 1, 1, 1, 1, 1, 1];
let canvas=null;
let ctx=null;
let bodies = [];
let tracks = [];
let future = [];
let L_TRACK = 200;
let L_FUTURE = 200;
const COLOR = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];
let cx = cy = 0;
let hotSpots = []; // x, y, type ("body" or "vector")
let dragged = -1; // Index of the dragged body or vector

class Body {   
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
    running = !running;
    if (DEBUG > 0) console.log('pause');
}

function main() {
    if (DEBUG > 0) console.log('main');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    for (let i = 1; i <= 8; i++) {
        document.getElementById("B" + i).style.color = COLOR[i-1];
    }
    window.addEventListener('keyup', function(event) {
        if (DEBUG > 0) console.log("key '" + event.key + "'");
        if (event.key == ' ') {
            pause();
        }
    });
    window.addEventListener('mousedown', function(event) {
        dragged = -1;
        if (!running) {
            let mx = event.clientX - canvas.getBoundingClientRect().left;
            let my = event.clientY - canvas.getBoundingClientRect().top;
            for (let i = 0; i < hotSpots.length; i++) {
                let hs = hotSpots[i];
                let dx = mx - hs.x;
                let dy = my - hs.y;
                if (dx*dx + dy*dy < 100) {
                    dragged = i;
                }
            }
        }
    });
    window.addEventListener('mouseup', function(event) {
        dragged = -1;
    });
    window.addEventListener('mousemove', function(event) {
        let mx = event.clientX - canvas.getBoundingClientRect().left;
        let my = event.clientY - canvas.getBoundingClientRect().top;
        if (dragged >= 0) {
            let hs = hotSpots[dragged];
            if (hs.type == "vector") {
                bodies[hs.i].vx = (mx - bodies[hs.i].x) / 100;
                bodies[hs.i].vy = (my - bodies[hs.i].y) / 100;
                adjustVectors((hs.i + 1) % bodies.length);
            }
            else if (hs.type == "body") {
                bodies[hs.i].x = mx;
                bodies[hs.i].y = my;
                adjustBodies((hs.i + 1) % bodies.length);
            }
        }
    });

    init();
    animate();
}

function init() {
    if (DEBUG > 0) console.log('init');
    bodies = [];
    tracks = [];
    future = [];
    // Get the number of planets from the input field
    NO_PLANETS = parseInt(document.getElementById('bodies').value);
    // Create random planets into bodies array
    for (let i = 0; i < NO_PLANETS; i++) {
        let x = canvas.width / 2 +(Math.random() - 0.5) * 200;
        let y = canvas.height / 2 +(Math.random() - 0.5) * 200;
        let color = COLOR[i];
        let weight = parseFloat(document.getElementById('b' + (i+1)).value);
        let size = 3 + 2 * weight;
        let vx = 1 * (Math.random() - 0.5);
        let vy = 1 * (Math.random() - 0.5);
        bodies.push(new Body(x, y, size, color, weight, vx, vy));
        tracks.push([]);
    }
    adjustBodies(bodies.length - 1);
    adjustVectors(bodies.length - 1);
}

function adjustVectors(j) {
    // Set the velocity of the last body to ensure the center of mass is stationary
    let vx = vy = 0;
    for (let i = 0; i < bodies.length; i++) {
        if (i != j) {
            vx += bodies[i].vx;
            vy += bodies[i].vy;
        }
    }
    bodies[j].vx = -vx;
    bodies[j].vy = -vy;
}

function adjustBodies(j) {
    // Set the position of the last body to ensure the center of mass is stationary
    cx = cy = 0;
    for (let i = 0; i < bodies.length; i++) {
        if (i != j) {
            cx += bodies[i].weight * (bodies[i].x - canvas.width / 2);
            cy += bodies[i].weight * (bodies[i].y - canvas.height / 2);
        }
    }
    bodies[j].x = -cx / bodies[j].weight + canvas.width / 2;
    bodies[j].y = -cy / bodies[j].weight + canvas.height / 2;
}

function animate() {
    if (running) {
        L_TRACK = parseInt(document.getElementById('track').value);
        for (let i = 0; i < document.getElementById("speed").value; i++) {
            bodies = JSON.parse(calc(JSON.stringify(bodies))); // Deep copy of bodies array
            // Add the current position to the track
            for (let i = 0; i < bodies.length; i++) {
                tracks[i].push({x: bodies[i].x, y: bodies[i].y});
                // Limit the length of the track
                while (tracks[i].length > L_TRACK) {
                    tracks[i].shift();
                }
            }
        }
    }
    draw();
    requestAnimationFrame(animate);
}

function calc(pbodies) {
    let tbodies = JSON.parse(pbodies); // Deep copy of bodies array
    // Calculate the new speed vectors from the gravitational forces between bodies
    for (let i = 0; i < tbodies.length; i++) {
        for (let j=0; j<tbodies.length; j++) {
            if (i !== j) {
                let p2 = tbodies[j];
                let dx = p2.x - tbodies[i].x;
                let dy = p2.y - tbodies[i].y;
                let r2 = dx*dx + dy*dy;
                if (r2 < 10) r2 = 10; // Avoid too large forces at close distances
                let force = tbodies[i].weight * p2.weight / r2;
                tbodies[i].vx += dx * force;
                tbodies[i].vy += dy * force;
            }
        }
    }
    // Update the positions of the bodies based on their speed vectors
    for (let i = 0; i < tbodies.length; i++) {
        tbodies[i].x += tbodies[i].vx / tbodies[i].weight;
        tbodies[i].y += tbodies[i].vy / tbodies[i].weight;
    }
    // Update the positions of the bodies based on their speed vectors
    for (let i = 0; i < tbodies.length; i++) {
        tbodies[i].x += tbodies[i].vx / tbodies[i].weight;
        tbodies[i].y += tbodies[i].vy / tbodies[i].weight;
    }
    return JSON.stringify(tbodies);
}

function draw() {
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
    // Clear canvas
    ctx.beginPath();
    ctx.fillStyle = "#bbbbbb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    // Draw center of canvas
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    // Draw center of mass
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#888888';
    ctx.fill();
    // Draw bodies and tracks
    hotSpots = [];
    for (let i = 0; i < bodies.length; i++) {
        let p = bodies[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        hotSpots.push({x: p.x, y: p.y, type: "body", i: i});
        // Draw track reverse
        if (running) {
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
    // Speed vector arrows when paused
    if (!running) {
        for (let i = 0; i < bodies.length; i++) {
            let p = bodies[i];
            drawArrow(p.x, p.y, p.x + p.vx * 100, p.y + p.vy * 100);
            hotSpots.push({x: p.x + p.vx * 100, y: p.y + p.vy * 100, type: "vector", i: i});
        }
        // Calculate future positions when paused
        future = [];
        let stringBodies = JSON.stringify(bodies);
        for (let step=0; step<document.getElementById("future").value; step++) {
            stringBodies = calc(stringBodies);
            future.push(stringBodies);
        }
        // Draw future tracks
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        for (let i = 0; i < bodies.length; i++) {
            ctx.beginPath();
            ctx.moveTo(bodies[i].x, bodies[i].y);
            for (let step=0; step<future.length; step++) {
                let fbodies = JSON.parse(future[step]);
                ctx.lineTo(fbodies[i].x, fbodies[i].y);
            }
            ctx.strokeStyle = bodies[i].color;
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
}

function drawArrow(fromx, fromy, tox, toy) {
    var headlen = 12;
    var angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = '#888888';
    ctx.stroke();
    ctx.beginPath
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 8), toy - headlen * Math.sin(angle - Math.PI / 8));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 8), toy - headlen * Math.sin(angle + Math.PI / 8));
    ctx.lineTo(tox, toy);
    ctx.fillStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.fill();
}
