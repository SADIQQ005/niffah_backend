const bcrypt = require("bcrypt");
const User = require("../../models/user");
const Cart = require("../../models/cart");
const { createToken, maxAge } = require("../../jwt");
const Product = require("../../models/product");
const Orders = require("../../models/Orders");

// SIGNING UP NEW USER
module.exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "FAILED", message: "Email and password are required" });
  }

  //   CHECKING FOR USER CREDENTAILS IN DATABASE
  const exist = await User.findOne({ email });

  if (!exist) {
    try {
      //   HASHING USERS PASSWORD
      const hashedPassowrd = await bcrypt.hash(password, 10);

      const user = await User.create({ email, password: hashedPassowrd });

      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 100 });

      return res
        .status(200)
        .json({ status: "SUCCESS", message: "User is registered" });
    } catch (err) {
      res.status(400).json({ status: "FAILED", message: "Failed" }, err);
    }
  } else {
    return res
      .status(400)
      .json({ status: "FAILED", message: "User already exist" });
  }
};

// LOGGIN IN EXISTING USER
module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "FAILED", message: "Email and password are required" });
  }

  //   CHECKING FOR USER CREDENTAILS IN DATABASE
  const exist = await User.findOne({ email });

  if (exist) {
    // CHECKING IF PASSOWRD MATCH
    const match = await bcrypt.compare(password, exist.password);
    if (match) {
      try {
        const token = createToken(exist._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 100 });

        return res
          .status(200)
          .json({ status: "SUCCESS", message: "User logged in successfully" });
      } catch (err) {
        res.status(400).json({ status: "FAILED", message: "Failed" }, err);
      }
    } else {
      return res.status(400).json({
        status: "FAILED",
        message: "User email or passord not correct!",
      });
    }
  }
  if (!exist)
    return res.status(400).json({
      status: "FAILED",
      message: "No account found",
    });
};

// GETTING A USER'S PROFILE
module.exports.profile = (req, res) => {
  return res.json({ message: "User profile" });
};

module.exports.fetchProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({
      status: "SUCCESS",
      message: "Products was fetched successfully",
      products,
    });
  } catch (err) {
    res.status(400).json({ status: "FAILED", message: "Request failed" });
  }
};

module.exports.fetchProduct = (req, res) => {
  // Check for user products array
  const itemId = req.params.id;
  Product.findOne({ _id: itemId })
    .then((doc) => {
      return res.status(200).json(doc.lenth > 0 ? "" : doc);
    })
    .catch((err) => {
      res.status(400).json({ error: "Server error!" }, err);
    });
};

// ADD ITEM TO CART
module.exports.addToCart = async (req, res) => {
  const { _id } = req.user;
  const item = req.body.cartItems;

  try {
    const isCart = await Cart.findOne({ user: _id });
    const { meal } = item;

    if (isCart) {
      const itemExist = isCart.cartItems.find((i) => i.meal === meal);

      if (itemExist) {
        const newQty = itemExist.quantity + item.quantity;
        await Cart.updateOne(
          { user: _id, "cartItems.meal": meal },
          {
            $set: {
              "cartItems.$": {
                ...item,
                quantity: newQty,
                itemTotal: newQty * item.price,
              },
            },
          }
        );
      } else {
        await Cart.updateOne(
          { user: _id },
          {
            $push: {
              cartItems: {
                price: item.price,
                meal: item.meal,
                quantity: item.quantity,
                itemTotal: item.quantity * item.price,
              },
            },
          }
        );
      }
    } else {
      await Cart.create({
        user: _id,
        cartItems: {
          price: item.price,
          meal: item.meal,
          quantity: item.quantity,
          itemTotal: item.quantity * item.price,
        },
      });
    }
    res.status(200).json({ mssg: "Item added to cart successfully!" });
  } catch (err) {
    res.status(400).json({ mssg: "An error occurred please try again!" });
  }
};

// DELETE AN ITEM FROM THE CART
module.exports.removeCartItem = async (req, res) => {
  const { _id } = req.user;
  const item = req.params.id;
  // Check for existing user item is in user cart
  try {
    const cartExist = await Cart.findOne({ user: _id });
    // Delete item from array of cart that is matching provided id
    if (cartExist) {
      await Cart.updateOne(
        { user: _id },
        {
          $pull: {
            cartItems: { _id: item },
          },
        }
      );
    }
    res.status(200).json({ messg: "Item deleted from cart successfully!" });
  } catch (error) {
    res.status(400).json({ messg: "An error occur please try again!" });
  }
};

// VIEW CART/ FETCH ALL ITEM IN THE CART
module.exports.viewCart = async (req, res) => {
  const { _id } = req.user;
  // Fetch all cart items
  try {
    const cart = await Cart.find({ user: _id });
    return res.status(200).json({ cart });
  } catch (error) {
    res.status(400).json({ messg: "An error occur please try again!" });
  }
};

// ORDER AN ITEM
module.exports.order = async (req, res) => {
  const { _id } = req.user;
  const cartId = req.params.id;

  try {
    const orderItem = await Orders.create({
      user: _id,
      items: cartId,
    });
    if (!orderItem) {
      res.status(400).json({ messg: "Order was not placed try again!" });
    }
    return res.status(200).json({ messg: "Order placed successfully" });
  } catch (error) {
    res.status(400).json({ messg: "Error from server!" });
  }
};

// Fetch only logged in users orders
module.exports.fetchOrder = async (req, res) => {
  const { _id } = req.user;

  try {
    const orders = await Orders.find({ user: _id }).populate("items");
    if (!orders) {
      res.status(401).json({ messg: "Order an item to view them here!" });
    } else {
      return res.status(200).json({ orders });
    }
  } catch (error) {
    res.status(400).json({ messg: "server error!" });
  }
};

// Cancel an order
module.exports.cancelOrder = async (req, res) => {
  // Get order id from req paramiter
  const orderId = req.params.id;

  // Adding filter criteries 
  const update = { status: "cancelled" };
  const filter = { _id: orderId };

  // tryCatch to handle async function and error
  try {
    // filtering collection to update the order status
    await Orders.findOneAndUpdate(filter, update);
    res.status(200).json({ messg: "Order has been cancelled" });
  } catch (error) {
    res.status(400).json({ messg: "something went wrong please try again" });
  }
};
