(() => {
const $ = (selector, root = document) => root.querySelector(selector);

const storageKey = 'uniprocur.suppliers';
const defaultSuppliers = [
  { id: 'supplier-1', name: 'ABC Trading Co.', contact: 'Angela Cruz', email: 'angela@abctrading.com', phone: '+63 2 8123 4567', address: 'Manila' },
  { id: 'supplier-2', name: 'Global Supplies Inc.', contact: 'Robert Lim', email: 'robert@globalsupplies.com', phone: '+63 2 8234 5678', address: 'Quezon City' },
  { id: 'supplier-3', name: 'Tech Solutions Ltd.', contact: 'Karen Tan', email: 'karen@techsolutions.com', phone: '+63 2 8345 6789', address: 'Makati City' },
  { id: 'supplier-4', name: 'Prime Industrial Corp.', contact: 'Miguel Reyes', email: 'miguel@primeindustrial.com', phone: '+63 2 8456 7890', address: 'Pasig City' },
  { id: 'supplier-5', name: 'Metro Office Supplies', contact: 'Liza Santos', email: 'liza@metrooffice.com', phone: '+63 2 8567 8901', address: 'Manila' },
  { id: 'supplier-6', name: 'Pacific Hardware', contact: 'John Dela Cruz', email: 'john@pacifichardware.com', phone: '+63 2 8678 9012', address: 'Cebu City' }
];
let suppliers;
let toastTimer;

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function loadSuppliers() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      localStorage.setItem(storageKey, JSON.stringify(defaultSuppliers));
      return [...defaultSuppliers];
    }

    const parsed = JSON.parse(stored);
    const fields = ['id', 'name', 'contact', 'email', 'phone', 'address'];
    if (!Array.isArray(parsed) || parsed.some(supplier =>
      !supplier || fields.some(field => typeof supplier[field] !== 'string')
    )) {
      throw new Error('Saved supplier data has an invalid format.');
    }
    return parsed;
  } catch (error) {
    showToast(`Could not load saved suppliers: ${error.message}`);
    return [...defaultSuppliers];
  }
}

function renderSuppliers() {
  const query = $('#supplierSearch').value.trim().toLocaleLowerCase();
  const filtered = suppliers.filter(supplier =>
    [supplier.name, supplier.contact, supplier.email, supplier.phone, supplier.address]
      .some(value => (value || '').toLocaleLowerCase().includes(query))
  );
  const rows = $('#supplierRows');
  rows.replaceChildren();

  filtered.forEach(supplier => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const name = document.createElement('div');
    name.textContent = supplier.name;
    nameCell.append(name);
    if (supplier.address) {
      const address = document.createElement('small');
      address.className = 'supplier-address';
      address.textContent = supplier.address;
      nameCell.append(address);
    }

    const contactCell = document.createElement('td');
    contactCell.textContent = supplier.contact || '—';
    const emailCell = document.createElement('td');
    emailCell.textContent = supplier.email || '—';
    const phoneCell = document.createElement('td');
    phoneCell.textContent = supplier.phone || '—';
    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'supplier-actions';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'edit-btn';
    editButton.dataset.editSupplier = supplier.id;
    editButton.textContent = 'Edit';
    editButton.setAttribute('aria-label', `Edit ${supplier.name}`);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.dataset.deleteSupplier = supplier.id;
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${supplier.name}`);

    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(nameCell, contactCell, emailCell, phoneCell, actionsCell);
    rows.append(row);
  });

  $('#supplierSummary').textContent = `${suppliers.length} supplier${suppliers.length === 1 ? '' : 's'}`;
  const emptyState = $('#supplierEmptyState');
  emptyState.hidden = filtered.length !== 0;
  emptyState.textContent = suppliers.length === 0
    ? 'No suppliers yet. Select “Add Supplier” to create one.'
    : 'No suppliers match your search. Try a different name or contact detail.';
}

function saveSupplierList(nextSuppliers, successMessage) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextSuppliers));
  } catch (error) {
    showToast(`Could not save supplier changes: ${error.message}`);
    return false;
  }
  suppliers = nextSuppliers;
  renderSuppliers();
  showToast(successMessage);
  return true;
}

function openSupplierModal(supplier = null) {
  $('#supplierForm').reset();
  $('#supplierName').setCustomValidity('');
  $('#supplierId').value = supplier ? supplier.id : '';
  $('#supplierModalTitle').textContent = supplier ? 'Edit Supplier' : 'Add Supplier';
  $('#saveSupplier').textContent = supplier ? 'Save Changes' : 'Save Supplier';
  $('#supplierName').value = supplier ? supplier.name : '';
  $('#supplierContact').value = supplier ? supplier.contact : '';
  $('#supplierEmail').value = supplier ? supplier.email : '';
  $('#supplierPhone').value = supplier ? supplier.phone : '';
  $('#supplierAddress').value = supplier ? supplier.address : '';
  $('#supplierModal').hidden = false;
  $('#supplierName').focus();
}

function closeSupplierModal() {
  $('#supplierModal').hidden = true;
}

function createSupplierId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return `supplier-${window.crypto.randomUUID()}`;
  }
  return `supplier-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

suppliers = loadSuppliers();
renderSuppliers();

$('#supplierSearch').addEventListener('input', renderSuppliers);
$('#supplierName').addEventListener('input', () => $('#supplierName').setCustomValidity(''));
$('#addSupplier').addEventListener('click', () => openSupplierModal());
$('#closeSupplierModal').addEventListener('click', closeSupplierModal);
$('#cancelSupplierModal').addEventListener('click', closeSupplierModal);
$('#supplierModal').addEventListener('click', event => {
  if (event.target === $('#supplierModal')) closeSupplierModal();
});

$('#supplierForm').addEventListener('submit', event => {
  event.preventDefault();
  const id = $('#supplierId').value;
  const supplier = {
    id: id || createSupplierId(),
    name: $('#supplierName').value.trim(),
    contact: $('#supplierContact').value.trim(),
    email: $('#supplierEmail').value.trim(),
    phone: $('#supplierPhone').value.trim(),
    address: $('#supplierAddress').value.trim()
  };
  if (!supplier.name) {
    $('#supplierName').setCustomValidity('Enter a supplier name.');
    $('#supplierName').reportValidity();
    return;
  }
  $('#supplierName').setCustomValidity('');

  const existingIndex = suppliers.findIndex(item => item.id === id);
  if (id && existingIndex === -1) {
    showToast('This supplier could not be found. Refresh the list and try again.');
    closeSupplierModal();
    return;
  }
  const nextSuppliers = [...suppliers];
  if (existingIndex === -1) nextSuppliers.unshift(supplier);
  else nextSuppliers[existingIndex] = supplier;

  if (saveSupplierList(nextSuppliers, id ? 'Supplier updated.' : 'Supplier added.')) {
    closeSupplierModal();
  }
});

$('#supplierRows').addEventListener('click', event => {
  const editButton = event.target.closest('[data-edit-supplier]');
  if (editButton) {
    const supplier = suppliers.find(item => item.id === editButton.dataset.editSupplier);
    if (!supplier) {
      showToast('This supplier could not be found. Refresh the list and try again.');
      return;
    }
    openSupplierModal(supplier);
    return;
  }

  const deleteButton = event.target.closest('[data-delete-supplier]');
  if (!deleteButton) return;
  const supplier = suppliers.find(item => item.id === deleteButton.dataset.deleteSupplier);
  if (!supplier) {
    showToast('This supplier could not be found. Refresh the list and try again.');
    return;
  }
  if (!window.confirm(`Delete ${supplier.name}? This action cannot be undone.`)) return;
  saveSupplierList(
    suppliers.filter(item => item.id !== supplier.id),
    `${supplier.name} deleted.`
  );
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#supplierModal').hidden) closeSupplierModal();
});
})();
