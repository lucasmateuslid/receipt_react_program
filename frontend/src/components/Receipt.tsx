import React, { useState } from "react";
import {
  Receipt as ReceiptIcon,
  Download,
  Mail,
  Loader2,
  Printer,
} from "lucide-react";

import { ReceiptData, PAYMENT_METHODS, SERVICE_TYPES } from "../types";
import { formatCurrency } from "../utils";
import assignSignature from "./imgs/assign.png";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  data: ReceiptData;
  onDownload?: () => void;
  onEmail?: () => void;
  isDownloading?: boolean;
}

function ReceiptContent({
  data,
  copy,
}: {
  data: ReceiptData;
  copy: "1ª VIA - EMPRESA" | "2ª VIA - PAGADOR" | "RECIBO DE SERVIÇO/PRODUTO";
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

      {/* BENEFICIÁRIO */}
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

      {/* PAGADOR */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">PAGADOR</Label>
        <div className="text-gray-700 text-sm space-y-1">
          <p>Nome: <span className="font-medium">{data.payerName}</span></p>
          <p>CPF/CNPJ: <span className="font-mono">{data.payerDocument}</span></p>
        </div>
      </section>

      {/* DETALHES */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">DETALHES DO PAGAMENTO</Label>
        <dl className="text-gray-700 text-sm space-y-1">
          <div><dt className="inline font-semibold">Valor: </dt><dd className="inline">{formatCurrency(data.amount)}</dd></div>
          <div><dt className="inline font-semibold">Data de Vencimento: </dt><dd className="inline">{formatLocalDate(data.dueDate)}</dd></div>
          <div><dt className="inline font-semibold">Método de Pagamento: </dt><dd className="inline">{paymentMethod}</dd></div>
          <div><dt className="inline font-semibold">Tipo de Serviço: </dt><dd className="inline">{serviceType}</dd></div>
        </dl>
      </section>

      {/* VEÍCULOS */}
      {data.vehicles.length > 0 && (
        <section className="mb-6">
          <Label className="mb-1 block text-gray-700 font-semibold">VEÍCULOS</Label>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            {data.vehicles.map((vehicle, idx) => (
              <li key={idx} className="font-mono">
                Placa: {vehicle.plate}
                {/* Mostra os dados extras só se existirem */}
                {vehicle.modelo && ` | Modelo: ${vehicle.modelo}`}
                {vehicle.chassi && ` | Chassi: ${vehicle.chassi}`}
                {vehicle.renavam && ` | Renavam: ${vehicle.renavam}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* INFORMAÇÕES */}
      <section className="mb-6 text-gray-700 text-sm">
        <Label className="mb-1 block font-semibold">INFORMAÇÕES DO RECIBO</Label>
        <p>Data de Emissão: {new Date(data.emissionDate).toLocaleString("pt-BR")}</p>
      </section>

      {/* ASSINATURAS */}
      <footer className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-300">
        <div className="flex flex-col items-center space-y-2">
          <img
            src={assignSignature}
            alt="Assinatura"
            className="h-16 object-contain rotate-90"
            style={{ maxWidth: "100px", transform: "rotate(270deg) scale(4.5)" }}
          />
          <div className="border-t border-gray-300 w-full"></div>
          <p className="text-center text-xs text-gray-600 font-semibold">
            Mais Solucoes em Monitoramento LTDA<br />CNPJ: 41.365.885/0001-00
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 mt-8">
          <div className="border-t border-gray-300 w-full"></div>
          <p className="text-center text-xs text-gray-600 font-semibold">
            {data.payerName}<br />{data.payerDocument}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function Receipt({ data, onDownload, onEmail, isDownloading }: Props) {
  const [printEmpresa, setPrintEmpresa] = useState(true);
  const [printCliente, setPrintCliente] = useState(true);

  const handlePrint = () => {
    if (!printEmpresa && !printCliente) {
      alert("Selecione pelo menos uma via para imprimir.");
      return;
    }
    window.print();
  };

  return (
    <section id="receipt" className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* AÇÕES E CONTROLE */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 border-b border-gray-200 gap-4 print:hidden">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-600 mb-1">Selecionar vias:</span>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={printEmpresa}
                onChange={() => setPrintEmpresa((v) => !v)}
                className="cursor-pointer"
              />
              <span>1ª Via - Empresa</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer select-none">
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
          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload} disabled={isDownloading} title="Download PDF">
              {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
            </Button>
          )}
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

      {/* CONTEÚDO DAS VIAS */}
      <div>
        {printEmpresa && <ReceiptContent data={data} copy="1ª VIA - EMPRESA" />}
        {printCliente && <ReceiptContent data={data} copy="2ª VIA - PAGADOR" />}
      </div>
    </section>
  );
}
