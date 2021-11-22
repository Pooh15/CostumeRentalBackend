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
					rental_price, original_price,count_inv,image  
					from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
					pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image NATURAL JOIN rental_price where count_inv <> '0'`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){

					for (let key in result) {
						let value = result[key];

						var buffer = Buffer.from(value.image, 'base64');
						result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();
					}

				conn.query(`select item_name,rental_price,laundry_count,DATE_ADD(laundry_in_date, INTERVAL 2 DAY) as item_available_On,image from 
				laundry natural join inventory natural join rental_price NATURAL join image where count_inv='0' and laundry_out_date is NULL`,
				(err, result1)=>{

				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};

				if(result1.length != 0 ){

					for (let key in result1) {
						let value = result1[key];

						var buffer = Buffer.from(value.image, 'base64');
						result1[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();						
						console.log("Item is under laundry");
						var inlaundry = true;	
					}

				conn.query(`select item_id,order_count from suborder_details NATURAL JOIN inventory`,
				(err, result2)=>{

				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};

				if(result2.length != 0 ){

							res.status(200).send({result,result1,result2});
				
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				} 
			});
		}
				else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				} 
		});
	}

				else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				} 

	});
});
});

/*router.get('/getLaundryDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

				conn.query(`select item_name,rental_price,laundry_count,DATE_ADD(laundry_in_date, INTERVAL 2 DAY) as item_available_On,image from 
				laundry natural join inventory natural join rental_price NATURAL join image where count_inv='0' and laundry_out_date is NULL`,
				(err, result)=>{

				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};

				if(result.length != 0 ){

					for (let key in result) {
						let value = result[key];

						var buffer = Buffer.from(value.image, 'base64');
						result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();						
						console.log("Item is under laundry");
						var inlaundry = true;
					}
							res.status(200).send(result);	
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}
			});
		
	});
});*/

module.exports = router;	