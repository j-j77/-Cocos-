const {ccclass, property} = cc._decorator;

import {CompType} from './UIDefine';

let onRefreshLabel = (oldValue,newValue,comp,params?:any)=>{
    let strInfo:string = newValue;
    if(params){
        strInfo = params+newValue;
    }
    comp.string=strInfo;
}

let onRefreshProgress =(oldValue,newValue,comp,params?:any)=>{
    comp.progress = newValue;
}

let objFunc:any ={
    'Label':onRefreshLabel,
    'Progress':onRefreshProgress
}

@ccclass
export default class UIUtils{
    static refreshComp(oldValue,newValue,comp:cc.Component,params?:any){
        // if(comp instanceof cc.Label){
        //     comp.string = '金币:'+newValue;
        // }
        // else if(comp instanceof cc.ProgressBar){
        //     (comp as cc.ProgressBar).progress = 0.45;
        // }
        for(let key of Object.keys(CompType)){
            if(comp instanceof CompType[key]){
                objFunc[key](oldValue,newValue,comp,params);
            }
        }
    }
}
