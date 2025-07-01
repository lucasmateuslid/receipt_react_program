import React, { useState, useEffect } from "react";
import { ReceiptForm } from "./components/ReceiptForm";
import { Receipt } from "./components/Receipt";
import { ReceiptData } from "./types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Switch } from "@/components/ui/switch"; // Pode remover se não usar esse componente

export default function App() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleSubmit = (data: ReceiptData) => {
    setReceipt(data);
  };

  const handleDownload = async () => {
    if (!receipt) return;
    try {
      setIsDownloading(true);
      const element = document.getElementById("receipt");
      if (!element) throw new Error("Elemento do recibo não encontrado");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? "#121212" : "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, "", "FAST");
      pdf.save(`recibo-${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Por favor, tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background text-foreground transition-colors duration-300">
      <div className="flex justify-end max-w-4xl mx-auto mb-6">
        <label htmlFor="dark-mode-toggle" className="flex items-center cursor-pointer select-none">
          <span className="mr-3 text-sm font-medium">Dark Mode</span>
          <input
            id="dark-mode-toggle"
            type="checkbox"
            className="hidden"
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
          />
          <div className="w-10 h-5 bg-gray-300 rounded-full relative transition-colors dark:bg-gray-600">
            <div
              className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${
                isDarkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </label>
      </div>

      {!receipt ? (
        <ReceiptForm onSubmit={handleSubmit} />
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <Receipt
            data={receipt}
            type="CLIENT"
            onDownload={handleDownload}
            onEmail={() => console.log("Enviar por email")}
            isDownloading={isDownloading}
            isGeneratingPdf={true} // Oculta botões para a captura PDF
          />
          <div className="flex justify-center">
            <button
              onClick={() => setReceipt(null)}
              className="bg-primary-foreground text-primary py-2 px-4 rounded-lg hover:bg-primary transition"
            >
              Gerar Novo Recibo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
