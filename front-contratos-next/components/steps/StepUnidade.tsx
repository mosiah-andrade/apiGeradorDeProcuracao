import React, { ChangeEvent } from 'react';
import { FormData } from '@/app/types';
import ComboboxConcessionaria from '@/components/ComboboxConcessionaria';

interface Props {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function StepUnidade({ formData, handleChange }: Props) {
  return (
    <div className="step-content">
        <div className="row form-group">
        <div className="half">
            <ComboboxConcessionaria 
            value={formData.concessionaria} 
            onChange={(slug) => {
                // Simulamos um evento "fake" para reaproveitar sua função handleChange
                // Ou chamamos a lógica diretamente
                handleChange({
                target: { name: 'concessionaria', value: slug }
                } as any);
            }} 
            />
        </div>
        <div className="half">
            <label htmlFor="classificacao">Classificação</label>
            <select id="classificacao" name="classificacao" value={formData.classificacao} onChange={handleChange}>
            <option value="Monofásico">Monofásico</option>
            <option value="Bifásico">Bifásico</option>
            <option value="Trifásico">Trifásico</option>
            </select>
        </div>
        </div>
        
        {/* EXIBINDO DADOS AUTOMÁTICOS DA CONCESSIONÁRIA (OPCIONAL - PARA CONFERÊNCIA) */}
        {formData.cidade_concessionaria && (
            <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '10px', padding: '5px', background: '#eee', borderRadius: '4px'}}>
                <p>Sede: {formData.cidade_concessionaria} | CNPJ: {formData.cnpj_concessionaria}</p>
            </div>
        )}

        <div className="form-group"><label htmlFor="contacontrato">Conta Contrato</label><input id="contacontrato" name="contacontrato" value={formData.contacontrato} onChange={handleChange} required inputMode="numeric"/></div>
        
        <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
        <p className="subtitle" style={{fontWeight: 'bold', marginBottom: '10px', color: '#444'}}>Representante Legal (Obrigatório para PJ)</p>
        <div className="form-group"><label htmlFor="representante">Nome do Representante</label><input id="representante" name="representante" value={formData.representante} onChange={handleChange} placeholder="Quem assina pela empresa" style={{color: '#1c1c1c'}}/></div>
        <div className="form-group"><label htmlFor="cpf_representante">CPF do Representante</label><input id="cpf_representante" name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} placeholder="000.000.000-00" style={{color: '#1c1c1c'}}/></div>
        </div>
    </div>
  );
}