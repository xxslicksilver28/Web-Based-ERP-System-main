const searchForm = document.querySelector('#supportSearch');
const searchInput = document.querySelector('#supportSearchInput');
const faqList = document.querySelector('#supportFaqList');
const emptyState = document.querySelector('#supportFaqEmpty');
const faqItems = [...faqList.querySelectorAll('.support-faq-item')];
const contactForm = document.querySelector('#supportContactForm');
const fileInput = document.querySelector('#supportFileInput');
const dropzone = document.querySelector('#supportDropzone');
const fileFeedback = document.querySelector('#supportFileFeedback');
const attachmentList = document.querySelector('#supportAttachmentList');
const submitStatus = document.querySelector('#supportSubmitStatus');
const ticketDialog = document.querySelector('#supportTicketDialog');
const maxFileSize = 20 * 1024 * 1024;
const allowedExtensions = new Set(['doc', 'docx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png']);
const attachments = [
  {
    name: 'RFQ_Error_Screenshot.png',
    extension: 'png',
    sizeLabel: 'PNG · 1.2 MB',
    file: null
  },
  {
    name: 'Supplier_Quotation.pdf',
    extension: 'pdf',
    sizeLabel: 'PDF · 1.2 MB',
    file: null
  }
];

function filterFaqs() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  faqItems.forEach(item => {
    const matches = item.textContent.toLocaleLowerCase().includes(query);
    item.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

function formatFileSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileExtension(file) {
  return file.name.split('.').pop().toLocaleLowerCase();
}

function setFileFeedback(message, isError = false) {
  fileFeedback.textContent = message;
  fileFeedback.classList.toggle('is-error', isError);
  fileFeedback.classList.toggle('is-success', Boolean(message) && !isError);
}

function makeFileAction(label, iconTemplateId, action, index) {
  const button = document.createElement('button');
  button.className = 'support-file-action';
  button.type = 'button';
  button.dataset.fileAction = action;
  button.dataset.fileIndex = String(index);
  button.setAttribute('aria-label', `${label} ${attachments[index].name}`);
  button.title = `${label} file`;

  const icon = document.querySelector(iconTemplateId).content.firstElementChild.cloneNode(true);
  icon.classList.add('support-icon-svg');
  button.append(icon);
  return button;
}

function renderAttachments() {
  attachmentList.replaceChildren();

  if (attachments.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'support-attachments-empty';
    emptyMessage.textContent = 'No files attached.';
    attachmentList.append(emptyMessage);
    return;
  }

  attachments.forEach((attachment, index) => {
    const row = document.createElement('div');
    row.className = 'support-attachment-row';

    const type = document.createElement('span');
    type.className = 'support-file-icon-slot';
    type.setAttribute('aria-hidden', 'true');

    const extension = attachment.extension;
    const fileIconTemplate = extension === 'pdf'
      ? '#supportPdfFileIcon'
      : ['png', 'jpg', 'jpeg'].includes(extension) ? '#supportPngFileIcon' : null;

    if (fileIconTemplate) {
      const fileIcon = document.querySelector(fileIconTemplate).content.firstElementChild.cloneNode(true);
      fileIcon.classList.add('support-icon-svg');
      type.append(fileIcon);
    } else {
      type.classList.add('support-file-type-label');
      type.textContent = extension.toUpperCase();
    }

    const details = document.createElement('span');
    details.className = 'support-file-details';

    const name = document.createElement('span');
    name.className = 'support-file-name';
    name.textContent = attachment.name;

    const size = document.createElement('span');
    size.className = 'support-file-size';
    size.textContent = attachment.sizeLabel;
    details.append(name, size);

    const actions = document.createElement('span');
    actions.className = 'support-file-actions';
    actions.append(
      makeFileAction('View', '#supportEyeActionIcon', 'view', index),
      makeFileAction('Download', '#supportDownloadActionIcon', 'download', index),
      makeFileAction('Delete', '#supportTrashActionIcon', 'delete', index)
    );

    row.append(type, details, actions);
    attachmentList.append(row);
  });
}

function addFiles(files) {
  const rejectedFiles = [];
  let addedCount = 0;

  [...files].forEach(file => {
    if (!allowedExtensions.has(fileExtension(file))) {
      rejectedFiles.push(`${file.name}: file type is not supported`);
      return;
    }

    if (file.size > maxFileSize) {
      rejectedFiles.push(`${file.name}: exceeds the 20 MB limit`);
      return;
    }

    const extension = fileExtension(file);
    attachments.push({
      name: file.name,
      extension,
      sizeLabel: `${extension.toUpperCase()} · ${formatFileSize(file.size)}`,
      file
    });
    addedCount += 1;
  });

  renderAttachments();

  if (rejectedFiles.length > 0) {
    setFileFeedback(rejectedFiles.join('. '), true);
  } else if (addedCount > 0) {
    setFileFeedback(`${addedCount} file${addedCount === 1 ? '' : 's'} attached.`);
  }

  fileInput.value = '';
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function previewFile(file) {
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    downloadFile(file);
    setFileFeedback(`Preview isn't available for ${file.name}; the file was downloaded.`);
    return;
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', `Open ${file.name} in a new tab`);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  filterFaqs();
});

searchInput.addEventListener('input', filterFaqs);

fileInput.addEventListener('change', () => {
  addFiles(fileInput.files);
});

dropzone.addEventListener('dragover', event => {
  event.preventDefault();
  dropzone.classList.add('is-dragging');
});

dropzone.addEventListener('dragleave', event => {
  if (!dropzone.contains(event.relatedTarget)) {
    dropzone.classList.remove('is-dragging');
  }
});

dropzone.addEventListener('drop', event => {
  event.preventDefault();
  dropzone.classList.remove('is-dragging');
  addFiles(event.dataTransfer.files);
});

attachmentList.addEventListener('click', event => {
  const button = event.target.closest('[data-file-action]');
  if (!button) return;

  const index = Number(button.dataset.fileIndex);
  const attachment = attachments[index];
  if (!attachment) return;

  if (button.dataset.fileAction === 'delete') {
    attachments.splice(index, 1);
    renderAttachments();
    setFileFeedback(`${attachment.name} removed.`);
  } else if (!attachment.file) {
    setFileFeedback(`${attachment.name} is a sample attachment; its file is unavailable.`);
  } else if (button.dataset.fileAction === 'download') {
    downloadFile(attachment.file);
    setFileFeedback(`${attachment.name} download started.`);
  } else if (button.dataset.fileAction === 'view') {
    previewFile(attachment.file);
  }
});

document.querySelector('.support-requests-table').addEventListener('click', event => {
  const button = event.target.closest('.support-ticket-view');
  if (!button) return;

  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  document.querySelector('#supportDialogTicket').textContent = cells[0].textContent;
  document.querySelector('#supportDialogSubject').textContent = cells[1].textContent;
  document.querySelector('#supportDialogCategory').textContent = cells[2].textContent;
  document.querySelector('#supportDialogDate').textContent = cells[3].textContent;
  document.querySelector('#supportDialogStatus').textContent = cells[4].textContent.trim();
  ticketDialog.showModal();
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  submitStatus.textContent = 'This form is not connected to a support service. Your report has not been sent.';
});

renderAttachments();
