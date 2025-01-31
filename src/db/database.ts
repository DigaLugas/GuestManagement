import sqlite3 from 'sqlite3';
import { Guest } from '../../../backend/types/Guest';

const db = new sqlite3.Database('guests.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            confirmed BOOLEAN NOT NULL
        )
    `);
});

export const addGuest = (guest: Guest): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO guests (fullName, confirmed) VALUES (?, ?)',
            [guest.fullName, guest.confirmed],
            (err) => {
                if (err) reject(err);
                resolve();
            }
        );
    });
};

export const getAllGuests = (): Promise<Guest[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM guests', (err, rows) => {
            if (err) reject(err);
            resolve(rows as Guest[]);
        });
    });
};