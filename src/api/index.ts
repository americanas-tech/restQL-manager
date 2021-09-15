import axios from 'axios';
import qs from 'qs';

axios.defaults.paramsSerializer = params => {
  return qs.stringify(params, { arrayFormat: 'repeat' });
};

const restqlUrl = process.env.REACT_APP_RESTQL_URL;
const adminUrl = restqlUrl + '/admin';

type FetchTenantsResponse = {
  tenants: string[]
}

export async function fetchTenants(): Promise<string[]> {
  const response = await axios({
    method: 'GET',
    baseURL: adminUrl,
    url: '/tenant',
  });

  const data = response.data as FetchTenantsResponse;

  return data.tenants;
}

type TenantMappings = {
  mappings: Record<string, {url: string, source: string}>,
  tenant: string
}

export async function fetchMappingsFromTenant(tenant: string): Promise<TenantMappings> {
  const response = await axios({
    method: 'GET',
    baseURL: adminUrl,
    url: `/tenant/${tenant}/mapping`,
  });

  const data = response.data as TenantMappings;

  return data;
}

type FetchNamespacesResponse = {
  namespaces: string[]
}

export async function fetchNamespaces() {
  const response = await axios({
    method: 'GET',
    baseURL: adminUrl,
    url: '/namespace'
  });

  const data = response.data as FetchNamespacesResponse;

  return data.namespaces;
}

type FetchQueriesFromNamespace = {
  namespace: string,
  queries: {
    namespace: string,
    name: string,
    archived: boolean,
    revisions: {
      text: string,
      archived: boolean,
      revision: number
    }[]
  }[]
}

export async function fetchQueriesFromNamespace(namespace: string): Promise<FetchQueriesFromNamespace> {
  const response = await axios({
    method: 'GET',
    baseURL: adminUrl,
    url: `/namespace/${namespace}/query`
  });

  const data = response.data as FetchQueriesFromNamespace;

  return data;
}

export async function fetchArchivedQueriesFromNamespace(namespace: string): Promise<FetchQueriesFromNamespace> {
  const response = await axios({
    method: 'GET',
    baseURL: adminUrl,
    url: `/namespace/${namespace}/query?archived=true`
  });

  const data = response.data as FetchQueriesFromNamespace;

  return data;
}

export async function saveQuery(namespace: string, name: string, queryText: string) {
  try {
    await axios({
      method: 'POST',
      baseURL: adminUrl,
      url: `/namespace/${namespace}/query/${name}`,
      data: {text: queryText},
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
}

export async function runQuery(text: string, params: Record<string, any>) {
  try {
    const response = await axios({
      method: 'POST',
      baseURL: restqlUrl,
      url: `/run-query`,
      data: text,
      headers: {
        "Content-Type": "text/plain"
      },
      params: params,
    });

    return response.data
  } catch (error) {
    throw new Error(error.response.data.error);
  }
}

export async function createResource(tenant: string, name: string, url: string) {
  try {
    await axios({
      method: 'POST',
      baseURL: adminUrl,
      url: `/tenant/${tenant}/mapping/${name}`,
      data: {
        url: url
      }
    });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
}

export async function updateResource(tenant: string, name: string, url: string, authorizationCode: string) {
  try {
    await axios({
      method: 'PUT',
      baseURL: adminUrl,
      url: `/tenant/${tenant}/mapping/${name}`,
      headers: {
        "Authorization": `Bearer ${authorizationCode}`
      },
      data: {
        url: url
      }
    });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
}

export async function archiveQuery(namespace: string, name: string) {
  try {
    await axios({
      method: 'PATCH',
      baseURL: adminUrl,
      url: `/namespace/${namespace}/query/${name}`,
      data: {archived: true},
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    throw new Error("failed to execute action");
  }
}

export async function archiveRevision(namespace: string, name: string, revision: number) {
  try {
    await axios({
      method: 'PATCH',
      baseURL: adminUrl,
      url: `/namespace/${namespace}/query/${name}/revision/${revision}`,
      data: {archived: true},
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    throw new Error("failed to execute action");
  }
}