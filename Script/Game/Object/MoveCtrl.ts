import Emitter from "../Common/Emitter";
import BubbleMgr from "../Module/BubbleMgr";
import ModuleMgr from "../Module/ModuleMgr";
import PlayerMgr from "../Module/PlayerMgr";
import TiledMapCtrl from "../Module/TiledMapCtrl";

export default class MoveCtrl{
    private _target:any = null;
    private _speed:number = 0;

    get speed(){
        return this._speed;
    }
    set speed(speed){
        this._speed = speed;
    }
    private _dir:cc.Vec2 = cc.v2(0,0);
    get dir(){
        return this._dir;
    }
    set dir(dir){
        this._dir = dir;
    } 
    private _isPush:boolean =false;
    private _tiledMapCtrl:TiledMapCtrl = null;
    private _playerMgr:PlayerMgr = null;
    private _bubbleMgr:BubbleMgr = null;
    constructor(target:any){
        this._target = target;
        this._tiledMapCtrl = ModuleMgr.getInstance().getModule('TiledMapCtrl') as TiledMapCtrl;
        this._playerMgr = ModuleMgr.getInstance().getModule('PlayerMgr') as PlayerMgr;
        this._bubbleMgr = ModuleMgr.getInstance().getModule('BubbleMgr') as BubbleMgr;
        Emitter.getInstance().on('pushOver',()=>{
            this._isPush = false;
        })
    }

    onUpdate(dt){
        if(this.onCollision()){
            return;
        }
        this._target.node.x +=this._speed*this._dir.x *dt;
        this._target.node.y +=this._speed*this._dir.y*dt;

        //实时更改目标的zIndex
        let tiledPos = this._tiledMapCtrl.getTiledByPos(this._target.node.position);
        this._target.node.zIndex = tiledPos.y+1;
        this._target.tiledPos = tiledPos;
    }


    onCollision(){
        let playerPos = this._target.node.position;
        let playerTile = this._tiledMapCtrl.getTiledByPos(playerPos);
        //获取玩家移动方向的碰撞点坐标。
        //可以用玩家宽度一半高度一半来计算或者用格子宽高也行（玩家跟格子差不多大）
        let tiledSize =this._tiledMapCtrl.tiledSize;
        let nextPos =playerPos.add(cc.v2(this._dir.x*tiledSize.width/2,this._dir.y*tiledSize.height/2));
        //碰撞点所在的格子坐标
        let nextTile = this._tiledMapCtrl.getTiledByPos(nextPos);
        //如果下一个点出界，那么直接不能动
        if(this._tiledMapCtrl.isOutOfMap(nextTile)){
            return true;
        }
        let property = this._tiledMapCtrl.getPropertyByTiled(nextTile);
        //如果属性不存在，那么可以走。
        if(!property){
            //玩家前面没有泡泡
            let bubbeTs = this._bubbleMgr.getBubbleByTile(nextTile);
            if(bubbeTs){
                if(playerTile.equals(nextTile)){
                    return false;
                }
                //玩家前面有泡泡，不能走。
                return true;
            }

            
            //玩家移动前面如果有道具，那么池到道具。
            Emitter.getInstance().emit('eatProp',nextTile,this._target);
            return false;
        }
        //根据属性处理：碰到不能推得障碍物。
        if(property.colli){
            return true;
        }

        //碰到箱子，可以推动。
        if(property.push){
            // 如果箱子后面有障碍物或者箱子，以后还有玩家，泡泡，都不能退。
            //拿到箱子后面的那个格子。 nextTile：箱子的格子坐标，箱子要停留的坐标，
            let nextBoxTile = nextTile.add(cc.v2(this._dir.x,-this._dir.y));
            //如果箱子后面的坐标出界，那么不能推
            if(this._tiledMapCtrl.isOutOfMap(nextBoxTile)){
                return true;
            }
            //获取箱子后面的的图块属性。
            let nextProperty =this._tiledMapCtrl.getPropertyByTiled(nextBoxTile);
            if(nextProperty&&(nextProperty.colli||nextProperty.push)){
                return true;
            }
            //箱子后面有玩家不能推。
            //通过箱子后面的格子坐标，去获取玩家。
            let playerTs  = this._playerMgr.getPlayerByTiled(nextBoxTile);
            if(playerTs){
                //箱子后面有玩家
                return true;
            }
            //箱子后面有泡泡不能推。
            let bubbeTs = this._bubbleMgr.getBubbleByTile(nextBoxTile);
            if(bubbeTs){
                return true;
            }
            if(this._isPush){
                return false;
            }
            this._isPush = true;
            console.log('推到箱子');

            //推动箱子:箱子坐标就是nextTile
            this._pushBox(nextTile,this._dir);
            //发消息，刷新道具消息，把箱子旧的坐标，新的坐标（推动后——）
            Emitter.getInstance().emit('refreshProp',nextTile,nextBoxTile);
            return true;
           
        }

        return false;
    }
    
    //箱子所在的格子坐标，方向。
    _pushBox(tiledPos:cc.Vec2,dir:cc.Vec2){
        //推两部分，一部分是下半身，上半身
        let layerIndex = tiledPos.y+1;//上半身所在的层跟下半身是一样，同一个层。
        this._tiledMapCtrl.pushBox(tiledPos,dir,layerIndex);
        //上半身坐标
        let upTile = cc.v2(tiledPos.x,tiledPos.y-1);
        this._tiledMapCtrl.pushBox(upTile,dir,layerIndex);

    }
    
}
