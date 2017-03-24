import base64
from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth

class AuthorPostTest(APITestCase):
    """ This is the home of all of our tests relating to the author/post url """

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
        self.createAuthor(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_MAIL, self.NOT_ACTIVE_USER_PASS, isActive=False)
        self.createAuthor(self.STRANGER_USER_NAME, self.STRANGER_USER_MAIL, self.STRANGER_USER_PASS)
        a = self.createAuthor(self.AUTHOR_USER_NAME, self.AUTHOR_USER_MAIL, self.AUTHOR_USER_PASS)
        b = self.createAuthorFriend(self.FRIEND_USER_NAME, self.FRIEND_USER_MAIL, self.FRIEND_USER_PASS, a)
        self.createAuthorFriend(self.FOAF_USER_NAME, self.FOAF_USER_MAIL, self.FOAF_USER_PASS, b)


    def getBasicAuthHeader(self, us, pw):
        """ Returns the b64encoded string created for a user and password to be used in the header """
        return "Basic %s" % base64.b64encode("%s:%s" % (us, pw))

    def test_authorposturl_get_unauth_401(self):
        """ GETing the posts available to an author w/o any auth will result in a 401 """
        url = reverse("authorPost")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorposturl_get_unactivated_401(self):
        """ GETing the posts available to an unactivated user w/o any auth will result in a 401 """
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorposturl_get_basic_auth(self):
        """ GETing while loggin w/ Basic Auth should return a 2XX """
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_authorposturl_delete_405(self):
        """ DELETE should throw a client error as it shouldn't be allowed to delete everyting """
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorposturl_put_405(self):
        """ PUT should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.put(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorposturl_post_405(self):
        """ PUT should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.post(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

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

    def test_authorposturl_get_your_posts(self):
        """ Should be able to get all my posts """
        vis = ["PUBLIC", "PRIVATE", "FOAF", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 5)  # should get all posts made by me

    def test_authorposturl_get_stranger_posts(self):
        """ GETing stranger posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FOAF", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.STRANGER_USER_NAME, self.STRANGER_USER_PASS)
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 2)  # should get PUBLIC and SERVERONLY

    def test_authorposturl_get_friend_posts(self):
        """ GETing friend posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FOAF", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.FRIEND_USER_NAME, self.FRIEND_USER_PASS)
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 4)  # should get PUBLIC, SERVERONLY, FRIENDS, and FOAF

    def test_authorposturl_get_foaf_posts(self):
        """ GETing friend posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FOAF", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.FOAF_USER_NAME, self.FOAF_USER_PASS)
        url = reverse("authorPost")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 3)  # should get PUBLIC, SERVERONLY, and FOAF
