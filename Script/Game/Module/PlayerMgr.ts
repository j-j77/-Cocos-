import ConfigMgr from "../Common/ConfigMgr";
import DataMgr, { KeyCodeDtMgr, LevelDtMgr, PlayerDtMgr } from "../Common/DataMgr";
import ModuleBase from "./ModuleBase";
import ModuleMgr from "./ModuleMgr";
import TiledMapCtrl from "./TiledMapCtrl";
import Player from "../Object/Player";
import Emitter from "../Common/Emitter";
export default class PlayerMgr extends ModuleBase{
    private _arrIndex:number[] = [];
    private _arrPlayerTs:Player[] = [];
    constructor(){
        super();
    }
  
    onInit(params?:any){
        let levelDtMgr = DataMgr.getInstance().getMgr('LevelDt') as LevelDtMgr;
        this._arrIndex =levelDtMgr.arrIndex;
        //玩家节点要挂到地图上。
        let tiledMapCtrl = ModuleMgr.getInstance().getModule('TiledMapCtrl') as TiledMapCtrl;
        let arrPos = tiledMapCtrl.getBirthPos();
        for(let i=0;i < this._arrIndex.length;i++){
            let index =this._arrIndex[i];
            let playerPrefab = ConfigMgr.getInstance().getMgr('PrefabMgr').getRes('Role'+(index+1));
            let playerN = cc.instantiate(playerPrefab);
            playerN.parent = tiledMapCtrl.node;   
            let randomIndex = Math.floor(Math.random()*arrPos.length);//0 1 2 3 4 5 6 7
            //0 1 2 3 4 5 6 7   随机到第一个点，下一次随机，只要把上一次的1排除使用之后。
            playerN.position = arrPos[randomIndex];
            //重叠问题。
            arrPos.splice(randomIndex,1);

            //获取玩家脚本
            let playerTs = playerN.getComponent(Player);
            this._arrPlayerTs.push(playerTs);
            //获取玩家键盘数据。
            let keyCodeDtMgr= DataMgr.getInstance().getMgr('KeyCodeDt') as KeyCodeDtMgr;
            let playerDtMgr = DataMgr.getInstance().getMgr('PlayerDt') as PlayerDtMgr;
            let playerDt = playerDtMgr.getDataByID(3001+index);
            // index: 0 1   2 3
            //第0个玩家 2001， 第一个玩家2002  
            let keyCodeDt = keyCodeDtMgr.getDataByID(2001+i);
            playerTs.onInit({keyCodeDt:keyCodeDt,index:index,playerDt:playerDt});
            //这里处理两个玩家不同泡泡，不同水花，当然如果做好应该是做选择泡泡UI，在玩家脚本注释那边写了。
            playerTs.blastName = i ===0?'Blast':'BlastRed';
            playerTs.bubbleName = i===0? 'Bubble':'BubbleRed';
        }

        this._addKeyBoardEvent();

        //测试，addBubble消息，这里也会调用回调
        Emitter.getInstance().on('addBubble',()=>{
            console.log('测试一个消息，多个地方可以同时触发');
        })
    }

    _addKeyBoardEvent(){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this._onKeyUp,this);
    }
    
    _removeKeyBoardEvent(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this._onKeyUp,this);
    }

    _onKeyDown(event){
        for(let value of this._arrPlayerTs){
            value.onKeyDown(event);
        }
    }

    _onKeyUp(event){
        for(let value of this._arrPlayerTs){
            value.onKeyUp(event);
        }
    }

    onUpdate(dt: any): void {
        for(let value of this._arrPlayerTs){
            value.onUpdate(dt);
        }
    }

    //通过格子坐标获取某个玩家。
    getPlayerByTiled(tiledPos:cc.Vec2){
        for(let value of this._arrPlayerTs){
            if(value.tiledPos.equals(tiledPos)){
                return value;
            }
        }
        return null;
    }

}


//可以创建出玩家管理者节点，玩家管理者脚本是组件，挂到节点上。
//创建一个类：玩家管理者，主要作用，只负责创建玩家，并没有参与到游戏渲染显示。