import React from 'react';

import {getTableList, getFieldList} from './api.js';
import EditTable from '../../components/edittable.jsx';
import {Subnav, SubnavButton, SubnavDropdown,
        SubnavFilters} from '../../components/subnav.jsx';
import TableModal from './modal.jsx';

class UserTablesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: {},
      tableFields: [],
      tables: [],
      modalVisible: false
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    getTableList()
      .then((tables) => {
        const activeTable = (tables && tables.length > 0) ? tables[0] : {};
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

  showModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to hideModal() handlers
    this.setState({ modalVisible: true });
  }

  hideModal(e) {
    if (e && e.stopPropagation)
      e.stopPropagation(); // Don't propagate to showModal() handlers
    this.setState({ modalVisible: false });
  }

  render() {
    const selectedItem = {
      key: this.state.table.apiName,
      display: this.state.table.displayName
    };
    const menuItems = this.state.tables.map((table) => {
      return { key: table.apiName, display: table.displayName };
    });

    const filterList = this.state.tableFields.map((tableField) => {
      return {
        key: tableField.apiName,
        display: `Filter by ${tableField.displayName}`
      };
    });

    return (
      <div className="ovc-subnav-view-container">
        <Subnav>
          <SubnavButton iconClass="ion-plus"
                        text="New Table"
                        onClick={this.showModal} />
          <SubnavDropdown title="Select a Table"
                          selectedItem={selectedItem}
                          menuItems={menuItems} />
          <SubnavFilters filterList={filterList} />
        </Subnav>

        <TableModal table={this.state.table}
                    tableFields={this.state.tableFields}
                    visible={this.state.modalVisible}
                    hideModal={this.hideModal} />
      </div>
    );
  }
}

export default UserTablesPage;

