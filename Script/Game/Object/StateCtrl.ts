import ConfigMgr from "../Common/ConfigMgr";

export default class StateCtrl{
    //玩家脚本
    private _target:any = null;
    //玩家下面的动画组件。
    private _anim:cc.Animation = null;
    //前一个状态
    private _preState:string ='';
    //状态
    private _state:string = '';
    constructor(target:any){
        this._target = target;
        this._anim = target.node.getComponent(cc.Animation);
    }
    //'runDown'
    changeState(state){
        if(this._state === state){
            return;
        }  
        this._state = state;
        this._anim.stop();
        if(state ==='idle'){
            //修改图片为前一个动画的第一帧。
            let preName = this.getAnimationName(this._preState);
            //获取前一个状态下的精灵帧名字
            let spriteFrameName = preName+'_0';
            //获取精灵帧
            let spriteFrame = ConfigMgr.getInstance().getMgr('SpriteFrameMgr').getRes(spriteFrameName);
            //获取玩家的精灵组件
            let spriteCom = this._target.node.getComponent(cc.Sprite);
            //修改玩家精灵组件的精灵帧属性为新的精灵帧 
            spriteCom.spriteFrame = spriteFrame;
            //以上，玩家图片就更改了。
            return;
        }
        //获取动画名字
        let animName = this.getAnimationName(state);
        this._anim.play(animName);
        this._preState = this._state;
    }


    getAnimationName(state){
        let name = state ==='runLeft'?'runRight':state;
        let obj ={'runUp':1,'runDown':1,'runLeft':-1,'runRight':1};
        this._target.node.scaleX = obj[state];
        return name+(this._target.index+1);
    }
}