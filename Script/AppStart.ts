import UIManager from "./UIFramework/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    protected onLoad(): void {
        UIManager.getInstance().openUI('Loading','Page','Prefab/UI/Loading');
    }
}
  