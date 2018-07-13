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
        return { x: p.x + d * cosa, y: p.y + d * sina };
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
    //求两个线段所在直线的交点坐标 线段(p1,p2)(p3,p4)的交点
    static intersectionCoords(a: Point, b: Point, c: Point, d: Point) {
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

        // 返回交点p
        return new Point(x, y);
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
        end: Point)   // 直线结束点  
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
        console.log(distance)
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
    static FiniteDifferencesDifferentiator(nbPoints, stepSize,
        tLower, tUpper)
   {

    if (nbPoints <= 1) {
        
    }
    // this.nbPoints = nbPoints;

    if (stepSize <= 0) {
        return false
    }
    // this.stepSize = stepSize;

   var halfSampleSpan = 0.5 * stepSize * (nbPoints - 1);
    if (2 * halfSampleSpan >= tUpper - tLower) {
        return false
    }
    var safety = GWTMath.ulp(halfSampleSpan);
    var tMin = tLower + halfSampleSpan + safety;
    var tMax = tUpper - halfSampleSpan - safety;

}


}

// static class PointComparator implements Comparator<Point2D> {

//     /*
//      * Sorts the points so that the lowest - leftmost one is the first. Used
//      * by both Graham's and Jarvis's algorithms.
//      */
//     @Override
//     public int compare(Point2D o1, Point2D o2) {
//         double y1 = o1.getY();
//         double y2 = o2.getY();
//         double yDiff = y1 - y2;
//         double errorTolerance = LineAndPointUtils.getErrorTolerance();
//         if (yDiff < -errorTolerance) {
//             return -1;
//         } else if (yDiff > errorTolerance) {
//             return 1;
//         } else {
//             double x1 = o1.getX();
//             double x2 = o2.getX();
//             double xDiff = x1 - x2;

//             if (xDiff < -errorTolerance) {
//                 return -1;
//             } else if (xDiff > errorTolerance) {
//                 return 1;
//             } else {
//                 return 0;
//             }
//         }
//     }
// }

// /*
//  * static class PointComparator implements Comparator<Point2D> {
//  * 
//  * public int compare(Point2D o1, Point2D o2) { double y1 = o1.getY();
//  * double y2 = o2.getY(); if (y1 < y2) { return -1; } else if (y1 == y2) {
//  * double x1 = o1.getX(); double x2 = o2.getX();
//  * 
//  * if (x1 < x2) { return -1; } else if (x1 == x2) { return 0; } else {
//  * return 1; } } else { return 1; } } }
//  */

// static class PolarAngleComparator implements Comparator<Point2D> {

//     private Point2D p0;

//     public PolarAngleComparator(Point2D p0) {
//         this.p0 = p0;
//     }

//     /*
//      * Sorts the points so that the lowest - leftmost one is the first. Used
//      * by both Graham's and Jarvis's algorithms.
//      */
//     @Override
//     public int compare(Point2D p1, Point2D p2) {

//         Double theta1 = polarAngle(p0, p1);
//         Double theta2 = polarAngle(p0, p2);

//         if (theta1 == null) {
//             theta1 = new Double(0);
//         }

//         if (theta2 == null) {
//             theta2 = new Double(0);
//         }

//         if (p1.equals(p0)) {
//             theta1 = -500.0;
//         }

//         if (p2.equals(p0)) {
//             theta2 = -500.0;
//         }

//         if (theta1 < theta2) {
//             return -1;
//         } else if (Math.abs(
//                 theta1.doubleValue() - theta2.doubleValue()) < 10E-15) {
//             double errorTolerance = LineAndPointUtils.getErrorTolerance();
//             double x1 = p1.getX();
//             double x2 = p2.getX();
//             double xDiff = x1 - x2;

//             if (xDiff < -errorTolerance) {
//                 return -1;
//             } else if (xDiff > errorTolerance) {
//                 return 1;
//             } else {
//                 return 0;
//             }
//         } else {
//             return 1;
//         }
//     }
// }
//极角
// static Double polarAngle(Point2D p0, Point2D p1) {
//     if (p0.equals(p1)) {
//         return null;
//     }
//     double dy = p1.getY() - p0.getY();
//     double dx = p1.getX() - p0.getX();
//     double result = Math.toDegrees(Math.atan(dy / dx));
//     if (dx < 0) {
//         result = 180 + result;
//     } else {
//         if (dy < 0) {
//             result = 270 + result;
//         }
//     }
//     return result;
// }
//相对负轴的极角
// private static Double polarAngleNegAxis(Point2D p0, Point2D p1) {
//     if (p0.equals(p1)) {
//         return null;
//     }
//     double dy = p1.getY() - p0.getY();
//     double dx = p1.getX() - p0.getX();
//     double result = Math.toDegrees(Math.atan(dy / dx));
//     if (dx < 0) {
//         result = 180 + result;
//     }
//     result = (result + 180) % 360;
//     return result;
// }

// private static int jarvisFindSmallestPolarAngle(List<Point2D> points,
//         Point2D p0, boolean rightChain) {
//     /*
//      * Returns the index of the point with the smallest polar angle relative
//      * to p0 The rightChain parameter defines whether we are looking for the
//      * smallest polar angle in the left or the right chain of the hull.
//      */

//     int i = 0;
//     int index = 0;
//     double minAngle = 500;
//     Double polarAngle;

//     for (Iterator<Point2D> it = points.iterator(); it.hasNext();) {
//         Point2D point = it.next();
//         if (rightChain) {
//             polarAngle = polarAngle(p0, point);
//         } else {
//             polarAngle = polarAngleNegAxis(p0, point);
//         }

//         if ((polarAngle != null) && (polarAngle < minAngle)) {
//             index = i;
//             minAngle = polarAngle;
//         }
//         i++;
//     }

//     return index;
// }

// /**
//  * @param points
//  *            points
//  * @return list of convex hull points  返回由这些点组成的图形 的凸壳点列表
//  */
// public static List<Point2D> jarvisMarch(List<Point2D> points) {

//     List<Point2D> result = new ArrayList<>();

//     if (points.size() > 2) {

//         Collections.sort(points, new PointComparator());

//         Point2D lowestPoint = points.get(0);
//         Point2D highestPoint = points.get(points.size() - 1);

//         result.add(lowestPoint);

//         Point2D p = lowestPoint;
//         Point2D p1;
//         int index = 1;
//         while (!p.equals(highestPoint)) {
//             index = jarvisFindSmallestPolarAngle(points, p, true);
//             result.add(points.get(index));
//             p1 = points.get(index);
//             p = p1;
//         }

//         while (!p.equals(lowestPoint)) {
//             index = jarvisFindSmallestPolarAngle(points, p, false);
//             result.add(points.get(index));
//             p1 = points.get(index);
//             p = p1;
//         }
//     }

//     return result;

// }

// //点是否为相等的，在允许误差范围内
// 	/**
// 	 * @param p1
// 	 *            point
// 	 * @param p2
// 	 *            point
// 	 * @return whether points are equal
// 	 */
// 	public static boolean pointsAreEqual(Point2D p1, Point2D p2) {
// 		double x1 = p1.getX();
// 		double y1 = p1.getY();
// 		double x2 = p2.getX();
// 		double y2 = p2.getY();

// 		if ((Math.abs(y2 - y1) <= errorTolerance)
// 				&& (Math.abs(x2 - x1) <= errorTolerance)) {
// 			return true;
// 		}
// 		return false;
// 	}