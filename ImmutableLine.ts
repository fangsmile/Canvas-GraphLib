import { Record, IRecord, recordProp, recordClass } from 'immutable-record-class';
import { PointStore } from "./ImmutablePointe";
import { List as ImList } from 'immutable'
interface ILineStore extends IRecord {
    lineWidth: number;
    color: string;
    colorKey: string;
    Lines: ImList<PointStore>
}
@recordClass()
export class LineStore extends Record implements IRecord {
    @recordProp(0)
    lineWidth: number;
    @recordProp('')
    color: string;
    @recordProp('')
    colorKey: string;
    @recordProp('')
    Lines: ImList<PointStore>;
    @recordProp(false)
    graduation:boolean;//是否显示刻度
    constructor(lineWidth: number, color: string, colorKey: string, Lines: ImList<PointStore>,graduation?:boolean) {
        super();
        if(graduation){
            this.initValues({
                lineWidth: lineWidth,
                color: color,
                colorKey: colorKey,
                Lines: Lines,
                graduation:graduation
            });
        }else{
            this.initValues({
                lineWidth: lineWidth,
                color: color,
                colorKey: colorKey,
                Lines: Lines
            });
        }
       
    }
}