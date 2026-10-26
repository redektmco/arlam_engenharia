// Recebe as respostas do formulário da LP e grava uma linha na planilha.
// Como instalar: veja LEIA-ME.md nesta pasta.
const COLUNAS = ['Data', 'Nome', 'Telefone', 'Projeto arquitetônico', 'Início da obra', 'Tipo de estrutura', 'Entrada na prefeitura', 'Variante', 'Página'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (aba.getLastRow() === 0) aba.appendRow(COLUNAS);
  aba.appendRow([
    new Date(),
    limpa(p.nome), limpa(p.telefone), limpa(p.arquitetonico), limpa(p.inicio),
    limpa(p.estrutura), limpa(p.prefeitura), limpa(p.variante), limpa(p.pagina),
  ]);
  return ContentService.createTextOutput('ok');
}

// Evita fórmulas injetadas na planilha (=, +, -, @) e textos gigantes.
function limpa(v) {
  const s = String(v || '').slice(0, 300);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
