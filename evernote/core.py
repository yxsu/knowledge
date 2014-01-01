import json
from evernote import models
from datetime import datetime
import evernote.edam.type.ttypes as Types
import os
import logging
import hashlib
import binascii
import shutil

def updateShapes(note_guid, updated_shapes):
	note = models.Note.objects.get(guid=note_guid)
	raw = note.getSchema()
	if raw == "":
		objects = dict()
	else:
		objects = json.loads(raw)

	for shape in json.loads(updated_shapes):
		objects[shape['id']] = shape
	note.setSchema(json.dumps(objects))

def removeShapes(note_guid, removedShapes):
	note = models.Note.objects.get(guid=note_guid)
	objects = json.loads(note.getSchema())
	for shape in json.loads(removedShapes):
		del objects[shape['id']]
	note.setSchema(json.dumps(objects))


def updateNoteTitle(note_guid, new_title):
	note = models.Note.objects.get(guid=note_guid)
	note.title = new_title
	note.save()

def createNewNote(note_title, notebook_guid):
	#get notebook
	try:
		notebook = models.Notebook.objects.get(guid=notebook_guid)	
	except Exception, e:
		notebook = models.Notebook.objects.get(default_notebook=True)
	#create an empty knowledge.json file
	note_guid = getNewGuidOfTempNote()
	#create new note
	note = models.Note.objects.create(guid=note_guid,
		title=note_title,notebook=notebook)
	resource = note.getSchemaResource()
	hash_hex = binascii.hexlify(resource.data.bodyHash)
	note.content = '<?xml version="1.0" encoding="UTF-8"?>'
	note.content += '<!DOCTYPE en-note SYSTEM ' \
    	'"http://xml.evernote.com/pub/enml2.dtd">'
	note.content += '<en-note><en-media type="'
	note.content += resource.mime + '" hash="' + hash_hex + '"/>'
	note.content += '</en-note>'
	note.save()
	return note.guid

def getNewGuidOfTempNote():
	temp_notes = models.Note.objects.filter(guid__startswith='temp_')
	index_set = set([int(note.guid[5:]) for note in temp_notes])
	candidate_index = 0
	for i in range(len(index_set) + 1):
		if i not in index_set:
			candidate_index = i
	return 'temp_' + str(candidate_index)


def showNoteTitle(note_guid):
	return models.Note.objects.get(guid=note_guid).title


def showNotesInSameNotebook(note_guid):
	notebook = models.Note.objects.get(guid=note_guid).notebook
	return models.Note.objects.filter(notebook=notebook).order_by('-updated')


def listNotebooks():
    result = list()
    notebooks = models.Notebook.objects.order_by('name')
    for notebook in notebooks:
        result.append({
            'guid': notebook.guid,
            'name': notebook.name,
            'count': len(models.Note.objects.filter(notebook=notebook))
            })
    return  result


def listNotes(notebook_guid):
	notebook = models.Notebook.objects.get(guid=notebook_guid)
	return models.Note.objects.filter(notebook=notebook)

def getNoteContent(note_guid):
	return models.Note.objects.get(guid=note_guid).content

def removeNote(note_guid):
	models.Note.objects.filter(guid=note_guid).delete()
        resources_directory = models.base_path+note_guid+'/'
        if os.path.exists(resources_directory):
            shutil.rmtree(resources_directory)