// Utility functions for testing modals during development

export const clearModalDelays = () => {
  // Note: Plan expiry warning is now non-dismissible and controlled purely by API response
  // Only clear the grace period modal delays
  localStorage.removeItem('planExpiryModalNextShow');
  localStorage.removeItem('planExpiryModalShown');
  console.log('✅ Cleared grace period modal delays - warning banner is always shown when API indicates expiry');
  console.log('ℹ️  Plan expiry warning banner is now non-dismissible and controlled by API response');
};

export const showModalStatus = () => {
  const expiryDelay = localStorage.getItem('planExpiryModalNextShow');
  const expiryShown = localStorage.getItem('planExpiryModalShown');
  
  console.log('📊 Modal Status:');
  console.log('Warning Banner: Non-dismissible - controlled by API response only');
  console.log('Grace Period Modal:');
  console.log('  - Shown:', expiryShown ? 'Yes' : 'No');
  console.log('  - Next show:', expiryDelay ? new Date(parseInt(expiryDelay)) : 'No delay');
};

export const resetModalToShowOnce = () => {
  // Note: Warning banner is now non-dismissible, only reset grace period modal
  localStorage.removeItem('planExpiryModalShown');
  console.log('🔄 Reset grace period modal to show once again (warning banner is always shown)');
};

export const setShortDelay = (minutes: number = 1) => {
  const shortDelay = Date.now() + (minutes * 60 * 1000);
  // Note: Warning banner is now non-dismissible, only set delay for grace period modal
  localStorage.setItem('planExpiryModalNextShow', shortDelay.toString());
  console.log(`⏰ Set short delay of ${minutes} minute(s) for grace period modal (warning banner is non-dismissible)`);
};

// Call these in browser console to test:
// clearModalDelays() - Clear grace period modal delays
// showModalStatus() - See current status  
// resetModalToShowOnce() - Reset grace period modal to show once again
// setShortDelay(1) - Set 1 minute delay instead of 6 hours for grace period modal
// Note: Warning banner is now non-dismissible and controlled purely by API response