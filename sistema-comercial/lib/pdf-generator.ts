import { jsPDF } from "jspdf";

// Função robusta para converter URL em Base64 usando fetch
const carregarImagem = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao buscar imagem");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao carregar imagem para o PDF:", error);
    throw error;
  }
};

export async function gerarPdfProposta(dados: any, perfil?: any) {
  const doc = new jsPDF();
  const PRIMARY = [30, 58, 138]; 
  const SLATE_600 = [71, 85, 105];
  const SLATE_400 = [148, 163, 184];

  // 1. Carregamento Prévio das Imagens (Crucial para não sair em branco)
  let logoData = null;
  let avatarData = null;

  if (perfil?.company_logo_url) {
    logoData = await carregarImagem(perfil.company_logo_url).catch(() => null);
  }
  if (perfil?.avatar_url) {
    avatarData = await carregarImagem(perfil.avatar_url).catch(() => null);
  }

  // --- INÍCIO DO DESENHO ---
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, 210, 3, "F");

  if (logoData) {
    doc.addImage(logoData, "JPEG", 160, 10, 30, 15, undefined, 'FAST');
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.text("PROPOSTA", 20, 25);
  doc.setFont("helvetica", "normal");
  doc.text("COMERCIAL SOLAR", 75, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(SLATE_400[0], SLATE_400[1], SLATE_400[2]);
  const idCurto = dados.id ? dados.id.split('-')[0].toUpperCase() : 'NOVO';
  doc.text(`REFERÊNCIA: # ${idCurto}  |  EMITIDO EM: ${new Date().toLocaleDateString('pt-BR')}`, 20, 32);

  // --- CLIENTE ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 45, 170, 15, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("CLIENTE:", 25, 54);
  doc.setFont("helvetica", "normal");
  doc.text(dados.cliente?.toUpperCase() || 'NÃO INFORMADO', 45, 54);

  // --- TABELA DE ITENS ---
  let y = 75;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(SLATE_600[0], SLATE_600[1], SLATE_600[2]);
  doc.text("DESCRIÇÃO TÉCNICA", 20, y);
  doc.text("QTD", 130, y);
  doc.text("SUBTOTAL", 160, y);
  doc.line(20, y + 2, 190, y + 2);

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  const itens = dados.itens || [];
  let totalCalculado = 0;

  itens.forEach((item: any) => {
    const subtotal = (item.quantidade || 0) * (item.valorUnitario || 0);
    totalCalculado += subtotal;
    doc.text(item.descricao || '-', 20, y);
    doc.text(String(item.quantidade || 0), 130, y);
    doc.text(subtotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 160, y);
    y += 8;
  });

  // --- GRÁFICO ---
  let yG = y + 15;
  if (yG > 180) { doc.addPage(); yG = 30; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ESTIMATIVA DE GERAÇÃO MENSAL (kWh)", 20, yG);

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const geracaoMedia = dados.geracao_estimada || 0;
  const yBase = yG + 40;

  meses.forEach((mes, i) => {
    const curva = [1.1, 1.05, 1.0, 0.9, 0.8, 0.75, 0.8, 0.9, 1.0, 1.05, 1.1, 1.15];
    const h = geracaoMedia > 0 ? ((geracaoMedia * curva[i]) / (geracaoMedia * 1.5)) * 30 : 0;
    const x = 35 + (i * 13);
    doc.setFillColor(239, 246, 255);
    doc.rect(x, yBase - 30, 8, 30, "F");
    doc.setFillColor(37, 99, 235);
    doc.rect(x, yBase - h, 8, h, "F");
    doc.setFontSize(6);
    doc.text(mes, x + 4, yBase + 5, { align: "center" });
  });

  // --- FOOTER TÉCNICO ---
  const yV = 230;
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.roundedRect(20, yV, 170, 40, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("INVESTIMENTO TOTAL", 185, yV + 12, { align: "right" });
  doc.setFontSize(20);
  doc.text((dados.valor || totalCalculado).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}), 185, yV + 25, { align: "right" });
  doc.setFontSize(9);
  doc.text(`POTÊNCIA: ${dados.potencia || 0} kWp`, 30, yV + 15);
  doc.text(`ECONOMIA: ${Math.round(geracaoMedia * 0.95)} kWh/mês`, 30, yV + 22);
  doc.text(`PAYBACK: ${dados.payback_anos || 0} ANOS`, 30, yV + 29);

  // --- ASSINATURA ---
  const yAss = 285;
  if (avatarData) {
    doc.addImage(avatarData, "JPEG", 20, yAss - 12, 10, 10, undefined, 'FAST');
  }
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const xTexto = avatarData ? 33 : 20;
  doc.setFont("helvetica", "bold");
  doc.text(perfil?.full_name || "Consultor Técnico", xTexto, yAss - 6);
  doc.setFont("helvetica", "normal");
  doc.text(`${perfil?.company_name || 'Asaweb'} | ${perfil?.phone || ''}`, xTexto, yAss - 2);

  // RETORNO: Retornamos o objeto do jsPDF diretamente
  return doc;
}