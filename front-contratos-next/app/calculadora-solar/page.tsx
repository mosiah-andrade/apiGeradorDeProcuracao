"use client";

import AnaliseTecnica from '@/components/Analise-tecnica';
import React from 'react';



export default function CalculadoraSolarPro() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Calculadora Solar Pro</h1>
        <p className="text-slate-500">Análise técnica e viabilidade financeira</p>
      </header>

      <div style={{display: 'flex', flexDirection: 'row-reverse', gap: '40px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <div >
          <div style={{border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', backgroundColor: '#e5f0fe', width: '600px'}}>
            <AnaliseTecnica />
          </div>
            <img src="/adsDev.png" alt="" width={350} style={{marginTop: '20px',  borderRadius: '8px'}}/>
        </div>
        <div  style={{width: '700px'}}>
          <img src="/imagem-social-share.png" alt="" width={550}/>
          <p>
            A Calculadora Solar Pro é uma ferramenta avançada que oferece uma análise técnica detalhada e uma avaliação financeira completa para projetos de energia solar. Com esta calculadora, você pode obter insights precisos sobre a viabilidade do seu projeto, incluindo estimativas de produção de energia, retorno sobre investimento (ROI) e economia de custos ao longo do tempo. Ideal para profissionais do setor solar, investidores e entusiastas, a Calculadora Solar Pro ajuda a tomar decisões informadas e estratégicas para maximizar os benefícios da energia solar.
          </p>
        </div>

        
      </div>

    </div>
  );
}