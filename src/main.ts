    type Vec2 = { x: number; y: number };

    type SpriteKey = "background" | "path" | "tower" | "enemy" | "projectile" | "allyCastle" | "enemyCastle";

    class AssetLoader {
    private images = new Map<string, HTMLImageElement>();

    async load(list: Record<SpriteKey, string>): Promise<void> {
    const entries = Object.entries(list) as Array<[SpriteKey, string]>;
    await Promise.all(entries.map(([key, src]) => this.loadImage(key, src)));
    }

    get(key: SpriteKey): HTMLImageElement | undefined {
    return this.images.get(key);
    }

    private loadImage(key: SpriteKey, src: string): Promise<void> {
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

    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;
    const GRID_SIZE = 64;
    const START_LIVES = 10;
    const START_MONEY = 200;

    const pathPoints: Vec2[] = [
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

    const assetPaths: Record<SpriteKey, string> = {
    background: "./assets/background.png",
    path: "./assets/path.png",
    tower: "./assets/tower.png",
    enemy: "./assets/enemy.png",
    projectile: "./assets/projectile.png",
    allyCastle: "./assets/allyCastle.png",
    enemyCastle: "./assets/enemyCastle.png",
    };

    const assets = new AssetLoader();

    function distance(a: Vec2, b: Vec2) {
    return Math.hypot(b.x - a.x, b.y - a.y);
    }

    function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
    }

    class Enemy {
    position: Vec2;
    pathIndex = 0;
    speed = 80;
    maxHealth = 5;
    health = 5;
    radius = 18;
    progress = 0;

    constructor(start: Vec2) {
    this.position = { ...start };
    }

    update(delta: number) {
    const target = pathPoints[this.pathIndex + 1];
    if (!target) return;

    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distanceToTarget = Math.hypot(dx, dy);
    const travel = this.speed * delta;

    if (travel >= distanceToTarget) {
        this.position = { ...target };
        this.pathIndex += 1;
    } else {
        this.position.x += (dx / distanceToTarget) * travel;
        this.position.y += (dy / distanceToTarget) * travel;
    }

    const totalDistance = pathPoints
        .slice(0, this.pathIndex + 1)
        .reduce((sum, point, index, arr) => {
        if (index === 0) return 0;
        return sum + distance(arr[index - 1]!, point);
        }, 0);
    this.progress = totalDistance + distance(pathPoints[this.pathIndex]!, this.position);
    }

    draw(ctx: CanvasRenderingContext2D) {
    const sprite = assets.get("enemy");
    if (sprite) {
        ctx.drawImage(sprite, this.position.x - 24, this.position.y - 24, 48, 48);
    } else {
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
    return this.pathIndex >= pathPoints.length - 1 && distance(this.position, pathPoints[pathPoints.length - 1]!) < 2;
    }
    }

    class Projectile {
    position: Vec2;
    speed = 400;
    target: Enemy;
    damage = 1;
    radius = 6;
    active = true;

    constructor(start: Vec2, target: Enemy) {
    this.position = { ...start };
    this.target = target;
    }

    update(delta: number) {
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

    draw(ctx: CanvasRenderingContext2D) {
    const dx = this.target.position.x - this.position.x;
    const dy = this.target.position.y - this.position.y;
    const angle = Math.atan2(dy, dx);
    const adjustedAngle = angle + Math.PI / 2;

    const sprite = assets.get("projectile");
    if (sprite) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(adjustedAngle);
        ctx.drawImage(sprite, -10, -10, 20, 20);
        ctx.restore();
    } else {
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
    position: Vec2;
    range = 140;
    fireRate = 1;
    cooldown = 0;
    radius = 20;
    damage = 1;

    constructor(position: Vec2) {
    this.position = { ...position };
    }

    update(delta: number, enemies: Enemy[], projectiles: Projectile[]) {
    this.cooldown -= delta;
    if (this.cooldown > 0) return;

    const target = enemies
        .filter((enemy) => enemy.isAlive)
        .filter((enemy) => distance(enemy.position, this.position) <= this.range)
        .sort((a, b) => b.progress - a.progress)[0];

    if (!target) return;

    projectiles.push(new Projectile({ x: this.position.x, y: this.position.y }, target));
    this.cooldown = this.fireRate;
    }

    draw(ctx: CanvasRenderingContext2D) {
    const sprite = assets.get("tower");
    if (sprite) {
        ctx.drawImage(sprite, this.position.x - 24, this.position.y - 24, 48, 48);
    } else {
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
        enemies: Enemy[] = [];
        towers: Tower[] = [];
        projectiles: Projectile[] = [];
        lives = START_LIVES;
        money = START_MONEY;
        score = 0;
        waveTimer = 0;
        enemySpawnTimer = 0;
        enemiesToSpawn = 0;
        waveIndex = 0;
        lastTime = performance.now();

        start() {
            canvas.addEventListener("click", (event) => this.handleClick(event));
            requestAnimationFrame((time) => this.loop(time));
        }

        handleClick(event: MouseEvent) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const position = { x, y };

        if (this.towers.some((tower) => distance(tower.position, position) < GRID_SIZE * 0.75)) return;
        if (this.isOnPath(position)) return;
        if (this.money < 100) return;

        this.towers.push(new Tower(position));
        this.money -= 100;
        }

        isOnPath(position: Vec2) {
            const pathRadius = GRID_SIZE * 0.75;
            for (let i = 0; i < pathPoints.length - 1; i += 1) {
                const a = pathPoints[i]!;
                const b = pathPoints[i + 1]!;
                const segmentLength = distance(a, b);
                if (segmentLength === 0) continue;
                const projection = ((position.x - a.x) * (b.x - a.x) + (position.y - a.y) * (b.y - a.y)) / (segmentLength * segmentLength);
                const closest = {
                x: a.x + clamp(projection, 0, 1) * (b.x - a.x),
                y: a.y + clamp(projection, 0, 1) * (b.y - a.y),
                };
                if (distance(position, closest) < pathRadius) return true;
            }
        return false;
        }

        spawnWave() {
            this.waveIndex += 1;
            this.enemiesToSpawn = 1 + this.waveIndex * 2;
            this.enemySpawnTimer = 0;
        }

    spawnEnemy() {
        const start = pathPoints[0]!;
        const enemy = new Enemy(start);
        enemy.speed += this.waveIndex * 8;
        enemy.maxHealth += Math.floor(this.waveIndex / 2);
        enemy.health = enemy.maxHealth;
        this.enemies.push(enemy);
    }

    update(delta: number) {
        this.waveTimer += delta;
        if (this.waveTimer >= 8 && this.enemiesToSpawn === 0 && this.enemies.length === 0) {
            this.spawnWave();
            this.waveTimer = 0;
        }

        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta*1.5;
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

    drawPath(ctx: CanvasRenderingContext2D) {
    const sprite = assets.get("path");
    if (sprite) {
        for (let i = 0; i < pathPoints.length - 1; i += 1) {
        const start = pathPoints[i]!;
        const end = pathPoints[i + 1]!;
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
    } else {
        ctx.strokeStyle = "#886";
        ctx.lineWidth = 40;
        ctx.beginPath();
        ctx.moveTo(pathPoints[0]!.x, pathPoints[0]!.y);
        pathPoints.slice(1).forEach((point) => {
        ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
    }
    }

    drawGrid(ctx: CanvasRenderingContext2D) {
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

    draw(ctx: CanvasRenderingContext2D) {
    const background = assets.get("background");
    if (background) {
        ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
        ctx.fillStyle = "#09131f";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    const enemyCastle = assets.get("enemyCastle");
    const allyCastle = assets.get("allyCastle");
    const start = pathPoints[0]!;
    const end = pathPoints[pathPoints.length - 1]!;

    this.drawGrid(ctx);
    this.drawPath(ctx);

    if (enemyCastle) {
        ctx.drawImage(enemyCastle, start.x - 16, start.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
    } else {
        ctx.fillStyle = "#b33";
        ctx.fillRect(start.x - GRID_SIZE * 0.25, start.y - GRID_SIZE * 0.75, GRID_SIZE * 1.5, GRID_SIZE * 1.5);
    }

    if (allyCastle) {
        ctx.drawImage(allyCastle, end.x - 130, end.y - GRID_SIZE, GRID_SIZE * 2, GRID_SIZE * 2);
    } else {
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

    loop(currentTime: number) {
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
    } catch (error) {
    console.warn("Some assets failed to load. The game will run with fallback shapes.", error);
    }

    const game = new Game();
    game.start();
    }

    init();
