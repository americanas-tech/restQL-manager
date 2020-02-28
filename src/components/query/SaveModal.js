import React, { Component } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";

export default class SaveModal extends Component {
  initialState = {
    namespace: "",
    queryName: ""
  };

  constructor() {
    super();

    this.state = this.initialState;
  }

  handleSave = (namespace, queryName) => {
    let callback = this.props.onSave;
    callback(namespace, queryName);
    this.setState(this.initialState);

    this.props.toggleModal();
  };

  handleNamespaceChange = ev => {
    this.setState({ namespace: ev.target.value });
  };

  handleQueryNameChange = ev => {
    this.setState({ queryName: ev.target.value });
  };

  render() {
    const namespace = this.state.namespace || this.props.namespace;
    const queryName = this.state.queryName || this.props.queryName;

    const button = (
      <Button bsStyle="info" onClick={this.props.toggleModal}>
        Save Query
      </Button>
    );

    const saveTooltip = (
      <Tooltip id="save-tooltip">
        <strong>{this.props.tooltip}</strong>
      </Tooltip>
    );

    const buttonWithTooltip = this.props.tooltip ? (
      <OverlayTrigger placement="bottom" overlay={saveTooltip}>
        {button}
      </OverlayTrigger>
    ) : (
      button
    );

    return (
      <span>
        {buttonWithTooltip}

        <Modal show={this.props.show} onHide={this.props.toggleModal}>
          <Modal.Header>
            <Modal.Title>Save Query</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Namespace</label>
              <input
                type="text"
                className="form-control"
                value={namespace}
                onChange={this.handleNamespaceChange}
              />
            </div>

            <div className="form-group">
              <label>Query Name</label>
              <input
                type="text"
                className="form-control"
                value={queryName}
                onChange={this.handleQueryNameChange}
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              bsStyle="success"
              onClick={() => this.handleSave(namespace, queryName)}
            >
              Save
            </Button>
            <Button onClick={this.props.toggleModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}
