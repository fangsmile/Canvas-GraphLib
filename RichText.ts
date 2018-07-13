import { IRichText, TextAlgin } from "../../../../../build/textEditor/ITextEditor";
import { Serializable, Serialize, SerializeProperty } from "../../../../../build/util/ts-serializer";
import * as Common from '../../../../../build/util/DataStructure'
import { Util } from "../../../../../build/util/util";
import { CanvasContext } from "../../../../../build/drawing/CanvasContext";
import { XlMath } from "./XlMath";
import { Point } from "./Point";

@Serialize({})//序列化
export class TextTranslate {//绘制位置
    @SerializeProperty()
    x: number;
    @SerializeProperty()
    y: number;
    constructor(x: number, y: number, sx: number = 0, sy: number = 0, ex: number = 0, ey: number = 0) {
        this.x = x;
        this.y = y;
    }
}

@Serialize({})//序列化
export class TextConfig {//文字元素配置
    @SerializeProperty()
    width: number;
    @SerializeProperty()
    height: number;
    @SerializeProperty()
    originalWidth: number;
    @SerializeProperty()
    originalHeight: number;
    @SerializeProperty()
    translate: TextTranslate;
    @SerializeProperty()
    rotate: number;
    @SerializeProperty()
    scale: number;

    constructor(width: number, height: number, translate: TextTranslate, rotate: number) {
        this.width = width;
        this.height = height;
        this.originalWidth = width;
        this.originalHeight = height;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = 1;
    }

}

@Serialize({})//序列化
export class RichText extends Serializable implements IRichText {
    @SerializeProperty()
    colorKey: string;
    @SerializeProperty()
    className = "richText";
    @SerializeProperty()
    type = "text";
    @SerializeProperty()
    public text: string;//文字内容
    @SerializeProperty()
    public fontSize: number;//字号
    @SerializeProperty()
    public fontWeight: string;//加粗值
    @SerializeProperty()
    public fontFamily: string;//字体
    @SerializeProperty()
    public underline: boolean;//下划线
    @SerializeProperty()
    public italic: boolean;//斜体
    @SerializeProperty()
    public color: string;//颜色
    @SerializeProperty()
    public textAlign: TextAlgin;//对齐方式
    @SerializeProperty()
    public textLines: Array<string>;

    public styles: Common.List<StyleDefine>;
    @SerializeProperty({
        type: Common.List
    })
    public lineHeights: Common.List<number>;
    @SerializeProperty()
    public lineHeight: number;
    @SerializeProperty({
        type: Common.List
    })
    public lineWidths: Common.List<number>;

    public fontSizeMult: number;
    @SerializeProperty()
    public fontStyle: string;
    public fontSizeFraction: number;
    @SerializeProperty()
    public fill: string;
    public reSpace: RegExp;
    public reNewline: RegExp;
    public isVertical: boolean;
    public textDecoration: string = "";
    public minWidth: number;
    public maxWidth: number;
    public fixedWidth: boolean;
    public currentHeight: number = 0;
    /**
     * 用于快速判断字体是否被显示
     */
    maxFontSize: number;
    @SerializeProperty({
        type: Common.List
    })
    renderCache: Common.List<Common.List<TextStyleInfo>>;
    @SerializeProperty()
    config: TextConfig;
    changeToEditModeImg: HTMLImageElement;//增加可以从选中模式切换到编辑模式的按钮 // 玄魂 @ 2017-04-27
    frameLineColor: string;
    delCrossLength: number;
    dragBackColor: string;
    dragFrontColor: string;
    delBackColor: string;
    delFrontColor: string;
    dragBR: number;
    dragFR: number;
    delR: number;
    isEditting: boolean = false;

    constructor(config: TextConfig, fontSize: number, changeToEditModeImg: HTMLImageElement, fill: string = "#dc4452") {
        super();
        this.config = config;
        this.styles = new Common.List<any>();
        this.lineHeight = 1.16;
        this.fontSizeMult = 1.13;
        this.fill = fill;
        this.color = fill;
        this.fontSizeFraction = 0.25;
        this.reSpace = /\s|\n/;
        this.reNewline = /\r?\n/;
        this.text = "";
        this.textLines = [];
        this.fontSize = fontSize;
        this.fontWeight = "normal";
        this.fontFamily = "kaiti";
        this.textDecoration = '';

        this.textAlign = TextAlgin.left;
        this.lineWidths = new Common.List<number>();
        this.lineHeights = new Common.List<number>();
        this.minWidth = 110;
        this.maxWidth = 600;
        this.fixedWidth = true;
        this.changeToEditModeImg = changeToEditModeImg;
        this.dragBackColor = "#F0F8FB";
        this.dragFrontColor = "#55A2FF";
        this.delBackColor = "#F44646";
        this.delFrontColor = "#FFFFFF";
        this.frameLineColor = "#8F8E8E";
        this.delCrossLength = 18;
        this.dragBR = 15;
        this.dragFR = 10;
        this.delR = 15;

    }

    //左边偏移量
    public getLeftOffset() {
        return this.config.translate.x + this.fontSize / 8;
    }
    //上边偏移量
    public getTopOffset() {
        return this.config.translate.y + this.fontSize / 8;
    }

    //获取样式索引
    public getStyleIndex(lineIndex: number, charIndex: number) {
        var lines = this.textLines;
        if (this.textLines.length === 1 && this.textLines[0] === '') {
            lines = this.text.split(this.reNewline);
        }
        var charLen = charIndex;
        for (var i = 0; i < lineIndex; i++) {
            var textLine = lines[i];
            if (textLine) {
                charLen += textLine.length;
            }
        }
        return charLen;
    }
    //获取选中的样式
    public getSelectionStyles(startIndex: number, endIndex?: number): any {
        if (startIndex == this.text.length || startIndex == endIndex) {
            startIndex = startIndex - 1 < 0 ? startIndex : startIndex - 1;
            return this.styles.get(startIndex) || {};
        }

        if (arguments.length == 2) {
            var styles = [];
            for (var i = startIndex; i < endIndex; i++) {
                styles.push(this.getSelectionStyles(i));
            }
            return styles;
        }


    }
    /**
         * 插入文字时添加对应样式
         * @param styleIndex 插入文字的位置
         * @param style 样式
         * 
         */

    public insertStyle(styleIndex: number, color: string, style?: StyleDefine) {
        // fill:"#aa4d1f"
        // fontFamily:"微软雅黑"
        // fontSize:72
        // fontStyle:"italic"
        // fontWeight:"bold"
        // textDecoration :"underline"
        var isChanged = false;
        if (styleIndex === 0 && !style) {
            isChanged = true;
        }

        var styleInserting;
        if (style) {
            styleInserting = style;
            styleInserting.fontSize = this.fontSize;
        }
        else {
            if (!isChanged)
                styleInserting = Util.clone(this.styles.get(styleIndex - 1));
            else {

                let fontStyle = this.italic ? "italic" : "normal";
                let textDecoration = this.underline ? "underline" : 'none';

                styleInserting = new StyleDefine(color, this.fontSize, this.fontFamily, this.fontWeight, fontStyle, textDecoration)

            }

        }
        this.styles.insert(styleIndex, styleInserting);


    }
    //获取一行的高度lineHeights（包括行的间距）
    public getHeightOfLine(lineIndex: number): number {
        if (this.lineHeights.get(lineIndex)) {
            return this.lineHeights.get(lineIndex);
        }
        var line = this.textLines[lineIndex], chars = line.split('');
        var styleIndex = this.getStyleIndex(lineIndex, 0);
        var maxHeight = this.getHeightOfChar(styleIndex), currentCharHeight;

        for (var i = 1, len = chars.length; i < len; i++) {
            styleIndex = this.getStyleIndex(lineIndex, i);
            currentCharHeight = this.getHeightOfChar(styleIndex);
            if (currentCharHeight > maxHeight) {
                maxHeight = currentCharHeight;
            }
        }
        this.lineHeights.set(lineIndex, maxHeight * this.lineHeight * this.fontSizeMult);
        return this.lineHeights.get(lineIndex);
    }

    //获取一个字符的高度（不包括行的间距，只是字符）
    public getHeightOfChar(styleIndex: number) {
        var height = this.fontSize;
        var value = this.styles.get(styleIndex);

        if (value) {
            height = value.fontSize || this.fontSize;
        }
        return height;
    }

    //获取一个字符的宽度
    public getWidthOfChar(_char: string, styleIndex: number, context: CanvasContext) {

        var width = this.applyCharStylesGetWidth(context, _char, styleIndex);
        return width;
    }

    //利用字符的样式获取宽度
    public applyCharStylesGetWidth(ctx: CanvasContext, char: string, styleIndex: number) {
        var style = this.styles.get(styleIndex);
        let fontStyle = this.italic ? "italic" : "normal";
        let textDecoration = this.underline ? "underline" : 'none';

        style = style ? style : new StyleDefine(this.fill, this.fontSize, this.fontFamily, this.fontWeight, fontStyle, textDecoration);

        ctx.fillStyle = style.fill || this.fill;
        ctx.font = this.getFontDeclaration(style);

        var width = ctx.measureText(char).width;
        if (style.fontSize < 12 || style.fontSize > 1000)
            width *= (style.fontSize < 12 ? style.fontSize / 12 : style.fontSize / 60);

        style.width = width;
        this.styles.set(styleIndex, style)
        return width;
    }


    //移除样式
    public removeStyle(styleIndex: number) {

        if (this.styles)
            this.styles.remove(styleIndex);
    }



    //ctx的字体声明
    public getFontDeclaration(obj: StyleDefine) {
        if ((obj.fontSize < 12 || obj.fontSize > 1000))
            return [obj.fontStyle, obj.fontWeight, obj.fontSize < 12 ? '12px' : '60px', obj.fontFamily].join(' ');
        return [obj.fontStyle, obj.fontWeight, obj.fontSize + 'px', obj.fontFamily].join(' ');
    }

    //文本的某一行距左侧的距离
    public getLineLeftOffset(lineIndex: number, ctx: CanvasContext) {
        var lineWidth = this.getLineWidth(lineIndex, ctx);

        if (this.textAlign === TextAlgin.center) {
            return (this.config.width - lineWidth) / 2 - this.fontSize / 8;
        }
        if (this.textAlign === TextAlgin.right) {
            return this.config.width - lineWidth - this.fontSize / 4;
        }
        return 0;
    }


    //获取一行的宽度
    public getLineWidth(lineIndex: number, ctx: CanvasContext, isCache?: boolean) {
        //if (this.lineWidths[lineIndex]) {
        //    return this.lineWidths[lineIndex];
        //}
        var lineText: string = this.textLines[lineIndex], lineWidth = 0, index;
        var textLine: string = lineText ? this.trimSpaceAndNewLine(this.textLines[lineIndex]) : "";
        for (var i = 0; i < textLine.length; i++) {
            index = this.getStyleIndex(lineIndex, i);
            lineWidth += this.getWidthOfChar(textLine[i], index, ctx);
        }
        //!isCache && (this.lineWidths[lineIndex] = lineWidth);
        return lineWidth;
    }

    //最后的空格和回车不算
    public trimSpaceAndNewLine(line: string) {
        if (line.substring(line.length - 1, line.length) === ' ') {
            line = line.substring(0, line.length - 1);
        } else if (line.substring(line.length - 1, line.length) === '\n') {
            line = line.substring(0, line.length - 1);
        }
        return line;
    }

    /**
     * 清理绘制缓存
     */
    public clearCache() {
        delete this.lineWidths;
        delete this.lineHeights;
        this.lineWidths = new Common.List<number>();
        this.lineHeights = new Common.List<number>();

    }


    public updateTextLines(ctx: CanvasContext) {
        this.textLines = this.getTextLines(ctx);
        this.clearCache();

        //
        var textHeight = this.getTextHeight(this.textLines);
        this.currentHeight = textHeight;

        this.config.height = textHeight;


        //此处应该更新缓存。。。
        this.updateRenderCache(ctx);
    }
    public getCurrentHeight(): number {
        return this.currentHeight;
    }


    //在编辑完成后，调用此函数更新缓存
    public updateRenderCache(ctx: CanvasContext) {
        ctx = ctx;
        this.maxFontSize = this.getMaxFontSize();

        var styles = this.styles;
        var i = 0;
        var len = this.text.length;
        var textLines = this.textLines;
        var textLine;

        var textStyleArr: Common.List<Common.List<TextStyleInfo>> = new Common.List<Common.List<TextStyleInfo>>();; //这个文本的所有样式
        var style = {};
        var obj = null;
        var that = this;
        var minFont = this.getMinFontSize();
        var maxFont = this.maxFontSize;
        var ratio = 1;
        if (minFont < 12 || maxFont > 1000) {
            ratio = minFont < 12 ? minFont / 12 : maxFont / 60;
        }
        for (var j = 0; j < textLines.length; j++) {
            var lineStyleArr: Common.List<TextStyleInfo> = new Common.List<TextStyleInfo>(); //每行对应的所有样式
            var trimObj = this.trimEndLF(textLines[j])
            textLine = trimObj.str;
            var lineLen = textLine.length;
            var styleObj: TextStyleInfo = new TextStyleInfo(null, 0, 0);
            obj = null;

            for (var k = 0; k < lineLen; k++) {
                var charWidth = that.applyCharStylesGetWidth(ctx, this.text[i], i);
                if (obj == null) { //为空，把当前索引的样式赋给obj
                    obj = styles.get(i++);

                    styleObj.style = obj;
                    styleObj.charLength = 1;
                    styleObj.width = charWidth;
                    lineStyleArr.add(styleObj);
                }
                else { //不为空，则比较是否一致
                    var cur = styles.get(i++);

                    //这里比较，还要考虑undefined和""的情况
                    if (this.stylesEqu(obj, cur)) {
                        styleObj.charLength++;
                        styleObj.width += charWidth;
                    }
                    else {
                        styleObj = new TextStyleInfo(cur, 1, charWidth);
                        lineStyleArr.add(styleObj);
                        obj = cur;
                    }
                }
                var pre_style = styles.get(i - 1); //修正style的width值，如果pre_style.size < 12 || > 1000

                pre_style.width = charWidth / ratio;
            }


            if (trimObj && trimObj.trimmed) {
                i++;
            }
            textStyleArr.add(lineStyleArr);
        }
        this.renderCache = textStyleArr;
    }

    /**
     * 获取最大的字号
     */
    public getMaxFontSize() {
        var max = this.fontSize;
        for (var i = 0; i < this.styles.length(); i++) {
            if (this.styles.get(i) && this.styles.get(i).fontSize && this.styles.get(i).fontSize > max)
                max = this.styles.get(i).fontSize;
        }
        return max;
    }
    /**
     * 获取最小的字号
     */
    public getMinFontSize(): number {
        var min: number = this.fontSize;
        for (var i = 0; i < this.styles.length(); i++) {
            if (this.styles.get(i) && this.styles.get(i).fontSize && this.styles.get(i).fontSize < min)
                min = this.styles.get(i).fontSize;
        }
        return min;
    }

    /**
     * 删除字符串末尾的一个换行符
     * @param str  字符串
     */
    public trimEndLF(str: string) {
        if (str.endsWith('\n')) {
            return { str: str.slice(0, -1), trimmed: true };
        }
        return { str: str, trimmed: false };
    }

    /**
     * 比较两个样式是否一致
     * @param st1 样式1
     * @param st2 样式2
     */
    public stylesEqu(st1: StyleDefine, st2: StyleDefine): boolean {
        var s1 = Util.clone(st1);
        var s2 = Util.clone(st2);
        var props = ['fill', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'textDecoration'];
        s1['fill'] = s1['fill'] || '#000000';
        s2['fill'] = s2['fill'] || '#000000';
        var equ = true;
        equ = props.every((prop) => {
            if (s1[prop] === undefined) s1[prop] = '';
            if (s2[prop] === undefined) s2[prop] = '';
            return (s1[prop] === s2[prop]);
        });
        return equ;
    }


    /**
     * 获取整个文本的高度（包括行的间距，lineHeights的累加）
     * @param textLines 
     */
    public getTextHeight(textLines: Array<string>) {
        var height = 0;
        for (var i = 0, len = textLines.length; i < len; i++) {
            height += this.getHeightOfLine(i);
        }
        return height;
    }
    /**
     * 根据输入的文本内容，得到分割的字符串列表
     */
    private getTextLines(ctx: CanvasContext) {
        var lines = this.text.split(this.reNewline), wrapped: Array<string> = [],
            maxLineWidth = this.minWidth, j, wrappedStr, index = 0;
        this.textLines = lines;
        for (j = 0; j < lines.length; j++) {
            var currentW = this.getLineWidth(j, ctx, true);
            if (currentW >= maxLineWidth) {
                maxLineWidth = currentW + this.fontSize / 4;
            }
            if (this.fixedWidth == false) {
                if (maxLineWidth <= this.maxWidth) {
                    this.config.width = maxLineWidth;
                } else {
                    this.config.width = this.maxWidth;
                    this.fixedWidth = true;
                }
            }
            wrappedStr = j + 1 === lines.length ? '' : '\n';
            wrapped = wrapped.concat(this.wrapLine(index, lines[j] + wrappedStr, currentW, ctx));
            index += (lines[j] + wrappedStr).length;
        }
        return wrapped;
    }

    /**
     * 根据宽度计算换行
     * @param index 
     * @param text 
     * @param currentW 
     */
    private wrapLine(index: number, text: string, currentW: number, ctx: CanvasContext) {
        var maxWidth = this.config.width, words = text.split(''),
            lines = [], line = '', totalWidth = 0, wordWidth = 0;
        var offset = this.fontSize / 4, tempMaxWidth = maxWidth - offset;
        if (currentW <= tempMaxWidth) {
            lines.push(text);
        } else {
            while (words.length > 0) {
                wordWidth = this.getWidthOfChar(words[0], index, ctx);
                if (totalWidth + wordWidth <= tempMaxWidth || totalWidth == 0) {
                    line += words.shift();
                    words[0] && (totalWidth += wordWidth);
                    if (words.length == 0)
                        lines.push(line.substring(0, line.length));
                    index++;
                } else {
                    lines.push(line);
                    line = '';
                    totalWidth = 0;
                }
            }
        }
        return lines;
    }

    //非编辑状态下文字绘制
    public draw(ctx: CanvasContext, hitCtx: CanvasContext) {
        ctx.save();
        this.drawText(ctx);
        ctx.restore();
        if (this.isEditting) {
            this.drawEditingFrame(ctx);
        } else {
            this.drawSelectedFrame(ctx);
        }
    }
    drawSelectedFrame(context: CanvasContext) {

        var margin = 2;
        var config: TextConfig = new TextConfig(this.config.width + margin * 2, this.config.height + margin * 2, new TextTranslate(this.config.translate.x - margin, this.config.translate.y - margin), 0);

        context.save();
        context.lineWidth = 1;

        //绘制矩形边框
        context.strokeStyle = XlMath.makeRGBA("#55a2ff", 0.6);
        context.beginPath();
        context.rect(config.translate.x, config.translate.y, config.width, config.height);
        context.stroke();


        let changeModeImgPoint: Point = new Point(this.config.translate.x + this.config.width - 18, this.config.translate.y + this.config.height - 18);
        this.drawChangeModeImg(changeModeImgPoint, context);
        context.restore();
    }
    private drawChangeModeImg(point: Point, context: CanvasContext) {
        context.drawImage(this.changeToEditModeImg, point.x, point.y);
    }
    public drawEditingFrame(context: CanvasContext) {
        var config = this.config;

        var center = this.getCenterCoordinate();
        context.save();
        config = this.rotateContext1(context, this.config, center);
        context.save();
        //绘制输入框
        context.beginPath();
        context.strokeStyle = this.frameLineColor;
        context.setLineDash([5, 4]);
        context.lineWidth = 1;
        var width = config.width;
        var height = config.height;
        context.rect(config.translate.x, config.translate.y, width, height);
        context.stroke();
        context.restore();

        //绘制删除按钮
        context.save();
        context.fillStyle = this.delBackColor;
        context.beginPath();
        context.arc(config.translate.x + config.width, config.translate.y, this.delR, 0, 2 * Math.PI);
        context.fill();
        context.strokeStyle = this.delFrontColor;
        context.lineWidth = 2;
        context.translate(config.translate.x + config.width, config.translate.y);
        context.rotate(45 * Math.PI / 180);
        context.beginPath();
        context.moveTo(- this.delCrossLength / 2, 0);
        context.lineTo(this.delCrossLength / 2, 0);
        context.moveTo(0, 0 - this.delCrossLength / 2);
        context.lineTo(0, this.delCrossLength / 2);
        context.stroke();
        context.closePath();
        context.rotate(-45 * Math.PI / 18);
        context.translate(-config.translate.x - config.width, -config.translate.y);
        context.restore();

        //绘制drag
        //底部白圈
        context.save();
        context.fillStyle = this.dragBackColor;
        context.beginPath();
        context.arc(config.translate.x + config.width, config.translate.y + config.height, this.dragBR, 0, 2 * Math.PI);
        context.fill();
        //蓝圈
        context.fillStyle = this.dragFrontColor;
        context.beginPath();
        context.arc(config.translate.x + config.width, config.translate.y + config.height, this.dragFR, 0, 2 * Math.PI);
        context.fill();

        context.restore();
        context.restore();
    }
    public getCenterCoordinate() {
        var point = new Point(this.config.translate.x + this.config.width / 2, this.config.translate.y + this.config.height / 2);
        return point;
    }

    //绘制时调用，旋转画布
    public rotateContext1(ctx: CanvasContext = null, config: TextConfig, center: Point): TextConfig {
        config.rotate = config.rotate % 360;
        if (config.rotate != 0) {
            ctx.translate(center.x, center.y);
            ctx.rotate(XlMath.degreeToRadian(config.rotate));
            ctx.translate(-center.x, -center.y);
        }
        return config;
    }

    public changeSize(xIncrement: number, yIncrement: number, ctx: CanvasContext): void {
        this.config.width += xIncrement;
        this.config.height += yIncrement;
        this.config.width < 110 ? this.config.width = 110 : () => { };
        this.updateTextLines(ctx);
    }
    //改变大小
    public scale(scale: any, zoomX: number = null, zoomY: number = null, direction: any = null): boolean {

        //改变大小

        // if ((zoomX != null && zoomX != undefined) && (zoomY != null && zoomY != undefined)) {//有定义缩放中心点
        //     var width = this.config.width * (1 + scale.wsize);

        //     var height = this.config.height * (1 + scale.hsize);

        //     if (width <= 110 || height <= 20)
        //         return false;
        //     this.config.width = width;
        //     this.config.height = height;
        //     this.computeTranslate(scale, zoomX, zoomY);
        // }


        // this.draw();
        return true;
    }
    public computeTranslate(scale: number, zoomX: number, zoomY: number) {
        // var translate = this.config.translate;
        // translate.x = (translate.x - zoomX) * (1 + scale.wsize) + zoomX;
        // translate.y = (translate.y - zoomY) * (1 + scale.hsize) + zoomY;
        // translate.sx = (translate.sx - zoomX) * (1 + scale.size) + zoomX;
        // translate.sy = (translate.sy - zoomY) * (1 + scale.size) + zoomY;
        // translate.ex = (translate.ex - zoomX) * (1 + scale.size) + zoomX;
        // translate.ey = (translate.ey - zoomY) * (1 + scale.size) + zoomY;


    }
    public drawText(ctx: CanvasContext) {
        if (!this.renderCache) {
            this.updateTextLines(ctx);
        }
        this.clearCache();

        var textLines = this.textLines;
        this.renderText2(textLines, ctx);
    }
    //绘制文本
    public renderText2(textLines: Array<string>, ctx: CanvasContext) {

        var lineHeights = 0;

        var leftOffset = this.getLeftOffset(), topOffset = this.getTopOffset();
        for (var i = 0, len = textLines.length; i < len; i++) {
            var heightOfLine = this.getHeightOfLine(i);
            this.renderTextLine2(ctx, textLines[i], leftOffset + this.getLineLeftOffset(i, ctx), topOffset + lineHeights, i, heightOfLine);
            lineHeights += heightOfLine;
        }

    }

    //
    /**
     * 绘制某一行
     * @param ctx  canvas context
     * @param line 要绘制的行
     * @param left 左边距
     * @param top 右边距
     * @param lineIndex 行号
     * @param heightOfLine 行高
     */
    private renderTextLine2(ctx: CanvasContext, line: string, left: number, top: number, lineIndex: number, heightOfLine: number) {
        top += (heightOfLine / this.lineHeight) * (1 - this.fontSizeFraction) + this.fontSize * 0.03;//？？？
        var lineStyle = this.renderCache.get(lineIndex);

        var text = this.trimEndLF(line).str;
        var i, arrLen = lineStyle && lineStyle.length();
        var maxHeight = 0;
        lineStyle && lineStyle.foreach(function (i, obj) {
            if (obj.style.fontSize > maxHeight) {
                maxHeight = obj.style.fontSize;
            }
        });


        for (i = 0; i < arrLen; i++) {
            var conf = lineStyle.get(i);
            var style = conf.style;
            var width = conf.width;
            var count = conf.charLength;
            //draw text with style
            ctx.fillStyle = style.fill || '#000000';
            ctx.font = this.getFontDeclaration.call(this, style);
            ctx.fillText(text.slice(0, count), left, top);
            //draw underline or throughline
            this.renderCharDecoration(ctx, style, left - 0.5, top, 0, width + 0.5, style.fontSize, maxHeight);
            text = text.slice(count);
            left += width;
        }
    }

    //
    /**
     * 绘制下划线or中划线
     * @param ctx canvas context
     * @param styleDeclaration 下划线或者中划线
     * @param left 左边距
     * @param top 右边距
     * @param offset 偏移
     * @param charWidth 字宽
     * @param charHeight 字高
     * @param maxHeight 最大字高
     */
    public renderCharDecoration(ctx: CanvasContext, styleDeclaration: StyleDefine, left: number, top: number, offset: number, charWidth: number, charHeight: number, maxHeight: number) {
        var textDecoration = styleDeclaration ? styleDeclaration.textDecoration : this.textDecoration;
        if (!textDecoration)
            return;

        if (textDecoration.indexOf('underline') > -1) { //下划线
            ctx.fillRect(left, top + maxHeight / 10, charWidth, maxHeight / 15);
        }
        if (textDecoration.indexOf('line-through') > -1) { //中划线
            ctx.fillRect(left, top - charHeight * 0.38 + charHeight / 15, charWidth, charHeight / 15);
        }
    }


    /**
     * 获取按up键后光标的位置
     * @param cursorLocation 
     * @param textOnPreviousLine 
     * @param widthOfCharsOnSameLineBeforeCursor 
     */
    public getIndexOnPrevLine(cursorLocation: TextControlCursorLocation, textOnPreviousLine: string, widthOfCharsOnSameLineBeforeCursor: number, ctx: CanvasContext) {
        var lineIndex = cursorLocation.lineIndex - 1,
            lineLeftOffset = this.getLineLeftOffset(lineIndex, ctx),
            widthOfCharsOnPreviousLine = lineLeftOffset,
            indexOnPrevLine = 0, foundMatch;
        for (var j = 0, jlen = textOnPreviousLine.length; j < jlen; j++) {
            var _char = textOnPreviousLine[j],
                index = this.getStyleIndex(lineIndex, j),
                widthOfChar = this.getWidthOfChar(_char, index, ctx);
            widthOfCharsOnPreviousLine += widthOfChar;
            if (widthOfCharsOnPreviousLine > widthOfCharsOnSameLineBeforeCursor) {
                foundMatch = true;
                var leftEdge = widthOfCharsOnPreviousLine - widthOfChar,
                    rightEdge = widthOfCharsOnPreviousLine,
                    offsetFromLeftEdge = Math.abs(leftEdge - widthOfCharsOnSameLineBeforeCursor),
                    offsetFromRightEdge = Math.abs(rightEdge - widthOfCharsOnSameLineBeforeCursor);
                indexOnPrevLine = offsetFromRightEdge < offsetFromLeftEdge ? j : (j - 1);
                break;
            }
        }
        if (!foundMatch)
            indexOnPrevLine = textOnPreviousLine.length - 1;
        return indexOnPrevLine;
    }

    /**
     * 获取按down键后光标的位置
     * @param cursorLocation 
     * @param textOnNextLine 
     * @param widthOfCharsOnSameLineBeforeCursor 
     */
    public getIndexOnNextLine(cursorLocation: TextControlCursorLocation, textOnNextLine: string, widthOfCharsOnSameLineBeforeCursor: number, ctx: CanvasContext) {
        var lineIndex = cursorLocation.lineIndex + 1,
            lineLeftOffset = this.getLineLeftOffset(lineIndex, ctx),
            widthOfCharsOnNextLine = lineLeftOffset,
            indexOnNextLine = 0, foundMatch;
        for (var j = 0, jlen = textOnNextLine.length; j < jlen; j++) {
            var _char = textOnNextLine[j],
                index = this.getStyleIndex(lineIndex, j),
                widthOfChar = this.getWidthOfChar(_char, index, ctx);
            widthOfCharsOnNextLine += widthOfChar;
            if (widthOfCharsOnNextLine > widthOfCharsOnSameLineBeforeCursor) {
                foundMatch = true;
                var leftEdge = widthOfCharsOnNextLine - widthOfChar,
                    rightEdge = widthOfCharsOnNextLine,
                    offsetFromLeftEdge = Math.abs(leftEdge - widthOfCharsOnSameLineBeforeCursor),
                    offsetFromRightEdge = Math.abs(rightEdge - widthOfCharsOnSameLineBeforeCursor);
                indexOnNextLine = offsetFromRightEdge < offsetFromLeftEdge ? j + 1 : j;
                break;
            }
        }
        if (!foundMatch)
            indexOnNextLine = textOnNextLine.length;
        return indexOnNextLine;
    }


}

export class TextStyleInfo {
    public style: any;
    public charLength: number;
    public width: number;
    public textDecoration: string;

    constructor(style: object, charLength: number, width: number) {
        this.style = style;
        this.charLength = charLength;
        this.width = width;
    }

}

export class StyleDefine {
    fill: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    width: number;

    constructor(fill: string, fontSize: number, fontFamily: string, fontWeight: string, fontStyle: string, textDecoration: string) {

        this.fill = fill,
            this.fontSize = fontSize,
            this.fontWeight = fontWeight,
            this.fontStyle = fontStyle,
            this.textDecoration = textDecoration,
            this.fontFamily = fontFamily

    }


}
export class TextControlCursorLocation {
    lineIndex: number;
    charIndex: number;
    constructor(lineIndex: number, charIndex: number) {
        this.lineIndex = lineIndex;
        this.charIndex = charIndex;
    }
}