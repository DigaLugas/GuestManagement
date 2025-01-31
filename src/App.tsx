import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Guest } from './types/Guest';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, UserPlus, Pencil, Save, X } from 'lucide-react';

export default function App() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [fullName, setFullName] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
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

            if (error) throw error;
            if (data) setGuests(data);
        } catch (error) {
            console.error('Erro ao carregar convidados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('guests')
                .insert([{ full_name: fullName, confirmed }]);

            if (error) throw error;

            await loadGuests();
            setFullName('');
            setConfirmed(false);
        } catch (error) {
            console.error('Erro ao adicionar convidado:', error);
        } finally {
            setSubmitting(false);
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

            if (error) throw error;

            await loadGuests();
            cancelEditing();
        } catch (error) {
            console.error('Erro ao atualizar convidado:', error);
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de Convidados</h1>
                    <p className="text-gray-600">Gerencie seus convidados de forma simples e organizada</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar Novo Convidado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                                        Nome Completo
                                    </label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Digite o nome completo"
                                        required
                                    />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="confirmed"
                                        checked={confirmed}
                                        onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                    />
                                    <label htmlFor="confirmed" className="text-sm font-medium text-gray-700">
                                        Presença Confirmada
                                    </label>
                                </div>
                                
                                <Button type="submit" disabled={submitting} className="w-full">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adicionando...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Adicionar Convidado
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle>Lista de Convidados</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportCSV}
                                className="ml-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Exportar CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome Completo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {guests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-gray-500">
                                                    Nenhum convidado registrado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            guests.map((guest) => (
                                                <TableRow key={guest.id}>
                                                    <TableCell className="font-medium">
                                                        {editingId === guest.id ? (
                                                            <Input
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                className="max-w-sm"
                                                            />
                                                        ) : (
                                                            guest.full_name
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editingId === guest.id ? (
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    checked={editConfirmed}
                                                                    onCheckedChange={(checked) => setEditConfirmed(checked as boolean)}
                                                                />
                                                                <span>Confirmado</span>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                guest.confirmed 
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {guest.confirmed ? 'Confirmado' : 'Pendente'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {editingId === guest.id ? (
                                                            <div className="flex justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => saveEdit(guest.id!)}
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => startEditing(guest)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}