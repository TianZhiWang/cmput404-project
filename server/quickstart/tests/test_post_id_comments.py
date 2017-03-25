import base64
from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth

class PostIdCommentsTest(APITestCase):
    """ This is the home of all of our tests relating to the post/:id/comments url """

    AUTHOR_USER_NAME = 'author'
    AUTHOR_USER_PASS = 'password127'
    AUTHOR_USER_MAIL = 'author@example.com'

    FRIEND_USER_NAME = 'friend'
    FRIEND_USER_PASS = 'password127'
    FRIEND_USER_MAIL = 'friend@example.com'

    FOAF_USER_NAME = 'foaf'
    FOAF_USER_PASS = 'password127'
    FOAF_USER_MAIL = 'foaf@example.com'

    STRANGER_USER_NAME = 'stranger'
    STRANGER_USER_PASS = 'password127'
    STRANGER_USER_MAIL = 'stranger@example.com'

    NOT_ACTIVE_USER_NAME = 'notative'
    NOT_ACTIVE_USER_PASS = 'password127'
    NOT_ACTIVE_USER_MAIL = 'notative@example.com'

    def createAuthor(self, us, em, pw, isActive=True):
        authorUser = User.objects.create_user(us, em, pw)
        authorUser.is_active = isActive
        authorUser.save()
        author = Author.objects.create(displayName=us, user=authorUser)
        author.save()
        return author

    def createAuthorFriend(self, us, em, pw, friend):
        authorUser = User.objects.create_user(us, em, pw)
        authorUser.save()
        author = Author.objects.create(displayName=us, user=authorUser)
        author.save()
        FollowingRelationship.objects.create(user=author, follows=friend)
        FollowingRelationship.objects.create(user=friend, follows=author)
        return author


    def setUp(self):
        """ Set up is run before each test """
        self.not_active_author = self.createAuthor(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_MAIL, self.NOT_ACTIVE_USER_PASS, isActive=False)
        self.stranger_author = self.createAuthor(self.STRANGER_USER_NAME, self.STRANGER_USER_MAIL, self.STRANGER_USER_PASS)
        self.author = self.createAuthor(self.AUTHOR_USER_NAME, self.AUTHOR_USER_MAIL, self.AUTHOR_USER_PASS)
        self.friend_author = self.createAuthorFriend(self.FRIEND_USER_NAME, self.FRIEND_USER_MAIL, self.FRIEND_USER_PASS, self.author)
        self.foaf_author = self.createAuthorFriend(self.FOAF_USER_NAME, self.FOAF_USER_MAIL, self.FOAF_USER_PASS, self.friend_author)


    def getBasicAuthHeader(self, us, pw):
        """ Returns the b64encoded string created for a user and password to be used in the header """
        return "Basic %s" % base64.b64encode("%s:%s" % (us, pw))

    def test_authoridposturl_get_unauth_401(self):
        """ GETing the posts comments w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postIdComments", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authoridposturl_get_unactivated_401(self):
        """ GETing the posts comments w/ unactivated user w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postIdComments", args=[1])
        basicAuth = self.getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def post_a_post_obj(self, title, visibility, us, pw):
        url = reverse("post")
        obj = {
            "title": title,
            "content": "this is a post dude",
            "description": "im not sure how to describe my post",
            "contentType": "text/markdown",
            "author": "",
            "comments": [],
            "visibility": visibility,
            "visibleTo": []
        }
        basicAuth = self.getBasicAuthHeader(us, pw)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        return response

    def post_a_comment_obj(self, commentText, us, pw, userid, postid):
        url = reverse("postIdComments", args=[postid])
        obj = {
            "query": "addComment",
            "comment": {
                "comment": commentText,
                "author": {
                    "id": userid,
                    "displayName": us
                }
            }
        }
        basicAuth = self.getBasicAuthHeader(us, pw)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        return response

    def test_authoridposturl_get_basic_auth(self):
        """ GETing the posts comments by author while loggin w/ Basic Auth as author should return a 2XX """
        postResponse = self.post_a_post_obj("a test post", "PUBLIC", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        postid = postResponse.data["id"]
        commentPost = self.post_a_comment_obj("this is one comment", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS, self.author.pk, postid)
        url = reverse("postIdComments", args=[postid])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

