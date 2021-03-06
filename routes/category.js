let express = require('express');
let router = express.Router();

router.post('/create', function(req, res){
	let query = `select * from category where c_name = ?`;
	let output={};
	let categoryName = req.body.categoryName;
	console.log(req.body)
	if(categoryName != ''){
		req.getConnection((error, conn) =>{
			conn.query(query, categoryName,(err,rows) => {
				if(err) { return res.status(500).send(err); }
				if(rows.length != 0){
					output["message"]="Category already exists!";
					return res.status(400).send(output);
				} else {
					let stmt = `INSERT INTO category SET ?`;
					conn.query(stmt, {c_name: categoryName}, (err1, results, fields) => {
						if (err1) {
							return res.status(500).send(err1);
						}
						output["message"]="Category added Successfully!";
						return res.status(200).send(output);
					});
				}
			});
		});
	} else {
		output["message"]="Please enter category name";
		return res.status(400).send(output);
	}
});


router.post('/createCloth', function(req, res){
	let query = `select * from clothmaterial where material_name = ?`;
	let output={};
	let clothName = req.body.clothName;
	console.log(req.body)
	if(clothName != ''){
		req.getConnection((error, conn) =>{
			conn.query(query, clothName,(err,rows) => {
				if(err) { return res.status(500).send(err); }
				if(rows.length != 0){
					output["message"]="Clothmaterial already exists!";
					return res.status(400).send(output);
				} else {
					let stmt = `INSERT INTO clothmaterial SET ?`;
					conn.query(stmt, {material_name: clothName}, (err, results, fields) => {
						if (err) {
							return console.error(err.message);
						}
						output["message"]="Clothmaterial added Successfully!";
						return res.status(200).send(output);
					});
				}
			});
		});
	} else {
		output["message"]="Please enter material name";
		return res.status(400).send(output);
	}
});


router.post('/createPattern', function(req, res){
	let query = `select * from pattern where p_name = ? and (c_id = ?)`;
	let output={};
	let addpattern =
	{
		p_name: req.body.patternName,
		c_id: req.body.categoryId
	}
	console.log(req.body)
	if(addpattern.p_name != ''){
		req.getConnection((error, conn) =>{
			conn.query(query,[addpattern.p_name,addpattern.c_id],(err,rows) => {
				if(err) { return res.status(500).send(err); }
				if(rows.length != 0){
					output["message"]="Pattern already exists!";
					return res.status(400).send(output);
				} else {
					let stmt = `INSERT INTO pattern SET ?`;
					conn.query(stmt,addpattern, (err, results, fields) => {
						if (err) {
							return console.error(err.message);
						}
						output["message"]="Pattern added Successfully!";
						return res.status(200).send(output);
					});
				}
			});
		});
	} else {
		output["message"]="Please enter pattern name or category name";
		return res.status(400).send(output);
	}
});


router.delete('/delete/:id', function(req, res){
	let query=`DELETE FROM category WHERE c_id = ${req.params.id}`;
	req.getConnection((error, conn) =>{
		conn.query(query, (err, rows) => {
			if(err)	if(err) throw err;
			console.log('Deleted Row(s):', rows.affectedRows);
			res.send({
				"status":1,
				"message": 'Deleted Row(s):'+ rows.affectedRows
			})

		});
	});
	
})

module.exports = router;	


router.get('/getCategory', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		
		conn.query(`select * from category`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){
					res.status(200).send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}		
			});
	});
});

router.get('/getPattern', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		
		conn.query(`select * from pattern`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){
					res.status(200).send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}		
			});
	});
});

router.get('/getColor', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		
		conn.query(`select * from color`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){
					res.status(200).send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}		
			});
	});
});


router.get('/getSize', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		
		conn.query(`select * from size`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){
					res.status(200).send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}		
			});
	});
});

router.get('/getCloth', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		
		conn.query(`select * from clothmaterial`,
			(err, result)=>{
				if (err) {
					console.log("---"+ err);
					response.status(500).send(err);
				};
				if(result.length != 0 ){
					res.status(200).send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.status(400).send(output);
				}		
			});
	});
});


router.get('/getCategoryDetails/:category_id', (req, res) =>{
	console.log(req.params.category_id);
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.category_id !=0) {
			conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
				rental_price, original_price,count_inv,laundry_in_date,laundry_out_date,image
				from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
				pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image natural join laundry where c_id in (${req.params.category_id})`,
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
						res.status(200).send(result);
					}else {
						output["status"]=0;
						output["message"]="No Records Found!";
						res.status(400).send(output);
					}		
				});
		}
	});
});


router.get('/getPatternDetails/:pattern_id', (req, res) =>{
	console.log(req.params.pattern_id);
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.pattern_id !=0) {
			conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
				rental_price, original_price,count_inv, image
				from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
				pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image
				where c_id in (select c_id from pattern natural join category where p_id in (${req.params.pattern_id}))`,
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
						res.status(200).send(result);
					}else {
						output["status"]=0;
						output["message"]="No Records Found!";
						res.status(400).send(output);
					}		
				});
		}
	});
});




router.get('/getClothDetails/:clothmaterial_id', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.clothmaterial_id !=0) {
			conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
				rental_price, original_price,count_inv, image
				from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
				pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image 
				where cloth_id=${req.params.clothmaterial_id}`,
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
						res.status(200).send(result);
					}else {
						output["status"]=0;
						output["message"]="No Records Found!";
						res.status(400).send(output);
					}		
				});
		}
	});
});


router.get('/getColorDetails/:c_id', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.c_id !=0) {
			conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
				rental_price, original_price,count_inv, image
				from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
				pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image 
				where color_id=${req.params.c_id}`,
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
						res.status(200).send(result);
					}else {
						output["status"]=0;
						output["message"]="No Records Found!";
						res.status(400).send(output);
					}		
				});
		}
	});
});


router.get('/getSizeDetails/:size_id', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.size_id !=0) {
			conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name,
				rental_price, original_price,count_inv, image
				from inventory NATURAL JOIN category natural join clothmaterial NATURAL JOIN
				pattern NATURAL JOIN color NATURAL JOIN size NATURAL JOIN image where s_id=${req.params.size_id}`,
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
						res.status(200).send(result);
					}else {
						output["status"]=0;
						output["message"]="No Records Found!";
						res.status(400).send(output);
					}		
				});
		}
	});
});