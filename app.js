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


app.get('/getUserDetails', (req, res) =>{
	let userid=req.query.userid;
	let output={};
	 
    if (userid !=1) {
    	dbConnection.query(`SELECT item_name,count_inv from order_details
		natural join suborder_details natural join inventory where user_id=?`,req.query.userid,(err, result)=>{
		
			if(result.length != 0 ){

        		if (err) throw err;

        		res.send(result);
			}else {
				output["status"]=0;
				output["message"]="Details does not exist.";
				res.send(output);
				}
			

		});
	}

});

app.get('/getInventoryDetails', (req, res) =>{
	let userid=req.query.userid;
	let output={};
    
    dbConnection.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name from inventory 
	NATURAL JOIN category natural join clothmaterial NATURAL JOIN pattern NATURAL JOIN color NATURAL JOIN size`,(err, result)=>{
        
		if(result.length != 0 ){
			if (err) throw err;

        	res.send(result);
        	res.end();
		}else {
				output["status"]=0;
				output["message"]="No Records Found!";
				res.send(output);
				}
		
	});
});


app.post('/register', function(req, res){
	//let query = "SELECT * FROM user_details WHERE u_name = ? and phone = ? LIMIT 1";
	let query = `SELECT * FROM rentdb.user_details WHERE u_name=? or (phone = ?)`;
	let output={};
	let registerObj = {
		u_name : req.body.username,
		password : req.body.password? bcrypt.cryptPassword(req.body.password):req.body.password,
		phone: req.body.phone,
		email: req.body.email,
		address: req.body.address,
		dob: req.body.dob,
		role_id: 2
	}
	if(registerObj.u_name && registerObj.password && registerObj.phone &&
		registerObj.email && registerObj.email && registerObj.dob){
		console.log(registerObj);
	dbConnection.query(query,[registerObj.u_name, registerObj.phone],(err,rows) => {
		if(err) throw err;
				//Data already exists
				if(rows.length != 0){
					output["status"]=0;
					output["message"]="Username or Phone already exists!";
					res.send(output);
				} else {
					console.log(rows);
					let stmt = `INSERT INTO user_details SET ?`;
					dbConnection.query(stmt, registerObj, (err, results, fields) => {
						if (err) {
							return console.error(err.message);
						}
						  // get inserted rows
						  console.log('Row inserted:' + results.affectedRows);
						  output["status"]=1;
						  output["message"]="Registration Successful!";
						  res.send(output);
						});
				}
			});

} else {
	output["status"]=0;
	output["message"]="Please enter Required fields!";
	res.send(output);
}
});

app.get('/xyz', function( req, res ){
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
