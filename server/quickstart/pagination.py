# MIT License

# Copyright (c) 2017 Conner Dunn, Tian Zhi Wang, Kyle Carlstrom, Xin Yi Wang, prawg (http://stackoverflow.com/users/4698253/prawg)

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

# Written by http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg) (CC-BY-SA 3.0)
# modified by Tian Zhi Wang and Kyle Carlstrom
class PostsPagination(PageNumberPagination):
    page_size_query_param = 'size'

    def get_paginated_response(self, data, request):
        page_size = request.query_params.get('size', api_settings.PAGE_SIZE)

        return Response({
            'size': page_size,
            'count': self.page.paginator.count,            
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'posts': data
        })
# Written by http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg) (CC-BY-SA 3.0)
# modified by Tian Zhi Wang and Kyle Carlstrom
class CommentsPagination(PageNumberPagination):
    page_size_query_param = 'size'

    def get_paginated_response(self, data, request):
        page_size = request.query_params.get('size', api_settings.PAGE_SIZE)

        return Response({
            'size': page_size,
            'count': self.page.paginator.count,            
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'comments': data
        })