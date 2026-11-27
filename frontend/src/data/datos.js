export const resumen = [
  { id: 'rutas', numero: 30, texto: 'Rutas totales', tipo: 'neutro' },
  { id: 'activos', numero: 24, texto: 'Activos (80%)', tipo: 'ok' },
  { id: 'incidencias', numero: 2, texto: 'Incidencias (7%)', tipo: 'alerta' },
  { id: 'gps', numero: 4, texto: 'Sin reporte GPS', tipo: 'error' },
]

export const vehiculos = [
  { codigo: '15', placa: 'ABC-123', ubicacion: 'Av. Principal', estado: 'En ruta', hora: '10:20', x: 15, y: 45 },
  { codigo: '07', placa: 'DEF-456', ubicacion: 'Mercado Central', estado: 'Detenido', hora: '10:18', x: 78, y: 55 },
  { codigo: '08', placa: 'GHI-321', ubicacion: 'Cerca del Mercado', estado: 'En ruta', hora: '10:17', x: 45, y: 15 },
  { codigo: '22', placa: 'JKL-654', ubicacion: 'Av. del Sol', estado: 'En ruta', hora: '10:19', x: 40, y: 82 },
  { codigo: '11', placa: 'MNO-789', ubicacion: 'Av. Universitaria', estado: 'En ruta', hora: '10:21', x: 65, y: 78 },
]

export const notificaciones = [
  {
    id: 1,
    titulo: 'Aviso de circulación',
    mensaje: 'Código 07: el código 08 está delante de ustedes. Mantenga la distancia correspondiente.',
    hora: '10:17 a. m.',
    hace: 'Hace 7 min',
    codigo: '08',
    placa: 'GHI-321',
  },
]