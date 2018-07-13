import { Shape } from "./Shape";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
export class SectorConfig {
    startDegree: number = 0;
    endDegree: number = 360;
    radius: number;
    clockWise: boolean = true;
    centerPoint: Point;
    constructor(
        radius: number,
        centerPoint: Point,
        startDegree: number = 0,
        endDegree: number = 360,
        clockWise: boolean = true,
        isSector: boolean = false) {
        this.startDegree = startDegree;
        this.endDegree = endDegree;
        this.radius = radius;
        this.clockWise = clockWise;
        this.centerPoint = centerPoint;
    }
}
export class Sector extends Shape {
    className: string = "Sector"
    sectorConfig: SectorConfig;
    renderStyle: RenderStyle;
    isScaleRadius: boolean;//半径是否需要跟随画布scale值而变化，true的时候绘制draw的时候 radius需要重新计算
    constructor(sectorConfig: SectorConfig, renderStyle: RenderStyle, isScaleRadius: boolean = false, colorKey: string = null) {
        super(renderStyle, null, null, colorKey);
        this.isScaleRadius = isScaleRadius;
        this.sectorConfig = sectorConfig;
    }

    drawPath(ctx: CanvasContext) {
        let scale = ctx.currentMatrix.a;
        // ctx.sector(this.sectorConfig.centerPoint.x, this.sectorConfig.centerPoint.y, this.sectorConfig.radius, this.sectorConfig.startDegree * Math.PI / 180, this.sectorConfig.endDegree * Math.PI / 180, !this.sectorConfig.clockWise);
        // 初始保存
        let sDeg = this.sectorConfig.startDegree * Math.PI / 180, eDeg = this.sectorConfig.endDegree * Math.PI / 180;
        ctx.save();
        // 位移到目标点
        ctx.translate(this.sectorConfig.centerPoint.x, this.sectorConfig.centerPoint.y);
        ctx.beginPath();
        // 画出圆弧
        ctx.arc(0, 0, this.isScaleRadius ? this.sectorConfig.radius / scale : this.sectorConfig.radius, sDeg, eDeg, !this.sectorConfig.clockWise);
        // 再次保存以备旋转
        if (Math.abs(sDeg - eDeg) < 2 * Math.PI) {
            ctx.save();
            // 旋转至起始角度
            ctx.rotate(eDeg);
            // 移动到终点，准备连接终点与圆心
            ctx.moveTo(this.isScaleRadius ? this.sectorConfig.radius / scale : this.sectorConfig.radius, 0);
            // 连接到圆心
            ctx.lineTo(0, 0);
            // 还原
            ctx.restore();
            // 旋转至起点角度
            ctx.rotate(sDeg);
            // 从圆心连接到起点
            ctx.lineTo(this.isScaleRadius ? this.sectorConfig.radius / scale : this.sectorConfig.radius, 0);
            // this.closePath();
            // 还原到最初保存的状态
            ctx.restore();
        }
    }

    prepareStyle(ctx: CanvasContext) {
        ctx.strokeStyle = this.renderStyle.strokeColor;
        ctx.fillStyle = this.renderStyle.fillColor;
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';//转折的时候不出现尖角
        ctx.lineWidth = this.renderStyle.lineWidth / ctx.currentMatrix.a;
        //以下代码解决bug：http://jira.xuelebj.net/browse/CLASSROOM-4274
        let lineDash = []
        for (let i = 0; i < this.renderStyle.lineDash.length; i++) {
            lineDash[i] = this.renderStyle.lineDash[i] / ctx.currentMatrix.a;
        }
        ctx.setLineDash(lineDash);
        if(this.renderStyle.lineDash.length>1){
            ctx.lineJoin = this.renderStyle.lineJoin;
            ctx.lineCap = this.renderStyle.lineCap;
        }
    }
    moveBy(diffX: number, diffY: number) {
        super.moveBy(diffX, diffY);
        if (this.sectorConfig) {
            this.sectorConfig.centerPoint.x += diffX;
            this.sectorConfig.centerPoint.y += diffY;
        }
    }
    changeRadius(radius: number) {
        this.sectorConfig.radius = radius;
    }
    getRadius() {
        return this.sectorConfig.radius;
    }
    changeStartDegree(degree: number) {
        this.sectorConfig.startDegree = degree;
    }
    changeEndDegree(degree: number) {
        this.sectorConfig.endDegree = degree;
    }
    getSectorConfig() {
        return this.sectorConfig;
    }
    getSectorCenter() {
        return this.sectorConfig.centerPoint;
    }
    getRaduis() {
        return this.sectorConfig.radius;
    }
}

// //扇形
// CanvasRenderingContext2D.prototype.sector = function (x: number, y: number, radius: number, sDeg: number, eDeg: number, counterclockwise: boolean) {
//     // 初始保存
//     this.save();
//     // 位移到目标点
//     this.translate(x, y);
//     this.beginPath();
//     // 画出圆弧
//     this.arc(0, 0, radius, sDeg, eDeg, counterclockwise);
//     // 再次保存以备旋转
//     if (Math.abs(sDeg - eDeg) < 2 * Math.PI) {
//         this.save();
//         // 旋转至起始角度
//         this.rotate(eDeg);
//         // 移动到终点，准备连接终点与圆心
//         this.moveTo(radius, 0);
//         // 连接到圆心
//         this.lineTo(0, 0);
//         // 还原
//         this.restore();
//         // 旋转至起点角度
//         this.rotate(sDeg);
//         // 从圆心连接到起点
//         this.lineTo(radius, 0);
//         // this.closePath();
//         // 还原到最初保存的状态
//         this.restore();
//     }
//     return this;
// }