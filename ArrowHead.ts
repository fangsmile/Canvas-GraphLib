import { Point } from "./Point";
import {CanvasContext} from "./CanvasContext";
export class ArrowHead {
    centerAngle: number;//与圆心所成角度
    basePoint: Point;
    triangleSide: number;
    constructor(centerAngle: number, basePoint: Point, triangleSide: number) {
        this.centerAngle = centerAngle;
        this.basePoint = basePoint;
        this.triangleSide = triangleSide;
    }

    drawPath(context: CanvasContext) {

        this.drawEquilateral(context)

    }
    drawEquilateral(context: CanvasContext) {//画等边箭头
        var triangleSide = this.triangleSide/context.currentMatrix.a;
        //First the center of the triangle base (where we start to draw the triangle)
        var canterBaseArrowX = this.basePoint.x - (Math.sqrt(3) / 4) * triangleSide * (Math.sin(-this.centerAngle));
        var canterBaseArrowY = this.basePoint.y - (Math.sqrt(3) / 4) * triangleSide * (Math.cos(-this.centerAngle));

        //Let's calculate the first point, easy!
        var ax = canterBaseArrowX + (triangleSide / 2) * Math.cos(this.centerAngle);
        var ay = canterBaseArrowY + (triangleSide / 2) * Math.sin(this.centerAngle);

        //Now time to get mad: the farest triangle point from the arrow body
        var bx = canterBaseArrowX + (Math.sqrt(3) / 2) * triangleSide * (Math.sin(-this.centerAngle));
        var by = canterBaseArrowY + (Math.sqrt(3) / 2) * triangleSide * (Math.cos(-this.centerAngle));

        //Easy , like the a point
        var cx = canterBaseArrowX - (triangleSide / 2) * Math.cos(this.centerAngle);
        var cy = canterBaseArrowY - (triangleSide / 2) * Math.sin(this.centerAngle);

        var startX = (ax + bx + cx) / 3;
        var startY = (ay + by + cy) / 3;
        //We move to the center of the base
        context.moveTo(startX, startY);
        context.lineTo(ax, ay);
        context.lineTo(bx, by);
        context.lineTo(cx, cy);
        context.lineTo(startX, startY);
    }

}

