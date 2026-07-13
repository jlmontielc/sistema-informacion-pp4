import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { Icon } from './Icon';

const placeholderImages = [
  {
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    descripcion: 'Entrenamiento funcional en grupo',
  },
  {
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    descripcion: 'Rutina personalizada con pesas',
  },
  {
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    descripcion: 'Plan nutricional balanceado',
  },
  {
    url: 'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=800&q=80',
    descripcion: 'Seguimiento de progreso',
  },
];

export function Carousel({ autoPlay = true, interval = 5000 }) {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    api.get('/galeria')
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : res.data?.imagenes || [];
        setImages(data.length > 0 ? data : placeholderImages);
      })
      .catch(() => {
        if (!cancelled) {
          setError(false);
          setImages(placeholderImages);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const goTo = useCallback((index) => {
    setCurrent(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, images.length, next]);

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: 400,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--color-neutral-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)',
      }}>
        Cargando galería...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: 300,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--color-neutral-100)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        color: 'var(--color-text-secondary)',
      }}>
        <Icon name="camera" size={48} color="var(--color-neutral-400)" />
        <p>El entrenador aún no ha publicado imágenes</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: 0,
        paddingBottom: '56.25%',
        background: 'var(--color-neutral-200)',
      }}>
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.5s ease',
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {img.descripcion && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--space-4) var(--space-6)',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white',
                fontSize: 'var(--text-sm)',
              }}>
                {img.descripcion}
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            aria-label="Anterior"
          >
            <Icon name="prev" size={20} color="white" />
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
            aria-label="Siguiente"
          >
            <Icon name="next" size={20} color="white" />
          </button>
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'all var(--transition-fast)',
                  padding: 0,
                }}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
