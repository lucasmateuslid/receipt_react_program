import React, { useState } from "react";
import { Download, Mail, Printer, Receipt as ReceiptIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { ReceiptData, PAYMENT_METHODS, SERVICE_TYPES } from "../types";
import { formatCurrency } from "../utils";
import assignSignature from "./imgs/assign.png";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  data: ReceiptData;
  onEmail?: () => void;
}

// Ajuste para interpretar corretamente datas do tipo "yyyy-mm-dd" ou ISO completo
const formatLocalDate = (dateStr: string) => {
  if (!dateStr) return "";
  // Se for só data yyyy-mm-dd (sem T), faz split e monta Date manualmente (evita erro timezone)
  if (dateStr.includes("-") && !dateStr.includes("T")) {
    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("pt-BR");
  }
  // Caso contrário, tenta criar Date diretamente (ex: ISO completo)
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
};

const ReceiptSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-6">
    <Label className="mb-2 block text-gray-800 font-semibold uppercase tracking-wide text-sm sm:text-base">
      {title}
    </Label>
    <div className="text-base sm:text-lg text-gray-900 space-y-1 font-sans">{children}</div>
  </section>
);

function ReceiptContent({
  data,
  copy,
}: {
  data: ReceiptData;
  copy: "1ª VIA - EMPRESA" | "2ª VIA - CLIENTE";
}) {
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === data.paymentMethod)?.label;
  const serviceType = SERVICE_TYPES.find((s) => s.id === data.serviceType)?.label;

  return (
    <article
      className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-300 mb-10 print:mb-0 text-[16px] sm:text-[18px] font-sans leading-relaxed"
      style={{ pageBreakAfter: "always" }}
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-400 pb-5 mb-8">
        <div className="flex items-center gap-4">
          <ReceiptIcon size={28} className="text-blue-700" />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Recibo Digital</h2>
            <p className="text-sm text-gray-600 font-medium">Nº {data.receiptNumber}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-blue-700 uppercase mt-3 sm:mt-0">{copy}</span>
      </header>

      <ReceiptSection title="Beneficiário">
        <address className="not-italic space-y-1 text-gray-900 font-semibold">
          <p>Mais Soluções em Monitoramento LTDA</p>
          <p className="font-normal">CNPJ: 41.365.885/0001-00</p>
          <p className="font-normal">Av. Senador Salgado Filho, 1718 - Tirol Way Office Tower</p>
          <p className="font-normal">Natal - RN | Contato: (84) 4042-0869</p>
          <p className="font-normal">Banco: ASAAS</p>
        </address>
      </ReceiptSection>

      <ReceiptSection title="Pagador">
        <p>Nome: <span className="font-semibold text-gray-800">{data.payerName}</span></p>
        <p>CPF/CNPJ: <span className="font-mono text-gray-700">{data.payerDocument}</span></p>
      </ReceiptSection>

      <ReceiptSection title="Pagamento">
        <p>Valor: <span className="font-semibold">{formatCurrency(data.amount)}</span></p>
        <p>Vencimento: <span className="font-medium">{formatLocalDate(data.dueDate)}</span></p>
        <p>Método de Pagamento: <span className="font-medium">{paymentMethod}</span></p>
        <p>Serviço: <span className="font-medium">{serviceType}</span></p>
      </ReceiptSection>

      {data.vehicles.length > 0 && (
        <ReceiptSection title="Veículos">
          <ul className="list-disc list-inside space-y-1 text-gray-800 font-mono text-base">
            {data.vehicles.map((v, idx) => (
              <li key={idx}>
                Placa: {v.plate}
                {v.marca && ` | Marca: ${v.marca}`}
                {v.modelo && ` | Modelo: ${v.modelo}`}
                {v.chassi && ` | Chassi: ${v.chassi}`}
                {v.renavam && ` | Renavam: ${v.renavam}`}
              </li>
            ))}
          </ul>
        </ReceiptSection>
      )}

      <div className="text-base text-gray-700 mt-8 font-medium">
        <p>Data de Emissão: {formatLocalDate(data.emissionDate)}</p>
      </div>

      <footer className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 border-t pt-8 border-gray-400">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={assignSignature}
            alt="Assinatura"
            className="object-contain"
            style={{ height: "150px", transform: "rotate(-90deg) scale(2.8)" }}
          />
          <div className="w-full border-t border-gray-400" />
          <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
            Mais Soluções em Monitoramento LTDA<br />CNPJ: 41.365.885/0001-00
          </p>
        </div>

        <div className="flex flex-col items-center justify-end space-y-3 mt-12 sm:mt-0">
          <div className="w-full border-t border-gray-400" />
          <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
            {data.payerName}<br />{data.payerDocument}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function Receipt({ data, onEmail }: Props) {
  const [printEmpresa, setPrintEmpresa] = useState(true);
  const [printCliente, setPrintCliente] = useState(true);

  const handleDownloadPDF = async () => {
    const elementsToHide = document.querySelectorAll(".print\\:hidden");
    elementsToHide.forEach((el) => (el as HTMLElement).style.display = "none");

    await new Promise((r) => setTimeout(r, 500));

    const articles = document.querySelectorAll("#receipt article");
    const pdf = new jsPDF();

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i] as HTMLElement;
      const canvas = await html2canvas(article, { scale: 3 }); // maior resolução
      const imgData = canvas.toDataURL("image/png");
      const props = pdf.getImageProperties(imgData);
      const width = pdf.internal.pageSize.getWidth();
      const height = (props.height * width) / props.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
    }

    pdf.save("recibo.pdf");
    setTimeout(() => {
      elementsToHide.forEach((el) => (el as HTMLElement).style.display = "");
    }, 150);
  };

  const handlePrint = () => {
    if (!printEmpresa && !printCliente) return alert("Selecione ao menos uma via.");
    window.print();
  };

  return (
    <section id="receipt" className="max-w-3xl mx-auto bg-white rounded-xl overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-center p-5 bg-gray-50 border-b print:hidden gap-6">
        <div>
          <p className="text-base font-semibold text-gray-700">Vias para imprimir:</p>
          <div className="flex items-center gap-8 mt-2 text-base font-medium text-gray-800">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={printEmpresa} onChange={() => setPrintEmpresa(!printEmpresa)} className="w-5 h-5" />
              <span>1ª Via - Empresa</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={printCliente} onChange={() => setPrintCliente(!printCliente)} className="w-5 h-5" />
              <span>2ª Via - Cliente</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF} title="Download PDF" className="text-base">
            <Download className="w-5 h-5 mr-2" /> PDF
          </Button>
          {onEmail && (
            <Button variant="outline" onClick={onEmail} title="Enviar Email" className="text-base">
              <Mail className="w-5 h-5 mr-2" /> Email
            </Button>
          )}
          <Button variant="default" onClick={handlePrint} title="Imprimir" className="text-base">
            <Printer className="w-5 h-5 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      <div>
        {printEmpresa && <ReceiptContent data={data} copy="1ª VIA - EMPRESA" />}
        {printCliente && <ReceiptContent data={data} copy="2ª VIA - CLIENTE" />}
      </div>
    </section>
  );
}
