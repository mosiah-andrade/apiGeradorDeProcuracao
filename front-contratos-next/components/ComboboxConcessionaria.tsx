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

  const handleOpen = () => {
    setIsOpen(true);
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (isMobile) {
      setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPeople = query === ""
    ? listaConcessionarias
    : listaConcessionarias.filter((item) =>
        item.nome.toLowerCase().includes(query.toLowerCase()) ||
        item.cidade_sede.toLowerCase().includes(query.toLowerCase())
      );

  const selectedItem = listaConcessionarias.find((item) => item.slug === value);

  return (
    <div className="w-full" ref={dropdownRef} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: '13px', textTransform: 'uppercase', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.5px' }}>
        Concessionária de Energia
      </label>
      
      {/* CAIXA DO INPUT (Blindada contra o globals.css) */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: '#ffffff', // Fundo branco forçado
          border: isOpen ? '2px solid #3b82f6' : '1px solid #cbd5e1',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          boxShadow: isOpen ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          zIndex: isOpen ? 1000 : 1
        }}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px', color: isOpen ? '#3b82f6' : '#9ca3af', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          style={{
            width: '100%',
            border: 'none',
            backgroundColor: 'transparent',
            padding: '12px 10px',
            fontSize: '15px',
            color: '#1f2937', // Texto escuro forçado
            outline: 'none',
            boxShadow: 'none',
            fontWeight: 500
          }}
          placeholder="Busque por nome ou cidade..."
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) handleOpen();
          }}
          onClick={handleOpen} 
          onFocus={handleOpen} 
          value={isOpen ? query : (selectedItem ? selectedItem.nome : "")} 
        />
        
        <svg 
          fill="none" viewBox="0 0 24 24" stroke="currentColor" 
          style={{ 
            width: '18px', height: '18px', color: '#9ca3af', cursor: 'pointer', flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* LISTA DROPDOWN FLUTUANTE (Absolute e Fundo Branco forçados) */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute', // Isso garante que não empurre nada!
            top: 'calc(100% + 6px)', 
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff', // Branco absoluto
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 99999, // Super alto para ficar em cima do modal e da foto
            overflow: 'hidden',
          }}
        >
          <ul style={{ maxHeight: '240px', overflowY: 'auto', margin: 0, padding: '0', listStyle: 'none' }}>
            {filteredPeople.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6b7280' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>😕</span>
                <p style={{ margin: 0, fontSize: '14px' }}>Nenhuma concessionária encontrada.</p>
              </div>
            ) : (
              filteredPeople.map((item) => {
                const isSelected = item.slug === value;
                return (
                  <li
                    key={item.slug}
                    onClick={() => {
                      onChange(item.slug);
                      setQuery(""); 
                      setIsOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent', // Fundo azul se selecionado
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s ease',
                      color: '#1f2937' 
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#1e40af' : '#334155' }}>
                        {item.nome}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '12px', height: '12px', marginRight: '4px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.cidade_sede}
                      </span>
                    </div>
                    
                    {/* Ícone de check para o item selecionado */}
                    {isSelected && (
                      <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', color: '#2563eb' }}>
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
          <div style={{ backgroundColor: '#f8fafc', padding: '8px 16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em' }}>
              Selecione a distribuidora
            </span>
          </div>
        </div>
      )}
    </div>
  );
}