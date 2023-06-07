const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({ include: [{ model: Category }, { model: Tag, through: ProductTag }] });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, { include: [{ model: Category }, { model: Tag, through: ProductTag }] });
    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const { product_name, price, stock, category_id } = req.body;
    const newProduct = await Product.create({
      product_name,
      price,
      stock,
      category_id
    });
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// update product
router.put('/:id', (req, res) => {
  if (req.body.tagIds) {
    Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        return ProductTag.findAll({ where: { product_id: req.params.id } });     
      })
      .then((productTags) => {
        const productTagIds = productTags.map(({ tag_id }) => tag_id);
        console.log(productTagIds);
        const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
        const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

        return Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
      })
      .then((updatedProductTags) => res.json(updatedProductTags))
      .catch((err) => {
        console.log("Error:", err);
        res.status(400).json(err);
      });
  } else {
    // Handle the update without the tagIds property
    Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    })
      .then(() => {
        res.json({ message: 'Product updated successfully' });
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(400).json(err);
      });
  }
});

// Delete a product by id
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deletedProduct) {
      res.status(404).json({ message: 'No product found with that id!' });
      return;
    }
    res.status(200).json({message: 'Deleted product successfully'});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
