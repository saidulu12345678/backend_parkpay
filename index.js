// const express = require("express");
// const mongoose = require("mongoose");
// require("dotenv").config();
// const cors = require("cors")
// const app = express();



// app.use(express.json());
// app.use(cors())
// const { dbConnect } = require("./db.js");

// // Define Schema & Model
// const loginSchema = new mongoose.Schema({
//     username: { type: String, required: true },
//     password: { type: String, required: true }, // Should be hashed before storing
//     email : {type : String , required:true}
// });

// const loginModel = mongoose.model("login_details", loginSchema);

// const parkingSchema = new mongoose.Schema({
//     name: String,
//     latitude: Number,
//     longitude: Number,
//   });
  
//   const ParkingLocation = mongoose.model("ParkingLocation", parkingSchema);


// mongoose.connection.once("open",()=>{
//     console.log("connected to database "+mongoose.connection.name);
// })
// dbConnect();

// // Login Route - Find User by Username
// app.post('/login', async (req, res) => {
//     // console.log(req.body.username);

//     if (!req.body.username) {
//         return res.status(400).json({ error: "Username is required" });
//     }

//     try {
//         let data = await loginModel.find({});
//         console.log(data)
        
//         if (!data) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         console.log(data);
//         res.json(data);
//     } catch (err) {
//         console.error("Error in getting data:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // --------------------------------------------------------------
// // app.post("/login", async (req, res) => {
// //   const { username, password } = req.body;

// //   // 🔹 Check Admin Login First
// //   if (username === "Saidulu" && password === "Saigoud@7780") {
// //       return res.json({ success: true, role: "admin" });
// //   }

// //   // 🔹 Otherwise, Check Database for Normal Users
// //   try {
// //       const user = await loginModel.findOne({ username, password });

// //       if (!user) {
// //           return res.status(404).json({ success: false, error: "Invalid credentials" });
// //       }

// //       res.json({ success: true, role: "user" });
// //   } catch (err) {
// //       console.error("Error in getting data:", err);
// //       res.status(500).json({ success: false, error: "Internal Server Error" });
// //   }
// // });

// // --------------------------------------------------------------------

// // register
// app.post("/register",async(req,res)=>{
//     try{
//         let data = await loginModel.create(req.body);
        
//         console.log(data);
//         res.json(data);
//     } 
//     catch(err) {
//         console.error("Error in getting data:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }

// })
// // 🟢 Add a new parking location
// app.post("/parking", async (req, res) => {
//     try {
//       const { name, latitude, longitude } = req.body;
  
//       if (!name || !latitude || !longitude) {
//         return res.status(400).json({ error: "All fields are required" });
//       }
  
//       const newLocation = new ParkingLocation({ name, latitude, longitude });
//       await newLocation.save();
      
//       res.json({ message: "Location added successfully", location: newLocation });
//     } catch (error) {
//       console.error("Error adding parking location:", error);
//       res.status(500).json({ error: "Failed to add location" });
//     }
//   });
  
//   // 🟢 Get all parking locations
//   app.get("/parking", async (req, res) => {
//     try {
//       const locations = await ParkingLocation.find();
//       res.json(locations);
//     } catch (error) {
//       console.error("Error fetching parking locations:", error);
//       res.status(500).json({ error: "Failed to fetch parking locations" });
//     }
//   });

// // Start Server
// const port = 3001;
// app.listen(port, () => {
//     console.log(`Server started at http://localhost:${port}`);
// });



// ----------------------------------------

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Hashing library
const cors = require("cors");
require("dotenv").config();
const { dbConnect } = require("./db.js");

const app = express();
app.use(express.json());
app.use(cors());

dbConnect(); // ✅ Ensure DB is connected before defining schemas

// 🔹 User Schema
const loginSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    email: { type: String, required: true, unique: true },
});
const loginModel = mongoose.model("login_details", loginSchema);

// 🔹 Parking Location Schema
const parkingSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
});
const ParkingLocation = mongoose.model("ParkingLocation", parkingSchema);


const bookingSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    dateTime: { type: String, required: true },
    vehicleType: { type: String, required: true },
    perHourPrice: { type: Number, required: true },
    duration: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  });
const Booking = mongoose.model("Booking", bookingSchema);








mongoose.connection.once("open", () => {
    console.log("Connected to database: " + mongoose.connection.name);
});

// ✅ Register User (With Password Hashing)
// const bcrypt = require("bcrypt");

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

// ✅ Login Route (With Password Verification)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // ✅ Validate input
  if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
  }

  try {
      // ✅ Find user by username
      const user = await loginModel.findOne({ username ,password});

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // ✅ Check if password matches (plain text comparison for now)
      if (user.password !== password) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json( {success: true});
  } catch (err) {
      console.error("Error in login:", err);
      res.status(500).json({ error: "Internal Server Error" });
  }
});




// ✅ Add a new parking location
app.post("/parking", async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        if (!name || !latitude || !longitude) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newLocation = new ParkingLocation({ name, latitude, longitude });
        await newLocation.save();

        res.json({ message: "Location added successfully", location: newLocation });
    } catch (error) {
        console.error("Error adding parking location:", error);
        res.status(500).json({ error: "Failed to add location" });
    }
});

// ✅ Get all parking locations
app.get("/parking", async (req, res) => {
    try {
        const locations = await ParkingLocation.find();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching parking locations:", error);
        res.status(500).json({ error: "Failed to fetch parking locations" });
    }
});
app.post("/bookings", async (req, res) => {
    try {
      const newBooking = new Booking(req.body);
      await newBooking.save();
      res.status(201).json({ success: true, message: "Booking stored successfully!", booking: newBooking });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error storing booking", error: error.message });
    }
  });
  
  // Route to get all bookings
  app.get("/bookings", async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
  });
  app.get("/email", async (req, res) => {
    try {
      const user = await loginModel.find        ();
      res.send(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
  });



// ✅ Start Server
const port = 3001;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});

