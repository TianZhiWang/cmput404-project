"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""

from django.conf.urls import url, include
from server.quickstart import views
from django.contrib import admin
from django.views.generic import TemplateView

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^posts/(?P<post_id>[0-9]+)/comments/$', views.CommentList.as_view()),
    url(r'^posts/$', views.PostList.as_view()),
    url(r'^authors/$', views.AuthorList.as_view()),
    url(r'^authors/posts/$', views.AllPostsAvailableToCurrentUser.as_view()),
    url(r'^authors/(?P<pk>[0-9]+)/friends/$', views.CurrentFriendsList.as_view()),
    url(r'^friendrequest/$', views.FollowingRelationshipList.as_view()),
    url(r'^friends/(?P<pk>[0-9]+)/$', views.FollowingRelationshipDetail.as_view()),
    url(r'^login/$', views.LoginView.as_view()),
    url(r'^register/$', views.RegisterView.as_view()),
    url(r'^admin/', admin.site.urls),
    url(r'^$', TemplateView.as_view(template_name="react.html"), name="root"),
    url(r'^docs/', include('rest_framework_docs.urls'))
]
