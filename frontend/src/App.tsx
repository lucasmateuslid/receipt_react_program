import React, { useState, useEffect } from "react";
import { ReceiptForm } from "./components/ReceiptForm";
import { Receipt } from "./components/Receipt";
import { ReceiptData } from "./types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, RotateCw, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [apiReady, setApiReady] = useState(false);

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

  // 🔁 Polling inteligente da API a cada 550ms
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const wakeApi = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/wake`);
        const data = await res.json();

        if (data?.status?.includes("API INICIADA")) {
          setApiReady(true);
          toast.success("✅ API INICIADA COM SUCESSO");
          clearInterval(interval); // Para o polling
        }
      } catch (err) {
        // Silencioso — sem erro até a API acordar
        console.log("🔁 Aguardando API iniciar...");
      }
    };

    interval = setInterval(wakeApi, 1000);

    return () => clearInterval(interval); // Limpeza se desmontar
  }, []);

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
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
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
    <>
      <Toaster position="bottom-right" />
      <main className="min-h-screen py-6 px-4 bg-background text-foreground transition-colors duration-300 font-sans">
        {!apiReady ? (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            <span className="text-lg font-medium text-muted-foreground">
              Carregando API...
            </span>
          </div>
        ) : (
          <>
            {/* Topbar */}
            <div className="flex justify-between items-center max-w-3xl mx-auto mb-6">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-muted-foreground" />
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                <Sun className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Conteúdo principal */}
            {!receipt ? (
              <ReceiptForm onSubmit={handleSubmit} />
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <Receipt
                  data={receipt}
                  type="BOTH"
                  onDownload={handleDownload}
                  onEmail={() => console.log("Enviar por email")}
                  isDownloading={isDownloading}
                  isGeneratingPdf={true}
                />

                <div className="flex justify-center">
                  <Button
                    variant="default"
                    onClick={() => setReceipt(null)}
                    className="flex items-center gap-2 text-base"
                  >
                    <RotateCw className="w-4 h-4" />
                    Gerar Novo Recibo
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
