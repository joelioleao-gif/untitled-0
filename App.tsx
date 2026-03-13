import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  DollarSign,
  FileText,
  User as UserIcon,
  Bell,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InvestmentRequest, RequestStatus, User } from './types';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock User (In a real app, this would come from Auth)
const CURRENT_USER: User = {
  id: '1',
  name: 'Joelio Leão',
  email: 'joelio.leao@mercadolivre.com',
  role: 'admin'
};

export default function App() {
  const [requests, setRequests] = useState<InvestmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<InvestmentRequest | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentView, setCurrentView] = useState<'dashboard' | 'monitoring' | 'new-request'>('dashboard');
  const [formStep, setFormStep] = useState(1);
  const [pickingTypes, setPickingTypes] = useState<string[]>([]);
  const [executingTeams, setExecutingTeams] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedFormTeam, setSelectedFormTeam] = useState('');
  const [selectedFormCategory, setSelectedFormCategory] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    startDate: '',
    endDate: '',
    site: '',
    pickingType: '',
    filterByAmount: false,
    minAmount: '',
    maxAmount: '',
    inPlan: 'all' as 'all' | 'yes' | 'no',
    status: 'all' as 'all' | RequestStatus
  });

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: '1',
      category: 'Procesos y Aprobaciones',
      title: 'Tienes una aprobación pendiente',
      subtitle: 'Solicitud de aprobación del ticket 51194249',
      time: '11:01',
      isRead: false,
      hasAction: true,
    },
    {
      id: '2',
      category: 'Procesos y Aprobaciones',
      title: 'Inversión Rechazada',
      subtitle: 'Su solicitud para "Expansão de Servidores" fue rechazada. Revise y reenvíe.',
      time: 'Ayer',
      isRead: false,
      hasAction: true,
    },
    {
      id: '3',
      category: 'Procesos y Aprobaciones',
      title: 'Tienes una aprobación pendiente',
      subtitle: 'Solicitud de aprobación del ticket 51096828',
      time: '9/3',
      isRead: true,
      hasAction: true,
    }
  ]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const [language, setLanguage] = useState<'Español' | 'Português' | 'Inglês'>('Español');
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['capex']);

  const translations = {
    Español: {
      greeting: '¡Hola',
      monitoreo: 'Monitoreo',
      nuevoPedido: 'Nuevo Pedido',
      extraCapex: 'Solicitar Extra CAPEX',
      solicitudes: 'Solicitudes',
      administracion: 'Administración',
      gestionUsuarios: 'Gestión de Usuarios',
      nuevoUsuario: 'Nuevo Usuario',
      userManagement: 'Gestión de Usuarios',
      miPerfil: 'Mi perfil',
      misAprobaciones: 'Mis aprobaciones',
      salir: 'Salir',
      idioma: 'Idioma',
      totalSolicitado: 'Total Solicitado',
      pendientes: 'Pendientes',
      aprovados: 'Aprobados',
      rejeitados: 'Rechazados',
      todos: 'Todos',
      buscar: 'Buscar solicitud...',
      novaSolicitacao: 'Nueva Solicitud',
      sincronizando: 'Sincronizando con BigQuery...',
      idTitulo: 'ID',
      fechaCreacion: 'Fecha de creación',
      site: 'Site',
      pickingType: 'Picking Type',
      proyecto: 'Proyecto',
      equipoEjecutor: 'Equipo Ejecutor',
      montoSolicitado: 'Monto Solicitado',
      status: 'Estado',
      solicitante: 'Solicitante',
      valor: 'Valor',
      data: 'Fecha',
      nenhumaSolicitacao: 'No se encontraron solicitudes.',
      detalhes: 'Detalles de la Solicitud',
      categoria: 'Categoría',
      descricao: 'Descripción',
      aprovar: 'Aprobar Inversión',
      rejeitar: 'Rechazar',
      motivoRejeicao: 'Motivo del rechazo:',
      por: 'Por',
      em: 'en',
      extraCapexEnviado: 'Solicitud de Extra CAPEX de R$',
      enviadaParaProjeto: 'enviada para el proyecto:',
      novaSolicitacaoTitulo: 'Nueva Solicitud de Inversión',
      tituloInvestimento: 'Título de la Inversión',
      exExpansao: 'Ej: Expansión de Servidores',
      descricaoDetalhada: 'Descripción Detallada',
      placeholderDescricao: 'Describa la necesidad y el retorno esperado de la inversión...',
      enviarSolicitacao: 'Enviar Solicitud',
      maisInfo: 'Más Info',
      infraestrutura: 'Infraestructura',
      software: 'Software',
      treinamento: 'Capacitación',
      marketing: 'Marketing',
      outros: 'Otros',
      shippingCapex: 'Shipping CAPEX',
      erroAtualizar: 'Error al actualizar en BigQuery',
      erroCriar: 'Error al criar la solicitud',
      falhaCarregar: 'Error al cargar datos de BigQuery',
      erroConectar: 'Error al conectar con BigQuery. Verifique las credenciales en el backend.',
      notificaciones: 'Notificaciones',
      marcarTodasLeidas: 'Marcar todas como leídas',
      todas: 'Todas',
      conAccionesPendientes: 'Con acciones pendientes',
      sinNotificaciones: 'No tienes notificaciones por el momento',
      vistaSoloLectura: 'Vista de solo lectura de todas las solicitudes de inversión.',
      filtrosAvanzados: 'Filtros Avanzados',
      aplicarFiltros: 'Aplicar Filtros',
      limpiarFiltros: 'Limpiar',
      filtrarPorMonto: '¿Filtrar por montos?',
      enPlano: '¿Está en plano?',
      si: 'Sí',
      no: 'No',
      montoMinimo: 'Monto Mínimo',
      montoMaximo: 'Monto Máximo',
      fechaInicio: 'Fecha Inicio',
      fechaFin: 'Fecha Fin',
      cancelar: 'Cancelar',
      subcategoria: 'Subcategoría',
      continuar: 'Continuar',
      datosInversion: 'Completa los datos donde vamos a invertir:',
    },
    Português: {
      greeting: 'Olá',
      monitoreo: 'Monitoramento',
      nuevoPedido: 'Novo Pedido',
      extraCapex: 'Solicitar Extra CAPEX',
      solicitudes: 'Solicitações',
      administracion: 'Administração',
      gestionUsuarios: 'Gestão de Usuários',
      nuevoUsuario: 'Novo Usuário',
      userManagement: 'Gerenciamento de Usuários',
      miPerfil: 'Meu perfil',
      misAprobaciones: 'Minhas aprovações',
      salir: 'Sair',
      idioma: 'Idioma',
      totalSolicitado: 'Total Solicitado',
      pendientes: 'Pendentes',
      aprovados: 'Aprovados',
      rejeitados: 'Rejeitados',
      todos: 'Todos',
      buscar: 'Buscar solicitação...',
      novaSolicitacao: 'Nova Solicitação',
      sincronizando: 'Sincronizando com BigQuery...',
      idTitulo: 'ID',
      fechaCreacion: 'Data de criação',
      site: 'Site',
      pickingType: 'Picking Type',
      proyecto: 'Projeto',
      equipoEjecutor: 'Equipe Executora',
      montoSolicitado: 'Valor Solicitado',
      status: 'Status',
      solicitante: 'Solicitante',
      valor: 'Valor',
      data: 'Data',
      nenhumaSolicitacao: 'Nenhuma solicitação encontrada.',
      detalhes: 'Detalhes da Solicitação',
      categoria: 'Categoria',
      descricao: 'Descrição',
      aprovar: 'Aprovar Investimento',
      rejeitar: 'Rejeitar',
      motivoRejeicao: 'Motivo da rejeição:',
      por: 'Por',
      em: 'em',
      extraCapexEnviado: 'Solicitação de Extra CAPEX de R$',
      enviadaParaProjeto: 'enviada para o projeto:',
      novaSolicitacaoTitulo: 'Nova Solicitação de Investimento',
      tituloInvestimento: 'Título do Investimento',
      exExpansao: 'Ex: Expansão de Servidores',
      descricaoDetalhada: 'Descrição Detalhada',
      placeholderDescricao: 'Descreva a necessidade e o retorno esperado do investimento...',
      enviarSolicitacao: 'Enviar Solicitação',
      maisInfo: 'Mais Info',
      infraestrutura: 'Infraestrutura',
      software: 'Software',
      treinamento: 'Treinamento',
      marketing: 'Marketing',
      outros: 'Outros',
      shippingCapex: 'Shipping CAPEX',
      erroAtualizar: 'Erro ao atualizar no BigQuery',
      erroCriar: 'Erro ao criar solicitação',
      falhaCarregar: 'Falha ao carregar dados do BigQuery',
      erroConectar: 'Erro ao conectar com o BigQuery. Verifique as credenciais no backend.',
      notificaciones: 'Notificações',
      marcarTodasLeidas: 'Marcar todas como lidas',
      todas: 'Todas',
      conAccionesPendientes: 'Com ações pendentes',
      sinNotificaciones: 'Você não tem notificações no momento',
      vistaSoloLectura: 'Vista de apenas leitura de todas as solicitações de investimento.',
      filtrosAvanzados: 'Filtros Avançados',
      aplicarFiltros: 'Aplicar Filtros',
      limpiarFiltros: 'Limpar',
      filtrarPorMonto: 'Filtrar por valores?',
      enPlano: 'Está no plano?',
      si: 'Sim',
      no: 'Não',
      montoMinimo: 'Valor Mínimo',
      montoMaximo: 'Valor Máximo',
      fechaInicio: 'Data Início',
      fechaFin: 'Data Fim',
      cancelar: 'Cancelar',
      subcategoria: 'Subcategoria',
      continuar: 'Continuar',
      datosInversion: 'Complete os dados onde vamos investir:',
    },
    Inglês: {
      greeting: 'Hello',
      monitoreo: 'Monitoring',
      nuevoPedido: 'New Request',
      extraCapex: 'Request Extra CAPEX',
      solicitudes: 'Requests',
      administracion: 'Administration',
      gestionUsuarios: 'User Management',
      nuevoUsuario: 'New User',
      userManagement: 'User Management',
      miPerfil: 'My profile',
      misAprobaciones: 'My approvals',
      salir: 'Logout',
      idioma: 'Language',
      totalSolicitado: 'Total Requested',
      pendientes: 'Pending',
      aprovados: 'Approved',
      rejeitados: 'Rejected',
      todos: 'All',
      buscar: 'Search request...',
      novaSolicitacao: 'New Request',
      sincronizando: 'Syncing with BigQuery...',
      idTitulo: 'ID',
      fechaCreacion: 'Creation Date',
      site: 'Site',
      pickingType: 'Picking Type',
      proyecto: 'Project',
      equipoEjecutor: 'Executing Team',
      montoSolicitado: 'Requested Amount',
      status: 'Status',
      solicitante: 'Requester',
      valor: 'Amount',
      data: 'Date',
      nenhumaSolicitacao: 'No requests found.',
      detalhes: 'Request Details',
      categoria: 'Category',
      descricao: 'Description',
      aprovar: 'Approve Investment',
      rejeitar: 'Reject',
      motivoRejeicao: 'Reason for rejection:',
      por: 'By',
      em: 'on',
      extraCapexEnviado: 'Extra CAPEX request of R$',
      enviadaParaProjeto: 'sent for the project:',
      novaSolicitacaoTitulo: 'New Investment Request',
      tituloInvestimento: 'Investment Title',
      exExpansao: 'Ex: Server Expansion',
      descricaoDetalhada: 'Detailed Description',
      placeholderDescricao: 'Describe the need and expected return on investment...',
      enviarSolicitacao: 'Send Request',
      maisInfo: 'More Info',
      infraestrutura: 'Infrastructure',
      software: 'Software',
      treinamento: 'Training',
      marketing: 'Marketing',
      outros: 'Others',
      shippingCapex: 'Shipping CAPEX',
      erroAtualizar: 'Error updating in BigQuery',
      erroCriar: 'Error creating request',
      falhaCarregar: 'Failed to load data from BigQuery',
      erroConectar: 'Error connecting to BigQuery. Check credentials in the backend.',
      notificaciones: 'Notifications',
      marcarTodasLeidas: 'Mark all as read',
      todas: 'All',
      conAccionesPendientes: 'With pending actions',
      sinNotificaciones: 'You have no notifications at the moment',
      vistaSoloLectura: 'Read-only view of all investment requests.',
      filtrosAvanzados: 'Advanced Filters',
      aplicarFiltros: 'Apply Filters',
      limpiarFiltros: 'Clear',
      filtrarPorMonto: 'Filter by amounts?',
      enPlano: 'Is in plan?',
      si: 'Yes',
      no: 'No',
      montoMinimo: 'Min Amount',
      montoMaximo: 'Max Amount',
      fechaInicio: 'Start Date',
      fechaFin: 'End Date',
      cancelar: 'Cancel',
      subcategoria: 'Subcategory',
      continuar: 'Continue',
      datosInversion: 'Complete the data where we are going to invest:',
    }
  };

  const t = translations[language];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || t.erroConectar);
      }
      const data = await response.json();
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.erroConectar);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchPickingTypes = async () => {
      try {
        const response = await fetch('/api/picking-types');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Picking types fetch failed:', errorData.details);
          return;
        }
        const data = await response.json();
        setPickingTypes(data);
      } catch (error) {
        console.error('Error fetching picking types:', error);
      }
    };
    fetchPickingTypes();
  }, []);

  useEffect(() => {
    const fetchExecutingTeams = async () => {
      try {
        const response = await fetch('/api/executing-teams');
        if (!response.ok) return;
        const data = await response.json();
        setExecutingTeams(data);
      } catch (error) {
        console.error('Error fetching executing teams:', error);
      }
    };
    fetchExecutingTeams();
  }, []);

  useEffect(() => {
    if (!selectedFormTeam) {
      setCategories([]);
      return;
    }
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories?team=${encodeURIComponent(selectedFormTeam)}`);
        if (!response.ok) return;
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [selectedFormTeam]);

  useEffect(() => {
    if (!selectedFormTeam || !selectedFormCategory) {
      setSubcategories([]);
      return;
    }
    const fetchSubcategories = async () => {
      try {
        const params = new URLSearchParams({ team: selectedFormTeam, category: selectedFormCategory });
        const response = await fetch(`/api/subcategories?${params}`);
        if (!response.ok) return;
        const data = await response.json();
        setSubcategories(data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubcategories();
  }, [selectedFormTeam, selectedFormCategory]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Basic filters
      const matchesTab = activeTab === 'all' || req.status === activeTab;
      const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.executingTeam?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesTab || !matchesSearch) return false;

      // Advanced filters
      if (advancedFilters.site && req.site !== advancedFilters.site) return false;
      if (advancedFilters.pickingType && req.pickingType !== advancedFilters.pickingType) return false;
      if (advancedFilters.status !== 'all' && req.status !== advancedFilters.status) return false;
      
      if (advancedFilters.inPlan !== 'all') {
        const inPlanBool = advancedFilters.inPlan === 'yes';
        if (req.inPlan !== inPlanBool) return false;
      }

      if (advancedFilters.startDate) {
        if (new Date(req.createdAt) < new Date(advancedFilters.startDate)) return false;
      }
      if (advancedFilters.endDate) {
        const endDate = new Date(advancedFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (new Date(req.createdAt) > endDate) return false;
      }

      if (advancedFilters.filterByAmount) {
        if (advancedFilters.minAmount && req.amount < Number(advancedFilters.minAmount)) return false;
        if (advancedFilters.maxAmount && req.amount > Number(advancedFilters.maxAmount)) return false;
      }

      return true;
    });
  }, [requests, activeTab, searchQuery, advancedFilters]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'pending');
    const approved = requests.filter(r => r.status === 'approved');
    const rejected = requests.filter(r => r.status === 'rejected');

    return {
      total: {
        count: requests.length,
        amount: requests.reduce((acc, req) => acc + req.amount, 0)
      },
      pending: {
        count: pending.length,
        amount: pending.reduce((acc, req) => acc + req.amount, 0)
      },
      approved: {
        count: approved.length,
        amount: approved.reduce((acc, req) => acc + req.amount, 0)
      },
      rejected: {
        count: rejected.length,
        amount: rejected.reduce((acc, req) => acc + req.amount, 0)
      },
    };
  }, [requests]);

  const handleStatusChange = async (id: string, status: RequestStatus, comments?: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comments,
          updatedAt: new Date().toISOString(),
          approver: { name: CURRENT_USER.name, email: CURRENT_USER.email }
        })
      });

      if (!response.ok) throw new Error(t.erroAtualizar);
      
      await fetchRequests(); // Refresh list
      setSelectedRequest(null);
    } catch (err) {
      alert(t.erroAtualizar);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReq = {
      id: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      subCategory: formData.get('subCategory') as string,
      site: formData.get('site') as string,
      pickingType: formData.get('pickingType') as string,
      executingTeam: formData.get('executingTeam') as string,
      requester: { name: CURRENT_USER.name, email: CURRENT_USER.email },
      status: 'pending' as RequestStatus,
      inPlan: formData.get('inPlan') === 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });

      if (!response.ok) throw new Error(t.erroCriar);
      
      await fetchRequests();
      setSelectedFormTeam('');
      setSelectedFormCategory('');
      setCurrentView('dashboard');
    } catch (err) {
      alert(t.erroCriar);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ebebeb]">
      {/* Sidebar - Mercado Libre Backoffice Style */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 top-12 bg-black/40 backdrop-blur-sm z-[51]"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-[55] flex flex-col pointer-events-none"
            >
              {/* Sidebar Header - Transparent to show existing header */}
              <div className="h-12 flex items-center bg-transparent pointer-events-none">
                <div className="w-12 h-12" /> {/* Spacer for the button in the header */}
              </div>

              {/* Sidebar Body */}
              <div className="flex-1 bg-[#f7f7f7] shadow-2xl flex flex-col pointer-events-auto border-r border-zinc-200">
                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto py-6">
                {/* Section: Shipping CAPEX */}
                <div className="px-6 mb-8">
                  <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">{t.shippingCapex}</h3>
                  
                  {/* Menu Item: Solicitudes */}
                  <div className="mb-2">
                    <button 
                      onClick={() => toggleMenu('solicitudes')}
                      className="w-full flex items-center justify-between py-2 text-zinc-600 hover:text-zinc-900 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <FileText size={22} className="text-zinc-400 group-hover:text-zinc-600" />
                        <span className="text-[15px] font-medium">{t.solicitudes}</span>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={cn("transition-transform duration-200", expandedMenus.includes('solicitudes') ? "rotate-90" : "")} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedMenus.includes('solicitudes') && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-10 space-y-1 mt-1"
                        >
                          <button 
                            onClick={() => { setCurrentView('monitoring'); setIsSidebarOpen(false); }}
                            className={cn(
                              "w-full text-left py-2 text-[14px] transition-colors",
                              currentView === 'monitoring' ? "text-zinc-900 font-bold" : "text-zinc-500 hover:text-zinc-900"
                            )}
                          >
                            {t.monitoreo}
                          </button>
                          <button 
                            onClick={() => { 
                              setCurrentView('new-request');
                              setFormStep(1);
                              setSelectedFormTeam('');
                              setSelectedFormCategory('');
                              setIsSidebarOpen(false); 
                            }}
                            className="w-full text-left py-2 text-[14px] text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            {t.nuevoPedido}
                          </button>
                          <button 
                            onClick={() => { setCurrentView('dashboard'); setActiveTab('approved'); setIsSidebarOpen(false); }}
                            className="w-full text-left py-2 text-[14px] text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            {t.extraCapex}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Section: Administración */}
                <div className="px-6 mb-8">
                  <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-4">{t.administracion}</h3>
                  
                  {/* Menu Item: Gestión de Usuários */}
                  <div className="mb-2">
                    <button 
                      onClick={() => toggleMenu('users_admin')}
                      className="w-full flex items-center justify-between py-2 text-zinc-600 hover:text-zinc-900 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <UserIcon size={22} className="text-zinc-400 group-hover:text-zinc-600" />
                        <span className="text-[15px] font-medium">{t.gestionUsuarios}</span>
                      </div>
                      <ChevronRight 
                        size={16} 
                        className={cn("transition-transform duration-200", expandedMenus.includes('users_admin') ? "rotate-90" : "")} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedMenus.includes('users_admin') && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-10 space-y-1 mt-1"
                        >
                          <button className="w-full text-left py-2 text-[14px] text-zinc-500 hover:text-zinc-900 transition-colors">{t.nuevoUsuario}</button>
                          <button className="w-full text-left py-2 text-[14px] text-zinc-500 hover:text-zinc-900 transition-colors">{t.userManagement}</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-zinc-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                    <UserIcon size={16} className="text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{CURRENT_USER.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{CURRENT_USER.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header - Mercado Libre Style */}
      <header className="bg-[#FFE600] border-b border-zinc-200 sticky top-0 z-[70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 relative z-[60] hover:bg-black/5 rounded-md transition-colors group"
              aria-label="Menu"
            >
              <motion.span
                animate={isSidebarOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-zinc-800 block rounded-full origin-center"
              />
              <motion.span
                animate={isSidebarOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="w-6 h-0.5 bg-zinc-800 block rounded-full"
              />
              <motion.span
                animate={isSidebarOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-6 h-0.5 bg-zinc-800 block rounded-full origin-center"
              />
            </button>
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => { setCurrentView('dashboard'); setActiveTab('all'); }}
            >
              <img 
                src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo__large_plus.png" 
                alt="Mercado Libre" 
                className="h-8 hidden sm:block"
                referrerPolicy="no-referrer"
              />
              <img 
                src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.73/mercadolibre/logo__small.png" 
                alt="Mercado Libre" 
                className="h-8 sm:hidden"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1 cursor-pointer hover:bg-black/5 px-2 py-1 rounded-md transition-all"
            >
              <div className="w-6 h-6 rounded-full border border-zinc-400 flex items-center justify-center">
                <UserIcon size={14} className="text-zinc-600" />
              </div>
              <span className="text-sm text-zinc-800 font-medium">{CURRENT_USER.name.split(' ')[0]}</span>
              <ChevronDown className={cn("text-zinc-500 transition-transform", isUserMenuOpen && "rotate-180")} size={14} />
            </div>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-[320px] bg-white rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-zinc-200 z-50"
                  >
                    {/* Arrow */}
                    <div className="absolute -top-[9px] right-[42px] w-4 h-4 bg-white border-t border-l border-zinc-200 rotate-45 z-50" />
                    
                    {/* User Info Section */}
                    <div className="p-8 flex items-center gap-4 border-b border-zinc-100">
                      <div className="w-16 h-16 rounded-full border border-zinc-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon size={32} className="text-zinc-400" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-xl font-medium text-zinc-900 truncate">{t.greeting} {CURRENT_USER.name.split(' ')[0]}</h3>
                        <p className="text-sm text-zinc-500 truncate">{CURRENT_USER.email}</p>
                      </div>
                    </div>

                    {/* Language Section */}
                    <div className="relative">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLanguageMenuOpen(!isLanguageMenuOpen);
                        }}
                        className="px-8 py-5 flex items-center justify-between border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer group"
                      >
                        <span className="text-[16px] text-zinc-800">{t.idioma}:</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[16px] text-zinc-900">{language}</span>
                          <ChevronDown size={18} className={cn("text-zinc-400 group-hover:text-zinc-600 transition-transform", isLanguageMenuOpen && "rotate-180")} />
                        </div>
                      </div>

                      {/* Language Selection Popover */}
                      <AnimatePresence>
                        {isLanguageMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="absolute right-full top-0 mr-2 w-48 bg-white rounded-lg shadow-2xl border border-zinc-100 z-[60] py-2"
                          >
                            {(['Español', 'Português', 'Inglês'] as const).map((lang) => (
                              <button
                                key={lang}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLanguage(lang);
                                  setIsLanguageMenuOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-6 py-3 text-[16px] transition-colors flex items-center",
                                  language === lang ? "text-[#3483fa] font-medium border-l-4 border-[#3483fa]" : "text-zinc-800 hover:bg-zinc-50"
                                )}
                              >
                                {lang}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Menu Items */}
                    <div className="flex flex-col">
                      <button className="px-8 py-5 text-left text-[16px] text-zinc-800 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                        {t.miPerfil}
                      </button>
                      <button className="px-8 py-5 text-left text-[16px] text-zinc-800 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
                        {t.misAprobaciones}
                      </button>
                      <button className="px-8 py-5 text-left text-[16px] text-zinc-800 hover:bg-zinc-50 transition-colors">
                        {t.salir}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-9 h-9 rounded-full bg-[#3483fa] text-white flex items-center justify-center hover:bg-[#2968c8] transition-all relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#ff4444] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#FFE600] font-bold">
                    {unreadCount > 99 ? '+99' : unreadCount}
                  </div>
                )}
              </button>

              {/* Notifications Popover */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotificationsOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-[480px] bg-white rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-zinc-200 z-50 overflow-hidden"
                    >
                      {/* Arrow */}
                      <div className="absolute -top-[9px] right-[10px] w-4 h-4 bg-white border-t border-l border-zinc-200 rotate-45 z-50" />
                      
                      {/* Header */}
                      <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
                        <h3 className="text-xl font-medium text-zinc-800">{t.notificaciones}</h3>
                        <button 
                          onClick={markAllAsRead}
                          className="text-[#3483fa] text-sm font-medium hover:underline flex items-center gap-1"
                        >
                          <div className="flex -space-x-1">
                            <Check size={14} className="text-[#3483fa]" />
                            <Check size={14} className="text-[#3483fa]" />
                          </div>
                          {t.marcarTodasLeidas}
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-zinc-100 px-6">
                        <button 
                          onClick={() => setNotificationTab('all')}
                          className={cn(
                            "px-4 py-4 text-sm font-medium transition-colors relative",
                            notificationTab === 'all' ? "text-[#3483fa]" : "text-zinc-500 hover:text-zinc-800"
                          )}
                        >
                          {t.todas}
                          {notificationTab === 'all' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3483fa]" />
                          )}
                        </button>
                        <button 
                          onClick={() => setNotificationTab('pending')}
                          className={cn(
                            "px-4 py-4 text-sm font-medium transition-colors relative",
                            notificationTab === 'pending' ? "text-[#3483fa]" : "text-zinc-500 hover:text-zinc-800"
                          )}
                        >
                          {t.conAccionesPendientes}
                          {notificationTab === 'pending' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3483fa]" />
                          )}
                        </button>
                      </div>

                      {/* Content */}
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.filter(n => notificationTab === 'all' || n.hasAction).length > 0 ? (
                          <div className="flex flex-col">
                            {notifications
                              .filter(n => notificationTab === 'all' || n.hasAction)
                              .map((notification) => (
                                <div 
                                  key={notification.id}
                                  onClick={() => markAsRead(notification.id)}
                                  className="px-6 py-5 flex items-start gap-4 hover:bg-zinc-50 transition-colors cursor-pointer border-b border-zinc-50 group"
                                >
                                  {/* Icon */}
                                  <div className="w-12 h-14 bg-[#FFE600] rounded-lg border border-zinc-800 flex flex-col items-center justify-center flex-shrink-0 relative shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                                    <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full absolute top-1.5 right-1.5" />
                                    <div className="w-6 h-0.5 bg-zinc-800 mb-1" />
                                    <div className="w-6 h-0.5 bg-zinc-800 mb-1" />
                                    <div className="w-4 h-0.5 bg-zinc-800 self-start ml-3" />
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded">
                                        {notification.category}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-zinc-400">{notification.time}</span>
                                        {!notification.isRead && (
                                          <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                                        )}
                                      </div>
                                    </div>
                                    <h4 className="text-[15px] font-semibold text-zinc-900 mb-1 truncate">
                                      {notification.title}
                                    </h4>
                                    <p className="text-[14px] text-zinc-500 line-clamp-2">
                                      {notification.subtitle}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                              <Bell size={32} className="text-zinc-300" />
                            </div>
                            <p className="text-zinc-500 text-sm">{t.sinNotificaciones}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentView === 'new-request' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-3xl mx-auto overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (formStep > 1) {
                      setFormStep(prev => prev - 1);
                    } else {
                      setCurrentView('dashboard');
                    }
                  }}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-zinc-900">
                  {formStep === 1 ? t.datosInversion : t.novaSolicitacaoTitulo}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", formStep === 1 ? "bg-zinc-900" : "bg-zinc-200")} />
                <div className={cn("w-2.5 h-2.5 rounded-full", formStep === 2 ? "bg-zinc-900" : "bg-zinc-200")} />
              </div>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              if (formStep === 1) {
                const fd = new FormData(e.currentTarget);
                if (!fd.get('pickingType') || !fd.get('executingTeam') || !fd.get('category') || !fd.get('subCategory')) {
                  alert(t.camposObrigatorios || 'Preencha todos os campos obrigatórios.');
                  return;
                }
                setFormStep(2);
              } else {
                const fd = new FormData(e.currentTarget);
                if (!fd.get('title') || !fd.get('site') || !fd.get('amount') || !fd.get('description')) {
                  alert(t.camposObrigatorios || 'Preencha todos os campos obrigatórios.');
                  return;
                }
                handleCreateRequest(e);
              }
            }}>
              <div className={formStep !== 1 ? 'hidden' : 'space-y-6'}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.pickingType}</label>
                      <select
                        name="pickingType"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white transition-all"
                      >
                        <option value="">Seleccione...</option>
                        {pickingTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.equipoEjecutor}</label>
                      <select
                        name="executingTeam"
                        value={selectedFormTeam}
                        onChange={(e) => {
                          setSelectedFormTeam(e.target.value);
                          setCategories([]);
                          setSelectedFormCategory('');
                          setSubcategories([]);
                        }}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all bg-white"
                      >
                        <option value="">Seleccione...</option>
                        {executingTeams.map(team => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.categoria}</label>
                      <select
                        name="category"
                        value={selectedFormCategory}
                        onChange={(e) => {
                          setSelectedFormCategory(e.target.value);
                          setSubcategories([]);
                        }}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white transition-all"
                      >
                        <option value="">Seleccione...</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.subcategoria}</label>
                      <select
                        name="subCategory"
                        disabled={!selectedFormCategory}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{selectedFormCategory ? 'Seleccione...' : 'Seleccione una categoría primero'}</option>
                        {subcategories.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              <div className={formStep !== 2 ? 'hidden' : 'space-y-6'}>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.tituloInvestimento}</label>
                    <input
                      name="title"
                      type="text"
                      placeholder={t.exExpansao}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.site}</label>
                      <input
                        name="site"
                        type="text"
                        placeholder="Ex: BRSPI"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.valor} (USD)</label>
                      <input
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.enPlano}</label>
                    <select
                      name="inPlan"
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white transition-all"
                    >
                      <option value="true">{t.si}</option>
                      <option value="false">{t.no}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">{t.descricaoDetalhada}</label>
                    <textarea
                      name="description"
                      rows={6}
                      placeholder={t.placeholderDescricao}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    ></textarea>
                  </div>
                </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    if (formStep > 1) {
                      setFormStep(1);
                    } else {
                      setCurrentView('dashboard');
                    }
                  }}
                  className="flex-1 px-6 py-3 border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:bg-zinc-50 transition-all"
                >
                  {formStep === 1 ? t.cancelar : t.cancelar}
                </button>
                <button type="submit" className="flex-[2] btn-primary py-3 font-bold text-lg shadow-lg shadow-zinc-900/10">
                  {formStep === 1 ? t.continuar : t.enviarSolicitacao}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <>
            {/* Greeting Section - Mercado Libre Style */}
            <div className="flex flex-col items-center justify-center py-12 mb-8">
              <div className="w-32 h-32 bg-[#FFE600] rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-6">
                <UserIcon size={64} className="text-zinc-800" />
              </div>
              <h2 className="text-2xl font-medium text-zinc-900">{t.greeting} {CURRENT_USER.name}!</h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title={t.totalSolicitado} 
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total.amount)} 
                count={stats.total.count}
                icon={<DollarSign className="text-emerald-600" />}
              />
              <StatCard 
                title={t.pendientes} 
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.pending.amount)} 
                count={stats.pending.count}
                icon={<Clock className="text-amber-600" />}
                color="amber"
              />
              <StatCard 
                title={t.aprovados} 
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.approved.amount)} 
                count={stats.approved.count}
                icon={<CheckCircle2 className="text-blue-600" />}
                color="blue"
              />
              <StatCard 
                title={t.rejeitados} 
                value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.rejected.amount)} 
                count={stats.rejected.count}
                icon={<XCircle className="text-rose-600" />}
                color="rose"
              />
            </div>
          </>
        )}

        {currentView === 'monitoring' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{t.monitoreo}</h1>
            <p className="text-zinc-500">{t.vistaSoloLectura}</p>
          </div>
        )}

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={cn(
                "p-2 rounded-xl border transition-all flex items-center justify-center",
                Object.values(advancedFilters).some(v => v !== '' && v !== false && v !== 'all') 
                  ? "bg-zinc-900 text-white border-zinc-900" 
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              )}
              title={t.filtrosAvanzados}
            >
              <Filter size={20} />
            </button>

            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-zinc-200">
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>{t.todos}</TabButton>
              <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>{t.pendientes}</TabButton>
              <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>{t.aprovados}</TabButton>
              <TabButton active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')}>{t.rejeitados}</TabButton>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder={t.buscar}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {currentView === 'dashboard' && (
              <button 
                onClick={() => {
                  setCurrentView('new-request');
                  setFormStep(1);
                  setSelectedFormTeam('');
                  setSelectedFormCategory('');
                }}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <PlusCircle size={18} />
                {t.novaSolicitacao}
              </button>
            )}
          </div>
        </div>

        {/* Request List */}
        <div className="card relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-zinc-900" size={32} />
                <p className="text-sm font-medium text-zinc-500">{t.sincronizando}</p>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.idTitulo}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.fechaCreacion}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.site}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.pickingType}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.proyecto}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.equipoEjecutor}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.montoSolicitado}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{t.status}</th>
                  <th className="px-4 py-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {paginatedRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-zinc-500">{req.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-zinc-500">
                        {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium text-zinc-900">{req.site}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-zinc-500">{req.pickingType}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-zinc-900 line-clamp-1 max-w-[200px]">{req.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-zinc-500">{req.executingTeam}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold text-zinc-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(req.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={req.status} t={t} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      {t.nenhumaSolicitacao}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                Mostrando <span className="font-medium text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> de <span className="font-medium text-zinc-900">{filteredRequests.length}</span> resultados
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 text-xs font-medium rounded-lg transition-all",
                        currentPage === page 
                          ? "bg-zinc-900 text-white" 
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-zinc-200 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </main>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-500">{selectedRequest.id}</span>
                  <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-zinc-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.montoSolicitado}</label>
                    <p className="text-2xl font-bold text-zinc-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedRequest.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.categoria}</label>
                    <p className="text-lg font-medium text-zinc-700">
                      {selectedRequest.category === 'Infraestrutura' ? t.infraestrutura :
                       selectedRequest.category === 'Software' ? t.software :
                       selectedRequest.category === 'Treinamento' ? t.treinamento :
                       selectedRequest.category === 'Marketing' ? t.marketing :
                       selectedRequest.category === 'Outros' ? t.outros : selectedRequest.category}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{t.site}</label>
                    <p className="text-sm font-bold text-zinc-900">{selectedRequest.site}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{t.pickingType}</label>
                    <p className="text-sm font-bold text-zinc-900">{selectedRequest.pickingType}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{t.equipoEjecutor}</label>
                    <p className="text-sm font-bold text-zinc-900">{selectedRequest.executingTeam}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{t.subcategoria}</label>
                    <p className="text-sm font-bold text-zinc-900">{selectedRequest.subCategory}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.descricao}</label>
                  <p className="text-zinc-600 mt-1 leading-relaxed">{selectedRequest.description}</p>
                </div>

                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-200">
                    <UserIcon size={20} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t.solicitante}</p>
                    <p className="font-medium">{selectedRequest.requester.name} ({selectedRequest.requester.email})</p>
                  </div>
                </div>

                {selectedRequest.status === 'pending' && CURRENT_USER.role !== 'requester' && currentView === 'dashboard' && (
                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                      className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      {t.aprovar}
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt(t.motivoRejeicao);
                        if (reason) handleStatusChange(selectedRequest.id, 'rejected', reason);
                      }}
                      className="flex-1 bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} />
                      {t.rejeitar}
                    </button>
                  </div>
                )}

                {selectedRequest.status !== 'pending' && (
                  <div className="space-y-4">
                    <div className={cn(
                      "p-4 rounded-xl border",
                      selectedRequest.status === 'approved' ? "bg-blue-50 border-blue-100" : "bg-rose-50 border-rose-100"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedRequest.status === 'approved' ? <CheckCircle2 size={18} className="text-blue-600" /> : <XCircle size={18} className="text-rose-600" />}
                        <span className={cn("font-bold", selectedRequest.status === 'approved' ? "text-blue-700" : "text-rose-700")}>
                          {selectedRequest.status === 'approved' ? t.aprovados : t.rejeitados}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600">
                        {t.por}: <strong>{selectedRequest.approver?.name}</strong> {t.em} {format(new Date(selectedRequest.updatedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      {selectedRequest.comments && (
                        <p className="mt-2 text-sm italic text-zinc-500">"{selectedRequest.comments}"</p>
                      )}
                    </div>

                    {selectedRequest.status === 'approved' && currentView === 'dashboard' && (
                      <button 
                        onClick={() => {
                          const extraAmount = prompt(t.extraCapexEnviado);
                          if (extraAmount && !isNaN(Number(extraAmount))) {
                            alert(`${t.extraCapexEnviado} ${extraAmount} ${t.enviadaParaProjeto} ${selectedRequest.title}`);
                            setSelectedRequest(null);
                          }
                        }}
                        className="w-full bg-[#3483fa] text-white py-3 rounded-xl font-semibold hover:bg-[#2968c8] transition-colors flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={20} />
                        {t.extraCapex}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Request Form Modal removed - now a full page view */}

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Filter size={20} />
                  {t.filtrosAvanzados}
                </h3>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
                >
                  <XCircle size={20} className="text-zinc-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.fechaInicio}</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                      value={advancedFilters.startDate}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.fechaFin}</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                      value={advancedFilters.endDate}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Site & Picking Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.site}</label>
                    <input 
                      type="text" 
                      placeholder="Ex: BRSPI"
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                      value={advancedFilters.site}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, site: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.pickingType}</label>
                    <select 
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white"
                      value={advancedFilters.pickingType}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, pickingType: e.target.value }))}
                    >
                      <option value="">{t.todos}</option>
                      {pickingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status & In Plan */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.status}</label>
                    <select 
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 bg-white"
                      value={advancedFilters.status}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="all">{t.todos}</option>
                      <option value="pending">{t.pendientes}</option>
                      <option value="approved">{t.aprovados}</option>
                      <option value="rejected">{t.rejeitados}</option>
                      <option value="more_info">{t.maisInfo}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.enPlano}</label>
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                      {(['all', 'yes', 'no'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAdvancedFilters(prev => ({ ...prev, inPlan: opt }))}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                            advancedFilters.inPlan === opt ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                          )}
                        >
                          {opt === 'all' ? t.todos : opt === 'yes' ? t.si : t.no}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount Filter */}
                <div className="space-y-4 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-700">{t.filtrarPorMonto}</label>
                    <button 
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, filterByAmount: !prev.filterByAmount }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        advancedFilters.filterByAmount ? "bg-zinc-900" : "bg-zinc-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        advancedFilters.filterByAmount ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  {advancedFilters.filterByAmount && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-2 gap-4 overflow-hidden"
                    >
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.montoMinimo}</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                          value={advancedFilters.minAmount}
                          onChange={(e) => setAdvancedFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{t.montoMaximo}</label>
                        <input 
                          type="number" 
                          placeholder="999999"
                          className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                          value={advancedFilters.maxAmount}
                          onChange={(e) => setAdvancedFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                <button 
                  onClick={() => {
                    setAdvancedFilters({
                      startDate: '',
                      endDate: '',
                      site: '',
                      pickingType: '',
                      filterByAmount: false,
                      minAmount: '',
                      maxAmount: '',
                      inPlan: 'all',
                      status: 'all'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-600 font-bold rounded-xl hover:bg-zinc-100 transition-all"
                >
                  {t.limpiarFiltros}
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-[2] btn-primary py-2 font-bold"
                >
                  {t.aplicarFiltros}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, count, icon, trend, color = 'zinc' }: { 
  title: string; 
  value: string; 
  count?: string | number;
  icon: React.ReactNode; 
  trend?: string;
  color?: 'zinc' | 'amber' | 'blue' | 'rose';
}) {
  const colors = {
    zinc: 'bg-zinc-50 border-zinc-100',
    amber: 'bg-amber-50 border-amber-100',
    blue: 'bg-blue-50 border-blue-100',
    rose: 'bg-rose-50 border-rose-100',
  };

  return (
    <div className={cn("p-6 rounded-2xl border shadow-sm", colors[color])}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-zinc-100">
          {icon}
        </div>
        {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        {count !== undefined && (
          <p className="text-xs font-medium text-zinc-400 mt-1 uppercase tracking-wider">
            {count} Tickets
          </p>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
        active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status, t }: { status: RequestStatus; t: any }) {
  const configs = {
    pending: { label: t.pendientes, icon: <Clock size={14} />, className: 'bg-amber-50 text-amber-700 border-amber-100' },
    approved: { label: t.aprovados, icon: <CheckCircle2 size={14} />, className: 'bg-blue-50 text-blue-700 border-blue-100' },
    rejected: { label: t.rejeitados, icon: <XCircle size={14} />, className: 'bg-rose-50 text-rose-700 border-rose-100' },
    more_info: { label: t.maisInfo, icon: <FileText size={14} />, className: 'bg-zinc-50 text-zinc-700 border-zinc-100' },
  };

  const config = configs[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border", config.className)}>
      {config.icon}
      {config.label}
    </div>
  );
}
