const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const persistence = require("./persistence");
const { runQuery, runNamedQuery } = require("./query-runner");
const { tenantsHandler } = require("./tentant/handler");

const AUTHORIZATION_KEY = process.env.AUTHORIZATION_KEY || "";

const app = express();

app.use(express.static(path.resolve(__dirname, "..", "..", "build")));
app.use(bodyParser.json());

app.get("/tenants", tenantsHandler);

app.get("/resources/:tenant", (req, res) => {
  persistence.loadResourcesFromTenant(req.params.tenant).then(resources => {
    res.json({
      resources: resources
    });
  });
});

app.post("/resources/:tenant/update", (req, res) => {
  if (req.body["authorization-key"] != AUTHORIZATION_KEY) {
    res.status(422).json({
      error: "Invalid key"
    });
  }
  persistence
    .saveResource(req.params.tenant, req.body.name, req.body.url)
    .then(resource => {
      res.json(resource);
    });
});

app.post("/run-query", (req, res) => {
  runQuery(req.body.query, req.query, req.headers).then(json => {
    res.json(json);
  });
});

app.get("/run-query/:namespace/:name/:revision", (req, res) => {
  runNamedQuery(
    req.params.namespace,
    req.params.name,
    req.params.revision,
    req.query,
    req.headers
  ).then(json => {
    res.json(json);
  });
});

app.get("/namespaces", (req, res) => {
  persistence.loadNamespaces().then(namespaces => {
    res.json(namespaces);
  });
});

app.get("/ns/:namespace", (req, res) => {
  persistence.loadQueries(req.params.namespace).then(queries =>
    res.json({
      queries: queries
    })
  );
});

app.get("/ns/:namespace/query/:query/revision/:revision", (req, res) => {
  persistence
    .loadQueryRevision(
      req.params.namespace,
      req.params.query,
      req.params.revision
    )
    .then(revision => {
      res.send(revision);
    });
});

app.get("/ns/:namespace/query/:query", (req, res) => {
  persistence
    .loadQueryRevisions(req.params.namespace, req.params.query)
    .then(revisions => {
      res.json({
        revisions: revisions
      });
    });
});

app.get("/ns/:namespace/:query/:revision", (req, res) => {
  persistence
    .loadQueryRevision(
      req.params.namespace,
      req.params.query,
      req.params.revision
    )
    .then(revision => {
      res.send(revision);
    });
});

app.post("/ns/:namespace/query/:name", (req, res) => {
  persistence
    .addQuery(req.params.namespace, req.params.name, req.body.query)
    .then(query => {
      persistence
        .loadQueryRevisions(req.params.namespace, req.params.name)
        .then(revisions => {
          res
            .header({
              Location: query.location
            })
            .json({
              revisions: revisions
            });
        });
    });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/resource-status", (req, res) => {
  res.json({ ok: true });
});

/* istanbul ignore next */
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "..", "build", "index.html"));
});

module.exports = app;
