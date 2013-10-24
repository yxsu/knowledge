from django.db import models
# Create your models here.


class AuthUser(models.Model):
    access_token = models.CharField(max_length=300)
    user_name = models.CharField(max_length=30)
    time = models.DateTimeField()
