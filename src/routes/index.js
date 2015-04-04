var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	database: 'assignment3',
	user: 'root',
	password: 'root'
});

connection.connect(function(err) {
	console.log("Connected! (probably) err:" + err);
});

router.get('/',function(req,res){
	res.sendFile(path.resolve(__dirname + '/../views/assignment4.html'));
});

router.post('/query',function(req,res){
	console.log("query: " + req.body.query);
	connection.query(req.body.query, function(err, rows) {
  		if (err) throw err;
  		res.send(rows);
	});
});

router.post('/quit',function(req,res){
	console.log("quitting...");
	connection.end();
	res.send("Successfully quit.");
});

module.exports = router;