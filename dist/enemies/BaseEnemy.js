import { pathPoints } from "../config/path.js";
import { distance } from "../utils/math.js";
import { assets } from "../core/assetsInstance.js";
export class BaseEnemy {
    constructor(start) {
        this.pathIndex = 0;
        this.progress = 0;
        this.speed = 80;
        this.maxHealth = 5;
        this.health = 5;
        this.radius = 18;
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
            this.drawFallback(ctx);
        }
        this.drawHealthBar(ctx);
    }
    drawFallback(ctx) {
        ctx.fillStyle = "#d43";
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    drawHealthBar(ctx) {
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
//# sourceMappingURL=BaseEnemy.js.map