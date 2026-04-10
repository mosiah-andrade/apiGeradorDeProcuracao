import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Pega os dados enviados pelo seu frontend
    const payload = await request.json();

    // Lê as variáveis de ambiente SEM o NEXT_PUBLIC_ (protegidas no servidor)
    // Ajuste o nome das variáveis conforme o seu .env
    const apiUrl = process.env.API_PHP_URL || process.env.API_URL;
    const apiKey = process.env.API_KEY; 

    if (!apiUrl) {
      return NextResponse.json({ error: 'URL da API não configurada no servidor.' }, { status: 500 });
    }

    // Faz a chamada real para a sua API PHP
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Erro ao gerar documento na API PHP.' }, 
        { status: response.status }
      );
    }

    // Se deu certo, pega o arquivo (blob) gerado pelo PHP e repassa para o frontend
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Repassa o cabeçalho de download se existir
        ...(response.headers.has('Content-Disposition') && {
          'Content-Disposition': response.headers.get('Content-Disposition')!
        })
      },
    });

  } catch (error) {
    console.error("Erro na API Route:", error);
    return NextResponse.json({ error: 'Erro interno no servidor Next.js.' }, { status: 500 });
  }
}