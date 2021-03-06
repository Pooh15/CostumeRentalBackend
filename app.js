const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan')
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./dbConfig/dbConfig');
const bcrypt = require('./encryptPassword.js');
const myConnection  = require('express-myconnection')
const cors = require('cors')
const fileupload = require("express-fileupload");

const app = express();


const dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.use(fileupload());

/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */ 
app.use(myConnection(mysql, dbOptions, 'pool'))

//This is going to be called for every single request
//HTTP request logger middleware for node.js
app.use(morgan('tiny')); 
const auth = require('./routes/auth');
const inventory = require('./routes/inventory');
const itemDependency = require('./routes/category');
const userActions = require('./routes/user');

app.use('/auth', auth);
app.use('/inventory', inventory);
app.use('/category', itemDependency);
app.use('/user', userActions);

const port = process.env.port || 5000;
app.listen( port, function(){
	console.log("***********************************************************************");
	console.log( "Server listening on port : " + port );
	console.log("***********************************************************************");
});
