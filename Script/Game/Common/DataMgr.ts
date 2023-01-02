class DataBaseMgr{
    protected _arrData:any= null;
    constructor(){

    }

    addData(data:any){
        this._arrData = data;
    }

    getDataByID(id){
        for(let value of this._arrData){
            if(id === value.id){
                return value;
            }
        }
        return null; 
    }
}  

export class LevelDtMgr extends DataBaseMgr{
    private _curIndex:number = 0;    
    //存取器。
    get curIndex(){
        return this._curIndex;
    }
    set curIndex(index){
        this._curIndex = index;
    }
    constructor(){
        super();
    }

    private _arrIndex:number[] = [];
    get arrIndex(){
        return this._arrIndex;
    }
    set arrIndex(arrIndex){
        this._arrIndex = arrIndex;
    }

    getCurLevelDt(){
        return this._arrData[this._curIndex];
    }
}

export class KeyCodeDtMgr extends DataBaseMgr{
    constructor(){
        super();
    }
}
export class PlayerDtMgr extends DataBaseMgr{
    constructor(){
        super();
    }
}
export class PropDtMgr extends DataBaseMgr{
    constructor(){
        super();
    }
}


export default class DataMgr{
    private _mapMgr:Map<string,DataBaseMgr> = new Map();
    private static  _instance:DataMgr = null;
    private _objType = {'LevelDt':LevelDtMgr,'KeyCodeDt':KeyCodeDtMgr,'PlayerDt':PlayerDtMgr,'PropDt':PropDtMgr};
    static getInstance(){
        if(!this._instance){
            this._instance = new DataMgr();
        }
        return this._instance;
    }
    constructor(){

    }


    getMgr(name:string){
        if(name.length ===0){
            return null;
        }
        let mgr = this._mapMgr.get(name);
        if(!mgr){
            //通过名字获取对应的类型。
            let Type = this._objType[name];
            //如果类型拿不到，那么返回空。
            if(!Type){
                return null;
            }
            //如果类型拿到，那么new一个对象出来
            mgr = new Type();
            this._mapMgr.set(name,mgr);
        }
        return mgr;
    }
}