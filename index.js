// TO CONNECT DATABASE //
const mongoose = require('mongoose');


const express = require('express');
const app = express();
const path = require('path');
const nocache = require('nocache');
const config = require('./config/config');
const session = require('express-session')
const Razorpay = require('razorpay');
require('dotenv').config();
config.mongooseConnection()
// RAZOR PAY //
var instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});


app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'assets')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(
  session ({
    secret : config.sessionSecret,
    saveUninitialized : true,
    resave : false,
    cookie : {
      maxAge : 1000 * 60 * 10,
    }
  }))

app.set("view engine","ejs");  


// FOR CACHE STORAGE //
app.use(nocache());


// FOR USER ROUTES //
const userRoute = require('./routes/userRoute')
app.use('/',userRoute);


// FOR ADMIN ROUTES //
const adminRoute = require('./routes/adminRoute');
const { appendFile } = require('fs/promises');

app.use('/admin',adminRoute);

// FOR CONNECTING TO THE SERVER //
const PORT = process.env.PORT
app.listen(PORT);