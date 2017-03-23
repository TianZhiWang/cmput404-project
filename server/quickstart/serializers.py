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
from models import Post, Comment, FollowingRelationship, Author
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class AuthorSerializer(serializers.Serializer):
    id = serializers.UUIDField(format='hex_verbose')
    displayName = serializers.CharField(max_length=150)
    url = serializers.URLField()
    host = serializers.URLField()
    
# Serializes the Comment Model
# When we read we get the nested data, but we only have to passed the author_id when we write
class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    class Meta:
        model = Comment
        fields=('id', 'comment', 'author', 'published')

# Serializes the Post Model
# When we read we get the nested data, but we only have to passed the author_id when we write
# http://www.django-rest-framework.org/api-guide/relations/#api-reference
class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    comments = serializers.SerializerMethodField('paginated_comments')
    source = serializers.SerializerMethodField()
    origin = serializers.SerializerMethodField()
    count = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'source', 'origin', 'description', 'contentType', 'author', 'count', 'size' , 'next', 'comments', 'visibility', 'visibleTo', 'published')

    def paginated_comments(self, obj):
        comments = Comment.objects.all().filter(post__id=obj.id).order_by('published')[:5]
        serializer = CommentSerializer(comments, many=True)
        return serializer.data

    def get_source(self, obj):
        source = obj.source + "/posts/" + str(obj.id)
        return source

    def get_origin(self, obj):
        origin = obj.origin + "/posts/" + str(obj.id)
        return origin

    def get_count(self, obj):
        count = Comment.objects.all().filter(post__id=obj.id).count()
        return count
    
    def get_size(self, obj):
        comments = Comment.objects.all().filter(post__id=obj.id).count() 
        size = comments if comments < 5 else 5
        return size
    
    def get_next(self, obj):
        next = obj.origin + "/posts/" + str(obj.id) + "/comments"
        return next

    # http://www.django-rest-framework.org/api-guide/serializers/#saving-instances
    # https://docs.djangoproject.com/en/1.10/topics/db/examples/many_to_many/
    # http://stackoverflow.com/a/28748704 LiteWait (http://stackoverflow.com/users/446347/litewait) (CC-BY-SA 3.0),
    # modified by Kyle Carlstrom
    def create(self, validated_data):
        author = self.context['author']
        visibleTo = validated_data.pop('visibleTo')
        post = Post.objects.create(author=author, **validated_data)
        post.save()
        for user in visibleTo:
            post.visibleTo.add(user)
        return post