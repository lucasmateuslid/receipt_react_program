import React, { useState, useEffect } from 'react';
import { Receipt } from "lucide-react";
import { ReceiptData, Vehicle, PAYMENT_METHODS, SERVICE_TYPES } from "../types";
import { formatDocument, formatPlate, generateReceiptNumber } from "../utils";

interface Props {
  onSubmit: (data: ReceiptData) => void;
}

export function ReceiptForm({ onSubmit }: Props) {
  const [payerDocument, setPayerDocument] = useState('');
  const [payerName, setPayerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ReceiptData['paymentMethod']>('PIX');
  const [serviceType, setServiceType] = useState<ReceiptData['serviceType']>('ADHESION');
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ plate: '' }]);
  const [isDocumentValid, setIsDocumentValid] = useState(true);

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, remainder;

    for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;

    return remainder === parseInt(cpf[10]);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const t = cnpj.length - 2;
    const d = cnpj.substring(t);
    const calc = (x: number) => {
      let n = cnpj.substring(0, x);
      let y = x - 7;
      let s = 0, r = 0;

      for (let i = x; i >= 1; i--) {
        s += parseInt(n[x - i]) * y--;
        if (y < 2) y = 9;
      }

      r = 11 - s % 11;
      return (r > 9 ? 0 : r);
    };

    return calc(t) === parseInt(d[0]) && calc(t + 1) === parseInt(d[1]);
  };

  useEffect(() => {
    const rawDoc = payerDocument.replace(/[^\d]/g, '');
    if (rawDoc.length === 11) {
      setIsDocumentValid(validateCPF(rawDoc));
    } else if (rawDoc.length === 14) {
      setIsDocumentValid(validateCNPJ(rawDoc));
    } else {
      setIsDocumentValid(true); // Não exibe mensagem de erro enquanto não tiver 11 ou 14 dígitos.
    }
  }, [payerDocument]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDocumentValid) return;

    onSubmit({
      payerDocument,
      payerName,
      amount: parseFloat(amount),
      dueDate,
      paymentMethod,
      serviceType,
      vehicles: vehicles.filter(v => v.plate.length === 8),
      receiptNumber: generateReceiptNumber(),
      emissionDate: new Date().toISOString(),
    });
  };

  const handleVehicleChange = (index: number, plate: string) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = { plate: formatPlate(plate) };
    setVehicles(newVehicles);
  };

  const addVehicle = () => {
    if (vehicles.length < 99) {
      setVehicles([...vehicles, { plate: '' }]);
    }
  };

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-center space-x-2 text-blue-600">
        <Receipt size={32} />
        <h1 className="text-2xl font-bold">Gerador de Recibos</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
          <input
            type="text"
            value={payerDocument}
            onChange={(e) => setPayerDocument(formatDocument(e.target.value))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!isDocumentValid && payerDocument.replace(/[^\d]/g, '').length >= 11 ? 'border-red-500' : ''}`}
            required
            maxLength={18}
          />
          {payerDocument.replace(/[^\d]/g, '').length >= 11 && !isDocumentValid && (
            <p className="text-red-500 text-sm mt-1">Documento inválido. Verifique o CPF ou CNPJ.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <input
            type="text"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Vencimento  (Para sair a data de vencimento correta, acrescentar o vencimento pro dia seguinte)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as ReceiptData['paymentMethod'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method.id} value={method.id}>{method.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ReceiptData['serviceType'])}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {SERVICE_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">Veículos</label>
            <button
              type="button"
              onClick={addVehicle}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={vehicles.length >= 99}
            >
              + Adicionar Veículo
            </button>
          </div>
          {vehicles.map((vehicle, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={vehicle.plate}
                onChange={(e) => handleVehicleChange(index, e.target.value)}
                placeholder="ABC-1234"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                maxLength={8}
                required
              />
              {vehicles.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVehicle(index)}
                  className="text-red-600 hover:text-red-500"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        disabled={!isDocumentValid}
      >
        Gerar Recibo
      </button>
    </form>
  );
}
