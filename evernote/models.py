from django.db import models
from evernote.edam.limits import constants
from datetime import datetime


class Tag(models.Model):
    guid = models.CharField(max_length=constants.EDAM_GUID_LEN_MAX)
    name = models.CharField(max_length=constants.EDAM_TAG_NAME_LEN_MAX)
    parent_guid = models.CharField(max_length=constants.EDAM_GUID_LEN_MAX)
    update_sequence_num = models.IntegerField()


class Notebook(models.Model):
    guid = models.CharField(max_length=constants.EDAM_GUID_LEN_MAX)
    name = models.CharField(max_length=constants.EDAM_NOTEBOOK_NAME_LEN_MAX)
    update_sequence_num = models.IntegerField()
    default_notebook = models.BooleanField()
    service_created = models.DateTimeField()
    service_updated = models.DateTimeField()
    published = models.BooleanField()
    stack = models.CharField(max_length=constants.EDAM_NOTEBOOK_NAME_LEN_MAX)

    def updateContent(self, notebook):
        self.name = notebook.name
        self.update_sequence_num = notebook.updateSequenceNum
        self.default_notebook = notebook.defaultNotebook
        self.service_created = datetime.utcfromtimestamp(notebook.serviceCreated/1000)
        self.service_updated = datetime.utcfromtimestamp(notebook.serviceUpdated/1000)
        self.published = False
        if notebook.stack:
            self.stack = notebook.stack
        else:
            self.stack = ''


class Note(models.Model):
    guid = models.CharField(max_length=constants.EDAM_GUID_LEN_MAX)
    title = models.CharField(max_length=constants.EDAM_NOTE_TITLE_LEN_MAX)
    content = models.TextField(max_length=constants.EDAM_NOTE_CONTENT_LEN_MAX)
    content_hash = models.CharField(max_length=constants.EDAM_HASH_LEN)
    content_length = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now_add=True)
    deleted = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    update_sequence_num = models.IntegerField(default=0)
    notebook = models.ForeignKey(Notebook)
    tags = models.ManyToManyField(Tag)
