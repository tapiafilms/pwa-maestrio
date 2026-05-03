-- Core technicians table
create table if not exists technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  phone text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Leads generated from landing form
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  category text not null,
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  status text not null default 'searching' check (status in ('searching', 'assigned', 'closed')),
  client_phone text not null,
  technician_id uuid references technicians(id),
  created_at timestamptz not null default now()
);

-- Tracks which technicians were invited for each lead.
-- This makes webhook YES replies deterministic and easy to resolve.
create table if not exists lead_offers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  technician_id uuid not null references technicians(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz not null default now(),
  unique (lead_id, technician_id)
);

create index if not exists idx_leads_status on leads(status);
create index if not exists idx_technicians_category_active on technicians(category, active);
create index if not exists idx_lead_offers_lookup on lead_offers(technician_id, status, created_at desc);

-- Seed examples (edit to real numbers)
insert into technicians (name, category, phone, active)
values
  ('Luis Plomeria', 'plumber', '+51911111111', true),
  ('Ana Electricidad', 'electrician', '+51922222222', true),
  ('Jose Cerrajeria', 'locksmith', '+51933333333', true)
on conflict (phone) do nothing;
