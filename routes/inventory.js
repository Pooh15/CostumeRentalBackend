let express = require('express');
let router = express.Router();
let multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limits: {
	fieldSize: 1 * 1024 * 1024
}
});

router.post('/addItem', function(req, res){
	let output={};
	console.log(req.body);

	if(req.body.fname != '' && req.body.lname != ''){

		req.getConnection((error, conn) =>{
			upload.single('imageName')(req, res, function(err) {
				if (err) {
		 // An error occurred when uploading
		 console.log('Err: ', err);
		 return;
		} else {
			let imgName = Object.values(req.files)[0].name.split('.');
			imgName = imgName[0].split(' ').join('')+'-'+Date.now();
			let imageBlob = Object.values(req.files)[0].data.toString('base64');

			console.log(imgName);
			console.log(Object.values(req.files)[0])
			let query = `INSERT INTO image SET ?`;
			conn.query(query, {image_name: imgName, image: imageBlob}, (err, results, fields) => {
				if (err) {
					return console.error(err.message);
				}
				console.log('Row inserted:' + results.affectedRows);
				output["status"]=1;
				output["message"]="Image added Successfully!";
				res.send(output);
			});
			


		} })
		});
	} else {
		output["status"]=0;
		output["message"]="Please enter All fields";
		res.send(output);
	}

});

router.get('/getDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

		conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
		image_name, rental_price, original_price, image 
		from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
		pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image NATURAL JOIN rental_price`,
			(err, result)=>{
				if (err) throw err;
				if(result.length != 0 ){
					res.send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.send(output);
				}

			});
	});
});

module.exports = router;	