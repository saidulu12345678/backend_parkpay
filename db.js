const mongoose = require("mongoose");

const dbConnect = () =>{
    mongoose.connect(`${process.env.Mongodb_url}`)
    .then(()=>{
        console.log("database connected !!");
        
    }).catch((err)=>{
        console.log("database not connected",err);
        
    })
}

module.exports = {dbConnect}
