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
        <label htmlFor="nome">Nome do Cliente / Razão Social <span aria-hidden>•</span></label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={formData.nome}
          onChange={handleChange}
          required
          placeholder="Ex.: João da Silva ou Empresa LTDA"
          aria-label="Nome do cliente ou razão social"
          autoComplete="name"
        />
      </div>

      <div className="row form-group">
        <div className="half">
          <label htmlFor="cpf">CPF / CNPJ</label>
          <input
            id="cpf"
            name="cpf"
            type="text"
            value={formData.cpf}
            onChange={handleChange}
            required
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            maxLength={18}
            inputMode="numeric"
            aria-describedby="cpf-help"
          />
          <div id="cpf-help" className="text-sm text-gray-400"><span style={{fontSize: '10px', fontStyle: 'italic'}}>Informe CPF ou CNPJ (apenas números ou formatado)</span></div>
        </div>

        <div className="half">
          <label htmlFor="rg">RG / Inscrição Estadual</label>
          <input
            id="rg"
            name="rg"
            type="text"
            value={formData.rg}
            onChange={handleChange}
            placeholder="Opcional se for PJ"
            maxLength={15}
            aria-label="RG ou inscrição estadual"
          />
        </div>
      </div>

      <div className="row form-group">
        <div className="half">
          <label htmlFor="orgao_emissor">Órgão Emissor</label>
          <input
            id="orgao_emissor"
            name="orgao_emissor"
            type="text"
            value={formData.orgao_emissor}
            onChange={handleChange}
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            placeholder="Ex.: SSP"
            aria-label="Órgão emissor"
          />
        </div>

        <div className="half">
          <label htmlFor="endereco">Endereço Completo</label>
          <input
            id="endereco"
            name="endereco"
            type="text"
            value={formData.endereco}
            onChange={handleChange}
            required
            placeholder="Rua, número, complemento"
            aria-label="Endereço completo"
          />
        </div>
      </div>

      <div className="row form-group">
        <div className="half">
          <label htmlFor="bairro">Bairro</label>
          <input id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required placeholder="Bairro" />
        </div>
        <div className="half">
          <label htmlFor="cidade">Cidade</label>
          <input id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required placeholder="Cidade" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cep">CEP</label>
        <input id="cep" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" inputMode="numeric" required maxLength={9} />
      </div>
    </div>
  );
}