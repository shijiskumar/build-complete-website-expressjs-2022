let db;
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const lessMiddleware = require("less-middleware");
const logger = require("morgan");
const config = require("./config")();
const admin = require("./routes/admin");
const indexRouter = require("./routes/index");
const blog = require("./routes/blog");
const page = require("./routes/page");
var session = require('express-session');

const app = express();


const dbName = 'fastdelivery'; // Database Name
const { MongoClient } = require('mongodb');

// Connection URL
const url = `mongodb://${config.mongo.host}:${config.mongo.port}`;
const client = new MongoClient(url);

(async function main() {
  // Use connect method to connect to the server
  await client.connect().catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
  console.log('Connected successfully to server');
  db = client.db(dbName);
  console.log('Database - ', db);

  /* 
  // Try an insert to see if connection was indeed successful
  const collection = db.collection('content');
  const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
  console.log('Inserted documents =>', insertResult); 
  */

})();

// view engine setup
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "hbs");

app.use((req, res, next) => {
  console.log("Middleware call");
  req.db = db;
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(lessMiddleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

app.all("/", function (req, res, next) {
  console.log('In app.js');
  indexRouter.run(req, res, next);
});
app.all("/admin*", function (req, res, next) {
  admin.run(req, res, next);
});
app.all("/blog/:id", function (req, res, next) {
  blog.runArticle(req, res, next);
});
app.get("/blog", function (req, res, next) {
  console.log('blog page requested');
  blog.run(req, res, next);
});
app.all("/services", function (req, res, next) {
  page.run("services", req, res, next);
});
app.all("/careers", function (req, res, next) {
  page.run("careers", req, res, next);
});
app.all("/contacts", function (req, res, next) {
  page.run("contacts", req, res, next);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
process.env.PORT = config.port;
module.exports = app;
