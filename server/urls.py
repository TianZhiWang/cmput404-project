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
    url(r'^posts/(?P<post_id>[0-9a-zA-Z-]+)/comments/$', views.CommentList.as_view(), name="postComment"),
    url(r'^posts/$', views.PostList.as_view(), name="post"),
    url(r'^authors/$', views.AuthorList.as_view(), name="author"),
    url(r'^author/posts/$', views.AllPostsAvailableToCurrentUser.as_view(), name="authorPost"),
    url(r'^author/(?P<author_id>[0-9a-zA-Z-]+)/$', views.AuthorDetail.as_view()),
    url(r'^author/(?P<author_id>[0-9a-zA-Z-]+)/friends/$', views.FriendsList.as_view()),
    url(r'^author/(?P<author_id>[0-9a-zA-Z-]+)/posts/$', views.PostsByAuthorAvailableToCurrentUser.as_view()),
    url(r'^author/([0-9a-zA-Z-]+)/posts/(?P<post_id>[0-9a-zA-Z-]+)/$', views.PostDetail.as_view(), name="authorPostId"),
    url(r'^friendrequest/$', views.FollowingRelationshipList.as_view(), name="friendRequest"),
    url(r'^login/$', views.LoginView.as_view(), name="login"),
    url(r'^register/$', views.RegisterView.as_view(), name="register"),
    url(r'^admin/', admin.site.urls, name="admin"),
    url(r'^$', TemplateView.as_view(template_name="react.html"), name="root"),
    url(r'^docs/', include('rest_framework_docs.urls'))
]
