import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = Record<string, unknown>;
type Field = { label: string; value: string };

const page = {
  width: 210,
  height: 297,
  marginX: 18,
  topY: 34,
  bottomY: 266,
  contentWidth: 174,
};

function campo(dados: Payload, ...chaves: string[]) {
  for (const chave of chaves) {
    const valor = dados[chave];
    if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
      return String(valor);
    }
  }

  return "";
}

function nomeArquivoSeguro(nome: string) {
  return nome.replace(/[^A-Za-z0-9]/g, "_") || "Contrato";
}

function drawHeader(doc: jsPDF) {
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, page.width, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("PROCURACAO", page.marginX, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Instrumento particular para representacao junto a concessionaria", page.marginX, 26);

  doc.setDrawColor(226, 232, 240);
  doc.line(page.marginX, 30, page.width - page.marginX, 30);
}

function addPage(doc: jsPDF) {
  doc.addPage();
  drawHeader(doc);
  return page.topY;
}

function ensureSpace(doc: jsPDF, y: number, needed: number) {
  return y + needed > page.bottomY ? addPage(doc) : y;
}

function split(doc: jsPDF, text: string, width: number) {
  return doc.splitTextToSize(text || "-", width) as string[];
}

function sectionTitle(doc: jsPDF, title: string, y: number) {
  y = ensureSpace(doc, y, 14);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(page.marginX, y, page.contentWidth, 9, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text(title.toUpperCase(), page.marginX + 4, y + 6);

  return y + 14;
}

function fieldRow(doc: jsPDF, field: Field, y: number) {
  const labelWidth = 43;
  const valueX = page.marginX + labelWidth + 6;
  const valueWidth = page.contentWidth - labelWidth - 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const valueLines = split(doc, field.value, valueWidth);
  const rowHeight = Math.max(9, valueLines.length * 4.8 + 4);

  y = ensureSpace(doc, y, rowHeight + 1);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(page.marginX, y, page.contentWidth, rowHeight, 1.2, 1.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(field.label, page.marginX + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(valueLines, valueX, y + 6);

  return y + rowHeight + 2;
}

function fieldSection(doc: jsPDF, title: string, fields: Field[], y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const estimatedHeight = fields.reduce((total, field) => {
    const valueWidth = page.contentWidth - 43 - 10;
    const valueLines = split(doc, field.value, valueWidth);
    return total + Math.max(9, valueLines.length * 4.8 + 4) + 2;
  }, 19);

  if (estimatedHeight <= page.bottomY - page.topY && y + estimatedHeight > page.bottomY) {
    y = addPage(doc);
  }

  y = sectionTitle(doc, title, y);

  for (const field of fields) {
    y = fieldRow(doc, field, y);
  }

  return y + 5;
}

function paragraph(doc: jsPDF, text: string, y: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = split(doc, text, page.contentWidth);
  const needed = lines.length * 5 + 4;
  y = ensureSpace(doc, y, needed);

  doc.setTextColor(30, 41, 59);
  doc.text(lines, page.marginX, y, { lineHeightFactor: 1.25 });

  return y + needed;
}

function signatureBlock(doc: jsPDF, name: string, document: string, y: number) {
  y = ensureSpace(doc, y, 48);

  doc.setDrawColor(100, 116, 139);
  doc.line(55, y + 22, 155, y + 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(name || "CONTRATANTE", 105, y + 30, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(document || "", 105, y + 36, { align: "center" });

  return y + 44;
}

function drawFooters(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();

  for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
    doc.setPage(currentPage);
    doc.setDrawColor(226, 232, 240);
    doc.line(page.marginX, 276, page.width - page.marginX, 276);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Documento gerado pelo Sistema Comercial Asaweb", page.marginX, 283);
    doc.text(`Pagina ${currentPage} de ${totalPages}`, page.width - page.marginX, 283, { align: "right" });
  }
}

function gerarPdfProcuracao(dados: Payload) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const isPessoaJuridica = campo(dados, "arquivo_modelo").toLowerCase().includes("pj");
  const cidade = campo(dados, "cidade", "CIDADE");
  const nomeTitular = campo(dados, "nome", "NOME");
  const documentoTitular = campo(dados, "cpf", "CPF");
  const representante = campo(dados, "representante", "REPRESENTANTE");
  const cpfRepresentante = campo(dados, "cpf_representante", "CPF_DO_REPRESENTANTE");
  const nomeAssinatura = isPessoaJuridica ? representante : nomeTitular;
  const docAssinatura = isPessoaJuridica ? cpfRepresentante : documentoTitular;

  drawHeader(doc);
  let y = page.topY;

  y = paragraph(
    doc,
    "Pelo presente instrumento particular de procuracao, o(a) CONTRATANTE abaixo identificado(a) nomeia, outorga e constitui seu procurador para representa-lo(a) perante a concessionaria de energia eletrica.",
    y
  ) + 4;

  y = fieldSection(
    doc,
    "Dados do contratante",
    isPessoaJuridica
      ? [
          { label: "Representante", value: representante },
          { label: "CPF", value: cpfRepresentante },
          { label: "Razao social", value: nomeTitular },
          { label: "CNPJ", value: documentoTitular },
          { label: "Endereco", value: campo(dados, "endereco", "ENDERECO") },
          { label: "Bairro", value: campo(dados, "bairro", "BAIRRO") },
          { label: "Cidade", value: cidade },
          { label: "CEP", value: campo(dados, "cep", "CEP") },
        ]
      : [
          { label: "Nome", value: nomeTitular },
          { label: "CPF", value: documentoTitular },
          { label: "RG", value: campo(dados, "rg", "RG") },
          { label: "Orgao emissor", value: campo(dados, "orgao_emissor", "ORGAO_EMISSOR") },
          { label: "Endereco", value: campo(dados, "endereco", "ENDERECO") },
          { label: "Bairro", value: campo(dados, "bairro", "BAIRRO") },
          { label: "Cidade", value: cidade },
          { label: "CEP", value: campo(dados, "cep", "CEP") },
        ],
    y
  );

  y = fieldSection(
    doc,
    "Unidade consumidora",
    [
      { label: "Conta contrato", value: campo(dados, "contacontrato", "CONTACONTRATO") },
      { label: "Classificacao", value: campo(dados, "classificacao", "CLASSIFICACAO") },
    ],
    y
  );

  y = fieldSection(
    doc,
    "Procurador",
    [
      { label: "Nome", value: campo(dados, "nome_CONTRATADO", "NOME_CONTRATADO") },
      { label: "CPF/CNPJ", value: campo(dados, "cpf_CONTRATADO", "CPF_CONTRATADO") },
      { label: "RG", value: campo(dados, "rg_CONTRATADO", "RG_CONTRATADO") },
      { label: "Orgao emissor", value: campo(dados, "orgao_emissor_CONTRATADO", "ORGAO_EMISSOR_CONTRATADO") },
      { label: "Endereco", value: campo(dados, "endereco_CONTRATADO", "ENDERECO_CONTRATADO") },
    ],
    y
  );

  y = fieldSection(
    doc,
    "Concessionaria",
    [
      { label: "Nome", value: campo(dados, "concessionaria", "CONCESSIONARIA") },
      { label: "Cidade", value: campo(dados, "cidade_concessionaria", "CIDADE_CONCESSIONARIA") },
      { label: "CNPJ", value: campo(dados, "cnpj_concessionaria", "CNPJ_CONCESSIONARIA") },
    ],
    y
  );

  y = sectionTitle(doc, "Poderes outorgados", y);
  y = paragraph(
    doc,
    "Ao procurador acima qualificado sao conferidos poderes suficientes e necessarios para gestao energetica e representacao em servicos relacionados a troca de titularidade, transferencia de credito, acordo operacional, tratativas sobre processo de micro e mini geracao, analise de faturas e solicitacao de parecer de acesso.",
    y
  ) + 9;

  y = ensureSpace(doc, y, 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`${cidade}, ${campo(dados, "DIA")} de ${campo(dados, "MES")} de ${campo(dados, "ANO")}.`, page.marginX, y);
  y += 8;

  signatureBlock(doc, nomeAssinatura || nomeTitular, docAssinatura, y);
  drawFooters(doc);

  return doc.output("arraybuffer");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload?.arquivo_modelo) {
      return NextResponse.json({ erro: "O campo 'arquivo_modelo' e obrigatorio." }, { status: 400 });
    }

    const pdf = gerarPdfProcuracao(payload);
    const nomeCliente = nomeArquivoSeguro(campo(payload, "NOME", "nome"));
    const nomeFinal = `Procuracao_${nomeCliente}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeFinal}"`,
        "Content-Length": pdf.byteLength.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel gerar o documento.";

    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
