import { Point } from './Point'
/**
 * 多边形的边
 */
export class Edge {
    start: Point;
    end: Point;
    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;

    }
}