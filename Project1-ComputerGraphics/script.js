// Project 1 - Pinhole Camera
// Game: Starstrike
// Author: Dominic Rowland

// === Canvas Creation ===
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Make the canvas fill the browser
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// === Background music ===
const music = new Audio("ArthurVyncke-AFewJumpsAway.mp3");
music.loop = true;
music.volume = 0.4;
music.preload = "auto";
let musicStarted = false;

// === Game Variables ===
let screenNum = 0
const keys = {};

let score = 0;
let scrollSpeed = 2;

let BackgroundStars = [];
let stars = [];
let asteroids = [];
let walls = [];

// === Object Data ===
let shipPosition = {
    x: 0,
    y: 0,
    z: 0.5,
};

// Starbolt
const shipVertices = [
    // 2D PLANE
    // Haul
    [2, 2, 0],
    [2.5, 1.5, 0],
    [2.5, -1.5, 0],
    [2, -2, 0],
    [-2, -2, 0],
    [-2.5, -1.5, 0],
    [-2.5, 1.5, 0],
    [-2, 2, 0],

    // Left Wing
    [-2.5, 1.5, 0],
    [-4, 0.25, 0],
    [-10, -1.5, 0],
    [-10, -2.25, 0],
    [-7.5, -1.75, 0],
    [-7, -2.5, 0],
    [-5, -2.5, 0],
    [-4, -1.5, 0],

    // Right Wing
    [2.5, 1.5, 0],
    [4, 0.25, 0],
    [10, -1.5, 0],
    [10, -2.25, 0],
    [7.5, -1.75, 0],
    [7, -2.5, 0],
    [5, -2.5, 0],
    [4, -1.5, 0],

    // Top Wing
    [-0.5, 2, 0],
    [-0.5, 5, 0],
    [0, 6, 0],
    [0.5, 5, 0],
    [0.5, 2, 0],

    // 3D PLANE
    // Top Wing
    [0, 2, 2.5],

    // Haul
    [2, 2, 3],
    [2.5, 1.5, 3],
    [2.5, -1.5, 3],
    [2, -2, 3],
    [-2, -2, 3],
    [-2.5, -1.5, 3],
    [-2.5, 1.5, 3],
    [-2, 2, 3],

    [0.5, 0, 4],
    [-0.5, 0, 4],

    [0, 0, 0]
];

// Starbolt edges
const shipEdges = [
    // 2D PLANE
    // Haul
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 0],

    // Left Wing
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    [12, 13],
    [13, 14],
    [14, 15],
    [15, 5],

    // Right Wing
    [16, 17],
    [17, 18],
    [18, 19],
    [19, 20],
    [20, 21],
    [21, 22],
    [22, 23],
    [23, 2],

    // Top Wing
    [24, 25],
    [25, 26],
    [26, 27],
    [27, 28],

    // 3D PLANE
    // Top Wing
    [24, 29],
    [25, 29],
    [26, 29],
    [27, 29],
    [28, 29],

    // Haul
    [0, 30],
    [1, 31],
    [2, 32],
    [3, 33],
    [4, 34],
    [5, 35],
    [6, 36],
    [7, 37],

    // Haul 2D Back
    [30, 31],
    [31, 32],
    [32, 33],
    [33, 34],
    [34, 35],
    [35, 36],
    [36, 37],
    [37, 30],
    
    // Haul to Nose
    [38, 39],
    [30, 38],
    [31, 38],
    [32, 38],
    [33, 38],
    [34, 39],
    [35, 39],
    [36, 39],
    [37, 39],

    // Right Wing
    [16, 32],
    [17, 32],
    [18, 32],
    [19, 32],
    [20, 32],
    [21, 32],
    [22, 32],
    [23, 32],

    // Left Wing
    [8, 35],
    [9, 35],
    [10, 35],
    [11, 35],
    [12, 35],
    [13, 35],
    [14, 35],
    [15, 35],
];

// Asteroid shape
const asteroidVertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],

    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],

    [0, -1.3, 0],
    [0, 1.3, 0],
    [-1.3, 0, 0],
    [1.3, 0, 0]
];

// Asteroid edges
const asteroidEdges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],

    [0, 8],
    [1, 8],
    [4, 8],
    [5, 8],

    [2, 9],
    [3, 9],
    [6, 9],
    [7, 9],

    [0, 10],
    [3, 10],
    [4, 10],
    [7, 10],

    [1, 11],
    [2, 11],
    [5, 11],
    [6, 11]
];

// Create an asteroid
function createAsteroid() {
    return {
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 9,
        z: 200 + Math.random() * 15,
        size: 0.5 + Math.random() * 0.7,
        speed: 0.08 + (Math.random() * 0.06)
    };
}

// Create starting asteroids
function createAsteroids() {
    asteroids = [];
    for (let i = 0; i < 8; i++) {
        asteroids.push(createAsteroid());
    }
}

// STAR
// A 3D star made from two 5-point pyramids
const starVertices = [
    // Front point
    [0, 0, 1],

    // Outer points
    [0, 1.2, 0], // Topmost point
    [0.3, 0.3, 0],
    [1.1, 0.3, 0],
    [0.45, -0.2, 0],
    [0.7, -1, 0],
    [0, -0.45, 0],
    [-0.7, -1, 0],
    [-0.45, -0.2, 0],
    [-1.1, 0.3, 0],
    [-0.3, 0.3, 0],

    // Back point
    [0, 0, -1]
];

// Star edges
const starEdges = [
    // Front star
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
    [0, 10],

    // Outer shape
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 1],

    // Back Star
    [11, 1],
    [11, 2],
    [11, 3],
    [11, 4],
    [11, 5],
    [11, 6],
    [11, 7],
    [11, 8],
    [11, 9],
    [11, 10]
];

// Create a star
function createStar() {
    const z = 200 + Math.random() * 20;

    // Calculate the screen bounds at z = 0.5
    const focalLength = 300;
    const maxX = (canvas.width / 2) * 0.5 / focalLength;
    const maxY = (canvas.height / 2) * 0.5 / focalLength;

    return {
        x: (Math.random() * 2 - 1) * maxX,
        y: (Math.random() * 2 - 1) * maxY,
        z: z,
        size: 0.3 + Math.random() * 0.5,
        speed: 0.08 + (Math.random() * 0.04)
    };
}

function createBackgroundStar() {
    const z = 300 + Math.random() * 20;
    const focalLength = 300;

    // Window bounds at z = 0.5
    const minX = (canvas.width / 2) * 0.5 / focalLength;
    const minY = (canvas.height / 2) * 0.5 / focalLength;

    // Window bounds at the star's spawn distance
    const maxX = (canvas.width / 2) * z / focalLength;
    const maxY = (canvas.height / 2) * z / focalLength;

    let x;
    let y;

    // Spawn inside the window now,
    // but outside the window at z = 0.5
    do {
        x = (Math.random() * 2 - 1) * maxX;
        y = (Math.random() * 2 - 1) * maxY;
    } while (
        Math.abs(x) < minX &&
        Math.abs(y) < minY
    );

    return {
        x: x,
        y: y,
        z: z,
        size: 0.3 + Math.random() * 0.5,
        speed: 0.08 + (Math.random() * 0.04)
    };
}

// Create starting stars
function createStars() {
    stars = [];
    for (let i = 0; i < 4; i++) {
        stars.push(createStar());
    }
}

function createBackgroundStars() {
    BackgroundStars = [];
    for (let i = 0; i < 50; i++) {
        BackgroundStars.push(createBackgroundStar());
    }
}

// WALL
// A 3D rectangular box.
// The large face points toward the camera.
// The small Z dimension gives it thickness.
const wallVertices = [
    // Front face
    [-1, -1, 0.25],
    [1, -1, 0.25],
    [1, 1, 0.25],
    [-1, 1, 0.25],

    // Back face
    [-1, -1, -0.25],
    [1, -1, -0.25],
    [1, 1, -0.25],
    [-1, 1, -0.25]
];

// Wall edges
const wallEdges = [
    // Front
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],

    // Back
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],

    // Depth
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
];

// Create a wall
function createWall() {
    return {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 4,
        z: 200 + (Math.random() * 20),
        width: Math.random() * 1.5,
        height: Math.random() * 1.5,
        speed: 0.08 + (Math.random() * 0.04)
    };
}

// Create starting walls
function createWalls() {
    walls = [];
    for (let i = 0; i < 3; i++) {
        walls.push(createWall());
    }
}

// Project a 3D point
function project(point) {
    const x = point[0];
    const y = point[1];
    const z = point[2];
    const focalLength = 300;

    if (z <= 0.1) {
        return null;
    }

    const screenX = (x * focalLength / z) + canvas.width / 2;
    const screenY = (-y * focalLength / z) + canvas.height / 2;
    return [screenX, screenY];
}

// Draw Starbolt
function drawShip() {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    const shipScale = 0.025;
    for (const edge of shipEdges) {
        const point1 = project([
            shipVertices[edge[0]][0] * shipScale + shipPosition.x,
            shipVertices[edge[0]][1] * shipScale + shipPosition.y,
            shipVertices[edge[0]][2] * shipScale + shipPosition.z
        ]);
        const point2 = project([
            shipVertices[edge[1]][0] * shipScale + shipPosition.x,
            shipVertices[edge[1]][1] * shipScale + shipPosition.y,
            shipVertices[edge[1]][2] * shipScale + shipPosition.z
        ]);
        if (!point1 || !point2) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
    }
}

// Draw one asteroid
function drawAsteroid(asteroid) {
    ctx.strokeStyle = "#a8a29e";
    ctx.lineWidth = 2;
    for (const edge of asteroidEdges) {
        const vertex1 = asteroidVertices[edge[0]];
        const vertex2 = asteroidVertices[edge[1]];
        const point1 = project([
            asteroid.x + vertex1[0] * asteroid.size,
            asteroid.y + vertex1[1] * asteroid.size,
            asteroid.z + vertex1[2] * asteroid.size
        ]);
        const point2 = project([
            asteroid.x + vertex2[0] * asteroid.size,
            asteroid.y + vertex2[1] * asteroid.size,
            asteroid.z + vertex2[2] * asteroid.size
        ]);
        if (!point1 || !point2) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
    }
}

// Draw one star
function drawStar(star, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (const edge of starEdges) {
        const vertex1 = starVertices[edge[0]];
        const vertex2 = starVertices[edge[1]];
        const point1 = project([
            star.x + vertex1[0] * star.size,
            star.y + vertex1[1] * star.size,
            star.z + vertex1[2] * star.size
        ]);
        const point2 = project([
            star.x + vertex2[0] * star.size,
            star.y + vertex2[1] * star.size,
            star.z + vertex2[2] * star.size
        ]);
        if (!point1 || !point2) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
    }
}

// Draw one wall
function drawWall(wall) {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    for (const edge of wallEdges) {
        const vertex1 = wallVertices[edge[0]];
        const vertex2 = wallVertices[edge[1]];
        const point1 = project([
            wall.x + vertex1[0] * wall.width,
            wall.y + vertex1[1] * wall.height,
            wall.z + vertex1[2]
        ]);
        const point2 = project([
            wall.x + vertex2[0] * wall.width,
            wall.y + vertex2[1] * wall.height,
            wall.z + vertex2[2]
        ]);
        if (!point1 || !point2) {
            continue;
        }
        ctx.beginPath();
        ctx.moveTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
    }
}

// Check asteroid collision
function checkCollision(asteroid) {
    const xDistance =
        Math.abs(asteroid.x - shipPosition.x);
    const yDistance =
        Math.abs(asteroid.y - shipPosition.y);
    const zDistance =
        Math.abs(asteroid.z - shipPosition.z);

    // Use the actual asteroid size
    const collisionRadius =
        asteroid.size;

    if (xDistance < collisionRadius && yDistance < collisionRadius && zDistance < collisionRadius + 0.8) {
        return true;
    }
    return false;
}

// Check if Starbolt hit a star
function checkStarCollision(star) {
    const xDistance = Math.abs(star.x - shipPosition.x);
    const yDistance = Math.abs(star.y - shipPosition.y);
    const zDistance = Math.abs(star.z - shipPosition.z);
    const collisionRadius = star.size;

    if (xDistance < collisionRadius && yDistance < collisionRadius && zDistance < collisionRadius)
    {
        return true;
    }
    return false;
}

// Check if Starbolt hit a wall
function checkWallCollision(wall) {
    const xDistance =
        Math.abs(wall.x - shipPosition.x);
    const yDistance =
        Math.abs(wall.y - shipPosition.y);
    const zDistance =
        Math.abs(wall.z - shipPosition.z);
    if (xDistance < wall.width && yDistance < wall.height && zDistance < 2.0) {
        return true;
    }
    return false;
}

// Change all Objects Speed
function ChangeSpeed(newSpeed) {
    for (const star of stars) {
        star.speed = (star.speed / scrollSpeed) * newSpeed
    }
    for (const asteroid of asteroids) {
        asteroid.speed = (asteroid.speed / scrollSpeed) * newSpeed
    }
    for (const wall of walls) {
        wall.speed = (wall.speed / scrollSpeed) * newSpeed
    }
    for (const star of BackgroundStars) {
        star.speed = (star.speed / scrollSpeed) * newSpeed
    }
    scrollSpeed = newSpeed
}

// Reset Game
function resetGame() {
    ChangeSpeed(2);
    shipPosition.x = 0;
    shipPosition.y = 0;
    shipPosition.z = 0.5;
    screenNum = 0
    score = 0;
    stars = [];
    asteroids = [];
    walls = [];
    document.getElementById("endscreen").style.display = "none";
    document.getElementById("titlescreen").style.display = "block";
    titlescreen.classList.remove("fadeout");
}

// Start the game
function startGame() {
    // Start music after first interaction
    if (!musicStarted) {
        music.play().catch(function() {
            // Browser blocked audio
        });
        musicStarted = true;
    }
    screenNum = 1;
    document.getElementById("titlescreen").classList.add("fadeout");
    createAsteroids();
    createStars();
    createWalls();

    infotext.classList.add("show");
    setTimeout(function() {
        infotext.classList.remove("show");
        infotext2.classList.add("show");
        setTimeout(function() {
            infotext2.classList.remove("show");
            ChangeSpeed(0.5);
        }, 3000);
    }, 3000);
}

// End the game
function endGame() {
    document.getElementById("endscreen").style.display = "block";
    document.getElementById("starscollectedtext").textContent = "Stars Collected: " + score;
    screenNum = 2
}

document.getElementById("startbutton").addEventListener("click", startGame);
document.getElementById("exitbutton").addEventListener("click", resetGame);

// Key pressed
document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;

    // Prevent arrow keys from scrolling the page
    if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
    }

    if (screenNum == 0) {
        // Enter Key
        if (event.key.toLowerCase() === "enter") {
            startGame();
        }
    }
    else if (screenNum == 2) {
        // Enter Key
        if (event.key.toLowerCase() === "enter") {
            resetGame()
        }
    }

    // Reset
    if (event.key.toLowerCase() === "r") {
        resetGame();
    }
});


// Key released
document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

// Move Starbolt
function updateShip() {
    const speed = 0.025;

    // Left
    if (keys["a"] || keys["arrowleft"]) {
        shipPosition.x -= speed;
    }

    // Right
    if (keys["d"] || keys["arrowright"]) {
        shipPosition.x += speed;
    }

    // Up
    if (keys["w"] || keys["arrowup"]) {
        shipPosition.y += speed;
    }

    // Down
    if (keys["s"] || keys["arrowdown"]) {
        shipPosition.y -= speed;
    }

    // Keep Starbolt inside the screen
    const focalLength = 300;
    const maxX = (canvas.width / 2) * shipPosition.z / focalLength;
    const maxY = (canvas.height / 2) * shipPosition.z / focalLength;

    if (shipPosition.x < -maxX) {
        shipPosition.x = -maxX;
    }

    if (shipPosition.x > maxX) {
        shipPosition.x = maxX;
    }

    if (shipPosition.y < -maxY) {
        shipPosition.y = -maxY;
    }

    if (shipPosition.y > maxY) {
        shipPosition.y = maxY;
    }
}

// Update game
function update() {
    if (screenNum == 1) {
        // Move ship
        updateShip();

        // Move stars
        for (const star of stars) {
            star.z -= star.speed;

            // Hit star
            if (checkStarCollision(star)) {
                score++;
                const speedIncrease = 0.01;
                newSpeed = 0.5 + (score * speedIncrease);
                ChangeSpeed(newSpeed);
                const z = 50 + Math.random() * 20;
                const focalLength = 300;
                const maxX = (canvas.width / 2) * 0.5 / focalLength;
                const maxY = (canvas.height / 2) * 0.5 / focalLength;
                star.x = (Math.random() * 2 - 1) * maxX;
                star.y = (Math.random() * 2 - 1) * maxY;
                star.z = z;
            }

            // Respawn
            if (star.z < -5) {
                const z = 50 + Math.random() * 20;
                const focalLength = 300;
                const maxX = (canvas.width / 2) * 0.5 / focalLength;
                const maxY = (canvas.height / 2) * 0.5 / focalLength;
                star.x = (Math.random() * 2 - 1) * maxX;
                star.y = (Math.random() * 2 - 1) * maxY;
                star.z = z;
            }
        }

        // Move asteroids
        for (const asteroid of asteroids) {
            asteroid.z -= asteroid.speed;
            // Collision
            if (checkCollision(asteroid)) {
                endGame();
                return;
            }
            // Respawn
            if (asteroid.z < -5) {
                asteroid.x = (Math.random() - 0.5) * 14;
                asteroid.y = (Math.random() - 0.5) * 9;
                asteroid.z = 50 + Math.random() * 15;
                asteroid.size = 0.5 + Math.random() * 0.7;
            }
        }

        // Move walls
        for (const wall of walls) {
            wall.z -= wall.speed;
            // Hit wall
            if (checkWallCollision(wall)) {
                endGame();
                return;
            }
            // Respawn
            if (wall.z < -5) {
                wall.x = (Math.random() - 0.5) * 12;
                wall.y = (Math.random() - 0.5) * 7;
                wall.z = 50 + Math.random() * 20;
                wall.width = Math.random() * 1.5;
                wall.height = Math.random() * 1.5;
            }
        }
    }

    // Move background stars
    for (const star of BackgroundStars) {
        star.z -= star.speed;

        // Respawn
        if (star.z < -5) {
            const z = 300 + Math.random() * 20;
            const focalLength = 300;

            const minX = (canvas.width / 2) * 0.5 / focalLength;
            const minY = (canvas.height / 2) * 0.5 / focalLength;

            const maxX = (canvas.width / 2) * z / focalLength;
            const maxY = (canvas.height / 2) * z / focalLength;

            let x;
            let y;

            do {
                x = (Math.random() * 2 - 1) * maxX;
                y = (Math.random() * 2 - 1) * maxY;
            } while (
                Math.abs(x) < minX &&
                Math.abs(y) < minY
            );

            star.x = x;
            star.y = y;
            star.z = z;
        }
    }
}


// Draw everything
function draw() {
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    for (const wall of walls) {
        drawWall(wall);
    }

    // Draw asteroids
    for (const asteroid of asteroids) {
        drawAsteroid(asteroid);
    }

    // Draw stars
    for (const star of stars) {
        drawStar(star, "#facc15");
    }

    // Draw Background stars
    for (const star of BackgroundStars) {
        drawStar(star, "#ffffff");
    }

    // Draw Starbolt
    drawShip();

    // Score
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";

    document.getElementById("scoretext").textContent = "Stars: " + score;
}


// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


// Start
createBackgroundStars();
gameLoop();