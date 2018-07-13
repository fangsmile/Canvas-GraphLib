import { Layer } from "./Layer";
import { Point } from "./Point";
import { Container } from "./Container";
export class Stage extends Container {
    type: string = "Stage";
    className: string = "Stage";
    // layers: Array<Layer> = new Array<Layer>();
    container: Element;
    width: number;
    height: number;
    constructor(containerId: string, width: number, height: number) {
        super()
        this.container = document.getElementById(containerId) || null;
        this.width = width;
        this.height = height;
    }
    // //绘制该舞台所有内容
    // draw() {
    //     this.layers.forEach(obj => {
    //         obj.draw();
    //     })
    // }

    //绘制该舞台所有层级上所有内容
    draw() {
        console.log("draw stage")
        this.children.forEach(obj => {
            obj.draw();
        })
    }
    //P不传，默认是以0,0
    scaleCanvas(scale: number, p: Point = null) {
        this.children.forEach(obj => {
            obj.scaleCanvas(scale, p);
        })
    }
    translateCanvas(diffX: number, diffY: number) {
        this.children.forEach(obj => {
            obj.translateCanvas(diffX, diffY);
        })
    }
    add(obj: Layer) {
        if (super.add(obj)) {
            this.container.appendChild(obj.hitCanvas);
            this.container.appendChild(obj.canvas);
            obj.hitCanvas.style.display = "none";
            obj.hitCanvas.width = this.width;
            obj.canvas.width = this.width;
            obj.hitCanvas.height = this.height;
            obj.canvas.height = this.height;
            obj.hitCanvas.style.position = "absolute";
            obj.canvas.style.position = "absolute";
            return true;
        }
        return false
    }
    validateAdd(child: any) {
        if (child.type !== 'Layer') {
            console.error('You may only add layers to the stage.');
            return false;
        }
        return true;
    }
    /* var shape = stage.getSelected({x: 50, y: 50});
    * or if you interested in shape parent:
    * var group = stage.getSelected({x: 50, y: 50}, 'Group');
    * var layer = layer.getSelected({x: 50, y: 50}, 'Layer');
    */
    getSelected(pos: Point, selector: string = "Shape") {
        var layers = this.children,
            len = layers.length,
            end = len - 1,
            n,
            shape;

        for (n = end; n >= 0; n--) {
            shape = layers[n].getSelected(pos, selector);
            if (shape) {
                return shape;
            }
        }

        return null;
    }
}