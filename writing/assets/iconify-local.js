(function () {
  const paths = {
    'layout-columns': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'database-plus': '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3h1M5 11v6c0 1.7 3.1 3 7 3h1M16 19h6M19 16v6"/>',
    pin: '<path d="m9 4 6 0 1 5 3 3-5 1-4 7-1-7-5-2 4-3z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
    brush: '<path d="m9 11 8-8 4 4-8 8M9 11c-3 0-5 2-5 5 0 2-1 3-2 4 5 1 9 0 11-5z"/>',
    highlight: '<path d="m9 11 6 6M4 20h8M7 13l8-8 4 4-8 8z"/>',
    'align-left': '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    minus: '<path d="M5 12h14"/>',
    wand: '<path d="m6 20 12-12M14 4l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM4 12l1-2 1 2 2 1-2 1-1 2-1-2-2-1z"/>',
    book: '<path d="M4 5a3 3 0 0 1 3-3h5v18H7a3 3 0 0 0-3 2zM20 5a3 3 0 0 0-3-3h-5v18h5a3 3 0 0 1 3 2z"/>',
    'info-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    restore: '<path d="M4 8v5h5M5 13a8 8 0 1 0 2-7"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
    'dots-vertical': '<circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>'
  };

  class LocalIcon extends HTMLElement {
    static get observedAttributes() { return ['icon', 'width', 'height']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const name = (this.getAttribute('icon') || '').replace(/^tabler:/, '');
      const width = this.getAttribute('width') || '24';
      const height = this.getAttribute('height') || width;
      this.style.display = 'inline-flex';
      this.style.width = `${width}px`;
      this.style.height = `${height}px`;
      this.style.flex = '0 0 auto';
      this.innerHTML = `<svg viewBox="0 0 24 24" width="${width}" height="${height}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || '<circle cx="12" cy="12" r="9"/>'}</svg>`;
    }
  }

  if (!customElements.get('iconify-icon')) customElements.define('iconify-icon', LocalIcon);
}());
