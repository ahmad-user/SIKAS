// Stock Management System
let stockData = JSON.parse(localStorage.getItem('stockData')) || [
    {
        productCode: 'P001',
        lastStock: 150,
        lastUpdate: '2025-01-09 10:30:00'
    },
    {
        productCode: 'P002',
        lastStock: 80,
        lastUpdate: '2025-01-09 09:15:00'
    },
    {
        productCode: 'P003',
        lastStock: 200,
        lastUpdate: '2025-01-09 08:00:00'
    }
];

// Sample data initialization
if (stockData.length === 0) {
    stockData = [
        {
            productCode: 'P001',
            lastStock: 50,
            lastUpdate: '2025-01-09 10:30:00'
        },
        {
            productCode: 'P002',
            lastStock: 8,
            lastUpdate: '2025-01-09 09:15:00'
        },
        {
            productCode: 'P003',
            lastStock: 200,
            lastUpdate: '2025-01-09 08:00:00'
        }
    ];
    localStorage.setItem('stockData', JSON.stringify(stockData));
}

// Load and display stock data
function loadStock() {
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    // Need to import or access products from products.js
    // This requires loading the product data
    const products = JSON.parse(localStorage.getItem('products')) || [];

    stockData.forEach(stock => {
        const product = products.find(p => p.code === stock.productCode);
        if (!product) return; // Skip if product not found

        const stockStatus = getStockStatus(stock.lastStock);
        const statusClass = getStatusClass(stockStatus);

        const newRow = `
            <tr class="border-t">
                <td class="px-6 py-4">${product.name}</td>
                <td class="px-6 py-4">${stock.lastStock}</td>
                <td class="px-6 py-4">${stock.lastUpdate}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 ${statusClass} rounded text-xs">${stockStatus}</span>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow);
    });
}

// Get stock status based on quantity
function getStockStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'Available';
}

// Get status class based on status
function getStatusClass(status) {
    switch (status) {
        case 'Available':
            return 'bg-green-100 text-green-800';
        case 'Low Stock':
            return 'bg-yellow-100 text-yellow-800';
        case 'Out of Stock':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Filter stock based on search and category
function filterStock() {
    const searchText = document.getElementById('searchStockInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryStockFilter').value;

    const tbody = document.getElementById('stockTableBody');
    const rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return; // Skip if no cells

        const productName = cells[0].textContent.toLowerCase();

        // Find category by product name/code
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.name.toLowerCase() === productName ||
                                         p.name.toLowerCase().includes(productName));
        const category = product ? product.category : '';

        // Check search filter
        const matchesSearch = productName.includes(searchText);

        // Check category filter
        const matchesCategory = !categoryFilter || category === categoryFilter;

        // Show/hide row
        if (matchesSearch && matchesCategory) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Show message if no results
    if (visibleCount === 0) {
        if (!tbody.querySelector('.no-results')) {
            const noResultsRow = `
                <tr class="no-results border-t">
                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                        No products found matching the current filters
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', noResultsRow);
        }
    } else {
        const noResultsRow = tbody.querySelector('.no-results');
        if (noResultsRow) {
            noResultsRow.remove();
        }
    }
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchStockInput').value = '';
    document.getElementById('categoryStockFilter').value = '';
    filterStock();
}

// Update stock data (for future use when products are updated)
function updateStock(productCode, newStock) {
    const stockIndex = stockData.findIndex(s => s.productCode === productCode);
    if (stockIndex !== -1) {
        stockData[stockIndex].lastStock = newStock;
        stockData[stockIndex].lastUpdate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        localStorage.setItem('stockData', JSON.stringify(stockData));
        loadStock(); // Refresh the table
    }
}
