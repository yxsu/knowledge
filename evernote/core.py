import json
from evernote import models
from datetime import datetime
import logging

def updateShapes(note_guid, original_shapes, updated_shapes):
	note = models.Note.objects.get(guid=note_guid)
	#get previous object lists
	if note.content == None or note.content == '':
		objects = dict()
	else:
		objects = json.loads(note.content)

	for shape in json.loads(updated_shapes):
		objects[shape['id']] = shape

	note.content = json.dumps(objects)
	with open('content.txt', 'w') as f:
		f.writelines(note.content)
	note.save()

def updateNoteTitle(note_guid, new_title):
	note = models.Note.objects.get(guid=note_buid)
	note.title = new_title
	note.save()

def createNewNote(note_title, notebook_guid):
	#get notebook
	default_notebook = models.Notebook.objects.get(default_notebook=True)
	#create new note
	new_note = models.Note.objects.create(guid=getNewGuidOfTempNote(),
		title=note_title,notebook=default_notebook)
	return new_note.guid

def getNewGuidOfTempNote():
	temp_notes = models.Note.objects.filter(guid__startswith='temp_')
	index_set = set([int(note.guid[5:]) for note in temp_notes])
	candidate_index = 0
	for i in range(len(index_set) + 1):
		if i not in index_set:
			candidate_index = i
	return 'temp_' + str(candidate_index)