<?php
// Configurações de CORS para aceitar requisições do seu Front-end
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Se for uma requisição OPTIONS (pre-flight), encerra aqui
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verifica se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido. Use POST."]);
    exit();
}

// Recebe o JSON do Front-end
$inputJSON = file_get_contents('php://input');
$dados = json_decode($inputJSON, true);

if (!$dados) {
    http_response_code(400);
    echo json_encode(["erro" => "JSON inválido ou vazio."]);
    exit();
}

// Lógica para selecionar o modelo (PF ou PJ)
// Adapte a lógica do 'tipo' conforme o que seu front envia. 
// No Python parecia ser baseado na presença de CNPJ ou algo similar.
$nomeArquivoModelo = 'modelo_pf.docx';

// Exemplo de verificação simples (ajuste conforme os campos do seu JSON)
if (isset($dados['contratante']['cnpj']) && !empty($dados['contratante']['cnpj'])) {
    $nomeArquivoModelo = 'modelo_pj.docx';
}

// Verifica se o modelo existe
if (!file_exists($nomeArquivoModelo)) {
    http_response_code(500);
    echo json_encode(["erro" => "Modelo de contrato não encontrado: $nomeArquivoModelo"]);
    exit();
}

// Cria um nome para o arquivo temporário
$arquivoTemporario = 'temp_' . uniqid() . '.docx';

// Copia o modelo para o arquivo temporário
if (!copy($nomeArquivoModelo, $arquivoTemporario)) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha ao criar arquivo temporário."]);
    exit();
}

// ==========================================
// FUNÇÃO DE SUBSTITUIÇÃO NO DOCX
// ==========================================

$zip = new ZipArchive;

if ($zip->open($arquivoTemporario) === TRUE) {
    // O conteúdo do texto do Word fica principalmente em 'word/document.xml'
    $xmlNome = 'word/document.xml';
    
    if (($conteudo = $zip->getFromName($xmlNome)) !== FALSE) {
        
        // Flatten nos dados para facilitar a busca (transforma arrays aninhados em chaves planas)
        // Ex: $dados['contratante']['nome'] vira a chave '{{ contratante.nome }}' ou apenas 'nome' dependendo do seu modelo
        // A função abaixo varre o JSON e substitui no XML
        
        $conteudo = substituirPlaceholders($conteudo, $dados);
        
        // Salva o XML modificado de volta no ZIP
        $zip->addFromString($xmlNome, $conteudo);
        
        // (Opcional) Também substituir em cabeçalhos e rodapés se houver
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $nomeArquivo = $zip->getNameIndex($i);
            if (preg_match('/word\/(header|footer)\d+\.xml/', $nomeArquivo)) {
                $xmlExtra = $zip->getFromName($nomeArquivo);
                $xmlExtra = substituirPlaceholders($xmlExtra, $dados);
                $zip->addFromString($nomeArquivo, $xmlExtra);
            }
        }
        
        $zip->close();
        
        // ==========================================
        // DOWNLOAD DO ARQUIVO
        // ==========================================
        
        header('Content-Description: File Transfer');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment; filename="contrato_gerado.docx"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($arquivoTemporario));
        
        readfile($arquivoTemporario);
        
        // Remove o arquivo temporário após o download
        unlink($arquivoTemporario);
        exit;
        
    } else {
        $zip->close();
        unlink($arquivoTemporario);
        http_response_code(500);
        echo json_encode(["erro" => "Não foi possível ler o XML do documento."]);
    }
} else {
    unlink($arquivoTemporario);
    http_response_code(500);
    echo json_encode(["erro" => "Não foi possível abrir o arquivo DOCX."]);
}

/**
 * Função auxiliar para substituir chaves do JSON no texto do XML
 */
function substituirPlaceholders($conteudoXml, $dados, $prefixo = '') {
    foreach ($dados as $chave => $valor) {
        // Se for um array (ex: contratante: { nome: ... }), chama recursivamente
        if (is_array($valor)) {
            $novoPrefixo = $prefixo . $chave . "."; // Ex: contratante.
            $conteudoXml = substituirPlaceholders($conteudoXml, $valor, $novoPrefixo);
        } else {
            // Se for valor simples, substitui.
            // O Python usava Jinja2 {{ variavel }}. O PHP vai procurar por essa string exata.
            // Exemplo: procura por {{ nome }} ou {{ contratante.nome }}
            
            $placeholder = "{{" . $prefixo . $chave . "}}"; // Sem espaços: {{chave}}
            $placeholderEspaco = "{{ " . $prefixo . $chave . " }}"; // Com espaços: {{ chave }}
            
            // Tratamento básico para caracteres especiais no XML (evitar quebra do arquivo)
            $valorLimpo = htmlspecialchars($valor, ENT_XML1, 'UTF-8');
            
            $conteudoXml = str_replace($placeholder, $valorLimpo, $conteudoXml);
            $conteudoXml = str_replace($placeholderEspaco, $valorLimpo, $conteudoXml);
        }
    }
    return $conteudoXml;
}
?>