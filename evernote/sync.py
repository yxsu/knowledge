from datetime import datetime
from evernote.models import *
from oauth.views import get_current_client
import evernote.edam.type.ttypes as Types
import evernote.edam.notestore.ttypes as StoreTypes
from evernote.edam.limits import constants
from evernote import core
import binascii
import pickle
import logging
import sys

note_store = get_current_client().get_note_store()

def updateNotebookList():
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
            
def listNotebooks():
    return Notebook.objects.order_by('name') 

def listUpdateStateOfNotes(notebook_guid):
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

def syncNotes():
    #get the status of last sync
    if os.path.exists('database/sync_state.dat'):
        last_status = pickle.load(open('database/sync_state.dat', 'r'))
    else:
        last_status = StoreTypes.SyncState()
    #get the status of server
    note_store = get_current_client().get_note_store()
    server_status = note_store.getSyncState()
    #update content from server to client
    if server_status.updateCount > last_status.updateCount:
        downloadFromServer(last_status, server_status)
    #update content from client to server
    uploadTempNotes() 
    uploadNoteToServer(last_status, server_status)
    #save sync state
    pickle.dump(server_status, open('database/sync_state.dat', 'w'))

def uploadNoteToServer(last_status, server_status):
    local_notes = Note.objects.filter(update_sequence_num=sys.maxint)
    

def downloadFromServer(last_status, server_status):
    chunk_filter = StoreTypes.SyncChunkFilter(includeNotes=True, includeNoteResources=True)
    #first chunk
    chunk = note_store.getFilteredSyncChunk(last_status.updateCount, 100, chunk_filter)
    for note in chunk.notes:
        updateNote(note)
    while chunk.chunkHighUSN < chunk.updateCount:
        chunk = note_store.getFilteredSyncChunk(chunk.chunkHighUSN, 100, chunk_filter)
        for note in chunk.notes:
            updateNote(note_store.getNote(note.guid, True, False, False, False))

def updateNote(note):
    local_note = Note.objects.get(guid=note.guid)
    if local_note:
        local_note.updateContent(note)
    else:
        local_note = Note()
        local_note.updateContent(note)
    #save knowledge.json
    for res in note.resources:
        if res.mime == 'text/json':
            updateNoteResources(res)


def updateNoteResources(resource):
    if not os.path.exists(base_path + '/' + resource.noteGuid):
        os.mkdir(base_path+'/' + resource.noteGuid)
    with open(base_path +'/' + resource.noteGuid + '/knowledge.json', 'w') as f:
        f.write(note_store.getResourceData(resource.guid))


def uploadTempNotes():
    note_store = get_current_client().get_note_store()
    temp_notes = Note.objects.filter(guid__startswith='temp_')
    for note in temp_notes:
        new_note = Types.Note()
        new_note.title = note.title
        new_note.resources = [note.getSchemaResource()]
        new_note.content = note.content
        new_note.noteGuid = note.notebook.guid
        created_note = note_store.createNote(new_note)
        #change directory of knowledge.json
        os.rename(models.base_path+note.guid, models.base_path+created_note.guid)
        #save in local database
        note.updateContent(created_note)


