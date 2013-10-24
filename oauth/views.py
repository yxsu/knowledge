from evernote.api.client import EvernoteClient
from django.core.urlresolvers import reverse
from django.shortcuts import render_to_response
from django.shortcuts import redirect
from oauth.models import AuthUser
from datetime import datetime
from evernote.sync import updateNotebookList
EN_CONSUMER_KEY = 'suyuxin-9809'
EN_CONSUMER_SECRET = 'f2541e0d8ea719ff'


def get_current_client():
    """for internal use
    """
    token = AuthUser.objects.order_by('-time')[0].access_token
    return get_evernote_client(token)


def get_evernote_client(token=None):
    if token:
        return EvernoteClient(token=token, sandbox=False)
    else:
        return EvernoteClient(
            consumer_key=EN_CONSUMER_KEY,
            consumer_secret=EN_CONSUMER_SECRET,
            sandbox=False
        )


def index(request):
    return render_to_response('oauth/index.html')


def auth(request):
    client = get_evernote_client()
    callbackUrl = 'http://%s%s' % (
        request.get_host(), reverse('evernote_callback'))
    request_token = client.get_request_token(callbackUrl)

    # Save the request token information for later
    request.session['oauth_token'] = request_token['oauth_token']
    request.session['oauth_token_secret'] = request_token['oauth_token_secret']

    # Redirect the user to the Evernote authorization URL
    return redirect(client.get_authorize_url(request_token))


def callback(request):
    try:
        client = get_evernote_client()
        access_token = client.get_access_token(
            request.session['oauth_token'],
            request.session['oauth_token_secret'],
            request.GET.get('oauth_verifier', '')
        )
        AuthUser.objects.create(access_token=access_token,
                                user_name='suyuxin',
                                time=datetime.today())
    except KeyError:
        return redirect('/')
    updateNotebookList()
    return redirect('/notebook/')


def reset(request):
    return redirect('/')
