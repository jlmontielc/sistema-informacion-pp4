const { calcularTMB, calcularGCT } = require('../../shared/utils/helpers');

const calcular = async ({ peso, altura, edad, sexo, nivelActividad }) => {
  const tmb = calcularTMB({ peso, altura, edad, sexo });
  const gct = calcularGCT(tmb, nivelActividad);

  return {
    tmb: Math.round(tmb),
    gct: Math.round(gct),
    nivelActividad,
  };
};

module.exports = { calcular };
