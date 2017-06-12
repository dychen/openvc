import React from 'react';

import {getTableList, getFieldList, getSourceList, syncTable} from './api.js';
import EditTable from '../../components/edittable/edittable.jsx';
import {filterData, Subnav, SubnavButton, SubnavDropdown,
        SubnavFilters} from '../../components/subnav.jsx';
import TableModal from './modal.jsx';

/*
 * props:
 *   tableId [string]: Id of the target table
 *   fields [Array]: List of CustomField objects:
 *     [{ displayName: [string], apiName: [string], type: [string],
 *        required: [boolean] }, ...]
 *   source [Object]: Current source object, e.g. { key: 'crunchbase', ... }
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
                 source={props.source}
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

      SOURCES: [],
      EXT_SOURCES: [], // Same as SOURCES but without the default source
      source: {},

      filterTags: [],

      createModalVisible: false,
      updateModalVisible: false
    };

    this.loadTables = this.loadTables.bind(this);
    this.syncTable = this.syncTable.bind(this);
    this.showCreateModal = this.showCreateModal.bind(this);
    this.showUpdateModal = this.showUpdateModal.bind(this);
    this.hideCreateModal = this.hideCreateModal.bind(this);
    this.hideUpdateModal = this.hideUpdateModal.bind(this);
    this.changeTable = this.changeTable.bind(this);
    this.changeSource = this.changeSource.bind(this);

    this.updateFilterTags = this.updateFilterTags.bind(this);
    this.filterTableData = this.filterTableData.bind(this);

    this.loadTables();
  }

  loadTables(table) {
    const getSources = () => {
      getSourceList().then((sources) => {
        const defaultSourceIdx = sources.findIndex(source => source.key === 'self');
        this.setState({
          SOURCES: sources,
          EXT_SOURCES: sources.filter(source => source.key !== 'self'),
          source: sources[defaultSourceIdx]
        });
      });
    };
    const getFields = (tableId) => {
      if (activeTable.id) {
        getFieldList(activeTable.id)
          .then((fields) => {
            this.setState({ tableFields: fields }, getSources);
          });
      }
    };
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
        }, () => { getFields(activeTable.id); });
      });
  }

  syncTable(e) {
    if (this.state.table && this.state.table.id) {
      syncTable(this.state.table.id).then((tableId) => {
        // Should be okay since there should only be one modal visible at a
        // time
        this.hideCreateModal();
        this.hideUpdateModal();
        // TODO: Update table data
      });
    }
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

  changeSource(sourceKey) {
    const sourceIdx = this.state.SOURCES.findIndex(source =>
      source.key === sourceKey
    );
    const activeSource = this.state.SOURCES[sourceIdx];
    this.setState({ source: activeSource });
  }

  updateFilterTags(filterTags) {
    this.setState({ filterTags: filterTags });
  }
  /*
   * Args:
   *   data [Array]: Array of objects:
   *     [{ field1: val1, field2: val2, ... }]
   */
  filterTableData(data) {
    return filterData(data, this.state.filterTags);
  }

  render() {
    const selectedTable = {
      key: this.state.table.id,
      display: this.state.table.displayName
    };
    const tableItems = this.state.tables.map((table) => {
      return { key: table.id, display: table.displayName };
    });

    const selectedSource = {
      key: this.state.source.key,
      display: this.state.source.display
    }
    const sourceItems = this.state.SOURCES.map((source) => {
      return { key: source.key, display: source.display };
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
                      filterData={this.filterTableData}
                      source={this.state.source.key}
                      onHeaderClick={this.showUpdateModal} />
      );
    }

    return (
      <div className="ovc-subnav-view-container">
        {tableSection}

        <Subnav icon="ion-compose">
          <SubnavButton iconClass="ion-plus"
                        text="New Table"
                        onClick={this.showCreateModal} />
          <SubnavDropdown title="Select a Table"
                          selectedItem={selectedTable}
                          menuItems={tableItems}
                          onSelect={this.changeTable} />
          <SubnavDropdown title="View by Source"
                          selectedItem={selectedSource}
                          menuItems={sourceItems}
                          onSelect={this.changeSource} />
          <SubnavFilters filterList={filterList}
                         onUpdate={this.updateFilterTags} />
        </Subnav>

        <TableModal table={{}}
                    tableFields={[]}
                    SOURCES={this.state.EXT_SOURCES}
                    visible={this.state.createModalVisible}
                    hideModal={this.hideCreateModal}
                    onSave={this.loadTables}
                    onSync={this.syncTable} />
        <TableModal table={this.state.table}
                    tableFields={this.state.tableFields}
                    SOURCES={this.state.EXT_SOURCES}
                    visible={this.state.updateModalVisible}
                    hideModal={this.hideUpdateModal}
                    onSave={this.loadTables}
                    onDelete={this.loadTables}
                    onSync={this.syncTable} />
      </div>
    );
  }
}

export default UserTablesPage;

