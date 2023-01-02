import ModuleMgr from "./Module/ModuleMgr";
import TiledMapCtrl from "./Module/TiledMapCtrl";
import PlayerMgr from "./Module/PlayerMgr";
import BubbleMgr from "./Module/BubbleMgr";
import BlastMgr from "./Module/BlastMgr";
import PropMgr from "./Module/PropMgr";
//总控制脚本，用于控制底下所有模块的声明周期函数。
const {ccclass, property} = cc._decorator;
 
@ccclass
export default class Game extends cc.Component {
    @property(TiledMapCtrl)
    tiledMapCtrl:TiledMapCtrl = null;
    protected onLoad(): void {
        //注册各个模块。
        this._registerModule();
        //调用各个模块的onInit
        ModuleMgr.getInstance().onInitModule();
    }
    protected start(): void {
        ModuleMgr.getInstance().onLateInitModule();
    }
    protected update(dt: number): void {
        ModuleMgr.getInstance().onUpdateModule(dt);
    }
    protected lateUpdate(dt: number): void {
        ModuleMgr.getInstance().onLateUpdateModule(dt);
    }
 
    _registerModule(){
        ModuleMgr.getInstance().addModule('TiledMapCtrl',this.tiledMapCtrl);
        ModuleMgr.getInstance().addModule('PlayerMgr',new PlayerMgr());
        ModuleMgr.getInstance().addModule('BubbleMgr',new BubbleMgr());
        ModuleMgr.getInstance().addModule('BlastMgr',new BlastMgr());
        ModuleMgr.getInstance().addModule('PropMgr',new PropMgr());
    }
}
