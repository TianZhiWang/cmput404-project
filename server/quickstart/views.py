# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, andi (http://stackoverflow.com/users/953553/andi),
# Peter DeGlopper (http://stackoverflow.com/users/2337736/peter-deglopper), Oliver Ford (http://stackoverflow.com/users/1446048/oliver-ford)

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
from models import Comment, Post, FollowingRelationship, Author, Node, FriendRequest
from django.contrib.auth.models import User
from serializers import CommentSerializer, PostSerializer, AuthorSerializer, CreateAuthorSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from pagination import PostsPagination, PaginationMixin, CommentsPagination
from requests.auth import HTTPBasicAuth
import re
import requests
from django.urls import reverse
import json
from urlparse import urlparse
import uuid
from copy import copy

def get_author_id_from_url_string(string):
    if 'http' not in string:
        return string
    return re.search(r'author\/([a-zA-Z0-9-]+)\/?$', string).group(1)

def get_friends_of_authorPK(authorPK):
    following = FollowingRelationship.objects.filter(user=authorPK).values_list('follows', flat=True) # everyone currentUser follows
    authors = Author.objects.filter(pk__in=following)

    friends = []
    for author in authors:
        try:
            url = author.host + 'author/' + author.id + '/friends/' + str(authorPK)
            node = Node.objects.get(url=author.host)
            req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
            req.raise_for_status()

            if (req.json()['friends']):
                friends.append(author)

        except Node.DoesNotExist as e:
            # Get everyone following the current user, check if the author in this
            followed_by = FollowingRelationship.objects.filter(follows=authorPK).values_list('user', flat=True)
            followed_by = Author.objects.filter(pk__in=followed_by)
            if author in followed_by:
                friends.append(author)

        except Exception as e:
            print("Error in trying to get friends")
            print(str(e))

    return friends

def get_friend_ids_of_author(authorPK):
    return [author.id for author in get_friends_of_authorPK(authorPK)]

def is_request_from_remote_node(request):
    return Node.objects.filter(user=request.user).exists()

def does_author_exist(author_id):
    return Author.objects.filter(id=author_id).exists()

def is_friends(author_id1, author_id2):
    if (not does_author_exist(author_id1) and not does_author_exist(author_id2)):
        return False

    return (FollowingRelationship.objects.filter(user__id=author_id1, follows__id=author_id2).exists()
        and FollowingRelationship.objects.filter(user__id=author_id2, follows__id=author_id1).exists())

def append_trailing_slash(string):
    return string if string[-1] == '/' else string + '/'

def transform_author_id_to_uuid(author):
    new_author = copy(author)
    new_author['id'] = get_author_id_from_url_string(author['id'])
    new_author['url'] = append_trailing_slash(new_author['url'])
    new_author['host'] = append_trailing_slash(new_author['host'])
    return new_author

class PostList(APIView, PaginationMixin):
    """
    List all Public posts, or create a new post.

    get: 
    returns all the Public posts.

    post: 
    create a new instance of post
    """
    pagination_class = PostsPagination
    serializer_class = PostSerializer
    
    def get(self, request, format=None):
        publicPosts = Post.objects.filter(visibility="PUBLIC")

        return self.paginated_response(publicPosts)

    def post(self, request, format=None):
        author = get_object_or_404(Author, user=request.user)
        host = str(request.scheme) + "://" + str(request.get_host()) + "/"
        serializedPost = PostSerializer(data=request.data, context={'author': author, 'host': host})
        if serializedPost.is_valid():
            serializedPost.save()
            return Response(serializedPost.data, status=201)
        return Response(serializedPost.errors, status=400)

class PostDetail(APIView):
    def get(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        serializedPost = PostSerializer(post)        
        return Response(serializedPost.data)

    def delete(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        post.delete()
        return Response(status=200)


class CommentList(APIView, PaginationMixin):
    """
    List all comments of a post, or create a new comment.

    get: 
    returns a list of all comments

    post: 
    create a new instance of comment
    """
    pagination_class = CommentsPagination
    serializer_class = CommentSerializer

    def get(self, request, post_id, format=None):
        comments = Comment.objects.filter(post=post_id)
        
        return self.paginated_response(comments)

    def post(self, request, post_id, format=None):
        # Is it one of our posts?
        if Post.objects.filter(pk=post_id).exists():
            commentData = request.data['comment']
            post = get_object_or_404(Post, pk=post_id)

            author_data = transform_author_id_to_uuid(commentData['author'])
            serializer = CreateAuthorSerializer(data=author_data)
            if serializer.is_valid():
                author = Author.objects.get_or_create(**serializer.validated_data)[0]
            else:
                return Response({'Error': 'Could not add comment, bad author data', 'Message': serializer.errors}, status=400)

            comment = Comment.objects.create(comment=commentData['comment'], post=post, author=author)
        # It is one of there posts
        else:
            # Get the host associated with this post
            host = request.data['post'].split('posts')[0]
            node = get_object_or_404(Node, url=host)

            try:
                url = request.data['post'] + 'comments/'
                req = requests.post(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password), data=json.dumps(request.data), headers={'Content-Type': 'application/json'})
                req.raise_for_status()
            except Exception as e:
                print("Other server is down or maybe we don't have the right node")
                print(str(e))
                return Response({'Error': 'Could not create comment on remote data', 'message': str(e), 'success': False}, status=400)

        #TODO: Check if they have permission to add comment (i.e. they can see the post)
        return Response({
            "query": "addComment",
            "success": True,
            "message":"Comment Added"
            },
        status=200)

class AuthorDetail(APIView):

    def get(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)

        friends = get_friend_ids_of_author(author_id)
        users = Author.objects.filter(id__in=friends)
        formatedUsers = AuthorSerializer(users,many=True).data

        serialized_data = AuthorSerializer(author).data
        serialized_data["friends"] = formatedUsers
        
        return Response(data=serialized_data, status=200)

class FriendsList(APIView):
    """
    List all friends of author

    get:
    Returns a list of all authors that are friends

    post:
    post a list of authors, returns the ones that are friends
    """
    def get(self, request, author_id, format=None):
        try:
            author = Author.objects.get(pk=author_id)
        except Author.DoesNotExist as e:
            return Response({'Error': 'Author does not exist', 'message': str(e)}, status=404)
        
        # No circular requests, just send who this author is following
        if is_request_from_remote_node(request):
            authors = FollowingRelationship.objects.filter(user__id=author_id).select_related('user')
        else:
            authors = Author.objects.filter(id__in=get_friend_ids_of_author(author_id))

            author_urls = [each.url for each in authors]
        return Response({ "query": "friends","authors":author_urls})

    def post(self, request, author_id, format=None):
        try:
            author = Author.objects.get(pk=author_id)
        except Author.DoesNotExist as e:
            return Response({'Error': 'Author does not exist'}, status=404)

        authors = request.data['authors']
        if is_request_from_remote_node(request):
            following = FollowingRelationship.objects.filter(user__id=author_id).select_related('user').values_list('url', flat=True)
            urls = following & authors
        else:
            friends_pks = get_friend_ids_of_author(author_id)
            urls = Author.objects.filter(pk__in=friends_pks).values_list('url', flat=True)
    
        return Response({ "query":"friends", "author":author_id , "authors":urls})

class CheckFriendship(APIView):
    """
    check if two authors are friends
    """
    def get(self, request, author_id1, author_id2, format=None):
        try:
            author = Author.objects.get(pk=author_id1)
            follows = Author.objects.get(pk=author_id2)
            isFriends = FollowingRelationship.objects.filter(user=author, follows=follows).exists()
        except Exception as e:
            print('Error in getting friends ' + str(e))
            return Response({'Error': 'Could not get both authors', 'Message': str(e)}, status=400)

        friendshipResult = {
            "query":"friends",
            "authors":[
            author.url,
            follows.url
            ],
            "friends": isFriends
        }
        return Response(friendshipResult, status=200)

# TODO: How to add remote authors? Also how to link them?
class FriendRequestList(APIView):
    def get(self, request, format=None):
        author = get_object_or_404(Author, user=request.user)
        friend_requests = FriendRequest.objects.filter(requestee=author).values_list('requester', flat=True)
        authors = Author.objects.filter(pk__in=friend_requests)
        return Response(AuthorSerializer(authors, many=True).data, status=200)
    
    def _handle_friend_request(self, requestee, requester):
        # If requester sends duplicate request, ignore it
        if FriendRequest.objects.filter(requestee=requestee, requester=requester).exists():
            print('Friend request already exists')
            return Response({'Error': 'friend request already exists'}, status=400)
        # If requester sends a request to an requestee they are already following, don't do anything
        if FollowingRelationship.objects.filter(user=requester, follows=requestee).exists():
            print('Following relationship already exists')
            return Response({'Error': 'Already following that user'}, status=400)
        # If requester sends a request to an requestee already following them
        # Delete friend request if it exists and add FollowingRelationship
        if FollowingRelationship.objects.filter(user=requestee, follows=requester).exists():
            if FriendRequest.objects.filter(requestee=requester, requester=requestee).exists():
                # Transform friend request into follow
                FriendRequest.objects.get(requestee=requester, requester=requestee).delete()
        
            FollowingRelationship.objects.create(user=requester, follows=requestee)
            return Response({'Success': 'Users are now friends'}, status=201)
        
        # If requester sends friend request to requestee and the requestee is not following them
        # Create follow relationship and friend request
        FollowingRelationship.objects.create(user=requester, follows=requestee)
        FriendRequest.objects.create(requestee=requestee, requester=requester)
        return Response({'Success': 'Created following relationship and friend request'}, status=201)


    def _handle_friend_request_from_remote_node(self, author_data, friend_data):
        our_user = get_object_or_404(Author, url=friend_data['url'])

        serializer = CreateAuthorSerializer(data=author_data)
        if serializer.is_valid():
            remote_user = Author.objects.get_or_create(**serializer.validated_data)[0]
            return self._handle_friend_request(requester=remote_user, requestee=our_user)

        return Response({"error": "Data we received is invalid", "data": request.data}, status=400)
    
    def _handle_friend_request_both_authors_local(self, author_data, friend_data):
        requester = get_object_or_404(Author, pk=author_data['id'])
        requestee = get_object_or_404(Author, pk=friend_data['id'])

        return self._handle_friend_request(requester=requester, requestee=requestee)
    
    def _handle_friend_request_from_local_other_author_remote(self, author_data, friend_data):
        print('attempting to send friend request to remote node')
        node = Node.objects.get(url=friend_data['host'])
        url = node.url + 'friendrequest/'
        try:
            req = requests.post(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password), data=json.dumps(request.data), headers={'Content-Type': 'application/json'})
            req.raise_for_status()
        except Exception as e:
            print("Exception occurred in friendrequest")
            print(str(e))

        author = get_object_or_404(Author, pk=author_data['id'])

        serializer = CreateAuthorSerializer(data=friend_data)
        if serializer.is_valid():
            friend = Author.objects.get_or_create(**serializer.validated_data)[0]
            return self._handle_friend_request(requester=author, requestee=friend)
        
        print('Could not create remote author', str(friend_data))
        return Response({'error': 'Could not create author', 'data': request.data}, status=500)

    def post(self, request, format=None):
        author_data = transform_author_id_to_uuid(request.data['author'])
        friend_data = transform_author_id_to_uuid(request.data['friend'])

        if is_request_from_remote_node(request):
            return self._handle_friend_request_from_remote_node(author_data, request_data)

        elif author_data['host'] == friend_data['host']:
            return self._handle_friend_request_both_authors_local(author_data, friend_data)
        # We are getting a request from our front end and the other user is a remote user
        # Need to forward the request to the other server
        else:
            return self._handle_friend_request_from_local_other_author_remote(author_data, friend_data)

    def delete(self, request, format=None):
        if is_request_from_remote_node(request):
            return Response(status=403)

        author_data = transform_author_id_to_uuid(author_data)
        friend_data = transform_author_id_to_uuid(friend_data)

        author = get_object_or_404(Author, pk=author_data['id'])
        friend = get_object_or_404(Author, pk=friend_data['id'])

        followingRelationship = get_object_or_404(FollowingRelationship, user=author, follows=friend)
        followingRelationship.delete()
        
        return Response(status=200)

class AllPostsAvailableToCurrentUser(APIView,PaginationMixin):
    """
    Returns a list of all posts that is visiable to current author
    """
    pagination_class = PostsPagination
    serializer_class = PostSerializer
    
    # http://stackoverflow.com/questions/29071312/pagination-in-django-rest-framework-using-api-view
    def get(self, request, format=None):


        # Request originating from remote node
        if is_request_from_remote_node(request):
            node = Node.objects.get(user=request.user)
            # Return everything not serverOnly
            posts = Post.objects.exclude(visibility="SERVERONLY")

            return self.paginated_response(posts)

        # Request originating from an author
        else:
            author = get_object_or_404(Author, user=request.user)
            posts = self.get_all_posts(author)
            serializedPosts = PostSerializer(posts, many=True).data

            # Get all posts from remote authors
            for node in Node.objects.all():
                url = node.url + 'author/posts/'
                try:
                    req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
                    req.raise_for_status()
                    unfilteredForeignPosts = req.json()['posts']
                    
                    for post in unfilteredForeignPosts:
                        if post['visibility'] == 'PUBLIC':
                            serializedPosts.append(post)
                        elif post['visibility'] == 'FRIENDS' and (post['author'] in friends):
                            serializedPosts.append(post)
                except Exception as e:
                    print("Exception occurred in author/posts")
                    print(str(e))
            
            return Response(serializedPosts)

    def get_all_posts(self, currentUser):
        publicPosts = Post.objects.filter(visibility="PUBLIC")
        currentUserPosts = Post.objects.filter(author__id=currentUser.pk)
        friendPosts = self.get_queryset_friends(currentUser)
        serverOnlyPosts = Post.objects.filter(visibility="SERVERONLY")
        intersection = publicPosts | currentUserPosts | friendPosts | serverOnlyPosts

        # (CC-BY-SA 3.0) as it was posted before Feb 1, 2016
        # stackoverflow (http://stackoverflow.com/questions/20135343/django-unique-filtering)
        # from user Peter DeGlopper (http://stackoverflow.com/users/2337736/peter-deglopper)
        # accessed on Mar 12, 2017
        return intersection.distinct()  # I don't want to return more than one of the same post
        # end of code from Peter DeGlopper

    def get_queryset_friends(self, currentUser):
        friendsOfCurrentUser = get_friend_ids_of_author(currentUser.pk)

        return Post.objects.filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

class PostsByAuthorAvailableToCurrentUser(APIView, PaginationMixin):
    """
        This should return all posts made by 'author_id' that are visible to the requesting User
        If Remote Node asking, return all Post objects made by that user that are not 'SERVERONLY'
        If we are requesting, need to do filtering based off of friend relationships
    """
    pagination_class = PostsPagination
    serializer_class = PostSerializer

    def get(self, request, author_id, format=None):
        if is_request_from_remote_node(request):
            posts = Post.objects.filter(author__id=author_id).exclude("SERVERONLY")
        
        elif (author_id == request.user.author.id):
            posts = Post.objects.filter(author__id=author_id)

        else:
            posts = Post.objects.filter(author__id=author_id)
            # If authenticated user is self should return all posts by user
            is_friend = is_friends(author_id, request.user.author.id)
            if (not (is_friend) or author_id == request.user.author.id):
                posts = posts.exclude(visibility="FRIENDS")

        return self.paginated_response(posts)

# https://richardtier.com/2014/02/25/django-rest-framework-user-endpoint/ (Richard Tier), No code but put in readme
class LoginView(APIView):
    "Login and get a response"
    def post(self, request, format=None):
        author = get_object_or_404(Author, user=request.user)
        serialized_data = AuthorSerializer(author).data
        return Response(data=serialized_data, status=200)

"""
Will return a 400 if the author exists and 201 created otherwise
"""
class RegisterView(APIView):
    permission_classes = (AllowAny,)
    # http://stackoverflow.com/questions/27085219/how-can-i-disable-authentication-in-django-rest-framework#comment63774493_27086121 Oliver Ford (http://stackoverflow.com/users/1446048/oliver-ford) (MIT)
    authentication_classes = []

    def post(self, request, format=None):
        validated_data = request.data

        # http://stackoverflow.com/a/42411533 Erik Westrup (http://stackoverflow.com/users/265508/erik-westrup) (MIT)
        displayName = validated_data.pop('displayName')
        user = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        user.is_active = False
        user.save()
        host = str(request.scheme) + "://" + str(request.get_host()) + "/"
        id = str(uuid.uuid4())
        url = host + "author/" + id + "/"
        author = Author.objects.create(displayName=displayName, user=user, host=host, id=id, url=url)
        author.save()
        return Response(status=200)
        
