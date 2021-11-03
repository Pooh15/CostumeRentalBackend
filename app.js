const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan')
const session = require('express-session');
const bodyParser = require('body-parser');
const dbConnection = require('./dbConfig/dbConfig');
const bcrypt = require('./encryptPassword.js');

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
	let username = request.body.username;
	let password = request.body.password;
	let output={};
	const query="SELECT password from user_details where u_name=?";
	if (username && password) {
		dbConnection.query(query,username,(err,rows) => {
			if(err) throw err;
			
			if(rows.length != 0){
				let password_hash = rows[0]["password"];
				let verified = bcrypt.comparePassword(password, password_hash);
				console.log(verified);
				if(verified){
					output["status"]=1;
					dbConnection.query('SELECT * FROM user_details WHERE u_name = ?', 
						username, function(error, results, fields) {
							if (error || results.length == 0) {
								console.log(results);
								response.send('Incorrect Username!');				
							} else {
								console.log(results);
								response.send(results);
							}			
							response.end();
						});
				} else {
					output["status"]=0;
					output["message"]="Invalid password";
					response.send(output);
				}
			} else {
				output["status"]=0;
				output["message"]="Invalid username and password";
				response.send(output);
			}
		});
	} else {
		output["status"]=0;
		output["message"]="Please enter Username and Password!";

		response.send(output);
	}
});

app.post('/register', function(req, res){
	console.log(req.body);
	res.send(req.body);
});

app.get('/home', function( req, res ){
	let pass = bcrypt.cryptPassword('Prasanna');
	console.log(bcrypt.comparePassword('Prasanna', 
		pass))
	console.log("--------")
	res.send('Happy to be here');
});


const port = process.env.port || 5000;
app.listen( port, function(){
	console.log("***********************************************************************");
	console.log( "Server listening on port : " + port );
	console.log("***********************************************************************");
});
