import Emitter from "../Common/Emitter";
import NodePool, { PoolManager } from "../Common/NodePool";
import ModuleBase from "./ModuleBase";
import ModuleMgr from "./ModuleMgr";
import TiledMapCtrl from "./TiledMapCtrl";
import Bubble from '../../Game/Object/Bubble';
import ConfigMgr from "../Common/ConfigMgr";
export default class BubbleMgr extends ModuleBase{   
    private _tiledMapCtrl:TiledMapCtrl = null;
    //存储泡泡脚本
    private _arrBubble:Bubble[] = [];
    //存储所有可炸的格子， 绑定方向跟各自坐标，  数组。
    private _mapBombTile:Map<string,Map<string,cc.Vec2>[]> = new Map();
    private _objDir ={'up':cc.v2(0,-1),'down':cc.v2(0,1),'left':cc.v2(-1,0),'right':cc.v2(1,0)};
    onInit(params?:any){
        new NodePool(10,'Bubble','Bubble');//会去拿到Bubble预支产生出对应的对象池，并且存储到池管理
        new NodePool(10,'BubbleRed','Bubble');
        this._tiledMapCtrl = ModuleMgr.getInstance().getModule('TiledMapCtrl') as TiledMapCtrl;
 
        Emitter.getInstance().on('addBubble',this.addBubble,this);
    } 
    //bubbleName:预支名字。
    addBubble(owner:any){
        if(this.getBubbleByTile(owner.tiledPos)){
            console.log('这个位置有泡泡，不能放');
            return;
        }

        if(owner._playerDt.bubbleNum<=0){
            return;
        }
        owner._playerDt.bubbleNum--;
        //产生泡泡节点。
        let bubblePool = PoolManager.getInstance().getPool(owner.bubbleName);
        //获取泡泡节点
        let bubbleN = bubblePool.getNode(this);//这里的this会被传递到泡泡脚本的reuse参数
        bubbleN.parent = this._tiledMapCtrl.node;
        //转换坐标
        let pos = this._tiledMapCtrl.getPosByTiled(owner.tiledPos);
        bubbleN.setPosition(pos);

        //获取泡泡脚本存储起来。
        let bubbeTs = bubbleN.getComponent(Bubble);
        bubbeTs.tiledPos = owner.tiledPos;
        bubbeTs.power = owner.playerDt.bubblePower;
        bubbeTs.owner = owner;
        bubbeTs.blastName = owner.blastName;
        this._arrBubble.push(bubbeTs);       
    }
    onBomb(tiledPos:cc.Vec2,power:number,blastName:string){
        this._mapBombTile.forEach((value,key,map)=>{
            value.length =0;
        })
        this._mapBombTile.clear();

        this.toBomb(tiledPos,power,blastName);
        //把格子发给水花管理者。
        this.send('BlastMgr','addBlast',this._mapBombTile);
    }
    //爆炸的泡泡的格子坐标，爆炸威力。
    toBomb(tiledPos:cc.Vec2,power:number,blastName:string){
        //console.log('泡泡爆炸');
        //四个方向去查找，根据威力查找，如果找到的是空，那么继续查找，找到的不为空，那么停止查找，找另一个方向。
        this.removeBubbleByTile(tiledPos);
        //up，down..这些字符串也需要用到。
        this._pushTile('center',tiledPos,blastName);
        for(let key in this._objDir){
            this._findTile(tiledPos,key,this._objDir[key],power,blastName);
        }

        // this._mapBombTile.forEach((value,key,map)=>{
        //     for(let tiledPos of value){
        //         let pos = this._tiledMapCtrl.getPosByTiled(tiledPos);
        //         let node = new cc.Node();
        //         node.setPosition(pos);
        //         node.addComponent(cc.Sprite);
        //         let sprite = node.getComponent(cc.Sprite);
        //         let obj ={'center':'blastC_0','up':'blastU_0_0','down':'blastD_0_0','left':'blastL_0_0','right':'blastR_0_0'};
        //         sprite.spriteFrame = ConfigMgr.getInstance().getMgr('SpriteFrameMgr').getRes(obj[key]);
        //         node.parent = this._tiledMapCtrl.node;
        //         cc.tween(node)
        //         .delay(0.2)
        //         .removeSelf()
        //         .start();
        //     }   

        // })
       
    }
    //把当前泡泡能够炸的所有格子跟方向绑定存起来。
    //找一个方向。
    //格子坐标，原点。
    //strDir:存储的时候用
    //dir:用于查找下一个
    //power：要几个。
    _findTile(tiledPos:cc.Vec2,strDir:string,dir:cc.Vec2,power:number,blastName:string){
        
        //这里如果调用，只是一个方向而已。
        for(let i = 1;i <= power;i++){
            //不要直接操作tiledPos
            let tempPos = tiledPos.clone();
            let offsetDir = dir.mul(i);
            //要找的格子tempPos + offsetDir
            let findTile = tempPos.add(offsetDir);
            //如果找到的格子在界外，那么这个方向结束查找，也不存
            if(this._tiledMapCtrl.isOutOfMap(findTile)){
                break;
            }
            //判断这个格子是否有障碍物。
            let property  =this._tiledMapCtrl.getPropertyByTiled(findTile);
            if(!property){
                //当前位置没东西，可炸可贴水花。
                this._pushTile(strDir,findTile,blastName);
                //通过找到格子到泡泡数组获取泡泡
                let bubbleTs = this.getBubbleByTile(findTile);
                if(bubbleTs){
                    //炸到了泡泡。这个泡泡要爆炸
                    this.toBomb(bubbleTs.tiledPos,bubbleTs.power,bubbleTs.blastName);
                }
                this.send('PropMgr','removeProp',findTile);
                //扎到玩家，找到的格子坐标去获取玩家，如果拿到玩家，那么这个玩家改成死亡，逻辑停止按键
                continue;
            }
            //如果有找到障碍物，那么不管什么障碍物查找结束，除了草丛。
            //如果找到的是草丛，那么继续查找，并且要存储
            if(property.visible){
                this._pushTile(strDir,findTile,blastName);
                this._tiledMapCtrl.removeByTile(findTile);
                continue;
            }
            //是否可炸，如果可炸，那么查找结束，要存储。
            if(property.blast){
                this._pushTile(strDir,findTile,blastName);
                //移除障碍物
                this._tiledMapCtrl.removeByTile(findTile);
                this.send('PropMgr','showProp',findTile);
                break;
            }
            //如果不可炸，直接结束，不用存储。
            break;
        }
    }

    //存储找到的格子
    _pushTile(strDir:string,tiledPos:cc.Vec2,blastName:string){
       // Map<string,Map<string,cc.Vec2>[]>
        //strDir一定要是 up,down,left,right,center
        
        if(!this._isContainKey(strDir)){
            return;
        }
        //Map<string,cc.Vec2>[]
        let arrTile = this._mapBombTile.get(strDir);
        if(!arrTile){
            arrTile = [];
            this._mapBombTile.set(strDir,arrTile);            
        }
        let map = new Map();
        map.set(blastName,tiledPos);
        arrTile.push(map);
        
    }

    _isContainKey(keyIn:string){
        let arrDir = ['up','down','left','right','center'];
        for(let key of arrDir){
            if(keyIn === key){
                return true;
            }
        }
        return false;
    }
    //通过格子坐标获取某个泡泡
    getBubbleByTile(tiledPos:cc.Vec2){
        for(let bubble of this._arrBubble){
            if(bubble.tiledPos.equals(tiledPos)){
                return bubble;
            }
        }

        return null;
    }

    removeBubbleByTile(tiledPos:cc.Vec2){
        for(let i = 0;i < this._arrBubble.length;i++){
            let bubbeTs = this._arrBubble[i];
            if(bubbeTs.tiledPos.equals(tiledPos)){
                PoolManager.getInstance().getPool(bubbeTs.node.name).putNode(bubbeTs.node);
                this._arrBubble.splice(i,1);
                break;
            }
        }
    }
}