const calcularTMB = ({ peso, altura, edad, sexo }) => {
  if (sexo === 'masculino') {
    return 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
  }
  return 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
};

const calcularGCT = (tmb, nivelActividad) => {
  const factores = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9,
  };
  return tmb * (factores[nivelActividad] || 1.2);
};

module.exports = { calcularTMB, calcularGCT };
