let express = require('express');
let app = express();
const bcrypt = require('../encryptPassword.js');


//Need to encrypt the password
app.post('/login', function(request, response) {
	request.getConnection((error, conn) =>{

		let username = request.body.username;
		let password = request.body.password;
		let output={};
		const query="SELECT password from user_details where u_name=?";
		if (username && password) {
			conn.query(query,username,(err,rows) => {
				if(err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};

				if(rows.length != 0){	
					let password_hash = rows[0]["password"];
					let verified = bcrypt.comparePassword(password, password_hash);
					
					if(verified){
						output["status"]=1;
						conn.query(`SELECT address, dob, email,phone, u_name, role_name
							FROM user_details natural join role WHERE u_name = ?`, 
							username, function(error, results, fields) {
								if (error || results.length == 0) {
									response.status(400).send('Incorrect Username!');				
								} else {
									console.log(results[0])
									response.status(200).send(results);
								}			
								response.end();
							});
					} else {
						response.status(400).send('Invalid password');
					}
				} else {
					response.status(400).send('Invalid username or password');
				}
			});
		} else {
			if (!Object.keys(request.body).includes('username') || 
				!Object.keys(request.body).includes('password')){
				response.status(400).send('Invalid input!');

		} else {
			response.status(400).send('Please enter Username and Password!');
		}
	}
});

});

function updateProfile(userProfile, id, res, dbConnection){
	
	let output = {};
	
	dbConnection.query(`UPDATE user_details SET ? WHERE u_id = ${id}`, 
		userProfile, function(err, result) {
			if(err){
				if(err) throw err;

			} else{
				output["status"]=1;
				output["message"]="Record Update Successful";
				res.send(output);
			}
		});
}

app.put('/editProfile/:id', (req, res, next) => {
	let updateUserProfile = {};
	let output = {};
	if(req.body.password != '')
		updateUserProfile.password = req.body.password? bcrypt.cryptPassword(req.body.password):req.body.password;
	if(req.body.phone != '')
		updateUserProfile.phone = req.body.phone;
	if(req.body.email != '')
		updateUserProfile.email = req.body.email;
	if(req.body.address != '')
		updateUserProfile.address = req.body.address;
	
	let passExistFlag = true;
	if(JSON.stringify(updateUserProfile) !== '{}'){
		req.getConnection((error, conn) =>{
			if(updateUserProfile.phone != null || updateUserProfile.phone != undefined){
				conn.query(`SELECT * FROM user_details WHERE phone=?`,
					updateUserProfile.phone, function(err, result) {
						if(err)	if(err) throw err;
						if(result.length != 0){
							passExistFlag = false;
							output["status"]=0;
							output["message"]="Phone Number Already Exist!";
							res.send(output);	
						} else {
							updateProfile(updateUserProfile, req.params.id, res, conn);
						}

					})
			} else {
				updateProfile(updateUserProfile, req.params.id, res, conn);
			}		
		});

	} else {
		output["status"]=0;
		output["message"]="No Record is updated";
		res.send(output);
	} 
});

app.post('/register', function(req, res){
	let query = `SELECT * FROM user_details WHERE u_name=? or (phone = ?)`;
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
	console.log(registerObj);
	if(registerObj.u_name && registerObj.password && registerObj.phone &&
		registerObj.email && registerObj.email && registerObj.dob){
		console.log(registerObj);
	req.getConnection((error, conn) =>{

		conn.query(query,[registerObj.u_name, registerObj.phone],(err,rows) => {
			if(err){
				console.log("---"+ err);
				response.status(500).send(err);
			}
		//Data already exists
		if(rows.length != 0){
			res.status(400).send('Username or Phone already exists!');
		} else {
			console.log(rows);
			let stmt = `INSERT INTO user_details SET ?`;
			conn.query(stmt, registerObj, (err, results, fields) => {
				if (err) {
					return console.error(err.message);
				}
			  // get inserted rows
			  console.log('Row inserted:' + results.affectedRows);
			  res.status(200).send('Registration Successful!');
			});
		}
	});
	})


} else {
	output["status"]=0;
	output["message"]="Please enter Required fields!";
	res.send(output);
}
});

app.get('/getUserDetails/:userid', (req, res) =>{
	let output={};
	req.getConnection((error, conn) =>{
		if (req.params.userid !=1) {
			conn.query(`select u_name,item_id,item_name,order_count,return_count,phone,address from order_details NATURAL JOIN 
				suborder_details NATURAL JOIN inventory NATURAL JOIN user_details
				where user_id=${req.params.userid}`,
				req.params.userid,(err, result)=>{
					if (err) throw err;
					if(result.length != 0){
						res.send(result);
					}else {
						output["status"]=0;
						output["message"]="Details does not exist.";
						res.send(output);
					}

				});
		}
	});

});

module.exports = app;	