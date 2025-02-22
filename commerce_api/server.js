const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware should come first
app.use(express.json());  // Parses incoming JSON requests
app.use(cors());  

// Now define routes below

// In-memory database
let products = [
    { id: 1, name: 'Laptop', description: 'A high-performance laptop', price: 1000, category: 'Electronics', stock: true },
    { id: 2, name: 'Smartphone', description: 'A sleek smartphone', price: 500, category: 'Electronics', stock: true },
];

let orders = [];
let carts = {};

// DNS Registry Route
app.get('/getServer', (req, res) => {
    res.json({ code: 200, server: `http://localhost:${PORT}` });
});

// Hello World Route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Products Routes
// GET /products
app.get('/products', (req, res) => {
    const { category, inStock } = req.query;
    let filteredProducts = products;

    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (inStock === 'true') {
        filteredProducts = filteredProducts.filter(p => p.stock);
    }

    res.json(filteredProducts);
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});


app.post('/products', (req, res) => {
    // Log the request body to debug
    console.log("Request Body:", req.body);

    // Validate incoming request body
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || price == null || !category || stock === undefined) {
        return res.status(400).json({ error: 'All fields (name, description, price, category, stock) are required.' });
    }

    // Ensure stock is a boolean
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name,
        description,
        price: parseFloat(price), // Ensure price is a number
        category,
        stock: stock === true, // Explicit boolean check
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
});


// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
});

// Orders Routes
// POST /orders
app.post('/orders', (req, res) => {
    const { userId, products } = req.body;

    // Validate the input
    if (!userId || typeof userId !== 'number' || !products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Invalid input. Please provide a valid userId (number) and a non-empty products array.' });
    }

    // Validate each product in the array
    for (const product of products) {
        if (
            !product.id ||
            typeof product.id !== 'number' ||
            typeof product.price !== 'number' ||
            typeof product.quantity !== 'number' ||
            product.quantity <= 0
        ) {
            return res.status(400).json({ error: 'Each product must have a valid id (number), price (number), and quantity (number > 0).' });
        }
    }

    // Calculate the total price
    const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create the new order
    const newOrder = {
        id: orders.length + 1,
        userId: parseInt(userId),
        products: products.map(item => ({ id: item.id, quantity: item.quantity })), // Simplify product details
        total: totalPrice,
        status: 'Pending',
    };

    // Add the order to the database
    orders.push(newOrder);

    // Respond with the created order
    res.status(201).json(newOrder);
});

// GET /orders/:userId
app.get('/orders/:userId', (req, res) => {
    const userOrders = orders.filter(order => order.userId === parseInt(req.params.userId));
    res.json(userOrders);
});

// Start the server
app.listen(PORT, () => {
    console.log(`E-commerce API running on http://localhost:${PORT}`);
});
