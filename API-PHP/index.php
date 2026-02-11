<?php
// 1. Configurações Iniciais e CORS
// ==========================================================
// Permite acesso de qualquer origem (ajuste em produção se necessário)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // Cache por 1 dia
}

// Access-Control headers para preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}
// ==========================================================

// Tenta carregar a configuração
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

if (!defined('API_SECRET_KEY')) {
    define('API_SECRET_KEY', 'senha_padrao_insegura'); 
}

// 2. Autenticação (Simplificada)
// ==========================================================
function verificarAutenticacao() {
    if (!defined('API_CLIENTS')) return true; // Se não tem clientes definidos, libera (cuidado!)

    $headers = getallheaders();
    // Normaliza para lowercase para evitar problemas de case sensitive
    $headers = array_change_key_case($headers, CASE_LOWER);
    
    $chaveEnviada = $headers['x-api-key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? null;

    if (!$chaveEnviada || !in_array($chaveEnviada, API_CLIENTS)) {
        http_response_code(403);
        echo json_encode(["erro" => "Acesso negado. API Key inválida."]);
        exit;
    }
}
// ==========================================================

verificarAutenticacao();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido."]);
    exit;
}

try {
    $inputJSON = file_get_contents('php://input');
    $dados = json_decode($inputJSON, true);

    if (!$dados) throw new Exception("JSON inválido.");

    // Validação básica
    if (empty($dados['arquivo_modelo'])) {
        throw new Exception("O campo 'arquivo_modelo' é obrigatório.");
    }

    // Segurança no nome do arquivo
    $nomeModelo = basename($dados['arquivo_modelo']);
    if (pathinfo($nomeModelo, PATHINFO_EXTENSION) !== 'docx') {
        $nomeModelo .= '.docx';
    }

    $caminhoModelo = __DIR__ . '/' . $nomeModelo;
    if (!file_exists($caminhoModelo)) {
        throw new Exception("Modelo '$nomeModelo' não encontrado.");
    }

    // --- PROCESSAMENTO DO WORD ---
    $arquivoTemp = tempnam(sys_get_temp_dir(), 'doc_');
    if (!copy($caminhoModelo, $arquivoTemp)) {
        throw new Exception("Erro ao copiar modelo para área temporária.");
    }

    $zip = new ZipArchive;
    if ($zip->open($arquivoTemp) === TRUE) {
        $xmlContent = $zip->getFromName('word/document.xml');
        if ($xmlContent) {
            $xmlContent = substituirPlaceholders($xmlContent, $dados);
            $zip->addFromString('word/document.xml', $xmlContent);
        }
        $zip->close();
        
        // ==================================================================
        // A CORREÇÃO MÁGICA ESTÁ AQUI EMBAIXO
        // ==================================================================

        // 1. Limpa TODOS os buffers de saída anteriores (remove espaços em branco, warnings, echos perdidos)
        while (ob_get_level()) ob_end_clean(); 

        // 2. Desativa compressão do PHP para este request (evita corromper binário)
        if(ini_get('zlib.output_compression')) {
             ini_set('zlib.output_compression', 'Off');
        }

        // 3. Define nome do arquivo para download
        $nomeCliente = preg_replace('/[^A-Za-z0-9]/', '_', $dados['NOME'] ?? 'Contrato');
        $nomeFinal = "Procuracao_" . $nomeCliente . ".docx";
        $tamanhoArquivo = filesize($arquivoTemp);

        // 4. Headers Corretos e Forçados
        header('Content-Description: File Transfer');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment; filename="' . $nomeFinal . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . $tamanhoArquivo);

        // 5. Envia o arquivo limpo
        readfile($arquivoTemp);
        
        // 6. Limpeza final
        unlink($arquivoTemp);
        exit; // MATA O SCRIPT AQUI. Nada mais é executado.

    } else {
        throw new Exception("Não foi possível abrir o arquivo DOCX.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
    if (isset($arquivoTemp) && file_exists($arquivoTemp)) unlink($arquivoTemp);
}

// Função auxiliar recursiva
// Função auxiliar recursiva melhorada para lidar com fragmentação do Word
function substituirPlaceholders($xml, $dados, $prefixo = '') {
    foreach ($dados as $chave => $valor) {
        if ($chave === 'arquivo_modelo') continue;
        
        if (is_array($valor)) {
            $xml = substituirPlaceholders($xml, $valor, $prefixo . $chave . ".");
        } else {
            $valLimpo = htmlspecialchars($valor ?? '', ENT_XML1, 'UTF-8');
            $chaveCompleta = $prefixo . $chave;
            
            // 1. Tenta substituição simples (caso o Word não tenha quebrado a tag)
            $p1 = "{{" . $chaveCompleta . "}}";
            $xml = str_replace($p1, $valLimpo, $xml);

            // 2. Tenta substituição com REGEX (caso o Word tenha colocado tags no meio)
            // Procura por {{, seguido de qualquer tag XML ou a chave, até fechar }}
            // Exemplo: O Word salva como <w:t>{{</w:t><w:t>NOME</w:t><w:t>}}</w:t>
            
            // Escapa a chave para usar no regex
            $chaveRegex = preg_quote($chaveCompleta, '/');
            
            // Regex explicada:
            // \{\{             -> Abre chaves
            // (?:<[^>]+>)* -> Ignora qualquer tag XML <...> (zero ou mais vezes)
            // CHAVE            -> O nome da variável
            // (?:<[^>]+>)* -> Ignora tags XML de novo
            // \}\}             -> Fecha chaves
            $pattern = '/\{\{(?:<[^>]+>)*' . $chaveRegex . '(?:<[^>]+>)*\}\}/';
            
            $xml = preg_replace($pattern, $valLimpo, $xml);
        }
    }
    return $xml;
}