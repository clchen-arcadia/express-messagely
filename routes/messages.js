"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const {
  authenticateJWT,
  ensureSenderReceiver,
  ensureLoggedIn,
  ensureRecipient
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

//TODO: authenticateJWT!

router.get("/:id",
  authenticateJWT,
  ensureSenderReceiver,
  async function(req,res,next) {
    return res.json({message: await Message.get(req.params.id)}); //not GENERIC middleware
    //gray area! but API's need to match. a bit entangled.
    //arguable that it's not worth it--just put it all into the ROUTE.
    //TODO: reminder! if ensureSenderReceiver logic brought INTO this VIEW fn.
    //remember: it was also ensuring Logged In!!
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/",
  authenticateJWT,
  ensureLoggedIn,
  async function (req, res, next) {
    if (req.body === undefined) throw new BadRequestError();

    const { to_username, body } = req.body;
    if (to_username === undefined ||
        body === undefined) {
          throw new BadRequestError();
        }

    let message;

    try {
      message = await Message.create({
        from_username: res.locals.user.username,
        to_username,
        body
      });
    } catch (err) { // ANY error.... that's python land. //Reminder: any error! even if db is down!
      throw new BadRequestError("Unable to post this message");
      //read the err instance? body or message or whatever.
    }

    return res.json({message});
  });


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read',
  authenticateJWT,
  ensureRecipient,
  async function (req, res, next) {
    return res.json({message: await Message.markRead(req.params.id)});
  }); //TODO: again, repackage!split it up! also up to style. but also. split up this one.


module.exports = router;
