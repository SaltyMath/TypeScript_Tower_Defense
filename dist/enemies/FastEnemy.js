import { BaseEnemy } from "./BaseEnemy.js";
export class FastEnemy extends BaseEnemy {
    constructor(start) {
        super(start);
        this.speed = 140;
        this.maxHealth = 3;
        this.health = 3;
        this.radius = 16;
    }
}
//# sourceMappingURL=FastEnemy.js.map