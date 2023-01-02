import UIBase from "./UIBase";
import { BlockInputSize } from "./UIDefine";
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIWindow extends UIBase {
    init(params?:any){
        super.init(params);

        //弹窗类要继承于这个类，这个类在这里统一处理触摸穿透。
        let node = new cc.Node();
        node.parent = this.node;
        node.addComponent(cc.BlockInputEvents);
        node.width = BlockInputSize.Width;
        node.height =BlockInputSize.Height;
        //这个遮挡节点，一般用于上层ui背景，这个节点层级一定要最低。
        node.zIndex = -1000;
    }
    
}
