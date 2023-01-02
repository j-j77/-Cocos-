import ConfigBase from "./ConfigBase";

export default class PrefabMgr extends ConfigBase{
    constructor(){
        super();
    }

    getRes(name:string){
        if(name.length ===0){
            return null;
        }

        return this._mapAsset.get(name) as cc.Prefab;
    }
}   