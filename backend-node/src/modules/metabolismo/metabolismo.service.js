const { calcularTMB, calcularGCT } = require('../../shared/utils/helpers');
const { CalculoMetabolico } = require('./metabolismo.model');

const calcular = async ({ peso, altura, edad, sexo, nivelActividad, clienteId = null }) => {
  const tmb = calcularTMB({ peso, altura, edad, sexo });
  const gct = calcularGCT(tmb, nivelActividad);

  const resultado = {
    tmb: Math.round(tmb),
    gct: Math.round(gct),
    nivelActividad,
  };

  if (clienteId) {
    await CalculoMetabolico.create({
      clienteId,
      tmb: resultado.tmb,
      gct: resultado.gct,
      nivelActividadUsado: nivelActividad,
      pesoUsado: peso,
    });
  }

  return resultado;
};

module.exports = { calcular };
