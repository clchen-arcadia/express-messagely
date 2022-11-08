"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get("/",
  authenticateJWT,
  ensureLoggedIn,
  async function (req, res, next) {
    return res.json({ users: User.all() });
  });

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username",
  authenticateJWT,
  ensureCorrectUser,
  async function (req, res, next) {
    return res.json({ user: User.get(req.params.username) });
  });

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

module.exports = router;