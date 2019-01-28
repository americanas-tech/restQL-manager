// This makes requests to restQL manager API
const fetch = require("isomorphic-fetch");

const RESTQL_SERVER_HEADERS = {
  "Content-type": "application/json",
  Accept: "application/json"
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

// Processing request
export function processResult(response) {
  return JSON.parse(response.body.text);
}

// Tenant operations
export function loadTenants(callback) {
  const loadTenantsUrl = window.location.origin + "/tenants";

  fetch(loadTenantsUrl, { headers: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

export function loadResourcesFromTenant(tenant, callback) {
  const loadTenantResourcesUrl =
    window.location.origin + "/resources/" + tenant;

  fetch(loadTenantResourcesUrl, { headers: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(parseJSON)
    .catch(error => {
      callback(null, error);
    })
    .then(json => {
      callback(json.resources, null);
    });
}

export function updateResource(authorizationKey, tenant, resource, callback) {
  const updateTenantResourceUrl =
    window.location.origin + "/resources/" + tenant + "/update";

  const requestBody = JSON.stringify({
    ...resource,
    "authorization-key": authorizationKey
  });

  fetch(updateTenantResourceUrl, {
    headers: RESTQL_SERVER_HEADERS,
    body: requestBody,
    method: "POST"
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Running Queries
export function runQuery(
  queryString,
  queryParams = "",
  tenant = null,
  callback
) {
  const runQueryUrl =
    window.location.origin +
    "/run-query?" +
    queryParams +
    (tenant ? "&tenant=" + tenant : "");

  let body = JSON.stringify({
    query: queryString
  });

  fetch(runQueryUrl, {
    headers: RESTQL_SERVER_HEADERS,
    body: body,
    method: "POST"
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Saving a query
export function saveQuery(tenant, namespace, queryName, queryString, callback) {
  const saveQueryUrl =
    window.location.origin +
    "/ns/" +
    namespace +
    "/query/" +
    queryName +
    (tenant ? "?tenant=" + tenant : "");

  let body = JSON.stringify({
    query: queryString
  });

  fetch(saveQueryUrl, {
    headers: RESTQL_SERVER_HEADERS,
    body: body,
    method: "POST"
  })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Loading namespaces
export function loadNamespaces(callback) {
  const loadNamespacesUrl = window.location.origin + "/namespaces";

  fetch(loadNamespacesUrl, { headers: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Loading Queries
export function loadQueries(namespace, callback) {
  const loadQueriesUrl = window.location.origin + "/ns/" + namespace;

  fetch(loadQueriesUrl, { header: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Loading all query revisions
export function loadRevisions(namespace, query, callback) {
  const revisionsUrl =
    window.location.origin + "/ns/" + namespace + "/query/" + query;

  fetch(revisionsUrl, { headers: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(parseJSON)
    .then(json => {
      callback(json, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Loading a query revision
export function loadRevisionByUrl(revisionUrl, callback) {
  fetch(window.location.origin + revisionUrl, {
    headers: RESTQL_SERVER_HEADERS
  })
    .then(checkStatus)
    .then(response => {
      return response.text();
    })
    .then(text => {
      callback(text, null);
    })
    .catch(error => {
      callback(null, error);
    });
}

// Loading a query revision
export function loadRevision(namespace, queryName, revision, callback) {
  const revisionUrl =
    window.location.origin +
    "/ns/" +
    namespace +
    "/query/" +
    queryName +
    "/revision/" +
    revision;

  fetch(revisionUrl, { headers: RESTQL_SERVER_HEADERS })
    .then(checkStatus)
    .then(response => {
      return response.text();
    })
    .then(text => {
      callback(text, null);
    })
    .catch(error => {
      callback(null, error);
    });
}
