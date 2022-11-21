const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const Manager = require("../../models/manager");
const Product = require("../../models/product");
const { createToken, maxAge } = require("../../jwt");
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
  const exist = await Manager.findOne({ email });

  if (!exist) {
    try {
      //   HASHING USERS PASSWORD
      const hashedPassowrd = await bcrypt.hash(password, 10);

      const user = await Manager.create({ email, password: hashedPassowrd });

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
  const exist = await Manager.findOne({ email });

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
module.exports.neefah = (req, res) => {
  return res.json({ message: "Manager profile" });
};

// CHANGE MANAGER PASSWORD
module.exports.changePassword = async (req, res) => {
  const { password } = req.body;
  const { _id } = req.user;
  const isAccount = await Manager.findOne({ _id: _id });
  if (isAccount) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await Manager.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      { new: true }
    );
    res.status(200).json({
      status: "SUCCESS",
      message: "Password updated successfully",
      updated,
    });
  } else {
    res.status(400).json({
      status: "FAILED",
      message: "Not allowed to change password! / not owner of account",
    });
  }
};

// CREATE NEW PRODUCT FOR LISTING
module.exports.createProduct = async (req, res) => {
  try {
    // Check if user has an products array added already
    const { _id } = req.user;
    const { name, price, description, ingredent, image } = req.body;

    await Product.create({
      owner: _id,
      name,
      price,
      description,
      ingredent,
      image,
    });

    return res.status(200).json({
      status: "SUCCESS",
      message: "Product addded successfully",
    });
  } catch (error) {
    res.status(400).json({ status: "FAILED", message: "Request failed" });
  }
};

// UPDATE A PRODUCT IN LISTING
module.exports.updateProduct = async (req, res) => {
  const { name, price, description, ingredent, image } = req.body;
  const { _id } = req.user;
  const filter = { _id: req.params.id, owner: _id };

  try {
    const updated = await Product.findOneAndUpdate(
      filter,
      { name, price, description, ingredent, image },
      { new: true }
    );
    res.status(200).json({
      updated,
    });
  } catch {
    res.status(400).json({
      status: "FAILED",
      message: "Manager is not the owner of product!",
    });
  }
};

// GETTING / FETCHING ALL MANAGER'S PRODUCTS
module.exports.getProducts = async (req, res) => {
  try {
    const { _id } = req.user;
    const products = await Product.find({ owner: _id });
    return res.status(200).json({
      status: "SUCCESS",
      message: "Products was fetched successfully",
      products,
    });
  } catch (err) {
    res.status(400).json({ status: "FAILED", message: "Request failed" });
  }
};

// FETCHING A SINGLE PRODUCT FOR LISTING
module.exports.getProduct = async (req, res) => {
  // Check for user products array
  const { _id } = req.user;
  const itemId = req.params.id;
  Product.findOne({ owner: _id, _id: itemId })
    .then((doc) => {
      return res.status(200).json(doc.lenth > 0 ? "" : doc);
    })
    .catch((err) => {
      res.status(400).json({ error: "Product is not for user", err });
    });
};

// DELETING A PRODUCT
module.exports.removeProduct = async (req, res) => {
  const { _id } = req.user;
  const filter = { _id: req.params.id, owner: _id };
  try {
    await Product.deleteOne(filter);
    res.status(200).json({ status: "SUCCESS" });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: "Not allowed",
      error,
    });
  }
};

module.exports.getOrders = async (req, res) => {
  try {
    const orders = await Orders.find().populate("user items");
    if (orders) {
      return res.status(200).json(orders);
    } else {
      return res.status(401).json({ messg: "No Orders made!" });
    }
  } catch (error) {
    res.status(400).json({ messg: "An error occured!" });
  }
};