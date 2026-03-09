"use client";

import AnaliseTecnica from '@/components/Analise-tecnica';
import React, {useEffect, useRef} from 'react';
import { Metadata } from 'next';



export default function CalculadoraSolarPro() {
  const adRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    {
        const timer = setTimeout(() => {
          try {
            if (typeof window !== 'undefined' && adRef.current) {
              // Limpa o container para evitar anúncios duplicados em re-renders
              adRef.current.innerHTML = '';
  
              // --- OPÇÃO 1: ADSTERRA SIMPLIFICADO (Ativo) ---
              const script = document.createElement('script');
              script.src = "https://pl28807824.effectivegatecpm.com/6884d9994893fc4e4dc7fcbefa9e2832/invoke.js";
              script.async = true;
              script.setAttribute('data-cfasync', 'false');
              adRef.current.appendChild(script);
  
              // --- OPÇÃO 3: GOOGLE ADSENSE (Comentado) ---
              /* if ((window as any).adsbygoogle) {
                  (window as any).adsbygoogle.push({});
              } 
              */
            }
          } catch (e: any) {
            console.log("Aviso de Ads:", e.message);
          }
        }, 500); 
  
        return () => {
          clearTimeout(timer);
          if (adRef.current) adRef.current.innerHTML = '';
        };
      } 
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 max-w-full m-auto px-4">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-900">Calculadora Solar Pro</h1>
        <p className="text-slate-500">Análise técnica e viabilidade financeira</p>
      </header>

      <div style={{display: 'flex', flexDirection: 'row-reverse', gap: '40px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        <div >
          <div className="max-w-[350px] bg-slate-100 rounded-xl shadow-lg p-6 mb-8">
            <AnaliseTecnica />
          </div>
            <img src="/adsDev.png" alt="" width={350} className='m-auto'/>
            <div 
              ref={adRef} 
              id="container-6884d9994893fc4e4dc7fcbefa9e2832" 
              style={{ width: '100%', minHeight: '250px', textAlign: 'center' }}
            />
        </div>
        <div  className="w-[700px] max-w-[90vw]">
          <img src="/imagem-social-share.png" alt="" className="w-[500px] max-w-[90vw] m-auto"/>
          <p className="w-[700px] max-w-[90vw] text-justify text-slate-700 mt-6">
            A Calculadora Solar Pro é uma ferramenta avançada que oferece uma análise técnica detalhada e uma avaliação financeira completa para projetos de energia solar. Com esta calculadora, você pode obter insights precisos sobre a viabilidade do seu projeto, incluindo estimativas de produção de energia, retorno sobre investimento (ROI) e economia de custos ao longo do tempo. Ideal para profissionais do setor solar, investidores e entusiastas, a Calculadora Solar Pro ajuda a tomar decisões informadas e estratégicas para maximizar os benefícios da energia solar.
          </p>
        </div>

        
      </div>

    </div>
  );
}