import ConfigMgr from "../Common/ConfigMgr";
import DataMgr, { LevelDtMgr, PropDtMgr } from "../Common/DataMgr";
import Emitter from "../Common/Emitter";
import NodePool, { PoolManager } from "../Common/NodePool";
import Effect from "../Object/Effect";
import Prop from "../Object/Prop";
import ModuleBase from "./ModuleBase";
import ModuleMgr from "./ModuleMgr";
import TiledMapCtrl from "./TiledMapCtrl";

export default class PropMgr extends ModuleBase{
    private _tiledMapCtrl:TiledMapCtrl = null;
    private _arrTile:cc.Vec2[] = [];
    //存储道具脚本
    private _arrProp:Prop[] = [];
    onInit(params?: any): void {
        new NodePool(50,'Prop','Prop');
        this._tiledMapCtrl = ModuleMgr.getInstance().getModule('TiledMapCtrl') as TiledMapCtrl;
        this._arrTile = this._tiledMapCtrl.getAllBlastTile();
        this._createProp();
        Emitter.getInstance().on('refreshProp',this.refreshProp,this);
        Emitter.getInstance().on('eatProp',this.onEatProp,this);
        Emitter.getInstance().on('removeProp',this.removeProp,this);
    }
  
    _createProp(){
        let levelDtMgr = DataMgr.getInstance().getMgr('LevelDt') as LevelDtMgr;
        let levelDt = levelDtMgr.getCurLevelDt();
        let propDtMgr = DataMgr.getInstance().getMgr('PropDt') as PropDtMgr;
        // "prop":{
        //     "4001":5,
        //     "4002":6,
        //     "4003":7,
        //     "4004":8,
        //     "4005":9,
        //     "4006":5
        // }
        let objProp = levelDt.prop;
        for(let strID in objProp){
            let id = parseInt(strID);
            //要创建出id这种道具的数量
            let count = objProp[strID];
            //数量做一个浮动值  上下2个浮动。 5  3  4   3~7
            let randomNum = Math.floor(Math.random()*5)-2;//-2~2  -2 + 0~4
            //最终数量配置的数量+浮动值。
            let endCount = count+randomNum;
            for(let i = 0;i < endCount;i++){
                let propN = PoolManager.getInstance().getPool('Prop').getNode(this);
                //位置，随机
                let randomIndex = Math.floor(Math.random()*this._arrTile.length);
                let tiledPos = this._arrTile[randomIndex];
                //排除重复
                this._arrTile.splice(randomIndex,1);//删除第randomIndex，删除几个。
                let pos = this._tiledMapCtrl.getPosByTiled(tiledPos);
                propN.setPosition(pos);
                propN.parent = this._tiledMapCtrl.node;
                propN.zIndex = tiledPos.y;

               
                //改道具图片。
                let propDt = propDtMgr.getDataByID(id);
                let spriteFrameName = propDt.img;
                let sprite = propN.getComponent(cc.Sprite);
                let newSpriteFrame = ConfigMgr.getInstance().getMgr('SpriteFrameMgr').getRes(spriteFrameName);
                sprite.spriteFrame = newSpriteFrame;


                 //存储道具脚本
                 let propTs = propN.getComponent(Prop);
                 this._arrProp.push(propTs);
                 propTs.onInit({propDt:propDt});
                 propTs.tiledPos = tiledPos;
                 
            }

        }
    }

    getPropByTile(tiledPos){
        for(let value of this._arrProp){
            if(value.tiledPos.equals(tiledPos)){
                return value;
            }
        }
        return null;
    }

    refreshProp(oldTile,newTile){
        //判断oldTile是否有道具
        let propTs = this.getPropByTile(oldTile);
        if(!propTs){
            return;
        }

        // /道具要刷新。
        //计算偏移值
        // let x = (newTile.x -oldTile.x)*this._tiledMapCtrl.tiledSize.width;
        // let y =(oldTile.y - newTile.y)*this._tiledMapCtrl.tiledSize.height;
       
        propTs.node.setPosition(this._tiledMapCtrl.getPosByTiled(newTile));
        propTs.move();
        //道具的格子坐标也要更新
        propTs.tiledPos = newTile;
        propTs.node.zIndex = newTile.y;
        
    }

    removeProp(tiledPos:cc.Vec2){
        for(let i = 0;i < this._arrProp.length;i++){
            let propTs = this._arrProp[i];
            if(propTs.tiledPos.equals(tiledPos)&&propTs.isVisible){
                PoolManager.getInstance().getPool(propTs.node.name).putNode(propTs.node);
                this._arrProp.splice(i,1);
                console.log('移除道具');
                return;
            }
        }
    }


    onEatProp(tiledPos:cc.Vec2,target:any){
        let propTs = this.getPropByTile(tiledPos);
        if(!propTs){
            return;
        }
        console.log('吃到道具');
        let propDt = propTs.propDt;
        // if(propDt.id === 4001){
        //     target.playerDt.bubbleNum+=propDt.value;
        //     if(target.playerDt.bubbleNum >= target.playerDt.maxBubbleNum){
        //         target.playerDt.bubbleNum = target.playerDt.maxBubbleNum;
        //     }
        // }
        // else if(propDt.id === 4002){
        //     target.playerDt.bubblePower+=propDt.value;
        //     if(target.playerDt.bubblePower >= target.playerDt.maxBubblePower){
        //         target.playerDt.bubblePower = target.playerDt.maxBubblePower;
        //     }
        // }
        // else if(propDt.id ===4003){
        //     target.playerDt.bubblePower = target.playerDt.maxBubblePower;
        // }
        // else if(propDt.id === 4004){
        //     let speed = target.getSpeed();
        //     speed+=propDt.value;
        //     if(speed >= target.playerDt.maxSpeed){
        //         speed = target.playerDt.maxSpeed;
        //     }
        //     target.setSpeed(speed);
        // }
        // else if(propDt.id === 4005){
        //     target.setSpeed(target.playerDt.maxSpeed);
        // }
        // else if(propDt.id === 4006){
        //     target.reverse();
        // }
        Effect.getEffect(propDt.id,propDt.value).playEffect(target);
        this.removeProp(tiledPos);
    }

    showProp(findTile:cc.Vec2){
        let proptTs = this.getPropByTile(findTile);
        if(proptTs){
            proptTs.isVisible = true;
        }
    }

    
}