# Create your views here.
from django.http import HttpResponse
from django.http import HttpRequest
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from oauth.models import AuthUser
from oauth.views import get_current_client
from evernote.sync import *

def index(request):
    if len(AuthUser.objects.all()) > 0:
        return redirect('/notebook/')
    else:
        return redirect('/auth/')


def list_notebook(request):
    notebook_list = listNotebooks()
    return render_to_response('list_notebook.html',
                              {'notebook_list': notebook_list})


def show_note(request):
    return render_to_response('note.html')
