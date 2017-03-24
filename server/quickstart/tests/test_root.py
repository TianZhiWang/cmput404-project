from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Author
from rest_framework import status
from rest_framework.test import APITestCase
import base64

class RootTests(APITestCase):
    """ This is the home of all of our tests relating to the root url """

    AUTHOR_USER_NAME = 'aName'
    AUTHOR_USER_PASS = 'password127'
    AUTHOR_USER_MAIL = 'aName@example.com'
    NOT_ACTIVE_USER_NAME = 'notActiveName'
    NOT_ACTIVE_USER_MAIL = 'notActiveName@example.com'
    NOT_ACTIVE_USER_PASS = 'password127'

    def setUp(self):
        """ Set up is run before each test """
        # accessed on March 12, 2017
        # from http://www.django-rest-framework.org/api-guide/testing/
        self.authorUser = User.objects.create_user(self.AUTHOR_USER_NAME,
                                                   self.AUTHOR_USER_MAIL,
                                                   self.AUTHOR_USER_PASS)
        self.authorUser.save()
        author = Author.objects.create(displayName=self.AUTHOR_USER_NAME,
                                       user=self.authorUser)
        author.save()

        self.unAuthorizedUser = User.objects.create_user(self.NOT_ACTIVE_USER_NAME,
                                                         self.NOT_ACTIVE_USER_MAIL,
                                                         self.NOT_ACTIVE_USER_PASS)
        self.unAuthorizedUser.is_active = False  # this is crucial to make an unAuthorizedUser
        self.unAuthorizedUser.save()
        unAuthAuthor = Author.objects.create(displayName=self.NOT_ACTIVE_USER_NAME,
                                             user=self.unAuthorizedUser)
        unAuthAuthor.save()

    def getBasicAuthHeader(self, us, pw):
        """ Returns the b64encoded string created for a user and password to be used in the header """
        return "Basic %s" % base64.b64encode("%s:%s" % (us, pw))

    def test_rooturl_get_no_auth(self):
        """ Ensure we can get the homepage un-authenticated """
        url = reverse("root")
        response = self.client.get(url)
        self.assertTrue(status.is_success(response.status_code))

    def test_rooturl_get_auth(self):
        """ Ensure we can get the homepage authenticated """
        url = reverse("root")
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

