# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.http import HttpRequest
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from django.core.exceptions import ObjectDoesNotExist
from oauth.models import AuthUser
from oauth.views import get_current_client
from evernote import core
from evernote import sync
from evernote import models
from evernote.edam.error import ttypes as Errors
import datetime
import logging

def index(request):
    if len(AuthUser.objects.all()) > 0:
        return redirect('/notebook/')
    else:
        return redirect('/auth/')

def list_notebook(request):
    notebook_list = core.listNotebooks()
    return render_to_response('list_notebook.html',
                              {'notebook_list': notebook_list})

def show_note(request, note_guid):
	if request.method == 'POST' and note_guid == request.POST['note_guid']:
		if 'new_title' in request.POST:
			core.updateNoteTitle(note_guid, request.POST['new_title'])
		elif 'updateShapes' in request.POST:
			core.updateShapes(request.POST['note_guid'], request.POST['updateShapes'])
		elif 'removedShapes' in request.POST:
			core.removeShapes(request.POST['note_guid'], request.POST['removedShapes'])
		return HttpResponse('Save Sucessfully!')
	elif request.method == 'GET':
		note_list = core.showNotesInSameNotebook(note_guid)
		return render_to_response('note.html', 
				{'title': core.showNoteTitle(note_guid), 
				'schema': models.Note.objects.get(guid=note_guid).getSchema(), 
				'note_guid': note_guid, 'note_list': note_list})
	else:
		return Http404()

def new_note(request):
	#compute the size of temp note
	note_guid = core.createNewNote(note_title='New Note', notebook_guid='default')
	return redirect('/note/show/' + note_guid)

def operate_notebook(request, notebook_guid):
	if request.method == 'POST':
		return  HttpResponse("Sucessfully")
	else:
		#GET
		if 'note_guid' in request.GET:
			content = core.getNoteContent(request.GET['note_guid'])
			return HttpResponse(content)
		else:
			#list notes in the same notebook
			return listNotesInSameNotebook(notebook_guid)

def listNotesInSameNotebook(notebook_guid):
	notes = core.listNotes(notebook_guid)
	if len(notes) == 0:
		return HttpResponse('<div class="row">No note!</div>')
	else:
		response = '<div class="list-group">'
		for note in notes:
			response += '<div class="list-group-item" id="' + note.guid + '" '
			response += 'onclick="showNoteContent('+"'"+note.guid+"'"+');">'
			response += note.title + '</div>'
		return HttpResponse(response)

def syncNotes(request):
	try:
		if request.method == 'POST':
			sync.syncNotes(get_current_client().get_note_store())
			return HttpResponse("<div id=notice>Sucessfully</div>")
		else:
			return Http404()
	except Errors.EDAMSystemException, e:
		if e.errorCode == Errors.EDAMErrorCode.RATE_LIMIT_REACHED:
			delay = datetime.timedelta(seconds=e.rateLimitDuration, hours=8)
			next_time = datetime.datetime.utcnow().replace(microsecond=0) + delay
			return HttpResponse("<div id=notice>Rate limit reached. Please retry after: "+str(next_time)+"</div>")
		else:
			return Http404()

def check_note(request):
	guid = request.GET['link']
	if guid.startswith('evernote'):
		guid = guid.split('/')[-2]
	elif guid.startswith('http'):
		if guid[-1] == '/':
			guid = guid.split('/')[-2]
		else:
			guid = guid.split('/')[-1]
	try:
		note = models.Note.objects.get(guid=guid)
		return HttpResponse("correct guid is :"+guid)
	except ObjectDoesNotExist, e:
		return HttpResponse("<div id=notice>The input guid is invalid</div>")
