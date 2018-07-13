/**
 * canvas 2d context 代理类
 * canvas 本身没有做代理，是因为目前没有考虑不同屏幕设备像素比的兼容问题。
 */
import { Matrix } from '../util/Matrix'

export class CanvasContext {
    CONTEXT_PROPERTIES = [
        'fillStyle',
        'strokeStyle',
        'shadowColor',
        'shadowBlur',
        'shadowOffsetX',
        'shadowOffsetY',
        'lineCap',
        'lineDashOffset',
        'lineJoin',
        'lineWidth',
        'miterLimit',
        'font',
        'textAlign',
        'textBaseline',
        'globalAlpha',
        'globalCompositeOperation',
        'imageSmoothingEnabled',
        'msFillRule'
    ];
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private matrix: Matrix;
    stack: Array<Matrix>;
    //属性代理
    fillStyle: string | CanvasGradient | CanvasPattern;
    font: string;
    globalAlpha: number;
    globalCompositeOperation: string;
    imageSmoothingEnabled: boolean;
    mozImageSmoothingEnabled: boolean;
    oImageSmoothingEnabled: boolean;
    webkitImageSmoothingEnabled: boolean;
    lineCap: string;
    lineDashOffset: number;
    lineJoin: string;
    lineWidth: number;
    miterLimit: number;
    msFillRule: CanvasFillRule;
    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    textAlign: string;
    textBaseline: string;
    [key: string]: any;//类型没有索引签名
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.matrix = new Matrix(1, 0, 0, 1, 0, 0);
        this.stack = [];
        this.init();

    }

    init() {
        this.context = this.canvas.getContext('2d');
        var that = this;
        this.CONTEXT_PROPERTIES.forEach(function (prop) {
            Object.defineProperty(that, prop, {
                get: function () {
                    return (<any>that.context)[prop];
                },
                set: function (val) {
                    (<any>that.context)[prop] = val;
                }
            });
        });
    }


    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.context;
    }
    /**
       * 设置当前ctx 的transform信息
       */
    setTransformForCurrent() {
        this.context.setTransform(
            this.matrix.a,
            this.matrix.b,
            this.matrix.c,
            this.matrix.d,
            this.matrix.e,
            this.matrix.f
        );

    }
    /**
     * 获取当前矩阵信息
     */
    get currentMatrix() { return this.matrix }


    cloneMatrix(m: Matrix) {
        let m1 = new Matrix();
        m1.setValue(m.a, m.b, m.c, m.d, m.e, m.f);
        return m1;
    }

    /**
    * 清空画布
    */
    clear() {
        this.save();
        this.resetTransform();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.restore();
    }


    restore(): void;
    restore() {
        this.context.restore();
        if (this.stack.length > 0) {
            this.matrix = this.stack.pop();
            this.setTransformForCurrent();
        }
    }

    /**
     * 
     * @param angle 弧度数
     */
    rotate(angle: number): void;
    rotate(rad: number) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.matrix.a * c + this.matrix.c * s;
        var m12 = this.matrix.b * c + this.matrix.d * s;
        var m21 = this.matrix.a * -s + this.matrix.c * c;
        var m22 = this.matrix.b * -s + this.matrix.d * c;
        this.matrix.a = m11;
        this.matrix.b = m12;
        this.matrix.c = m21;
        this.matrix.d = m22;
        this.setTransformForCurrent();
    }
    save(): void;
    save() {
        var matrix = this.cloneMatrix(this.matrix);
        this.stack.push(matrix);
        this.context.save();
    }
    scale(x: number, y: number): void;
    scale(sx: number, sy: number) {
        this.matrix.a *= sx;
        this.matrix.b *= sx;
        this.matrix.c *= sy;
        this.matrix.d *= sy;

        this.setTransformForCurrent();
    }
    scalePoint(sx: number, sy: number, px: number, py: number) {
        this.translate(px, py);
        this.scale(sx, sy);
        this.translate(-px, -py)
    }
    setTransform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;

    /**
     * 重写setTransform
     * @param matrix 
     */
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this.matrix.a = a;
        this.matrix.b = b;
        this.matrix.c = c;
        this.matrix.d = d;
        this.matrix.e = e;
        this.matrix.f = f;

        this.setTransformForCurrent()
    }

    resetTransform() {
        this.setTransform(1, 0, 0, 1, 0, 0);
    }

    transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;
    transform(a: number, b: number, c: number, d: number, e: number, f: number) {
        this.multiply(a, b, c, d, e, f);
        this.setTransformForCurrent();
    }

    translate(x: number, y: number): void;
    translate(x: number, y: number) {
        this.matrix.e += this.matrix.a * x + this.matrix.c * y;
        this.matrix.f += this.matrix.b * x + this.matrix.d * y;
        this.setTransformForCurrent();
    }
    /**
         * 旋转角度，自动转换为弧度
         * @param deg 角度数
         */
    rotateDegrees(deg: number) {
        var rad = deg * Math.PI / 180;
        this.rotate(rad);
    }

    /**
     * 绕点旋转
     * @param rad 弧度
     * @param x 旋转中心点x
     * @param y 旋转中心点y
     */
    rotateAbout(rad: number, x: number, y: number) {
        this.translate(x, y);
        this.rotate(rad);
        this.translate(-x, -y);
        this.setTransformForCurrent();
    }

    /**
     * 绕点旋转
     * @param deg 旋转角度
     * @param x 旋转中心点x
     * @param y 旋转中心点y
     */
    rotateDegreesAbout(deg: number, x: number, y: number) {
        this.translate(x, y);
        this.rotateDegrees(deg);
        this.translate(-x, -y);
        this.setTransformForCurrent();
    }

    /**
     * 坐标转换
     * @param x x
     * @param y y
     */
    transformPoint(x: number, y: number) {
        let inverseMatrix = this.matrix.getInverse();
        return {
            x: x * inverseMatrix.a + y * inverseMatrix.c + inverseMatrix.e,
            y: x * inverseMatrix.b + y * inverseMatrix.d + inverseMatrix.f
        };
    }

    /**
        * 坐标转换
        * @param x x
        * @param y y
        */
    transformPoint2(x: number, y: number) {
        let inverseMatrix = this.matrix;
        return {
            x: x * inverseMatrix.a + y * inverseMatrix.c + inverseMatrix.e,
            y: x * inverseMatrix.b + y * inverseMatrix.d + inverseMatrix.f
        };
    }
    /**
    * 矩阵相乘
    * @param matrix 
    */
    multiply(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) {

        var a1 = this.matrix.a,
            b1 = this.matrix.b,
            c1 = this.matrix.c,
            d1 = this.matrix.d,
            e1 = this.matrix.e,
            f1 = this.matrix.f;

        let m11 = a1 * a2 + c1 * b2;
        let m12 = b1 * a2 + d1 * b2;
        let m21 = a1 * c2 + c1 * d2;
        let m22 = b1 * c2 + d1 * d2;
        let dx = a1 * e2 + c1 * f2 + e1;
        let dy = b1 * e2 + d1 * f2 + f1;

        this.matrix.a = m11;
        this.matrix.b = m12;
        this.matrix.c = m21;
        this.matrix.d = m22;
        this.matrix.e = dx;
        this.matrix.f = dy;
    }
    ////////代理方法
    //isPointInStroke ,drawFocusIfNeeded 方法没有代理，如有需要再添加


    beginPath(): void;
    beginPath() {
        this.context.beginPath();
    }


    clip(fillRule?: CanvasFillRule): void;
    clip(path: Path2D, fillRule?: CanvasFillRule): void;
    clip() {
        this.context.clip();
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arc() {
        var a = arguments;
        this.context.arc(a[0], a[1], a[2], a[3], a[4], a[5]);
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;

    arcTo() {
        var a = arguments;
        if (a.length === 5) {
            this.context.arcTo(
                a[0],
                a[1],
                a[2],
                a[3],
                a[4]
            )
        } else {
            (<any>this.context).arcTo(
                a[0],
                a[1],
                a[2],
                a[3],
                a[4],
                a[5],
                a[6]
            )
        }
    }
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    bezierCurveTo() {
        var a = arguments;
        this.context.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
    }

    closePath(): void;
    closePath() {
        this.context.closePath();
    }

    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    ellipse() {
        var a = arguments;
        if (a.length === 7) {
            this.context.ellipse(
                a[0],
                a[1],
                a[2],
                a[3],
                a[4],
                a[5],
                a[6]
            )
        } else {
            this.context.ellipse(
                a[0],
                a[1],
                a[2],
                a[3],
                a[4],
                a[5],
                a[6],
                a[7]
            )
        }
    }
    lineTo(x: number, y: number): void;
    lineTo() {
        var a = arguments;
        this.context.lineTo(a[0], a[1]);
    }

    moveTo(x: number, y: number): void;
    moveTo() {
        var a = arguments;
        this.context.moveTo(a[0], a[1]);
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    quadraticCurveTo() {
        var a = arguments;
        this.context.quadraticCurveTo(a[0], a[1], a[2], a[3]);
    }

    rect(x: number, y: number, w: number, h: number): void;
    rect() {
        var a = arguments;
        this.context.rect(a[0], a[1], a[2], a[3]);
    }

    createImageData(imageDataOrSw: number | ImageData, sh?: number): ImageData;
    createImageData() {
        var a = arguments;
        if (a.length === 2) {
            return this.context.createImageData(a[0], a[1]);
        } else if (a.length === 1) {
            return this.context.createImageData(a[0]);
        }
    }

    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createLinearGradient() {
        var a = arguments;
        return this.context.createLinearGradient(a[0], a[1], a[2], a[3]);
    }

    createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern;
    createPattern() {
        var a = arguments;
        return this.context.createPattern(a[0], a[1]);
    }

    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
    createRadialGradient() {
        var a = arguments;
        return this.context.createRadialGradient(
            a[0],
            a[1],
            a[2],
            a[3],
            a[4],
            a[5]
        );
    }


    fill(fillRule?: CanvasFillRule): void;
    fill(path: Path2D, fillRule?: CanvasFillRule): void;
    fill() {
        this.context.fill();
    }

    fillRect(x: number, y: number, w: number, h: number): void;
    fillRect(x: number, y: number, width: number, height: number) {
        this.context.fillRect(x, y, width, height);
    }

    clearRect(x: number, y: number, w: number, h: number): void;
    clearRect(x: number, y: number, w: number, h: number) {
        this.context.clearRect(x, y, w, h);
    }

    fillText(text: string, x: number, y: number, maxWidth?: number): void;
    fillText() {
        var a = arguments;
        this.context.fillText(a[0], a[1], a[2]);
    }

    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    getImageData() {
        var a = arguments;
        return this.context.getImageData(a[0], a[1], a[2], a[3]);
    }

    getLineDash(): number[];
    getLineDash() {
        return this.context.getLineDash();
    }


    isPointInPath(x: number, y: number): boolean;
    isPointInPath(x: number, y: number) {
        return this.context.isPointInPath(x, y);
    }



    measureText(text: string): TextMetrics;
    measureText(text: string) {
        return this.context.measureText(text);
    }

    putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number): void;
    putImageData() {
        var a = arguments;
        this.context.putImageData(a[0], a[1], a[2]);
    }


    setLineDash(segments: number[]): void;
    setLineDash() {
        var a = arguments,
            _context = this.context;

        // works for Chrome and IE11
        if (this.context.setLineDash) {
            _context.setLineDash(a[0]);
        } else if ('mozDash' in _context) {
            // verified that this works in firefox
            (<any>_context).mozDash = a[0];
        } else if ('webkitLineDash' in _context) {
            // does not currently work for Safari
            (<any>_context).webkitLineDash = a[0];
        }

        // no support for IE9 and IE10
    }

    stroke(path?: Path2D): void;
    stroke() {
        this.context.stroke();
    }

    strokeRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, width: number, height: number) {
        this.context.strokeRect(x, y, width, height);
    }

    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    strokeText() {
        var a = arguments;
        this.context.strokeText(a[0], a[1], a[2]);
    }

    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, dstX: number, dstY: number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, dstX: number, dstY: number, dstW: number, dstH: number): void;
    drawImage(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap, srcX: number, srcY: number, srcW: number, srcH: number, dstX: number, dstY: number, dstW: number, dstH: number): void;

    drawImage() {
        var _context = this.context;
        var a = arguments;
        if (a.length === 3) {
            _context.drawImage(a[0], a[1], a[2]);
        } else if (a.length === 5) {
            _context.drawImage(a[0], a[1], a[2], a[3], a[4]);
        } else if (a.length === 9) {
            _context.drawImage(
                a[0],
                a[1],
                a[2],
                a[3],
                a[4],
                a[5],
                a[6],
                a[7],
                a[8]
            );
        }
    }


}