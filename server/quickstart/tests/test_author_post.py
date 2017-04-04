from django.urls import reverse
from django.contrib.auth.models import User
from server.quickstart.models import Post, Author, FollowingRelationship
from rest_framework import status
from rest_framework.test import APITestCase
from requests.auth import HTTPBasicAuth
from testutils import createAuthor, createAuthorFriend, getBasicAuthHeader, createNode

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

    URL = 'http://127.0.0.1:8000/'

    NODE_USER_NAME = 'aNode'
    NODE_USER_MAIL = 'nodeuser@example.com'
    NODE_USER_PASS = 'password127'
    NODE_USER_URL = 'http://127.0.0.1:9999'  # just randomly choosing a port, no server actually running here

    BLIND_NODE_USER_NAME = 'bNode'
    BLIND_NODE_USER_MAIL = 'blindNodeUser@example.com'
    BLIND_NODE_USER_PASS = 'password128'
    BLIND_NODE_USER_URL = 'http://127.0.0.1:9999'  # just randomly choosing a port, no server actually running here

    def setUp(self):
        """ Set up is run before each test """
        createAuthor(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_MAIL, self.NOT_ACTIVE_USER_PASS, isActive=False)
        createAuthor(self.STRANGER_USER_NAME, self.STRANGER_USER_MAIL, self.STRANGER_USER_PASS)
        a = createAuthor(self.AUTHOR_USER_NAME, self.AUTHOR_USER_MAIL, self.AUTHOR_USER_PASS)
        b = createAuthorFriend(self.FRIEND_USER_NAME, self.FRIEND_USER_MAIL, self.FRIEND_USER_PASS, a)
        createAuthorFriend(self.FOAF_USER_NAME, self.FOAF_USER_MAIL, self.FOAF_USER_PASS, b)
        self.node_user = createNode(self.NODE_USER_NAME, self.NODE_USER_MAIL, self.NODE_USER_PASS, self.NODE_USER_URL)
        self.blind_node_user = createNode(self.BLIND_NODE_USER_NAME, self.BLIND_NODE_USER_MAIL, self.BLIND_NODE_USER_PASS, self.BLIND_NODE_USER_URL, seePost=False, seeImages=False)  # Note a blind node can't see posts or images

    def test_authorposturl_get_unauth_401(self):
        """ GETing the posts available to an author w/o any auth will result in a 401 """
        url = reverse("authorPost")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorposturl_get_unactivated_401(self):
        """ GETing the posts available to an unactivated user w/o any auth will result in a 401 """
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.NOT_ACTIVE_USER_NAME, self.NOT_ACTIVE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authorposturl_get_basic_auth(self):
        """ GETing while loggin w/ Basic Auth should return a 2XX """
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))

    def test_authorposturl_delete_405(self):
        """ DELETE should throw a client error as it shouldn't be allowed to delete everything """
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.delete(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorposturl_put_405(self):
        """ PUT should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.put(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_authorposturl_post_405(self):
        """ PUT should throw a client error as it doesn't make sense to put at this endpoint """
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
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
        basicAuth = getBasicAuthHeader(us, pw)
        response = self.client.post(url, obj, format='json', HTTP_AUTHORIZATION=basicAuth)
        return response

    def test_authorposturl_get_your_posts(self):
        """ Should be able to get all my posts """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data) == 4)  # should get all posts made by me

    def test_authorposturl_get_stranger_posts(self):
        """ GETing stranger posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.STRANGER_USER_NAME, self.STRANGER_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data) == 2)  # should get PUBLIC and SERVERONLY

    def test_authorposturl_get_friend_posts(self):
        """ GETing friend posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.FRIEND_USER_NAME, self.FRIEND_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data) == 3)  # should get PUBLIC, SERVERONLY, FRIENDS

    def test_authorposturl_get_foaf_posts(self):
        """ GETing friend posts should return the approprite number of posts """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.FOAF_USER_NAME, self.FOAF_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data) == 2)  # should get PUBLIC, SERVERONLY

    def test_authorposturl_get_author_posts_format_id_title_content_and_more(self):
        """ Format: GET has same post id, title, content, and more as the POST that created it """
        postResponse = self.post_a_post_obj("author format post", "PUBLIC", self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(response.data) == 1)  # should only get one PUBLIC post by author
        self.assertTrue(response.data[0]["id"] == postResponse.data["id"])  # the id of the post during the POST and GET should be equal
        self.assertTrue(response.data[0]["title"] == postResponse.data["title"])
        self.assertTrue(response.data[0]["content"] == postResponse.data["content"])
        self.assertTrue(response.data[0]["description"] == postResponse.data["description"])
        self.assertTrue(response.data[0]["contentType"] == postResponse.data["contentType"])
        self.assertTrue(response.data[0]["visibility"] == postResponse.data["visibility"])
        self.assertTrue(response.data[0]["published"] == postResponse.data["published"])
        self.assertTrue(response.data[0]["count"] == postResponse.data["count"])  # related to comments
        self.assertTrue(response.data[0]["size"] == postResponse.data["size"])  # related to comments
        self.assertTrue(response.data[0]["next"] == postResponse.data["next"])  # should have a next field
        self.assertTrue(response.data[0]["source"] == postResponse.data["source"])
        self.assertTrue(response.data[0]["origin"] == postResponse.data["origin"])
        self.assertTrue(response.data[0]["next"] == postResponse.data["next"])
        self.assertTrue(response.data[0]["comments"] == postResponse.data["comments"])
        self.assertTrue(response.data[0]["visibleTo"] == postResponse.data["visibleTo"])
        try:
            self.assertTrue(response.data[0]["junk"] == postResponse.data["id"])
        except KeyError as e:
            self.assertTrue(True)  # A non-existant field on the response will throw a key error
        try:
            self.assertTrue(response.data[0]["id"] == postResponse.data["junk"])
        except KeyError as e:
            self.assertTrue(True)  # A non-existant field on the postResponse will throw a key error
        try:
            self.assertTrue(response.data[0]["junk"] == postResponse.data["junk"])
        except KeyError as e:
            self.assertTrue(True)  # A non-existant field on both will throw a key error

    def test_authorposturl_authors_posts_as_node(self):
        """ Should be able to get all the posts as a node except SERVERONLY """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.NODE_USER_NAME, self.NODE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 3)  # should return paginated results for everything except SERVERONLY

    def test_authorposturl_authors_posts_as_blind_node(self):
        """ Should be get no posts as a blind node """
        vis = ["PUBLIC", "PRIVATE", "FRIENDS", "SERVERONLY"]
        for v in vis:
            self.post_a_post_obj("%s post" % v, v, self.AUTHOR_USER_NAME, self.AUTHOR_USER_PASS)
        url = reverse("authorPost")
        basicAuth = getBasicAuthHeader(self.BLIND_NODE_USER_NAME, self.BLIND_NODE_USER_PASS)
        response = self.client.get(url, HTTP_AUTHORIZATION=basicAuth)
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(response.data["count"] == 0)  # should return paginated results containing nothing
