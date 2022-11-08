"use strict";

const Router = require("express").Router;
const router = new Router();
const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");


/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {

  if (req.body === undefined) throw new BadRequestError(); // keep this!
  const { username, password } = req.body; //error here without prev line!
  if (!username || !password) throw new BadRequestError();

  if (await User.authenticate(req.body.username, req.body.password)) {
    const payload = { username };
    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ token }); //should update the User. thingy
  } else {
    throw new UnauthorizedError("Username and/or password doesn't exist in database");
  } // new message --> "Invalid username or password"
  // was thinking where is the updateLogin? document that its in the class method!
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  let username; // no good solutions for this :'(
  try {
    username = (await User.register(req.body)).username; // CAREFUL with the parens!
      //isolate what is being await! (await ...) other stuff on the outside!
  } catch (err) { // <--- again with no error class/filtering thingy.
    throw new BadRequestError("One or more value/s are invalid");
  }

  const payload = { username };
  const token = jwt.sign(payload, SECRET_KEY);
  return res.json({ token });
});


module.exports = router;
