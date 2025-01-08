import React from 'react';
import { Receipt as ReceiptIcon, Download, Mail, QrCode, Loader2, Scissors } from 'lucide-react';
import { ReceiptData, PAYMENT_METHODS, SERVICE_TYPES } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  data: ReceiptData;
  type?: 'CLIENT' | 'COMPANY';
  onDownload?: () => void;
  onEmail?: () => void;
  isDownloading?: boolean;
}

function ReceiptContent({ data, copy }: { data: ReceiptData; copy: '1ª VIA - EMPRESA' | '2ª VIA - PAGADOR' }) {
  const paymentMethod = PAYMENT_METHODS.find(m => m.id === data.paymentMethod)?.label;
  const serviceType = SERVICE_TYPES.find(s => s.id === data.serviceType)?.label;

  return (
    <div className="bg-white p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <ReceiptIcon size={28} className="text-gray-400" />
          <div>
            <h2 className="text-lg font-medium">Recibo Digital</h2>
            <p className="text-sm text-gray-500">#{data.receiptNumber}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-gray-500">{copy}</div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">BENEFICIÁRIO</h3>
          <div className="text-gray-700">
            <p className="font-medium">Mais Solucoes em Monitoramento LTDA</p>
            <p>CNPJ: 41.365.885/0001-00</p>
            <p>Avenida Senador Salgado Filho, 1718 BL Tirol Way - Offi</p>
            <p>Natal/RN</p>
            <p>Contato: (84) 4042-0869</p>
            <p>Banco: CORA</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">PAGADOR</h3>
          <div className="text-gray-700">
            <p>Nome: {data.payerName}</p>
            <p>CPF/CNPJ: {data.payerDocument}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">DETALHES DO PAGAMENTO</h3>
          <div className="text-gray-700">
            <p>Valor: {formatCurrency(data.amount)}</p>
            <p>Data de Vencimento: {new Date(data.dueDate).toLocaleDateString('pt-BR')}</p>
            <p>Método de Pagamento: {paymentMethod}</p>
            <p>Tipo de Serviço: {serviceType}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">VEÍCULOS</h3>
          <ul className="list-disc list-inside text-gray-700">
            {data.vehicles.map((vehicle, index) => (
              <li key={index}>Placa: {vehicle.plate}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">INFORMAÇÕES DO RECIBO</h3>
          <div className="text-gray-700">
            <p>Data de Emissão: {new Date(data.emissionDate).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8">
          <div className="space-y-2">
            <img src="https://github.com/lucasmateuslid/receipt_react_program/blob/main/src/components/imgs/assign.png" alt="Signature" className="rotateimg mx-auto h-12 transform"/>
            <div className="border-b-2 border-gray-300 pb-1"></div>
            <div className="text-center text-sm text-gray-600">
                <p className="font-medium">Mais Solucoes em Monitoramento LTDA</p>
              <p>CNPJ: 41.365.885/0001-00</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="border-b-2 border-gray-300 pb-1"></div>
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">{data.payerName}</p>
              <p>{data.payerDocument}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Receipt({ data, type = 'CLIENT', onDownload, onEmail, isDownloading }: Props) {
  return (
    <div id="receipt" className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="flex justify-end p-4 bg-gray-50 border-b">
        {onDownload && (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
          </button>
        )}
        {onEmail && (
          <button
            onClick={onEmail}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Enviar por Email"
          >
            <Mail size={20} />
          </button>
        )}
      </div>

      <ReceiptContent data={data} copy="RECIBO DE SERVIÇO/PRODUTO" />

    </div>
  );
}
