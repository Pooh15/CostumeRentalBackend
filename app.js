const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan')
const session = require('express-session');
const bodyParser = require('body-parser');
const config = require('./dbConfig/dbConfig');
const bcrypt = require('./encryptPassword.js');
let myConnection  = require('express-myconnection')

const app = express();


var dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(myConnection(mysql, dbOptions, 'pool'))

//This is going to be called for every single request
//HTTP request logger middleware for node.js
app.use(morgan('tiny')); 
const auth = require('./routes/auth');
const inventory = require('./routes/inventory');

app.get('/xyz', function( req, res ){
	let pass = bcrypt.cryptPassword('Prasanna');
	console.log(bcrypt.comparePassword('Prasanna', 
		pass))
	console.log("--------")
	res.send('Happy to be here');
});

app.use('/auth', auth);
app.use('/inventory', inventory);

const port = process.env.port || 5000;
app.listen( port, function(){
	console.log("***********************************************************************");
	console.log( "Server listening on port : " + port );
	console.log("***********************************************************************");
});
