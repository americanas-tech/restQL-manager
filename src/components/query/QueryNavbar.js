import React, { Component } from "react";
import ReactSVG from "react-svg";
import { Link } from "react-router-dom";

import { Navbar, Button, FormGroup } from "react-bootstrap";

export default class QueryNavbar extends Component {
  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to={"/"} onClick={this.props.newQuery}>
              <ReactSVG src={this.props.logo} alt="Logo" />
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Navbar.Form pullRight>
            <FormGroup controlId="formInlineName">
              <Button bsStyle="default" onClick={this.props.toggleSidebar}>
                Queries
              </Button>
              <Link to={"/"}>
                <Button bsStyle="danger" onClick={this.props.newQuery}>
                  New Query
                </Button>
              </Link>
            </FormGroup>
          </Navbar.Form>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
