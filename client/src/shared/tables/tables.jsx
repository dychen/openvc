import React from 'react';

import {getTableList} from './api.js';

import EditTable from '../../components/edittable.jsx';
import {Subnav, SubnavButton, SubnavDropdown,
        SubnavFilters} from '../../components/subnav.jsx';
import TableModal from './modal.jsx';

class UserTablesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: { apiName: 'deals-table', displayName: 'Deals Table' },
      tableFields: [
        { apiName: 'name', displayName: 'Name', type: 'string' },
        { apiName: 'date', displayName: 'Date', type: 'date' },
        { apiName: 'source', displayName: 'Source', type: 'string' },
        { apiName: 'amount-raising', displayName: 'Amount Raising', type: 'number' }
      ],
      tables: [
        { apiName: 'deals-table', displayName: 'Deals Table' },
        { apiName: 'pipeline-table', displayName: 'Pipeline Table' },
        { apiName: 'investments-table', displayName: 'Investments Table' }
      ],
      modalVisible: false
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    //getTableList().then((results) => console.log(results));
  }

  showModal(e) {
    e.stopPropagation(); // Don't propagate to hideModal() handlers
    this.setState({ modalVisible: true });
  }

  hideModal(e) {
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

