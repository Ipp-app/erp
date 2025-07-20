CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  supplier_code character varying NOT NULL UNIQUE,
  company_name character varying NOT NULL,
  contact_person character varying,
  email character varying,
  phone character varying,
  address text,
  city character varying,
  state_province character varying,
  postal_code character varying,
  country character varying,
  payment_terms character varying,
  status character varying DEFAULT 'active'::character varying,
  notes text,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
);