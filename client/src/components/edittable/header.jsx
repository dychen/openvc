import React from 'react';
import {DATA_TYPE_MAP} from '../../utils/constants.js';

/*
 * props:
 *   FIELDS [Array]: List of API fields to show as table columns.
 *   FIELD_MAP [Object]: Object that maps fields to their metadata:
 *   {
 *     [field name]: { display: [string], model: [string],
 *                     modelField: [string], required: [boolean],
 *                     type: [string] }
 *   }
 *
 *   sortByField [function]: Function that sorts the data by field name.
 *   onHeaderClick [function]: (Optional) Function that runs when a header cell
 *                             is clicked.
 *     f([Event object]) => CustomField object { displayName: [string], ... }
 */
class EditTableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSort: {
        field: '',
        direction: ''
      }
    };

    this.onSortAscClick = this.onSortAscClick.bind(this);
    this.onSortDescClick = this.onSortDescClick.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
  }

  onSortAscClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'asc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'asc' }});
  }

  onSortDescClick(e) {
    e.stopPropagation();
    const fieldName = e.currentTarget.id;

    this.props.sortByField(fieldName, 'desc', this.props.FIELD_MAP[fieldName]);
    this.setState({ activeSort: { field: fieldName, direction: 'desc' }});
  }

  onHeaderClick(e) {
    if (this.props.onHeaderClick) {
      const activeField = this.props.FIELDS[e.currentTarget.id];
      // activeField is undefined in the remove-entity onClick handler
      this.props.onHeaderClick(activeField);
    }
  }

  render() {
    const className = this.onHeaderClick ? 'clickable' : '';
    const headers = this.props.FIELDS.map(field => {
      const sortAscClass = (this.state.activeSort.field === field
                            && this.state.activeSort.direction === 'asc'
                            ? 'active' : '');
      const sortDescClass = (this.state.activeSort.field === field
                             && this.state.activeSort.direction === 'desc'
                             ? 'active' : '');
      return (
        <td key={field} id={field} className={className}
            onClick={this.onHeaderClick}>
          {this.props.FIELD_MAP[field].display}
          <div className="subtext">
            {DATA_TYPE_MAP[this.props.FIELD_MAP[field].type]}
          </div>
          <i className={`ion-arrow-up-b header-icon sort-table sort-asc ${sortAscClass}`}
             id={field} onClick={this.onSortAscClick} />
          <i className={`ion-arrow-down-b header-icon sort-table sort-desc ${sortDescClass}`}
             id={field} onClick={this.onSortDescClick} />
        </td>
      );
    });

    return (
      <thead>
        <tr>
          {headers}
          <td className={`remove-entity ${className}`} onClick={this.onHeaderClick}>
            <i className="ion-plus" />
          </td>
        </tr>
      </thead>
    );
  }
}

export {EditTableHeader};
