import { Record, IRecord, recordProp, recordClass } from 'immutable-record-class';
interface IPointStore extends IRecord {
    x:number;
    y:number;
}

@recordClass()
export class PointStore extends Record implements IRecord {
    @recordProp(0)
    x: number;
    @recordProp(0)
    y: number;
    constructor( x: number, y: number) {
        super();
        this.initValues({
            x: x,
            y: y,
        });
    }
}