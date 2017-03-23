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
from models import Comment, Post, FollowingRelationship, Author, RemoteAuthor
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
from pagination import PostsPagination, PaginationMixin

def get_friends_of_authorPK(authorPK):
    following = FollowingRelationship.objects.filter(user=authorPK).values('follows') # everyone currentUser follows
    following_pks = [author['follows'] for author in following]
    followed = FollowingRelationship.objects.filter(follows=authorPK).values('user')  # everyone that follows currentUser
    return followed.filter(user__in=following_pks)

class PostList(generics.ListCreateAPIView):
    """
    List all posts, or create a new post.

    get: 
    returns all the posts.

    post: 
    create a new instance of post
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = PostsPagination

    # http://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/#associating-snippets-with-users
    # Written by andi (http://stackoverflow.com/users/953553/andi) http://stackoverflow.com/a/34084329, modified by Kyle Carlstrom
    def get_serializer_context(self):
        author = get_object_or_404(Author, user=self.request.user)
        return {
            'author': author
        }

class PostDetail(APIView):
    def delete(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        post.delete()
        return Response(status=200)

class CommentList(APIView):
    """
    List all comments of a post, or create a new comment.

    get: 
    returns a list of all comments

    post: 
    create a new instance of comment
    """

    # TODO: Wrap in pagination class
    def get(self, request, post_id, format=None):
        comments = CommentSerializer(Comment.objects.filter(post=post_id), many=True)
        return Response(comments.data, status=200)
    
    # TODO: Move validation, check if local or remote author
    # Can't user serializer as username isn't unique when it looks at user model
    # Decide if local or foreign from url of author
    def post(self, request, post_id, format=None):
        data = request.data['comment']
        post = get_object_or_404(Post, pk=post_id)
        author = get_object_or_404(Author, pk=data['author']['id'])
        comment = Comment.objects.create(comment=data['comment'], post=post, author=author)

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
    """
    Get Author by Id

    get:
    Returns an author
    """
    def get(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)
        serialized_data = AuthorSerializer(author).data
        return Response(data=serialized_data, status=200)

class FriendsList(APIView):
    """
    List all friends of author

    get:
    Returns a list of all authors that are friends
    """
    def get(self, request, author_id, format=None):
        author = get_object_or_404(Author, pk=author_id)
        following = FollowingRelationship.objects.filter(user=author_id).values('follows') # everyone currentUser follows
        following_pks = [author['follows'] for author in following]
        followed = FollowingRelationship.objects.filter(follows=author_id).values('user')  # everyone that follows currentUser
        friends = followed.filter(user__in=following_pks)

        users = Author.objects.filter(id__in=friends)
        formatedUsers = AuthorSerializer(users,many=True).data
        return Response({ "query": "friends","authors":formatedUsers})


# TODO: How to add remote authors? Also how to link them?
class FollowingRelationshipList(APIView):
    def post(self, request, format=None):
        author_data = request.data['author']
        friend_data = request.data['friend']

        # Makes more sense to maybe check for foreign or remote before getting
        try:
            author = Author.objects.get(pk=author_data['id'])
        except ObjectDoesNotExist:
            print('Foreign author')
            author = RemoteAuthor.objects.get_or_create(**author_data)

        friend = get_object_or_404(Author, pk=friend_data['id'])

        FollowingRelationship.objects.create(user=author, follows=friend)
        return Response(status=201)



class AllPostsAvailableToCurrentUser(APIView,PaginationMixin):
    """
    Returns a list of all posts that is visiable to current author
    """
    pagination_class = PostsPagination
    
    # http://stackoverflow.com/questions/29071312/pagination-in-django-rest-framework-using-api-view
    def get(self, request, format=None):
        posts = self.get_all_posts(request.user.author)

        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializedPosts = PostSerializer(posts, many=True)        
        return Response(serializedPosts.data)

    def get_all_posts(self, currentUser):
        publicPosts = Post.objects.all().filter(visibility="PUBLIC")
        currentUserPosts = Post.objects.all().filter(author__id=currentUser.pk) # TODO: test currentUser.pk works
        friendOfAFriendPosts = self.get_queryset_friends_of_a_friend(currentUser)
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

    def get_queryset_friends_of_a_friend(self, currentUser):
        currentUserFriends = get_friends_of_authorPK(currentUser.pk)
        temp = get_friends_of_authorPK(currentUser.pk)
        for f in currentUserFriends:
            temp = temp | get_friends_of_authorPK(f["user"])
        return Post.objects.all().filter(author__in=temp).filter(visibility="FOAF")

    def get_queryset_friends(self, currentUser):
        friendsOfCurrentUser = get_friends_of_authorPK(currentUser.pk)

        return Post.objects.all().filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

class PostsByAuthorAvailableToCurrentUser(APIView, PaginationMixin):

    pagination_class = PostsPagination

    def get(self, request, author_id, format=None):
        publicPosts = Post.objects.all().filter(author__id=author_id).filter(visibility="PUBLIC") 
        privateToUser = Post.objects.all().filter(visibility="PRIVATE", visibleTo=request.user) 
        friendsOfCurrentUser = get_friends_of_authorPK(request.user.pk)
        friendsPosts = Post.objects.all().filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

        posts = publicPosts | privateToUser | friendsPosts

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
        user = get_object_or_404(User, pk=request.user.id)
        author = get_object_or_404(Author, user=user)
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
        author = Author.objects.create(displayName=displayName, user=user)
        author.save()
        return Response(status=200)
        
