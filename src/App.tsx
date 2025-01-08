import React, { useState } from 'react';
import { ReceiptForm } from './components/ReceiptForm';
import { Receipt } from './components/Receipt';
import { ReceiptData } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmit = (data: ReceiptData) => {
    setReceipt(data);
  };

  const handleDownload = async () => {
    if (!receipt) return;
    
    try {
      setIsDownloading(true);
      const element = document.getElementById('receipt');
      if (!element) throw new Error('Receipt element not found');

      const canvas = await html2canvas(element, {
        scale: 1,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width / 1; // Manter a proporção em 1

      // Add company copy
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight, undefined, 'FAST');


      pdf.save(`recibo-${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = () => {
    // TODO: Implement email sending
    console.log('Send Email');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {!receipt ? (
        <ReceiptForm onSubmit={handleSubmit} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <Receipt 
            data={receipt}
            type="CLIENT"
            onDownload={handleDownload}
            onEmail={handleEmail}
            isDownloading={isDownloading}
          />
          <div className="flex justify-center">
            <button
              onClick={() => setReceipt(null)}
              className="bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Gerar Novo Recibo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}