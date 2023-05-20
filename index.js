import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("database connected"))
  .catch((e) => console.log(e));

// create schema

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", UserSchema);

import path from "path";
// setting view engine

app.use(express.static(path.join(path.resolve(), "public")));

//using middleware...to access data

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const decoded = jwt.verify(token, "jsjsue8hfiwef");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res, next) => {
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;

  const user = await User.create({
    name,
    email,
  });

  const token = jwt.sign({ _id: user._id }, "jsjsue8hfiwef");
  console.log(token);
  res.cookie("token", user._id, {
    httpOnly: true, //security//
    expires: new Date(Date.now() + 60 * 1000), // to make it more secure//
  });
  res.redirect("/");
});

app.post("/", async (req, res) => {
  await Messge.create({ name: req.body.name, email: req.body.email });
  res.redirect("/success");
});

app.listen(5000, () => {
  console.log("server is working");
});
