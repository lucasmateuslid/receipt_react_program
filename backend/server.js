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

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN =
  "35682f316a316e372f6f58695837556d656e7952645531584866584468425179534a5a686c3630636b393138626547326b525a5a2b696b6467686c5a46367149534f6f4c4838346c49615278682b6b4c645343734a544c386f55315977374d68582f794e525047576974303d";

// Rota proxy para obterDadosVeiculo
app.post("/obterDadosVeiculo", async (req, res) => {
  try {
    const { chassi = "", placa = "", imei = "", cpfCnpjCliente = "" } = req.body;

    console.log("Recebido em /obterDadosVeiculo:", req.body);

    if ((!chassi && !placa && !imei) || !cpfCnpjCliente) {
      console.warn("Faltando chassi/placa/imei ou cpfCnpjCliente");
      return res.status(400).json({
        error: "Informe chassi ou placa ou imei, e o cpfCnpjCliente",
      });
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append(
      "json",
      JSON.stringify({ chassi, placa, imei, cpfCnpjCliente })
    );

    console.log("Corpo enviado para RedeVeículos /obterDadosVeiculo:", urlencoded.toString());

    const response = await fetch(
      "https://integracao.redeveiculos.com/api/v2/sandbox/obterDadosVeiculo/",
      {
        method: "POST",
        headers: {
          Authorization: TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlencoded.toString(),
      }
    );

    console.log("Resposta da API RedeVeículos status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro da API RedeVeículos:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    console.log("Dados recebidos da API RedeVeículos /obterDadosVeiculo:", data);
    res.json(data);
  } catch (error) {
    console.error("Erro na requisição para RedeVeículos /obterDadosVeiculo:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Rota proxy para obterStatusCliente
app.post("/obterStatusCliente", async (req, res) => {
  try {
    const { cpfCnpjCliente = "" } = req.body;

    console.log("Recebido em /obterStatusCliente:", req.body);

    if (!cpfCnpjCliente) {
      console.warn("Faltando cpfCnpjCliente");
      return res.status(400).json({
        error: "Informe o cpfCnpjCliente",
      });
    }

    const urlencoded = new URLSearchParams();
    urlencoded.append("json", JSON.stringify({ cpfCnpjCliente }));

    console.log("Corpo enviado para RedeVeículos /obterStatusCliente:", urlencoded.toString());

    const response = await fetch(
      "https://integracao.redeveiculos.com/api/v2/sandbox/obterStatusCliente/",
      {
        method: "POST",
        headers: {
          Authorization: TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlencoded.toString(),
      }
    );

    console.log("Resposta da API RedeVeículos status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro da API RedeVeículos:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    console.log("Dados recebidos da API RedeVeículos /obterStatusCliente:", data);
    res.json(data);
  } catch (error) {
    console.error("Erro na requisição para RedeVeículos /obterStatusCliente:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
