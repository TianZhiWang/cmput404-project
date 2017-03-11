# License

# Copyright (c) 2011-2017, Tom Christie All rights reserved. Kyle Carlstrom

# Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

# Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
from rest_framework import serializers
from models import Post, Comment, FollowingRelationship, Author

class FollowingRelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowingRelationship
        fields = ('user', 'follows')

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ('id', 'displayName')

# When we read we get the nested data, but we only have to passed the author_id when we write
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields='__all__'
    
    # http://www.django-rest-framework.org/api-guide/serializers/#baseserializer
    def to_representation(self, obj):
        return {
            'id': obj.id,
            'comment': obj.comment,
            'author': {
                'id': obj.author.id,
                'displayName': obj.author.displayName
            }
        }
    
    def to_internal_value(self, data):
        return {
            'comment': data['comment'],
            'author': Author.objects.get(pk=data['author']),
            'post': Post.objects.get(pk=self.context['post']),
        }

# When we read we get the nested data, but we only have to passed the author_id when we write
class PostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'description', 'contentType', 'author', 'comments')
    
    def to_internal_value(self, data):
        return {
            'title': data['title'],
            'content': data['content'],
            'description': data['description'],
            'contentType': data['contentType'],
            'author': Author.objects.get(pk=data['author']),
        }