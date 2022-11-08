"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");

const app = require("../app");
const db = require("../db");
const Message = require("../models/message");
const User = require("../models/user");


describe("Message Route Test", function () {

  let m1;
  let m2;

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });
    let u3 = await User.register({
      username: "test3",
      password: "password",
      first_name: "Test3",
      last_name: "Testy3",
      phone: "+14155553333",
    });
    m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2",
    });
    m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1",
    });
  });

  /** GET /:id - get detail of message.
   *
   **/

  describe("GET /messages/:id", function () {
    test("can't view message because not logged in", async function () {
      let response = await request(app)
        .get(`/messages/${m1.id}`);
      expect(response.statusCode).toEqual(401);
    });

    test("can't view message because this user is not allowed", async function () {
      // let responseLogin = await request(app)
      //   .post("/auth/login")
      //   .send({
      //     username: "test3",
      //     password: "password"
      //   });

      //   // try:       let token = response.body.token;

      //   console.log("responseLogin is", Object.keys(responseLogin.text));
      // const token3 = responseLogin.text.token;
      // console.log("token3 =", token3);

      console.log("User all is", await User.all());
      console.log("m1 is", await Message.get(m1.id));

      const username = "test3";
      const payload = { username };
      const token3 = jwt.sign(payload, SECRET_KEY);

      console.log("token3 =", token3);


      let response = await request(app)
        .get(`/messages/${m1.id}?_token=${token3}`);
      expect(response.statusCode).toEqual(401);
    });


  });

});



afterAll(async function () {
  await db.end();
});
