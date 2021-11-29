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
	let obj = JSON.parse(req.body.inventoryObj);

	if(obj.c_id && obj.p_id &&
		obj.cloth_id && obj.color_id &&
		obj.s_id && obj.item_name &&
		obj.original_price != 0 && obj.count_inv){

		req.getConnection((error, conn) =>{
			upload.single('imageName')(req, res, function(err) {

				if (err) {
			 // An error occurred when uploading
			 console.log('Err: ', err);
			 return res.status(500).send(err);
			} else {
				conn.beginTransaction();
				let imgName = Object.values(req.files)[0].name.split('.');
				imgName = imgName[0].split(' ').join('')+'-'+Date.now();
				let imageBlob = Object.values(req.files)[0].data.toString('base64');

				let query = `INSERT INTO image SET ?`;
				conn.query(query, {image_name: imgName, image: imageBlob}, 
					(err, results, fields) => {
						if (err) {
							conn.rollback(function() {
								return res.status(500).send(err);
							});
						}
				console.log('Row inserted:' + results.insertId); //image insert success
				obj.image_id = results.insertId;
				conn.query(`INSERT into inventory SET ?`, obj, (error, result) =>{
					if (error) {
						console.log('Rolling back from inventory')
						return conn.rollback(function() {
							return res.status(500).send(err);
						});
					}
					conn.commit((err) =>{
						if(err){
							console.log('Overall rollback')
							return conn.rollback(function() {
								return res.status(500).send(err);
							});
						}
						console.log('Success!');

						output["message"]="Image added Successfully!";
						res.status(200).send(output);
					})
				})
				
			});
			} })
		});
} else {
	output["message"]="Please enter All fields";
	res.status(400).send(output);
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
			image_name, rental_price, original_price, Laundry_count ,laundry_in_date, 
			advance_amount, image 
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
						let result1 = Object.values(JSON.parse(JSON.stringify(result)));
						
						if(results.length != 0){
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
						result1.forEach((element, index) => {

							if(result1[index].Laundry_count != null){
								result1[index].expected_laundry_out_date = 
								calculateDate(result1[index].laundry_in_date, 4);	
							}
						})
						res.status(200).send(result1);
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


router.get('/getWishList/:items', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		console.log(req.params.items);
		let sql=`call order_wishlist(?)`;
		conn.query(sql, req.params.items, (error, result, fields) => {
			if (error) {
				console.log("---"+ error);
				res.status(500).send(error);
			};
			if(result.length != 0 ){
				let orderResult = Object.values(JSON.parse(JSON.stringify(result[0])))
				for (let key in orderResult) {
					let buffer = Buffer.from(orderResult[key].image, 'base64');
					result[0][key].image = `data:image/png;base64,`+Buffer.from(orderResult[key].image).toString();
				}
				res.status(200).send(result);
				return;

			}
			else {
				output["status"]=0;
				output["message"]="No Records Found!";
				res.status(400).send(output);
			} 

		});
	});
});


router.get('/getAdminOrderDetails', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};

		let sql=`select u_name,order_id,item_id,item_name,order_count,return_count,rent_date,return_date,phone,rental_price,advance_amount,image 
		from inventory natural join order_details natural join suborder_details natural join user_details natural join image`;
		conn.query(sql,true,(error, result, fields) => {
			if (error) {
				console.log("---"+ err);
				response.status(500).send(err);
			};
			if(result.length != 0 ){

				for (let key in result) {
					let value = result[key];

				    var buffer = Buffer.from(value.image, 'base64');
					result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();				
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

router.post('/postReturnOrder', function(req, res){
	let query = `call update_orderandsuborder(?,?,?)`;
	let output={};
	let returnOrder =
	{
		o_id: req.body.order_id,	
		i_id: req.body.item_id,
		rc: req.body.actual_return_count
	}
	console.log(req.body)
	if(returnOrder != '0'){
		req.getConnection((error, conn) =>{
			conn.query(query,[returnOrder.o_id,returnOrder.i_id,returnOrder.rc],(err,rows) => {
				if(err) { return res.status(500).send(err); }
				if(rows.length != 0){
					output["message"]="Item is added to laundry!";
					return res.status(200).send(output);
				} 
			else {
			output["message"]="Please enter All fields";
		return res.status(400).send(output);
		}
		});
	});
}

});


router.post('/searchKeyword', function(req, res){
	let query = `call search_keyword('?')`;
	let output={};
	let keyword = req.body.key;

	console.log(req.body.keyword)
	if(keyword != '0'){
		req.getConnection((error, conn) =>{
			conn.query(query,[keyword.key],(err,rows) => {
				if(err) { return res.status(500).send(err); }
				if(rows.length != 0){
					output["message"]="Search Successful";
					return res.status(200).send(output);
				} 
			else {
			output["message"]="Keyword not found";
		return res.status(400).send(output);
		}
		});
	});
}

});


module.exports = router;	