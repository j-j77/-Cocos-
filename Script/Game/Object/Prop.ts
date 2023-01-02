// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Utils from "../Common/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Prop extends cc.Component {
    private _tiledPos:cc.Vec2 = null;
    get tiledPos(){
        return this._tiledPos;
    }
    set tiledPos(tiledPos){
        this._tiledPos = tiledPos;
    }
    private _propDt:any = null;
    get propDt(){
        return this._propDt;
    } 
    set propDt(propDt){
        this._propDt = propDt;
    } 
    private _isVisible = false;
    get isVisible(){
        return this._isVisible;
    }
    set isVisible(isVisible){
        this._isVisible = isVisible;
    }

    onInit(params?:any){
       
        this._propDt = Utils.deepClone(params.propDt);
    }
    reuse(params?:any){
        this._isVisible = false;
        this.move();
    }
    unuse(){
        
    }

    move(){
        this.node.stopAllActions();
        let tw = cc.tween()
        .by(0.4,{position:cc.v3(0,10,0)})
        .by(0.4,{position:cc.v3(0,-10,0)});

        cc.tween(this.node)
        .repeatForever(tw)
        .start();
    }
}
