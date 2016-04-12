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

var demo="false";

process.chdir('/etc/ophan/');

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

	socket.on('demo-pressed', function(){
		
		demo = !Boolean(demo);
		var text = "";
		if (demo) {
		for (var i = 0; i < pin_assignments['#btn-right'].length; i++){
			gpio_high(pin_assignments['#btn-right'][i]);
		}
		} else {
		for (var i = 0; i < pin_assignments['#btn-right'].length; i++){
			gpio_low(pin_assignments['#btn-right'][i]);
		}
		}
		io.emit('demo-pressed', "Dancing ".concat(text));
	});

	socket.on('update-software-check', function(){
		//Check for updates. If we have updates, download them.
		var get_local_hash = ('git rev-parse master');
		var get_remote_hash = ('git rev-parse origin/master');
		var local_hash;
		var remote_hash;

		console.log('Check update');

		function git_fetch(callback) { 
		exec ('git fetch', function (err, stdout, stderr) {
			if (err) {
				console.log(err);
				io.emit('update-error', stderr);
				return;}
			callback();
		});}

		function get_local(callback) { 
		exec (get_local_hash, function (err, stdout, stderr) {
			if (err) {
				console.log(err);
				io.emit('update-error', stderr);
				return;}
			local_hash = stdout;
			callback();
		});}

		function get_remote(callback) { 
		exec (get_remote_hash, function (err, stdout, stderr) {
			if (err) {
				console.log(err);
				io.emit('update-error', stderr);
				return;}
			remote_hash = stdout;
			callback();
		});}

		function check_updates(callback) {
		if (local_hash === remote_hash){
			io.emit('no-updates-available');}
		else{
			io.emit('updates-available');
		}
		callback();
		};
		async.series([git_fetch, get_local, get_remote, check_updates])
	});

	socket.on('perform-update', function () {
		//Perform a git pull. Warn the user that we're going to reboot the system.
		console.log("Git pulling")
		function perform_git_pull (callback) {
		exec ("git pull --no-edit", function (err, stdout, stderr) {
		console.log(err)
		if (err) {
			console.log(err);
			io.emit('update-error', stderr);
			return;}
			console.log(stdout);

		});
		}
		function update_alert() { io.emit('update-alert')};
		function updating_alert() { io.emit('updating-alert')};

		async.series[updating_alert, perform_git_pull, update_alert];
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
 
