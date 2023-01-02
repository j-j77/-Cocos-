
const {ccclass, property} = cc._decorator;

@ccclass
export default class Bubble extends cc.Component {
    private _tiledPos:cc.Vec2 =null;
    get tiledPos(){
        return this._tiledPos;
    }
    set tiledPos(tiledPos){
        this._tiledPos =tiledPos;
    }
    private _power:number = 0;
    get power(){
        return this._power;
    }
    set power(power){
        this._power = power;
    }
    private _blastName:string ='';
    get blastName(){
        return this._blastName;
    }
    set blastName(blastName:string){
        this._blastName =blastName;
    }

    private _owner:any = null;
    get owner(){
        return this._owner;
    }
    set owner(owner:any){
        this._owner = owner;
    }
    reuse(arg:any){
        //console.log('节点被从对象池拿出来',arg);
        //定时器，泡泡爆炸
        this.scheduleOnce(()=>{
            arg.onBomb(this._tiledPos,this._power,this._blastName);
        },2.0);
    }

    unuse(){
        if(this._owner){
            this._owner.playerDt.bubbleNum++;
        }
        
        //console.log('节点被回收。');
        //关闭定时器
        this.unscheduleAllCallbacks();
    }
}
