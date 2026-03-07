// import dotenv from "dotenv";
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stripe = require("stripe");
require("dotenv").config();
const { dbConnect } = require("./db.js");

const app = express();
app.use(express.json());
app.use(cors());
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Connect to Database
dbConnect(); 

mongoose.connection.once("open", () => {
    console.log("Connected to database: " + mongoose.connection.name);
});

// 🔹 User Schema
const loginSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "user" }
});
const loginModel = mongoose.model("login_details", loginSchema);


const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    dateTime: { type: String, required: true },
    vehicleType: { type: String, required: true },
    perHourPrice: { type: Number, required: true },
    duration: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true }, // ⭐ NEW FIELD

  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model("Booking", bookingSchema);

// 🚗 🔹 VEHICLE SERVICE SCHEMA (NEW ADDITION)
const vehicleSchema = new mongoose.Schema({
  type: String,
  image: String,
  minPrice:Number,
  maxPrice:Number
});

const VehicleModel = mongoose.model("Vehicle", vehicleSchema);



const parkingSchema = new mongoose.Schema({
vehicletype:String,
  name: String,
  image: String,
  buildingType: String,
  security: String,
  suitable: String,
  address: String,
  description: String,
  lat: Number,
  lng: Number,
  price: Number,
  totalSlots: Number,
  availableSlots: Number
}, { timestamps: true });

const ParkingLocation = mongoose.model("ParkingLocation", parkingSchema);

// the Payment Schema
const paymentSchema = new mongoose.Schema({
  paymentIntentId: String, // The unique transaction ID from Stripe
  clientSecret: String,    // The unique secret for this specific transaction
  paymentMethodId: String, // ID of the card used
  amount: Number,
  currency: String,
  userId: String,          // The ID of the user who paid
  status: String,          // e.g., 'succeeded'
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model("Payment", paymentSchema);

// Register User


app.post("/register", async (req, res) => {
  try {

    const { username, email, password } = req.body;

    const existingUser = await loginModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let role = "user";

    // 👑 ADMIN CHECK
    if (
      email === "reddymallasaidulu999@gmail.com" &&
      password === "Saigoud@7780"
    ) {
      role = "admin";
    }

    const user = await loginModel.create({
      username,
      email,
      password,
      role
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user
    });

  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ADMIN LOGIN
  if (
    email === "reddymallasaidulu999@gmail.com" &&
    password === "Saigoud@7780"
  ) {
    return res.json({
      success: true,
      user: {
        username: "Admin",
        userId: "admin001",
        role: "admin"
      }
    });
  }

  // NORMAL USER LOGIN
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  if (user.password !== password) {
    return res.json({ success: false, message: "Invalid password" });
  }

  res.json({
    success: true,
    user: {
      username: user.username,
      userId: user._id,
      role: user.role
    }
  });
});

app.get("/email", async (req, res) => {
    try {
        const user = await loginModel.find();
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching emails", error: error.message });
    }
});



// Add Booking
app.post("/bookings", async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json({ success: true, message: "Booking stored successfully!", booking: newBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error storing booking", error: error.message });
    }
});

// Get all bookings
app.get("/bookings", async (req, res) => {
  try {

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await Booking.find({ userId });

    res.json(bookings);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message
    });
  }
});


// ------------------------------------------
// 🚗 VEHICLE SERVICES (NEW CODE ADDED HERE)
// ------------------------------------------

// ✅ ADMIN: Add a new vehicle service
app.post("/add-vehicle", async (req, res) => {
    try {
        const { type, image,minPrice,maxPrice} = req.body;
        
        // Basic Validation
        if (!type || !minPrice ||!maxPrice || !image) {
            return res.status(400).json({ status: "error", message: "Type, Price, and Image are required." });
        }

        const newVehicle = new VehicleModel({ type, image, minPrice,maxPrice});
        await newVehicle.save();
        res.json({ status: "ok", message: "Vehicle added successfully!", data: newVehicle });
    } catch (error) {
        console.error("Error adding vehicle:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
// ✅ ADMIN: Delete a vehicle
app.delete("/delete-vehicle/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await VehicleModel.findByIdAndDelete(id);
        res.json({ status: "ok", message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
// ✅ USER: Get all vehicle services
app.get("/get-vehicles", async (req, res) => {
    try {
        const vehicles = await VehicleModel.find({});
        res.json({ status: "ok", data: vehicles });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
});
// ------------------------------------------
// 📍 PARKING LOCATIONS
// ------------------------------------------

// ✅ Add new parking (Admin)
app.post("/parking", async (req, res) => {
  try {
       if (req.body.vehicletype) {
      req.body.vehicletype = req.body.vehicletype.toLowerCase();
    }

    const newParking = new ParkingLocation(req.body);
    await newParking.save();

    res.status(201).json({
      success: true,
      message: "Parking added successfully",
      data: newParking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
app.get("/all-parkings", async (req, res) => {
  try {
    const parkings = await ParkingLocation.find();
    res.json({ success: true, data: parkings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
const handleDelete = async (id) => {
  await fetch(`http://localhost:3001/parking/${id}`, {
    method: "DELETE",
  });

  fetchParkings(); // refresh list
};                  


// ✅ Get single parking by ID (VERY IMPORTANT)
app.get("/parking", async (req, res) => {
  try {
    const type = req.query.vehicletype?.toLowerCase();
    if (!type) {
      return res.status(400).json({ message: "Vehicle type is required" });
    }
    const parking = await ParkingLocation.find({ vehicletype: type });
    
    if (!parking) {
      return res.status(404).json({ message: "Parking not found" });
    }

    res.json(parking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}); 
// ✅ UPDATE Parking
app.put("/parking/:id", async (req, res) => {
  try {
    const updatedParking = await ParkingLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Parking updated successfully",
      data: updatedParking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ✅ DELETE Parking
app.delete("/parking/:id", async (req, res) => {
  try {
    await ParkingLocation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Parking deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Payment

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert to paise/cents
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    console.log(paymentIntent,"psy")

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



// 2️⃣ API to SAVE Payment Data (Call this from PaymentPage)
app.post("/save-payment", async (req, res) => {
  try {
    const { 
      paymentIntentId, 
      clientSecret, 
      paymentMethodId, 
      amount, 
      currency, 
      userId, 
      status 
    } = req.body;

    const newPayment = new Payment({
      paymentIntentId,
      clientSecret,
      paymentMethodId,
      amount,
      currency,
      userId,
      status
    });

    await newPayment.save();
    res.status(201).json({ message: "Payment details saved successfully" });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({ error: "Failed to save payment details" });
  }
});

// 3️⃣ API to GET All Payments (For Admin Portal)
app.get("/admin/payments", async (req, res) => {
  try {
    // Sort by newest first
    const payments = await Payment.find().sort({ createdAt: -1 }); 
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// ==========================================
// 3. START SERVER
// ==========================================
const port = 3001;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});