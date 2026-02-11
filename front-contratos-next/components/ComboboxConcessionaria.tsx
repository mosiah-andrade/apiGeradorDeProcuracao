"use client";

import React, { useState, useEffect, useRef } from "react";
import listaConcessionarias from "../public/concessionarias.json";

interface ComboboxProps {
  value: string;
  onChange: (slug: string) => void;
}

export default function ComboboxConcessionaria({ value, onChange }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPeople =
    query === ""
      ? listaConcessionarias
      : listaConcessionarias.filter((item) =>
          item.nome.toLowerCase().includes(query.toLowerCase()) ||
          item.cidade_sede.toLowerCase().includes(query.toLowerCase())
        );

  const selectedItem = listaConcessionarias.find((item) => item.slug === value);

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Concessionária de Energia
      </label>
      
      {/* Container do Input */}
      <div className={`
        relative w-full cursor-text overflow-hidden rounded-xl bg-white text-left 
        border transition-all duration-200 ease-in-out
        ${isOpen 
          ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' 
          : 'border-gray-200 shadow-sm hover:border-gray-300'
        }
      `} style={{display: "flex", flexDirection: "row-reverse" , justifyContent: "center"}}>
        {/* Ícone de Busca (Lupa) - Reduzido para h-4 w-4 */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className={` transition-colors duration-200 ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px', marginTop: '20px' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input Real */}
        <input
          className="w-full border-none py-3 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none placeholder-gray-400 bg-transparent"
          placeholder="Busque por nome ou cidade..."
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          value={isOpen ? query : (selectedItem ? selectedItem.nome : "")} 
        />
        
        {/* Ícone de Seta (Chevron) - Reduzido para h-4 w-4 */}
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg 
            className={` text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px',  marginTop: '20px' , marginRight: '10px' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Lista Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top">
          <ul className="max-h-60 overflow-auto py-2 custom-scrollbar">
            {filteredPeople.length === 0 ? (
              <div className="relative cursor-default select-none py-6 px-4 text-center text-gray-500">
                <span className="block text-2xl mb-2">😕</span>
                <p className="text-sm">Nenhuma concessionária encontrada.</p>
              </div>
            ) : (
              filteredPeople.map((item) => {
                const isSelected = item.slug === value;
                return (
                  <li
                    key={item.slug}
                    className={` selectHover
                      relative cursor-pointer select-none py-3 pl-4 pr-4 transition-colors duration-150 border-b border-gray-50 last:border-0
                      ${isSelected ? "bg-blue-50/80" : "hover:bg-gray-50"}
                    `}
                    onClick={() => {
                      onChange(item.slug);
                      setQuery(""); 
                      setIsOpen(false);
                    }}
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 26px',
                        minHeight: '58px',
                    }}
                  >
                    <div className="flex items-center justify-between ">
                        
                      <div className="flex flex-col">
                        {isSelected && (
                        <span className="flex items-center text-blue-600 bg-white rounded-full p-1 shadow-sm">
                          <svg  viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px', color: '#0aa90f' }}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                        <span className={`block truncate text-sm ${isSelected ? "font-bold text-blue-800" : "font-medium text-gray-900"}`}>
                          {item.nome}
                        </span>
                        <span className={`block text-xs truncate mt-0.5 flex items-center gap-1 ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                          {/* Ícone de cidade minúsculo (w-3 h-3) */}
                          <svg className=" opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px',  margin: '0px 5px'}}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {item.cidade_sede}
                        </span>
                      </div>
                      
                     
                    </div>
                  </li>
                );
              })
            )}
          </ul>
          <div className="bg-gray-50 px-4 py-1.5 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
              Selecione a distribuidora
            </p>
          </div>
        </div>
      )}
    </div>
  );
}