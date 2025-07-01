import React, { useState, useEffect, useCallback } from "react";
import { Receipt } from "lucide-react";
import { ReceiptData, Vehicle, PAYMENT_METHODS, SERVICE_TYPES } from "../types";
import { formatDocument, formatPlate, generateReceiptNumber } from "../utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Validação CPF/CNPJ (ideal mover para utils.ts)
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === parseInt(cpf[10]);
};

const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string) => {
    let length = base.length;
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i > 0; i--) {
      sum += parseInt(base.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const base = cnpj.slice(0, 12);
  const digits = cnpj.slice(12);

  return (
    calcCheckDigit(base) === parseInt(digits.charAt(0)) &&
    calcCheckDigit(base + digits.charAt(0)) === parseInt(digits.charAt(1))
  );
};

interface Props {
  onSubmit: (data: ReceiptData) => void;
}

export function ReceiptForm({ onSubmit }: Props) {
  const [payerDocument, setPayerDocument] = useState("");
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ReceiptData["paymentMethod"]>("PIX");
  const [serviceType, setServiceType] = useState<ReceiptData["serviceType"]>("ADHESION");
  const [vehicles, setVehicles] = useState<Vehicle[]>([{ plate: "" }]);
  const [isDocumentValid, setIsDocumentValid] = useState(true);

  useEffect(() => {
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (rawDoc.length === 11) {
      setIsDocumentValid(validateCPF(rawDoc));
    } else if (rawDoc.length === 14) {
      setIsDocumentValid(validateCNPJ(rawDoc));
    } else {
      setIsDocumentValid(true);
    }
  }, [payerDocument]);

  const handleVehicleChange = useCallback((index: number, plate: string) => {
    setVehicles((prev) => {
      const updated = [...prev];
      updated[index] = { plate: formatPlate(plate) };
      return updated;
    });
  }, []);

  const addVehicle = useCallback(() => {
    setVehicles((prev) => (prev.length < 99 ? [...prev, { plate: "" }] : prev));
  }, []);

  const removeVehicle = useCallback((index: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
      vehicles: vehicles.filter((v) => v.plate.length === 8),
      receiptNumber: generateReceiptNumber(),
      emissionDate: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <header className="flex items-center justify-center space-x-2 text-blue-600">
        <Receipt size={32} />
        <h1 className="text-2xl font-bold">Gerador de Recibos</h1>
      </header>

      <div>
        <Label htmlFor="payerDocument">CPF/CNPJ</Label>
        <Input
          id="payerDocument"
          type="text"
          value={payerDocument}
          onChange={(e) => setPayerDocument(formatDocument(e.target.value))}
          maxLength={18}
          required
          className={
            !isDocumentValid && payerDocument.replace(/\D/g, "").length >= 11
              ? "border-red-500"
              : ""
          }
        />
        {!isDocumentValid && payerDocument.replace(/\D/g, "").length >= 11 && (
          <p className="text-red-500 text-sm mt-1">
            Documento inválido. Verifique o CPF ou CNPJ.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="payerName">Nome Completo</Label>
        <Input
          id="payerName"
          type="text"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step={0.01}
          min={0}
          required
        />
      </div>

      <div>
        <Label htmlFor="dueDate">
          Data de Vencimento (Para sair a data de vencimento correta, acrescente o vencimento pro dia seguinte)
        </Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="paymentMethod">Método de Pagamento</Label>
        <Select
          value={paymentMethod}
          onValueChange={(val) => setPaymentMethod(val as ReceiptData["paymentMethod"])}
        >
          <SelectTrigger id="paymentMethod" className="w-full">
            <SelectValue placeholder="Selecione o método de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="serviceType">Tipo de Serviço</Label>
        <Select
          value={serviceType}
          onValueChange={(val) => setServiceType(val as ReceiptData["serviceType"])}
        >
          <SelectTrigger id="serviceType" className="w-full">
            <SelectValue placeholder="Selecione o tipo de serviço" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Veículos</Label>
          <Button
            type="button"
            variant="link"
            onClick={addVehicle}
            disabled={vehicles.length >= 99}
          >
            + Adicionar Veículo
          </Button>
        </div>

        {vehicles.map(({ plate }, i) => (
          <div key={i} className="flex space-x-2">
            <Input
              type="text"
              value={plate}
              onChange={(e) => handleVehicleChange(i, e.target.value)}
              placeholder="ABC-1234"
              maxLength={8}
              required
            />
            {vehicles.length > 1 && (
              <Button
                type="button"
                variant="link"
                className="text-red-600 hover:text-red-500"
                onClick={() => removeVehicle(i)}
              >
                Remover
              </Button>
            )}
          </div>
        ))}
      </section>

      <Button type="submit" className="w-full" disabled={!isDocumentValid}>
        Gerar Recibo
      </Button>
    </form>
  );
}
