const persistence = require("../persistence");

const createDefaultTentant = () =>
  persistence
    .addTenant("DEFAULT")
    .then(doc => [doc._id])
    .catch(() => []);

const tenantsHandler = (request, response) => {
  return persistence
    .loadTenants()
    .then(tenants => {
      if (tenants.length == 0) {
        return createDefaultTentant();
      } else {
        return tenants;
      }
    })
    .then(tenants => {
      return response.json({ tenants });
    });
};

module.exports = {
  tenantsHandler
};
