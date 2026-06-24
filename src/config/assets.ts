export type SpriteKey =
    | "background"
    | "path"
    | "tower"
    | "enemyWalkN"
    | "enemyWalkS"
    | "enemyWalkE"
    | "enemyWalkO"
    | "projectile"
    | "allyCastle"
    | "enemyCastle";

export const assetPaths: Record<SpriteKey, string> = {
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