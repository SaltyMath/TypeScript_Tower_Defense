import { pathPoints } from "../config/path.js";
import { BasicEnemy } from "./BasicEnemy.js";
export class EnemyFactory {
    static create(type) {
        const start = pathPoints[0];
        if (!start) {
            throw new Error("Path vide");
        }
        return new BasicEnemy(start);
    }
}
//# sourceMappingURL=EnemyFactory.js.map