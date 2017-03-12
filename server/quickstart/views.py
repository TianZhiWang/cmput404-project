# License

# Copyright (c) 2011-2017, Tom Christie All rights reserved.

# Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

# Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from models import Comment, Post, FollowingRelationship
from django.contrib.auth.models import User
from serializers import CommentSerializer, PostSerializer, AuthorSerializer, FollowingRelationshipSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework import serializers
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated


class PostList(generics.ListCreateAPIView):
    """
    List all posts, or create a new post.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

    # http://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/#associating-snippets-with-users
    def get_serializer_context(self):
        return {
            'author': self.request.user
        }

class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

class CommentList(generics.ListCreateAPIView):
    """
    List all comments, or create a new comment.
    """
    serializer_class = CommentSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

    # http://www.django-rest-framework.org/api-guide/filtering/#filtering-against-the-current-user
    def get_queryset(self):
        post = self.kwargs['post']
        return Comment.objects.filter(post=post)
    
    # http://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/#associating-snippets-with-users

    # Written by andi (http://stackoverflow.com/users/953553/andi) http://stackoverflow.com/a/34084329, modified by Kyle Carlstrom
    def get_serializer_context(self):
        return {
            'post': self.kwargs['post'],
            'author': self.request.user
            }

class CommentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

class AuthorList(generics.ListCreateAPIView):
    """
    List all authors, or create a new author.
    """
    queryset = User.objects.all()
    serializer_class = AuthorSerializer

class AuthorDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AuthorSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

class CurrentFriendsList(generics.ListCreateAPIView):
    serializer_class = AuthorSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        following_pks = []
        authorPK = self.kwargs['pk']
        following = FollowingRelationship.objects.filter(user=authorPK).values('follows')
        for author in following:
            following_pks.append(author['follows'])

        followed = FollowingRelationship.objects.filter(follows=authorPK).values('user')

        friends = followed.filter(user__in=following_pks)
        authors = User.objects.filter(pk__in=friends)
        return authors

class FriendsList(generics.ListCreateAPIView):
    queryset = FollowingRelationship.objects.all()
    serializer_class = FollowingRelationshipSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)


class AllPostsAvailableToCurrentUser(generics.ListAPIView):
    serializer_class = PostSerializer
    authentication_classes = (BasicAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        currentUser = self.request.user
        print(currentUser.pk)
        publicPosts = Post.objects.all().filter(visibility="PUBLIC")
        currentUserPosts = Post.objects.all().filter(visibility="PRIVATE", author__id=currentUser.pk) # TODO: test currentUser.pk works
        friendOfAFriendPosts = self.get_queryset_friends_of_a_friend(currentUser)
        friendPosts = self.get_queryset_friends(currentUser)
        serverOnlyPosts = Post.objects.all().filter(visibility="SERVERONLY") # TODO: check that user is on our server
        return publicPosts | currentUserPosts | friendPosts | serverOnlyPosts | friendOfAFriendPosts

    def get_queryset_friends_of_a_friend(self, currentUser):
        currentUserFriends = self.get_friends_of_authorPK(currentUser.pk)
        temp = self.get_friends_of_authorPK(currentUser.pk)
        for f in currentUserFriends:
            temp = temp | self.get_friends_of_authorPK(f["user"])
        return Post.objects.all().filter(author__in=temp).filter(visibility="FOAF")

    def get_friends_of_authorPK(self, authorPK):
        following_pks = []
        following = FollowingRelationship.objects.filter(user=authorPK).values('follows') # everyone currentUser follows
        for authorFromFollowing in following:
            following_pks.append(authorFromFollowing['follows'])

        followed = FollowingRelationship.objects.filter(follows=authorPK).values('user')  # everyone that follows currentUser

        return followed.filter(user__in=following_pks)

    def get_queryset_friends(self, currentUser):
        friendsOfCurrentUser = self.get_friends_of_authorPK(currentUser.pk)

        return Post.objects.all().filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

