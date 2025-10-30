    const express = require("express");
    const mongoose = require("mongoose");
    const bcrypt = require("bcrypt");
    const session = require("express-session");
    const path = require("path");

    const app = express();
    mongoose.connect("mongodb://127.0.0.1:27017/loginDB")
      .then(() => console.log(" MongoDB Connected"))
      .catch(() => console.log(" DB Error"));

    const User = mongoose.model("User", new mongoose.Schema({
      username: String, email: String, password: String
    }));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname,'public')));
    app.use(session({ secret: "key" }));

    function auth(req, res, next) {
      if (req.session.user) next(); else res.redirect("/login.html");
    }

    app.get("/", auth, (req, res) =>
      res.send(`<h2>Hello ${req.session.user.username}</h2><a href="/logout">Logout</a>`)
    );

    app.post("/register", async (req, res) => {
      let { username, email, password } = req.body;
      if (await User.findOne({ email })) return res.send("Email exists <a href='/register.html'>Try again</a>");
      let hash = await bcrypt.hash(password, 10);
      await new User({ username, email, password: hash }).save()
      res.send("Registered! <a href='/login.html'>Login</a>");
    });

    app.post("/login", async (req, res) => {
      let { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) return res.send("User not found <a href='/login.html'>Try again</a>");
      if (!await bcrypt.compare(password, user.password))
        return res.send("Wrong password <a href='/login.html'>Try again</a>");
      req.session.user = user;
      res.redirect("/");
    });

    app.get("/logout", (req, res) =>
    req.session.destroy(() => res.redirect("/login.html")));

    app.listen(3000, () => console.log(" httgp://localhost:3000"));




    ##npm install 