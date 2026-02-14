// Point of Sale (POS) System
let cart = [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [
    {
        id: 1,
        transactionNumber: 'TRX-0001',
        date: '2025-02-10',
        total: 152000,
        items: [
            { productCode: 'P001', name: 'Coca Cola 330ml', price: 5000, qty: 5 },
            { productCode: 'P002', name: 'Indomie Goreng', price: 3500, qty: 1 }
        ]
    },
    {
        id: 2,
        transactionNumber: 'TRX-0002',
        date: '2025-02-11',
        total: 78000,
        items: [
            { productCode: 'P002', name: 'Indomie Goreng', price: 3500, qty: 3 },
            { productCode: 'P003', name: 'Aqua 600ml', price: 4000, qty: 12 }
        ]
    }
];

let nextTransactionId = Math.max(...transactions.map(t => t.id), 0) + 1;

// Initialize POS on page load
function initializePOS() {
    loadTransactions();
    updateCartDisplay();
    calculateTotals();
}

// Handle barcode input keypress (Enter to add)
function handleBarcodeKeyPress(event) {
    if (event.key === 'Enter') {
        addToCart();
    }
}

// Add product to cart by barcode/code
function addToCart() {
    const barcodeInput = document.getElementById('barcodeInput');
    const code = barcodeInput.value.trim().toUpperCase();

    if (!code) {
        alert('Please enter a product code or barcode!');
        return;
    }

    // Find product by code or barcode
    const products = JSON.parse(localStorage.getItem('products')) || [];

    // First try to match by product code
    let product = products.find(p => p.code === code);

    // If not found, try to match by barcode
    if (!product) {
        product = products.find(p => p.barcode === code);
    }

    if (!product) {
        alert('Product not found! Please check the code/barcode.');
        barcodeInput.focus();
        barcodeInput.select();
        return;
    }

    // Check stock availability
    const stockData = JSON.parse(localStorage.getItem('stockData')) || [];
    const productStock = stockData.find(s => s.productCode === product.code);
    const availableStock = productStock ? productStock.lastStock : product.qty;

    if (availableStock <= 0) {
        alert('This product is out of stock!');
        barcodeInput.value = '';
        return;
    }

    // Check if product is already in cart
    const existingItem = cart.find(item => item.productCode === product.code);

    if (existingItem) {
        // Increase quantity if already in cart
        const newQty = existingItem.qty + 1;

        // Check if new quantity exceeds available stock
        if (newQty > availableStock) {
            alert(`Cannot add more items. Only ${availableStock} available in stock.`);
            return;
        }

        existingItem.qty = newQty;
        existingItem.subtotal = existingItem.price * newQty;
    } else {
        // Add new item to cart
        cart.push({
            productCode: product.code,
            name: product.name,
            price: product.price,
            qty: 1,
            subtotal: product.price
        });
    }

    // Clear input and update display
    barcodeInput.value = '';
    updateCartDisplay();
    calculateTotals();

    // Play success sound or visual feedback
    barcodeInput.focus();
}

// Update cart display
function updateCartDisplay() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';

    if (cart.length === 0) {
        const emptyRow = `
            <tr class="border-t">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    Cart is empty. Scan a barcode or enter a product code to add items.
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', emptyRow);
        return;
    }

    cart.forEach((item, index) => {
        const row = `
            <tr class="border-t">
                <td class="px-6 py-4">${item.name}</td>
                <td class="px-6 py-4">Rp ${item.price.toLocaleString('id-ID')}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <button onclick="decreaseQty(${index})" class="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300">-</button>
                        <span class="px-3 py-1 bg-white border-t border-b">${item.qty}</span>
                        <button onclick="increaseQty(${index})" class="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300">+</button>
                    </div>
                </td>
                <td class="px-6 py-4">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                <td class="px-6 py-4">
                    <button onclick="removeFromCart(${index})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Remove</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// Increase quantity
function increaseQty(index) {
    const item = cart[index];
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.code === item.productCode);
    const stockData = JSON.parse(localStorage.getItem('stockData')) || [];
    const productStock = stockData.find(s => s.productCode === item.productCode);
    const availableStock = productStock ? productStock.lastStock : product.qty;

    if (item.qty + 1 > availableStock) {
        alert(`Cannot add more items. Only ${availableStock} available in stock.`);
        return;
    }

    item.qty += 1;
    item.subtotal = item.price * item.qty;
    updateCartDisplay();
    calculateTotals();
}

// Decrease quantity
function decreaseQty(index) {
    const item = cart[index];
    if (item.qty > 1) {
        item.qty -= 1;
        item.subtotal = item.price * item.qty;
        updateCartDisplay();
        calculateTotals();
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    calculateTotals();
}

// Clear entire cart
function clearCart() {
    if (cart.length > 0 && confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCartDisplay();
        calculateTotals();
        document.getElementById('paymentAmount').value = '';
        document.getElementById('changeAmount').textContent = 'Rp 0';
    }
}

// Calculate totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    document.getElementById('subtotalAmount').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('taxAmount').textContent = `Rp ${tax.toLocaleString('id-ID')}`;
    document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString('id-ID')}`;

    return { subtotal, tax, total };
}

// Calculate change
function calculateChange() {
    const paymentInput = document.getElementById('paymentAmount');
    const paymentAmount = parseFloat(paymentInput.value) || 0;
    const totals = calculateTotals();
    const change = paymentAmount - totals.total;

    document.getElementById('changeAmount').textContent = change >= 0 ? `Rp ${change.toLocaleString('id-ID')}` : 'Rp 0';
}

// Process payment
function processPayment() {
    if (cart.length === 0) {
        alert('Cart is empty! Please add items first.');
        return;
    }

    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const totals = calculateTotals();

    if (paymentAmount < totals.total) {
        alert('Payment amount is insufficient!');
        return;
    }

    // Generate transaction number
    const transactionNumber = `TRX-${String(nextTransactionId).padStart(4, '0')}`;

    // Create transaction record
    const transaction = {
        id: nextTransactionId++,
        transactionNumber: transactionNumber,
        date: new Date().toISOString().split('T')[0],
        total: totals.total,
        payment: paymentAmount,
        change: paymentAmount - totals.total,
        items: [...cart] // Copy cart items
    };

    // Save transaction
    transactions.unshift(transaction); // Add to beginning
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update stock
    updateStockAfterSale();

    // Clear cart and reset UI
    cart = [];
    updateCartDisplay();
    calculateTotals();

    document.getElementById('paymentAmount').value = '';
    document.getElementById('changeAmount').textContent = 'Rp 0';

    // Refresh transaction history
    loadTransactions();

    // Show success message
    alert(`Payment successful!\nTransaction: ${transactionNumber}\nTotal: Rp ${totals.total.toLocaleString('id-ID')}\nChange: Rp ${(paymentAmount - totals.total).toLocaleString('id-ID')}`);
}

// Update stock after sale
function updateStockAfterSale() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const stockData = JSON.parse(localStorage.getItem('stockData')) || [];

    cart.forEach(cartItem => {
        // Update product stock
        const productIndex = products.findIndex(p => p.code === cartItem.productCode);
        if (productIndex !== -1) {
            products[productIndex].qty -= cartItem.qty;
            if (products[productIndex].qty < 0) products[productIndex].qty = 0;
        }

        // Update stock tracking data
        const stockIndex = stockData.findIndex(s => s.productCode === cartItem.productCode);
        if (stockIndex !== -1) {
            stockData[stockIndex].lastStock -= cartItem.qty;
            stockData[stockIndex].lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
    });

    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('stockData', JSON.stringify(stockData));
}

// Load transaction history
function loadTransactions() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        const emptyRow = `
            <tr>
                <td colspan="5" class="p-8 text-center text-gray-500">
                    No transactions found
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', emptyRow);
        return;
    }

    transactions.forEach((transaction, index) => {
        const row = `
            <tr>
                <td class="p-3 border">${index + 1}</td>
                <td class="p-3 border">${transaction.transactionNumber}</td>
                <td class="p-3 border">${transaction.date}</td>
                <td class="p-3 border">Rp ${transaction.total.toLocaleString('id-ID')}</td>
                <td class="p-3 border">
                    <button onclick="viewTransaction(${transaction.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">View</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// Filter transactions
function filterTransactions() {
    const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();

    if (!searchTerm) {
        loadTransactions();
        return;
    }

    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    let visibleCount = 0;
    transactions.forEach((transaction, index) => {
        if (transaction.transactionNumber.toLowerCase().includes(searchTerm) ||
            transaction.date.includes(searchTerm) ||
            transaction.total.toString().includes(searchTerm)) {

            const row = `
                <tr>
                    <td class="p-3 border">${index + 1}</td>
                    <td class="p-3 border">${transaction.transactionNumber}</td>
                    <td class="p-3 border">${transaction.date}</td>
                    <td class="p-3 border">Rp ${transaction.total.toLocaleString('id-ID')}</td>
                    <td class="p-3 border">
                        <button onclick="viewTransaction(${transaction.id})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">View</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
            visibleCount++;
        }
    });

    if (visibleCount === 0) {
        const noResultsRow = `
            <tr>
                <td colspan="5" class="p-8 text-center text-gray-500">
                    No transactions match your search
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', noResultsRow);
    }
}

// View transaction details
function viewTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    let detailsHtml = `<h3 class="text-lg font-bold mb-4">Transaction ${transaction.transactionNumber}</h3>`;
    detailsHtml += `<p class="mb-2"><strong>Date:</strong> ${transaction.date}</p>`;
    detailsHtml += `<p class="mb-4"><strong>Total:</strong> Rp ${transaction.total.toLocaleString('id-ID')}</p>`;

    detailsHtml += `<h4 class="font-bold mb-2">Items:</h4>`;
    detailsHtml += `<table class="w-full border-collapse border mb-4">`;
    detailsHtml += `<thead><tr><th class="border p-2">Product</th><th class="border p-2">Price</th><th class="border p-2">Qty</th><th class="border p-2">Subtotal</th></tr></thead>`;
    detailsHtml += `<tbody>`;

    transaction.items.forEach(item => {
        detailsHtml += `<tr>
            <td class="border p-2">${item.name}</td>
            <td class="border p-2">Rp ${item.price.toLocaleString('id-ID')}</td>
            <td class="border p-2">${item.qty}</td>
            <td class="border p-2">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</td>
        </tr>`;
    });

    detailsHtml += `</tbody></table>`;

    // Create modal popup
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            ${detailsHtml}
            <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
}
