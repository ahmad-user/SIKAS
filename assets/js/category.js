// Category Modal Functions
let editingCategory = null;

function openCategoryModal(type, categoryName = '') {
    editingCategory = type === 'edit' ? categoryName : null;
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const input = document.getElementById('categoryNameInput');

    modalTitle.textContent = type === 'add' ? 'Tambah Kategori' : 'Edit Kategori';
    input.value = categoryName;
    modal.classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    document.getElementById('categoryNameInput').value = '';
    editingCategory = null;
}

function saveCategory() {
    const input = document.getElementById('categoryNameInput');
    const name = input.value.trim();

    if (!name) {
        alert('Nama kategori tidak boleh kosong!');
        return;
    }

    if (editingCategory) {
        // Edit mode: update the table row
        const rows = document.querySelectorAll('#categoryTableBody tr');
        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells[1].textContent === editingCategory) {
                cells[1].textContent = name;
                // Update the buttons' onclick
                const buttons = cells[3].querySelectorAll('button');
                buttons[0].setAttribute('onclick', `openCategoryModal('edit', '${name}')`);
                buttons[1].setAttribute('onclick', `deleteCategory('${name}')`);
                break;
            }
        }
    } else {
        // Add mode: append new row
        const tbody = document.getElementById('categoryTableBody');
        const rowCount = tbody.rows.length + 1;
        const newRow = `
            <tr class="border-t">
                <td class="px-6 py-4">${rowCount}</td>
                <td class="px-6 py-4">${name}</td>
                <td class="px-6 py-4">Deskripsi ${name.toLowerCase()}</td>
                <td class="px-6 py-4">
                    <button onclick="openCategoryModal('edit', '${name}')" class="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onclick="deleteCategory('${name}')" class="text-red-600 hover:text-red-800">Delete</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', newRow);
    }

    closeCategoryModal();
}

function deleteCategory(name) {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
        const rows = document.querySelectorAll('#categoryTableBody tr');
        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells[1].textContent === name) {
                row.remove();
                break;
            }
        }
        // Update IDs after deletion
        updateRowIds();
    }
}

function updateRowIds() {
    const tbody = document.getElementById('categoryTableBody');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.querySelector('td').textContent = index + 1;
    });
}
