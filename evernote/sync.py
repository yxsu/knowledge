from datetime import datetime
from evernote.models import *
from oauth.views import get_current_client
import evernote.edam.type.ttypes as Types
import evernote.edam.notestore.ttypes as StoreTypes
from evernote.edam.limits import constants
import logging

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

def listUpdateStateOfNotes(notebook_guid):
    note_store = get_current_client().get_note_store()
    notebook_filter = StoreTypes.NoteFilter(notebookGuid=notebook_guid)
    spec = StoreTypes.NotesMetadataResultSpec(
        includeContentLength=True, includeUpdated=True,
        includeDeleted=True, includeUpdateSequenceNum=True,
        includeNotebookGuid=True)
    temp_list = note_store.findNotesMetadata(notebook_filter,0, 
        constants.EDAM_USER_NOTES_MAX, spec)
    note_list = temp_list.notes
    while len(note_list) < temp_list.totalNotes:
        temp_list = note_store.findNotesMetadata(notebook_filter,
            len(note_list), constants.EDAM_USER_NOTES_MAX, spec)
        note_list.append(temp_list.notes)
    return note_list

def updateNotebook(notebook_guid):
    cloud_list = listUpdateStateOfNotes(notebook_guid)
    for note in cloud_list:
        local = Note.objects.get(guid=note.guid)
        if local

