const express = require('express');
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

const {login, refresh} = require('./authentication')

app.use(cookieParser());
app.use(express.json());

app.post('/login',login)
app.post('/refresh',refresh)




