export default class UIWathcer{
    private _target:any = null;
    private _cb:Function = null;
    private _data:Object =null;
    private _comp:cc.Component = null;
    private _key:string ='';
    private _params?:any = null;
    //到时候在具体的ui里面new出来，ui传过来，函数也传递。
    constructor(data:Object,key:string,target:any,cb:Function,comp?:cc.Component,params?:any){
        this._comp = comp;
        this._target = target;
        this._cb = cb;
        this._data = data;
        this._key = key;
        this._params = params;

        //当监视器在创建的时候，直接到订阅器池去获取订阅器，把创建出来的监视器存储到对应订阅器。
        let dep = UIDepPool.getInstance().getDep(data,key);
        dep.addWatcher(this);
    }

    isEquals(watcher:UIWathcer){
        return this._target === watcher._target&&this._cb === watcher._cb
                &&this._data === watcher._data&&this._key==watcher._key;
    }
    //当订阅器里面的数据修改的时候，watcher要通知具体的ui ,携带数据。
    notify(oldValue:any,newValue:any){
        
        this._cb.call(this._target,oldValue,newValue,this._comp,this._params);
    }

    removeSelf(){
        let dep = UIDepPool.getInstance().getDep(this._data,this._key);
        dep.removeWatcher(this);
    }
}


//订阅器，用于管理一个数据（对象）的一个属性。
//一个订阅器，应该管理了多个监视器。
class UIDep{
    private _data:Object = null;
    private _key:string ='';
    private _arrWatcher:UIWathcer[] = [];
    constructor(data:Object,key:string){
        this._data = data;
        this._key = key;
        //开始监听。
        this._defineProperty();
    }

    //监听数据。
    _defineProperty(){
        let value = this._data[this._key];
        Object.defineProperty(this._data,this._key,{
            get(){
                return value;
            },
            set:(newValue)=>{
                let oldValue = value;
                value = newValue;
                //通知所有的监视器，去告诉他们对应的ui去更新。
                this._notiy(oldValue,newValue);
            }
        });
    }

    _notiy(oldValue,newValue){
        //遍历所有的watcher去通知。
        for(let watcher of this._arrWatcher){
            watcher.notify(oldValue,newValue);
        }
    }

    isContain(data:Object,key:string){
        return this._data ===data&&this._key === key;
    }
    isEquals(depIn:UIDep){
        return this._data === depIn._data&&this._key === depIn._key;
    }
    //订阅器：添加监视器接口
    addWatcher(watcherIn:UIWathcer){
        for(let watcher of this._arrWatcher){
            if(watcher.isEquals(watcherIn)){
                return;
            }
        }
        this._arrWatcher.push(watcherIn);
    }

    removeWatcher(watcherIn:UIWathcer){
        for(let i = 0;i < this._arrWatcher.length;i++){
            if(this._arrWatcher[i].isEquals(watcherIn)){
                // 删除。 从第几个开始，删除介个。
                this._arrWatcher.splice(i,1);
                break;
            }
        }
        //如果当前dep里面的监视器是0个，那么意味着这个dep不需要。
        if(this._arrWatcher.length ===0){
            this.removeSelf();
        }
    }

    removeSelf(){
        UIDepPool.getInstance().removeDep(this);
    }
}
//订阅器池
class UIDepPool{
    private _arrDep:UIDep[] = [];
    private static _instance:UIDepPool = null;
    static getInstance(){
        if(!this._instance){
            this._instance = new UIDepPool();
        }
        return this._instance;
    }
    constructor(){

    }

    removeDep(depIn:UIDep){
        for(let i = 0;i < this._arrDep.length;i++){
            if(this._arrDep[i].isEquals(depIn)){
                this._arrDep.splice(i,1);
                return;
            }
        }
        //如果移除完后，订阅池没有了
        if(this._arrDep.length ===0){
            UIDepPool._instance = null;
        }
    }

    getDep(data:Object,key:string){
        //通过data和key到容器获取dep，
        for(let value of this._arrDep){
            if(value.isContain(data,key)){
                return value;
            }
        }
        //没有在订阅池里面找到对应的数据，创建一个订阅器出来
        let dep = new UIDep(data,key);
        //存储起来。
        this._arrDep.push(dep);
        return dep;
    }
}