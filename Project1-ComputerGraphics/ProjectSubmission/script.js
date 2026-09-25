// Project 1 - Pinhole Camera
// Game: Starstrike
// Author: Dominic Rowland
//
// Project Version

// === Canvas Creation ===
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = 320;
const HEIGHT = 200;
const PIXEL_SIZE = 5;

canvas.width = WIDTH * PIXEL_SIZE;
canvas.height = HEIGHT * PIXEL_SIZE;
ctx.imageSmoothingEnabled = false;

// === Background music ===
const music = new Audio("ArthurVyncke-AFewJumpsAway.mp3");
music.loop = true;
music.volume = 0.4;
music.preload = "auto";

let musicStarted = false;

// === Game Variables ===
let screenNum = 0;

const keys = {};

let score = 0;
let scrollSpeed = 2;

let stars = [];
let asteroids = [];
let walls = [];

// === Camera Position ===
let camera = {
    x: 0,
    y: 0,
    z: 0
};

// === Color + Depth Buffers ===
let colorBuffer = [];
let depthBuffer = [];

function clearBuffers() {
    colorBuffer = [];
    depthBuffer = [];
    for (let y = 0; y < HEIGHT; y++) {
        colorBuffer[y] = [];
        depthBuffer[y] = [];
        for (let x = 0; x < WIDTH; x++) {
            colorBuffer[y][x] = "#050510";
            depthBuffer[y][x] = Infinity;
        }
    }
}

// === Camera ===
function project(point) {
    const x = point[0];
    const y = point[1];
    const z = point[2];

    if (z <= 0.1) {
        return null;
    }

    const focalLength = 90;
    const screenX = (x * focalLength / z) + WIDTH / 2;
    const screenY = (-y * focalLength / z) + HEIGHT / 2;
    return [screenX, screenY, z];
}

// === Triangle Rasterization ===
function edgeFunction(a, b, c) {
    return ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0]));
}

// === Fill Triangle ===
function fillTriangle(a, b, c, color) {
    const area = edgeFunction(a, b, c);
    if (area === 0) {
        return;
    }

    // Find bounding box
    const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
    const maxX = Math.min(WIDTH - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
    const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
    const maxY = Math.min(HEIGHT - 1,  Math.ceil(Math.max(a[1], b[1], c[1])));

    // Check every pixel in the triangle's
    // bounding box
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const pixel = [
                x + 0.5,
                y + 0.5
            ];
            const w0 = edgeFunction(b, c, pixel);
            const w1 = edgeFunction(c, a, pixel);
            const w2 = edgeFunction(a, b, pixel);

            // Is the pixel inside the triangle?
            const inside = (w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0);
            if (!inside) {
                continue;
            }

            // Barycentric coordinates
            const alpha = w0 / area;
            const beta = w1 / area;
            const gamma = w2 / area;

            // Interpolate depth
            const depth = alpha * a[2] + beta * b[2] + gamma * c[2];

            // Depth test
            if (depth < depthBuffer[y][x]) {
                depthBuffer[y][x] = depth;
                colorBuffer[y][x] = color;
            }
        }
    }
}

// === Shape Drawing ===
function drawObject(object, vertices, triangles, colors) {
    const projectedVertices = [];
    for (const vertex of vertices) {
        const worldVertex = [
            object.x + vertex[0] * object.scale - camera.x,
            object.y + vertex[1] * object.scale - camera.y,
            object.z + vertex[2] * object.scale
        ];

        projectedVertices.push(
            project(worldVertex)
        );
    }

    for (let i = 0; i < triangles.length; i++) {
        const triangle = triangles[i];
        const a = projectedVertices[triangle[0]];
        const b = projectedVertices[triangle[1]];
        const c = projectedVertices[triangle[2]];

        if (!a || !b || !c) {
            continue;
        }

        fillTriangle(a, b, c, colors[i % colors.length]);
    }
}

// === Asteroid ===
const asteroidVertices = [
    // Front ring
    [-1.0, 0.0, -0.5],
    [-0.5, 0.8, -0.5],
    [0.5, 0.8, -0.5],
    [1.0, 0.0, -0.5],
    [0.5, -0.8, -0.5],
    [-0.5, -0.8, -0.5],

    // Back ring
    [-0.8, 0.0, 0.7],
    [-0.4, 0.7, 0.7],
    [0.4, 0.7, 0.7],
    [0.8, 0.0, 0.7],
    [0.4, -0.7, 0.7],
    [-0.4, -0.7, 0.7],

    // Front center
    [0, 0, -0.8],

    // Back center
    [0, 0, 1.0]
];

const asteroidTriangles = [
    // Front
    [12, 0, 1],
    [12, 1, 2],
    [12, 2, 3],
    [12, 3, 4],
    [12, 4, 5],
    [12, 5, 0],

    // Sides
    [0, 6, 7],
    [0, 7, 1],

    [1, 7, 8],
    [1, 8, 2],

    [2, 8, 9],
    [2, 9, 3],

    [3, 9, 10],
    [3, 10, 4],

    [4, 10, 11],
    [4, 11, 5],

    [5, 11, 6],
    [5, 6, 0],

    // Back
    [13, 7, 6],
    [13, 8, 7],
    [13, 9, 8],
    [13, 10, 9],
    [13, 11, 10],
    [13, 6, 11]
];

const asteroidColors = [
    "#9c9c9c",
    "#858585",
    "#aaaaaa",
    "#777777",
    "#969696",
    "#707070",

    "#626262",
    "#737373",
    "#858585",
    "#696969",
    "#7e7e7e",
    "#5e5e5e",

    "#929292",
    "#6d6d6d",
    "#818181",
    "#5b5b5b",
    "#8a8a8a",
    "#686868",

    "#777777",
    "#606060",
    "#898989",
    "#6c6c6c",
    "#808080",
    "#555555"
];

function createAsteroid() {
    return {
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 9,
        z: 50 + Math.random() * 30,
        scale: 0.5 + Math.random() * 0.7,
        speed: 0.08 + Math.random() * 0.06
    };
}

function createAsteroids() {
    asteroids = [];
    for (let i = 0; i < 8; i++) {
        asteroids.push(
            createAsteroid()
        );
    }
}

// === Star ===
const starVertices = [
    // Front point
    [0, 0, -1],

    // Outer points
    [0, 1.2, 0],
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
    [0, 0, 1]
];

const starTriangles = [
    // Front
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 4],
    [0, 4, 5],
    [0, 5, 6],
    [0, 6, 7],
    [0, 7, 8],
    [0, 8, 9],
    [0, 9, 10],
    [0, 10, 1],

    // Back
    [11, 2, 1],
    [11, 3, 2],
    [11, 4, 3],
    [11, 5, 4],
    [11, 6, 5],
    [11, 7, 6],
    [11, 8, 7],
    [11, 9, 8],
    [11, 10, 9],
    [11, 1, 10]
];

const starColors = [

    "#fde047",
    "#facc15",
    "#fbbf24",
    "#fde68a",
    "#f59e0b"
];

function createStar() {
    return {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 5,
        z: 40 + Math.random() * 30,
        scale: 0.3 + Math.random() * 0.5,
        speed: 0.08 + Math.random() * 0.04
    };
}

function createStars() {
    stars = [];
    for (let i = 0; i < 4; i++) {
        stars.push(
            createStar()
        );
    }
}

// === Wall ===
const wallVertices = [
    // Front
    [-1, -1, -0.25],
    [1, -1, -0.25],
    [1, 1, -0.25],
    [-1, 1, -0.25],

    // Back
    [-1, -1, 0.25],
    [1, -1, 0.25],
    [1, 1, 0.25],
    [-1, 1, 0.25]
];

const wallTriangles = [
    // Front
    [0, 1, 2],
    [0, 2, 3],

    // Back
    [4, 6, 5],
    [4, 7, 6],

    // Left
    [0, 3, 7],
    [0, 7, 4],

    // Right
    [1, 5, 6],
    [1, 6, 2],

    // Top
    [3, 2, 6],
    [3, 6, 7],

    // Bottom
    [0, 4, 5],
    [0, 5, 1]
];

const wallColors = [
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#991b1b"
];

function createWall() {
    return {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 6,
        z: 50 + Math.random() * 30,
        scale: 0.7 + Math.random() * 1.0,
        speed: 0.08 + Math.random() * 0.04
    };
}

function createWalls() {
    walls = [];
    for (let i = 0; i < 3; i++) {
        walls.push(
            createWall()
        );
    }
}


// === Background Stars ===
let backgroundStars = [];

function createBackgroundStars() {
    backgroundStars = [];
    for (let i = 0; i < 60; i++) {
        backgroundStars.push({
            x: (Math.random() - 0.5) * 40,
            y: (Math.random() - 0.5) * 25,
            z: 100 + Math.random() * 200,
            speed: 0.08 + Math.random() * 0.04
        });
    }
}

function drawBackgroundStars() {
    for (const star of backgroundStars) {
        const point = project([
            star.x - camera.x,
            star.y - camera.y,
            star.z
        ]);

        if (!point) {
            continue;
        }

        const x = Math.round(point[0]);
        const y = Math.round(point[1]);

        if (
            x >= 0 &&
            x < WIDTH &&
            y >= 0 &&
            y < HEIGHT
        ) {
            colorBuffer[y][x] = "#ffffff";
        }
    }
}


// === Collisions ===
function checkCameraCollision(object, radius) {
    const xDistance = Math.abs(object.x - camera.x);
    const yDistance = Math.abs(object.y - camera.y);
    return (
        xDistance < radius &&
        yDistance < radius &&
        object.z < 1.5
    );
}

// === Change the scroll speed ===
function ChangeSpeed(newSpeed) {
    for (const star of stars) {
        star.speed =
            (star.speed / scrollSpeed) *
            newSpeed;
    }

    for (const asteroid of asteroids) {
        asteroid.speed =
            (asteroid.speed / scrollSpeed) *
            newSpeed;
    }

    for (const wall of walls) {
        wall.speed =
            (wall.speed / scrollSpeed) *
            newSpeed;
    }

    for (const star of backgroundStars) {
        star.speed =
            (star.speed / scrollSpeed) *
            newSpeed;
    }
    scrollSpeed = newSpeed;
}


// === Reset ===
function resetGame() {
    ChangeSpeed(2);

    camera.x = 0;
    camera.y = 0;
    camera.z = 0;

    screenNum = 0;
    score = 0;

    stars = [];
    asteroids = [];
    walls = [];

    document.getElementById("endscreen").style.display = "none";
    document.getElementById("titlescreen").style.display = "block";

    titlescreen.classList.remove("fadeout");
}


// === Start Game ===
function startGame() {
    if (!musicStarted) {
        music.play().catch(function() {});
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


// === End Game ===
function endGame() {
    document.getElementById("endscreen").style.display = "block";
    document.getElementById("starscollectedtext").textContent = "Stars Collected: " + score;
    screenNum = 2;
}

// === Buttons ===
document.getElementById("startbutton").addEventListener("click", startGame);
document.getElementById("exitbutton").addEventListener("click", resetGame);

// === Keydown ===
document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;

    if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "Enter"
    ) {
        event.preventDefault();
    }

    // Start
    if (screenNum === 0) {
        if (
            event.key.toLowerCase() === "enter"
        ) {
            startGame();
        }
    }

    // Restart after death
    else if (screenNum === 2) {
        if (
            event.key.toLowerCase() === "enter"
        ) {
            resetGame();
        }
    }

    // Reset
    if (
        event.key.toLowerCase() === "r"
    ) {
        resetGame();
    }
});


document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});


// === Moves the Camera ===
function updateCamera() {
    const speed = 0.025;
    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        camera.x -= speed;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        camera.x += speed;
    }

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        camera.y += speed;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        camera.y -= speed;
    }

    // Keep camera inside the viewing area
    const maxX = WIDTH / 2 / 90 * camera.z + 4;
    const maxY = HEIGHT / 2 / 90 * camera.z + 3;

    if (camera.x < -maxX) {
        camera.x = -maxX;
    }

    if (camera.x > maxX) {
        camera.x = maxX;
    }

    if (camera.y < -maxY) {
        camera.y = -maxY;
    }

    if (camera.y > maxY) {
        camera.y = maxY;
    }
}


// === Updates the game loop
function update() {
    if (screenNum !== 1) {
        return;
    }

    // Move camera
    updateCamera();

    // Stars
    for (const star of stars) {
        star.z -= star.speed;

        // Collect star
        if (
            checkCameraCollision(
                star,
                star.scale
            )
        ) {
            score++;
            const speedIncrease = 0.01;
            const newSpeed = 0.5 + score * speedIncrease;
            ChangeSpeed(newSpeed);

            // Respawn
            star.x = (Math.random() - 0.5) * 8;
            star.y = (Math.random() - 0.5) * 5;
            star.z = 40 + Math.random() * 30;
        }

        // Missed star
        if (star.z < -5) {
            star.x = (Math.random() - 0.5) * 8;
            star.y = (Math.random() - 0.5) * 5;
            star.z = 40 + Math.random() * 30;
        }
    }


    // Asteroid
    for (const asteroid of asteroids) {
        asteroid.z -= asteroid.speed;

        // Asteroid reached camera
        if (
            checkCameraCollision(
                asteroid,
                asteroid.scale
            )
        ) {
            endGame();
            return;
        }

        // Respawn
        if (asteroid.z < -5) {
            asteroid.x = (Math.random() - 0.5) * 14;
            asteroid.y = (Math.random() - 0.5) * 9;
            asteroid.z = 50 + Math.random() * 30;
            asteroid.scale = 0.5 + Math.random() * 0.7;
        }
    }


    // Walls
    for (const wall of walls) {
        wall.z -= wall.speed;

        // Wall reached camera
        if (
            checkCameraCollision(
                wall,
                wall.scale
            )
        ) {
            endGame();
            return;
        }

        // Respawn
        if (wall.z < -5) {
            wall.x = (Math.random() - 0.5) * 8;
            wall.y = (Math.random() - 0.5) * 6;
            wall.z = 50 + Math.random() * 30;
            wall.scale = 0.7 + Math.random() * 1.0;
        }
    }


    // Background Stars
    for (const star of backgroundStars) {
        star.z -= star.speed;

        if (star.z < 1) {
            star.x = (Math.random() - 0.5) * 40;
            star.y = (Math.random() - 0.5) * 25;
            star.z = 100 + Math.random() * 200;
        }
    }
}


// === Draw objects to screen ===
function draw() {
    // Clear the 320x200 buffers
    clearBuffers();

    // Decorative background
    drawBackgroundStars();

    // Asteroids
    for (const asteroid of asteroids) {
        drawObject(
            asteroid,
            asteroidVertices,
            asteroidTriangles,
            asteroidColors
        );
    }

    // Stars
    for (const star of stars) {
        drawObject(
            star,
            starVertices,
            starTriangles,
            starColors
        );
    }

    // Walls
    for (const wall of walls) {
        drawObject(
            wall,
            wallVertices,
            wallTriangles,
            wallColors
        );
    }

    // Draw the 320x200 Buffer
    ctx.fillStyle = "#050510";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const color = colorBuffer[y][x];

            if (color === "#050510") {
                continue;
            }
            ctx.fillStyle = color;
            ctx.fillRect(
                x * PIXEL_SIZE,
                y * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE
            );
        }
    }

    // Score
    document.getElementById("scoretext").textContent = "Stars: " + score;
}


// === Game Loop ===
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start of the program
createBackgroundStars();
gameLoop();