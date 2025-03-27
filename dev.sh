#!/usr/bin/bash
#!/usr/bin/env bash
#
# Use this to catch control-c and cleanup.  Won't run on Windows except in git bash or similar.
#
# Pass args you'd normally pass to npm - eg. npm run dev
#   - if the args contain 'dev' or 'test' then the mongodb will be started up and shut down 
#   after it completes or control-c is pressed.

# Trap control-c
trap 'shutdown' INT

function shutdown() {
	echo "Shutting down..."
	npm run dev:stop
	exit 0
}

function run() {
  npm run dev:start
}

run
shutdown