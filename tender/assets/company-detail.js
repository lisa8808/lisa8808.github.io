const back = () => { window.location.href = './company-management.html'; };
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', back));
document.querySelectorAll('[data-toast]').forEach((button) => button.addEventListener('click', () => { const node = document.querySelector('#toast'); node.textContent = button.dataset.toast; node.hidden = false; clearTimeout(window.detailToast); window.detailToast = setTimeout(() => { node.hidden = true; }, 2200); }));
