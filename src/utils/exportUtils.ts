import { Guest } from '../../../backend/types/Guest';

export const exportToCSV = (guests: Guest[]): string => {
    const header = 'Nome Completo,Confirmado\n';
    const rows = guests.map(guest => 
        `${guest.fullName},${guest.confirmed ? 'Sim' : 'Não'}`
    ).join('\n');
    return header + rows;
};