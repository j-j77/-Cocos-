class EffectBase{
    protected _value:number = 0;
    constructor(value){
        this._value = value;
    }

    playEffect(target:any){

    }
}


class AddBubble extends EffectBase{
    constructor(value){
        super(value);
    }


    playEffect(target:any){
        target.playerDt.bubbleNum+=this._value;
        target.playerDt.bubbleNum = target.playerDt.bubbleNum>=target.playerDt.maxBubbleNum ?target.playerDt.maxBubbleNum:target.playerDt.bubbleNum
    }
}

class AddPower extends EffectBase{
    constructor(value){
        super(value);
    }

    playEffect(target:any){
        if(this._value <0){
            target.playerDt.bubblePower=target.playerDt.maxBubblePower
            return;
        }
        target.playerDt.bubblePower+=this._value;
        target.playerDt.bubblePower = target.playerDt.bubblePower>=target.playerDt.maxBubblePower ?target.playerDt.maxBubblePower:target.playerDt.bubblePower
    }
}


class AddSpeed extends EffectBase{
    constructor(value){
        super(value);
    }

    playEffect(target:any){
        if(this._value <0){
            target.setSpeed(target.playerDt.maxSpeed);
            return;
        }
        let speed = target.getSpeed();
        speed+=this._value;
        speed = speed >=target.playerDt.maxSpeed?target.playerDt.maxSpeed:speed;
        target.setSpeed(speed);
    }
}

class Reverse extends EffectBase{
    constructor(value){
        super(value);
    }
    playEffect(target:any){
        target.onReverse(this._value);
    }
}

let objClass  ={
    '4001':AddBubble,
    '4002':AddPower,
    '4003':AddPower,
    '4004':AddSpeed,
    '4005':AddSpeed,
    '4006':Reverse
}


export default class Effect{
    static getEffect(id:number,value:number){
        let classType = objClass[id];
        let obj = new classType(value);
        return obj;
    }
}