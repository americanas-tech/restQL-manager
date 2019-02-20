import React, { Component } from 'react';

import { Collapse } from 'react-bootstrap';

import { Link } from "react-router-dom";

export default class SidebarQueries extends Component {

  renderQueries = () => {
    if (!this.props.loadingQueries && Array.isArray(this.props.queries)) {
      return this.props.queries.map((val, index) => {
        return (
          <li key={index}>
            <Link to={`/query/${this.props.namespace}/${val.id}`} >{val.id}</Link>
          </li>
        );
      });
    }
    else {
      return '';
    }
  }

  render() {
    const shouldCollapse = this.props.namespace === this.props.collapsedNamespace && !this.props.loadingQueries;
    return (
      <ul className="queries">
        <Collapse in={shouldCollapse}>
          <div>
            {
              shouldCollapse ?
                this.renderQueries() : null
            }
          </div>
        </Collapse>
      </ul>
    );
  }

}
