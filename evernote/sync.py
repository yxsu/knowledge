from datetime import datetime
from evernote.models import *
from oauth.views import get_current_client

def updateNotebookList():
    note_store = get_current_client().get_note_store()
    local_guid_set = {notebook.guid for notebook in Notebook.objects.all()}
    for notebook in note_store.listNotebooks():
        if notebook.guid in local_guid_set:
            local = Notebook.objects.get(guid=notebook.guid)
            if notebook.updateSequenceNum > local.update_sequence_num:
                local.updateContent(notebook)
                local.save()
        else:
            new = Notebook(guid=notebook.guid)
            new.updateContent(notebook)
            new.save()
            

def listNotebooks():
    return Notebook.objects.order_by('name')
