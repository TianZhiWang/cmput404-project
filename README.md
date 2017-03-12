[![Build Status](https://travis-ci.org/TianZhiWang/cmput404-project.svg?branch=master)](https://travis-ci.org/TianZhiWang/cmput404-project)  

# Installation of Client
npm install  
npm start  

http://localhost:8080/webpack-dev-server/  

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
heroku config:set DISABLE_COLLECTSTATIC=1
```

# Commiting
Remember that you should reference issues in your commits when the [commit is closing an issue](https://help.github.com/articles/closing-issues-via-commit-messages/).  
How to [write a good commit message](https://chris.beams.io/posts/git-commit/).  

# Sources
reactjs: https://facebook.github.io/react/  
redux: http://redux.js.org/  
react-redux: https://github.com/reactjs/react-redux  
react-router: https://github.com/ReactTraining/react-router,https://css-tricks.com/learning-react-router/  
font-awesome: http://fontawesome.io/  
es6: http://es6-features.org/  
npm version: '3.10.8'  
react-markdown : http://rexxars.github.io/react-markdown/
  
Reducer update item in an array: http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html#updating-an-item-in-an-array  

- [Django Serialization](https://docs.djangoproject.com/en/1.10/topics/serialization/), accessed on March 9, 2017
- [Django Model field reference](https://docs.djangoproject.com/en/1.10/ref/models/fields/), accessed on March 9, 2017
- [Django Nested Relations] (http://www.django-rest-framework.org/api-guide/relations/), accessed on March 9, 2017
- [Django ManyToManyField](https://docs.djangoproject.com/en/1.10/ref/models/fields/#django.db.models.ManyToManyField), accessed March 12, 2017
AllPostsAvailableToCurrentUser adheres to visibleTo field
- Some code in server/quickstart/serializers.py was written by http://stackoverflow.com/a/33048798 joslarson (http://stackoverflow.com/users/3097518/joslarson) on StackOverflow, modified by Kyle Carlstrom (CC-BY-SA 3.0)
- https://docs.djangoproject.com/en/1.10/ref/models/fields/#django.db.models.ForeignKey.on_delete (accessed on March 9, 2017)
- Some code in server/quickstart/models.py is based on code written by http://stackoverflow.com/a/13496120 user1839132 (http://stackoverflow.com/users/1839132/user1839132) and modified by Kyle Carlstrom (CC-BY-SA 3.0)

- Used DRF Docs for documentaions on the Django Rest Framework.  http://drfdocs.com/


# About this project
This project is for CMPUT 404, see the [project description here](https://github.com/abramhindle/CMPUT404-project-socialdistribution).
