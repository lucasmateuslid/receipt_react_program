import React, { useState, useEffect, useCallback } from "react";
import { Receipt, PlusCircle, Trash2, User, Calendar, DollarSign, Car, FileText, CreditCard, Briefcase } from "lucide-react";
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
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function showLoadingToast(message: string) {
  return toast.loading(message);
}
function dismissToast(id: string) {
  toast.dismiss(id);
}
function dismissToastAfter(id: string, ms: number) {
  setTimeout(() => toast.dismiss(id), ms);
}

function isValidCPF(cpf: string): boolean {
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
}

function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base: string): number => {
    let sum = 0;
    let pos = base.length - 7;
    for (let i = base.length; i > 0; i--) {
      sum += parseInt(base.charAt(base.length - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11;
    return result < 2 ? 0 : 11 - result;
  };
  const base = cnpj.slice(0, 12);
  const digits = cnpj.slice(12);
  return calc(base) === parseInt(digits.charAt(0)) && calc(base + digits.charAt(0)) === parseInt(digits.charAt(1));
}

async function fetchClienteStatus(cpfCnpjCliente: string) {
  const loadingId = showLoadingToast("Buscando status do cliente...");
  dismissToastAfter(loadingId, 2000);
  try {
    const response = await fetch(`${BACKEND_URL}/obterStatusCliente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpfCnpjCliente }),
    });
    dismissToast(loadingId);
    if (!response.ok) throw new Error("Erro ao buscar status do cliente");
    const result = await response.json();
    toast.success("Status do cliente carregado!", { duration: 1000 });
    return result;
  } catch (err) {
    dismissToast(loadingId);
    toast.error("Erro ao buscar status do cliente", { duration: 1000 });
    return null;
  }
}

async function fetchVehicleData(plate: string, cpfCnpjCliente: string) {
  const loadingId = showLoadingToast(`Buscando veículo: ${plate}`);
  dismissToastAfter(loadingId, 2000);
  try {
    const response = await fetch(`${BACKEND_URL}/obterDadosVeiculo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placa: plate, cpfCnpjCliente }),
    });
    dismissToast(loadingId);
    if (!response.ok) throw new Error("Erro ao buscar dados do veículo");
    const result = await response.json();
    toast.success("Veículo carregado!", { duration: 1000 });
    return result;
  } catch (err) {
    dismissToast(loadingId);
    toast.error("Erro ao buscar dados do veículo", { duration: 1000 });
    return null;
  }
}

interface VehicleWithDetails extends Vehicle {
  modelo?: string;
  chassi?: string;
  renavam?: string;
}

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
  const [vehicles, setVehicles] = useState<VehicleWithDetails[]>([{ plate: "" }]);
  const [isDocumentValid, setIsDocumentValid] = useState(false);

  useEffect(() => {
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (rawDoc.length === 11) setIsDocumentValid(isValidCPF(rawDoc));
    else if (rawDoc.length === 14) setIsDocumentValid(isValidCNPJ(rawDoc));
    else setIsDocumentValid(false);
  }, [payerDocument]);

  useEffect(() => {
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (!isDocumentValid || rawDoc.length === 0) return;
    fetchClienteStatus(rawDoc).then((data) => {
      if (data?.nome) setPayerName(data.nome);
    });
  }, [isDocumentValid, payerDocument]);

  const handleVehicleChange = useCallback(async (index: number, plate: string) => {
    const formatted = formatPlate(plate);
    setVehicles((prev) => {
      const newVehicles = [...prev];
      newVehicles[index] = { ...newVehicles[index], plate: formatted };
      return newVehicles;
    });
    const rawDoc = payerDocument.replace(/\D/g, "");
    if (isDocumentValid && formatted.length >= 7) {
      const vehicleData = await fetchVehicleData(formatted, rawDoc);
      if (vehicleData) {
        setVehicles((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            modelo: vehicleData.modelo || "",
            chassi: vehicleData.chassi || "",
            renavam: vehicleData.renavam || "",
          };
          return updated;
        });
      }
    }
  }, [payerDocument, isDocumentValid]);

  const addVehicle = useCallback(() => {
    setVehicles((prev) => prev.length < 99 ? [...prev, { plate: "" }] : prev);
  }, []);

  const removeVehicle = useCallback((index: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDocumentValid) return toast.error("Documento inválido");
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
    toast.success("Recibo gerado com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-6 bg-card text-foreground rounded-2xl shadow-xl border border-border">
      <header className="flex items-center justify-center space-x-3 text-primary mb-6">
        <Receipt size={36} className="text-blue-500" />
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">Gerador de Recibos</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="payerDocument" className="flex items-center gap-2"><FileText size={16} /> CPF/CNPJ</Label>
          <Input id="payerDocument" value={payerDocument} onChange={(e) => setPayerDocument(formatDocument(e.target.value))} maxLength={18} required className="bg-background text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <Label htmlFor="payerName" className="flex items-center gap-2"><User size={16} /> Nome Completo</Label>
          <Input id="payerName" value={payerName} onChange={(e) => setPayerName(e.target.value)} required className="bg-background text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <Label htmlFor="amount" className="flex items-center gap-2"><DollarSign size={16} /> Valor (R$)</Label>
          <Input id="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-background text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <Label htmlFor="dueDate" className="flex items-center gap-2"><Calendar size={16} /> Data de Vencimento</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="bg-background text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <Label htmlFor="paymentMethod" className="flex items-center gap-2"><CreditCard size={16} /> Método de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as ReceiptData["paymentMethod"])}>
            <SelectTrigger className="w-full bg-background text-foreground">
              <SelectValue placeholder="Selecione o método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(({ id, label }) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="serviceType" className="flex items-center gap-2"><Briefcase size={16} /> Tipo de Serviço</Label>
          <Select value={serviceType} onValueChange={(val) => setServiceType(val as ReceiptData["serviceType"])}>
            <SelectTrigger className="w-full bg-background text-foreground">
              <SelectValue placeholder="Selecione o tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map(({ id, label }) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2"><Car size={16} /> Veículos</Label>
          <Button variant="secondary" onClick={addVehicle} type="button" className="gap-1">
            <PlusCircle className="h-4 w-4" /> Adicionar Veículo
          </Button>
        </div>
        {vehicles.map((v, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              placeholder="Placa"
              value={v.plate}
              onChange={(e) => handleVehicleChange(i, e.target.value)}
              className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
            />
            {vehicles.length > 1 && (
              <Button type="button" variant="ghost" onClick={() => removeVehicle(i)}>
                <Trash2 className="text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="submit"
        variant="default"
        className="w-full text-lg py-3 sm:py-4 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
        disabled={!isDocumentValid}
      >
        Gerar Recibo
      </Button>
    </form>
  );
}
