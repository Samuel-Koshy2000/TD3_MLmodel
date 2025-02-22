// Synchronous Mirroring Example
const fs = require('fs');

// Primary Database
let primaryDB = {
    products: [
        { id: 1, name: 'Laptop', price: 1000 },
        { id: 2, name: 'Smartphone', price: 500 },
    ],
};

// Mirror Database
let mirrorDB = {
    products: [],
};

// Function to synchronize data between primary and mirror
function syncData() {
    mirrorDB.products = JSON.parse(JSON.stringify(primaryDB.products)); // Deep copy
    console.log('Data synchronized:', mirrorDB.products);
}

// Simulate a write operation
function addProduct(name, price) {
    const newProduct = { id: primaryDB.products.length + 1, name, price };
    primaryDB.products.push(newProduct);
    syncData(); // Ensure data is mirrored immediately
}

// Example usage
addProduct('Headphones', 150);
addProduct('Tablet', 300);