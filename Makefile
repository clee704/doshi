commit-pages:
	grunt build
	git checkout gh-pages
	rm -rf bower_components images scripts styles .htaccess 404.html favicon.ico index.html manifest.appcache robots.txt
	cp -a dist/ .
	git add -A
	git commit -m "Build from master `git rev-parse master`"
