#!/usr/bin/bash


# https://github.com/docker-library/mongo/issues/399

mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
db.createUser(
  {
    user: '$MONGO_INITDB_ROOT_USERNAME',
    pwd: '$MONGO_INITDB_ROOT_PASSWORD',
    roles: [ "root" ]
  }
)
EOF
echo "User \"$MONGO_INITDB_ROOT_USERNAME\" successfully created"



mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
use '$MONGO_INITDB_DATABASE'

db.createUser(
	{
		user: '$MONGO_INITDB_USERNAME',
		pwd: '$MONGO_INITDB_PASSWORD',
		roles: [ { role: 'readWrite', db: '$MONGO_INITDB_DATABASE' } ]
	}
)
EOF
echo "User \"$MONGO_INITDB_USERNAME\" successfully created"
