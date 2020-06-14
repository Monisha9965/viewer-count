var express = require("express");
var bodyParser = require("body-parser");

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/moni');
mongoose.model('details',
	new Schema({ name: String, email: String, pass: Number, phone: Number, last_seen: Date }),
	'details');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
	console.log("connection succeeded");
})
var details = mongoose.model('details');
var app = express()


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
	extended: true
}));

app.post('/sign_up', function (req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var pass = req.body.password;
	var phone = req.body.phone;

	var data = {
		"name": name,
		"email": email,
		"password": pass,
		"phone": phone,
		"last_seen": new Date()
	}
	db.collection('details').insertOne(data, function (err, collection) {
		if (err) throw err;
		console.log("Record inserted Successfully");
		details.find({}, function (err, result) {
			if (!result) {
				console.log("error");
			} else {
				let response = "<html><body><h1>Recently viewed by</h1>";
				console.log("result length", result.length);
				result.forEach(function (record) {
					response += "<li> Name  : " + record.name + ".<br>Last_seen  : " + record.last_seen + "</li><br>";
				});
				console.log(response)
				response += "</body></html>";
				return res.send(response);
			}
		});

	});

})

app.post('/login', function (req, res) {
	var email = req.body.email;
	var pass = req.body.password;

	var data = {
		"email": email,
		"password": pass,
	}
	details.findOne(data, function (err, collection) {
		if (err) throw err;
		console.log("name ", collection.name);
		console.log("logged in Successfully");

	});
	//insert last viewed
	try {
		details.updateOne(
			{ "email": email },
			{ $set: { "last_seen": new Date() } }
		);
		details.find({}, function (err, result) {
			if (!result) {
				console.log("error");
			} else {
				let response = "<html><body><h1>Recently viewed by</h1>";
				console.log("result length", result.length);
				result.forEach(function (record) {
					response += "<li> Name  : " + record.name + ".<br>Last_seen  : " + record.last_seen + "</li><br>";
				});
				console.log(response)
				response += "</body></html>";
				return res.send(response);
			}
		});

	}
	catch (e) {
		console.log(e);
	}
})

app.get('/login', function (req, res) {
	res.set({
		'Access-control-Allow-Origin': '*'
	});
	return res.sendFile(__dirname + '/login.html');
})

app.get('/sign_up', function (req, res) {
	res.set({
		'Access-control-Allow-Origin': '*'
	});
	return res.sendFile(__dirname + '/sign_up.html');
})

app.get('/', function (req, res) {
	res.set({
		'Access-control-Allow-Origin': '*'
	});
	return res.sendFile(__dirname + '/home.html');
}).listen(3000)


console.log("server listening at port 3000"); 
