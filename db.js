const mongoose = require("mongoose");

const dbConnect = () =>{
    mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/parkpay`)
    .then(()=>{
        console.log("database connected !!");
        
    }).catch((err)=>{
        console.log("database not connected",err);
        
    })
}

module.exports = {dbConnect}
