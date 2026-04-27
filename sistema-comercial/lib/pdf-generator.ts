import { jsPDF } from "jspdf";

export async function gerarPdfProposta(dados: { 
  cliente: string; 
  valor: number; 
  potencia: number; 
  id: string 
}) {
  const doc = new jsPDF();

  // Cabeçalho Asaweb
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Azul Blue-600
  doc.text("Asaweb", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Soluções em Energia Solar", 20, 27);

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 35, 190, 35);

  // Dados da Proposta
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(`Proposta Comercial: ${dados.cliente}`, 20, 50);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`ID da Proposta: ${dados.id}`, 20, 60);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 67);

  // Tabela de Detalhes
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 80, 170, 40, "F");
  
  doc.setFont("helvetica", "bold");
  doc.text("Especificações Técnicas", 30, 90);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Potência do Sistema: ${dados.potencia} kWp`, 30, 100);
  doc.text(`Investimento Total: R$ ${dados.valor.toLocaleString('pt-BR')}`, 30, 110);

  // Rodapé
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text("Este documento é uma estimativa técnica gerada pela plataforma Asaweb.", 20, 280);

  // Retorna o PDF como ArrayBuffer para ser enviado/salvo
  return Buffer.from(doc.output("arraybuffer"));
}