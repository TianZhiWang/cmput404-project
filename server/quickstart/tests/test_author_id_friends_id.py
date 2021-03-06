# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Josh Deng

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
from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth
from testutils import createAuthor, createAuthorFriend, getBasicAuthHeader

class AuthorIdFriendIdTest(APITestCase):
    """ This is the home of all of our tests relating to the author/:id/friends/:id url """

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

    def test_authoridfriendid_get_unauth_401(self):
        """ GETing the author id friends id w/o any auth will result in a 401, even if the ids aren't correct """
        url = reverse("authorIdFriendId", args=[1, 1])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authoridfriendid_get_unactivated_401(self):
        """ GET author id is friends with friend id, even if ids aren't correct w/ not active user should 401 """
        url = reverse("authorIdFriendId", args=[1, 1])
        basicAuth = getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authoridfriendid_get_basic_auth(self):
        """ GETing the author id is friends of friend id while loggin w/ Basic Auth as author should return a 2XX """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_authoridfriendid_delete_405(self):
        """ DELETE should delete a relationship """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_authoridfriendid_put_405(self):
        """ PUT should throw a client error as it doesn't make sense to put a friendship comparison """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.put(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authoridfriendid_post_405(self):
        """ POST should throw a client error 405 as it doesn't make sense to put a friendship comparison """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.post(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_author_is_friends_with_friend(self):
        """ The current author should have be friends with friend_author """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["friends"])  # NOTE: the friendship between author and friend_author is created in setUp

    def test_friend_is_friends_with_foaf_and_author(self):
        """ friend_author should be friends with author and foaf as friendship is a two way relationship, and author should see that """
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        # is friend friends with author?
        urlA = reverse("authorIdFriendId", args=[self.friend_author.pk, self.author.pk])
        responseA = self.client.get(urlA, HTTP_AUTHORIZATION=basicAuth)
        # is friend friends with foaf?
        urlB = reverse("authorIdFriendId", args=[self.friend_author.pk, self.foaf_author.pk])
        responseB = self.client.get(urlB, HTTP_AUTHORIZATION=basicAuth)
        # assert that the above two questions are true
        self.assertTrue(status.is_success(responseA.status_code))
        self.assertTrue(status.is_success(responseB.status_code))
        self.assertTrue(responseA.data["friends"])  # NOTE: the friendship between friend_author and author is created in setUp
        self.assertTrue(responseB.data["friends"])  # NOTE: the friendship between friend_author and foaf is created in setUp

    def test_stranger_is_not_friends_with_author(self):
        """ The stranger author should have no friends, and author should be able to see that """
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        # is stranger friends with author?
        urlA = reverse("authorIdFriendId", args=[self.stranger_author.pk, self.author.pk])
        responseA = self.client.get(urlA, HTTP_AUTHORIZATION=basicAuth)
        # is author friends with stranger?
        urlB = reverse("authorIdFriendId", args=[self.author.pk, self.stranger_author.pk])
        responseB = self.client.get(urlB, HTTP_AUTHORIZATION=basicAuth)
        # assert that the above two questions are true
        self.assertTrue(status.is_success(responseA.status_code))
        self.assertTrue(status.is_success(responseB.status_code))
        self.assertFalse(responseA.data["friends"])  # NOTE: no friendship between stranger and author is created in setUp
        self.assertFalse(responseB.data["friends"])  # NOTE: no friendship between author and stranger is created in setUp

    def test_bad_first_author_id(self):
        """ A bad first author id should throw a 4XX error """
        url = reverse("authorIdFriendId", args=["bad-author-id", self.author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(response.status_code))

    def test_bad_second_author_id(self):
        """ A bad second author id should throw a 4XX error """
        url = reverse("authorIdFriendId", args=[self.author.pk, "bad-author-id"])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(response.status_code))

    def test_bad_first_and_second_author_id(self):
        """ A bad first and second author id should throw a 4XX error """
        url = reverse("authorIdFriendId", args=["bad-author-id1", "bad-author-id2"])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_client_error(response.status_code))

    def test_author_is_friends_with_friend_format_query(self):
        """ Formatting query : The query should be friends """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["query"] == "friends")

    def test_author_is_friends_with_friend_format_friends(self):
        """ Formatting friends : Should have something in the friends field """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["friends"])  # they should be friends, if no such field a KeyError will be thrown

    def test_author_is_friends_with_friend_format_authors(self):
        """ Formatting authors : Should return the urls of the authors involved """
        url = reverse("authorIdFriendId", args=[self.author.pk, self.friend_author.pk])
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data["authors"]) == 2)
        author_id_in_authors_zero = response.data["authors"][0].find(str(self.author.pk)) != -1
        author_id_in_authors_one = response.data["authors"][1].find(str(self.author.pk)) != -1
        friend_id_in_authors_zero = response.data["authors"][0].find(str(self.friend_author.pk)) != -1
        friend_id_in_authors_one = response.data["authors"][1].find(str(self.friend_author.pk)) != -1
        self.assertTrue(author_id_in_authors_zero or author_id_in_authors_one)
        self.assertTrue(friend_id_in_authors_zero or friend_id_in_authors_one)
