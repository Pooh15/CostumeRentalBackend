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


app.post('/testPost', (req, res) => {
	console.log(req.body);
	res.send('Home Page!');
})

app.get('/', function( req, res ){
    res.send('Happy to be here');
});


// dbConnection.query(`select * from user_details`, (err, result,fields) => {
// 	if(err){
// 		return console.log(err);
// 	}
// 	return console.log(result);
// })

const port = process.env.port || 5000;
app.listen( port, function(){
    console.log("***********************************************************************");
    console.log( "Server listening on port : " + port );
    console.log("***********************************************************************");
});
