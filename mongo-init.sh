#!/usr/bin/bash


# https://github.com/docker-library/mongo/issues/399

create_user() {
	local user=$1
	local pwd=$2
	local roles=$3

	mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
db.createUser({
	user: '$user',
	pwd: '$pwd',
	roles: $roles
})
EOF
	echo "User \"$user\" successfully created"
}

create_user "$MONGO_INITDB_ROOT_USERNAME" "$MONGO_INITDB_ROOT_PASSWORD" '[ "root" ]'
create_user "$MONGO_INITDB_USERNAME" "$MONGO_INITDB_PASSWORD" '[ { role: "readWrite", db: "'"$MONGO_INITDB_DATABASE"'" } ]'
