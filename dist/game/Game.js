import { pathPoints } from "../config/path.js";
import { GRID_SIZE, START_LIVES, START_MONEY, TOWER_COST, } from "../config/constants.js";
import { distance, clamp } from "../utils/math.js";
import { assets } from "../core/assetsInstance.js";
import { EnemyFactory } from "../enemies/EnemyFactory.js";
import { Tower } from "../towers/Tower.js";
export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
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
        this.canvas.addEventListener("click", event => this.handleClick(event));
        requestAnimationFrame(time => this.loop(time));
    }
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        const towerAlreadyHere = this.towers.some(tower => {
            return distance(tower.position, position) < GRID_SIZE * 0.75;
        });
        if (towerAlreadyHere)
            return;
        if (this.isOnPath(position))
            return;
        if (this.money < TOWER_COST)
            return;
        this.towers.push(new Tower(position));
        this.money -= TOWER_COST;
    }
    isOnPath(position) {
        const pathRadius = GRID_SIZE * 0.75;
        for (let i = 0; i < pathPoints.length - 1; i++) {
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
            if (distance(position, closest) < pathRadius) {
                return true;
            }
        }
        return false;
    }
    spawnWave() {
        this.waveIndex++;
        this.enemiesToSpawn = 1 + this.waveIndex * 2;
        this.enemySpawnTimer = 0;
    }
    spawnEnemy() {
        let type = "basic";
        if (this.waveIndex >= 3 && Math.random() < 0.3) {
            type = "fast";
        }
        if (this.waveIndex >= 5 && Math.random() < 0.2) {
            type = "tank";
        }
        const enemy = EnemyFactory.create(type);
        enemy.speed += this.waveIndex * 8;
        enemy.maxHealth += Math.floor(this.waveIndex / 2);
        enemy.health = enemy.maxHealth;
        this.enemies.push(enemy);
    }
    update(delta) {
        this.waveTimer += delta;
        const canStartNextWave = this.waveTimer >= 8 &&
            this.enemiesToSpawn === 0 &&
            this.enemies.length === 0;
        if (canStartNextWave) {
            this.spawnWave();
            this.waveTimer = 0;
        }
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta * 1.5;
            if (this.enemySpawnTimer >= 2) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
                this.enemiesToSpawn--;
            }
        }
        this.towers.forEach(tower => {
            tower.update(delta, this.enemies, this.projectiles);
        });
        this.projectiles.forEach(projectile => {
            projectile.update(delta);
        });
        this.enemies.forEach(enemy => {
            enemy.update(delta);
        });
        this.projectiles = this.projectiles.filter(projectile => {
            return projectile.active;
        });
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive) {
                this.money += 20;
                this.score += 10;
                return false;
            }
            if (enemy.reachedEnd) {
                this.lives--;
                return false;
            }
            return true;
        });
    }
    drawPath() {
        const sprite = assets.get("path");
        if (sprite) {
            for (let i = 0; i < pathPoints.length - 1; i++) {
                const start = pathPoints[i];
                const end = pathPoints[i + 1];
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const segmentDistance = distance(start, end);
                const tileCount = Math.max(1, Math.ceil(segmentDistance / GRID_SIZE));
                const stepX = dx / tileCount;
                const stepY = dy / tileCount;
                for (let j = 0; j <= tileCount; j++) {
                    const x = start.x + stepX * j - GRID_SIZE / 2;
                    const y = start.y + stepY * j - GRID_SIZE / 2;
                    this.ctx.drawImage(sprite, x, y, GRID_SIZE, GRID_SIZE);
                }
            }
        }
        else {
            this.ctx.strokeStyle = "#886";
            this.ctx.lineWidth = 40;
            this.ctx.beginPath();
            this.ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
            pathPoints.slice(1).forEach(point => {
                this.ctx.lineTo(point.x, point.y);
            });
            this.ctx.stroke();
        }
    }
    drawGrid() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.strokeStyle = "rgba(255,255,255,0.04)";
        for (let x = 0; x <= width; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= height; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }
    drawCastles() {
        const enemyCastle = assets.get("enemyCastle");
        const allyCastle = assets.get("allyCastle");
        const start = pathPoints[0];
        const end = pathPoints[pathPoints.length - 1];
        if (enemyCastle) {
            this.ctx.drawImage(enemyCastle, start.x - 16, start.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
        }
        if (allyCastle) {
            this.ctx.drawImage(allyCastle, end.x - 130, end.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
        }
    }
    drawUI() {
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "18px system-ui";
        this.ctx.fillText(`Wave: ${this.waveIndex}`, 16, 28);
        this.ctx.fillText(`Lives: ${this.lives}`, 16, 54);
        this.ctx.fillText(`Money: ${this.money}`, 16, 80);
        this.ctx.fillText(`Score: ${this.score}`, 16, 106);
        this.ctx.fillText(`Click to place towers off the path. Cost: ${TOWER_COST}`, 16, 132);
    }
    drawGameOver() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.fillStyle = "#f55";
        this.ctx.font = "48px system-ui";
        this.ctx.fillText("Game Over", width / 2 - 130, height / 2);
    }
    draw() {
        const background = assets.get("background");
        if (background) {
            this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
        }
        else {
            this.ctx.fillStyle = "#09131f";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.drawGrid();
        this.drawPath();
        this.drawCastles();
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.drawUI();
        if (this.lives <= 0) {
            this.drawGameOver();
        }
    }
    loop(currentTime) {
        const delta = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;
        if (this.lives > 0) {
            this.update(delta);
        }
        this.draw();
        requestAnimationFrame(time => this.loop(time));
    }
}
//# sourceMappingURL=Game.js.map