const { check, body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Message = require("../models/Message");

exports.signupPostHandler = [
  body("first_name")
    .not()
    .isEmpty()
    .withMessage("must not be empty")
    .trim()
    .escape(),
  body("last_name")
    .not()
    .isEmpty()
    .withMessage("must not be empty")
    .trim()
    .escape(),
  body("username")
    .isEmail()
    .withMessage("must be valid email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("must not be empty")
    .escape(),
  body("password").isLength({ min: 5 }).withMessage("minimum 5 characters"),
  check("password").exists(),
  check("confirm_password")
    .exists()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("passwords must match"),
  async function (req, res, next) {
    const errors = validationResult(req);
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      let is_admin_bool = req.body.is_admin ? true : false;
      const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: hashedPassword,
        username: req.body.username,
        membership_status: false,
        is_admin: is_admin_bool,
      });
      console.log(newUser);

      if (!errors.isEmpty()) {
        res.render("signup", {
          errors: errors.array(),
          newUser,
        });
        return;
      } else {
        newUser.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/");
        });
      }
    });
  },
];

exports.createNewMessage = async function (req, res) {
  const newMsg = new Message({
    message: req.body.message,
    author: req.user.username,
    date: new Date(),
  });
  await newMsg.save();
  const allMessages = await Message.find();
  res.redirect("/");
  // res.render("index", { title: "Express", messages: allMessages });
};
