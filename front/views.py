# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.http import HttpRequest
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from oauth.models import AuthUser
from oauth.views import get_current_client
from evernote.sync import *
from evernote import core
from evernote import sync
from evernote import models
import logging

def index(request):
    if len(AuthUser.objects.all()) > 0:
        return redirect('/notebook/')
    else:
        return redirect('/auth/')

def list_notebook(request):
    notebook_list = listNotebooks()
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
				'schema': core.getSchema(note_guid), 
				'note_guid': note_guid, 'note_list': note_list})
	else:
		return Http404()

def new_note(request):
	#compute the size of temp note
	note_guid = core.createNewNote(note_title='New Note', notebook_guid='default')
	return redirect('/note/show' + note_guid)

def operate_notebook(request, notebook_guid):
	if request.method == 'POST':
		sync.listUpdateStateOfNotes(notebook_guid)
		return  HttpResponse("Sucessfully")
	else:
		return Http404()
