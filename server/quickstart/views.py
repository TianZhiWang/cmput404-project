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
from models import Comment, Post, FollowingRelationship, Author, Node
from django.contrib.auth.models import User
from serializers import CommentSerializer, PostSerializer, AuthorSerializer
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

def get_author_id_from_url_string(string):
    if 'http' not in string:
        return string
    return re.search(r'author\/([a-zA-Z0-9-]+)\/?$', string).group(1)

def get_friends_of_authorPK(authorPK):
    following = FollowingRelationship.objects.filter(user=authorPK).values('follows') # everyone currentUser follows
    following_pks = [author['follows'] for author in following]
    authors = Author.objects.filter(pk__in=following_pks)

    friends = []
    for author in authors:
        try:
            url = author.host + 'author/' + author.id + '/friends/' + str(authorPK)
            node = Node.objects.get(url=author.host)
            req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
            req.raise_for_status()

            if (req.json()['friends']):
                friends.append(author.id)
        except Node.DoesNotExist as e:
            pass
        except Exception as e:
            print("Error in trying to get friends")
            print(str(e))

    return friends

def get_author_id_from_url(author):
    return re.search(r'author\/([a-zA-Z0-9-]+)\/?$', author['id']).group(1)

def is_request_from_remote_node(request):
    return Node.objects.filter(user=request.user).count() != 0

def get_queryset_friends_of_a_friend(currentUser):
        currentUserFriends = get_friends_of_authorPK(currentUser.pk)
        temp = get_friends_of_authorPK(currentUser.pk)
        for f in currentUserFriends:
            temp = temp | get_friends_of_authorPK(f["user"])
        return Post.objects.all().filter(author__in=temp).filter(visibility="FOAF")

class PostList(APIView, PaginationMixin):
    """
    List all Public posts, or create a new post.

    get: 
    returns all the Public posts.

    post: 
    create a new instance of post
    """
    pagination_class = PostsPagination
    
    def get(self, request, format=None):
        publicPosts = Post.objects.filter(visibility="PUBLIC")

        page = self.paginate_queryset(publicPosts)
        if page is not None:
            serializer = PostSerializer(publicPosts, many=True)
            return self.get_paginated_response(serializer.data)

        serializedPosts = PostSerializer(posts, many=True)        
        return Response(serializedPosts.data)

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

class SinglePost(APIView):
    def get(self, request, post_id, format=None):
        singlePost = get_object_or_404(Post, pk=post_id)
        post = PostSerializer(singlePost)
        return Response(post.data)


class CommentList(APIView, PaginationMixin):
    """
    List all comments of a post, or create a new comment.

    get: 
    returns a list of all comments

    post: 
    create a new instance of comment
    """
    pagination_class = CommentsPagination

    def get(self, request, post_id, format=None):
        comments = Comment.objects.filter(post=post_id)
        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=200)
    
    def post(self, request, post_id, format=None):
        # Is it one of our posts?
        if Post.objects.filter(pk=post_id).exists():
            commentData = request.data['comment']
            post = get_object_or_404(Post, pk=post_id)

            if is_request_from_remote_node(request):
                author_data = commentData['author']
                author_data['id'] = get_author_id_from_url(author_data)
                if Author.objects.filter(pk=author_data['id']).exists():
                    author = get_object_or_404(Author, pk=author_data['id'])
                else:
                    serializer = AuthorSerializer(data=author_data)
                    if serializer.is_valid():
                        author = Author.objects.create(**serializer.validated_data)
                        return Response(status=201)
                    else:
                        return Response({"error": "Bad data"}, status=400)
            else:
                author = get_object_or_404(Author, pk=get_author_id_from_url(commentData['author']))

            comment = Comment.objects.create(comment=commentData['comment'], post=post, author=author)
        # It is one of there posts
        else:
            # Get the host associated with this post
            hostInfo = urlparse(request.data['post'])
            host = str(hostInfo.scheme) + "://" + str(hostInfo.netloc) + '/'
            url = host + 'posts/' + str(post_id) + '/comments/'
            node = get_object_or_404(Node, url=host)

            try:
                req = requests.post(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password), data=json.dumps(request.data), headers={'Content-Type': 'application/json'})
                req.raise_for_status()
            except Exception as e:
                print("Other server is down or maybe we don't have the right node")
                print(str(e))

        #TODO: Check if they have permission to add comment (i.e. they can see the post)
        return Response({
            "query": "addComment",
            "success": True,
            "message":"Comment Added"
            },
        status=200)

class AuthorList(APIView):
    """
    List all authors, or create a new author.

    get:
    Returns a list of all authors
    """
    def get(self, request, format=None):
        currentUser = request.user.author.id
        users = Author.objects.all()
        following = FollowingRelationship.objects.filter(user=currentUser).values('follows')
        followingUsers = Author.objects.filter(id__in=following)
        followed = FollowingRelationship.objects.filter(follows=currentUser).values('user')
        followedUsers = Author.objects.filter(id__in=followed)

        formattedUsers = []
        for user in users:
            author = AuthorSerializer(user).data
            author['isFollowing'] = (user in followingUsers)
            author['isFollowed'] = (user in followedUsers)
            formattedUsers.append(author)
        
        return Response(formattedUsers)

class AuthorDetail(APIView):

    def get(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)

        friends = get_friends_of_authorPK(author_id)
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
            author = get_object_or_404(Author, pk=author_id)
        except ValueError as e:
            return Response(status=400)
        friends = get_friends_of_authorPK(author_id)

        users = Author.objects.filter(id__in=friends)
        authorsUrlArray = []
        for author in users:
            formatedauthor = AuthorSerializer(author).data
            authorsUrlArray.append(formatedauthor['url'])
        return Response({ "query": "friends","authors":authorsUrlArray})

    def post(self, request, author_id, format=None):
        try:
            author = get_object_or_404(Author, pk=author_id)
        except ValueError as e:
            return Response(status=400)

        friends = get_friends_of_authorPK(author_id)

        authors = request.data["authors"]
        authors_pks = [get_author_id_from_url_string(author) for author in authors]
        filtered = Author.objects.filter(id__in=authors_pks) & Author.objects.filter(id__in=friends)
        
        formatedUsers = AuthorSerializer(filtered,many=True).data
        urls = [user["id"] for user in formatedUsers]
    
        return Response({ "query":"friends", "author":author_id , "authors":urls})

class CheckFriendship(APIView):
    """
    check if two authors are friends
    """
    def get(self, request, author_id1, author_id2, format=None):
        try:
            author = get_object_or_404(Author, pk=author_id1)
            follows = get_object_or_404(Author, pk=author_id2)
            isFriends = FollowingRelationship.objects.filter(user=author, follows=follows).exists()
        except ValueError as e:
            print('Error in getting friends ' + str(e))
            return Response(status=400)

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
class FollowingRelationshipList(APIView):
    def post(self, request, format=None):
        if is_request_from_remote_node(request):
            our_user_data = request.data['friend']
            remote_user_data = request.data['author']

            our_user = get_object_or_404(Author, pk=get_author_id_from_url(our_user_data))

            remote_user_data['id'] = get_author_id_from_url(remote_user_data)
            serializer = AuthorSerializer(data=remote_user_data)
            if serializer.is_valid():
                remote_user = Author.objects.get_or_create(**serializer.validated_data)[0]
                FollowingRelationship.objects.create(user=remote_user, follows=our_user)
                return Response(status=201)
            else:
                return Response({"error": "Bad data"}, status=400)
        else:
            author_data = request.data['author']
            friend_data = request.data['friend']

            # Both our users
            if (author_data['host'] == friend_data['host']):
                author = get_object_or_404(Author, pk=get_author_id_from_url(author_data))
                friend = get_object_or_404(Author, pk=get_author_id_from_url(friend_data))
                FollowingRelationship.objects.create(user=author, follows=friend)
                return Response(status=201)
            # Other user remote
            else:
                print('attempting to send friend request')
                node = Node.objects.get(url=friend_data['host'])
                url = node.url + 'friendrequest/'
                try:
                    req = requests.post(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password), data=json.dumps(request.data), headers={'Content-Type': 'application/json'})
                    req.raise_for_status()
                except Exception as e:
                    print("Exception occurred in friendrequest")
                    print(str(e))

                author = get_object_or_404(Author, pk=get_author_id_from_url(author_data))

                friend_data['id'] = get_author_id_from_url(author_data)
                serializer = AuthorSerializer(data=friend_data)
                if serializer.is_valid():
                    friend = Author.objects.get_or_create(**serializer.validated_data)[0]
                    FollowingRelationship.objects.create(user=author, follows=friend)
                    return Response(status=201)
                else:
                    return Response({'error': 'Could not create author'}, status=500)

    def delete(self, request, format=None):
        if is_request_from_remote_node(request):
            return Response(status=403)

        author_data = request.data['author']
        friend_data = request.data['friend']

        author = get_object_or_404(Author, pk=get_author_id_from_url(author_data))
        friend = get_object_or_404(Author, pk=get_author_id_from_url(friend_data))

        followingRelationship = get_object_or_404(FollowingRelationship, user=author, follows=friend)
        followingRelationship.delete()
        
        return Response(status=200)

class AllPostsAvailableToCurrentUser(APIView,PaginationMixin):
    """
    Returns a list of all posts that is visiable to current author
    """
    pagination_class = PostsPagination
    
    # http://stackoverflow.com/questions/29071312/pagination-in-django-rest-framework-using-api-view
    def get(self, request, format=None):

        # Request originating from remote node
        if is_request_from_remote_node(request):
            node = Node.objects.get(user=request.user)
            # Return everything not serverOnly
            posts = Post.objects.exclude(visibility="SERVERONLY")

            page = self.paginate_queryset(posts)
            if page is not None:
                serializer = PostSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializedPosts = PostSerializer(posts, many=True)        
            return Response(serializedPosts.data)

        # Request originating from an author
        else:
            author = get_object_or_404(Author, user=request.user)
            posts = self.get_all_posts(author)
            serializedPosts = PostSerializer(posts, many=True).data

            friends = get_friends_of_authorPK(author.id)

            # Get all posts from remote authors
            nodes = list(Node.objects.all())
            for node in nodes:
                url = node.url + 'author/posts/'
                try:
                    req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
                    req.raise_for_status()
                    unfilteredForeignPosts = req.json()['posts']
                    
                    for post in unfilteredForeignPosts:
                        if post['visibility'] == 'PUBLIC':
                            serializedPosts.append(post)
                        elif post['visibility'] == 'FRIENDS' and (get_author_id_from_url(post['author']) in friends):
                            serializedPosts.append(post)
                        elif post['visibility'] == 'PRIVATE' and (str(author.id) in post['visibleTo']):
                            serializedPosts.append(post)
                except Exception as e:
                    print("Exception occurred in author/posts")
                    print(str(e))
            
            return Response(serializedPosts)

    def get_all_posts(self, currentUser):
        publicPosts = Post.objects.all().filter(visibility="PUBLIC")
        currentUserPosts = Post.objects.all().filter(author__id=currentUser.pk) # TODO: test currentUser.pk works
        friendOfAFriendPosts = get_queryset_friends_of_a_friend(currentUser)
        friendPosts = self.get_queryset_friends(currentUser)
        serverOnlyPosts = Post.objects.all().filter(visibility="SERVERONLY") # TODO: check that user is on our server
        visibleToPosts = self.get_queryset_visible_to(currentUser)
        intersection = publicPosts | currentUserPosts | friendPosts | serverOnlyPosts | friendOfAFriendPosts | visibleToPosts

        # (CC-BY-SA 3.0) as it was posted before Feb 1, 2016
        # stackoverflow (http://stackoverflow.com/questions/20135343/django-unique-filtering)
        # from user Peter DeGlopper (http://stackoverflow.com/users/2337736/peter-deglopper)
        # accessed on Mar 12, 2017
        return intersection.distinct()  # I don't want to return more than one of the same post
        # end of code from Peter DeGlopper

    def get_queryset_visible_to(self, currentUser):
        return Post.objects.all().filter(visibility="PRIVATE", visibleTo=currentUser)

    def get_queryset_friends(self, currentUser):
        friendsOfCurrentUser = get_friends_of_authorPK(currentUser.pk)

        return Post.objects.all().filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

class PostsByAuthorAvailableToCurrentUser(APIView, PaginationMixin):

    pagination_class = PostsPagination

    def get(self, request, author_id, format=None):
        user = get_object_or_404(Author, pk=author_id)
        #If authenticated user is self should return all posts by user
        if(user == request.user.author): 
            posts = Post.objects.all().filter(author__id=author_id)
        else:
            publicPosts = Post.objects.all().filter(author__id=author_id).filter(visibility="PUBLIC") 
            privateToUser = Post.objects.all().filter(author__id=author_id).filter(visibility="PRIVATE", visibleTo=request.user.author) 
            friendsOfCurrentUser = get_friends_of_authorPK(request.user.author.pk)
            friendsPosts = Post.objects.all().filter(author__id=author_id).filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")
            friendOfAFriendPosts = get_queryset_friends_of_a_friend(request.user.author)
            serverOnlyPosts = Post.objects.all().filter(author__id=author_id).filter(visibility="SERVERONLY")
            
            posts = publicPosts | privateToUser | friendsPosts | friendOfAFriendPosts | serverOnlyPosts

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializedPosts = PostSerializer(posts, many=True)
        return Response(serializedPosts.data)

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
        url = host + id + "/"
        author = Author.objects.create(displayName=displayName, user=user, host=host, id=id, url=url)
        author.save()
        return Response(status=200)
        
