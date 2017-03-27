import base64
from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth

class AuthorIdTest(APITestCase):
    """ This is the home of all of our tests relating to the author/:id url """

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

    def createAuthor(self, us, em, pw, isActive=True):
        authorUser = User.objects.create_user(us, em, pw)
        authorUser.is_active = isActive
        authorUser.save()
        author = Author.objects.create(id=us, displayName=us, user=authorUser, url=self.URL, host=self.URL)
        author.save()
        return author

    def createAuthorFriend(self, us, em, pw, friend):
        author = self.createAuthor(us, em, pw)
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

    def test_authorid_get_unauth_401(self):
        """ GETing the author id details w/o any auth will result in a 401, even if the author doesn't exist """
        url = reverse("authorId", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorid_get_unactivated_401(self):
        """ GET author id details w/ not active user, even if id isn't correct should 401 """
        url = reverse("authorId", args=[1])
        basicAuth = self.getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorid_get_basic_auth(self):
        """ GETing the author id details while loggin w/ Basic Auth as author should return a 2XX """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_authorid_delete_405(self):
        """ DELETE should throw a client error as it shouldn't be allowed to delete the the author details page """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorid_put_405(self):
        """ PUT should throw a client error as it doesn't make sense to put a to the author details """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.put(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorid_post_405(self):
        """ POST should throw a client error 405 as it doesn't make sense to post to author details """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.post(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorid_get_in_proper_format_id(self):
        """ id format : GETing the author id details should return in a format according to the spec """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        # eg url = /author/684a1a11-1698-4942-89c2-2f1bb6650a60/
        url_no_trailing_slash = url[:-1]
        self.assertTrue(response.data["id"].find(url_no_trailing_slash) != -1)  # .find return -1 if not found
        self.assertTrue(status.is_success(response.status_code))

    def test_authorid_get_in_proper_format_display_name(self):
        """ id format : GETing the author id details should return in a format according to the spec """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(response.data["displayName"] == self.AUTHOR_USER_NAME)  # the AUTHOR_USER_NAME should be the displayName
        self.assertTrue(status.is_success(response.status_code))

    def test_authorid_get_url_field(self):
        """ has url : GETing the author id details should return a url field"""
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(len(response.data["host"]) >= 0)  # .has someting in the host field
        self.assertTrue(status.is_success(response.status_code))

    def test_authorid_get_in_proper_num_author_friends(self):
        """ author should have the correct number of friends in the author details page """
        url = reverse("authorId", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["friends"]) == 1)  # author should have one friend

    def test_authorid_get_in_proper_num_friend_friends(self):
        """ friend should have the correct number of friends in the friend details page, when accessed by author """
        url = reverse("authorId", args=[self.friend_author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["friends"]) == 2)  # friend is friends with author and foaf
