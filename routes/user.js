let express = require('express');
let router = express.Router();


router.get('/orderDetails/:id', (req, res) =>{

	req.getConnection((error, conn) =>{
		let output={};

		let sql=`call user_oderDetails(?)`;
		conn.query(sql, req.params.id,(error, result, fields) => {
			if (error) {
				console.log("---"+ error);
				res.status(500).send(error);
				return;
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
				output["message"]="No Records Found!";
				res.status(400).send(output);
				return;
			} 

		});
	});
});

router.post('/placeOrder', function(request, response) {
	request.getConnection((error, conn) =>{
		let output={};
		console.log(request.body);
		let sql=`call place_order(?)`;
		conn.query(sql, JSON.stringify(request.body), (error, results, fields) => {
		if (error) {
				console.log("---"+ error);
				response.status(500).send(error);
				return;
		} else {
			console.log('Order Placed:' + results.affectedRows);
			output["message"]="Order Placed Success!";
			return response.status(200).send(output);
		}
			
		})			
	})
})

module.exports = router;	