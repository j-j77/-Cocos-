const {ccclass, property} = cc._decorator;
import { CompType } from "./UIDefine";
@ccclass
//容器：关注节点，以及他们下面的组件。
export default class UIContianer{
    private _mapNode:Map<string,cc.Node> = new Map();
    private _mapButton:Map<string,cc.Button> = new Map();
    private _mapEditBox:Map<string,cc.EditBox> = new Map();
    private _mapProgressBar:Map<string,cc.ProgressBar> = new Map();
    private _mapPageView:Map<string,cc.PageView> = new Map();
    private _mapSprite:Map<string,cc.Sprite> = new Map();
    private _mapLabel:Map<string,cc.Label> = new Map();
    //字符串绑定 上面这些容器
    private _objMap:any={
        Label:this._mapLabel,
        Button:this._mapButton,
        EditBox:this._mapEditBox,
        ProgressBar:this._mapProgressBar,
        PageView:this._mapPageView,
        Sprite:this._mapSprite
    }
    
    private arrCompName:string[] = [];
    constructor(){
        // Object.keys拿到某个对象的所有属性，返回一个数组。
        this.arrCompName = Object.keys(CompType);
      
    }

    findNode(node:cc.Node){
        //获取要找的这个节点的名字
        let nodeName:string = node.name;
        //判断这个字符串是否以_开头。
        if(nodeName.startsWith('_')){
            //如果是，意味着这个节点是要关注的节点。
            this._mapNode.set(nodeName,node);
            //这个节点下的组件也要存储。
            //遍历所有组件类型字符串。
            for(let compName of this.arrCompName){
                let comp = node.getComponent(CompType[compName]);//Label==>cc.Label,
                //compName:'Label'  this._obj['Label']:cc.Label
                // getComponet(cc.Label)
                if(!comp){
                    continue;
                }
                //组件存在，开始存储。
                //组件存储名字，节点名字加上组件类型名字                
                this._objMap[compName].set(nodeName+compName,comp);
            }
        }

        //这个节点下的子节点也要查找。
        let children = node.children;
        //遍历这些孩子，分别去查找。
        for(let child of children){
            this.findNode(child);
        }
    }

    //获取节点接口
    getNode(nodeName:string){
        if(nodeName.length ===0){
            return null;
        }
        let node = this._mapNode.get(nodeName);
        return node;
    }
    //获取组件接口
    //参数1：组件所在的节点的名字，参数2组件的类型名
    getComp(nodeName:string,compTypeName:string){
        if(nodeName.length===0||compTypeName.length===0){
            return null;
        }
        let mapComp = this._objMap[compTypeName];
        return mapComp.get(nodeName+compTypeName)
    }
}
