import ConfigMgr from "../Common/ConfigMgr";
import DataMgr, { LevelDtMgr } from "../Common/DataMgr";
import Emitter from "../Common/Emitter";
import ModuleBase from "./ModuleBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TiledMapCtrl extends ModuleBase{
    private _tiledMap:cc.TiledMap = null;
    private _tiledSize:cc.Size = null;
    get tiledSize(){
        return this._tiledSize;
    }
    set tiledSize(tiledSize){
        this._tiledSize = tiledSize;
    }
    private _mapSize:cc.Size =null;
    onInit(params?:any) {
        //获取关卡数据
        let levelDtMgr = DataMgr.getInstance().getMgr('LevelDt') as LevelDtMgr;
        let levelDt = levelDtMgr.getCurLevelDt();
        //地图名字
        let mapName = levelDt.mapName;
        //地图资源
        let tmxAsset = ConfigMgr.getInstance().getMgr('MapMgr').getRes(mapName);
        //修改格子地图组件的地图资源。
  
        //获取格子地图组件
        this._tiledMap = this.node.getComponent(cc.TiledMap);
        //修改格子地图组件的地图资源。
        this._tiledMap.tmxAsset = tmxAsset;

        this._tiledSize = this._tiledMap.getTileSize();
        this._mapSize = this._tiledMap.getMapSize();


        //设置地图层的zIndex
        let arrLayers = this._tiledMap.getLayers();//TMXLayer组件数组。zIndex  node属性。
        for(let i = 0;i <arrLayers.length;i++){
            arrLayers[i].node.zIndex = i;
        }
    }

    getTiledByPos(pos:cc.Vec2){
        let tiledX = Math.floor(pos.x/this._tiledSize.width);
        let tiledY = this._mapSize.height - Math.floor(pos.y/this._tiledSize.height)-1;
        return cc.v2(tiledX,tiledY);
    }
    getPosByTiled(tiledPos:cc.Vec2){
        let x = tiledPos.x*this._tiledSize.width + this._tiledSize.width/2;
        let y = (this._mapSize.height-1-tiledPos.y)*this._tiledSize.height + this._tiledSize.height/2;
        return cc.v2(x,y);
    }

    getBirthPos(){
        let arrPos:cc.Vec2[] =[];
        //获取对象。
        let objGroup = this._tiledMap.getObjectGroup('initPos');
        //获取对象数组。
        let arrObj = objGroup.getObjects();
        for(let obj of arrObj){
            let x = obj['x'];
            let y  = obj['y'];
            let tiledPos =this.getTiledByPos(cc.v2(x,y));
            let centerPos = this.getPosByTiled(tiledPos);
            arrPos.push(centerPos);
        }
        return arrPos;
    }

    //通过获取格子坐标所在层，在通过层和格子坐标获取这个地方所使用的图块的属性。
    getPropertyByTiled(tiledPos:cc.Vec2){
        //通过格子坐标获取层的名字
        let layerName = 'obstacle'+ (tiledPos.y+1);
        //再获取层
        let tiledLayer = this._tiledMap.getLayer(layerName);
        //获取gid
        let gid = tiledLayer.getTileGIDAt(tiledPos);
        //gid拿到，可以通过格子地图获取属性。
        let property = this._tiledMap.getPropertiesForGID(gid);
        return property;
    }

    isOutOfMap(tiledPos:cc.Vec2){
        return tiledPos.x <0||tiledPos.y <0||tiledPos.x >=this._mapSize.width||tiledPos.y >=this._mapSize.height;
    }
    //推箱子逻辑。
    pushBox(tiledPos:cc.Vec2,dir:cc.Vec2,layerIndex:number){
        
        //获取层的名字
        let layerName = 'obstacle'+layerIndex;
        //获取层
        let layer = this._tiledMap.getLayer(layerName);
        //tiledTile组件。
        let tiledTile = layer.getTiledTileAt(tiledPos.x,tiledPos.y,true);
        //计算移动偏移值
        let offset = cc.v2(dir.x*this._tiledSize.width,dir.y*this._tiledSize.height);
        //计算箱子停留位置。
        let endTile = tiledPos.add(cc.v2(dir.x,-dir.y));
        //箱子停留的层。
        let endLayer = this._tiledMap.getLayer('obstacle'+(layerIndex-dir.y)); 
        //获取GID。
        let gid = layer.getTileGIDAt(tiledPos);

        //tiledTile.node.setPosition(this.getPosByTiled(endTile));
        
            
        if(tiledPos.y+1 === layerIndex){
            Emitter.getInstance().emit('removeProp',endTile);
            Emitter.getInstance().emit('pushOver');                
        }    
        
        if(!this.isOutOfMap(endTile)){
            //设置箱子移动的后面的那个坐标为新的箱子位置。
            endLayer.setTileGIDAt(gid,endTile.x,endTile.y);
            
        }
        //原来位置清楚。
        layer.setTileGIDAt(0,tiledPos.x,tiledPos.y);
            
        

        
    }


    removeByTile(tiledPos:cc.Vec2){
        //通过格子坐标获取层的名字
        let layerName = 'obstacle'+ (tiledPos.y+1);
        //再获取层
        let tiledLayer = this._tiledMap.getLayer(layerName);
        tiledLayer.setTileGIDAt(0,tiledPos.x,tiledPos.y);
        let upTile = tiledPos.add(cc.v2(0,-1));
        if(this.isOutOfMap(upTile)){
            return;
        }
        tiledLayer.setTileGIDAt(0,upTile.x,upTile.y);
    }

    //获取所有可炸的格子坐标数组
    getAllBlastTile(){
        let arrTile:cc.Vec2[] = [];
        for(let i = 0;i < this._mapSize.width;i++){
            for(let j = 0;j < this._mapSize.height;j++){
                //拿到所有的格子坐标。
                let tile = cc.v2(i,j);
                //获取每个格子坐标上所使用的图块的属性。
                let property = this.getPropertyByTiled(tile);
                //判断属性的blast
                if(property&&property.blast&&!property.visible){
                    arrTile.push(tile);
                }                
            }
        }
        return arrTile;
    }

}
