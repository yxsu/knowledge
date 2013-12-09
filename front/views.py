# Create your views here.
from django.http import HttpResponse
from django.http import HttpRequest
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from oauth.models import AuthUser
from oauth.views import get_current_client
from evernote.sync import *
from evernote import core
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
			core.updateShapes(request.POST['note_guid'], 
					request.POST['existedShapes'], request.POST['updateShapes'])

		return HttpResponse('Save Sucessfully!')
	elif request.method == 'GET':
		#read note content here
		note_title = "New Note"
		notebook_name = "default"
		notebook_guid = "default"
		return render_to_response('note.html', locals())
	else:
		return Http404()

def new_note(request):
		
		#compute the size of temp note
		note_guid = "temp_1"
		note_title = "New Note"
		notebook_name = "default"
		notebook_guid = "default"
		return redirect('/note/' + note_guid)