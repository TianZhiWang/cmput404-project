[![Build Status](https://travis-ci.org/TianZhiWang/cmput404-project.svg?branch=master)](https://travis-ci.org/TianZhiWang/cmput404-project)  

#Live Preview
[https://coolbears.herokuapp.com/](https://coolbears.herokuapp.com/)  
  
Demo Video [https://www.youtube.com/watch?v=8KM50K98_NE](https://www.youtube.com/watch?v=8KM50K98_NE)

# Installation of Client
```
npm install  
npm start  
```
[http://localhost:8080/webpack-dev-server/](http://localhost:8080/webpack-dev-server/)

p.s. use sudo npm install on linux  

# Server
## Installation
Ensure that you have a current version of pip
```
> pip -V
> pip 9.0.1 from /Library/Python/2.7/site-packages (python 2.7)
```

```
> source ./venv/bin/activate
```

First source your virtual envronment!
```
> pip install -r requirements.txt
```

## Running The Server
```
> python manage.py runserver
```
# Deploying to Heroku
Deploy master  
```
> heroku login
> git push heroku master
```
Deploy non-master  
```
> heroku login
> git push heroku branch-name-here:master
```
## Heroku Tips
Database  
Use this [https://elements.heroku.com/addons/heroku-postgresql](https://elements.heroku.com/addons/heroku-postgresql)

Migrate
```
> heroku run python manage.py migrate
```
Redeploy  
```
git commit --allow-empty -m "Deploying api"
git push heroku master
```
Logs  
```
> heroku logs -t --app coolbears 
```
Bash 
```
> heroku run bash
```
Settings  
```
> heroku config:set DISABLE_COLLECTSTATIC=1
```

# Commiting
Remember that you should reference issues in your commits when the [commit is closing an issue](https://help.github.com/articles/closing-issues-via-commit-messages/).  
How to [write a good commit message](https://chris.beams.io/posts/git-commit/).  

# Sources
Libraries are listed in package.json and requirements.txt
  
- src/index.jx  https://github.com/zalmoxisus/redux-devtools-extension Mihail Diordiev (https://github.com/zalmoxisus) (MIT)
- Reducer update item in an array: http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#updating-an-item-in-an-array  
- [Django Serialization](https://docs.djangoproject.com/en/1.10/topics/serialization/), accessed on March 9, 2017
- [Django Model field reference](https://docs.djangoproject.com/en/1.10/ref/models/fields/), accessed on March 9, 2017
- [Django Nested Relations] (http://www.django-rest-framework.org/api-guide/relations/), accessed on March 9, 2017
- [Django ManyToManyField](https://docs.djangoproject.com/en/1.10/ref/models/fields/#django.db.models.ManyToManyField), accessed March 12, 2017
- [Django REST Framework Testing](http://www.django-rest-framework.org/api-guide/testing/), accessed March 12, 2017
- [Django Framework Running Testing From A Directory](https://docs.djangoproject.com/en/1.8/topics/testing/overview/#running-tests), accessed March 22, 2017
- [Django Framework Headers In Requests](https://docs.djangoproject.com/en/dev/topics/testing/tools/#making-requests), accessed March 23, 2017
- Some code in server/quickstart/serializers.py was written by http://stackoverflow.com/a/33048798 joslarson (http://stackoverflow.com/users/3097518/joslarson) on StackOverflow, modified by Kyle Carlstrom (CC-BY-SA 3.0)
- https://docs.djangoproject.com/en/1.10/ref/models/fields/#django.db.models.ForeignKey.on_delete (accessed on March 9, 2017)
- Some code in server/quickstart/models.py is based on code written by http://stackoverflow.com/a/13496120 user1839132 (http://stackoverflow.com/users/1839132/user1839132) and modified by Kyle Carlstrom (CC-BY-SA 3.0)
- Some code in server/quickstart/views.py is based on code written by [Peter DeGlopper](http://stackoverflow.com/users/2337736/peter-deglopper) at [StackOverflow](http://stackoverflow.com/questions/20135343/django-unique-filtering) and modified by Conner Dunn (CC-BY-SA 3.0) as it was posted before Feb 1, 2016.
- server/quickstart/views.py http://stackoverflow.com/questions/27085219/how-can-i-disable-authentication-in-django-rest-framework#comment63774493_27086121 Oliver Ford (http://stackoverflow.com/users/1446048/oliver-ford) (MIT)
- server/quickstart/views.py Idea for login came from: https://richardtier.com/2014/02/25/django-rest-framework-user-endpoint/ (Richard Tier)
- server/quickstart/views.py Some code written by andi (http://stackoverflow.com/users/953553/andi) http://stackoverflow.com/a/34084329, modified by Kyle Carlstrom (CC-BY-SA 3.0)
- server/quickstart/views.py http://www.django-rest-framework.org/tutorial/4-authentication-and-permissions/#associating-snippets-with-users
- server/quickstart/views.py http://www.django-rest-framework.org/api-guide/filtering/#filtering-against-the-current-user
- server/quickstart/serializers.py http://www.django-rest-framework.org/api-guide/serializers/#overriding-serialization-and-deserialization-behavior
- server/quickstart/views.py http://stackoverflow.com/a/42411533 Erik Westrup (http://stackoverflow.com/users/265508/erik-westrup) (MIT)
- server/quickstart/models.py Idea for friendship model http://stackoverflow.com/a/13496120 by user1839132 (http://stackoverflow.com/users/1839132/user1839132), modified by Kyle Carlstrom (CC-BY-SA 3.0)
- server/quickstart/models.py http://stackoverflow.com/a/2529875 Ludwik Trammer (http://stackoverflow.com/users/262618/ludwik-trammer) (MIT)
- server/quickstart/pagination.py http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg) (CC-BY-SA 3.0) modified by Tian Zhi Wang and Kyle Carlstrom
- server/quickstart/views.py http://stackoverflow.com/a/31401203 prawg (http://stackoverflow.com/users/4698253/prawg) (CC-BY-SA 3.0) modified by Tian Zhi Wang and Kyle Carlstrom
- server/settings.py http://www.django-rest-framework.org/api-guide/permissions/#setting-the-permission-policy
- server/settings.py http://www.django-rest-framework.org/api-guide/authentication/#setting-the-authentication-scheme
- server/settings.py http://stackoverflow.com/a/22360893 stormlifter (http://stackoverflow.com/users/344156/stormlifter)
- src/actions/index.js and src/actions/utils/index.js Some code written by unyo (http://stackoverflow.com/users/2077884/unyo http://stackoverflow.com/a/35780539
- src/actions/index.js and src/actions/utils/index.js https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- Used DRF Docs for documentaions on the Django Rest Framework.  http://drfdocs.com/
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- http://stackoverflow.com/a/36771366 Dr Manhattan (http://stackoverflow.com/users/3571614/dr-manhattan) (MIT)
- Serializing many to many field http://stackoverflow.com/a/28748704 LiteWait (http://stackoverflow.com/users/446347/litewait) (CC-BY-SA 3.0)
- https://docs.djangoproject.com/en/1.10/ref/models/fields/#uuidfield
- http://www.django-rest-framework.org/api-guide/fields/#uuidfield
- https://docs.djangoproject.com/en/1.10/ref/models/fields/#datefield
- https://docs.python.org/2/library/re.html
- https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
- https://regex101.com/
- image tutorial: https://www.youtube.com/watch?v=HSgyPfibrqQ&t=1s
- http://stackoverflow.com/a/43025574 BKC (https://stackoverflow.com/users/1932097/bkc) MIT
- http://stackoverflow.com/a/33580254 joemaddalone (http://stackoverflow.com/users/1042510/joemaddalone) MIT
- http://stackoverflow.com/a/38606711 darkterror (http://stackoverflow.com/users/3464760/darkterror) (MIT)
# About this project
This project is for CMPUT 404, see the [project description here](https://github.com/abramhindle/CMPUT404-project-socialdistribution).

# License

