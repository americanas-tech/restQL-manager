const request = require("supertest");
const app = require("./app");
const {
  loadTenants,
  loadResourcesFromTenant,
  loadNamespaces,
  saveResource,
  loadQueries,
  loadQueryRevision,
  loadQueryRevisions,
  addQuery
} = require("./persistence");
const { runQuery, runNamedQuery } = require("./query-runner");

jest.mock("./persistence");
jest.mock("./query-runner");

describe("/tenants", () => {
  test("should return all tenants", async () => {
    loadTenants.mockImplementationOnce(() => {
      return Promise.resolve(["Tenant A"]);
    });

    const response = await request(app).get("/tenants");
    expect(response.statusCode).toBe(200);
    expect(loadTenants).toHaveBeenCalledWith();
    expect(loadTenants).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({ tenants: ["Tenant A"] });
  });
});

describe("/resources/:tenant", () => {
  test("should return all resources", async () => {
    loadResourcesFromTenant.mockImplementationOnce(tenant => {
      return Promise.resolve([
        { url: "", status: 200, name: "my-resource", "base-url": "" }
      ]);
    });

    const response = await request(app).get("/resources/my-tenant");
    expect(response.statusCode).toBe(200);
    expect(loadResourcesFromTenant).toHaveBeenCalledTimes(1);
    expect(loadResourcesFromTenant).toHaveBeenCalledWith("my-tenant");
    expect(response.body).toEqual({
      resources: [{ url: "", status: 200, name: "my-resource", "base-url": "" }]
    });
  });
});

describe("/resource/:tenant/update", () => {
  beforeEach(() => {
    saveResource.mockClear();
  });
  test("should error on invalid key", async () => {
    const response = await request(app)
      .post("/resources/tenant/update")
      .send({
        "authorization-key": "invalid-key"
      });

    expect(response.statusCode).toBe(422);
    expect(response.body).toEqual({ error: "Invalid key" });
  });

  test("should return updated resource", async () => {
    saveResource.mockImplementationOnce((tenant, name, url) => {
      return Promise.resolve([
        { url: url, status: 200, name: name, "base-url": url }
      ]);
    });
    const response = await request(app)
      .post("/resources/tenant/update")
      .send({
        "authorization-key": "",
        name: "resource-name",
        url: "http://example.com"
      });

    expect(response.statusCode).toBe(200);
    expect(saveResource).toHaveBeenCalledTimes(1);
    expect(saveResource).toHaveBeenCalledWith(
      "tenant",
      "resource-name",
      "http://example.com"
    );
    expect(response.body).toEqual([
      {
        name: "resource-name",
        url: "http://example.com",
        status: 200,
        "base-url": "http://example.com"
      }
    ]);
  });
});

describe("/run-query", () => {
  beforeEach(() => {
    runQuery.mockClear();
  });

  test("should load the query result", async () => {
    runQuery.mockImplementationOnce((queryText, params) => {
      return Promise.resolve({ success: true });
    });

    const response = await request(app)
      .post("/run-query")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        query: "from planets"
      });

    expect(response.statusCode).toBe(200);
    expect(runQuery).toHaveBeenCalledTimes(1);
    expect(runQuery).toBeCalledWith(
      "from planets",
      {},
      {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        connection: "close",
        "content-length": "24",
        "content-type": "application/json",
        host: response.request.host,
        "user-agent": "node-superagent/3.8.3"
      }
    );
    expect(response.body).toEqual({ success: true });
  });

  test("should send query params", async () => {
    runQuery.mockImplementationOnce((queryText, params) => {
      return Promise.resolve({ success: true });
    });

    const response = await request(app)
      .post("/run-query")
      .query({ id: 123 })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        query: "from cards"
      });

    expect(response.statusCode).toBe(200);
    expect(runQuery).toHaveBeenCalledTimes(1);
    expect(runQuery).toBeCalledWith(
      "from cards",
      { id: "123" },
      {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        connection: "close",
        "content-length": "22",
        "content-type": "application/json",
        host: response.request.host,
        "user-agent": "node-superagent/3.8.3"
      }
    );
    expect(response.body).toEqual({ success: true });
  });
});

describe("/run-query/:namespace/:name/:revision", () => {
  beforeEach(() => {
    runNamedQuery.mockClear();
  });

  test("should load the query result", async () => {
    runNamedQuery.mockImplementationOnce((namespace, name, revision) => {
      return Promise.resolve({ success: true });
    });

    const response = await request(app)
      .get("/run-query/namespace/query/1")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("headers", { host: "127.0.0.1:12345" });

    expect(response.statusCode).toBe(200);
    expect(runNamedQuery).toHaveBeenCalledTimes(1);
    expect(runNamedQuery).toBeCalledWith(
      "namespace",
      "query",
      "1",
      {},
      {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        connection: "close",
        "content-type": "application/json",
        headers: "[object Object]",
        host: response.request.host,
        "user-agent": "node-superagent/3.8.3"
      }
    );
    expect(response.body).toEqual({ success: true });
  });

  test("should send query params", async () => {
    runNamedQuery.mockImplementationOnce((namespace, name, revision) => {
      return Promise.resolve({ success: true });
    });

    const response = await request(app)
      .get("/run-query/namespace/query/1")
      .query({ param: "param" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.statusCode).toBe(200);
    expect(runNamedQuery).toHaveBeenCalledTimes(1);
    expect(runNamedQuery).toBeCalledWith(
      "namespace",
      "query",
      "1",
      { param: "param" },
      {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        connection: "close",
        "content-type": "application/json",
        host: response.request.host,
        "user-agent": "node-superagent/3.8.3"
      }
    );
    expect(response.body).toEqual({ success: true });
  });
});

describe("/namespaces", () => {
  test("should return all tenants", async () => {
    loadNamespaces.mockImplementationOnce(() => {
      return Promise.resolve(["namespace-a", "namespace-b"]);
    });

    const response = await request(app).get("/namespaces");
    expect(response.statusCode).toBe(200);
    expect(loadNamespaces).toHaveBeenCalledWith();
    expect(loadNamespaces).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(["namespace-a", "namespace-b"]);
  });
});

describe("/ns/:namespace", () => {
  beforeEach(() => {
    loadQueries.mockClear();
  });

  test("should load all queries", async () => {
    loadQueries.mockImplementationOnce(namespace => {
      return Promise.resolve([{}]);
    });

    const response = await request(app).get("/ns/my-namespace");

    expect(response.statusCode).toBe(200);
    expect(loadQueries).toHaveBeenCalledTimes(1);
    expect(loadQueries).toHaveBeenCalledWith("my-namespace");
    expect(response.body).toEqual({ queries: [{}] });
  });
});

describe("/ns/:namespace/query/:query/revision/:revision", () => {
  beforeEach(() => {
    loadQueryRevision.mockClear();
  });
  loadQueryRevision.mockImplementationOnce((namespace, query, revision) => {
    return Promise.resolve("from cards");
  });

  test("should load query revision", async () => {
    const response = await request(app).get(
      "/ns/my-namespace/query/my-query/revision/1"
    );

    expect(response.statusCode).toBe(200);
    expect(loadQueryRevision).toHaveBeenCalledTimes(1);
    expect(loadQueryRevision).toHaveBeenCalledWith(
      "my-namespace",
      "my-query",
      "1"
    );
    expect(response.text).toEqual("from cards");
  });
});

describe("/ns/:namespace/query/:query", () => {
  beforeEach(() => {
    loadQueryRevisions.mockClear();
  });

  test("shoulld load all query revisions", async () => {
    loadQueryRevisions.mockImplementationOnce((namespace, query) => {
      return Promise.resolve([
        {
          id: query,
          "last-revision": "/ns/" + query.namespace + "/" + query.name + "/1",
          revisions: "/ns/" + namespace + "/query/" + name
        }
      ]);
    });

    const response = await request(app).get("/ns/my-namespace/query/my-query");

    expect(response.statusCode).toBe(200);
    expect(loadQueryRevisions).toHaveBeenCalledTimes(1);
    expect(loadQueryRevisions).toHaveBeenCalledWith("my-namespace", "my-query");
    expect(response.body).toEqual({
      revisions: [
        {
          id: "my-query",
          "last-revision": "/ns/undefined/undefined/1",
          revisions: "/ns/my-namespace/query/nodejs"
        }
      ]
    });
  });
});

describe("/ns/:namespace/:query/:revision", () => {
  beforeEach(() => {
    loadQueryRevision.mockClear();
  });

  loadQueryRevision.mockImplementationOnce((namespace, query, revision) => {
    return Promise.resolve("from cards");
  });

  test("should load query revision", async () => {
    const response = await request(app).get("/ns/my-namespace/my-query/1");

    expect(response.statusCode).toBe(200);
    expect(loadQueryRevision).toHaveBeenCalledTimes(1);
    expect(loadQueryRevision).toHaveBeenCalledWith(
      "my-namespace",
      "my-query",
      "1"
    );
    expect(response.text).toEqual("from cards");
  });
});

describe("/ns/:namespace/query/:name", () => {
  beforeEach(() => {
    addQuery.mockClear();
    loadQueryRevisions.mockClear();
  });

  test("should return all query revisions", async () => {
    addQuery.mockImplementationOnce((namespace, name, query) => {
      return Promise.resolve({
        location: "/run-query/" + namespace + "/" + name + "/1"
      });
    });

    loadQueryRevisions.mockImplementationOnce((namespace, query) => {
      return Promise.resolve([
        {
          id: query,
          "last-revision": "/ns/" + query.namespace + "/" + query.name + "/1",
          revisions: "/ns/" + namespace + "/query/" + name
        }
      ]);
    });

    const response = await request(app)
      .post("/ns/my-namespace/query/my-query")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        query: "from cards"
      });

    expect(response.statusCode).toBe(200);
    expect(addQuery).toHaveBeenCalledTimes(1);
    expect(addQuery).toHaveBeenCalledWith(
      "my-namespace",
      "my-query",
      "from cards"
    );
    expect(response.body).toEqual({
      revisions: [
        {
          id: "my-query",
          "last-revision": "/ns/undefined/undefined/1",
          revisions: "/ns/my-namespace/query/nodejs"
        }
      ]
    });
  });

  test("should return new Location header", async () => {
    addQuery.mockImplementationOnce((namespace, name, query) => {
      return Promise.resolve({
        location: "/run-query/" + namespace + "/" + name + "/1"
      });
    });

    loadQueryRevisions.mockImplementationOnce((namespace, query) => {
      return Promise.resolve([
        {
          id: query,
          "last-revision": "/ns/" + namespace + "/" + name + "/1",
          revisions: "/ns/" + namespace + "/query/" + name
        }
      ]);
    });

    const response = await request(app)
      .post("/ns/my-namespace/query/my-query")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send({
        query: "from cards"
      });

    expect(response.get("Location")).toEqual(
      "/run-query/my-namespace/my-query/1"
    );
  });
});

describe("/health", () => {
  test("should return 200", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
  });
});

describe("/resource-status", () => {
  test("should return 200", async () => {
    const response = await request(app).get("/resource-status");

    expect(response.statusCode).toBe(200);
  });
});
