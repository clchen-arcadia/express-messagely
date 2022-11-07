"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const BCRYPT_WORK_FACTOR = require("../config");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(
      `INSERT INTO users (username,
                         password,
                         first_name,
                         last_name,
                         phone,
                         join_at)
        VALUES
          ($1, $2, $3, $4, $5, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */
  //TODO: is the incoming password to this method hashed or not??

  static async authenticate(username, password) {

    // hashes given password
    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    // access stored known hashed password
    const result = await db.query(
        `SELECT password
        FROM users
        WHERE username = $1`,
        [username]);
    const user = result.rows[0];

    // compare the given hash to the known hash
    if (user !== undefined) {
      if (await bcrypt.compare(hashedPassword, user.password) === true) {
      return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(
      `UPDATE users
        SET last_login_at=current_timestamp
        WHERE username = $1
        RETURNING username, last_login_at`,
      [username]
    )
    if(result.rows[0] === undefined) {
      throw new NotFoundError("No such user exists");
    }
  }

  /** All: basic info on all users:
   *  Returns: [{username, first_name, last_name}, ...] */

  static async all() {

    const results = await db.query(
      `SELECT username, first_name, last_name
        FROM users`
    );

    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const results = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
        FROM users
        WHERE username = $1`,
      [username]);
    const user = results.rows[0];

    if(user === undefined) {
      throw new NotFoundError("No such user exists");
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    // first verify this username is in the database
    const verifyUserR = await db.query(
      `SELECT username
        FROM users
        WHERE username = $1`,
      [username]);
    if(verifyUserR.rows[0] === undefined){
      throw new NotFoundError("No such user exists");
    }

    const result = await db.query(
      `SELECT m.id,
              to_u.username,
              to_u.first_name,
              to_u.last_name,
              to_u.phone,
              m.body,
              m.sent_at,
              m.read_at
        FROM messages AS m
        JOIN users AS u
          ON m.from_username = $1
        JOIN users AS to_u
          ON m.to_username = to_u.username`,
      [username]);

    return result.rows.map(
      r => ({
        id: r.id,
        to_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    // first verify this username is in the database
    const verifyUserR = await db.query(
      `SELECT username
        FROM users
        WHERE username = $1`,
      [username]);
    if(verifyUserR.rows[0] === undefined){
      throw new NotFoundError("No such user exists");
    }

    const result = await db.query(
      `SELECT m.id,
              f_u.username,
              f_u.first_name,
              f_u.last_name,
              f_u.phone,
              m.body,
              m.sent_at,
              m.read_at
        FROM messages AS m
        JOIN users AS u
          ON m.to_username = $1
        JOIN users AS f_u
          ON m.from_username = f_u.username`,
      [username]);

    return result.rows.map(
      r => ({
        id: r.id,
        from_user: {
          username: r.username,
          first_name: r.first_name,
          last_name: r.last_name,
          phone: r.phone
        },
        body: r.body,
        sent_at: r.sent_at,
        read_at: r.read_at
      }));
  }
}


module.exports = User;
