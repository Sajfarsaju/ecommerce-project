// TO CONNECT DATABASE //
const mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/myProject`);

const express = require('express');
const app = express();
const path = require('path');
const nocache = require('nocache');
const Razorpay = require('razorpay');
require('dotenv').config();

// RAZOR PAY //
var instance = new Razorpay({
  key_id: 'YOUR_KEY_ID',
  key_secret: 'YOUR_KEY_SECRET',
});


app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'assets')));

app.use(express.json())

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

app.listen(3000,()=>{
  console.log("SERVER STARTED");
});