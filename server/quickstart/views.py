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
from pagination import PostsPagination, CommentsPagination
from requests.auth import HTTPBasicAuth
from operator import itemgetter
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

    nodes = {}
    for author in authors:
        if not author.host in nodes:
            nodes[author.host] = []
        nodes[author.host].append(author.url)
    
    friends = []
    user = Author.objects.get(pk=authorPK)
    for host, follows in nodes.items():
        print("host", host, "follows", follows)
        try:
            url = host + 'author/' + user.id + '/friends/'
            node = Node.objects.get(url=host)
            body = json.dumps({
                    'query': 'friends',
                    'author': user.url,
                    'authors': follows
                    })
            print("request body", body)
            req = requests.post(
                url,
                auth=requests.auth.HTTPBasicAuth(node.username, node.password),
                data=body,
                headers={'Content-Type': 'application/json'}
            )
            req.raise_for_status()

            authors = req.json()['authors']
            print("host", host, "returned", authors)
            if authors:
                friends += authors

        except Node.DoesNotExist as e:
            # Get everyone following the current user, check if the author in this
            followed_by = FollowingRelationship.objects.filter(follows=authorPK).values_list('user', flat=True)
            followed_by = Author.objects.filter(pk__in=followed_by).values_list('url', flat=True)
            friends += list(set(follows).intersection(set(followed_by)))

        except Exception as e:
            print("Error in trying to get friends")
            print(str(e))

    friend_objs = Author.objects.filter(url__in=friends)
    return friend_objs

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

def validate_and_transform_author(author):
    new_author = copy(author)
    new_author['id'] = get_author_id_from_url_string(author['id'])
    new_author['url'] = append_trailing_slash(new_author['url'])
    new_author['host'] = append_trailing_slash(new_author['host'])
    return new_author

def handle_posts_to_remote_node(queryset, request):
    """
    Takes in the queryset for remote node with any customization
    and filters out server_only posts and paginates the response

    Input: queryset, request
    """
    # TODO: Add filtering of images and posts here, will need to pass the Node to filter
    queryset = queryset.exclude(visibility='SERVERONLY').order_by('-published')

    node = Node.objects.get(user=request.user)
    if not node.canSeeImages:
        queryset = queryset.exclude(contentType__in=['image/png;base64', 'image/jpeg;base64'])
    if not node.canSeePosts:
        queryset = queryset.exclude(contentType__in=['text/markdown', 'text/plain'])

    paginator = PostsPagination()
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        serializer = PostSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data, request)

def sort_by_newest_posts(postList):
    return sorted(postList, key=itemgetter('published'), reverse=True) 

class PostList(APIView):
    """
    List all Public posts, or create a new post.

    get: 
    returns all the Public posts.

    post: 
    create a new instance of post
    """

    def get(self, request, format=None):
        if is_request_from_remote_node(request):
            return handle_posts_to_remote_node(Post.objects.filter(visibility='PUBLIC'), request)
        else:
            # TODO: handle the GET from an author
            serializedPost = PostSerializer(Post.objects.filter(visibility='PUBLIC'))
            return Response(serializedPost.data, status=200)

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

    def put(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        
        author = get_object_or_404(Author, user=request.user)
        if post.author != author:
            return Response("You likely don't have access to delete this post", status=400)
        serializedPost = PostSerializer(post, data=request.data)
        if serializedPost.is_valid():
            serializedPost.save()
            return Response(serializedPost.data, status=201)
        return Response(serializedPost.errors, status=400)

    def delete(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        author = get_object_or_404(Author, user=request.user)
        if post.author == author:
            post.delete()
            return Response(status=200)
        else:
            return Response("You likely don't have access to delete this post", status=400)



class CommentList(APIView):
    """
    List all comments of a post, or create a new comment.

    get: 
    returns a list of all comments

    post: 
    create a new instance of comment
    """
    def paginated_response(self, comments):
        paginator = CommentsPagination()
        page = paginator.paginate_queryset(comments, self.request)
        if page is not None:
            serializer = CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data, self.request)

    def get(self, request, post_id, format=None):
        comments = Comment.objects.filter(post=post_id)
        return self.paginated_response(comments)

    def post(self, request, post_id, format=None):
        # Is it one of our posts?
        if Post.objects.filter(pk=post_id).exists():
            commentData = request.data['comment']
            post = get_object_or_404(Post, pk=post_id)

            author_data = validate_and_transform_author(commentData['author'])
            serializer = CreateAuthorSerializer(data=author_data)
            if serializer.is_valid():
                author = Author.objects.get_or_create(id=serializer.validated_data['id'], defaults=serializer.validated_data)[0]
                comment = Comment.objects.create(comment=commentData['comment'], post=post, author=author)
            else:
                return Response({'Error': 'Could not add comment, bad author data', 'Message': serializer.errors}, status=400)
        # It is one of there posts
        else:
            # Get the host associated with this post
            host = request.data['post'].split('posts')[0]
            node = get_object_or_404(Node, url=host)

            try:
                url = request.data['post']
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

class AuthorList(APIView):
    def get(self, request, format=None):
        # Internal endpoint
        if is_request_from_remote_node(request):
            return Response(status=403)

        return Response(AuthorSerializer(Author.objects.all(), many=True).data, status=200)

class AuthorDetail(APIView):
    def put(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)
        request_author = get_object_or_404(Author, user=request.user)
        if request_author != author:
            return Response("You can't modify this without being the owner.", status=400)

        serializer = AuthorSerializer(author, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=200)
        return Response(serializer.errors, status=400)


    def get(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)

        if is_request_from_remote_node(request):
            friends = FollowingRelationship.objects.filter(user__id=author_id).values_list('follows', flat=True)
        else:
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
            follows = FollowingRelationship.objects.filter(user__id=author_id).values_list('user', flat=True)
            authors = Author.objects.filter(id__in=follows)
        else:
            authors = Author.objects.filter(id__in=get_friend_ids_of_author(author_id))

        author_urls = [each.url for each in authors]
        return Response({ "query": "friends","authors":author_urls})

    def post(self, request, author_id, format=None):
        if not Author.objects.exists(id=author_id):
            return Response({
                "query": "friends",
                "author": request.data["author"],
                "authors": []
            })
        
        if is_request_from_remote_node(request):
            following = FollowingRelationship.objects.filter(user__id=author_id).values_list('id', flat=True)
            following = Author.objects.filter(id__in=following).values_list('url', flat=True)
            urls = list(set(following).intersection(set(authors)))
            return Response({
                "query": "friends",
                "author": request.data["author"],
                "authors": urls
            })
        else:
            authors = request.data['authors']
            normalizedAuthors = []
            for a in authors:
                normalizedAuthors.append(append_trailing_slash(a))
            authors = normalizedAuthors
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
    
    def delete(self, request, author_id1, author_id2, format=None):
        try:
            FollowingRelationship.objects.get(user__id=author_id1, follows__id=author_id2).delete()
        except Exception as e:
            return Response({'Error': str(e)}, status=400)
        
        return Response(status=200)

# TODO: How to add remote authors? Also how to link them?
class FriendRequestList(APIView):
    def get(self, request, format=None):
        author = get_object_or_404(Author, user=request.user)
        friend_requests = FriendRequest.objects.filter(requestee=author).values_list('requester', flat=True)
        authors = Author.objects.filter(pk__in=friend_requests)
        return Response(AuthorSerializer(authors, many=True).data, status=200)


    def _handle_friend_request_from_remote_node(self, author_data, friend_data, request):
        our_user = get_object_or_404(Author, url=friend_data['url'])

        serializer = CreateAuthorSerializer(data=author_data)
        if serializer.is_valid():
            remote_user = Author.objects.get_or_create(id=serializer.validated_data['id'], defaults=serializer.validated_data)[0]

            # If our user already following them then return success
            if FollowingRelationship.objects.filter(user=our_user, follows=remote_user).exists():
                return Response({'Success': 'Users are now friends'}, status=201)
            
            FriendRequest.objects.get_or_create(requester=remote_user, requestee=our_user)
            return Response({'Success': 'Friend request created'}, status=201)

        return Response({"error": "Data we received is invalid", "data": request.data}, status=400)
    
    def _handle_friend_request_both_authors_local(self, author_data, friend_data):
        requester = get_object_or_404(Author, pk=author_data['id'])
        requestee = get_object_or_404(Author, pk=friend_data['id'])

        #If requestee has already friend requested requester
        if FriendRequest.objects.filter(requester=requestee, requestee=requester).exists():
            FriendRequest.objects.filter(requester=requestee, requestee=requester).delete()
            FollowingRelationship.objects.create(user=requester, follows=requestee)
            return Response({'Success': 'Users are now friends'}, status=201)
        
        #If requestee is already following requester
        if FollowingRelationship.objects.filter(user=requestee, follows=requester).exists():
            FollowingRelationship.objects.create(user=requester, follows=requestee)
            return Response({'Success': 'Users are now friends'}, status=201)
        
        FollowingRelationship.objects.get_or_create(user=requester, follows=requestee)
        FriendRequest.objects.get_or_create(requester=requester, requestee=requestee)

        return Response({'Success': 'Friend request created'}, status=201)
    
    def _handle_friend_request_from_local_other_author_remote(self, author_data, friend_data, request):
        print('attempting to send friend request to remote node')
        node = Node.objects.get(url=friend_data['host'])
        url = node.url + 'friendrequest/'
        try:
            req = requests.post(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password), data=json.dumps(request.data), headers={'Content-Type': 'application/json'})
            req.raise_for_status()
        except Exception as e:
            print("Exception occurred in friendrequest")
            print(str(e))
            return Response({'Error': 'Friend request not created, issue in remote sever', 'Message': str(e)}, status=201)

        author = get_object_or_404(Author, pk=author_data['id'])

        serializer = CreateAuthorSerializer(data=friend_data)
        if serializer.is_valid():
            friend = Author.objects.get_or_create(id=serializer.validated_data['id'], defaults=serializer.validated_data)[0]
            FollowingRelationship.objects.get_or_create(user=author, follows=friend)
            if FriendRequest.objects.filter(requester=friend, requestee=author).exists():
                FriendRequest.objects.get(requester=friend, requestee=author).delete()
            return Response({'Success': 'Friend request created'}, status=201)
        
        print('Could not create remote author', str(friend_data))
        return Response({'error': 'Could not create author', 'data': request.data}, status=500)

    def post(self, request, format=None):
        author_data = validate_and_transform_author(request.data['author'])
        friend_data = validate_and_transform_author(request.data['friend'])

        if is_request_from_remote_node(request):
            return self._handle_friend_request_from_remote_node(author_data, friend_data, request)

        elif author_data['host'] == friend_data['host']:
            return self._handle_friend_request_both_authors_local(author_data, friend_data)
        # We are getting a request from our front end and the other user is a remote user
        # Need to forward the request to the other server
        else:
            return self._handle_friend_request_from_local_other_author_remote(author_data, friend_data, request)

class CancelFriendRequest(APIView):
    
    def delete(self, request, author_id1, author_id2, format=None):
        try:
            FriendRequest.objects.get(requester__id=author_id1, requestee__id=author_id2).delete()
        except Exception as e:
            return Response({'Error': str(e)}, status=400)

        return Response(status=200)



class AllPostsAvailableToCurrentUser(APIView):
    """
    Returns a list of all posts that is visiable to current author
    """
    
    # http://stackoverflow.com/questions/29071312/pagination-in-django-rest-framework-using-api-view
    def get(self, request, format=None):
        # Request originating from remote node
        if is_request_from_remote_node(request):
            return handle_posts_to_remote_node(Post.objects.all(), request)

        # Request originating from an author
        else:
            author = get_object_or_404(Author, user=request.user)
            posts = self.get_all_posts(author)
            serializedPosts = PostSerializer(posts, many=True).data
            friends = [friend.url for friend in get_friends_of_authorPK(author.id)]
            print('friends of author ', friends)
            # Get all posts from remote authors
            for node in Node.objects.all():
                url = node.url + 'author/posts/'
                try:
                    req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
                    req.raise_for_status()
                    unfilteredForeignPosts = req.json()['posts']
                    
                    for post in unfilteredForeignPosts:
                        # Add all authors of foreign posts to our author database
                        author_data = validate_and_transform_author(post['author'])
                        serializer = CreateAuthorSerializer(data=author_data)
                        if serializer.is_valid():
                            Author.objects.update_or_create(id=serializer.validated_data['id'], defaults=serializer.validated_data)

                        if post['visibility'] == 'PUBLIC':
                            serializedPosts.append(post)
                        elif post['visibility'] == 'FRIENDS' and (post['author']['id'] in friends):
                            serializedPosts.append(post)
                except Exception as e:
                    print("Exception occurred in author/posts")
                    print(str(e))
                    
            sortedSerializedPosts = sort_by_newest_posts(serializedPosts)
            return Response(sortedSerializedPosts)

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

class PostsByAuthorAvailableToCurrentUser(APIView):
    """
        This should return all posts made by 'author_id' that are visible to the requesting User
        If Remote Node asking, return all Post objects made by that user that are not 'SERVERONLY'
        If we are requesting, need to do filtering based off of friend relationships
    """
    def get(self, request, author_id, format=None):
        if is_request_from_remote_node(request):
            return handle_posts_to_remote_node(Post.objects.filter(author__id=author_id), request)
        else:
            author = Author.objects.get(pk=author_id)
            # Local author
            print(author.user)
            if author.user:
                print("local author")
                posts = Post.objects.filter(author__id=author_id)
                # If authenticated user is self should return all posts by user
                is_friend = is_friends(author_id, request.user.author.id)
                if not (is_friend or author_id == request.user.author.id):
                    posts = posts.exclude(visibility="FRIENDS")
                sortedSerializedPosts = sort_by_newest_posts(PostSerializer(posts, many=True).data)
                return Response(sortedSerializedPosts)
            # Remote author
            else:
                print("remote author")
                print("author.host = ", author.host)
                node = Node.objects.get(url=author.host)
                url = author.host + 'author/' + author_id + '/posts/'
                friends = [friend.url for friend in get_friends_of_authorPK(author.id)]
                try:
                    req = requests.get(url, auth=requests.auth.HTTPBasicAuth(node.username, node.password))
                    req.raise_for_status()
                    posts = req.json()['posts']
                    serializedPosts = []
                    for post in posts:
                        if post['visibility'] == 'PUBLIC':
                            serializedPosts.append(post)
                        elif post['visibility'] == 'FRIENDS' and (post['author']['id'] in friends):
                            serializedPosts.append(post)
                        elif author.url in post['visibleTo']:
                            serializedPosts.append(post)

                    sortedSerializedPosts = sort_by_newest_posts(serializedPosts)
                    return Response(sortedSerializedPosts)
                except Exception as e:
                    print(str(e))
                    return Response({'Error': 'Could not fetch foreign author posts', 'message': str(e), 'success': False}, status=400)

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
        
