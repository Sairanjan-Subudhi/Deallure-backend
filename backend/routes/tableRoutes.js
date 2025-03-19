const express = require("express");
const {
  createItem,
  readItem,
  updateItem,
  deleteItem,
} = require("../services/crudOperation");

const router = express.Router();

// Route to create an item
router.post("/create", async (req, res) => {
  try {
    const message = await createItem(req.body);
    res.status(201).send({ message });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Route to read an item
router.get("/read", async (req, res) => {
    console.log("Received Query Params:", req.query);
    const { userId, productId } = req.query; // Use correct keys
  
    try {
      const item = await readItem(userId, productId);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).send("Item not found.");
      }
    } catch (err) {
      console.error("Error reading item:", err);
      res.status(500).send(err.message);
    }
  });
  

// Route to update an item
router.put("/update", async (req, res) => {
  const { user_id, product_id, updateData } = req.body;

  try {
    const updatedAttributes = await updateItem(user_id, product_id, updateData);
    res.status(200).json(updatedAttributes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to delete an item
router.delete("/delete", async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    const message = await deleteItem(user_id, product_id);
    res.status(200).send(message);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;