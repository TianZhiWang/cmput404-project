# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, user1839132 (http://stackoverflow.com/users/1839132/user1839132)

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
from __future__ import unicode_literals
from django.contrib.auth.models import User

from django.db import models
import uuid
from django.utils import timezone

class Author(models.Model):
    # https://docs.djangoproject.com/en/1.10/ref/models/fields/#uuidfield
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, related_name='author')
    displayName = models.CharField(max_length=150)
    host = models.URLField(default="http://127.0.0.1:8000")
    url = models.URLField(default="http://127.0.0.1:8000")

    def __unicode__(self):
        return str(self.displayName)

class RemoteAuthor(models.Model):
    # https://docs.djangoproject.com/en/1.10/ref/models/fields/#uuidfield
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    displayName = models.CharField(max_length=150)
    host = models.URLField(default="http://127.0.0.1:8000")
    url = models.URLField(default="http://127.0.0.1:8000")

    def __unicode__(self):
        return str(self.displayName)

# This model represents a post object
class Post(models.Model):

    privacyChoices = (
        ("PUBLIC", "PUBLIC"),
        ("PRIVATE", "PRIVATE"),
        ("FOAF", "FOAF"),
        ("FRIENDS", "FRIENDS"),
        ("SERVERONLY", "SERVERONLY"),
    )

    contentTypeChoices = (
        ('text/markdown', 'text/markdown'),
        ('text/plain', 'text/plain')
    )

    # https://docs.djangoproject.com/en/1.10/ref/models/fields/#uuidfield
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    published = models.DateTimeField(default=timezone.now)
    title = models.CharField(max_length=140)
    content = models.CharField(max_length=140)
    description = models.CharField(max_length=140)
    contentType = models.CharField(max_length=32, choices=contentTypeChoices)
    author = models.ForeignKey(Author)
    visibility = models.CharField(max_length=20, default="PUBLIC", choices=privacyChoices)
    # visibleTo will create an intermediate table to represent a ManyToMany relationship with users
    # http://stackoverflow.com/a/2529875 Ludwik Trammer (http://stackoverflow.com/users/262618/ludwik-trammer) (MIT)
    visibleTo = models.ManyToManyField(Author, related_name="visibleTo", blank=True)

    def __unicode__(self):
        return self.title

# This model represents a comment object
# A Post can have many Comments
class Comment(models.Model):
    # https://docs.djangoproject.com/en/1.10/ref/models/fields/#uuidfield
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # http://www.django-rest-framework.org/api-guide/relations/#api-reference
    post = models.ForeignKey(Post, related_name='comments')
    author = models.ForeignKey(Author)
    comment = models.CharField(max_length=140)
    published = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return self.comment

# The FollowingRelationship models the ManyToMany relationship for follows
# A friend exists when (UserA follows UserB) AND (UserB follows UserA)
class FollowingRelationship(models.Model):
    # Written by http://stackoverflow.com/a/13496120 user1839132 (http://stackoverflow.com/users/1839132/user1839132),
    # modified by Kyle Carlstrom (CC-BY-SA 3.0)
    user = models.ForeignKey(Author)
    follows = models.ForeignKey(Author, related_name='follows')

    def __unicode__(self):
        return str(self.user) + '_follows_' + str(self.follows)
