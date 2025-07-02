import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis do .env

const app = express();

// Porta que o Render vai fornecer dinamicamente
const PORT = process.env.PORT || 4000;

// Origem permitida (local ou produção)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Token da API Rede Veículos
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  throw new Error("⚠️ TOKEN da API não definido. Configure a variável de ambiente.");
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function enviarParaRedeVeiculos(endpoint, payload) {
  const urlencoded = new URLSearchParams();
  urlencoded.append("json", JSON.stringify(payload));

  console.log(`Enviando para /${endpoint} o body:`, urlencoded.toString());

  const response = await fetch(
    `https://integracao.redeveiculos.com/api/v2/prod/${endpoint}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlencoded.toString(),
    }
  );

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { error: true, message: "Resposta da API não está em JSON" };
  }

  return { status: response.status, data };
}

app.post("/obterStatusCliente", async (req, res) => {
  const { cpfCnpjCliente = "" } = req.body;

  console.log("➡️  /obterStatusCliente:", { cpfCnpjCliente });

  if (!cpfCnpjCliente) {
    return res.status(400).json({ error: "Informe o cpfCnpjCliente" });
  }

  try {
    const { status, data } = await enviarParaRedeVeiculos("obterStatusCliente", {
      cpfCnpjCliente,
    });
    return res.status(status).json(data);
  } catch (error) {
    console.error("❌ Erro /obterStatusCliente:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.post("/obterDadosVeiculo", async (req, res) => {
  let { placa = "", cpfCnpjCliente = "" } = req.body;

  if (placa) placa = placa.replace(/-/g, "").toUpperCase();

  if (!placa || !cpfCnpjCliente) {
    return res.status(400).json({ error: "Informe placa e cpfCnpjCliente" });
  }

  try {
    const { status, data } = await enviarParaRedeVeiculos("obterDadosVeiculo", {
      placa,
      cpfCnpjCliente,
    });
    return res.status(status).json(data);
  } catch (error) {
    console.error("❌ Erro /obterDadosVeiculo:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
