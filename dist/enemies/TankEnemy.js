import { BaseEnemy } from "./BaseEnemy.js";
export class TankEnemy extends BaseEnemy {
    constructor(start) {
        super(start);
        this.speed = 45;
        this.maxHealth = 20;
        this.health = 20;
        this.radius = 24;
    }
}
//# sourceMappingURL=TankEnemy.js.map