const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan')
var session = require('express-session');
var bodyParser = require('body-parser');
var dbConnection = require('./dbConfig/dbConfig');

const app = express();

dbConnection.connect((err) => {
	if(err){
		throw err;
	} else {
		console.log("Connected");
	}
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//This is going to be called for every single request
//HTTP request logger middleware for node.js
app.use(morgan('tiny')); 

//Need to encrypt the password
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	console.log(request.body );

	if (username && password) {
		dbConnection.query('SELECT * FROM user_details WHERE u_name = ? AND password = ?', 
			[username, password], function(error, results, fields) {
			if (error || results.length == 0) {
				response.send('Incorrect Username and/or Password!');				
			} else {
				console.log(results);
				response.redirect('/home');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function( req, res ){
    res.send('Happy to be here');
});

const port = process.env.port || 5000;
app.listen( port, function(){
    console.log("***********************************************************************");
    console.log( "Server listening on port : " + port );
    console.log("***********************************************************************");
});
