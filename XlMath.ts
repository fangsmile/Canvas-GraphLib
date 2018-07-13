import { Point } from './Point'

export class XlMath {

    private static _instance: XlMath;
    private constructor() { }
    public static getInstance() {

        if (!XlMath._instance) {
            XlMath._instance = new XlMath();
        }
        return XlMath._instance;
    }
    static distanceBetweenPoints(pt1: Point, pt2: Point) {
        var distance = Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2))
        return distance
    }
    //判断p1是否在p2和p3之间
    static isBetweenPoints(pt1: Point, pt2: Point, pt3: Point) {
        return ((pt1.x - pt2.x) * (pt3.x - pt1.x) >= 0 && (pt1.y - pt2.y) * (pt3.y - pt1.y) >= 0)
    }
    // //求点到线段的交点,pt1,pt2为两点，求pt3点到线段的交点
    // static interPointToLine(pt1: Point, pt2: Point, pt3: Point) {
    //     //console.log(pt1.x + " pt1 " + pt1.y + " " + pt2.x + " pt2 " + pt2.y + " " + pt3.x + " pt3 " + pt3.y)
    //     var k = (pt1.y - pt2.y) / (pt1.x - pt2.x);
    //     var b = (pt1.y - k * pt1.x);
    //     // 0 = kx-y+b;  对应垂线方程为 -x -ky + m = 0;(mm为系数)  
    //     var m = pt3.x + k * pt3.y;
    //     var A = k, B = -1, C = b;
    //     /// 求两直线交点坐标  
    //     var x = -(C * A + m * B) / (A * A + B * B);
    //     var y = (-A * x - C) / B;
    //     return { x: x, y: y };
    // }
    //求斜率为k的直线上点p移动距离d后的坐标，
    static pointMove(k: number, d: number, p: Point) {
        var sina = k / Math.sqrt(1 + k * k);
        var cosa = 1 / Math.sqrt(1 + k * k);
        return new Point(p.x + d * cosa, p.y + d * sina);
    }
    //从点p1向该直线p2点方向上移动距离d后的坐标，
    static pointMove2(p1: Point, p2: Point, d: number) {
        if ((p1.x - p2.x) != 0) {
            var p = this.pointMove((p1.y - p2.y) / (p1.x - p2.x), d, p1);
            var isSameSide = this.pointInSameSide2(p, p2, p1);
            if (isSameSide)
                return p;
            else
                return this.pointMove((p1.y - p2.y) / (p1.x - p2.x), -d, p1);
        } else {
            var p = new Point(p1.x, p1.y + d);
            var isSameSide = this.pointInSameSide2(p, p2, p1);
            if (isSameSide)
                return p;
            else
                return new Point(p1.x, p1.y - d);
        }

    }
    //求两个数的最大公约数
    static getBigFactor(a: number, b: number): number {
        if (b == 0) {
            return a;
        }
        return this.getBigFactor(b, a % b);
    }

    //某一点绕另外一点旋转某个角度后新位置点坐标
    static computePointAfterRotate(x: number, y: number, x0: number, y0: number, degree: number) {
        var radian = degree * (Math.PI / 180);
        var x1 = -(y - y0) * Math.sin(radian) + (x - x0) * Math.cos(radian) + x0;
        var y1 = (y - y0) * Math.cos(radian) + (x - x0) * Math.sin(radian) + y0;
        return { x: x1, y: y1 };
    }

    public static fomatFloat(src: number, pos: number) {

        return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);

    }
    public static degreeToRadian(degree: number) {
        return degree * (Math.PI / 180);
    }
    public static radianToDegree(radian: number) {
        return radian / (Math.PI / 180);
    }


    public static getRandomColor() {
        var randColor = (Math.random() * 0xFFFFFF << 0).toString(16);
        while (randColor.length < 6) {
            randColor = "0" + randColor;
        }
        return "#" + randColor;
    }

    public static rgbToHex(r: number, g: number, b: number) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    //获取点击canvas上的颜色值
    public static getColorKey(point: any, cxt: CanvasRenderingContext2D) {
        var p = cxt.getImageData(point.x, point.y, 1, 1).data;
        if (p[3] == 255) {
            // fully opaque pixel
            var colorKey = "#" + this.rgbToHex(p[0], p[1], p[2]);
            // if (cxt.canvas.dataset["drawing"] == "hit_drawing")
            //     console.log("getColorKey",colorKey)
            return colorKey;
        }
        return null;
    }
    public static makeRGBA(strRGB: string, alpha: number) {
        var ret = /#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})/.exec(strRGB);
        if (ret !== null) {
            var r = parseInt(ret[1], 16);
            var g = parseInt(ret[2], 16);
            var b = parseInt(ret[3], 16);
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        }
        strRGB = strRGB.replace(/\s/g, "");
        ret = /rgb\(([0-9]+),([0-9]+),([0-9]+)\)/i.exec(strRGB);
        if (ret !== null) {
            var r = parseInt(ret[1], 10);
            var g = parseInt(ret[2], 10);
            var b = parseInt(ret[3], 10);
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        }
        return null;
    }

    //通过两点计算x1,y1为圆心,圆上某点（x2,y2）的角度（按照arc的角度计算）
    public static computeAng(x1: number, y1: number, x2: number, y2: number) {
        var ang = (x1 - x2) / (y1 - y2);
        ang = Math.atan(ang);
        if (x1 == x2 && y2 > y1) {
            return 0.5 * Math.PI;
        }
        if (x1 == x2 && y2 < y1) {
            return 1.5 * Math.PI;
        }
        if (y1 == y2 && x2 > x1) {
            return 0;
        }
        if (y1 == y2 && x2 < x1) {
            return Math.PI;
        }
        if (x2 > x1 && y2 > y1) {
            return Math.PI / 2 - ang;
        }
        else if (x2 < x1 && y2 > y1) {
            return Math.PI / 2 - ang;
        }
        else if (x2 < x1 && y2 < y1) {
            return 3 * Math.PI / 2 - ang;
        }
        else if (x2 > x1 && y2 < y1) {
            return 3 * Math.PI / 2 - ang;
        }
    }
    //三个点组成的三角形，点cen的所在顶点的角度
    static Angle(cen: Point, first: Point, second: Point) {
        var dx1, dx2, dy1, dy2;
        var angle;

        dx1 = first.x - cen.x;
        dy1 = first.y - cen.y;

        dx2 = second.x - cen.x;

        dy2 = second.y - cen.y;

        var c = Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (c == 0) return -1;

        angle = Math.acos((dx1 * dx2 + dy1 * dy2) / c);

        return angle;
    }
    //在某个以cen为圆心的圆中，point所在位置的角度，从右侧0度开始计算
    static AngleFromZero(cen: Point, point: Point) {

        var first = new Point(cen.x + 100, cen.y);
        var degree = this.Angle(cen, first, point);

        if (point.y < cen.y)
            degree = 2 * Math.PI - degree;
        return degree;
    }
    //求两个线段所在直线的交点坐标 线段(p1,p2)(p3,p4)的交点
    static intersectionCoords(a: Point, b: Point, c: Point, d: Point) {
        /** 1 解线性方程组, 求线段交点. **/
        // 如果分母为0 则平行或共线, 不相交
        //TOFix -- 这里有bug,当两条线平行，但是向量方向相反时，分母可能为一极小数，导致除法结果值极大，脱离正常逻辑区间
        //示例 a {x: 85.46105656212993, y: -4.4295106003164335}，b {x: -14.604732911554283, y: 58.16308199227616}
        // c {x: -14.64141429758729, y: 58.86923136704968} d {x: 85.42437517609692, y: -3.7233612255429236} 向量 ab = -cd
        // 结果为 {x: 7521801801868128, y: -4704995365777600} ，极小值导致的精度误差
        var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return null;
        }

        // 线段所在直线的交点坐标 (x , y)
        var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        // 返回交点p
        return new Point(x, y);
    }

    //求两条线段是否相交，及其交点
    public static intersectionLiner(a: Point, b: Point, c: Point, d: Point) {

        // 三角形abc 面积的2倍  
        var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

        // 三角形abd 面积的2倍  
        var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

        // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);  
        if (area_abc * area_abd >= 0) {
            return null;
        }

        // 三角形cda 面积的2倍  
        var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
        // 三角形cdb 面积的2倍  
        // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.  
        var area_cdb = area_cda + area_abc - area_abd;
        if (area_cda * area_cdb >= 0) {
            return null;
        }

        //计算交点坐标  
        var t = area_cda / (area_abd - area_abc);
        var dx = t * (b.x - a.x),
            dy = t * (b.y - a.y);
        return { x: a.x + dx, y: a.y + dy };
    }
    //求线段与圆是否相交,若有两个交点返回这两个点，否则返回null
    //https://thecodeway.com/blog/?p=932
    public static intersectionCircle(o: Point, r: number, a: Point, b: Point) {
        let result = null;
        let A = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
        let B = 2 * ((b.x - a.x) * (a.x - o.x) + (b.y - a.y) * (a.y - o.y));
        let C = o.x * o.x + o.y * o.y + a.x * a.x + a.y * a.y - 2 * (o.x * a.x + o.y * a.y) - r * r;
        let deltaU1 = (-1 * B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
        let deltaU2 = (-1 * B - Math.sqrt(B * B - 4 * A * C)) / (2 * A);
        if ((deltaU1 > 1 && deltaU2 > 1) || (deltaU1 < 0 && deltaU2 < 0)) {
            //如果线段和圆没有交点，而且都在圆的外面的话，则u的两个解都是小于0或者大于1的
            result = null;
        } else if ((deltaU1 < 0 && deltaU2 > 1) || (deltaU1 > 1 && deltaU2 < 0)) {
            //如果线段和圆没有交点，而且都在圆的里面的话，u的两个解符号相反，一个小于0，一个大于1
            result = null;
        } else if ((deltaU1 > 0 && deltaU1 < 1 && (deltaU2 > 1 || deltaU2 < 0)) || ((deltaU1 < 0 || deltaU1 > 1) && deltaU2 > 0 && deltaU2 < 1)) {
            //如果线段和圆只有一个交点，则u值中有一个是在0和1之间，另一个不是
            result = null;
        } else if (0 < deltaU1 && deltaU1 < 1 && 0 < deltaU2 && deltaU2 < 1) {
            //如果线段和圆有两个交点，则u值得两个解都在0和1之间
            result = [
                {
                    x: a.x + deltaU1 * (b.x - a.x),
                    y: a.y + deltaU1 * (b.y - a.y)
                },
                {
                    x: a.x + deltaU2 * (b.x - a.x),
                    y: a.y + deltaU2 * (b.y - a.y)
                },
            ]
        } else if (deltaU1 === deltaU2 && 0 < deltaU1 && deltaU1 < 1) {
            //如果线段和圆相切，则u值只有1个解，且在0和1之间
            result = null;
        } else {
            result = null;
        }
        return result;
    }

    //求两条平行直线间的距离
    public static parallelLineDistance(a: Point, b: Point, c: Point, d: Point) {
        //直线AB和CD 
        let isParallelLine = this.intersectionCoords(a, b, c, d);
        if (isParallelLine === null || (Math.abs(isParallelLine.x) > Math.max() && Math.abs(isParallelLine.y) > Math.max())) {
            let A = b.y - a.y;
            let B = a.x - b.x;
            let c1 = b.x * a.y - a.x * b.y;
            let c2 = d.x * c.y - c.x * d.y;
            let distance = Math.abs(c1 - c2) / Math.sqrt(A * A + B * B);
            return distance;
        } else {
            return null;
        }
    }

    //根据某点直角坐标（x，y）计算该点与原点连线跟y轴夹角
    static angleFromNorth_ClockWise(fOriginX_Vec: number, fOriginY_Vec: number,
        fEndX_Vec: number, fEndY_Vec: number) {
        var fEndX = fEndX_Vec - fOriginX_Vec;
        var fEndY = fEndY_Vec - fOriginY_Vec;
        var fLen = Math.sqrt(fEndX * fEndX + fEndY * fEndY);
        var fAngle = Math.acos(fEndY / fLen);

        if (fEndX < 0) {
            fAngle = 2 * Math.PI - fAngle;
        }

        return fAngle;
    }
    //判断由p1到p2到p3 是否为顺时针
    /* 
    定义：平面上的三点P1(x1,y1),P2(x2,y2),P3(x3,y3)的面积量： 
    　　　　　　          |x1 x2 x3| 
         S(P1,P2,P3) = |y1 y2 y3| = (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3) 
             |1  1   1| 
     当P1P2P3逆时针时S为正的，当P1P2P3顺时针时S为负的,为0时共线。  ??????? 
     */
    static pointsClockWise(p1: Point, p2: Point, p3: Point) {
        var val = ((p1.x - p3.x) * (p2.y - p3.y) - (p1.y - p3.y) * (p2.x - p3.x));
        if (val > 0)
            return true;
        else
            return false
    }

    //计算空间一条直线外一点到这条直线的垂足点坐标。
    static GetFootOfPerpendicular(
        pt: Point,     // 直线外一点  
        begin: Point,  // 直线开始点  
        end: Point): Point  // 直线结束点  
    {
        var retVal;
        var dx = begin.x - end.x;
        var dy = begin.y - end.y;
        if (Math.abs(dx) < 0.00000001 && Math.abs(dy) < 0.00000001) {
            retVal = begin;
            return retVal;
        }

        var u = (pt.x - begin.x) * (begin.x - end.x) +
            (pt.y - begin.y) * (begin.y - end.y);
        u = u / ((dx * dx) + (dy * dy));

        var x = begin.x + u * dx;
        var y = begin.y + u * dy;
        return new Point(x, y);
    }
    //计算空间一条直线外一点关于这条直线的对称点坐标。
    static GetSymmetryPoint(
        pt: Point,     // 直线外一点  
        begin: Point,  // 直线开始点  
        end: Point)   // 直线结束点  
    {
        var chuizhu = this.GetFootOfPerpendicular(pt, begin, end);
        var newX = chuizhu.x - pt.x + chuizhu.x;
        var newY = chuizhu.y - pt.y + chuizhu.y;
        return new Point(newX, newY);
    }

    //计算两点AB 是否在由两点CD确定的直线的同侧（在直线上也算同侧）
    static pointInSameSide(A: Point, B: Point, C: Point, D: Point) {
        var Av = (A.x - C.x) / (D.x - C.x) - (A.y - C.y) / (D.y - C.y);
        var Bv = (B.x - C.x) / (D.x - C.x) - (B.y - C.y) / (D.y - C.y);
        if (Av * Bv >= 0)
            return true;
        return false;
    }
    //计算两点AB 是否在点P的同侧（在直线上也算同侧）
    static pointInSameSide2(A: Point, B: Point, P: Point) {
        if ((A.x - P.x) * (B.x - P.x) >= 0 && (A.y - P.y) * (B.y - P.y) >= 0)
            return true;
        return false;
    }
    //计算一个扇形最小的值
    static MinCirclrVal(x: number, y: number, radius: number, startDegree: number, endDegree: number) {

    }
    //给出一次列点，计算出这些点所占据的矩形的值
    static rectPoint(points: Array<Point>) {
        let passX: Array<number> = [];
        let PassY: Array<number> = [];
        points.forEach((element: Point) => {
            if (element.x) {
                passX.push(element.x);
            }
            if (element.y) {
                PassY.push(element.y);
            }
        });

        return {
            minX: Math.min(...passX),
            minY: Math.min(...PassY),
            maxX: Math.max(...passX),
            maxY: Math.max(...PassY),
        }
    }
    //生成围绕某个中心点生成正多边形的点列表
    static polylinePoints(nPoints: number, centerPoint: Point, radius: number, startAngle: number = 0) {
        var points = [];
        //此处吧<=修改为小于 否者最后一个点会和第一个点重合
        for (var ixVertex = 0; ixVertex < nPoints; ++ixVertex) {
            var angle = ixVertex * 2 * Math.PI / nPoints - startAngle;
            var point = new Point(centerPoint.x + radius * Math.cos(angle), centerPoint.y + radius * Math.sin(angle));
            points.push(point);
        }
        return points;
    }

    static getPointOnLineConfig(point: Point, line: Array<Point>) {
        let temp: any = {};
        let p = this.GetFootOfPerpendicular(point, line[0], line[1]);//垂点
        let distance = this.distanceBetweenPoints(p, point)
        temp = { distance: distance, p: p };
        let config = {
            //最近的线
            line: line,
            //比例
            val: this.distanceBetweenPoints(line[0], temp.p) / this.distanceBetweenPoints(line[0], line[1]),
            temp: temp
        };
        return config
    }
    /**
     * 根据三点球三角心面积
     * @param points 
     */
    static triangleArea(points: Array<Point>) {
        return Math.abs((points[1].x - points[0].x) * (points[2].y - points[0].y) - (points[2].x - points[0].x) * (points[1].y - points[0].y)) / 2
    }
    /**
     * 求外接圆圆心及半径
     * @param points 
     */
    static getOutCircleCenter(points: Array<Point>) {
        let a, b, c, xa, xb, xc, ya, yb, yc, c1, c2;
        let temx, temy, r;
        a = this.distanceBetweenPoints(points[0], points[1]);
        b = this.distanceBetweenPoints(points[0], points[2]);
        c = this.distanceBetweenPoints(points[2], points[1]);
        r = a * b * c / this.triangleArea(points) / 4;
        xa = points[0].x; ya = points[0].y;
        xb = points[1].x; yb = points[1].y;
        xc = points[2].x; yc = points[2].y;
        c1 = (xa * xa + ya * ya - xb * xb - yb * yb) / 2;
        c2 = (xa * xa + ya * ya - xc * xc - yc * yc) / 2;
        temx = (c1 * (ya - yc) - c2 * (ya - yb)) / ((xa - xb) * (ya - yc) - (xa - xc) * (ya - yb));
        temy = (c1 * (xa - xc) - c2 * (xa - xb)) / ((ya - yb) * (xa - xc) - (ya - yc) * (xa - xb));
        return {
            r: r,
            tem: new Point(temx, temy)
        };

    }
    /**
     * 求内切圆圆心及半径
     * @param points
     */
    static getInCircleCenter(points: Array<Point>) {
        let a, b, c;
        let temx, temy, r;
        a = this.distanceBetweenPoints(points[0], points[1]);
        b = this.distanceBetweenPoints(points[0], points[2]);
        c = this.distanceBetweenPoints(points[2], points[1]);
        r = 2 * this.triangleArea(points) / (a + b + c);
        let p = a + b + c;//周长

        temx = (a * points[2].x + b * points[1].x + c * points[0].x) / p;
        temy = (a * points[2].y + b * points[1].y + c * points[0].y) / p;
        return {
            tem: new Point(temx, temy),
            r: r,
        };
    }
    /**
     * 根据平行四边形三个点计算出第四个点
     */
    static getParallelogramLast(points: Array<Point>) {
        return new Point(points[0].x + (points[2].x - points[1].x), points[0].y + (points[2].y - points[1].y))
    }
    /**
     * 获取两点之间的中点
     * @param start 
     * @param end 
     */
    static getCenterPointInLine(start: Point, end: Point) {
        return new Point((start.x + end.x) / 2, (start.y + end.y) / 2)
    }
    /**
        * 根判断所有的是否在同一条直线上面,需要有一定的顺序
        */
    static isPointsOnLine(points: Array<Point>) {
        let isSame = true;
        if (points && points.length >= 2) {
            let k = null;
            let isXAxis = null;
            let isYAxis = null;
            for (let i = 1; i <= points.length - 1; i++) {
                if (points[i].y == points[i - 1].y && points[i].x == points[i - 1].x) { }
                else if (typeof isXAxis == 'boolean') {
                    if (points[i].y != points[i - 1].y) {
                        isSame = false;
                        break;
                    }
                }
                else if (typeof isYAxis == 'boolean') {
                    if (points[i].x != points[i - 1].x) {
                        isSame = false;
                        break;
                    }
                }
                else if (typeof k == 'number') {
                    if (Math.abs(k - (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x)) >= 0.00001) {
                        isSame = false;
                        break;
                    }
                } else {
                    if (points[i].y == points[i - 1].y)
                        isXAxis = true;
                    else if (points[i].x == points[i - 1].x)
                        isYAxis = true;
                    else
                        k = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x);
                }
            }

        }
        return isSame;
    }
    static getDegreeByX(p1: Point, p2: Point) {
        return Math.atan((p2.y - p1.y) / (p2.x - p1.x))
    }

    /**
     * 判断点是否在直线ab上
     */
    static isPointOnLine(a: Point, b: Point, p: Point) {
        let result = false;
        if (!a || !b || !p) {
            result = false;
        }
        let A = b.y - a.y;
        let B = a.x - b.x;
        let C = b.x * a.y - a.x * b.y;
        if (A * p.x + B * p.y + C === 0) {
            result = true;
        }
        return result;
    }

    /**
     * 点到直线距离
     */
    static getDistancePointToLine(a: Point, b: Point, p: Point) {
        let distance = null;
        if (!a || !b || !p) {
            distance = null;
        }
        let A = b.y - a.y;
        let B = a.x - b.x;
        let C = b.x * a.y - a.x * b.y;

        distance = Math.abs((A * p.x + B * p.y + C) / (Math.sqrt(A * A + B * B)));
        return distance;
    }
    //保留两位小数 
    //功能：将浮点数四舍五入，取小数点后2位 
    static toDecimal(x: number) {
        // var f = parseFloat(x);
        if (isNaN(x)) {
            return;
        }
        var f = Math.round(x * 100) / 100;
        return f;
    }
    /**
     * @description 回转数法判断点是否在多边形内部
     * @param {Object} p 待判断的点，格式：{ x: X坐标, y: Y坐标 }
     * @param {Array} poly 多边形顶点，数组成员的格式同 p
     * @return {String} 点 p 和多边形 poly 的几何关系
     */
    static windingNumber(p: Point, poly: Array<Point>) {
        var px = p.x,
            py = p.y,
            sum = 0

        for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
            var sx = poly[i].x,
                sy = poly[i].y,
                tx = poly[j].x,
                ty = poly[j].y

            // 点与多边形顶点重合或在多边形的边上
            if ((sx - px) * (px - tx) >= 0 && (sy - py) * (py - ty) >= 0 && (px - sx) * (ty - sy) === (py - sy) * (tx - sx)) {
                return 'on'
            }

            // 点与相邻顶点连线的夹角
            var angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px)

            // 确保夹角不超出取值范围（-π 到 π）
            if (angle >= Math.PI) {
                angle = angle - Math.PI * 2
            } else if (angle <= -Math.PI) {
                angle = angle + Math.PI * 2
            }

            sum += angle
        }

        // 计算回转数并判断点和多边形的几何关系
        return Math.round(sum / Math.PI) === 0 ? 'out' : 'in'
    }
    static getRectLastPoint(array: Array<Point>) {
        // let x1 = array[0].x, y1 = array[0].y, x2 = array[1].x, y2 = array[2].y, x3 = array[2].x, y3 = array[2].y, g;
        // if (Math.round((x1 - x2) * (x2 - x3) + (y1 - y2) * (y2 - y3)) == 0) {
        //     g = this.getPoint(x1, y1, x2, y2, x3, y3);
        // }
        // if (Math.round((x1 - x3) * (x2 - x3) + (y1 - y3) * (y2 - y3)) == 0) {
        //     g = this.getPoint(x1, y1, x3, y3, x2, y2);
        // }
        // if (Math.round((x1 - x3) * (x2 - x1) + (y1 - y3) * (y2 - y1)) == 0) {
        //     g = this.getPoint(x3, y3, x1, y1, x2, y2);
        // }
        // return g;
        let p1 = array[0], p2 = array[1], p3 = array[2];
        return new Point(p1.x + p3.x - p2.x, p1.y + p3.y - p2.y)

    }
    // static getPoint(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    //     let g = new Point(x1 + x3 - x2, y1 + y3 - y2)
    //     return g;
    // }


    static judge(p: Point, center: Point, r: number)// 判断是否在圆内
    {
        if ((p.x - center.x) * (p.x - center.x) + (p.y - center.y) * (p.y - center.y) - r * r <= 0)
            return 1;
        return 0;
    }
    //判断线段和圆是否相交
    static Judis(p1: Point, p2: Point, yuan: Point, r: number) //线段与圆的关系
    {
        if (this.judge(p1, yuan, r) && this.judge(p2, yuan, r))//都在圆内 不相交
            return false;
        if (!this.judge(p1, yuan, r) && this.judge(p2, yuan, r) || this.judge(p1, yuan, r) && !this.judge(p2, yuan, r))//一个圆内一个圆外 相交
            return true;
        let A, B, C, dist1, dist2, angle1, angle2;//Ax+By+C=0;//(y1-y2)x +(x2-x1)y +x1y2-y1x2=0
        if (p1.x == p2.x)
            A = 1, B = 0, C = -p1.x;
        else if (p1.y == p2.y)
            A = 0, B = 1, C = -p1.y;
        else {
            A = p1.y - p2.y;
            B = p2.x - p1.x;
            C = p1.x * p2.y - p1.y * p2.x;
        }
        dist1 = A * yuan.x + B * yuan.y + C;
        dist1 *= dist1;
        dist2 = (A * A + B * B) * r * r;
        if (dist1 > dist2) return false;//点到直线距离大于半径r  不相交
        angle1 = (yuan.x - p1.x) * (p2.x - p1.x) + (yuan.y - p1.y) * (p2.y - p1.y);
        angle2 = (yuan.x - p2.x) * (p1.x - p2.x) + (yuan.y - p2.y) * (p1.y - p2.y);
        if (angle1 > 0 && angle2 > 0) return true;//余弦都为正，则是锐角 相交
        return false;//不相交
    }


    /*求直线与圆的交点
     返回值:交点坐标(x,y)
    */
    static LineInterCircle(ptStart: Point, ptEnd: Point, ptCenter: Point, Radius: number) {
        let Radius2 = Radius * Radius;
        let EPS = 0.00001;
        let ptInter1 = null;
        let ptInter2 = null;
        var fDis = Math.sqrt((ptEnd.x - ptStart.x) * (ptEnd.x - ptStart.x) + (ptEnd.y - ptStart.y) * (ptEnd.y - ptStart.y));
        var d = new Point(0, 0);
        d.x = (ptEnd.x - ptStart.x) / fDis;
        d.y = (ptEnd.y - ptStart.y) / fDis;
        var E = new Point(0, 0);
        E.x = ptCenter.x - ptStart.x;
        E.y = ptCenter.y - ptStart.y;
        var a = E.x * d.x + E.y * d.y;
        var a2 = a * a;
        var e2 = E.x * E.x + E.y * E.y;
        if ((Radius2 - e2 + a2) < 0) {
            return null;
        }
        else {
            var f = Math.sqrt(Radius2 - e2 + a2);
            var t = a - f;
            if (((t - 0.0) > -EPS) && (t - fDis) < EPS) {
                ptInter1 = new Point(ptStart.x + t * d.x, ptStart.y + t * d.y);
            }
            t = a + f;
            if (((t - 0.0) > -EPS) && (t - fDis) < EPS) {
                ptInter2 = new Point(ptStart.x + t * d.x, ptStart.y + t * d.y);
            }
            return { p1: ptInter1, p2: ptInter2 };
        }
    }
    //求两线段的交点坐标
    static segmentsIntr(a: Point, b: Point, c: Point, d: Point) {
        let EPS = 0.00001;
        /** 1 解线性方程组, 求线段交点. **/
        // 如果分母为0 则平行或共线, 不相交  
        var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return null;
        }

        // 线段所在直线的交点坐标 (x , y)      
        var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        /** 2 判断交点是否在两条线段上 **/
        if (
            // 交点在线段1上  
            (x - a.x) * (x - b.x) <= EPS && (y - a.y) * (y - b.y) <= EPS
            // 且交点也在线段2上  
            && (x - c.x) * (x - d.x) <= EPS && (y - c.y) * (y - d.y) <= EPS
        ) {

            // 返回交点p  
            return new Point(x, y);
        }
        //否则不相交  
        return null
    }

    // 计算 |p1 p2| X |p1 p|
    static GetCross(p1: Point, p2: Point, p: Point) {
        return (p2.x - p1.x) * (p.y - p1.y) - (p.x - p1.x) * (p2.y - p1.y);
    }
    //判断点p是否在p1p2p3p4的正方形内
    static IsPointInMatrix(p1: Point, p2: Point, p3: Point, p4: Point, p: Point) {
        let isPointIn = this.GetCross(p1, p2, p) * this.GetCross(p3, p4, p) >= 0 && this.GetCross(p2, p3, p) * this.GetCross(p4, p1, p) >= 0;
        return isPointIn;
    }
}