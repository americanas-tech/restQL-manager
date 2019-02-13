"use strict";
const fetch = require("node-fetch");
const URL = require("url");
const models = require("./models");

async function checkStatus(url) {
  return fetch(url, {
    timeout: 500
  })
    .then(response => {
      return response.status;
    })
    .catch(() => {
      return null;
    });
}

function buildBaseUrl(url) {
  const parsedUrl = URL.parse(url);
  return (
    parsedUrl.protocol +
    "//" +
    parsedUrl.host +
    (parsedUrl.port ? ":" + parsedUrl.port : "")
  );
}

async function buildResource(resource) {
  let baseUrl = buildBaseUrl(resource[1]);
  return {
    url: resource[1],
    "base-url": baseUrl,
    status: await checkStatus(baseUrl),
    name: resource[0]
  };
}

function buildQuery(query) {
  return {
    id: query.name,
    "last-revision":
      "/ns/" + query.namespace + "/" + query.name + "/" + query.size,
    revisions: "/ns/" + query.namespace + "/query/" + query.name
  };
}

function buildQueryRevisions(namespace, query, index) {
  return {
    index: index + 1,
    link: "/run-query/" + namespace + "/" + query + "/" + (index + 1),
    query: "/ns/" + namespace + "/query/" + query + "/revision/" + (index + 1)
  };
}

function loadTenants() {
  return models.Tenant
    .find({}, "_id", (err, tenants) => {
      if (err) {
        throw err;
      }

      return tenants;
    })
    .then(tenants => {
      return Array.from(tenants, t => t._id);
    })
    .catch(error => {
      return [];
    });
}

function loadResourcesFromTenant(tenant) {
  return models.Tenant
    .findOne(
      {
        _id: tenant
      },
      "mappings",
      (err, dbTenant) => {
        if (err) {
          throw err;
        }
        return dbTenant;
      }
    )
    .then(dbTenant => {
      return Array.from(dbTenant.mappings, mapping => buildResource(mapping));
    })
    .then(mappings => {
      return Promise.all(mappings, values => {
        return values;
      });
    })
    .catch(error => {
      return [];
    });
}

function saveResource(tenant, name, url) {
  let mappingKey = "mappings." + name;

  return models.Tenant.findByIdAndUpdate(
    tenant,
    {
      $set: {
        [mappingKey]: url
      }
    },
    {
      upsert: false,
      new: true
    }
  );
}

function loadNamespaces() {
  return models.Query
    .aggregate([
      {
        $group: {
          _id: "$namespace"
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
    .then(namespaces => {
      return namespaces;
    })
    .catch(error => {
      return [];
    });
}

function loadQueries(namespace) {
  return models.Query
    .find(
      {
        namespace: namespace
      },
      [],
      { sort: { name: 1 } }
    )
    .then(queries => {
      return Array.from(queries, buildQuery);
    })
    .then(queries => {
      return Promise.all(queries, values => {
        return values;
      });
    });
}

function loadQueryRevisions(namespace, query) {
  return models.Query
    .findOne({
      namespace: namespace,
      name: query
    })
    .then(query => {
      return query.revisions;
    })
    .then(revisions => {
      return Array.from(revisions, (revision, index) =>
        buildQueryRevisions(namespace, query, index)
      );
    });
}

function loadQueryRevision(namespace, query, revision) {
  return models.Query
    .findOne(
      {
        namespace: namespace,
        name: query
      },
      {
        revisions: {
          $slice: [revision - 1, 1]
        },
        _id: 0,
        size: 0,
        name: 0,
        namespace: 0
      }
    )
    .then(query => {
      return query.revisions[0].text;
    });
}

function addQuery(namespace, name, query) {
  return models.Query
    .findOneAndUpdate(
      {
        name: name,
        namespace: namespace
      },
      {
        $inc: {
          size: 1
        },
        $push: {
          revisions: {
            text: query
          }
        }
      },
      {
        new: true,
        upsert: true,
        fields: {
          size: true
        }
      }
    )
    .then(dbQuery => {
      return {
        location: "/run-query/" + namespace + "/" + name + "/" + dbQuery.size
      };
    });
}

module.exports = {
  loadTenants,
  loadResourcesFromTenant,
  saveResource,
  loadNamespaces,
  loadQueries,
  loadQueryRevisions,
  loadQueryRevision,
  addQuery
};
