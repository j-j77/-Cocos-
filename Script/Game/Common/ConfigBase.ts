export default class ConfigBase{
    protected _mapAsset:Map<string,cc.Asset> = new Map();
    constructor(){

    }
    onInit(params?:any){

    }

    addRes(name:string,asset:cc.Asset){
        if(!asset||name.length ===0){
            return;
        }
        this._mapAsset.set(name,asset);
    }

    getRes(name){ 
        return null;
    }
}  