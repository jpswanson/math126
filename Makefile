deploy:
	cp -R build/html/ ./
	git add .
	git commit -m "Deployed latest master content"
	git push gh-pages origin
