/**
 * AI Discover Tools — optional Google Analytics consent.
 * No analytics storage is allowed until the visitor accepts it.
 * Prefer the Google AdSense Privacy & messaging consent signal when available.
 * The local opt-in is shown only if no active Google TCF CMP is detected.
 * Advertising permissions are never granted or modified by this script.
 */
(function () {
  'use strict';
  var measurementId = window.__aidtGa4Id;
  if (!/^G-[A-Z0-9]+$/.test(String(measurementId || ''))) return;
  var key = 'aidt-analytics-choice-v1';
  var cmpOwnsAnalytics = false;
  var outcomeApplied = false;
  var pageViewSent = false;
  var choicesUI;
  var settingsButton;

  function recordedChoice() {
    try {
      var stored = localStorage.getItem(key);
      return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch (_) { return null; }
  }
  function saveChoice(choice) {
    try { localStorage.setItem(key, choice); } catch (_) {}
  }
  function issueConsent(choice) {
    if (choice !== 'granted' && choice !== 'denied') return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', { analytics_storage: choice });
    outcomeApplied = true;
    // Automatic GA4 pageview is disabled: send one after an actual opt-in.
    if (choice === 'granted' && !pageViewSent) {
      pageViewSent = true;
      window.gtag('event', 'page_view', {
        send_to: measurementId,
        page_location: window.location.href,
        page_title: document.title
      });
    }
  }
  function removeUI() {
    if (choicesUI) {
      choicesUI.remove();
      choicesUI = null;
    }
    if (settingsButton) {
      settingsButton.remove();
      settingsButton = null;
    }
  }
  function closeChoices() {
    if (choicesUI) {
      choicesUI.remove();
      choicesUI = null;
    }
  }
  function showChoices() {
    if (cmpOwnsAnalytics || choicesUI || !document.body) return;
    var panel = document.createElement('section');
    panel.id = 'aidt-analytics-choice';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Optional website analytics');
    panel.innerHTML =
      '<strong>Optional analytics cookies</strong>' +
      '<p>Help us understand which pages visitors use through Google Analytics. ' +
      'You can decline and keep browsing. Advertising consent is handled separately.</p>' +
      '<div class="aidt-choice-actions">' +
      '<button type="button" data-aidt-choice="granted">Accept analytics</button>' +
      '<button type="button" data-aidt-choice="denied">Reject analytics</button>' +
      '<a href="/privacy-policy.html">Privacy policy</a></div>';
    panel.addEventListener('click', function (event) {
      var target = event.target.closest('[data-aidt-choice]');
      if (!target || cmpOwnsAnalytics) return;
      var choice = target.getAttribute('data-aidt-choice');
      saveChoice(choice);
      issueConsent(choice);
      closeChoices();
      showSettings();
    });
    document.body.appendChild(panel);
    choicesUI = panel;
  }
  function showSettings() {
    if (cmpOwnsAnalytics || settingsButton || !document.body) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'aidt-analytics-settings';
    button.textContent = 'Analytics preferences';
    button.setAttribute('aria-label', 'Change analytics cookie preferences');
    button.addEventListener('click', showChoices);
    document.body.appendChild(button);
    settingsButton = button;
  }
  function installStyles() {
    if (document.getElementById('aidt-analytics-style')) return;
    var style = document.createElement('style');
    style.id = 'aidt-analytics-style';
    style.textContent =
      '#aidt-analytics-choice{position:fixed;z-index:2147483000;bottom:18px;left:18px;max-width:440px;' +
      'width:calc(100% - 36px);box-sizing:border-box;background:#fff;color:#17202a;border:1px solid #d7dfe7;' +
      'border-radius:14px;padding:18px;box-shadow:0 12px 36px rgba(0,0,0,.22);font:14px/1.5 system-ui,sans-serif}' +
      '#aidt-analytics-choice strong{font-size:16px;display:block;margin-bottom:6px}' +
      '#aidt-analytics-choice p{margin:0 0 14px;color:#344252}' +
      '.aidt-choice-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
      '.aidt-choice-actions button{font:inherit;padding:9px 12px;border-radius:7px;cursor:pointer;' +
      'background:#152e4c;border:1px solid #152e4c;color:white}' +
      '.aidt-choice-actions button[data-aidt-choice="denied"]{background:white;color:#152e4c}' +
      '.aidt-choice-actions a{color:#244ba2;text-decoration:underline;font-size:13px}' +
      '#aidt-analytics-settings{position:fixed;left:12px;bottom:12px;z-index:2147480000;' +
      'background:white;color:#17202a;border:1px solid #c9d2dc;border-radius:8px;' +
      'padding:6px 10px;font:12px/1.3 system-ui,sans-serif;cursor:pointer}' +
      '@media(max-width:500px){#aidt-analytics-choice{bottom:10px;left:10px;width:calc(100% - 20px)}}';
    document.head.appendChild(style);
  }
  // Google AdSense / Funding Choices: use Google's own granular choice, do
  // not override its advertising permissions or show a competing dialog.
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: function () {
      try {
        var state = window.googlefc.getGoogleConsentModeValues();
        var status = state && state.analyticsStoragePurposeConsentStatus;
        if (status === 1 || status === 2) {
          cmpOwnsAnalytics = true;
          removeUI();
          issueConsent(status === 1 ? 'granted' : 'denied');
        }
      } catch (_) {
        // Leave consent denied if the CMP cannot provide a usable choice.
      }
    }
  });
  function init() {
    installStyles();
    // Allow the existing Google CMP to initialize first. If it is in charge,
    // its callback above applies the explicit analytics choice.
    setTimeout(function () {
      if (cmpOwnsAnalytics || typeof window.__tcfapi === 'function') return;
      var stored = recordedChoice();
      if (stored) {
        issueConsent(stored);
        showSettings();
      } else {
        showChoices();
      }
    }, 1800);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
