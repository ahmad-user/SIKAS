// Product Management with localStorage
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        code: 'P001',
        name: 'Coca Cola 330ml',
        category: 'Minuman',
        price: 5000,
        barcode: '8992761111111',
        qty: 150
    },
    {
        code: 'P002',
        name: 'Indomie Goreng',
        category: 'Makanan',
        price: 3500,
        barcode: '8992761222222',
        qty: 80
    },
    {
        code: 'P003',
        name: 'Aqua 600ml',
        category: 'Minuman',
        price: 4000,
        barcode: '8992761333333',
        qty: 200
    }
];

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Load products and populate table
function loadProducts() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return; // Not on products page
    
    tbody.innerHTML = '';
    products.forEach(product => {
        const newRow = `
            <tr class="border-t" data-code="${product.code}">
                <td class="px-6 py-4">${product.code}</td>
                <td class="px-6 py-4">${product.name}</td>
                <td class="px-6 py-4">${product.category}</td>
                <td class="px-6 py-4">Rp ${product.price.toLocaleString('id-ID')}</td>
                <td class="px-6 py-4">${product.barcode}</td>
                <td class="px-6 py-4">${product.qty}</td>
                <td class="px-6 py-4">
                    <button onclick="openProductModal('edit', '${product.code}')" class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button onclick="generateBarcode('${product.code}')" class="text-green-600 hover:text-green-800 mr-2">Barcode</button>
                    <button onclick="deleteProduct('${product.code}')" class="text-red-600 hover:text-red-800">Delete</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow);
    });
}

// Product Modal Functions
let editingProductCode = null;

function openProductModal(type, productCode = null) {
    editingProductCode = type === 'edit' ? productCode : null;
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('productModalTitle');
    const form = document.forms[0] || document.querySelector('#productModal form'); // or just clear inputs

    modalTitle.textContent = type === 'add' ? 'Tambah Product' : 'Edit Product';

    if (type === 'edit' && productCode) {
        // Find product data from products array
        const product = products.find(p => p.code === productCode);
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCode').value = product.code;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productBarcode').value = product.barcode;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productQty').value = product.qty;
        }
    } else {
        // Clear form for add
        document.getElementById('productName').value = '';
        document.getElementById('productCode').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productBarcode').value = '';
        document.getElementById('productCategory').value = '';
        document.getElementById('productQty').value = '';
    }

    // Show modal with animation
    modal.classList.remove('hidden');
    const modalContent = modal.querySelector('.opacity-0');
    modalContent.classList.remove('opacity-0', 'scale-75');
    modalContent.classList.add('opacity-100', 'scale-100');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const modalContent = modal.querySelector('[class*="opacity"]');

    // Hide modal with animation
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-75');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);

    editingProductCode = null;
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const code = document.getElementById('productCode').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const barcode = document.getElementById('productBarcode').value.trim();
    const category = document.getElementById('productCategory').value;
    const qty = parseInt(document.getElementById('productQty').value) || 0;

    if (!name || !code || !price || !barcode || !category) {
        alert('Semua field wajib diisi!');
        return;
    }

    // Check for duplicate code (but allow editing same code)
    const existingIndex = editingProductCode ? products.findIndex(p => p.code === editingProductCode) : -1;
    if (!editingProductCode && products.find(p => p.code === code)) {
        alert('Kode produk sudah ada!');
        return;
    }

    if (editingProductCode) {
        // Edit existing product in array
        products[existingIndex] = { code, name, category, price, barcode, qty };
    } else {
        // Add new product to array
        products.push({ code, name, category, price, barcode, qty });
    }

    // Save to localStorage
    saveProducts();

    // Reload table on products page
    loadProducts();

    closeProductModal();
}

function deleteProduct(productCode) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    products = products.filter(p => p.code !== productCode);
    saveProducts();
    loadProducts();
}

// Click outside modal to close
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// Barcode Generation Functions
function generateBarcode(productCode) {
    // Find product data from products array
    const product = products.find(p => p.code === productCode);
    if (!product) {
        alert('Produk tidak ditemukan!');
        return;
    }

    const productName = product.name;
    const barcodeValue = product.barcode;

    // Update modal content
    document.getElementById('barcodeProductName').textContent = productName;
    document.getElementById('barcodeProductCode').textContent = `(${barcodeValue})`;

    // Generate barcode using JsBarcode
    try {
        JsBarcode('#barcodeSvg', barcodeValue, {
            format: 'CODE128',
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 0,
            background: '#ffffff',
            lineColor: '#000000'
        });
    } catch (error) {
        console.error('Barcode generation failed:', error);
        alert('Error generating barcode');
        return;
    }

    // Show modal with animation
    const modal = document.getElementById('barcodeModal');
    modal.classList.remove('hidden');
    const modalContent = modal.querySelector('.opacity-0');
    modalContent.classList.remove('opacity-0', 'scale-75');
    modalContent.classList.add('opacity-100', 'scale-100');
}

function closeBarcodeModal() {
    const modal = document.getElementById('barcodeModal');
    const modalContent = modal.querySelector('[class*="opacity"]');

    // Hide modal with animation
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-75');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Click outside barcode modal to close
document.getElementById('barcodeModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeBarcodeModal();
    }
});

// Bulk Barcode Generation Functions
function populateProductSelect() {
    const select = document.getElementById('generateProductSelect');
    if (!select) return; // Not on barcode page

    // Clear existing options except the default
    select.innerHTML = '<option value="">Pilih Produk</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.code;
        option.textContent = `${product.name} (${product.code})`;
        select.appendChild(option);
    });
}

function generateBulkBarcodes() {
    const selectedProductCode = document.getElementById('generateProductSelect').value;
    const quantity = parseInt(document.getElementById('generateQtyInput').value);

    if (!selectedProductCode) {
        alert('Pilih produk terlebih dahulu!');
        return;
    }

    if (!quantity || quantity < 1) {
        alert('Masukkan quantity yang valid!');
        return;
    }

    // Find product data from products array
    const product = products.find(p => p.code === selectedProductCode);
    if (!product) {
        alert('Produk tidak ditemukan!');
        return;
    }

    const productName = product.name;
    const barcodeValue = product.barcode;

    // Generate multiple barcodes and display in results table
    const tableBody = document.getElementById('generatedBarcodesTableBody');
    tableBody.innerHTML = '';

    for (let i = 1; i <= quantity; i++) {
        const newRow = `
            <tr class="border-t">
                <td class="px-6 py-4">${productName}</td>
                <td class="px-6 py-4">${barcodeValue}</td>
                <td class="px-6 py-4">1</td>
                <td class="px-6 py-4">
                    <button onclick="printBarcode('${barcodeValue}')" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">Print</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', newRow);
    }

    // Add animation effect to the generated rows
    const generatedRows = tableBody.querySelectorAll('tr');
    generatedRows.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('animate-fade-in');
        }, index * 100);
    });
}

function printBarcode(barcodeValue) {
    // Create a print-friendly page
    const printWindow = window.open('', '_blank');
    const selectedProductCode = document.getElementById('generateProductSelect').value;
    const product = products.find(p => p.code === selectedProductCode);
    const productName = product ? product.name : 'Unknown Product';

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Barcode</title></head><body><h2>${productName}</h2><svg id="barcodePrint"></svg><script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script><script>JsBarcode('#barcodePrint', '${barcodeValue}');</script></body></html>`);
    printWindow.document.close();
    printWindow.print();
}

// Initialize data when script loads
if (!localStorage.getItem('products')) {
    saveProducts();
}
