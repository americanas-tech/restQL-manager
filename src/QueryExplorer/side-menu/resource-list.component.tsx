
import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { getTenants, MappingsByTenant } from "../../manager.context";
import './resource-list.scss';

type ResourceListProps = {
  mappings: MappingsByTenant
}

const ALL_TENANTS = 'all'

function ResourceList(props: ResourceListProps) {
  const allTenants = getTenants(props.mappings);

  const [tenants, setTenants] = useState(allTenants);
  const [selectedTenant, setSelectedTenant] = useState("");
  const updateSelectedTenant = (e: FormEvent<HTMLSelectElement>) => {
    const newSelectedTenant = e.currentTarget.value;
    setSelectedTenant(newSelectedTenant);

    if (newSelectedTenant === ALL_TENANTS) {
      setTenants(allTenants);
    } else {
      setTenants([newSelectedTenant])
    }
  }

  const [search, setSearch] = useState("");

  return (
    <section className="side-menu__resources">
      <div className="side-menu__resources__inputs">
        <Link to="/resources">
          <button className="side-menu__resources__edit">Edit resources</button>
        </Link>
        
        <select onChange={updateSelectedTenant} name="tenants" id="tenants" className="side-menu__resources__select-tenant">
          <option value={ALL_TENANTS}>ALL</option>
          {allTenants.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          name="resource-search" 
          placeholder="Search by resource name" 
          className="side-menu__resources__search" 
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
      <ul className="side-menu__resource-list">
        {tenants.map(t => <TenantMappings tenant={t} mappings={props.mappings[t]} selectedTenant={selectedTenant} resourceFilter={search} />)}
      </ul>
    </section>
  )
}

type TenantMappingsProps = {
  tenant: string,
  mappings: { [resource: string]: {url: string, source: string} },
  selectedTenant: string,
  resourceFilter: string
}

function TenantMappings(props: TenantMappingsProps) {
  const {tenant, mappings, selectedTenant, resourceFilter} = props;

  const [open, setOpen] = useState(false);
  useEffect(() => {
    

    if (selectedTenant === tenant) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [selectedTenant]);

  const resourceNames = Object.keys(mappings).sort();
  const [filteredMappings, setFilteredMappings] = useState(resourceNames);
  useEffect(() => {
    if (!resourceFilter) {
      setFilteredMappings(resourceNames);
      return
    }

    if (resourceNames.findIndex(r => r.includes(resourceFilter)) >= 0) {
      const newFilteredMappings = resourceNames.filter(r => r.includes(resourceFilter));
      setFilteredMappings(newFilteredMappings);
      setOpen(true);
    }

  }, [resourceFilter])
  
  return (
    <li key={tenant} className="side-menu__resource-list__tenant" onClick={() => setOpen(!open)}>
      <span>{tenant}</span>
      <ul className={"side-menu__resource-list__tenant-resources" + (open ? " side-menu__resource-list__tenant-resources--open" : "")}>
        {filteredMappings.map(resourceName => {
          if (!resourceName) {
            return
          }

          const resource = mappings[resourceName];

          return (
            <li key={resourceName} className="side-menu__query-list__resource">
              <span className="side-menu__query-list__resource__name">{resourceName}:</span><span className="side-menu__query-list__resource__url">{resource.url}</span>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

export default ResourceList;