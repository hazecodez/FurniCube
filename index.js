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


//======================PUBLIC FOLDER SETTING STATIC===========
app.use(express.static(path.join(__dirname, "public")));
//=====================BODY PARSER=============================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//==================SETTING NOCACHE CACHE CLEARING=============
app.use(noCache());

//=========================FOR ROUTES==========================
app.use("/admin", adminRoute);
app.use("/", userRoute);
//=======================SETTING VIEW ENGINE===================
app.set('view engine','ejs')
app.set('views','./views')
//======================ERROR HANDLING=========================
app.use((req,res)=>{
  res.status(404).render("404")
 })

 

app.listen(5030, function () {
  console.log("server is running");
});
