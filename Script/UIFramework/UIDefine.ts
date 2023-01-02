interface UIPageType{
    Page:string,
    Widget:string,
    Window:string
}
interface BlockInputSizeType{
    Width:number,
    Height:number
}
interface UIPathType{
    UIRoot:string,
    Menu:string,
    MainUI:string,
    Tip:string,
    Loading:string
}
//防止以后如果UI根改名，直接改这里其他代码不需要改
//因为：openUI(，层名字，)
export let UIPage:UIPageType ={
    Page:'UIPage',
    Widget:'UIWidget',
    Window:'UIWindow'
}

export let UIPath:UIPathType ={
    UIRoot:'Prefab/UI/UIRoot',
    Menu:'Prefab/UI/Menu',
    MainUI:'Prefab/UI/MainUI',
    Tip:'Prefab/UI/Tip',
    Loading:'Prefab/UI/Loading'
}
export let CompType = {
    Label:cc.Label,
    Button:cc.Button,
    EditBox:cc.EditBox,
    ProgressBar:cc.ProgressBar,
    PageView:cc.PageView,
    Sprite:cc.Sprite    
}

export let BlockInputSize:BlockInputSizeType={
    Width:cc.winSize.width,
    Height:cc.winSize.height
}


export let UserData:any ={
    coin:0
}