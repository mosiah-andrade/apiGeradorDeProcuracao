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
          <label htmlFor="concessionaria" style={{color: 'black'}}>Concessionária</label>
          <ComboboxConcessionaria 
            value={formData.concessionaria} 
            onChange={(slug) => {
              handleChange({ target: { name: 'concessionaria', value: slug } } as any);
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

      {formData.cidade_concessionaria && (
        <div className="form-group" style={{background: '#0f172a', padding: '10px', borderRadius: 8, border: '1px solid #111827', color: '#cbd5e1'}}>
          <p style={{margin: 0}}>Sede: <strong style={{color: '#fff'}}>{formData.cidade_concessionaria}</strong> &nbsp;|&nbsp; CNPJ: <strong style={{color: '#fff'}}>{formData.cnpj_concessionaria}</strong></p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="contacontrato">Conta Contrato</label>
        <input id="contacontrato" name="contacontrato" value={formData.contacontrato} onChange={handleChange} required inputMode="numeric" placeholder="Número da conta/contrato" />
      </div>

      <div style={{marginTop: '20px', padding: '12px', background: '#111827', borderRadius: '8px', border: '1px solid #0f172a', color: '#cbd5e1'}}>
        <p className="subtitle" style={{fontWeight: '700', marginBottom: '8px', color: '#fff'}}>Representante Legal (Obrigatório para PJ)</p>
        <div className="row">
          <div className="half form-group">
            <label htmlFor="representante">Nome do Representante</label>
            <input id="representante" name="representante" value={formData.representante} onChange={handleChange} placeholder="Quem assina pela empresa" />
          </div>
          <div className="half form-group">
            <label htmlFor="cpf_representante">CPF do Representante</label>
            <input id="cpf_representante" name="cpf_representante" value={formData.cpf_representante} onChange={handleChange} placeholder="000.000.000-00" inputMode="numeric" />
          </div>
        </div>
      </div>
    </div>
  );
}