import { Icon } from '../common/Icon';
import { Loading } from '../common/Loading';

function formatearNumero(valor) {
  if (valor === undefined || valor === null || Number.isNaN(Number(valor))) return '—';
  return Number(valor).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function calcularDelta(actual, referencia) {
  if (
    actual === undefined ||
    actual === null ||
    referencia === undefined ||
    referencia === null ||
    Number(referencia) === 0
  ) {
    return null;
  }
  return ((Number(actual) - Number(referencia)) / Number(referencia)) * 100;
}

function formatearDelta(valor) {
  if (valor === undefined || valor === null) return '—';
  const signo = valor > 0 ? '+' : '';
  return `${signo}${Number(valor).toFixed(1)}%`;
}

function Delta({ valor, etiqueta }) {
  const esPositivo = valor > 0;
  const esNegativo = valor < 0;
  return (
    <div className="rp-delta">
      <span
        className={`rp-delta-valor ${esPositivo ? 'rp-delta-valor--positivo' : ''} ${esNegativo ? 'rp-delta-valor--negativo' : ''}`}
        aria-label={`${etiqueta}: ${formatearDelta(valor)}`}
      >
        {formatearDelta(valor)}
      </span>
      <span className="rp-delta-etiqueta">{etiqueta}</span>
    </div>
  );
}

function MetricaCard({ nombre, valor, unidad, deltaVsHistorico, deltaVsGrupo }) {
  return (
    <div className="rp-metrica">
      <p className="rp-metrica-nombre">{nombre}</p>
      <p className="rp-metrica-valor">
        {formatearNumero(valor)}
        {unidad ? <span className="rp-metrica-unidad">{unidad}</span> : null}
      </p>
      <div className="rp-deltas">
        <Delta valor={deltaVsHistorico} etiqueta="vs histórico" />
        <Delta valor={deltaVsGrupo} etiqueta="vs grupo" />
      </div>
    </div>
  );
}

export function ResumenComparativa({ datos, cargando, error }) {
  const cabecera = (
    <div className="rp-card-cabecera">
      <h2 className="rp-card-titulo">
        <Icon name="target" size={20} className="rp-icono" />
        Comparativa de rendimiento
      </h2>
    </div>
  );

  if (cargando) {
    return (
      <div className="rp-card">
        {cabecera}
        <Loading size="md" text="Cargando comparativa..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rp-card">
        {cabecera}
        <div className="rp-estado">
          <div className="rp-estado-icono rp-estado-icono--error">
            <Icon name="close" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Error</h3>
          <p className="rp-estado-descripcion">{error}</p>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="rp-card">
        {cabecera}
        <div className="rp-estado">
          <div className="rp-estado-icono">
            <Icon name="target" size={32} />
          </div>
          <h3 className="rp-estado-titulo">Sin comparativas</h3>
          <p className="rp-estado-descripcion">
            No hay suficiente historial para generar comparativas.
          </p>
        </div>
      </div>
    );
  }

  const historico = datos.promedioHistoricoGlobal || {};
  const otros = datos.comparativaOtros || {};

  const metricas = [
    {
      clave: 'volumenPeriodo',
      nombre: 'Volumen total del período',
      valor: datos.volumenTotalPeriodo,
      unidad: 'kg',
      referenciaHistorico: historico.volumenPromedioSemanal,
      referenciaGrupo: otros.volumenPromedioSemanal,
    },
    {
      clave: 'volumenPromedioSemanal',
      nombre: 'Volumen promedio semanal',
      valor: datos.volumenPromedioSemanalPeriodo,
      unidad: 'kg/semana',
      referenciaHistorico: historico.volumenPromedioSemanal,
      referenciaGrupo: otros.volumenPromedioSemanal,
    },
    {
      clave: 'pesoMaximo',
      nombre: 'Peso máximo histórico',
      valor: historico.pesoMaximo,
      unidad: 'kg',
      referenciaHistorico: null,
      referenciaGrupo: null,
    },
    {
      clave: 'sesionesPromedio',
      nombre: 'Sesiones promedio semanal',
      valor: historico.sesionesPromedioSemanal,
      unidad: '',
      referenciaHistorico: null,
      referenciaGrupo: null,
    },
  ];

  return (
    <div className="rp-card">
      {cabecera}
      <div className="rp-card-cuerpo">
        <div className="rp-comparativa-grid">
          {metricas.map((metrica) => (
            <MetricaCard
              key={metrica.clave}
              nombre={metrica.nombre}
              valor={metrica.valor}
              unidad={metrica.unidad}
              deltaVsHistorico={
                metrica.referenciaHistorico !== null
                  ? calcularDelta(metrica.valor, metrica.referenciaHistorico)
                  : null
              }
              deltaVsGrupo={
                metrica.referenciaGrupo !== null
                  ? calcularDelta(metrica.valor, metrica.referenciaGrupo)
                  : null
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
