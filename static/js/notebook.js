
function listNotes(notebook_guid){
	$.ajax({
		url: '/notebook/' + notebook_guid + '/',
		type: 'POST',
		data: {
			guid: notebook_guid
		},
	})
	.done(function() {
		console.log("success");
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
}

function Sync(){
	console.log("run sync...")
	$('#sync').hide();
	$.ajax({
		url: '/sync/',
		type: 'POST',
		data: {param1: 'value1'},
	})
	.done(function() {
		console.log("success");
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
		$('#sync').show();
	});
	
}