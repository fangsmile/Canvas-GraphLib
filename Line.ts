
import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import {CanvasContext} from "./../../../../../build/drawing/CanvasContext";
//使用Path类就可以了，Line可以去除
export class Line extends Shape {
    className: string = "Line";
    startPoint: Point;
    endPoint: Point;
    constructor(startPoint: Point,
        endPoint: Point,
        renderStyle: RenderStyle, colorKey:string=null) {
        super(renderStyle, null,null,colorKey);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
    drawPath(ctx: CanvasContext) {
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y)
    }
    //虚线的hit线画实线
    prepareHitStyle(hitCtx: CanvasContext) {
        hitCtx.strokeStyle = this.colorKey;
        hitCtx.fillStyle = this.colorKey;
        hitCtx.lineWidth = (this.renderStyle.lineWidth > 0 ? this.renderStyle.lineWidth + 10 : this.renderStyle.lineWidth) / hitCtx.currentMatrix.a;
        // hitCtx.setLineDash(this.renderStyle.lineDash)
        hitCtx.lineJoin = this.renderStyle.lineJoin;
        hitCtx.lineCap = this.renderStyle.lineCap;
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
}
