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
				if(err) throw err;

				if(rows.length != 0){
					let password_hash = rows[0]["password"];
					let verified = bcrypt.comparePassword(password, password_hash);
					console.log(verified);
					if(verified){
						output["status"]=1;
						conn.query('SELECT * FROM user_details WHERE u_name = ?', 
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
			if(err) throw err;
			//Data already exists
			if(rows.length != 0){
				output["status"]=0;
				output["message"]="Username or Phone already exists!";
				res.send(output);
			} else {
				console.log(rows);
				let stmt = `INSERT INTO user_details SET ?`;
				conn.query(stmt, registerObj, (err, results, fields) => {
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
	})


} else {
	output["status"]=0;
	output["message"]="Please enter Required fields!";
	res.send(output);
}
});

app.get('/getUserDetails', (req, res) =>{
	let userid=req.query.userid;
	let output={};
	req.getConnection((error, conn) =>{
		if (userid !=1) {
			conn.query(`SELECT item_name,count_inv from order_details
				natural join suborder_details natural join inventory where user_id=?`,
				req.query.userid,(err, result)=>{
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