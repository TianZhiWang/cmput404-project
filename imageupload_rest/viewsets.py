from rest_framework import viewsets
from imageupload_rest.serializers import uploadImageSerializer 
from server.quickstart.models import Post 


class uploadImageViewSet (viewsets.ModelViewSet):

	queryset = Post.objects.all()
	serializer_class = uploadImageSerializer
