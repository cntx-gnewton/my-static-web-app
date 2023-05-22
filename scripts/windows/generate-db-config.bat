$mydbname = Read-Host -Prompt 'Enter your database name'
$mydbtype = Read-Host -Prompt 'Enter your database type'
if ([string]::IsNullOrEmpty($mydbtype)) {
    $mydbtype = 'cosmosdb_nosql'
}
$mydbconnstr = Read-Host -Prompt 'Enter your database connection string'

$env:DATABASE_CONNECTION_STRING=$mydbconnstr
swa db init --database-type $mydbtype --cosmosdb_nosql-database $mydbname
