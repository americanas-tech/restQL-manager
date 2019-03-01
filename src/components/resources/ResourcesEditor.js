import React, { Component } from "react";

import { Row, Col, Button } from "react-bootstrap";
import FontAwesome from "react-fontawesome";

import SaveResourceModal from "./SaveResourceModal";

const resourcesList = (res, type, setActiveResourceAndToggleModal) => {
  return (
    <li key={res.name}>
      <p className={`status-${type}`}>{res.name}</p>
      <p className="resource-url">
        {res["url"]}
        <Button
          className="btn-xs"
          bsStyle="success"
          onClick={() => setActiveResourceAndToggleModal(res)}
        >
          <FontAwesome name="pencil" />
        </Button>
      </p>
    </li>
  );
};

const resourceSuccessList = ({ resources, setActiveResourceAndToggleModal }) =>
  resources
    .filter(res => !!res.status && res.status >= 200 && res.status < 500)
    .map(res => resourcesList(res, "success", setActiveResourceAndToggleModal));

const resourceErrorList = ({ resources, setActiveResourceAndToggleModal }) =>
  resources
    .filter(res => !res.status || (!!res.status && res.status >= 500))
    .map(res => resourcesList(res, "error", setActiveResourceAndToggleModal));

export default class ResourcesEditor extends Component {
  render() {
    if (!this.props.loadingTenants && !!this.props.tenant) {
      const newResource = { name: "", url: "", "base-url": "" };

      return (
        <Row>
          <h1>{this.props.tenant}</h1>
          <hr />

          <Col xs={12} className="btn-separator">
            <Row>
              <Button
                bsStyle="success"
                onClick={() =>
                  this.props.setActiveResourceAndToggleModal(newResource)}
              >
                Add New Resource
              </Button>
            </Row>
          </Col>

          {!this.props.loadingResources &&
            this.props.resources.length > 0 && (
              <Col sm={12} md={6}>
                <h4>Reachable Resources</h4>
                <hr />
                <ul>{resourceSuccessList(this.props)}</ul>
              </Col>
            )}

          {!this.props.loadingResources &&
            this.props.resources.length > 0 && (
              <Col sm={12} md={6}>
                <h4>Unreachable Resources</h4>
                <hr />
                <ul>{resourceErrorList(this.props)}</ul>
              </Col>
            )}

          <SaveResourceModal
            authorizationKey={this.props.authorizationKey}
            activeResource={this.props.activeResource}
            tenant={this.props.tenant}
            toggleModal={this.props.handleToggleSaveResourceModal}
            show={this.props.showSaveResourceModal}
            resourceUpdated={this.props.resourceUpdated}
            updateMessage={this.props.updateMessage}
            handleAuthorizationKeyChanged={
              this.props.handleAuthorizationKeyChanged
            }
            handleResourceNameChanged={this.props.handleResourceNameChanged}
            handleResourceUrlChanged={this.props.handleResourceUrlChanged}
            handleSave={this.props.handleSaveResource}
          />
        </Row>
      );
    } else
      return (
        <Row>
          <h1>No tenant</h1>
          <hr />
          <Col xs={12}>
            <p>Fetching data...</p>
          </Col>
        </Row>
      );
  }
}
