from rest_framework import viewsets
from imageupload_rest.serializers import uploadImageSerializer 
from imageupload.models import UploadImages


class uploadImageViewSet (viewsets.ModelViewSet):

	queryset = UploadImages.objects.all()
	serializer_class = uploadImageSerializer
