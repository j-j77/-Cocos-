import ConfigMgr from "./ConfigMgr";

export default class NodePool{
    //当前对象池名字
    private _name:string = '';
    //对象池要放的节点的大小。
    private _size:number = 0;
    //要使用的预制体名字，可以在这里直接找预制体管理者拿预制体。
    private _prefabName:string = '';
    //存储起来。
    private _prefab:cc.Prefab = null;
    //对象池。
    private _pool:cc.NodePool = null;
    private _compName:string ='';
    constructor(size:number,prefabName:string,compName?:string){
        this._name = prefabName;
        this._size = size;
        this._compName = compName;
        this._prefab = ConfigMgr.getInstance().getMgr('PrefabMgr').getRes(prefabName);
        if(!this._prefab){
            return;
        }  
        this._pool = new cc.NodePool(compName);//new 对象池(组件名字或者类型（预制体节点下的组件）)
        for(let i = 0;i < size;i++){
            let node = cc.instantiate(this._prefab);
            this._pool.put(node);
        }

        PoolManager.getInstance().addPool(this._name,this);
    }


    //需要的时候要获取节点。
    getNode(params?:any){
        //判断对象池时候有节点。
        if(this._pool.size()>0){
            return this._pool.get(params);//对象池.get(参数) 这个参数会传递到哪里？会被传递到节点下的脚本的一个叫reuse函数的参数。
            //get拿到节点，这里的参数会被传递到bubble脚本的 参数里面。
            
        }
        console.log('不够用，实例化');
        let node  = cc.instantiate(this._prefab);
        let comp = node.getComponent(this._compName);
        if(comp){
            comp.reuse(params);
        }
        return node;
    }
    //不需要的时候要存节点。
    putNode(node:cc.Node){
        if(this._pool.size()>=this._size){
            let comp = node.getComponent(this._compName);
            if(comp){
                comp.unuse();
            }
            //存放节点的时候如果对象池满了，那么直接销毁节点。
            node.destroy();
            return;
        }
        this._pool.put(node);
    }
    
}


export class PoolManager{
    private _mapPool:Map<string,NodePool> = new Map();
    private static _instance:PoolManager = null;
    static getInstance(){
        if(!this._instance){
            this._instance =new PoolManager();
        }
        return this._instance;
    }
    constructor(){

    }

    addPool(name:string,pool:NodePool){
        if(name.length ===0||!pool){
            return;
        }
        this._mapPool.set(name,pool);
    }
    //池的名字直接用了预制体名字，所以这里的name到时候传预制体名字进来。
    getPool(name:string,size?:any,compName?:string){
        if(name.length===0){
            return null;
        }
        let pool = this._mapPool.get(name);
        if(pool){
            return pool;
        }
        pool = new NodePool(size,name,compName);
        this.addPool(name,pool);
        return pool;
    }
}