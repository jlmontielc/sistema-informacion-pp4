const { NivelRiesgo, evaluar_ejercicio_por_lesiones, detectar_grupo_lesion } = '../backend-node/src/shared/guardian/injury_rules';

describe('Rules: injury', () => {
  it('detecta grupos de lesiones correctamente', () => {
    const resultado = detectar_grupo_lesion('Hernia discal L4-L5');
    expect(resultado).toContain('espalda_baja');
    
    const resultado2 = detectar_grupo_lesion('LCA reconstruido rodilla derecha');
    expect(resultado2).toContain('rodilla');
  });

  it('evalúa ejercicios por lesiones', () => {
    const lesiones = ['Hernia discal lumbar'];
    const resultado = evaluar_ejercicio_por_lesiones('Sentadilla', lesiones);
    expect(resultado).toHaveProperty('bloqueado');
    expect(resultado).toHaveProperty('nivel_maximo');
    expect(Array.isArray(resultado.alertas)).toBe(true);
  });

  it('marca ejercicios críticos por lesión de rodilla', () => {
    const lesiones = ['LCA roto'];
    const resultado = evaluar_ejercicio_por_lesiones('Sentadilla', lesiones);
    expect(resultado.nivel_maximo).toBe('CRITICAL');
    expect(resultado.bloqueado).toBe(true);
  });
});