export default class  Utils{
    static deepClone(obj){
        let results = Array.isArray(obj)?[]:{};
        for(let key in obj){
            if(obj[key] instanceof Object){
                results[key] = Utils.deepClone(obj[key]);
                continue;
            }
            results[key] = obj[key];
        }
        return results;
    }
};  