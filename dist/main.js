"use strict";
class AssetLoader {
    constructor() {
        this.images = new Map();
    }
    async load(list) {
        const entries = Object.entries(list);
        await Promise.all(entries.map(([key, src]) => this.loadImage(key, src)));
    }
    get(key) {
        return this.images.get(key);
    }
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                this.images.set(key, image);
                resolve();
            };
            image.onerror = () => reject(new Error(`Failed to load asset: ${src}`));
        });
    }
}
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRID_SIZE = 64;
const START_LIVES = 10;
const START_MONEY = 200;
const pathPoints = [
    { x: 0, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 400 },
    { x: 200, y: 400 },
    { x: 200, y: 600 },
    { x: 400, y: 600 },
    { x: 400, y: 300 },
    { x: 600, y: 300 },
    { x: 600, y: 500 },
    { x: 800, y: 500 },
    { x: 800, y: 200 },
    { x: 1000, y: 200 },
    { x: 1000, y: 400 },
    { x: 1200, y: 400 },
];
const assetPaths = {
    background: "./assets/background.png",
    path: "./assets/path.png",
    tower: "./assets/guard_idle.png",
    enemyWalkN: "./assets/walkN.png",
    enemyWalkS: "./assets/walkS.png",
    enemyWalkE: "./assets/walkE.png",
    enemyWalkO: "./assets/walkO.png",
    projectile: "./assets/projectile.png",
    allyCastle: "./assets/allyCastle.png",
    enemyCastle: "./assets/enemyCastle.png",
};
const assets = new AssetLoader();
function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
class Enemy {
    constructor(start) {
        this.pathIndex = 0;
        this.speed = 80;
        this.maxHealth = 5;
        this.health = 5;
        this.radius = 18;
        this.progress = 0;
        this.frame = 0;
        this.frameTimer = 0;
        this.currentSprite = "enemyWalkE";
        this.frameWidth = 64;
        this.frameHeight = 64;
        this.frameCount = 8;
        this.animationSpeed = 0.1;
        this.position = { ...start };
    }
    update(delta) {
        const target = pathPoints[this.pathIndex + 1];
        if (!target)
            return;
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const distanceToTarget = Math.hypot(dx, dy);
        const travel = this.speed * delta;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.currentSprite = dx > 0 ? "enemyWalkE" : "enemyWalkO";
        }
        else {
            this.currentSprite = dy > 0 ? "enemyWalkS" : "enemyWalkN";
        }
        if (travel >= distanceToTarget) {
            this.position = { ...target };
            this.pathIndex += 1;
        }
        else {
            this.position.x += (dx / distanceToTarget) * travel;
            this.position.y += (dy / distanceToTarget) * travel;
        }
        this.frameTimer += delta;
        if (this.frameTimer >= this.animationSpeed) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }
        const totalDistance = pathPoints
            .slice(0, this.pathIndex + 1)
            .reduce((sum, point, index, arr) => {
            if (index === 0)
                return 0;
            return sum + distance(arr[index - 1], point);
        }, 0);
        this.progress =
            totalDistance + distance(pathPoints[this.pathIndex], this.position);
    }
    draw(ctx) {
        const sprite = assets.get(this.currentSprite);
        if (sprite) {
            const DISPLAY_SIZE = 96;
            ctx.drawImage(sprite, this.frame * this.frameWidth, 0, this.frameWidth, this.frameHeight, this.position.x - DISPLAY_SIZE / 2, this.position.y - DISPLAY_SIZE / 2, DISPLAY_SIZE, DISPLAY_SIZE);
        }
        else {
            ctx.fillStyle = "#d43";
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "#222";
        ctx.fillRect(this.position.x - 24, this.position.y + 26, 48, 6);
        ctx.fillStyle = "#5f5";
        ctx.fillRect(this.position.x - 24, this.position.y + 26, (48 * this.health) / this.maxHealth, 6);
    }
    get isAlive() {
        return this.health > 0;
    }
    get reachedEnd() {
        return (this.pathIndex >= pathPoints.length - 1 &&
            distance(this.position, pathPoints[pathPoints.length - 1]) < 2);
    }
}
class Projectile {
    constructor(start, target) {
        this.speed = 400;
        this.damage = 1;
        this.radius = 6;
        this.active = true;
        this.position = { ...start };
        this.target = target;
    }
    update(delta) {
        if (!this.target.isAlive) {
            this.active = false;
            return;
        }
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const dist = Math.hypot(dx, dy);
        const travel = this.speed * delta;
        const hitThreshold = this.radius + this.target.radius;
        if (dist <= hitThreshold || travel >= dist) {
            this.position = { ...this.target.position };
            this.target.health = Math.max(0, this.target.health - this.damage);
            this.active = false;
            return;
        }
        this.position.x += (dx / dist) * travel;
        this.position.y += (dy / dist) * travel;
    }
    draw(ctx) {
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const angle = Math.atan2(dy, dx);
        const adjustedAngle = angle + Math.PI / 2;
        const sprite = assets.get("projectile");
        const PROJECTILE_SIZE = 30;
        if (sprite) {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(adjustedAngle);
            ctx.drawImage(sprite, -PROJECTILE_SIZE / 2, -PROJECTILE_SIZE / 2, PROJECTILE_SIZE, PROJECTILE_SIZE);
            ctx.restore();
        }
        else {
            ctx.save();
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(adjustedAngle);
            ctx.fillStyle = "#ffb";
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(-this.radius * 0.6, this.radius);
            ctx.lineTo(this.radius * 0.6, this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
}
class Tower {
    constructor(position) {
        this.range = 140;
        this.fireRate = 1;
        this.cooldown = 0;
        this.radius = 20;
        this.damage = 1;
        this.frame = 0;
        this.frameTimer = 0;
        this.currentRow = 3; // S par défaut
        this.frameWidth = 64;
        this.frameHeight = 64;
        this.frameCount = 12;
        this.animationSpeed = 0.12;
        this.position = { ...position };
    }
    update(delta, enemies, projectiles) {
        this.cooldown -= delta;
        const target = enemies
            .filter((enemy) => enemy.isAlive)
            .filter((enemy) => distance(enemy.position, this.position) <= this.range)
            .sort((a, b) => b.progress - a.progress)[0];
        if (target) {
            this.currentRow = this.getDirectionRow(target.position);
        }
        this.frameTimer += delta;
        if (this.frameTimer >= this.animationSpeed) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }
        if (this.cooldown > 0 || !target)
            return;
        projectiles.push(new Projectile({ x: this.position.x, y: this.position.y }, target));
        this.cooldown = this.fireRate;
    }
    getDirectionRow(target) {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const angle = Math.atan2(dy, dx);
        const degrees = (angle * 180) / Math.PI;
        if (degrees >= -157.5 && degrees < -112.5)
            return 7; // N
        if (degrees >= -112.5 && degrees < -67.5)
            return 6; // NE
        if (degrees >= -67.5 && degrees < -22.5)
            return 5; // E
        if (degrees >= -22.5 && degrees < 22.5)
            return 4; // SE
        if (degrees >= 22.5 && degrees < 67.5)
            return 3; // S
        if (degrees >= 67.5 && degrees < 112.5)
            return 2; // SO
        if (degrees >= 112.5 && degrees < 157.5)
            return 1; // O
        return 0; // NO
    }
    draw(ctx) {
        const sprite = assets.get("tower");
        if (sprite) {
            const DISPLAY_SIZE = 96;
            ctx.drawImage(sprite, this.frame * this.frameWidth, this.currentRow * this.frameHeight, this.frameWidth, this.frameHeight, this.position.x - DISPLAY_SIZE / 2, this.position.y - DISPLAY_SIZE / 2, DISPLAY_SIZE, DISPLAY_SIZE);
        }
        else {
            ctx.fillStyle = "#38a";
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(56, 138, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }
}
class Game {
    constructor() {
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.lives = START_LIVES;
        this.money = START_MONEY;
        this.score = 0;
        this.waveTimer = 0;
        this.enemySpawnTimer = 0;
        this.enemiesToSpawn = 0;
        this.waveIndex = 0;
        this.lastTime = performance.now();
    }
    start() {
        canvas.addEventListener("click", (event) => this.handleClick(event));
        requestAnimationFrame((time) => this.loop(time));
    }
    handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        if (this.towers.some((tower) => distance(tower.position, position) < GRID_SIZE * 0.75)) {
            return;
        }
        if (this.isOnPath(position))
            return;
        if (this.money < 100)
            return;
        this.towers.push(new Tower(position));
        this.money -= 100;
    }
    isOnPath(position) {
        const pathRadius = GRID_SIZE * 0.75;
        for (let i = 0; i < pathPoints.length - 1; i += 1) {
            const a = pathPoints[i];
            const b = pathPoints[i + 1];
            const segmentLength = distance(a, b);
            if (segmentLength === 0)
                continue;
            const projection = ((position.x - a.x) * (b.x - a.x) +
                (position.y - a.y) * (b.y - a.y)) /
                (segmentLength * segmentLength);
            const closest = {
                x: a.x + clamp(projection, 0, 1) * (b.x - a.x),
                y: a.y + clamp(projection, 0, 1) * (b.y - a.y),
            };
            if (distance(position, closest) < pathRadius)
                return true;
        }
        return false;
    }
    spawnWave() {
        this.waveIndex += 1;
        this.enemiesToSpawn = 1 + this.waveIndex * 2;
        this.enemySpawnTimer = 0;
    }
    spawnEnemy() {
        const start = pathPoints[0];
        const enemy = new Enemy(start);
        enemy.speed += this.waveIndex * 8;
        enemy.maxHealth += Math.floor(this.waveIndex / 2);
        enemy.health = enemy.maxHealth;
        this.enemies.push(enemy);
    }
    update(delta) {
        this.waveTimer += delta;
        if (this.waveTimer >= 8 &&
            this.enemiesToSpawn === 0 &&
            this.enemies.length === 0) {
            this.spawnWave();
            this.waveTimer = 0;
        }
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta * 1.5;
            if (this.enemySpawnTimer >= 2) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
                this.enemiesToSpawn -= 1;
            }
        }
        this.towers.forEach((tower) => tower.update(delta, this.enemies, this.projectiles));
        this.projectiles.forEach((projectile) => projectile.update(delta));
        this.enemies.forEach((enemy) => enemy.update(delta));
        this.projectiles = this.projectiles.filter((projectile) => projectile.active);
        this.enemies = this.enemies.filter((enemy) => {
            if (!enemy.isAlive) {
                this.money += 20;
                this.score += 10;
                return false;
            }
            if (enemy.reachedEnd) {
                this.lives -= 1;
                return false;
            }
            return true;
        });
    }
    drawPath(ctx) {
        const sprite = assets.get("path");
        if (sprite) {
            for (let i = 0; i < pathPoints.length - 1; i += 1) {
                const start = pathPoints[i];
                const end = pathPoints[i + 1];
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const segmentDistance = distance(start, end);
                const tileCount = Math.max(1, Math.ceil(segmentDistance / GRID_SIZE));
                const stepX = dx / tileCount;
                const stepY = dy / tileCount;
                for (let j = 0; j <= tileCount; j += 1) {
                    const x = start.x + stepX * j - GRID_SIZE / 2;
                    const y = start.y + stepY * j - GRID_SIZE / 2;
                    ctx.drawImage(sprite, x, y, GRID_SIZE, GRID_SIZE);
                }
            }
        }
        else {
            ctx.strokeStyle = "#886";
            ctx.lineWidth = 40;
            ctx.beginPath();
            ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
            pathPoints.slice(1).forEach((point) => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
        }
    }
    drawGrid(ctx) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
    }
    draw(ctx) {
        const background = assets.get("background");
        if (background) {
            ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        else {
            ctx.fillStyle = "#09131f";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        const enemyCastle = assets.get("enemyCastle");
        const allyCastle = assets.get("allyCastle");
        const start = pathPoints[0];
        const end = pathPoints[pathPoints.length - 1];
        this.drawGrid(ctx);
        this.drawPath(ctx);
        if (enemyCastle) {
            ctx.drawImage(enemyCastle, start.x - 16, start.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
        }
        else {
            ctx.fillStyle = "#b33";
            ctx.fillRect(start.x - GRID_SIZE * 0.25, start.y - GRID_SIZE * 0.75, GRID_SIZE * 1.5, GRID_SIZE * 1.5);
        }
        if (allyCastle) {
            ctx.drawImage(allyCastle, end.x - 130, end.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
        }
        else {
            ctx.fillStyle = "#3b3";
            ctx.fillRect(end.x - GRID_SIZE * 1.25, end.y - GRID_SIZE * 0.75, GRID_SIZE * 1.5, GRID_SIZE * 1.5);
        }
        this.towers.forEach((tower) => tower.draw(ctx));
        this.enemies.forEach((enemy) => enemy.draw(ctx));
        this.projectiles.forEach((projectile) => projectile.draw(ctx));
        ctx.fillStyle = "#fff";
        ctx.font = "18px system-ui";
        ctx.fillText(`Wave: ${this.waveIndex}`, 16, 28);
        ctx.fillText(`Lives: ${this.lives}`, 16, 54);
        ctx.fillText(`Money: ${this.money}`, 16, 80);
        ctx.fillText(`Score: ${this.score}`, 16, 106);
        ctx.fillText("Click to place towers off the path. Cost: 100", 16, 132);
        if (this.lives <= 0) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = "#f55";
            ctx.font = "48px system-ui";
            ctx.fillText("Game Over", CANVAS_WIDTH / 2 - 130, CANVAS_HEIGHT / 2);
        }
    }
    loop(currentTime) {
        const delta = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;
        if (this.lives > 0) {
            this.update(delta);
        }
        this.draw(ctx);
        requestAnimationFrame((time) => this.loop(time));
    }
}
async function init() {
    try {
        await assets.load(assetPaths);
    }
    catch (error) {
        console.warn("Some assets failed to load. The game will run with fallback shapes.", error);
    }
    const game = new Game();
    game.start();
}
init();
//# sourceMappingURL=main.js.map