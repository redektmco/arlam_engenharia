# Planilha de respostas do formulário

Guarda uma cópia de cada envio do formulário, mesmo que a pessoa desista antes de mandar a mensagem no WhatsApp.

## Passo a passo (uns 5 minutos)

1. Crie uma planilha nova no Google Sheets (de preferência na conta da Arflam). Nome sugerido: **Leads LP Arflam**.
2. No menu da planilha: **Extensões → Apps Script**.
3. Apague o que estiver lá, cole todo o conteúdo do arquivo `Codigo.gs` desta pasta e clique em **Salvar**.
4. Clique em **Implantar → Nova implantação**.
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar**, autorize com a conta Google e **copie a URL** que termina em `/exec`.
6. Abra `assets/js/config.js` e cole a URL no lugar de `"PENDENTE"` em `planilhaUrl`.

Pronto: cada envio vira uma linha na planilha, com data, respostas e a versão da página (A ou B).
