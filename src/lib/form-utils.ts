/**
 * Shows a message in a form message element
 * @param messageEl - The message div element
 * @param text - The message text to display
 * @param type - The message type (error or success)
 */
export function showFormMessage(
  messageEl: HTMLElement,
  text: string,
  type: 'error' | 'success'
): void {
  messageEl.textContent = text;
  messageEl.className = `form-message ${type}`;
  messageEl.style.display = 'block';
}

/**
 * Hides a form message element
 * @param messageEl - The message div element
 */
export function hideFormMessage(messageEl: HTMLElement): void {
  messageEl.style.display = 'none';
}
