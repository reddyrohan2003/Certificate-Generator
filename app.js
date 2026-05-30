(() => {
  'use strict';

  // DOM refs
  const studentInput = document.getElementById('studentName');
  const courseInput = document.getElementById('courseName');
  const sig1NameInput = document.getElementById('sig1Name');
  const sig1RoleInput = document.getElementById('sig1Role');
  const sig2NameInput = document.getElementById('sig2Name');
  const sig2RoleInput = document.getElementById('sig2Role');
  const certDateInput = document.getElementById('certDateInput');

  const certName = document.getElementById('certName');
  const certCourse = document.getElementById('certCourse');
  const certDateEl = document.getElementById('certDate');
  const certSig1Name = document.getElementById('certSig1Name');
  const certSig1Role = document.getElementById('certSig1Role');
  const certSig2Name = document.getElementById('certSig2Name');
  const certSig2Role = document.getElementById('certSig2Role');

  const downloadBtn = document.getElementById('downloadBtn');
  const certificate = document.getElementById('certificate');

  const showDateToggle = document.getElementById('showDate');
  const dateField = document.getElementById('dateField');
  const showSigToggle = document.getElementById('showSignatures');
  const certFooter = document.getElementById('certFooter');
  const sigFields = document.getElementById('sigFields');

  // --- Helpers ---
  function formatDate(dateStr) {
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function setDateDisplay() {
    const on = showDateToggle.checked;
    certDateEl.classList.toggle('cert-date--hidden', !on);
    dateField.classList.toggle('is-visible', on);
    if (on) updateDate();
  }

  function updateDate() {
    certDateEl.textContent = `Awarded on ${formatDate(certDateInput.value)}`;
  }

  // --- Init date ---
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  certDateInput.value = `${yyyy}-${mm}-${dd}`;
  certDateEl.textContent = `Awarded on ${formatDate('')}`;
  dateField.classList.add('is-visible');

  showDateToggle.addEventListener('change', setDateDisplay);
  certDateInput.addEventListener('input', updateDate);

  // --- Signatures toggle ---
  showSigToggle.addEventListener('change', () => {
    const on = showSigToggle.checked;
    certFooter.classList.toggle('cert-footer--hidden', !on);
    sigFields.classList.toggle('is-visible', on);
    if (!on) {
      sig1NameInput.value = '';
      sig1RoleInput.value = '';
      sig2NameInput.value = '';
      sig2RoleInput.value = '';
      certSig1Name.textContent = '';
      certSig1Role.textContent = 'Signatory';
      certSig2Name.textContent = '';
      certSig2Role.textContent = 'Signatory';
    }
  });

  // --- Live preview ---
  function updatePreview() {
    const name = studentInput.value.trim();
    const course = courseInput.value.trim();
    certName.textContent = name || 'Your Name';
    certName.classList.toggle('cert-name--placeholder', !name);
    certCourse.textContent = course || 'Course Name';
    certCourse.classList.toggle('cert-course--placeholder', !course);
  }

  studentInput.addEventListener('input', updatePreview);
  courseInput.addEventListener('input', updatePreview);

  function updateSigs() {
    certSig1Name.textContent = sig1NameInput.value.trim();
    certSig1Role.textContent = sig1RoleInput.value.trim() || 'Signatory';
    certSig2Name.textContent = sig2NameInput.value.trim();
    certSig2Role.textContent = sig2RoleInput.value.trim() || 'Signatory';
  }

  sig1NameInput.addEventListener('input', updateSigs);
  sig1RoleInput.addEventListener('input', updateSigs);
  sig2NameInput.addEventListener('input', updateSigs);
  sig2RoleInput.addEventListener('input', updateSigs);

  certName.classList.add('cert-name--placeholder');
  certCourse.classList.add('cert-course--placeholder');

  // --- PDF Download ---
  function setButtonLoading(loading) {
    if (loading) {
      downloadBtn.classList.add('is-loading');
      downloadBtn.innerHTML = `
        <svg class="btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Generating…
      `;
    } else {
      downloadBtn.classList.remove('is-loading');
      downloadBtn.innerHTML = `
        <svg class="btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download PDF
      `;
    }
  }

  /**
   * Patches a cloned certificate element so html2canvas can render it.
   * html2canvas does NOT support: mix-blend-mode, background-clip:text, CSS filter, calc() transforms.
   */
  function patchCloneForCapture(clonedDoc) {
    const root = clonedDoc.getElementById('certificate');
    if (!root) return;

    // Remove any transforms (mobile scaling)
    root.style.transform = 'none';
    root.style.width = '800px';

    // Fix title — gradient text → solid color
    const title = root.querySelector('.cert-title');
    if (title) {
      title.style.background = 'none';
      title.style.webkitBackgroundClip = 'unset';
      title.style.backgroundClip = 'unset';
      title.style.webkitTextFillColor = '#c8d4e8';
      title.style.color = '#c8d4e8';
    }

    // Fix student name — gradient text → solid color
    const name = root.querySelector('.cert-name');
    if (name) {
      name.style.background = 'none';
      name.style.webkitBackgroundClip = 'unset';
      name.style.backgroundClip = 'unset';
      name.style.webkitTextFillColor = '#80c8ff';
      name.style.color = '#80c8ff';
      name.style.filter = 'none';
    }

    // Fix logo — remove blend mode so it renders directly
    const logo = root.querySelector('.cert-logo');
    if (logo) {
      logo.style.mixBlendMode = 'normal';
      logo.style.filter = 'none';
    }

    // Fix certificate background — use simple solid color instead of layered gradients
    root.style.background = '#090d1c';

    // Remove text-shadow from ornaments (can cause rendering issues)
    root.querySelectorAll('.cert-ornament').forEach(el => {
      el.style.textShadow = 'none';
    });
  }

  downloadBtn.addEventListener('click', async () => {
    setButtonLoading(true);

    // Small delay to let the loading state render
    await new Promise(r => setTimeout(r, 50));

    try {
      const canvas = await html2canvas(certificate, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#090d1c',
        logging: false,
        onclone: (clonedDoc) => {
          patchCloneForCapture(clonedDoc);
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // jsPDF UMD exposes itself as window.jsPDF (capital P)
      const JsPDF = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
      if (!JsPDF) throw new Error('jsPDF library not loaded. Please refresh and try again.');

      const pdf = new JsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 6;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;

      const imgAspect = canvas.width / canvas.height;
      let drawW = availW;
      let drawH = drawW / imgAspect;

      if (drawH > availH) {
        drawH = availH;
        drawW = drawH * imgAspect;
      }

      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, drawW, drawH);

      const safeName = studentInput.value.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'certificate';
      pdf.save(`${safeName}_brillnex_certificate.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed: ' + err.message);
    } finally {
      setButtonLoading(false);
    }
  });
})();
