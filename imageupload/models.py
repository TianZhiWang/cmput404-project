from __future__ import unicode_literals

from django.db import models


class UploadImages(models.Model):
	image = models.ImageField(upload_to='images', blank=True, null=True)