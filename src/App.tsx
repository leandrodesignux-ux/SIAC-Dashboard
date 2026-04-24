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
  Maximize2
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
  { id: 'p1', x: 20, y: 30, tipo: 'Cámara', estado: 'Armado', nombre: 'CAM-01' },
  { id: 'p2', x: 45, y: 25, tipo: 'Infrarrojo', estado: 'Alarmado', nombre: 'INF-02' },
  { id: 'p3', x: 70, y: 40, tipo: 'PIR', estado: 'Des-armado', nombre: 'PIR-05' },
  { id: 'p4', x: 30, y: 65, tipo: 'GW', estado: 'Armado', nombre: 'GW-ALPHA' },
  { id: 'p5', x: 60, y: 75, tipo: 'Activo', estado: 'Bloqueado', nombre: 'ACT-99' },
  { id: 'p6', x: 85, y: 20, tipo: 'Cámara', estado: 'Apagado', nombre: 'CAM-08' },
];

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-industrial-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-siac-green/20 via-transparent to-transparent" />
        <div className="grid grid-cols-12 h-full w-full border-siac-green/5 border">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-siac-green/5 border" />
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
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-white leading-tight">
              Sistema Inteligente <br />
              <span className="text-siac-green">de Monitoreo</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-sm">
              Arquitectura de seguridad avanzada para activos industriales críticos.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-industrial-900 border border-industrial-700 p-4 rounded-xl">
              <div className="text-3xl font-mono text-siac-green">20,347</div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Monitoreos activos</div>
            </div>
            <div className="w-px h-12 bg-industrial-700" />
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
        "bg-industrial-900 border p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden group",
        active ? "border-siac-green ring-1 ring-siac-green/50" : "border-industrial-700 hover:border-industrial-600"
      )}
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 pointer-events-none transition-colors",
        kpi.status === 'ALERTA' ? "bg-siac-red" : kpi.status === 'AVISO' ? "bg-siac-orange" : "bg-siac-green"
      )} />
      
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          kpi.status === 'ALERTA' ? "bg-siac-red/10 text-siac-red" : kpi.status === 'AVISO' ? "bg-siac-orange/10 text-siac-orange" : "bg-siac-green/10 text-siac-green"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-mono font-bold leading-none">
            {kpi.value}<span className="text-gray-600 text-sm">/{kpi.total}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Activos</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-bold text-gray-400 uppercase tracking-tight">{kpi.label}</div>
        <div className="h-1.5 bg-industrial-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(kpi.value / kpi.total) * 100}%` }}
            className={cn(
              "h-full rounded-full",
              kpi.status === 'ALERTA' ? "bg-siac-red" : kpi.status === 'AVISO' ? "bg-siac-orange" : "bg-siac-green"
            )}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-500 font-mono">{Math.round((kpi.value / kpi.total) * 100)}% operativo</span>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            kpi.status === 'ALERTA' ? "bg-siac-red/20 text-siac-red" : kpi.status === 'AVISO' ? "bg-siac-orange/20 text-siac-orange" : "bg-siac-green/20 text-siac-green"
          )}>
            {kpi.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<DeviceType | 'Todos'>('Todos');
  const [alarms, setAlarms] = useState<Alarm[]>(generateAlarms());
  const [pins, setPins] = useState<Pin[]>(INITIAL_PINS);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

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
    if (activeFilter === 'Todos') return alarms;
    return alarms.filter(a => a.tipo === activeFilter);
  }, [alarms, activeFilter]);

  const kpis: KPI[] = [
    { id: 'Cámara', label: 'Cámaras', icon: Camera, value: 12, total: 13, status: 'AVISO', color: 'siac-orange' },
    { id: 'Infrarrojo', label: 'Infrarrojos', icon: Thermometer, value: 9, total: 12, status: 'ALERTA', color: 'siac-red' },
    { id: 'PIR', label: 'PIR', icon: Radio, value: 12, total: 13, status: 'AVISO', color: 'siac-orange' },
    { id: 'GW', label: 'GW', icon: Cpu, value: 11, total: 11, status: 'OK', color: 'siac-green' },
    { id: 'Activo', label: 'Activos', icon: Activity, value: 13, total: 13, status: 'OK', color: 'siac-green' },
  ];

  return (
    <div className="flex h-screen bg-industrial-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-industrial-800 flex flex-col bg-industrial-900/50 backdrop-blur-md">
        <div className="p-6 flex items-center gap-3 border-b border-industrial-800">
          <div className="w-8 h-8 bg-siac-green rounded flex items-center justify-center">
            <ShieldCheck className="text-industrial-950 w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter">SIAC</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-siac-green/10 text-siac-green rounded-lg font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all">
            <MapIcon className="w-5 h-5" /> Mapa
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-industrial-800 rounded-lg font-medium transition-all relative">
            <Bell className="w-5 h-5" /> Alarmas
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-siac-red text-white text-[10px] flex items-center justify-center rounded-full font-bold">7</span>
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
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-siac-red hover:bg-siac-red/5 rounded-lg font-medium transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-industrial-800 bg-industrial-900/30 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-siac-green animate-pulse" />
              <span className="text-xs font-bold text-siac-green uppercase tracking-widest">Sistema Activo</span>
            </div>
            <div className="h-4 w-px bg-industrial-700" />
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Activity className="w-4 h-4" />
              <span>Conectado</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs font-mono text-gray-400">vie, 24 de abr de 2026</div>
              <div className="text-sm font-mono font-bold text-white">4:31:54 p.m.</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-siac-red rounded-full" />
              </div>
              <div className="w-px h-6 bg-industrial-700 mx-2" />
              <div className="flex items-center gap-3 bg-industrial-800/50 p-1.5 pr-4 rounded-full border border-industrial-700">
                <div className="w-8 h-8 rounded-full bg-siac-green flex items-center justify-center text-industrial-950 font-bold text-xs">AD</div>
                <div className="text-xs">
                  <div className="font-bold text-white">Administrador</div>
                  <div className="text-gray-500 text-[10px]">admin@siac.mx</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {kpis.map(kpi => (
              <KPICard 
                key={kpi.id} 
                kpi={kpi} 
                active={activeFilter === kpi.id} 
                onClick={() => setActiveFilter(activeFilter === kpi.id ? 'Todos' : kpi.id)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Container */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-siac-green" /> Mapa de Instalaciones
                </h3>
                <button className="p-2 hover:bg-industrial-800 rounded-lg transition-colors text-gray-500 hover:text-white">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="aspect-video bg-industrial-900 rounded-2xl border border-industrial-800 relative overflow-hidden group">
                {/* Simulated Grid/Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,255,157,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(10,10,10,0.8)_100%)]" />
                
                {/* Map Pins */}
                <AnimatePresence>
                  {pins.map(pin => (
                    <motion.div
                      key={pin.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                      onClick={() => setSelectedPin(pin)}
                    >
                      <motion.div 
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all",
                          pin.estado === 'Alarmado' ? "bg-siac-red animate-pulse ring-4 ring-siac-red/30" : 
                          pin.estado === 'Armado' ? "bg-siac-green ring-4 ring-siac-green/30" : 
                          pin.estado === 'Des-armado' ? "bg-siac-orange ring-4 ring-siac-orange/30" : 
                          "bg-gray-600 ring-4 ring-gray-600/30"
                        )}
                        whileHover={{ scale: 1.5 }}
                      >
                        {pin.tipo === 'Cámara' && <Camera className="w-3 h-3 text-industrial-950" />}
                        {pin.tipo === 'Infrarrojo' && <Thermometer className="w-3 h-3 text-industrial-950" />}
                        {pin.tipo === 'PIR' && <Radio className="w-3 h-3 text-industrial-950" />}
                        {pin.tipo === 'GW' && <Cpu className="w-3 h-3 text-industrial-950" />}
                        {pin.tipo === 'Activo' && <Activity className="w-3 h-3 text-industrial-950" />}
                      </motion.div>
                      <div className="mt-2 whitespace-nowrap bg-industrial-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono border border-industrial-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        {pin.nombre}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 bg-industrial-950/80 backdrop-blur-md p-4 rounded-xl border border-industrial-800 text-[10px] space-y-2 z-20">
                  <div className="font-bold text-gray-500 uppercase tracking-widest mb-2">Leyenda</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500" /> Apagado</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-siac-green" /> Armado</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-siac-orange" /> Des-armado</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-siac-red" /> Alarmado</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-siac-blue" /> Bloqueado</div>
                </div>

                {/* Selected Pin Info */}
                <AnimatePresence>
                  {selectedPin && (
                    <motion.div 
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      className="absolute top-6 right-6 bottom-6 w-64 bg-industrial-900/95 backdrop-blur-xl border-l border-industrial-700 p-6 z-30 shadow-2xl"
                    >
                      <button 
                        onClick={() => setSelectedPin(null)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white"
                      >
                        <LogOut className="w-4 h-4 rotate-180" />
                      </button>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            selectedPin.estado === 'Alarmado' ? "bg-siac-red/20 text-siac-red" : "bg-siac-green/20 text-siac-green"
                          )}>
                            <Activity className="w-6 h-6" />
                          </div>
                          <h4 className="text-xl font-bold">{selectedPin.nombre}</h4>
                          <p className="text-xs text-gray-500 font-mono">ID: {selectedPin.id.toUpperCase()}</p>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-industrial-800 p-3 rounded-lg">
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tipo</div>
                              <div className="text-sm font-medium">{selectedPin.tipo}</div>
                            </div>
                            <div className="bg-industrial-800 p-3 rounded-lg">
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado</div>
                              <div className="text-sm font-medium">{selectedPin.estado}</div>
                            </div>
                          </div>
                          <div className="bg-industrial-800 p-3 rounded-lg">
                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ubicación</div>
                            <div className="text-sm font-medium">Zona Norte - Sector B-12</div>
                          </div>
                        </div>
                        <button className="w-full bg-siac-green text-industrial-950 font-bold py-3 rounded-lg text-sm">
                          Ver Cámara en Vivo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Installation Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Cpu className="w-5 h-5 text-siac-green" /> Instalaciones
              </h3>
              <div className="bg-industrial-900 border border-industrial-800 rounded-2xl overflow-hidden flex flex-col h-[calc(100%-40px)]">
                <div className="p-4 border-b border-industrial-800 bg-industrial-800/30">
                  <div className="grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Nombre</span>
                    <span className="text-center">Estado</span>
                    <span className="text-right">Último Dato</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {['Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste'].map((zona, i) => (
                    <div key={zona} className="p-4 border-b border-industrial-800 hover:bg-industrial-800/50 transition-colors grid grid-cols-3 items-center text-sm">
                      <div className="font-medium">{zona}</div>
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          i === 1 ? "bg-siac-red/10 text-siac-red border border-siac-red/20" : "bg-siac-green/10 text-siac-green border border-siac-green/20"
                        )}>
                          {i === 1 ? 'Alarmado' : 'Activo'}
                        </span>
                      </div>
                      <div className="text-right text-gray-500 font-mono text-xs">23-08-2024</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-industrial-800/20 border-t border-industrial-800 flex justify-between items-center text-xs">
                  <span className="text-gray-500">1-4 de 4</span>
                  <div className="flex gap-2">
                    <button className="w-6 h-6 rounded bg-industrial-800 flex items-center justify-center text-gray-500 hover:text-white">1</button>
                    <button className="w-6 h-6 rounded hover:bg-industrial-800 flex items-center justify-center text-gray-500 hover:text-white">2</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alarm Console */}
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-siac-red" /> Listado de Alarmas
                <span className="bg-siac-red/10 text-siac-red px-2 py-0.5 rounded-full text-xs font-mono">{filteredAlarms.length} eventos</span>
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Escribe algo..." 
                    className="bg-industrial-900 border border-industrial-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-siac-green w-64"
                  />
                </div>
                <button className="bg-siac-green text-industrial-950 px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all">
                  BUSCAR
                </button>
              </div>
            </div>

            <div className="bg-industrial-900 border border-industrial-800 rounded-2xl overflow-hidden">
              <div className="p-4 bg-industrial-800/30 border-b border-industrial-800 flex gap-2">
                {['Todos', 'Cámara', 'Infrarrojo', 'PIR', 'GW', 'Activo'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      activeFilter === filter 
                        ? "bg-siac-green text-industrial-950 border-siac-green" 
                        : "bg-industrial-800 text-gray-400 border-industrial-700 hover:border-gray-600"
                    )}
                  >
                    {filter === 'Todos' ? filter : filter + 's'}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-industrial-800 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Dispositivo</th>
                      <th className="px-6 py-4">Tipo</th>
                      <th className="px-6 py-4">Ubicación</th>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode='popLayout'>
                      {filteredAlarms.map((alarm) => (
                        <motion.tr 
                          key={alarm.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-industrial-800 hover:bg-industrial-800/30 transition-colors group"
                        >
                          <td className="px-6 py-4 text-xs font-mono text-gray-400">{alarm.fecha}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                              alarm.estado === 'RESUELTO' 
                                ? "bg-siac-green/10 text-siac-green border-siac-green/20" 
                                : "bg-siac-orange/10 text-siac-orange border-siac-orange/20"
                            )}>
                              {alarm.estado === 'RESUELTO' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {alarm.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">{alarm.dispositivo}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {alarm.tipo === 'Cámara' && <Camera className="w-3.5 h-3.5" />}
                              {alarm.tipo === 'Infrarrojo' && <Thermometer className="w-3.5 h-3.5" />}
                              {alarm.tipo === 'PIR' && <Radio className="w-3.5 h-3.5" />}
                              {alarm.tipo === 'GW' && <Cpu className="w-3.5 h-3.5" />}
                              {alarm.tipo === 'Activo' && <Activity className="w-3.5 h-3.5" />}
                              {alarm.tipo}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">{alarm.ubicacion}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">{alarm.descripcion}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-siac-green text-[10px] font-bold hover:underline">Ver</button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
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
