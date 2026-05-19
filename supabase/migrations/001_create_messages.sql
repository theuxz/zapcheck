-- c:\Users\sonbl\zapcheck\supabase\migrations\001_create_messages.sql

create table messages (
  id uuid primary key default gen_random_uuid(),
  texto_original text not null,
  nome text,
  telefone text,
  categoria text not null,
  intencao text not null,
  valor_mencionado numeric,
  urgencia text not null,
  precisa_followup boolean not null default true,
  resumo text not null,
  atendida boolean not null default false,
  created_at timestamp with time zone default now()
);

-- RLS: permitir leitura/escrita para usuários autenticados via anon key (ajuste conforme sua política)
alter table messages enable row level security;

create policy "Allow public read" on messages
  for select using (true);

create policy "Allow public insert" on messages
  for insert with check (true);

create policy "Allow public update" on messages
  for update using (true);

create policy "Allow public delete" on messages
  for delete using (true);
