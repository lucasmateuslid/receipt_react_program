import React, { useState } from "react";
import {
  Receipt as ReceiptIcon,
  Download,
  Mail,
  Printer,
} from "lucide-react";
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

function ReceiptContent({
  data,
  copy,
}: {
  data: ReceiptData;
  copy: "1ª VIA - EMPRESA" | "2ª VIA - PAGADOR";
}) {
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === data.paymentMethod)?.label;
  const serviceType = SERVICE_TYPES.find((s) => s.id === data.serviceType)?.label;

  const formatLocalDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toLocaleDateString("pt-BR");
  };

  return (
    <article
      className="bg-white p-8 rounded-md shadow-sm border border-gray-200 mb-8 print:mb-0"
      style={{ pageBreakAfter: "always" }}
    >
      <header className="flex items-center justify-between border-b border-gray-300 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <ReceiptIcon size={30} className="text-gray-500" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Recibo Digital</h1>
            <p className="text-sm text-gray-500">Nº {data.receiptNumber}</p>
          </div>
        </div>
        <span className="font-semibold text-sm text-gray-600">{copy}</span>
      </header>

      {/* Beneficiário */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">BENEFICIÁRIO</Label>
        <address className="not-italic text-gray-700 space-y-1 text-sm">
          <p className="font-medium">Mais Solucoes em Monitoramento LTDA</p>
          <p>CNPJ: 41.365.885/0001-00</p>
          <p>Avenida Senador Salgado Filho, 1718 BL Tirol Way - Office Tower</p>
          <p>Natal/RN</p>
          <p>Contato: (84) 4042-0869</p>
          <p>Banco: ASAAS</p>
        </address>
      </section>

      {/* Pagador */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">PAGADOR</Label>
        <div className="text-gray-700 text-sm space-y-1">
          <p>Nome: <span className="font-medium">{data.payerName}</span></p>
          <p>CPF/CNPJ: <span className="font-mono">{data.payerDocument}</span></p>
        </div>
      </section>

      {/* Detalhes do pagamento */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">DETALHES DO PAGAMENTO</Label>
        <dl className="text-gray-700 text-sm space-y-1">
          <div><dt className="inline font-semibold">Valor: </dt><dd className="inline">{formatCurrency(data.amount)}</dd></div>
          <div><dt className="inline font-semibold">Data de Vencimento: </dt><dd className="inline">{formatLocalDate(data.dueDate)}</dd></div>
          <div><dt className="inline font-semibold">Método de Pagamento: </dt><dd className="inline">{paymentMethod}</dd></div>
          <div><dt className="inline font-semibold">Tipo de Serviço: </dt><dd className="inline">{serviceType}</dd></div>
        </dl>
      </section>

      {/* Veículos (opcional) */}
      {data.vehicles.length > 0 && (
        <section className="mb-6">
          <Label className="mb-1 block text-gray-700 font-semibold">VEÍCULOS</Label>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            {data.vehicles.map((vehicle, idx) => (
              <li key={idx} className="font-mono">
                Placa: {vehicle.plate}
                {vehicle.modelo && ` | Modelo: ${vehicle.modelo}`}
                {vehicle.chassi && ` | Chassi: ${vehicle.chassi}`}
                {vehicle.renavam && ` | Renavam: ${vehicle.renavam}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Info e assinatura */}
      <section className="mb-6 text-gray-700 text-sm">
        <Label className="mb-1 block font-semibold">INFORMAÇÕES DO RECIBO</Label>
        <p>Data de Emissão: {new Date(data.emissionDate).toLocaleString("pt-BR")}</p>
      </section>

      <footer className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-300">
        <div className="flex flex-col items-center space-y-2">
          <img
            src={assignSignature}
            alt="Assinatura"
            className="h-16 object-contain"
            style={{ maxWidth: "100px", transform: "rotate(270deg) scale(4.5)" }}
          />
          <div className="border-t border-gray-300 w-full" />
          <p className="text-center text-xs text-gray-600 font-semibold">
            Mais Solucoes em Monitoramento LTDA<br />CNPJ: 41.365.885/0001-00
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 mt-20">
          <div className="border-t border-gray-300 w-full" />
          <p className="text-center text-xs text-gray-600 font-semibold">
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

  // Geração de PDF com alta qualidade e páginas separadas por via
  const handleDownloadPDF = async () => {
    const elementsToHide = document.querySelectorAll(".print\\:hidden");

    // Oculta elementos que não devem aparecer no PDF
    elementsToHide.forEach((el) => (el as HTMLElement).style.display = "none");

    await new Promise((resolve) => setTimeout(resolve, 700));

    const articles = document.querySelectorAll("#receipt article");

    const pdf = new jsPDF();

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i] as HTMLElement;

      // Captura com resolução maior
      const canvas = await html2canvas(article, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save("recibo.pdf");

    // Reexibe os elementos ocultos
    setTimeout(() => {
      elementsToHide.forEach((el) => (el as HTMLElement).style.display = "");
    }, 150);
  };

  const handlePrint = () => {
    if (!printEmpresa && !printCliente) {
      alert("Selecione pelo menos uma via para imprimir.");
      return;
    }
    window.print();
  };

  return (
    <section id="receipt" className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 border-b border-gray-200 gap-4 print:hidden">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-600 mb-1">Selecionar vias:</span>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printEmpresa}
                onChange={() => setPrintEmpresa((v) => !v)}
                className="cursor-pointer"
              />
              <span>1ª Via - Empresa</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printCliente}
                onChange={() => setPrintCliente((v) => !v)}
                className="cursor-pointer"
              />
              <span>2ª Via - Cliente</span>
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleDownloadPDF} title="Download PDF">
            <Download />
          </Button>
          {onEmail && (
            <Button variant="ghost" size="icon" onClick={onEmail} title="Enviar por Email">
              <Mail />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handlePrint} title="Imprimir Recibos">
            <Printer />
          </Button>
        </div>
      </div>

      {/* Conteúdo dos recibos */}
      <div>
        {printEmpresa && <ReceiptContent data={data} copy="1ª VIA - EMPRESA" />}
        {printCliente && <ReceiptContent data={data} copy="2ª VIA - PAGADOR" />}
      </div>
    </section>
  );
}
