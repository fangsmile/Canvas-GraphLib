export class RenderStyle {
    isFill: boolean = true;
    isStroke: boolean = true;
    fillColor: string = "rgba(255, 255, 255, 0.1)";
    strokeColor: string = "rgba(102,102,102,1)";
    lineWidth: number = 10;
    isClosePath: boolean = true;
    lineDash: Array<number> = [];//虚线需要设置，如[10, 15];
    lineJoin: string = 'miter';//转折的时候不出现尖角
    lineCap: string = "butt";
    constructor(isFill: boolean = true,
        isStroke: boolean = true,
        fillColor: string = "rgba(255, 255, 255, 0.1)",
        strokeColor: string = "rgba(102,102,102,1)",
        lineWidth: number = 2,
        isClosePath: boolean = true,
        lineDash: Array<number> = [],//虚线需要设置，如[10, 15];
        lineJoin: string = 'miter',
        lineCap: string = "butt",
    ) {
        this.isFill = isFill;
        this.isStroke = isStroke;
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.lineDash = lineDash || [];
        this.lineJoin = lineJoin || 'miter';
        this.lineCap = lineCap || "butt";
        this.isClosePath = isClosePath;
    }
}
export class RotateConfig {
    rotateDegree: number = 0;
    rotateCenterX: number = 0;
    rotateCenterY: number = 0;
    isDefineRotateCenter: boolean = false;
}
export class RegionConfig {
    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;
    constructor(x: number = 0,
        y: number = 0,
        width: number = 0,
        height: number = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}