/**
 * Reusable modal utility for opening, closing, and setting up event listeners
 */

interface ModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

export function setupModal(modalId: string, options: ModalOptions = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn(`Modal with id "${modalId}" not found`);
    return null;
  }

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');

  const open = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    options.onOpen?.();
  };

  const close = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    options.onClose?.();
  };

  // Close on overlay click
  overlay?.addEventListener('click', close);

  // Close on X button click
  closeBtn?.addEventListener('click', close);

  // Close on Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      close();
    }
  };
  document.addEventListener('keydown', handleEscape);

  return { open, close, modal };
}
