import NodePool, { PoolManager } from "../Common/NodePool";
import ModuleBase from "./ModuleBase";
import ModuleMgr from "./ModuleMgr";
import TiledMapCtrl from "./TiledMapCtrl";
import Blast from '../Object/Blast';
import ConfigBase from "../Common/ConfigBase";
import ConfigMgr from "../Common/ConfigMgr";
export default class BlastMgr extends ModuleBase{
    private _tiledMapCtrl:TiledMapCtrl = null;
    private _arrBlast:Blast[] = [];
    onInit(params?: any): void {
        new NodePool(50,'Blast','Blast');
        new NodePool(50,'BlastRed','Blast');
        this._tiledMapCtrl = ModuleMgr.getInstance().getModule('TiledMapCtrl') as TiledMapCtrl;
    }
   
    addBlast(mapTile:Map<string,Map<string,cc.Vec2>[]>){
        mapTile.forEach((arrMapTile,key,map)=>{//key:up，down
            for(let mapBlastTile of arrMapTile){
                mapBlastTile.forEach((value,name,mapbLast)=>{//name：水花预制体名字。
                    let tiledPos = value;
                    let blastN = PoolManager.getInstance().getPool(name).getNode(this);
                    let pos = this._tiledMapCtrl.getPosByTiled(tiledPos);
                    blastN.setPosition(pos);
                    blastN.parent = this._tiledMapCtrl.node;
                    let blastTs = blastN.getComponent('Blast');
                    blastTs.tiledPos = tiledPos;
                    this._arrBlast.push(blastTs);

                    let obj ={'center':'blastC_0','up':'blastU_0_0','down':'blastD_0_0','left':'blastL_0_0','right':'blastR_0_0'};
                    //改水花。
                    
                    let sprite = blastN.getComponent(cc.Sprite);
                    let newSpriteFrame = ConfigMgr.getInstance().getMgr('SpriteFrameMgr').getRes(obj[key]);
                    sprite.spriteFrame = newSpriteFrame;
                })                
            }
        })
    }

    removeBlast(tiledPos:cc.Vec2){
        for(let i = 0;i < this._arrBlast.length;i++){
            let blastTs = this._arrBlast[i];
            if(blastTs.tiledPos.equals(tiledPos)){
                PoolManager.getInstance().getPool(blastTs.node.name).putNode(blastTs.node);
                this._arrBlast.splice(i,1);
                break;
            }
        }
        
    }
    
}