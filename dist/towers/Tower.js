import { distance } from "../utils/math.js";
import { Projectile } from "../projectiles/Projectile.js";
import { assets } from "../core/assetsInstance.js";
export class Tower {
    constructor(position) {
        this.range = 140;
        this.fireRate = 1;
        this.cooldown = 0;
        this.radius = 20;
        this.damage = 1;
        this.frame = 0;
        this.frameTimer = 0;
        this.currentRow = 3;
        this.frameWidth = 64;
        this.frameHeight = 64;
        this.frameCount = 12;
        this.animationSpeed = 0.12;
        this.position = { ...position };
    }
    update(delta, enemies, projectiles) {
        this.cooldown -= delta;
        const target = enemies
            .filter(enemy => enemy.isAlive)
            .filter(enemy => {
            return distance(enemy.position, this.position) <= this.range;
        })
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
        projectiles.push(new Projectile({
            x: this.position.x,
            y: this.position.y,
        }, target));
        this.cooldown = this.fireRate;
    }
    getDirectionRow(target) {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const angle = Math.atan2(dy, dx);
        const degrees = angle * 180 / Math.PI;
        if (degrees >= -157.5 && degrees < -112.5)
            return 7;
        if (degrees >= -112.5 && degrees < -67.5)
            return 6;
        if (degrees >= -67.5 && degrees < -22.5)
            return 5;
        if (degrees >= -22.5 && degrees < 22.5)
            return 4;
        if (degrees >= 22.5 && degrees < 67.5)
            return 3;
        if (degrees >= 67.5 && degrees < 112.5)
            return 2;
        if (degrees >= 112.5 && degrees < 157.5)
            return 1;
        return 0;
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
//# sourceMappingURL=Tower.js.map