const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors")
const app = express();



app.use(express.json());
app.use(cors())
const { dbConnect } = require("./db.js");

// Define Schema & Model
const loginSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }, // Should be hashed before storing
    email : {type : String , required:true}
});

const loginModel = mongoose.model("login_details", loginSchema);

const parkingSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
  });
  
  const ParkingLocation = mongoose.model("ParkingLocation", parkingSchema);


mongoose.connection.once("open",()=>{
    console.log("connected to database "+mongoose.connection.name);
})
dbConnect();

// Login Route - Find User by Username
app.post('/login', async (req, res) => {
    // console.log(req.body.username);

    if (!req.body.username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        let data = await loginModel.findOne({username:req.body.username,password: req.body.password});
        
        if (!data) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log(data);
        res.json(data);
    } catch (err) {
        console.error("Error in getting data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// register
app.post("/register",async(req,res)=>{
    try{
        let data = await loginModel.create(req.body);
        
        console.log(data);
        res.json(data);
    } 
    catch(err) {
        console.error("Error in getting data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }

})
// parking location
app.post("/parking", async (req, res) => {
    try {
      const { name, latitude, longitude } = req.body;
      const newLocation = new ParkingLocation({ name, latitude, longitude });
      await newLocation.save();
      res.json({ message: "Location added successfully", location: newLocation });
    } catch (error) {
      res.status(500).json({ error: "Failed to add location" });
    }
  });

// Start Server
const port = 3001;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
