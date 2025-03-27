#!/usr/bin/bash

MINIO_ALIAS=myminio

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error when substituting.

echo "Running minio-init.sh"


# Point mc to the MinIO server
mc alias set $MINIO_ALIAS http://minio:${MINIO_PORT:-9000} "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# Create a bucket
mc mb $MINIO_ALIAS/${MINIO_BUCKET_CHAT_ATTACHMENTS:-chat-attachments}

# Create a user
mc admin user add $MINIO_ALIAS "$MINIO_BACKEND_USER" "$MINIO_BACKEND_PASSWORD"

# Attach the readwrite policy to the user
mc admin policy attach $MINIO_ALIAS readwrite --user "$MINIO_BACKEND_USER"

# Create access keys for the user (prevent mc from printing secrets)
mc admin user svcacct add $MINIO_ALIAS $MINIO_BACKEND_USER \
	--access-key "$MINIO_ACCESS_KEY" --secret-key "$MINIO_SECRET_KEY" > /dev/null
echo "Access keys for user \"$MINIO_BACKEND_USER\" successfully created"

# Allow the public to download files in the bucket
mc anonymous set download $MINIO_ALIAS/${MINIO_BUCKET_CHAT_ATTACHMENTS:-chat-attachments}

exit 0
