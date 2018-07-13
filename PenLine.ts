import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "./CanvasContext";
import { XlMath } from "./XlMath";
export class PenLine extends Shape {
    className: string = "PenLine";
    private points: Array<Point> = [];
    constructor(renderStyle: RenderStyle) {
        super(renderStyle);

    }

    addPoint(p: Point) {
        var lastPoint = this.points[this.points.length - 1];
        if (lastPoint) {
            if (lastPoint.x == p.x && lastPoint.y == p.y)
                return;
            var dis = Math.sqrt(Math.pow(p.x - lastPoint.x, 2) + Math.pow(p.y - lastPoint.y, 2));
            if (dis > 25) {
                var basePoint = lastPoint;
                for (var i = 0; i < 1000; i++) {
                    basePoint = new Point(XlMath.toDecimal((p.x - lastPoint.x) * 25 / dis + basePoint.x), XlMath.toDecimal((p.y - lastPoint.y) * 25 / dis + basePoint.y));
                    if ((basePoint.x - p.x) * (lastPoint.x - p.x) < 0 || (basePoint.y - p.y) * (lastPoint.y - p.y) < 0)
                        break;
                    else {
                        this.points.push(basePoint);
                    }
                }
            }
        }

        this.points.push(p);
    }

    removePoint() {
        this.points.pop();
        return this;
    }
    getPoints() {
        return this.points;
    }
    changePoints(points: Array<Point>) {
        this.points = points;
    }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        var count = this.points.length;
        for (var i = count - 1; i >= 0; i--) {
            this.points[i].x = this.points[i].x + diffX;
            this.points[i].y = this.points[i].y + diffY;
        }
    }
    drawPath(ctx: CanvasContext) {

        if (this.points) {
            var count = this.points.length;
            var p: Point = this.points[0];

            if (count >= 2) {
                ctx.moveTo(p.x, p.y);
                for (var i = 1; i < count - 2; i++) {
                    if (this.points[i].x == this.points[i + 1].x && this.points[i].y == this.points[i + 1].y)
                        continue;
                    var c = (this.points[i].x + this.points[i + 1].x) / 2;
                    var d = (this.points[i].y + this.points[i + 1].y) / 2;
                    ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d); //二次贝塞曲线函数   
                }
                // For the last 2 points
                if (count >= 3) {
                    ctx.quadraticCurveTo(
                        this.points[i].x,
                        this.points[i].y,
                        this.points[i + 1].x,
                        this.points[i + 1].y
                    );
                } else if (count >= 2) {
                    ctx.lineTo(this.points[1].x, this.points[1].y);
                }

                // this.isClosed && ctx.closePath();
            } else {
                var radius = this.renderStyle.lineWidth;
                ctx.arc(this.points[0].x, this.points[0].y, radius / ctx.currentMatrix.a / 2, 0, 2 * Math.PI);
            }
        }
    }
    getPointRange() {
        let rect = XlMath.rectPoint(this.points);
        return {
            minX: rect.minX,
            maxX: rect.maxX,
            minY: rect.minY,
            maxY: rect.maxY
        }
    }
}


