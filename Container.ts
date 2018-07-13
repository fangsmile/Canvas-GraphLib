import { Shape } from "./Shape";
import { Point } from "./Point";
import { CanvasContext } from "./../../../../../build/drawing/CanvasContext";
export class Container {
    type: string = "Container";
    className: string = "Container";
    children: Array<any> = new Array<any>();
    parent: any = null;//添加到group或者层 child.parent = this;
    index: number;
    constructor() {
    }
    //绘制该组所有内容
    draw(ctx: CanvasContext, hitCtx: CanvasContext) {
        this.children.forEach(obj => {
            obj.draw(ctx, hitCtx);
        })
    }
    getIndex() {
        return this.index;
    }
    add(obj: any) {
        if (this == obj) {
            console.error("can not add yourself !")
            return false;
        }
        var child = this.getChildren((ch: any) => { return ch == obj });
        if (this.validateAdd(obj) && child.length == 0) {
            this.children.push(obj);
            obj.index = this.children.length - 1;
            obj.setParent(this);
            return true;
        }
        return false;
    }
    /**
     * validate 验证添加
     * @param child 
     */
    validateAdd(child: any) {
        return true;
    }
    setParent(parent: any) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }

    /**
 * destroy all children
 * @method
 * @memberof Konva.Container.prototype
 */
    destroyChildren() {
        var child;
        for (var i = 0; i < this.children.length; i++) {
            child = this.children[i];
            // reset parent to prevent many setChildrenIndex calls
            delete child.parent;
            child.index = 0;
            child.removeSelf();
        }
        this.children = null;
        this.children = new Array<any>();
        return this;
    }
    destroy() {
        // destroy children
        if (this.hasChildren()) {
            this.destroyChildren();
        }
        this.removeSelf();
        return this;
    }
    removeSelf() {
        var parent = this.getParent();
        if (parent && parent.children) {
            parent.children.splice(this.index, 1);
            parent.setChildrenIndex();
            delete this.parent;
        }
    }

    hasChildren() {
        return this.getChildren().length > 0;
    }
    getChildren(filterFunc: Function = null) {
        if (!filterFunc) {
            return this.children;
        }

        var results = new Array<any>();
        this.children.forEach(function (child) {
            if (filterFunc(child)) {
                results.push(child);
            }
        });
        return results;
    }
    getDeepChildren(filterFunc: Function = null) {
        if (!filterFunc) {
            return this.children;
        }

        var results = new Array<any>();
        this.children.forEach(function (child) {
            if (child.getDeepChildren)
                results = results.concat(child.getDeepChildren(filterFunc))
            else
                if (filterFunc(child)) {
                    results.push(child);
                }
        });
        return results;
    }
    moveBy(diffX: number, diffY: number) {
        this.children.forEach(obj => {
            obj.moveBy(diffX, diffY);
        })
    }

    setChildrenIndex() {
        this.children.forEach(function (child, n) {
            child.index = n;
        });
    }
    setIndex(index: number) {
        if (!this.parent) {
            console.error('Node has no parent. zIndex parameter is ignored.');
            return false;
        }
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(index, 0, this);
        this.parent.setChildrenIndex();
        return this;
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

    moveUp() {
        if (!this.parent) {
            console.error('Node has no parent. moveUp function is ignored.');
            return null;
        }
        var index = this.index,
            len = this.parent.getChildren().length;
        if (index < len - 1) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index + 1, 0, this);
            this.parent.setChildrenIndex();
            return this;
        }
        return null;
    }
    moveDown() {
        if (!this.parent) {
            console.error('Node has no parent. moveDown function is ignored.');
            return null;
        }
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent.setChildrenIndex();
            return this;
        }
        return null;
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

    moveToContainer(newContainer: any) {
        // do nothing if new container is already parent
        if (this.getParent() !== newContainer) {
            // this.remove my be overrided by drag and drop
            // buy we need original
            var parent = this.getParent();
            if (parent && parent.children) {
                parent.children.splice(this.index, 1);
                parent.setChildrenIndex();
                delete this.parent;
            }
            newContainer.add(this);
        }
        return this;
    }
    getPointRange() {
        let passX: Array<number> = [];
        let passY: Array<number> = [];
        this.children.forEach(obj => {
            let range = obj.getPointRange();
            passX.push(range.minX);
            passX.push(range.maxX);
            passY.push(range.minY);
            passY.push(range.maxY);
        })

        return {
            minX: Math.min(...passX),
            minY: Math.min(...passY),
            maxX: Math.max(...passX),
            maxY: Math.max(...passY),
        }
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


    clone(obj: any) {
        // call super method
        // var node = this._clone(obj);

        // this.children.forEach(element => {
        //     node.add(element.clone());
        // });
        // return node;
    }
    private _clone(obj: any) {
        // instantiate new node
        // var attrs = this._cloneObject(this.attrs),
        //     key,
        //     allListeners,
        //     len,
        //     n,
        //     listener;
        // filter black attrs
        // for (var i in CLONE_BLACK_LIST) {
        //     var blockAttr = CLONE_BLACK_LIST[i];
        //     delete attrs[blockAttr];
        // }
        // // apply attr overrides
        // for (key in obj) {
        //     attrs[key] = obj[key];
        // }

        // var node = new this.constructor(attrs);
        // // copy over listeners
        // for (key in this.eventListeners) {
        //     allListeners = this.eventListeners[key];
        //     len = allListeners.length;
        //     for (n = 0; n < len; n++) {
        //         listener = allListeners[n];
        //         /*
        //                    * don't include konva namespaced listeners because
        //                    *  these are generated by the constructors
        //                    */
        //         if (listener.name.indexOf(KONVA) < 0) {
        //             // if listeners array doesn't exist, then create it
        //             if (!node.eventListeners[key]) {
        //                 node.eventListeners[key] = [];
        //             }
        //             node.eventListeners[key].push(listener);
        //         }
        //     }
        // }
        // return node;
    };
    private _cloneObject(obj: any) {
        var retObj: any = {};
        for (var key in obj) {
            if (this._isObject(obj[key])) {
                retObj[key] = this._cloneObject(obj[key]);
            } else if (this._isArray(obj[key])) {
                retObj[key] = this._cloneArray(obj[key]);
            } else {
                retObj[key] = obj[key];
            }
        }
        return retObj;
    }
    private _cloneArray(arr: Array<any>) {
        return arr.slice(0);
    }
    private _isObject(obj: any) {
        return !!obj && obj.constructor === Object;
    }
    private _isArray(obj: any) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
}