README
======


  - The Procfile is used when deployed to Heroku.
  
To push to heroku from dev to master:
>git push heroku dev:master

To run:
  - Update host file to have "127.0.0.1 bitponics.com"
  - > mongod
  - > sudo node-dev app.js