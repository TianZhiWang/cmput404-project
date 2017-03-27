import base64
from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth

class AuthorIdFriendsTest(APITestCase):
    """ This is the home of all of our tests relating to the author/:id/friends url """

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

    def test_authoridfriends_get_unauth_401(self):
        """ GETing the author friends w/o any auth will result in a 401, even if the author id doesn't exist yet """
        url = reverse("authorIdFriend", args=[1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authoridfriends_get_unactivated_401(self):
        """ GETing the author friends w/ unactivated user w/o any auth will result in a 401, even if the author id doesn't exist yet """
        url = reverse("authorIdFriend", args=[1])
        basicAuth = self.getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authoridfriends_get_basic_auth(self):
        """ GETing the author friends of author while loggin w/ Basic Auth as author should return a 2XX """
        url = reverse("authorIdFriend", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_authoridfriends_delete_405(self):
        """ DELETE should throw a client error as it shouldn't be allowed to delete everything for an authors friends """
        url = reverse("authorIdFriend", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authoridfriends_put_405(self):
        """ PUT should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorIdFriend", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.put(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authoridfriends_post_has_correnct_num_of_friends(self):
        """ POST should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorIdFriend", args=[self.author.pk])
        obj = {
                "query": "friends",
                "author": self.author.pk,
                "authors": [
                    self.stranger_author.host + "/author/" + str(self.stranger_author.id),
                    self.friend_author.host + "/author/" + str(self.friend_author.id)
                ]
        }
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["authors"]) == 1)

    def test_author_has_correct_num_of_friends(self):
        """ The current author should have 1 friend """
        url = reverse("authorIdFriend", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["authors"]) == 1)  # NOTE: the friend of author is created in setup

    def test_friend_has_correct_num_of_friends(self):
        """ Friendship is a two way thing, therefore author should be able to see that friend_author has two friends (author & foaf) """
        url = reverse("authorIdFriend", args=[self.friend_author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["authors"]) == 2)  # NOTE: the friend of author is created in setup, as are their friends

    def test_stranger_has_correct_num_of_friends(self):
        """ The stranger author should have no friends, and author should be able to see that """
        url = reverse("authorIdFriend", args=[self.stranger_author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["authors"]) == 0)  # NOTE: the stranger author is set up in setup

    def test_bad_author_id(self):
        """ A bad author id should throw a 4XX error """
        url = reverse("authorIdFriend", args=["bad-author-id"])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(response.status_code))

    def test_author_res_is_correct_format(self):
        """ The current author id friend is in the same format as the spec """
        url = reverse("authorIdFriend", args=[self.author.pk])
        basicAuth = self.getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["query"] == "friends")
        self.assertTrue(len(response.data["authors"]) >= 0)  # should be an array with at least one element
