import React from 'react';

import {getTableList, getFieldList} from './api.js';
import EditTable from '../../components/edittable.jsx';
import {Subnav, SubnavButton, SubnavDropdown,
        SubnavFilters} from '../../components/subnav.jsx';
import TableModal from './modal.jsx';

/*
 * props:
 *   tableId [string]: Id of the target table
 *   fields [Array]: List of CustomField objects:
 *     [{ displayName: [string], apiName: [string], type: [string],
 *        required: [boolean] }, ...]
 *   onHeaderClick [function]: Function that runs when a header cell is clicked.
 *     f([Event object]) => CustomField object { displayName: [string], ... }
 */
const TableSection = (props) => {
  const apiUrl = `${SERVER_URL}/api/v1/tables/${props.tableId}/records`;
  const fields = props.fields.map(field => field.apiName);
  let fieldMap = {};
  props.fields.forEach(field => {
    fieldMap[field.apiName] = {
      display: field.displayName,
      type: field.type || 'string',
      required: field.required || false
    };
  });

  return (
    <div className="ovc-edit-table-container">
      <EditTable API_URL={apiUrl}
                 FIELDS={fields}
                 FIELD_MAP={fieldMap}
                 onHeaderClick={props.onHeaderClick}
                 {...props} />
    </div>
  );
}

class UserTablesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: {},
      tableFields: [],
      tables: [],
      createModalVisible: false,
      updateModalVisible: false
    };

    this.loadTables = this.loadTables.bind(this);
    this.showCreateModal = this.showCreateModal.bind(this);
    this.showUpdateModal = this.showUpdateModal.bind(this);
    this.hideCreateModal = this.hideCreateModal.bind(this);
    this.hideUpdateModal = this.hideUpdateModal.bind(this);
    this.changeTable = this.changeTable.bind(this);

    this.loadTables();
  }

  loadTables(table) {
    let activeTable = {};
    getTableList()
      .then((tables) => {
        if (table)
          activeTable = table;
        else
          activeTable = (tables && tables.length > 0) ? tables[0] : {};

        this.setState({
          table: activeTable,
          tables: tables
        }, () => {
          if (activeTable.id) {
            getFieldList(activeTable.id)
              .then((fields) => {
                this.setState({ tableFields: fields });
              });
          }
        });
      });
  }

  showCreateModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to hideModal() handlers
    this.setState({ createModalVisible: true });
  }

  showUpdateModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to hideModal() handlers
    this.setState({ updateModalVisible: true });
  }

  hideCreateModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to showModal() handlers
    this.setState({ createModalVisible: false });
  }

  hideUpdateModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to showModal() handlers
    this.setState({ updateModalVisible: false });
  }

  changeTable(tableId) {
    const tableIdx = this.state.tables.findIndex(table => table.id === tableId);
    const activeTable = this.state.tables[tableIdx];
    this.setState({
      table: activeTable
    }, () => {
      if (activeTable.id) {
        getFieldList(activeTable.id)
          .then((fields) => {
            this.setState({ tableFields: fields });
          });
      }
    });
  }

  render() {
    const selectedItem = {
      key: this.state.table.id,
      display: this.state.table.displayName
    };
    const menuItems = this.state.tables.map((table) => {
      return { key: table.id, display: table.displayName };
    });

    const filterList = this.state.tableFields.map((tableField) => {
      return {
        key: tableField.displayName,
        display: `Filter by ${tableField.displayName}`
      };
    });

    let tableSection = '';
    if (this.state.table && this.state.table.id) {
      tableSection = (
        <TableSection tableId={this.state.table.id}
                      fields={this.state.tableFields}
                      onHeaderClick={this.showUpdateModal} />
      );
    }

    return (
      <div className="ovc-subnav-view-container">
        <Subnav>
          <SubnavButton iconClass="ion-plus"
                        text="New Table"
                        onClick={this.showCreateModal} />
          <SubnavDropdown title="Select a Table"
                          selectedItem={selectedItem}
                          menuItems={menuItems}
                          onSelect={this.changeTable} />
          <SubnavFilters filterList={filterList} />
        </Subnav>
        {tableSection}

        <TableModal table={{}}
                    tableFields={[]}
                    visible={this.state.createModalVisible}
                    hideModal={this.hideCreateModal}
                    onSave={this.loadTables} />
        <TableModal table={this.state.table}
                    tableFields={this.state.tableFields}
                    visible={this.state.updateModalVisible}
                    hideModal={this.hideUpdateModal}
                    onSave={this.loadTables}
                    onDelete={this.loadTables} />
      </div>
    );
  }
}

export default UserTablesPage;

