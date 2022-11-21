const router = require("express").Router();
const {
  register,
  login,
  profile,
  fetchProducts,
  fetchProduct,
  addToCart,
  removeCartItem,
  viewCart,
  order,
  fetchOrder,
  cancelOrder
} = require("../../controllers/user/userController");
const { authUser } = require("../../jwt");

router.post("/register", register);
router.post("/login", login);
router.get("/", authUser, profile);
router.get("/fetch-products", fetchProducts);
router.get("/fetch-product/:id", fetchProduct);
router.post("/add-to-cart", authUser, addToCart);
router.get("/cart", authUser, viewCart);
router.delete("/remove-cart-item/:id", authUser, removeCartItem);
router.post("/order/:id", authUser, order);
router.get("/orders", authUser, fetchOrder);
router.put("/cancel-order/:id", authUser, cancelOrder);

module.exports = router;
