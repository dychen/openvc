###Backend Setup
```
$ source venv/bin/activate
$ brew install postgres
$ pip install -r requirements.txt
# More to come
```

###Frontend Setup
```
$ npm install
$ npm run server
```

Additional commands:
```
$ npm build
```

Build dependencies:
```
# Webpack
webpack
webpack-dev-server

# Webpack Loaders and Plugins
babel-loader
file-loader  # For index.html
style-loader # For CSS
css-loader   # For CSS
extract-text-webpack-plugin # For CSS bundling
sass-loader  # For SASS/SCSS
url-loader   # For fonts

# Babel
babel-cli
babel-core
babel-preset-es2015
babel-preset-react

# Other
node-sass
```

Frontend package notes:
* `react-addons-shallow-compare` is a dependency for `react-dates`

Backend package notes:

###Frontend component API
```
// TODO
```

###API/Design Docs

Routes:
```
/api/v1/investor/leads
- GET    /api/v1/investor/leads
- POST   /api/v1/investor/leads
- POST   /api/v1/investor/leads/:id
- DELETE /api/v1/investor/leads/:id

/api/v1/investor/deals
- GET    /api/v1/investor/deals
- POST   /api/v1/investor/deals
- POST   /api/v1/investor/deals/:id
- DELETE /api/v1/investor/deals/:id

/api/v1/investor/portfolio
- GET    /api/v1/investor/portfolio
- POST   /api/v1/investor/portfolio
- POST   /api/v1/investor/portfolio/:id
- DELETE /api/v1/investor/portfolio/:id

/api/v1/investor/contacts
- GET    /api/v1/investor/contacts
- POST   /api/v1/investor/contacts
- POST   /api/v1/investor/contacts/:id
- DELETE /api/v1/investor/contacts/:id
```

Custom field tables:

```
FieldMeta
- account_id [int] [FK]
- field_name [varchar]
- field_type [varchar] [boolean, date, integer, numeric, text, timestamp]

FieldPermission
- account_id [int] [FK]
- user_id [int] [FK]
- field_meta_id [int] [FK]
- read [boolean]
- write [boolean]

CompanyFieldValue
- account_id [int] [FK]
- company_id [int] [FK]
- field_meta_id [int] [FK]
- field_value [jsonb]
- updated_by [int] [FK]

CompanyFieldHistory
- account_id [int] [FK]
- company_id [int] [FK]
- field_meta_id [int] [FK]
- field_value [jsonb]
- updated_by [int] [FK]
- updated_at [date]

APIConfig
- account_id [int] [FK]
- user_id [int] [FK]
- field_meta_id [int] [FK]
- endpoint [varchar] [leads, deals, portfolio, contacts]

// TODO:
{
    name: {
        fieldName: 'name',
        tableName: 'deal',
        fieldType: 'string',
        fieldValue: 'Pinterest'
    },
    companyId: {
        fieldName: 'id',
        tableName: 'company',
        fieldType: 'fk',
        fieldValue: 2
    },
    date: {
        fieldName: 'date',
        tableName: 'deal',
        fieldType: 'date',
        fieldValue: '2016-01-18'
    }
}
```

###SQL

# Get data
```
SELECT ct.api_name, cr.id, cf.api_name, cf.type, cd.value
    FROM data_customtable ct JOIN data_customfield cf ON ct.id=cf.table_id
    JOIN data_customfieldsource cfs ON cf.id=cfs.field_id
    JOIN data_customdata cd ON cd.field_id=cfs.id
    JOIN data_customrecord cr ON cr.id=cd.record_id
    WHERE ct.api_name='[NAME]';
```

# Get table schema
```
SELECT ct.api_name, cf.api_name, ds.name, dso.model, dso.field
    FROM data_customfieldsource cfs JOIN data_customfield cf ON cfs.field_id=cf.id
    JOIN data_datasource ds ON cfs.source_id=ds.id
    JOIN data_datasourceoption dso ON cfs.source_option_id=dso.id
    JOIN data_customtable ct ON cf.table_id=ct.id
    WHERE ct.api_name='[NAME]';
```

# Get data by source
```
SELECT ct.api_name, cr.id, cf.api_name, cf.type, cd.value
    FROM data_customtable ct JOIN data_customfield cf ON ct.id=cf.table_id
    JOIN data_customfieldsource cfs ON cf.id=cfs.field_id
    JOIN data_customdata cd ON cd.field_id=cfs.id
    JOIN data_customrecord cr ON cr.id=cd.record_id
    JOIN data_datasource ds ON ds.id=cfs.source_id
    WHERE ct.api_name='[NAME]' AND ds.name='[NAME]';
```
