# Create your views here.
from django.http import HttpResponse
from django.http import HttpRequest
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from oauth.models import AuthUser


def index(request):
    if len(AuthUser.objects.all()) > 0:
        return render_to_response('index.html')
    else:
        return redirect('/auth/')
   
