const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/BloomStyle");
//------------------------------------------------------
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const noCache = require("nocache");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(noCache());

//for routes
app.use("/admin", adminRoute);
app.use("/", userRoute);

app.set('view engine','ejs')
app.set('views','./views')

app.use((req,res)=>{
  res.status(404).render("404")
 })


app.listen(5030, function () {
  console.log("server is running");
});
