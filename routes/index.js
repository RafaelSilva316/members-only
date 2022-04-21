const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");
const passport = require("passport");
const Secret = require("../models/Secret");
const bcrypt = require("bcryptjs");
const Message = require("../models/Message");
const User = require("../models/User");

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return res.status(400).json({ errors: err });
    }
    if (!user) {
      return res.status(400).json({ errors: "No user found" });
    }
    req.logIn(user, async function (err) {
      if (err) {
        return res.status(400).json({ errors: err });
      }
      const allMessages = await Message.find();
      return res.render("index", {
        title: req.user.first_name,
        user: req.user,
        messages: allMessages,
      });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post("/signup", formController.signupPostHandler);

router.get("/join", function (req, res, next) {
  res.render("join");
});

router.post("/join", async (req, res) => {
  const secretWord = await Secret.find();
  bcrypt.compare(req.body.secret, secretWord[0].secretWord, async (err, r) => {
    if (r) {
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { membership_status: true }
      );
      //req.user.membership_status = true;
      const allMessages = await Message.find();
      res.render("index", {
        title: req.user.first_name,
        user: req.user,
        messages: allMessages,
      });
    } else {
      res.redirect("/join");
    }
  });
});

router.get("/secret", async function (req, res, next) {
  const secretWord = await Secret.find();

  if (secretWord.length === 0) {
    bcrypt.hash(process.env.SECRET_WORD, 10, async (err, hashedSecret) => {
      const newSecret = await new Secret({
        secretWord: hashedSecret,
      });
      await newSecret.save();
      res.render("secret", { secretWord: newSecret });
    });
  } else {
    res.render("secret", { secretWord: secretWord[0] });
  }
});

router.get("/deleteSecret", async function (req, res, next) {
  const secretWord = await Secret.find();
  console.log(secretWord);
  if (secretWord.length === 1) {
    await Secret.deleteOne({ _id: secretWord[0]._id });
  }
  res.redirect("/");
});

router.get("/newMessage", function (req, res, next) {
  res.render("newMessage");
});

router.post("/newMessage", formController.createNewMessage);

router.get("/delete/:id", async (req, res) => {
  if (!!req.user) {
    await Message.findByIdAndDelete(req.params.id);
  }

  res.redirect("/");
});

router.get("/", async function (req, res, next) {
  const allMessages = await Message.find();
  let name;
  if (req.user) {
    name = req.user.first_name;
  } else {
    name = "Welcome";
  }
  res.render("index", {
    title: name,
    user: req.user,
    messages: allMessages,
  });
});

module.exports = router;
