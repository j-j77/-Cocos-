import UIBase from "../UIFramework/UIBase";
import ConfigMgr from "./Common/ConfigMgr";
import DataMgr from "./Common/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Loading extends UIBase {
    onInit(params?:any){
        this._isDestroy = true; 
        cc.resources.loadDir('',cc.Asset, (compelete,total,items)=>{
                let progress = compelete/total;
                this.getComp('_LoadingBar','ProgressBar').progress  = progress;
            },(err,assets)=>{
            if(err){
                return;
            }
            //console.log(assets);
            // let prefabMgr = new PrefabMgr();
            // let mapMgr = new MapMgr();
            // let spriteFrameMgr = new SpriteFrameMgr();
             
            let objType = {'PrefabMgr':cc.Prefab,'MapMgr':cc.TiledMapAsset,'SpriteFrameMgr':cc.SpriteFrame};
            //遍历所有的资源
            for(let res of assets){
                //如果加载进来的资源是合图，那么另外处理
                if(res instanceof cc.SpriteAtlas){
                    //拿到合图里面的所有精灵帧。
                    let arrSpriteFrame = res.getSpriteFrames();
                    for(let spriteFrame of arrSpriteFrame){
                        ConfigMgr.getInstance().getMgr('SpriteFrameMgr').addRes(spriteFrame.name,spriteFrame);
                    }
                    continue;
                }
                //json数据
                if(res instanceof cc.JsonAsset){
                    DataMgr.getInstance().getMgr(res.name).addData(res.json);
                    continue;
                }


                for(let mgrName of Object.keys(objType)){
                    if(res instanceof objType[mgrName]){
                        let mgr = ConfigMgr.getInstance().getMgr(mgrName);
                        if(!mgr){
                            continue;
                        }
                        mgr.addRes(res.name,res);
                    }
                }

                // if(res instanceof cc.Prefab){
                //     prefabMgr.addRes(res.name,res);
                // }
                // else if(res instanceof cc.TiledMapAsset){
                //     mapMgr.addRes(res.name,res);
                // }
                // else if(res instanceof cc.SpriteFrame){
                //     spriteFrameMgr.addRes(res.name,res);
                // }
            }
            this.openUI('Menu',true);
            //console.log(ConfigMgr.getInstance());
        })
    }
   
}
