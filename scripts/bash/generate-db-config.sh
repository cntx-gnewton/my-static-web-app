#!/bin/bash

read -p "Enter your database name: " mydbname
read -p "Enter your database type: [mssql,postgresql,cosmosdb_nosql,mysql] (default cosmosdb_nosql)" mydbtype

if [ -z "$mydbtype" ]
then
  mydbtype="cosmosdb_nosql"
fi

read -p "Enter your database connection string: " mydbconnstr

export DATABASE_CONNECTION_STRING=$mydbconnstr

# Check if @azure/static-web-apps-cli is installed
if ! npm list -g @azure/static-web-apps-cli > /dev/null 2>&1; then
    echo "@azure/static-web-apps-cli is not installed."
    read -p "Do you want to install it now? (y/n) " answer
    if [ "$answer" == "y" ]; then
        npm install -g @azure/static-web-apps-cli
        npm update
    else
        echo "Please install @azure/static-web-apps-cli to proceed."
        exit 1
    fi
else echo "@azure/static-web-apps-cli is installed."    
fi

swa db init --database-type $mydbtype --cosmosdb_nosql-database $mydbname



# $ . ./scripts/bash/generate-db-config.sh 
# Enter your database name: cntxsql
# Enter your database type:
# Enter your database connection string: jwfcBnHV4UTbU608w76OBGpoJje0mSVUwksfrFcoJFQCOsTf2ZY8JCXSowfyzqkwrxr2tr1VMHvjACDbQfhJKg==
# @azure/static-web-apps-cli is installed.

# Welcome to Azure Static Web Apps CLI (1.1.2)

# [swa] Creating database connections configuration folder swa-db-connections
# [swa] Creating staticwebapp.database.config.json configuration file
# [swa] ✔ Downloading https://github.com/Azure/data-api-builder/releases/download/v0.6.14/dab_win-x64-0.6.14.zip@0.6.14       
# Information: Microsoft.DataApiBuilder 0.6.14+b21a924c4a9220e9cdef36032786b531c6394251
# Information: User provided config file: staticwebapp.database.config.json
# Warning: Configuration option --rest.path is not honored for cosmosdb_nosql since it does not support REST yet.
# Information: Config file generated.
# Information: SUGGESTION: Use 'dab add [entity-name] [options]' to add new entities in your config.