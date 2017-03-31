# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, Prawg(http://stackoverflow.com/users/4698253/prawg)

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

from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

class PostsPagination(PageNumberPagination):
    page_size_query_param = 'size'

    def get_paginated_response(self, data):
        page_size = self.request.query_params.get('size', api_settings.PAGE_SIZE)

        return Response({
            'size': page_size,
            'count': self.page.paginator.count,            
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'posts': data
        })

class CommentsPagination(PageNumberPagination):
    page_size_query_param = 'size'

    def get_paginated_response(self, data):
        page_size = self.request.query_params.get('size', api_settings.PAGE_SIZE)

        return Response({
            'size': page_size,
            'count': self.page.paginator.count,            
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'comments': data
        })

class PaginationMixin(object):
    # Written by http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg), (CC-BY-SA 3.0)
    @property
    def paginator(self):
        """
        The paginator instance associated with the view, or `None`.
        """
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator
    
    # Written by http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg), (CC-BY-SA 3.0)
    def paginate_queryset(self, queryset):
        """
        Return a single page of results, or `None` if pagination is disabled.
        """
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)
    
    # Written by http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg), (CC-BY-SA 3.0)
    def get_paginated_response(self, data):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data)

    def paginated_response(self, data):
        page = self.paginate_queryset(data)
        if page is not None:
            serializer = self.serializer_class(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        return Response(serializer_class(posts, many=True).data)