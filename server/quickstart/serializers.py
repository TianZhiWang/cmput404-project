# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Erik Westrup (http://stackoverflow.com/users/265508/erik-westrup),
# and darkterror (http://stackoverflow.com/users/3464760/darkterror), Dr Manhattan (http://stackoverflow.com/users/3571614/dr-manhattan)

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
from rest_framework import serializers
from models import Post, Comment, FollowingRelationship
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Serializes the FollowingRelationship Model
class FollowingRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowingRelationship
        fields = ('user', 'follows')

# Serializes the User Model
class UserSerializer(serializers.ModelSerializer):
    # http://stackoverflow.com/a/42411533 Erik Westrup (http://stackoverflow.com/users/265508/erik-westrup) (MIT)
    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.set_password(validated_data['password'])
        user.is_active = False
        user.save()
        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name')
        # http://stackoverflow.com/a/36771366 Dr Manhattan (http://stackoverflow.com/users/3571614/dr-manhattan) (MIT)
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

# Serializes the Comment Model
# When we read we get the nested data, but we only have to passed the author_id when we write
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields=('id', 'comment', 'author')

# Serializes the Post Model
# When we read we get the nested data, but we only have to passed the author_id when we write
# http://www.django-rest-framework.org/api-guide/relations/#api-reference
class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'description', 'contentType', 'author', 'comments', 'visibility', 'visibleTo')

    # http://www.django-rest-framework.org/api-guide/serializers/#saving-instances
    # https://docs.djangoproject.com/en/1.10/topics/db/examples/many_to_many/
    # http://stackoverflow.com/a/28748704 LiteWait (http://stackoverflow.com/users/446347/litewait) (CC-BY-SA 3.0),
    # modified by Kyle Carlstrom
    def create(self, validated_data):
        author = User.objects.get(pk=self.context['author'].id)
        visibleTo = validated_data['visibleTo']
        del validated_data['visibleTo']
        post = Post.objects.create(author=author, **validated_data)
        post.save()
        for user in visibleTo:
            post.visibleTo.add(user)
        return post