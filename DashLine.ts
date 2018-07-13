
import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import {CanvasContext} from "./../../../../../build/drawing/CanvasContext";
import { XlMath } from "./XlMath";
//使用Path类就可以了，Line可以去除
export class DashLine extends Shape {
    className: string = "DashLine";
    startPoint: Point;
    endPoint: Point;
    constructor(startPoint: Point,
        endPoint: Point,
        renderStyle: RenderStyle) {
        super(renderStyle);
        renderStyle.lineDash=[10,15];
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
    drawPath(ctx: CanvasContext) {
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y)
    }

    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        if (this.startPoint) {
            this.startPoint.x += diffX;
            this.startPoint.y += diffY;
        }
        if (this.endPoint) {
            this.endPoint.x += diffX;
            this.endPoint.y += diffY;
        }
    }
    changeStartPoint(point: Point) {
        this.startPoint = point;
    }
    changeEndPoint(point: Point) {
        this.endPoint = point;
    }
    getPointRange() {
        let rect = XlMath.rectPoint([this.startPoint, this.endPoint]);
        return {
            minX: rect.minX,
            maxX: rect.maxX,
            minY: rect.minY,
            maxY: rect.maxY
        }
    }
}
