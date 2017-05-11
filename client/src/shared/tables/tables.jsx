import React from 'react';
import EditTable from '../../components/edittable.jsx';
import {Subnav, SubnavDropdown,
        SubnavFilters} from '../../components/subnav.jsx';

import {getTableList, createTable, updateTable, deleteTable} from './api.js';

import '../../components/subnav.scss';

class UserTablesPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: { apiName: 'deals-table', displayName: 'Deals Table' },
      tableFields: [
        { apiName: 'name', displayName: 'Name' },
        { apiName: 'date', displayName: 'Date' }
      ],
      tables: [
        { apiName: 'deals-table', displayName: 'Deals Table' },
        { apiName: 'pipeline-table', displayName: 'Pipeline Table' },
        { apiName: 'investments-table', displayName: 'Investments Table' }
      ],
    };

    //getTableList().then((results) => console.log(results));
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
          <SubnavDropdown title="Select a Table"
                          selectedItem={selectedItem}
                          menuItems={menuItems}
                          onSelect={} />
          <SubnavFilters filterList={filterList} />
        </Subnav>
      </div>
    );
  }
}

export default UserTablesPage;

