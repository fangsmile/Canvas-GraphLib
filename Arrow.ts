

import { Line } from "./Line";
import { ArrowHead } from "./ArrowHead";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { Shape } from "./Shape";
import { XlMath } from "./XlMath";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
export class Arrow extends Shape {
    className: string = "Arrow";
    arrowHead: ArrowHead;//箭头
    startPoint: Point;
    endPoint: Point;
    constructor(startPoint: Point,
        endPoint: Point,
        renderStyle: RenderStyle, colorKey: string = null) {
        super(renderStyle, null, null, colorKey);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.arrowHead = new ArrowHead(1.5 * Math.PI, new Point(this.endPoint.x, this.endPoint.y), 15 + this.renderStyle.lineWidth);
    }

    changeStartPoint(point: Point) {
        this.startPoint = point;
    }
    changeEndPoint(point: Point) {
        this.endPoint = point;
        this.arrowHead.basePoint = new Point(point.x, point.y);
    }
    //绘制路径
    drawPath(ctx: CanvasContext) {
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y)

        var ang = XlMath.computeAng(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
        this.arrowHead.centerAngle = 1.5 * Math.PI + ang;
        this.arrowHead.drawPath(ctx);
    }
    getClass() {
        return Arrow;
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
        this.arrowHead.basePoint.x += diffX;
        this.arrowHead.basePoint.y += diffY;
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
