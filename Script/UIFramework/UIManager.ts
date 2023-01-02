//统一管理所有的ui（继承于UIBase）  ==》Map容器
//容器：后续UI产生出来之后的挂载（存储节点：UIPage，UIWidget，UIWindow）
//打开UI（ui名字，这个ui要挂到哪层（名字），额外参数?)
//关闭UI（ui名字）
//单例。
const {ccclass, property} = cc._decorator;
import UIBase from "./UIBase";
import { UIPage,UIPath } from "./UIDefine";
@ccclass
export default class UIManager{
    private static _instance:UIManager = null;
    //存储所有的UI根节点（产生出来ui后续要在这个容器去获取对应层进行挂载，遮挡问题
    //比如 正常ui挂到page页面，挂件类ui挂到widget页面，弹窗类挂到window
    private _mapLayerN:Map<string,cc.Node> = new Map();
    //用于存储当前场景所有产生出来的ui，后续可以直接在这里进行打开关闭。
    private _mapUI:Map<string,UIBase> = new Map();
    static getInstance(){
        if(!this._instance){
            this._instance = new UIManager();
            this._instance._init();
        }
        return this._instance;
    }

    _init(){
        //获取所有的页面节点（正常页面，挂件，弹窗） 存储到MapLayer里面。
        //获取UI跟节点。
        let uiRoot  = cc.find('Canvas/UIRoot');
        //如果当前场景没有ui根节点，那么给创建一个出来（UIRoot预制体）
        if(!uiRoot){
            cc.resources.load(UIPath.UIRoot,cc.Prefab,(err,prefab:cc.Prefab)=>{
                if(err){
                    return;
                }
                //完成回调会在场景里面所有脚本start才执行。
                uiRoot = cc.instantiate(prefab);
                uiRoot.parent = cc.find('Canvas');
                this._pushLayer(uiRoot);
            });    
            //上面的回调函数是异步的，会在所有的start执行完（或者说场景执行起来后）   
            return; 
        }

        //如果UIRoot有找到，那么直接查找子节点存储即可。
        this._pushLayer(uiRoot);


    }

    _pushLayer(uiRoot:cc.Node){
        let children:Array<cc.Node> = uiRoot.children;
        let arrUIName =Object.keys(UIPage);
        for(let i = 0;i < arrUIName.length;i++){
            this._mapLayerN.set(arrUIName[i],children[i]);
        }
    }
    //产生对应的ui节点，挂到某个层（这些要不要先获取到） （Page，Widget，Window）
    //打开哪个UI，挂到哪里，额外参数。
    openUI(uiName:string,layerName?:string,params?:any){
        //到mapUi去获取某个UI
        let ui = this._mapUI.get(uiName);
        //ui路径。

        let uiPath = UIPath[uiName];//Login  Prefab/ui/login
        //如果拿到的ui是空，加载ui
        if(!ui){
            cc.resources.load(uiPath,(err,prefab)=>{
                if(err){
                    return;
                }
                //通过拿到的ui预制体产生出UI
                let uiN:any = cc.instantiate(prefab);
                //获取层的名字:如果没有传ui要挂的层的名字，默认为正常页面层。
                layerName =layerName||'Page';
                uiN.parent = this._mapLayerN.get(layerName);
                //通过这个ui节点获取ui
                ui = uiN.getComponent(UIBase);
                //存储起来。
                this._mapUI.set(uiName,ui);
                // if(!ui){
                //     return;
                // }
                ui.uiName = uiName;
                //初始化ui
                ui.init(params);
                //打开ui
                ui.open(params);
            });
            return;
        }
        //如果这个ui已经存在，意味着已经最少打开过一次。
        ui.open(params);
    }

    closeUI(uiName:string,params?:any){
        let ui = this._mapUI.get(uiName);
        if(!ui){
            return;
        }
        ui.close(params);
    }
    

    loadScene(sceneName:string){
        this._mapUI.forEach((value:UIBase,key:string,mapUI:Map<string,UIBase>)=>{
            value.close();
            value.node.destroy();
        });
        UIManager._instance =null;        
        cc.director.loadScene(sceneName);
    }


    //接收消息的ui名
    //消息名：其实就是接收消息的ui里面的函数名。 ==》可以通过消息名字直接到ui里面拿到函数，ui的属性。
    //处理如果ui名字是all，那么所有的ui都接收到。
    sendMsg(uiName:string,msgName:string,...rest:any[]){
        if(uiName.length ===0){
            return;
        }
         //通过ui名获取ui
        let ui = this._mapUI.get(uiName);
        //获取出去ui名跟消息名的参数
        let args = Array.prototype.slice.call(arguments,2);

        let responseMsg = (ui:UIBase)=>{           
            //如果UI不存在，
            if(!ui){
                return;
            }
            //ui存在。
            //通过消息名到ui获取函数
            let cb = ui[msgName];
           
            if(cb){
                //调用这个函数
                //apply  call
                //obj.func
                //func(a,b,c) === obj.func.call(obj,a,b,c) === obj.func.apply(obj,[a,b,c]);
                // call apply度娘区别。
                //原型，原型链，了解
                cb.apply(ui,args);
                return;
            }
            //如果消息名对应的回调不存在，那么回调默认函数。
            ui.handleMsg.apply(ui,args);
        }
        if('all' === uiName){
            this._mapUI.forEach((value:UIBase,key:string,mapUI:Map<string,UIBase>)=>{
                responseMsg(value);
            })     
            return;
        }
        responseMsg(ui);
        
    }
}



//cc.resources.load(路径（以resources为跟目录），类型，进度回调函数（当前数量，总数，items），完成回调函数（err，asset）)