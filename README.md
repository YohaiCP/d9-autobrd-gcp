# d9-autobrd-gcp
Serverless function for onboarding and monitoring GCP projects in Dome9.

## Prerequisites for installation

1. A user with appropriate permissions within the GCP environment (e.g. owner/editor in each project) to complete the installation via a gcloud shell script.

## Install via gcloud shell

1. Open a cloud shell terminal.
2. Clone d9-autobrd-gcp from github:

```
git clone https://github.com/dana-at-cp/d9-autobrd-gcp.git
```

3. Change to the newly created 'd9-autobrd-gcp' directory:

```
cd d9-autobrd-gcp
```

4. Copy the desired gcloud shell script from the 'examples' directory to the current directory:

```
cp examples/gcloud-with-secrets.sh .
```

5. Edit the indicated section of the gcloud shell script. Provide the values that are correct and necessary for your environment: (If left empty, ``base_url`` will default to ``https://api.dome9.com/v2``)

```
##### MUST EDIT THE VALUES BELOW #####
project_id=<your_project_id_goes_here>
d9_id=<your_d9_api_id_goes_here>
d9_secret=<your_d9_api_secret_goes_here>
psk=<your_psk_goes_here>
base_url=
##### MUST EDIT THE VALUES ABOVE #####
```

6. Execute the gcloud shell script to begin the install:

```
./gcloud-with-secrets.sh
```

7. The gcloud shell script will finish by deploying the cloud function in the GCP environment.


8. Run the newly created cloud function in one of the following ways:
```
GET https://<your_cloud_function_url_goes_here>?psk=<your_psk_goes_here>
```
```
POST https://<your_cloud_function_url_goes_here>
{
    "psk": "<your_psk_goes_here>
}
```
