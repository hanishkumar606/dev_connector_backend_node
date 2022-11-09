const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport')
const cors = require('cors');

const app = express();
//Enable cors
app.use(cors({
    'allowedHeaders': ['sessionId', 'Content-Type', 'Authorization'],
    'exposedHeaders': ['sessionId'],
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false
}));


//body-parser middle ware
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

//passport middle ware
app.use(passport.initialize())

// Db config
const db = require('./configs/keys').mongoURI;

//Passport config
require('./configs/passport')(passport)

//Routes config
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

//Db connection
mongoose.connect(db)
    .then(() => console.log("Mongo DB Connected"))
    .catch((error) => console.log(error))

// use routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

app.get('/', (req, res) => res.send('Hello Hanish!!! I am backghhh'));






const port = process.env.port || 5000;

app.listen(port, () => console.log(`Server is running on port:${port}`));