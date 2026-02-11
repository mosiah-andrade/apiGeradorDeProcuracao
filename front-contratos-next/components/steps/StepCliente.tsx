import React, { ChangeEvent } from 'react';
import { FormData } from '@/app/types';

interface Props {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function StepCliente({ formData, handleChange }: Props) {
  return (
    <div className="step-content">
        <div className="form-group">
            <label htmlFor="nome">Nome do Cliente / Razão Social</label>
            <input id="nome" name="nome" value={formData.nome} onChange={handleChange} required autoFocus />
        </div>
        <div className="half form-group">
        <label htmlFor="cpf">CPF / CNPJ</label>
        <input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00 ou CNPJ" maxLength={18} />
        </div>
        <div className="row form-group">
        <div className="half">
            <label htmlFor="rg">RG / Inscrição Estadual</label>
            <input id="rg" name="rg" value={formData.rg} onChange={handleChange} placeholder="Opcional se for PJ" maxLength={15} />
        </div>
        <div className="half">
            <label htmlFor="orgao_emissor">Órgão Emissor</label>
            <input id="orgao_emissor" name="orgao_emissor" value={formData.orgao_emissor} onChange={handleChange} maxLength={10} style={{textTransform: 'uppercase'}} />
        </div>
        </div>
        <div className="form-group">
        <label htmlFor="endereco">Endereço Completo</label>
        <input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange} required />
        </div>
        <div className="row form-group">
            <div className="half"><label htmlFor="bairro">Bairro</label><input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required /></div>
            <div className="half"><label htmlFor="cidade">Cidade</label><input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required /></div>
        </div>
        <div className="form-group"><label htmlFor="cep">CEP</label><input id="cep" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" inputMode="numeric" required /></div>
    </div>
  );
}