import UIBase from "../UIFramework/UIBase";
import ConfigMgr from "./Common/ConfigMgr";
import DataMgr, { LevelDtMgr } from "./Common/DataMgr";

const {ccclass, property} = cc._decorator;

@ccclass 
export default class Menu extends UIBase {
    //地图的索引
    private _mapIndex:number = 0;
    private _arrArrow:cc.Node[] = [];
    private _arrRoleN:cc.Node[] = [];
    //箭头指向的位置。
    private _arrIndex:number[] = [0,3];
    //数组，判定玩家是否锁定
    private _arrSelect:boolean[] = [false,false];
    private _arrKeyCode:any =[
        {
            '65':'left',
            '68':'right',
            '32':'select'
        },
        {
            '37':'left',
            '39':'right',
            '16':'select'
        } 
    ];
    private _dir:any={
        'left':-1,
        'right':1
    }
    onInit(params?:any){
        //如果切换了ui那么这个ui是要销毁的。
        this._isDestroy = true;
        this._addKeyBoardEvent();
        for(let i = 1;i <3;i++){
            this._arrArrow.push(this.getNode('_arrow'+i));
        }

        for(let i = 1;i <= 4;i++){
            this._arrRoleN.push(this.getNode('_P'+i));
        }

        this.addEvent('scroll-ended','_SelectView',(pageVeiwCom)=>{
            this._mapIndex = pageVeiwCom.getCurrentPageIndex();
        });

        this.addClickEvent('_BtnStart',(button)=>{
            // for(let i = 0;i < this._arrSelect.length;i++){
            //     if(!this._arrSelect[i]){
            //         let str = i ===0?'一':'二';
            //         this.openUI('Tip',false,'Window','玩家'+str+'未锁定，不能开始');
            //         return;
            //     }
            // }
            this.openUI('MainUI');
            console.log(this._mapIndex);
            console.log(this._arrIndex);

            //设置当前关卡数据索引
            let levelDtMgr = DataMgr.getInstance().getMgr('LevelDt') as LevelDtMgr;
            levelDtMgr.curIndex = this._mapIndex;
            levelDtMgr.arrIndex = this._arrIndex;

            let gameN:any  = cc.instantiate(ConfigMgr.getInstance().getMgr('PrefabMgr').getRes('Game'));
            gameN.parent = cc.director.getScene();
            gameN.zIndex = -1;

            
        });
    }

    _addKeyBoardEvent(){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this._onKeyUp,this);
    }
    
    _removeKeyBoardEvent(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this._onKeyUp,this);
    }
    //a:65  d 68  空格32
    //left：37  right：39  右边shift  16
    _onKeyDown(event){
        for(let i = 0;i < 2;i++){
            let state = this._arrKeyCode[i][event.keyCode];
            if(!state){
                continue;
            }
            if(this._arrSelect[i]){
                let str = i ===0?'一':'二';
                this.openUI('Tip',false,'Window','玩家'+str+'已锁定，不能操作');
                return;
            }
            if(state ==='select'){
                this._arrSelect[i] = true;
                let str = i ===0?'一':'二';
                this.openUI('Tip',false,'Window','玩家'+str+'锁定');
                return;
            }
            // 修改箭头指向。
            let offsetIndex = this._dir[state];//left：-1， right1
            //当前箭头指向的位置对应角色数组的索引,把当前箭头指向的索引改成按键的后下一个角色对应的索引位置。
            this._arrIndex[i] += offsetIndex;
            if(this._arrIndex[i] <0){
                this._arrIndex[i] = 3;
            }
            if(this._arrIndex[i] > 3){
                this._arrIndex[i] = 0;
            }    
        }
        //index可以拿到箭头下一个要指向的角色的节点。
        //修改箭头位置。            
        this._arrArrow[0].x = this._arrRoleN[this._arrIndex[0]].x;  
        this._arrArrow[1].x= this._arrRoleN[this._arrIndex[1]].x;  
        if(this._arrArrow[0].x === this._arrArrow[1].x){
            this._arrArrow[0].x -=10;
            this._arrArrow[1].x +=10;
        }   
    }

    _onKeyUp(event){

    }

    onDestroy(){
        console.log('菜单销毁');
        super.onDestroy();
        this._removeKeyBoardEvent();
    }
   
}
