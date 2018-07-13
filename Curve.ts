
import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { XlMath } from "./XlMath";
import { CanvasContext } from "./CanvasContext";
export class Curve extends Shape {
    className: string = "Curve";
    startPoint: Point;
    endPoint: Point;
    drawStartPoint: Point;//优化后绘制起点
    drawEndPoint: Point;//优化后绘制终点
    constructor(startPoint: Point,
        endPoint: Point,
        renderStyle: RenderStyle, colorKey: string = null) {
        super(renderStyle, null, null, colorKey);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }


    //绘制路径
    drawPath(ctx: CanvasContext) {
        //http://jira.xuelebj.net/browse/CLASSROOM-4080 
        let isDraw = this.computeDrawStartEndPoint(ctx);//曲线绘制性能优化
        let drawCount = 0;
        if (isDraw) {
            //计算曲线整体倾斜角度
            var deg = XlMath.radianToDegree(Math.atan(((this.drawEndPoint.y - this.drawStartPoint.y)) / (this.drawEndPoint.x - this.drawStartPoint.x)));
            //计算不旋转的情况下，曲线两点位置原始坐标
            var newPosition = XlMath.computePointAfterRotate(this.drawStartPoint.x, this.drawStartPoint.y,
                (this.drawStartPoint.x + this.drawEndPoint.x) / 2, (this.drawStartPoint.y + this.drawEndPoint.y) / 2, -deg);
            var newPosition1 = XlMath.computePointAfterRotate(this.drawEndPoint.x, this.drawEndPoint.y,
                (this.drawStartPoint.x + this.drawEndPoint.x) / 2, (this.drawStartPoint.y + this.drawEndPoint.y) / 2, -deg);
            // var config1 = new Config(0, Math.abs(newPosition1.x - newPosition.x), new Translate(Math.min(newPosition.x, newPosition1.x), Math.min(newPosition.y, newPosition1.y), newPosition.x, newPosition.y, newPosition1.x, newPosition1.y), deg)
            let scale = ctx.currentMatrix.a;//画布旋转之前取出该值才是scale
            //根据计算出的deg旋转画布
            var center = new Point((this.drawStartPoint.x + this.drawEndPoint.x) / 2, (this.drawStartPoint.y + this.drawEndPoint.y) / 2);
            ctx.translate(center.x, center.y);
            ctx.rotate(XlMath.degreeToRadian(deg));
            ctx.translate(-center.x, -center.y);

            //根据计算出的角度坐标值，绘制角度为0不倾斜的正弦曲线
            //曲线长度
            var dis = newPosition1.x - newPosition.x;
            //定义曲线高度
            var lineHeight = 3 / scale;
            ctx.moveTo(newPosition.x, newPosition.y);

            for (var i = 0; i < Math.abs(dis / lineHeight); i += 1) {//原本是i+=0.5 //todo  在画布缩小到最小画的曲线 这里的循环次数有十几万次，绘图性能低，需要绘制可视范围内的曲线即可
                var x = newPosition.x + Math.abs(dis) / dis * i * lineHeight;
                var y = newPosition.y + Math.abs(dis) / dis * Math.sin(i) * lineHeight;
                ctx.lineTo(x, y);
                drawCount++;
            }
        }
        console.log("drawCount", drawCount)
    }
    //优化绘制的起点终点   http://jira.xuelebj.net/browse/CLASSROOM-4080
    computeDrawStartEndPoint(ctx: CanvasContext) {
        let winInfo = { width: screen.width, height: screen.height };
        let leftTop = ctx.transformPoint(0, 0);
        let rightTop = ctx.transformPoint(winInfo.width, 0);
        let rightBottom = ctx.transformPoint(winInfo.width, winInfo.height);
        let leftBottom = ctx.transformPoint(0, winInfo.height);

        let isStartPointIn = XlMath.IsPointInMatrix(leftTop, rightTop, rightBottom, leftBottom, this.startPoint);
        let isEndPointIn = XlMath.IsPointInMatrix(leftTop, rightTop, rightBottom, leftBottom, this.endPoint);
        this.drawStartPoint = this.startPoint;
        this.drawEndPoint = this.endPoint;
        if (isStartPointIn && isEndPointIn) {
            return true;
        } else if (!isStartPointIn && isEndPointIn) {
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop)) {
                this.drawStartPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom)) {
                this.drawStartPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom)) {
                this.drawStartPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop)) {
                this.drawStartPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop);
            }
            return true;
        } else if (isStartPointIn && !isEndPointIn) {
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop)) {
                this.drawEndPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom)) {
                this.drawEndPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom)) {
                this.drawEndPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom);
            } else if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop)) {
                this.drawEndPoint = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop);
            }
            return true;
        } else if (!isStartPointIn && !isEndPointIn) {
            let p1, p2;
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop)) {
                p1 = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftTop, rightTop);
            }
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom)) {
                if (p1)
                    p2 = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom);
                else
                    p1 = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightTop, rightBottom);
            }
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom)) {
                if (p1)
                    p2 = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom);
                else
                    p1 = XlMath.segmentsIntr(this.startPoint, this.endPoint, rightBottom, leftBottom);
            }
            if (XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop)) {
                p2 = XlMath.segmentsIntr(this.startPoint, this.endPoint, leftBottom, leftTop);
            }
            this.drawStartPoint = p1;
            this.drawEndPoint = p2;
            if (p1 && p2)
                return true;
            else
                return false;
        }
    }
    //绘制hit路径  直接画直线即可
    drawHitPath(ctx: CanvasContext) {
        ctx.moveTo(this.startPoint.x, this.startPoint.y);
        ctx.lineTo(this.endPoint.x, this.endPoint.y);
    }
    //改变某个点位置
    public changePoint() {

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
