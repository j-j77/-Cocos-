import Emitter from "../Common/Emitter";
import Utils from "../Common/Utils";
import MoveCtrl from "./MoveCtrl";
import StateCtrl from "./StateCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    private _arrDir:any = null;
    // 移动控制器。
    private _moveCtrl:MoveCtrl = null;
    private _stateCtrl:StateCtrl =null;   
    
    private _playerDt:any = null;
    get playerDt(){
        return this._playerDt;
    }
    set playerDt(playerDt:any){        
        this._playerDt = playerDt;        
    }

    private _index :number = 0;
    get index(){
        return this._index;
    }
    set index(index:number){
        this._index = index;
    }
    private _tiledPos:cc.Vec2 = null;
    get tiledPos(){
        return this._tiledPos;
    }
    set tiledPos(tiledPos){
        this._tiledPos = tiledPos;
    }
    private _objDir:any ={
        'runUp':cc.v2(0,1),'runDown':cc.v2(0,-1),'runLeft':cc.v2(-1,0),'runRight':cc.v2(1,0)
    }

    //用于处理不同泡泡，不同水花。
    //做一个UI，可以选择不同泡泡，角色选择泡泡之后，根据选中的泡泡给这两个字符串赋值。
    private _bubbleName:string ='';
    get bubbleName(){
        return this._bubbleName;
    }
    set bubbleName(bubbleName){
        this._bubbleName = bubbleName;
    }
    private _blastName:string ='';
    get blastName(){
        return this._blastName;
    }
    set blastName(blastName){
        this._blastName = blastName;
    }
    private _keyCodeDt:any = null;
    onInit(params?:any){
        
        //console.log(this._arrDir);
        this._addController();
        this._iniData(params);
    }

    _iniData(params?:any){
        this._keyCodeDt = Utils.deepClone(params.keyCodeDt);
        this._arrDir =Utils.deepClone(params.keyCodeDt.dir);
        
        // "id":3002,
        // "bubbleNum":2,
        // "bubblePower":1,
        // "maxBubbleNum":7,
        // "maxBubblePower":9,
        // "speed":70
        this._playerDt = Utils.deepClone(params.playerDt);
        this._index = params.index;
        this._moveCtrl.speed = this._playerDt.speed;
        
    }
    _addController(){
        this._moveCtrl = new MoveCtrl(this);
        this._stateCtrl = new StateCtrl(this);
    }

    onKeyDown(event){
        
        let state = this._arrDir[event.keyCode];
        //排除另一个玩家。
        if(!state){
            return;
        }
        if('addBubble' === state){           
            Emitter.getInstance().emit('addBubble',this);            
            return;
        }
        // state: 'runUp'  runDown   runLeft  runRight
        this._moveCtrl.dir = this._objDir[state];
        //console.log(state);
        this._stateCtrl.changeState(state);
    }

    onKeyUp(event){
        let state = this._arrDir[event.keyCode];
        // //排除另一个玩家。
        if(!state||'addBubble' === state){
            return;
        }
        //玩家放开的时候，停止移动。
        this._moveCtrl.dir = cc.v2(0,0);
        this._stateCtrl.changeState('idle');
    }


    onUpdate(dt){
        this._moveCtrl.onUpdate(dt);
    }

    onReverse(value){
        this._arrDir =Utils.deepClone(this._keyCodeDt.reverseDir);
        this.unscheduleAllCallbacks();
        this.scheduleOnce(()=>{
            this._arrDir =Utils.deepClone(this._keyCodeDt.dir);
        },value);
    }
    getSpeed(){
        return this._moveCtrl.speed;
    }
    setSpeed(speed){
        this._moveCtrl.speed = speed;
    }
    
}
