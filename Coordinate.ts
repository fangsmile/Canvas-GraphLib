import { Shape } from "./Shape";
import { GraphLib } from "./GraphLib";
import { Point } from "./Point";
import { RenderStyle } from "./OptionConfig";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
export class Coordinate extends Shape {
    type: string = "Shape";
    className: string = "Coordinate";
    // width: number;
    // height: number;
    isDrawGrid: boolean = true;//是否绘制网格
    isDrawCoordinate: boolean = true;//是否绘制坐标系
    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;
    private xAxisTextConfig: Array<any> = new Array<any>();
    private yAxisTextConfig: Array<any> = new Array<any>();
    constructor() {
        super(new RenderStyle(false, false, "", "", 0.6));
        // this.width = width;
        // this.height = height;
    }


    drawPath(ctx: CanvasContext) {
        if (this.isDrawCoordinate || this.isDrawGrid) {
            this.xAxisTextConfig = new Array<any>();
            this.xAxisTextConfig.push({ text: "0", x: 0, y: 0 })
            this.yAxisTextConfig = new Array<any>();
            let minMax = this.getLimits(screen.width, screen.height - 64, ctx);
            this.minX = minMax.minX;
            this.maxX = minMax.maxX;
            this.minY = minMax.minY;
            this.maxY = minMax.maxY;
            var scale = ctx.currentMatrix.a;
            // var scale = this.parent.scale;
            // console.log("scale", scale);
            var B = .05;
            //初始50像素为一个格子，格子放大或者缩小5倍后 重新生成小格子或者减少小格子(每个大格子包含五个小格子)
            var t = 50, s = 2;
            for (var e = 50 * scale; e >= 100;) // 放大
            {
                e /= 2;
                t = e / scale;
            }
            for (; 50 > e;) //缩小
            {
                e *= 2;
                t = e / scale;
            }
            var i = B + (e - 50) / 150 * (.07 - B);//颜色值

            // this.layer.canvasContext.clear();
            // console.log("t, t/50", t, t / 50)



            //画小格子
            this.drawNewGrid(t, i + 0.03, ctx, scale, true);
            //画大格子
            this.drawNewGrid(t * 2, .21 - i, ctx, scale, false);
            //画X轴Y轴及坐标值
            if (this.isDrawCoordinate) {
                this.drawAxis(ctx);
            }
        }
    }
    drawHitPath() {

    }
    drawAxis(ctx: CanvasContext) {
        ctx.beginPath()
        ctx.moveTo(0, this.minY);
        ctx.lineTo(0, this.maxY);

        // ctx.closePath();
        // ctx.beginPath()
        ctx.moveTo(this.minX, 0);
        ctx.lineTo(this.maxX, 0);
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = this.renderStyle.lineWidth / scale;

        ctx.stroke();

        let minMax = this.getLimits(window.innerWidth, window.innerHeight - 64, ctx);
        // console.log(minMax)

        //处理字号不能小于10的问题
        var scale = ctx.currentMatrix.a;
        // var scale = this.parent.scale;
        ctx.scale(1 / scale, 1 / scale);

        this.xAxisTextConfig.forEach(config => {
            var y = (minMax.minY > 0 && minMax.maxY > 0 ?
                minMax.minY + 10 / scale : (minMax.minY < 0 && minMax.maxY < 0 ? minMax.maxY : 15 / scale))
            if (config.text == "0")
                ctx.fillText(config.text, -10 , y * scale)
            else
                ctx.fillText(config.text, config.x * scale, y * scale)
        })
        let textNumber: number = null;
        this.yAxisTextConfig.forEach(config => {
            textNumber = config.text.toString().length;
            var x = (minMax.minX > 0 && minMax.maxX > 0 ?
                minMax.minX : (minMax.minX < 0 && minMax.maxX < 0 ? minMax.maxX - (5 + textNumber * 5) / scale : -(5 + textNumber * 5) / scale))
            ctx.fillText(config.text, x * scale, config.y * scale)
        })
        ctx.scale(scale, scale)
    }
    private computeFixNumber(e: number) {
        var fixNumber = 0;
        var perDis = (e / 50).toFixed(4);
        for (var i = 0; ; i++) {
            if (perDis >= (1 / Math.pow(2, i)).toFixed(4)) {
                fixNumber = i;
                break;
            }
        }

        return fixNumber;

    }
    private drawNewGrid(e: number, i: number, ctx: CanvasContext, scale: number = 1, isAddTextArr: boolean) {
        var fixNumber = this.computeFixNumber(e);

        var lineCount = 0;
        var P = "rgba(0,0,0,";
        var l = P + i + ")", t = 0;

        ctx.font = 12 / scale + "px"
        //坐标轴线右侧的纵线
        var compare = Math.max(0, this.minX);//起始开始去绘制线的坐标
        while (true) {
            if (t >= this.maxX) break;
            if (this.isDrawCoordinate && t == 0) { t = t + e; continue; }
            if (t < compare) { t = t + e; continue; }
            ctx.moveTo(t, this.minY);
            ctx.lineTo(t, this.maxY);

            // console.log(t, this.minY, t, this.maxY)
            lineCount++;

            isAddTextArr && this.xAxisTextConfig.push({ text: (t / 50).toFixed(fixNumber).toString(), x: t, y: 0 })
            t = t + e;

        }
        //坐标轴线左侧的纵线
        t = 0;
        compare = Math.min(0, this.maxX);
        while (true) {
            if (t <= this.minX) break;
            if (this.isDrawCoordinate && t == 0) { t = t - e; continue; }
            if (t > compare) { t = t - e; continue; }
            ctx.moveTo(t, this.minY);
            ctx.lineTo(t, this.maxY);
            // console.log(t, this.minY, t, this.maxY)
            lineCount++;
            isAddTextArr && this.xAxisTextConfig.push({ text: (t / 50).toFixed(fixNumber).toString(), x: t, y: 0 })
            t = t - e;
        }

        // console.log("x-lineCount:", lineCount)

        //坐标轴线下方的横线  下方坐标系里是赋值  但对于canvas是正值方向
        t = 0;
        compare = Math.max(0, this.minY);
        while (true) {
            if (t >= this.maxY) break;
            if (this.isDrawCoordinate && t == 0) { t = t + e; continue; }
            if (t < compare) { t = t + e; continue; }
            ctx.moveTo(this.minX, t);
            ctx.lineTo(this.maxX, t);
            isAddTextArr && this.yAxisTextConfig.push({ text: (-t / 50).toFixed(fixNumber).toString(), x: 0, y: t })
            t = t + e;
        }
        //坐标轴线上方的横线
        t = 0;
        compare = Math.min(0, this.maxY);
        while (true) {
            if (t <= this.minY) break;
            if (this.isDrawCoordinate && t == 0) { t = t - e; continue; }
            if (t > compare) { t = t - e; continue; }
            ctx.moveTo(this.minX, t);
            ctx.lineTo(this.maxX, t);
            isAddTextArr && this.yAxisTextConfig.push({ text: (-t / 50).toFixed(fixNumber).toString(), x: 0, y: t })
            t = t - e;
        }


        if (this.isDrawGrid) {
            // ctx.closePath();
            ctx.strokeStyle = l;
            ctx.lineWidth = this.renderStyle.lineWidth / scale;
            ctx.stroke();
        }
    }
    //获取边界值xy的最大最小值
    getLimits(width: number, height: number, ctx: CanvasContext) {
        var viewMinx = 0;
        var viewMiny = 0;
        var viewMaxx = width;// this.width;
        var viewMaxy = height;// this.height;
        var windowViewPoints = new Array<Point>();
        windowViewPoints.push(new Point(viewMinx, viewMiny));
        windowViewPoints.push(new Point(viewMaxx, viewMaxy));
        windowViewPoints.push(new Point(viewMinx, viewMaxy));
        windowViewPoints.push(new Point(viewMaxx, viewMiny));
        // var that = this;

        var minX = 0, maxX = 0, minY = 0, maxY = 0;//最大、最新 x y值

        windowViewPoints.forEach((item: Point, index: number) => {
            var point = ctx.transformPoint(item.x, item.y);
            //item.x = point.x;
            //item.y = point.y;
            if (index == 0) {
                maxX = minX = point.x;
                minY = maxY = point.y;
            }
            else {
                minX = minX > point.x ? point.x : minX;
                maxX = maxX < point.x ? point.x : maxX;

                minY = minY > point.y ? point.y : minY;
                maxY = maxY < point.y ? point.y : maxY;
            }
        });
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        }
    }

}