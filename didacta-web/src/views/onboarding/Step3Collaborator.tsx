import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';

interface Collaborator {
    email: string;
    fullName: string;
    role: string;
    groupId?: string; // UUID if applicable or null
    status?: string;
}

export default function Step3Collaborator() {
    const navigate = useNavigate();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        groupId: ''
    });
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        try {
            await api.post('/api/onboarding/collaborators', { collaborators });
            navigate('/dashboard');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Error al guardar colaboradores');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={3}
            title="Configura tu equipo"
            subtitle="Añade docentes y administrativos. Recibirán un correo de activación."
        >
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
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Grupo</label>
                                <select disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400">
                                    <option>Asignar</option>
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
                                    <th className="px-6 py-3">ESTADO</th>
                                    <th className="px-6 py-3 text-right">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {collaborators.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                            Agrega más colaboradores usando el formulario
                                        </td>
                                    </tr>
                                ) : (
                                    collaborators.map((c, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{c.fullName || "Sin nombre"}</div>
                                                <div className="text-gray-500 text-xs">{c.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.role === 'TEACHER' ? 'Docente' : 'Coordinador'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">Pendiente</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => removeCollaborator(i)} className="text-red-500 hover:text-red-700">🗑</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'Finalizando...' : 'Ir al Dashboard →'}
                        </button>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
