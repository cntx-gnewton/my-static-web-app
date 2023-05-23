/* eslint-disable no-unused-vars */

import { CosmosClient } from '@azure/cosmos';

import config from './cosmos.config';

const databaseId = config.database.id;
const containerId = config.container.id;
const partitionKey = { kind: 'Hash', paths: ['/partitionKey'] };

const options = {
  endpoint: config.endpoint,
  key: config.key,
  userAgentSuffix: 'CosmosDBJavascriptQuickstart'
};

const client = new CosmosClient(options);

export async function createUserWithProducts(userId, userName, products) {
  const user = {
    id: userId,
    name: userName,
    products: products,
  };

  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items.upsert(user);

  console.log(`Created user with id:\n${userId}\n`);
}

export async function getUserById(userId) {
  const { resource: user } = await client
    .database(databaseId)
    .container(containerId)
    .item(userId)
    .read();

  return user;
}




export async function createUser(userInfo) {
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items.upsert(userInfo);
  console.log(`Created user with id:\n${userInfo.id}\n`);
}

export async function addUserProduct(userId, product) {
  // Fetch the user's document
  const { resource: user } = await client
    .database(databaseId)
    .container(containerId)
    .item(userId)
    .read();
  // Add the new product to the products array
  user.products.push(product);
  // Save the updated document back to the database
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .item(userId)
    .replace(user);

  console.log(`Added product to user with id:\n${userId}\n`);
}


export async function list() {
  console.log(`Querying container:\n${containerId}`);
  const querySpec = {
    query: 'SELECT r.id, r.Name FROM root r',
  };
  try {
    const { resources: results } = await client
      .database(databaseId)
      .container(containerId)
      .items.query(querySpec)
      .fetchAll();
    console.table(results);
  } catch (error) {
    console.error('Error in list(): ' + error);
  }
}
/**
 * Create the database if it does not exist
 */
export const createDatabase = async () => {
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  });
  console.log(`Created database:\n${databaseId}\n`);
};
/**
 * Read the database definition
 */
export async function readDatabase() {
  const { resource: databaseDefinition } = await client
    .database(databaseId)
    .read()
  console.log(`Reading database:\n${databaseDefinition.id}\n`)
}
/**
 * Create the container if it does not exist
 */
export async function createContainer() {
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey }
    )
  console.log(`Created container:\n${config.container.id}\n`)
}
/**
 * Read the container definition
 */
export async function readContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read()
  console.log(`Reading container:\n${containerDefinition.id}\n`)
}

/**
 * Scale a container
 * You can scale the throughput (RU/s) of your container up and down to meet the needs of the workload. Learn more: https://aka.ms/cosmos-request-units
 */
export async function scaleContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read();
  
  try
  {
      const {resources: offers} = await client.offers.readAll().fetchAll();
  
      const newRups = 500;
      for (var offer of offers) {
        if (containerDefinition._rid !== offer.offerResourceId)
        {
            continue;
        }
        offer.content.offerThroughput = newRups;
        const offerToReplace = client.offer(offer.id);
        await offerToReplace.replace(offer);
        console.log(`Updated offer to ${newRups} RU/s\n`);
        break;
      }
  }
  catch(err)
  {
      if (err.code == 400)
      {
          console.log(`Cannot read container throuthput.\n`);
          console.log(err.body.message);
      }
      else 
      {
          throw err;
      }
  }
}

/**
 * Create family item if it does not exist
 */
export async function createFamilyItem(itemBody) {
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items.upsert(itemBody)
  console.log(`Created family item with id:\n${itemBody.id}\n`)
}

/**
 * Query the container using SQL
 */
export async function queryContainer() {
  console.log(`Querying container:\n${config.container.id}`)

  // query to return all children in a family
  // Including the partition key value of country in the WHERE filter results in a more efficient query
  const querySpec = {
    query: 'SELECT VALUE r.children FROM root r WHERE r.partitionKey = @country',
    parameters: [
      {
        name: '@country',
        value: 'USA'
      }
    ]
  }

  const { resources: results } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll()
  for (var queryResult of results) {
    let resultString = JSON.stringify(queryResult)
    console.log(`\tQuery returned ${resultString}\n`)
  }
}

/**
 * Replace the item by ID.
 */
export async function replaceFamilyItem(itemBody) {
  console.log(`Replacing item:\n${itemBody.id}\n`)
  // Change property 'grade'
  itemBody.children[0].grade = 6
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id, itemBody.partitionKey)
    .replace(itemBody)
}

/**
 * Delete the item by ID.
 */
export async function deleteFamilyItem(itemBody) {
  await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id, itemBody.partitionKey)
    .delete(itemBody)
  console.log(`Deleted item:\n${itemBody.id}\n`)
}

/**
 * Cleanup the database and collection on completion
 */
export async function cleanup() {
  await client.database(databaseId).delete()
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */
export const exit = (message) => {
  console.log(message);
  console.log('Press any key to exit');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
};