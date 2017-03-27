from django.conf.urls import url,include
from rest_framework import routers
from imageupload_rest.viewsets import uploadImageViewSet


router = routers.DefaultRouter()
router.register('images', uploadImageViewSet, 'images')

urlpatterns = [
	url(r'^', include(router.urls)),
]