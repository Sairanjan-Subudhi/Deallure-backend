const docClient = require("../config/dynamoConfig");

// Create a new item
const createItem = async (item) => {
  const params = {
    TableName: "User_Products", //DynamoDB table name
    Item: item,
  };

  try {
    console.log("DynamoDB Params:", params); 
    await docClient.put(params).promise();
    return "Item created successfully!";
  } catch (err) {
    throw new Error("Error creating item: " + err.message);
  }
};

// Read an item
const readItem = async (userId, productId) => {
  const params = {
    TableName: "User_Products",
    Key: {
      user_id: userId,
      product_id: productId,
    },
  };

  try {
    const data = await docClient.get(params).promise();
    return data.Item;
  } catch (err) {
    throw new Error("Error reading item: " + err.message);
  }
};

// Update an item
const updateItem = async (userId, productId, updateData) => {
  const updateExpressions = [];
  const expressionAttributeValues = {};

  for (const [key, value] of Object.entries(updateData)) {
    updateExpressions.push(`${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
  }

  const params = {
    TableName: "User_Products",
    Key: {
      user_id: userId,
      product_id: productId,
    },
    UpdateExpression: "set " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await docClient.update(params).promise();
    return data.Attributes;
  } catch (err) {
    throw new Error("Error updating item: " + err.message);
  }
};

// Delete an item
const deleteItem = async (userId, productId) => {
  const params = {
    TableName: "User_Products",
    Key: {
      user_id: userId,
      product_id: productId,
    },
  };

  try {
    await docClient.delete(params).promise();
    return "Item deleted successfully!";
  } catch (err) {
    throw new Error("Error deleting item: " + err.message);
  }
};

module.exports = {
  createItem,
  readItem,
  updateItem,
  deleteItem,
};