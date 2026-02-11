// utils/formatters.ts
export const formatarCpfCnpj = (value: string) => {
  const apenasNumeros = value.replace(/\D/g, '');
  const numerosLimitados = apenasNumeros.slice(0, 14);
  if (numerosLimitados.length <= 11) {
    return numerosLimitados
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    return numerosLimitados
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
};

export const formatarCep = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
export const formatarRG = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');