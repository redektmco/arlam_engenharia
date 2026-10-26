# LP Arflam Engenharia — Projeto estrutural

Landing page da Arflam Engenharia (V4 Company, Unidade Oliveira). Página estática: HTML, CSS e JavaScript, sem build.

## Onde trocar os dados pendentes

Tudo fica em **um arquivo só**: `assets/js/config.js`. Troque cada `"PENDENTE"`:

| Campo | O que colocar |
| --- | --- |
| `whatsapp` | Número que recebe os contatos, só números com 55 + DDD. Ex.: `5511999998888` |
| `cnpj`, `crea`, `endereco` | Dados do rodapé |
| `gtmId` | ID do Google Tag Manager. Ex.: `GTM-ABC1234` |
| `planilhaUrl` | URL do Apps Script da planilha (ver `google-apps-script/LEIA-ME.md`) |

Enquanto o WhatsApp estiver pendente, o botão de envio mostra um aviso com a mensagem que seria enviada.

## Fotos pendentes

Os espaços marcados **[PENDENTE]** na página esperam material do cliente: foto do Luiz, fotos de obras e prints do modelo 3D do TQS.
Salve as fotos em `assets/img/` em formato WebP e troque o bloco `<figure class="... slot ...">` correspondente no `index.html` por uma imagem.

## Eventos no Google Tag Manager

A página envia para o `dataLayer`:

- `form_submit` — envio do formulário (com as respostas de qualificação, sem nome e telefone)
- `whatsapp_click` — clique no botão flutuante ou no do rodapé (`origem`: `flutuante` ou `rodape`)
- `ab_variante` — qual versão da headline a pessoa viu (`variante`: `A` ou `B`)

## Teste A/B

- Versão A (padrão): "Projeto estrutural para a sua obra começar com segurança"
- Versão B: abra o link com `?v=b` no final. Ex.: `https://seu-dominio/?v=b`

Os textos das duas headlines ficam em `config.js`.

## Textos para o Luiz validar

Serviços, etapas e perguntas frequentes são rascunho da V4. Confirmar com o cliente antes de publicar com tráfego pago, principalmente:
a lista "O que entregamos", as etapas de "Como funciona", a resposta sobre ART e as opções de tipo de estrutura do formulário.
