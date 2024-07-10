#!/bin/sh

##
## JavaScript && CSS
##
npm install
node_modules/.bin/webpack
node_modules/.bin/sass -s compressed "app/assets/stylesheets/application.scss" > lib/application.css

xxd -i -n gallery_plugin_application_css lib/application.css lib/application.css.cpp
xxd -i -n gallery_plugin_admin_js lib/admin.js lib/admin.js.cpp
