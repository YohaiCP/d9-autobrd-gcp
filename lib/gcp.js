// Copyright 2020 Dana James Traversie, Check Point Software Technologies, Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { google } = require('googleapis');
const Q = require('q');

exports.updateProjectIAMPolicy = async (project, serviceAccount) => {
  var pushedViewer = false;
  var pushedSecurityReviewer = false;
  var securityReviewerRoleName = 'roles/iam.securityReviewer';
  var viewerRoleName = 'roles/viewer';
  var member = 'serviceAccount:' + serviceAccount['email'];
  var iamPolicy = await this.getProjectIAMPolicy(project['projectId']);
  iamPolicy['bindings'].forEach(b => {
    if (b['role'] == viewerRoleName) {
      b['members'].push(member);
      pushedViewer = true;
    }
    if (b['role'] == securityReviewerRoleName) {
      b['members'].push(member);
      pushedSecurityReviewer = true;
    }
  });
  if (!pushedViewer) {
    iamPolicy['bindings'].push({ role: viewerRoleName, members: [member] });
  }
  if (!pushedSecurityReviewer) {
    iamPolicy['bindings'].push({ role: securityReviewerRoleName, members: [member] });
  }
  var updatedIamPolicy = await this.setProjectIAMPolicy(project['projectId'], iamPolicy);
  return updatedIamPolicy;
};

exports.getProjectIAMPolicy = async (projectId) => {
  const req = {
    resource: projectId
  };
  var r = await google.cloudresourcemanager('v1').projects.getIamPolicy(req);
  return r ? r.data : {};
};

exports.setProjectIAMPolicy = async (projectId, iamPolicy) => {
  var req = {
    resource: projectId,
    requestBody: { "policy": iamPolicy }
  };
  var r = await google.cloudresourcemanager('v1').projects.setIamPolicy(req);
  return r ? r.data : {};
};

exports.createServiceAccount = async (projectId) => {
  var req = {
    name: 'projects/' + projectId,
    requestBody: {
      'accountId': 'cloudguard-connect',
      'serviceAccount': {
        'displayName': 'CloudGuard-Connect'
      }
    }
  };
  var r = await google.iam('v1').projects.serviceAccounts.create(req);
  return r ? r.data : {};
};

exports.deleteServiceAccountKeys = async (projectId, serviceAccountEmail) => {
  var params = {
    name: 'projects/' + projectId + '/serviceAccounts/' + serviceAccountEmail
  };
  var r = await google.iam('v1').projects.serviceAccounts.keys.list(params);
  var keys = r ? r.data.keys : [];
  var promises = [];
  for (let key of keys) {
    if (key['keyType'] == 'USER_MANAGED') {
      promises.push(google.iam('v1').projects.serviceAccounts.keys.delete({ name: key['name'] }));
    }
  }
  await Q.all(promises);
};

exports.createServiceAccountKey = async (projectId, serviceAccountEmail) => {
  var params = {
    name: 'projects/' + projectId + '/serviceAccounts/' + serviceAccountEmail
  };
  var r = await google.iam('v1').projects.serviceAccounts.keys.create(params);
  return r ? r.data : {};
};

exports.getCloudGuardServiceAccount = async (projectId) => {
  // TODO: Need to handle projects with more than 100 service accounts.
  var result = {};
  var req = {
    name: 'projects/' + projectId,
    pageSize: '100' // max page size according to docs
  };
  var r = await google.iam('v1').projects.serviceAccounts.list(req);
  var serviceAccounts = r ? r.data : {};
  if (serviceAccounts['accounts']) {
    serviceAccounts['accounts'].forEach(account => {
      if (
        (account['email'].startsWith('cloudguard-connect@')) &&
        (account['displayName'] == 'CloudGuard-Connect')
      ) { result = account }
    });
  }
  return result;
};

exports.listProjects = async () => {
  // TODO: Handle large number of projects and consider filters.
  var r = await google.cloudresourcemanager('v1').projects.list();
  return r ? r.data['projects'] : [];
};

exports.enableRequiredAPIServices = async (projectId) => {
  var svcmgmt = google.servicemanagement('v1');
  var svcNames = [
    'compute.googleapis.com',
    'cloudresourcemanager.googleapis.com',
    'iam.googleapis.com',
    'cloudkms.googleapis.com',
    'container.googleapis.com',
    'bigquery-json.googleapis.com',
    'admin.googleapis.com',
    'bigtableadmin.googleapis.com',
    'cloudfunctions.googleapis.com',
    'sqladmin.googleapis.com',
    'redis.googleapis.com',
    'appengine.googleapis.com'
  ];
  var promises = [];
  for (let svcName of svcNames) {
    params = {
      consumerId: "project:" + projectId,
      serviceName: svcName
    }
    promises.push(Q.nfcall(svcmgmt.services.enable.bind(svcmgmt.services), params));
  }
  await Q.all(promises);
  return true;
};

const initGoogleAuthCredential = async () => {
  var r = await google.auth.getApplicationDefault();
  var client = r.credential;
  if (client) {
    try {
      client = client.createScoped([
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/service.management'
      ]);
    } catch (e) {
      if (e instanceof TypeError) {
        // TypeError is thrown when deployed in GCP
      } else {
        throw e;
      }
    }
  }
  google.options({
    auth: client
  });
};

initGoogleAuthCredential();