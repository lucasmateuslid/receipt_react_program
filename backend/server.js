import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const TOKEN = process.env.TOKEN;

// ✅ Permitir múltiplas origens no CORS
const allowedOrigins = [
  "http://localhost:5173",                   // desenvolvimento local
  process.env.FRONTEND_ORIGIN,              // origem definida no Render
].filter(Boolean); // remove undefined

if (!TOKEN) {
  throw new Error("⚠️ TOKEN da API não definido. Configure a variável de ambiente.");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("⛔ Origem não permitida pelo CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 Rota de teste (wake)
app.get("/wake", (req, res) => {
  console.log("🔔 API acordada via /wake");
  res.json({ status: "API INICIADA – AGUARDA ENTRADAS" });
});

// 🔁 Função auxiliar
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

// 🧾 Rota: Status do cliente
app.post("/obterStatusCliente", async (req, res) => {
  const { cpfCnpjCliente = "" } = req.body;
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

// 🧾 Rota: Dados do veículo
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

// 🟢 Iniciar servidor
app.listen(PORT, () => {
  const isRender = process.env.RENDER === "true" || process.env.NODE_ENV === "production";
  const baseURL = isRender ? `https://SEU_DOMINIO.onrender.com` : `http://localhost:${PORT}`;
  console.log(`🚀 Servidor rodando em: ${baseURL}`);
});
