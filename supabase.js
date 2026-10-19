
const SUPABASE_URL = "https://yaknpttoylyqkgbhkrho.supabase.co";
const SUPABASE_KEY = "sb_publishable_9p3Hyf-JHbFC8PDLviZxGA_Npy-yyme";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase connection setup complete!");
