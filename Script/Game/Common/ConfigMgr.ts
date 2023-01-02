import ConfigBase from "./ConfigBase";
import MapMgr from "./MapMgr";
import PrefabMgr from "./PrefabMgr";
import SpriteFrameMgr from "./SpriteFrameMgr";

export default class ConfigMgr{
    private static _instance:ConfigMgr = null;
    private _mapMgr:Map<string,ConfigBase> = new Map();
    private _objType = {'PrefabMgr':PrefabMgr,'MapMgr':MapMgr,'SpriteFrameMgr':SpriteFrameMgr};
    static getInstance(){
        if(!this._instance){
            this._instance = new ConfigMgr();
        }
        return this._instance;
    }
    private constructor(){

    }
      
    getMgr(name:string){
        if(name.length ===0){ 
            return null;
        }
        let mgr = this._mapMgr.get(name);
        if(!mgr){
            let type = this._objType[name];
            if(!type){
                return null;
            }
            mgr = new type();
            this._mapMgr.set(name,mgr);
        }
        return mgr;
    }
    // addMgr(name,mgr){
    //     if(name.length ===0||!mgr){
    //         return;
    //     }
    //     this._mapMgr.set(name,mgr);
    // }
}