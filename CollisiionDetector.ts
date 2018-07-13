import { Point } from "./Point";
export class CollisiionDetector {
    public static _instance = new CollisiionDetector();

    //获取该矩形上的四条边
    private getFourLines(rectPointsArr: Array<Point>) {
        var p0 = rectPointsArr[0];
        var p1 = rectPointsArr[1];
        var p2 = rectPointsArr[2];
        var p3 = rectPointsArr[3];
        var l1 = [[p0.x, p0.y], [p1.x, p1.y]];
        var l2 = [[p1.x, p1.y], [p2.x, p2.y]];
        var l3 = [[p2.x, p2.y], [p3.x, p3.y]];
        var l4 = [[p3.x, p3.y], [p0.x, p0.y]];
        return [l1, l2, l3, l4];

    }
    private getTYPoing(p: any, axis: any) {//获取点在轴上的投影点
        //顶点在轴上的投影
        var x = ((p[0] * axis[0] + p[1] * axis[1]) / (axis[0] * axis[0] + axis[1] * axis[1])) * axis[0];
        var y = ((p[0] * axis[0] + p[1] * axis[1]) / (axis[0] * axis[0] + axis[1] * axis[1])) * axis[1];
        return [x, y];
    }
    public getLineTYToAxis(line: any, axis: any) {//线到轴的投影

        var a = [axis[1][0] - axis[0][0], axis[1][1] - axis[0][1]];//轴向量
        var p0 = line[0];//线的一个顶点0
        var p1 = line[1];//线的一个顶点1
        var pt0 = this.getTYPoing(p0, a);
        var pt1 = this.getTYPoing(p1, a);
        return [pt0, pt1];

    }
    private isLineOverlap(l1: any, l2: any) {//判断线段是否重叠

        var l1p1 = l1[0], l1p2 = l1[1], l2p1 = l2[0], l2p2 = l2[1];
        if (l1p1[0] != l2p1[0]) {//非垂直X轴的两线段
            if ((l1p1[0] - l2p1[0]) * (l1p1[0] - l2p2[0]) < 0 || (l1p2[0] - l2p1[0]) * (l1p2[0] - l2p2[0]) < 0 || (l2p1[0] - l1p1[0]) * (l2p1[0] - l1p2[0]) < 0 || (l2p2[0] - l1p1[0]) * (l2p2[0] - l1p2[0]) < 0) {
                return true;
            }
        }
        else {//垂直X轴
            if ((l1p1[1] - l2p1[1]) * (l1p1[1] - l2p2[1]) < 0 || (l1p2[1] - l2p1[1]) * (l1p2[1] - l2p2[1]) < 0 || (l2p1[1] - l1p1[1]) * (l2p1[1] - l1p2[1]) < 0 || (l2p2[1] - l1p1[1]) * (l2p2[1] - l1p2[1]) < 0) {
                return true;
            }
        }

        return false;
    }
    private detectAxisCollision(axis: any, lineArr: any) {//矩形的轴和另一个矩形要比较的四个边

        for (var i = 0, len = lineArr.length; i < len; i++) {
            var tyLine = this.getLineTYToAxis(lineArr[i], axis);//获取线段在轴上的投影线段 [[a,b],[a1,b1]]
            var tyAxis = this.getLineTYToAxis(axis, axis);

            if (this.isLineOverlap(tyLine, tyAxis)) {
                return true;
            }
        }
        return false;
    }
    RectToRectCollisionDec(r1PointArray: Array<Point>, r2PointArray: Array<Point>) {

        var linesArr1 = this.getFourLines(r1PointArray);//矩形1的四条边
        var linesArr2 = this.getFourLines(r2PointArray);//矩形2的四条边

        //矩形相邻的两个边作为两个轴，并且和另一个矩形的四个边进行投影重叠的比较
        if (this.detectAxisCollision(linesArr2[0], linesArr1) && this.detectAxisCollision(linesArr2[1], linesArr1) && this.detectAxisCollision(linesArr1[0], linesArr2) && this.detectAxisCollision(linesArr1[1], linesArr2)) {
            return true;
        }
        return false;

    }
    //直线和矩形相交判断，
    //依次判断直线是否和矩形的四条边中任意一边相交
    RectRoArcCollisionDec(arcPointArray: Array<Point>, rectPointArray: Array<Point>): boolean {
        var lenght = rectPointArray.length;
        var isCollision = false;
        for (var i = 0; i < lenght; i++) {
            var points = new Array<Point>();
            points.push(rectPointArray[i]);
            points.push(rectPointArray[(i + 1) % 4]);
            isCollision = this.LineToArcCollisionDec(points, arcPointArray);
            if (isCollision) {
                break;
            }
        }
        return isCollision
    }
    RectRoLineCollisionDec(linePointArray: Array<Point>, rectPointArray: Array<Point>): boolean {
        var lenght = rectPointArray.length;
        var isCollision = false;
        for (var i = 0; i < lenght; i++) {
            isCollision = this.LineToLineCollisionDec(linePointArray[0], linePointArray[1], rectPointArray[i], rectPointArray[(i + 1) % 4]);

            if (isCollision) {
                break;
            }
        }
        return isCollision
    }
    CCW(p1: any, p2: any, p3: any): boolean {
        return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }


    LineToLineCollisionDec(line1Start: Point, line1End: Point, line2Start: Point, line2End: Point) {
        return (this.CCW(line1Start, line2Start, line2End) != this.CCW(line1End, line2Start, line2End)) && (this.CCW(line1Start, line1End, line2Start) != this.CCW(line1Start, line1End, line2End));
    }

    ///曲线相交判断
    ArcToArcCollisionDec(arc1PointArray: Array<Point>, arc2PointArray: Array<Point>): boolean {
        var l1 = this.LineToLineCollisionDec(arc1PointArray[0], arc1PointArray[2], arc2PointArray[0], arc2PointArray[2]);
        if (l1) return true;
        var l2 = this.LineToLineCollisionDec(arc1PointArray[0], arc1PointArray[2], arc2PointArray[2], arc2PointArray[1]);
        if (l2) return true;
        var l3 = this.LineToLineCollisionDec(arc1PointArray[2], arc1PointArray[1], arc2PointArray[2], arc2PointArray[1]);
        if (l3) return true;
        var l4 = this.LineToLineCollisionDec(arc1PointArray[2], arc1PointArray[0], arc2PointArray[0], arc2PointArray[2]);
        if (l4) return true;
        return false;
    }
    ///曲线相交判断
    LineToArcCollisionDec(linePointArray: Array<Point>, arc2PointArray: Array<Point>): boolean {
        var l1 = this.LineToLineCollisionDec(linePointArray[0], linePointArray[1], arc2PointArray[0], arc2PointArray[2]);
        if (l1) return true;
        var l2 = this.LineToLineCollisionDec(linePointArray[0], linePointArray[1], arc2PointArray[2], arc2PointArray[1]);
        if (l2) return true;

        return false;
    }
}