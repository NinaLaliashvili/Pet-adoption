const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const nodemailer = require("nodemailer");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use("/images", express.static(path.join(__dirname, "images")));

//import db and connect with it
const USERS_FILE = path.join(__dirname, "DB", "users.json");
const PETS_FILE = path.join(__dirname, "DB", "pets.json");

//middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("Token is null");
    return res.sendStatus(401);
  }

  jwt.verify(token, "somesecretkey", (err, user) => {
    if (err) {
      console.log("Error during token verification:", err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// -------------------------- Start Server Side----------------------------
//general api route
app.get("/", (req, res) => {
  res.send("This is pet adoption project server");
});

// Get Users API - protected to admin
app.get("/users", async (req, res) => {
  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    console.log(JSON.stringify(users, null, 2));
    res.json(users);
  } catch (error) {
    console.error("Failed to read users.json", error);
    res.sendStatus(500);
  }
});

// Get User By ID API
app.get("/user/:id", async (req, res) => {
  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
  const user = users.find((user) => user.id === parseInt(req.params.id));

  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found.");
  }
});

// Update User API
app.put("/user/:id", authenticateToken, async (req, res) => {
  const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
  const userIndex = users.findIndex(
    (user) => user.id === parseInt(req.params.id)
  );

  if (userIndex === -1) {
    res.status(404).send("User not found.");
  } else {
    //see if authenticated user is the same as the user
    if (req.user.id !== users[userIndex].id) {
      return res
        .status(403)
        .send("You do not have permission to update this profile.");
    }

    let updatedUser = { ...users[userIndex], ...req.body };

    //see if password exists in req.body. If it does, hash the new password.
    if (req.body.password) {
      const saltRounds = 10;
      updatedUser.password = await bcrypt.hash(req.body.password, saltRounds);
    }

    users[userIndex] = updatedUser;

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

    //return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  }
});

//post users to sign up, after that new user will be visible into db
app.post("/signup", async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, phone } =
    req.body;

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
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const existingUser = users.find(
      (user) => user.email === email || user.phone === phone
    );

    if (existingUser) {
      return res.status(400).send("Email or phone number already exists.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    };

    users.push(user);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    res.status(201).json({ userId: user.id });
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
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const user = users.find((user) => user.email === email);

    //if the user is not the same as email, error:
    if (!user) {
      return res.status(400).send("User does not exist.");
    }

    //if the password is not matching
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).send("Incorrect password.");
    }

    //this is generating JWT
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "somesecretkey",
      {
        expiresIn: "48h",
      }
    );

    //remove the password from the user object before sending it back
    const { password: _, ...userWithoutPassword } = user;

    //return the user's information (without the password) and the JWT
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// ======================== pets get and post ===========================//

// Get Pets API
app.get("/pet", async (req, res) => {
  console.log(req.query);
  const { type, name, adoptionStatus, minHeight, maxHeight, weight } =
    req.query;

  try {
    let pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    if (adoptionStatus) {
      pets = pets.filter(
        (pet) =>
          pet.adoptionStatus.toLowerCase() === adoptionStatus.toLowerCase()
      );
    }
    if (type) {
      pets = pets.filter((pet) =>
        pet.type.toLowerCase().includes(type.toLowerCase())
      );
    }
    if (minHeight || maxHeight) {
      pets = pets.filter((pet) => {
        if (minHeight && pet.height < Number(minHeight)) {
          return false;
        }
        if (maxHeight && pet.height > Number(maxHeight)) {
          return false;
        }
        return true;
      });
    }
    if (weight) {
      pets = pets.filter((pet) => pet.weight === Number(weight));
    }
    if (name) {
      pets = pets.filter((pet) =>
        pet.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    res.json(pets);
  } catch (error) {
    console.error("Failed to read pets.json", error);
    res.sendStatus(500);
  }
});

//Get Pet By ID API
app.get("/pet/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));
    const pet = pets.find((pet) => pet.id === parseInt(id));

    if (!pet) {
      return res.status(404).send("Pet not found");
    }

    res.json(pet);
  } catch (error) {
    console.error("Failed to read pets.json", error);
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
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const pet = {
      id: pets.length + 1,
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

    pets.push(pet);
    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2));

    res.status(201).json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Edit Pet API - protected to admin only
app.put("/pet/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
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
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const petIndex = pets.findIndex((pet) => pet.id.toString() === id);

    if (petIndex === -1) {
      return res.status(404).send("Pet not found");
    }

    const updatedPet = {
      ...pets[petIndex],
      type,
      name,
      adoptionStatus,
      weight,
      height,
      imagePath: req.file ? req.file.path : pets[petIndex].imagePath,
      color,
      age,
      breed,
      hypoallergenic,
      dietaryRestrictions,
    };

    pets[petIndex] = updatedPet;

    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2));

    res.status(200).json(updatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Save Pet API
app.post("/pet/:id/save", authenticateToken, async (req, res) => {
  const petId = parseInt(req.params.id);

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === req.user.id);
    const pet = pets.find((pet) => pet.id === petId);

    if (!user || !pet) {
      return res.status(404).send("User or Pet not found");
    }

    //to move the pet to the user's saved pets if it's not already there
    if (!user.savedPets.includes(petId)) {
      user.savedPets.push(petId);
      //add the user to the pet's savedByUsers array
      pet.savedByUsers = pet.savedByUsers || [];
      if (!pet.savedByUsers.includes(user.id)) {
        pet.savedByUsers.push(user.id);
      }
    }

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2));

    res.json({ user: user, pet: pet });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//delete saved pet API
app.delete("/pet/:id/save", authenticateToken, async (req, res) => {
  const petId = parseInt(req.params.id);

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === req.user.id);
    const pet = pets.find((pet) => pet.id === petId);

    if (!user || !pet) {
      return res.status(404).send("User or Pet not found");
    }

    //remove the pet from the user's saved pets
    user.savedPets = user.savedPets.filter((id) => id !== petId);

    //remove the user from the pet's savedByUsers array
    pet.savedByUsers = pet.savedByUsers || [];
    pet.savedByUsers = pet.savedByUsers.filter((id) => id !== user.id);

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2));

    res.json({ user: user, pet: pet });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//get User Saved Pets API
app.get("/user/:id/savedPets", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    //see if authenticated user is the same as the user whose saved pets are being fetched
    if (req.user.id !== user.id) {
      return res
        .status(403)
        .send("You do not have permission to view this data.");
    }

    //detch the user's saved pets from the pets data
    const savedPets = pets.filter((pet) => user.savedPets.includes(pet.id));

    res.json(savedPets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Adopt/Foster Pet API
app.post("/pet/:id/adopt", authenticateToken, async (req, res) => {
  const petId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === userId);
    const pet = pets.find((pet) => pet.id === petId);

    if (!pet || !user) {
      return res.status(404).send("Pet or User not found");
    }

    const isFostering = req.body.isFostering;

    //to xhange pet's status and owner
    pet.adoptionStatus = isFostering ? "Fostered" : "Adopted";
    pet.ownedByUser = user.id;

    //to add pet to user's pets
    user.pets = [...(user.pets || []), petId];

    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), "utf8");

    res.status(200).send("Pet has been successfully adopted/fostered");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//Return Pet API
app.post("/pet/:id/return", authenticateToken, async (req, res) => {
  const petId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    //get the user and pet data
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === userId);
    const pet = pets.find((pet) => pet.id === petId);

    if (!pet || !user) {
      return res.status(404).send("Pet or User not found");
    }

    //verify if the pet is owned by the user
    if (pet.ownedByUser !== user.id) {
      return res.status(403).send("You can't return a pet you don't own.");
    }

    //change pet's status and owner
    pet.adoptionStatus = "Available";
    pet.ownedByUser = null;

    //remove pet from user's pets
    user.pets = user.pets.filter((id) => id !== petId);

    //save changes to files
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    await fs.writeFile(PETS_FILE, JSON.stringify(pets, null, 2), "utf8");

    res.status(200).send("Pet has been successfully returned");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

//get Pets By User ID API
app.get("/user/:id/pets", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    //get the user and pet data
    const users = JSON.parse(await fs.readFile(USERS_FILE, "utf8"));
    const pets = JSON.parse(await fs.readFile(PETS_FILE, "utf8"));

    const user = users.find((user) => user.id === userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).send("User not found");
    }

    //check if authenticated user is the same as the user whose pets are being fetched, or if the authenticated user is an admin
    if (req.user.id == req.user.isAdmin) {
      console.log("Authentication mismatch for user ID:", userId);
      return res
        .status(403)
        .send("You do not have permission to view this data.");
    }

    //fetch the user's pets from the pets data
    const userPets = pets.filter(
      (pet) => pet.ownedByUser === user.id || pet.fosteredByUser === user.id
    );
    console.log("User Pets:", userPets);
    res.json(userPets);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

const port = 3070;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
