const express = require('Express');
const mysql = require('mysql');

const app = express();

var connection = mysql.createConnection({
	host:"localhost",
	user: "root",
	password: "123456",
	database:"rentdb"
})

connection.connect((err) => {
	if(err){
		throw err;
	} else {
		console.log("Connected");
	}
})

connection.query(`select * from user_details`, (err, result,fields) => {
	if(err){
		return console.log(err);
	}
	return console.log(result);
})

const port = process.env.port || 5000;
app.listen(port);
console.log("App is listening on port "+ port);