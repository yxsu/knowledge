from datetime import datetime
from evernote import models
import evernote.edam.type.ttypes as Types
from evernote.edam.error import ttypes as Errors
import evernote.edam.notestore.ttypes as StoreTypes
from evernote.edam.limits import constants
from evernote import core
import binascii
import hashlib
import pickle
import logging
import sys
import os


def updateNotebookList(note_store):
    local_guid_set = {notebook.guid for notebook in models.Notebook.objects.all()}
    for notebook in note_store.listNotebooks():
        if notebook.guid in local_guid_set:
            local = models.Notebook.objects.get(guid=notebook.guid)
            if notebook.updateSequenceNum > local.update_sequence_num:
                local.updateContent(notebook)
                local.save()
        else:
            new = models.Notebook(guid=notebook.guid)
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
    #update notebook
    updateNotebookList(note_store)
    #update content from server to client
    if server_status.updateCount > last_status.updateCount:
        downloadFromServer(last_status, server_status, note_store)
    #update content from client to server
    uploadTempNotes(note_store) 
    uploadNoteToServer(last_status, server_status, note_store)
    #save sync state
    pickle.dump(server_status, open('database/sync_state.dat', 'w'))

def uploadNoteToServer(last_status, server_status, note_store):
    local_notes = models.Note.objects.filter(update_sequence_num=sys.maxint)
    for note in local_notes:
        new_note = Types.Note(guid=note.guid)
        new_note.title = note.title
        new_note.resources = [note.getSchemaResource()]
        new_note.content = note.content
        new_note.notebookGuid = note.notebook.guid
        updated_note = note_store.updateNote(new_note)
        updated_note.content = note.content
        #save in local database
        note.updateContent(updated_note)

def downloadFromServer(last_status, server_status, note_store):
    chunk_filter = StoreTypes.SyncChunkFilter(includeNotes=True, includeNoteResources=True)
    #first chunk
    chunk = note_store.getFilteredSyncChunk(last_status.updateCount, 100, chunk_filter)
    if not chunk.notes:
        return
    for note in chunk.notes:
        updateNote(note, note_store)
    while chunk.chunkHighUSN < chunk.updateCount:
        chunk = note_store.getFilteredSyncChunk(chunk.chunkHighUSN, 100, chunk_filter)
        if not chunk.notes:
            return
        for note in chunk.notes:
            updateNote(note, note_store)

def updateNote(note, note_store):
    if note.deleted:
        core.removeNote(note.guid)
        return
    if models.Note.objects.filter(guid=note.guid).exists():
        local_note = models.Note.objects.get(guid=note.guid)
        if local_note.update_sequence_num == sys.maxint:#dirty flag
            return
        if local_note.update_sequence_num + 1 < note.updateSequenceNum:
            note.content = note_store.getNoteContent(note.guid)
            updateNoteResources(note.guid, note.resources, note_store)
            local_note.updateContent(note)
    else:
        local_note = models.Note()
        note.content = note_store.getNoteContent(note.guid)
        updateNoteResources(note.guid, note.resources, note_store)
        local_note.updateContent(note)
    
def updateNoteResources(note_guid, resources, note_store):
    if not resources:
        return
    if not os.path.exists(models.base_path + '/' + note_guid):
        os.mkdir(models.base_path+'/' + note_guid)
    for res in resources:
        #only update json and the related pdf file
        if res.attributes.fileName in ['knowledge.json', 'knowledge.pdf']:
            name = models.base_path +'/' + res.noteGuid + '/'+res.attributes.fileName
            data = note_store.getResourceData(res.guid)
            #checksum
            md5 = hashlib.md5()
            md5.update(data)
            if res.data.bodyHash != md5.digest():
                raise Errors.EDAMUserException(errorCode=Errors.EDAMErrorCode.DATA_CONFLICT)
            with open(name, 'wb') as f:
                f.write(data)


def uploadTempNotes(note_store):
    temp_notes = models.Note.objects.filter(guid__startswith='temp_')
    if not temp_notes:
        return
    for note in temp_notes:
        new_note = Types.Note()
        new_note.title = note.title
        new_note.resources = [note.getSchemaResource()]
        logging.error(new_note.resources[0].data.size)
        new_note.content = note.content
        new_note.notebookGuid = note.notebook.guid
        try:
            created_note = note_store.createNote(new_note)
            created_note.content = note.content
            #change directory of knowledge.json
            os.rename(models.base_path+note.guid, models.base_path+created_note.guid)
            #save in local database
            note.updateContent(created_note)
        except Errors.EDAMUserException, e:
            core.removeNote(note.guid)

        


