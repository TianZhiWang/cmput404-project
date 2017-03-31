import base64
from django.contrib.auth.models import User
from server.quickstart.models import Author, FollowingRelationship, User, Node

URL = 'http://127.0.0.1:8000/'

def createNode(us, em, pw, url):
    nodeUser = User.objects.create_user(us, em, pw)
    nodeUser.is_active = True
    nodeUser.save()
    node = Node.objects.create(url=url, user=nodeUser, username=us, password=pw)
    node.save()
    return node


def createAuthor(us, em, pw, isActive=True):
    authorUser = User.objects.create_user(us, em, pw)
    authorUser.is_active = isActive
    authorUser.save()
    # accessed on March 12, 2017
    # from http://www.django-rest-framework.org/api-guide/testing/
    url = URL + "author/" + us + "/"
    author = Author.objects.create(id=us, displayName=us, user=authorUser, url=url, host=URL)
    author.save()
    return author

def createAuthorFriend(us, em, pw, friend):
    author = createAuthor(us, em, pw)
    FollowingRelationship.objects.create(user=author, follows=friend)
    FollowingRelationship.objects.create(user=friend, follows=author)
    return author

def getBasicAuthHeader(us, pw):
        """ Returns the b64encoded string created for a user and password to be used in the header """
        return "Basic %s" % base64.b64encode("%s:%s" % (us, pw))
