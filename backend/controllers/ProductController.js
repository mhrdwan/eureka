import Product from "../models/ProductModels.js";
import path from "path";
import fs from "fs";

export const getProduct = async (req, res) => {
  try {
    const response = await Product.findAll();
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const getProductById = async (req, res) => {
  try {
    const response = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
};
export const saveProduct = (req, res) => {
  if (req.files === null)
    return res.status(400).json({ msg: "tidak ada file yang di upload" });
  const name = req.body.title;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext)) {
    return res.status(400).json({ msg: "file yang di upload tidak didukung" });
  }
  if (fileSize > 1000000)
    return res.status(400).json({ msg: "file terlalu besar" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      await Product.create({ name: name, image: fileName, url: url });
      res.status(201).json({ msg: "Product Create Successful" });
    } catch (error) {
      console.log(error.message);
    }
  });
};
export const updateProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!product) return res.status(404).json({ msg: "no data found" });
  let fileName = "";
  if (req.files === null) {
    fileName = Product.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext)) {
      return res
        .status(400)
        .json({ msg: "file yang di upload tidak didukung" });
    }
    if (fileSize > 1000000)
      return res.status(400).json({ msg: "file terlalu besar" });

    const filepath = `./public/images/${product.image}`;
    fs.unlinkSync(filepath);

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }

  const name = req.body.title;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  try {
    await Product.update({ name: name, image: fileName, url: url }),
      {
        where: {
          id: req.params.id,
        },
      };
    res.status(200).json({ msg: "product updated successfully" });
  } catch (error) {
    console.log(error.message);
  }
};
export const deleteProduct = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!product) return res.status(404).json({ msg: "no data found" });
  try {
    const filepath = `./public/images/${product.image}`;
    fs.unlinkSync(filepath);
    await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "berhasil di hapush" });
  } catch (error) {
    console.log(error.message);
  }
};
