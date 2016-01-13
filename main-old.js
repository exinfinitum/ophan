var http=require('http');
var express=require('express');
var fs = require('fs');
var portnum=process.argv[2];
var app = express();
var server=http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var httppath="html/";


var headlights="false";
app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(req, res){
	console.log('Main page');
	res.sendFile(path.join(__dirname, httppath, 'index.html'));
});

app.get('/about', function(req, res){
	console.log('About');
	res.sendFile(path.join(__dirname, httppath, 'about.html'));
});

app.get('/control', function(req, res){
	console.log('About');
	res.sendFile(path.join(__dirname, httppath, 'control.html'));
});

io.on('connection', function(socket){

	socket.on('dir-btn-pressed', function(buttonName){
		console.log(buttonName, "pressed");
		io.emit('dir-btn-pressed',buttonName);
	});

	socket.on('dir-btn-released', function(buttonName){
		console.log(buttonName, "released");
		io.emit('dir-btn-released',buttonName);
	});

	socket.on('headlights-pressed', function(){
		console.log("headlights are ", headlights);
		headlights = !Boolean(headlights);
		var text = "";
		if (headlights) {
			text = "On";
		} else {
			text = "Off";
		}
		io.emit('headlights-pressed', "Headlights ".concat(text));
	});




});

server.listen(portnum, function(){
	console.log('Server started, access via http://%s:%s', server.address().host, server.address().port)
})
