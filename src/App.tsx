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
  Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  YAxis
} from 'recharts';

// --- Utility for Tailwind classes ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-siac-armed/20 via-transparent to-transparent" />
        <div className="grid grid-cols-12 h-full w-full border-siac-armed/5 border">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-siac-armed/5 border" />
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
            <div className="w-12 h-12 bg-siac-green rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.4)]">
              <ShieldCheck className="text-industrial-950 w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">SIAC</h1>
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Sistema Inteligente <br />
              <span className="text-siac-green">de Monitoreo</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-sm mx-auto md:mx-0">
              Arquitectura de seguridad avanzada para activos industriales críticos.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
            <div className="bg-industrial-900 border border-industrial-700 p-4 rounded-xl w-full md:w-auto text-center md:text-left">
              <div className="text-3xl font-mono text-siac-green">20,347</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Monitoreos activos</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-industrial-700" />
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-industrial-950 bg-industrial-800 flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div 
          className="bg-industrial-900 border border-industrial-700 p-8 rounded-2xl shadow-2xl relative group"
          whileHover={{ borderColor: 'rgba(0,255,157,0.3)' }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-siac-green/5 blur-3xl rounded-full" />
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            Bienvenido <div className="w-2 h-2 rounded-full bg-siac-green animate-pulse" />
          </h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Usuario</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  defaultValue="admin@siac.mx"
                  className="w-full bg-industrial-800 border border-industrial-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-green transition-colors" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Contraseña</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  defaultValue="password"
                  className="w-full bg-industrial-800 border border-industrial-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-green transition-colors" 
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-siac-green text-industrial-950 font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Ingresar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-industrial-800 flex justify-between items-center text-[10px] text-gray-600 font-mono">
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
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "bg-industrial-900 border border-white/10 p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden group",
        active ? "ring-1 ring-siac-armed/50 border-siac-armed/50" : "hover:border-white/20"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-full flex items-center justify-center shrink-0 transition-colors",
          kpi.status === 'ALERTA' ? "bg-siac-blocked/10 text-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed/10 text-siac-disarmed" : "bg-siac-armed/10 text-siac-armed"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{kpi.value}</span>
            <span className="text-xs text-gray-500 font-medium">/ {kpi.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">{kpi.label}</span>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              kpi.status === 'ALERTA' ? "bg-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed" : "bg-siac-armed"
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
            kpi.status === 'ALERTA' ? "bg-siac-blocked" : kpi.status === 'AVISO' ? "bg-siac-disarmed" : "bg-siac-armed"
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
        <div className="bg-[#1F2937] border border-siac-active p-2 rounded shadow-2xl">
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
      <div className="bg-industrial-900 p-4 rounded-xl border border-white/10 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Instalación</div>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siac-green" />
            <select 
              value={selectedInstallation}
              onChange={(e) => handleInstallationChange(e.target.value)}
              className="w-full bg-[#283046] border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-siac-green transition-all appearance-none text-white font-bold"
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
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-siac-green" />
            <input 
              type="text" 
              defaultValue="25-04-2026"
              className="w-full bg-[#283046] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-green transition-all font-mono text-white"
            />
          </div>
        </div>

        <div className="flex items-end h-full">
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-siac-active hover:brightness-110 text-industrial-950 px-8 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 min-w-[140px] justify-center shadow-[0_0_15px_rgba(77,196,147,0.2)]"
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
            className="h-[600px] flex flex-col items-center justify-center gap-4 bg-industrial-900/50 rounded-2xl border border-white/5"
          >
            <div className="w-12 h-12 border-4 border-siac-green border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-siac-green uppercase tracking-[0.2em]">Re-configurando entorno...</span>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Main Report Card */}
            <div className="bg-industrial-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-siac-green" />
                  <span className="text-sm font-bold uppercase tracking-widest">Reporte Operativo: {selectedInstallation}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-500">REF: SIAC-REP-2026-0425</div>
              </div>
              
              <div className="p-6 space-y-10">
                {/* Equipamiento Donuts */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <div className="w-1 h-3 bg-siac-green rounded-full" />
                    Estado de Equipamiento
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {donutData.map((data, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ scale: 1.02, borderColor: 'rgba(11,152,106,0.3)' }}
                        className="bg-industrial-950/50 border border-white/5 rounded-xl p-6 flex flex-col items-center group transition-all shadow-lg hover:shadow-siac-green/5"
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
                    Estado de Sensores en el Período
                  </h4>
                  <div className="bg-industrial-950/30 border border-white/5 rounded-xl p-6">
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                      {deviceHealth.map((device) => (
                        <motion.div 
                          key={device.id}
                          whileHover={{ y: -2 }}
                          className="flex flex-col items-center gap-2 p-3 bg-industrial-900/50 border border-white/5 rounded-lg group cursor-help"
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
                      className="bg-industrial-900 border border-white/10 rounded-xl p-5 space-y-4 group hover:border-siac-active/30 transition-all shadow-lg"
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
                      className="bg-industrial-900 border border-white/10 rounded-xl p-5 space-y-4 group hover:border-siac-active/30 transition-all shadow-lg"
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
                          <div className="p-1.5 bg-siac-active/10 rounded-lg">
                            <Clock className="w-3 h-3 text-siac-active" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Eficiencia Operativa</span>
                        </div>
                        <span className="text-xs font-bold text-siac-active">ÓPTIMO</span>
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
    const iconClass = cn("w-5 h-5", color === "white" ? "text-white" : "text-siac-active");
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
      className="absolute z-50 bg-[#1F2937] border-2 border-siac-active rounded-xl shadow-2xl p-4 w-64 pointer-events-auto"
      style={{ left: `${sensor.x}%`, top: `${sensor.y - 15}%`, transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {renderIcon(sensor.tipo, "siac-active")}
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
                className="flex-1 bg-siac-active/40 rounded-t-sm"
              />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-industrial-950/30 p-2 rounded-lg">
            <div className="text-[8px] text-gray-500 uppercase font-bold">Estado</div>
            <div className="text-[10px] font-bold text-siac-active uppercase">{sensor.estado}</div>
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
            className="absolute bottom-[80px] left-8 z-50 w-[380px] bg-[#1F2937] border-2 border-siac-active rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
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
                    <div className="w-2 h-2 rounded-full bg-siac-active animate-pulse" />
                    <span className="text-[10px] font-mono text-siac-active font-bold tracking-widest uppercase">REC • {selectedCamera.label}</span>
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
                    <span className="text-[10px] text-siac-active font-bold uppercase">Conectado</span>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-siac-active text-industrial-950 text-[10px] font-bold rounded-lg hover:brightness-110 transition-all uppercase tracking-widest">
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
        <div className="bg-industrial-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Technical Header */}
          <div className="px-6 py-4 bg-[#1F2937] flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-siac-active/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-siac-active" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Listado de alarmas</h3>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-siac-active transition-colors" />
                <input 
                  type="text"
                  placeholder="BUSCAR EVENTO TÉCNICO..."
                  className="bg-industrial-950/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-siac-active/50 w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsAlarmsCollapsed(!isAlarmsCollapsed)}
                className="p-2 hover:bg-white/5 rounded-full transition-all group"
              >
                <ChevronDown className={cn("w-6 h-6 text-siac-active transition-transform duration-500", isAlarmsCollapsed ? "rotate-180" : "")} />
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
                          : "border-siac-active/30 text-siac-active bg-siac-active/5 shadow-[0_0_10px_rgba(77,196,147,0.1)]"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", alarm.estado === 'Pendiente' ? "bg-orange-500" : "bg-siac-active")} />
                        {alarm.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 group-hover:text-siac-active transition-colors">{alarm.dispositivo}</td>
                    <td className="py-4 px-4 text-gray-500 uppercase tracking-tighter">{alarm.ubicacion}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[10px] text-siac-active hover:text-white border border-siac-active/20 hover:border-siac-active px-3 py-1 rounded-md transition-all uppercase">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pixel Perfect Pagination */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <button className="text-siac-active hover:scale-110 transition-transform disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(n => (
                  <button 
                    key={n}
                    className={cn(
                      "w-9 h-9 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center",
                      n === 1 
                        ? "bg-siac-active text-industrial-950 border-siac-active shadow-lg shadow-siac-active/20" 
                        : "text-gray-500 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button className="text-siac-active hover:scale-110 transition-transform">
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'reportes' | 'mapa'>('dashboard');
  const [isSearching, setIsSearching] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>(generateAlarms());
  const [pins, setPins] = useState<Pin[]>(INITIAL_PINS);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
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
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlarms = useMemo(() => {
    if (!alarms) return [];
    if (activeFilter === 'Todos') return alarms;
    return alarms.filter(a => a.tipo === activeFilter);
  }, [alarms, activeFilter]);

  const kpis: KPI[] = [
    { id: 'Cámara', label: 'Cámaras', icon: Camera, value: 12, total: 13, status: 'AVISO', color: 'siac-disarmed' },
    { id: 'Infrarrojo', label: 'Infrarrojos', icon: Thermometer, value: 9, total: 12, status: 'ALERTA', color: 'siac-blocked' },
    { id: 'PIR', label: 'PIR', icon: Radio, value: 12, total: 13, status: 'AVISO', color: 'siac-disarmed' },
    { id: 'GW', label: 'GW', icon: Cpu, value: 11, total: 11, status: 'OK', color: 'siac-armed' },
    { id: 'Activo', label: 'Activos', icon: Activity, value: 13, total: 13, status: 'OK', color: 'siac-armed' },
  ];

  return (
    <div className="flex h-screen bg-industrial-950 text-white overflow-hidden relative">
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
        "fixed inset-y-0 left-0 w-64 border-r border-industrial-800 flex flex-col bg-industrial-900 z-50 transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-industrial-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-siac-green rounded flex items-center justify-center">
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
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all",
              currentView === 'dashboard' ? "bg-siac-green/10 text-siac-green" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => { setCurrentView('mapa'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
              currentView === 'mapa' ? "bg-siac-green/10 text-siac-green" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            <MapIcon className="w-5 h-5" /> Mapa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all relative">
            <Bell className="w-5 h-5" /> Alarmas
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-siac-blocked text-white text-[10px] flex items-center justify-center rounded-full font-bold">7</span>
          </button>
          <button 
            onClick={() => setCurrentView('reportes')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all",
              currentView === 'reportes' ? "bg-siac-green/10 text-siac-green" : "text-gray-500 hover:text-white hover:bg-industrial-800"
            )}
          >
            <FileText className="w-5 h-5" /> Reportes
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all">
            <Activity className="w-5 h-5" /> Seguimiento
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all">
            <Users className="w-5 h-5" /> Usuarios
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all">
            <Settings className="w-5 h-5" /> Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-industrial-800">
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
        <header className="h-16 border-b border-white/10 bg-industrial-900/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0">
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
                  currentView === 'mapa' ? "text-siac-green" : "text-gray-500 group-hover:text-siac-green"
                )} />
                <span className={cn(
                  "transition-colors",
                  currentView === 'mapa' ? "text-siac-green" : "text-white hover:text-siac-green"
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
                  currentView === 'reportes' ? "text-siac-green" : "text-gray-500 group-hover:text-siac-green"
                )} />
                <span className={cn(
                  "transition-colors",
                  currentView === 'reportes' ? "text-siac-green" : "text-white hover:text-siac-green"
                )}
                >
                  Reportes
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Icons */}
          <div className="hidden lg:flex items-center bg-industrial-800/50 px-4 py-1.5 rounded-full border border-white/5 gap-6">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={cn(
                "transition-all",
                currentView === 'dashboard' ? "text-siac-green" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-white transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              onClick={() => setCurrentView('mapa')}
              className={cn(
                "transition-all",
                currentView === 'mapa' ? "text-siac-green" : "text-gray-500 hover:text-white"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              onClick={() => setCurrentView('reportes')}
              className={cn(
                "transition-all",
                currentView === 'reportes' ? "text-siac-green" : "text-gray-500 hover:text-white"
              )}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-white transition-all">
              <Clock className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-white transition-all">
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
                <button className="p-2 text-gray-400 group-hover:text-white transition-colors bg-industrial-800/50 rounded-lg border border-white/5">
                  <Bell className="w-4 h-4" />
                </button>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-siac-blocked text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-industrial-900">2</span>
              </div>
            </div>

            <div className="w-px h-6 bg-white/10 hidden sm:block" />

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-right">
                <div className="text-xs font-bold text-white leading-none">Administrador</div>
                <div className="text-[10px] text-gray-500 font-medium">Soporte Técnico</div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-siac-green p-0.5 overflow-hidden">
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
                      <MapIcon className="w-5 h-5 text-siac-green" /> Mapa de Instalaciones
                    </h3>
                    <button className="p-2 hover:bg-industrial-800 rounded-lg transition-colors text-gray-500 hover:text-white">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="aspect-video bg-industrial-900 rounded-2xl border border-white/5 relative overflow-hidden group">
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
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-10 group"
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPin(pin);
                          }}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-industrial-950 border border-white/10 rounded text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {pin.id || 'N/A'}
                          </div>

                          <div className="relative">
                            {/* Status Ping Animation for Active/Alarmed states */}
                            {(pin.estado === 'Alarmado' || pin.estado === 'Armado') && (
                              <div className={cn(
                                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full animate-ping opacity-20",
                                pin.estado === 'Alarmado' ? "bg-siac-alarmed" : "bg-siac-armed"
                              )} />
                            )}

                            {/* PIN SHAPE (Gota) */}
                            <div className={cn(
                              "relative w-8 h-10 transition-all duration-300 transform drop-shadow-lg",
                              selectedPin?.id === pin.id ? "scale-125 -translate-y-1" : "hover:scale-110 hover:-translate-y-1"
                            )}>
                              <svg viewBox="0 0 24 30" className="w-full h-full drop-shadow-md">
                                <path 
                                  d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" 
                                  className={cn(
                                    "transition-colors duration-300",
                                    pin.estado === 'Apagado' ? "fill-siac-off" :
                                    pin.estado === 'Armado' ? "fill-siac-armed" :
                                    pin.estado === 'Activo' ? "fill-siac-active" :
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
                        <div className="w-1 h-3 bg-siac-armed rounded-full" />
                        LEYENDA
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {[
                          { label: 'Apagado', color: 'bg-siac-off' },
                          { label: 'Armado', color: 'bg-siac-armed' },
                          { label: 'Activo', color: 'bg-siac-active' },
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
                          className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[450px] bg-industrial-900/95 backdrop-blur-xl border border-white/10 rounded-2xl z-40 shadow-2xl overflow-hidden"
                        >
                          {/* CCTV Header */}
                          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-industrial-950/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-siac-blocked animate-pulse" />
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
                            <div className="absolute top-4 left-4 text-[10px] font-mono text-siac-armed/80">
                              REC ● 24-04-2026 16:32:11
                            </div>
                            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-siac-armed/80">
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
                                selectedPin.estado === 'Alarmado' ? "text-siac-blocked" : "text-siac-armed"
                              )}>{selectedPin.estado.toUpperCase()}</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[8px] text-gray-500 uppercase font-bold">Tipo</span>
                              <div className="text-[10px] font-bold text-gray-200">{selectedPin.tipo.toUpperCase()}</div>
                            </div>
                            <div className="flex items-end justify-end">
                              <button className="px-3 py-1.5 bg-siac-armed text-industrial-950 text-[10px] font-bold rounded-lg hover:brightness-110 transition-all">
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
                    <Cpu className="w-5 h-5 text-siac-green" /> Instalaciones
                  </h3>
                  <div className="bg-industrial-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-auto max-h-[400px] xl:max-h-none xl:h-[calc(100%-40px)]">
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
                              (pin.estado === 'Alarmado' || pin.estado === 'Bloqueado')
                                ? "bg-siac-blocked/10 text-siac-blocked border-siac-blocked/20" 
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
                          className="w-full bg-industrial-900 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-armed sm:w-48 lg:w-64"
                        />
                      </div>
                      <button className="bg-siac-armed text-industrial-950 px-3 md:px-4 py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all">
                        Exportar
                      </button>
                    </div>
                  </div>

                  <div className="bg-industrial-900 border border-white/5 rounded-2xl overflow-hidden">
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
                          <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
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
                              className="border-b border-white/5 hover:bg-white/5 transition-colors group"
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
          ) : (
            <ReportsView isSearching={isSearching} setIsSearching={setIsSearching} />
          )}
        </div>
      </main>
    </div>
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
