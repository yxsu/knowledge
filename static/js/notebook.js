
var current_notebook;

function listNotes(notebook_guid){
	current_notebook = notebook_guid;
	$.ajax({
		url: '/notebook/' + notebook_guid + '/',
		type: 'GET',
		data: {
			guid: notebook_guid
		},
	})
	.done(function(data) {
		console.log("success");
		$('#note_list').html(data);
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
}

function showNoteContent(note_guid) {
	$.ajax({
		url: '/notebook/'+current_notebook+'/',
		type: 'GET',
		data: {note_guid: note_guid},
	})
	.done(function(data) {
		console.log("success");
		$('#note_preview').html(data);
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
	.done(function(data) {
		console.log("success");
		$('#sync').html(data);
	})
	.fail(function(data) {
		console.log("error");
		console.log(data)
		$('#sync').html(data);
	})
	.always(function() {
		console.log("complete");
		$('#sync').show();
	});
	
}