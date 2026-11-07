const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const suppliersDocument = Boolean($('#supplierPage'));
const authStorageKey = 'uniprocur.demo-session';
const demoEmail = 'manager@uniprocur.local';
const demoPassword = 'UniProcur123!';
const modulePages = {
  'Purchase Request': 'modules/purchase-requests.html',
  'Purchase Order': 'modules/purchase-orders.html',
  Containers: 'modules/containers.html',
  Reports: 'modules/reports.html',
  'Audit Trail': 'modules/audit-trail.html',
  Support: 'modules/support.html',
  Settings: 'modules/settings.html'
};

function isSignedIn() {
  return sessionStorage.getItem(authStorageKey) === demoEmail;
}

if (suppliersDocument && !isSignedIn()) {
  window.location.replace('../index.html?return=suppliers');
}

const loginPage = $('#loginPage');
if (loginPage) {
  const signedIn = isSignedIn();
  loginPage.hidden = signedIn;
  $$('.sidebar, .main').forEach(element => {
    element.hidden = !signedIn;
  });
}

const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const loginError = $('#loginError');

    if (email !== demoEmail || password !== demoPassword) {
      loginError.textContent = 'The email or password is incorrect. Use the demo account shown below.';
      loginError.hidden = false;
      return;
    }

    try {
      sessionStorage.setItem(authStorageKey, demoEmail);
    } catch (error) {
      loginError.textContent = `Could not start a sign-in session: ${error.message}`;
      loginError.hidden = false;
      return;
    }

    const returnTo = new URLSearchParams(window.location.search).get('return');
    window.location.assign(returnTo === 'suppliers' ? 'modules/suppliers.html' : 'index.html');
  });
}

$$('[data-logout]').forEach(button => {
  button.addEventListener('click', () => {
    sessionStorage.removeItem(authStorageKey);
    window.location.replace(suppliersDocument ? '../index.html' : 'index.html');
  });
});

function showPage(page) {
  const isDashboard = page === 'Dashboard';
  const modulePath = modulePages[page];
  if (!isDashboard && !modulePath) return;

  $('#dashboardPage').hidden = !isDashboard;
  $('#modulePage').hidden = isDashboard;
  $('.main').classList.toggle('module-active', !isDashboard);
  $('#pageTitle').textContent = isDashboard ? getWelcomeMessage() : page;
  if (!isDashboard && $('#moduleFrame').getAttribute('src') !== modulePath) {
    $('#moduleFrame').src = modulePath;
  }
  $$('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

function getWelcomeMessage() {
  const userName = $('.topbar .user-profile b');
  const firstName = userName ? userName.textContent.trim().split(/\s+/)[0] : '';
  return firstName ? `Welcome ${firstName}!` : 'Welcome!';
}

function navigatePage(page) {
  if (suppliersDocument) {
    if (page !== 'Suppliers') {
      window.location.href = `../index.html#page=${encodeURIComponent(page)}`;
    }
    return;
  }
  if (page === 'Suppliers') {
    window.location.href = 'modules/suppliers.html';
    return;
  }
  showPage(page);
}

$$('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigatePage(item.dataset.page));
});

$$('[data-page-link]').forEach(item => {
  item.addEventListener('click', () => navigatePage(item.dataset.pageLink));
});

const mobileMenu = $('#mobileMenu');
if (mobileMenu) {
  mobileMenu.addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });
}

if (suppliersDocument) {
  const supplierNavItem = $('.nav-item[data-page="Suppliers"]');
  if (supplierNavItem) supplierNavItem.classList.add('active');
} else {
  const pageFromHash = new URLSearchParams(window.location.hash.slice(1)).get('page');
  if (pageFromHash) showPage(pageFromHash);
  else $('#pageTitle').textContent = getWelcomeMessage();

  const count = $('#supplierCount');
  if (count) {
    try {
      const savedSuppliers = JSON.parse(localStorage.getItem('uniprocur.suppliers'));
      if (Array.isArray(savedSuppliers)) count.textContent = savedSuppliers.length;
    } catch (error) {
      console.error('Could not read the saved supplier count.', error);
    }
  }
}
