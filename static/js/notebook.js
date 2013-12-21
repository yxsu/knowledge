
var current_notebook;
var current_note;

function listNotes(notebook_guid){
	if(typeof current_notebook == "nodefined"){
		current_notebook = notebook_guid;
		$("#" + current_notebook).addClass("active");
	}else{
		$("#" + current_notebook).removeClass("active");
		current_notebook = notebook_guid;
		$("#" + current_notebook).addClass("active");
	}
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
		if(typeof current_note == "undefined"){
			$("#note_operator").show();
			$("#"+note_guid).addClass("active");
		}
		$('#note_preview_content').html(data);
		$("#"+current_note).removeClass("active");
		current_note = note_guid;
		$('#' + current_note).addClass("active");
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

function toSchema(){
	if(typeof current_note != "undefined"){
		window.location.replace("/note/show/"+current_note);
	}
}