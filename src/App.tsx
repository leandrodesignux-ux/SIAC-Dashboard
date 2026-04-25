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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<DeviceType | 'Todos'>('Todos');
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
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-siac-green/10 text-siac-green rounded-lg font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all">
            <MapIcon className="w-5 h-5" /> Mapa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all relative">
            <Bell className="w-5 h-5" /> Alarmas
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-siac-blocked text-white text-[10px] flex items-center justify-center rounded-full font-bold">7</span>
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
              <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Dashboard</span>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-white text-sm font-bold uppercase tracking-widest">Reportes</span>
            </div>
          </div>

          {/* Center Navigation Icons */}
          <div className="hidden lg:flex items-center bg-industrial-800/50 px-4 py-1.5 rounded-full border border-white/5 gap-6">
            <button className="text-siac-green hover:brightness-110 transition-all">
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button className="text-gray-500 hover:text-white transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button className="text-gray-500 hover:text-white transition-all">
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
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
