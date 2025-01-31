import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Guest } from './types/Guest';

export default function App() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [fullName, setFullName] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editConfirmed, setEditConfirmed] = useState(false);

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('guests')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                throw error;
            }

            if (data) {
                setGuests(data);
            }
        } catch (error) {
            console.error('Erro ao carregar convidados:', error);
            alert('Erro ao carregar convidados!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const { error } = await supabase
                .from('guests')
                .insert([
                    {
                        full_name: fullName,
                        confirmed: confirmed,
                    },
                ]);

            if (error) {
                throw error;
            }

            await loadGuests();
            setFullName('');
            setConfirmed(false);
        } catch (error) {
            console.error('Erro ao adicionar convidado:', error);
            alert('Erro ao adicionar convidado!');
        }
    };

    const startEditing = (guest: Guest) => {
        setEditingId(guest.id!);
        setEditName(guest.full_name);
        setEditConfirmed(guest.confirmed);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditConfirmed(false);
    };

    const saveEdit = async (id: number) => {
        try {
            const { error } = await supabase
                .from('guests')
                .update({ full_name: editName, confirmed: editConfirmed })
                .eq('id', id);

            if (error) {
                throw error;
            }

            await loadGuests();
            cancelEditing();
        } catch (error) {
            console.error('Erro ao atualizar convidado:', error);
            alert('Erro ao atualizar convidado!');
        }
    };

    const handleExportCSV = () => {
        const header = 'Nome Completo,Confirmado\n';
        const rows = guests.map(guest => 
            `${guest.full_name},${guest.confirmed ? 'Sim' : 'Não'}`
        ).join('\n');
        const csvContent = header + rows;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'lista_convidados.csv';
        link.click();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gestão de Convidados</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label htmlFor="fullName" className="block mb-2">
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                
                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mr-2"
                        />
                        Confirmado
                    </label>
                </div>
                
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Adicionar Convidado
                </button>
            </form>
            
            <div className="mb-4">
                <button
                    onClick={handleExportCSV}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Exportar para CSV
                </button>
            </div>
            
            {loading ? (
                <div className="text-center">Carregando...</div>
            ) : (
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Nome Completo</th>
                            <th className="border p-2">Confirmado</th>
                            <th className="border p-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guests.map((guest) => (
                            <tr key={guest.id}>
                                <td className="border p-2">
                                    {editingId === guest.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full p-2 border rounded"
                                        />
                                    ) : (
                                        guest.full_name
                                    )}
                                </td>
                                <td className="border p-2">
                                    {editingId === guest.id ? (
                                        <input
                                            type="checkbox"
                                            checked={editConfirmed}
                                            onChange={(e) => setEditConfirmed(e.target.checked)}
                                            className="mr-2"
                                        />
                                    ) : (
                                        guest.confirmed ? 'Sim' : 'Não'
                                    )}
                                </td>
                                <td className="border p-2">
                                    {editingId === guest.id ? (
                                        <>
                                            <button
                                                onClick={() => saveEdit(guest.id!)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(guest)}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                        >
                                            Editar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}