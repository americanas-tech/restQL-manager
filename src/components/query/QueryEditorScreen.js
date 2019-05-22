// React
import React, { Component } from "react";

// Redux actions
import { connect } from "react-redux";

// Application Logic
import {
  // UI Operations
  handleNewQuery,
  handleShowModal,
  handleToggleSidebar,

  // Listeners
  handleParamsChange,
  handleNamespaceChange,
  handleQueryNameChange,
  handleQueryStringChange,

  // Business logic operations
  handleLoadNamespaces,
  handleRunQuery,
  handleSaveQuery,
  handleLoadRevisions,
  handleRedirectToQuery,
  handleLoadQueryFromURL,
  handleLoadQueryInfo
} from "../../actions/queryActionCreator";

import {
  handleLoadTenants,
  handleSetTenant
} from "../../actions/environmentActionCreator";

import {
  handleSidebarLoadQueries,
  handleSidebarLoadQuery
} from "../../actions/sidebarActionCreator";

// CSS for this screen and logo
import "./QueryEditorScreen.css";
import Logo from "../restQL-logo.svg";

// Custom Components for this screen
import QueryNavbar from "./QueryNavbar";
import QuerySidebar from "./QuerySidebar";
import QueryEditor from "./QueryEditor";

function shouldUpdate(prevProps, nextProps) {
  return (
    (prevProps.namespace !== nextProps.namespace ||
      prevProps.queryName !== nextProps.queryName ||
      prevProps.revisionNumber !== nextProps.revision) &&
    nextProps.queryName !== undefined
  );
}

class QueryEditorScreen extends Component {
  constructor(props) {
    super(props);
    handleLoadNamespaces();

    if (this.props.tenants.length === 0) handleLoadTenants();
  }

  componentDidMount() {
    if (Object.keys(this.props.match.params).length > 0) {
      handleLoadQueryFromURL(this.props.match.params);
    }
  }

  componentDidUpdate(prevProps) {
    const nextProps = {
      namespace: this.props.match.params.namespace,
      queryName: this.props.match.params.queryName,
      revision: this.props.match.params.revision || 1
    };

    if (shouldUpdate(prevProps, nextProps)) {
      handleLoadQueryFromURL(this.props.match.params);
    }
    console.log(this.props.lastRevNumber);
  }

  render() {
    return (
      <QuerySidebar
        className="QueryEditorScreen"
        loadingNamespaces={this.props.loadingNamespaces}
        loadingQueries={this.props.loadingQueries}
        showSidebar={this.props.showSidebar}
        namespaces={this.props.namespaces}
        namespace={this.props.selectedNamespace}
        collapsedNamespace={this.props.collapsedNamespace}
        queries={this.props.queries}
        toggleSidebar={handleToggleSidebar}
        loadQueries={handleSidebarLoadQueries}
        loadQuery={handleSidebarLoadQuery}
      >
        <QueryNavbar
          logo={Logo}
          toggleSidebar={handleToggleSidebar}
          newQuery={handleNewQuery}
        />

        <div className="container">
          <QueryEditor
            // General props
            revisions={this.props.revisions}
            namespace={this.props.namespace}
            queryName={this.props.queryName}
            queryString={this.props.queryString}
            queryParams={this.props.queryParams}
            resultString={this.props.resultString}
            running={this.props.running}
            // Env props
            tenant={this.props.tenant}
            tenants={this.props.tenants}
            handleSetTenant={handleSetTenant}
            activeTenant={this.props.activeTenant}
            resourcesLink={"/resources-editor"}
            // Modal options and listeners
            showModal={this.props.showModal}
            toggleModal={handleShowModal}
            handleNamespaceChange={handleNamespaceChange}
            handleQueryNameChange={handleQueryNameChange}
            // RevisionCombo props
            shouldLoadRevisions={this.props.shouldLoadRevisions}
            loadRevisions={handleLoadRevisions}
            handleRedirectToQuery={handleRedirectToQuery}
            history={this.props.history}
            revisionNumber={this.props.revisionNumber}
            // Listeners to run query
            onQueryStringChange={handleQueryStringChange}
            onParamsChange={handleParamsChange}
            // Actions
            handleRun={handleRunQuery}
            handleSaveQuery={handleSaveQuery}
            handleRunQuery={handleRunQuery}
          />
        </div>
      </QuerySidebar>
    );
  }
}

const mapStateToProps = state => ({
  // Query Editor configurations
  queryString: state.queryReducer.query,
  queryParams: state.queryReducer.queryParams,
  resultString: state.queryReducer.queryResult,
  running: state.queryReducer.running,
  queryName: state.queryReducer.queryName,
  namespaces: state.queryReducer.namespaces,
  namespace: state.queryReducer.namespace,
  collapsedNamespace: state.queryReducer.collapsedNamespace,
  loadingNamespaces: state.queryReducer.loadingNamespaces,
  revisions: state.queryReducer.revisions,
  shouldLoadRevisions: state.queryReducer.shouldLoadRevisions,
  showModal: state.queryReducer.showModal,
  showSidebar: state.queryReducer.showSidebar,
  revisionNumber: state.queryReducer.revision,
  lastRevNumber: state.queryReducer.lastRevNumber,

  //Sidebar configurations
  selectedNamespace: state.sidebarReducer.namespace,
  selectedQueryName: state.sidebarReducer.queryName,
  loadingQueries: state.sidebarReducer.loadingQueries,
  queries: state.sidebarReducer.queries,

  // Env configurations
  tenants: state.environmentReducer.tenants,
  tenant: state.environmentReducer.tenant,
  activeTenant: state.environmentReducer.activeTenant
});

export default connect(mapStateToProps, null)(QueryEditorScreen);
