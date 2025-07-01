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

// Valida CPF
const isValidCPF = (cpf: string): boolean => {
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

// Valida CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string): number => {
    let length = base.length;
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i > 0; i--) {
      sum += parseInt(base.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };

  const base = cnpj.slice(0, 12);
  const digits = cnpj.slice(12);

  return (
    calcCheckDigit(base) === parseInt(digits.charAt(0)) &&
    calcCheckDigit(base + digits.charAt(0)) === parseInt(digits.charAt(1))
  );
};

// Defina a URL base do backend
const BACKEND_URL = "http://localhost:4000";

// Busca status do cliente via backend
async function fetchClienteStatus(cpfCnpjCliente: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/obterStatusCliente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpfCnpjCliente }),
    });
    if (!response.ok) throw new Error("Erro ao buscar status do cliente");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar status do cliente:", error);
    return null;
  }
}

// Busca dados do veículo via backend
async function fetchVehicleData(plate: string, cpfCnpjCliente: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/obterDadosVeiculo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placa: plate, cpfCnpjCliente }),
    });
    if (!response.ok) throw new Error("Erro ao buscar dados do veículo");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar dados do veículo:", error);
    return null;
  }
}


interface VehicleWithDetails extends Vehicle {
  modelo?: string;
  chassi?: string;
  renavam?: string;
}

interface VehicleInputProps {
  vehicles: VehicleWithDetails[];
  onChange: (index: number, plate: string) => void;
  onRemove: (index: number) => void;
}

const VehicleInputs: React.FC<VehicleInputProps> = ({
  vehicles,
  onChange,
  onRemove,
}) => (
  <>
    {vehicles.map(({ plate }, i) => (
      <div key={i} className="flex space-x-2 items-center">
        <Input
          type="text"
          value={plate}
          onChange={(e) => onChange(i, e.target.value)}
          placeholder="ABC-1234"
          maxLength={8}
          required
        />
        {vehicles.length > 1 && (
          <Button
            type="button"
            variant="link"
            className="text-red-600 hover:text-red-500"
            onClick={() => onRemove(i)}
          >
            Remover
          </Button>
        )}
      </div>
    ))}
  </>
);

interface Props {
  onSubmit: (data: ReceiptData) => void;
}

export function ReceiptForm({ onSubmit }: Props) {
  const [payerDocument, setPayerDocument] = useState("");
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ReceiptData["paymentMethod"]>(
    "PIX"
  );
  const [serviceType, setServiceType] = useState<ReceiptData["serviceType"]>(
    "ADHESION"
  );
  const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([{ plate: "" }]);
  const [isDocumentValid, setIsDocumentValid] = useState(false);

  // Valida CPF/CNPJ
  useEffect(() => {
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (rawDoc.length === 11) setIsDocumentValid(isValidCPF(rawDoc));
    else if (rawDoc.length === 14) setIsDocumentValid(isValidCNPJ(rawDoc));
    else setIsDocumentValid(false);
  }, [payerDocument]);

  // Ao validar documento, busca status do cliente e atualiza nome automaticamente
  useEffect(() => {
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (!isDocumentValid || rawDoc.length === 0) return;

    async function fetchStatus() {
      const statusData = await fetchClienteStatus(rawDoc);
      if (statusData?.nome) {
        setPayerName(statusData.nome);
      }
    }
    fetchStatus();
  }, [isDocumentValid, payerDocument]);

  // Atualiza placa do veículo e busca dados adicionais da API
  const handleVehicleChange = useCallback(
    async (index: number, plate: string) => {
      const formatted = formatPlate(plate);

      // Atualiza placa no estado
      setVehicles((old) => {
        const newVehicles = [...old];
        newVehicles[index] = { ...newVehicles[index], plate: formatted };
        return newVehicles;
      });

      // Só tenta buscar dados se documento válido e placa com tamanho esperado
      const rawDoc = payerDocument.replace(/\D/g, "");
      if (
        isDocumentValid &&
        (formatted.length === 7 || formatted.length === 8) &&
        rawDoc.length > 0
      ) {
        const vehicleData = await fetchVehicleData(formatted, rawDoc);

        if (vehicleData) {
          setVehicles((old) => {
            const newVehicles = [...old];
            // Atualiza os dados do veículo no índice correto
            newVehicles[index] = {
              ...newVehicles[index],
              plate: formatted,
              modelo: vehicleData.modelo || vehicleData.marca + " " + vehicleData.modelo || "",
              chassi: vehicleData.chassi || "",
              renavam: vehicleData.renavam || "",
            };
            return newVehicles;
          });
        }
      }
    },
    [payerDocument, isDocumentValid]
  );

  const addVehicle = useCallback(() => {
    setVehicles((old) => (old.length < 99 ? [...old, { plate: "" }] : old));
  }, []);

  const removeVehicle = useCallback((index: number) => {
    setVehicles((old) => old.filter((_, i) => i !== index));
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
      vehicles,
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
        <Label htmlFor="dueDate">Data de Vencimento</Label>
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
          onValueChange={(val) =>
            setPaymentMethod(val as ReceiptData["paymentMethod"])
          }
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
          onValueChange={(val) =>
            setServiceType(val as ReceiptData["serviceType"])
          }
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

        <VehicleInputs
          vehicles={vehicles}
          onChange={handleVehicleChange}
          onRemove={removeVehicle}
        />
      </section>

      <Button type="submit" className="w-full" disabled={!isDocumentValid}>
        Gerar Recibo
      </Button>
    </form>
  );
}
