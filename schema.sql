--
-- PostgreSQL database dump
--

\restrict mpEa7D28oYRamaLbPRTdgtkY6zjSnLKlMrlti5tsiArHcEtxQiqgWJrfOwxe3I3

-- Dumped from database version 17.8 (Debian 17.8-1.pgdg13+1)
-- Dumped by pg_dump version 17.8 (Debian 17.8-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_budget_groups_kind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_budget_groups_kind AS ENUM (
    'computed',
    'editable'
);


--
-- Name: enum_card_statements_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_card_statements_status AS ENUM (
    'OPEN',
    'PAID',
    'CANCELLED',
    'OVERDUE'
);


--
-- Name: enum_installment_contracts_installment_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_installment_contracts_installment_interval AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY'
);


--
-- Name: enum_installment_contracts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_installment_contracts_status AS ENUM (
    'ACTIVE',
    'CANCELLED',
    'FINISHED',
    'PAUSED'
);


--
-- Name: enum_installment_contracts_transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_installment_contracts_transaction_status AS ENUM (
    'POSTED',
    'REVERSED'
);


--
-- Name: enum_installment_contracts_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_installment_contracts_transaction_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: enum_installment_occurrences_installment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_installment_occurrences_installment_status AS ENUM (
    'SCHEDULED',
    'CLOSED',
    'POSTED',
    'CANCELLED',
    'SKIPPED',
    'PAUSED'
);


--
-- Name: enum_recurring_contracts_installment_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_recurring_contracts_installment_interval AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'YEARLY'
);


--
-- Name: enum_recurring_contracts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_recurring_contracts_status AS ENUM (
    'ACTIVE',
    'PAUSED',
    'CANCELLED'
);


--
-- Name: enum_recurring_contracts_transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_recurring_contracts_transaction_status AS ENUM (
    'POSTED',
    'REVERSED'
);


--
-- Name: enum_recurring_contracts_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_recurring_contracts_transaction_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: enum_recurring_occurrences_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_recurring_occurrences_status AS ENUM (
    'SCHEDULED',
    'CLOSED',
    'POSTED',
    'SKIPPED',
    'CANCELLED',
    'PAUSED'
);


--
-- Name: enum_transactions_transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_transactions_transaction_status AS ENUM (
    'POSTED',
    'REVERSED'
);


--
-- Name: enum_transactions_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_transactions_transaction_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: enum_users_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_plan AS ENUM (
    'free',
    'basic',
    'premium'
);


--
-- Name: enum_wallets_financial_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallets_financial_type AS ENUM (
    'ACCOUNT',
    'CREDIT_CARD'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: budget_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_groups (
    id character varying(26) NOT NULL,
    title character varying(255) NOT NULL,
    kind public.enum_budget_groups_kind DEFAULT 'editable'::public.enum_budget_groups_kind,
    color character varying(255) DEFAULT '#0084d1'::character varying,
    footer_label character varying(255),
    is_system_default boolean DEFAULT false,
    "position" integer DEFAULT 0,
    user_id character varying(26),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: card_statements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_statements (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    card_wallet_id character varying(26) NOT NULL,
    reference_month date NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    due_date date NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    status public.enum_card_statements_status DEFAULT 'OPEN'::public.enum_card_statements_status NOT NULL,
    payment_wallet_id character varying(26) DEFAULT NULL::character varying,
    payment_transaction_id character varying(26) DEFAULT NULL::character varying,
    paid_at date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying(26) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    icon character varying(255) NOT NULL,
    color character varying(255) DEFAULT '#615fff'::character varying,
    user_id character varying(26),
    budget_group_id character varying(26),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.files (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    file_name character varying(255) NOT NULL,
    upload_date timestamp with time zone NOT NULL,
    extension character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: installment_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installment_contracts (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    wallet_id character varying(26) NOT NULL,
    category_id character varying(26) NOT NULL,
    description character varying(255),
    total_amount numeric(10,2) NOT NULL,
    installment_count integer NOT NULL,
    installment_interval public.enum_installment_contracts_installment_interval NOT NULL,
    first_due_date date NOT NULL,
    status public.enum_installment_contracts_status DEFAULT 'ACTIVE'::public.enum_installment_contracts_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: installment_occurrences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installment_occurrences (
    id character varying(26) NOT NULL,
    contract_id character varying(26) NOT NULL,
    installment_index integer NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    installment_status public.enum_installment_occurrences_installment_status DEFAULT 'SCHEDULED'::public.enum_installment_occurrences_installment_status NOT NULL,
    transaction_id character varying(26),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT installment_occurrences_posted_transaction_consistency_chk CHECK ((((installment_status = 'POSTED'::public.enum_installment_occurrences_installment_status) AND (transaction_id IS NOT NULL)) OR ((installment_status <> 'POSTED'::public.enum_installment_occurrences_installment_status) AND (transaction_id IS NULL))))
);


--
-- Name: recurring_contract_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_contract_revisions (
    id character varying(26) NOT NULL,
    contract_id character varying(26) NOT NULL,
    effective_from date NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: recurring_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_contracts (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    wallet_id character varying(26) NOT NULL,
    category_id character varying(26) NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    installment_interval public.enum_recurring_contracts_installment_interval NOT NULL,
    first_due_date date NOT NULL,
    ends_at date,
    status public.enum_recurring_contracts_status DEFAULT 'ACTIVE'::public.enum_recurring_contracts_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: recurring_occurrences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recurring_occurrences (
    id character varying(26) NOT NULL,
    contract_id character varying(26) NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.enum_recurring_occurrences_status DEFAULT 'SCHEDULED'::public.enum_recurring_occurrences_status NOT NULL,
    transaction_id character varying(26) DEFAULT NULL::character varying,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT recurring_occurrences_posted_transaction_consistency_chk CHECK ((((status = 'POSTED'::public.enum_recurring_occurrences_status) AND (transaction_id IS NOT NULL)) OR ((status <> 'POSTED'::public.enum_recurring_occurrences_status) AND (transaction_id IS NULL))))
);


--
-- Name: transaction_ofx_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_ofx_details (
    transaction_id character varying(26) NOT NULL,
    fit_id character varying(255),
    account_id character varying(255),
    account_type character varying(255),
    bank_id character varying(255),
    bank_name character varying(255),
    currency character varying(255),
    transaction_date date,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id character varying(26) NOT NULL,
    deposited_date date NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    transaction_type public.enum_transactions_transaction_type NOT NULL,
    transaction_status public.enum_transactions_transaction_status DEFAULT 'POSTED'::public.enum_transactions_transaction_status NOT NULL,
    user_id character varying(26) NOT NULL,
    category_id character varying(26) NOT NULL,
    wallet_id character varying(26) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    card_wallet_id character varying(26) DEFAULT NULL::character varying
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(26) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    plan public.enum_users_plan DEFAULT 'free'::public.enum_users_plan,
    full_name character varying(255) NOT NULL,
    refresh_token text,
    avatar character varying(255),
    is_email_verified boolean DEFAULT false,
    email_verification_token character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id character varying(26) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    wallet_type character varying(255),
    bank_id character varying(255),
    balance bigint DEFAULT 0 NOT NULL,
    user_id character varying(26) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    financial_type public.enum_wallets_financial_type DEFAULT 'ACCOUNT'::public.enum_wallets_financial_type NOT NULL,
    due_day integer,
    closing_day integer,
    payment_account_wallet_id character varying(26)
);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: budget_groups budget_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_groups
    ADD CONSTRAINT budget_groups_pkey PRIMARY KEY (id);


--
-- Name: card_statements card_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: installment_contracts installment_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_pkey PRIMARY KEY (id);


--
-- Name: installment_occurrences installment_occurrences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_pkey PRIMARY KEY (id);


--
-- Name: recurring_contract_revisions recurring_contract_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_pkey PRIMARY KEY (id);


--
-- Name: recurring_contracts recurring_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_pkey PRIMARY KEY (id);


--
-- Name: recurring_occurrences recurring_occurrences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_pkey PRIMARY KEY (id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key1 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key10 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key11 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key12 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key13 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key14 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key15 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key16 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key17 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key18 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key19 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key2 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key20 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key21 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key22 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key23 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key24 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key25 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key3 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key4 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key5 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key6 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key7 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key8 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_fit_id_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_fit_id_key9 UNIQUE (fit_id);


--
-- Name: transaction_ofx_details transaction_ofx_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_pkey PRIMARY KEY (transaction_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- Name: users users_email_key22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key22 UNIQUE (email);


--
-- Name: users users_email_key23; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key23 UNIQUE (email);


--
-- Name: users users_email_key24; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key24 UNIQUE (email);


--
-- Name: users users_email_key25; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key25 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: card_statements_card_wallet_id_reference_month_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX card_statements_card_wallet_id_reference_month_unique ON public.card_statements USING btree (card_wallet_id, reference_month);


--
-- Name: installment_occurrences_contract_id_installment_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX installment_occurrences_contract_id_installment_index ON public.installment_occurrences USING btree (contract_id, installment_index);


--
-- Name: installment_occurrences_contract_id_installment_index_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX installment_occurrences_contract_id_installment_index_unique ON public.installment_occurrences USING btree (contract_id, installment_index);


--
-- Name: installment_occurrences_transaction_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX installment_occurrences_transaction_id_unique ON public.installment_occurrences USING btree (transaction_id) WHERE (transaction_id IS NOT NULL);


--
-- Name: recurring_contract_revisions_contract_id_effective_from_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX recurring_contract_revisions_contract_id_effective_from_unique ON public.recurring_contract_revisions USING btree (contract_id, effective_from);


--
-- Name: recurring_occurrences_contract_id_due_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX recurring_occurrences_contract_id_due_date ON public.recurring_occurrences USING btree (contract_id, due_date);


--
-- Name: recurring_occurrences_contract_id_due_date_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX recurring_occurrences_contract_id_due_date_unique ON public.recurring_occurrences USING btree (contract_id, due_date);


--
-- Name: recurring_occurrences_transaction_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX recurring_occurrences_transaction_id_unique ON public.recurring_occurrences USING btree (transaction_id) WHERE (transaction_id IS NOT NULL);


--
-- Name: card_statements card_statements_card_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey1 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey10 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey11 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey12 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey13 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey14 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey15 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey16 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey17 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey18 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey19 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey2 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey3 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey4 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey5 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey6 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey7 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey8 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: card_statements card_statements_card_wallet_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_statements
    ADD CONSTRAINT card_statements_card_wallet_id_fkey9 FOREIGN KEY (card_wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: categories categories_budget_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey1 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey10 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey11 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey12 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey13 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey14 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey15 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey16 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey17 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey18 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey19 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey2 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey20 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey21 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey22 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey23 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey24 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey25 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey3 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey4 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey5 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey6 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey7 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey8 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories categories_budget_group_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_budget_group_id_fkey9 FOREIGN KEY (budget_group_id) REFERENCES public.budget_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: files files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: files files_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey10 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey11 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey12 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey13 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey14 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey16 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey17 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey18 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey19 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey20 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey21 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey22 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey3 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey8 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: files files_user_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey9 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installment_contracts installment_contracts_category_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey1 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey10 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey11 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey12 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey13 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey14 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey15 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey16 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey17 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey18 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey19 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey2 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey20 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey21 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey22 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey23 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey24 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey3 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey4 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey5 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey6 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey7 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey8 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_category_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_category_id_fkey9 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installment_contracts installment_contracts_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey10 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey11 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey12 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey13 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey14 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey16 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey17 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey18 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey19 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey20 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey21 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey22 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey23 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey24 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey3 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey8 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_user_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_user_id_fkey9 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey1 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey10 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey11 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey12 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey13 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey14 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey15 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey16 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey17 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey18 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey19 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey2 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey20 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey21 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey22 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey23 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey24 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey3 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey4 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey5 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey6 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey7 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey8 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_contracts installment_contracts_wallet_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_contracts
    ADD CONSTRAINT installment_contracts_wallet_id_fkey9 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey1 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey10 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey11 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey12 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey13 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey14 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey15 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey16 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey17 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey18 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey19 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey2 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey20 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey21 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey22 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey23 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey24 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey3 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey4 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey5 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey6 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey7 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey8 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_contract_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_contract_id_fkey9 FOREIGN KEY (contract_id) REFERENCES public.installment_contracts(id) ON UPDATE CASCADE;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey1 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey10 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey11 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey12 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey13 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey14 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey15 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey16 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey17 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey18 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey19 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey2 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey20 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey21 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey22 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey23 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey24 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey3 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey4 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey5 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey6 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey7 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey8 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: installment_occurrences installment_occurrences_transaction_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installment_occurrences
    ADD CONSTRAINT installment_occurrences_transaction_id_fkey9 FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey1 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey10 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey11 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey12 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey13 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey14 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey15 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey16 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey17 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey18 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey19 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey2 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey20 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey21 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey22 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey3 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey4 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey5 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey6 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey7 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey8 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contract_revisions recurring_contract_revisions_contract_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contract_revisions
    ADD CONSTRAINT recurring_contract_revisions_contract_id_fkey9 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey1 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey10 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey11 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey12 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey13 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey14 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey15 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey16 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey17 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey18 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey19 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey2 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey20 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey21 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey22 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey23 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey3 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey4 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey5 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey6 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey7 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey8 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_category_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_category_id_fkey9 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey10 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey11 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey12 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey13 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey14 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey16 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey17 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey18 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey19 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey20 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey21 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey22 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey23 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey3 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey8 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_user_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_user_id_fkey9 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey1 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey10 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey11 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey12 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey13 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey14 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey15 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey16 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey17 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey18 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey19 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey2 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey20 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey21 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey22 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey23 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey3 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey4 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey5 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey6 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey7 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey8 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_contracts recurring_contracts_wallet_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_contracts
    ADD CONSTRAINT recurring_contracts_wallet_id_fkey9 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey1 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey10 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey11 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey12 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey13 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey14 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey15 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey16 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey17 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey18 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey19 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey2 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey20 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey21 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey22 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey23 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey3 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey4 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey5 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey6 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey7 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey8 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_contract_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_contract_id_fkey9 FOREIGN KEY (contract_id) REFERENCES public.recurring_contracts(id) ON UPDATE CASCADE;


--
-- Name: recurring_occurrences recurring_occurrences_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recurring_occurrences
    ADD CONSTRAINT recurring_occurrences_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transaction_ofx_details transaction_ofx_details_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_ofx_details
    ADD CONSTRAINT transaction_ofx_details_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_category_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey1 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey10 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey11 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey12 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey13 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey14 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey15 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey16 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey17 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey18 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey19 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey2 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey20 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey21 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey22 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey23 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey24 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey25 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey3 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey4 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey5 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey6 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey7 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey8 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_category_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey9 FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey10 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey11 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey12 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey13 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey14 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey16 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey17 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey18 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey19 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey20 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey21 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey22 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey23 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey24 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey25 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey3 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey8 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_user_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey9 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_wallet_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey1 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey10 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey11 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey12 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey13 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey14 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey15 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey16 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey17 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey18 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey19 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey2 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey20 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey21 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey22 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey23 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey24 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey25 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey3 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey4 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey5 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey6 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey7 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey8 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_wallet_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_wallet_id_fkey9 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wallets wallets_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey10; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey10 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey11; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey11 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey12; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey12 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey13 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey14; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey14 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey15 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey16; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey16 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey17 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey18; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey18 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey19 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey20 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey21 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey22; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey22 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey23 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey24 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey25 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey3 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey8 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: wallets wallets_user_id_fkey9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey9 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict mpEa7D28oYRamaLbPRTdgtkY6zjSnLKlMrlti5tsiArHcEtxQiqgWJrfOwxe3I3

