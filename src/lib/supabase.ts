import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('URL do Supabase não encontrada');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Chave anônima do Supabase não encontrada');
}

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

