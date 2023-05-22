
## .funcignore

```
*.js.map
*.ts
.git*
.vscode
__azurite_db*__.json
__blobstorage__
__queuestorage__
local.settings.json
test
tsconfig.json
```

## host.json

```
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[3.*, 4.0.0)"
  }
}
```

## local.settings.json

```
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

## package-lock.json

```
{
  "name": "api",
  "version": "1.0.0",
  "lockfileVersion": 1
}

```

## package.json

```
{
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet...\""
  },
  "dependencies": {},
  "devDependencies": {}
}

```

# products-delete/

## products-delete\function.json

```
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["delete"],
      "route": "products/{id}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}

```

## products-delete\index.js

```
const data = require('../shared/product-data');
module.exports = async function (context, req) {
  const id = parseInt(req.params.id, 10);
  try {
    data.deleteProduct(id);
    context.res.status(200).json({});
  } catch (error) {
    context.res.status(500).send(error);
  }
};

```

# products-get/

## products-get\function.json

```
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"],
      "route": "products"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

## products-get\index.js

```
const data = require('../shared/product-data');
module.exports = async function (context, req) {
  try {
    const products = data.getProducts();
    context.res.status(200).json(products);
  } catch (error) {
    context.res.status(500).send(error);
  }
};
```

## products-get\sample.dat

```
{
    "name": "Azure"
}
```

# products-post/

## products-post\function.json

```
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "products"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}

```

## products-post\index.js

```
const data = require('../shared/product-data');
module.exports = async function (context, req) {
  const product = {
    id: undefined,
    name: req.body.name,
    description: req.body.description,
  };
  try {
    const newProduct = data.addProduct(product);
    context.res.status(201).json(newProduct);
  } catch (error) {
    context.res.status(500).send(error);
  }
};

```

# products-put/

## products-put\function.json

```
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["put"],
      "route": "products/{id}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}

```

## products-put\index.js

```
const data = require('../shared/product-data');
module.exports = async function (context, req) {
  const product = {
    id: parseInt(req.params.id, 10),
    name: req.body.name,
    description: req.body.description,
    quantity: req.body.quantity,
  };
  try {
    const updatedProduct = data.updateProduct(product);
    context.res.status(200).json(updatedProduct);
  } catch (error) {
    context.res.status(500).send(error);
  }
};

```

# shared/

## shared\product-data.js

```
const data = {
  products: [
    {
      id: 10,
      name: 'Strawberries',
      description: '16oz package of fresh organic strawberries',
      quantity: '1',
    },
    {
      id: 20,
      name: 'Sliced bread',
      description: 'Loaf of fresh sliced wheat bread',
      quantity: 1,
    },
    {
      id: 30,
      name: 'Apples',
      description: 'Bag of 7 fresh McIntosh apples',
      quantity: 1,
    },
  ],
};
const getRandomInt = () => {
  const max = 1000;
  const min = 100;
  return Math.floor(Math.random() * Math.floor(max) + min);
};
const addProduct = (product) => {
  product.id = getRandomInt();
  data.products.push(product);
  return product;
};
const updateProduct = (product) => {
  const index = data.products.findIndex((v) => v.id === product.id);
  console.log(product);
  data.products.splice(index, 1, product);
  return product;
};
const deleteProduct = (id) => {
  const value = parseInt(id, 10);
  data.products = data.products.filter((v) => v.id !== value);
  return true;
};
const getProducts = () => {
  return data.products;
};
module.exports = { addProduct, updateProduct, deleteProduct, getProducts };

```
