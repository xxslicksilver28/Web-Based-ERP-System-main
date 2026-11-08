const searchForm = document.querySelector('#supportSearch');
const searchInput = document.querySelector('#supportSearchInput');
const faqList = document.querySelector('#supportFaqList');
const emptyState = document.querySelector('#supportFaqEmpty');
const faqItems = [...faqList.querySelectorAll('.support-faq-item')];

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

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  filterFaqs();
});

searchInput.addEventListener('input', filterFaqs);
