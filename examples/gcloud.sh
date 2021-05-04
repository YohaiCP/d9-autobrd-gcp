#!/bin/bash

project_id=your-project-id-goes-here

role_id=d9.autobrd
role_title="D9 Autobrd"

sa_id=d9-autobrd

d9_id=youridgoeshere
d9_secret=yoursecretgoeshere
psk=yourpskgoeshere

cat << EOF > custom.role.yaml
title: $role_title
description: Custom role for d9-autobrd-gcp cloud function
includedPermissions:
- iam.serviceAccounts.actAs
EOF

cat << EOF > runtime.env.yaml
D9_ID: $d9_id
D9_SECRET: $d9_secret
PSK: $psk
EOF

cat << EOF > .gcloudignore
.gcloudignore
.git
.gitignore

custom.role.yaml
examples
LICENSE
node_modules
package-lock.json
README.md
runtime.env.yaml
EOF

gcloud iam roles create $role_id --project=$project_id --file=custom.role.yaml

gcloud iam service-accounts create $sa_id --project=$project_id --description="The service account for the d9-autobrd-gcp cloud function" --display-name="D9 Autobrd"

gcloud projects add-iam-policy-binding $project_id --member="serviceAccount:$sa_id@$project_id.iam.gserviceaccount.com" --role="projects/$project_id/roles/$role_id"

for binding_project_id in $(gcloud projects list |tail -n +2 |awk '{ print $1 }'); do
  gcloud projects add-iam-policy-binding $binding_project_id --member="serviceAccount:$sa_id@$project_id.iam.gserviceaccount.com" --role="roles/editor"
  gcloud projects add-iam-policy-binding $binding_project_id --member="serviceAccount:$sa_id@$project_id.iam.gserviceaccount.com" --role="roles/iam.securityAdmin"
done

gcloud functions deploy d9AutobrdOnboard --project $project_id --trigger-http --runtime nodejs10 --service-account $sa_id@$project_id.iam.gserviceaccount.com --allow-unauthenticated --max-instances 1 --timeout 540 --env-vars-file runtime.env.yaml

exit $?