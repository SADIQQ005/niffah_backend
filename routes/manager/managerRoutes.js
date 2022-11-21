const router = require("express").Router();
const {
  register,
  login,
  neefah,
  createProduct,
  getProduct,
  getProducts,
  removeProduct,
  updateProduct,
  changePassword,
  getOrders,
} = require("../../controllers/manager/managerController");
const { managerAuth } = require("../../jwt");

router.post("/register", register);
router.post("/login", login);
router.get("/", managerAuth, neefah);
router.put("/change-password", managerAuth, changePassword);
router.post("/create-product", managerAuth, createProduct);
router.delete("/delete-product/:id", managerAuth, removeProduct);
router.get("/fetch-product/:id", managerAuth, getProduct);
router.get("/fetch-products", managerAuth, getProducts);
router.put("/update-product/:id", managerAuth, updateProduct);
router.get("/fetch-orders", managerAuth, getOrders);

module.exports = router;
