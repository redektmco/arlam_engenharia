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
    const url = linkWhats(cfg.mensagemBotaoFlutuante);
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else a.href = '#orcamento';
    a.addEventListener('click', () => evento('whatsapp_click', { origem: a.classList.contains('wa-float') ? 'flutuante' : 'rodape' }));
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

  // Entradas das seções, uma vez
  const els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach((el) => {
      const irmaos = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
      el.style.setProperty('--rd', `${irmaos.indexOf(el) * 80}ms`);
      io.observe(el);
    });
  } else els.forEach((el) => el.classList.add('is-in'));
})();
