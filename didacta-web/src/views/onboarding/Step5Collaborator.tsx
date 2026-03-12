import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface Collaborator {
    email: string;
    fullName: string;
    role: string;
    groupId?: string;
    status?: string;
}

export default function Step5Collaborator() {
    const navigate = useNavigate();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        groupId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get('/api/onboarding/groups')
            .then(res => setGroups(res.data))
            .catch(console.error);
    }, []);

    const addCollaborator = () => {
        if (!formData.email || !formData.role) return;
        setCollaborators([...collaborators, { ...formData, status: 'Pendiente' }]);
        setFormData({ fullName: '', email: '', role: '', groupId: '' });
    };

    const removeCollaborator = (index: number) => {
        const next = [...collaborators];
        next.splice(index, 1);
        setCollaborators(next);
    };

    const handleFinish = async () => {
        if (collaborators.length === 0) {
            navigate('/dashboard');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/onboarding/collaborators', { collaborators });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Error al guardar colaboradores. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={5}
            title="Configura tu equipo"
            subtitle="Añade docentes y administrativos. Recibirán un correo de activación."
            maxWidth="max-w-6xl"
        >
            <InlineError message={error} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6 h-fit">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>+</span> Nuevo Colaborador
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ej. Ana López"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico *</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="nombre@institucion.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="TEACHER">Docente</option>
                                    <option value="COORDINATOR">Coordinador</option>
                                    <option value="ADMIN">Administrativo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Grupo</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-50"
                                    disabled={formData.role !== 'TEACHER' && formData.role !== 'COORDINATOR'}
                                    value={formData.groupId}
                                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                >
                                    <option value="">Asignar</option>
                                    {groups.map((g: any) => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={addCollaborator}
                            disabled={!formData.email || !formData.role}
                            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-2"
                        >
                            + Agregar colaborador
                        </button>
                    </div>

                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-800">
                        <strong>Nota importante:</strong> Los usuarios tendrán 24 horas para activar su cuenta.
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Lista de colaboradores</h3>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">Total: {collaborators.length}</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[300px]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">USUARIO</th>
                                    <th className="px-6 py-3">ROL</th>
                                    <th className="px-6 py-3">GRUPO</th>
                                    <th className="px-6 py-3">ESTADO</th>
                                    <th className="px-6 py-3 text-right">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {collaborators.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            Agrega más colaboradores usando el formulario
                                        </td>
                                    </tr>
                                ) : (
                                    collaborators.map((c, i) => {
                                        const groupName = groups.find((g: any) => g.id === c.groupId)?.name || '-';
                                        return (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{c.fullName || "Sin nombre"}</div>
                                                    <div className="text-gray-500 text-xs">{c.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {c.role === 'TEACHER' ? 'Docente' : c.role === 'COORDINATOR' ? 'Coordinador' : 'Administrativo'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{groupName}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Pendiente</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => removeCollaborator(i)} className="text-red-500 hover:text-red-700 text-sm">
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => navigate('/onboarding/step-4')}
                            className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            ← Volver
                        </button>
                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'Finalizando...' : 'Ir al Dashboard →'}
                        </button>
                    </div>

                    {/* Skip button */}
                    <div className="mt-3 text-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full text-center text-gray-500 hover:text-gray-700 py-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                            Omitir por ahora
                        </button>
                        <p className="text-xs text-gray-400 mt-2">
                            Podrás invitar a tu equipo más adelante desde la sección de configuración.
                        </p>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
