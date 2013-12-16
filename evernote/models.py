from django.db import models
from evernote.edam.limits import constants
from datetime import datetime

base_path = 'database/resources/'

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
        save()


class Note(models.Model):
    guid = models.CharField(max_length=constants.EDAM_GUID_LEN_MAX)
    title = models.CharField(max_length=constants.EDAM_NOTE_TITLE_LEN_MAX)
    content = models.TextField(max_length=constants.EDAM_NOTE_CONTENT_LEN_MAX)
    content_hash = models.CharField(max_length=constants.EDAM_HASH_LEN)
    content_length = models.IntegerField(default=0)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    deleted = models.DateTimeField()
    active = models.BooleanField(default=True)
    update_sequence_num = models.IntegerField(default=0)
    notebook = models.ForeignKey(Notebook)
    tags = models.ManyToManyField(Tag)

    def updateContent(self, note):
        self.guid = note.guid
        self.title = note.title
        self.content = note.title
        self.content_hash = note.contentHash
        self.content_length = note.contentLength
        self.created = note.created
        self.updated = note.updated
        self.deleted = note.deleted
        self.active = note.active
        self.update_sequence_num = note.updateSequenceNum
        self.notebook = Notebook.objects.get(guid=note.notebookGuid)
        #lack of tags
        self.save()


    def save(self, *args, **kwargs):
        if note self.id:
            self.created = datetime.today().replace(microsecond=0)
        self.updated = datetime.today().replace(microsecond=0)
        return super(Note, self).save(*args, **kwargs)


    def getSchema(self):
        file_name = base_path + str(self.guid) +'/knowledge.json'
        if os.path.exists(file_name):
            return open(file_name, 'r').read()
        else:
            return ""

    def setSchema(self, content):
        if not os.path.isdir(base_path+str(self.guid)):
            os.mkdir(base_path+str(self.guid))
        with open(base_path+str(self.guid)+'/knowledge.json', 'w') as f:
            f.write(content)
        #update hash hex of note
        md5 = hashlib.md5()
        md5.update(content)
        hash_hex = binascii.hexlify(md5.digest())
        affix = '<en-media type="text/json" hash="'
        start = self.content.index(affix) + len(affix)
        end = self.content.index('"/>', start)
        self.content = self.content[:start] + hash_hex + self.content[end:]
        self.save()

    def getSchemaResource(self):
        if not os.path.exists(base_path):
            os.mkdir(base_path)
        if not os.path.exists(base_path+str(self.guid)):
            os.mkdir(base_path+str(self.guid))
        #create knowledge.json
        file_name = base_path+str(self.guid)+'/knowledge.json'
        if not os.path.exists(file_name):
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

