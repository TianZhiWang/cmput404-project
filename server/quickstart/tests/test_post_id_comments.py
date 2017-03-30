from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth
from testutils import createAuthor, createAuthorFriend, getBasicAuthHeader

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

    URL = 'http://127.0.0.1:8000/'

    def setUp(self):
        """ Set up is run before each test """
        self.not_active_author = createAuthor(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_MAIL, self.NOT_ACTIVE_USER_PASS, isActive=False)
        self.stranger_author = createAuthor(self.STRANGER_USER_NAME, self.STRANGER_USER_MAIL, self.STRANGER_USER_PASS)
        self.author = createAuthor(self.AUTHOR_USER_NAME, self.AUTHOR_USER_MAIL, self.AUTHOR_USER_PASS)
        self.friend_author = createAuthorFriend(self.FRIEND_USER_NAME, self.FRIEND_USER_MAIL, self.FRIEND_USER_PASS, self.author)
        self.foaf_author = createAuthorFriend(self.FOAF_USER_NAME, self.FOAF_USER_MAIL, self.FOAF_USER_PASS, self.friend_author)

    def test_postidcommentsurl_get_unauth_401(self):
        """ GETing the posts comments w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postIdComments", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_postidcommentsurl_get_unactivated_401(self):
        """ GETing the posts comments w/ unactivated user w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postIdComments", args=[1])
        basicAuth = getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
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
        basicAuth = getBasicAuthHeader(us, pw)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        return response

    def post_a_comment_obj(self, commentText, us, pw, userid, postid):
        url = reverse("postIdComments", args=[postid])
        obj = {
            "query": "addComment",
            "comment": {
                "comment": commentText,
                "author": {
                    "id": "http://testurl.com/author/" + str(userid) + "/",
                    "displayName": us,
                    "url": "http://testurl.com/author/" + str(userid) + "/",
                    "host": "http://testurl.com/"
                }
            }
        }
        basicAuth = getBasicAuthHeader(us, pw)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        return response

    def test_postidcommentsurl_get_basic_auth(self):
        """ GETing the posts comments by author while loggin w/ Basic Auth as author should return a 2XX """
        postResponse = self.post_a_post_obj("a test post", "PUBLIC", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        postid = postResponse.data["id"]
        commentPost = self.post_a_comment_obj("this is one comment", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS, self.author.pk, postid)
        url = reverse("postIdComments", args=[postid])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
