# d9-autobrd-gcp
Serverless function for onboarding and monitoring GCP projects in Dome9.

## Prerequisites for installation

1. A user with appropriate permissions within the GCP environment (e.g. owner/editor in each project) to complete the installation via a gcloud shell script.

## Install via gcloud shell

1. Open a cloud shell terminal.
2. Clone d9-autobrd-gcp from github:

```
user@cloudshell:~ (your-project-12345)$ git clone https://github.com/dana-at-cp/d9-autobrd-gcp.git
```

3. Change to the newly created 'd9-autobrd-gcp' directory:

```
user@cloudshell:~ (your-project-12345)$ cd d9-autobrd-gcp
```

4. Copy the desired gcloud shell script from the 'examples' directory to the current directory:

```
user@cloudshell:~/d9-autobrd-gcp (your-project-12345)$ cp examples/gcloud-with-secrets.sh .
```

5. Edit the indicated section of the gcloud shell script. Provide the values that are correct and necessary for your environment:

```
##### MUST EDIT THE VALUES BELOW #####
project_id=<your_project_id_goes_here>
d9_id=<your_d9_api_id_goes_here>
d9_secret=<your_d9_api_secret_goes_here>
psk=<your_psk_goes_here>
##### MUST EDIT THE VALUES ABOVE #####
```

6. Execute the gcloud shell script to begin the install:

```
user@cloudshell:~/d9-autobrd-gcp (your-project-12345)$ ./gcloud-with-secrets.sh
```

7. The gcloud shell script will finish by deploying the cloud function in the GCP environment.
