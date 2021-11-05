let express = require('express');
let app = express();

app.get('/getDetails', (req, res) =>{
	req.getConnection((error, conn) =>{

		let userid=req.query.userid;
		let output={};

		conn.query(`select item_id,item_name,c_name,material_name,p_name,color,s_name from inventory 
			NATURAL JOIN category natural join clothmaterial NATURAL JOIN pattern NATURAL JOIN color NATURAL JOIN size`,(err, result)=>{
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

module.exports = app;	