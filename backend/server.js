const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const nodemailer = require("nodemailer");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection;
let petsCollection;

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    usersCollection = client.db("usersandpets").collection("users");
    petsCollection = client.db("usersandpets").collection("pets");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run().catch(console.dir);

// app use implementation
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use("/images", express.static(path.join(__dirname, "images")));

// middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("Token is null");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Error during token verification:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// -------------------------- Start Server Side----------------------------
//general api route
app.get("/", (req, res) => {
  res.send("This is pet adoption project server");
});

//Get Users API - protected to admin
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error("Failed to get users", error);
    res.sendStatus(500);
  }
});

//Get User By ID API
app.get("/user/:id", async (req, res) => {
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error("Failed to get user", error);
    res.sendStatus(500);
  }
});

//Update User API
app.put("/user/:id", authenticateToken, async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);

    const existingUser = await usersCollection.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).send("User not found.");
    }

    if (req.user.id !== userId.toString()) {
      return res
        .status(403)
        .send("You do not have permission to update this profile.");
    }

    let updatedUser = { ...existingUser, ...req.body };

    if (req.body.password) {
      const saltRounds = 10;
      updatedUser.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    await usersCollection.updateOne({ _id: userId }, { $set: updatedUser });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update user", error);
    res.sendStatus(500);
  }
});

//post users to sign up, after that new user will be visible into db
app.post("/signup", async (req, res) => {
  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phone,
    bio = "Hello there <3",
    savedPets = [],
    ownedPets = [],
    fosteredPets = [],
    pets = [],
  } = req.body;

  //check if any of the fields are empty, if they are, there is an err
  if (
    !email ||
    !password ||
    !confirmPassword ||
    !firstName ||
    !lastName ||
    !phone
  ) {
    return res.status(400).send("Please fill in all the required fields.");
  }

  //check if email is valid with "@"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Please enter a valid email address.");
  }

  //check if password is between 6 and 30 characters, and includes one digit and one uppercase letter
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{6,30}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send(
        "Password must be between 6-30 characters, include at least one digit and one uppercase letter."
      );
  }

  //check if password and confirmPassword match
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  //check if phone number contains only digits
  const phoneRegex = /^\d+$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).send("Phone number should only contain digits.");
  }
  //checking if email or phone already exists
  try {
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).send("Email or phone number already exists.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      bio,
      savedPets,
      ownedPets,
      fosteredPets,
      pets,
    };

    const result = await usersCollection.insertOne(user);

    res.status(201).json({ userId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//now log in part. The user after log in.
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //check if every field is full
  if (!email || !password) {
    return res.status(400).send("Please fill in all the required fields.");
  }

  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).send("User does not exist.");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).send("Incorrect password.");
    }

    const token = jwt.sign(
      { id: user._id.toString(), isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "48h",
      }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({ userId: user._id.toString(), user: userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// ======================== pets get and post ===========================//

//Get Pets API
app.get("/pet", async (req, res) => {
  const { type, name, adoptionStatus, minHeight, maxHeight, weight } =
    req.query;

  try {
    // Build query based on filters
    const query = {};
    if (adoptionStatus) query.adoptionStatus = adoptionStatus;
    if (type) query.type = new RegExp(type, "i");
    if (name) query.name = new RegExp(name, "i");
    if (minHeight || maxHeight)
      query.height = { $gte: Number(minHeight), $lte: Number(maxHeight) };
    if (weight) query.weight = Number(weight);

    const pets = await petsCollection.find(query).toArray();

    res.json(pets);
  } catch (error) {
    console.error("Failed to get pets", error);
    res.sendStatus(500);
  }
});

//Get Pet By ID API
app.get("/pet/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const pet = await petsCollection.findOne({ _id: new ObjectId(id) });

    if (!pet) {
      return res.status(404).send("Pet not found");
    }

    res.json(pet);
  } catch (error) {
    console.error("Failed to get pet", error);
    res.sendStatus(500);
  }
});

//Add Pet API - admin
app.post("/pet", upload.single("image"), async (req, res) => {
  const {
    type,
    name,
    adoptionStatus,
    weight,
    height,
    color,
    age,
    breed,
    hypoallergenic,
    dietaryRestrictions,
  } = req.body;

  try {
    const pet = {
      type,
      name,
      adoptionStatus,
      weight,
      height,
      imagePath: req.file.path,
      color,
      age,
      breed,
      hypoallergenic,
      dietaryRestrictions,
    };

    const result = await petsCollection.insertOne(pet);
    pet._id = result.insertedId;

    res.status(201).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Edit Pet API - protected to admin only
app.put("/pet/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  const {
    type,
    name,
    adoptionStatus,
    weight,
    height,
    color,
    age,
    breed,
    hypoallergenic,
    dietaryRestrictions,
  } = req.body;

  try {
    const pet = await petsCollection.findOne({ _id: new ObjectId(id) });

    if (!pet) {
      return res.status(404).send("Pet not found");
    }

    const updatedPet = {
      ...pet,
      type,
      name,
      adoptionStatus,
      weight,
      height,
      imagePath: req.file ? req.file.path : pet.imagePath,
      color,
      age,
      breed,
      hypoallergenic,
      dietaryRestrictions,
    };

    await petsCollection.replaceOne({ _id: new ObjectId(id) }, updatedPet);

    res.status(200).json(updatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Save Pet API
app.post("/pet/:id/save", authenticateToken, async (req, res) => {
  const petId = new ObjectId(req.params.id);
  const userId = new ObjectId(req.user.id);

  try {
    const pet = await petsCollection.findOne({ _id: petId });
    const user = await usersCollection.findOne({ _id: userId });

    if (!user || !pet) {
      return res.status(404).send("User or Pet not found");
    }

    if (!user.savedPets.includes(petId)) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $push: { savedPets: petId } }
      );
      await petsCollection.updateOne(
        { _id: pet._id },
        { $push: { savedByUsers: userId } }
      );
    }

    res.json({ user: user, pet: pet });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//delete saved pet API
app.delete("/pet/:id/save", authenticateToken, async (req, res) => {
  const petId = new ObjectId(req.params.id);
  const userId = new ObjectId(req.user.id);

  try {
    const pet = await petsCollection.findOne({ _id: petId });
    const user = await usersCollection.findOne({ _id: userId });

    if (!user || !pet) {
      return res.status(404).send("User or Pet not found");
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $pull: { savedPets: petId } }
    );
    await petsCollection.updateOne(
      { _id: pet._id },
      { $pull: { savedByUsers: userId } }
    );

    res.json({ user: user, pet: pet });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//get User Saved Pets API
app.get("/user/:id/savedPets", authenticateToken, async (req, res) => {
  const userId = new ObjectId(req.user.id);

  try {
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (userId.toString() !== req.user.id) {
      // compare with toString()
      return res
        .status(403)
        .send("You do not have permission to view this data.");
    }

    const savedPets = await petsCollection
      .find({ _id: { $in: user.savedPets } })
      .toArray();

    res.json(savedPets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Adopt/Foster Pet API
app.post("/pet/:id/adopt", authenticateToken, async (req, res) => {
  const petId = new ObjectId(req.params.id);
  const userId = new ObjectId(req.user.id);
  const isFostering = req.body.isFostering;

  try {
    //retrieve pet and user from MongoDB collections
    const pet = await petsCollection.findOne({ _id: petId });
    const user = await usersCollection.findOne({ _id: userId });

    if (!pet || !user) {
      return res.status(404).send("Pet or User not found");
    }

    const adoptionStatus = isFostering ? "Fostered" : "Adopted";
    await petsCollection.updateOne(
      { _id: petId },
      {
        $set: {
          adoptionStatus,
          ownedByUser: userId,
        },
      }
    );

    //add pet to user's pets
    await usersCollection.updateOne(
      { _id: userId },
      {
        $push: { pets: petId },
      }
    );

    res.status(200).send("Pet has been successfully adopted/fostered");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Return Pet API
app.post("/pet/:id/return", authenticateToken, async (req, res) => {
  const petId = new ObjectId(req.params.id);
  const userId = new ObjectId(req.user.id);

  try {
    const pet = await petsCollection.findOne({ _id: petId });
    const user = await usersCollection.findOne({ _id: userId });

    if (!pet || !user) {
      return res.status(404).send("Pet or User not found");
    }

    //verify if the pet is owned by the user
    if (pet.ownedByUser.toString() !== userId.toString()) {
      return res.status(403).send("You can't return a pet you don't own.");
    }

    //change pet's status and owner
    await petsCollection.updateOne(
      { _id: petId },
      {
        $set: {
          adoptionStatus: "Available",
          ownedByUser: null,
        },
      }
    );

    //remove pet from user's pets
    await usersCollection.updateOne(
      { _id: userId },
      {
        $pull: { pets: petId },
      }
    );

    res.status(200).send("Pet has been successfully returned");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//======================== get Pets By User ID API ==========================
app.get("/user/:id/pets", authenticateToken, async (req, res) => {
  const userId = new ObjectId(req.params.id);

  try {
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found");
    }

    //check if authenticated user is the same as the user whose pets are being fetched, or if the authenticated user is an admin
    if (userId.toString() !== req.user.id && !req.user.isAdmin) {
      //comparing with string representation
      console.log("Authentication mismatch for user ID:", userId);
      return res
        .status(403)
        .send("You do not have permission to view this data.");
    }

    //fetch the user's pets from the MongoDB collection
    const userPets = await petsCollection
      .find({ ownedByUser: userId })
      .toArray();
    res.json(userPets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// ========================== implement sending email =======================
app.post("/send-email", async (req, res) => {
  const { name, email, phone, message } = req.body;

  //mandatory fields
  if (!name || !email || !message) {
    return res
      .status(400)
      .send("Name, Email, and Message are required fields.");
  }

  //transporter object using the default smtp transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //email data
  let mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: `New message from ${name}`,
    text: `From: ${name}\nEmail: ${email}\n Phone: ${phone}\n\n${message}`,
    html: `<b>From:</b> ${name}<br><b>Email:</b> ${email}<br><b>Phone:</b> ${
      phone || "N/A"
    }<br><br><b>Message:</b> ${message}`,
  };

  //send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Failed to send the email.");
    }
    res.status(200).send("Email sent successfully!");
  });
});

const port = 3070;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
