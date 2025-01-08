# Receipt React Program

Este projeto é uma aplicação em React para gerar e gerenciar recibos. A aplicação permite que os usuários criem recibos personalizados, baixem-nos em formato PDF e os enviem por e-mail.

## Funcionalidades

- **Formulário para criação de recibos:** Os usuários podem inserir informações detalhadas, como o nome do cliente, número do recibo, valor, e outros detalhes.
- **Visualização de recibos:** Uma visualização instantânea do recibo é gerada com os dados fornecidos.
- **Download de PDF:** Recibos podem ser baixados como arquivos PDF gerados dinamicamente.
- **Envio por e-mail:** A aplicação oferece a opção de enviar recibos diretamente para o e-mail do cliente.

## Tecnologias Utilizadas

- **Frontend:** React com TypeScript
- **Geração de PDF:** [html2canvas](https://html2canvas.hertzen.com/) e [jsPDF](https://github.com/parallax/jsPDF)
- **Envio de e-mails:** Integração com um servidor backend utilizando Node.js e o pacote [nodemailer](https://nodemailer.com/)
- **Estilização:** Tailwind CSS

## Instalação e Configuração

### Backend (Servidor de E-mail)
1. Instale as dependências necessárias:
   ```bash
   npm install express body-parser nodemailer cors
   ```

2. Configure o servidor de e-mail em `emailServer.js`:
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false, // TLS
     auth: {
       user: 'seuemail@gmail.com',
       pass: 'suasenhaouappkey',
     },
   });
   ```

3. Inicie o servidor backend:
   ```bash
   node emailServer.js
   ```

### Frontend
1. Clone o repositório:
   ```bash
   git clone https://github.com/lucasmateuslid/receipt_react_program.git
   ```

2. Navegue até o diretório do projeto e instale as dependências:
   ```bash
   cd receipt_react_program
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra o navegador e acesse:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
receipt_react_program/
├── src/
│   ├── components/
│   │   ├── ReceiptForm.tsx   // Componente de formulário para criação de recibos
│   │   ├── Receipt.tsx       // Componente para exibir o recibo gerado
│   ├── App.tsx               // Componente principal da aplicação
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   ├── utils.ts
│   ├── vite-env.d.ts
├── public/
├── emailServer.js            // Backend para envio de e-mails
├── vite.config.ts            // Configuração do Vite
└── README.md                 // Documentação do projeto
```

## Uso

1. Preencha o formulário com os dados do recibo.
2. Visualize o recibo gerado automaticamente.
3. Clique em **Download** para baixar o recibo como PDF.
4. Clique em **Enviar por E-mail** para enviá-lo ao destinatário.

## Melhorias Futuras

- Integração com serviços de e-mail como SendGrid ou Amazon SES.
- Implementação de autenticação de usuários.
- Adição de um banco de dados para armazenar recibos gerados.
- Traduções para suporte a múltiplos idiomas.

## Contribuições

Contribuições são bem-vindas! Por favor, envie um pull request com suas melhorias ou abra uma issue para discutir alterações.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

