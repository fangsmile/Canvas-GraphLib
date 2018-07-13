import { Container } from "./Container";
import {CanvasContext} from "./../../../../../build/drawing/CanvasContext";
export class Group extends Container{
    type: string = "Group";
    className: string = "Group";
    // children: Array<any> = new Array<any>();
    // parent: any = null;//添加到group或者层 child.parent = this;
    constructor() {
        super()
    }
    // //绘制该组所有内容
    // draw(ctx: CanvasContext, hitCtx: CanvasContext) {
    //     this.children.forEach(obj => {
    //         obj.draw(ctx, hitCtx);
    //     })
    // }

    // add(obj: any) {
    //     if (this == obj) {
    //         console.error("can not add yourself !")
    //         return false;
    //     }

    //     if (obj.type == "Group" || obj.type == "Shape") {
    //         this.children.push(obj);
    //         obj.index=this.children.length-1;
    //         obj.setParent(this);
    //     } else {
    //         console.error("You may only add groups and shapes to a Group.")
    //     }
    // }
    // setParent(parent: any) {
    //     this.parent = parent;
    // }
    // moveBy(diffX: number, diffY: number) {
    //     this.children.forEach(obj => {
    //         obj.moveBy(diffX, diffY);
    //     })
    // }
    validateAdd(child: any) {
        if (child.type !== "Group" && child.type !== "Shape") {
            console.error("You may only add groups and shapes to a Group.")
            return false;
        }
        return true;
    }
}