const { Pool } = require('pg');
const jwt =  require('jsonwebtoken')
 const pool = require("./db");



const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log("Server started on port 5000");
});



//verify token

const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, "jwtSecret");
    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





//Signup




app.post("/signup", async (req, res) => {
  try {
    const { firstname, lastname, email, mob, type, password } = req.body;

   
    const existingUser = await pool.query("SELECT * FROM \"rentifyUsers\" WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      
      res.status(400).json({ error: "User already exists. Please login or reset your password." });
    } else {
      
      const newUser = await pool.query("INSERT INTO \"rentifyUsers\" (firstname, lastname, email, mob, type, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [
        firstname, lastname, email, mob, type, password
      ]);

      res.status(201).json({ user: newUser.rows[0], message: "User created successfully.", status: 201 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//login

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM \"rentifyUsers\" WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      res.status(400).json({ error: "User not found. Please create an account." });
      return;
    }

    const dbPassword = user.rows[0].password;

    if (password !== dbPassword) {
      res.status(401).json({ error: "Incorrect password. Please try again." });
      return;
    }

    // jwt_token


    console.log(user.rows[0].id);
    const token = jwt.sign({ id: user.rows[0].id }, "jwtSecret");
    delete user.rows[0].password;


    res.status(200).json({ user: user.rows[0],token , message: "Login successful.", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//create a new property


app.post("/create",verifyToken, async (req, res) => {
  try {
    const { propertyName, place, area, numberOfBedrooms, details, seller_id, seller_name,picturePath,likes,likedBy } = req.body;
    const newProperty = await pool.query(
      "INSERT INTO \"rentifyPropertiesFinal\" (propertyName, place, area, numberOfBedrooms, details, seller_id, seller_name, picturePath, likes, likedBy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [propertyName, place, area, numberOfBedrooms, details, seller_id, seller_name, picturePath, likes, likedBy]
    );

    res.status(201).json({ newProperty: newProperty.rows[0], status: 201 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET - Retrieve all properties
app.get("/get",verifyToken, async (req, res) => {
  try {
    const allProperties = await pool.query("SELECT * FROM \"rentifyPropertiesFinal\"");
    res.status(200).json({ properties: allProperties.rows, status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// GET - Retrieve all properties created by a single user by ID
app.get("/get/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM \"rentifyPropertiesFinal\" WHERE seller_id = $1', [id]);
    
    if (user.rows.length === 0) {
      res.status(404).json({ error: "No properties found", status: 404 });
    } else {
      res.status(200).json(user.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





// DELETE - Delete a property by ID
app.delete("/delete/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteUser = await pool.query(
      'DELETE FROM \"rentifyPropertiesFinal\" WHERE id = $1', [id]
    );

    if (deleteUser.rowCount === 0) {
      res.status(404).json({ error: "Property not found", status: 404 });
    } else {
      res.status(200).json({ status: 200, deleteUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//like


app.put("/like/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { likes, likedBy } = req.body; // Corrected to likedBy for consistency

    // Convert likedBy to an array if it's not already one
    const likedByArray = Array.isArray(likedBy) ? likedBy : [likedBy];

    const updatedProp = await pool.query(
      'UPDATE \"rentifyPropertiesFinal\" SET likes = $1, likedby = $2 WHERE id = $3',
      [likes, likedByArray, id]
    );

    if (updatedProp.rowCount === 0) {
      res.status(404).json({ error: "Property not found", status: 404 });
    } else {
      res.status(200).json({ status: 200, updatedProp });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.put("/like/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {userId,type} = req.body;

    if(type == "like"){

    }
    if(type == "dislike"){

    }

    const deleteUser = await pool.query(
      'DELETE FROM \"rentifyPropertiesFinal\" WHERE id = $1', [id]
    );

    if (deleteUser.rowCount === 0) {
      res.status(404).json({ error: "Property not found", status: 404 });
    } else {
      res.status(200).json({ status: 200, deleteUser });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
















//auth







