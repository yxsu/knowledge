from datetime import datetime
from evernote.models import *
import evernote.edam.type.ttypes as Types
import evernote.edam.notestore.ttypes as StoreTypes
from evernote.edam.limits import constants
from evernote import core
import binascii
import pickle
import logging
import sys
import os


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

def syncNotes(note_store):
    #get the status of last sync
    if os.path.exists('database/sync_state.dat'):
        last_status = pickle.load(open('database/sync_state.dat', 'r'))
    else:
        last_status = StoreTypes.SyncState()
    #get the status of server
    server_status = note_store.getSyncState()
    #update content from server to client
    if server_status.updateCount > last_status.updateCount:
        downloadFromServer(last_status, server_status, note_store)
    #update content from client to server
    uploadTempNotes(note_store) 
    uploadNoteToServer(last_status, server_status, note_store)
    #save sync state
    pickle.dump(server_status, open('database/sync_state.dat', 'w'))

def uploadNoteToServer(last_status, server_status, note_store):
    local_notes = Note.objects.filter(update_sequence_num=sys.maxint)
    for note in local_notes:
        new_note = Types.Note(guid=note.guid)
        new_note.title = note.title
        new_note.resources = [note.getSchemaResource()]
        new_note.content = note.content
        new_note.notebookGuid = note.notebook.guid
        updated_note = note_store.updateNote(new_note)
        #save in local database
        note.updateContent(updated_note)

def downloadFromServer(last_status, server_status, note_store):
    chunk_filter = StoreTypes.SyncChunkFilter(includeNotes=True, includeNoteResources=True)
    #first chunk
    chunk = note_store.getFilteredSyncChunk(last_status.updateCount, 100, chunk_filter)
    for note in chunk.notes:
        updateNote(note, note_store)
    while chunk.chunkHighUSN < chunk.updateCount:
        chunk = note_store.getFilteredSyncChunk(chunk.chunkHighUSN, 100, chunk_filter)
        for note in chunk.notes:
            updateNote(note, note_store)

def updateNote(note, note_store):
    if type(note.deleted) == int:
        return
    if Note.objects.filter(guid=note.guid).exists():
        local_note = Note.objects.get(guid=note.guid)
        if local_note.update_sequence_num == sys.maxint:#dirty flag
            return
        if local_note.update_sequence_num + 1 < note.updateSequenceNum:
            note.content = note_store.getNoteContent(note.guid)
            local_note.updateContent(note)
    else:
        local_note = Note()
        note.content = note_store.getNoteContent(note.guid)
        local_note.updateContent(note)
    logging.error('update : '+note.title)
    #save knowledge.json
    if note.resources:
        for res in note.resources:
            if res.mime == 'text/json':
                updateNoteResources(res, note_store)


def updateNoteResources(resource, note_store):
    if not os.path.exists(base_path + '/' + resource.noteGuid):
        os.mkdir(base_path+'/' + resource.noteGuid)
    with open(base_path +'/' + resource.noteGuid + '/knowledge.json', 'w') as f:
        f.write(note_store.getResourceData(resource.guid))


def uploadTempNotes(note_store):
    note_store = get_current_client().get_note_store()
    temp_notes = Note.objects.filter(guid__startswith='temp_')
    temp_notes.delete()
    if not temp_notes:
        return
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
        logging.error('upload : '+note.title)
        note.updateContent(created_note)


