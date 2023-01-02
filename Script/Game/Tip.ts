import UIWindow from "../UIFramework/UIWindow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Tip extends UIWindow {
    onInit(params?:any){
        this.addClickEvent('_BtnEnter',(button:cc.Button)=>{
            this.closeSelf();
        });
        
        
    } 

    _addKeyBoardEvent(){
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
    }
    
    _removeKeyBoardEvent(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this._onKeyDown,this);
    }

    _onKeyDown(event){
        this.closeSelf();
    }
 
    onExit(params?:any){
        super.onExit(params);
        this._removeKeyBoardEvent();
    }

    onEnter(params?:any){
        super.onEnter(params);
        this.getComp('_LbInfo','Label').string = params;
        this._addKeyBoardEvent();
    }
}
