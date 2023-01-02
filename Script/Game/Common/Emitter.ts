class Listener{
    private _target:any = null;
    get target(){
        return this._target;
    }
    set target(target:any){
        this._target = target;
    }
    private _cb:Function = null;
    get cb(){
        return this._cb;
    }
    set cb(cb:Function){
        this._cb = cb;
    }
    private _name:string = '';
    get name(){
        return this._name; 
    }
    set name(name:string){
        this._name =name;
    }    
    private _isOnce:boolean = false;
    get isOnce(){
        return this._isOnce;
    }
    set isOnce(isOnce:boolean){
        this._isOnce =isOnce;
    }

    isEquals(listenerIn:Listener){
        return this._cb === listenerIn.cb
        &&this._name ===listenerIn.name
        &&this._isOnce ===listenerIn.isOnce
        &&this._target ===listenerIn.target;
    }

    isContain(name:string,cb:Function,target:any,isOnce:boolean){
        return this._cb === cb
        &&this._name ===name
        &&this._isOnce ===isOnce
        &&this._target ===target;
    }

    constructor(name:string,cb:Function,target:any,isOnce:boolean){
        this._name = name;
        this._cb = cb;
        this._target = target;
        this._isOnce = isOnce;
    }
}


export default class Emitter{
    //监听者容器。
    private _mapListener:Map<string,Listener[]> = new Map();
    private static _instance:Emitter = null;
    static getInstance(){
        if(!this._instance){
            this._instance = new Emitter();
        }
        return this._instance;
    }

    once(name:string,cb:Function,target:any){
        this.on(name,cb,target,true);
    }

    //注册。
    on(name:string,cb:Function,target?:any,isOnce:boolean = false){
        if(name.length ===0||!cb){
            return;
        }
        let arrListener = this._mapListener.get(name);
        if(arrListener){
            for(let value of arrListener){
                if(value.isContain(name,cb,target,isOnce)){
                    return;
                }
            }
            arrListener.push(new Listener(name,cb,target,isOnce));
            return;
        }
        //如果到监听容器找不到对应的监听数组，那么创建一个数组出来。
        arrListener = new Array<Listener>();
        //新建一个对应的监听者存储到这个数组。
        arrListener.push(new Listener(name,cb,target,isOnce));
        //容器也要存储
        this._mapListener.set(name,arrListener);
    }

    emit(name:string,...rest:any[]){
        if(name.length ===0){
            return;
        }

        let arrListener = this._mapListener.get(name);
        if(!arrListener){
            return;
        }
        let args = Array.prototype.slice.call(arguments,1);
        //遍历监听数组，每个监听者都触发消息
        for(let i =0;i < arrListener.length;i++){
            let listener = arrListener[i];
            listener.cb.apply(listener.target,args);
            if(listener.isOnce){
                arrListener.splice(i--,1);
            }
        }
        //如果数组是空，那么从容器清除
        if(arrListener.length ===0){
            delete this._mapListener[name];
        }
    }


    off(...rest:any[]){
        //如果没有参数，那么全部清空。
        let args = Array.from(arguments);
        if(args.length ===0){
            this._mapListener.forEach((value,key,map)=>{
                value.length =0;
            })
            this._mapListener.clear();
            return;
        }
        if(args.length ===1){
            let name = args[0];
            let arrListener = this._mapListener.get(name);
            if(!arrListener){
                return;
            }
            arrListener.length =0;
            delete this._mapListener[name];
            return;
        }
        if(args.length ==2){
            let name = args[0];
            let secondArg = args[1];
            let arrListener = this._mapListener.get(name);
            if(!arrListener){
                return;
            }
            for(let i = 0;i < arrListener.length;i++){
                let listener = arrListener[i];
                let compareResult =false;
                if(typeof secondArg ==='function'){
                    compareResult = listener.cb ===secondArg;
                }
                else{
                    compareResult = listener.target === secondArg;
                }

                if(listener.name === name &&compareResult){
                    arrListener.splice(i--,1);
                }
            }
            if(arrListener.length ===0){
                delete this._mapListener[name];
            }
            return;
        }
        if(args.length ===3){
            let name = args[0];
            let cb =(typeof args[1] ==='function')?args[1]:args[2];
            let target =(typeof args[1] ==='function')?args[2]:args[1];
            let arrListener = this._mapListener.get(name);
            if(!arrListener){
                return;
            }
            for(let i = 0;i < arrListener.length;i++){
                let listener =arrListener[i];
                if(listener.isContain(name,cb,target,listener.isOnce)){
                    arrListener.splice(i--,1);
                }
            }
            if(arrListener.length ===0){
                delete this._mapListener[name];
            }
            return;
        }
    }
   
}