import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('leases').select('id, name, status, template_type, documents, upload_date').order('upload_date', { ascending: false }).limit(5);
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}
main();
