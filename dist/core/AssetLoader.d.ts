import { SpriteKey } from "../config/assets.js";
export declare class AssetLoader {
    private images;
    load(list: Record<SpriteKey, string>): Promise<void>;
    get(key: SpriteKey): HTMLImageElement | undefined;
    private loadImage;
}
//# sourceMappingURL=AssetLoader.d.ts.map