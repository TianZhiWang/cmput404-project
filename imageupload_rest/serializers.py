from rest_framework import serializers
from imageupload.models import UploadImages

class uploadImageSerializer(serializers.ModelSerializer):
	class Meta:
		 model = UploadImages
		 fields = ('pk','image')