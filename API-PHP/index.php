<?php
// --- CONFIGURAÇÃO DE PERFORMANCE E CORS ---
// Ativar compressão GZIP para respostas JSON (se o servidor não fizer automaticamente)
if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
    ini_set('zlib.output_compression', 'On');
}

// header("Access-Control-Allow-Origin: *"); // Em produção, coloque o seu domínio: https://seusite.com
header("Access-Control-Allow-Origin: https://asaweb.tech/"); // Em produção, coloque o seu domínio: https://seusite.com
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Encerra pre-flight requests (OPTIONS) rapidamente sem carregar lógica
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido."]);
    exit();
}

// --- LÓGICA OTIMIZADA ---
try {
    $inputJSON = file_get_contents('php://input');
    $dados = json_decode($inputJSON, true);

    if (!$dados) throw new Exception("JSON inválido.");

    // Seleção de Modelo
    // Dica: Use caminhos absolutos (__DIR__) para evitar "stat" calls desnecessários do sistema de arquivos
    $modeloPF = __DIR__ . '/modelo_pf.docx';
    $modeloPJ = __DIR__ . '/modelo_pj.docx';
    
    // Lógica simples de deteção (ajuste conforme seus campos reais)
    $usarPJ = isset($dados['contratante']['cnpj']) && !empty($dados['contratante']['cnpj']);
    // Ou verifique o tamanho do CPF/CNPJ limpo se o campo for o mesmo
    if (isset($dados['cpf']) && strlen(preg_replace('/\D/', '', $dados['cpf'])) > 11) {
        $usarPJ = true;
    }
    
    $caminhoModelo = $usarPJ ? $modeloPJ : $modeloPF;

    if (!file_exists($caminhoModelo)) throw new Exception("Modelo não encontrado.");

    // --- TRUQUE DE PERFORMANCE (RAM DISK) ---
    // Usar sys_get_temp_dir() geralmente grava na RAM (/tmp) em servidores Linux
    $arquivoTemp = tempnam(sys_get_temp_dir(), 'doc_'); 
    
    if (!copy($caminhoModelo, $arquivoTemp)) {
        throw new Exception("Erro ao criar buffer temporário.");
    }

    // Manipulação do ZIP
    $zip = new ZipArchive;
    if ($zip->open($arquivoTemp) === TRUE) {
        // XML Principal
        $xmlContent = $zip->getFromName('word/document.xml');
        if ($xmlContent) {
            $xmlContent = substituirPlaceholders($xmlContent, $dados);
            $zip->addFromString('word/document.xml', $xmlContent);
        }

        // (Opcional) Headers/Footers - Só descomente se usar variáveis no cabeçalho/rodapé
        // Isso poupa ciclos de CPU se não for necessário
        /*
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            if (preg_match('/word\/(header|footer)\d+\.xml/', $filename)) {
                $content = $zip->getFromName($filename);
                $zip->addFromString($filename, substituirPlaceholders($content, $dados));
            }
        }
        */

        $zip->close();

        // Download Otimizado
        $nomeFinal = "Procuracao_" . preg_replace('/[^A-Za-z0-9]/', '_', $dados['nome'] ?? 'Documento') . ".docx";

        header('Content-Description: File Transfer');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment; filename="' . $nomeFinal . '"');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . filesize($arquivoTemp));
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0'); // Não cachear o download
        
        readfile($arquivoTemp);
        
        // Limpeza Imediata
        unlink($arquivoTemp);
        exit;

    } else {
        throw new Exception("Não foi possível processar o arquivo DOCX.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
    if (isset($arquivoTemp) && file_exists($arquivoTemp)) unlink($arquivoTemp);
}

// Função Auxiliar (Mantida simples e recursiva)
function substituirPlaceholders($xml, $dados, $prefixo = '') {
    foreach ($dados as $chave => $valor) {
        if (is_array($valor)) {
            $xml = substituirPlaceholders($xml, $valor, $prefixo . $chave . ".");
        } else {
            $p1 = "{{" . $prefixo . $chave . "}}";
            $p2 = "{{ " . $prefixo . $chave . " }}";
            // htmlspecialchars é vital para não quebrar o XML do Word com caracteres como "&" ou "<"
            $valLimpo = htmlspecialchars($valor, ENT_XML1, 'UTF-8');
            $xml = str_replace([$p1, $p2], $valLimpo, $xml);
        }
    }
    return $xml;
}
?>