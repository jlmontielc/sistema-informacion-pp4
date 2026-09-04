import { Card } from '../common/Card';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

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
    <div className="reportes-delta">
      <span
        className={`reportes-delta-valor ${esPositivo ? 'positivo' : ''} ${esNegativo ? 'negativo' : ''}`}
        aria-label={`${etiqueta}: ${formatearDelta(valor)}`}
      >
        {formatearDelta(valor)}
      </span>
      <span className="reportes-delta-etiqueta">{etiqueta}</span>
    </div>
  );
}

function MetricaCard({ nombre, valor, unidad, deltaVsHistorico, deltaVsGrupo }) {
  return (
    <div className="reportes-comparativa-card">
      <p className="reportes-comparativa-nombre">{nombre}</p>
      <p className="reportes-comparativa-valor">
        {formatearNumero(valor)}
        {unidad ? <span className="reportes-comparativa-unidad"> {unidad}</span> : null}
      </p>
      <div className="reportes-comparativa-deltas">
        <Delta valor={deltaVsHistorico} etiqueta="vs histórico" />
        <Delta valor={deltaVsGrupo} etiqueta="vs grupo" />
      </div>
    </div>
  );
}

export function ResumenComparativa({ datos, cargando, error }) {
  if (cargando) {
    return (
      <Card header="Comparativa de rendimiento">
        <Loading size="md" text="Cargando comparativa..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card header="Comparativa de rendimiento">
        <EmptyState icon="⚠️" title="Error" description={error} />
      </Card>
    );
  }

  if (!datos) {
    return (
      <Card header="Comparativa de rendimiento">
        <EmptyState
          icon="🎯"
          title="Sin comparativas"
          description="No hay suficiente historial para generar comparativas."
        />
      </Card>
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
    <Card header="Comparativa de rendimiento">
      <div className="reportes-comparativa-grid">
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
    </Card>
  );
}
