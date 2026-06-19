type Vec2 = { x: number; y: number };

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D context not available");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

class Enemy {
  position: Vec2;
  speed = 40;
  radius = 12;
  health = 3;

  constructor(x: number, y: number) {
    this.position = { x, y };
  }

  update(delta: number) {
    this.position.x += this.speed * delta;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#e34";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#222";
    ctx.fillRect(this.position.x - 16, this.position.y + 18, 32, 6);
    ctx.fillStyle = "#0f0";
    ctx.fillRect(this.position.x - 16, this.position.y + 18, (32 * this.health) / 3, 6);
  }

  get isAlive() {
    return this.health > 0;
  }
}

class Tower {
  position: Vec2;
  range = 140;
  cooldown = 0;
  fireRate = 0.8;
  radius = 18;

  constructor(x: number, y: number) {
    this.position = { x, y };
  }

  update(delta: number, enemies: Enemy[]) {
    this.cooldown -= delta;
    if (this.cooldown > 0) return;

    const target = enemies.find((enemy) => {
      const dx = enemy.position.x - this.position.x;
      const dy = enemy.position.y - this.position.y;
      return Math.hypot(dx, dy) <= this.range;
    });

    if (target) {
      this.fire(target);
      this.cooldown = this.fireRate;
    }
  }

  fire(enemy: Enemy) {
    enemy.health -= 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#4aa";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(74, 170, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.range, 0, Math.PI * 2);
    ctx.stroke();
  }
}

class Game {
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  elapsed = 0;
  lastSpawn = 0;
  lastTime = 0;
  score = 0;

  start() {
    this.lastTime = performance.now();
    canvas.addEventListener("click", (event) => this.placeTower(event));
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  placeTower(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 50 || x > CANVAS_WIDTH - 50 || y < 50 || y > CANVAS_HEIGHT - 50) return;
    this.towers.push(new Tower(x, y));
  }

  spawnEnemy() {
    const y = 80 + Math.random() * (CANVAS_HEIGHT - 160);
    this.enemies.push(new Enemy(0 - 24, y));
  }

  update(delta: number) {
    this.elapsed += delta;
    this.lastSpawn += delta;

    if (this.lastSpawn > 2) {
      this.spawnEnemy();
      this.lastSpawn = 0;
    }

    this.towers.forEach((tower) => tower.update(delta, this.enemies));
    this.enemies.forEach((enemy) => enemy.update(delta));

    this.enemies = this.enemies.filter((enemy) => {
      if (!enemy.isAlive) {
        this.score += 1;
        return false;
      }
      return enemy.position.x - enemy.radius < CANVAS_WIDTH;
    });
  }

  draw() {
    ctx.fillStyle = "#08121c";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#333";
    ctx.fillRect(0, CANVAS_HEIGHT - 80, CANVAS_WIDTH, 80);

    this.towers.forEach((tower) => tower.draw(ctx));
    this.enemies.forEach((enemy) => enemy.draw(ctx));

    ctx.fillStyle = "#fff";
    ctx.font = "18px system-ui";
    ctx.fillText(`Towers: ${this.towers.length}`, 16, 26);
    ctx.fillText(`Score: ${this.score}`, 16, 52);
    ctx.fillText("Click to place towers", 16, 78);
  }

  gameLoop(currentTime: number) {
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.04);
    this.lastTime = currentTime;
    this.update(delta);
    this.draw();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

const game = new Game();
game.start();
