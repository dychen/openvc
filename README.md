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
