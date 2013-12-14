import json
from evernote import models
from datetime import datetime
import evernote.edam.type.ttypes as Types
import os
import logging
import hashlib
import binascii

base_path = 'database/resources/'

def updateShapes(note_guid, updated_shapes):
	raw = getSchema(note_guid)
	if raw == "":
		objects = dict()
	else:
		objects = json.loads(raw)

	for shape in json.loads(updated_shapes):
		objects[shape['id']] = shape
	setSchema(note_guid, json.dumps(objects))

def removeShapes(note_guid, removedShapes):
	objects = json.loads(getSchema(note_guid))
	for shape in json.loads(removedShapes):
		del objects[shape['id']]
	setSchema(note_guid, json.dumps(objects))

def updateNoteTitle(note_guid, new_title):
	note = models.Note.objects.get(guid=note_guid)
	note.title = new_title
	note.save()

def createNewNote(note_title, notebook_guid):
	#get notebook
	default_notebook = models.Notebook.objects.get(default_notebook=True)
	#create an empty knowledge.json file
	note_guid = getNewGuidOfTempNote()
	resource = createSchemaResources(note_guid);
	hash_hex = binascii.hexlify(resource.data.bodyHash)
	#create new note
	note = models.Note.objects.create(guid=note_guid,
		title=note_title,notebook=default_notebook)
	note.content = '<?xml version="1.0" encoding="UTF-8"?>'
	note.content += '<!DOCTYPE en-note SYSTEM ' \
    	'"http://xml.evernote.com/pub/enml2.dtd">'
	note.content += '<en-note><en-media type="'
	note.content += resource.mime + '" hash="' + hash_hex + '"/>'
	note.content += '</en-note>'
	note.save()
	return note.guid

def createSchemaResources(note_guid):
	if not os.path.exists(base_path):
		os.mkdir(base_path)
	if not os.path.exists(base_path+str(note_guid)):
		os.mkdir(base_path+str(note_guid))
	#create knowledge.json
	file_name = base_path+str(note_guid)+'/knowledge.json'
	with open(file_name, 'w') as f:
		f.write(" ")
	#compute hash value
	raw = open(file_name, 'rb').read()
	md5 = hashlib.md5()
	md5.update(raw)
	hash = md5.digest()
	#buid Data
	data = Types.Data()
	data.size = len(raw)
	data.bodyHash = hash
	data.body = raw
	#build Resources
	resource = Types.Resource()
	resource.mime = 'text/json'
	resource.data = data
	return resource

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

def getSchema(note_guid):
	file_name = base_path + str(note_guid) +'/knowledge.json'
	if os.path.exists(file_name):
		return open(file_name, 'r').read()
	else:
		return ""

def setSchema(note_guid, content):
	if not os.path.isdir(base_path+str(note_guid)):
		os.mkdir(base_path+str(note_guid))
	with open(base_path+str(note_guid)+'/knowledge.json', 'w') as f:
		f.write(content)


def showNotesInSameNotebook(note_guid):
	notebook = models.Note.objects.get(guid=note_guid).notebook
	return models.Note.objects.filter(notebook=notebook)

