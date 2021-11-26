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


function calculateDate(newDate, daysToBeAdded){
	let someDate = new Date(newDate);
	someDate.setDate(someDate.getDate() + daysToBeAdded); //number  of days to add, e.x. 15 days
	return someDate.toISOString().substr(0,10);
}

router.get('/getDetails', (req, res) =>{
req.getConnection((error, conn) =>{
		let output={};

	conn.query(`select i.item_id,item_name,c_name,material_name,p_name,color,s_name,
		image_name, rental_price, original_price, Laundry_count ,laundry_in_date, image 
		from inventory i NATURAL JOIN category natural join clothmaterial NATURAL JOIN
		pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image
		left join laundry l on l.item_id = i.item_id 
		where l.laundry_out_date is null
		`,
		(err, result)=>{
			if (err) {
				res.status(500).send(err);
			}

			if(result.length != 0 )
			{

				for (let key in result) {
					let value = result[key];

					var buffer = Buffer.from(value.image, 'base64');
					result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();
				}
				let orderQuery = `select item_id, rent_date, order_count from order_details natural join suborder_details
				where return_date is null`;
				conn.query(orderQuery, function(error, results, fields) {
					if (error) {
						if (error) res.status(500).send(error);				
					} 
					if(results.length != 0){
						let result1 = Object.values(JSON.parse(JSON.stringify(result)));
						const results1 = Object.values(JSON.parse(JSON.stringify(results)));
						
						//add order_count to the items in inventory that matches with
						//items in order
						result1.forEach((element, index) => {
							const orderRecord = results1.find( 
								({ item_id }) => item_id === result1[index].item_id );

							if(orderRecord != undefined) {
								result1[index].order_count = orderRecord.order_count;									
								result1[index].item_available_On = 
								calculateDate(orderRecord.rent_date, 8);
							}
							if(result1[index].Laundry_count != null){
								result1[index].expected_laundry_out_date = 
								calculateDate(result1[index].laundry_in_date, 4);	
							}
						} )

						res.status(200).send(result1);
					} else { //No order is placed yet
						res.status(200).send(result);
					}	
				});

			} else {
				output["message"]="No Records Found!";
				res.status(400).send(output);
			}
		});
	});
});

router.get('/getLaundryDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

		let sql=`call get_laundry_details()`;
		conn.query(sql,true,(error, result, fields) => {
			if (error) {
				console.log("---"+ err);
				response.status(500).send(err);
			};
			if(result.length != 0 ){

				for (let key in result) {
					let value = result[key];

					var buffer = Buffer.from(JSON.stringify(value.image));
					result[key].image = `data:image/png;base64,`+Buffer.from(JSON.stringify(value.image));					
				}

				res.status(200).send(result);
			}
			else {
				output["status"]=0;
				output["message"]="No Records Found!";
				res.status(400).send(output);
			} 

		});
	});
});

router.get('/getLaundryDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

		let sql=`call get_laundry_details()`;
		conn.query(sql,true,(error, result, fields) => {
			if (error) {
				console.log("---"+ err);
				response.status(500).send(err);
			};
			if(result.length != 0 ){

				for (let key in result) {
					let value = result[key];

					var buffer = Buffer.from(JSON.stringify(value.image));
					result[key].image = `data:image/png;base64,`+Buffer.from(JSON.stringify(value.image));					
				}

				res.status(200).send(result);
			}
			else {
				output["status"]=0;
				output["message"]="No Records Found!";
				res.status(400).send(output);
			} 

		});
	});
});


router.get('/getLaundryDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

		let sql=`call get_laundry_details()`;
			conn.query(sql,true,(error, result, fields) => {
				if (error) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){

					for (let key in result) {
						let value = result[key];

						var buffer = Buffer.from(JSON.stringify(value.image));
						result[key].image = `data:image/png;base64,`+Buffer.from(JSON.stringify(value.image));					
					}

						res.status(200).send(result);

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