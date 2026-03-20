let inventoryModel = require("../schemas/inventories");

module.exports = {
  // Tự động tạo inventory (Sẽ gọi trong lúc tạo Product)
  CreateInventoryForProduct: async function (productId) {
    let newInventory = new inventoryModel({
      product: productId,
      stock: 0,
      reserved: 0,
      soldCount: 0,
    });
    return await newInventory.save();
  },

  GetAll: async function () {
    return await inventoryModel.find().populate("product");
  },

  GetById: async function (id) {
    return await inventoryModel.findById(id).populate("product");
  },

  AddStock: async function (productId, quantity) {
    return await inventoryModel.findOneAndUpdate(
      { product: productId },
      { $inc: { stock: quantity } },
      { new: true },
    );
  },

  RemoveStock: async function (productId, quantity) {
    return await inventoryModel.findOneAndUpdate(
      { product: productId, stock: { $gte: quantity } }, // Đảm bảo stock đủ để trừ
      { $inc: { stock: -quantity } },
      { new: true },
    );
  },

  Reservation: async function (productId, quantity) {
    return await inventoryModel.findOneAndUpdate(
      { product: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity, reserved: quantity } },
      { new: true },
    );
  },

  Sold: async function (productId, quantity) {
    return await inventoryModel.findOneAndUpdate(
      { product: productId, reserved: { $gte: quantity } }, // Đảm bảo reserved đủ để trừ
      { $inc: { reserved: -quantity, soldCount: quantity } },
      { new: true },
    );
  },
};
