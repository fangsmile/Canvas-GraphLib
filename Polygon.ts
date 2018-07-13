import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";

import { Edge } from './Edge'
import {CanvasContext} from "./../../../../../build/drawing/CanvasContext";
import { XlMath } from "./XlMath";
export class Polygon extends Shape {
    
    className: string = "Polygon";
    points: Array<Point> = [];
    edges: Array<Edge> = [];

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
        this.updateEdge();
        return this;
    }
    //更新边数据，因为边变化的可能性很小，所以直接清空重建
    updateEdge() {
        var count = this.points.length;
        this.edges=[];
        if (count > 2) {
            for (var i = 0; i <=count - 2; i++) {
                let edge = new Edge(this.points[i], this.points[i + 1]);
                this.edges.push(edge);
            }
            this.edges.push(new Edge(this.points[count - 1], this.points[0]));
        }
    }
    removePoint() {
        this.points.pop();
        this.updateEdge();
        return this;
    }
    getPoints() {
        return this.points;
    }
    changePoints(points: Array<Point>) {
        this.points = points;
        this.updateEdge();
    }
    changePointByIndex(p: Point, index: number) {
        this.points[index] = p;
        this.updateEdge();
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
        this.updateEdge();
    }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        var count = this.points.length;
        for (var i = count - 1; i >= 0; i--) {
            this.points[i].x = this.points[i].x + diffX;
            this.points[i].y = this.points[i].y + diffY;
        }
        this.updateEdge();
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