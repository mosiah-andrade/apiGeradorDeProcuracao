<?php
// Tenta carregar a configuração externa (segura)
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// Fallback (caso esqueça de subir o config, usa uma padrão ou erro)
if (!defined('API_SECRET_KEY')) {
    // Se estiver rodando localhost pode deixar uma fixa, mas em produção evite
    define('API_SECRET_KEY', 'senha_padrao_insegura'); 
}

// --- CONFIGURAÇÃO DE PERFORMANCE E CORS ---
if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
    ini_set('zlib.output_compression', 'On');
}

// CORS: Permite que seu frontend acesse (ajuste o domínio em produção)
header("Access-Control-Allow-Origin: https://asaweb.tech"); 
header("Access-Control-Allow-Headers: Content-Type, X-API-KEY"); // Importante: Aceitar o header da chave
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Encerra pre-flight requests (OPTIONS) sem verificar senha
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// --- 2. VERIFICAÇÃO DE SEGURANÇA (LISTA DE CLIENTES) ---
function verificarAutenticacao() {
    // Carrega a configuração se ainda não estiver carregada
    if (file_exists(__DIR__ . '/config.php')) {
        require_once __DIR__ . '/config.php';
    }
    
    // Se não houver lista de clientes definida, bloqueia tudo por segurança
    if (!defined('API_CLIENTS')) {
        http_response_code(500);
        echo json_encode(["erro" => "Erro de configuração no servidor (Lista de API Keys ausente)."]);
        exit();
    }

    $headers = getallheaders();
    $chaveEnviada = $headers['X-API-KEY'] ?? $headers['x-api-key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? null;

    if (!$chaveEnviada) {
        http_response_code(401);
        echo json_encode(["erro" => "Chave de API não fornecida."]);
        exit();
    }

    // --- A MÁGICA ACONTECE AQUI ---
    // Verifica se a chave enviada existe nos valores do nosso array de clientes
    $clienteEncontrado = array_search($chaveEnviada, API_CLIENTS);

    if ($clienteEncontrado === false) {
        // Chave não encontrada na lista
        http_response_code(403); // Proibido
        echo json_encode(["erro" => "Acesso negado. Chave de API inválida."]);
        exit();
    }

    // (Opcional) Se quiser usar o nome do cliente depois, pode retornar ele
    return $clienteEncontrado; 
}

// Chama a segurança e guarda o nome do cliente (se precisar usar no log ou no documento)
$nomeDoClienteLogado = verificarAutenticacao();


if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["erro" => "Método não permitido."]);
    exit();
}

// --- LÓGICA DO GERADOR ---
try {
    $inputJSON = file_get_contents('php://input');
    $dados = json_decode($inputJSON, true);

    if (!$dados) throw new Exception("JSON inválido.");

    // Validação do modelo
    if (!isset($dados['arquivo_modelo']) || empty($dados['arquivo_modelo'])) {
        throw new Exception("O campo 'arquivo_modelo' é obrigatório.");
    }

    // Segurança do nome do arquivo (evita invasão de pastas)
    $nomeModeloSeguro = basename($dados['arquivo_modelo']); 
    if (pathinfo($nomeModeloSeguro, PATHINFO_EXTENSION) !== 'docx') {
        $nomeModeloSeguro .= '.docx';
    }

    $caminhoModelo = __DIR__ . '/' . $nomeModeloSeguro;

    if (!file_exists($caminhoModelo)) {
        throw new Exception("Modelo '$nomeModeloSeguro' não encontrado no servidor.");
    }

    // --- PROCESSAMENTO ---
    $arquivoTemp = tempnam(sys_get_temp_dir(), 'doc_'); 
    
    if (!copy($caminhoModelo, $arquivoTemp)) {
        throw new Exception("Erro ao criar buffer temporário.");
    }

    $zip = new ZipArchive;
    if ($zip->open($arquivoTemp) === TRUE) {
        
        $xmlContent = $zip->getFromName('word/document.xml');
        if ($xmlContent) {
            $xmlContent = substituirPlaceholders($xmlContent, $dados);
            $zip->addFromString('word/document.xml', $xmlContent);
        }
        $zip->close();

        // Download
        $prefixo = pathinfo($nomeModeloSeguro, PATHINFO_FILENAME);
        $nomeUsuario = preg_replace('/[^A-Za-z0-9]/', '_', $dados['nome'] ?? 'Documento');
        $nomeFinal = $prefixo . "_" . $nomeUsuario . ".docx";

        header('Content-Description: File Transfer');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment; filename="' . $nomeFinal . '"');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . filesize($arquivoTemp));
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        
        readfile($arquivoTemp);
        unlink($arquivoTemp);
        exit;

    } else {
        throw new Exception("Não foi possível abrir o arquivo DOCX (Verifique se a extensão ZIP está ativa no PHP).");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
    if (isset($arquivoTemp) && file_exists($arquivoTemp)) unlink($arquivoTemp);
}

function substituirPlaceholders($xml, $dados, $prefixo = '') {
    foreach ($dados as $chave => $valor) {
        if ($chave === 'arquivo_modelo') continue;

        if (is_array($valor)) {
            $xml = substituirPlaceholders($xml, $valor, $prefixo . $chave . ".");
        } else {
            $p1 = "{{" . $prefixo . $chave . "}}";
            $p2 = "{{ " . $prefixo . $chave . " }}";
            $valLimpo = htmlspecialchars($valor ?? '', ENT_XML1, 'UTF-8');
            $xml = str_replace([$p1, $p2], $valLimpo, $xml);
        }
    }
    return $xml;
}
?>