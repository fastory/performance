let redis = require("redis");
const RedisOptions = {
    host: '127.0.0.1',
    port: "6379",
    ttl:1000*60*2
};//redis配置文件
const client = redis.createClient(RedisOptions);
client.on("error",function(err){
    console.log(err);

});
redis = {};
 redis.set =function(key,value){
    value = JSON.stringify(value);
    return client.set(key,value,function(err){
        console.log("err- key-"+key+" value-"+value+"",err);
    });
};
let text = async(key)=>{
    let doc = await new Promise((resolve)=>{
        client.get(key,function(err,res){
            return resolve(res);
        });
    });
    doc = JSON.parse(doc);
    return doc;
}

redis.get = async(key)=>{
    const ret  = await text(key);
    return ret;
}
module.exports = redis;
