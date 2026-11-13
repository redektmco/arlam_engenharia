(() => {
  const cfg = window.ARFLAM || {};
  const pendente = (v) => !v || v === 'PENDENTE';
  window.dataLayer = window.dataLayer || [];
  const evento = (event, extra) => window.dataLayer.push({ event, ...extra });

  // Google Tag Manager (só carrega com ID configurado)
  if (!pendente(cfg.gtmId)) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cfg.gtmId);
    document.head.append(s);
  }

  // Dados do rodapé
  document.querySelectorAll('[data-config]').forEach((el) => {
    const v = cfg[el.dataset.config];
    if (!pendente(v)) el.textContent = v;
  });
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Teste A/B: ?v=b troca a headline
  const variante = new URLSearchParams(location.search).get('v') === 'b' ? 'B' : 'A';
  if (variante === 'B' && cfg.headlineB) document.querySelector('[data-headline]').textContent = cfg.headlineB;
  evento('ab_variante', { variante });

  const linkWhats = (texto) => pendente(cfg.whatsapp)
    ? null
    : `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(texto)}`;

  // Botão flutuante e botão do rodapé
  document.querySelectorAll('[data-whatsapp="float"]').forEach((a) => {
    const url = linkWhats(cfg[a.dataset.mensagem] || cfg.mensagemBotaoFlutuante);
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else a.href = '#orcamento';
    a.addEventListener('click', () => evento('whatsapp_click', { origem: a.dataset.origem || 'flutuante' }));
  });

  // Formulário → planilha + WhatsApp
  const form = document.getElementById('form-orcamento');
  const erro = form.querySelector('.form-error');
  const tel = form.elements.telefone;
  tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const dados = {
      nome: f.nome.value.trim(),
      telefone: f.telefone.value.trim(),
      arquitetonico: f.arquitetonico.value,
      inicio: f.inicio.value,
      estrutura: f.estrutura.value,
      prefeitura: f.prefeitura.value,
    };
    const telOk = dados.telefone.replace(/\D/g, '').length >= 10;
    f.nome.classList.toggle('err', !dados.nome);
    f.telefone.classList.toggle('err', !telOk);
    form.querySelectorAll('.choice').forEach((fs) => fs.classList.toggle('err', !fs.querySelector('input:checked')));
    const invalido = form.querySelector('.err');
    erro.hidden = !invalido;
    if (invalido) { (invalido.matches('input') ? invalido : invalido.querySelector('input')).focus(); return; }

    evento('form_submit', { form: 'orcamento', variante, ...dados, nome: undefined, telefone: undefined });

    // Cópia na planilha. sendBeacon continua mesmo se a página sair para o WhatsApp.
    if (!pendente(cfg.planilhaUrl)) {
      const corpo = new URLSearchParams({ ...dados, variante, pagina: location.href });
      if (!navigator.sendBeacon(cfg.planilhaUrl, corpo)) {
        fetch(cfg.planilhaUrl, { method: 'POST', body: corpo, mode: 'no-cors', keepalive: true });
      }
    }

    const msg = [
      'Olá, vim pelo site da Arflam.',
      `Nome: ${dados.nome}`,
      `Projeto arquitetônico: ${dados.arquitetonico}`,
      `Início da obra: ${dados.inicio}`,
      `Tipo de estrutura: ${dados.estrutura}`,
      `Entrada na prefeitura: ${dados.prefeitura}`,
    ].join('\n');
    const url = linkWhats(msg);
    if (url) location.href = url;
    else alert('[PENDENTE] Número de WhatsApp da Arflam ainda não configurado em assets/js/config.js.\n\nMensagem que seria enviada:\n\n' + msg);
  });

  // Assistente flutuante "Qual serviço eu preciso?"
  const assist = document.querySelector('[data-assist]');
  if (assist) {
    const $ = (s) => assist.querySelector(s);
    const painel = $('#assist-panel'), fab = $('[data-assist-toggle]');
    const opts = $('[data-assist-opts]'), resp = $('[data-assist-answer]');
    const texto = $('[data-assist-text]'), cta = $('[data-assist-cta]');
    const respostas = {
      construir: { t: 'Você precisa do projeto estrutural completo: fundação, pilares, vigas e lajes, calculados no TQS, com plantas em 2D e modelo 3D. Tenha o arquitetônico em DWG em mãos.', c: 'Pedir orçamento', h: '#orcamento' },
      ampliar: { t: 'Antes de subir um andar, é preciso verificar se pilares e fundação existentes aguentam a nova carga. Isso entra no projeto. Conte no formulário que é ampliação.', c: 'Pedir orçamento', h: '#orcamento' },
      laudo: { t: 'Laudo técnico ou perícia de estrutura de concreto armado, conforme a NBR 13752 e a NBR 6118:2024, com ART. Fale direto com o engenheiro.', c: 'Falar sobre laudo', h: linkWhats(cfg.mensagemLaudo), externo: true, o: 'assistente-laudo' },
      pdf: { t: 'Precisamos do arquivo DWG. O PDF costuma ter escala, medidas e camadas alteradas na geração. Peça o DWG ao seu arquiteto e depois peça o orçamento.', c: 'Pedir orçamento', h: '#orcamento' },
    };
    const abrir = (aberto) => {
      painel.hidden = !aberto;
      fab.setAttribute('aria-expanded', String(aberto));
      assist.classList.toggle('is-open', aberto);
      if (aberto) evento('assistente_aberto');
    };
    const voltar = () => { resp.hidden = true; opts.hidden = false; };
    fab.addEventListener('click', () => abrir(painel.hidden));
    $('[data-assist-close]').addEventListener('click', () => { abrir(false); fab.focus(); });
    $('[data-assist-back]').addEventListener('click', voltar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !painel.hidden) { abrir(false); fab.focus(); } });
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('[data-opt]');
      if (!b) return;
      const r = respostas[b.dataset.opt];
      texto.textContent = r.t;
      cta.textContent = r.c;
      cta.href = r.h || '#orcamento';
      if (r.externo && r.h) { cta.target = '_blank'; cta.rel = 'noopener'; } else { cta.removeAttribute('target'); cta.removeAttribute('rel'); }
      cta.onclick = () => { evento('assistente_cta', { opcao: b.dataset.opt }); if (!r.externo) abrir(false); };
      opts.hidden = true; resp.hidden = false;
      cta.focus({ preventScroll: true });
      evento('assistente_opcao', { opcao: b.dataset.opt });
    });
    // Aparece depois do topo e some enquanto o formulário está na tela
    let passouTopo = false, noForm = false;
    const mostrar = () => { assist.hidden = !(passouTopo && !noForm); if (assist.hidden) abrir(false); };
    const topo = document.getElementById('topo');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { passouTopo = !en.isIntersecting; mostrar(); }, { threshold: 0.35 }).observe(topo);
      new IntersectionObserver(([en]) => { noForm = en.isIntersecting; mostrar(); }).observe(document.getElementById('orcamento'));
    } else { passouTopo = true; mostrar(); }
  }

  // Entradas das seções, uma vez
  const els = document.querySelectorAll('[data-reveal], .shutter');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target.alvo || e.target).classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach((el) => {
      // um elemento todo recortado (clip-path) nunca "aparece" para o observer: observa o pai
      if (el.classList.contains('shutter')) { el.parentElement.alvo = el; io.observe(el.parentElement); return; }
      const irmaos = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
      el.style.setProperty('--rd', `${irmaos.indexOf(el) * 80}ms`);
      io.observe(el);
    });
  } else els.forEach((el) => el.classList.add('is-in'));
})();
