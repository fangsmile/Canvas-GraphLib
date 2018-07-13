import { Group } from "./Group";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
import { Container } from "./Container";
import { Point } from "./Point";
import { XlMath } from "./XlMath";
import { GraphLib } from "./GraphLib";

export class Layer extends Container {
    type: string = "Layer";
    // groups: Array<Group> = null;
    canvas: HTMLCanvasElement;
    hitCanvas: HTMLCanvasElement;
    canvasContext: CanvasContext;
    hitCanvasContext: CanvasContext;
    scale: number = 1;
    id: string = null;
    // children: Array<any> = new Array<any>();
    // parent: any = null;//添加到group或者层 child.parent = this;
    constructor(id: string = null) {
        super()
        this.canvas = document.createElement("canvas");
        this.hitCanvas = document.createElement("canvas");
        if (id) {
            this.id = id;
            this.canvas.dataset[id] = id;
            this.hitCanvas.dataset[id] = "hit_" + id;
        }
        this.canvasContext = new CanvasContext(this.canvas);
        this.hitCanvasContext = new CanvasContext(this.hitCanvas);
    }
    //绘制该层上所有内容
    draw() {
        console.log("draw layer",this.id);
        this.clearContext();
        this.children.forEach(obj => {
            obj.draw(this.canvasContext, this.hitCanvasContext);
        })
    }
    scaleCanvas(scale: number, p: Point = null) {
        this.scale *= scale;
        if (p) {
            this.canvasContext.scalePoint(scale, scale, p.x, p.y);
            this.hitCanvasContext.scalePoint(scale, scale, p.x, p.y);
        } else {
            this.canvasContext.scale(scale, scale);
            this.hitCanvasContext.scale(scale, scale);
        }
    }
    translateCanvas(diffX: number, diffY: number) {
        this.canvasContext.translate(diffX, diffY);
        this.hitCanvasContext.translate(diffX, diffY);
    }
    clearContext() {
        this.canvasContext.clear()
        this.hitCanvasContext.clear()
    }

    /**
        * destroy layer
        * @method
        * @memberof Konva.Stage.prototype
        */
    removeSelf() {
        super.removeSelf();
        this.parent.container.removeChild(this.canvas);
        this.parent.container.removeChild(this.hitCanvas);
        return this;
    }
    // add(obj: any) {
    //     if (this == obj) {
    //         console.error("can not add yourself !")
    //         return false;
    //     }
    //     if (obj.type == "Group" || obj.type == "Shape") {
    //         this.children.push(obj);
    //         obj.index = this.children.length - 1;
    //         obj.setParent(this);
    //     } else {
    //         console.error("You may only add groups and shapes to a Layer.")
    //     }
    // }
    // setParent(parent: any) {
    //     this.parent = parent;
    // }
    validateAdd(child: any) {
        if (child.type !== "Group" && child.type !== "Shape" && child.type !='text') {
            console.error("You may only add groups and shapes to a Layer.")
            return false;
        }
        return true;
    }
    /* var shape = layer.getSelected({x: 50, y: 50});
    *  or if you interested in shape parent:
    * var group = layer.getSelected({x: 50, y: 50}, 'Group');
    * var layer = layer.getSelected({x: 50, y: 50}, 'Layer');
    */
    getSelected(pos: Point, selector: string = "Shape") {
        var shape = this._getSelected({
            x: pos.x,
            y: pos.y
        });
        if (shape && selector) {
            return shape.findAncestor(selector, true);
        } else if (shape) {
            return shape;
        }
    }
    _getSelected(pos: Point) {
        var colorKey = XlMath.getColorKey({ x: pos.x, y: pos.y }, <any>this.hitCanvasContext);
        return GraphLib.shapes[colorKey];
    }
    setIndex(index: number) {
        super.setIndex(index);
        var stage = this.getParent();
        if (stage) {
            stage.container.removeChild(this.canvas);

            if (index < stage.getChildren().length - 1) {
                stage.container.insertBefore(
                    this.canvas,
                    stage.getChildren()[index + 1].canvas
                );
            } else {
                stage.container.appendChild(this.canvas);
            }
        }
        return this;
    }

    moveUp() {
        var moved = super.moveUp();
        if (!moved) {
            return this;
        }
        var stage = this.getParent();
        if (!stage) {
            return this;
        }
        stage.container.removeChild(this.canvas);

        if (this.index < stage.getChildren().length - 1) {
            stage.container.insertBefore(
                this.canvas,
                stage.getChildren()[this.index + 1].getCanvas()._canvas
            );
        } else {
            stage.container.appendChild(this.canvas);
        }
        return this;
    }
    moveDown() {
        if (super.moveDown()) {
            var stage = this.getParent();
            if (stage) {
                var children = stage.getChildren();
                stage.container.removeChild(this.canvas);
                stage.container.insertBefore(
                    this.canvas,
                    children[this.index + 1].getCanvas()._canvas
                );
            }
        }
        return this;
    }

    moveToBottom() {
        if (super.moveToBottom()) {
            var stage = this.getParent();
            if (stage) {
                var children = stage.getChildren();
                stage.container.removeChild(this.canvas);
                stage.container.insertBefore(
                    this.canvas,
                    children[1].getCanvas()._canvas
                );
            }
        }
        return this;
    }
}