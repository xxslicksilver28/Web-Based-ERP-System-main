(() => {
  const tabs = [...document.querySelectorAll('[data-settings-tab]')];
  const panels = [...document.querySelectorAll('[data-settings-panel]')];

  const supportGradient = 'linear-gradient(118deg, #2c1010 0%, #8d0807 23%, #eb0000 61%, #ff7b32 100%)';
  const parentStyles = [];

  function rememberStyle(element, properties) {
    const saved = {};
    properties.forEach(property => {
      saved[property] = {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property)
      };
    });
    parentStyles.push({ element, saved });
  }

  function setParentBackground() {
    try {
      const parentDocument = window.parent.document;
      const parentBody = parentDocument.body;
      const parentMain = parentDocument.querySelector('.main');
      const moduleFrame = parentDocument.querySelector('#moduleFrame');
      if (!parentBody || !parentMain || !moduleFrame) {
        throw new Error('The Manager workspace frame was not found.');
      }

      if (!parentStyles.length) {
        rememberStyle(parentBody, ['background-image', 'background-position', 'background-size', 'background-repeat']);
        rememberStyle(parentMain, ['background']);
        rememberStyle(moduleFrame, ['background']);
      }

      const viewportWidth = window.parent.innerWidth;
      const sidebarWidth = viewportWidth <= 760 ? 0 : viewportWidth <= 1100 ? 205 : 260;
      parentBody.style.setProperty('background-image', supportGradient);
      parentBody.style.setProperty('background-position', `${sidebarWidth}px 0`);
      parentBody.style.setProperty('background-size', `calc(100% - ${sidebarWidth}px) 100%`);
      parentBody.style.setProperty('background-repeat', 'no-repeat');
      parentMain.style.setProperty('background', 'transparent');
      moduleFrame.style.setProperty('background', 'transparent');
    } catch (error) {
      console.error('Could not apply the full-page Settings gradient.', error);
    }
  }

  function restoreParentBackground() {
    parentStyles.forEach(({ element, saved }) => {
      Object.entries(saved).forEach(([property, original]) => {
        if (original.value) element.style.setProperty(property, original.value, original.priority);
        else element.style.removeProperty(property);
      });
    });
    parentStyles.length = 0;
  }

  setParentBackground();
  window.parent.addEventListener('resize', setParentBackground);
  window.addEventListener('pagehide', () => {
    window.parent.removeEventListener('resize', setParentBackground);
    restoreParentBackground();
  });
  window.addEventListener('pageshow', setParentBackground);

  function activateTab(activeTab, moveFocus = false) {
    tabs.forEach(tab => {
      const selected = tab === activeTab;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(panel => {
      panel.hidden = panel.dataset.settingsPanel !== activeTab.dataset.settingsTab;
    });

    if (moveFocus) activeTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  document.querySelectorAll('[data-notification-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const enabled = toggle.getAttribute('aria-checked') !== 'true';
      toggle.setAttribute('aria-checked', String(enabled));
      toggle.classList.toggle('is-on', enabled);
      toggle.textContent = enabled ? 'On' : 'Off';
    });
  });

  const profileStatus = document.querySelector('.settings-profile-status');
  try {
    const hostDocument = window.parent.document;
    const nameElement = hostDocument.querySelector('.topbar .user-profile b');
    const emailElement = hostDocument.querySelector('.topbar .user-profile small');
    const name = nameElement ? nameElement.textContent.trim() : '';
    const email = emailElement ? emailElement.textContent.trim() : '';

    if (!name || !email) {
      throw new Error('The Manager name or email is missing from the shared header.');
    }

    document.querySelector('[data-profile-name]').textContent = name;
    document.querySelector('[data-profile-email]').textContent = email;
    document.querySelector('[data-profile-name-input]').value = name;
    document.querySelector('[data-profile-email-input]').value = email;
  } catch (error) {
    profileStatus.hidden = false;
    profileStatus.textContent = 'Manager profile details could not be loaded.';
    console.error('Could not load Manager profile details in Settings.', error);
  }
})();
