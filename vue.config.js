
module.exports={
    baseUrl: process.env.NODE_ENV === 'development'?'':'/static',
    indexPath: process.env.NODE_ENV === 'development'?'/':'../server/index.html',
    devServer: {
        port:8080,
        before(app){
        }
    }
}