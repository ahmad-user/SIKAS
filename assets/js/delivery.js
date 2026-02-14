// Product Delivery Management System
let deliveries = JSON.parse(localStorage.getItem('deliveries')) || [
    {
        id: 1,
        productCode: 'P001',
        quantity: 100,
        supplier: 'PT. Coca Cola Indonesia',
        date: '2025-01-09'
    },
    {
        id: 2,
        productCode: 'P002',
        quantity: 200,
        supplier: 'PT. Indofood',
        date: '2025-01-08'
    }
];

// Initialize next delivery ID
let nextDeliveryId = Math.max(...deliveries.map(d => d.id), 0) + 1;

// Save deliveries to localStorage
function saveDeliveries() {
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
}

// Populate product select dropdown
function populateDeliveryProductSelect() {
    const select = document.getElementById('deliveryProductSelect');
    if (!select) return; // Not on delivery page

    const products = JSON.parse(localStorage.getItem('products')) || [];

    select.innerHTML = '<option value="">Pilih Produk</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.code;
        option.textContent = `${product.name} (${product.code})`;
        select.appendChild(option);
    });
}

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('deliveryDateInput');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// Submit delivery form
function submitDelivery() {
    const productCode = document.getElementById('deliveryProductSelect').value;
    const quantity = parseInt(document.getElementById('deliveryQuantityInput').value);
    const supplier = document.getElementById('deliverySupplierInput').value.trim();
    const date = document.getElementById('deliveryDateInput').value;

    // Validation
    if (!productCode) {
        alert('Pilih produk terlebih dahulu!');
        return;
    }

    if (!quantity || quantity < 1) {
        alert('Masukkan quantity yang valid!');
        return;
    }

    if (!supplier) {
        alert('Masukkan nama supplier!');
        return;
    }

    if (!date) {
        alert('Masukkan tanggal!');
        return;
    }

    // Create delivery record
    const delivery = {
        id: nextDeliveryId++,
        productCode,
        quantity,
        supplier,
        date
    };

    // Add to deliveries array
    deliveries.unshift(delivery); // Add to beginning for chronological order

    // Save to localStorage
    saveDeliveries();

    // Update stock
    updateStockAfterDelivery(productCode, quantity);

    // Clear form
    clearDeliveryForm();

    // Refresh display
    loadDeliveries();

    // Show success message
    alert('Barang masuk berhasil dicatat!');
}

// Clear delivery form
function clearDeliveryForm() {
    document.getElementById('deliveryProductSelect').value = '';
    document.getElementById('deliveryQuantityInput').value = '';
    document.getElementById('deliverySupplierInput').value = '';
    setDefaultDate();
}

// Update stock after delivery
function updateStockAfterDelivery(productCode, addedQuantity) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productIndex = products.findIndex(p => p.code === productCode);

    if (productIndex !== -1) {
        // Update product quantity
        products[productIndex].qty += addedQuantity;
        localStorage.setItem('products', JSON.stringify(products));

        // Update stock data
        const stockData = JSON.parse(localStorage.getItem('stockData')) || [];
        const stockIndex = stockData.findIndex(s => s.productCode === productCode);

        if (stockIndex !== -1) {
            stockData[stockIndex].lastStock = products[productIndex].qty;
            stockData[stockIndex].lastUpdate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        } else {
            // Add new stock record if doesn't exist
            stockData.push({
                productCode: productCode,
                lastStock: products[productIndex].qty,
                lastUpdate: new Date().toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        localStorage.setItem('stockData', JSON.stringify(stockData));
    }
}

// Load and display deliveries
function loadDeliveries() {
    const tbody = document.getElementById('deliveryTableBody');
    if (!tbody) return; // Not on delivery page

    tbody.innerHTML = '';
    const products = JSON.parse(localStorage.getItem('products')) || [];

    deliveries.forEach(delivery => {
        const product = products.find(p => p.code === delivery.productCode);
        const productName = product ? product.name : 'Unknown Product';

        const newRow = `
            <tr class="border-t">
                <td class="px-6 py-4">${delivery.date}</td>
                <td class="px-6 py-4">${productName}</td>
                <td class="px-6 py-4">${delivery.quantity}</td>
                <td class="px-6 py-4">${delivery.supplier}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow);
    });

    // Populate product select if on delivery page
    populateDeliveryProductSelect();

    // Set default date
    setDefaultDate();
}

// Initialize sample data if empty
if (deliveries.length === 0) {
    saveDeliveries();
}
