import { Shape } from "./Shape";
import { Point } from "./Point";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
/* @param {Object} config
   * @param {String} [config.fontFamily] default is Arial
   * @param {Number} [config.fontSize] in pixels.  Default is 12
   * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
   * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
   * @param {String} [config.align] can be left, center, or right
   * @param {Number} [config.padding]
   * @param {Number} [config.lineHeight] default is 1
   * @param {String} [config.wrap] can be word, char, or none. Default is word
   * @param {Boolean} [config.ellipsis] 
   *  @param {String} config.text
   */
export class TextConfig {
    fontFamily: string = "Arial";
    fontSize: number = 12;
    fontStyle: string = "normal";
    fontVariant: string = "normal";
    align: string = "left";
    lineHeight: number = 1;
    textBaseline: string = "alphabetic";
    constructor(
        fontFamily: string = "Arial",
        fontSize: number = 12,
        fontStyle: string = "normal",
        fontVariant: string = "normal",
        align: string = "left",
        lineHeight: number = 1,
        textBaseline: string = "alphabetic",
    ) {
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontStyle = fontStyle;
        this.fontVariant = fontVariant;
        this.align = align;
        this.lineHeight = lineHeight;
        this.textBaseline = textBaseline;
    }
}
export class Text extends Shape {
    type: string = "Shape";
    className: string = "Text";
    text: string = "";//点加上位置的表示
    sign:string="";//原始点排序字母表示
    textConfig: TextConfig;
    position: Point;//文字显示的位置，经过加减
    oldPos:Point;//没有加减,不加减的位置
    width: number = 0;
    height: number = 0;
    textType:string;//文字类型
    scale: number;
    constructor(text: string, position: Point, textConfig: TextConfig, textType: string = '', oldPos:Point=null,scale:number=null) {
        super(null);
        this.text = text;
        this.sign=text;
        this.position = position;
        this.textConfig = textConfig;
        this.textType = textType;
        this.oldPos = oldPos;
        this.scale=scale;
    }
    prepareStyle(ctx: CanvasContext) {
        ctx.font = this._getContextFont(ctx);
        ctx.textBaseline = this.textConfig.textBaseline;
        ctx.textAlign = this.textConfig.align;
        this.width = ctx.measureText(this.text).width;
        // this.height = ctx.measureText(this.textConfig.text).height;

    }
    drawPath(ctx: CanvasContext) {
        ctx.fillText(this.text, this.position.x, this.position.y);
    }
    drawHitPath(ctx: CanvasContext) {

    }
    _getContextFont(ctx: CanvasContext) {
        return (
            this.textConfig.fontStyle +
            " " +
            this.textConfig.fontVariant +
            " " +
            this.textConfig.fontSize / ctx.currentMatrix.a + 
            "px " +
            this.textConfig.fontFamily
        );
    }
    moveBy(diffX: number, diffY: number) {

        this.oldPos.x += diffX;
        this.oldPos.y += diffY;

        //此处更新text的值
        if (this.textType=='dot'){
            this.position.x = this.oldPos.x + 8 / this.scale;
            this.position.y = this.oldPos.y - 8 / this.scale;
            this.text = this.sign + '(' + Math.round((this.oldPos.x / 50) * 10) / 10 + ',' + Math.round((-this.oldPos.y / 50) * 10) / 10+')'
        }else{
            this.position.x = this.oldPos.x;
            this.position.y = this.oldPos.y;
        }
    }
    changePosByScale(){
        this.position.x = this.oldPos.x + 8 / this.scale;
        this.position.y = this.oldPos.y - 8 / this.scale;
    }
    getPointRange(){
        return{
            minX:this.position.x,
            maxX:this.position.x,
            minY:this.position.y,
            maxY:this.position.y
        }
    }

}