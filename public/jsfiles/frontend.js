var socket = io();
var updates_available = false;

function registerButtonForHoldDown(buttonName, holdInterval){
//	$(buttonName).mousedown( function() {
//		interval = setInterval(function() {
//		socket.emit('dir-btn-pressed',buttonName)
//		},holdInterval);
//	});
/*
	$(buttonName).on('click', function() {
		socket.emit('dir-btn-pressed',buttonName);
	});
*/

//	$(buttonName).mousedown( function() {
//		socket.emit('dir-btn-pressed',buttonName)
//	});
//	$(buttonName).mouseup( function() {
//		socket.emit('dir-btn-released',buttonName)
//	});
	$(buttonName).bind ('mousedown touchstart', function() {
		socket.emit('dir-btn-pressed',buttonName)
	});
	$(buttonName).bind ('mousedown touchend', function() {
		socket.emit('dir-btn-released',buttonName)
	});

	$(buttonName).mouseout( function() {
		socket.emit('dir-btn-released',buttonName)
	});
}

socket.on('dir-btn-pressed', function(buttonName){
	$(buttonName).addClass('pressed');
});

socket.on('dir-btn-released', function(buttonName){
	$(buttonName).removeClass('pressed');
});


$('#btn-update').bind('mousedown', function() {
	console.log('update');
	if (updates_available){
	socket.emit('perform-update');
	}
	else {
	socket.emit('update-software-check');}
});

socket.on('no-updates-available', function(){
	//make something fade in and out, saying that there aren't any updates available
	show_info('No updates available', 'Please try again later');
});

socket.on('updates-available', function(){
	//make something fade in and out, saying that there aren't any updates available
	updates_available = true;
	$('#btn-update').html("Updates available - Click to update");
});

socket.on('update-alert', function(){
	show_info('Update downloaded', "Reboot robot to complete update")
	$('#btn-update').html("Update complete - Reboot required");
	//alert('Updating server software. Robot will now reboot.')
});

socket.on('updating-alert', function(){
	show_info('Beginning update', "Please do not navigate away from this page")
	$('#btn-update').html("Please wait, update in progress...");

	//alert('Updating server software. Robot will now reboot.')
});

socket.on('update-error', function(error){
	//make something fade in and out, saying that there aren't any updates available
	show_error('Update error', "An error occurred while updating: "+ JSON.stringify(error))
});

function show_error (headerMsg, errMsg){
//make something fade in and out, saying that there aren't any updates available
fadeLabel('#update-error', '#update-error-header', '#update-error-msg', headerMsg, 2000, errMsg)
};

function show_info (headerMsg, errMsg){
//make something fade in and out, saying that there aren't any updates available
fadeLabel('#update-info', '#update-info-header', '#update-info-msg', headerMsg, 2000, errMsg)
};

function fadeLabel (labelName, labelHeader, labelMessage, headerMsg, time, message) {
	$(labelHeader).html(headerMsg);
	$(labelMessage).html(message);
	$(labelName).fadeIn(time);
	$(labelName).fadeOut(time);
};

registerButtonForHoldDown('#btn-upleft',1);
registerButtonForHoldDown('#btn-up',1);
registerButtonForHoldDown('#btn-upright',1);
registerButtonForHoldDown('#btn-left',1);
registerButtonForHoldDown('#btn-center',1);
registerButtonForHoldDown('#btn-right',1);
registerButtonForHoldDown('#btn-downleft',1);
registerButtonForHoldDown('#btn-down',1);
registerButtonForHoldDown('#btn-downright',1);

