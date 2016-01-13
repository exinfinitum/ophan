var socket = io();


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

$("btn-headlights").on('click', function() {
	socket.emit('headlights-pressed');
});

socket.on('headlights-pressed', function(theText){
	$("btn-headlights").innerHTML = theText;
});

$('#btn-update').bind('mousedown', function() {
//	console.log('update');
//	if (updates_available){
//	socket.emit('perform-update');
//	}
//	else {
	socket.emit('update-software-check');//}
});

socket.on('no-updates-available', function(){
	//make something fade in and out, saying that there aren't any updates available
	alert("No updates available!")
});

socket.on('update-error', function(error){
	//make something fade in and out, saying that there aren't any updates available
	alert("An error occurred while updating: "+ JSON.stringify(error))
});

registerButtonForHoldDown('#btn-upleft',1);
registerButtonForHoldDown('#btn-up',1);
registerButtonForHoldDown('#btn-upright',1);
registerButtonForHoldDown('#btn-left',1);
registerButtonForHoldDown('#btn-center',1);
registerButtonForHoldDown('#btn-right',1);
registerButtonForHoldDown('#btn-downleft',1);
registerButtonForHoldDown('#btn-down',1);
registerButtonForHoldDown('#btn-downright',1);

