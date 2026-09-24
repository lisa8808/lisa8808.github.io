(() => {
  const gallery = Object.freeze({
    license: {
      src: './assets/company-document-license.png',
      label: '营业执照',
      alt: '营业执照示例'
    },
    idFront: {
      src: './assets/company-document-id-front.png',
      label: '身份证人像面',
      alt: '法人身份证人像面示例'
    },
    idBack: {
      src: './assets/company-document-id-back.png',
      label: '身份证国徽面',
      alt: '法人身份证国徽面示例'
    },
    financeAudit2024: {
      src: './assets/company-document-finance-audit-2024.png',
      label: '2024财务审计报告',
      alt: '2024财务审计报告封面'
    },
    taxPayment2024: {
      src: './assets/company-document-tax-payment-2024.png',
      label: '依法缴纳税收的证明',
      alt: '依法缴纳税收的证明'
    },
    performanceHardware2025: {
      src: './assets/company-document-performance-hardware.png',
      label: '硬件产品采购合同',
      alt: '硬件产品采购合同封面'
    },
    performanceSales2025: {
      src: './assets/company-document-performance-sales.png',
      label: '销售合同',
      alt: '销售合同附件'
    },
    qualityManagement2025: {
      src: './assets/company-document-quality-management.png',
      label: '质量管理体系资质证书',
      alt: '质量管理体系资质证书'
    },
    credit3A2025: {
      src: './assets/company-document-credit-3a.png',
      label: '3A信用证书',
      alt: '3A信用企业信用证书'
    }
  });

  const render = (root = document) => {
    root.querySelectorAll('[data-document-gallery]').forEach((slot) => {
      const asset = gallery[slot.dataset.documentGallery];
      if (!asset || slot.dataset.galleryReady === slot.dataset.documentGallery) return;

      const image = slot.querySelector('img') || document.createElement('img');
      image.className = 'document-gallery-image';
      image.src = asset.src;
      image.alt = asset.alt;
      image.loading = 'lazy';
      if (!image.parentElement) slot.prepend(image);
      slot.querySelectorAll('svg').forEach((icon) => icon.remove());
      const title = slot.querySelector('strong');
      if (title && !title.dataset.userFile) title.textContent = `示例：${asset.label}`;
      slot.dataset.galleryReady = slot.dataset.documentGallery;
      slot.classList.add('has-document-preview');
    });
  };

  window.companyDocumentGallery = gallery;
  window.renderCompanyDocumentGallery = render;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => render());
  else render();
})();
