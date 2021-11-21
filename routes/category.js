let express = require('express');
let router = express.Router();

router.post('/create', function(req, res){
	let query = `select * from category where c_name = ?`;
	let output={};
	let categoryName = req.body.categoryName;
	if(categoryName){
		req.getConnection((error, conn) =>{
			conn.query(query, categoryName,(err,rows) => {
				if(err) throw err;
				if(rows.length != 0){
					output["status"]=0;
					output["message"]="Category already exists!";
					res.send(output);
				} else {productImage
					let stmt = `INSERT INTO category SET ?`;
					conn.query(stmt, {c_name: categoryName}, (err, results, fields) => {
						if (err) {
							return console.error(err.message);
						}
						console.log('Row inserted:' + results.affectedRows);
						output["status"]=1;
						output["message"]="Category added Successfully!";
						res.send(output);
					});
				}
			});
		});
	} else {
		output["status"]=0;
		output["message"]="Please enter Category-Name";
		res.send(output);
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

router.get('/getCategoryDetails/:category_id', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.category_id !=0) {
		conn.query(`select item_name,image,rental_price from category natural join inventory 
			natural join image natural join rental_price where c_id=${req.params.category_id}`,
			(err, result)=>{
				if (err) throw err;
				if(result.length != 0 ){

					for (let key in result) {
						let value = result[key];

						var buffer = Buffer.from(value.image, 'base64');
						result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();
					}
					res.send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.send(output);
				}		
			});
		}
	});
});


router.get('/getPatternDetails/:pattern_id', (req, res) =>{
	req.getConnection((error, conn) =>{
		let output={};
		if (req.params.pattern_id !=0) {
		conn.query(`select item_name,image,rental_price from category natural join inventory 
			natural join image natural join rental_price natural join pattern where p_id=${req.params.pattern_id}`,
			(err, result)=>{
				if (err) throw err;
				if(result.length != 0 ){

					for (let key in result) {
						let value = result[key];

						var buffer = Buffer.from(value.image, 'base64');
						result[key].image = `data:image/png;base64,`+Buffer.from(value.image).toString();
					}
					res.send(result);
				}else {
					output["status"]=0;
					output["message"]="No Records Found!";
					res.send(output);
				}		
			});
		}
	});
});