import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 4000;
const FRONTEND_ORIGIN = "http://localhost:5173";

const TOKEN =
  "6d4a4f574d6452515676375572433143542f522b6536653143304b39356b47355a4b656d6530457845786852536c4f48746558413259566a547a31647856765473416a5845664f4b6f6279573473627a3969322f786a41484f714b576f2f4872307779422f4c78447156553d";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Função utilitária para enviar requisições para a RedeVeículos no formato correto
async function enviarParaRedeVeiculos(endpoint, payload) {
  // Construindo o body como URL encoded com campo "json" contendo o JSON stringificado
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

// Rota: obterStatusCliente
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
    console.log("✅ Resposta /obterStatusCliente:", data);

    return res.status(status).json(data);
  } catch (error) {
    console.error("❌ Erro /obterStatusCliente:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota: obterDadosVeiculo
app.post("/obterDadosVeiculo", async (req, res) => {
  let { placa = "", cpfCnpjCliente = "" } = req.body;

  // Remove o hífen da placa e deixa em maiúsculo
  if (placa) {
    placa = placa.replace(/-/g, "").toUpperCase();
  }

  console.log("➡️  /obterDadosVeiculo:", { placa, cpfCnpjCliente });

  if (!placa || !cpfCnpjCliente) {
    return res
      .status(400)
      .json({ error: "Informe placa e cpfCnpjCliente" });
  }

  try {
    const { status, data } = await enviarParaRedeVeiculos("obterDadosVeiculo", {
      placa,
      cpfCnpjCliente,
    });

    console.log("✅ Resposta /obterDadosVeiculo:", data);
    return res.status(status).json(data);
  } catch (error) {
    console.error("❌ Erro /obterDadosVeiculo:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
