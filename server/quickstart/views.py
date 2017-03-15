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
from models import Comment, Post, FollowingRelationship
from django.contrib.auth.models import User
from serializers import CommentSerializer, PostSerializer, UserSerializer, FollowingRelationshipSerializer
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404


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

    # http://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/#associating-snippets-with-users
    # Written by andi (http://stackoverflow.com/users/953553/andi) http://stackoverflow.com/a/34084329, modified by Kyle Carlstrom
    def get_serializer_context(self):
        return {
            'author': self.request.user
        }

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
    def post(self, request, post_id, format=None):
        post = get_object_or_404(Post, pk=post_id)
        author = get_object_or_404(User, pk=request.data['author']['id'])
        comment = Comment.objects.create(comment=request.data['comment'], post=post, author=author)

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

    post:
    Create a new instance of an Author
    """
    def get(self, request, format=None):
        currentUser = request.user.id
        users = User.objects.all()
        following = FollowingRelationship.objects.filter(user=currentUser).values('follows')
        followingUsers = User.objects.filter(id__in=following)
        followed = FollowingRelationship.objects.filter(follows=currentUser).values('user')
        followedUsers = User.objects.filter(id__in=followed)

        formattedUsers = []
        for user in users:
            author = {'username': user.username, 'id': user.id, 'isFollowing': (user in followingUsers), 'isFollowed': (user in followedUsers)}
            formattedUsers.append(author)
        
        return Response(formattedUsers)

class CurrentFriendsList(generics.ListCreateAPIView):
    """
    List all friends of current author

    get: 
    Return a list of all the posts the current instance of author is friends with
    """
    serializer_class = UserSerializer

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

class FollowingRelationshipList(APIView):
    def post(self, request, format=None):
        user = get_object_or_404(User, pk=request.data['user'])
        follows = get_object_or_404(User, pk=request.data['follows'])

        FollowingRelationship.objects.create(user=user, follows=follows)
        return Response(status=201)

class FollowingRelationshipDetail(APIView):
    def delete(self, request, pk, format=None):
        user = request.user
        follows = get_object_or_404(User, pk=pk)
        relationship = get_object_or_404(FollowingRelationship, user=user, follows=follows)
        relationship.delete()
        return Response(status=204)

class AllPostsAvailableToCurrentUser(generics.ListAPIView):
    """
    Returns a list of all posts that is visiable to current author
    """
    serializer_class = PostSerializer

    def get_queryset(self):
        currentUser = self.request.user
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
        return intersection.distinct()  # I don't want to return more than on of the same post
        # end of code from Peter DeGlopper

    def get_queryset_visible_to(self, currentUser):
        return Post.objects.all().filter(visibility="PRIVATE", visibleTo=currentUser)

    def get_queryset_friends_of_a_friend(self, currentUser):
        currentUserFriends = self.get_friends_of_authorPK(currentUser.pk)
        temp = self.get_friends_of_authorPK(currentUser.pk)
        for f in currentUserFriends:
            temp = temp | self.get_friends_of_authorPK(f["user"])
        return Post.objects.all().filter(author__in=temp).filter(visibility="FOAF")

    def get_friends_of_authorPK(self, authorPK):
        following = FollowingRelationship.objects.filter(user=authorPK).values('follows') # everyone currentUser follows
        following_pks = [author['follows'] for author in following]
        followed = FollowingRelationship.objects.filter(follows=authorPK).values('user')  # everyone that follows currentUser

        return followed.filter(user__in=following_pks)

    def get_queryset_friends(self, currentUser):
        friendsOfCurrentUser = self.get_friends_of_authorPK(currentUser.pk)

        return Post.objects.all().filter(author__in=friendsOfCurrentUser).filter(visibility="FRIENDS")

# https://richardtier.com/2014/02/25/django-rest-framework-user-endpoint/ (Richard Tier), No code but put in readme
class LoginView(APIView):
    "Login and get a response"
    def post(self, request):
        author = UserSerializer(request.user)
        return Response(data=author.data, status=200)

"""
Will return a 400 if the author exists and 201 created otherwise
"""
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    # http://stackoverflow.com/questions/27085219/how-can-i-disable-authentication-in-django-rest-framework#comment63774493_27086121 Oliver Ford (http://stackoverflow.com/users/1446048/oliver-ford) (MIT)
    authentication_classes = []
