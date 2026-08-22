const { NivelRiesgo } = require('./injury_rules');
const { evaluar_ejercicio_por_lesiones } = require('./injury_rules');
const { NivelRiesgo: NR2, evaluar_ejercicio_por_condiciones, obtener_precauciones_cliente } = require('./condition_rules');
const { NivelRiesgo: NR3, validar_carga_ejercicio, calcular_carga_maxima_recomendada } = require('./load_rules');


class GuardianSeguridad {
  constructor() {
    this.alertas_global = [];
    this.ejercicios_bloqueados = [];
    this.ejercicios_con_precaucion = [];
  }

  evaluar_cliente_completo(datos_cliente, perfil_medico) {
    this.alertas_global = [];
    this.ejercicios_bloqueados = [];
    this.ejercicios_con_precaucion = [];

    const lesiones = perfil_medico ? perfil_medico.lesiones || [] : [];
    const condiciones = perfil_medico ? perfil_medico.condiciones_preexistentes || [] : [];

    return {
      lesiones_detectadas: lesiones,
      condiciones_detectadas: condiciones,
      precauciones: obtener_precauciones_cliente(condiciones),
      nivel_riesgo_global: this._calcular_nivel_global(lesiones, condiciones),
    };
  }

  validar_ejercicio(ejercicio, datos_cliente, perfil_medico, carga_kg = null) {
    const lesiones = perfil_medico ? perfil_medico.lesiones || [] : [];
    const condiciones = perfil_medico ? perfil_medico.condiciones_preexistentes || [] : [];

    const resultado_lesiones = evaluar_ejercicio_por_lesiones(ejercicio.nombre, lesiones);
    const resultado_condiciones = evaluar_ejercicio_por_condiciones(
      ejercicio.nombre,
      condiciones,
      datos_cliente.nivel_actividad
    );

    let resultado_carga = null;
    if (carga_kg !== null && carga_kg > 0) {
      resultado_carga = validar_carga_ejercicio(
        carga_kg,
        datos_cliente.peso,
        datos_cliente.altura,
        datos_cliente.edad,
        datos_cliente.nivel_actividad
      );
    }

    const niveles = [
      resultado_lesiones.nivel_maximo,
      resultado_condiciones.nivel_maximo,
    ];

    let nivel_maximo = NR3.SAFE;
    if (resultado_carga && resultado_carga.nivel_riesgo) {
      niveles.push(resultado_carga.nivel_riesgo);
    }

    for (const n of niveles) {
      const orden = {
        [NivelRiesgo.SAFE]: 0,
        [NivelRiesgo.LOW]: 1,
        [NivelRiesgo.MEDIUM]: 2,
        [NivelRiesgo.HIGH]: 3,
        [NivelRiesgo.CRITICAL]: 4,
      };
      if (orden[n] > orden[nivel_maximo]) {
        nivel_maximo = n;
      }
    }

    const bloqueado = (
      resultado_lesiones.bloqueado
      || resultado_condiciones.bloqueado
      || (resultado_carga && resultado_carga.nivel_riesgo === NivelRiesgo.CRITICAL)
    );

    const todas_alertas = [
      ...resultado_lesiones.alertas,
      ...resultado_condiciones.alertas,
    ];

    if (resultado_carga && resultado_carga.nivel_riesgo !== NivelRiesgo.SAFE) {
      todas_alertas.push({
        tipo: 'carga',
        nivel_riesgo: resultado_carga.nivel_riesgo,
        mensaje: resultado_carga.mensaje,
      });
    }

    const modificacion = resultado_lesiones.modificacion_sugerida;

    const intensidad_permitida = resultado_condiciones.intensidad_permitida !== undefined
      ? resultado_condiciones.intensidad_permitida
      : 1.0;

    const resultado = {
      ejercicio_id: ejercicio.id,
      ejercicio_nombre: ejercicio.nombre,
      nivel_riesgo: nivel_maximo,
      bloqueado,
      alertas: todas_alertas,
      modificacion_sugerida: modificacion,
      intensidad_permitida,
    };

    if (bloqueado) {
      this.ejercicios_bloqueados.push(resultado);
    } else if (nivel_maximo !== NivelRiesgo.SAFE) {
      this.ejercicios_con_precaucion.push(resultado);
    }

    this.alertas_global.push(...todas_alertas);

    return resultado;
  }

  filtrar_pool_ejercicios(ejercicios, datos_cliente, perfil_medico) {
    const seguros = [];
    const bloqueados = [];
    const precaucion = [];

    for (const ejercicio of ejercicios) {
      const resultado = this.validar_ejercicio(ejercicio, datos_cliente, perfil_medico);
      if (resultado.bloqueado) {
        bloqueados.push({
          ejercicio,
          razon: resultado,
        });
      } else if (resultado.nivel_riesgo !== NivelRiesgo.SAFE) {
        precaucion.push({
          ejercicio,
          razon: resultado,
        });
        seguros.push(ejercicio);
      } else {
        seguros.push(ejercicio);
      }
    }

    return {
      pool_seguro: seguros,
      ejercicios_bloqueados: bloqueados,
      ejercicios_precaucion: precaucion,
      total_evaluados: ejercicios.length,
      total_seguros: seguros.length,
      total_bloqueados: bloqueados.length,
      total_precaucion: precaucion.length,
      alertas_globales: this.alertas_global,
    };
  }

  _determinar_nivel_maximo(...niveles) {
    const orden = {
      [NivelRiesgo.SAFE]: 0,
      [NivelRiesgo.LOW]: 1,
      [NivelRiesgo.MEDIUM]: 2,
      [NivelRiesgo.HIGH]: 3,
      [NivelRiesgo.CRITICAL]: 4,
    };
    let maximo = NivelRiesgo.SAFE;
    for (const nivel of niveles) {
      if (orden[nivel] > orden[maximo]) {
        maximo = nivel;
      }
    }
    return maximo;
  }

  _calcular_nivel_global(lesiones, condiciones) {
    if (lesiones.length >= 3 || condiciones.length >= 3) {
      return NivelRiesgo.HIGH;
    } else if (lesiones.length >= 2 || condiciones.length >= 2) {
      return NivelRiesgo.MEDIUM;
    } else if (lesiones.length >= 1 || condiciones.length >= 1) {
      return NivelRiesgo.LOW;
    }
    return NivelRiesgo.SAFE;
  }
}

module.exports = { GuardianSeguridad, NivelRiesgo };