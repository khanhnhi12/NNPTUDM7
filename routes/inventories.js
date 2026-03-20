var express = require("express");
var router = express.Router();
let inventoryController = require("../controllers/inventories");
let { checkLogin } = require("../utils/authHandler");

// Lấy tất cả inventory (Yêu cầu login)
router.get("/", checkLogin, async function (req, res, next) {
  try {
    let inventories = await inventoryController.GetAll();
    res.status(200).send(inventories);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Lấy inventory theo ID
router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    let inventory = await inventoryController.GetById(req.params.id);
    if (!inventory) return res.status(404).send("Không tìm thấy inventory");
    res.status(200).send(inventory);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Tăng stock
router.post("/add_stock", checkLogin, async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let result = await inventoryController.AddStock(product, quantity);
    res.status(200).send({ message: "Thêm stock thành công", data: result });
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
});

// Giảm stock
router.post("/remove_stock", checkLogin, async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let result = await inventoryController.RemoveStock(product, quantity);
    if (!result)
      return res
        .status(400)
        .send("Stock không đủ để trừ hoặc không tìm thấy sản phẩm");
    res.status(200).send({ message: "Giảm stock thành công", data: result });
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
});

// Đặt hàng (Reservation)
router.post("/reservation", checkLogin, async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let result = await inventoryController.Reservation(product, quantity);
    if (!result) return res.status(400).send("Stock không đủ để đặt hàng");
    res.status(200).send({ message: "Đặt hàng thành công", data: result });
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
});

// Bán hàng (Sold)
router.post("/sold", checkLogin, async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    let result = await inventoryController.Sold(product, quantity);
    if (!result) return res.status(400).send("Reserved không đủ để bán");
    res.status(200).send({ message: "Bán hàng thành công", data: result });
  } catch (error) {
    res.status(400).send("Lỗi: " + error.message);
  }
});

module.exports = router;
