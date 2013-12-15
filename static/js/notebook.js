
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