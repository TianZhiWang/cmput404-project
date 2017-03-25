from rest_framework import serializers
from server.quickstart.models import Post

class uploadImageSerializer(serializers.ModelSerializer):
	class Meta:
		 model = Post
		 fields = ('id','image')