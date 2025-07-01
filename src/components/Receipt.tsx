import React from "react";
import {
  Receipt as ReceiptIcon,
  Download,
  Mail,
  Loader2,
} from "lucide-react";

import { ReceiptData, PAYMENT_METHODS, SERVICE_TYPES } from "../types";
import { formatCurrency } from "../utils";
import assignSignature from "../components/imgs/assign.png";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Props {
  data: ReceiptData;
  type?: "CLIENT" | "COMPANY";
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
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === data.paymentMethod)
    ?.label;
  const serviceType = SERVICE_TYPES.find((s) => s.id === data.serviceType)?.label;

  const formatLocalDate = (date: string) => {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toLocaleDateString("pt-BR");
  };

  return (
    <article className="bg-white p-8 rounded-md shadow-sm border border-gray-200">
      {/* Header */}
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
          <p>Avenida Senador Salgado Filho, 1718 BL Tirol Way - Offi</p>
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

      {/* Detalhes do Pagamento */}
      <section className="mb-6">
        <Label className="mb-1 block text-gray-700 font-semibold">DETALHES DO PAGAMENTO</Label>
        <dl className="text-gray-700 text-sm space-y-1">
          <div>
            <dt className="inline font-semibold">Valor: </dt>
            <dd className="inline">{formatCurrency(data.amount)}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Data de Vencimento: </dt>
            <dd className="inline">{formatLocalDate(data.dueDate)}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Método de Pagamento: </dt>
            <dd className="inline">{paymentMethod}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Tipo de Serviço: </dt>
            <dd className="inline">{serviceType}</dd>
          </div>
        </dl>
      </section>

      {/* Veículos */}
      {data.vehicles.length > 0 && (
        <section className="mb-6">
          <Label className="mb-1 block text-gray-700 font-semibold">VEÍCULOS</Label>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            {data.vehicles.map((vehicle, idx) => (
              <li key={idx} className="font-mono">
                Placa: {vehicle.plate}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Informações do Recibo */}
      <section className="mb-6 text-gray-700 text-sm">
        <Label className="mb-1 block font-semibold">INFORMAÇÕES DO RECIBO</Label>
        <p>Data de Emissão: {new Date(data.emissionDate).toLocaleString("pt-BR")}</p>
      </section>

      {/* Assinaturas */}
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
            Mais Solucoes em Monitoramento LTDA<br />
            CNPJ: 41.365.885/0001-00
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="border-t border-gray-300 w-full"></div>
          <p className="text-center text-xs text-gray-600 font-semibold">
            {data.payerName}<br />
            {data.payerDocument}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function Receipt({
  data,
  type = "CLIENT",
  onDownload,
  onEmail,
  isDownloading,
}: Props) {
  return (
    <section
      id="receipt"
      className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
    >
      {/* Ações */}
      <div className="flex justify-end p-4 bg-gray-50 border-b border-gray-200 space-x-2">
        {onDownload && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            disabled={isDownloading}
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
          </Button>
        )}
        {onEmail && (
          <Button variant="ghost" size="icon" onClick={onEmail} title="Enviar por Email">
            <Mail />
          </Button>
        )}
      </div>

      <ReceiptContent
        data={data}
        copy={type === "CLIENT" ? "RECIBO DE SERVIÇO/PRODUTO" : "1ª VIA - EMPRESA"}
      />
    </section>
  );
}
