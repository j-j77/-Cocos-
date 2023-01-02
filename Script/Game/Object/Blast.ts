

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    private _tiledPos:cc.Vec2 =null;
    get tiledPos(){
        return this._tiledPos;
    }
    set tiledPos(tiledPos){
        this._tiledPos =tiledPos;
    }

    reuse(params?:any){        
        this.scheduleOnce(()=>{
            params.removeBlast(this._tiledPos);
        },0.2);
    }

    unuse(){
        //console.log('节点被回收。');
        //关闭定时器
        this.unscheduleAllCallbacks();
    }
}
