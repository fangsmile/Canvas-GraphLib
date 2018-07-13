import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";

import { Edge } from './Edge'
import {CanvasContext} from "./CanvasContext";
import { XlMath } from "./XlMath";
export class Polygon extends Shape {
    
    className: string = "Polygon";
    points: Array<Point> = [];

    constructor(renderStyle: RenderStyle, colorKey:string=null) {
        super(renderStyle, null, null, colorKey);

    }
    drawPath(ctx: CanvasContext) {

        // if (this.points.length >= 3) {
        var count = this.points.length;
        var p: Point = this.points[0];
        //Fix p:point 有可能为undefined
        p && ctx.moveTo(p.x, p.y);

        for (var i = 1; i <= count - 1; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        // } else {
        //     console.error("多边形的顶点数必须大于等于3");
        // }
    }

    addPoint(p: Point) {
        this.points.push(p);
        return this;
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
    changePointByIndex(p: Point, index: number) {
        this.points[index] = p;
    }
    changePoint(pOld: Point, pNew: Point) {
        var count = this.points.length;
        for (var i = count - 1; i >= 0; i--) {
            if (this.points[i].x == pOld.x && this.points[i].y == pOld.y) {
                this.points[i].x = pNew.x;
                this.points[i].y = pNew.y;
                break;
            }
        }
    }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        var count = this.points.length;
        for (var i = count - 1; i >= 0; i--) {
            this.points[i].x = this.points[i].x + diffX;
            this.points[i].y = this.points[i].y + diffY;
        }
    }
    getPointRange(){
        let rect = XlMath.rectPoint(this.getPoints());
        return{
            minX:rect.minX,
            maxX:rect.maxX,
            minY:rect.minY,
            maxY:rect.maxY
        }
    }
}
