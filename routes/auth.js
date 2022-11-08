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
  // if(req.body===undefined) throw new BadRequestError();
  const { username, password } = req.body;
  if (!username || !password) throw new BadRequestError();
  if (await User.authenticate(req.body.username, req.body.password)) {
    const payload = { username };
    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ token });
  } else {
    throw new UnauthorizedError("Username and/or password doesn't exist in database");
  }
});
/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  try {
    const username = await User.register(req.body).username;
  } catch (IntegrityError) {
    throw new BadRequestError("One or more value/s are invalid");
  }
  
  const payload = { username };
  const token = jwt.sign(payload, SECRET_KEY);
  return res.json({ token });
});
module.exports = router;