from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Author
from rest_framework import status
from rest_framework.test import APITestCase
from testutils import createAuthor, createAuthorFriend, getBasicAuthHeader

class RootTests(APITestCase):
    """ This is the home of all of our tests relating to the root url """

    AUTHOR_USER_NAME = 'aName'
    AUTHOR_USER_PASS = 'password127'
    AUTHOR_USER_MAIL = 'aName@example.com'
    NOT_ACTIVE_USER_NAME = 'notActiveName'
    NOT_ACTIVE_USER_MAIL = 'notActiveName@example.com'
    NOT_ACTIVE_USER_PASS = 'password127'

    URL = 'http://127.0.0.1:8000/'

    def setUp(self):
        """ Set up is run before each test """
        self.not_active_author = createAuthor(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_MAIL, self.NOT_ACTIVE_USER_PASS, isActive=False)
        self.author = createAuthor(self.AUTHOR_USER_NAME, self.AUTHOR_USER_MAIL, self.AUTHOR_USER_PASS)

    def test_rooturl_get_no_auth(self):
        """ Ensure we can get the homepage un-authenticated """
        url = reverse("root")
        response = self.client.get(url)
        self.assertTrue(status.is_success(response.status_code))

    def test_rooturl_get_auth(self):
        """ Ensure we can get the homepage authenticated """
        url = reverse("root")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

