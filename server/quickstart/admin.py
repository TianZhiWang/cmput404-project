from django.contrib import admin

# Register your models here.
from models import Post, Comment, FollowingRelationship, Author

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(FollowingRelationship)
admin.site.register(Author)