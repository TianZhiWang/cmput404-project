from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth
from testutils import createAuthor, createAuthorFriend, getBasicAuthHeader

class PostIdTest(APITestCase):
    """ This is the home of all of our tests relating to the post/:id url """

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

    def test_postidurl_get_unauth_401(self):
        """ GETing the posts with :id w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postId", args=[1])  # even though this post doesn't exist auth should be checked first
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_postidurl_get_unactivated_401(self):
        """ GETing the posts by :id w/ unactivated user w/o any auth will result in a 401, even if the post doesn't exist yet """
        url = reverse("postId", args=[1])  # even though this post doesn't exist auth should be checked first
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

    def test_postidurl_get_basic_auth(self):
        """ GETing the post by :id while loggedin w/ Basic Auth as author should return a 2XX """
        postResponse = self.post_a_post_obj("test post", "PUBLIC", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_postidurl_delete_basic_auth(self):
        """ Deleting the post by :id while loggedin w/ Basic Auth as author should actually delete the post """
        # create post
        title = "test post title :)"
        postResponse = self.post_a_post_obj(title, "PUBLIC", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        # get post
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        getResponse = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(getResponse.status_code))
        self.assertTrue(getResponse.data["id"] == postId)
        self.assertTrue(getResponse.data["title"] == title)
        # delete post
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        deleteResponse = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(deleteResponse.status_code))
        # get post again
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        getResponseAgain = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(getResponseAgain.status_code))
        self.assertTrue(getResponseAgain.status_code == status.HTTP_404_NOT_FOUND)
        self.assertTrue(getResponseAgain.data["detail"])  # should have a detail saying the post is missing

    def test_postidurl_author_attempt_to_delete_friend_post(self):
        """ When trying to delete the post of frind as author, author shouldn't be able to do it """
        # create post
        title = "test post title :)"
        postResponse = self.post_a_post_obj(title, "PUBLIC", self.FRIEND_USER_NAME, self.FRIEND_USER_PASS)
        # get post
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        getResponse = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(getResponse.status_code))
        self.assertTrue(getResponse.data["id"] == postId)
        self.assertTrue(getResponse.data["title"] == title)
        # delete post
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        deleteResponse = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(deleteResponse.status_code))
        # get post again
        postId = postResponse.data["id"]
        url = reverse("postId", args=[postId])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        getResponseAgain = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(getResponseAgain.status_code))
        self.assertTrue(getResponseAgain.data["id"] == postId)
        self.assertTrue(getResponseAgain.data["title"] == title)
