import React, { ChangeEvent } from 'react';
import { FormData } from '@/app/types';

interface Props {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function StepContratado({ formData, handleChange }: Props) {
  return (
    <div className="step-content">
        <div className="form-group"><label htmlFor="nome_CONTRATADO">Nome do Contratado (Outorgado)</label><input id="nome_CONTRATADO" name="nome_CONTRATADO" value={formData.nome_CONTRATADO} onChange={handleChange} required /></div>
        <div className="row form-group">
            <div className="half"><label htmlFor="rg_CONTRATADO">RG Contratado</label><input id="rg_CONTRATADO" name="rg_CONTRATADO" value={formData.rg_CONTRATADO} onChange={handleChange} required maxLength={15} /></div>
            <div className="half"><label htmlFor="orgao_emissor_CONTRATADO">Órgão Emissor</label><input id="orgao_emissor_CONTRATADO" name="orgao_emissor_CONTRATADO" value={formData.orgao_emissor_CONTRATADO} onChange={handleChange} style={{textTransform: 'uppercase'}} maxLength={10} /></div>
        </div>
        <div className="form-group"><label htmlFor="cpf_CONTRATADO">CPF Contratado</label><input id="cpf_CONTRATADO" name="cpf_CONTRATADO" value={formData.cpf_CONTRATADO} onChange={handleChange} required maxLength={14} /></div>
        <div className="form-group"><label htmlFor="endereco_CONTRATADO">Endereço Contratado</label><input id="endereco_CONTRATADO" name="endereco_CONTRATADO" value={formData.endereco_CONTRATADO} onChange={handleChange} required/></div>
    </div>
  );
}