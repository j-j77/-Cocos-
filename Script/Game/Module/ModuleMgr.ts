import ModuleBase from "./ModuleBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ModuleMgr{
    private static _instance:ModuleMgr = null;
    private _mapModule:Map<string,ModuleBase>= new Map();
    static getInstance(){
        if(!this._instance){
            this._instance = new ModuleMgr();
        }
        return this._instance;
    }

    addModule(name:string,moduleIn:ModuleBase){
        if(name.length ===0||!moduleIn){
            return;
        }
        this._mapModule.set(name,moduleIn);
    }
 
    getModule(name:string){
        if(name.length ===0){
            return null;
        }
        return this._mapModule.get(name);
    }
 

    //统一处理它里面所管理的各个模块的生命周期调用。
    onInitModule(params?:any){
        this._mapModule.forEach((value,key,mapModule)=>{
            value.onInit(params);
        })
    }
    onLateInitModule(params?:any){
        this._mapModule.forEach((value,key,mapModule)=>{
            value.onLateInit(params);
        })
    }
    onUpdateModule(dt){
        this._mapModule.forEach((value,key,mapModule)=>{
            value.onUpdate(dt);
        })
    }
    onLateUpdateModule(dt){
        this._mapModule.forEach((value,key,mapModule)=>{
            value.onLateUpdate(dt);
        })
    }
    //模块名字， 模块里面的回调函数的名字。
    send(moduleName:string,msgName:string,...rest:any[]){
        if(moduleName.length ===0){
            return;
        }
         //通过模块名字名获取模块
        let module = this._mapModule.get(moduleName);
        //获取除去模块名跟消息名的参数，携带的数据。
        let args = Array.prototype.slice.call(arguments,2);

        let responseMsg = (module:ModuleBase)=>{           
            //如果module不存在，
            if(!module){
                return;
            }
            //模块存在。
            //通过消息名到模块获取函数
            let cb = module[msgName];
           
            if(cb){
                //调用这个函数
                //apply  call
                //obj.func
                //func(a,b,c) === obj.func.call(obj,a,b,c) === obj.func.apply(obj,[a,b,c]);
                // call apply度娘区别。
                //原型，原型链，了解
                cb.apply(module,args);
                return;
            }
            //如果消息名对应的回调不存在，那么回调默认函数。
            module.handleMsg.apply(module,args);
        }
        
        responseMsg(module);
        
        if('all' === moduleName){
            this._mapModule.forEach((value:ModuleBase,key:string,mapUI:Map<string,ModuleBase>)=>{
                responseMsg(value);
            })     
            return;
        }
        
        
    }
}
