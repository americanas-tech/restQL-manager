const { Promise } = require("es6-promise");
const url = require("url");
const fetch = require("node-fetch");

const RESTQL_SERVER_URL =
  process.env.RESTQL_SERVER_URL || "http://localhost:9000";
const RESTQL_HEADERS = {
  "Content-Type": "text/plain",
  Accept: "application/json"
};

function mergeHeaders(reqHeaders, defaultHeaders) {
  return Object.assign({}, reqHeaders, defaultHeaders);
}

function runQuery(queryText, params, requestHeaders) {
  const target =
    RESTQL_SERVER_URL + "/run-query" + url.format({ query: params });
  return fetch(target, {
    method: "POST",
    headers: mergeHeaders(requestHeaders, RESTQL_HEADERS),
    body: queryText
  })
    .then(response => {
      console.log("response was ", response.status);
      return response.json();
    })
    .then(json => {
      return json;
    })
    .catch(error => {
      return error;
    });
}

function validateQuery(queryText) {
  return fetch(RESTQL_SERVER_URL + "/validate-query", {
    method: "POST",
    headers: RESTQL_HEADERS,
    body: queryText
  }).then(response => {
    const body =
      response.status === 200 ? Promise.resolve({}) : response.json();
    return body.then(json => ({ status: response.status, body: json }));
  });
}

function runNamedQuery(namespace, name, revision, params, requestHeaders) {
  return fetch(
    RESTQL_SERVER_URL +
      "/run-query/" +
      namespace +
      "/" +
      name +
      "/" +
      revision +
      url.format({
        query: params
      }),
    {
      headers: mergeHeaders(requestHeaders, RESTQL_HEADERS)
    }
  )
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json;
    })
    .catch(error => {
      return error;
    });
}

module.exports = {
  runQuery: runQuery,
  runNamedQuery: runNamedQuery,
  validateQuery: validateQuery
};
