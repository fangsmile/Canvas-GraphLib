import { Shape } from "./Shape";
import { RenderStyle, RotateConfig, RegionConfig } from "./OptionConfig";
import { CanvasContext } from  "../../../../../build/drawing/CanvasContext";;
export class Rect extends Shape {
    className: string = "Rect";
    constructor(renderStyle: RenderStyle, rotateConfig: RotateConfig = null, regionConfig: RegionConfig = null) {
        super(renderStyle,rotateConfig,regionConfig);
    }

    drawPath(ctx: CanvasContext) {
        ctx.rect(this.regionConfig.x, this.regionConfig.y, this.regionConfig.width, this.regionConfig.height);
    }

    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        if (this.regionConfig) {
            this.regionConfig.x += diffX;
            this.regionConfig.y += diffY;
        }
    }
}