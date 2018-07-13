import { Point } from "./Point";
import { XlMath } from "./XlMath";
import { GraphLib } from "./GraphLib";
import { RenderStyle, RotateConfig, RegionConfig } from "./OptionConfig";
import { CanvasContext } from "./CanvasContext";
export class Shape {
    type: string = "Shape";
    className: string = "Shape";
    colorKey: string = "";
    // sideColorKey: string = "";
    renderStyle: RenderStyle = null;
    rotateConfig: RotateConfig = null;
    regionConfig: RegionConfig = null;
    isDraw: boolean = true;//是否绘制到canvas
    isDrawHit: boolean = true;//是否绘制hit
    parent: any = null;//添加到group或者层 child.parent = this;
    private index: number = 0;//在parent中的排序值
    constructor(renderStyle: RenderStyle, rotateConfig: RotateConfig = null, regionConfig: RegionConfig = null, colorKey: string = null) {
        this.renderStyle = renderStyle || new RenderStyle();
        this.rotateConfig = rotateConfig || new RotateConfig();
        this.regionConfig = regionConfig || new RegionConfig();
        // this.isCanSelect = isCanSelect;
        // if (this.isCanSelect) {
        if (colorKey) {
            this.colorKey = colorKey;
        } else {
            this.colorKey = this.addColor();//没有判断是否重复，外层做判断
        }
        GraphLib.shapes[this.colorKey] = this;



        // }
    }
    getIndex() {
        return this.index;
    }
    addColor() {
        var key;
        while (true) {
            key = XlMath.getRandomColor();
            if (key && !(key in GraphLib.shapes)) {
                break;
            }
        }
        return key
    }
    changeClosePath(isClosePath: boolean) {
        this.renderStyle.isClosePath = isClosePath;
    }
    changeFill(isFill: boolean) {
        this.renderStyle.isFill = isFill;
    }
    changeIsDrawHit(isDrawHit: boolean) {
        this.isDrawHit = isDrawHit;
    }
    /**
    * @private
    * @param {CanvasContext} ctx
    * @param {CanvasContext} hitCtx
    * 子类均需重写
     */
    setParent(parent: any) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    removeSelf() {
        var parent = this.getParent();
        if (parent && parent.children) {
            parent.children.splice(this.index, 1);
            parent.setChildrenIndex();
            delete this.parent;
        }
        // delete GraphLib.shapes[this.colorKey];
    }
    draw(ctx: CanvasContext, hitCtx: CanvasContext) {
        if (ctx && this.isDraw) {
            ctx.save();
            this.rotateContext(ctx);
            this.prepareStyle(ctx);
            ctx.beginPath();
            this.drawPath(ctx);
            this.renderStyle.isClosePath && ctx.closePath();
            if (this.renderStyle.isFill) {
                this.fill(ctx);
            }
            if (this.renderStyle.isStroke) {
                this.stroke(ctx);
            }

            ctx.restore();
        }
        if (hitCtx && this.isDrawHit) {
            hitCtx.save();
            this.rotateContext(hitCtx);
            this.prepareHitStyle(hitCtx);
            hitCtx.beginPath();
            this.drawHitPath(hitCtx);
            this.renderStyle.isClosePath && hitCtx.closePath();
            if (this.renderStyle.isFill) {
                this.fill(hitCtx);
            }
            if (this.renderStyle.isStroke) {
                this.stroke(hitCtx);
            }

            hitCtx.restore();
        }
    }

    setIsDraw(isDraw: boolean = true, isDrawHit: boolean = true) {
        this.isDraw = isDraw;
        this.isDrawHit = isDrawHit;
    }
    prepareStyle(ctx: CanvasContext) {
        ctx.strokeStyle = this.renderStyle.strokeColor;
        ctx.fillStyle = this.renderStyle.fillColor;
        ctx.lineWidth = this.renderStyle.lineWidth / ctx.currentMatrix.a;
        let lineDash = []
        for (let i = 0; i < this.renderStyle.lineDash.length; i++) {
            lineDash[i] = this.renderStyle.lineDash[i] / ctx.currentMatrix.a;
        }
        // console.log(lineDash)
        ctx.setLineDash(lineDash)
        ctx.lineJoin = this.renderStyle.lineJoin;
        ctx.lineCap = this.renderStyle.lineCap;
    }

    prepareHitStyle(hitCtx: CanvasContext) {
        hitCtx.strokeStyle = this.colorKey;
        hitCtx.fillStyle = this.colorKey;
        hitCtx.lineWidth = (this.renderStyle.lineWidth > 0 ? this.renderStyle.lineWidth + 10 : this.renderStyle.lineWidth) / hitCtx.currentMatrix.a;
        hitCtx.setLineDash(this.renderStyle.lineDash)
        hitCtx.lineJoin = this.renderStyle.lineJoin;
        hitCtx.lineCap = this.renderStyle.lineCap;
    }
    drawPath(ctx: CanvasContext) {

    }
    //绘制路径
    drawHitPath(ctx: CanvasContext) {
        this.drawPath(ctx)
    }

    /**
     * @private
     * @param {CanvasContext} ctx 
     */
    fill(ctx: CanvasContext) {
        ctx.fill();
    }
    stroke(ctx: CanvasContext) {
        ctx.stroke();
    }

    // setOptions(options: any) {
    //     if (options) {
    //         options["rotateCenterX"] != undefined && (this.isSetRotateCenter = true)
    //         for (var prop in options) {
    //             this.set(prop, options[prop]);
    //         }
    //     }
    // }
    // get(property: any) {
    //     return (<any>this)[property];
    // }
    // set(key: string, value: any) {
    //     if (typeof key === 'object') {
    //         this._setObject(key);
    //     }
    //     else {
    //         if (typeof value === 'function' && key !== 'clipTo') {
    //             this._setAttr(key, value(this.get(key)));
    //         }
    //         else {
    //             this._setAttr(key, value);
    //         }
    //     }
    //     return this;
    // }
    // private _setObject(obj: any) {
    //     for (var prop in obj) {
    //         this._setAttr(prop, obj[prop]);
    //     }
    // }
    // private _setAttr(key: string, value: any) {
    //     (<any>this)[key] = value;
    // }
    // moveTo(x: number, y: number) {
    //     var diffX = x - this.x;
    //     var diffY = y - this.y;
    //     if (this.isDefineRotateCenter) {
    //         this.rotateCenterX += diffX;
    //         this.rotateCenterY += diffY;
    //     }
    //     this.x = x;
    //     this.y = y;
    // }
    /*
 * move node from current layer into layer2
 * node.moveTo(layer2);
 */
    moveToContainer(newContainer: any) {
        // do nothing if new container is already parent
        if (this.getParent() !== newContainer) {
            // this.remove my be overrided by drag and drop
            // buy we need original
            this.removeSelf();
            newContainer.add(this);
        }
        return this;
    }
    moveBy(diffX: number, diffY: number) {
        if (this.rotateConfig.isDefineRotateCenter) {
            this.rotateConfig.rotateCenterX += diffX;
            this.rotateConfig.rotateCenterY += diffY;
        }
        if (this.regionConfig) {
            this.regionConfig.x += diffX;
            this.regionConfig.y += diffY
        }
    }
    moveToTop() {
        if (!this.parent) {
            console.error('Node has no parent. moveToTop function is ignored.');
            return false;
        }
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent.setChildrenIndex();
        return true;
    }
    moveToBottom() {
        if (!this.parent) {
            console.error(
                'Node has no parent. moveToBottom function is ignored.'
            );
            return null;
        }
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.unshift(this);
            this.parent.setChildrenIndex();
            return this;
        }
        return null;
    }
    changeDrawLayer(drawLayer: any) {
    }
    setRotateCenter(x: number, y: number) {
        this.rotateConfig.isDefineRotateCenter = true;
        this.rotateConfig.rotateCenterX = x;
        this.rotateConfig.rotateCenterY = y;
    }
    // setWidthHeight(w: number, h: number) {
    //     this.width = w;
    //     this.height = h;
    // }
    // scaleObject(scale: number) {
    //     this.width *= scale;
    //     this.height *= scale;
    // }



    //绘制时调用，旋转画布
    public rotateContext(ctx: CanvasContext = null) {
        this.rotateConfig.rotateDegree = this.rotateConfig.rotateDegree % 360;
        if (this.rotateConfig.rotateDegree != 0) {
            if (this.rotateConfig.isDefineRotateCenter) {
                ctx.translate(this.rotateConfig.rotateCenterX, this.rotateConfig.rotateCenterY);
                ctx.rotate(XlMath.degreeToRadian(this.rotateConfig.rotateDegree));
                ctx.translate(-this.rotateConfig.rotateCenterX, -this.rotateConfig.rotateCenterY);
            }
            // else {
            //     ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            //     ctx.rotate(XlMath.degreeToRadian(this.rotateDegree));
            //     ctx.translate(-this.x + this.width / 2, -this.y + this.height / 2);
            // }
        }
    }

    //旋转，改变角度
    public rotateBy(deg: number) {
        this.rotateConfig.rotateDegree += deg;
    }

    findAncestor(selector: string, isIncludeSelf: boolean) {
        return this.findAncestors(selector, isIncludeSelf)[0];
    }
    findAncestors(selector: string, isIncludeSelf: boolean) {
        var res = [];
        if (isIncludeSelf && this.type == selector) {
            res.push(this);
        }
        var ancestor = this.parent;
        while (ancestor) {
            if (ancestor.type == selector) {
                res.push(ancestor);
            }
            ancestor = ancestor.parent;
        }
        return res;
    }

    getPointRange() {
        let minX = this.regionConfig.x;
        let maxX = this.regionConfig.x + this.regionConfig.width;
        let minY = this.regionConfig.y;
        let maxY = this.regionConfig.y + this.regionConfig.height;
        return {
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        }
    }
}
