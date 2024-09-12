const mongoDB = require('./config/mongoAuth')
mongoDB.mongoDB()
//------------------------------------------------------------
const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const noCache = require("nocache");


//======================PUBLIC FOLDER SETTING STATIC===========
app.use(express.static(path.join(__dirname, "public")));
//=====================BODY PARSING=============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  console.log(`furniCube server is running ${"http://localhost:5030"}`);
});
