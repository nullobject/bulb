.PHONY: clean dev dist doc lint node_modules publish-api publish-npm release test

node_modules:
	@cd packages/bulb; npm install
	@cd packages/bulb-input; npm install

dev:
	@cd packages/bulb; npx rollup -c -w

dist:
	@cd packages/bulb; npx rollup -c
	@cd packages/bulb-input; npx rollup -c

test:
	@cd packages/bulb; npx jest

watch:
	@cd packages/bulb; npx jest --watch

lint:
	@cd packages/bulb; npx standard "src/**/*.js"
	@cd packages/bulb-input; npx standard "src/**/*.js"

release: dist doc publish-api publish-npm

doc:
	@cd packages/bulb; npx documentation build src/** -f html -o docs

publish-api:
	@aws s3 sync ./packages/bulb/docs/ s3://bulb.joshbassett.info/ --acl public-read --delete --cache-control 'max-age=300'

publish-npm:
	@cd packages/bulb; npm publish
	@cd packages/bulb-input; npm publish

clean:
	@rm -rf dist docs node_modules
