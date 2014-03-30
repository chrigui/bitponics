#!/bin/bash
export MONGOLAB_URI="mongodb://admin:1SHar3db1t@ds033097.mongolab.com:33097/bitponics-local"
export HOST="bitponics.com" 
export NODE_ENV="local" 
export BPN_BLOG_ENABLED=true

. ~/.nvm/nvm.sh
nvm use v0.10.24

cd `dirname $0`

mongod&
redis-server&
npm install
sudo -E node-dev app.js

exit 
