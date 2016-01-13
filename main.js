var http=require('http');
var express=require('express');
var fs = require('fs');
var portnum=process.argv[2];
var app = express();
var server=http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var httppath="html/";
var async = require('async');
var pinlist = [36, 32, 31, 37, 35, 33, 40, 38];
var gpio = require('pi-gpio');

var util = require('util');

var git = require('gitty');
var repo = git('/etc/ophan/');//replace with your data location

const exec = require('child_process').exec;

var rf_forward = 36;
var rf_backward = 32;
var lf_forward = 40;
var lf_backward = 38;
var rb_forward = 31;
var lb_backward = 33;
var lb_forward = 35;
var rb_backward = 37

var pin_assignments = {};

var headlights="false";

var updates_available="false";

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
	console.log('Control');
	res.sendFile(path.join(__dirname, httppath, 'control.html'));
});

app.get('/update', function(req, res){
	console.log('Software Updates');
	res.sendFile(path.join(__dirname, httppath, 'update.html'));
});

function gpioport_init (pinnum) {
	gpio.open(pinnum, "output", function (err) {
		gpio.write(pinnum, 0)});
};

function gpio_init() {
	for (var i = 0; i < pinlist.length; i++)
		gpioport_init(pinlist[i])
	pin_assignments['#btn-upleft'] = [rf_forward];
	pin_assignments['#btn-upright'] = [lf_forward];
	pin_assignments['#btn-downleft'] = [rb_backward];
	pin_assignments['#btn-downright'] = [lb_backward];
	pin_assignments['#btn-up'] = [rb_forward, rf_forward, lb_forward, lf_forward];
	pin_assignments['#btn-down'] = [rb_backward, rf_backward, lb_backward, lf_backward];
	pin_assignments['#btn-left'] = [rb_forward, rf_forward, lb_backward, lf_backward];
	pin_assignments['#btn-right'] = [rb_backward, rf_backward, lb_forward, lf_forward];



};


function gpioport_close (pinnum) {
	gpio.close(pinnum)
};

function gpio_close() {
	for (var i = 0; i < pinlist.length; i++)
		gpioport_close(pinlist[i])
	

};

function gpio_high(pinnum) {
	console.log(pinnum)
	gpio.write(pinnum, 1)
};

function gpio_low(pinnum) {
	console.log(pinnum)
	gpio.write(pinnum, 0)
};





function socketio_init () {io.on('connection', function(socket){

	socket.on('dir-btn-pressed', function(buttonName){
		console.log(buttonName, "pressed");
		if (buttonName !== '#btn-center') {
		for (var i = 0; i < pin_assignments[buttonName].length; i++){
			gpio_high(pin_assignments[buttonName][i]);
		}}
		io.emit('dir-btn-pressed',buttonName);
	});

	socket.on('dir-btn-released', function(buttonName){
		console.log(buttonName, "released");
		if (buttonName !== '#btn-center') {
		for (var i = 0; i < pin_assignments[buttonName].length; i++){
			gpio_low(pin_assignments[buttonName][i]);
		}}
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

	socket.on('update-software-check', function(){
		//Check for updates. If we have updates, download them.
		var get_local_hash = ('git rev-parse master');
		var get_remote_hash = ('git rev-parse origin/master');
		var local_hash;
		var remote_hash;
		updates_available=false;

		console.log('Check update');
		function get_local() { 
		exec (get_local_hash, function (err, stdout, stderr) {
			if (err) {
				console.log(err);
				io.emit('update-error', err);
				return;}
			local_hash = stdout;
		});}

//		function get_remote() {
//		exec (get_remote_hash, function (err, stdout, stderr) {
//			if (err) {
//				io.emit('update-error', err);
//				return;}
//			remote_hash = stdout;
//		});}


		function get_remote() {
					remote_hash = 'None';
		};
		
		function check_updates() {
		if (local_hash == remote_hash){
			io.emit('no-updates-available');}
		else{
			updates_available=true;
			io.emit('updates-available');
		}};
		async.series([get_local, get_remote, check_updates])
	});

	socket.on('perform-update', function () {
		console.log('Imma update...');
	});


});}

server.listen(portnum, function(){
	console.log('Server started, access via http://%s:%s', server.address().host, server.address().port)
})

var thingsToDo = [gpio_init(), socketio_init()]

async.series(thingsToDo, function (err) { if (err) async.series([
gpio_close(),
console.log(err.stack),
console.log('Server error detected, shutting down...'),
process.exit(1),
])});
 
