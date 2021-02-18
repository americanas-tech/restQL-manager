import axios from 'axios';

const baseUrl = process.env.REACT_APP_ADMIN_URL + '/admin';

type FetchTenantsResponse = {
  tenants: string[]
}

export async function fetchTenants(): Promise<string[]> {
  const response = await axios({
    method: 'GET',
    baseURL: baseUrl,
    url: '/tenant',
    headers: {
      Authorization: 'Bearer restql-UQ8c',
    }
  });

  const data = response.data as FetchTenantsResponse;

  return data.tenants;
}

type FetchNamespacesResponse = {
  namespaces: string[]
}

export async function fetchNamespaces() {
  const response = await axios({
    method: 'GET',
    baseURL: baseUrl,
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
    revisions: {
      text: string,
      revision: number
    }[]
  }[]
}

export async function fetchQueriesFromNamespace(namespace: string): Promise<FetchQueriesFromNamespace> {
  const response = await axios({
    method: 'GET',
    baseURL: baseUrl,
    url: `/namespace/${namespace}/query`
  });

  const data = response.data as FetchQueriesFromNamespace;

  return data;
}