import ModuleMgr from "./ModuleMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ModuleBase extends cc.Component {

    //有生命周期函数，让派生类重写。
    onInit(params?:any){

    }
    onLateInit(params?:any){

    }
    onUpdate(dt){

    }
    onLateUpdate(dt){
        
    }
  
    send(moduleName:string,msgName:string,...rest:any[]){
        ModuleMgr.getInstance().send.apply(ModuleMgr.getInstance(),arguments);
    }

    handleMsg(...rest:any[]){

    }
}
