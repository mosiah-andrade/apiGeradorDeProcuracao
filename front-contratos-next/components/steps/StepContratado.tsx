import React, { ChangeEvent } from 'react';
import { FormData } from '@/app/types';

interface Props {
  formData: FormData;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function StepContratado({ formData, handleChange }: Props) {
  return (
    <div className="step-content">
        <div className="form-group">
          <label htmlFor="nome_CONTRATADO">Nome do Contratado (Outorgado)</label>
          <input
            id="nome_CONTRATADO"
            name="nome_CONTRATADO"
            type="text"
            value={formData.nome_CONTRATADO}
            onChange={handleChange}
            required
            placeholder="Nome completo do outorgado"
            aria-label="Nome do contratado"
          />
        </div>

        <div className="row form-group">
          <div className="half">
            <label htmlFor="cpf_CONTRATADO">CPF Contratado</label>
            <input
              id="cpf_CONTRATADO"
              name="cpf_CONTRATADO"
              type="text"
              value={formData.cpf_CONTRATADO}
              onChange={handleChange}
              required
              placeholder="000.000.000-00"
              maxLength={14}
              inputMode="numeric"
              aria-label="CPF do contratado"
            />
          </div>
          <div className="half">
            <label htmlFor="rg_CONTRATADO">RG Contratado</label>
            <input
              id="rg_CONTRATADO"
              name="rg_CONTRATADO"
              type="text"
              value={formData.rg_CONTRATADO}
              onChange={handleChange}
              required
              maxLength={15}
              placeholder="RG ou inscrição"
            />
          </div>
        </div>

        <div className="row form-group">
          <div className="half">
            <label htmlFor="orgao_emissor_CONTRATADO">Órgão Emissor</label>
            <input
              id="orgao_emissor_CONTRATADO"
              name="orgao_emissor_CONTRATADO"
              type="text"
              value={formData.orgao_emissor_CONTRATADO}
              onChange={handleChange}
              style={{ textTransform: 'uppercase' }}
              maxLength={10}
              placeholder="Ex.: SSP"
            />
          </div>
          <div className="half">
            <label htmlFor="endereco_CONTRATADO">Endereço Contratado</label>
            <input
              id="endereco_CONTRATADO"
              name="endereco_CONTRATADO"
              type="text"
              value={formData.endereco_CONTRATADO}
              onChange={handleChange}
              required
              placeholder="Rua, número, complemento"
            />
          </div>
        </div>
    </div>
  );
}