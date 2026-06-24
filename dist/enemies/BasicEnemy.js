import { BaseEnemy } from "./BaseEnemy.js";
export class BasicEnemy extends BaseEnemy {
    constructor(start) {
        super(start);
        this.speed = 80;
        this.maxHealth = 5;
        this.health = 5;
        this.radius = 18;
    }
}
//# sourceMappingURL=BasicEnemy.js.map