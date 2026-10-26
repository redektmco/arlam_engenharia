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

## Identidade visual

Segue o site atual (arflam.com.br): logo original, vermelho `#d43616`, azul-marinho `#1a2c50`, títulos em Oswald e textos em Montserrat.
WhatsApp e endereço foram tirados do site atual. Confirmar com o Luiz.

## Fotos (provisórias)

As fotos em `assets/img/fotos/` são de banco de imagens (Freepik, licença gratuita, com crédito no rodapé). São **ilustrativas**, não são obras da Arflam.
Quando chegarem as fotos reais (obras, foto do Luiz, prints do TQS), salve em WebP com o **mesmo nome de arquivo** em `assets/img/fotos/` e a página troca sozinha.
Se todas as fotos de banco saírem, apague também "Imagens ilustrativas" no `index.html`.

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
