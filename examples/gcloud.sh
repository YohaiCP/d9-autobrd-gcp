#!/bin/bash

gcloud functions deploy d9AutobrdOnboard --trigger-http --runtime nodejs10 --service-account d9-autobrd@mystical-hawk-120820.iam.gserviceaccount.com --allow-unauthenticated --max-instances 1 --timeout 540 --env-vars-file .runtime.env.yaml

exit 0