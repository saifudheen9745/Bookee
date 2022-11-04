const mongoClient = require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect = (done)=>{
    const url ='mongodb+srv://saifudheen:saifu123@cluster0.ddiqrrn.mongodb.net/test'
    const dbname = 'Shoppee'
    
    mongoClient.connect(url,(err,data)=>{
        if (err) {
            return done(err)
        }
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = ()=>{
    return state.db
}