import { Modal } from '../common/Modal';
import { Icon } from '../common/Icon';

/* ConfirmacionDialog: sustituye a los diálogos nativos del navegador por un
   diálogo de confirmación Material 3 oscuro, reutilizando el Modal global.

   props:
   - abierto (boolean): controla la visibilidad del diálogo.
   - titulo: título de la cabecera del modal.
   - mensaje: texto explicativo de la confirmación.
   - accion: 'peligro' | 'normal' | 'cian' | 'lavanda' (tono del botón e icono).
   - cargando: muestra el spinner y deshabilita los botones durante la operación.
   - error: mensaje de error opcional que se muestra dentro del diálogo.
   - onConfirmar: callback ejecutado al pulsar "Confirmar".
   - onCerrar: callback al pulsar "Cancelar", el icono X o el overlay. */

/* Icono SVG según la acción: 'close' para peligro, 'check' para
   confirmaciones tipo cian/normal y 'bolt' para acciones de IA (lavanda). */
const ICONO_POR_ACCION = {
  peligro: 'close',
  cian: 'check',
  lavanda: 'bolt',
  normal: 'check',
};

export function ConfirmacionDialog({
  abierto,
  titulo,
  mensaje,
  accion = 'normal',
  cargando = false,
  error = null,
  onConfirmar,
  onCerrar,
}) {
  /* Si la acción no es reconocida, se usa la variante normal. */
  const accionValida = ICONO_POR_ACCION[accion] ? accion : 'normal';
  const nombreIcono = ICONO_POR_ACCION[accionValida];

  return (
    <Modal isOpen={abierto} onClose={onCerrar} title={titulo} className="modal-cyber">
      <div className="cd-cuerpo">
        <span className={`cd-icono-marco cd-icono-marco-${accionValida}`} aria-hidden="true">
          <Icon name={nombreIcono} size={40} />
        </span>
        <p className="cd-mensaje">{mensaje}</p>
        {error && (
          <p className="cd-error" role="alert">{error}</p>
        )}
        <div className="cd-acciones">
          <button
            type="button"
            className="cd-boton cd-boton-cancelar"
            onClick={onCerrar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`cd-boton cd-boton-${accionValida}`}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando && <span className="cd-spinner" aria-hidden="true" />}
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
