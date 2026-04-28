// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { 
  Camera, 
  Thermometer, 
  Radio, 
  Cpu, 
  ShieldCheck, 
  Bell, 
  Settings, 
  Users, 
  Map as MapIcon, 
  LayoutDashboard, 
  LogOut, 
  Search, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Activity,
  Maximize2,
  Menu,
  X,
  FileText,
  Moon,
  ChevronLeft,
  Plus,
  Minus,
  Calendar,
  ChevronDown,
  Sun,
  Smartphone,
  Tractor,
  Shirt,
  ZoomIn,
  ZoomOut,
  User,
  Maximize,
  Filter,
  ArrowRight,
  ArrowUpRight,
  Info,
  Grid,
  Signal,
  Database,
  Locate,
  History,
  UserPlus,
  UserCog,
  Unlock,
  Key,
  Sliders,
  Globe,
  Shield,
  Palette,
  RefreshCw,
  Play,
  Square,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LinkedinIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M7 10v7" />
      <path d="M7 7.5v.5" />
      <path d="M11 10v7" />
      <path d="M11 13.2c0-2 3-2.2 3-0.2V17" />
    </svg>
  );
};

const tokenToHex = (token: string) => {
  const t = String(token || '').replace(/^text-/, '').replace(/^bg-/, '').replace(/^border-/, '');
  if (t === 'siac-accent' || t === 'siac-active') return '#4DC493';
  if (t === 'siac-armed' || t === 'siac-green') return '#0B986A';
  if (t === 'siac-disarmed' || t === 'siac-orange') return '#D89A1E';
  if (t === 'siac-alarmed') return '#FAD92A';
  if (t === 'siac-blocked' || t === 'siac-red') return '#F51E1E';
  if (t === 'siac-off') return '#4A4949';
  return '#FFFFFF';
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const buildSparkline = (data: number[], width = 40, height = 24) => {
  const values = Array.isArray(data) ? data : [];
  if (values.length < 2) return { line: '', area: '' };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2) + 1;
    const y = (1 - (v - min) / span) * (height - 4) + 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const line = points.join(' ');
  const area = `${points[0]} ${line} ${points[points.length - 1].split(',')[0]},${height - 1} ${points[0].split(',')[0]},${height - 1}`;
  return { line, area };
};

const Sparkline = ({ data, colorHex }: { data: number[]; colorHex: string }) => {
  const spark = buildSparkline(data, 40, 24);
  return (
    <svg width="40" height="24" viewBox="0 0 40 24" className="shrink-0 opacity-90">
      {spark.area && (
        <polygon points={spark.area} fill={hexToRgba(colorHex, 0.10)} />
      )}
      {spark.line && (
        <polyline
          points={spark.line}
          fill="none"
          stroke={colorHex}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

const AnimatedInt = ({
  value,
  durationMs = 800,
  format,
  className,
}: {
  value: number;
  durationMs?: number;
  format?: (v: number) => string;
  className?: string;
}) => {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [text, setText] = useState(() => (format ? format(0) : '0'));

  useEffect(() => {
    const controls = animate(mv, Number(value) || 0, { duration: durationMs / 1000, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => setText(format ? format(v) : String(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [durationMs, format, mv, rounded, value]);

  return <span className={className}>{text}</span>;
};

// --- Types ---
type DeviceType = 'Cámara' | 'Infrarrojo' | 'PIR' | 'GW' | 'Activo';
type Status = 'OK' | 'ALERTA' | 'PENDIENTE' | 'RESUELTO';

interface Alarm {
  id: string;
  fecha: string;
  estado: Status;
  dispositivo: string;
  tipo: DeviceType;
  ubicacion: string;
  descripcion: string;
}

interface KPI {
  id: DeviceType;
  label: string;
  icon: any;
  value: number;
  total: number;
  status: 'OK' | 'ALERTA' | 'AVISO';
  color: string;
  data?: number[];
}

interface Pin {
  id: string;
  x: number;
  y: number;
  tipo: DeviceType;
  estado: 'Apagado' | 'Armado' | 'Des-armado' | 'Alarmado' | 'Bloqueado';
  nombre: string;
}

// --- Mock Data Generator ---
const generateAlarms = (): Alarm[] => [
  { id: '1', fecha: '2024-04-19 02:42:13', estado: 'RESUELTO', dispositivo: 'ZONAS_POLM', tipo: 'Cámara', ubicacion: 'ZONAS_POU', descripcion: 'Movimiento detectado en zona restringida' },
  { id: '2', fecha: '2024-04-19 02:42:13', estado: 'RESUELTO', dispositivo: 'ZONAS_POLM', tipo: 'PIR', ubicacion: 'ZONAS_POU', descripcion: 'Sensor PIR activado' },
  { id: '3', fecha: '2024-04-19 02:42:13', estado: 'PENDIENTE', dispositivo: 'ZONAS_POLM', tipo: 'Infrarrojo', ubicacion: 'ZONAS_POU', descripcion: 'Obstrucción detectada' },
  { id: '4', fecha: '2024-04-19 02:42:13', estado: 'RESUELTO', dispositivo: 'ZONAS_POLM', tipo: 'GW', ubicacion: 'ZONAS_POU', descripcion: 'Reinicio de gateway exitoso' },
  { id: '5', fecha: '2024-04-19 02:42:13', estado: 'PENDIENTE', dispositivo: 'ZONAS_POLM', tipo: 'Activo', ubicacion: 'ZONAS_POU', descripcion: 'Batería baja en sensor' },
];

const INITIAL_PINS: Pin[] = [
  { id: 'ZONA5_POLM1', x: 20, y: 30, tipo: 'Cámara', estado: 'Armado', nombre: 'CAM-01' },
  { id: 'ZONA2_SENS4', x: 45, y: 25, tipo: 'Infrarrojo', estado: 'Alarmado', nombre: 'INF-02' },
  { id: 'ZONA8_PIR9', x: 70, y: 40, tipo: 'PIR', estado: 'Des-armado', nombre: 'PIR-05' },
  { id: 'GW_MASTER_01', x: 30, y: 65, tipo: 'GW', estado: 'Armado', nombre: 'GW-ALPHA' },
  { id: 'ACT_VALVE_22', x: 60, y: 75, tipo: 'Activo', estado: 'Bloqueado', nombre: 'ACT-99' },
  { id: 'ZONA1_CAM08', x: 85, y: 20, tipo: 'Cámara', estado: 'Apagado', nombre: 'CAM-08' },
];

// --- Components ---

const AlarmsView = ({ onNavigateToMap }: { onNavigateToMap: () => void }) => {
  const [selectedAlarm, setSelectedAlarm] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deviceTypeFilters, setDeviceTypeFilters] = useState<string[]>([]);
  const [severityFilters, setSeverityFilters] = useState<string[]>([]);
  const [resolveState, setResolveState] = useState<'idle' | 'loading' | 'success'>('idle');

  const runSimulatedAction = (
    setState: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'success'>>
  ) => {
    setState('loading');
    window.setTimeout(() => {
      setState('success');
      window.setTimeout(() => setState('idle'), 900);
    }, 1500);
  };

  const alarmKPIs = [
    { label: 'Alertas Totales', value: '1,284', trend: '+12%', color: 'text-white', data: [20, 35, 25, 45, 30, 55, 40] },
    { label: 'Críticas', value: '24', trend: '+5%', color: 'text-[#F51E1E]', data: [5, 12, 8, 15, 10, 18, 14] },
    { label: 'Tiempo Resp. (Avg)', value: '4.2m', trend: '-8%', color: 'text-siac-accent', data: [8, 6, 7, 5, 6, 4, 5] },
    { label: 'Resolución', value: '98.2%', trend: '+0.5%', color: 'text-siac-accent', data: [95, 96, 94, 97, 98, 97, 98] },
  ];

  const alarmsData = [
    { id: 'EV-8392', timestamp: '2026-04-26 14:22:10', activo: 'CAM-01', tipo: 'Camera', severidad: 'Crítico', color: '#F51E1E', ip: '192.168.1.101', ubicacion: 'ZONA_NORTE_01' },
    { id: 'EV-8391', timestamp: '2026-04-26 14:18:05', activo: 'INF-02', tipo: 'Thermometer', severidad: 'Advertencia', color: '#D89A1E', ip: '192.168.1.105', ubicacion: 'PERIMETRO_B' },
    { id: 'EV-8390', timestamp: '2026-04-26 14:05:44', activo: 'PIR-05', tipo: 'Radio', severidad: 'Informativo', color: '#4DC493', ip: '192.168.1.112', ubicacion: 'ALMACEN_CENTRAL' },
    { id: 'EV-8389', timestamp: '2026-04-26 13:55:12', activo: 'GW-ALPHA', tipo: 'Cpu', severidad: 'Advertencia', color: '#D89A1E', ip: '10.0.0.45', ubicacion: 'SALA_SERVIDORES' },
    { id: 'EV-8388', timestamp: '2026-04-26 13:42:30', activo: 'ACT-99', tipo: 'Activity', severidad: 'Crítico', color: '#F51E1E', ip: '10.0.0.89', ubicacion: 'VALVULA_PRINCIPAL' },
    { id: 'EV-8387', timestamp: '2026-04-26 13:35:02', activo: 'MACH-TR_07', tipo: 'Tractor', severidad: 'Advertencia', color: '#D89A1E', ip: '10.0.0.77', ubicacion: 'OBRA_SECTOR_02' },
    { id: 'EV-8386', timestamp: '2026-04-26 13:28:19', activo: 'USR-MOB_12', tipo: 'Smartphone', severidad: 'Informativo', color: '#4DC493', ip: '10.0.0.12', ubicacion: 'ACCESO_SUR' },
    { id: 'EV-8385', timestamp: '2026-04-26 13:21:44', activo: 'PPE-STAFF_03', tipo: 'Shirt', severidad: 'Crítico', color: '#F51E1E', ip: '10.0.0.33', ubicacion: 'ZONA_RESTRINGIDA_A' },
    { id: 'EV-8384', timestamp: '2026-04-26 13:10:08', activo: 'SOL-GRID_01', tipo: 'Grid', severidad: 'Informativo', color: '#4DC493', ip: '10.0.0.201', ubicacion: 'PLANTA_SOLAR' },
    { id: 'EV-8383', timestamp: '2026-04-26 12:58:51', activo: 'TWR-SIG_04', tipo: 'Signal', severidad: 'Advertencia', color: '#D89A1E', ip: '10.0.0.154', ubicacion: 'TORRE_COMMS' },
    { id: 'EV-8382', timestamp: '2026-04-26 12:42:17', activo: 'DB-EDGE_01', tipo: 'Database', severidad: 'Crítico', color: '#F51E1E', ip: '10.0.0.250', ubicacion: 'EDGE_DC' },
  ];

  const deviceTypeOptions = [
    { id: 'Camera', label: 'Cámara' },
    { id: 'Thermometer', label: 'Infrarrojo' },
    { id: 'Radio', label: 'Radio' },
    { id: 'Cpu', label: 'Gateway' },
    { id: 'Activity', label: 'Activo' },
    { id: 'Tractor', label: 'Maquinaria' },
    { id: 'Smartphone', label: 'Móvil' },
    { id: 'Shirt', label: 'Personal' },
    { id: 'Grid', label: 'Grid' },
    { id: 'Signal', label: 'Señal' },
    { id: 'Database', label: 'Database' },
  ];

  const severityOptions = [
    { id: 'Crítico', label: 'Crítico', color: '#F51E1E' },
    { id: 'Advertencia', label: 'Advertencia', color: '#D89A1E' },
    { id: 'Informativo', label: 'Informativo', color: '#4DC493' },
  ];

  const renderIcon = (tipo: string) => {
    switch(tipo) {
      case 'Camera': return <Camera className="w-4 h-4" />;
      case 'Thermometer': return <Thermometer className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Tractor': return <Tractor className="w-4 h-4" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'Shirt': return <Shirt className="w-4 h-4" />;
      case 'Grid': return <Grid className="w-4 h-4" />;
      case 'Signal': return <Signal className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredAlarms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alarmsData.filter((alarm) => {
      const searchable = [
        alarm.id,
        alarm.timestamp,
        alarm.activo,
        alarm.tipo,
        alarm.severidad,
        alarm.ip,
        alarm.ubicacion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = q.length === 0 ? true : searchable.includes(q);
      const matchesDevice = deviceTypeFilters.length === 0 ? true : deviceTypeFilters.includes(alarm.tipo);
      const matchesSeverity = severityFilters.length === 0 ? true : severityFilters.includes(alarm.severidad);

      return matchesSearch && matchesDevice && matchesSeverity;
    });
  }, [alarmsData, deviceTypeFilters, searchTerm, severityFilters]);

  const activityData = [
    { time: '14:12', val: 30 }, { time: '14:13', val: 35 }, { time: '14:14', val: 32 },
    { time: '14:15', val: 85 }, { time: '14:16', val: 92 }, { time: '14:17', val: 88 },
    { time: '14:18', val: 95 }, { time: '14:19', val: 90 }, { time: '14:20', val: 82 },
    { time: '14:21', val: 88 }, { time: '14:22', val: 94 }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto bg-industrial-950 relative">
      {/* Header & KPI Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-siac-blocked/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-siac-blocked" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Alarmas</h1>
              <p className="text-xs text-gray-500 uppercase font-mono tracking-widest">Product Intelligence Unit</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Buscar evento o activo..."
                className="bg-card border border-border-card rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-siac-accent/50 w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(v => !v)}
                className={cn(
                  "flex items-center gap-2 bg-card border px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  isFilterOpen ? "border-siac-accent/40 text-white" : "border-border-card text-gray-400 hover:text-white"
                )}
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsFilterOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className="grid grid-cols-12 gap-6">
                      {/* Filters */}
                      <div className={cn(
                        "col-span-12 lg:col-span-3 xl:col-span-2",
                        isFilterOpen ? "block" : "hidden lg:block"
                      )}>
                        <div className="bg-card border border-border-card rounded-2xl overflow-hidden">
                          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-siac-accent rounded-full" />
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-white">Filtros</span>
                            </div>
                            <button
                              onClick={() => {
                                setDeviceTypeFilters([]);
                                setSeverityFilters([]);
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-white hover:opacity-100 transition-colors"
                            >
                              Limpiar
                            </button>
                          </div>

                          <div className="p-5 space-y-5">
                            <div className="space-y-3">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-white">Tipo de Dispositivo</div>
                              <div className="grid grid-cols-2 gap-2">
                                {deviceTypeOptions.map((opt) => {
                                  const checked = deviceTypeFilters.includes(opt.id);
                                  return (
                                    <label key={opt.id} className="flex items-center gap-2 bg-card border border-white/5 rounded-lg px-3 py-2 cursor-pointer hover:border-white/10 transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {
                                          setDeviceTypeFilters((prev) => (
                                            prev.includes(opt.id) ? prev.filter(v => v !== opt.id) : [...prev, opt.id]
                                          ));
                                        }}
                                        className="accent-siac-accent"
                                      />
                                      <span className="text-[10px] font-mono text-gray-200 uppercase tracking-wider">{opt.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 text-white">Tipo de Severidad</div>
                              <div className="grid grid-cols-1 gap-2">
                                {severityOptions.map((opt) => {
                                  const checked = severityFilters.includes(opt.id);
                                  return (
                                    <label key={opt.id} className="flex items-center justify-between gap-3 bg-card border border-white/5 rounded-lg px-3 py-2 cursor-pointer hover:border-white/10 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            setSeverityFilters((prev) => (
                                              prev.includes(opt.id) ? prev.filter(v => v !== opt.id) : [...prev, opt.id]
                                            ));
                                          }}
                                          className="accent-siac-accent"
                                        />
                                        <span className="text-[10px] font-mono text-gray-200 uppercase tracking-wider">{opt.label}</span>
                                      </div>
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alarmKPIs.map((kpi, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-card border border-border-card p-5 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-siac-accent/30 transition-all"
            >
              <div className="flex justify-between items-start z-10">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 text-white">{kpi.label}</span>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20", kpi.trend.startsWith('+') ? 'text-siac-accent' : 'text-siac-blocked')}>
                  {kpi.trend}
                </span>
              </div>
              <div className="flex items-end justify-between z-10">
                <span className={cn("text-3xl font-black tracking-tighter", kpi.color)}>{kpi.value}</span>
                <div className="h-8 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.data.map((v, i) => ({ v, i }))}>
                      <Line type="monotone" dataKey="v" stroke={kpi.color.includes('siac-accent') ? '#4DC493' : kpi.color.includes('siac-blocked') ? '#F51E1E' : '#FFFFFF'} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-24 h-24 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alarms Table */}
      <div className="flex-1 bg-card border border-border-card rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-card px-6 py-4 flex items-center justify-between border-b border-border-card">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-siac-accent animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Listado de Eventos en Tiempo Real</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500 uppercase">Total: {filteredAlarms.length} registros</span>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-card">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest">ID Evento</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest">Activo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest text-center">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest">Severidad</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-500 tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlarms.length > 0 ? filteredAlarms.map((alarm, i) => (
                <motion.tr 
                  key={alarm.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "group border-b border-border-card transition-colors",
                    alarm.color === '#FAD92A' ? "bg-[rgba(250,217,42,0.04)]" : alarm.color === '#F51E1E' ? "bg-[rgba(245,30,30,0.04)]" : "hover:bg-card/50"
                  )}
                  style={{
                    borderLeft: alarm.color === '#FAD92A' ? '3px solid #FAD92A' : alarm.color === '#F51E1E' ? '3px solid #F51E1E' : undefined,
                  }}
                >
                  <td className="px-6 py-4 text-xs font-mono text-gray-400 group-hover:text-white transition-colors">{alarm.id}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400 group-hover:text-white transition-colors">{alarm.timestamp}</td>
                  <td className="px-6 py-4 text-xs font-bold text-white uppercase">{alarm.activo}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex p-1.5 bg-card rounded-lg text-gray-500 group-hover:text-siac-accent transition-colors">
                      {renderIcon(alarm.tipo)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      style={{ color: alarm.color, borderColor: `${alarm.color}40`, backgroundColor: `${alarm.color}10` }}
                    >
                      {alarm.severidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onNavigateToMap()}
                        className="p-2 text-gray-500 hover:text-siac-accent transition-all hover:bg-siac-accent/10 rounded-lg"
                        title="Ver en Mapa"
                      >
                        <MapIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedAlarm(alarm)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-card/50 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Detalle
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-card rounded-full">
                        <CheckCircle2 className="w-12 h-12 text-siac-accent opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white font-bold uppercase tracking-widest">No hay alertas críticas en el sector</p>
                        <p className="text-xs text-gray-500 font-mono uppercase">Todo el sistema opera dentro de los parámetros normales</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Sidebar (Sheet) */}
      <AnimatePresence>
        {selectedAlarm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlarm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[450px] bg-card border-l border-siac-accent/30 z-[70] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border-card bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shrink-0"
                      style={{ borderColor: selectedAlarm.color, backgroundColor: `${selectedAlarm.color}10` }}
                    >
                      {renderIcon(selectedAlarm.tipo)}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-white uppercase tracking-widest truncate">{selectedAlarm.id}</div>
                      <div className="text-[10px] font-mono text-gray-500 truncate">Timestamp: {selectedAlarm.timestamp}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      style={{ color: selectedAlarm.color, borderColor: `${selectedAlarm.color}40`, backgroundColor: `${selectedAlarm.color}10` }}
                    >
                      {selectedAlarm.severidad}
                    </span>
                    <button 
                      onClick={() => setSelectedAlarm(null)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Asset Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl border border-border-card">
                    <p className="text-[8px] uppercase font-bold text-gray-500 tracking-widest mb-1">Dirección IP</p>
                    <p className="text-xs font-mono text-white">{selectedAlarm.ip}</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border-card">
                    <p className="text-[8px] uppercase font-bold text-gray-500 tracking-widest mb-1">Ubicación Técnica</p>
                    <p className="text-xs font-mono text-white">{selectedAlarm.ubicacion}</p>
                  </div>
                </div>

                {/* Activity Chart */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase font-bold text-siac-accent tracking-widest">Actividad (Últimos 10 min)</h4>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Tiempo real • 100ms lag</span>
                  </div>
                  <div className="h-48 w-full bg-card rounded-2xl border border-border-card p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityData}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedAlarm.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={selectedAlarm.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 100]} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#161D31', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                          itemStyle={{ color: selectedAlarm.color }}
                        />
                        <Area type="monotone" dataKey="val" stroke={selectedAlarm.color} fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase font-bold text-siac-accent tracking-widest">Mapa Estático</h4>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Ubicación técnica</span>
                  </div>
                  <div className="h-36 w-full rounded-2xl border border-border-card overflow-hidden bg-card relative">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(77,196,147,0.12)_0%,_transparent_55%)]" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white">{selectedAlarm.ubicacion}</div>
                        <div className="text-[9px] font-mono text-gray-400">LAT 19.4326 • LON -99.1332</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAlarm.color }} />
                          <span className="text-[10px] font-mono text-gray-300 uppercase">{selectedAlarm.activo}</span>
                        </div>
                        <button
                          onClick={() => onNavigateToMap()}
                          className="text-[10px] font-bold uppercase tracking-widest text-siac-accent hover:brightness-110 transition-all"
                        >
                          Ver en Mapa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-siac-accent tracking-widest">Timeline de Eventos</h4>
                  <div className="space-y-6 pl-2 relative">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border-card" />
                    {[
                      { time: '14:22:10', msg: 'Umbral de seguridad excedido (Crítico)', type: 'error' },
                      { time: '14:20:05', msg: 'Incremento anómalo de actividad detectado', type: 'warn' },
                      { time: '14:15:00', msg: 'Chequeo de sistema: OK', type: 'info' },
                      { time: '13:42:30', msg: 'Inicio de sesión de monitoreo activo', type: 'info' },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 ring-4 ring-industrial-950",
                          step.type === 'error' ? 'bg-siac-blocked' : step.type === 'warn' ? 'bg-[#D89A1E]' : 'bg-siac-accent'
                        )} />
                        <div className="flex-1">
                          <p className="text-[10px] font-mono text-gray-500 mb-1">{step.time}</p>
                          <p className="text-xs text-white uppercase tracking-tight">{step.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-card bg-card grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all">
                  Generar Reporte
                </button>
                <button
                  onClick={() => runSimulatedAction(setResolveState)}
                  disabled={resolveState === 'loading'}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 bg-siac-accent hover:brightness-110 text-industrial-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                    resolveState === 'loading' && "opacity-80 cursor-not-allowed"
                  )}
                >
                  {resolveState === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : resolveState === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  Resolver
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrackingView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const assets = useMemo(() => ([
    { id: 'CAM-01', tipo: 'Camera', estado: 'Online', ip: '192.168.1.101' },
    { id: 'INF-02', tipo: 'Thermometer', estado: 'Online', ip: '192.168.1.105' },
    { id: 'PIR-05', tipo: 'Radio', estado: 'Alert', ip: '192.168.1.112' },
    { id: 'GW-ALPHA', tipo: 'Cpu', estado: 'Online', ip: '10.0.0.45' },
    { id: 'ACT-99', tipo: 'Activity', estado: 'Offline', ip: '10.0.0.89' },
    { id: 'MACH-TR_07', tipo: 'Tractor', estado: 'Online', ip: '10.0.0.77' },
    { id: 'USR-MOB_12', tipo: 'Smartphone', estado: 'Online', ip: '10.0.0.12' },
    { id: 'PPE-STAFF_03', tipo: 'Shirt', estado: 'Alert', ip: '10.0.0.33' },
    { id: 'SOL-GRID_01', tipo: 'Grid', estado: 'Online', ip: '10.0.0.201' },
    { id: 'TWR-SIG_04', tipo: 'Signal', estado: 'Online', ip: '10.0.0.154' },
    { id: 'DB-EDGE_01', tipo: 'Database', estado: 'Alert', ip: '10.0.0.250' },
  ]), []);

  const filteredAssets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(a => `${a.id} ${a.tipo} ${a.estado} ${a.ip}`.toLowerCase().includes(q));
  }, [assets, searchTerm]);

  const uptimeData = useMemo(() => (
    Array.from({ length: 24 }).map((_, i) => {
      const base = 92 + Math.sin(i / 3) * 4;
      const noise = (i % 5 === 0 ? -6 : 0) + (i % 7 === 0 ? -3 : 0);
      return { h: `${String(i).padStart(2, '0')}:00`, v: Math.max(70, Math.min(100, base + noise)) };
    })
  ), []);

  const timeline = useMemo(() => {
    if (!selectedAsset) return [];
    const base = [
      { id: 'EVT-001', time: '07:10:12', kind: 'system', title: 'Check-in', meta: { source: 'heartbeat', rssi: '-61dBm', fw: 'v2.4.0' } },
      { id: 'EVT-002', time: '08:02:45', kind: 'operational', title: 'Armado', meta: { user: 'admin', policy: 'SIAC_PERIMETRO' } },
      { id: 'EVT-003', time: '09:11:03', kind: 'system', title: 'Cambio de IP', meta: { oldIp: '192.168.1.90', newIp: selectedAsset.ip } },
      { id: 'EVT-004', time: '10:22:16', kind: 'alert', level: 'warning', title: 'Detección de Movimiento', meta: { zone: 'ZONA_NORTE_01', confidence: '0.87' } },
      { id: 'EVT-005', time: '10:22:31', kind: 'alert', level: 'critical', title: 'Bloqueo', meta: { reason: 'policy_violation', action: 'blocked' } },
      { id: 'EVT-006', time: '10:48:10', kind: 'operational', title: 'Desarmado', meta: { user: 'soporte', method: 'console' } },
      { id: 'EVT-007', time: '12:05:00', kind: 'system', title: 'Sync de Configuración', meta: { profile: 'DEFAULT', checksum: 'A19F' } },
      { id: 'EVT-008', time: '13:20:22', kind: 'operational', title: 'Armado', meta: { user: 'admin', policy: 'SIAC_MASTER_01' } },
      { id: 'EVT-009', time: '14:02:07', kind: 'alert', level: 'warning', title: 'Actividad Anómala', meta: { metric: 'uptime_drop', delta: '-12%' } },
      { id: 'EVT-010', time: '14:06:41', kind: 'system', title: 'Check-in', meta: { source: 'heartbeat', rssi: '-65dBm', fw: 'v2.4.0' } },
    ];
    return base;
  }, [selectedAsset]);

  const eventById = useMemo(() => {
    const map = new Map<string, any>();
    timeline.forEach((e: any) => map.set(e.id, e));
    return map;
  }, [timeline]);

  const renderAssetIcon = (tipo: string) => {
    switch (tipo) {
      case 'Camera': return <Camera className="w-4 h-4" />;
      case 'Thermometer': return <Thermometer className="w-4 h-4" />;
      case 'Radio': return <Radio className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Tractor': return <Tractor className="w-4 h-4" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'Shirt': return <Shirt className="w-4 h-4" />;
      case 'Grid': return <Grid className="w-4 h-4" />;
      case 'Signal': return <Signal className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const statusBadge = (estado: string) => {
    if (estado === 'Alert') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
          style={{ color: '#F51E1E', borderColor: '#F51E1E40', backgroundColor: '#F51E1E10' }}
        >
          Alert
        </span>
      );
    }
    if (estado === 'Offline') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/[0.03] text-gray-300">
          Offline
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
        style={{ color: '#4DC493', borderColor: '#4DC49340', backgroundColor: '#4DC49310' }}
      >
        Online
      </span>
    );
  };

  const eventColor = (evt: any) => {
    if (evt?.kind === 'operational') return '#4DC493';
    if (evt?.kind === 'alert') return evt?.level === 'warning' ? '#D89A1E' : '#F51E1E';
    return '#9CA3AF';
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-industrial-950">
      <div className="w-[32%] min-w-[360px] max-w-[460px] border-r border-border-card bg-card flex flex-col">
        <div className="p-6 border-b border-border-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-card border border-white/5">
              <Locate className="w-5 h-5 text-siac-accent" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold uppercase tracking-widest text-white">Seguimiento</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Asset selector • Tracking</div>
            </div>
          </div>

          <div className="mt-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar activo (ID, IP, tipo...)"
              className="w-full bg-card border border-border-card rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-siac-accent/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAssets.map((a: any) => {
            const active = selectedAsset?.id === a.id;
            return (
              <button
                key={a.id}
                onClick={() => { setSelectedAsset(a); setSelectedEventId(null); }}
                className="w-full text-left bg-card border border-white/5 rounded-2xl px-6 py-4 relative overflow-hidden group transition-colors hover:border-white/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-card border border-white/5 flex items-center justify-center text-white font-bold">
                        {renderAssetIcon(a.tipo)}
                      </div>
                      {statusBadge(a.estado)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white uppercase tracking-widest truncate">{a.id}</div>
                      <div className="text-[10px] font-mono text-gray-500 truncate">IP: {a.ip}</div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {statusBadge(a.estado)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {!selectedAsset ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-xl w-full bg-card border border-border-card rounded-2xl p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-card border border-white/5 flex items-center justify-center">
                <Locate className="w-7 h-7 text-siac-accent" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="text-sm font-bold uppercase tracking-widest text-white">Seleccione un activo</div>
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                  Elija un dispositivo para auditar su comportamiento histórico
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-card border border-border-card rounded-2xl overflow-hidden">
              <div className="bg-card px-6 py-5 border-b border-border-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-card border border-white/5 flex items-center justify-center text-siac-accent">
                    {renderAssetIcon(selectedAsset.tipo)}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-black tracking-tight text-white">{selectedAsset.id}</div>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      {selectedAsset.ip} • {selectedAsset.tipo}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">{statusBadge(selectedAsset.estado)}</div>
              </div>

              <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Última Actividad', value: '2m', icon: History },
                  { label: 'Tiempo Online (MTBF)', value: '18d 04h', icon: Activity },
                  { label: 'Eventos Críticos (7d)', value: '7', icon: AlertTriangle },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={i} className="bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-xs font-bold uppercase tracking-widest text-white">{kpi.label}</div>
                        <div className="text-lg font-black text-white">{kpi.value}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center text-gray-400">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-card border border-border-card rounded-2xl overflow-hidden">
                <div className="bg-card px-6 py-4 border-b border-border-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-siac-accent animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Timeline de Eventos</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{timeline.length} eventos</span>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <div className="absolute left-[14px] top-0 bottom-0 w-px bg-border-card" />
                    <div className="space-y-6">
                      {timeline.map((evt: any) => {
                        const active = selectedEventId === evt.id;
                        const color = eventColor(evt);
                        return (
                          <div key={evt.id} className="relative">
                            <button
                              onClick={() => setSelectedEventId((v) => (v === evt.id ? null : evt.id))}
                              className="w-full text-left flex gap-4 items-start group"
                            >
                              <div className="relative z-10 mt-1">
                                <div
                                  className="w-7 h-7 rounded-full border flex items-center justify-center bg-card"
                                  style={{ borderColor: `${color}40` }}
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                </div>
                              </div>

                              <div className={cn(
                                "flex-1 rounded-xl border border-white/5 px-4 py-3 transition-colors",
                                "hover:bg-card/50"
                              )}>
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold uppercase tracking-widest text-white truncate">{evt.title}</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest truncate">{evt.id}</div>
                                  </div>
                                  <div className="shrink-0 text-[10px] font-mono text-gray-400">{evt.time}</div>
                                </div>
                              </div>
                            </button>

                            <AnimatePresence>
                              {active && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  className="ml-[44px] mt-3 bg-card border border-industrial-800 rounded-2xl p-4 shadow-2xl"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Metadatos técnicos</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase">{selectedAsset.id}</div>
                                  </div>
                                  <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="bg-card border border-white/5 rounded-xl p-3">
                                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Evento</div>
                                      <div className="text-[11px] font-mono text-white">{evt.id}</div>
                                    </div>
                                    <div className="bg-card border border-white/5 rounded-xl p-3">
                                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Timestamp</div>
                                      <div className="text-[11px] font-mono text-white">{evt.time}</div>
                                    </div>
                                    <div className="bg-card border border-white/5 rounded-xl p-3">
                                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">IP</div>
                                      <div className="text-[11px] font-mono text-white">{selectedAsset.ip}</div>
                                    </div>
                                    <div className="bg-card border border-white/5 rounded-xl p-3 flex items-center justify-between">
                                      <div>
                                        <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Operador</div>
                                        <div className="text-[11px] font-mono text-white">{evt.meta?.user ?? 'system'}</div>
                                      </div>
                                      <div className="w-9 h-9 rounded-xl bg-card border border-white/5 flex items-center justify-center text-gray-400">
                                        <User className="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-4 bg-card border border-white/5 rounded-xl p-3">
                                    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Payload</div>
                                    <div className="mt-1 text-[11px] font-mono text-gray-200 break-words">
                                      {JSON.stringify(evt.meta)}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-industrial-800 rounded-2xl overflow-hidden">
                <div className="bg-card px-6 py-4 border-b border-industrial-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0B986A' }} />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Salud (24h)</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Uptime / señal</span>
                </div>

                <div className="p-6">
                  <div className="h-56 w-full bg-card rounded-2xl border border-industrial-800 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={uptimeData}>
                        <defs>
                          <linearGradient id="trkUptime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0B986A" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0B986A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="h" hide />
                        <YAxis hide domain={[60, 100]} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#161D31', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                          itemStyle={{ color: '#0B986A' }}
                        />
                        <Area type="monotone" dataKey="v" stroke="#0B986A" fill="url(#trkUptime)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="bg-card border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Promedio</div>
                      <div className="text-lg font-black text-white">94.1%</div>
                    </div>
                    <div className="bg-card border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Mínimo</div>
                      <div className="text-lg font-black" style={{ color: '#F51E1E' }}>78.0%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UsersView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([
    { id: 'USR-001', name: 'Leandro Gómez', title: 'Administrador', department: 'SOC', email: 'admin@siac.mx', role: 'Admin', active: true, lastAccess: '2026-04-26 14:12', assetsAssigned: 18, zones: ['ZONA_NORTE_01', 'PERIMETRO_B', 'SALA_SERVIDORES'], cameras: ['CAM-01', 'CAM-08'] },
    { id: 'USR-002', name: 'María Ortega', title: 'Operador de Monitoreo', department: 'NOC', email: 'm.ortega@siac.mx', role: 'Operador', active: true, lastAccess: '2026-04-26 13:48', assetsAssigned: 7, zones: ['ZONA_NORTE_01', 'ALMACEN_CENTRAL'], cameras: ['CAM-01'] },
    { id: 'USR-003', name: 'Carlos Rivera', title: 'Auditor Técnico', department: 'Compliance', email: 'c.rivera@siac.mx', role: 'Auditor', active: true, lastAccess: '2026-04-25 18:03', assetsAssigned: 4, zones: ['EDGE_DC'], cameras: [] },
    { id: 'USR-004', name: 'Sofía Luna', title: 'Operador de Monitoreo', department: 'SOC', email: 's.luna@siac.mx', role: 'Operador', active: false, lastAccess: '2026-04-12 09:22', assetsAssigned: 0, zones: [], cameras: [] },
    { id: 'USR-005', name: 'Iván Duarte', title: 'Administrador', department: 'Infra', email: 'i.duarte@siac.mx', role: 'Admin', active: true, lastAccess: '2026-04-26 12:01', assetsAssigned: 12, zones: ['TORRE_COMMS', 'PLANTA_SOLAR'], cameras: ['CAM-08'] },
    { id: 'USR-006', name: 'Ana Torres', title: 'Auditor Técnico', department: 'Compliance', email: 'a.torres@siac.mx', role: 'Auditor', active: false, lastAccess: '2026-03-22 16:40', assetsAssigned: 0, zones: [], cameras: [] },
  ]);
  const [draftZones, setDraftZones] = useState<string[]>([]);
  const [draftCameras, setDraftCameras] = useState<string[]>([]);

  const zones = useMemo(() => ([
    'ZONA_NORTE_01',
    'PERIMETRO_B',
    'ALMACEN_CENTRAL',
    'SALA_SERVIDORES',
    'VALVULA_PRINCIPAL',
    'OBRA_SECTOR_02',
    'ACCESO_SUR',
    'ZONA_RESTRINGIDA_A',
    'PLANTA_SOLAR',
    'TORRE_COMMS',
    'EDGE_DC',
  ]), []);

  const cameras = useMemo(() => ([
    'CAM-01',
    'CAM-08',
    'CAM-12',
    'CAM-14',
  ]), []);

  useEffect(() => {
    if (!selectedUser) return;
    setDraftZones(Array.isArray(selectedUser.zones) ? selectedUser.zones : []);
    setDraftCameras(Array.isArray(selectedUser.cameras) ? selectedUser.cameras : []);
  }, [selectedUser]);

  const activeCount = useMemo(() => users.filter(u => u.active).length, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const haystack = `${u.id} ${u.name} ${u.title} ${u.department} ${u.email} ${u.role}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [searchTerm, users]);

  const roleStyle = (role: string) => {
    if (role === 'Admin') return { color: '#60A5FA', borderColor: '#60A5FA40', backgroundColor: '#60A5FA10' };
    if (role === 'Auditor') return { color: '#D89A1E', borderColor: '#D89A1E40', backgroundColor: '#D89A1E10' };
    return { color: '#0B986A', borderColor: '#0B986A40', backgroundColor: '#0B986A10' };
  };

  const statusDot = (active: boolean) => (
    <span
      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1F2937]"
      style={{ backgroundColor: active ? '#0B986A' : '#F51E1E' }}
    />
  );

  const toggleListValue = (list: string[], value: string) => (
    list.includes(value) ? list.filter(v => v !== value) : [...list, value]
  );

  const updateUser = (id: string, patch: any) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
  };

  const handleAddOperator = () => {
    const id = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser = { id, name: 'Nuevo Operador', title: 'Operador de Monitoreo', department: 'SOC', email: `operador.${users.length + 1}@siac.mx`, role: 'Operador', active: true, lastAccess: 'N/A', assetsAssigned: 0, zones: [], cameras: [] };
    setUsers(prev => [newUser, ...prev]);
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto bg-industrial-950 relative">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-card border border-industrial-800 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-siac-accent" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios (IAM)</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 uppercase font-mono tracking-widest">IAM • Identity & Access</span>
              <span className="text-[10px] font-mono uppercase text-gray-500">Usuarios Activos: <span className="text-white">{activeCount}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario, rol o departamento..."
              className="bg-card border border-industrial-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-siac-accent w-72 transition-all"
            />
          </div>
          <button
            onClick={handleAddOperator}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-siac-accent hover:brightness-110 text-industrial-950 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Añadir Operador
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-card border border-industrial-800 rounded-2xl p-10 text-center max-w-xl w-full">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-card border border-white/5 flex items-center justify-center">
              <Users className="w-7 h-7 text-gray-400" />
            </div>
            <div className="mt-6 space-y-2">
              <div className="text-sm font-bold uppercase tracking-widest text-white">Sin resultados</div>
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Ajuste el buscador para localizar operadores</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((u: any) => {
            const role = roleStyle(u.role);
            return (
              <motion.button
                key={u.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedUser(u)}
                className="text-left bg-card border border-white/5 rounded-2xl px-5 pt-5 pb-16 relative overflow-hidden group transition-colors hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-card border border-white/5 flex items-center justify-center text-white font-bold">
                        {String(u.name).split(' ').slice(0, 2).map((p: string) => p[0]).join('')}
                      </div>
                      {statusDot(!!u.active)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{u.name}</div>
                      <div className="text-[10px] font-mono text-gray-500 truncate">Email: {u.email}</div>
                      <div className="text-[11px] font-mono text-gray-300 truncate">{u.title}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                          style={{ color: role.color, borderColor: role.borderColor, backgroundColor: role.backgroundColor }}
                        >
                          {u.role}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-gray-500">{u.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">ID</div>
                    <div className="text-[11px] font-mono text-gray-200">{u.id}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="bg-card border border-white/5 rounded-xl p-3">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Último Acceso</div>
                    <div className="text-[11px] font-mono text-white">{u.lastAccess}</div>
                  </div>
                  <div className="bg-card border border-white/5 rounded-xl p-3">
                    <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Activos Asignados</div>
                    <div className="text-[11px] font-mono text-white">{u.assetsAssigned}</div>
                  </div>
                </div>

                <div className="absolute inset-x-5 bottom-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-card border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <UserCog className="w-4 h-4 text-gray-300" />
                      Editar Permisos
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateUser(u.id, { active: !u.active }); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-card border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <Unlock className="w-4 h-4" style={{ color: u.active ? '#F51E1E' : '#0B986A' }} />
                      {u.active ? 'Suspender' : 'Reactivar'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-card border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <Key className="w-4 h-4 text-gray-300" />
                      Log de Actividad
                    </button>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[480px] bg-card border-l border-siac-accent/30 z-[70] shadow-2xl flex flex-col"
            >
              <div className="px-6 py-5 border-b border-industrial-800 bg-card flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-card border border-white/5 flex items-center justify-center text-white font-bold">
                      {String(selectedUser.name).split(' ').slice(0, 2).map((p: string) => p[0]).join('')}
                    </div>
                    {statusDot(!!selectedUser.active)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white truncate">{selectedUser.name}</div>
                    <div className="text-[11px] font-mono text-gray-300 truncate">{selectedUser.email}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={roleStyle(selectedUser.role)}
                      >
                        {selectedUser.role}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-gray-500">{selectedUser.department}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-card border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Accesos</div>
                    <div className="text-[10px] font-mono uppercase text-gray-500">{selectedUser.id}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-card border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Último Acceso</div>
                      <div className="text-[11px] font-mono text-white">{selectedUser.lastAccess}</div>
                    </div>
                    <div className="bg-card border border-white/5 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Activos Asignados</div>
                      <div className="text-[11px] font-mono text-white">{selectedUser.assetsAssigned}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-industrial-800 rounded-2xl overflow-hidden">
                  <div className="bg-card px-5 py-4 border-b border-industrial-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-gray-300" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white">Permisos por Zona</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-gray-500">{draftZones.length}/{zones.length}</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 gap-2">
                    {zones.map((z) => (
                      <label key={z} className="flex items-center justify-between gap-3 bg-card border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={draftZones.includes(z)}
                            onChange={() => setDraftZones(prev => toggleListValue(prev, z))}
                            className="accent-[#0B986A]"
                          />
                          <span className="text-[11px] font-mono text-gray-200 uppercase tracking-wider">{z}</span>
                        </div>
                        <Locate className="w-4 h-4 text-gray-500" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-industrial-800 rounded-2xl overflow-hidden">
                  <div className="bg-card px-5 py-4 border-b border-industrial-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-300" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white">Permisos de Cámaras</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-gray-500">{draftCameras.length}/{cameras.length}</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 gap-2">
                    {cameras.map((c) => (
                      <label key={c} className="flex items-center justify-between gap-3 bg-card border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={draftCameras.includes(c)}
                            onChange={() => setDraftCameras(prev => toggleListValue(prev, c))}
                            className="accent-[#0B986A]"
                          />
                          <span className="text-[11px] font-mono text-gray-200 uppercase tracking-wider">{c}</span>
                        </div>
                        <Camera className="w-4 h-4 text-gray-500" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-industrial-800 bg-card grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    updateUser(selectedUser.id, { active: !selectedUser.active });
                    setSelectedUser(null);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  <Unlock className="w-4 h-4" style={{ color: selectedUser.active ? '#F51E1E' : '#0B986A' }} />
                  {selectedUser.active ? 'Suspender' : 'Reactivar'}
                </button>
                <button
                  onClick={() => {
                    updateUser(selectedUser.id, { zones: draftZones, cameras: draftCameras });
                    setSelectedUser(null);
                  }}
                  className="flex items-center justify-center gap-2 py-3 bg-siac-accent hover:brightness-110 text-industrial-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  Guardar Permisos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'umbrales' | 'seguridad' | 'apariencia'>('general');
  const [sensorSensitivity, setSensorSensitivity] = useState(72);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [alertSounds, setAlertSounds] = useState(true);
  const [apiKey, setApiKey] = useState('SIAC_API_KEY_REDACTED');
  const [copied, setCopied] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(12);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const generateApiKey = () => {
    const bytes = Array.from({ length: 24 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`siac_api_${bytes}`);
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const sliderBg = (value: number, min: number, max: number) => {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    return `linear-gradient(to right, #0B986A 0%, #0B986A ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;
  };

  const TechSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-11 h-6 rounded-full border transition-all relative",
        checked ? "bg-siac-accent/20 border-siac-accent/40" : "bg-white/[0.04] border-white/10"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all shadow-sm",
          checked ? "bg-[#0B986A] left-[22px]" : "bg-white/50 left-0.5"
        )}
      />
    </button>
  );

  const SectionButton = ({
    id,
    label,
    icon,
  }: {
    id: 'general' | 'umbrales' | 'seguridad' | 'apariencia';
    label: string;
    icon: JSX.Element;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
        activeTab === id ? "bg-siac-accent/10 border-siac-accent/20 text-white" : "bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/[0.03] hover:border-white/10"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg border flex items-center justify-center",
        activeTab === id ? "border-siac-accent/30 bg-siac-accent/10" : "border-white/10 bg-industrial-950/30"
      )}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-widest truncate">{label}</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 truncate">
          {id === 'general' ? 'Base' : id === 'umbrales' ? 'Señal' : id === 'seguridad' ? 'IAM' : 'UI'}
        </div>
      </div>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto bg-industrial-950 relative">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-card border border-industrial-800 rounded-lg">
            <Settings className="w-6 h-6 text-siac-accent" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white tracking-tight">Configuración</div>
            <div className="text-xs text-gray-500 uppercase font-mono tracking-widest">Control Panel • SIAC v2</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        <div className="bg-card border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="px-2 pb-2 border-b border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secciones</div>
          </div>
          <SectionButton id="general" label="General" icon={<Globe className="w-4 h-4 text-gray-200" />} />
          <SectionButton id="umbrales" label="Umbrales" icon={<Sliders className="w-4 h-4 text-gray-200" />} />
          <SectionButton id="seguridad" label="Seguridad" icon={<Shield className="w-4 h-4 text-gray-200" />} />
          <SectionButton id="apariencia" label="Apariencia" icon={<Palette className="w-4 h-4 text-gray-200" />} />
        </div>

        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="bg-card px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-300" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white">General</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Notificaciones y comportamiento</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 bg-industrial-950/30 border border-white/5 rounded-2xl px-5 py-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-white">Notificaciones de Escritorio</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 truncate">Eventos críticos y cambios de estado</div>
                  </div>
                  <TechSwitch checked={desktopNotifications} onChange={setDesktopNotifications} />
                </div>

                <div className="flex items-center justify-between gap-4 bg-industrial-950/30 border border-white/5 rounded-2xl px-5 py-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-white">Sonidos de Alerta</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 truncate">Sirena / chime operacional</div>
                  </div>
                  <TechSwitch checked={alertSounds} onChange={setAlertSounds} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'umbrales' && (
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="bg-card px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-gray-300" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white">Umbrales</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Calibración de sensores</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-white">Sensibilidad de Sensores</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Detección / ruido de señal</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-siac-accent/30 bg-siac-accent/10 text-siac-accent">
                      {sensorSensitivity}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sensorSensitivity}
                      onChange={(e) => setSensorSensitivity(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: sliderBg(sensorSensitivity, 0, 100), accentColor: '#0B986A' } as any}
                    />
                  </div>
                </div>

                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-white">Tiempo de Timeout</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Reintento / heartbeat</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-siac-accent/30 bg-siac-accent/10 text-siac-accent">
                      {timeoutSeconds}s
                    </span>
                  </div>
                  <div className="mt-4">
                    <input
                      type="range"
                      min={5}
                      max={120}
                      value={timeoutSeconds}
                      onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ background: sliderBg(timeoutSeconds, 5, 120), accentColor: '#0B986A' } as any}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="bg-card px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-300" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white">Seguridad</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">IAM • tokens y llaves</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-300" />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-white">Rotación de Llaves de API</div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Regenerar / copiar credenciales</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={generateApiKey}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-white/10 hover:border-white/20 text-[10px] font-bold uppercase tracking-widest text-white transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-300" />
                        Generar Nueva
                      </button>
                      <button
                        onClick={copyApiKey}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-colors",
                          copied ? "bg-siac-accent/10 border-siac-accent/30 text-siac-accent" : "bg-card border-white/10 hover:border-white/20 text-white"
                        )}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 bg-card/60 border border-white/5 rounded-xl px-4 py-3 font-mono text-[11px] text-gray-200 overflow-hidden">
                    {apiKey}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    <span>Scope: edge-api</span>
                    <span className={cn(copied ? "text-siac-accent" : "text-gray-500")}>{copied ? 'Copiado' : 'Listo'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="bg-card px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-gray-300" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white">Apariencia</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Modo y densidad visual</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-white">Modo Oscuro Industrial</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 truncate">Tema por defecto SIAC</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/[0.03] text-gray-200">
                      ACTIVO
                    </span>
                  </div>
                </div>

                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-widest text-white">Densidad UI</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 truncate">Compacta (operación)</div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/[0.03] text-gray-200">
                      COMPACTA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="bg-card px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-gray-300" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white">Información del Sistema</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Cierre • estado y mantenimiento</div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Versión</div>
                <div className="mt-2 text-lg font-black text-white">v2.4.0-pro</div>
              </div>
              <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Trial</div>
                <div className="mt-2 text-lg font-black text-white">{trialDaysLeft} días</div>
                <button
                  onClick={() => setTrialDaysLeft((v) => Math.max(0, v - 1))}
                  className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                >
                  Simular -1 día
                </button>
              </div>
              <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mantenimiento</div>
                  <div className="mt-2 text-[11px] font-mono text-gray-300 uppercase tracking-widest">Reiniciar Base de Datos</div>
                </div>
                <button
                  onClick={() => setResetOpen(true)}
                  className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border"
                  style={{ backgroundColor: '#F51E1E10', borderColor: '#F51E1E40', color: '#F51E1E' }}
                >
                  <Database className="w-4 h-4" />
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {resetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => (resetting ? null : setResetOpen(false))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] w-[520px] bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-card px-6 py-5 border-b border-white/10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl border border-[#F51E1E40] bg-[#F51E1E10] flex items-center justify-center">
                    <Database className="w-5 h-5" style={{ color: '#F51E1E' }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white">Confirmación</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Acción destructiva • entorno local</div>
                  </div>
                </div>
                <button
                  onClick={() => (resetting ? null : setResetOpen(false))}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-industrial-950/30 border border-white/5 rounded-2xl p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-white">Reiniciar Base de Datos</div>
                  <div className="mt-2 text-[11px] font-mono text-gray-300 uppercase tracking-widest">
                    Esto eliminará datos locales y reiniciará el estado de simulación. Esta acción no se puede deshacer.
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-industrial-950/50 grid grid-cols-2 gap-4">
                <button
                  onClick={() => (resetting ? null : setResetOpen(false))}
                  className="flex items-center justify-center gap-2 py-3 bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                  disabled={resetting}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setResetting(true);
                    setTimeout(() => {
                      setResetting(false);
                      setResetOpen(false);
                    }, 900);
                  }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  style={{ backgroundColor: '#F51E1E', color: '#161D31' }}
                  disabled={resetting}
                >
                  {resetting ? 'Reiniciando…' : 'Confirmar Reinicio'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      <div className="absolute inset-0 bg-industrial-950/65" />
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-siac-accent/20 via-transparent to-transparent" />
        <div className="grid grid-cols-12 h-full w-full border-siac-accent/5 border">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-siac-accent/5 border" />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-siac-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(77,196,147,0.35)]">
              <ShieldCheck className="text-industrial-950 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">SIAC</h1>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Sistema Inteligente <br />
              <span className="text-siac-accent">de Monitoreo</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-sm mx-auto md:mx-0">
              Arquitectura de seguridad avanzada para activos industriales críticos.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
            <div className="bg-card border border-border-card p-4 rounded-xl w-full md:w-auto text-center md:text-left">
              <div className="text-3xl font-mono text-siac-accent">
                <AnimatedInt value={20347} durationMs={1200} format={(v) => v.toLocaleString('en-US')} />
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Monitoreos activos</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-industrial-950 bg-card flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div 
          className="bg-[rgba(30,42,66,0.7)] backdrop-blur-[8px] border border-white/10 p-8 rounded-2xl shadow-2xl relative group"
          whileHover={{ borderColor: 'rgba(77,196,147,0.35)' }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-siac-accent/5 blur-3xl rounded-full" />
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            Bienvenido <div className="w-2 h-2 rounded-full bg-siac-accent animate-pulse" />
          </h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-200 font-bold">Usuario</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200" />
                <input 
                  type="text" 
                  defaultValue="admin@siac.mx"
                  className="w-full bg-industrial-950/35 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-siac-accent/50 transition-colors" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-200 font-bold">Contraseña</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-200" />
                <input 
                  type="password" 
                  defaultValue="password"
                  className="w-full bg-industrial-950/35 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-siac-accent/50 transition-colors" 
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-siac-accent text-industrial-950 font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Ingresar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-300/80 font-mono">
            <span>SIAC CORE V2.4.0</span>
            <span>IP: 192.168.1.104</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const KPICard = ({ kpi, active, onClick }: { kpi: KPI, active: boolean, onClick: () => void }) => {
  const Icon = kpi.icon;
  const hex = tokenToHex(kpi.color);
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "bg-card border border-border-card border-t-2 p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden group",
        active ? "ring-1 ring-siac-accent/35 border-siac-accent/25" : "hover:border-white/15"
      )}
      style={{ borderTopColor: hex }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-full flex items-center justify-center shrink-0 transition-colors",
          kpi.status === 'ALERTA' ? "bg-siac-blocked/10 text-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed/10 text-siac-disarmed" : "bg-siac-accent/10 text-siac-accent"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <AnimatedInt value={kpi.value} durationMs={800} className="text-2xl font-bold text-white" />
              <span className="text-xs text-gray-500 font-medium">/</span>
              <AnimatedInt value={kpi.total} durationMs={800} className="text-xs text-gray-500 font-medium" />
            </div>
            <Sparkline data={kpi.data || []} colorHex={hex} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">{kpi.label}</span>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              kpi.status === 'ALERTA' ? "bg-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed" : "bg-siac-accent"
            )} />
          </div>
        </div>
      </div>
      
      {/* Mini state indicator at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(kpi.value / kpi.total) * 100}%` }}
          className={cn(
            "h-full transition-colors duration-500",
            kpi.status === 'ALERTA' ? "bg-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed" : "bg-siac-accent"
          )}
        />
      </div>
    </motion.div>
  );
};

// --- Reports View Component ---
const ReportsView = ({ isSearching, setIsSearching }: { isSearching: boolean, setIsSearching: (v: boolean) => void }) => {
  const [selectedInstallation, setSelectedInstallation] = useState('Parque Solar Don Humberto');
  const [isChangingInstallation, setIsChangingInstallation] = useState(false);

  const donutData = [
    { title: 'Cámaras', value: 85, color: '#0B986A' },
    { title: 'Infrarrojos', value: 92, color: '#0B986A' },
    { title: 'Puertas', value: 78, color: '#0B986A' },
  ];

  const trendData = [
    { day: 'Lun', val: 45 },
    { day: 'Mar', val: 52 },
    { day: 'Mie', val: 48 },
    { day: 'Jue', val: 70 },
    { day: 'Vie', val: 61 },
    { day: 'Sab', val: 38 },
    { day: 'Dom', val: 40 },
  ];

  const comparativeData = [
    { zone: 'ZONA1', alarmas: 12, umbral: 10 },
    { zone: 'ZONA2', alarmas: 8, umbral: 10 },
    { zone: 'ZONA3', alarmas: 15, umbral: 10 },
  ];

  const deviceHealth = [
    { id: 1, type: 'Camera', status: 'OK' },
    { id: 2, type: 'Camera', status: 'ALERTA' },
    { id: 3, type: 'Camera', status: 'OK' },
    { id: 4, type: 'PIR', status: 'OK' },
    { id: 5, type: 'PIR', status: 'PENDIENTE' },
    { id: 6, type: 'PIR', status: 'OK' },
    { id: 7, type: 'GW', status: 'OK' },
    { id: 8, type: 'GW', status: 'OK' },
    { id: 9, type: 'Activo', status: 'ALERTA' },
    { id: 10, type: 'Activo', status: 'OK' },
  ];

  const handleInstallationChange = (val: string) => {
    setIsChangingInstallation(true);
    setSelectedInstallation(val);
    setTimeout(() => setIsChangingInstallation(false), 800);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 2000);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-siac-accent p-2 rounded shadow-2xl">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-bold text-white">
                {entry.name}: {entry.value}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Search & Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-white/10 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Instalación</div>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siac-accent" />
            <select 
              value={selectedInstallation}
              onChange={(e) => handleInstallationChange(e.target.value)}
              className="w-full bg-card border border-border-card rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-siac-accent/50 transition-all appearance-none text-white font-bold"
            >
              <option value="Parque Solar Don Humberto">Parque Solar Don Humberto</option>
              <option value="Planta Norte">Planta Norte</option>
              <option value="Refinería Central">Refinería Central</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 min-w-[240px]">
          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Búsqueda por fecha</div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siac-accent" />
            <input 
              type="text" 
              defaultValue="25-04-2026"
              className="w-full bg-card border border-border-card rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-accent/50 transition-all font-mono text-white"
            />
          </div>
        </div>

        <div className="flex items-end h-full">
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-siac-accent hover:brightness-110 text-industrial-950 px-8 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center shadow-[0_0_15px_rgba(77,196,147,0.2)]"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-industrial-950 border-t-transparent rounded-full animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isChangingInstallation ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[600px] flex flex-col items-center justify-center gap-4 bg-card/50 rounded-2xl border border-white/5"
          >
            <div className="w-12 h-12 border-4 border-siac-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-siac-accent uppercase tracking-[0.2em]">Re-configurando entorno...</span>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Main Report Card */}
            <div className="bg-card rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-siac-accent" />
                  <span className="text-sm font-bold uppercase tracking-widest">Reporte Operativo: {selectedInstallation}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500">REF: SIAC-REP-2026-0425</div>
              </div>
              
              <div className="p-6 space-y-10">
                {/* Equipamiento Donuts */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div className="w-1 h-3 bg-siac-accent rounded-full" />
                    Estado de Equipamiento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {donutData.map((data, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.02, borderColor: 'rgba(77,196,147,0.3)' }}
                        className="bg-industrial-950/50 border border-white/5 rounded-xl p-6 flex flex-col items-center group transition-all shadow-lg hover:shadow-siac-accent/5"
                      >
                        <span className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">{data.title}</span>
                        <div className="w-32 h-32 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { value: data.value || 0, name: 'Activo' },
                                  { value: 100 - (data.value || 0), name: 'Inactivo' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={45}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                              >
                                <Cell fill={data.color} />
                                <Cell fill="rgba(255,255,255,0.05)" />
                              </Pie>
                              <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-white">{data.value || 0}%</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-siac-armed" />
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Funcionamiento</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Salud de Dispositivos - NEW SECTION */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div className="w-1 h-3 bg-siac-green rounded-full" />
                    Salud de Dispositivos
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {deviceHealth.map((device) => (
                      <motion.div 
                        key={device.id}
                        whileHover={{ y: -2 }}
                        className="flex flex-col items-center gap-2 p-3 bg-card/50 border border-white/5 rounded-lg group cursor-help"
                      >
                        <div className="relative">
                          {device.type === 'Camera' && <Camera className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {device.type === 'PIR' && <Radio className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {device.type === 'GW' && <Cpu className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          {device.type === 'Activo' && <Activity className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
                          <div className={cn(
                            "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-industrial-900",
                            device.status === 'OK' ? "bg-siac-armed" : device.status === 'ALERTA' ? "bg-siac-blocked" : "bg-siac-disarmed"
                          )} />
                        </div>
                        <span className="text-[8px] font-mono text-gray-500">#{device.id}04</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tendencia Operativa Sparklines */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div className="w-1 h-3 bg-siac-green rounded-full" />
                    Tendencia Operativa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alarmas Sparkline */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="bg-card border border-white/10 rounded-xl p-5 space-y-4 group hover:border-siac-accent/30 transition-all shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold text-gray-500 uppercase">Total de alarmas (7d)</h5>
                          <div className="text-2xl font-bold text-white">124</div>
                        </div>
                        <div className="w-32 h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke="#4DC493" 
                                strokeWidth={2} 
                                dot={false} 
                              />
                              <RechartsTooltip content={<CustomTooltip />} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-siac-blocked/10 rounded-lg">
                            <AlertTriangle className="w-3 h-3 text-siac-blocked" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Incidencias Críticas</span>
                        </div>
                        <span className="text-xs font-bold text-siac-blocked">+12% vs sem. ant.</span>
                      </div>
                    </motion.div>

                    {/* Tiempos Sparkline */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className="bg-card border border-white/10 rounded-xl p-5 space-y-4 group hover:border-siac-accent/30 transition-all shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="text-[10px] font-bold text-gray-500 uppercase">Tiempo de respuesta prom.</h5>
                          <div className="text-2xl font-bold text-white">1.8 min</div>
                        </div>
                        <div className="w-32 h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData.map(d => ({ ...d, val: 100 - d.val }))}>
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke="#4DC493" 
                                strokeWidth={2} 
                                dot={false} 
                              />
                              <RechartsTooltip content={<CustomTooltip />} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-siac-accent/10 rounded-lg">
                            <Clock className="w-3 h-3 text-siac-accent" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Eficiencia Operativa</span>
                        </div>
                        <span className="text-xs font-bold text-siac-accent">ÓPTIMO</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Comparativa Operativa - NEW SECTION */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div className="w-1 h-3 bg-siac-green rounded-full" />
                    Comparativa Operativa por Zonas
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {['ZONA1', 'ZONA2', 'ZONA3'].map((zone, i) => (
                      <motion.div 
                        key={zone}
                        whileHover={{ scale: 1.01 }}
                        className="bg-industrial-950/50 border border-white/5 rounded-xl p-5 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{zone}</span>
                          <span className="text-[8px] font-mono text-gray-500">ID_SEC_{i+1}</span>
                        </div>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[comparativeData[i]]}>
                              <XAxis dataKey="zone" hide />
                              <YAxis hide />
                              <RechartsTooltip content={<CustomTooltip />} />
                              <Bar dataKey="alarmas" name="Alarmas" fill="#F51E1E" radius={[4, 4, 0, 0]} barSize={40} />
                              <Bar dataKey="umbral" name="Umbral" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <div className="flex items-center gap-1.5 text-[#F51E1E]">
                            <div className="w-2 h-2 rounded-full bg-[#F51E1E]" />
                            ALARMAS: {comparativeData[i].alarmas}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                            UMBRAL: {comparativeData[i].umbral}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Interactive Map View Component ---
const InteractiveMapView = () => {
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [isAlarmsCollapsed, setIsAlarmsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapPins = [
    { id: '1', x: 25, y: 55, tipo: 'Cámara', estado: 'Armado', label: 'ZONAS_POLN1' },
    { id: '2', x: 32, y: 48, tipo: 'Smartphone', estado: 'Bloqueado', label: 'ZONAS_POL' },
    { id: '3', x: 42, y: 62, tipo: 'Smartphone', estado: 'Armado', label: 'ACT_VALVE_22' },
    { id: '4', x: 45, y: 40, tipo: 'Shirt', estado: 'Apagado', label: 'ZONAS_MASTER_01' },
    { id: '5', x: 50, y: 55, tipo: 'Tractor', estado: 'Des-armado', label: 'ZONAS_POLN1' },
    { id: '6', x: 58, y: 52, tipo: 'Shirt', estado: 'Armado', label: 'ZONAS_POL' },
    { id: '7', x: 50, y: 30, tipo: 'Radio', estado: 'Bloqueado', label: 'ACT_VALVE_22' },
    { id: '8', x: 62, y: 45, tipo: 'Sun', estado: 'Armado', label: 'ZONAS_MASTER_01' },
    { id: '9', x: 70, y: 38, tipo: 'Radio', estado: 'Apagado', label: 'ZONAS_POLN1' },
    { id: '10', x: 75, y: 52, tipo: 'Camera', estado: 'Armado', label: 'ZONAS_POL' },
    { id: '11', x: 80, y: 45, tipo: 'Sun', estado: 'Armado', label: 'ACT_VALVE_22' },
    { id: '12', x: 90, y: 30, tipo: 'Radio', estado: 'Apagado', label: 'ZONAS_MASTER_01' },
  ];

  const alarms = [
    { fecha: '2024-04-19 02:42:13', estado: 'Pendiente', dispositivo: 'ZONA5_POLN1', ubicacion: 'ZONA5_POL1' },
    { fecha: '2024-04-19 02:42:13', estado: 'Activo', dispositivo: 'ZONA4_POLN1', ubicacion: 'ZONA5_POL1' },
  ];

  const statusColors = {
    'Apagado': '#4A4949',
    'Armado': '#0B986A',
    'Des-armado': '#D89A1E',
    'Alarmado': '#FAD92A',
    'Bloqueado': '#F51E1E',
  };

  const renderIcon = (tipo: string, color: string = "white") => {
    const iconClass = cn("w-5 h-5", color === "white" ? "text-white" : "text-siac-accent");
    switch (tipo) {
      case 'Cámara':
      case 'Camera': return <Camera className={iconClass} />;
      case 'Radio':
      case 'Signal': return <Radio className={iconClass} />;
      case 'Sun':
      case 'Grid': return <Sun className={iconClass} />;
      case 'Smartphone': return <Smartphone className={iconClass} />;
      case 'Shirt':
      case 'HardHat': return <Shirt className={iconClass} />;
      case 'Tractor': return <Tractor className={iconClass} />;
      default: return <Radio className={iconClass} />;
    }
  };

  const DataChartTooltip = ({ sensor, onClose }: { sensor: any, onClose: () => void }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute z-50 bg-card border-2 border-siac-accent rounded-xl shadow-2xl p-4 w-64 pointer-events-auto"
      style={{ left: `${sensor.x}%`, top: `${sensor.y - 15}%`, transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {renderIcon(sensor.tipo, "siac-accent")}
          <span className="text-xs font-bold text-white uppercase">{sensor.label}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="h-16 w-full bg-industrial-950/50 rounded-lg p-2 overflow-hidden">
          <div className="flex items-end gap-1 h-full">
            {[40, 60, 45, 80, 55, 70, 90, 65, 50, 75].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className="flex-1 bg-siac-accent/40 rounded-t-sm"
              />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-industrial-950/30 p-2 rounded-lg">
            <div className="text-[8px] text-gray-500 uppercase font-bold">Estado</div>
            <div className="text-[10px] font-bold text-siac-accent uppercase">{sensor.estado}</div>
          </div>
          <div className="bg-industrial-950/30 p-2 rounded-lg">
            <div className="text-[8px] text-gray-500 uppercase font-bold">Tendencia</div>
            <div className="text-[10px] font-bold text-white uppercase">+12.5%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 relative bg-[#F3F4F6] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {/* Map Background - Technical Light Style */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1569336415962-a4bd9f6dfc0f?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-30 grayscale-[0.5] brightness-[1.05]"
          alt="Technical Map Background"
        />
        <div className="absolute inset-0 bg-white/10" />
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      {/* Pins Layer */}
      <div className="absolute inset-0 z-10 p-20">
        {mapPins.map((pin) => (
          <motion.div
            key={pin.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            onClick={() => {
              if (pin.tipo === 'Cámara' || pin.tipo === 'Camera') {
                setSelectedCamera(pin);
                setSelectedSensor(null);
              } else {
                setSelectedSensor(pin);
                setSelectedCamera(null);
              }
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Circular Pin Design */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-2 border-white group-hover:shadow-2xl group-hover:scale-110"
                style={{ backgroundColor: statusColors[pin.estado as keyof typeof statusColors] }}
              >
                {renderIcon(pin.tipo)}
              </div>
              {/* Technical Label */}
              <div className="mt-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[9px] font-bold text-industrial-900 border border-black/10 whitespace-nowrap shadow-md uppercase tracking-tighter">
                {pin.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Chart Tooltip */}
      <AnimatePresence>
        {selectedSensor && (
          <DataChartTooltip 
            sensor={selectedSensor} 
            onClose={() => setSelectedSensor(null)} 
          />
        )}
      </AnimatePresence>

      {/* Floating Legend (Top Left) */}
      <div className="absolute top-6 left-6 z-30 bg-white p-4 rounded-xl border-2 border-siac-armed/30 shadow-2xl min-w-[160px]">
        <div className="text-[10px] font-bold text-industrial-900 uppercase tracking-widest mb-4 text-center border-b border-gray-100 pb-2">
          Leyenda
        </div>
        <div className="space-y-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls (Top Right) */}
      <div className="absolute top-6 right-6 z-30 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-xl flex flex-col border border-black/5">
          <button className="p-2 text-industrial-900 hover:bg-gray-100 transition-colors rounded-t-md">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-xl flex flex-col border border-black/5">
          <button className="p-2 text-industrial-900 hover:bg-gray-100 transition-colors rounded-t-md border-b border-gray-100">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-2 text-industrial-900 hover:bg-gray-100 transition-colors rounded-b-md">
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Modal (Bottom Left - Isolated) */}
      <AnimatePresence>
        {selectedCamera && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-[80px] left-8 z-50 w-[380px] bg-card border-2 border-siac-accent rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            <div className="relative">
              <button 
                onClick={() => setSelectedCamera(null)}
                className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 text-white rounded-full hover:bg-siac-blocked transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="aspect-video bg-black relative">
                <img 
                  src="https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover opacity-70 grayscale"
                  alt="CCTV Feed"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-siac-accent animate-pulse" />
                    <span className="text-[10px] font-mono text-siac-accent font-bold tracking-widest uppercase">REC • {selectedCamera.label}</span>
                  </div>
                  <span className="text-[8px] font-mono text-gray-400">CAM_ID: {selectedCamera.id} | 2026-04-26</span>
                </div>
              </div>

              <div className="p-4 bg-industrial-950/80 backdrop-blur-md flex items-center justify-between border-t border-white/5">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase font-bold">Ubicación</span>
                    <span className="text-[10px] text-white font-bold">{selectedCamera.label}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-gray-500 uppercase font-bold">Estado</span>
                    <span className="text-[10px] text-siac-accent font-bold uppercase">Conectado</span>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-siac-accent text-industrial-950 text-[10px] font-bold rounded-lg hover:brightness-110 transition-all uppercase tracking-widest">
                  PTZ Control
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alarms List (Bottom Center - Wider & Redesigned) */}
      <div className={cn(
        "absolute bottom-0 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-[1000px] transition-all duration-500 transform",
        isAlarmsCollapsed ? "translate-y-[calc(100%-56px)]" : "translate-y-[-20px]"
      )}>
        <div className="bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Technical Header */}
          <div className="px-6 py-4 bg-card flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-siac-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-siac-accent" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Listado de alarmas</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-siac-accent transition-colors" />
                <input 
                  type="text"
                  placeholder="BUSCAR EVENTO TÉCNICO..."
                  className="bg-industrial-950/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-siac-accent/50 w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsAlarmsCollapsed(!isAlarmsCollapsed)}
                className="p-2 hover:bg-white/5 rounded-full transition-all group"
              >
                <ChevronDown className={cn("w-6 h-6 text-siac-accent transition-transform duration-500", isAlarmsCollapsed ? "rotate-180" : "")} />
              </button>
            </div>
          </div>

          {/* Technical Table */}
          <div className="p-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 px-4">Timestamp</th>
                  <th className="pb-4 px-4">Prioridad / Estado</th>
                  <th className="pb-4 px-4">ID Dispositivo</th>
                  <th className="pb-4 px-4">Localización Técnica</th>
                  <th className="pb-4 px-4 text-right">Protocolo</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {alarms.map((alarm, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                    <td className="py-4 px-4 font-mono text-gray-400 group-hover:text-white transition-colors">{alarm.fecha}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all",
                        alarm.estado === 'Pendiente' 
                          ? "border-orange-500/30 text-orange-500 bg-orange-500/5 shadow-[0_0_10px_rgba(249,115,22,0.1)]" 
                          : "border-siac-accent/30 text-siac-accent bg-siac-accent/5 shadow-[0_0_10px_rgba(77,196,147,0.1)]"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", alarm.estado === 'Pendiente' ? "bg-orange-500" : "bg-siac-accent")} />
                        {alarm.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 group-hover:text-siac-accent transition-colors">{alarm.dispositivo}</td>
                    <td className="py-4 px-4 text-gray-500 uppercase tracking-tighter">{alarm.ubicacion}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[10px] text-siac-accent hover:text-white border border-siac-accent/20 hover:border-siac-accent px-3 py-1 rounded-md transition-all uppercase">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pixel Perfect Pagination */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <button className="text-siac-accent hover:scale-110 transition-transform disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(n => (
                  <button 
                    key={n}
                    className={cn(
                      "w-9 h-9 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center",
                      n === 1 
                        ? "bg-siac-accent text-industrial-950 border-siac-accent shadow-lg shadow-siac-accent/20" 
                        : "text-gray-500 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button className="text-siac-accent hover:scale-110 transition-transform">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<DeviceType | 'Todos'>('Todos');
  const [currentView, setCurrentView] = useState<'dashboard' | 'reportes' | 'mapa' | 'alarmas' | 'seguimiento' | 'Usuarios' | 'Configuración'>('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>(generateAlarms());
  const [pins, setPins] = useState<Pin[]>(INITIAL_PINS);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [exportState, setExportState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [kpis, setKpis] = useState<any[]>(() => ([
    { id: 'Cámara', label: 'Cámaras', icon: Camera, value: 12, total: 13, status: 'AVISO', color: 'siac-disarmed', data: [8, 10, 9, 11, 10, 12, 12, 11] },
    { id: 'Infrarrojo', label: 'Infrarrojos', icon: Thermometer, value: 9, total: 12, status: 'ALERTA', color: 'siac-blocked', data: [11, 10, 10, 9, 10, 9, 9, 9] },
    { id: 'PIR', label: 'PIR', icon: Radio, value: 12, total: 13, status: 'AVISO', color: 'siac-disarmed', data: [10, 11, 10, 12, 12, 12, 12, 12] },
    { id: 'GW', label: 'GW', icon: Cpu, value: 11, total: 11, status: 'OK', color: 'siac-accent', data: [9, 10, 11, 11, 10, 11, 11, 11] },
    { id: 'Activo', label: 'Activos', icon: Activity, value: 13, total: 13, status: 'OK', color: 'siac-accent', data: [11, 12, 12, 13, 13, 13, 13, 13] },
  ]));

  useEffect(() => {
    setLastUpdatedAt(Date.now());
  }, [isDemoMode]);

  const runSimulatedAction = (
    setState: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'success'>>
  ) => {
    setState('loading');
    window.setTimeout(() => {
      setState('success');
      window.setTimeout(() => setState('idle'), 900);
    }, 1500);
  };

  useEffect(() => {
    if (isDemoMode) return;
    const interval = setInterval(() => {
      setAlarms(prev => {
        const newAlarms = [...prev];
        const indexToUpdate = Math.floor(Math.random() * newAlarms.length);
        newAlarms[indexToUpdate] = {
          ...newAlarms[indexToUpdate],
          fecha: new Date().toISOString().replace('T', ' ').split('.')[0],
          estado: Math.random() > 0.5 ? 'PENDIENTE' : 'RESUELTO'
        };
        return newAlarms;
      });

      setPins(prev => prev.map(p => ({
        ...p,
        estado: Math.random() > 0.8 ? (['Apagado', 'Armado', 'Des-armado', 'Alarmado', 'Bloqueado'][Math.floor(Math.random() * 5)] as any) : p.estado
      })));
      setLastUpdatedAt(Date.now());
    }, 8000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) return;
    const nextEstado = (estado: Pin['estado']) => (estado === 'Armado' ? 'Alarmado' : estado === 'Alarmado' ? 'Bloqueado' : 'Armado');

    const interval = setInterval(() => {
      setPins((prev) => {
        if (!prev.length) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const current = prev[idx];
        const next = nextEstado(current.estado);
        const updated = [...prev];
        updated[idx] = { ...current, estado: next };

        if (next === 'Bloqueado' || next === 'Alarmado') {
          const toastId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const color = next === 'Bloqueado' ? '#F51E1E' : '#FAD92A';
          setToasts((t) => [{ id: toastId, title: 'Evento Simulado', message: `${current.nombre} → ${next.toUpperCase()}`, color }, ...t].slice(0, 4));
          setTimeout(() => setToasts((t) => t.filter((x: any) => x.id !== toastId)), 3200);
        }

        setLastUpdatedAt(Date.now());
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setKpis((prev) => prev.map((k: any) => {
        const max = Number(k.total) || 0;
        const delta = 1;
        const nextVal = Math.max(0, Math.min(max, (Number(k.value) || 0) + (Math.random() > 0.5 ? delta : -delta)));
        const nextData = Array.isArray(k.data) ? [...k.data, nextVal].slice(-12) : [nextVal];
        return { ...k, value: nextVal, data: nextData };
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const filteredAlarms = useMemo(() => {
    if (!alarms) return [];
    if (activeFilter === 'Todos') return alarms;
    return alarms.filter(a => a.tipo === activeFilter);
  }, [alarms, activeFilter]);

  const LiveIndicator = () => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }, []);
    const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
    return (
      <div className="relative group flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-siac-armed animate-pulse" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
          En vivo · Actualizado hace {seconds}s
        </span>
        <div className="absolute left-0 top-full mt-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          <div className="bg-card border border-border-card rounded-lg px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gray-300 shadow-2xl">
            Datos actualizando en tiempo real
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex h-screen bg-industrial-950 text-white overflow-hidden relative"
    >
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t: any) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto"
            >
              <div className="bg-card/85 backdrop-blur-md border border-border-card rounded-xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 flex items-start gap-3" style={{ borderLeft: `3px solid ${t.color}` }}>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.title}</div>
                    <div className="mt-0.5 text-xs font-bold text-white">{t.message}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: t.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsDemoMode((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-[65] px-5 py-3 rounded-full border font-bold uppercase tracking-widest text-[10px] shadow-2xl transition-all flex items-center gap-2",
          isDemoMode
            ? "bg-siac-blocked border-siac-blocked text-industrial-950 hover:brightness-110 shadow-[0_0_20px_rgba(245,30,30,0.3)]"
            : "bg-siac-accent border-siac-accent text-industrial-950 hover:brightness-110 shadow-[0_0_20px_rgba(77,196,147,0.3)]"
        )}
      >
        {isDemoMode ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isDemoMode ? "Stop Demo" : "Demo"}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-industrial-800 flex flex-col bg-card z-50 transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-industrial-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-siac-accent rounded flex items-center justify-center">
              <ShieldCheck className="text-industrial-950 w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter">SIAC</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-500 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all relative overflow-hidden",
              currentView === 'dashboard' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'dashboard' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => { setCurrentView('mapa'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'mapa' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'mapa' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <MapIcon className="w-5 h-5" /> Mapa
          </button>
          <button 
            onClick={() => { setCurrentView('alarmas'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'alarmas' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'alarmas' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Bell className="w-5 h-5" /> Alarmas
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-siac-blocked text-white text-[10px] flex items-center justify-center rounded-full font-bold">7</span>
          </button>
          <button 
            onClick={() => setCurrentView('reportes')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'reportes' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'reportes' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <FileText className="w-5 h-5" /> Reportes
          </button>
          <button 
            onClick={() => { setCurrentView('seguimiento'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'seguimiento' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'seguimiento' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Activity className="w-5 h-5" /> Seguimiento
          </button>
          <button 
            onClick={() => { setCurrentView('Usuarios'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'Usuarios' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'Usuarios' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Users className="w-5 h-5" /> Usuarios
          </button>
          <button 
            onClick={() => { setCurrentView('Configuración'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all relative overflow-hidden",
              currentView === 'Configuración' ? "bg-siac-accent/10 text-siac-accent" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            {currentView === 'Configuración' && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-2 bottom-2 w-[3px] bg-siac-accent rounded-r"
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
            )}
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-industrial-800 space-y-3">
          <motion.div
            whileHover={{ x: 2, boxShadow: '0 0 18px rgba(77,196,147,0.25)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-3"
          >
            <div className="flex items-center gap-2">
              <motion.a
                href="https://www.linkedin.com/in/leodisenofreelance"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-0 flex items-center gap-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] tracking-wider text-white truncate">
                    <span className="font-semibold">Leandro Balbian</span>{' '}
                    <span className="opacity-60">— Product Designer</span>
                  </div>
                </div>
              </motion.a>

              <motion.a
                href="https://www.linkedin.com/in/leodisenofreelance"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 p-2 rounded-lg border border-white/10 bg-card/30 text-gray-400"
                whileHover={{ scale: 1.2, color: '#4DC493', borderColor: 'rgba(77,196,147,0.35)' }}
                transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </motion.a>

              <button
                disabled
                className="shrink-0 px-3 py-2 rounded-lg text-[11px] tracking-wider uppercase border border-white/10 bg-card/20 text-white/40 cursor-not-allowed"
                aria-label="Portafolio (próximamente)"
              >
                Portafolio
              </button>
            </div>
          </motion.div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-siac-blocked hover:bg-siac-blocked/5 rounded-lg font-medium transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-card/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 cursor-pointer hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Dashboard</span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-700" />
              <div 
                onClick={() => setCurrentView('mapa')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer group"
              >
                <MapIcon className={cn(
                  "w-3 h-3 transition-colors",
                  currentView === 'mapa' ? "text-siac-accent" : "text-gray-500 group-hover:text-siac-accent"
                )} />
                <span className={cn(
                  "transition-colors",
                  currentView === 'mapa' ? "text-siac-accent" : "text-white hover:text-siac-accent"
                )}
                >
                  Mapa
                </span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-700" />
              <div 
                onClick={() => setCurrentView('reportes')}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer group"
              >
                <FileText className={cn(
                  "w-3 h-3 transition-colors",
                  currentView === 'reportes' ? "text-siac-accent" : "text-gray-500 group-hover:text-siac-accent"
                )} />
                <span className={cn(
                  "transition-colors",
                  currentView === 'reportes' ? "text-siac-accent" : "text-white hover:text-siac-accent"
                )}
                >
                  Reportes
                </span>
              </div>
              {currentView === 'alarmas' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-siac-accent">
                    <Bell className="w-3 h-3" />
                    <span>Alarmas</span>
                  </div>
                </>
              )}
              {currentView === 'seguimiento' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-siac-accent">
                    <History className="w-3 h-3" />
                    <span>Seguimiento</span>
                  </div>
                </>
              )}
              {currentView === 'Usuarios' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-siac-accent">
                    <Users className="w-3 h-3" />
                    <span>Usuarios</span>
                  </div>
                </>
              )}
              {currentView === 'Configuración' && (
                <>
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-siac-accent">
                    <Settings className="w-3 h-3" />
                    <span>Configuración</span>
                  </div>
                </>
              )}
            </div>
            <LiveIndicator />
          </div>

          {/* Center Navigation Icons */}
          <div className="hidden lg:flex items-center bg-industrial-800/50 px-4 py-1.5 rounded-full border border-white/5 gap-6">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={cn(
                "transition-all",
                currentView === 'dashboard' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView('alarmas')}
              className={cn(
                "transition-all",
                currentView === 'alarmas' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              onClick={() => setCurrentView('mapa')}
              className={cn(
                "transition-all",
                currentView === 'mapa' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              onClick={() => setCurrentView('reportes')}
              className={cn(
                "transition-all",
                currentView === 'reportes' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView('seguimiento')}
              className={cn(
                "transition-all",
                currentView === 'seguimiento' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentView('Configuración')}
              className={cn(
                "transition-all",
                currentView === 'Configuración' ? "text-siac-accent" : "text-gray-500 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              {/* Night Mode Selector */}
              <button className="p-2 text-gray-400 hover:text-white transition-colors bg-industrial-800/50 rounded-lg border border-white/5">
                <Moon className="w-4 h-4" />
              </button>
              
              {/* Notifications with Badge */}
              <div className="relative group">
                <button 
                  onClick={() => setCurrentView('alarmas')}
                  className={cn(
                    "p-2 transition-colors bg-industrial-800/50 rounded-lg border border-white/5",
                    currentView === 'alarmas' ? "text-siac-accent border-siac-accent/30" : "text-gray-400 group-hover:text-white"
                  )}
                >
                  <Bell className="w-4 h-4" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-siac-blocked text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-industrial-900 pointer-events-none">2</span>
              </div>
            </div>

            <div className="w-px h-6 bg-white/10 hidden sm:block" />

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-white leading-none">Administrador</div>
                <div className="text-[10px] text-gray-500 font-medium">Soporte Técnico</div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-siac-accent p-0.5 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 flex flex-col">
          {currentView === 'dashboard' ? (
            <div className="space-y-6 md:space-y-8">
              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpis.map(kpi => (
                  <KPICard 
                    key={kpi.id} 
                    kpi={kpi} 
                    active={activeFilter === kpi.id} 
                    onClick={() => setActiveFilter(activeFilter === kpi.id ? 'Todos' : kpi.id)}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Map Container */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-siac-accent" /> Mapa de Instalaciones
                    </h3>
                    <button className="p-2 hover:bg-industrial-800 rounded-lg transition-colors text-gray-500 hover:text-white">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="aspect-video bg-card rounded-2xl border border-white/5 relative overflow-hidden group">
                    {/* Blueprint / Technical Grid Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{ 
                        backgroundImage: `
                          linear-gradient(to right, #4f4f4f 1px, transparent 1px),
                          linear-gradient(to bottom, #4f4f4f 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                      }} 
                    />
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ 
                        backgroundImage: `
                          linear-gradient(to right, #4f4f4f 1px, transparent 1px),
                          linear-gradient(to bottom, #4f4f4f 1px, transparent 1px)
                        `,
                        backgroundSize: '8px 8px'
                      }} 
                    />
                    
                    {/* Minimal Dark Map Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(22,29,49,0.4)_100%)]" />
                    
                    {/* Map Pins */}
                    <AnimatePresence>
                      {pins?.map((pin) => (
                        <motion.div
                          key={pin.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: (pin.estado === 'Alarmado' || pin.estado === 'Bloqueado') ? 1.35 : 1, opacity: 1 }}
                          className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          onMouseEnter={() => setHoveredPinId(pin.id)}
                          onMouseLeave={() => setHoveredPinId((prev) => (prev === pin.id ? null : prev))}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPin(pin);
                          }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-card/90 backdrop-blur-md border border-border-card rounded-xl px-3 py-2 shadow-2xl w-max">
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] font-bold text-white">{pin.nombre || pin.id || 'N/A'}</div>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                  pin.estado === 'Armado'
                                    ? "bg-siac-armed/10 text-siac-armed border-siac-armed/30"
                                    : pin.estado === 'Alarmado'
                                    ? "bg-siac-alarmed/10 text-siac-alarmed border-siac-alarmed/30"
                                    : pin.estado === 'Bloqueado'
                                    ? "bg-siac-blocked/10 text-siac-blocked border-siac-blocked/30"
                                    : pin.estado === 'Des-armado'
                                    ? "bg-siac-disarmed/10 text-siac-disarmed border-siac-disarmed/30"
                                    : "bg-siac-off/10 text-siac-off border-siac-off/30"
                                )}>
                                  {pin.estado}
                                </span>
                              </div>
                              <div className="mt-1 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                                Últ. actualización: {new Date(lastUpdatedAt).toLocaleTimeString('en-US', { hour12: false })}
                              </div>
                            </div>
                          </div>

                          <div className="relative">
                            {(pin.estado === 'Alarmado' || pin.estado === 'Bloqueado') && (
                              <div className={cn(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full animate-pulse",
                                pin.estado === 'Alarmado' ? "ring-2 ring-siac-alarmed/60 bg-siac-alarmed/5" : "ring-2 ring-siac-blocked/60 bg-siac-blocked/5"
                              )} />
                            )}

                            {/* PIN SHAPE (Gota) */}
                            <div className={cn(
                              "relative w-8 h-10 transition-all duration-300 transform drop-shadow-lg",
                              selectedPin?.id === pin.id ? "-translate-y-1" : "group-hover:-translate-y-1"
                            )}>
                              <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-md">
                                <path 
                                  d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" 
                                  className={cn(
                                    "transition-colors duration-300",
                                    pin.estado === 'Apagado' ? "fill-siac-off" :
                                    pin.estado === 'Armado' ? "fill-siac-armed" :
                                    pin.estado === 'Activo' ? "fill-siac-accent" :
                                    pin.estado === 'Des-armado' ? "fill-siac-disarmed" :
                                    pin.estado === 'Alarmado' ? "fill-siac-alarmed" :
                                    "fill-siac-blocked"
                                  )}
                                />
                                <circle cx="12" cy="12" r="9" fill="black" fillOpacity="0.15" />
                              </svg>

                              {/* ICON INSIDE PIN */}
                              <div className="absolute top-[7px] left-1/2 -translate-x-1/2 text-white">
                                {pin.tipo === 'Cámara' && <Camera className="w-3.5 h-3.5" />}
                                {pin.tipo === 'Infrarrojo' && <Thermometer className="w-3.5 h-3.5" />}
                                {pin.tipo === 'PIR' && <Radio className="w-3.5 h-3.5" />}
                                {pin.tipo === 'GW' && <Cpu className="w-3.5 h-3.5" />}
                                {pin.tipo === 'Activo' && <Activity className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Map Legend */}
                    <div className="hidden sm:block absolute bottom-4 left-4 bg-industrial-950/90 backdrop-blur-md p-3 md:p-4 rounded-xl border border-white/5 shadow-2xl z-20">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <div className="w-1 h-3 bg-siac-accent rounded-full" />
                        LEYENDA
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {[
                          { label: 'Apagado', color: 'bg-siac-off' },
                          { label: 'Armado', color: 'bg-siac-armed' },
                          { label: 'Activo', color: 'bg-siac-accent' },
                          { label: 'Desarmado', color: 'bg-siac-disarmed' },
                          { label: 'Alarmado', color: 'bg-siac-alarmed' },
                          { label: 'Bloqueado', color: 'bg-siac-blocked' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                            <span className="text-[10px] font-medium text-gray-300">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                      <button className="p-2 bg-industrial-950/80 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/5 mx-auto" />
                      <button className="p-2 bg-industrial-950/80 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-industrial-950/80 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Selected Pin Info (CCTV Overlay) */}
                    <AnimatePresence>
                      {selectedPin && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[450px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl z-40 shadow-2xl overflow-hidden"
                        >
                          {/* CCTV Header */}
                          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-industrial-950/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-siac-accent animate-pulse" />
                              <span className="text-xs font-bold uppercase tracking-widest text-gray-200">LIVE: {selectedPin.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500">ID: {selectedPin.id}</span>
                              <button 
                                onClick={() => setSelectedPin(null)}
                                className="p-1 hover:bg-siac-blocked/20 text-gray-500 hover:text-siac-blocked rounded-md transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Video Placeholder */}
                          <div className="aspect-video bg-black relative group/cctv">
                            <img 
                              src="https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&q=80&w=800" 
                              alt="CCTV Feed" 
                              className="w-full h-full object-cover opacity-60 grayscale sepia-[.2]"
                            />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/scan-lines.png')] opacity-30 pointer-events-none" />
                            
                            {/* CCTV HUD */}
                            <div className="absolute top-4 left-4 text-[10px] font-mono text-siac-accent/80">
                              REC ● 24-04-2026 16:32:11
                            </div>
                            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-siac-accent/80">
                              CAM_SEC_0{selectedPin.id.slice(-1)}
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover/cctv:opacity-100 transition-opacity">
                              <button className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all">
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all">
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="p-4 grid grid-cols-3 gap-4 bg-industrial-950/30">
                            <div className="space-y-1">
                              <span className="text-[8px] text-gray-500 uppercase font-bold">Estado</span>
                              <div className={cn(
                                "text-[10px] font-bold",
                                selectedPin.estado === 'Alarmado'
                                  ? "text-siac-alarmed"
                                  : selectedPin.estado === 'Bloqueado'
                                  ? "text-siac-blocked"
                                  : selectedPin.estado === 'Des-armado'
                                  ? "text-siac-disarmed"
                                  : selectedPin.estado === 'Apagado'
                                  ? "text-siac-off"
                                  : "text-siac-armed"
                              )}>{selectedPin.estado.toUpperCase()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-gray-500 uppercase font-bold">Tipo</span>
                              <div className="text-[10px] font-bold text-gray-200">{selectedPin.tipo.toUpperCase()}</div>
                            </div>
                            <div className="flex items-end justify-end">
                              <button className="px-3 py-1.5 bg-siac-accent text-industrial-950 text-[10px] font-bold rounded-lg hover:brightness-110 transition-all">
                                PROTOCOLO
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Installation Status */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-siac-accent" /> Instalaciones
                  </h3>
                  <div className="bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col h-auto max-h-[400px] xl:max-h-none xl:h-[calc(100%-40px)]">
                    <div className="p-4 border-b border-white/5 bg-industrial-800/30">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Estado de Zonas</h4>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {pins?.map((pin, i) => (
                        <div key={pin.id || i} className="p-4 border-b border-white/5 hover:bg-industrial-800/50 transition-colors grid grid-cols-3 items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] text-gray-500">{pin.id || 'N/A'}</span>
                            <span className="font-bold text-xs">{pin.nombre || 'Sin nombre'}</span>
                          </div>
                          <div className="flex justify-center">
                            <div className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold border",
                              pin.estado === 'Alarmado'
                                ? "bg-siac-alarmed/10 text-siac-alarmed border-siac-alarmed/20"
                                : pin.estado === 'Bloqueado'
                                ? "bg-siac-blocked/10 text-siac-blocked border-siac-blocked/20"
                                : pin.estado === 'Des-armado'
                                ? "bg-siac-disarmed/10 text-siac-disarmed border-siac-disarmed/20"
                                : pin.estado === 'Apagado'
                                ? "bg-siac-off/10 text-siac-off border-siac-off/20"
                                : "bg-siac-armed/10 text-siac-armed border-siac-armed/20"
                            )}>
                              {(pin.estado || 'DESCONOCIDO').toUpperCase()}
                            </div>
                          </div>
                          <span className="text-right text-[10px] text-gray-500 font-mono">16:32:{i < 10 ? `0${i}` : i} PM</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-industrial-800/20 border-t border-white/5 flex justify-between items-center text-xs shrink-0">
                      <span className="text-gray-500">Total: {pins?.length || 0} dispositivos</span>
                      <div className="flex gap-1">
                        <button className="w-6 h-6 rounded bg-industrial-800 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white">1</button>
                        <button className="w-6 h-6 rounded hover:bg-industrial-800 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white">2</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alarms Table */}
                <div className="xl:col-span-3 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-siac-blocked" /> Listado de Alarmas
                      <span className="bg-siac-blocked/10 text-siac-blocked px-2 py-0.5 rounded-full text-[10px] md:text-xs font-mono">{filteredAlarms.length} eventos</span>
                    </h3>
                    <div className="flex items-center gap-2 md:gap-4">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Buscar evento..." 
                          className="w-full bg-card border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-armed sm:w-48 lg:w-64"
                        />
                      </div>
                      <button
                        onClick={() => runSimulatedAction(setExportState)}
                        disabled={exportState === 'loading'}
                        className={cn(
                          "bg-siac-armed text-industrial-950 px-3 md:px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all inline-flex items-center gap-2",
                          exportState === 'loading' && "opacity-80 cursor-not-allowed"
                        )}
                      >
                        {exportState === 'loading' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : exportState === 'success' ? (
                          <Check className="w-4 h-4" />
                        ) : null}
                        Exportar
                      </button>
                    </div>
                  </div>

                  <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-industrial-800/30 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
                      {['Todos', 'Cámara', 'Infrarrojo', 'PIR', 'GW', 'Activo'].map((f) => (
                        <button 
                          key={f}
                          onClick={() => setActiveFilter(f as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                            activeFilter === f 
                              ? "bg-siac-armed text-industrial-950 border-siac-armed" 
                              : "bg-industrial-800 text-gray-400 border-white/5 hover:border-gray-600"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider opacity-60 text-white">
                            <th className="px-6 py-4">Evento ID</th>
                            <th className="px-6 py-4">Fecha / Hora</th>
                            <th className="px-6 py-4">Dispositivo</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4">Ubicación</th>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {filteredAlarms.map((alarm) => (
                            <tr 
                              key={alarm.id} 
                              className={cn(
                                "border-b border-white/5 hover:bg-white/5 transition-colors group",
                                (alarm.estado === 'PENDIENTE' || alarm.estado === 'ALERTA') && "border-l-[3px]"
                              )}
                              style={{
                                backgroundColor:
                                  alarm.estado === 'PENDIENTE'
                                    ? 'rgba(250,217,42,0.04)'
                                    : alarm.estado === 'ALERTA'
                                    ? 'rgba(245,30,30,0.04)'
                                    : undefined,
                                borderLeftColor:
                                  alarm.estado === 'PENDIENTE'
                                    ? '#FAD92A'
                                    : alarm.estado === 'ALERTA'
                                    ? '#F51E1E'
                                    : undefined,
                              }}
                            >
                              <td className="px-6 py-4 font-mono text-gray-400">#EV-{alarm.id}024</td>
                              <td className="px-6 py-4 text-gray-300">{alarm.fecha}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-industrial-800 rounded-lg border border-white/5">
                                    {alarm.tipo === 'Cámara' && <Camera className="w-3 h-3" />}
                                    {alarm.tipo === 'Infrarrojo' && <Thermometer className="w-3 h-3" />}
                                    {alarm.tipo === 'PIR' && <Radio className="w-3 h-3" />}
                                    {alarm.tipo === 'GW' && <Cpu className="w-3 h-3" />}
                                    {alarm.tipo === 'Activo' && <Activity className="w-3 h-3" />}
                                  </div>
                                  <span className="font-bold">{alarm.dispositivo}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                                  alarm.estado === 'RESUELTO' 
                                    ? "bg-siac-armed/10 text-siac-armed border-siac-armed/20" 
                                    : "bg-siac-disarmed/10 text-siac-disarmed border-siac-disarmed/20"
                                )}>
                                  {alarm.estado === 'RESUELTO' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {alarm.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-400">{alarm.ubicacion}</td>
                              <td className="px-6 py-4 text-gray-300 italic">"{alarm.descripcion}"</td>
                              <td className="px-6 py-4 text-right">
                                <button className="text-siac-armed text-[10px] font-bold hover:underline">Ver</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'mapa' ? (
            <InteractiveMapView />
          ) : currentView === 'alarmas' ? (
            <AlarmsView onNavigateToMap={() => setCurrentView('mapa')} />
          ) : currentView === 'seguimiento' ? (
            <TrackingView />
          ) : currentView === 'Usuarios' ? (
            <UsersView />
          ) : currentView === 'Configuración' ? (
            <SettingsView />
          ) : (
            <ReportsView isSearching={isSearching} setIsSearching={setIsSearching} />
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="antialiased">
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}
