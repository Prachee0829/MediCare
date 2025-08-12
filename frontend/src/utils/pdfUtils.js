import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

/**
 * Generate a PDF from an HTML element
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {string} filename - The name of the PDF file
 */
export const generatePDF = (element, filename) => {
  const opt = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Print the content of an HTML element
 * @param {HTMLElement} element - The HTML element to print
 */
export const printElement = (element) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .prescription-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .prescription-details { margin-bottom: 20px; }
    .medication-item { margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
    .notes { padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(element.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Share prescription data via email
 * @param {Object} prescription - The prescription data to share
 */
export const sharePrescription = (prescription) => {
  // Format the prescription data for email
  const subject = encodeURIComponent(`Prescription from ${prescription.doctorName}`);
  
  let body = encodeURIComponent(
    `Prescription Details:\n\n` +
    `Patient: ${prescription.patientName}\n` +
    `Doctor: ${prescription.doctorName}\n` +
    `Date: ${new Date(prescription.date).toLocaleDateString()}\n` +
    `Expiry: ${new Date(prescription.expiryDate).toLocaleDateString()}\n\n` +
    `Medications:\n`
  );
  
  prescription.medications.forEach((med, index) => {
    body += encodeURIComponent(
      `${index + 1}. ${med.name} ${med.dosage}\n` +
      `   Frequency: ${med.frequency}\n` +
      `   Duration: ${med.duration}\n\n`
    );
  });
  
  if (prescription.notes) {
    body += encodeURIComponent(`Notes: ${prescription.notes}\n`);
  }
  
  // Open email client with pre-filled data
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};