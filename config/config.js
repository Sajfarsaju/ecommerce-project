const sessionSecret = "mysitesessionsecret";
const mongoose = require('mongoose')
require('dotenv').config()

function mongooseConnection(){
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.mongoosSecret).then(()=>console.log("connected"))
}

module.exports ={
    sessionSecret,
    mongooseConnection
}