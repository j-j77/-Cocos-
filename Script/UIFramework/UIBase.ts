const {ccclass, property} = cc._decorator;
import UIContianer from "./UIContianer";
import UIManager from "./UIManager";
import UIUtils from "./UIUtils";
import UIWathcer from "./UIWatcher";
@ccclass
export default class UIBase extends cc.Component {
    private _uiContainer:UIContianer = new UIContianer();
    private _uiName:string = '';
    //当前UI在切换后如果关闭，是否要销毁，默认是不销毁的。
    protected _isDestroy:boolean = false;
    protected _arrWatcher:UIWathcer[] = [];
    get uiName(){
        return this._uiName;
    }
    set uiName(uiName:string){
        this._uiName = uiName;
    }
    //第一次调用。
    init(params?:any){
        this._uiContainer.findNode(this.node);
        this.onInit(params);
        this.onEnter(params);
    }

    //初始化，给派生重写。
    onInit(params?:any){
       
    }
    //每次进来。
    onEnter(params?:any){

    }
    //每次退出。
    onExit(params?:any){

    }
    //打开
    open(params?:any){
        if(this.node.active){
            return;
        }
        if(!this.node.active){
            this.node.active = true;
        }
        this.onEnter(params);
    }
    //关闭。
    close(params?:any){
        if(!this.node.active){
            return;
        }
        if(this.node.active){
            this.node.active = false;
        }
        this.onExit(params);
        if(this._isDestroy){
            this.node.destroy();
        }
    }


    //本ui页面可以打开其他ui页面。
    openUI(uiName:string,isCloseSelf:boolean = true,layerName?:string,params?:any){
        UIManager.getInstance().openUI(uiName,layerName,params);
        if(isCloseSelf){
            this.closeSelf();
        }
    }

    //关闭某个ui
    closeUI(uiName:string,params?:any){
        UIManager.getInstance().closeUI(uiName);
    }
    //关闭自己。
    closeSelf(){
        this.closeUI(this._uiName);
    }

    loadScene(sceneName:string){
        UIManager.getInstance().loadScene(sceneName);
    }


    getNode(nodeName:string){
        return this._uiContainer.getNode(nodeName);
    }

    getComp(nodeName:string,compTypeName:string){
        return this._uiContainer.getComp(nodeName,compTypeName);
    }
    //某个节点添加事件。
    addEvent(eventName:string,nodeName:string,cb:Function){
        if(eventName.length ===0){
            return ;
        }
        let node = this.getNode(nodeName);
        if(!node){
            return;
        }
        node.on(eventName,cb);
    }

    //点击事件
    addClickEvent(nodeName:string,cb:Function){
        this.addEvent('click',nodeName,cb);
    }

    //默认响应函数，如果派生类在接收到其他ui发过来的消息，找不到对应的函数，那么响应这个默认函数
    //供派生类重写。
    handleMsg(...rest:any[]){
        console.log('基类的handleMsg');
    }

    sendMsg(uiName:string,msgName:string='',...rest:any[]){
        UIManager.getInstance().sendMsg.apply(UIManager.getInstance(),arguments);
    }



    //基类：绑定回调
    bindCb(data:Object,key:string,cb:Function,target?:any,comp?:cc.Component,params?:any){
        target = target||this;
        let watcher = new UIWathcer(data,key,target,cb,comp,params);
        this._arrWatcher.push(watcher);
    }


    bindComp(data:Object,key:string,comp:cc.Component,params?:any,target?:any){
        this.bindCb(data,key,UIUtils.refreshComp,target,comp,params);
    }

    protected onDestroy(): void {
        //遍历watcher，移除掉。
        for(let watcher of this._arrWatcher){
            //把这个watcher从dep移除。
            watcher.removeSelf();
        }
        this._arrWatcher.length = 0;
    }
}
