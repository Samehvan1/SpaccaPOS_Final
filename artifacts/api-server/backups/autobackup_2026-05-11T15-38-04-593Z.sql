--
-- PostgreSQL database dump
--

\restrict P6Ib0zO1S7R7K6u3y9Ogu34njrWbY3ewaeWAXrmihqlBT08dnj3A2kY4WpGjmkp

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    action text NOT NULL,
    entity_type text,
    entity_id integer,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: branch_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branch_stock (
    branch_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    stock_quantity numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    low_stock_threshold numeric(12,4) DEFAULT '500'::numeric NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    startup_quantity numeric(12,4) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.branch_stock OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name text NOT NULL,
    code character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    address text,
    phone character varying(20)
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: cashier_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashier_sessions (
    id integer NOT NULL,
    cashier_id integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    notes text,
    ip_address text,
    user_agent text
);


ALTER TABLE public.cashier_sessions OWNER TO postgres;

--
-- Name: cashier_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cashier_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cashier_sessions_id_seq OWNER TO postgres;

--
-- Name: cashier_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cashier_sessions_id_seq OWNED BY public.cashier_sessions.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    password_hash text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    total_spent numeric(10,2) DEFAULT 0 NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    code text NOT NULL,
    type text NOT NULL,
    value numeric(8,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discounts_id_seq OWNER TO postgres;

--
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- Name: drink_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drink_categories (
    id integer NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.drink_categories OWNER TO postgres;

--
-- Name: drink_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drink_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drink_categories_id_seq OWNER TO postgres;

--
-- Name: drink_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drink_categories_id_seq OWNED BY public.drink_categories.id;


--
-- Name: drink_ingredient_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drink_ingredient_slots (
    id integer NOT NULL,
    drink_id integer NOT NULL,
    ingredient_id integer,
    ingredient_type_id integer,
    slot_label text NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    default_option_id integer,
    is_dynamic boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    barista_sort_order integer DEFAULT 1 NOT NULL,
    customer_sort_order integer DEFAULT 1 NOT NULL,
    affects_cup_size boolean,
    predefined_slot_id integer
);


ALTER TABLE public.drink_ingredient_slots OWNER TO postgres;

--
-- Name: drink_ingredient_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drink_ingredient_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drink_ingredient_slots_id_seq OWNER TO postgres;

--
-- Name: drink_ingredient_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drink_ingredient_slots_id_seq OWNED BY public.drink_ingredient_slots.id;


--
-- Name: drink_slot_type_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drink_slot_type_options (
    id integer NOT NULL,
    slot_id integer NOT NULL,
    ingredient_type_id integer NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    processed_qty numeric(10,4),
    produced_qty numeric(10,4),
    unit text,
    extra_cost numeric(8,4),
    pricing_mode text
);


ALTER TABLE public.drink_slot_type_options OWNER TO postgres;

--
-- Name: drink_slot_type_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drink_slot_type_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drink_slot_type_options_id_seq OWNER TO postgres;

--
-- Name: drink_slot_type_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drink_slot_type_options_id_seq OWNED BY public.drink_slot_type_options.id;


--
-- Name: drink_slot_volumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drink_slot_volumes (
    id integer NOT NULL,
    slot_id integer NOT NULL,
    type_volume_id integer NOT NULL,
    processed_qty numeric(10,4),
    produced_qty numeric(10,4),
    unit text,
    extra_cost numeric(8,4),
    is_default boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.drink_slot_volumes OWNER TO postgres;

--
-- Name: drink_slot_volumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drink_slot_volumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drink_slot_volumes_id_seq OWNER TO postgres;

--
-- Name: drink_slot_volumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drink_slot_volumes_id_seq OWNED BY public.drink_slot_volumes.id;


--
-- Name: drinks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drinks (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    base_price numeric(8,2) NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    prep_time_seconds integer DEFAULT 180 NOT NULL,
    cup_size_ml integer,
    kitchen_station text DEFAULT 'main'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category_id integer,
    sort_order integer DEFAULT 0 NOT NULL,
    cup_ingredient_id integer,
    is_customizable boolean DEFAULT true NOT NULL,
    kitchen_station_id integer
);


ALTER TABLE public.drinks OWNER TO postgres;

--
-- Name: drinks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drinks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drinks_id_seq OWNER TO postgres;

--
-- Name: drinks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drinks_id_seq OWNED BY public.drinks.id;


--
-- Name: ingredient_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_categories (
    id integer NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredient_categories OWNER TO postgres;

--
-- Name: ingredient_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_categories_id_seq OWNER TO postgres;

--
-- Name: ingredient_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_categories_id_seq OWNED BY public.ingredient_categories.id;


--
-- Name: ingredient_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_options (
    id integer NOT NULL,
    ingredient_id integer NOT NULL,
    label text NOT NULL,
    processed_qty numeric(10,4) NOT NULL,
    produced_qty numeric(10,4) NOT NULL,
    produced_unit text NOT NULL,
    extra_cost numeric(8,4) DEFAULT '0'::numeric NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    linked_ingredient_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredient_options OWNER TO postgres;

--
-- Name: ingredient_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_options_id_seq OWNER TO postgres;

--
-- Name: ingredient_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_options_id_seq OWNED BY public.ingredient_options.id;


--
-- Name: ingredient_type_volumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_type_volumes (
    id integer NOT NULL,
    ingredient_type_id integer NOT NULL,
    volume_id integer NOT NULL,
    processed_qty numeric(10,4),
    produced_qty numeric(10,4),
    unit text,
    extra_cost numeric(8,4) DEFAULT '0'::numeric NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.ingredient_type_volumes OWNER TO postgres;

--
-- Name: ingredient_type_volumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_type_volumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_type_volumes_id_seq OWNER TO postgres;

--
-- Name: ingredient_type_volumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_type_volumes_id_seq OWNED BY public.ingredient_type_volumes.id;


--
-- Name: ingredient_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_types (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name text NOT NULL,
    inventory_ingredient_id integer,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    produced_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    unit text DEFAULT 'ml'::text NOT NULL,
    affects_cup_size boolean DEFAULT true NOT NULL,
    color text,
    extra_cost numeric(8,4) DEFAULT '0'::numeric NOT NULL,
    pricing_mode text DEFAULT 'volume'::text NOT NULL
);


ALTER TABLE public.ingredient_types OWNER TO postgres;

--
-- Name: ingredient_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_types_id_seq OWNER TO postgres;

--
-- Name: ingredient_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_types_id_seq OWNED BY public.ingredient_types.id;


--
-- Name: ingredient_volumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredient_volumes (
    id integer NOT NULL,
    name text NOT NULL,
    processed_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    produced_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    unit text DEFAULT 'ml'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredient_volumes OWNER TO postgres;

--
-- Name: ingredient_volumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredient_volumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredient_volumes_id_seq OWNER TO postgres;

--
-- Name: ingredient_volumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredient_volumes_id_seq OWNED BY public.ingredient_volumes.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    ingredient_type text NOT NULL,
    unit text NOT NULL,
    cost_per_unit numeric(10,4) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO postgres;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: kitchen_stations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kitchen_stations (
    id integer NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.kitchen_stations OWNER TO postgres;

--
-- Name: kitchen_stations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kitchen_stations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kitchen_stations_id_seq OWNER TO postgres;

--
-- Name: kitchen_stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kitchen_stations_id_seq OWNED BY public.kitchen_stations.id;


--
-- Name: order_item_customizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item_customizations (
    id integer NOT NULL,
    order_item_id integer NOT NULL,
    ingredient_id integer,
    option_id integer,
    consumed_qty numeric(10,4) NOT NULL,
    added_cost numeric(8,4) NOT NULL,
    slot_label text NOT NULL,
    option_label text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type_volume_id integer,
    barista_sort_order integer DEFAULT 1 NOT NULL,
    customer_sort_order integer DEFAULT 1 NOT NULL,
    produced_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.order_item_customizations OWNER TO postgres;

--
-- Name: order_item_customizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_item_customizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_item_customizations_id_seq OWNER TO postgres;

--
-- Name: order_item_customizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_item_customizations_id_seq OWNED BY public.order_item_customizations.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    drink_id integer NOT NULL,
    drink_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(8,2) NOT NULL,
    line_total numeric(8,2) NOT NULL,
    special_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    kitchen_station text DEFAULT 'main'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    ready_at timestamp with time zone,
    kitchen_station_id integer
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number text NOT NULL,
    barista_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    customer_name text,
    subtotal numeric(8,2) NOT NULL,
    discount numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(8,2) NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    amount_tendered numeric(8,2),
    change_due numeric(8,2),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    discount_id integer,
    discount_code text,
    discount_value numeric(8,2),
    discount_type text,
    cashier_id integer,
    paid_at timestamp with time zone,
    ready_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    branch_id integer NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: predefined_slot_type_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predefined_slot_type_options (
    id integer NOT NULL,
    predefined_slot_id integer NOT NULL,
    ingredient_type_id integer NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    processed_qty numeric(10,4),
    produced_qty numeric(10,4),
    unit text,
    extra_cost numeric(8,4),
    pricing_mode text
);


ALTER TABLE public.predefined_slot_type_options OWNER TO postgres;

--
-- Name: predefined_slot_type_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.predefined_slot_type_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predefined_slot_type_options_id_seq OWNER TO postgres;

--
-- Name: predefined_slot_type_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.predefined_slot_type_options_id_seq OWNED BY public.predefined_slot_type_options.id;


--
-- Name: predefined_slot_volumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predefined_slot_volumes (
    id integer NOT NULL,
    predefined_slot_id integer NOT NULL,
    type_volume_id integer NOT NULL,
    processed_qty numeric(10,4),
    produced_qty numeric(10,4),
    unit text,
    extra_cost numeric(8,4),
    is_default boolean DEFAULT false NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.predefined_slot_volumes OWNER TO postgres;

--
-- Name: predefined_slot_volumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.predefined_slot_volumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predefined_slot_volumes_id_seq OWNER TO postgres;

--
-- Name: predefined_slot_volumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.predefined_slot_volumes_id_seq OWNED BY public.predefined_slot_volumes.id;


--
-- Name: predefined_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predefined_slots (
    id integer NOT NULL,
    name text NOT NULL,
    slot_label text NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    is_dynamic boolean DEFAULT false NOT NULL,
    affects_cup_size boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.predefined_slots OWNER TO postgres;

--
-- Name: predefined_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.predefined_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predefined_slots_id_seq OWNER TO postgres;

--
-- Name: predefined_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.predefined_slots_id_seq OWNED BY public.predefined_slots.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    permission_key character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    role_key character varying(50) NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO postgres;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    scope text DEFAULT 'global'::text NOT NULL,
    user_id integer,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: stock_audit_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_audit_items (
    id integer NOT NULL,
    audit_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    expected_quantity numeric(12,4) NOT NULL,
    actual_quantity numeric(12,4) NOT NULL,
    final_quantity numeric(12,4),
    notes text
);


ALTER TABLE public.stock_audit_items OWNER TO postgres;

--
-- Name: stock_audit_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_audit_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_audit_items_id_seq OWNER TO postgres;

--
-- Name: stock_audit_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_audit_items_id_seq OWNED BY public.stock_audit_items.id;


--
-- Name: stock_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_audits (
    id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by integer NOT NULL,
    approved_by integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    branch_id integer
);


ALTER TABLE public.stock_audits OWNER TO postgres;

--
-- Name: stock_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_audits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_audits_id_seq OWNER TO postgres;

--
-- Name: stock_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_audits_id_seq OWNED BY public.stock_audits.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    ingredient_id integer NOT NULL,
    order_id integer,
    movement_type text NOT NULL,
    quantity numeric(12,4) NOT NULL,
    quantity_after numeric(12,4) NOT NULL,
    note text,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    branch_id integer
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_key character varying(100) NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_permissions_id_seq OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'barista'::text NOT NULL,
    pin character varying(6),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username character varying(50),
    password_hash text,
    is_active boolean DEFAULT true NOT NULL,
    branch_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: cashier_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_sessions ALTER COLUMN id SET DEFAULT nextval('public.cashier_sessions_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- Name: drink_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_categories ALTER COLUMN id SET DEFAULT nextval('public.drink_categories_id_seq'::regclass);


--
-- Name: drink_ingredient_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots ALTER COLUMN id SET DEFAULT nextval('public.drink_ingredient_slots_id_seq'::regclass);


--
-- Name: drink_slot_type_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_type_options ALTER COLUMN id SET DEFAULT nextval('public.drink_slot_type_options_id_seq'::regclass);


--
-- Name: drink_slot_volumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_volumes ALTER COLUMN id SET DEFAULT nextval('public.drink_slot_volumes_id_seq'::regclass);


--
-- Name: drinks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drinks ALTER COLUMN id SET DEFAULT nextval('public.drinks_id_seq'::regclass);


--
-- Name: ingredient_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_categories ALTER COLUMN id SET DEFAULT nextval('public.ingredient_categories_id_seq'::regclass);


--
-- Name: ingredient_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_options ALTER COLUMN id SET DEFAULT nextval('public.ingredient_options_id_seq'::regclass);


--
-- Name: ingredient_type_volumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_type_volumes ALTER COLUMN id SET DEFAULT nextval('public.ingredient_type_volumes_id_seq'::regclass);


--
-- Name: ingredient_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_types ALTER COLUMN id SET DEFAULT nextval('public.ingredient_types_id_seq'::regclass);


--
-- Name: ingredient_volumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_volumes ALTER COLUMN id SET DEFAULT nextval('public.ingredient_volumes_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: kitchen_stations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_stations ALTER COLUMN id SET DEFAULT nextval('public.kitchen_stations_id_seq'::regclass);


--
-- Name: order_item_customizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_customizations ALTER COLUMN id SET DEFAULT nextval('public.order_item_customizations_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: predefined_slot_type_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_type_options ALTER COLUMN id SET DEFAULT nextval('public.predefined_slot_type_options_id_seq'::regclass);


--
-- Name: predefined_slot_volumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_volumes ALTER COLUMN id SET DEFAULT nextval('public.predefined_slot_volumes_id_seq'::regclass);


--
-- Name: predefined_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slots ALTER COLUMN id SET DEFAULT nextval('public.predefined_slots_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: stock_audit_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audit_items ALTER COLUMN id SET DEFAULT nextval('public.stock_audit_items_id_seq'::regclass);


--
-- Name: stock_audits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audits ALTER COLUMN id SET DEFAULT nextval('public.stock_audits_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	228436272f0c4f72087f5faaeee25b3c4a19c9205f45efe1bbefb19c27342f86	1777571199298
2	5f2961e720764e4da02908ecb39f940097f62b2a42fec4ebfe00135e399cf0f5	1777573831690
3	0a72bd7c7f43f3434ad515397ace043c9c8711084877678758dc9b7f1d5ea51d	1777642581531
4	96f7d713ee4a50cf87b58c9380e88a38db853ac2da24ba69a4b6f45e0f709434	1777643500000
5	c9779cc2ec04b8a3de59a524331091facf9a0051a28655115df775fa4967f972	1777801780115
6	0da862e4e96aa4c032338ec8b00bb2252add62d8b34f99b0a459695a9c99464d	1778413955000
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, created_at) FROM stdin;
1	8	LOGIN	user	8	{"ip": "102.58.244.34", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1"}	2026-04-29 19:53:53.168993+03
2	8	LOGIN	user	8	{"ip": "196.153.104.5", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 21:24:55.661477+03
3	8	LOGIN	user	8	{"ip": "156.193.208.169", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1"}	2026-04-29 22:23:34.458886+03
4	8	LOGIN	user	8	{"ip": "41.47.37.95", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 23:04:42.95998+03
5	3	LOGIN	user	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"}	2026-04-30 10:16:27.882365+03
6	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 10:21:18.482453+03
7	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 10:22:56.583211+03
8	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 10:23:10.580845+03
9	3	LOGIN	user	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 10:23:36.785495+03
10	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 10:24:57.582206+03
11	3	LOGIN	user	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-04-30 10:29:42.081749+03
12	3	LOGIN	user	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-04-30 10:32:47.781731+03
13	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 11:58:59.161589+03
14	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 12:19:30.481829+03
15	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 12:19:59.364849+03
16	8	LOGIN	user	8	{"ip": "41.232.68.251", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 12:23:07.99344+03
17	8	LOGIN	user	8	{"ip": "102.58.136.191", "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"}	2026-04-30 12:40:26.230535+03
18	8	LOGIN	user	8	{"ip": "102.58.136.191", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1"}	2026-04-30 13:16:55.973402+03
19	8	LOGIN	user	8	{"ip": "156.182.216.90", "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"}	2026-04-30 15:18:16.868823+03
20	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 15:39:26.205966+03
21	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 15:41:45.446752+03
22	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 15:42:08.448047+03
23	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 15:42:46.053794+03
24	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 15:46:00.566492+03
25	3	LOGIN	user	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-04-30 15:52:23.167883+03
26	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1"}	2026-04-30 16:37:29.189836+03
27	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 17:10:43.267972+03
28	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 17:11:16.219936+03
29	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 17:11:50.003755+03
30	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 17:12:00.915559+03
31	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 18:33:27.365528+03
32	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-04-30 18:58:42.833307+03
33	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-04-30 19:04:07.410906+03
34	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 19:07:35.012469+03
35	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 19:46:37.153676+03
36	8	LOGIN	user	8	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:16:01.686571+03
37	8	LOGIN	user	8	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:36:20.224752+03
38	8	LOGIN	user	8	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:36:22.121664+03
39	9	LOGIN	user	9	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:36:40.90606+03
40	8	LOGIN	user	8	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:36:57.794668+03
41	5	LOGIN	user	5	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 20:37:13.166817+03
42	8	LOGIN	user	8	{"ip": "196.137.21.125", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 21:03:03.928061+03
43	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 21:08:17.300384+03
44	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 21:08:26.046849+03
45	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 21:08:35.600734+03
46	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1"}	2026-04-30 22:03:49.172396+03
47	8	LOGIN	user	8	{"ip": "197.54.166.73", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-30 23:20:17.211072+03
48	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 09:47:33.301798+03
49	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 11:58:01.023625+03
50	8	LOGIN	user	8	{"ip": "197.54.166.73", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1"}	2026-05-01 15:33:48.677892+03
51	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 18:27:58.759106+03
52	1	CREATE_STOCK_AUDIT	stock_audit	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 20:44:39.910948+03
53	6	UPDATE_ORDER_STATUS	order	166	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 20:52:06.593371+03
54	1	APPROVE_STOCK_AUDIT	stock_audit	3	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 20:58:43.000154+03
55	6	UPDATE_ORDER_STATUS	order	167	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 21:49:14.930741+03
56	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1"}	2026-05-01 22:06:43.275213+03
57	6	UPDATE_ORDER_STATUS	order	168	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 22:07:14.339333+03
58	6	UPDATE_ORDER_STATUS	order	169	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 22:07:14.85381+03
59	1	UPDATE_INGREDIENT	ingredient	361	{"ip": "84.36.128.34", "name": "butter biscuits box ", "slug": "butter-biscuits-box", "unit": "pcs", "isActive": true, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "costPerUnit": "0", "ingredientType": "other", "lowStockThreshold": "500"}	2026-05-01 22:19:06.221735+03
60	1	UPDATE_INGREDIENT	ingredient	353	{"ip": "84.36.128.34", "name": "Plain Butter Croissant", "slug": "plain-butter-croissant", "unit": "pcs", "isActive": true, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "costPerUnit": "0", "ingredientType": "other", "lowStockThreshold": "100"}	2026-05-01 22:20:50.272362+03
61	6	UPDATE_ORDER_STATUS	order	170	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 22:28:07.246098+03
62	6	UPDATE_ORDER_STATUS	order	172	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 22:28:11.929707+03
63	6	UPDATE_ORDER_STATUS	order	173	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 22:28:12.725407+03
64	6	UPDATE_ORDER_STATUS	order	175	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 23:22:51.34468+03
65	6	UPDATE_ORDER_STATUS	order	176	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 23:29:16.077684+03
66	8	LOGIN	user	8	{"ip": "156.210.181.136", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-01 23:31:46.730651+03
67	8	LOGIN	user	8	{"ip": "197.47.202.214", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 00:04:34.893641+03
68	8	CREATE_USER	user	10	{"ip": "197.47.202.214", "name": "Hussain Finance", "role": "admin", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 14:39:55.698265+03
69	8	UPDATE_USER_PERMISSIONS	user	10	{"ip": "197.47.202.214", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 14:46:51.186218+03
70	6	UPDATE_ORDER_STATUS	order	177	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 16:04:14.954149+03
71	6	UPDATE_ORDER_STATUS	order	178	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 16:04:16.112596+03
72	6	UPDATE_ORDER_STATUS	order	179	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 16:04:17.010026+03
73	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 16:04:21.094885+03
74	6	UPDATE_ORDER_STATUS	order	180	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 17:28:30.038798+03
75	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-02 23:04:59.833807+03
76	8	LOGIN	user	8	{"ip": "197.47.202.214", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 01:55:01.959119+03
77	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-03 09:55:04.529065+03
78	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 09:55:36.914042+03
79	2	LOGOUT	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 10:08:15.561261+03
80	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 10:08:31.701657+03
81	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 11:05:43.705807+03
82	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 11:14:43.924614+03
83	2	LOGOUT	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 11:15:49.051475+03
84	2	LOGIN	user	2	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 11:15:51.123508+03
85	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 11:30:44.181611+03
86	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-03 12:59:11.092113+03
87	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 13:22:30.01286+03
88	6	LOGIN	user	6	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 13:31:45.839529+03
89	6	UPDATE_ORDER_STATUS	order	193	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 13:32:33.129072+03
90	6	UPDATE_ORDER_STATUS	order	192	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 13:32:34.275053+03
91	6	UPDATE_ORDER_STATUS	order	194	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 13:48:12.637489+03
92	6	UPDATE_ORDER_STATUS	order	195	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 14:07:27.778427+03
93	6	UPDATE_ORDER_STATUS	order	196	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 14:33:50.561829+03
94	6	UPDATE_ORDER_STATUS	order	198	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:00:28.490034+03
95	6	UPDATE_ORDER_STATUS	order	200	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:27:56.228716+03
96	6	UPDATE_ORDER_STATUS	order	201	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:30:50.960937+03
97	6	UPDATE_ORDER_STATUS	order	202	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:43:38.882172+03
98	6	UPDATE_ORDER_STATUS	order	203	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:48:48.863847+03
99	6	UPDATE_ORDER_STATUS	order	204	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 15:48:49.693139+03
100	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 26_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/147.0.7727.99 Mobile/15E148 Safari/604.1"}	2026-05-03 17:51:17.493074+03
101	6	UPDATE_ORDER_STATUS	order	205	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 18:06:22.57415+03
102	6	UPDATE_ORDER_STATUS	order	206	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 18:06:22.804784+03
103	6	UPDATE_ORDER_STATUS	order	207	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 19:24:55.73672+03
104	6	UPDATE_ORDER_STATUS	order	208	{"ip": "84.36.128.34", "status": "completed", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-03 20:10:51.973498+03
105	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:27:28.93886+03
106	8	CREATE_ROLE	role	7	{"ip": "84.36.128.34", "key": "finance", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:31:38.866388+03
107	8	UPDATE_USER	user	10	{"ip": "84.36.128.34", "name": "Finance Department", "role": "finance", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:34:07.776461+03
108	8	UPDATE_USER	user	4	{"ip": "84.36.128.34", "name": "Spacca POS", "role": "frontdesk", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:51:18.584955+03
109	8	CREATE_USER	user	12	{"ip": "84.36.128.34", "name": "Finance Department", "role": "finance", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:53:34.232422+03
110	8	UPDATE_USER_PERMISSIONS	user	12	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:54:46.416643+03
111	1	LOGIN	user	1	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 12:57:26.074668+03
112	12	LOGIN	user	12	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 13:04:07.783124+03
113	8	LOGIN	user	8	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 13:28:15.53862+03
114	12	LOGIN	user	12	{"ip": "197.37.52.5", "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"}	2026-05-04 14:55:07.235456+03
115	1	UPDATE_INGREDIENT	ingredient	337	{"ip": "84.36.128.34", "name": "Belgian Milk Chocolate Caramel Dragees 70g", "slug": "belgian-milk-chocolate-caramel-dragees-70g", "unit": "pcs", "isActive": true, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "costPerUnit": "0", "ingredientType": "other", "lowStockThreshold": "500"}	2026-05-04 16:18:42.039694+03
116	8	UPDATE_USER_PERMISSIONS	user	5	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 16:24:27.11181+03
117	1	UPDATE_INGREDIENT	ingredient	334	{"ip": "84.36.128.34", "name": "Almond Cashew Pumpkin BAR 40g", "slug": "almond-cashew-pumpkin-bar-40g", "unit": "pcs", "isActive": true, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "costPerUnit": "0", "ingredientType": "other", "lowStockThreshold": "500"}	2026-05-04 16:26:43.774205+03
118	8	UPDATE_USER_PERMISSIONS	user	5	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 16:28:08.932854+03
119	1	UPDATE_INGREDIENT	ingredient	334	{"ip": "84.36.128.34", "name": "Cashew Almond Pumpkin BAR 40g", "slug": "cashew-almond-pumpkin-bar-40g", "unit": "pcs", "isActive": true, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36", "costPerUnit": "0", "ingredientType": "other", "lowStockThreshold": "500"}	2026-05-04 16:29:14.34561+03
120	8	UPDATE_USER_PERMISSIONS	user	5	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 16:53:11.360048+03
121	5	LOGIN	user	5	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:07:34.246877+03
122	5	UPDATE_ORDER_STATUS	order	213	{"ip": "84.36.128.34", "status": "cancelled", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:07:39.456068+03
123	5	UPDATE_ORDER_STATUS	order	214	{"ip": "84.36.128.34", "status": "cancelled", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:07:53.849117+03
124	12	LOGIN	user	12	{"ip": "197.37.52.5", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:10:48.323266+03
125	1	RESTOCK_INGREDIENT	ingredient	224	{"ip": "84.36.128.34", "quantity": 12881, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.531402+03
126	1	RESTOCK_INGREDIENT	ingredient	225	{"ip": "84.36.128.34", "quantity": 6990, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.532375+03
127	1	RESTOCK_INGREDIENT	ingredient	226	{"ip": "84.36.128.34", "quantity": 3090, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.539094+03
128	1	RESTOCK_INGREDIENT	ingredient	227	{"ip": "84.36.128.34", "quantity": 743, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.542099+03
129	1	RESTOCK_INGREDIENT	ingredient	228	{"ip": "84.36.128.34", "quantity": 1658, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.542646+03
130	1	RESTOCK_INGREDIENT	ingredient	229	{"ip": "84.36.128.34", "quantity": 1370, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.568806+03
131	1	RESTOCK_INGREDIENT	ingredient	230	{"ip": "84.36.128.34", "quantity": 1455, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.570852+03
132	1	RESTOCK_INGREDIENT	ingredient	231	{"ip": "84.36.128.34", "quantity": 1150, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.586362+03
133	1	RESTOCK_INGREDIENT	ingredient	232	{"ip": "84.36.128.34", "quantity": 797, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.587119+03
134	1	RESTOCK_INGREDIENT	ingredient	233	{"ip": "84.36.128.34", "quantity": 1002, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.60734+03
140	1	RESTOCK_INGREDIENT	ingredient	240	{"ip": "84.36.128.34", "quantity": 6000, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:35.901552+03
149	1	RESTOCK_INGREDIENT	ingredient	248	{"ip": "84.36.128.34", "quantity": 435, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:52.482168+03
152	1	RESTOCK_INGREDIENT	ingredient	251	{"ip": "84.36.128.34", "quantity": 5074, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:07.433667+03
154	1	RESTOCK_INGREDIENT	ingredient	253	{"ip": "84.36.128.34", "quantity": 4738, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:07.815028+03
164	1	RESTOCK_INGREDIENT	ingredient	263	{"ip": "84.36.128.34", "quantity": 5100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:30.742382+03
169	1	RESTOCK_INGREDIENT	ingredient	268	{"ip": "84.36.128.34", "quantity": 4493, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:56.010655+03
171	1	RESTOCK_INGREDIENT	ingredient	270	{"ip": "84.36.128.34", "quantity": 4845, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:19.72027+03
181	1	RESTOCK_INGREDIENT	ingredient	279	{"ip": "84.36.128.34", "quantity": 11, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:56.494414+03
185	1	RESTOCK_INGREDIENT	ingredient	284	{"ip": "84.36.128.34", "quantity": 51, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:34.935959+03
135	1	RESTOCK_INGREDIENT	ingredient	235	{"ip": "84.36.128.34", "quantity": 12750, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.640436+03
137	1	RESTOCK_INGREDIENT	ingredient	236	{"ip": "84.36.128.34", "quantity": 5100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.660317+03
138	1	RESTOCK_INGREDIENT	ingredient	237	{"ip": "84.36.128.34", "quantity": 398, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.662942+03
142	1	RESTOCK_INGREDIENT	ingredient	241	{"ip": "84.36.128.34", "quantity": 309, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:38.491385+03
153	1	RESTOCK_INGREDIENT	ingredient	252	{"ip": "84.36.128.34", "quantity": 4795, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:07.564308+03
174	1	RESTOCK_INGREDIENT	ingredient	273	{"ip": "84.36.128.34", "quantity": 943, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:26.18651+03
175	1	RESTOCK_INGREDIENT	ingredient	274	{"ip": "84.36.128.34", "quantity": 150, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:37.915828+03
186	1	RESTOCK_INGREDIENT	ingredient	285	{"ip": "84.36.128.34", "quantity": 0, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:34.940926+03
187	1	RESTOCK_INGREDIENT	ingredient	286	{"ip": "84.36.128.34", "quantity": 700, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:45.490601+03
136	1	RESTOCK_INGREDIENT	ingredient	234	{"ip": "84.36.128.34", "quantity": 475, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.641703+03
139	1	RESTOCK_INGREDIENT	ingredient	238	{"ip": "84.36.128.34", "quantity": 4220, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:33.6711+03
141	1	RESTOCK_INGREDIENT	ingredient	239	{"ip": "84.36.128.34", "quantity": 6030, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:35.904514+03
143	1	RESTOCK_INGREDIENT	ingredient	242	{"ip": "84.36.128.34", "quantity": 6482, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:38.845929+03
144	1	RESTOCK_INGREDIENT	ingredient	243	{"ip": "84.36.128.34", "quantity": 0, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:38.895195+03
146	1	RESTOCK_INGREDIENT	ingredient	245	{"ip": "84.36.128.34", "quantity": 2700, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:48.066509+03
145	1	RESTOCK_INGREDIENT	ingredient	244	{"ip": "84.36.128.34", "quantity": 5715, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:48.065847+03
148	1	RESTOCK_INGREDIENT	ingredient	247	{"ip": "84.36.128.34", "quantity": 380, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:52.250304+03
151	1	RESTOCK_INGREDIENT	ingredient	250	{"ip": "84.36.128.34", "quantity": 4564, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:04.382133+03
155	1	RESTOCK_INGREDIENT	ingredient	254	{"ip": "84.36.128.34", "quantity": 3613, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:14.18386+03
156	1	RESTOCK_INGREDIENT	ingredient	255	{"ip": "84.36.128.34", "quantity": 3978, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:14.185031+03
158	1	RESTOCK_INGREDIENT	ingredient	257	{"ip": "84.36.128.34", "quantity": 1868, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:16.799702+03
160	1	RESTOCK_INGREDIENT	ingredient	260	{"ip": "84.36.128.34", "quantity": 4058, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:25.143182+03
161	1	RESTOCK_INGREDIENT	ingredient	259	{"ip": "84.36.128.34", "quantity": 2750, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:25.149831+03
162	1	RESTOCK_INGREDIENT	ingredient	261	{"ip": "84.36.128.34", "quantity": 2348, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:29.637612+03
166	1	RESTOCK_INGREDIENT	ingredient	265	{"ip": "84.36.128.34", "quantity": 1645, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:47.714263+03
167	1	RESTOCK_INGREDIENT	ingredient	266	{"ip": "84.36.128.34", "quantity": 300, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:54.196371+03
168	1	RESTOCK_INGREDIENT	ingredient	267	{"ip": "84.36.128.34", "quantity": 202, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:55.11369+03
170	1	RESTOCK_INGREDIENT	ingredient	269	{"ip": "84.36.128.34", "quantity": 824, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:19.719535+03
172	1	RESTOCK_INGREDIENT	ingredient	271	{"ip": "84.36.128.34", "quantity": 112, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:25.277543+03
176	1	RESTOCK_INGREDIENT	ingredient	275	{"ip": "84.36.128.34", "quantity": 298, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:37.919062+03
177	1	RESTOCK_INGREDIENT	ingredient	276	{"ip": "84.36.128.34", "quantity": 63, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:42.373773+03
179	1	RESTOCK_INGREDIENT	ingredient	278	{"ip": "84.36.128.34", "quantity": 136, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:43.310622+03
180	1	RESTOCK_INGREDIENT	ingredient	280	{"ip": "84.36.128.34", "quantity": -224, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:56.493742+03
182	1	RESTOCK_INGREDIENT	ingredient	281	{"ip": "84.36.128.34", "quantity": 10, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:06.618825+03
183	1	RESTOCK_INGREDIENT	ingredient	282	{"ip": "84.36.128.34", "quantity": 14, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:07.57554+03
188	1	RESTOCK_INGREDIENT	ingredient	287	{"ip": "84.36.128.34", "quantity": 1282, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:46.7865+03
189	1	RESTOCK_INGREDIENT	ingredient	288	{"ip": "84.36.128.34", "quantity": 809, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:48.010662+03
147	1	RESTOCK_INGREDIENT	ingredient	246	{"ip": "84.36.128.34", "quantity": 1645, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:12:51.983021+03
150	1	RESTOCK_INGREDIENT	ingredient	249	{"ip": "84.36.128.34", "quantity": 4787, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:04.381415+03
157	1	RESTOCK_INGREDIENT	ingredient	256	{"ip": "84.36.128.34", "quantity": 6012, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:16.53191+03
163	1	RESTOCK_INGREDIENT	ingredient	262	{"ip": "84.36.128.34", "quantity": 5100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:30.265385+03
165	1	RESTOCK_INGREDIENT	ingredient	264	{"ip": "84.36.128.34", "quantity": 3487, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:47.711238+03
173	1	RESTOCK_INGREDIENT	ingredient	272	{"ip": "84.36.128.34", "quantity": 111, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:25.773966+03
178	1	RESTOCK_INGREDIENT	ingredient	277	{"ip": "84.36.128.34", "quantity": 46, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:14:42.773153+03
184	1	RESTOCK_INGREDIENT	ingredient	283	{"ip": "84.36.128.34", "quantity": 3729, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:15:09.259257+03
159	1	RESTOCK_INGREDIENT	ingredient	258	{"ip": "84.36.128.34", "quantity": 5663, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:13:17.202624+03
190	1	RESTOCK_INGREDIENT	ingredient	289	{"ip": "84.36.128.34", "quantity": 127, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:18.442117+03
191	1	RESTOCK_INGREDIENT	ingredient	290	{"ip": "84.36.128.34", "quantity": 47, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:18.443198+03
192	1	RESTOCK_INGREDIENT	ingredient	291	{"ip": "84.36.128.34", "quantity": 138, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:26.437074+03
193	1	RESTOCK_INGREDIENT	ingredient	292	{"ip": "84.36.128.34", "quantity": 1950, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:27.091069+03
194	1	RESTOCK_INGREDIENT	ingredient	293	{"ip": "84.36.128.34", "quantity": 200, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:28.258352+03
195	1	RESTOCK_INGREDIENT	ingredient	294	{"ip": "84.36.128.34", "quantity": 150, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:49.739942+03
196	1	RESTOCK_INGREDIENT	ingredient	295	{"ip": "84.36.128.34", "quantity": 100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:49.743385+03
197	1	RESTOCK_INGREDIENT	ingredient	296	{"ip": "84.36.128.34", "quantity": 300, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:55.444387+03
198	1	RESTOCK_INGREDIENT	ingredient	297	{"ip": "84.36.128.34", "quantity": 358, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:55.988108+03
199	1	RESTOCK_INGREDIENT	ingredient	298	{"ip": "84.36.128.34", "quantity": 682, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:16:56.571758+03
200	1	RESTOCK_INGREDIENT	ingredient	299	{"ip": "84.36.128.34", "quantity": 282, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:09.643335+03
201	1	RESTOCK_INGREDIENT	ingredient	300	{"ip": "84.36.128.34", "quantity": 606, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:09.645542+03
202	1	RESTOCK_INGREDIENT	ingredient	301	{"ip": "84.36.128.34", "quantity": 321, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:14.498491+03
203	1	RESTOCK_INGREDIENT	ingredient	302	{"ip": "84.36.128.34", "quantity": 186, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:14.987412+03
204	1	RESTOCK_INGREDIENT	ingredient	303	{"ip": "84.36.128.34", "quantity": 550, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:15.58849+03
205	1	RESTOCK_INGREDIENT	ingredient	305	{"ip": "84.36.128.34", "quantity": 723, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:29.943611+03
206	1	RESTOCK_INGREDIENT	ingredient	304	{"ip": "84.36.128.34", "quantity": 872, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:29.944043+03
207	1	RESTOCK_INGREDIENT	ingredient	306	{"ip": "84.36.128.34", "quantity": 945, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:38.142423+03
208	1	RESTOCK_INGREDIENT	ingredient	307	{"ip": "84.36.128.34", "quantity": 55, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:39.172609+03
209	1	RESTOCK_INGREDIENT	ingredient	308	{"ip": "84.36.128.34", "quantity": 1507, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:17:40.31421+03
210	1	RESTOCK_INGREDIENT	ingredient	309	{"ip": "84.36.128.34", "quantity": 2, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:08.961986+03
211	1	RESTOCK_INGREDIENT	ingredient	310	{"ip": "84.36.128.34", "quantity": 3, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:08.962907+03
212	1	RESTOCK_INGREDIENT	ingredient	311	{"ip": "84.36.128.34", "quantity": 30, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:18.302441+03
213	1	RESTOCK_INGREDIENT	ingredient	312	{"ip": "84.36.128.34", "quantity": 3, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:19.364409+03
214	1	RESTOCK_INGREDIENT	ingredient	313	{"ip": "84.36.128.34", "quantity": 1000, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:20.490233+03
215	1	RESTOCK_INGREDIENT	ingredient	314	{"ip": "84.36.128.34", "quantity": 486, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:45.427882+03
216	1	RESTOCK_INGREDIENT	ingredient	315	{"ip": "84.36.128.34", "quantity": 0, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-04 17:18:45.42944+03
217	5	LOGIN	user	5	{"ip": "84.36.128.34", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-04 17:52:27.77948+03
218	8	LOGIN	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 03:39:05.925962+03
219	8	CREATE_STOCK_AUDIT	stock_audit	4	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:26:13.735297+03
220	8	CREATE_STOCK_AUDIT	stock_audit	5	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:27:23.10965+03
221	8	LOGOUT	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:38:59.159511+03
222	12	LOGIN	user	12	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:39:15.055719+03
223	12	LOGOUT	user	12	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:40:31.324933+03
224	8	LOGIN	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:40:33.473665+03
225	8	UPDATE_USER_PERMISSIONS	user	12	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:40:52.076894+03
226	12	LOGIN	user	12	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-05 11:41:15.023367+03
227	8	UPDATE_USER_PERMISSIONS	user	12	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 11:42:00.182822+03
228	8	CREATE_ORDER	order	215	{"ip": "::1", "total": 105, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 17:34:44.410439+03
229	5	UPDATE_ORDER_STATUS	order	215	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-05 17:35:12.990699+03
230	8	CREATE_ORDER	order	216	{"ip": "::1", "total": 105, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 17:38:16.696742+03
231	5	UPDATE_ORDER_STATUS	order	216	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-05 17:38:35.351152+03
232	8	CREATE_ORDER	order	217	{"ip": "::1", "total": 255, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 17:43:10.34939+03
233	5	UPDATE_ORDER_STATUS	order	217	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-05 17:43:17.253862+03
234	8	CREATE_ORDER	order	218	{"ip": "::1", "total": 285, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 18:00:21.258364+03
235	5	UPDATE_ORDER_STATUS	order	218	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-05 18:00:27.648434+03
236	8	LOGOUT	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 18:15:48.149876+03
237	8	LOGIN	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-05 18:15:50.594015+03
238	8	LOGIN	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-07 21:07:52.632133+03
239	6	LOGIN	user	6	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:33:20.603045+03
240	8	UPDATE_USER_PERMISSIONS	user	6	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-07 23:33:48.964197+03
241	8	UPDATE_USER_PERMISSIONS	user	6	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-07 23:34:48.660513+03
242	6	UPDATE_ORDER_STATUS	order	209	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:34:54.039692+03
243	6	UPDATE_ORDER_STATUS	order	210	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:34:58.590919+03
244	6	UPDATE_ORDER_STATUS	order	212	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:35:00.064202+03
245	6	UPDATE_ORDER_STATUS	order	215	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:35:01.779182+03
246	6	UPDATE_ORDER_STATUS	order	216	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:35:03.208066+03
247	6	UPDATE_ORDER_STATUS	order	217	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:35:05.163379+03
248	6	UPDATE_ORDER_STATUS	order	218	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-07 23:35:06.631603+03
249	8	CREATE_ORDER	order	219	{"ip": "::1", "total": 615, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-07 23:36:01.921219+03
250	5	UPDATE_ORDER_STATUS	order	219	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}	2026-05-07 23:36:52.19161+03
251	8	CREATE_ORDER	order	220	{"ip": "::1", "total": 224.56140350877192, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-08 22:23:15.506566+03
252	5	UPDATE_ORDER_STATUS	order	220	{"ip": "::1", "status": "paid", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"}	2026-05-08 22:23:49.011216+03
253	6	UPDATE_ORDER_STATUS	order	219	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-08 22:25:05.389549+03
254	6	UPDATE_ORDER_STATUS	order	220	{"ip": "::1", "status": "completed", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0"}	2026-05-08 22:25:07.524249+03
255	8	LOGIN	user	8	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 16:03:46.534002+03
256	8	RESTOCK_INGREDIENT	ingredient	319	{"ip": "::1", "quantity": 100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 16:08:38.544752+03
257	8	RESTOCK_INGREDIENT	ingredient	318	{"ip": "::1", "quantity": 50, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 16:35:13.395889+03
258	8	RESTOCK_INGREDIENT	ingredient	279	{"ip": "::1", "quantity": 100, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 17:01:00.889053+03
259	8	RESTOCK_INGREDIENT	ingredient	285	{"ip": "::1", "quantity": 24, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 17:08:10.592994+03
260	8	RESTOCK_INGREDIENT	ingredient	284	{"ip": "::1", "quantity": 50, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 17:08:10.621834+03
261	8	RESTOCK_INGREDIENT	ingredient	279	{"ip": "::1", "quantity": 500, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-05-11 17:09:49.419905+03
\.


--
-- Data for Name: branch_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branch_stock (branch_id, ingredient_id, stock_quantity, low_stock_threshold, updated_at, startup_quantity) FROM stdin;
1	306	945.0000	500.0000	2026-05-04 17:17:34.324965+03	0.0000
1	307	55.0000	500.0000	2026-05-04 17:17:35.134418+03	0.0000
1	227	743.0000	500.0000	2026-05-04 17:12:33.513425+03	0.0000
1	228	1658.0000	500.0000	2026-05-04 17:12:33.516274+03	0.0000
1	226	3090.0000	500.0000	2026-05-04 17:12:33.536402+03	0.0000
1	229	1370.0000	500.0000	2026-05-04 17:12:33.56683+03	0.0000
1	308	1507.0000	500.0000	2026-05-04 17:17:36.044048+03	0.0000
1	309	2.0000	500.0000	2026-05-04 17:18:03.388174+03	0.0000
1	230	1455.0000	500.0000	2026-05-04 17:12:33.56731+03	0.0000
1	231	1150.0000	500.0000	2026-05-04 17:12:33.584+03	0.0000
1	310	3.0000	500.0000	2026-05-04 17:18:03.390217+03	0.0000
1	232	797.0000	500.0000	2026-05-04 17:12:33.585429+03	0.0000
1	311	30.0000	500.0000	2026-05-04 17:18:14.566319+03	0.0000
1	233	1002.0000	500.0000	2026-05-04 17:12:33.605+03	0.0000
1	312	3.0000	500.0000	2026-05-04 17:18:15.50687+03	0.0000
1	234	475.0000	500.0000	2026-05-04 17:12:33.639+03	0.0000
1	236	5100.0000	500.0000	2026-05-04 17:12:33.658+03	0.0000
1	237	505.0000	500.0000	2026-05-04 17:12:33.661+03	0.0000
1	313	1000.0000	500.0000	2026-05-04 17:18:16.51319+03	0.0000
1	238	4220.0000	500.0000	2026-05-04 17:12:33.669002+03	0.0000
1	240	6000.0000	500.0000	2026-05-04 17:12:35.164664+03	0.0000
1	315	0.0000	500.0000	2026-05-04 17:18:41.608565+03	0.0000
1	239	6087.0000	500.0000	2026-05-04 17:12:34.57+03	0.0000
1	242	6482.0000	500.0000	2026-05-04 17:12:36.318+03	0.0000
1	243	0.0000	500.0000	2026-05-04 17:12:37.516667+03	0.0000
1	314	486.0000	500.0000	2026-05-04 17:18:41.608968+03	0.0000
1	245	2700.0000	500.0000	2026-05-04 17:12:44.655+03	0.0000
1	246	1645.0000	500.0000	2026-05-04 17:12:48.816+03	0.0000
1	247	380.0000	500.0000	2026-05-04 17:12:50.598858+03	0.0000
1	249	4787.0000	500.0000	2026-05-04 17:13:02.320651+03	0.0000
1	250	4564.0000	500.0000	2026-05-04 17:12:59.668+03	0.0000
1	251	5104.0000	500.0000	2026-05-04 17:13:04.823+03	0.0000
1	253	4738.0000	500.0000	2026-05-04 17:13:05.459+03	0.0000
1	255	3978.0000	500.0000	2026-05-04 17:13:13.072452+03	0.0000
1	256	6012.0000	500.0000	2026-05-04 17:13:15.467211+03	0.0000
1	257	1918.0000	500.0000	2026-05-04 17:13:14.546+03	0.0000
1	258	5663.0000	500.0000	2026-05-04 17:13:14.925+03	0.0000
1	261	2348.0000	500.0000	2026-05-04 17:13:25.68+03	0.0000
1	262	5100.0000	500.0000	2026-05-04 17:13:26.085+03	0.0000
1	263	5100.0000	500.0000	2026-05-04 17:13:28.351591+03	0.0000
1	264	3547.0000	500.0000	2026-05-04 17:13:41.073+03	0.0000
1	265	1645.0000	500.0000	2026-05-04 17:13:44.30724+03	0.0000
1	266	300.0000	500.0000	2026-05-04 17:13:51.340137+03	0.0000
1	267	277.0000	500.0000	2026-05-04 17:13:49.111+03	0.0000
1	268	4493.0000	500.0000	2026-05-04 17:13:52.621308+03	0.0000
1	337	0.0000	500.0000	2026-05-04 16:18:42.034424+03	0.0000
1	270	4845.0000	500.0000	2026-05-04 17:14:11.652+03	0.0000
1	271	115.0000	500.0000	2026-05-04 17:14:20.244+03	0.0000
1	272	111.0000	500.0000	2026-05-04 17:14:23.811236+03	0.0000
1	273	943.0000	500.0000	2026-05-04 17:14:24.327839+03	0.0000
1	274	150.0000	500.0000	2026-05-04 17:14:33.269+03	0.0000
1	275	300.0000	500.0000	2026-05-04 17:14:33.271+03	0.0000
1	276	63.0000	500.0000	2026-05-04 17:14:40.473601+03	0.0000
1	278	137.0000	500.0000	2026-05-04 17:14:39.431+03	0.0000
1	280	26.0000	500.0000	2026-05-04 17:14:51.023+03	0.0000
1	281	10.0000	500.0000	2026-05-04 17:15:00.861046+03	0.0000
1	282	14.0000	500.0000	2026-05-04 17:15:02.035291+03	0.0000
1	283	3729.0000	500.0000	2026-05-04 17:15:04.439839+03	0.0000
1	334	0.0000	500.0000	2026-05-04 16:29:14.343+03	0.0000
1	286	700.0000	500.0000	2026-05-04 17:15:40.781652+03	0.0000
1	287	1282.0000	500.0000	2026-05-04 17:15:42.060138+03	0.0000
1	288	809.0000	500.0000	2026-05-04 17:15:43.170758+03	0.0000
1	289	127.0000	500.0000	2026-05-04 17:16:13.410878+03	0.0000
1	290	47.0000	500.0000	2026-05-04 17:16:13.412074+03	0.0000
1	291	138.0000	500.0000	2026-05-04 17:16:23.025524+03	0.0000
1	292	1950.0000	500.0000	2026-05-04 17:16:23.683962+03	0.0000
1	293	200.0000	500.0000	2026-05-04 17:16:24.841549+03	0.0000
1	294	150.0000	500.0000	2026-05-04 17:16:46.02036+03	0.0000
1	295	100.0000	500.0000	2026-05-04 17:16:46.023268+03	0.0000
1	296	300.0000	500.0000	2026-05-04 17:16:53.226276+03	0.0000
1	298	683.0000	500.0000	2026-05-04 17:16:51.971+03	0.0000
1	299	282.0000	500.0000	2026-05-04 17:17:07.137228+03	0.0000
1	301	321.0000	500.0000	2026-05-04 17:17:12.418746+03	0.0000
1	303	550.0000	500.0000	2026-05-04 17:17:13.416889+03	0.0000
1	305	725.0000	500.0000	2026-05-04 17:17:23.938+03	0.0000
1	304	872.0000	500.0000	2026-05-04 17:17:26.752184+03	0.0000
1	300	604.0000	500.0000	2026-05-07 23:36:01.878+03	0.0000
1	224	12917.0000	500.0000	2026-05-07 23:36:01.891+03	0.0000
1	248	435.0000	500.0000	2026-05-07 23:36:01.891+03	0.0000
1	259	2805.0000	500.0000	2026-05-07 23:36:01.891+03	0.0000
1	244	5715.0000	500.0000	2026-05-07 23:36:01.891+03	0.0000
1	269	794.0000	500.0000	2026-05-07 23:36:01.891+03	0.0000
1	279	611.0000	500.0000	2026-05-11 17:09:49.386+03	0.0000
1	277	45.0000	500.0000	2026-05-07 23:36:01.904+03	0.0000
1	254	3593.0000	500.0000	2026-05-08 22:23:15.493+03	0.0000
1	241	820.0000	500.0000	2026-05-08 22:23:15.493+03	0.0000
1	260	4018.0000	500.0000	2026-05-05 18:00:21.249+03	0.0000
1	252	4735.0000	500.0000	2026-05-05 18:00:21.249+03	0.0000
1	302	180.0000	500.0000	2026-05-08 22:23:15.493+03	0.0000
1	225	6918.0000	500.0000	2026-05-10 20:57:39.864+03	0.0000
1	235	11760.0000	500.0000	2026-05-10 20:57:39.864+03	0.0000
1	297	355.0000	500.0000	2026-05-10 20:57:39.864+03	0.0000
1	319	100.0000	500.0000	2026-05-11 16:08:38.512967+03	0.0000
1	318	50.0000	500.0000	2026-05-11 16:35:13.369091+03	0.0000
1	284	50.0000	500.0000	2026-05-11 17:08:10.576+03	0.0000
1	285	25.0000	500.0000	2026-05-11 17:08:10.583+03	0.0000
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, code, is_active, created_at, updated_at, address, phone) FROM stdin;
1	Hale Town	MAIN	t	2026-05-03 12:56:07.592583+03	2026-05-03 13:11:41.24+03	Palm Hills - New Giza	
\.


--
-- Data for Name: cashier_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashier_sessions (id, cashier_id, started_at, ended_at, notes, ip_address, user_agent) FROM stdin;
1	5	2026-04-27 21:36:07.08287+03	2026-04-27 22:59:38.907+03	\N	\N	\N
2	5	2026-04-28 10:13:35.761321+03	2026-04-28 16:20:19.997+03	\N	\N	\N
3	5	2026-04-28 16:20:20.001961+03	2026-04-28 17:58:54.412+03	\N	\N	\N
4	5	2026-04-28 17:58:54.41524+03	2026-04-28 18:42:08.294+03	\N	\N	\N
5	5	2026-04-28 18:42:08.297999+03	2026-04-28 19:27:20.997+03	\N	\N	\N
6	5	2026-04-28 19:27:21.004879+03	2026-04-28 20:57:15.755+03	\N	\N	\N
8	7	2026-04-28 22:55:07.557184+03	\N	\N	\N	\N
7	5	2026-04-28 20:57:15.757797+03	2026-04-29 01:19:07.079+03	\N	\N	\N
9	5	2026-04-29 01:19:16.902091+03	2026-04-29 08:10:37.752+03	\N	\N	\N
10	5	2026-04-29 08:11:21.67495+03	2026-04-29 10:13:19.898+03	\N	\N	\N
11	5	2026-04-29 10:13:19.902286+03	2026-04-29 10:22:29.139+03	\N	\N	\N
12	5	2026-04-29 10:22:29.143449+03	2026-04-29 10:47:38.84+03	\N	\N	\N
13	5	2026-04-29 10:47:38.847285+03	2026-04-29 21:09:25.617+03	\N	\N	\N
14	5	2026-04-29 21:09:25.624446+03	2026-04-29 21:47:02.885+03	\N	\N	\N
15	5	2026-04-29 21:47:02.894152+03	2026-04-30 09:56:27.481+03	\N	\N	\N
16	5	2026-04-30 09:58:47.182976+03	2026-04-30 09:59:00.682+03	\N	\N	\N
17	5	2026-04-30 09:59:12.682377+03	2026-04-30 09:59:29.884+03	\N	\N	\N
18	5	2026-04-30 09:59:37.380316+03	2026-04-30 11:57:37.943+03	\N	\N	\N
19	5	2026-04-30 11:57:37.951905+03	2026-04-30 15:27:23.773+03	\N	\N	\N
20	5	2026-04-30 15:27:23.778216+03	2026-04-30 18:53:16.325+03	\N	\N	\N
21	5	2026-04-30 18:53:16.331213+03	2026-04-30 20:11:33.557+03	\N	\N	\N
35	5	2026-05-02 08:19:38.44225+03	2026-05-03 00:21:25.773+03	\N	84.36.128.34	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
22	5	2026-04-30 20:11:33.56357+03	2026-05-01 02:32:07.1+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
23	5	2026-04-30 20:42:20.26691+03	2026-05-01 02:33:07.845+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
24	5	2026-04-30 20:42:28.835824+03	2026-05-01 02:33:15.847+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
36	5	2026-05-03 09:07:01.716193+03	2026-05-04 00:24:56.656+03	\N	84.36.128.34	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
25	5	2026-04-30 20:42:42.667289+03	2026-05-01 02:33:22.332+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
26	5	2026-04-30 20:43:03.471959+03	2026-05-01 02:33:46.908+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
27	5	2026-04-30 20:43:10.147775+03	2026-05-01 02:33:54.001+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
28	5	2026-04-30 20:43:30.257626+03	2026-05-01 02:34:00.725+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
29	5	2026-04-30 20:43:45.068049+03	2026-05-01 02:34:06.119+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
30	5	2026-04-30 20:43:56.699378+03	2026-05-01 02:34:11.476+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
31	5	2026-04-30 20:46:36.906413+03	2026-05-01 02:34:17.084+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
32	5	2026-04-30 20:46:41.851494+03	2026-05-01 02:34:50.202+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
33	5	2026-04-30 21:07:19.825965+03	2026-05-01 09:47:03.114+03	\N	\N	\N
34	5	2026-05-01 09:47:06.763097+03	2026-05-02 00:36:01.984+03	\N	41.47.37.95	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0
37	5	2026-05-04 08:34:13.678314+03	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, email, password_hash, points, total_spent, visit_count, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, code, type, value, is_active, created_at, updated_at) FROM stdin;
1	SPACCA10	percentage	10.00	t	2026-04-24 23:51:57.645346+03	2026-04-24 23:51:57.645346+03
2	PREM50	percentage	50.00	t	2026-04-26 16:05:26.550853+03	2026-04-26 16:05:26.550853+03
3	PREM75	percentage	75.00	t	2026-04-26 16:56:06.255189+03	2026-04-26 16:56:06.255189+03
4	DIS25	percentage	25.00	t	2026-04-26 16:56:27.248189+03	2026-04-26 16:56:27.248189+03
\.


--
-- Data for Name: drink_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_categories (id, name, sort_order, is_active, created_at) FROM stdin;
4	Specialty	7	f	2026-04-18 01:04:52.267289+02
10	Other	90	t	2026-04-30 15:16:23.785429+03
11	Coffee2	10	f	2026-04-30 18:54:56.682784+03
3	Cold Coffee	2	t	2026-04-18 01:04:52.26665+02
5	Food/Pastry	40	t	2026-04-21 00:26:32.239454+02
6	Frappe	3	t	2026-04-21 10:39:16.11275+02
1	Hot Coffee	1	t	2026-04-18 01:04:52.256353+02
9	Snacks	80	t	2026-04-27 19:55:20.236098+03
8	Matcha	4	t	2026-04-27 13:21:07.104812+03
7	Chillers	5	t	2026-04-22 18:12:19.811357+02
2	Hot Drinks	6	t	2026-04-18 01:04:52.265807+02
\.


--
-- Data for Name: drink_ingredient_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_ingredient_slots (id, drink_id, ingredient_id, ingredient_type_id, slot_label, is_required, default_option_id, is_dynamic, sort_order, created_at, updated_at, barista_sort_order, customer_sort_order, affects_cup_size, predefined_slot_id) FROM stdin;
6724	26	\N	\N	Coffee	t	\N	f	0	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	5	1	t	\N
6725	26	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	3	2	t	\N
6726	26	\N	\N	Syrup	t	\N	f	2	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	2	3	t	\N
6727	26	\N	\N	Cubes	t	\N	f	3	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	6	4	t	\N
6728	26	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	6	6	f	\N
6729	26	\N	\N	Sweetener	t	\N	f	5	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	1	7	f	\N
6730	26	\N	\N	Powder	t	\N	f	6	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	8	0	\N	\N
6731	26	\N	\N	Milk	t	\N	t	7	2026-05-03 14:20:48.555559+03	2026-05-03 14:20:48.555559+03	7	5	\N	4
7004	83	\N	\N	Sweetner	t	\N	f	0	2026-05-03 15:26:19.485864+03	2026-05-03 15:26:19.485864+03	1	1	f	6
7005	83	\N	\N	Powder	t	\N	f	1	2026-05-03 15:26:19.485864+03	2026-05-03 15:26:19.485864+03	3	0	t	\N
7006	83	\N	\N	Milk	t	\N	t	2	2026-05-03 15:26:19.485864+03	2026-05-03 15:26:19.485864+03	3	3	\N	4
7007	83	\N	\N	Whipped Cream	t	\N	f	3	2026-05-03 15:26:19.485864+03	2026-05-03 15:26:19.485864+03	4	4	f	10
7019	122	336	\N	Almond Cashew Coconut	t	\N	f	0	2026-05-04 16:23:48.708648+03	2026-05-04 16:23:48.708648+03	1	1	\N	\N
6565	85	\N	\N	Coffee	t	\N	f	0	2026-05-03 12:24:38.069421+03	2026-05-03 12:24:38.069421+03	1	1	\N	\N
6302	97	320	\N	V Cola	t	\N	f	0	2026-05-01 14:42:39.225878+03	2026-05-01 14:42:39.225878+03	1	1	\N	\N
6517	90	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	1	6	f	6
6518	90	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	2	2	t	7
6519	90	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	3	1	t	3
6520	90	\N	\N	Milk	t	\N	t	3	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	4	3	\N	4
6521	90	\N	\N	Foam	t	\N	f	4	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	5	4	f	\N
6522	90	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:18:31.785628+03	2026-05-03 12:18:31.785628+03	6	5	f	10
5741	105	\N	\N	can cake triple chocolate	t	\N	f	0	2026-04-28 22:33:02.548272+03	2026-04-29 15:17:59.772+03	1	1	\N	\N
6422	82	\N	\N	Tea	t	\N	f	0	2026-05-02 20:01:11.827316+03	2026-05-02 20:01:11.827316+03	1	0	\N	\N
6566	92	\N	\N	Coffee	t	\N	f	0	2026-05-03 12:24:50.96978+03	2026-05-03 12:24:50.96978+03	1	1	t	\N
6595	70	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	1	7	f	6
6596	70	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	2	3	t	7
6597	70	\N	\N	Syrup	t	\N	f	2	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	3	2	\N	5
6598	70	\N	\N	Coffee	t	\N	f	3	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	4	1	t	3
6599	70	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	5	4	t	9
6600	70	\N	\N	Milk	t	\N	t	5	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	6	5	\N	4
6601	70	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 13:41:05.624625+03	2026-05-03 13:41:05.624625+03	7	6	f	10
6423	82	\N	\N	Sweetner	t	\N	f	1	2026-05-02 20:01:11.827316+03	2026-05-02 20:01:11.827316+03	2	2	f	6
6461	20	\N	\N	Coffee	t	\N	f	0	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	1	1	\N	\N
6462	20	\N	\N	Syrap	t	\N	f	1	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	1	1	\N	\N
6463	20	\N	\N	Foam	t	\N	f	2	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	5	5	f	\N
6464	20	\N	\N	Milk	t	\N	t	3	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	6	6	\N	4
6663	39	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	1	6	f	6
6664	39	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	2	2	t	7
6665	39	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	3	1	t	3
6666	39	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	4	3	t	9
6667	39	\N	\N	Milk	t	\N	t	4	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	5	4	\N	4
6668	39	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:51:10.268271+03	2026-05-03 13:51:10.268271+03	6	5	f	10
6732	29	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	1	7	f	6
6733	29	\N	\N	Vanilla Powder	t	\N	f	1	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	4	0	\N	\N
6734	29	\N	\N	Coffee	t	\N	f	2	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	5	1	\N	\N
6735	29	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	6	4	\N	\N
6736	29	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	8	6	f	\N
6954	48	\N	\N	Matcha	t	\N	f	0	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	1	0	\N	\N
6955	48	\N	\N	Sweetner	t	\N	f	1	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	2	6	f	6
6956	48	\N	\N	Sauce	t	\N	f	2	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	3	1	\N	\N
6957	48	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	4	3	t	9
6958	48	\N	\N	Milk	t	\N	t	4	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	5	4	\N	4
6959	48	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 15:17:18.875696+03	2026-05-03 15:17:18.875696+03	6	5	f	10
6201	55	\N	\N	Sweetner	t	\N	f	0	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	1	7	f	6
6202	55	\N	\N	Syrup	t	\N	f	1	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	2	3	\N	5
6203	55	\N	\N	Sauce	t	\N	f	2	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	3	2	t	7
6204	55	\N	\N	Powder	t	\N	f	3	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	4	0	t	8
6205	55	\N	\N	Coffee	t	\N	f	4	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	5	1	t	3
6206	55	\N	\N	Ice Cubes	t	\N	f	5	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	6	4	t	9
6207	55	\N	\N	Milk	t	\N	t	6	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	7	5	\N	4
6208	55	\N	\N	Whipped Cream	t	\N	f	7	2026-04-30 00:59:03.436582+03	2026-04-30 00:59:03.436582+03	8	6	f	10
6465	20	\N	\N	Sweetner	t	\N	f	4	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	1	5	f	6
6466	20	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:08:00.337858+03	2026-05-03 12:08:00.337858+03	6	6	f	10
6523	89	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	1	7	f	6
6524	89	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	2	2	t	7
6525	89	\N	\N	Sauce	t	\N	f	2	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	3	3	t	7
6303	106	321	\N	V Cola Dite	t	\N	f	0	2026-05-01 14:42:52.132101+03	2026-05-01 14:42:52.132101+03	1	1	\N	\N
6526	89	\N	\N	Coffee	t	\N	f	3	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	4	1	t	3
6527	89	\N	\N	Milk	t	\N	t	4	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	5	4	\N	4
6528	89	\N	\N	Foam	t	\N	f	5	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	6	5	f	11
6529	89	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 12:19:02.52736+03	2026-05-03 12:19:02.52736+03	7	6	f	10
6737	29	\N	\N	Syrup	t	\N	f	5	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	2	3	\N	5
6384	115	329	\N	Dark chocolate almond	t	\N	f	0	2026-05-02 18:31:28.040678+03	2026-05-02 18:31:28.040678+03	1	1	\N	\N
6409	65	\N	\N	RedBull	t	\N	f	0	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	5	0	\N	\N
6410	65	\N	\N	Sauce	t	\N	f	1	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	1	2	\N	\N
6411	65	\N	\N	Ice Cubes	t	\N	f	2	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	4	3	t	9
6412	65	\N	\N	Mint Leaves	t	\N	f	3	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	2	3	\N	\N
6413	65	\N	\N	Lemon Slices	t	\N	f	4	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	3	5	\N	\N
6414	65	\N	\N	Sauce	t	\N	f	5	2026-05-02 20:00:00.762936+03	2026-05-02 20:00:00.762936+03	6	0	\N	\N
6738	29	\N	\N	Milk	t	\N	t	6	2026-05-03 14:22:13.344695+03	2026-05-03 14:22:13.344695+03	5	6	\N	4
7008	120	\N	\N	Coffee	t	\N	f	0	2026-05-03 15:39:22.587557+03	2026-05-03 15:39:22.587557+03	2	1	\N	\N
7009	120	\N	\N	Ice Cubes	t	\N	f	1	2026-05-03 15:39:22.587557+03	2026-05-03 15:39:22.587557+03	1	0	t	9
7020	123	334	\N	Cashew Almond Pumpkin	t	\N	f	0	2026-05-04 16:35:30.358775+03	2026-05-04 16:35:30.358775+03	1	1	\N	\N
6424	15	\N	\N	Coffe Type	t	\N	f	0	2026-05-03 11:37:43.449085+03	2026-05-03 11:37:43.449085+03	1	1	\N	\N
6467	72	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	1	5	f	6
6468	72	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	2	2	t	7
6469	72	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	3	1	t	3
5818	107	322	\N	V Pina Colada	t	\N	f	0	2026-04-29 18:24:31.208644+03	2026-04-29 18:24:31.208644+03	1	1	\N	\N
6470	72	\N	\N	Milk	t	\N	t	3	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	4	3	\N	4
6471	72	\N	\N	Foam	t	\N	f	4	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	5	5	f	\N
6472	72	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:09:16.586867+03	2026-05-03 12:09:16.586867+03	6	6	f	10
6530	88	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	1	7	f	6
6531	88	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	2	2	\N	5
6532	88	\N	\N	Sauce	t	\N	f	2	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	3	3	t	7
6533	88	\N	\N	Coffee	t	\N	f	3	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	4	1	t	3
6534	88	\N	\N	Milk	t	\N	t	4	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	5	4	\N	4
6535	88	\N	\N	Foam	t	\N	f	5	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	6	5	f	11
6739	31	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	1	6	f	6
6740	31	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	2	2	t	7
6741	31	\N	\N	Powder	t	\N	f	2	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	3	0	t	8
6742	31	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	4	1	t	3
6743	31	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	5	3	t	9
6744	31	\N	\N	Milk	t	\N	t	5	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	6	4	\N	4
6745	31	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:22:50.486793+03	2026-05-03 14:22:50.486793+03	7	5	f	10
6567	79	\N	\N	Roasting Type	t	\N	f	0	2026-05-03 12:25:29.641618+03	2026-05-03 12:25:29.641618+03	1	1	\N	\N
6568	79	\N	\N	Sweetner	t	\N	f	1	2026-05-03 12:25:29.641618+03	2026-05-03 12:25:29.641618+03	2	1	f	6
6602	22	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	1	6	f	6
6603	22	\N	\N	Syrup	t	\N	f	1	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	2	2	\N	\N
6604	22	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	3	1	\N	\N
6605	22	\N	\N	Ices Cubes	t	\N	f	3	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	4	3	\N	\N
6606	22	\N	\N	Milk	t	\N	t	4	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	5	4	\N	4
6607	22	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:42:41.912034+03	2026-05-03 13:42:41.912034+03	6	5	\N	\N
6536	88	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 12:20:02.089877+03	2026-05-03 12:20:02.089877+03	7	6	f	10
6669	40	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	1	6	f	6
6670	40	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	2	2	t	7
6671	40	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	3	1	t	3
6672	40	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	4	3	t	9
6673	40	\N	\N	Milk	t	\N	t	4	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	5	4	\N	4
6674	40	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:52:19.342568+03	2026-05-03 13:52:19.342568+03	6	5	f	10
6385	116	332	\N	Dark Chocolate Honeycomb	t	\N	f	0	2026-05-02 18:31:57.188361+03	2026-05-02 18:31:57.188361+03	1	1	\N	\N
7010	121	335	\N	Almond Cahew Cranberry	t	\N	f	0	2026-05-03 17:46:09.780599+03	2026-05-03 17:46:09.780599+03	1	1	\N	\N
7021	129	346	\N	Tiramisu Cake	t	\N	f	0	2026-05-04 16:36:40.10591+03	2026-05-04 16:36:40.10591+03	1	1	\N	\N
5819	108	323	\N	V Gold Pinapple	t	\N	f	0	2026-04-29 18:29:09.373465+03	2026-04-29 18:29:09.373465+03	1	1	\N	\N
6569	84	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:25:45.274013+03	2026-05-03 12:25:45.274013+03	1	1	f	6
6570	84	\N	\N	Roasting Type	t	\N	f	1	2026-05-03 12:25:45.274013+03	2026-05-03 12:25:45.274013+03	2	2	\N	\N
6608	23	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	1	6	f	6
6609	23	\N	\N	Salted Caramel	t	\N	f	1	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	2	2	t	\N
6610	23	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	3	1	t	\N
6611	23	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	4	3	t	\N
6612	23	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	6	5	f	\N
6613	23	\N	\N	Milk	t	\N	t	5	2026-05-03 13:43:22.270463+03	2026-05-03 13:43:22.270463+03	5	4	\N	4
6675	41	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	1	7	f	6
6746	34	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	1	6	f	6
6747	34	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	2	3	\N	5
6748	34	\N	\N	Vanilla Powder	t	\N	f	2	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	3	0	\N	\N
6749	34	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	4	1	t	3
6750	34	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	5	4	\N	\N
6751	34	\N	\N	Milk	t	\N	t	5	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	6	5	\N	4
6752	34	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:23:43.6229+03	2026-05-03 14:23:43.6229+03	7	6	f	10
6827	47	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	1	6	f	6
6828	47	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	3	2	t	7
6829	47	\N	\N	Powder	t	\N	f	2	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	4	0	t	8
6830	47	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	5	1	t	3
6831	47	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	6	3	t	9
6832	47	\N	\N	Milk	t	\N	t	5	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	7	4	\N	4
6676	41	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	2	2	t	7
6677	41	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	3	3	t	7
6678	41	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	4	1	t	3
6679	41	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	5	4	t	9
6680	41	\N	\N	Milk	t	\N	t	5	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	6	5	\N	4
6425	11	\N	\N	Coffe Type	t	\N	f	0	2026-05-03 11:38:24.751381+03	2026-05-03 11:38:24.751381+03	1	1	\N	\N
6426	11	\N	\N	Foam	t	\N	f	1	2026-05-03 11:38:24.751381+03	2026-05-03 11:38:24.751381+03	1	1	\N	\N
6306	98	318	\N	Water	t	\N	f	0	2026-05-01 14:50:54.00918+03	2026-05-01 14:50:54.00918+03	1	1	\N	\N
6681	41	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:11:28.644882+03	2026-05-03 14:11:28.644882+03	7	6	f	10
6833	47	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	8	5	f	10
6834	47	\N	\N	Sauce	t	\N	f	7	2026-05-03 14:36:19.599659+03	2026-05-03 14:36:19.599659+03	8	0	\N	\N
6966	51	\N	\N	Sweetner	t	\N	f	0	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	2	5	f	6
6473	71	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	1	5	f	6
6474	71	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	2	2	\N	5
6475	71	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	3	1	t	3
6476	71	\N	\N	Milk	t	\N	t	3	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	4	3	\N	4
6477	71	\N	\N	Foam	t	\N	f	4	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	5	5	f	\N
6478	71	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:09:52.859314+03	2026-05-03 12:09:52.859314+03	6	6	f	10
6967	51	\N	\N	Sauce	t	\N	f	1	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	3	1	t	7
6968	51	\N	\N	Powder	t	\N	f	2	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	1	0	t	8
6969	51	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	4	2	t	9
6970	51	\N	\N	Milk	t	\N	t	4	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	5	3	\N	4
6971	51	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 15:19:56.468326+03	2026-05-03 15:19:56.468326+03	6	4	f	10
7011	101	344	\N	Wunder Sugar Free Belgian Strawberry Milk	t	\N	f	0	2026-05-04 16:06:52.901603+03	2026-05-04 16:06:52.901603+03	1	1	\N	\N
7023	130	326	\N	Mango Juice	t	\N	f	0	2026-05-04 17:38:36.062565+03	2026-05-04 17:38:36.062565+03	1	1	\N	\N
6908	56	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	1	7	f	6
6909	56	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	2	3	\N	5
6614	28	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	1	6	f	6
6910	56	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	3	2	t	7
6911	56	\N	\N	Powder	t	\N	f	3	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	4	0	t	8
6912	56	\N	\N	Coffee	t	\N	f	4	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	5	1	t	3
6913	56	\N	\N	Ice Cubes	t	\N	f	5	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	6	4	t	9
6914	56	\N	\N	Milk	t	\N	t	6	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	7	5	\N	4
6835	27	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	1	6	f	6
6836	27	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	2	2	t	7
6837	27	\N	\N	Ice Cubes	t	\N	f	2	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	5	3	t	9
6838	27	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	4	1	t	3
6839	27	\N	\N	Powder	t	\N	f	4	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	3	0	t	8
4874	80	\N	\N	Green Tea	t	\N	f	0	2026-04-26 14:49:43.324028+03	2026-04-29 15:17:59.772+03	1	0	\N	\N
4875	80	\N	\N	Sweetner	t	\N	f	1	2026-04-26 14:49:43.324028+03	2026-04-29 15:17:59.772+03	2	2	f	6
6840	27	\N	\N	Milk	t	\N	t	5	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	6	4	\N	4
6841	27	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:38:00.05486+03	2026-05-03 14:38:00.05486+03	7	5	f	10
6915	56	\N	\N	Whipped Cream	t	\N	f	7	2026-05-03 14:52:04.97757+03	2026-05-03 14:52:04.97757+03	8	6	f	10
6972	52	\N	\N	Powder	t	\N	f	0	2026-05-03 15:20:27.926482+03	2026-05-03 15:20:27.926482+03	1	0	t	8
6973	52	\N	\N	Sweetner	t	\N	f	1	2026-05-03 15:20:27.926482+03	2026-05-03 15:20:27.926482+03	1	1	t	6
6974	52	\N	\N	Ice Cubes	t	\N	f	2	2026-05-03 15:20:27.926482+03	2026-05-03 15:20:27.926482+03	3	3	t	9
6975	52	\N	\N	Milk	t	\N	t	3	2026-05-03 15:20:27.926482+03	2026-05-03 15:20:27.926482+03	4	4	\N	4
6976	52	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 15:20:27.926482+03	2026-05-03 15:20:27.926482+03	5	5	f	10
6427	17	\N	\N	Coffee	t	\N	f	0	2026-05-03 11:39:22.260859+03	2026-05-03 11:39:22.260859+03	1	1	\N	\N
6428	17	\N	\N	Whipped	t	\N	f	1	2026-05-03 11:39:22.260859+03	2026-05-03 11:39:22.260859+03	1	1	\N	\N
7012	102	343	\N	Wunder Suger Free Mint Green	t	\N	f	0	2026-05-04 16:08:24.455679+03	2026-05-04 16:08:24.455679+03	1	1	\N	\N
7024	131	327	\N	Strawberry Juice	t	\N	f	0	2026-05-04 17:41:59.566306+03	2026-05-04 17:41:59.566306+03	1	1	\N	\N
6479	73	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	1	5	f	6
6480	73	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	2	2	t	7
6481	73	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	3	1	t	3
6482	73	\N	\N	Milk	t	\N	t	3	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	4	3	\N	4
6483	73	\N	\N	Foam	t	\N	f	4	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	5	5	f	\N
6484	73	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:11:15.106972+03	2026-05-03 12:11:15.106972+03	6	6	f	10
6615	28	\N	\N	Syrap	t	\N	f	1	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	2	2	t	\N
6616	28	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	3	1	\N	\N
6617	28	\N	\N	Milk	t	\N	t	3	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	5	4	\N	4
6618	28	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	4	3	\N	\N
6619	28	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:44:02.021531+03	2026-05-03 13:44:02.021531+03	6	5	f	\N
6387	117	330	\N	Dark Chocolate Cranberry	t	\N	f	0	2026-05-02 18:33:07.903651+03	2026-05-02 18:33:07.903651+03	1	1	\N	\N
6760	35	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	1	6	f	6
5821	109	324	\N	V Pomegranate	t	\N	f	0	2026-04-29 18:35:03.304461+03	2026-04-29 18:35:03.304461+03	1	1	\N	\N
6429	16	\N	\N	Coffee	t	\N	f	0	2026-05-03 11:39:57.104503+03	2026-05-03 11:39:57.104503+03	1	1	\N	\N
6430	16	\N	\N	Ice Cream	t	\N	f	1	2026-05-03 11:39:57.104503+03	2026-05-03 11:39:57.104503+03	2	2	t	\N
6485	75	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	1	5	f	6
6486	75	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	2	2	\N	5
6487	75	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	3	1	t	3
6488	75	\N	\N	Milk	t	\N	t	3	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	4	3	\N	4
6489	75	\N	\N	Foam	t	\N	f	4	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	5	5	f	11
6490	75	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:12:03.353329+03	2026-05-03 12:12:03.353329+03	6	6	f	10
6551	86	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	1	7	f	6
6620	30	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	1	6	f	6
6552	86	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	2	2	\N	5
6621	30	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	2	2	t	7
6622	30	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	3	1	t	3
6623	30	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	4	3	\N	\N
6624	30	\N	\N	Milk	t	\N	t	4	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	5	4	\N	4
6625	30	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:45:08.459677+03	2026-05-03 13:45:08.459677+03	6	5	f	\N
6761	35	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	2	2	t	7
6553	86	\N	\N	Sauce	t	\N	f	2	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	3	3	t	7
6554	86	\N	\N	Coffee	t	\N	f	3	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	4	1	t	3
6555	86	\N	\N	Milk	t	\N	t	4	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	5	4	\N	4
6556	86	\N	\N	Foam	t	\N	f	5	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	6	5	f	\N
6557	86	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 12:22:29.96175+03	2026-05-03 12:22:29.96175+03	7	6	f	10
6762	35	\N	\N	Powder	t	\N	f	2	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	3	0	t	8
6763	35	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	4	1	t	3
6764	35	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	5	3	\N	\N
6765	35	\N	\N	Milk	t	\N	t	5	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	6	4	\N	4
6766	35	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:24:41.299071+03	2026-05-03 14:24:41.299071+03	7	5	f	\N
6842	50	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	1	7	f	6
6843	50	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	3	2	t	7
6844	50	\N	\N	Powder	t	\N	f	2	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	7	0	t	8
6845	50	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	5	1	t	3
6916	59	\N	\N	Sauce	t	\N	f	0	2026-05-03 14:54:15.15679+03	2026-05-03 14:54:15.15679+03	5	1	\N	\N
6917	59	\N	\N	Milk	t	\N	t	1	2026-05-03 14:54:15.15679+03	2026-05-03 14:54:15.15679+03	4	4	\N	4
6918	59	\N	\N	Powder	t	\N	f	2	2026-05-03 14:54:15.15679+03	2026-05-03 14:54:15.15679+03	2	0	t	8
6919	59	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 14:54:15.15679+03	2026-05-03 14:54:15.15679+03	3	3	t	9
6920	59	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 14:54:15.15679+03	2026-05-03 14:54:15.15679+03	4	4	f	10
6977	67	\N	\N	Hot Water	t	\N	f	0	2026-05-03 15:21:10.544345+03	2026-05-03 15:21:10.544345+03	1	0	\N	\N
6978	67	\N	\N	Pack Tea	t	\N	f	1	2026-05-03 15:21:10.544345+03	2026-05-03 15:21:10.544345+03	2	0	\N	\N
6979	67	\N	\N	Rani Peach	t	\N	f	2	2026-05-03 15:21:10.544345+03	2026-05-03 15:21:10.544345+03	5	0	\N	\N
6846	50	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	6	3	t	9
6847	50	\N	\N	Milk	t	\N	t	5	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	7	4	\N	4
6848	50	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:38:41.801513+03	2026-05-03 14:38:41.801513+03	8	5	f	10
6980	67	\N	\N	Syrup	t	\N	f	3	2026-05-03 15:21:10.544345+03	2026-05-03 15:21:10.544345+03	3	1	\N	\N
6981	67	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 15:21:10.544345+03	2026-05-03 15:21:10.544345+03	4	2	t	9
7013	113	345	\N	Wunder Sugar Free Belgian Coffe Dark Chocolate	t	\N	f	0	2026-05-04 16:09:54.656918+03	2026-05-04 16:09:54.656918+03	1	1	\N	\N
7025	132	328	\N	Juava Juice	t	\N	f	0	2026-05-04 17:44:06.808034+03	2026-05-04 17:44:06.808034+03	1	1	\N	\N
6308	112	361	\N	Butter Biscuits Box	t	\N	f	0	2026-05-01 14:59:05.038625+03	2026-05-01 14:59:05.038625+03	1	1	\N	\N
6388	118	331	\N	Dark Chocolate Mint	t	\N	f	0	2026-05-02 18:34:21.070132+03	2026-05-02 18:34:21.070132+03	1	1	\N	\N
6767	38	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	1	6	f	6
3289	66	\N	\N	RedBull	t	\N	f	0	2026-04-24 20:13:44.465432+03	2026-04-29 15:17:59.772+03	5	5	\N	\N
3290	66	\N	\N	Sauce	t	\N	f	1	2026-04-24 20:13:44.465432+03	2026-04-29 15:17:59.772+03	1	1	\N	\N
3291	66	\N	\N	Ice Cubes	t	\N	f	2	2026-04-24 20:13:44.465432+03	2026-04-29 15:17:59.772+03	4	2	t	9
3292	66	\N	\N	Mint Leaves	t	\N	f	3	2026-04-24 20:13:44.465432+03	2026-04-29 15:17:59.772+03	2	3	\N	\N
3293	66	\N	\N	Lemon Slices	t	\N	f	4	2026-04-24 20:13:44.465432+03	2026-04-29 15:17:59.772+03	3	4	\N	\N
6574	99	\N	\N	Coffee Arabian	t	\N	f	0	2026-05-03 13:28:14.32689+03	2026-05-03 13:28:14.32689+03	1	1	\N	\N
6491	76	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	1	5	f	6
6492	76	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	2	2	t	7
6493	76	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	3	1	t	3
6494	76	\N	\N	Milk	t	\N	t	3	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	4	3	\N	4
6495	76	\N	\N	Foam	t	\N	f	4	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	5	5	f	11
6496	76	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:12:36.597188+03	2026-05-03 12:12:36.597188+03	6	6	f	10
27	12	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
20	9	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
22	10	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
6558	87	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	1	7	f	6
6559	87	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	2	2	\N	5
6560	87	\N	\N	Sauce	t	\N	f	2	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	3	3	t	7
7014	124	340	\N	Wuder Sugar Free Belgian Dark Chocolate 70%	t	\N	f	0	2026-05-04 16:11:16.398144+03	2026-05-04 16:11:16.398144+03	1	1	\N	\N
6561	87	\N	\N	Coffee	t	\N	f	3	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	4	1	t	3
6768	38	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	2	2	\N	5
6309	114	339	\N	Wunder Sugar free Belgian Milk Chocolate	t	\N	f	0	2026-05-01 15:01:16.757627+03	2026-05-01 15:01:16.757627+03	1	1	\N	\N
6626	32	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	1	6	f	6
6562	87	\N	\N	Milk	t	\N	t	4	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	5	4	\N	4
6563	87	\N	\N	Foam	t	\N	f	5	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	6	5	f	\N
6564	87	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 12:23:46.283328+03	2026-05-03 12:23:46.283328+03	7	6	f	10
6627	32	\N	\N	Syrup	t	\N	f	1	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	2	2	\N	5
6628	32	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	3	1	t	3
6389	119	333	\N	Dark Chocolate Plain 70%	t	\N	f	0	2026-05-02 18:34:52.681863+03	2026-05-02 18:34:52.681863+03	1	1	\N	\N
6629	32	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	4	3	\N	\N
6630	32	\N	\N	Milk	t	\N	t	4	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	5	4	\N	4
6631	32	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:47:00.50487+03	2026-05-03 13:47:00.50487+03	6	5	f	\N
6696	46	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	1	7	f	6
6697	46	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	2	3	\N	5
6698	46	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	3	2	t	7
6699	46	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	4	1	t	3
6700	46	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	5	4	t	9
6701	46	\N	\N	Milk	t	\N	t	5	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	6	5	\N	4
6702	46	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:13:36.834438+03	2026-05-03 14:13:36.834438+03	7	6	f	10
6769	38	\N	\N	Vanilla Powder	t	\N	f	2	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	3	0	\N	\N
6770	38	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	4	1	t	3
6771	38	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	5	3	t	9
6772	38	\N	\N	Milk	t	\N	t	5	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	6	4	\N	4
6773	38	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:25:18.563469+03	2026-05-03 14:25:18.563469+03	7	5	f	10
6849	53	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	1	6	f	6
6850	53	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	2	2	t	7
6851	53	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	3	3	t	7
6852	53	\N	\N	Powder	t	\N	f	3	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	5	0	t	8
6853	53	\N	\N	Coffee	t	\N	f	4	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	4	1	t	3
6854	53	\N	\N	Ice Cubes	t	\N	f	5	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	6	4	t	9
6855	53	\N	\N	Milk	t	\N	t	6	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	7	5	\N	4
6856	53	\N	\N	Whipped Cream	t	\N	f	7	2026-05-03 14:39:18.230864+03	2026-05-03 14:39:18.230864+03	8	6	f	10
6774	43	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	1	6	f	6
6775	43	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	2	2	t	7
6292	95	\N	\N	Sweetner	t	\N	f	0	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	1	6	f	6
6293	95	\N	\N	Syrup	t	\N	f	1	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	2	2	\N	5
6294	95	\N	\N	Sauce	t	\N	f	2	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	3	3	t	7
6295	95	\N	\N	Coffee	t	\N	f	3	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	4	1	t	3
6296	95	\N	\N	Milk	t	\N	t	4	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	5	4	\N	4
6297	95	\N	\N	Foam	t	\N	f	5	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	6	5	f	11
6632	33	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	1	6	f	6
6298	95	\N	\N	Whipped Cream	t	\N	f	6	2026-04-30 14:47:15.2488+03	2026-04-30 14:47:15.2488+03	7	7	f	10
6433	4	\N	\N	Sweetner	t	\N	f	0	2026-05-03 11:42:13.216671+03	2026-05-03 11:42:13.216671+03	1	4	f	6
6434	4	\N	\N	Coffee	t	\N	f	1	2026-05-03 11:42:13.216671+03	2026-05-03 11:42:13.216671+03	4	1	\N	\N
6776	43	\N	\N	Powder	t	\N	f	2	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	3	0	t	8
6777	43	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	4	1	t	3
6633	33	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	2	2	t	7
6634	33	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	3	1	t	3
6635	33	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	4	3	\N	\N
6636	33	\N	\N	Milk	t	\N	t	4	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	5	4	\N	4
6778	43	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	5	3	t	9
6435	4	\N	\N	Base	t	\N	t	2	2026-05-03 11:42:13.216671+03	2026-05-03 11:42:13.216671+03	3	0	\N	\N
6436	4	\N	\N	Syrup	t	\N	f	3	2026-05-03 11:42:13.216671+03	2026-05-03 11:42:13.216671+03	2	3	\N	5
6637	33	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:47:23.835672+03	2026-05-03 13:47:23.835672+03	6	5	f	\N
6703	24	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	1	7	f	6
6704	24	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	2	2	\N	\N
6705	24	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	3	3	\N	\N
6706	24	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	4	1	\N	\N
6707	24	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	5	4	\N	\N
6708	24	\N	\N	Milk	t	\N	t	5	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	6	5	\N	4
6709	24	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:17:48.707021+03	2026-05-03 14:17:48.707021+03	7	6	f	\N
6779	43	\N	\N	Milk	t	\N	t	5	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	6	4	\N	4
6780	43	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	7	5	f	10
6781	43	\N	\N	Almond Beans	t	\N	f	7	2026-05-03 14:25:51.778597+03	2026-05-03 14:25:51.778597+03	8	0	t	\N
6926	58	\N	\N	Sauce	t	\N	f	0	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	1	1	t	7
6927	58	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	2	2	t	7
6928	58	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	4	4	\N	\N
6929	58	\N	\N	Powder	t	\N	f	3	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	4	0	t	\N
6930	58	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	5	5	t	9
6931	58	\N	\N	Milk	t	\N	t	5	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	6	6	\N	4
6932	58	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:56:05.382897+03	2026-05-03 14:56:05.382897+03	7	7	f	10
6986	68	\N	\N	Syrap	t	\N	f	0	2026-05-03 15:22:34.74671+03	2026-05-03 15:22:34.74671+03	1	1	\N	\N
6987	68	\N	\N	Pinapple	t	\N	f	1	2026-05-03 15:22:34.74671+03	2026-05-03 15:22:34.74671+03	2	2	\N	\N
6988	68	\N	\N	Milk	t	\N	f	2	2026-05-03 15:22:34.74671+03	2026-05-03 15:22:34.74671+03	3	3	\N	\N
6989	68	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 15:22:34.74671+03	2026-05-03 15:22:34.74671+03	4	4	t	9
7015	126	342	\N	Wunder Sugar free Belgian Dark Chocolate with Almond	t	\N	f	0	2026-05-04 16:13:52.836384+03	2026-05-04 16:13:52.836384+03	1	1	\N	\N
3208	93	\N	\N	Soda	t	\N	f	0	2026-04-24 20:06:59.821042+03	2026-04-29 15:17:59.772+03	5	0	\N	\N
3209	93	\N	\N	Sauce	t	\N	f	1	2026-04-24 20:06:59.821042+03	2026-04-29 15:17:59.772+03	2	2	t	7
3210	93	\N	\N	Ice Cubes	t	\N	f	2	2026-04-24 20:06:59.821042+03	2026-04-29 15:17:59.772+03	3	3	t	9
3211	93	\N	\N	Mint Leaves	t	\N	f	3	2026-04-24 20:06:59.821042+03	2026-04-29 15:17:59.772+03	4	4	\N	\N
3212	93	\N	\N	Lemon Slices	t	\N	f	4	2026-04-24 20:06:59.821042+03	2026-04-29 15:17:59.772+03	5	5	\N	\N
6638	36	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	1	6	f	6
6639	36	\N	\N	Syrup	t	\N	f	1	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	2	2	\N	5
6640	36	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	3	1	t	3
6503	94	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	1	7	f	6
6504	94	\N	\N	Syrup	t	\N	f	1	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	2	2	\N	5
6299	110	348	\N	Belgain Chocolate Sable Box	t	\N	f	0	2026-05-01 14:28:32.69332+03	2026-05-01 14:28:32.69332+03	1	1	\N	\N
6505	94	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	3	1	t	3
6506	94	\N	\N	Milk	t	\N	t	3	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	4	3	\N	4
6507	94	\N	\N	Foam	t	\N	f	4	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	5	4	f	11
6508	94	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:14:25.675159+03	2026-05-03 12:14:25.675159+03	6	6	f	10
6641	36	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	4	3	\N	\N
6642	36	\N	\N	Milk	t	\N	t	4	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	5	4	\N	4
6643	36	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 13:48:06.914175+03	2026-05-03 13:48:06.914175+03	6	5	\N	\N
6391	103	325	\N	Orange Juice	t	\N	f	0	2026-05-02 19:07:52.190961+03	2026-05-02 19:07:52.190961+03	1	1	\N	\N
6990	57	\N	\N	Sauce	t	\N	f	0	2026-05-03 15:23:19.474109+03	2026-05-03 15:23:19.474109+03	1	1	t	7
6866	54	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	1	7	f	6
6867	54	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	2	3	\N	5
6868	54	\N	\N	Sauce	t	\N	f	2	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	3	2	t	7
6869	54	\N	\N	Powder	t	\N	f	3	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	4	0	t	8
6870	54	\N	\N	Coffee	t	\N	f	4	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	5	1	t	3
6871	54	\N	\N	Ice Cubes	t	\N	f	5	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	6	4	t	9
6872	54	\N	\N	Milk	t	\N	t	6	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	7	5	\N	4
6873	54	\N	\N	Garnish	t	\N	f	7	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	9	0	\N	\N
6874	54	\N	\N	Whipped Cream	t	\N	f	8	2026-05-03 14:41:54.926857+03	2026-05-03 14:41:54.926857+03	9	9	f	10
6991	57	\N	\N	Ice Cubes	t	\N	f	1	2026-05-03 15:23:19.474109+03	2026-05-03 15:23:19.474109+03	2	2	t	9
6992	57	\N	\N	Mango	t	\N	t	2	2026-05-03 15:23:19.474109+03	2026-05-03 15:23:19.474109+03	3	3	\N	\N
6993	57	\N	\N	Lemon Slices	t	\N	f	3	2026-05-03 15:23:19.474109+03	2026-05-03 15:23:19.474109+03	4	4	t	\N
7016	125	341	\N	Wunder Sugar Free Belgian Milk Chocolate with Hazelnut	t	\N	f	0	2026-05-04 16:14:48.849906+03	2026-05-04 16:14:48.849906+03	1	1	\N	\N
6789	45	\N	\N	Syrup	t	\N	f	0	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	2	2	\N	5
6790	45	\N	\N	Coffee	t	\N	f	1	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	4	1	t	3
6791	45	\N	\N	Ice Cubes	t	\N	f	2	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	5	3	t	9
6792	45	\N	\N	Milk	t	\N	t	3	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	6	4	\N	4
6793	45	\N	\N	Powder	t	\N	f	4	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	3	0	t	8
6794	45	\N	\N	Sweetner	t	\N	f	5	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	1	6	f	6
6795	45	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:28:29.543974+03	2026-05-03 14:28:29.543974+03	7	5	f	10
6994	61	\N	\N	Soda	t	\N	f	0	2026-05-03 15:24:06.340819+03	2026-05-03 15:24:06.340819+03	5	0	\N	\N
6995	61	\N	\N	Sauce	t	\N	f	1	2026-05-03 15:24:06.340819+03	2026-05-03 15:24:06.340819+03	1	1	\N	\N
6996	61	\N	\N	Ice Cubes	t	\N	f	2	2026-05-03 15:24:06.340819+03	2026-05-03 15:24:06.340819+03	4	2	t	9
6997	61	\N	\N	Mint Leaves	t	\N	f	3	2026-05-03 15:24:06.340819+03	2026-05-03 15:24:06.340819+03	2	3	\N	\N
6998	61	\N	\N	Lemon Slice	t	\N	f	4	2026-05-03 15:24:06.340819+03	2026-05-03 15:24:06.340819+03	3	4	\N	\N
7017	128	337	\N	Belgian Milk Chocolate Caramel Dragees	t	\N	f	0	2026-05-04 16:18:58.808496+03	2026-05-04 16:18:58.808496+03	1	1	\N	\N
6300	111	349	\N	Chocolate Butter Biscuits Box	t	\N	f	0	2026-05-01 14:31:35.13984+03	2026-05-01 14:31:35.13984+03	1	1	\N	\N
6442	14	\N	\N	Coffee	t	\N	f	0	2026-05-03 11:54:14.233938+03	2026-05-03 11:54:14.233938+03	1	1	\N	\N
6443	14	\N	\N	Syrup	t	\N	f	1	2026-05-03 11:54:14.233938+03	2026-05-03 11:54:14.233938+03	1	1	\N	\N
6579	69	\N	\N	Water	t	\N	f	0	2026-05-03 13:30:50.706007+03	2026-05-03 13:30:50.706007+03	2	2	\N	\N
6580	69	\N	\N	Coffee	t	\N	f	1	2026-05-03 13:30:50.706007+03	2026-05-03 13:30:50.706007+03	1	1	t	3
6644	37	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	1	7	f	6
6645	37	\N	\N	Sauce	t	\N	f	1	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	2	2	t	7
6646	37	\N	\N	Syrup	t	\N	f	2	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	3	3	\N	5
6647	37	\N	\N	Coffee	t	\N	f	3	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	4	1	t	3
6648	37	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	5	4	t	9
6444	14	\N	\N	Milk	t	\N	t	2	2026-05-03 11:54:14.233938+03	2026-05-03 11:54:14.233938+03	6	6	\N	4
6445	14	\N	\N	Foam	t	\N	f	3	2026-05-03 11:54:14.233938+03	2026-05-03 11:54:14.233938+03	1	1	f	\N
6446	14	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 11:54:14.233938+03	2026-05-03 11:54:14.233938+03	5	5	f	10
6509	18	\N	\N	Specialty coffee	t	\N	f	0	2026-05-03 12:14:46.070532+03	2026-05-03 12:14:46.070532+03	1	1	\N	\N
6510	18	\N	\N	Coffee	t	\N	f	1	2026-05-03 12:14:46.070532+03	2026-05-03 12:14:46.070532+03	2	2	\N	\N
6649	37	\N	\N	Milk	t	\N	t	5	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	6	5	\N	4
3279	64	\N	\N	RedBull	t	\N	f	0	2026-04-24 20:12:56.576748+03	2026-04-29 15:17:59.772+03	5	0	\N	\N
3280	64	\N	\N	Sauce	t	\N	f	1	2026-04-24 20:12:56.576748+03	2026-04-29 15:17:59.772+03	1	1	\N	\N
3281	64	\N	\N	Ice Cubes	t	\N	f	2	2026-04-24 20:12:56.576748+03	2026-04-29 15:17:59.772+03	4	4	t	9
3282	64	\N	\N	Mint Leaves	t	\N	f	3	2026-04-24 20:12:56.576748+03	2026-04-29 15:17:59.772+03	2	2	\N	\N
6650	37	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 13:49:02.391869+03	2026-05-03 13:49:02.391869+03	7	6	f	10
6717	25	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	1	6	f	\N
6718	25	\N	\N	Syrup	t	\N	f	1	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	2	2	t	\N
6719	25	\N	\N	Coffee	t	\N	f	2	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	3	1	t	\N
6720	25	\N	\N	Ice Cubes	t	\N	f	3	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	4	3	t	\N
6721	25	\N	\N	Chocolate Powder	t	\N	f	4	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	5	0	t	\N
3283	64	\N	\N	Lemon Slices	t	\N	f	4	2026-04-24 20:12:56.576748+03	2026-04-29 15:17:59.772+03	3	3	\N	\N
6722	25	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	7	5	f	\N
6723	25	\N	\N	Milk	t	\N	t	6	2026-05-03 14:19:18.884687+03	2026-05-03 14:19:18.884687+03	6	4	\N	4
6447	19	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	1	6	f	6
6796	42	\N	\N	Sweetner	t	\N	f	0	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	1	7	f	6
6797	42	\N	\N	Sauce	t	\N	f	1	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	2	2	t	7
6448	19	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	2	2	\N	\N
6449	19	\N	\N	Syrup	t	\N	f	2	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	3	3	\N	\N
6581	21	\N	\N	Sweetner	t	\N	f	0	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	1	7	f	6
6582	21	\N	\N	Syrup	t	\N	f	1	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	2	2	\N	\N
6583	21	\N	\N	Coffee	t	\N	f	2	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	3	1	t	3
6584	21	\N	\N	Milk	t	\N	t	3	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	7	7	\N	4
6585	21	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	5	4	\N	\N
6945	60	\N	\N	Sauce	t	\N	f	0	2026-05-03 14:57:47.325598+03	2026-05-03 14:57:47.325598+03	1	1	t	7
6946	60	\N	\N	Powder	t	\N	f	1	2026-05-03 14:57:47.325598+03	2026-05-03 14:57:47.325598+03	2	0	t	8
6947	60	\N	\N	Ice Cubes	t	\N	f	2	2026-05-03 14:57:47.325598+03	2026-05-03 14:57:47.325598+03	3	2	t	9
4866	81	\N	\N	Tea	t	\N	f	0	2026-04-26 14:48:45.816536+03	2026-04-29 15:17:59.772+03	1	0	\N	\N
6586	21	\N	\N	Foam	t	\N	f	5	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	6	0	\N	\N
6798	42	\N	\N	Syrup	t	\N	f	2	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	3	3	\N	5
6799	42	\N	\N	Coffee	t	\N	f	3	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	4	1	t	3
6800	42	\N	\N	Ice Cubes	t	\N	f	4	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	5	4	t	9
6801	42	\N	\N	Milk	t	\N	t	5	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	6	5	\N	4
6587	21	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 13:35:11.820072+03	2026-05-03 13:35:11.820072+03	7	5	\N	\N
6802	42	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 14:28:57.520756+03	2026-05-03 14:28:57.520756+03	7	6	f	10
6948	60	\N	\N	Milk	t	\N	t	3	2026-05-03 14:57:47.325598+03	2026-05-03 14:57:47.325598+03	4	3	\N	4
6949	60	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 14:57:47.325598+03	2026-05-03 14:57:47.325598+03	5	4	f	10
6999	78	\N	\N	Sweetner	t	\N	f	0	2026-05-03 15:25:48.302646+03	2026-05-03 15:25:48.302646+03	1	5	f	6
7000	78	\N	\N	Syrup	t	\N	f	1	2026-05-03 15:25:48.302646+03	2026-05-03 15:25:48.302646+03	2	1	\N	5
7001	78	\N	\N	Powder	t	\N	f	2	2026-05-03 15:25:48.302646+03	2026-05-03 15:25:48.302646+03	4	0	t	8
7002	78	\N	\N	Milk	t	\N	t	3	2026-05-03 15:25:48.302646+03	2026-05-03 15:25:48.302646+03	5	3	\N	4
7003	78	\N	\N	Whipped Cream	t	\N	f	4	2026-05-03 15:25:48.302646+03	2026-05-03 15:25:48.302646+03	6	4	f	10
7018	127	338	\N	Belgian Milk Chocolate Hazelnut Dragees	t	\N	f	0	2026-05-04 16:19:38.749419+03	2026-05-04 16:19:38.749419+03	1	1	\N	\N
6450	19	\N	\N	Coffee	t	\N	f	3	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	4	1	\N	\N
6451	19	\N	\N	Milk	t	\N	t	4	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	5	4	\N	4
6452	19	\N	\N	Foam	t	\N	f	5	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	6	5	f	\N
6453	19	\N	\N	Whipped Cream	t	\N	f	6	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	8	8	f	10
6454	19	\N	\N	Sauce	t	\N	f	7	2026-05-03 12:06:21.745793+03	2026-05-03 12:06:21.745793+03	8	0	t	7
6511	96	\N	\N	Sweetner	t	\N	f	0	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	1	5	f	6
6512	96	\N	\N	Sauce	t	\N	f	1	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	2	2	t	7
6513	96	\N	\N	Coffee	t	\N	f	2	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	3	1	t	3
6514	96	\N	\N	Milk	t	\N	t	3	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	4	4	\N	4
4867	81	\N	\N	Sweetner	t	\N	f	1	2026-04-26 14:48:45.816536+03	2026-04-29 15:17:59.772+03	2	2	f	6
6515	96	\N	\N	Foam	t	\N	f	4	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	5	5	f	11
6516	96	\N	\N	Whipped Cream	t	\N	f	5	2026-05-03 12:17:52.897382+03	2026-05-03 12:17:52.897382+03	6	6	f	10
19	9	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
26	12	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
28	12	\N	\N	Vanilla Syrup	f	\N	f	2	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
29	12	\N	\N	Caramel Drizzle	f	\N	f	3	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
21	10	\N	\N	Matcha	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-29 15:17:59.772+03	1	1	\N	\N
7026	100	\N	\N	Water	t	\N	f	0	2026-05-08 00:14:54.314296+03	2026-05-08 00:14:54.314296+03	1	0	\N	\N
7027	100	\N	\N	Sweetner	t	\N	f	1	2026-05-08 00:14:54.314296+03	2026-05-08 00:14:54.314296+03	2	2	t	6
7028	100	\N	\N	Lemon Juice	t	\N	f	2	2026-05-08 00:14:54.314296+03	2026-05-08 00:14:54.314296+03	3	3	\N	\N
7029	100	\N	\N	Sauce	t	\N	f	3	2026-05-08 00:14:54.314296+03	2026-05-08 00:14:54.314296+03	4	4	\N	\N
7030	100	\N	\N	Ice Cubes	t	\N	f	4	2026-05-08 00:14:54.314296+03	2026-05-08 00:14:54.314296+03	5	5	t	9
7031	104	319	\N	Sparkling Water	t	\N	f	0	2026-05-11 16:04:55.656999+03	2026-05-11 16:04:55.656999+03	1	1	\N	\N
7060	62	\N	\N	Soda	t	\N	f	0	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	5	0	\N	\N
7061	62	\N	\N	Sauce	t	\N	f	1	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	1	1	\N	\N
7062	62	\N	\N	Ice Cubes	t	\N	f	2	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	4	2	t	9
7063	62	\N	\N	Mint Leaves	t	\N	f	3	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	2	3	\N	\N
7064	62	\N	\N	Lemon Slice	t	\N	f	4	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	3	4	\N	\N
7065	62	\N	\N	Syrup	t	\N	f	5	2026-05-11 17:31:31.30895+03	2026-05-11 17:31:31.30895+03	6	6	\N	5
\.


--
-- Data for Name: drink_slot_type_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_slot_type_options (id, slot_id, ingredient_type_id, is_default, sort_order, processed_qty, produced_qty, unit, extra_cost, pricing_mode) FROM stdin;
18882	6447	40	f	0	0.0000	0.0000	ml	0.0000	volume
18883	6447	83	f	1	0.0000	0.0000	ml	0.0000	volume
18884	6447	84	f	2	0.0000	0.0000	ml	0.0000	volume
18885	6447	21	f	3	0.0000	0.0000	ml	0.0000	volume
18886	6447	73	t	4	0.0000	0.0000	ml	0.0000	volume
18887	6448	18	t	0	0.0000	0.0000	ml	0.0000	volume
18888	6449	17	t	0	0.0000	0.0000	ml	0.0000	volume
18889	6450	11	t	0	0.0000	0.0000	ml	0.0000	volume
18890	6450	12	f	1	0.0000	0.0000	ml	0.0000	volume
18891	6451	15	f	0	0.0000	0.0000	ml	65.0000	unit
18892	6451	16	f	1	0.0000	0.0000	ml	65.0000	unit
18893	6451	79	f	2	0.0000	0.0000	ml	65.0000	unit
18894	6451	80	f	3	0.0000	0.0000	ml	65.0000	unit
19533	6644	40	f	0	0.0000	0.0000	ml	0.0000	volume
19534	6644	83	f	1	0.0000	0.0000	ml	0.0000	volume
18895	6451	81	f	4	0.0000	0.0000	ml	0.0000	unit
18896	6451	82	f	5	0.0000	0.0000	ml	65.0000	unit
18897	6451	14	t	6	0.0000	0.0000	ml	0.0000	unit
18483	6292	40	f	0	0.0000	0.0000	ml	0.0000	volume
18484	6292	83	f	1	0.0000	0.0000	ml	0.0000	volume
18898	6452	74	f	0	0.0000	20.0000	ml	0.0000	volume
18899	6452	75	t	1	0.0000	40.0000	ml	0.0000	volume
18900	6452	76	f	2	0.0000	70.0000	ml	0.0000	volume
18485	6292	84	f	2	0.0000	0.0000	ml	0.0000	volume
18486	6292	21	f	3	0.0000	0.0000	ml	0.0000	volume
18487	6292	73	t	4	0.0000	0.0000	ml	0.0000	volume
18488	6293	17	t	0	0.0000	0.0000	ml	0.0000	volume
18489	6293	20	f	1	0.0000	0.0000	ml	0.0000	volume
18490	6293	62	f	2	0.0000	0.0000	ml	0.0000	volume
18491	6293	73	f	3	0.0000	0.0000	ml	0.0000	\N
18492	6294	59	t	0	0.0000	0.0000	ml	0.0000	volume
18493	6294	73	f	1	0.0000	0.0000	ml	0.0000	\N
18494	6295	11	t	0	0.0000	0.0000	ml	0.0000	volume
18495	6295	12	f	1	0.0000	0.0000	ml	0.0000	volume
18496	6296	15	f	0	0.0000	0.0000	ml	65.0000	unit
18497	6296	16	f	1	0.0000	0.0000	ml	65.0000	unit
18498	6296	79	f	2	0.0000	0.0000	ml	65.0000	unit
18901	6452	73	f	3	0.0000	0.0000	ml	0.0000	volume
18902	6453	22	f	0	35.0000	35.0000	ml	35.0000	volume
18903	6453	73	t	1	0.0000	0.0000	ml	0.0000	volume
18904	6454	18	t	0	0.0000	0.0000	ml	0.0000	\N
19115	6511	40	f	0	0.0000	0.0000	ml	0.0000	volume
19116	6511	83	f	1	0.0000	0.0000	ml	0.0000	volume
19535	6644	84	f	2	0.0000	0.0000	ml	0.0000	volume
19536	6644	21	f	3	0.0000	0.0000	ml	0.0000	volume
19117	6511	84	f	2	0.0000	0.0000	ml	0.0000	volume
18499	6296	80	f	3	0.0000	0.0000	ml	65.0000	unit
18500	6296	81	f	4	0.0000	0.0000	ml	0.0000	unit
18501	6296	82	f	5	0.0000	0.0000	ml	65.0000	unit
19537	6644	73	t	4	0.0000	0.0000	ml	0.0000	volume
18502	6296	14	t	6	0.0000	0.0000	ml	0.0000	unit
18503	6297	75	t	0	0.0000	40.0000	ml	0.0000	volume
18504	6297	76	f	1	0.0000	70.0000	ml	0.0000	volume
18505	6297	74	f	2	0.0000	20.0000	ml	0.0000	volume
19538	6645	59	t	0	0.0000	0.0000	ml	0.0000	volume
18506	6297	73	f	3	0.0000	0.0000	ml	0.0000	volume
19539	6645	73	f	1	0.0000	0.0000	ml	0.0000	volume
19540	6646	17	t	0	0.0000	0.0000	ml	0.0000	volume
18507	6298	22	f	0	35.0000	35.0000	ml	35.0000	volume
18508	6298	73	t	1	0.0000	0.0000	ml	0.0000	volume
19118	6511	21	f	3	0.0000	0.0000	ml	0.0000	volume
19119	6511	73	t	4	0.0000	0.0000	ml	0.0000	volume
19120	6512	56	t	0	0.0000	0.0000	ml	0.0000	volume
19121	6513	11	t	0	0.0000	0.0000	ml	0.0000	volume
19122	6513	12	f	1	0.0000	0.0000	ml	0.0000	volume
19123	6514	15	f	0	0.0000	0.0000	ml	65.0000	unit
19124	6514	16	f	1	0.0000	0.0000	ml	65.0000	unit
19125	6514	79	f	2	0.0000	0.0000	ml	65.0000	unit
19126	6514	80	f	3	0.0000	0.0000	ml	65.0000	unit
19127	6514	81	f	4	0.0000	0.0000	ml	0.0000	unit
19128	6514	82	f	5	0.0000	0.0000	ml	65.0000	unit
19129	6514	14	t	6	0.0000	0.0000	ml	0.0000	unit
19130	6515	75	t	0	0.0000	40.0000	ml	0.0000	volume
19131	6515	76	f	1	0.0000	70.0000	ml	0.0000	volume
19132	6515	74	f	2	0.0000	20.0000	ml	0.0000	volume
19475	6626	40	f	0	0.0000	0.0000	ml	0.0000	volume
19476	6626	83	f	1	0.0000	0.0000	ml	0.0000	volume
19477	6626	84	f	2	0.0000	0.0000	ml	0.0000	volume
19478	6626	21	f	3	0.0000	0.0000	ml	0.0000	volume
19479	6626	73	t	4	0.0000	0.0000	ml	0.0000	volume
19480	6627	20	t	0	0.0000	0.0000	ml	0.0000	volume
19481	6628	11	t	0	0.0000	0.0000	ml	0.0000	volume
19482	6628	12	f	1	0.0000	0.0000	ml	0.0000	volume
19483	6629	91	t	0	0.0000	0.0000	ml	0.0000	volume
19484	6630	15	f	0	0.0000	0.0000	ml	65.0000	unit
19485	6630	16	f	1	0.0000	0.0000	ml	65.0000	unit
19486	6630	79	f	2	0.0000	0.0000	ml	65.0000	unit
19487	6630	80	f	3	0.0000	0.0000	ml	65.0000	unit
19488	6630	81	f	4	0.0000	0.0000	ml	0.0000	unit
19489	6630	82	f	5	0.0000	0.0000	ml	65.0000	unit
19490	6630	14	t	6	0.0000	0.0000	ml	0.0000	unit
19491	6631	22	f	0	35.0000	35.0000	ml	35.0000	volume
19492	6631	73	t	1	0.0000	0.0000	ml	0.0000	volume
19541	6646	73	f	1	0.0000	0.0000	ml	0.0000	volume
19542	6647	11	t	0	0.0000	0.0000	ml	0.0000	volume
19543	6647	12	f	1	0.0000	0.0000	ml	0.0000	volume
19544	6648	91	t	0	0.0000	0.0000	ml	0.0000	volume
19545	6649	15	f	0	0.0000	0.0000	ml	65.0000	unit
19546	6649	16	f	1	0.0000	0.0000	ml	65.0000	unit
20467	6986	33	t	0	0.0000	0.0000	ml	0.0000	volume
20468	6987	94	t	0	0.0000	0.0000	ml	0.0000	volume
20469	6988	14	t	0	30.0000	30.0000	ml	0.0000	unit
20470	6988	79	f	1	30.0000	30.0000	ml	65.0000	unit
19547	6649	79	f	2	0.0000	0.0000	ml	65.0000	unit
19548	6649	80	f	3	0.0000	0.0000	ml	65.0000	unit
19549	6649	81	f	4	0.0000	0.0000	ml	0.0000	unit
19550	6649	82	f	5	0.0000	0.0000	ml	65.0000	unit
19551	6649	14	t	6	0.0000	0.0000	ml	0.0000	unit
20471	6989	91	f	0	0.0000	0.0000	ml	0.0000	volume
19552	6650	22	f	0	35.0000	35.0000	ml	35.0000	volume
19553	6650	73	t	1	0.0000	0.0000	ml	0.0000	volume
19133	6515	73	f	3	0.0000	0.0000	ml	0.0000	volume
19134	6516	22	f	0	35.0000	35.0000	ml	35.0000	volume
19135	6516	73	t	1	0.0000	0.0000	ml	0.0000	volume
20087	6835	40	f	0	0.0000	0.0000	ml	0.0000	volume
20088	6835	83	f	1	0.0000	0.0000	ml	0.0000	volume
20089	6835	84	f	2	0.0000	0.0000	ml	0.0000	volume
19493	6632	40	f	0	0.0000	0.0000	ml	0.0000	volume
19494	6632	83	f	1	0.0000	0.0000	ml	0.0000	volume
8985	3289	58	t	0	250.0000	250.0000	ml	0.0000	\N
8986	3290	28	t	0	0.0000	0.0000	ml	0.0000	\N
8987	3291	91	f	0	0.0000	0.0000	ml	0.0000	\N
19495	6632	84	f	2	0.0000	0.0000	ml	0.0000	volume
8988	3292	48	t	0	1.0000	1.0000	ml	0.0000	\N
8989	3293	72	t	0	1.0000	1.0000	ml	0.0000	\N
20090	6835	21	f	3	0.0000	0.0000	ml	0.0000	volume
20091	6835	73	t	4	0.0000	0.0000	ml	0.0000	volume
20092	6836	56	t	0	0.0000	0.0000	ml	0.0000	volume
20093	6837	91	t	0	0.0000	0.0000	ml	0.0000	volume
20094	6838	11	t	0	0.0000	0.0000	ml	0.0000	volume
20095	6838	12	f	1	0.0000	0.0000	ml	0.0000	volume
20096	6839	63	t	0	0.0000	0.0000	ml	0.0000	volume
20097	6840	15	f	0	0.0000	0.0000	ml	65.0000	unit
20098	6840	16	f	1	0.0000	0.0000	ml	65.0000	unit
20099	6840	79	f	2	0.0000	0.0000	ml	65.0000	unit
20100	6840	80	f	3	0.0000	0.0000	ml	65.0000	unit
20101	6840	81	f	4	0.0000	0.0000	ml	0.0000	unit
20102	6840	82	f	5	0.0000	0.0000	ml	65.0000	unit
20103	6840	14	t	6	0.0000	0.0000	ml	0.0000	unit
20104	6841	22	t	0	35.0000	35.0000	ml	0.0000	volume
18813	6425	12	t	0	0.0000	0.0000	ml	0.0000	volume
18814	6425	11	f	1	0.0000	0.0000	ml	0.0000	volume
18815	6426	86	t	0	120.0000	40.0000	ml	0.0000	volume
18816	6426	87	f	1	120.0000	40.0000	ml	0.0000	volume
18817	6426	88	f	2	120.0000	60.0000	ml	0.0000	volume
18862	6442	12	f	0	0.0000	0.0000	ml	0.0000	volume
18863	6442	11	t	1	0.0000	0.0000	ml	0.0000	volume
18864	6443	17	f	0	0.0000	0.0000	ml	0.0000	volume
18865	6443	20	f	1	0.0000	0.0000	ml	0.0000	volume
18866	6443	62	f	2	0.0000	0.0000	ml	0.0000	volume
18867	6443	31	f	3	0.0000	0.0000	ml	0.0000	volume
18868	6443	73	t	4	0.0000	0.0000	ml	0.0000	volume
18869	6444	15	f	0	0.0000	0.0000	ml	65.0000	unit
18870	6444	16	f	1	0.0000	0.0000	ml	65.0000	unit
18871	6444	79	f	2	0.0000	0.0000	ml	65.0000	unit
18872	6444	80	f	3	0.0000	0.0000	ml	65.0000	unit
19496	6632	21	f	3	0.0000	0.0000	ml	0.0000	volume
19497	6632	73	t	4	0.0000	0.0000	ml	0.0000	volume
19498	6633	27	t	0	0.0000	0.0000	ml	0.0000	volume
19499	6634	11	t	0	0.0000	0.0000	ml	0.0000	volume
19500	6634	12	f	1	0.0000	0.0000	ml	0.0000	volume
19501	6635	91	t	0	0.0000	0.0000	ml	0.0000	volume
19502	6636	15	f	0	0.0000	0.0000	ml	65.0000	unit
19503	6636	16	f	1	0.0000	0.0000	ml	65.0000	unit
19504	6636	79	f	2	0.0000	0.0000	ml	65.0000	unit
19505	6636	80	f	3	0.0000	0.0000	ml	65.0000	unit
19506	6636	81	f	4	0.0000	0.0000	ml	0.0000	unit
19507	6636	82	f	5	0.0000	0.0000	ml	65.0000	unit
19508	6636	14	t	6	0.0000	0.0000	ml	0.0000	unit
19509	6637	22	f	0	35.0000	35.0000	ml	35.0000	volume
19510	6637	73	t	1	0.0000	0.0000	ml	0.0000	volume
18873	6444	81	f	4	0.0000	0.0000	ml	0.0000	unit
18874	6444	82	f	5	0.0000	0.0000	ml	65.0000	unit
18875	6444	14	t	6	0.0000	0.0000	ml	0.0000	unit
18876	6445	74	f	0	0.0000	20.0000	ml	0.0000	volume
18877	6445	75	f	1	0.0000	40.0000	ml	0.0000	volume
18878	6445	76	t	2	0.0000	70.0000	ml	0.0000	volume
18879	6445	73	f	3	0.0000	0.0000	ml	0.0000	volume
18880	6446	22	f	0	35.0000	35.0000	ml	35.0000	volume
18881	6446	73	t	1	0.0000	0.0000	ml	0.0000	volume
18928	6461	12	t	0	0.0000	0.0000	ml	0.0000	volume
18929	6461	11	f	1	0.0000	0.0000	ml	0.0000	volume
18930	6462	17	f	0	0.0000	0.0000	ml	0.0000	volume
18931	6462	20	f	1	0.0000	0.0000	ml	0.0000	volume
18932	6462	62	f	2	0.0000	0.0000	ml	0.0000	volume
18933	6462	73	t	3	0.0000	0.0000	ml	0.0000	volume
18934	6463	74	t	0	0.0000	20.0000	ml	0.0000	volume
18935	6463	75	f	1	0.0000	40.0000	ml	0.0000	volume
18936	6463	76	f	2	0.0000	70.0000	ml	0.0000	volume
18937	6464	15	f	0	0.0000	0.0000	ml	65.0000	unit
18938	6464	16	f	1	0.0000	0.0000	ml	65.0000	unit
18939	6464	79	f	2	0.0000	0.0000	ml	65.0000	unit
18940	6464	80	f	3	0.0000	0.0000	ml	65.0000	unit
18941	6464	81	f	4	0.0000	0.0000	ml	0.0000	unit
19876	6760	40	f	0	0.0000	0.0000	ml	0.0000	volume
19877	6760	83	f	1	0.0000	0.0000	ml	0.0000	volume
19878	6760	84	f	2	0.0000	0.0000	ml	0.0000	volume
19879	6760	21	f	3	0.0000	0.0000	ml	0.0000	volume
19880	6760	73	t	4	0.0000	0.0000	ml	0.0000	volume
18942	6464	82	f	5	0.0000	0.0000	ml	65.0000	unit
18943	6464	14	t	6	0.0000	0.0000	ml	0.0000	unit
18944	6465	40	f	0	0.0000	0.0000	ml	0.0000	volume
18945	6465	83	f	1	0.0000	0.0000	ml	0.0000	volume
18946	6465	84	f	2	0.0000	0.0000	ml	0.0000	volume
18947	6465	21	f	3	0.0000	0.0000	ml	0.0000	volume
18948	6465	73	t	4	0.0000	0.0000	ml	0.0000	volume
19881	6761	56	t	0	0.0000	0.0000	ml	0.0000	volume
19882	6762	63	t	0	0.0000	0.0000	ml	0.0000	volume
19883	6763	11	t	0	0.0000	0.0000	ml	0.0000	volume
18949	6466	22	f	0	35.0000	35.0000	ml	35.0000	volume
19884	6763	12	f	1	0.0000	0.0000	ml	0.0000	volume
19885	6764	91	t	0	0.0000	0.0000	ml	0.0000	volume
19886	6765	15	f	0	0.0000	0.0000	ml	65.0000	unit
19887	6765	16	f	1	0.0000	0.0000	ml	65.0000	unit
19888	6765	79	f	2	0.0000	0.0000	ml	65.0000	unit
19889	6765	80	f	3	0.0000	0.0000	ml	65.0000	unit
19890	6765	81	f	4	0.0000	0.0000	ml	0.0000	unit
19891	6765	82	f	5	0.0000	0.0000	ml	65.0000	unit
19892	6765	14	t	6	0.0000	0.0000	ml	0.0000	unit
19893	6766	22	t	0	35.0000	35.0000	ml	0.0000	volume
19750	6717	21	f	0	0.0000	0.0000	ml	0.0000	volume
19253	6551	40	f	0	0.0000	0.0000	ml	0.0000	volume
19254	6551	83	f	1	0.0000	0.0000	ml	0.0000	volume
19255	6551	84	f	2	0.0000	0.0000	ml	0.0000	volume
18950	6466	73	t	1	0.0000	0.0000	ml	0.0000	volume
19136	6517	40	f	0	0.0000	0.0000	ml	0.0000	volume
19137	6517	83	f	1	0.0000	0.0000	ml	0.0000	volume
19138	6517	84	f	2	0.0000	0.0000	ml	0.0000	volume
19139	6517	21	f	3	0.0000	0.0000	ml	0.0000	volume
19140	6517	73	t	4	0.0000	0.0000	ml	0.0000	volume
19141	6518	35	t	0	0.0000	0.0000	ml	0.0000	unit
19142	6519	11	t	0	0.0000	0.0000	ml	0.0000	volume
19256	6551	21	f	3	0.0000	0.0000	ml	0.0000	volume
19257	6551	73	t	4	0.0000	0.0000	ml	0.0000	volume
19258	6552	17	f	0	0.0000	0.0000	ml	0.0000	volume
19259	6552	20	f	1	0.0000	0.0000	ml	0.0000	volume
19260	6552	62	f	2	0.0000	0.0000	ml	0.0000	volume
19261	6552	73	t	3	0.0000	0.0000	ml	0.0000	volume
19143	6519	12	f	1	0.0000	0.0000	ml	0.0000	volume
19144	6520	15	f	0	0.0000	0.0000	ml	65.0000	unit
19145	6520	16	f	1	0.0000	0.0000	ml	65.0000	unit
19146	6520	79	f	2	0.0000	0.0000	ml	65.0000	unit
19147	6520	80	f	3	0.0000	0.0000	ml	65.0000	unit
19148	6520	81	f	4	0.0000	0.0000	ml	0.0000	unit
19149	6520	82	f	5	0.0000	0.0000	ml	65.0000	unit
19150	6520	14	t	6	0.0000	0.0000	ml	0.0000	unit
19151	6521	74	f	0	0.0000	20.0000	ml	0.0000	volume
19152	6521	75	t	1	0.0000	40.0000	ml	0.0000	volume
19262	6553	65	t	0	0.0000	0.0000	ml	0.0000	volume
19263	6554	11	t	0	0.0000	0.0000	ml	0.0000	volume
19264	6554	12	f	1	0.0000	0.0000	ml	0.0000	volume
14104	4866	71	t	0	1.0000	1.0000	ml	0.0000	\N
14105	4867	40	f	0	0.0000	0.0000	ml	0.0000	\N
14106	4867	83	f	1	0.0000	0.0000	ml	0.0000	\N
20472	6990	28	t	0	0.0000	0.0000	ml	0.0000	volume
20473	6991	91	t	0	0.0000	0.0000	ml	0.0000	volume
20474	6992	45	t	0	250.0000	250.0000	ml	0.0000	volume
20475	6993	72	t	0	5.0000	5.0000	ml	0.0000	volume
19265	6555	15	f	0	0.0000	0.0000	ml	65.0000	unit
19266	6555	16	f	1	0.0000	0.0000	ml	65.0000	unit
19267	6555	79	f	2	0.0000	0.0000	ml	65.0000	unit
19268	6555	80	f	3	0.0000	0.0000	ml	65.0000	unit
19269	6555	81	f	4	0.0000	0.0000	ml	0.0000	unit
19270	6555	82	f	5	0.0000	0.0000	ml	65.0000	unit
19271	6555	14	t	6	0.0000	0.0000	ml	0.0000	unit
19272	6556	75	t	0	0.0000	40.0000	ml	0.0000	volume
19273	6556	74	f	1	0.0000	20.0000	ml	0.0000	volume
19274	6556	76	f	2	0.0000	70.0000	ml	0.0000	volume
19275	6556	73	f	3	0.0000	0.0000	ml	0.0000	volume
19276	6557	22	f	0	35.0000	35.0000	ml	35.0000	volume
19277	6557	73	t	1	0.0000	0.0000	ml	0.0000	volume
19751	6717	84	f	1	0.0000	0.0000	ml	0.0000	volume
19752	6717	40	f	2	0.0000	0.0000	ml	0.0000	volume
19753	6717	83	f	3	0.0000	0.0000	ml	0.0000	volume
19754	6717	73	t	4	0.0000	0.0000	ml	0.0000	volume
19755	6718	17	f	0	0.0000	0.0000	ml	0.0000	volume
19756	6718	62	f	1	0.0000	0.0000	ml	0.0000	volume
19757	6718	20	f	2	0.0000	0.0000	ml	0.0000	volume
19758	6718	73	t	3	0.0000	0.0000	ml	0.0000	volume
19759	6719	11	t	0	0.0000	0.0000	ml	0.0000	volume
19760	6719	12	f	1	0.0000	0.0000	ml	0.0000	volume
19761	6720	91	t	0	0.0000	0.0000	ml	0.0000	volume
19762	6721	32	t	0	0.0000	0.0000	ml	0.0000	volume
19763	6722	22	t	0	35.0000	35.0000	ml	0.0000	volume
19764	6722	73	f	1	0.0000	0.0000	ml	0.0000	volume
19765	6723	15	f	0	0.0000	0.0000	ml	65.0000	unit
19766	6723	16	f	1	0.0000	0.0000	ml	65.0000	unit
19767	6723	79	f	2	0.0000	0.0000	ml	65.0000	unit
14107	4867	84	f	2	0.0000	0.0000	ml	0.0000	\N
14108	4867	21	f	3	0.0000	0.0000	ml	0.0000	\N
14109	4867	73	t	4	0.0000	0.0000	ml	0.0000	\N
19894	6766	73	f	1	0.0000	0.0000	ml	0.0000	volume
20105	6841	73	f	1	0.0000	0.0000	ml	0.0000	volume
20476	6994	93	t	0	330.0000	330.0000	ml	0.0000	volume
20477	6995	38	t	0	0.0000	0.0000	ml	0.0000	volume
20478	6996	91	f	0	0.0000	0.0000	ml	0.0000	volume
20479	6997	48	t	0	1.0000	1.0000	ml	0.0000	volume
20480	6997	73	f	1	0.0000	0.0000	ml	0.0000	volume
20481	6998	72	t	0	5.0000	5.0000	ml	0.0000	volume
20286	6908	40	t	0	0.0000	0.0000	ml	0.0000	volume
20287	6908	83	f	1	0.0000	0.0000	ml	0.0000	volume
20288	6908	84	f	2	0.0000	0.0000	ml	0.0000	volume
8883	3208	93	t	0	330.0000	330.0000	ml	0.0000	\N
8884	3209	28	t	0	0.0000	0.0000	ml	0.0000	\N
8885	3210	91	f	0	0.0000	0.0000	ml	0.0000	\N
8886	3211	48	t	0	1.0000	1.0000	ml	0.0000	\N
8887	3212	72	t	0	1.0000	1.0000	ml	0.0000	\N
20289	6908	21	f	3	0.0000	0.0000	ml	0.0000	volume
20290	6909	17	t	0	0.0000	0.0000	ml	0.0000	volume
20291	6909	20	f	1	0.0000	0.0000	ml	0.0000	volume
20292	6909	62	f	2	0.0000	0.0000	ml	0.0000	volume
20293	6910	65	t	0	0.0000	0.0000	ml	0.0000	volume
20294	6911	63	t	0	0.0000	0.0000	ml	0.0000	volume
20295	6912	11	f	0	0.0000	0.0000	ml	0.0000	volume
20296	6912	12	f	1	0.0000	0.0000	ml	0.0000	volume
20297	6913	91	f	0	0.0000	0.0000	ml	0.0000	volume
20298	6914	15	t	0	0.0000	0.0000	ml	65.0000	unit
20299	6914	16	f	1	0.0000	0.0000	ml	65.0000	unit
20300	6914	79	f	2	0.0000	0.0000	ml	65.0000	unit
20301	6914	80	f	3	0.0000	0.0000	ml	65.0000	unit
20302	6914	81	f	4	0.0000	0.0000	ml	0.0000	unit
20303	6914	82	f	5	0.0000	0.0000	ml	65.0000	unit
20304	6914	14	f	6	0.0000	0.0000	ml	0.0000	unit
20305	6915	22	t	0	35.0000	35.0000	ml	0.0000	volume
20306	6915	73	f	1	0.0000	0.0000	ml	0.0000	volume
20366	6945	19	t	0	0.0000	0.0000	ml	0.0000	volume
20367	6946	32	t	0	0.0000	0.0000	ml	0.0000	volume
20368	6947	91	f	0	0.0000	0.0000	ml	0.0000	volume
20369	6948	15	f	0	0.0000	0.0000	ml	65.0000	unit
20370	6948	16	f	1	0.0000	0.0000	ml	65.0000	unit
20371	6948	79	f	2	0.0000	0.0000	ml	65.0000	unit
20372	6948	80	f	3	0.0000	0.0000	ml	65.0000	unit
20373	6948	81	f	4	0.0000	0.0000	ml	0.0000	unit
20374	6948	82	f	5	0.0000	0.0000	ml	65.0000	unit
20375	6948	14	t	6	0.0000	0.0000	ml	0.0000	unit
20376	6949	22	t	0	35.0000	35.0000	ml	35.0000	volume
20377	6949	73	f	1	0.0000	0.0000	ml	0.0000	volume
20482	6998	73	f	1	0.0000	0.0000	ml	0.0000	volume
18951	6467	40	f	0	0.0000	0.0000	ml	0.0000	volume
18952	6467	83	f	1	0.0000	0.0000	ml	0.0000	volume
18953	6467	84	f	2	0.0000	0.0000	ml	0.0000	volume
18954	6467	21	f	3	0.0000	0.0000	ml	0.0000	volume
18955	6467	73	t	4	0.0000	0.0000	ml	0.0000	volume
18956	6468	59	t	0	0.0000	0.0000	ml	0.0000	volume
20444	6972	24	t	0	3.0000	70.0000	ml	0.0000	volume
20445	6973	40	t	0	0.0000	0.0000	ml	0.0000	volume
20446	6973	73	f	1	0.0000	0.0000	ml	0.0000	volume
20447	6974	91	f	0	0.0000	0.0000	ml	0.0000	volume
20448	6975	15	f	0	0.0000	0.0000	ml	65.0000	unit
20449	6975	16	f	1	0.0000	0.0000	ml	65.0000	unit
20450	6975	79	f	2	0.0000	0.0000	ml	65.0000	unit
20451	6975	80	f	3	0.0000	0.0000	ml	65.0000	unit
20452	6975	81	f	4	0.0000	0.0000	ml	0.0000	unit
20453	6975	82	f	5	0.0000	0.0000	ml	65.0000	unit
20454	6975	14	t	6	0.0000	0.0000	ml	0.0000	unit
20455	6976	22	f	0	35.0000	35.0000	ml	35.0000	volume
20456	6976	73	t	1	0.0000	0.0000	ml	0.0000	volume
19768	6723	80	f	3	0.0000	0.0000	ml	65.0000	unit
19769	6723	81	f	4	0.0000	0.0000	ml	0.0000	unit
19770	6723	82	f	5	0.0000	0.0000	ml	65.0000	unit
19771	6723	14	t	6	0.0000	0.0000	ml	0.0000	unit
18818	6427	11	t	0	0.0000	0.0000	ml	0.0000	volume
18819	6427	12	f	1	0.0000	0.0000	ml	0.0000	volume
18820	6428	22	t	0	35.0000	35.0000	ml	0.0000	volume
18957	6469	11	f	0	0.0000	0.0000	ml	0.0000	volume
18958	6469	12	t	1	0.0000	0.0000	ml	0.0000	volume
18959	6470	15	f	0	0.0000	0.0000	ml	65.0000	unit
18960	6470	16	f	1	0.0000	0.0000	ml	65.0000	unit
18961	6470	79	f	2	0.0000	0.0000	ml	65.0000	unit
18962	6470	80	f	3	0.0000	0.0000	ml	65.0000	unit
18963	6470	81	f	4	0.0000	0.0000	ml	0.0000	unit
18964	6470	82	f	5	0.0000	0.0000	ml	65.0000	unit
18965	6470	14	t	6	0.0000	0.0000	ml	0.0000	unit
18966	6471	74	t	0	0.0000	20.0000	ml	0.0000	volume
18967	6471	75	f	1	0.0000	40.0000	ml	0.0000	volume
18968	6471	76	f	2	0.0000	70.0000	ml	0.0000	volume
18969	6471	73	f	3	0.0000	0.0000	ml	0.0000	volume
18970	6472	22	f	0	35.0000	35.0000	ml	35.0000	volume
18971	6472	73	t	1	0.0000	0.0000	ml	0.0000	volume
19153	6521	76	f	2	0.0000	70.0000	ml	0.0000	volume
19154	6521	73	f	3	0.0000	0.0000	ml	0.0000	volume
19155	6522	22	f	0	35.0000	35.0000	ml	35.0000	volume
19156	6522	73	t	1	0.0000	0.0000	ml	0.0000	volume
19278	6558	40	f	0	0.0000	0.0000	ml	0.0000	volume
20483	6999	40	f	0	0.0000	0.0000	ml	0.0000	volume
20484	6999	83	f	1	0.0000	0.0000	ml	0.0000	volume
20485	6999	84	f	2	0.0000	0.0000	ml	0.0000	volume
18972	6473	40	f	0	0.0000	0.0000	ml	0.0000	volume
19895	6767	40	f	0	0.0000	0.0000	ml	0.0000	volume
20170	6866	40	f	0	0.0000	0.0000	ml	0.0000	volume
20171	6866	83	f	1	0.0000	0.0000	ml	0.0000	volume
20172	6866	84	f	2	0.0000	0.0000	ml	0.0000	volume
20173	6866	21	f	3	0.0000	0.0000	ml	0.0000	volume
20174	6866	73	t	4	0.0000	0.0000	ml	0.0000	volume
20175	6867	17	f	0	0.0000	0.0000	ml	0.0000	volume
20176	6867	20	f	1	0.0000	0.0000	ml	0.0000	volume
20177	6867	62	f	2	0.0000	0.0000	ml	0.0000	volume
20178	6867	31	f	3	0.0000	0.0000	ml	0.0000	volume
20179	6867	73	t	4	0.0000	0.0000	ml	0.0000	volume
20180	6868	19	t	0	0.0000	0.0000	ml	0.0000	volume
20181	6869	34	t	0	0.0000	0.0000	ml	0.0000	volume
20182	6870	11	t	0	0.0000	0.0000	ml	0.0000	volume
20183	6870	12	f	1	0.0000	0.0000	ml	0.0000	volume
20184	6871	91	t	0	0.0000	0.0000	ml	0.0000	volume
20185	6872	15	f	0	0.0000	0.0000	ml	65.0000	unit
20186	6872	16	f	1	0.0000	0.0000	ml	65.0000	unit
20486	6999	21	f	3	0.0000	0.0000	ml	0.0000	volume
20487	6999	73	t	4	0.0000	0.0000	ml	0.0000	volume
20488	7000	20	f	0	0.0000	0.0000	ml	0.0000	volume
20489	7000	62	f	1	0.0000	0.0000	ml	0.0000	volume
20490	7000	33	f	2	0.0000	0.0000	ml	0.0000	volume
20491	7000	17	f	3	0.0000	0.0000	ml	0.0000	volume
18973	6473	83	f	1	0.0000	0.0000	ml	0.0000	volume
18974	6473	84	f	2	0.0000	0.0000	ml	0.0000	volume
20492	7000	31	f	4	0.0000	0.0000	ml	0.0000	\N
20493	7000	73	t	5	0.0000	0.0000	ml	0.0000	\N
20494	7001	32	t	0	0.0000	0.0000	ml	0.0000	volume
20495	7002	15	f	0	0.0000	0.0000	ml	65.0000	unit
20496	7002	16	f	1	0.0000	0.0000	ml	65.0000	unit
19279	6558	83	f	1	0.0000	0.0000	ml	0.0000	volume
19280	6558	84	f	2	0.0000	0.0000	ml	0.0000	volume
20497	7002	79	f	2	0.0000	0.0000	ml	65.0000	unit
20498	7002	80	f	3	0.0000	0.0000	ml	65.0000	unit
19587	6663	21	f	0	0.0000	0.0000	ml	0.0000	volume
19588	6663	73	t	1	0.0000	0.0000	ml	0.0000	volume
19589	6664	56	t	0	0.0000	0.0000	ml	0.0000	volume
19590	6665	11	t	0	0.0000	0.0000	ml	0.0000	volume
19591	6665	12	f	1	0.0000	0.0000	ml	0.0000	volume
19592	6666	91	t	0	0.0000	0.0000	ml	0.0000	volume
19593	6667	15	f	0	0.0000	0.0000	ml	65.0000	unit
19594	6667	16	f	1	0.0000	0.0000	ml	65.0000	unit
19595	6667	79	f	2	0.0000	0.0000	ml	65.0000	unit
18975	6473	21	f	3	0.0000	0.0000	ml	0.0000	volume
18976	6473	73	t	4	0.0000	0.0000	ml	0.0000	volume
18977	6474	17	f	0	0.0000	0.0000	ml	0.0000	volume
18978	6474	20	f	1	0.0000	0.0000	ml	0.0000	volume
18979	6474	62	f	2	0.0000	0.0000	ml	0.0000	volume
18980	6474	73	t	3	0.0000	0.0000	ml	0.0000	volume
18981	6475	11	f	0	0.0000	0.0000	ml	0.0000	volume
19596	6667	80	f	3	0.0000	0.0000	ml	65.0000	unit
19597	6667	81	f	4	0.0000	0.0000	ml	0.0000	unit
19598	6667	82	f	5	0.0000	0.0000	ml	65.0000	unit
19599	6667	14	t	6	0.0000	0.0000	ml	0.0000	unit
19600	6668	22	f	0	35.0000	35.0000	ml	35.0000	volume
19601	6668	73	t	1	0.0000	0.0000	ml	0.0000	volume
19772	6724	11	t	0	0.0000	0.0000	ml	0.0000	volume
19773	6724	12	f	1	0.0000	0.0000	ml	0.0000	volume
19774	6725	18	t	0	0.0000	0.0000	ml	0.0000	volume
19775	6726	17	t	0	0.0000	0.0000	ml	0.0000	volume
18982	6475	12	t	1	0.0000	0.0000	ml	0.0000	volume
18983	6476	15	f	0	0.0000	0.0000	ml	65.0000	unit
18984	6476	16	f	1	0.0000	0.0000	ml	65.0000	unit
18985	6476	79	f	2	0.0000	0.0000	ml	65.0000	unit
18986	6476	80	f	3	0.0000	0.0000	ml	65.0000	unit
18987	6476	81	f	4	0.0000	0.0000	ml	0.0000	unit
19776	6727	91	t	0	0.0000	0.0000	ml	0.0000	volume
19777	6728	22	t	0	35.0000	35.0000	ml	0.0000	volume
18988	6476	82	f	5	0.0000	0.0000	ml	65.0000	unit
18989	6476	14	t	6	0.0000	0.0000	ml	0.0000	unit
18990	6477	74	t	0	0.0000	20.0000	ml	0.0000	volume
18991	6477	75	f	1	0.0000	40.0000	ml	0.0000	volume
18992	6477	76	f	2	0.0000	70.0000	ml	0.0000	volume
18993	6477	73	f	3	0.0000	0.0000	ml	0.0000	volume
18994	6478	22	f	0	35.0000	35.0000	ml	35.0000	volume
18995	6478	73	t	1	0.0000	0.0000	ml	0.0000	volume
19157	6523	40	f	0	0.0000	0.0000	ml	0.0000	volume
19158	6523	83	f	1	0.0000	0.0000	ml	0.0000	volume
19778	6728	73	f	1	0.0000	0.0000	ml	0.0000	volume
19779	6729	73	t	0	0.0000	0.0000	ml	0.0000	volume
19780	6729	84	f	1	0.0000	0.0000	ml	0.0000	volume
19781	6729	83	f	2	0.0000	0.0000	ml	0.0000	volume
19782	6729	40	f	3	0.0000	0.0000	ml	0.0000	volume
19783	6729	21	f	4	0.0000	0.0000	ml	0.0000	volume
19784	6730	63	t	0	30.0000	30.0000	ml	0.0000	volume
19785	6731	15	f	0	0.0000	0.0000	ml	65.0000	unit
19786	6731	16	f	1	0.0000	0.0000	ml	65.0000	unit
19787	6731	79	f	2	0.0000	0.0000	ml	65.0000	unit
19788	6731	80	f	3	0.0000	0.0000	ml	65.0000	unit
19789	6731	81	f	4	0.0000	0.0000	ml	0.0000	unit
19790	6731	82	f	5	0.0000	0.0000	ml	65.0000	unit
19791	6731	14	t	6	0.0000	0.0000	ml	0.0000	unit
19159	6523	84	f	2	0.0000	0.0000	ml	0.0000	volume
19160	6523	21	f	3	0.0000	0.0000	ml	0.0000	volume
19161	6523	73	t	4	0.0000	0.0000	ml	0.0000	volume
19162	6524	35	t	0	0.0000	0.0000	ml	0.0000	unit
19163	6525	44	t	0	0.0000	0.0000	ml	0.0000	volume
19164	6526	11	t	0	0.0000	0.0000	ml	0.0000	volume
19165	6526	12	f	1	0.0000	0.0000	ml	0.0000	volume
19166	6527	15	f	0	0.0000	0.0000	ml	65.0000	unit
19167	6527	16	f	1	0.0000	0.0000	ml	65.0000	unit
19168	6527	79	f	2	0.0000	0.0000	ml	65.0000	unit
19169	6527	80	f	3	0.0000	0.0000	ml	65.0000	unit
19170	6527	81	f	4	0.0000	0.0000	ml	0.0000	unit
19171	6527	82	f	5	0.0000	0.0000	ml	65.0000	unit
19172	6527	14	t	6	0.0000	0.0000	ml	0.0000	unit
19173	6528	75	t	0	0.0000	40.0000	ml	0.0000	volume
19174	6528	76	f	1	0.0000	70.0000	ml	0.0000	volume
19175	6528	74	f	2	0.0000	20.0000	ml	0.0000	volume
19176	6529	22	f	0	35.0000	35.0000	ml	35.0000	volume
19177	6529	73	t	1	0.0000	0.0000	ml	0.0000	volume
18996	6479	40	f	0	0.0000	0.0000	ml	0.0000	volume
18997	6479	83	f	1	0.0000	0.0000	ml	0.0000	volume
18998	6479	84	f	2	0.0000	0.0000	ml	0.0000	volume
18999	6479	21	f	3	0.0000	0.0000	ml	0.0000	volume
19000	6479	73	t	4	0.0000	0.0000	ml	0.0000	volume
19001	6480	56	t	0	0.0000	0.0000	ml	0.0000	volume
19002	6481	11	t	0	0.0000	0.0000	ml	0.0000	volume
19003	6481	12	f	1	0.0000	0.0000	ml	0.0000	volume
19004	6482	15	f	0	0.0000	0.0000	ml	65.0000	unit
19005	6482	16	f	1	0.0000	0.0000	ml	65.0000	unit
19006	6482	79	f	2	0.0000	0.0000	ml	65.0000	unit
19007	6482	80	f	3	0.0000	0.0000	ml	65.0000	unit
20499	7002	81	f	4	0.0000	0.0000	ml	0.0000	unit
20500	7002	82	f	5	0.0000	0.0000	ml	65.0000	unit
18821	6429	11	t	0	0.0000	0.0000	ml	0.0000	volume
18822	6429	12	f	1	0.0000	0.0000	ml	0.0000	volume
18823	6430	68	t	0	0.0000	0.0000	ml	0.0000	volume
19008	6482	81	f	4	0.0000	0.0000	ml	0.0000	unit
20501	7002	14	t	6	0.0000	0.0000	ml	0.0000	unit
20502	7003	22	f	0	35.0000	35.0000	ml	35.0000	volume
19009	6482	82	f	5	0.0000	0.0000	ml	65.0000	unit
19010	6482	14	t	6	0.0000	0.0000	ml	0.0000	unit
19011	6483	74	t	0	0.0000	20.0000	ml	0.0000	volume
19012	6483	75	f	1	0.0000	40.0000	ml	0.0000	volume
19013	6483	76	f	2	0.0000	70.0000	ml	0.0000	volume
19014	6483	73	f	3	0.0000	0.0000	ml	0.0000	volume
20503	7003	73	t	1	0.0000	0.0000	ml	0.0000	volume
19015	6484	22	f	0	35.0000	35.0000	ml	35.0000	volume
19016	6484	73	t	1	0.0000	0.0000	ml	0.0000	volume
19178	6530	40	f	0	0.0000	0.0000	ml	0.0000	volume
19179	6530	83	f	1	0.0000	0.0000	ml	0.0000	volume
19180	6530	84	f	2	0.0000	0.0000	ml	0.0000	volume
19181	6530	21	f	3	0.0000	0.0000	ml	0.0000	volume
19182	6530	73	t	4	0.0000	0.0000	ml	0.0000	volume
19183	6531	20	f	0	0.0000	0.0000	ml	0.0000	volume
19184	6531	62	f	1	0.0000	0.0000	ml	0.0000	volume
19185	6531	17	f	2	0.0000	0.0000	ml	0.0000	volume
19186	6531	73	t	3	0.0000	0.0000	ml	0.0000	volume
19187	6532	19	t	0	0.0000	0.0000	ml	0.0000	volume
19188	6533	11	t	0	0.0000	0.0000	ml	0.0000	volume
19189	6533	12	f	1	0.0000	0.0000	ml	0.0000	volume
19190	6534	15	f	0	0.0000	0.0000	ml	65.0000	unit
19191	6534	16	f	1	0.0000	0.0000	ml	65.0000	unit
19192	6534	79	f	2	0.0000	0.0000	ml	65.0000	unit
19281	6558	21	f	3	0.0000	0.0000	ml	0.0000	volume
19896	6767	83	f	1	0.0000	0.0000	ml	0.0000	volume
19897	6767	84	f	2	0.0000	0.0000	ml	0.0000	volume
19898	6767	21	f	3	0.0000	0.0000	ml	0.0000	volume
19899	6767	73	t	4	0.0000	0.0000	ml	0.0000	volume
19900	6768	20	t	0	0.0000	0.0000	ml	0.0000	volume
19901	6769	63	t	0	0.0000	0.0000	ml	0.0000	volume
19902	6770	11	t	0	0.0000	0.0000	ml	0.0000	volume
19903	6770	12	f	1	0.0000	0.0000	ml	0.0000	volume
19904	6771	91	t	0	0.0000	0.0000	ml	0.0000	volume
19905	6772	15	f	0	0.0000	0.0000	ml	65.0000	unit
19906	6772	16	f	1	0.0000	0.0000	ml	65.0000	unit
19907	6772	79	f	2	0.0000	0.0000	ml	65.0000	unit
19908	6772	80	f	3	0.0000	0.0000	ml	65.0000	unit
19909	6772	81	f	4	0.0000	0.0000	ml	0.0000	unit
19910	6772	82	f	5	0.0000	0.0000	ml	65.0000	unit
19911	6772	14	t	6	0.0000	0.0000	ml	0.0000	unit
19912	6773	22	t	0	35.0000	35.0000	ml	0.0000	volume
19913	6773	73	f	1	0.0000	0.0000	ml	0.0000	volume
19193	6534	80	f	3	0.0000	0.0000	ml	65.0000	unit
19194	6534	81	f	4	0.0000	0.0000	ml	0.0000	unit
19195	6534	82	f	5	0.0000	0.0000	ml	65.0000	unit
19196	6534	14	t	6	0.0000	0.0000	ml	0.0000	unit
19197	6535	75	t	0	0.0000	40.0000	ml	0.0000	volume
19198	6535	76	f	1	0.0000	70.0000	ml	0.0000	volume
19199	6535	74	f	2	0.0000	20.0000	ml	0.0000	volume
19200	6535	73	f	3	0.0000	0.0000	ml	0.0000	volume
19201	6536	22	f	0	35.0000	35.0000	ml	35.0000	volume
19202	6536	73	t	1	0.0000	0.0000	ml	0.0000	volume
19282	6558	73	t	4	0.0000	0.0000	ml	0.0000	volume
19283	6559	17	t	0	0.0000	0.0000	ml	0.0000	volume
19284	6559	62	t	1	0.0000	0.0000	ml	0.0000	volume
19285	6559	20	f	2	0.0000	0.0000	ml	0.0000	volume
19286	6560	19	t	0	0.0000	0.0000	ml	0.0000	volume
19287	6561	11	t	0	0.0000	0.0000	ml	0.0000	volume
19288	6561	12	f	1	0.0000	0.0000	ml	0.0000	volume
19289	6562	15	f	0	0.0000	0.0000	ml	65.0000	unit
19290	6562	16	f	1	0.0000	0.0000	ml	65.0000	unit
19291	6562	79	f	2	0.0000	0.0000	ml	65.0000	unit
19292	6562	80	f	3	0.0000	0.0000	ml	65.0000	unit
19293	6562	81	f	4	0.0000	0.0000	ml	0.0000	unit
19294	6562	82	f	5	0.0000	0.0000	ml	65.0000	unit
19295	6562	14	t	6	0.0000	0.0000	ml	0.0000	unit
19296	6563	75	t	0	0.0000	40.0000	ml	0.0000	volume
19297	6563	74	f	1	0.0000	20.0000	ml	0.0000	volume
19298	6563	76	f	2	0.0000	70.0000	ml	0.0000	volume
19299	6563	73	f	3	0.0000	0.0000	ml	0.0000	volume
19300	6564	22	f	0	35.0000	35.0000	ml	35.0000	volume
19301	6564	73	t	1	0.0000	0.0000	ml	0.0000	volume
19334	6579	91	t	0	0.0000	0.0000	ml	0.0000	volume
19335	6580	11	t	0	0.0000	0.0000	ml	0.0000	volume
19336	6580	12	f	1	0.0000	0.0000	ml	0.0000	volume
19511	6638	40	f	0	0.0000	0.0000	ml	0.0000	volume
19512	6638	83	f	1	0.0000	0.0000	ml	0.0000	volume
19513	6638	84	f	2	0.0000	0.0000	ml	0.0000	volume
19514	6638	21	f	3	0.0000	0.0000	ml	0.0000	volume
19515	6638	73	t	4	0.0000	0.0000	ml	0.0000	volume
19516	6639	17	t	0	0.0000	0.0000	ml	0.0000	volume
19517	6639	20	f	1	0.0000	0.0000	ml	0.0000	volume
19518	6639	62	f	2	0.0000	0.0000	ml	0.0000	volume
19519	6639	31	f	3	0.0000	0.0000	ml	0.0000	\N
19520	6639	73	f	4	0.0000	0.0000	ml	0.0000	\N
19521	6640	11	t	0	0.0000	0.0000	ml	0.0000	volume
19522	6640	12	f	1	0.0000	0.0000	ml	0.0000	volume
19523	6641	91	t	0	0.0000	0.0000	ml	0.0000	volume
19602	6669	40	f	0	0.0000	0.0000	ml	0.0000	volume
19603	6669	83	f	1	0.0000	0.0000	ml	0.0000	volume
19604	6669	84	f	2	0.0000	0.0000	ml	0.0000	volume
19605	6669	21	f	3	0.0000	0.0000	ml	0.0000	volume
19606	6669	73	t	4	0.0000	0.0000	ml	0.0000	volume
19607	6670	35	t	0	0.0000	0.0000	ml	0.0000	unit
19608	6671	11	t	0	0.0000	0.0000	ml	0.0000	volume
19609	6671	12	f	1	0.0000	0.0000	ml	0.0000	volume
19610	6672	91	t	0	0.0000	0.0000	ml	0.0000	volume
19611	6673	15	f	0	0.0000	0.0000	ml	65.0000	unit
19612	6673	16	f	1	0.0000	0.0000	ml	65.0000	unit
19613	6673	79	f	2	0.0000	0.0000	ml	65.0000	unit
19614	6673	80	f	3	0.0000	0.0000	ml	65.0000	unit
19615	6673	81	f	4	0.0000	0.0000	ml	0.0000	unit
19616	6673	82	f	5	0.0000	0.0000	ml	65.0000	unit
19914	6774	40	f	0	0.0000	0.0000	ml	0.0000	volume
19915	6774	83	f	1	0.0000	0.0000	ml	0.0000	volume
20504	7004	40	f	0	0.0000	0.0000	ml	0.0000	volume
20505	7004	83	f	1	0.0000	0.0000	ml	0.0000	volume
20506	7004	84	f	2	0.0000	0.0000	ml	0.0000	volume
20507	7004	21	f	3	0.0000	0.0000	ml	0.0000	volume
20508	7004	73	t	4	0.0000	0.0000	ml	0.0000	volume
19916	6774	84	f	2	0.0000	0.0000	ml	0.0000	volume
20187	6872	79	f	2	0.0000	0.0000	ml	65.0000	unit
20188	6872	80	f	3	0.0000	0.0000	ml	65.0000	unit
19917	6774	21	f	3	0.0000	0.0000	ml	0.0000	volume
19918	6774	73	t	4	0.0000	0.0000	ml	0.0000	volume
19919	6775	27	t	0	0.0000	0.0000	ml	0.0000	volume
19920	6776	63	t	0	0.0000	0.0000	ml	0.0000	volume
19017	6485	40	f	0	0.0000	0.0000	ml	0.0000	volume
19018	6485	83	f	1	0.0000	0.0000	ml	0.0000	volume
19019	6485	84	f	2	0.0000	0.0000	ml	0.0000	volume
20189	6872	81	f	4	0.0000	0.0000	ml	0.0000	unit
19020	6485	21	f	3	0.0000	0.0000	ml	0.0000	volume
19021	6485	73	t	4	0.0000	0.0000	ml	0.0000	volume
19022	6486	17	f	0	0.0000	0.0000	ml	0.0000	volume
19023	6486	20	t	1	0.0000	0.0000	ml	0.0000	volume
19024	6486	62	f	2	0.0000	0.0000	ml	0.0000	volume
19025	6487	11	f	0	0.0000	0.0000	ml	0.0000	volume
19026	6487	12	t	1	0.0000	0.0000	ml	0.0000	volume
19027	6488	15	f	0	0.0000	0.0000	ml	65.0000	unit
19028	6488	16	f	1	0.0000	0.0000	ml	65.0000	unit
19029	6488	79	f	2	0.0000	0.0000	ml	65.0000	unit
19030	6488	80	f	3	0.0000	0.0000	ml	65.0000	unit
19031	6488	81	f	4	0.0000	0.0000	ml	0.0000	unit
19032	6488	82	f	5	0.0000	0.0000	ml	65.0000	unit
19033	6488	14	t	6	0.0000	0.0000	ml	0.0000	unit
19034	6489	75	f	0	0.0000	40.0000	ml	0.0000	volume
19035	6489	76	f	1	0.0000	70.0000	ml	0.0000	volume
19036	6489	74	t	2	0.0000	20.0000	ml	0.0000	volume
19037	6489	73	f	3	0.0000	0.0000	ml	0.0000	volume
19038	6490	22	f	0	35.0000	35.0000	ml	35.0000	volume
18775	6409	58	t	0	250.0000	250.0000	ml	0.0000	volume
18776	6410	49	t	0	0.0000	0.0000	ml	0.0000	volume
18777	6411	91	f	0	0.0000	0.0000	ml	0.0000	volume
18778	6412	48	t	0	1.0000	1.0000	ml	0.0000	volume
18779	6412	73	f	1	0.0000	0.0000	ml	0.0000	volume
18780	6413	72	t	0	5.0000	5.0000	ml	0.0000	volume
18781	6413	73	f	1	0.0000	0.0000	ml	0.0000	volume
18782	6414	29	t	0	5.0000	5.0000	ml	0.0000	volume
19302	6565	90	t	0	20.0000	300.0000	ml	0.0000	volume
19303	6565	103	f	1	20.0000	300.0000	ml	0.0000	volume
19304	6565	101	f	2	20.0000	300.0000	ml	0.0000	volume
19305	6565	109	f	3	20.0000	300.0000	ml	0.0000	volume
19337	6581	40	f	0	0.0000	0.0000	ml	0.0000	volume
19338	6581	83	f	1	0.0000	0.0000	ml	0.0000	volume
19039	6490	73	t	1	0.0000	0.0000	ml	0.0000	volume
19339	6581	84	f	2	0.0000	0.0000	ml	0.0000	volume
19340	6581	21	f	3	0.0000	0.0000	ml	0.0000	volume
19341	6581	73	t	4	0.0000	0.0000	ml	0.0000	volume
19342	6582	17	f	0	0.0000	0.0000	ml	0.0000	volume
19343	6582	20	f	1	0.0000	0.0000	ml	0.0000	volume
19344	6582	62	f	2	0.0000	0.0000	ml	0.0000	volume
19345	6582	73	t	3	0.0000	0.0000	ml	0.0000	volume
19346	6583	11	t	0	0.0000	0.0000	ml	0.0000	volume
19347	6583	12	f	1	0.0000	0.0000	ml	0.0000	volume
19348	6584	15	f	0	0.0000	0.0000	ml	65.0000	unit
19349	6584	16	f	1	0.0000	0.0000	ml	65.0000	unit
19350	6584	79	f	2	0.0000	0.0000	ml	65.0000	unit
19351	6584	80	f	3	0.0000	0.0000	ml	65.0000	unit
19921	6777	11	t	0	0.0000	0.0000	ml	0.0000	volume
19922	6777	12	f	1	0.0000	0.0000	ml	0.0000	volume
19923	6778	91	f	0	0.0000	0.0000	ml	0.0000	volume
19924	6779	15	f	0	0.0000	0.0000	ml	65.0000	unit
19925	6779	16	f	1	0.0000	0.0000	ml	65.0000	unit
19926	6779	79	f	2	0.0000	0.0000	ml	65.0000	unit
19927	6779	80	f	3	0.0000	0.0000	ml	65.0000	unit
19928	6779	81	f	4	0.0000	0.0000	ml	0.0000	unit
19929	6779	82	f	5	0.0000	0.0000	ml	65.0000	unit
19930	6779	14	t	6	0.0000	0.0000	ml	0.0000	unit
19931	6780	22	t	0	35.0000	35.0000	ml	0.0000	volume
19932	6780	73	f	1	0.0000	0.0000	ml	0.0000	volume
19933	6781	26	t	0	2.0000	2.0000	ml	0.0000	volume
20106	6842	40	f	0	0.0000	0.0000	ml	0.0000	volume
20107	6842	83	f	1	0.0000	0.0000	ml	0.0000	volume
20108	6842	84	f	2	0.0000	0.0000	ml	0.0000	volume
20509	7005	24	t	0	0.0000	0.0000	ml	0.0000	volume
20510	7006	15	f	0	0.0000	0.0000	ml	65.0000	unit
19352	6584	81	f	4	0.0000	0.0000	ml	0.0000	unit
19353	6584	82	f	5	0.0000	0.0000	ml	65.0000	unit
19354	6584	14	t	6	0.0000	0.0000	ml	0.0000	unit
19355	6585	91	t	0	0.0000	0.0000	ml	0.0000	volume
19356	6586	74	t	0	20.0000	20.0000	ml	0.0000	volume
19357	6587	22	f	0	35.0000	35.0000	ml	35.0000	volume
19358	6587	73	t	1	0.0000	0.0000	ml	0.0000	volume
19524	6642	15	f	0	0.0000	0.0000	ml	65.0000	unit
19525	6642	16	f	1	0.0000	0.0000	ml	65.0000	unit
19526	6642	79	f	2	0.0000	0.0000	ml	65.0000	unit
19527	6642	80	f	3	0.0000	0.0000	ml	65.0000	unit
19528	6642	81	f	4	0.0000	0.0000	ml	0.0000	unit
19529	6642	82	f	5	0.0000	0.0000	ml	65.0000	unit
20511	7006	16	f	1	0.0000	0.0000	ml	65.0000	unit
20512	7006	79	f	2	0.0000	0.0000	ml	65.0000	unit
20513	7006	80	f	3	0.0000	0.0000	ml	65.0000	unit
19530	6642	14	t	6	0.0000	0.0000	ml	0.0000	unit
19531	6643	22	f	0	35.0000	35.0000	ml	35.0000	volume
19532	6643	73	t	1	0.0000	0.0000	ml	0.0000	volume
19040	6491	40	f	0	0.0000	0.0000	ml	0.0000	volume
19041	6491	83	f	1	0.0000	0.0000	ml	0.0000	volume
19042	6491	84	f	2	0.0000	0.0000	ml	0.0000	volume
19043	6491	21	f	3	0.0000	0.0000	ml	0.0000	volume
19044	6491	73	t	4	0.0000	0.0000	ml	0.0000	volume
19045	6492	27	t	0	0.0000	0.0000	ml	0.0000	volume
19046	6493	11	t	0	0.0000	0.0000	ml	0.0000	volume
19047	6493	12	f	1	0.0000	0.0000	ml	0.0000	volume
19048	6494	15	f	0	0.0000	0.0000	ml	65.0000	unit
19049	6494	16	f	1	0.0000	0.0000	ml	65.0000	unit
19050	6494	79	f	2	0.0000	0.0000	ml	65.0000	unit
19051	6494	80	f	3	0.0000	0.0000	ml	65.0000	unit
19052	6494	81	f	4	0.0000	0.0000	ml	0.0000	unit
19053	6494	82	f	5	0.0000	0.0000	ml	65.0000	unit
19054	6494	14	t	6	0.0000	0.0000	ml	0.0000	unit
19055	6495	75	f	0	0.0000	40.0000	ml	0.0000	volume
19056	6495	76	f	1	0.0000	70.0000	ml	0.0000	volume
19057	6495	74	t	2	0.0000	20.0000	ml	0.0000	volume
19058	6495	73	f	3	0.0000	0.0000	ml	0.0000	volume
19059	6496	22	f	0	35.0000	35.0000	ml	35.0000	volume
19060	6496	73	t	1	0.0000	0.0000	ml	0.0000	volume
19306	6566	89	t	0	16.0000	260.0000	ml	0.0000	volume
19307	6566	90	f	1	16.0000	260.0000	ml	0.0000	volume
19308	6566	103	f	2	16.0000	260.0000	ml	0.0000	volume
19309	6566	109	f	3	16.0000	260.0000	ml	0.0000	volume
19617	6673	14	t	6	0.0000	0.0000	ml	0.0000	unit
19618	6674	22	f	0	35.0000	35.0000	ml	35.0000	volume
19619	6674	73	t	1	0.0000	0.0000	ml	0.0000	volume
19792	6732	40	f	0	0.0000	0.0000	ml	0.0000	volume
19793	6732	83	f	1	0.0000	0.0000	ml	0.0000	volume
19794	6732	84	f	2	0.0000	0.0000	ml	0.0000	volume
19795	6732	21	f	3	0.0000	0.0000	ml	0.0000	volume
19796	6732	73	t	4	0.0000	0.0000	ml	0.0000	volume
19797	6733	63	t	0	0.0000	0.0000	ml	0.0000	volume
19798	6734	11	f	0	0.0000	0.0000	ml	0.0000	volume
19799	6734	12	t	1	0.0000	0.0000	ml	0.0000	volume
19800	6735	91	t	0	0.0000	0.0000	ml	0.0000	volume
19801	6736	22	t	0	35.0000	35.0000	ml	0.0000	volume
19802	6736	73	f	1	0.0000	0.0000	ml	0.0000	volume
19803	6737	17	f	0	0.0000	0.0000	ml	0.0000	volume
19804	6737	20	f	1	0.0000	0.0000	ml	0.0000	volume
19805	6737	62	f	2	0.0000	0.0000	ml	0.0000	volume
19806	6737	31	f	3	0.0000	0.0000	ml	0.0000	\N
19807	6737	73	t	4	0.0000	0.0000	ml	0.0000	\N
19808	6738	15	f	0	0.0000	0.0000	ml	65.0000	unit
19809	6738	16	f	1	0.0000	0.0000	ml	65.0000	unit
19810	6738	79	f	2	0.0000	0.0000	ml	65.0000	unit
19811	6738	80	f	3	0.0000	0.0000	ml	65.0000	unit
19812	6738	81	f	4	0.0000	0.0000	ml	0.0000	unit
19813	6738	82	f	5	0.0000	0.0000	ml	65.0000	unit
19814	6738	14	t	6	0.0000	0.0000	ml	0.0000	unit
20190	6872	82	f	5	0.0000	0.0000	ml	65.0000	unit
20191	6872	14	t	6	0.0000	0.0000	ml	0.0000	unit
20192	6873	19	t	0	0.0000	0.0000	ml	0.0000	volume
20193	6874	22	f	0	35.0000	35.0000	ml	0.0000	volume
20194	6874	73	t	1	0.0000	0.0000	ml	0.0000	volume
20307	6916	52	t	0	0.0000	0.0000	ml	0.0000	volume
20308	6917	15	f	0	0.0000	0.0000	ml	65.0000	unit
20309	6917	16	f	1	0.0000	0.0000	ml	65.0000	unit
20310	6917	79	f	2	0.0000	0.0000	ml	65.0000	unit
20311	6917	80	f	3	0.0000	0.0000	ml	65.0000	unit
20312	6917	81	f	4	0.0000	0.0000	ml	0.0000	unit
20313	6917	82	f	5	0.0000	0.0000	ml	65.0000	unit
20314	6917	14	t	6	0.0000	0.0000	ml	0.0000	unit
20315	6918	63	t	0	0.0000	0.0000	ml	0.0000	volume
20316	6919	91	f	0	0.0000	0.0000	ml	0.0000	volume
20317	6920	22	t	0	35.0000	35.0000	ml	0.0000	volume
20318	6920	73	f	1	0.0000	0.0000	ml	0.0000	volume
20109	6842	21	f	3	0.0000	0.0000	ml	0.0000	volume
20110	6842	73	t	4	0.0000	0.0000	ml	0.0000	volume
20111	6843	35	t	0	0.0000	0.0000	ml	0.0000	unit
20112	6844	34	t	0	0.0000	0.0000	ml	0.0000	volume
20113	6845	11	t	0	0.0000	0.0000	ml	0.0000	volume
20114	6845	12	f	1	0.0000	0.0000	ml	0.0000	volume
20115	6846	91	t	0	0.0000	0.0000	ml	0.0000	volume
20116	6847	15	f	0	0.0000	0.0000	ml	65.0000	unit
20117	6847	16	f	1	0.0000	0.0000	ml	65.0000	unit
20118	6847	79	f	2	0.0000	0.0000	ml	65.0000	unit
20119	6847	80	f	3	0.0000	0.0000	ml	65.0000	unit
20120	6847	81	f	4	0.0000	0.0000	ml	0.0000	unit
14128	4874	95	t	0	1.0000	1.0000	ml	0.0000	\N
14129	4875	40	f	0	0.0000	0.0000	ml	0.0000	\N
14130	4875	83	f	1	0.0000	0.0000	ml	0.0000	\N
14131	4875	84	f	2	0.0000	0.0000	ml	0.0000	\N
14132	4875	21	f	3	0.0000	0.0000	ml	0.0000	\N
14133	4875	73	t	4	0.0000	0.0000	ml	0.0000	\N
20121	6847	82	f	5	0.0000	0.0000	ml	65.0000	unit
20122	6847	14	t	6	0.0000	0.0000	ml	0.0000	unit
20123	6848	22	t	0	35.0000	35.0000	ml	0.0000	volume
20124	6848	73	f	1	0.0000	0.0000	ml	0.0000	volume
19957	6789	17	f	0	0.0000	0.0000	ml	0.0000	volume
19958	6789	20	f	1	0.0000	0.0000	ml	0.0000	volume
19959	6789	62	f	2	0.0000	0.0000	ml	0.0000	volume
19960	6789	31	f	3	0.0000	0.0000	ml	0.0000	\N
19961	6789	73	t	4	0.0000	0.0000	ml	0.0000	\N
19962	6790	11	t	0	0.0000	0.0000	ml	0.0000	volume
19963	6790	12	f	1	0.0000	0.0000	ml	0.0000	volume
19964	6791	91	f	0	0.0000	0.0000	ml	0.0000	volume
19965	6792	15	f	0	0.0000	0.0000	ml	65.0000	unit
19966	6792	16	f	1	0.0000	0.0000	ml	65.0000	unit
19967	6792	79	f	2	0.0000	0.0000	ml	65.0000	unit
19620	6675	40	f	0	0.0000	0.0000	ml	0.0000	volume
19621	6675	83	f	1	0.0000	0.0000	ml	0.0000	volume
19622	6675	84	f	2	0.0000	0.0000	ml	0.0000	volume
19623	6675	21	f	3	0.0000	0.0000	ml	0.0000	volume
19624	6675	73	t	4	0.0000	0.0000	ml	0.0000	volume
19625	6676	35	t	0	0.0000	0.0000	ml	0.0000	unit
19626	6676	73	f	1	0.0000	0.0000	ml	0.0000	volume
19627	6677	44	t	0	0.0000	0.0000	ml	0.0000	volume
19628	6678	11	t	0	0.0000	0.0000	ml	0.0000	volume
19629	6678	12	f	1	0.0000	0.0000	ml	0.0000	volume
19630	6679	91	t	0	0.0000	0.0000	ml	0.0000	volume
19631	6680	15	f	0	0.0000	0.0000	ml	65.0000	unit
19632	6680	16	f	1	0.0000	0.0000	ml	65.0000	unit
19633	6680	79	f	2	0.0000	0.0000	ml	65.0000	unit
19634	6680	80	f	3	0.0000	0.0000	ml	65.0000	unit
19310	6567	97	t	0	10.0000	10.0000	ml	0.0000	volume
19311	6567	98	f	1	10.0000	10.0000	ml	0.0000	volume
19312	6567	100	f	2	10.0000	10.0000	ml	0.0000	volume
19313	6567	99	f	3	10.0000	10.0000	ml	0.0000	volume
19314	6568	40	f	0	0.0000	0.0000	ml	0.0000	volume
19315	6568	112	f	1	0.0000	0.0000	ml	0.0000	volume
19316	6568	73	t	2	0.0000	0.0000	ml	0.0000	volume
19378	6595	40	f	0	0.0000	0.0000	ml	0.0000	volume
19379	6595	83	f	1	0.0000	0.0000	ml	0.0000	volume
19380	6595	84	f	2	0.0000	0.0000	ml	0.0000	volume
19381	6595	21	f	3	0.0000	0.0000	ml	0.0000	volume
19382	6595	73	t	4	0.0000	0.0000	ml	0.0000	volume
19383	6596	18	t	0	0.0000	0.0000	ml	0.0000	volume
19384	6597	17	t	0	0.0000	0.0000	ml	0.0000	volume
19385	6598	11	t	0	0.0000	0.0000	ml	0.0000	volume
19386	6598	12	f	1	0.0000	0.0000	ml	0.0000	volume
19387	6599	91	f	0	0.0000	0.0000	ml	0.0000	volume
19388	6600	15	f	0	0.0000	0.0000	ml	65.0000	unit
19389	6600	16	f	1	0.0000	0.0000	ml	65.0000	unit
19390	6600	79	f	2	0.0000	0.0000	ml	65.0000	unit
19391	6600	80	f	3	0.0000	0.0000	ml	65.0000	unit
19392	6600	81	f	4	0.0000	0.0000	ml	0.0000	unit
19393	6600	82	f	5	0.0000	0.0000	ml	65.0000	unit
19394	6600	14	t	6	0.0000	0.0000	ml	0.0000	unit
19395	6601	22	f	0	35.0000	35.0000	ml	35.0000	volume
19396	6601	73	t	1	0.0000	0.0000	ml	0.0000	volume
19635	6680	81	f	4	0.0000	0.0000	ml	0.0000	unit
19636	6680	82	f	5	0.0000	0.0000	ml	65.0000	unit
19637	6680	14	t	6	0.0000	0.0000	ml	0.0000	unit
19638	6681	22	f	0	35.0000	35.0000	ml	35.0000	volume
19639	6681	73	t	1	0.0000	0.0000	ml	0.0000	volume
20514	7006	81	f	4	0.0000	0.0000	ml	0.0000	unit
20515	7006	82	f	5	0.0000	0.0000	ml	65.0000	unit
20516	7006	14	t	6	0.0000	0.0000	ml	0.0000	unit
20517	7007	22	f	0	35.0000	35.0000	ml	35.0000	volume
20518	7007	73	t	1	0.0000	0.0000	ml	0.0000	volume
19815	6739	40	f	0	0.0000	0.0000	ml	0.0000	volume
19816	6739	83	f	1	0.0000	0.0000	ml	0.0000	volume
19817	6739	84	f	2	0.0000	0.0000	ml	0.0000	volume
19818	6739	21	f	3	0.0000	0.0000	ml	0.0000	volume
19819	6739	73	t	4	0.0000	0.0000	ml	0.0000	volume
19820	6740	59	t	0	0.0000	0.0000	ml	0.0000	volume
19821	6741	63	t	0	0.0000	0.0000	ml	0.0000	volume
19822	6742	11	t	0	0.0000	0.0000	ml	0.0000	volume
19823	6742	12	f	1	0.0000	0.0000	ml	0.0000	volume
19824	6743	91	f	0	0.0000	0.0000	ml	0.0000	volume
19825	6744	15	f	0	0.0000	0.0000	ml	65.0000	unit
19826	6744	16	f	1	0.0000	0.0000	ml	65.0000	unit
19827	6744	79	f	2	0.0000	0.0000	ml	65.0000	unit
19828	6744	80	f	3	0.0000	0.0000	ml	65.0000	unit
19829	6744	81	f	4	0.0000	0.0000	ml	0.0000	unit
19830	6744	82	f	5	0.0000	0.0000	ml	65.0000	unit
19831	6744	14	t	6	0.0000	0.0000	ml	0.0000	unit
19832	6745	22	t	0	35.0000	35.0000	ml	0.0000	volume
19833	6745	73	f	1	0.0000	0.0000	ml	0.0000	volume
19968	6792	80	f	3	0.0000	0.0000	ml	65.0000	unit
19969	6792	81	f	4	0.0000	0.0000	ml	0.0000	unit
19970	6792	82	f	5	0.0000	0.0000	ml	65.0000	unit
19971	6792	14	t	6	0.0000	0.0000	ml	0.0000	unit
19972	6793	63	f	0	0.0000	0.0000	ml	0.0000	volume
19973	6794	40	f	0	0.0000	0.0000	ml	0.0000	volume
19974	6794	83	f	1	0.0000	0.0000	ml	0.0000	volume
19975	6794	84	f	2	0.0000	0.0000	ml	0.0000	volume
19976	6794	21	f	3	0.0000	0.0000	ml	0.0000	volume
19977	6794	73	t	4	0.0000	0.0000	ml	0.0000	volume
19978	6795	22	t	0	35.0000	35.0000	ml	0.0000	volume
19979	6795	73	f	1	0.0000	0.0000	ml	0.0000	volume
20125	6849	40	f	0	0.0000	0.0000	ml	0.0000	volume
20126	6849	83	f	1	0.0000	0.0000	ml	0.0000	volume
20127	6849	84	f	2	0.0000	0.0000	ml	0.0000	volume
20128	6849	21	f	3	0.0000	0.0000	ml	0.0000	volume
20129	6849	73	t	4	0.0000	0.0000	ml	0.0000	volume
20130	6850	44	t	0	0.0000	0.0000	ml	0.0000	volume
20131	6851	35	t	0	0.0000	0.0000	ml	0.0000	unit
20132	6852	34	t	0	0.0000	0.0000	ml	0.0000	volume
19317	6569	40	f	0	0.0000	0.0000	ml	0.0000	volume
19318	6569	112	f	1	0.0000	0.0000	ml	0.0000	volume
19319	6569	73	t	2	0.0000	0.0000	ml	0.0000	volume
19320	6570	97	t	0	12.0000	12.0000	ml	0.0000	volume
19321	6570	98	f	1	12.0000	12.0000	ml	0.0000	volume
19322	6570	100	f	2	12.0000	12.0000	ml	0.0000	volume
19323	6570	99	f	3	12.0000	12.0000	ml	0.0000	volume
19397	6602	40	f	0	0.0000	0.0000	ml	0.0000	volume
20519	7008	101	t	0	21.6000	200.0000	ml	0.0000	\N
20520	7009	91	t	0	0.0000	0.0000	ml	0.0000	\N
19398	6602	83	f	1	0.0000	0.0000	ml	0.0000	volume
19399	6602	84	f	2	0.0000	0.0000	ml	0.0000	volume
19400	6602	21	f	3	0.0000	0.0000	ml	0.0000	volume
19401	6602	73	t	4	0.0000	0.0000	ml	0.0000	volume
19402	6603	17	f	0	0.0000	0.0000	ml	0.0000	volume
19403	6603	20	f	1	0.0000	0.0000	ml	0.0000	volume
19404	6603	62	f	2	0.0000	0.0000	ml	0.0000	volume
19405	6603	73	t	3	0.0000	0.0000	ml	0.0000	volume
19406	6604	11	t	0	0.0000	0.0000	ml	0.0000	volume
19407	6604	12	f	1	0.0000	0.0000	ml	0.0000	volume
19408	6605	91	t	0	0.0000	0.0000	ml	0.0000	volume
19409	6606	15	f	0	0.0000	0.0000	ml	65.0000	unit
19410	6606	16	f	1	0.0000	0.0000	ml	65.0000	unit
19411	6606	79	f	2	0.0000	0.0000	ml	65.0000	unit
19412	6606	80	f	3	0.0000	0.0000	ml	65.0000	unit
19413	6606	81	f	4	0.0000	0.0000	ml	0.0000	unit
19414	6606	82	f	5	0.0000	0.0000	ml	65.0000	unit
19415	6606	14	t	6	0.0000	0.0000	ml	0.0000	unit
19416	6607	22	f	0	35.0000	35.0000	ml	35.0000	volume
19417	6607	73	t	1	0.0000	0.0000	ml	0.0000	volume
19834	6746	40	f	0	0.0000	0.0000	ml	0.0000	volume
19835	6746	83	f	1	0.0000	0.0000	ml	0.0000	volume
19836	6746	84	f	2	0.0000	0.0000	ml	0.0000	volume
19980	6796	40	f	0	0.0000	0.0000	ml	0.0000	volume
19981	6796	83	f	1	0.0000	0.0000	ml	0.0000	volume
19982	6796	84	f	2	0.0000	0.0000	ml	0.0000	volume
19983	6796	21	f	3	0.0000	0.0000	ml	0.0000	volume
19984	6796	73	t	4	0.0000	0.0000	ml	0.0000	volume
19985	6797	19	t	0	0.0000	0.0000	ml	0.0000	volume
19986	6798	17	f	0	0.0000	0.0000	ml	0.0000	volume
19987	6798	20	f	1	0.0000	0.0000	ml	0.0000	volume
19837	6746	21	f	3	0.0000	0.0000	ml	0.0000	volume
19838	6746	73	t	4	0.0000	0.0000	ml	0.0000	volume
19839	6747	17	f	0	0.0000	0.0000	ml	0.0000	volume
19840	6747	20	f	1	0.0000	0.0000	ml	0.0000	volume
19841	6747	62	f	2	0.0000	0.0000	ml	0.0000	volume
19842	6747	31	f	3	0.0000	0.0000	ml	0.0000	\N
19988	6798	62	f	2	0.0000	0.0000	ml	0.0000	volume
19989	6798	31	f	3	0.0000	0.0000	ml	0.0000	volume
19990	6798	73	t	4	0.0000	0.0000	ml	0.0000	volume
19991	6799	11	t	0	0.0000	0.0000	ml	0.0000	volume
19992	6799	12	f	1	0.0000	0.0000	ml	0.0000	volume
19993	6800	91	t	0	0.0000	0.0000	ml	0.0000	volume
19994	6801	15	f	0	0.0000	0.0000	ml	65.0000	unit
19995	6801	16	f	1	0.0000	0.0000	ml	65.0000	unit
19996	6801	79	f	2	0.0000	0.0000	ml	65.0000	unit
19843	6747	73	t	4	0.0000	0.0000	ml	0.0000	\N
19844	6748	63	t	0	0.0000	0.0000	ml	0.0000	volume
19845	6749	11	t	0	0.0000	0.0000	ml	0.0000	volume
19846	6749	12	f	1	0.0000	0.0000	ml	0.0000	volume
19997	6801	80	f	3	0.0000	0.0000	ml	65.0000	unit
19998	6801	81	f	4	0.0000	0.0000	ml	0.0000	unit
19999	6801	82	f	5	0.0000	0.0000	ml	65.0000	unit
20000	6801	14	t	6	0.0000	0.0000	ml	0.0000	unit
20001	6802	22	f	0	35.0000	35.0000	ml	35.0000	volume
19847	6750	91	t	0	0.0000	0.0000	ml	0.0000	volume
19848	6751	15	f	0	0.0000	0.0000	ml	65.0000	unit
19849	6751	16	f	1	0.0000	0.0000	ml	65.0000	unit
19850	6751	79	f	2	0.0000	0.0000	ml	65.0000	unit
19851	6751	80	f	3	0.0000	0.0000	ml	65.0000	unit
19852	6751	81	f	4	0.0000	0.0000	ml	0.0000	unit
19853	6751	82	f	5	0.0000	0.0000	ml	65.0000	unit
19854	6751	14	t	6	0.0000	0.0000	ml	0.0000	unit
18225	6201	40	f	0	0.0000	0.0000	ml	0.0000	volume
18226	6201	83	f	1	0.0000	0.0000	ml	0.0000	volume
19855	6752	22	t	0	35.0000	35.0000	ml	0.0000	volume
19856	6752	73	f	1	0.0000	0.0000	ml	0.0000	volume
20002	6802	73	t	1	0.0000	0.0000	ml	0.0000	volume
20133	6853	11	t	0	0.0000	0.0000	ml	0.0000	volume
20134	6853	12	f	1	0.0000	0.0000	ml	0.0000	volume
20135	6854	91	t	0	0.0000	0.0000	ml	0.0000	volume
20136	6855	15	f	0	0.0000	0.0000	ml	65.0000	unit
20137	6855	16	f	1	0.0000	0.0000	ml	65.0000	unit
20138	6855	79	f	2	0.0000	0.0000	ml	65.0000	unit
20139	6855	80	f	3	0.0000	0.0000	ml	65.0000	unit
20140	6855	81	f	4	0.0000	0.0000	ml	0.0000	unit
20141	6855	82	f	5	0.0000	0.0000	ml	65.0000	unit
20142	6855	14	t	6	0.0000	0.0000	ml	0.0000	unit
20143	6856	22	t	0	35.0000	35.0000	ml	0.0000	volume
20144	6856	73	f	1	0.0000	0.0000	ml	0.0000	volume
19418	6608	40	f	0	0.0000	0.0000	ml	0.0000	volume
19419	6608	83	f	1	0.0000	0.0000	ml	0.0000	volume
19420	6608	84	f	2	0.0000	0.0000	ml	0.0000	volume
19421	6608	21	f	3	0.0000	0.0000	ml	0.0000	volume
19422	6608	73	t	4	0.0000	0.0000	ml	0.0000	volume
19423	6609	59	t	0	0.0000	0.0000	ml	0.0000	volume
19424	6610	11	t	0	0.0000	0.0000	ml	0.0000	volume
19425	6610	12	f	1	0.0000	0.0000	ml	0.0000	volume
19426	6611	91	t	0	0.0000	0.0000	ml	0.0000	volume
19427	6612	22	f	0	35.0000	35.0000	ml	35.0000	volume
19428	6612	73	t	1	0.0000	0.0000	ml	0.0000	volume
19429	6613	15	f	0	0.0000	0.0000	ml	65.0000	unit
19430	6613	16	f	1	0.0000	0.0000	ml	65.0000	unit
19431	6613	79	f	2	0.0000	0.0000	ml	65.0000	unit
19432	6613	80	f	3	0.0000	0.0000	ml	65.0000	unit
19433	6613	81	f	4	0.0000	0.0000	ml	0.0000	unit
19434	6613	82	f	5	0.0000	0.0000	ml	65.0000	unit
19435	6613	14	t	6	0.0000	0.0000	ml	0.0000	unit
20457	6977	85	t	0	70.0000	70.0000	ml	0.0000	volume
8973	3279	58	t	0	250.0000	250.0000	ml	0.0000	\N
8974	3280	38	t	0	0.0000	0.0000	ml	0.0000	\N
8975	3281	91	f	0	0.0000	0.0000	ml	0.0000	\N
8976	3282	48	t	0	1.0000	1.0000	ml	0.0000	\N
8977	3282	73	f	1	0.0000	0.0000	ml	0.0000	\N
8978	3283	72	t	0	5.0000	5.0000	ml	0.0000	\N
8979	3283	73	f	1	0.0000	0.0000	ml	0.0000	\N
20458	6978	71	t	0	1.0000	1.0000	ml	0.0000	volume
20459	6979	57	t	0	240.0000	240.0000	ml	0.0000	volume
20460	6980	51	t	0	20.0000	20.0000	ml	0.0000	volume
20461	6981	91	f	0	0.0000	0.0000	ml	0.0000	volume
18227	6201	84	f	2	0.0000	0.0000	ml	0.0000	volume
18228	6201	21	f	3	0.0000	0.0000	ml	0.0000	volume
18229	6201	73	t	4	0.0000	0.0000	ml	0.0000	volume
18230	6202	62	t	0	0.0000	0.0000	ml	0.0000	volume
18231	6203	19	t	0	0.0000	0.0000	ml	0.0000	volume
18232	6204	63	f	0	0.0000	0.0000	ml	0.0000	volume
18233	6205	11	t	0	0.0000	0.0000	ml	0.0000	volume
18234	6205	12	f	1	0.0000	0.0000	ml	0.0000	volume
18235	6206	91	t	0	0.0000	0.0000	ml	0.0000	volume
18236	6207	15	f	0	0.0000	0.0000	ml	65.0000	\N
18237	6207	16	f	1	0.0000	0.0000	ml	65.0000	\N
18238	6207	79	f	2	0.0000	0.0000	ml	65.0000	\N
18239	6207	80	f	3	0.0000	0.0000	ml	65.0000	\N
18240	6207	81	f	4	0.0000	0.0000	ml	0.0000	\N
18241	6207	82	f	5	0.0000	0.0000	ml	65.0000	\N
18242	6207	14	t	6	0.0000	0.0000	ml	0.0000	\N
18243	6208	22	f	0	35.0000	35.0000	ml	0.0000	volume
18244	6208	73	t	1	0.0000	0.0000	ml	0.0000	volume
19686	6696	40	f	0	0.0000	0.0000	ml	0.0000	volume
19085	6503	40	f	0	0.0000	0.0000	ml	0.0000	volume
19086	6503	83	f	1	0.0000	0.0000	ml	0.0000	volume
19087	6503	84	f	2	0.0000	0.0000	ml	0.0000	volume
19687	6696	83	f	1	0.0000	0.0000	ml	0.0000	volume
19688	6696	84	f	2	0.0000	0.0000	ml	0.0000	volume
19689	6696	21	f	3	0.0000	0.0000	ml	0.0000	volume
19690	6696	73	t	4	0.0000	0.0000	ml	0.0000	volume
19691	6697	17	f	0	0.0000	0.0000	ml	0.0000	volume
19692	6697	20	f	1	0.0000	0.0000	ml	0.0000	volume
20326	6926	19	t	0	0.0000	0.0000	ml	0.0000	volume
19693	6697	62	f	2	0.0000	0.0000	ml	0.0000	volume
19694	6697	31	f	3	0.0000	0.0000	ml	0.0000	volume
19695	6697	73	t	4	0.0000	0.0000	ml	0.0000	volume
19696	6698	65	t	0	0.0000	0.0000	ml	0.0000	volume
19697	6699	11	t	0	0.0000	0.0000	ml	0.0000	volume
19698	6699	12	f	1	0.0000	0.0000	ml	0.0000	volume
19699	6700	91	f	0	0.0000	0.0000	ml	0.0000	volume
19700	6701	15	f	0	0.0000	0.0000	ml	65.0000	unit
19701	6701	16	f	1	0.0000	0.0000	ml	65.0000	unit
19702	6701	79	f	2	0.0000	0.0000	ml	65.0000	unit
19703	6701	80	f	3	0.0000	0.0000	ml	65.0000	unit
19704	6701	81	f	4	0.0000	0.0000	ml	0.0000	unit
19705	6701	82	f	5	0.0000	0.0000	ml	65.0000	unit
19706	6701	14	t	6	0.0000	0.0000	ml	0.0000	unit
19707	6702	22	f	0	35.0000	35.0000	ml	35.0000	volume
20327	6927	56	t	0	0.0000	0.0000	ml	0.0000	volume
20328	6928	52	t	0	0.0000	0.0000	ml	0.0000	volume
20329	6929	32	t	0	0.0000	0.0000	ml	0.0000	volume
20330	6930	91	t	0	0.0000	0.0000	ml	0.0000	volume
20331	6931	15	f	0	0.0000	0.0000	ml	65.0000	unit
20332	6931	16	f	1	0.0000	0.0000	ml	65.0000	unit
20333	6931	79	f	2	0.0000	0.0000	ml	65.0000	unit
20334	6931	80	f	3	0.0000	0.0000	ml	65.0000	unit
20335	6931	81	f	4	0.0000	0.0000	ml	0.0000	unit
20336	6931	82	f	5	0.0000	0.0000	ml	65.0000	unit
20337	6931	14	t	6	0.0000	0.0000	ml	0.0000	unit
20338	6932	22	t	0	35.0000	35.0000	ml	0.0000	volume
20339	6932	73	f	1	0.0000	0.0000	ml	0.0000	volume
20393	6954	24	t	0	0.0000	0.0000	ml	0.0000	volume
20394	6955	40	f	0	0.0000	0.0000	ml	0.0000	volume
20395	6955	83	f	1	0.0000	0.0000	ml	0.0000	volume
20396	6955	84	f	2	0.0000	0.0000	ml	0.0000	volume
20397	6955	21	f	3	0.0000	0.0000	ml	0.0000	volume
20398	6955	73	t	4	0.0000	0.0000	ml	0.0000	volume
20399	6956	60	t	0	0.0000	0.0000	ml	0.0000	volume
20400	6957	91	f	0	0.0000	0.0000	ml	0.0000	volume
20401	6958	15	f	0	0.0000	0.0000	ml	65.0000	unit
20402	6958	16	f	1	0.0000	0.0000	ml	65.0000	unit
20403	6958	79	f	2	0.0000	0.0000	ml	65.0000	unit
20404	6958	80	f	3	0.0000	0.0000	ml	65.0000	unit
20405	6958	81	f	4	0.0000	0.0000	ml	0.0000	unit
20406	6958	82	f	5	0.0000	0.0000	ml	65.0000	unit
20407	6958	14	t	6	0.0000	0.0000	ml	0.0000	unit
20408	6959	22	f	0	35.0000	35.0000	ml	35.0000	volume
20409	6959	73	t	1	0.0000	0.0000	ml	0.0000	volume
19088	6503	21	f	3	0.0000	0.0000	ml	0.0000	volume
19089	6503	73	t	4	0.0000	0.0000	ml	0.0000	volume
19090	6504	17	f	0	0.0000	0.0000	ml	0.0000	volume
19091	6504	20	f	1	0.0000	0.0000	ml	0.0000	volume
19092	6504	62	f	2	0.0000	0.0000	ml	0.0000	volume
19093	6504	73	t	3	0.0000	0.0000	ml	0.0000	volume
19094	6505	11	t	0	0.0000	0.0000	ml	0.0000	volume
19095	6505	12	f	1	0.0000	0.0000	ml	0.0000	volume
19096	6506	15	f	0	0.0000	0.0000	ml	65.0000	unit
19097	6506	16	f	1	0.0000	0.0000	ml	65.0000	unit
19098	6506	79	f	2	0.0000	0.0000	ml	65.0000	unit
19099	6506	80	f	3	0.0000	0.0000	ml	65.0000	unit
19100	6506	81	f	4	0.0000	0.0000	ml	0.0000	unit
19101	6506	82	f	5	0.0000	0.0000	ml	65.0000	unit
19102	6506	14	t	6	0.0000	0.0000	ml	0.0000	unit
19103	6507	75	f	0	0.0000	40.0000	ml	0.0000	volume
19104	6507	76	f	1	0.0000	70.0000	ml	0.0000	volume
19105	6507	74	t	2	0.0000	20.0000	ml	0.0000	volume
19106	6507	73	f	3	0.0000	0.0000	ml	0.0000	volume
18830	6433	40	f	0	0.0000	0.0000	ml	0.0000	volume
18831	6433	83	f	1	0.0000	0.0000	ml	0.0000	volume
18832	6433	84	f	2	0.0000	0.0000	ml	0.0000	volume
18833	6433	21	f	3	0.0000	0.0000	ml	0.0000	volume
18834	6433	73	t	4	0.0000	0.0000	ml	0.0000	volume
18835	6434	12	t	0	0.0000	0.0000	ml	0.0000	volume
18836	6434	11	f	1	0.0000	0.0000	ml	0.0000	volume
18837	6435	85	t	0	0.0000	0.0000	ml	0.0000	volume
18838	6436	17	f	0	0.0000	0.0000	ml	0.0000	volume
18839	6436	20	f	1	0.0000	0.0000	ml	0.0000	volume
18840	6436	62	f	2	0.0000	0.0000	ml	0.0000	volume
18841	6436	73	t	3	0.0000	0.0000	ml	0.0000	volume
18805	6422	37	t	0	1.0000	1.0000	ml	0.0000	volume
18806	6423	40	f	0	0.0000	0.0000	ml	0.0000	volume
19708	6702	73	t	1	0.0000	0.0000	ml	0.0000	volume
19436	6614	40	f	0	0.0000	0.0000	ml	0.0000	volume
19437	6614	83	f	1	0.0000	0.0000	ml	0.0000	volume
19438	6614	84	f	2	0.0000	0.0000	ml	0.0000	volume
19439	6614	21	f	3	0.0000	0.0000	ml	0.0000	volume
19440	6614	73	t	4	0.0000	0.0000	ml	0.0000	volume
19441	6615	20	f	0	0.0000	0.0000	ml	0.0000	volume
19442	6615	17	f	1	0.0000	0.0000	ml	0.0000	volume
19443	6615	62	f	2	0.0000	0.0000	ml	0.0000	volume
19444	6615	73	t	3	0.0000	0.0000	ml	0.0000	volume
19445	6616	11	t	0	0.0000	0.0000	ml	0.0000	volume
19446	6616	12	f	1	0.0000	0.0000	ml	0.0000	volume
19447	6617	15	f	0	0.0000	0.0000	ml	65.0000	unit
19448	6617	16	f	1	0.0000	0.0000	ml	65.0000	unit
19449	6617	79	f	2	0.0000	0.0000	ml	65.0000	unit
19450	6617	80	f	3	0.0000	0.0000	ml	65.0000	unit
19451	6617	81	f	4	0.0000	0.0000	ml	0.0000	unit
19107	6508	22	f	0	35.0000	35.0000	ml	35.0000	volume
19108	6508	73	t	1	0.0000	0.0000	ml	0.0000	volume
19452	6617	82	f	5	0.0000	0.0000	ml	65.0000	unit
19453	6617	14	t	6	0.0000	0.0000	ml	0.0000	unit
19454	6618	91	t	0	0.0000	0.0000	ml	0.0000	volume
19455	6619	22	f	0	35.0000	35.0000	ml	35.0000	volume
19456	6619	73	t	1	0.0000	0.0000	ml	0.0000	volume
18807	6423	83	f	1	0.0000	0.0000	ml	0.0000	volume
18808	6423	84	f	2	0.0000	0.0000	ml	0.0000	volume
18809	6423	21	f	3	0.0000	0.0000	ml	0.0000	volume
18810	6423	73	t	4	0.0000	0.0000	ml	0.0000	volume
20066	6827	40	f	0	0.0000	0.0000	ml	0.0000	volume
20067	6827	83	f	1	0.0000	0.0000	ml	0.0000	volume
20068	6827	84	f	2	0.0000	0.0000	ml	0.0000	volume
20069	6827	21	f	3	0.0000	0.0000	ml	0.0000	volume
20070	6827	73	t	4	0.0000	0.0000	ml	0.0000	volume
20071	6828	59	t	0	0.0000	0.0000	ml	0.0000	volume
20072	6828	73	f	1	0.0000	0.0000	ml	0.0000	volume
20073	6829	63	t	0	0.0000	0.0000	ml	0.0000	volume
20074	6830	11	t	0	0.0000	0.0000	ml	0.0000	volume
20075	6830	12	f	1	0.0000	0.0000	ml	0.0000	volume
20076	6831	91	t	0	0.0000	0.0000	ml	0.0000	volume
20077	6832	15	f	0	0.0000	0.0000	ml	65.0000	unit
20078	6832	16	f	1	0.0000	0.0000	ml	65.0000	unit
20079	6832	79	f	2	0.0000	0.0000	ml	65.0000	unit
20080	6832	80	f	3	0.0000	0.0000	ml	65.0000	unit
20081	6832	81	f	4	0.0000	0.0000	ml	0.0000	unit
20082	6832	82	f	5	0.0000	0.0000	ml	65.0000	unit
20083	6832	14	t	6	0.0000	0.0000	ml	0.0000	unit
20084	6833	22	t	0	35.0000	35.0000	ml	0.0000	volume
20085	6833	73	f	1	0.0000	0.0000	ml	0.0000	volume
19709	6703	40	f	0	0.0000	0.0000	ml	0.0000	volume
19710	6703	83	f	1	0.0000	0.0000	ml	0.0000	volume
19327	6574	114	t	0	20.0000	20.0000	ml	0.0000	volume
19457	6620	40	f	0	0.0000	0.0000	ml	0.0000	volume
19458	6620	83	f	1	0.0000	0.0000	ml	0.0000	volume
19459	6620	84	f	2	0.0000	0.0000	ml	0.0000	volume
19711	6703	84	f	2	0.0000	0.0000	ml	0.0000	volume
19712	6703	21	f	3	0.0000	0.0000	ml	0.0000	volume
19713	6703	73	t	4	0.0000	0.0000	ml	0.0000	volume
18811	6424	12	t	0	0.0000	0.0000	ml	0.0000	volume
18812	6424	11	f	1	0.0000	0.0000	ml	0.0000	volume
19109	6509	89	t	0	20.0000	300.0000	ml	0.0000	volume
19110	6509	90	f	1	20.0000	300.0000	ml	0.0000	volume
19111	6509	103	f	2	20.0000	300.0000	ml	0.0000	volume
19112	6509	109	f	3	20.0000	300.0000	ml	0.0000	volume
19113	6510	12	t	0	0.0000	0.0000	ml	0.0000	volume
19114	6510	11	f	1	0.0000	0.0000	ml	0.0000	volume
19460	6620	21	f	3	0.0000	0.0000	ml	0.0000	volume
19461	6620	73	t	4	0.0000	0.0000	ml	0.0000	volume
19462	6621	56	t	0	0.0000	0.0000	ml	0.0000	volume
19463	6622	11	t	0	0.0000	0.0000	ml	0.0000	volume
19464	6622	12	f	1	0.0000	0.0000	ml	0.0000	volume
19465	6623	91	t	0	0.0000	0.0000	ml	0.0000	volume
19466	6624	15	f	0	0.0000	0.0000	ml	65.0000	unit
19467	6624	16	f	1	0.0000	0.0000	ml	65.0000	unit
19468	6624	79	f	2	0.0000	0.0000	ml	65.0000	unit
19469	6624	80	f	3	0.0000	0.0000	ml	65.0000	unit
19470	6624	81	f	4	0.0000	0.0000	ml	0.0000	unit
19471	6624	82	f	5	0.0000	0.0000	ml	65.0000	unit
19472	6624	14	t	6	0.0000	0.0000	ml	0.0000	unit
19473	6625	22	f	0	35.0000	35.0000	ml	35.0000	volume
19474	6625	73	t	1	0.0000	0.0000	ml	0.0000	volume
19714	6704	62	t	0	0.0000	0.0000	ml	0.0000	volume
19715	6705	65	t	0	0.0000	0.0000	ml	0.0000	\N
19716	6706	11	t	0	0.0000	0.0000	ml	0.0000	volume
19717	6706	12	f	1	0.0000	0.0000	ml	0.0000	volume
19718	6707	91	t	0	0.0000	0.0000	ml	0.0000	volume
19719	6708	15	f	0	0.0000	0.0000	ml	65.0000	unit
19720	6708	16	f	1	0.0000	0.0000	ml	65.0000	unit
19721	6708	79	f	2	0.0000	0.0000	ml	65.0000	unit
19722	6708	80	f	3	0.0000	0.0000	ml	65.0000	unit
19723	6708	81	f	4	0.0000	0.0000	ml	0.0000	unit
19724	6708	82	f	5	0.0000	0.0000	ml	65.0000	unit
19725	6708	14	t	6	0.0000	0.0000	ml	0.0000	unit
19726	6709	22	f	0	35.0000	35.0000	ml	35.0000	volume
19727	6709	73	t	1	0.0000	0.0000	ml	0.0000	volume
20086	6834	18	t	0	0.0000	0.0000	ml	0.0000	volume
20427	6966	40	f	0	0.0000	0.0000	ml	0.0000	volume
20428	6966	83	f	1	0.0000	0.0000	ml	0.0000	volume
20429	6966	84	f	2	0.0000	0.0000	ml	0.0000	volume
20430	6966	21	f	3	0.0000	0.0000	ml	0.0000	volume
20431	6966	73	t	4	0.0000	0.0000	ml	0.0000	volume
20432	6967	65	t	0	0.0000	0.0000	ml	0.0000	volume
20433	6968	24	t	0	3.0000	70.0000	ml	0.0000	volume
20434	6969	91	f	0	0.0000	0.0000	ml	0.0000	volume
20435	6970	15	f	0	0.0000	0.0000	ml	65.0000	unit
20436	6970	16	f	1	0.0000	0.0000	ml	65.0000	unit
20437	6970	79	f	2	0.0000	0.0000	ml	65.0000	unit
20438	6970	80	f	3	0.0000	0.0000	ml	65.0000	unit
20439	6970	81	f	4	0.0000	0.0000	ml	0.0000	unit
20440	6970	82	f	5	0.0000	0.0000	ml	65.0000	unit
20441	6970	14	t	6	0.0000	0.0000	ml	0.0000	unit
20442	6971	22	f	0	35.0000	35.0000	ml	35.0000	volume
20443	6971	73	t	1	0.0000	0.0000	ml	0.0000	volume
20521	7026	110	t	0	150.0000	150.0000	ml	0.0000	volume
20522	7027	21	f	0	0.0000	0.0000	ml	0.0000	volume
20523	7027	40	f	1	0.0000	0.0000	ml	0.0000	volume
20524	7027	73	t	2	0.0000	0.0000	ml	0.0000	volume
20525	7028	41	t	0	30.0000	30.0000	ml	0.0000	volume
20526	7029	60	t	0	0.0000	0.0000	ml	0.0000	volume
20527	7030	91	f	0	0.0000	0.0000	ml	0.0000	volume
20566	7060	93	t	0	1.0000	330.0000	ml	0.0000	volume
20567	7061	49	t	0	0.0000	0.0000	ml	0.0000	volume
20568	7062	91	f	0	0.0000	0.0000	ml	0.0000	volume
20569	7063	48	t	0	1.0000	1.0000	ml	0.0000	volume
20570	7063	73	f	1	0.0000	0.0000	ml	0.0000	volume
20571	7064	72	t	0	6.0000	5.0000	ml	0.0000	volume
20572	7064	73	f	1	0.0000	0.0000	ml	0.0000	volume
20573	7065	29	t	0	5.0000	5.0000	ml	0.0000	volume
\.


--
-- Data for Name: drink_slot_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_slot_volumes (id, slot_id, type_volume_id, processed_qty, produced_qty, unit, extra_cost, is_default, is_enabled, sort_order) FROM stdin;
27356	6966	80	10.0000	10.0000	ml	25.0000	f	t	0
27357	6966	81	20.0000	20.0000	ml	50.0000	f	t	0
27358	6966	82	30.0000	30.0000	ml	75.0000	f	t	0
27359	6966	86	1.0000	1.0000	ml	0.0000	f	t	0
27360	6966	87	2.0000	2.0000	ml	0.0000	f	t	0
27361	6966	88	3.0000	3.0000	ml	0.0000	f	t	0
27362	6966	65	1.0000	1.0000	ml	0.0000	f	t	0
27363	6966	66	2.0000	2.0000	ml	0.0000	f	t	0
27364	6966	67	3.0000	3.0000	ml	0.0000	f	t	0
27365	6966	83	10.0000	10.0000	ml	0.0000	f	t	0
27366	6966	84	20.0000	20.0000	ml	0.0000	f	t	0
27367	6966	85	30.0000	30.0000	ml	0.0000	f	t	0
27368	6967	52	10.0000	10.0000	ml	0.0000	f	t	0
27369	6967	53	20.0000	20.0000	ml	0.0000	t	t	0
27370	6967	54	30.0000	30.0000	ml	55.0000	f	t	0
27371	6968	121	3.0000	70.0000	ml	0.0000	f	t	0
27372	6969	76	170.0000	170.0000	ml	0.0000	f	t	0
27373	6969	77	190.0000	190.0000	ml	0.0000	t	t	0
27374	6969	78	210.0000	210.0000	ml	0.0000	f	t	0
26540	6739	80	10.0000	10.0000	ml	25.0000	f	t	0
26541	6739	81	20.0000	20.0000	ml	50.0000	f	t	0
26542	6739	82	30.0000	30.0000	ml	75.0000	f	t	0
26543	6739	86	1.0000	1.0000	ml	0.0000	f	t	0
26544	6739	87	2.0000	2.0000	ml	0.0000	f	t	0
26545	6739	88	3.0000	3.0000	ml	0.0000	f	t	0
26546	6739	65	1.0000	1.0000	ml	0.0000	f	t	0
26547	6739	66	2.0000	2.0000	ml	0.0000	f	t	0
26548	6739	67	3.0000	3.0000	ml	0.0000	f	t	0
25413	6461	37	18.0000	18.0000	ml	0.0000	f	t	0
25414	6461	38	18.0000	25.0000	ml	0.0000	t	t	0
25415	6461	39	36.0000	54.0000	ml	65.0000	f	t	0
26624	6760	80	10.0000	10.0000	ml	25.0000	f	t	0
26625	6760	81	20.0000	20.0000	ml	50.0000	f	t	0
25416	6461	34	18.0000	18.0000	ml	0.0000	f	t	0
25417	6461	35	18.0000	25.0000	ml	0.0000	t	t	0
25418	6461	36	36.0000	54.0000	ml	65.0000	f	t	0
26626	6760	82	30.0000	30.0000	ml	75.0000	f	t	0
26627	6760	86	1.0000	1.0000	ml	0.0000	f	t	0
26628	6760	87	2.0000	2.0000	ml	0.0000	f	t	0
26629	6760	88	3.0000	3.0000	ml	0.0000	f	t	0
26630	6760	65	1.0000	1.0000	ml	0.0000	f	t	0
26631	6760	66	2.0000	2.0000	ml	0.0000	f	t	0
26632	6760	67	3.0000	3.0000	ml	0.0000	f	t	0
26633	6760	83	10.0000	10.0000	ml	0.0000	f	t	0
26634	6760	84	20.0000	20.0000	ml	0.0000	f	t	0
26635	6760	85	30.0000	30.0000	ml	0.0000	f	t	0
26636	6761	96	15.0000	15.0000	ml	0.0000	f	t	0
26637	6761	97	30.0000	30.0000	ml	0.0000	t	t	0
26638	6761	98	45.0000	45.0000	ml	65.0000	f	t	0
25419	6462	55	10.0000	10.0000	ml	35.0000	f	t	0
25420	6462	56	20.0000	20.0000	ml	70.0000	f	t	0
25421	6462	57	30.0000	30.0000	ml	105.0000	f	t	0
25422	6462	58	10.0000	10.0000	ml	35.0000	f	t	0
26549	6739	83	10.0000	10.0000	ml	0.0000	f	t	0
26550	6739	84	20.0000	20.0000	ml	0.0000	f	t	0
26551	6739	85	30.0000	30.0000	ml	0.0000	f	t	0
26552	6740	89	15.0000	15.0000	ml	0.0000	t	t	0
26553	6740	90	30.0000	30.0000	ml	55.0000	f	t	0
26554	6740	91	45.0000	45.0000	ml	110.0000	f	t	0
26555	6741	113	30.0000	30.0000	ml	0.0000	f	t	0
26556	6742	34	18.0000	18.0000	ml	0.0000	f	t	0
26557	6742	35	18.0000	25.0000	ml	0.0000	t	t	0
26558	6742	36	36.0000	54.0000	ml	65.0000	f	t	0
26559	6742	37	18.0000	18.0000	ml	0.0000	f	t	0
26560	6742	38	18.0000	25.0000	ml	0.0000	t	t	0
26561	6742	39	36.0000	54.0000	ml	65.0000	f	t	0
26562	6743	76	110.0000	110.0000	ml	0.0000	f	t	0
26639	6762	113	30.0000	30.0000	ml	0.0000	t	t	0
26640	6763	34	18.0000	18.0000	ml	0.0000	f	t	0
26641	6763	35	18.0000	36.0000	ml	0.0000	t	t	0
26642	6763	36	36.0000	54.0000	ml	65.0000	f	t	0
26643	6763	37	18.0000	18.0000	ml	0.0000	f	t	0
26644	6763	38	18.0000	36.0000	ml	0.0000	t	t	0
26645	6763	39	36.0000	54.0000	ml	65.0000	f	t	0
26646	6764	76	160.0000	160.0000	ml	0.0000	f	t	0
26647	6764	77	180.0000	180.0000	ml	0.0000	t	t	0
26648	6764	78	200.0000	200.0000	ml	0.0000	f	t	0
26964	6849	80	10.0000	10.0000	ml	25.0000	f	t	0
26965	6849	81	20.0000	20.0000	ml	50.0000	f	t	0
26966	6849	82	30.0000	30.0000	ml	75.0000	f	t	0
26967	6849	86	1.0000	1.0000	ml	0.0000	f	t	0
26968	6849	87	2.0000	2.0000	ml	0.0000	f	t	0
26969	6849	88	3.0000	3.0000	ml	0.0000	f	t	0
26970	6849	65	1.0000	1.0000	ml	0.0000	f	t	0
26971	6849	66	2.0000	2.0000	ml	0.0000	f	t	0
26972	6849	67	3.0000	3.0000	ml	0.0000	f	t	0
26973	6849	83	10.0000	10.0000	ml	0.0000	f	t	0
26974	6849	84	20.0000	20.0000	ml	0.0000	f	t	0
26975	6849	85	30.0000	30.0000	ml	0.0000	f	t	0
26976	6850	114	10.0000	10.0000	ml	0.0000	f	t	0
26977	6850	115	20.0000	20.0000	ml	0.0000	t	t	0
26978	6850	116	30.0000	30.0000	ml	55.0000	f	t	0
26979	6851	102	10.0000	10.0000	ml	0.0000	f	t	0
26980	6851	103	20.0000	20.0000	ml	0.0000	t	t	0
26981	6851	104	30.0000	30.0000	ml	55.0000	f	t	0
26982	6851	105	0.0000	0.0000	ml	0.0000	f	t	0
26983	6852	122	30.0000	30.0000	ml	0.0000	t	t	0
26984	6853	34	18.0000	18.0000	ml	0.0000	f	t	0
26985	6853	35	18.0000	36.0000	ml	0.0000	t	t	0
26986	6853	36	36.0000	54.0000	ml	65.0000	f	t	0
26987	6853	37	18.0000	18.0000	ml	0.0000	f	t	0
26988	6853	38	18.0000	36.0000	ml	0.0000	t	t	0
26989	6853	39	36.0000	54.0000	ml	65.0000	f	t	0
26990	6854	76	170.0000	170.0000	ml	0.0000	f	t	0
26213	6663	83	10.0000	10.0000	ml	0.0000	f	t	0
26214	6663	84	20.0000	20.0000	ml	0.0000	t	t	0
26215	6663	85	30.0000	30.0000	ml	0.0000	f	t	0
27375	6972	121	3.0000	70.0000	ml	0.0000	f	t	0
26216	6664	96	15.0000	15.0000	ml	0.0000	f	t	0
26217	6664	97	30.0000	30.0000	ml	0.0000	t	t	0
26218	6664	98	45.0000	45.0000	ml	65.0000	f	t	0
26219	6665	34	18.0000	18.0000	ml	0.0000	f	t	0
26220	6665	35	18.0000	36.0000	ml	0.0000	t	t	0
27376	6973	80	10.0000	10.0000	ml	0.0000	f	t	0
27377	6973	81	20.0000	20.0000	ml	0.0000	t	t	0
27378	6973	82	30.0000	30.0000	ml	25.0000	f	t	0
25805	6558	80	10.0000	10.0000	ml	25.0000	f	t	0
27379	6974	76	170.0000	170.0000	ml	0.0000	f	t	0
27380	6974	77	190.0000	190.0000	ml	0.0000	t	t	0
27381	6974	78	210.0000	210.0000	ml	0.0000	f	t	0
25806	6558	81	20.0000	20.0000	ml	50.0000	f	t	0
25807	6558	82	30.0000	30.0000	ml	75.0000	f	t	0
25808	6558	86	1.0000	1.0000	ml	0.0000	f	t	0
25809	6558	87	2.0000	2.0000	ml	0.0000	f	t	0
26221	6665	36	36.0000	54.0000	ml	65.0000	f	t	0
26222	6665	37	18.0000	18.0000	ml	0.0000	f	t	0
26223	6665	38	18.0000	36.0000	ml	0.0000	t	t	0
26224	6665	39	36.0000	54.0000	ml	65.0000	f	t	0
25810	6558	88	3.0000	3.0000	ml	0.0000	f	t	0
25811	6558	65	1.0000	1.0000	ml	0.0000	f	t	0
26225	6666	76	170.0000	170.0000	ml	0.0000	f	t	0
26226	6666	77	190.0000	190.0000	ml	0.0000	t	t	0
26227	6666	78	210.0000	210.0000	ml	0.0000	f	t	0
26563	6743	77	130.0000	130.0000	ml	0.0000	t	t	0
26564	6743	78	150.0000	150.0000	ml	0.0000	f	t	0
26649	6767	80	10.0000	10.0000	ml	25.0000	f	t	0
25812	6558	66	2.0000	2.0000	ml	0.0000	f	t	0
25813	6558	67	3.0000	3.0000	ml	0.0000	f	t	0
25814	6558	83	10.0000	10.0000	ml	0.0000	f	t	0
26650	6767	81	20.0000	20.0000	ml	50.0000	f	t	0
26651	6767	82	30.0000	30.0000	ml	75.0000	f	t	0
26652	6767	86	1.0000	1.0000	ml	0.0000	f	t	0
26653	6767	87	2.0000	2.0000	ml	0.0000	f	t	0
26654	6767	88	3.0000	3.0000	ml	0.0000	f	t	0
26655	6767	65	1.0000	1.0000	ml	0.0000	f	t	0
26656	6767	66	2.0000	2.0000	ml	0.0000	f	t	0
26657	6767	67	3.0000	3.0000	ml	0.0000	f	t	0
26658	6767	83	10.0000	10.0000	ml	0.0000	f	t	0
26659	6767	84	20.0000	20.0000	ml	0.0000	f	t	0
26660	6767	85	30.0000	30.0000	ml	0.0000	f	t	0
26661	6768	58	15.0000	15.0000	ml	0.0000	t	t	0
26662	6768	59	25.0000	25.0000	ml	35.0000	f	t	0
26663	6768	61	35.0000	35.0000	ml	70.0000	f	t	0
26664	6769	113	30.0000	30.0000	ml	0.0000	f	t	0
26665	6770	34	18.0000	18.0000	ml	0.0000	f	t	0
25423	6462	59	20.0000	20.0000	ml	70.0000	f	t	0
26666	6770	35	18.0000	36.0000	ml	0.0000	t	t	0
26667	6770	36	36.0000	54.0000	ml	65.0000	f	t	0
26668	6770	37	18.0000	18.0000	ml	0.0000	f	t	0
26669	6770	38	18.0000	36.0000	ml	0.0000	t	t	0
26670	6770	39	36.0000	54.0000	ml	65.0000	f	t	0
26671	6771	76	160.0000	160.0000	ml	0.0000	f	t	0
26672	6771	77	180.0000	180.0000	ml	0.0000	t	t	0
26673	6771	78	200.0000	200.0000	ml	0.0000	f	t	0
25424	6462	61	30.0000	30.0000	ml	105.0000	f	t	0
25425	6462	62	10.0000	10.0000	ml	35.0000	f	t	0
25426	6462	63	20.0000	20.0000	ml	70.0000	f	t	0
25427	6462	64	30.0000	30.0000	ml	105.0000	f	t	0
25428	6465	80	10.0000	10.0000	ml	25.0000	f	t	0
25815	6558	84	20.0000	20.0000	ml	0.0000	f	t	0
25816	6558	85	30.0000	30.0000	ml	0.0000	f	t	0
25429	6465	81	20.0000	20.0000	ml	50.0000	f	t	0
26991	6854	77	190.0000	190.0000	ml	0.0000	t	t	0
26992	6854	78	210.0000	210.0000	ml	0.0000	f	t	0
25430	6465	82	30.0000	30.0000	ml	75.0000	f	t	0
25431	6465	86	1.0000	1.0000	ml	0.0000	f	t	0
25432	6465	87	2.0000	2.0000	ml	0.0000	f	t	0
25433	6465	88	3.0000	3.0000	ml	0.0000	f	t	0
25434	6465	65	1.0000	1.0000	ml	0.0000	f	t	0
25435	6465	66	2.0000	2.0000	ml	0.0000	f	t	0
25436	6465	67	3.0000	3.0000	ml	0.0000	f	t	0
25272	6425	37	18.0000	18.0000	ml	0.0000	f	t	0
25273	6425	38	18.0000	36.0000	ml	0.0000	t	t	0
25274	6425	39	36.0000	54.0000	ml	65.0000	f	t	0
25275	6425	34	18.0000	18.0000	ml	0.0000	f	t	0
25276	6425	35	18.0000	36.0000	ml	0.0000	t	t	0
25277	6425	36	36.0000	54.0000	ml	65.0000	f	t	0
27382	6980	138	10.0000	10.0000	ml	0.0000	f	t	0
27383	6980	139	20.0000	20.0000	ml	0.0000	t	t	0
27384	6980	140	30.0000	30.0000	ml	35.0000	f	t	0
27385	6981	76	130.0000	130.0000	ml	0.0000	f	t	0
25817	6559	55	10.0000	10.0000	ml	0.0000	t	t	0
25818	6559	56	20.0000	20.0000	ml	35.0000	f	t	0
25819	6559	57	30.0000	30.0000	ml	70.0000	f	t	0
25820	6559	62	10.0000	10.0000	ml	0.0000	t	t	0
25821	6559	63	20.0000	20.0000	ml	35.0000	f	t	0
25822	6559	64	30.0000	30.0000	ml	70.0000	f	t	0
27386	6981	77	150.0000	150.0000	ml	0.0000	t	t	0
27387	6981	78	180.0000	180.0000	ml	0.0000	f	t	0
26674	6774	80	10.0000	10.0000	ml	25.0000	f	t	0
26675	6774	81	20.0000	20.0000	ml	50.0000	f	t	0
26676	6774	82	30.0000	30.0000	ml	75.0000	f	t	0
26677	6774	86	1.0000	1.0000	ml	0.0000	f	t	0
26678	6774	87	2.0000	2.0000	ml	0.0000	f	t	0
26679	6774	88	3.0000	3.0000	ml	0.0000	f	t	0
26680	6774	65	1.0000	1.0000	ml	0.0000	f	t	0
26681	6774	66	2.0000	2.0000	ml	0.0000	f	t	0
26682	6774	67	3.0000	3.0000	ml	0.0000	f	t	0
26683	6774	83	10.0000	10.0000	ml	0.0000	f	t	0
26684	6774	84	20.0000	20.0000	ml	0.0000	f	t	0
26228	6669	80	10.0000	10.0000	ml	25.0000	f	t	0
26229	6669	81	20.0000	20.0000	ml	50.0000	f	t	0
26230	6669	82	30.0000	30.0000	ml	75.0000	f	t	0
26231	6669	86	1.0000	1.0000	ml	0.0000	f	t	0
26232	6669	87	2.0000	2.0000	ml	0.0000	f	t	0
26233	6669	88	3.0000	3.0000	ml	0.0000	f	t	0
26234	6669	65	1.0000	1.0000	ml	0.0000	f	t	0
26235	6669	66	2.0000	2.0000	ml	0.0000	f	t	0
26236	6669	67	3.0000	3.0000	ml	0.0000	f	t	0
25437	6465	83	10.0000	10.0000	ml	0.0000	f	t	0
25438	6465	84	20.0000	20.0000	ml	0.0000	f	t	0
25439	6465	85	30.0000	30.0000	ml	0.0000	f	t	0
25685	6530	80	10.0000	10.0000	ml	0.0000	f	t	0
25686	6530	81	20.0000	20.0000	ml	0.0000	f	t	0
25687	6530	82	30.0000	30.0000	ml	0.0000	f	t	0
25688	6530	86	1.0000	1.0000	ml	0.0000	f	t	0
25689	6530	87	2.0000	2.0000	ml	0.0000	f	t	0
26685	6774	85	30.0000	30.0000	ml	0.0000	f	t	0
26686	6775	99	15.0000	15.0000	ml	0.0000	f	t	0
26687	6775	100	30.0000	30.0000	ml	0.0000	t	t	0
26688	6775	101	45.0000	45.0000	ml	55.0000	f	t	0
25823	6559	58	10.0000	10.0000	ml	0.0000	t	t	0
25824	6559	59	20.0000	20.0000	ml	35.0000	f	t	0
25825	6559	61	30.0000	30.0000	ml	70.0000	f	t	0
25690	6530	88	3.0000	3.0000	ml	0.0000	f	t	0
25826	6560	49	15.0000	15.0000	ml	0.0000	f	t	0
25827	6560	50	30.0000	30.0000	ml	0.0000	t	t	0
25828	6560	51	45.0000	45.0000	ml	55.0000	f	t	0
25691	6530	65	1.0000	1.0000	ml	0.0000	f	t	0
25692	6530	66	2.0000	2.0000	ml	0.0000	f	t	0
25693	6530	67	3.0000	3.0000	ml	0.0000	f	t	0
25694	6530	83	10.0000	10.0000	ml	0.0000	f	t	0
25695	6530	84	20.0000	20.0000	ml	0.0000	f	t	0
25696	6530	85	30.0000	30.0000	ml	0.0000	f	t	0
25697	6531	58	10.0000	10.0000	ml	35.0000	f	t	0
25698	6531	59	20.0000	20.0000	ml	70.0000	f	t	0
25829	6561	34	18.0000	18.0000	ml	0.0000	f	t	0
25830	6561	35	18.0000	36.0000	ml	0.0000	t	t	0
25831	6561	36	36.0000	54.0000	ml	65.0000	f	t	0
25832	6561	37	18.0000	18.0000	ml	0.0000	f	t	0
25833	6561	38	18.0000	36.0000	ml	0.0000	t	t	0
25834	6561	39	36.0000	54.0000	ml	65.0000	f	t	0
26066	6626	80	10.0000	10.0000	ml	25.0000	f	t	0
26067	6626	81	20.0000	20.0000	ml	50.0000	f	t	0
26068	6626	82	30.0000	30.0000	ml	75.0000	f	t	0
25699	6531	61	30.0000	30.0000	ml	105.0000	f	t	0
26069	6626	86	1.0000	1.0000	ml	0.0000	f	t	0
26070	6626	87	2.0000	2.0000	ml	0.0000	f	t	0
26071	6626	88	3.0000	3.0000	ml	0.0000	f	t	0
25700	6531	62	10.0000	10.0000	ml	35.0000	f	t	0
25701	6531	63	20.0000	20.0000	ml	70.0000	f	t	0
26689	6776	113	30.0000	30.0000	ml	0.0000	t	t	0
26690	6777	34	18.0000	18.0000	ml	0.0000	f	t	0
26691	6777	35	18.0000	36.0000	ml	0.0000	t	t	0
25702	6531	64	30.0000	30.0000	ml	105.0000	f	t	0
25703	6531	55	10.0000	10.0000	ml	35.0000	f	t	0
25704	6531	56	20.0000	20.0000	ml	70.0000	f	t	0
25705	6531	57	30.0000	30.0000	ml	105.0000	f	t	0
25706	6532	49	15.0000	15.0000	ml	0.0000	f	t	0
25707	6532	50	30.0000	30.0000	ml	0.0000	t	t	0
25708	6532	51	45.0000	45.0000	ml	55.0000	f	t	0
25709	6533	34	18.0000	18.0000	ml	0.0000	f	t	0
25710	6533	35	18.0000	36.0000	ml	0.0000	t	t	0
26072	6626	65	1.0000	1.0000	ml	0.0000	f	t	0
26073	6626	66	2.0000	2.0000	ml	0.0000	f	t	0
26074	6626	67	3.0000	3.0000	ml	0.0000	f	t	0
26075	6626	83	10.0000	10.0000	ml	0.0000	f	t	0
26692	6777	36	36.0000	54.0000	ml	65.0000	f	t	0
26693	6777	37	18.0000	18.0000	ml	0.0000	f	t	0
26694	6777	38	18.0000	36.0000	ml	0.0000	t	t	0
26695	6777	39	36.0000	54.0000	ml	65.0000	f	t	0
26696	6778	76	160.0000	160.0000	ml	0.0000	f	t	0
26697	6778	77	180.0000	180.0000	ml	0.0000	t	t	0
26698	6778	78	200.0000	200.0000	ml	0.0000	f	t	0
25835	6568	80	10.0000	10.0000	ml	25.0000	t	t	0
25836	6568	81	20.0000	20.0000	ml	50.0000	f	t	0
25837	6568	82	30.0000	30.0000	ml	75.0000	f	t	0
25838	6568	146	2.0000	2.0000	ml	0.0000	t	t	0
25839	6568	147	6.0000	6.0000	ml	0.0000	f	t	0
25840	6568	148	10.0000	10.0000	ml	0.0000	f	t	0
26076	6626	84	20.0000	20.0000	ml	0.0000	f	t	0
26077	6626	85	30.0000	30.0000	ml	0.0000	f	t	0
26078	6627	58	10.0000	10.0000	ml	0.0000	f	t	0
25440	6467	80	10.0000	10.0000	ml	25.0000	f	t	0
25441	6467	81	20.0000	20.0000	ml	50.0000	f	t	0
25442	6467	82	30.0000	30.0000	ml	75.0000	f	t	0
25443	6467	86	1.0000	1.0000	ml	0.0000	f	t	0
25444	6467	87	2.0000	2.0000	ml	0.0000	f	t	0
25445	6467	88	3.0000	3.0000	ml	0.0000	f	t	0
25446	6467	65	1.0000	1.0000	ml	0.0000	f	t	0
25447	6467	66	2.0000	2.0000	ml	0.0000	f	t	0
25448	6467	67	3.0000	3.0000	ml	0.0000	f	t	0
25449	6467	83	10.0000	10.0000	ml	0.0000	f	t	0
25450	6467	84	20.0000	20.0000	ml	0.0000	f	t	0
25451	6467	85	30.0000	30.0000	ml	0.0000	f	t	0
25278	6427	34	18.0000	18.0000	ml	0.0000	f	t	0
25279	6427	35	18.0000	36.0000	ml	0.0000	t	t	0
25280	6427	36	36.0000	54.0000	ml	65.0000	f	t	0
25281	6427	37	18.0000	18.0000	ml	0.0000	f	t	0
25282	6427	38	18.0000	36.0000	ml	0.0000	t	t	0
25283	6427	39	36.0000	54.0000	ml	65.0000	f	t	0
25452	6468	89	10.0000	10.0000	ml	0.0000	t	t	0
25453	6468	90	20.0000	20.0000	ml	55.0000	f	t	0
25454	6468	91	30.0000	30.0000	ml	110.0000	f	t	0
25455	6469	34	18.0000	18.0000	ml	0.0000	f	t	0
25456	6469	35	18.0000	25.0000	ml	0.0000	t	t	0
25457	6469	36	36.0000	54.0000	ml	65.0000	f	t	0
25458	6469	37	18.0000	18.0000	ml	0.0000	f	t	0
27298	6945	49	15.0000	15.0000	ml	0.0000	f	t	0
27299	6945	50	30.0000	30.0000	ml	0.0000	t	t	0
27300	6945	51	45.0000	45.0000	ml	55.0000	f	t	0
27301	6946	92	30.0000	30.0000	ml	0.0000	t	t	0
27302	6947	76	160.0000	160.0000	ml	0.0000	f	t	0
27303	6947	77	180.0000	180.0000	ml	0.0000	t	t	0
27304	6947	78	200.0000	200.0000	ml	0.0000	f	t	0
25459	6469	38	18.0000	25.0000	ml	0.0000	t	t	0
25460	6469	39	36.0000	54.0000	ml	65.0000	f	t	0
25711	6533	36	36.0000	54.0000	ml	65.0000	f	t	0
25712	6533	37	18.0000	18.0000	ml	0.0000	f	t	0
25713	6533	38	18.0000	36.0000	ml	0.0000	t	t	0
25714	6533	39	36.0000	54.0000	ml	65.0000	f	t	0
26079	6627	59	20.0000	20.0000	ml	0.0000	t	t	0
26080	6627	61	30.0000	30.0000	ml	35.0000	f	t	0
26081	6628	34	18.0000	18.0000	ml	0.0000	f	t	0
26237	6669	83	10.0000	10.0000	ml	0.0000	f	t	0
26238	6669	84	20.0000	20.0000	ml	0.0000	f	t	0
27033	6866	80	10.0000	10.0000	ml	25.0000	f	t	0
26239	6669	85	30.0000	30.0000	ml	0.0000	f	t	0
27034	6866	81	20.0000	20.0000	ml	50.0000	f	t	0
27035	6866	82	30.0000	30.0000	ml	75.0000	f	t	0
27036	6866	86	1.0000	1.0000	ml	0.0000	f	t	0
27037	6866	87	2.0000	2.0000	ml	0.0000	f	t	0
27038	6866	88	3.0000	3.0000	ml	0.0000	f	t	0
27039	6866	65	1.0000	1.0000	ml	0.0000	f	t	0
27040	6866	66	2.0000	2.0000	ml	0.0000	f	t	0
27041	6866	67	3.0000	3.0000	ml	0.0000	f	t	0
27042	6866	83	10.0000	10.0000	ml	0.0000	f	t	0
27043	6866	84	20.0000	20.0000	ml	0.0000	f	t	0
27044	6866	85	30.0000	30.0000	ml	0.0000	f	t	0
27045	6867	55	10.0000	10.0000	ml	35.0000	f	t	0
27046	6867	56	20.0000	20.0000	ml	70.0000	f	t	0
27047	6867	57	30.0000	30.0000	ml	105.0000	f	t	0
27048	6867	58	10.0000	10.0000	ml	35.0000	f	t	0
27049	6867	59	20.0000	20.0000	ml	70.0000	f	t	0
27050	6867	61	30.0000	30.0000	ml	105.0000	f	t	0
25461	6473	80	10.0000	10.0000	ml	25.0000	f	t	0
25462	6473	81	20.0000	20.0000	ml	50.0000	f	t	0
25463	6473	82	30.0000	30.0000	ml	75.0000	f	t	0
25464	6473	86	1.0000	1.0000	ml	0.0000	f	t	0
25465	6473	87	2.0000	2.0000	ml	0.0000	f	t	0
25466	6473	88	3.0000	3.0000	ml	0.0000	f	t	0
25467	6473	65	1.0000	1.0000	ml	0.0000	f	t	0
25468	6473	66	2.0000	2.0000	ml	0.0000	f	t	0
25469	6473	67	3.0000	3.0000	ml	0.0000	f	t	0
25470	6473	83	10.0000	10.0000	ml	0.0000	f	t	0
25471	6473	84	20.0000	20.0000	ml	0.0000	f	t	0
25472	6473	85	30.0000	30.0000	ml	0.0000	f	t	0
25473	6474	55	10.0000	10.0000	ml	35.0000	f	t	0
25474	6474	56	20.0000	20.0000	ml	70.0000	f	t	0
25475	6474	57	30.0000	30.0000	ml	105.0000	f	t	0
25476	6474	58	10.0000	10.0000	ml	35.0000	f	t	0
25477	6474	59	20.0000	20.0000	ml	70.0000	f	t	0
26240	6670	102	15.0000	15.0000	ml	0.0000	f	t	0
26241	6670	103	35.0000	35.0000	ml	0.0000	t	t	0
25478	6474	61	30.0000	30.0000	ml	105.0000	f	t	0
25479	6474	62	10.0000	10.0000	ml	35.0000	f	t	0
25480	6474	63	20.0000	20.0000	ml	70.0000	f	t	0
25481	6474	64	30.0000	30.0000	ml	105.0000	f	t	0
25482	6475	34	18.0000	18.0000	ml	0.0000	f	t	0
25483	6475	35	18.0000	36.0000	ml	0.0000	t	t	0
25484	6475	36	36.0000	54.0000	ml	65.0000	f	t	0
25485	6475	37	18.0000	18.0000	ml	0.0000	f	t	0
25486	6475	38	18.0000	36.0000	ml	0.0000	t	t	0
25487	6475	39	36.0000	54.0000	ml	65.0000	f	t	0
25841	6569	80	10.0000	10.0000	ml	25.0000	t	t	0
25842	6569	81	20.0000	20.0000	ml	50.0000	f	t	0
25843	6569	82	30.0000	30.0000	ml	75.0000	f	t	0
25844	6569	146	4.0000	4.0000	ml	0.0000	t	t	0
26242	6670	104	45.0000	45.0000	ml	55.0000	f	t	0
26243	6670	105	0.0000	0.0000	ml	0.0000	f	f	0
26244	6671	34	18.0000	18.0000	ml	0.0000	f	t	0
26245	6671	35	18.0000	36.0000	ml	0.0000	t	t	0
26246	6671	36	36.0000	54.0000	ml	65.0000	f	t	0
26247	6671	37	18.0000	18.0000	ml	0.0000	f	t	0
25845	6569	147	10.0000	10.0000	ml	0.0000	f	t	0
25846	6569	148	15.0000	15.0000	ml	0.0000	f	t	0
26082	6628	35	18.0000	36.0000	ml	0.0000	t	t	0
26083	6628	36	36.0000	54.0000	ml	65.0000	f	t	0
26084	6628	37	18.0000	18.0000	ml	0.0000	f	t	0
26085	6628	38	18.0000	36.0000	ml	0.0000	t	t	0
26086	6628	39	36.0000	54.0000	ml	65.0000	f	t	0
26087	6629	76	120.0000	120.0000	ml	0.0000	f	t	0
26088	6629	77	140.0000	140.0000	ml	0.0000	t	t	0
26089	6629	78	160.0000	160.0000	ml	0.0000	f	t	0
26248	6671	38	18.0000	36.0000	ml	0.0000	t	t	0
26249	6671	39	36.0000	54.0000	ml	65.0000	f	t	0
26250	6672	76	170.0000	170.0000	ml	0.0000	f	t	0
26251	6672	77	190.0000	190.0000	ml	0.0000	t	t	0
26252	6672	78	210.0000	210.0000	ml	0.0000	f	t	0
26565	6746	80	10.0000	10.0000	ml	25.0000	f	t	0
26566	6746	81	20.0000	20.0000	ml	50.0000	f	t	0
26567	6746	82	30.0000	30.0000	ml	75.0000	f	t	0
26568	6746	86	1.0000	1.0000	ml	0.0000	f	t	0
26569	6746	87	2.0000	2.0000	ml	0.0000	f	t	0
26570	6746	88	3.0000	3.0000	ml	0.0000	f	t	0
26571	6746	65	1.0000	1.0000	ml	0.0000	f	t	0
26572	6746	66	2.0000	2.0000	ml	0.0000	f	t	0
26573	6746	67	3.0000	3.0000	ml	0.0000	f	t	0
26574	6746	83	10.0000	10.0000	ml	0.0000	f	t	0
26575	6746	84	20.0000	20.0000	ml	0.0000	f	t	0
26576	6746	85	30.0000	30.0000	ml	0.0000	f	t	0
26577	6747	55	10.0000	10.0000	ml	35.0000	f	t	0
26578	6747	56	20.0000	20.0000	ml	70.0000	f	t	0
26579	6747	57	30.0000	30.0000	ml	105.0000	f	t	0
26580	6747	58	10.0000	10.0000	ml	35.0000	f	t	0
26581	6747	59	20.0000	20.0000	ml	70.0000	f	t	0
26582	6747	61	30.0000	30.0000	ml	105.0000	f	t	0
26583	6747	62	10.0000	10.0000	ml	35.0000	f	t	0
26584	6747	63	20.0000	20.0000	ml	70.0000	f	t	0
26585	6747	64	30.0000	30.0000	ml	105.0000	f	t	0
27051	6867	62	10.0000	10.0000	ml	35.0000	f	t	0
27052	6867	63	20.0000	20.0000	ml	70.0000	f	t	0
27053	6867	64	30.0000	30.0000	ml	105.0000	f	t	0
26589	6748	113	30.0000	30.0000	ml	0.0000	t	t	0
26590	6749	34	18.0000	18.0000	ml	0.0000	f	t	0
26591	6749	35	18.0000	36.0000	ml	0.0000	t	t	0
26592	6749	36	36.0000	54.0000	ml	65.0000	f	t	0
26593	6749	37	18.0000	18.0000	ml	0.0000	f	t	0
26594	6749	38	18.0000	36.0000	ml	0.0000	t	t	0
26595	6749	39	36.0000	54.0000	ml	65.0000	f	t	0
26596	6750	76	110.0000	110.0000	ml	0.0000	f	t	0
26253	6675	80	10.0000	10.0000	ml	25.0000	f	t	0
26254	6675	81	20.0000	20.0000	ml	50.0000	f	t	0
26255	6675	82	30.0000	30.0000	ml	75.0000	f	t	0
26256	6675	86	1.0000	1.0000	ml	0.0000	f	t	0
26257	6675	87	2.0000	2.0000	ml	0.0000	f	t	0
26258	6675	88	3.0000	3.0000	ml	0.0000	f	t	0
26259	6675	65	1.0000	1.0000	ml	0.0000	f	t	0
26733	6789	55	10.0000	10.0000	ml	35.0000	f	t	0
26734	6789	56	20.0000	20.0000	ml	70.0000	f	t	0
26735	6789	57	30.0000	30.0000	ml	105.0000	f	t	0
26736	6789	58	10.0000	10.0000	ml	35.0000	f	t	0
26737	6789	59	20.0000	20.0000	ml	70.0000	f	t	0
26738	6789	61	30.0000	30.0000	ml	105.0000	f	t	0
26739	6789	62	10.0000	10.0000	ml	35.0000	f	t	0
26740	6789	63	20.0000	20.0000	ml	70.0000	f	t	0
26741	6789	64	30.0000	30.0000	ml	105.0000	f	t	0
27394	6986	141	10.0000	10.0000	ml	0.0000	t	t	0
27395	6986	142	20.0000	20.0000	ml	35.0000	f	t	0
26260	6675	66	2.0000	2.0000	ml	0.0000	f	t	0
26261	6675	67	3.0000	3.0000	ml	0.0000	f	t	0
26262	6675	83	10.0000	10.0000	ml	0.0000	f	t	0
27396	6986	143	30.0000	30.0000	ml	70.0000	f	t	0
27397	6989	76	160.0000	160.0000	ml	0.0000	f	t	0
27398	6989	77	180.0000	180.0000	ml	0.0000	t	t	0
27057	6868	49	15.0000	15.0000	ml	0.0000	f	t	0
27058	6868	50	30.0000	30.0000	ml	0.0000	t	t	0
27059	6868	51	45.0000	45.0000	ml	55.0000	f	t	0
25488	6479	80	10.0000	10.0000	ml	25.0000	f	t	0
25489	6479	81	20.0000	20.0000	ml	50.0000	f	t	0
25490	6479	82	30.0000	30.0000	ml	75.0000	f	t	0
25491	6479	86	1.0000	1.0000	ml	0.0000	f	t	0
26263	6675	84	20.0000	20.0000	ml	0.0000	f	t	0
26264	6675	85	30.0000	30.0000	ml	0.0000	f	t	0
25492	6479	87	2.0000	2.0000	ml	0.0000	f	t	0
25493	6479	88	3.0000	3.0000	ml	0.0000	f	t	0
27060	6869	122	20.0000	20.0000	ml	0.0000	t	t	0
27061	6870	34	18.0000	18.0000	ml	0.0000	f	t	0
27062	6870	35	18.0000	36.0000	ml	0.0000	t	t	0
27063	6870	36	36.0000	54.0000	ml	65.0000	f	t	0
27064	6870	37	18.0000	18.0000	ml	0.0000	f	t	0
27065	6870	38	18.0000	36.0000	ml	0.0000	t	t	0
27066	6870	39	36.0000	54.0000	ml	65.0000	f	t	0
27067	6871	76	170.0000	170.0000	ml	0.0000	f	t	0
27068	6871	77	190.0000	190.0000	ml	0.0000	t	t	0
27069	6871	78	210.0000	210.0000	ml	0.0000	f	t	0
27070	6873	49	5.0000	5.0000	ml	0.0000	t	t	0
27071	6873	50	20.0000	20.0000	ml	0.0000	f	t	0
27072	6873	51	15.0000	15.0000	ml	0.0000	f	t	0
26265	6676	102	10.0000	10.0000	ml	0.0000	f	t	0
26266	6676	103	20.0000	20.0000	ml	0.0000	t	t	0
26267	6676	104	30.0000	30.0000	ml	55.0000	f	t	0
26268	6676	105	0.0000	0.0000	ml	0.0000	f	t	0
26269	6677	114	10.0000	10.0000	ml	0.0000	f	t	0
26270	6677	115	20.0000	20.0000	ml	0.0000	t	t	0
26271	6677	116	30.0000	30.0000	ml	55.0000	f	t	0
27399	6989	78	200.0000	200.0000	ml	0.0000	f	t	0
26745	6790	34	18.0000	18.0000	ml	0.0000	f	t	0
26746	6790	35	18.0000	36.0000	ml	0.0000	t	t	0
26747	6790	36	36.0000	54.0000	ml	65.0000	f	t	0
26748	6790	37	18.0000	18.0000	ml	0.0000	f	t	0
25494	6479	65	1.0000	1.0000	ml	0.0000	f	t	0
25495	6479	66	2.0000	2.0000	ml	0.0000	f	t	0
25496	6479	67	3.0000	3.0000	ml	0.0000	f	t	0
25497	6479	83	10.0000	10.0000	ml	0.0000	f	t	0
25284	6429	34	18.0000	18.0000	ml	0.0000	f	t	0
25285	6429	35	18.0000	36.0000	ml	0.0000	t	t	0
25286	6429	36	36.0000	54.0000	ml	65.0000	f	t	0
25287	6429	37	18.0000	18.0000	ml	0.0000	f	t	0
25288	6429	38	18.0000	36.0000	ml	0.0000	t	t	0
25289	6429	39	36.0000	54.0000	ml	65.0000	f	t	0
25290	6430	68	40.0000	40.0000	ml	0.0000	t	t	0
25291	6430	69	80.0000	80.0000	ml	35.0000	f	t	0
26749	6790	38	18.0000	36.0000	ml	0.0000	t	t	0
26750	6790	39	36.0000	54.0000	ml	65.0000	f	t	0
26751	6791	76	150.0000	150.0000	ml	0.0000	f	t	0
26752	6791	77	170.0000	170.0000	ml	0.0000	t	t	0
26753	6791	78	190.0000	190.0000	ml	0.0000	f	t	0
26272	6678	34	18.0000	18.0000	ml	0.0000	f	t	0
26273	6678	35	18.0000	36.0000	ml	0.0000	t	t	0
26274	6678	36	36.0000	54.0000	ml	65.0000	f	t	0
26275	6678	37	18.0000	18.0000	ml	0.0000	f	t	0
26276	6678	38	18.0000	36.0000	ml	0.0000	t	t	0
26277	6678	39	36.0000	54.0000	ml	65.0000	f	t	0
26278	6679	76	170.0000	170.0000	ml	0.0000	f	t	0
26279	6679	77	190.0000	190.0000	ml	0.0000	t	t	0
26280	6679	78	210.0000	210.0000	ml	0.0000	f	t	0
26090	6632	80	10.0000	10.0000	ml	0.0000	t	t	0
26091	6632	81	20.0000	20.0000	ml	0.0000	f	t	0
26092	6632	82	30.0000	30.0000	ml	0.0000	f	t	0
26093	6632	86	1.0000	1.0000	ml	0.0000	t	t	0
26094	6632	87	2.0000	2.0000	ml	0.0000	f	t	0
27400	6990	106	10.0000	10.0000	ml	0.0000	f	t	0
27401	6990	107	20.0000	20.0000	ml	0.0000	t	t	0
27402	6990	108	30.0000	30.0000	ml	55.0000	f	t	0
27403	6991	76	150.0000	150.0000	ml	0.0000	f	t	0
27404	6991	77	170.0000	170.0000	ml	0.0000	t	t	0
27405	6991	78	190.0000	190.0000	ml	0.0000	f	t	0
26597	6750	77	130.0000	130.0000	ml	0.0000	t	t	0
26598	6750	78	150.0000	150.0000	ml	0.0000	f	t	0
26754	6793	113	30.0000	30.0000	ml	0.0000	t	t	0
26755	6794	80	10.0000	10.0000	ml	25.0000	f	t	0
26756	6794	81	20.0000	20.0000	ml	50.0000	f	t	0
26095	6632	88	3.0000	3.0000	ml	0.0000	f	t	0
26096	6632	65	1.0000	1.0000	ml	0.0000	t	t	0
26097	6632	66	2.0000	2.0000	ml	0.0000	f	t	0
26098	6632	67	3.0000	3.0000	ml	0.0000	f	t	0
26099	6632	83	10.0000	10.0000	ml	0.0000	t	t	0
26100	6632	84	20.0000	20.0000	ml	0.0000	f	t	0
26101	6632	85	30.0000	30.0000	ml	0.0000	f	t	0
26102	6633	99	15.0000	15.0000	ml	0.0000	f	t	0
26103	6633	100	30.0000	30.0000	ml	0.0000	t	t	0
26104	6633	101	45.0000	45.0000	ml	55.0000	f	t	0
26757	6794	82	30.0000	30.0000	ml	75.0000	f	t	0
26105	6634	34	18.0000	18.0000	ml	0.0000	f	t	0
26106	6634	35	18.0000	36.0000	ml	0.0000	t	t	0
26107	6634	36	36.0000	54.0000	ml	65.0000	f	t	0
25498	6479	84	20.0000	20.0000	ml	0.0000	f	t	0
25499	6479	85	30.0000	30.0000	ml	0.0000	f	t	0
25500	6480	96	15.0000	15.0000	ml	0.0000	f	t	0
25501	6480	97	30.0000	30.0000	ml	0.0000	t	t	0
25502	6480	98	45.0000	45.0000	ml	65.0000	f	t	0
25503	6481	34	18.0000	18.0000	ml	0.0000	f	t	0
25504	6481	35	18.0000	36.0000	ml	0.0000	t	t	0
25505	6481	36	36.0000	54.0000	ml	65.0000	f	t	0
25506	6481	37	18.0000	18.0000	ml	0.0000	f	t	0
25507	6481	38	18.0000	36.0000	ml	0.0000	t	t	0
25508	6481	39	36.0000	54.0000	ml	65.0000	f	t	0
26108	6634	37	18.0000	18.0000	ml	0.0000	f	t	0
26109	6634	38	18.0000	36.0000	ml	0.0000	t	t	0
26110	6634	39	36.0000	54.0000	ml	65.0000	f	t	0
26758	6794	86	1.0000	1.0000	ml	0.0000	f	t	0
26759	6794	87	2.0000	2.0000	ml	0.0000	f	t	0
26760	6794	88	3.0000	3.0000	ml	0.0000	f	t	0
26761	6794	65	1.0000	1.0000	ml	0.0000	f	t	0
24576	6201	80	10.0000	10.0000	ml	25.0000	f	t	0
24577	6201	81	20.0000	20.0000	ml	50.0000	f	t	0
24578	6201	82	30.0000	30.0000	ml	75.0000	f	t	0
24579	6201	86	1.0000	1.0000	ml	0.0000	f	t	0
24580	6201	87	2.0000	2.0000	ml	0.0000	f	t	0
24581	6201	88	3.0000	3.0000	ml	0.0000	f	t	0
24582	6201	65	1.0000	1.0000	ml	0.0000	f	t	0
24583	6201	66	2.0000	2.0000	ml	0.0000	f	t	0
24584	6201	67	3.0000	3.0000	ml	0.0000	f	t	0
24585	6201	83	10.0000	10.0000	ml	0.0000	f	t	0
24586	6201	84	20.0000	20.0000	ml	0.0000	f	t	0
24587	6201	85	30.0000	30.0000	ml	0.0000	f	t	0
24588	6202	62	10.0000	10.0000	ml	0.0000	t	t	0
24589	6202	63	20.0000	20.0000	ml	35.0000	f	t	0
24590	6202	64	30.0000	30.0000	ml	70.0000	f	t	0
24591	6203	49	15.0000	15.0000	ml	0.0000	f	t	0
24592	6203	50	30.0000	30.0000	ml	0.0000	t	t	0
24593	6203	51	45.0000	45.0000	ml	55.0000	f	t	0
24594	6204	113	30.0000	30.0000	ml	0.0000	t	t	0
24595	6205	34	18.0000	18.0000	ml	0.0000	f	t	0
24596	6205	35	18.0000	36.0000	ml	0.0000	t	t	0
24597	6205	36	36.0000	54.0000	ml	65.0000	f	t	0
24598	6205	37	18.0000	18.0000	ml	0.0000	f	t	0
24599	6205	38	18.0000	36.0000	ml	0.0000	t	t	0
24600	6205	39	36.0000	54.0000	ml	65.0000	f	t	0
24601	6206	76	170.0000	170.0000	ml	0.0000	f	t	0
24602	6206	77	190.0000	190.0000	ml	0.0000	t	t	0
24603	6206	78	210.0000	210.0000	ml	0.0000	f	t	0
26111	6635	76	120.0000	120.0000	ml	0.0000	f	t	0
26112	6635	77	140.0000	140.0000	ml	0.0000	t	t	0
26113	6635	78	160.0000	160.0000	ml	0.0000	f	t	0
26762	6794	66	2.0000	2.0000	ml	0.0000	f	t	0
26763	6794	67	3.0000	3.0000	ml	0.0000	f	t	0
26764	6794	83	10.0000	10.0000	ml	0.0000	f	t	0
26765	6794	84	20.0000	20.0000	ml	0.0000	f	t	0
26766	6794	85	30.0000	30.0000	ml	0.0000	f	t	0
27406	6995	132	15.0000	15.0000	ml	0.0000	f	t	0
27407	6995	133	30.0000	30.0000	ml	0.0000	t	t	0
27408	6995	134	45.0000	45.0000	ml	55.0000	f	t	0
27409	6996	76	160.0000	160.0000	ml	0.0000	f	t	0
27410	6996	77	180.0000	180.0000	ml	0.0000	t	t	0
27411	6996	78	200.0000	200.0000	ml	0.0000	f	t	0
26767	6796	80	10.0000	10.0000	ml	25.0000	f	t	0
26768	6796	81	20.0000	20.0000	ml	50.0000	f	t	0
26769	6796	82	30.0000	30.0000	ml	75.0000	f	t	0
26770	6796	86	1.0000	1.0000	ml	0.0000	f	t	0
26771	6796	87	2.0000	2.0000	ml	0.0000	f	t	0
26772	6796	88	3.0000	3.0000	ml	0.0000	f	t	0
26114	6638	80	10.0000	10.0000	ml	25.0000	f	t	0
26115	6638	81	20.0000	20.0000	ml	50.0000	f	t	0
26116	6638	82	30.0000	30.0000	ml	75.0000	f	t	0
27318	6954	121	3.0000	70.0000	ml	0.0000	f	t	0
27319	6955	80	10.0000	10.0000	ml	25.0000	f	t	0
26117	6638	86	1.0000	1.0000	ml	0.0000	f	t	0
26118	6638	87	2.0000	2.0000	ml	0.0000	f	t	0
26119	6638	88	3.0000	3.0000	ml	0.0000	f	t	0
26120	6638	65	1.0000	1.0000	ml	0.0000	f	t	0
26121	6638	66	2.0000	2.0000	ml	0.0000	f	t	0
26122	6638	67	3.0000	3.0000	ml	0.0000	f	t	0
26123	6638	83	10.0000	10.0000	ml	0.0000	f	t	0
26124	6638	84	20.0000	20.0000	ml	0.0000	f	t	0
26125	6638	85	30.0000	30.0000	ml	0.0000	f	t	0
26773	6796	65	1.0000	1.0000	ml	0.0000	f	t	0
26774	6796	66	2.0000	2.0000	ml	0.0000	f	t	0
26775	6796	67	3.0000	3.0000	ml	0.0000	f	t	0
26776	6796	83	10.0000	10.0000	ml	0.0000	f	t	0
26777	6796	84	20.0000	20.0000	ml	0.0000	f	t	0
26778	6796	85	30.0000	30.0000	ml	0.0000	f	t	0
25509	6485	80	10.0000	10.0000	ml	25.0000	f	t	0
25510	6485	81	20.0000	20.0000	ml	50.0000	f	t	0
25511	6485	82	30.0000	30.0000	ml	75.0000	f	t	0
25512	6485	86	1.0000	1.0000	ml	0.0000	f	t	0
25513	6485	87	2.0000	2.0000	ml	0.0000	f	t	0
25514	6485	88	3.0000	3.0000	ml	0.0000	f	t	0
25515	6485	65	1.0000	1.0000	ml	0.0000	f	t	0
25516	6485	66	2.0000	2.0000	ml	0.0000	f	t	0
25517	6485	67	3.0000	3.0000	ml	0.0000	f	t	0
25518	6485	83	10.0000	10.0000	ml	0.0000	f	t	0
25519	6485	84	20.0000	20.0000	ml	0.0000	f	t	0
25520	6485	85	30.0000	30.0000	ml	0.0000	f	t	0
26779	6797	49	15.0000	15.0000	ml	0.0000	f	t	0
26780	6797	50	30.0000	30.0000	ml	0.0000	t	t	0
26781	6797	51	45.0000	45.0000	ml	55.0000	f	t	0
26782	6798	55	10.0000	10.0000	ml	35.0000	f	t	0
26783	6798	56	20.0000	20.0000	ml	70.0000	f	t	0
26784	6798	57	30.0000	30.0000	ml	105.0000	f	t	0
26785	6798	58	10.0000	10.0000	ml	35.0000	f	t	0
26786	6798	59	20.0000	20.0000	ml	70.0000	f	t	0
27320	6955	81	20.0000	20.0000	ml	50.0000	f	t	0
27321	6955	82	30.0000	30.0000	ml	75.0000	f	t	0
27322	6955	86	1.0000	1.0000	ml	0.0000	f	t	0
27323	6955	87	2.0000	2.0000	ml	0.0000	f	t	0
27324	6955	88	3.0000	3.0000	ml	0.0000	f	t	0
27325	6955	65	1.0000	1.0000	ml	0.0000	f	t	0
27326	6955	66	2.0000	2.0000	ml	0.0000	f	t	0
27327	6955	67	3.0000	3.0000	ml	0.0000	f	t	0
26787	6798	61	30.0000	30.0000	ml	105.0000	f	t	0
27328	6955	83	10.0000	10.0000	ml	0.0000	f	t	0
27329	6955	84	20.0000	20.0000	ml	0.0000	f	t	0
26788	6798	62	10.0000	10.0000	ml	35.0000	f	t	0
26789	6798	63	20.0000	20.0000	ml	70.0000	f	t	0
26790	6798	64	30.0000	30.0000	ml	105.0000	f	t	0
26794	6799	34	18.0000	18.0000	ml	0.0000	f	t	0
26795	6799	35	18.0000	36.0000	ml	0.0000	t	t	0
26796	6799	36	36.0000	54.0000	ml	65.0000	f	t	0
26797	6799	37	18.0000	18.0000	ml	0.0000	f	t	0
26798	6799	38	18.0000	36.0000	ml	0.0000	t	t	0
26799	6799	39	36.0000	54.0000	ml	65.0000	f	t	0
26800	6800	76	170.0000	170.0000	ml	0.0000	f	t	0
26801	6800	77	190.0000	190.0000	ml	0.0000	t	t	0
26802	6800	78	210.0000	210.0000	ml	0.0000	f	t	0
27330	6955	85	30.0000	30.0000	ml	0.0000	f	t	0
27331	6956	117	40.0000	40.0000	ml	0.0000	f	t	0
27332	6956	118	50.0000	50.0000	ml	0.0000	t	t	0
27333	6956	119	60.0000	60.0000	ml	55.0000	f	t	0
27334	6957	76	170.0000	170.0000	ml	0.0000	f	t	0
27335	6957	77	190.0000	190.0000	ml	0.0000	t	t	0
27336	6957	78	210.0000	210.0000	ml	0.0000	f	t	0
25521	6486	55	10.0000	10.0000	ml	0.0000	t	t	0
25522	6486	56	20.0000	20.0000	ml	35.0000	f	t	0
25523	6486	57	30.0000	30.0000	ml	70.0000	f	t	0
25524	6486	58	10.0000	10.0000	ml	0.0000	t	t	0
25525	6486	59	20.0000	20.0000	ml	35.0000	f	t	0
25526	6486	61	30.0000	30.0000	ml	70.0000	f	t	0
25527	6486	62	10.0000	10.0000	ml	0.0000	t	t	0
25528	6486	63	20.0000	20.0000	ml	35.0000	f	t	0
25529	6486	64	30.0000	30.0000	ml	70.0000	f	t	0
25530	6487	34	18.0000	36.0000	ml	0.0000	f	t	0
25531	6487	35	18.0000	36.0000	ml	0.0000	t	t	0
27412	6999	80	10.0000	10.0000	ml	25.0000	f	t	0
27413	6999	81	20.0000	20.0000	ml	50.0000	f	t	0
27414	6999	82	30.0000	30.0000	ml	75.0000	f	t	0
27415	6999	86	1.0000	1.0000	ml	0.0000	f	t	0
27416	6999	87	2.0000	2.0000	ml	0.0000	f	t	0
27417	6999	88	3.0000	3.0000	ml	0.0000	f	t	0
27418	6999	65	1.0000	1.0000	ml	0.0000	f	t	0
27419	6999	66	2.0000	2.0000	ml	0.0000	f	t	0
27420	6999	67	3.0000	3.0000	ml	0.0000	f	t	0
25532	6487	36	36.0000	54.0000	ml	65.0000	f	t	0
25533	6487	37	18.0000	18.0000	ml	0.0000	f	t	0
25534	6487	38	18.0000	36.0000	ml	0.0000	t	t	0
25535	6487	39	36.0000	54.0000	ml	65.0000	f	t	0
25865	6579	76	110.0000	110.0000	ml	0.0000	f	t	0
25866	6579	77	130.0000	130.0000	ml	0.0000	t	t	0
25867	6579	78	150.0000	150.0000	ml	0.0000	f	t	0
25868	6580	34	18.0000	18.0000	ml	0.0000	f	t	0
25869	6580	35	18.0000	36.0000	ml	0.0000	t	t	0
27421	6999	83	10.0000	10.0000	ml	0.0000	f	t	0
27422	6999	84	20.0000	20.0000	ml	0.0000	f	t	0
27423	6999	85	30.0000	30.0000	ml	0.0000	f	t	0
25870	6580	36	36.0000	54.0000	ml	65.0000	f	t	0
25871	6580	37	18.0000	18.0000	ml	0.0000	f	t	0
25872	6580	38	18.0000	36.0000	ml	0.0000	t	t	0
27424	7000	58	10.0000	10.0000	ml	35.0000	f	t	0
27425	7000	59	20.0000	20.0000	ml	70.0000	f	t	0
27426	7000	61	30.0000	30.0000	ml	105.0000	f	t	0
25873	6580	39	36.0000	54.0000	ml	65.0000	f	t	0
26126	6639	55	10.0000	10.0000	ml	35.0000	f	t	0
26127	6639	56	20.0000	20.0000	ml	70.0000	f	t	0
26128	6639	57	30.0000	30.0000	ml	105.0000	f	t	0
26129	6639	58	10.0000	10.0000	ml	35.0000	f	t	0
26130	6639	59	20.0000	20.0000	ml	70.0000	f	t	0
26131	6639	61	30.0000	30.0000	ml	105.0000	f	t	0
26132	6639	62	10.0000	10.0000	ml	35.0000	f	t	0
26133	6639	63	20.0000	20.0000	ml	70.0000	f	t	0
26134	6639	64	30.0000	30.0000	ml	105.0000	f	t	0
27427	7000	62	10.0000	10.0000	ml	35.0000	f	t	0
27428	7000	63	20.0000	20.0000	ml	70.0000	f	t	0
27429	7000	64	30.0000	30.0000	ml	105.0000	f	t	0
26138	6640	34	18.0000	18.0000	ml	0.0000	f	t	0
26139	6640	35	18.0000	36.0000	ml	0.0000	t	t	0
26140	6640	36	36.0000	54.0000	ml	65.0000	f	t	0
27430	7000	141	10.0000	10.0000	ml	35.0000	f	t	0
27431	7000	142	20.0000	20.0000	ml	70.0000	f	t	0
27432	7000	143	30.0000	30.0000	ml	105.0000	f	t	0
26141	6640	37	18.0000	18.0000	ml	0.0000	f	t	0
26142	6640	38	18.0000	36.0000	ml	0.0000	t	t	0
27433	7000	55	10.0000	10.0000	ml	0.0000	f	t	0
26143	6640	39	36.0000	54.0000	ml	65.0000	f	t	0
26144	6641	76	170.0000	170.0000	ml	0.0000	f	t	0
26145	6641	77	190.0000	190.0000	ml	0.0000	t	t	0
26146	6641	78	210.0000	210.0000	ml	0.0000	f	t	0
27434	7000	56	20.0000	20.0000	ml	35.0000	f	t	0
27435	7000	57	30.0000	30.0000	ml	70.0000	f	t	0
27439	7001	92	45.0000	45.0000	ml	0.0000	t	t	0
27440	7004	80	10.0000	10.0000	ml	25.0000	f	t	0
27441	7004	81	20.0000	20.0000	ml	50.0000	f	t	0
27442	7004	82	30.0000	30.0000	ml	75.0000	f	t	0
27443	7004	86	1.0000	1.0000	ml	0.0000	f	t	0
25874	6581	80	10.0000	10.0000	ml	25.0000	f	t	0
25875	6581	81	20.0000	20.0000	ml	50.0000	f	t	0
25876	6581	82	30.0000	30.0000	ml	75.0000	f	t	0
25877	6581	86	1.0000	1.0000	ml	0.0000	f	t	0
27444	7004	87	2.0000	2.0000	ml	0.0000	f	t	0
27445	7004	88	3.0000	3.0000	ml	0.0000	f	t	0
27446	7004	65	1.0000	1.0000	ml	0.0000	f	t	0
27447	7004	66	2.0000	2.0000	ml	0.0000	f	t	0
27448	7004	67	3.0000	3.0000	ml	0.0000	f	t	0
27449	7004	83	10.0000	10.0000	ml	0.0000	f	t	0
27450	7004	84	20.0000	20.0000	ml	0.0000	f	t	0
27451	7004	85	30.0000	30.0000	ml	0.0000	f	t	0
27452	7005	121	3.0000	70.0000	ml	0.0000	t	t	0
25536	6491	80	10.0000	10.0000	ml	25.0000	f	t	0
25537	6491	81	20.0000	20.0000	ml	50.0000	f	t	0
25538	6491	82	30.0000	30.0000	ml	75.0000	f	t	0
25539	6491	86	1.0000	1.0000	ml	0.0000	f	t	0
25540	6491	87	2.0000	2.0000	ml	0.0000	f	t	0
25541	6491	88	3.0000	3.0000	ml	0.0000	f	t	0
25542	6491	65	1.0000	1.0000	ml	0.0000	f	t	0
25543	6491	66	2.0000	2.0000	ml	0.0000	f	t	0
25544	6491	67	3.0000	3.0000	ml	0.0000	f	t	0
25545	6491	83	10.0000	10.0000	ml	0.0000	f	t	0
25546	6491	84	20.0000	20.0000	ml	0.0000	f	t	0
25547	6491	85	30.0000	30.0000	ml	0.0000	f	t	0
25548	6492	99	15.0000	15.0000	ml	0.0000	f	t	0
25549	6492	100	30.0000	30.0000	ml	0.0000	t	t	0
25550	6492	101	45.0000	45.0000	ml	55.0000	f	t	0
25551	6493	34	18.0000	18.0000	ml	0.0000	f	t	0
25552	6493	35	18.0000	36.0000	ml	0.0000	t	t	0
25553	6493	36	36.0000	54.0000	ml	65.0000	f	t	0
25554	6493	37	18.0000	18.0000	ml	0.0000	f	t	0
25878	6581	87	2.0000	2.0000	ml	0.0000	f	t	0
25879	6581	88	3.0000	3.0000	ml	0.0000	f	t	0
25880	6581	65	1.0000	1.0000	ml	0.0000	f	t	0
25881	6581	66	2.0000	2.0000	ml	0.0000	f	t	0
25882	6581	67	3.0000	3.0000	ml	0.0000	f	t	0
25883	6581	83	10.0000	10.0000	ml	0.0000	f	t	0
25884	6581	84	20.0000	20.0000	ml	0.0000	f	t	0
25885	6581	85	30.0000	30.0000	ml	0.0000	f	t	0
25886	6582	55	10.0000	10.0000	ml	35.0000	f	t	0
25887	6582	56	20.0000	20.0000	ml	70.0000	f	t	0
25888	6582	57	30.0000	30.0000	ml	105.0000	f	t	0
25889	6582	58	10.0000	10.0000	ml	35.0000	f	t	0
25890	6582	59	20.0000	20.0000	ml	70.0000	f	t	0
25891	6582	61	30.0000	30.0000	ml	105.0000	f	t	0
25892	6582	62	10.0000	10.0000	ml	35.0000	f	t	0
12638	3209	107	30.0000	30.0000	ml	0.0000	t	t	0
12639	3209	106	15.0000	15.0000	ml	0.0000	f	t	0
12640	3209	108	45.0000	45.0000	ml	55.0000	f	t	0
12641	3210	76	160.0000	160.0000	ml	0.0000	f	t	0
12642	3210	77	180.0000	180.0000	ml	0.0000	t	t	0
12643	3210	78	200.0000	200.0000	ml	0.0000	f	t	0
12644	3212	123	5.0000	5.0000	ml	0.0000	f	f	0
25893	6582	63	20.0000	20.0000	ml	70.0000	f	t	0
25894	6582	64	30.0000	30.0000	ml	105.0000	f	t	0
25895	6583	34	18.0000	18.0000	ml	0.0000	f	t	0
25896	6583	35	18.0000	36.0000	ml	0.0000	t	t	0
25897	6583	36	36.0000	54.0000	ml	65.0000	f	t	0
25898	6583	37	18.0000	18.0000	ml	0.0000	f	t	0
25899	6583	38	18.0000	36.0000	ml	0.0000	t	t	0
25900	6583	39	36.0000	54.0000	ml	65.0000	f	t	0
25901	6585	76	130.0000	130.0000	ml	0.0000	f	t	0
25902	6585	77	150.0000	150.0000	ml	0.0000	t	t	0
25903	6585	78	170.0000	170.0000	ml	0.0000	f	t	0
26147	6644	80	10.0000	10.0000	ml	25.0000	f	t	0
26148	6644	81	20.0000	20.0000	ml	50.0000	f	t	0
26149	6644	82	30.0000	30.0000	ml	75.0000	f	t	0
26150	6644	86	1.0000	1.0000	ml	0.0000	f	t	0
26151	6644	87	2.0000	2.0000	ml	0.0000	f	t	0
26152	6644	88	3.0000	3.0000	ml	0.0000	f	t	0
26153	6644	65	1.0000	1.0000	ml	0.0000	f	t	0
26154	6644	66	2.0000	2.0000	ml	0.0000	f	t	0
26155	6644	67	3.0000	3.0000	ml	0.0000	f	t	0
26156	6644	83	10.0000	10.0000	ml	0.0000	f	t	0
26157	6644	84	20.0000	20.0000	ml	0.0000	f	t	0
26158	6644	85	30.0000	30.0000	ml	0.0000	f	t	0
26159	6645	89	15.0000	15.0000	ml	0.0000	t	t	0
26160	6645	90	30.0000	30.0000	ml	55.0000	f	t	0
26161	6645	91	45.0000	45.0000	ml	110.0000	f	t	0
26162	6646	55	15.0000	15.0000	ml	0.0000	t	t	0
27453	7009	76	0.0000	0.0000	ml	0.0000	f	t	0
27454	7009	77	190.0000	190.0000	ml	0.0000	t	t	0
27455	7009	78	0.0000	0.0000	ml	0.0000	f	t	0
25555	6493	38	18.0000	36.0000	ml	0.0000	t	t	0
25556	6493	39	36.0000	54.0000	ml	65.0000	f	t	0
25775	6551	80	10.0000	10.0000	ml	25.0000	f	t	0
25776	6551	81	20.0000	20.0000	ml	50.0000	f	t	0
25777	6551	82	30.0000	30.0000	ml	75.0000	f	t	0
25778	6551	86	1.0000	1.0000	ml	0.0000	f	t	0
25779	6551	87	2.0000	2.0000	ml	0.0000	f	t	0
25780	6551	88	3.0000	3.0000	ml	0.0000	f	t	0
25781	6551	65	1.0000	1.0000	ml	0.0000	f	t	0
25782	6551	66	2.0000	2.0000	ml	0.0000	f	t	0
25783	6551	67	3.0000	3.0000	ml	0.0000	f	t	0
25784	6551	83	10.0000	10.0000	ml	0.0000	f	t	0
25785	6551	84	20.0000	20.0000	ml	0.0000	f	t	0
25786	6551	85	30.0000	30.0000	ml	0.0000	f	t	0
25787	6552	55	10.0000	10.0000	ml	35.0000	f	t	0
25788	6552	56	20.0000	20.0000	ml	70.0000	f	t	0
25789	6552	57	30.0000	30.0000	ml	105.0000	f	t	0
25790	6552	58	10.0000	10.0000	ml	35.0000	f	t	0
25791	6552	59	20.0000	20.0000	ml	70.0000	f	t	0
25792	6552	61	30.0000	30.0000	ml	105.0000	f	t	0
25793	6552	62	10.0000	10.0000	ml	35.0000	f	t	0
25794	6552	63	20.0000	20.0000	ml	70.0000	f	t	0
25795	6552	64	30.0000	30.0000	ml	105.0000	f	t	0
25796	6553	52	15.0000	15.0000	ml	0.0000	f	t	0
25797	6553	53	30.0000	30.0000	ml	0.0000	t	t	0
25798	6553	54	45.0000	45.0000	ml	55.0000	f	t	0
25799	6554	34	18.0000	18.0000	ml	0.0000	f	t	0
25800	6554	35	18.0000	36.0000	ml	0.0000	t	t	0
25801	6554	36	36.0000	54.0000	ml	65.0000	f	t	0
25802	6554	37	18.0000	18.0000	ml	0.0000	f	t	0
25803	6554	38	18.0000	36.0000	ml	0.0000	t	t	0
25804	6554	39	36.0000	54.0000	ml	65.0000	f	t	0
27216	6908	80	10.0000	10.0000	ml	25.0000	f	t	0
27217	6908	81	20.0000	20.0000	ml	50.0000	f	t	0
27218	6908	82	30.0000	30.0000	ml	75.0000	f	t	0
27219	6908	86	1.0000	1.0000	ml	0.0000	f	t	0
27220	6908	87	2.0000	2.0000	ml	0.0000	f	t	0
27221	6908	88	3.0000	3.0000	ml	0.0000	f	t	0
27222	6908	65	1.0000	1.0000	ml	0.0000	f	t	0
27223	6908	66	2.0000	2.0000	ml	0.0000	f	t	0
27224	6908	67	3.0000	3.0000	ml	0.0000	f	t	0
27225	6908	83	10.0000	10.0000	ml	0.0000	f	t	0
27226	6908	84	20.0000	20.0000	ml	0.0000	f	t	0
27227	6908	85	30.0000	30.0000	ml	0.0000	f	t	0
27228	6909	55	10.0000	10.0000	ml	35.0000	f	t	0
27229	6909	56	20.0000	20.0000	ml	70.0000	f	t	0
27230	6909	57	30.0000	30.0000	ml	105.0000	f	t	0
27231	6909	58	10.0000	10.0000	ml	35.0000	f	t	0
27232	6909	59	20.0000	20.0000	ml	70.0000	f	t	0
27233	6909	61	30.0000	30.0000	ml	105.0000	f	t	0
27234	6909	62	10.0000	10.0000	ml	35.0000	f	t	0
27235	6909	63	20.0000	20.0000	ml	70.0000	f	t	0
27236	6909	64	30.0000	30.0000	ml	105.0000	f	t	0
27237	6910	52	15.0000	15.0000	ml	0.0000	f	t	0
27238	6910	53	30.0000	30.0000	ml	0.0000	t	t	0
27239	6910	54	45.0000	45.0000	ml	0.0000	f	t	0
27240	6911	113	30.0000	30.0000	ml	0.0000	f	t	0
27241	6912	34	18.0000	18.0000	ml	0.0000	f	t	0
27242	6912	35	18.0000	36.0000	ml	0.0000	f	t	0
27243	6912	36	36.0000	54.0000	ml	65.0000	f	t	0
27244	6912	37	18.0000	18.0000	ml	0.0000	f	t	0
27245	6912	38	18.0000	36.0000	ml	0.0000	f	t	0
27246	6912	39	36.0000	54.0000	ml	65.0000	f	t	0
27247	6913	76	170.0000	170.0000	ml	0.0000	f	t	0
27248	6913	77	190.0000	190.0000	ml	0.0000	t	t	0
27249	6913	78	150.0000	150.0000	ml	0.0000	f	t	0
24875	6292	80	10.0000	10.0000	ml	25.0000	f	t	0
24876	6292	81	20.0000	20.0000	ml	50.0000	f	t	0
24877	6292	82	30.0000	30.0000	ml	75.0000	f	t	0
24878	6292	86	1.0000	1.0000	ml	0.0000	f	t	0
24879	6292	87	2.0000	2.0000	ml	0.0000	f	t	0
24880	6292	88	3.0000	3.0000	ml	0.0000	f	t	0
24881	6292	65	1.0000	1.0000	ml	0.0000	f	t	0
24882	6292	66	2.0000	2.0000	ml	0.0000	f	t	0
24883	6292	67	3.0000	3.0000	ml	0.0000	f	t	0
24884	6292	83	10.0000	10.0000	ml	0.0000	f	t	0
24885	6292	84	20.0000	20.0000	ml	0.0000	f	t	0
24886	6292	85	30.0000	30.0000	ml	0.0000	f	t	0
24887	6293	55	10.0000	10.0000	ml	0.0000	t	t	0
24888	6293	56	20.0000	20.0000	ml	35.0000	f	t	0
24889	6293	57	30.0000	30.0000	ml	70.0000	f	t	0
24890	6293	58	10.0000	10.0000	ml	0.0000	t	t	0
24891	6293	59	20.0000	20.0000	ml	35.0000	f	t	0
24892	6293	61	30.0000	30.0000	ml	70.0000	f	t	0
24893	6293	62	10.0000	10.0000	ml	0.0000	t	t	0
24894	6293	63	20.0000	20.0000	ml	35.0000	f	t	0
24895	6293	64	30.0000	30.0000	ml	70.0000	f	t	0
24896	6294	89	15.0000	15.0000	ml	0.0000	t	t	0
19668	4875	80	10.0000	10.0000	ml	25.0000	f	t	0
19669	4875	81	20.0000	20.0000	ml	50.0000	f	t	0
19670	4875	82	30.0000	30.0000	ml	75.0000	f	t	0
19671	4875	86	1.0000	1.0000	ml	0.0000	f	t	0
19672	4875	87	2.0000	2.0000	ml	0.0000	f	t	0
19673	4875	88	3.0000	3.0000	ml	0.0000	f	t	0
19674	4875	65	1.0000	1.0000	ml	0.0000	f	t	0
19675	4875	66	2.0000	2.0000	ml	0.0000	f	t	0
19676	4875	67	3.0000	3.0000	ml	0.0000	f	t	0
19677	4875	83	10.0000	10.0000	ml	0.0000	f	t	0
19678	4875	84	20.0000	20.0000	ml	0.0000	f	t	0
19679	4875	85	30.0000	30.0000	ml	0.0000	f	t	0
26353	6696	80	10.0000	10.0000	ml	25.0000	f	t	0
27250	6916	129	30.0000	30.0000	ml	0.0000	f	t	0
27251	6916	130	50.0000	50.0000	ml	0.0000	t	t	0
27252	6916	131	60.0000	60.0000	ml	55.0000	f	t	0
27253	6918	113	30.0000	30.0000	ml	0.0000	t	t	0
27254	6919	76	160.0000	160.0000	ml	0.0000	f	t	0
27255	6919	77	180.0000	180.0000	ml	0.0000	t	t	0
27256	6919	78	200.0000	200.0000	ml	0.0000	f	t	0
26354	6696	81	20.0000	20.0000	ml	50.0000	f	t	0
26355	6696	82	30.0000	30.0000	ml	75.0000	f	t	0
24897	6294	90	30.0000	30.0000	ml	55.0000	f	t	0
24898	6294	91	45.0000	45.0000	ml	110.0000	f	t	0
24899	6295	34	18.0000	18.0000	ml	0.0000	f	t	0
24900	6295	35	18.0000	36.0000	ml	0.0000	t	t	0
24901	6295	36	36.0000	54.0000	ml	65.0000	f	t	0
24902	6295	37	18.0000	18.0000	ml	0.0000	f	t	0
24903	6295	38	18.0000	36.0000	ml	0.0000	t	t	0
24904	6295	39	36.0000	54.0000	ml	65.0000	f	t	0
26356	6696	86	1.0000	1.0000	ml	0.0000	f	t	0
26357	6696	87	2.0000	2.0000	ml	0.0000	f	t	0
26358	6696	88	3.0000	3.0000	ml	0.0000	f	t	0
26359	6696	65	1.0000	1.0000	ml	0.0000	f	t	0
26360	6696	66	2.0000	2.0000	ml	0.0000	f	t	0
26361	6696	67	3.0000	3.0000	ml	0.0000	f	t	0
26362	6696	83	10.0000	10.0000	ml	0.0000	f	t	0
26363	6696	84	20.0000	20.0000	ml	0.0000	f	t	0
26364	6696	85	30.0000	30.0000	ml	0.0000	f	t	0
26365	6697	55	10.0000	10.0000	ml	35.0000	f	t	0
26366	6697	56	20.0000	20.0000	ml	70.0000	f	t	0
26367	6697	57	30.0000	30.0000	ml	105.0000	f	t	0
26368	6697	58	10.0000	10.0000	ml	35.0000	f	t	0
26369	6697	59	20.0000	20.0000	ml	70.0000	f	t	0
26370	6697	61	30.0000	30.0000	ml	105.0000	f	t	0
25296	6433	80	10.0000	10.0000	ml	25.0000	f	t	0
25297	6433	81	20.0000	20.0000	ml	50.0000	f	t	0
25298	6433	82	30.0000	30.0000	ml	75.0000	f	t	0
25299	6433	86	1.0000	1.0000	ml	0.0000	f	t	0
25300	6433	87	2.0000	2.0000	ml	0.0000	f	t	0
25301	6433	88	3.0000	3.0000	ml	0.0000	f	t	0
25302	6433	65	1.0000	1.0000	ml	0.0000	f	t	0
25303	6433	66	2.0000	2.0000	ml	0.0000	f	t	0
25304	6433	67	3.0000	3.0000	ml	0.0000	f	t	0
25305	6433	83	10.0000	10.0000	ml	0.0000	f	t	0
25306	6433	84	20.0000	20.0000	ml	0.0000	f	t	0
25307	6433	85	30.0000	30.0000	ml	0.0000	f	t	0
25308	6434	37	18.0000	18.0000	ml	0.0000	f	t	0
25309	6434	38	18.0000	36.0000	ml	0.0000	t	t	0
25310	6434	39	36.0000	54.0000	ml	65.0000	f	t	0
25311	6434	34	18.0000	18.0000	ml	0.0000	f	t	0
25312	6434	35	18.0000	36.0000	ml	0.0000	t	t	0
25313	6434	36	36.0000	54.0000	ml	65.0000	f	t	0
25314	6436	55	10.0000	10.0000	ml	35.0000	f	t	0
25315	6436	56	20.0000	20.0000	ml	70.0000	f	t	0
25316	6436	57	30.0000	30.0000	ml	105.0000	f	t	0
25317	6436	58	10.0000	10.0000	ml	35.0000	f	t	0
25318	6436	59	20.0000	20.0000	ml	70.0000	f	t	0
25319	6436	61	30.0000	30.0000	ml	105.0000	f	t	0
25320	6436	62	10.0000	10.0000	ml	35.0000	f	t	0
25321	6436	63	20.0000	20.0000	ml	70.0000	f	t	0
25322	6436	64	30.0000	30.0000	ml	105.0000	f	t	0
26371	6697	62	10.0000	10.0000	ml	35.0000	f	t	0
26372	6697	63	20.0000	20.0000	ml	70.0000	f	t	0
26373	6697	64	30.0000	30.0000	ml	105.0000	f	t	0
12717	3280	133	30.0000	30.0000	ml	0.0000	t	t	0
12718	3280	132	15.0000	15.0000	ml	0.0000	f	t	0
12719	3280	134	45.0000	45.0000	ml	55.0000	f	t	0
12720	3281	76	140.0000	140.0000	ml	0.0000	f	t	0
12721	3281	77	160.0000	160.0000	ml	0.0000	t	t	0
12722	3281	78	180.0000	180.0000	ml	0.0000	f	t	0
26377	6698	52	30.0000	30.0000	ml	0.0000	f	t	0
26378	6698	53	40.0000	40.0000	ml	0.0000	t	t	0
26379	6698	54	50.0000	50.0000	ml	55.0000	f	t	0
26380	6699	34	18.0000	18.0000	ml	0.0000	f	t	0
26381	6699	35	18.0000	36.0000	ml	0.0000	t	t	0
26382	6699	36	36.0000	54.0000	ml	65.0000	f	t	0
26383	6699	37	18.0000	18.0000	ml	0.0000	f	t	0
26384	6699	38	18.0000	36.0000	ml	0.0000	t	t	0
26385	6699	39	36.0000	54.0000	ml	65.0000	f	t	0
26386	6700	76	170.0000	170.0000	ml	0.0000	f	t	0
26387	6700	77	190.0000	190.0000	ml	0.0000	t	t	0
26388	6700	78	210.0000	210.0000	ml	0.0000	f	t	0
26163	6646	56	25.0000	25.0000	ml	35.0000	f	t	0
26164	6646	57	35.0000	35.0000	ml	70.0000	f	t	0
26165	6647	34	18.0000	18.0000	ml	0.0000	f	t	0
26166	6647	35	18.0000	36.0000	ml	0.0000	t	t	0
26167	6647	36	36.0000	54.0000	ml	65.0000	f	t	0
26168	6647	37	18.0000	18.0000	ml	0.0000	f	t	0
26169	6647	38	18.0000	36.0000	ml	0.0000	t	t	0
26170	6647	39	36.0000	54.0000	ml	65.0000	f	t	0
26171	6648	76	160.0000	160.0000	ml	0.0000	f	t	0
26172	6648	77	180.0000	180.0000	ml	0.0000	t	t	0
26173	6648	78	200.0000	200.0000	ml	0.0000	f	t	0
25931	6595	80	10.0000	10.0000	ml	25.0000	f	t	0
25932	6595	81	20.0000	20.0000	ml	50.0000	f	t	0
25933	6595	82	30.0000	30.0000	ml	75.0000	f	t	0
25934	6595	86	1.0000	1.0000	ml	0.0000	f	t	0
25935	6595	87	2.0000	2.0000	ml	0.0000	f	t	0
25936	6595	88	3.0000	3.0000	ml	0.0000	f	t	0
25937	6595	65	1.0000	1.0000	ml	0.0000	f	t	0
25938	6595	66	2.0000	2.0000	ml	0.0000	f	t	0
25939	6595	67	3.0000	3.0000	ml	0.0000	f	t	0
25940	6595	83	10.0000	10.0000	ml	0.0000	f	t	0
25941	6595	84	20.0000	20.0000	ml	0.0000	f	t	0
25942	6595	85	30.0000	30.0000	ml	0.0000	f	t	0
25943	6596	73	10.0000	10.0000	ml	0.0000	f	t	0
25944	6596	74	20.0000	20.0000	ml	0.0000	t	t	0
25945	6596	75	30.0000	30.0000	ml	55.0000	f	t	0
26389	6703	80	10.0000	10.0000	ml	25.0000	f	t	0
26390	6703	81	20.0000	20.0000	ml	50.0000	f	t	0
26391	6703	82	30.0000	30.0000	ml	75.0000	f	t	0
26392	6703	86	1.0000	1.0000	ml	0.0000	f	t	0
26393	6703	87	2.0000	2.0000	ml	0.0000	f	t	0
26394	6703	88	3.0000	3.0000	ml	0.0000	f	t	0
26395	6703	65	1.0000	1.0000	ml	0.0000	f	t	0
25584	6503	80	10.0000	10.0000	ml	25.0000	f	t	0
25585	6503	81	20.0000	20.0000	ml	50.0000	f	t	0
25586	6503	82	30.0000	30.0000	ml	75.0000	f	t	0
25587	6503	86	1.0000	1.0000	ml	0.0000	f	t	0
25588	6503	87	2.0000	2.0000	ml	0.0000	f	t	0
25589	6503	88	3.0000	3.0000	ml	0.0000	f	t	0
25590	6503	65	1.0000	1.0000	ml	0.0000	f	t	0
25591	6503	66	2.0000	2.0000	ml	0.0000	f	t	0
26885	6827	80	10.0000	10.0000	ml	25.0000	f	t	0
26886	6827	81	20.0000	20.0000	ml	50.0000	f	t	0
26887	6827	82	30.0000	30.0000	ml	75.0000	f	t	0
26888	6827	86	1.0000	1.0000	ml	0.0000	f	t	0
26889	6827	87	2.0000	2.0000	ml	0.0000	f	t	0
25592	6503	67	3.0000	3.0000	ml	0.0000	f	t	0
25593	6503	83	10.0000	10.0000	ml	0.0000	f	t	0
25594	6503	84	20.0000	20.0000	ml	0.0000	f	t	0
25595	6503	85	30.0000	30.0000	ml	0.0000	f	t	0
25596	6504	55	10.0000	10.0000	ml	35.0000	f	t	0
25597	6504	56	20.0000	20.0000	ml	70.0000	f	t	0
25598	6504	57	30.0000	30.0000	ml	105.0000	f	t	0
25599	6504	58	10.0000	10.0000	ml	35.0000	f	t	0
25600	6504	59	20.0000	20.0000	ml	70.0000	f	t	0
25601	6504	61	30.0000	30.0000	ml	105.0000	f	t	0
25602	6504	62	10.0000	10.0000	ml	35.0000	f	t	0
25603	6504	63	20.0000	20.0000	ml	70.0000	f	t	0
25604	6504	64	30.0000	30.0000	ml	105.0000	f	t	0
25605	6505	34	18.0000	18.0000	ml	0.0000	f	t	0
25606	6505	35	18.0000	36.0000	ml	0.0000	t	t	0
25607	6505	36	36.0000	54.0000	ml	65.0000	f	t	0
25608	6505	37	18.0000	18.0000	ml	0.0000	f	t	0
25609	6505	38	18.0000	36.0000	ml	0.0000	t	t	0
25610	6505	39	36.0000	54.0000	ml	65.0000	f	t	0
25946	6597	55	10.0000	10.0000	ml	0.0000	t	t	0
25947	6597	56	20.0000	20.0000	ml	35.0000	f	t	0
25948	6597	57	30.0000	30.0000	ml	70.0000	f	t	0
25949	6598	34	18.0000	18.0000	ml	0.0000	f	t	0
25950	6598	35	18.0000	36.0000	ml	0.0000	t	t	0
25951	6598	36	36.0000	54.0000	ml	65.0000	f	t	0
25952	6598	37	18.0000	18.0000	ml	0.0000	f	t	0
25953	6598	38	18.0000	36.0000	ml	0.0000	t	t	0
25954	6598	39	36.0000	54.0000	ml	65.0000	f	t	0
25955	6599	76	170.0000	170.0000	ml	0.0000	f	t	0
25956	6599	77	190.0000	190.0000	ml	0.0000	t	t	0
25957	6599	78	210.0000	210.0000	ml	0.0000	f	t	0
26890	6827	88	3.0000	3.0000	ml	0.0000	f	t	0
26891	6827	65	1.0000	1.0000	ml	0.0000	f	t	0
26892	6827	66	2.0000	2.0000	ml	0.0000	f	t	0
26893	6827	67	3.0000	3.0000	ml	0.0000	f	t	0
26894	6827	83	10.0000	10.0000	ml	0.0000	f	t	0
26895	6827	84	20.0000	20.0000	ml	0.0000	f	t	0
12730	3290	107	30.0000	30.0000	ml	0.0000	t	t	0
12731	3290	106	15.0000	15.0000	ml	0.0000	f	t	0
12732	3290	108	45.0000	45.0000	ml	55.0000	f	t	0
12733	3291	76	110.0000	110.0000	ml	0.0000	f	t	0
12734	3291	77	130.0000	130.0000	ml	0.0000	f	t	0
12735	3291	78	150.0000	150.0000	ml	0.0000	f	t	0
12736	3293	123	5.0000	5.0000	ml	0.0000	f	t	0
26396	6703	66	2.0000	2.0000	ml	0.0000	f	t	0
26397	6703	67	3.0000	3.0000	ml	0.0000	f	t	0
26398	6703	83	10.0000	10.0000	ml	0.0000	f	t	0
26399	6703	84	20.0000	20.0000	ml	0.0000	f	t	0
26400	6703	85	30.0000	30.0000	ml	0.0000	f	t	0
26401	6704	62	10.0000	10.0000	ml	0.0000	t	t	0
26402	6704	63	20.0000	20.0000	ml	35.0000	f	t	0
26403	6704	64	30.0000	30.0000	ml	70.0000	f	t	0
26404	6705	52	15.0000	15.0000	ml	0.0000	f	t	0
26405	6705	53	30.0000	30.0000	ml	0.0000	t	t	0
26406	6705	54	45.0000	45.0000	ml	0.0000	f	t	0
26407	6706	34	18.0000	18.0000	ml	0.0000	f	t	0
26408	6706	35	18.0000	36.0000	ml	0.0000	t	t	0
26409	6706	36	36.0000	54.0000	ml	65.0000	f	t	0
26410	6706	37	18.0000	18.0000	ml	0.0000	f	t	0
26411	6706	38	18.0000	36.0000	ml	0.0000	t	t	0
26412	6706	39	36.0000	54.0000	ml	65.0000	f	t	0
26413	6707	76	170.0000	170.0000	ml	0.0000	f	t	0
26414	6707	77	190.0000	190.0000	ml	0.0000	t	t	0
26415	6707	78	210.0000	210.0000	ml	0.0000	f	t	0
25611	6510	37	18.0000	18.0000	ml	0.0000	f	t	0
25612	6510	38	18.0000	36.0000	ml	0.0000	t	t	0
25613	6510	39	36.0000	54.0000	ml	65.0000	f	t	0
25614	6510	34	18.0000	18.0000	ml	0.0000	f	t	0
25615	6510	35	18.0000	36.0000	ml	0.0000	t	t	0
25616	6510	36	36.0000	54.0000	ml	65.0000	f	t	0
26896	6827	85	30.0000	30.0000	ml	0.0000	f	t	0
26897	6828	89	15.0000	15.0000	ml	0.0000	f	t	0
26898	6828	90	25.0000	25.0000	ml	0.0000	t	t	0
26899	6828	91	35.0000	35.0000	ml	55.0000	f	t	0
26900	6829	113	25.0000	25.0000	ml	0.0000	t	t	0
26901	6830	34	18.0000	18.0000	ml	0.0000	f	t	0
25341	6442	37	18.0000	18.0000	ml	0.0000	f	t	0
25342	6442	38	18.0000	36.0000	ml	0.0000	t	t	0
25343	6442	39	36.0000	54.0000	ml	65.0000	f	t	0
25344	6442	34	18.0000	18.0000	ml	0.0000	f	t	0
25345	6442	35	18.0000	36.0000	ml	0.0000	t	t	0
25346	6442	36	36.0000	54.0000	ml	65.0000	f	t	0
25347	6443	55	10.0000	10.0000	ml	35.0000	f	t	0
25348	6443	56	20.0000	20.0000	ml	70.0000	f	t	0
26902	6830	35	18.0000	36.0000	ml	0.0000	t	t	0
26903	6830	36	36.0000	54.0000	ml	65.0000	f	t	0
26904	6830	37	18.0000	18.0000	ml	0.0000	f	t	0
26905	6830	38	18.0000	36.0000	ml	0.0000	t	t	0
26906	6830	39	36.0000	54.0000	ml	65.0000	f	t	0
26907	6831	76	150.0000	150.0000	ml	0.0000	f	t	0
26908	6831	77	170.0000	170.0000	ml	0.0000	t	t	0
26909	6831	78	190.0000	190.0000	ml	0.0000	f	t	0
26910	6834	73	5.0000	5.0000	ml	0.0000	t	t	0
26911	6834	74	30.0000	30.0000	ml	0.0000	f	f	0
26912	6834	75	45.0000	45.0000	ml	0.0000	f	f	0
27269	6926	49	15.0000	15.0000	ml	0.0000	f	t	0
27270	6926	50	30.0000	30.0000	ml	0.0000	t	t	0
27271	6926	51	45.0000	45.0000	ml	55.0000	f	t	0
27272	6927	96	10.0000	10.0000	ml	0.0000	t	t	0
27273	6927	97	20.0000	20.0000	ml	65.0000	f	t	0
27274	6927	98	30.0000	30.0000	ml	130.0000	f	t	0
27275	6928	129	10.0000	10.0000	ml	0.0000	t	t	0
25958	6602	80	10.0000	10.0000	ml	25.0000	f	t	0
25959	6602	81	20.0000	20.0000	ml	50.0000	f	t	0
25960	6602	82	30.0000	30.0000	ml	75.0000	f	t	0
25961	6602	86	1.0000	1.0000	ml	0.0000	f	t	0
27276	6928	130	20.0000	20.0000	ml	55.0000	f	t	0
27277	6928	131	30.0000	30.0000	ml	110.0000	f	t	0
27278	6929	92	30.0000	30.0000	ml	0.0000	t	t	0
27279	6930	76	170.0000	170.0000	ml	0.0000	f	t	0
27280	6930	77	190.0000	190.0000	ml	0.0000	t	t	0
27281	6930	78	210.0000	210.0000	ml	0.0000	f	t	0
25962	6602	87	2.0000	2.0000	ml	0.0000	f	t	0
25963	6602	88	3.0000	3.0000	ml	0.0000	f	t	0
25964	6602	65	1.0000	1.0000	ml	0.0000	f	t	0
25965	6602	66	2.0000	2.0000	ml	0.0000	f	t	0
25966	6602	67	3.0000	3.0000	ml	0.0000	f	t	0
25967	6602	83	10.0000	10.0000	ml	0.0000	f	t	0
25968	6602	84	20.0000	20.0000	ml	0.0000	f	t	0
25969	6602	85	30.0000	30.0000	ml	0.0000	f	t	0
25970	6603	55	10.0000	10.0000	ml	35.0000	f	t	0
25971	6603	56	20.0000	20.0000	ml	70.0000	f	t	0
25972	6603	57	30.0000	30.0000	ml	105.0000	f	t	0
25973	6603	58	10.0000	10.0000	ml	35.0000	f	t	0
25974	6603	59	20.0000	20.0000	ml	70.0000	f	t	0
25975	6603	61	30.0000	30.0000	ml	105.0000	f	t	0
25976	6603	62	10.0000	10.0000	ml	35.0000	f	t	0
25977	6603	63	20.0000	20.0000	ml	70.0000	f	t	0
25978	6603	64	30.0000	30.0000	ml	105.0000	f	t	0
25979	6604	34	18.0000	18.0000	ml	0.0000	f	t	0
25980	6604	35	18.0000	25.0000	ml	0.0000	t	t	0
25981	6604	36	36.0000	54.0000	ml	65.0000	f	t	0
25982	6604	37	18.0000	18.0000	ml	0.0000	f	t	0
25349	6443	57	30.0000	30.0000	ml	105.0000	f	t	0
25350	6443	58	10.0000	10.0000	ml	35.0000	f	t	0
25351	6443	59	20.0000	20.0000	ml	70.0000	f	t	0
25352	6443	61	30.0000	30.0000	ml	105.0000	f	t	0
25353	6443	62	10.0000	10.0000	ml	35.0000	f	t	0
25354	6443	63	20.0000	20.0000	ml	70.0000	f	t	0
25355	6443	64	30.0000	30.0000	ml	105.0000	f	t	0
25983	6604	38	18.0000	25.0000	ml	0.0000	t	t	0
25984	6604	39	36.0000	54.0000	ml	65.0000	f	t	0
25985	6605	76	100.0000	100.0000	ml	0.0000	f	t	0
25986	6605	77	120.0000	120.0000	ml	0.0000	t	t	0
25987	6605	78	140.0000	140.0000	ml	0.0000	f	t	0
25617	6511	80	10.0000	10.0000	ml	25.0000	f	t	0
25618	6511	81	20.0000	20.0000	ml	50.0000	f	t	0
25619	6511	82	30.0000	30.0000	ml	75.0000	f	t	0
26447	6717	83	10.0000	10.0000	ml	0.0000	f	t	0
25620	6511	86	1.0000	1.0000	ml	0.0000	f	t	0
25621	6511	87	2.0000	2.0000	ml	0.0000	f	t	0
25622	6511	88	3.0000	3.0000	ml	0.0000	f	t	0
25623	6511	65	1.0000	1.0000	ml	0.0000	f	t	0
25624	6511	66	2.0000	2.0000	ml	0.0000	f	t	0
25625	6511	67	3.0000	3.0000	ml	0.0000	f	t	0
25626	6511	83	10.0000	10.0000	ml	0.0000	f	t	0
25627	6511	84	20.0000	20.0000	ml	0.0000	f	t	0
25628	6511	85	30.0000	30.0000	ml	0.0000	f	t	0
25629	6512	96	15.0000	15.0000	ml	0.0000	f	t	0
25630	6512	97	30.0000	30.0000	ml	0.0000	t	t	0
25631	6512	98	45.0000	45.0000	ml	65.0000	f	t	0
25632	6513	34	18.0000	18.0000	ml	0.0000	f	t	0
26913	6835	80	10.0000	10.0000	ml	25.0000	f	t	0
26914	6835	81	20.0000	20.0000	ml	50.0000	f	t	0
25633	6513	35	18.0000	36.0000	ml	0.0000	t	t	0
25634	6513	36	36.0000	54.0000	ml	65.0000	f	t	0
25635	6513	37	18.0000	18.0000	ml	0.0000	f	t	0
25636	6513	38	18.0000	36.0000	ml	0.0000	t	t	0
25219	6410	135	15.0000	15.0000	ml	0.0000	f	t	0
25220	6410	136	30.0000	30.0000	ml	0.0000	t	t	0
25221	6410	137	45.0000	45.0000	ml	55.0000	f	t	0
25222	6411	76	140.0000	140.0000	ml	0.0000	f	t	0
25223	6411	77	160.0000	160.0000	ml	0.0000	t	t	0
25224	6411	78	180.0000	180.0000	ml	0.0000	f	t	0
26448	6717	84	20.0000	20.0000	ml	0.0000	f	t	0
26449	6717	85	30.0000	30.0000	ml	0.0000	f	t	0
26450	6717	65	1.0000	1.0000	ml	0.0000	f	t	0
26451	6717	66	2.0000	2.0000	ml	0.0000	f	t	0
26452	6717	67	3.0000	3.0000	ml	0.0000	f	t	0
26453	6717	80	10.0000	10.0000	ml	25.0000	f	t	0
26454	6717	81	20.0000	20.0000	ml	50.0000	f	t	0
26455	6717	82	30.0000	30.0000	ml	75.0000	f	t	0
26456	6717	86	1.0000	1.0000	ml	0.0000	f	t	0
26457	6717	87	2.0000	2.0000	ml	0.0000	f	t	0
26458	6717	88	3.0000	3.0000	ml	0.0000	f	t	0
26459	6718	55	10.0000	10.0000	ml	35.0000	f	t	0
26460	6718	56	20.0000	20.0000	ml	70.0000	f	t	0
26461	6718	57	30.0000	30.0000	ml	105.0000	f	t	0
26462	6718	62	10.0000	10.0000	ml	35.0000	f	t	0
26463	6718	63	20.0000	20.0000	ml	70.0000	f	t	0
26464	6718	64	30.0000	30.0000	ml	105.0000	f	t	0
26465	6718	58	10.0000	10.0000	ml	35.0000	f	t	0
26466	6718	59	20.0000	20.0000	ml	70.0000	f	t	0
26467	6718	61	30.0000	30.0000	ml	105.0000	f	t	0
26468	6719	34	18.0000	18.0000	ml	0.0000	f	t	0
26469	6719	35	18.0000	36.0000	ml	0.0000	t	t	0
26470	6719	36	36.0000	54.0000	ml	65.0000	f	t	0
26471	6719	37	18.0000	18.0000	ml	0.0000	f	t	0
26472	6719	38	18.0000	36.0000	ml	0.0000	t	t	0
26473	6719	39	36.0000	54.0000	ml	65.0000	f	t	0
26474	6720	76	170.0000	170.0000	ml	0.0000	f	t	0
26475	6720	77	190.0000	190.0000	ml	0.0000	t	t	0
26476	6720	78	190.0000	190.0000	ml	0.0000	f	t	0
25637	6513	39	36.0000	54.0000	ml	65.0000	f	t	0
25988	6608	80	10.0000	10.0000	ml	25.0000	f	t	0
25989	6608	81	20.0000	20.0000	ml	50.0000	f	t	0
25990	6608	82	30.0000	30.0000	ml	75.0000	f	t	0
25991	6608	86	1.0000	1.0000	ml	0.0000	f	t	0
25992	6608	87	2.0000	2.0000	ml	0.0000	f	t	0
25993	6608	88	3.0000	3.0000	ml	0.0000	f	t	0
25994	6608	65	1.0000	1.0000	ml	0.0000	f	t	0
25995	6608	66	2.0000	2.0000	ml	0.0000	f	t	0
25996	6608	67	3.0000	3.0000	ml	0.0000	f	t	0
25997	6608	83	10.0000	10.0000	ml	0.0000	f	t	0
25998	6608	84	20.0000	20.0000	ml	0.0000	f	t	0
25999	6608	85	30.0000	30.0000	ml	0.0000	f	t	0
26000	6609	89	15.0000	15.0000	ml	0.0000	t	t	0
26001	6609	90	30.0000	30.0000	ml	55.0000	f	t	0
26002	6609	91	45.0000	45.0000	ml	110.0000	f	t	0
26003	6610	34	18.0000	18.0000	ml	0.0000	f	t	0
26004	6610	35	18.0000	25.0000	ml	0.0000	t	t	0
26005	6610	36	36.0000	54.0000	ml	65.0000	f	t	0
26006	6610	37	18.0000	18.0000	ml	0.0000	f	t	0
26007	6610	38	18.0000	36.0000	ml	0.0000	t	t	0
25359	6447	80	10.0000	10.0000	ml	25.0000	f	t	0
25360	6447	81	20.0000	20.0000	ml	50.0000	f	t	0
25361	6447	82	30.0000	30.0000	ml	75.0000	f	t	0
25362	6447	86	1.0000	1.0000	ml	0.0000	f	t	0
25363	6447	87	2.0000	2.0000	ml	0.0000	f	t	0
25364	6447	88	3.0000	3.0000	ml	0.0000	f	t	0
25365	6447	65	1.0000	1.0000	ml	0.0000	f	t	0
25366	6447	66	2.0000	2.0000	ml	0.0000	f	t	0
25367	6447	67	3.0000	3.0000	ml	0.0000	f	t	0
25368	6447	83	10.0000	10.0000	ml	0.0000	f	t	0
25369	6447	84	20.0000	20.0000	ml	0.0000	f	t	0
25370	6447	85	30.0000	30.0000	ml	0.0000	f	t	0
25371	6448	73	10.0000	10.0000	ml	0.0000	f	t	0
25372	6448	74	20.0000	20.0000	ml	0.0000	t	t	0
25373	6448	75	30.0000	30.0000	ml	55.0000	f	t	0
25374	6449	55	10.0000	10.0000	ml	0.0000	t	t	0
25375	6449	56	20.0000	20.0000	ml	35.0000	f	t	0
25376	6449	57	30.0000	30.0000	ml	70.0000	f	t	0
25377	6450	34	18.0000	18.0000	ml	0.0000	f	t	0
25378	6450	35	18.0000	36.0000	ml	0.0000	t	t	0
25379	6450	36	36.0000	54.0000	ml	65.0000	f	t	0
25380	6450	37	18.0000	18.0000	ml	0.0000	f	t	0
25381	6450	38	18.0000	36.0000	ml	0.0000	t	t	0
25382	6450	39	36.0000	54.0000	ml	65.0000	f	t	0
25383	6454	73	10.0000	10.0000	ml	0.0000	f	t	0
25384	6454	74	30.0000	30.0000	ml	0.0000	f	f	0
25385	6454	75	45.0000	45.0000	ml	0.0000	f	f	0
26477	6721	92	30.0000	30.0000	ml	0.0000	t	t	0
26915	6835	82	30.0000	30.0000	ml	75.0000	f	t	0
26916	6835	86	1.0000	1.0000	ml	0.0000	f	t	0
26917	6835	87	2.0000	2.0000	ml	0.0000	f	t	0
26918	6835	88	3.0000	3.0000	ml	0.0000	f	t	0
26919	6835	65	1.0000	1.0000	ml	0.0000	f	t	0
26920	6835	66	2.0000	2.0000	ml	0.0000	f	t	0
26921	6835	67	3.0000	3.0000	ml	0.0000	f	t	0
26922	6835	83	10.0000	10.0000	ml	0.0000	f	t	0
26923	6835	84	20.0000	20.0000	ml	0.0000	f	t	0
26924	6835	85	30.0000	30.0000	ml	0.0000	f	t	0
26925	6836	96	15.0000	15.0000	ml	0.0000	f	t	0
26926	6836	97	30.0000	30.0000	ml	0.0000	t	t	0
26927	6836	98	45.0000	45.0000	ml	65.0000	f	t	0
26928	6837	76	170.0000	170.0000	ml	0.0000	f	t	0
26929	6837	77	190.0000	190.0000	ml	0.0000	t	t	0
26930	6837	78	210.0000	210.0000	ml	0.0000	f	t	0
26931	6838	34	18.0000	18.0000	ml	0.0000	f	t	0
26932	6838	35	18.0000	36.0000	ml	0.0000	t	t	0
26933	6838	36	36.0000	54.0000	ml	65.0000	f	t	0
26934	6838	37	18.0000	18.0000	ml	0.0000	f	t	0
26935	6838	38	18.0000	36.0000	ml	0.0000	t	t	0
26936	6838	39	36.0000	54.0000	ml	65.0000	f	t	0
26937	6839	113	30.0000	30.0000	ml	0.0000	f	t	0
26008	6610	39	36.0000	54.0000	ml	65.0000	f	t	0
26009	6611	76	100.0000	100.0000	ml	0.0000	f	t	0
26010	6611	77	120.0000	120.0000	ml	0.0000	t	t	0
26011	6611	78	140.0000	140.0000	ml	0.0000	f	t	0
25638	6517	80	10.0000	10.0000	ml	25.0000	f	t	0
25639	6517	81	20.0000	20.0000	ml	50.0000	f	t	0
25640	6517	82	30.0000	30.0000	ml	75.0000	f	t	0
25641	6517	86	1.0000	1.0000	ml	0.0000	f	t	0
25642	6517	87	2.0000	2.0000	ml	0.0000	f	t	0
25643	6517	88	3.0000	3.0000	ml	0.0000	f	t	0
25644	6517	65	1.0000	1.0000	ml	0.0000	f	t	0
25645	6517	66	2.0000	2.0000	ml	0.0000	f	t	0
25646	6517	67	3.0000	3.0000	ml	0.0000	f	t	0
25647	6517	83	10.0000	10.0000	ml	0.0000	f	t	0
25648	6517	84	20.0000	20.0000	ml	0.0000	f	t	0
25649	6517	85	30.0000	30.0000	ml	0.0000	f	t	0
25650	6518	102	15.0000	15.0000	ml	0.0000	f	t	0
25651	6518	103	30.0000	30.0000	ml	0.0000	t	t	0
25652	6518	104	45.0000	45.0000	ml	55.0000	f	t	0
25254	6423	80	10.0000	10.0000	ml	25.0000	f	t	0
25255	6423	81	20.0000	20.0000	ml	50.0000	f	t	0
25256	6423	82	30.0000	30.0000	ml	75.0000	f	t	0
25257	6423	86	1.0000	1.0000	ml	0.0000	f	t	0
25258	6423	87	2.0000	2.0000	ml	0.0000	f	t	0
26478	6724	34	18.0000	18.0000	ml	0.0000	f	t	0
26479	6724	35	18.0000	36.0000	ml	0.0000	t	t	0
26480	6724	36	36.0000	54.0000	ml	65.0000	f	t	0
26481	6724	37	18.0000	18.0000	ml	0.0000	f	t	0
26482	6724	38	18.0000	36.0000	ml	0.0000	t	t	0
26483	6724	39	36.0000	54.0000	ml	65.0000	f	t	0
26484	6725	73	15.0000	15.0000	ml	0.0000	f	t	0
26485	6725	74	35.0000	35.0000	ml	0.0000	t	t	0
26486	6725	75	45.0000	45.0000	ml	55.0000	f	t	0
26487	6726	55	10.0000	10.0000	ml	0.0000	t	t	0
26488	6726	56	20.0000	20.0000	ml	35.0000	f	t	0
26489	6726	57	30.0000	30.0000	ml	70.0000	f	t	0
26490	6727	76	170.0000	170.0000	ml	0.0000	f	t	0
26491	6727	77	190.0000	190.0000	ml	0.0000	t	t	0
26492	6727	78	210.0000	210.0000	ml	0.0000	f	t	0
26493	6729	65	1.0000	1.0000	ml	0.0000	f	t	0
26494	6729	66	2.0000	2.0000	ml	0.0000	f	t	0
26495	6729	67	3.0000	3.0000	ml	0.0000	f	t	0
26496	6729	86	1.0000	1.0000	ml	0.0000	f	t	0
26497	6729	87	2.0000	2.0000	ml	0.0000	f	t	0
26498	6729	88	3.0000	3.0000	ml	0.0000	f	t	0
26499	6729	80	10.0000	10.0000	ml	25.0000	f	t	0
26500	6729	81	20.0000	20.0000	ml	50.0000	f	t	0
26501	6729	82	30.0000	30.0000	ml	75.0000	f	t	0
26502	6729	83	10.0000	10.0000	ml	0.0000	f	t	0
26503	6729	84	20.0000	20.0000	ml	0.0000	f	t	0
25259	6423	88	3.0000	3.0000	ml	0.0000	f	t	0
25260	6423	65	1.0000	1.0000	ml	0.0000	f	t	0
25261	6423	66	2.0000	2.0000	ml	0.0000	f	t	0
25262	6423	67	3.0000	3.0000	ml	0.0000	f	t	0
25263	6423	83	10.0000	10.0000	ml	0.0000	f	t	0
25264	6423	84	20.0000	20.0000	ml	0.0000	f	t	0
25653	6518	105	0.0000	0.0000	ml	0.0000	f	f	0
25654	6519	34	18.0000	18.0000	ml	0.0000	f	t	0
25655	6519	35	18.0000	36.0000	ml	0.0000	t	t	0
25656	6519	36	36.0000	54.0000	ml	65.0000	f	t	0
25657	6519	37	18.0000	18.0000	ml	0.0000	f	t	0
25658	6519	38	18.0000	36.0000	ml	0.0000	t	t	0
25265	6423	85	30.0000	30.0000	ml	0.0000	f	t	0
26012	6614	80	10.0000	10.0000	ml	25.0000	f	t	0
26013	6614	81	20.0000	20.0000	ml	50.0000	f	t	0
26014	6614	82	30.0000	30.0000	ml	75.0000	f	t	0
26015	6614	86	1.0000	1.0000	ml	0.0000	f	t	0
26016	6614	87	2.0000	2.0000	ml	0.0000	f	t	0
26017	6614	88	3.0000	3.0000	ml	0.0000	f	t	0
26018	6614	65	1.0000	1.0000	ml	0.0000	f	t	0
26019	6614	66	2.0000	2.0000	ml	0.0000	f	t	0
26020	6614	67	3.0000	3.0000	ml	0.0000	f	t	0
26021	6614	83	10.0000	10.0000	ml	0.0000	f	t	0
25659	6519	39	36.0000	54.0000	ml	65.0000	f	t	0
26022	6614	84	20.0000	20.0000	ml	0.0000	f	t	0
26023	6614	85	30.0000	30.0000	ml	0.0000	f	t	0
26024	6615	58	10.0000	10.0000	ml	35.0000	f	t	0
26025	6615	59	20.0000	20.0000	ml	70.0000	f	t	0
26026	6615	61	30.0000	30.0000	ml	105.0000	f	t	0
26027	6615	55	10.0000	10.0000	ml	35.0000	f	t	0
26028	6615	56	20.0000	20.0000	ml	70.0000	f	t	0
26029	6615	57	30.0000	30.0000	ml	105.0000	f	t	0
26030	6615	62	10.0000	10.0000	ml	35.0000	f	t	0
26031	6615	63	20.0000	20.0000	ml	70.0000	f	t	0
26032	6615	64	30.0000	30.0000	ml	105.0000	f	t	0
26033	6616	34	18.0000	18.0000	ml	0.0000	f	t	0
26034	6616	35	18.0000	36.0000	ml	0.0000	t	t	0
26035	6616	36	36.0000	54.0000	ml	65.0000	f	t	0
26036	6616	37	18.0000	18.0000	ml	0.0000	f	t	0
26037	6616	38	18.0000	36.0000	ml	0.0000	t	t	0
26038	6616	39	36.0000	54.0000	ml	65.0000	f	t	0
26039	6618	76	120.0000	120.0000	ml	0.0000	f	t	0
26040	6618	77	140.0000	140.0000	ml	0.0000	t	t	0
26041	6618	78	160.0000	160.0000	ml	0.0000	f	t	0
26504	6729	85	30.0000	30.0000	ml	0.0000	f	t	0
26505	6730	113	30.0000	30.0000	ml	0.0000	f	t	0
26938	6842	80	10.0000	10.0000	ml	25.0000	f	t	0
26939	6842	81	20.0000	20.0000	ml	50.0000	f	t	0
26940	6842	82	30.0000	30.0000	ml	75.0000	f	t	0
26941	6842	86	1.0000	1.0000	ml	0.0000	f	t	0
26942	6842	87	2.0000	2.0000	ml	0.0000	f	t	0
26943	6842	88	3.0000	3.0000	ml	0.0000	f	t	0
26944	6842	65	1.0000	1.0000	ml	0.0000	f	t	0
26945	6842	66	2.0000	2.0000	ml	0.0000	f	t	0
26946	6842	67	3.0000	3.0000	ml	0.0000	f	t	0
19620	4867	80	10.0000	10.0000	ml	25.0000	f	t	0
19621	4867	81	20.0000	20.0000	ml	50.0000	f	t	0
19622	4867	82	30.0000	30.0000	ml	75.0000	f	t	0
19623	4867	86	1.0000	1.0000	ml	0.0000	f	t	0
19624	4867	87	2.0000	2.0000	ml	0.0000	f	t	0
19625	4867	88	3.0000	3.0000	ml	0.0000	f	t	0
19626	4867	65	1.0000	1.0000	ml	0.0000	f	t	0
19627	4867	66	2.0000	2.0000	ml	0.0000	f	t	0
19628	4867	67	3.0000	3.0000	ml	0.0000	f	t	0
19629	4867	83	10.0000	10.0000	ml	0.0000	f	t	0
19630	4867	84	20.0000	20.0000	ml	0.0000	f	t	0
19631	4867	85	30.0000	30.0000	ml	0.0000	f	t	0
26947	6842	83	10.0000	10.0000	ml	0.0000	f	t	0
26948	6842	84	20.0000	20.0000	ml	0.0000	f	t	0
26949	6842	85	30.0000	30.0000	ml	0.0000	f	t	0
26950	6843	102	15.0000	15.0000	ml	0.0000	f	t	0
26951	6843	103	30.0000	30.0000	ml	0.0000	t	t	0
26952	6843	104	45.0000	45.0000	ml	55.0000	f	t	0
26953	6843	105	0.0000	0.0000	ml	0.0000	f	f	0
26954	6844	122	30.0000	30.0000	ml	0.0000	t	t	0
26955	6845	34	18.0000	18.0000	ml	0.0000	f	t	0
25266	6424	37	18.0000	18.0000	ml	0.0000	f	t	0
25267	6424	38	18.0000	36.0000	ml	0.0000	t	t	0
25268	6424	39	36.0000	54.0000	ml	65.0000	f	t	0
25269	6424	34	18.0000	18.0000	ml	0.0000	f	t	0
25270	6424	35	18.0000	36.0000	ml	0.0000	t	t	0
25271	6424	36	36.0000	54.0000	ml	65.0000	f	t	0
25660	6523	80	10.0000	10.0000	ml	25.0000	f	t	0
25661	6523	81	20.0000	20.0000	ml	50.0000	f	t	0
25662	6523	82	30.0000	30.0000	ml	75.0000	f	t	0
25663	6523	86	1.0000	1.0000	ml	0.0000	f	t	0
25664	6523	87	2.0000	2.0000	ml	0.0000	f	t	0
25665	6523	88	3.0000	3.0000	ml	0.0000	f	t	0
26506	6732	80	10.0000	10.0000	ml	25.0000	f	t	0
26507	6732	81	20.0000	20.0000	ml	50.0000	f	t	0
26508	6732	82	30.0000	30.0000	ml	75.0000	f	t	0
26509	6732	86	1.0000	1.0000	ml	0.0000	f	t	0
26510	6732	87	2.0000	2.0000	ml	0.0000	f	t	0
26511	6732	88	3.0000	3.0000	ml	0.0000	f	t	0
26512	6732	65	1.0000	1.0000	ml	0.0000	f	t	0
26513	6732	66	2.0000	2.0000	ml	0.0000	f	t	0
26514	6732	67	3.0000	3.0000	ml	0.0000	f	t	0
25666	6523	65	1.0000	1.0000	ml	0.0000	f	t	0
25667	6523	66	2.0000	2.0000	ml	0.0000	f	t	0
25668	6523	67	3.0000	3.0000	ml	0.0000	f	t	0
25669	6523	83	10.0000	10.0000	ml	0.0000	f	t	0
25670	6523	84	20.0000	20.0000	ml	0.0000	f	t	0
25671	6523	85	30.0000	30.0000	ml	0.0000	f	t	0
25672	6524	102	10.0000	10.0000	ml	0.0000	f	t	0
25673	6524	103	20.0000	20.0000	ml	0.0000	t	t	0
25674	6524	104	30.0000	30.0000	ml	55.0000	f	t	0
25675	6524	105	0.0000	0.0000	ml	0.0000	f	t	0
25676	6525	114	15.0000	15.0000	ml	0.0000	f	t	0
25677	6525	115	20.0000	20.0000	ml	0.0000	t	t	0
25678	6525	116	30.0000	30.0000	ml	55.0000	f	t	0
25679	6526	34	18.0000	18.0000	ml	0.0000	f	t	0
25680	6526	35	18.0000	36.0000	ml	0.0000	t	t	0
25681	6526	36	36.0000	54.0000	ml	65.0000	f	t	0
25682	6526	37	18.0000	18.0000	ml	0.0000	f	t	0
25683	6526	38	18.0000	36.0000	ml	0.0000	t	t	0
25684	6526	39	36.0000	54.0000	ml	65.0000	f	t	0
26042	6620	80	10.0000	10.0000	ml	25.0000	f	t	0
26043	6620	81	20.0000	20.0000	ml	50.0000	f	t	0
26044	6620	82	30.0000	30.0000	ml	75.0000	f	t	0
26045	6620	86	1.0000	1.0000	ml	0.0000	f	t	0
26046	6620	87	2.0000	2.0000	ml	0.0000	f	t	0
26047	6620	88	3.0000	3.0000	ml	0.0000	f	t	0
26515	6732	83	10.0000	10.0000	ml	0.0000	f	t	0
26516	6732	84	20.0000	20.0000	ml	0.0000	f	t	0
26517	6732	85	30.0000	30.0000	ml	0.0000	f	t	0
26518	6733	113	30.0000	30.0000	ml	0.0000	t	t	0
26519	6734	34	18.0000	18.0000	ml	0.0000	f	t	0
26520	6734	35	18.0000	25.0000	ml	0.0000	t	t	0
26048	6620	65	1.0000	1.0000	ml	0.0000	f	t	0
26049	6620	66	2.0000	2.0000	ml	0.0000	f	t	0
26050	6620	67	3.0000	3.0000	ml	0.0000	f	t	0
26051	6620	83	10.0000	10.0000	ml	0.0000	f	t	0
26052	6620	84	20.0000	20.0000	ml	0.0000	f	t	0
26053	6620	85	30.0000	30.0000	ml	0.0000	f	t	0
26054	6621	96	15.0000	15.0000	ml	0.0000	f	t	0
26055	6621	97	30.0000	30.0000	ml	0.0000	t	t	0
26056	6621	98	45.0000	45.0000	ml	65.0000	f	t	0
26057	6622	34	18.0000	18.0000	ml	0.0000	f	t	0
26058	6622	35	18.0000	36.0000	ml	0.0000	t	t	0
26059	6622	36	36.0000	54.0000	ml	65.0000	f	t	0
26060	6622	37	18.0000	18.0000	ml	0.0000	f	t	0
26061	6622	38	18.0000	36.0000	ml	0.0000	t	t	0
26062	6622	39	36.0000	54.0000	ml	65.0000	f	t	0
26063	6623	76	120.0000	120.0000	ml	0.0000	f	t	0
26064	6623	77	140.0000	140.0000	ml	0.0000	t	t	0
26065	6623	78	160.0000	160.0000	ml	0.0000	f	t	0
26521	6734	36	36.0000	43.0000	ml	65.0000	f	t	0
26522	6734	37	18.0000	18.0000	ml	0.0000	f	t	0
26523	6734	38	18.0000	25.0000	ml	0.0000	t	t	0
26524	6734	39	36.0000	43.0000	ml	65.0000	f	t	0
26525	6735	76	110.0000	110.0000	ml	0.0000	f	t	0
26526	6735	77	130.0000	130.0000	ml	0.0000	t	t	0
26527	6735	78	150.0000	150.0000	ml	0.0000	f	t	0
26528	6737	55	10.0000	10.0000	ml	35.0000	f	t	0
26529	6737	56	20.0000	20.0000	ml	70.0000	f	t	0
26530	6737	57	30.0000	30.0000	ml	105.0000	f	t	0
26531	6737	58	10.0000	10.0000	ml	35.0000	f	t	0
26532	6737	59	20.0000	20.0000	ml	70.0000	f	t	0
26533	6737	61	30.0000	30.0000	ml	105.0000	f	t	0
26534	6737	62	10.0000	10.0000	ml	35.0000	f	t	0
26535	6737	63	20.0000	20.0000	ml	70.0000	f	t	0
26536	6737	64	30.0000	30.0000	ml	105.0000	f	t	0
26956	6845	35	18.0000	36.0000	ml	0.0000	t	t	0
26957	6845	36	36.0000	54.0000	ml	65.0000	f	t	0
26958	6845	37	18.0000	18.0000	ml	0.0000	f	t	0
26959	6845	38	18.0000	36.0000	ml	0.0000	t	t	0
26960	6845	39	36.0000	54.0000	ml	65.0000	f	t	0
26961	6846	76	170.0000	170.0000	ml	0.0000	f	t	0
26962	6846	77	190.0000	190.0000	ml	0.0000	t	t	0
26963	6846	78	210.0000	210.0000	ml	0.0000	f	t	0
27456	7027	83	30.0000	30.0000	ml	0.0000	f	t	0
27457	7027	84	40.0000	40.0000	ml	0.0000	t	t	0
27458	7027	85	50.0000	50.0000	ml	0.0000	f	t	0
27459	7027	80	10.0000	10.0000	ml	25.0000	f	t	0
27460	7027	81	20.0000	20.0000	ml	50.0000	f	t	0
27461	7027	82	30.0000	30.0000	ml	75.0000	f	t	0
27462	7029	117	10.0000	10.0000	ml	0.0000	f	t	0
27463	7029	118	20.0000	20.0000	ml	0.0000	t	t	0
27464	7029	119	30.0000	30.0000	ml	55.0000	f	t	0
27465	7030	76	160.0000	160.0000	ml	0.0000	f	t	0
27466	7030	77	180.0000	180.0000	ml	0.0000	t	t	0
27467	7030	78	200.0000	200.0000	ml	0.0000	f	t	0
27498	7061	135	15.0000	15.0000	ml	0.0000	f	t	0
27499	7061	136	30.0000	30.0000	ml	0.0000	t	t	0
27500	7061	137	45.0000	45.0000	ml	55.0000	f	t	0
27501	7062	76	160.0000	160.0000	ml	0.0000	f	t	0
27502	7062	77	180.0000	180.0000	ml	0.0000	t	t	0
27503	7062	78	200.0000	200.0000	ml	0.0000	f	t	0
\.


--
-- Data for Name: drinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drinks (id, name, description, category, base_price, image_url, is_active, prep_time_seconds, cup_size_ml, kitchen_station, created_at, updated_at, category_id, sort_order, cup_ingredient_id, is_customizable, kitchen_station_id) FROM stdin;
114	Wunder Sugar Free Belgian Milk Chocolate	\N	Snacks	75.00	/uploads/drink-1777636773644.webp	t	120	\N	food-pastry	2026-05-01 14:59:33.280848+03	2026-05-03 13:35:45.199+03	9	1004	\N	f	\N
106	V Cola Dite	\N	Other	55.00	/uploads/drink-1777635537211.webp	t	120	\N	food-pastry	2026-04-29 18:19:15.156892+03	2026-05-03 13:36:58.294+03	10	702	\N	f	4
16	Espresso Affogato	\N	Hot Coffee	130.00	/uploads/drink-1776600487320.webp	t	180	120	hot-bar	2026-04-19 14:08:07.228452+02	2026-05-03 11:39:57.091+03	1	104	298	t	1
19	Caramel Macchiato	\N	Hot Coffee	180.00	/uploads/drink-1776611461789.webp	t	180	326	hot-bar	2026-04-19 15:25:00.948506+02	2026-05-03 12:06:21.716+03	1	110	300	t	1
71	Flat White 	\N	Hot Coffee	125.00	/uploads/drink-1776882828208.webp	t	180	186	hot-bar	2026-04-22 20:14:43.642545+02	2026-05-03 12:09:52.836+03	1	116	\N	t	1
110	Belgain Chocolate Sable Box	\N	Snacks	350.00	/uploads/drink-1777635924202.webp	t	120	\N	food-pastry	2026-05-01 14:25:52.889375+03	2026-05-04 16:05:41.821+03	9	1401	\N	f	\N
125	Wunder Sugar Free Belgian Milk Chocolate with Hazelnut	\N	Snacks	75.00	/uploads/drink-1777897695647.png	t	120	\N	food-pastry	2026-05-04 15:27:20.782275+03	2026-05-04 16:14:48.845+03	9	1004	\N	f	\N
127	Belgian Milk Chocolate Hazelnut Dragees	\N	Snacks	75.00	/uploads/drink-1777898253617.png	t	120	\N	food-pastry	2026-05-04 15:36:10.26696+03	2026-05-04 16:19:38.743+03	9	1005	\N	f	\N
118	Dark Chocolate Mint 	\N	Snacks	65.00	/uploads/drink-1777886099754.webp	t	120	\N	food-pastry	2026-05-02 18:30:08.233005+03	2026-05-04 12:14:59.755+03	9	1009	\N	f	\N
111	Chocolate Butter Biscuits Box	\N	Snacks	240.00	/uploads/drink-1777635897780.webp	t	120	\N	food-pastry	2026-05-01 14:30:49.711198+03	2026-05-04 16:05:47.658+03	9	1402	\N	f	\N
126	Wunder Sugar free Belgian Dark Chocolate with Almond	\N	Snacks	75.00	/uploads/drink-1777898005466.png	t	120	\N	food-pastry	2026-05-04 15:33:25.33318+03	2026-05-04 16:13:52.832+03	9	1004	\N	f	\N
128	Belgian Milk Chocolate Caramel Dragees 	\N	Snacks	75.00	/uploads/drink-1777898484008.png	t	120	\N	food-pastry	2026-05-04 15:41:23.811628+03	2026-05-04 16:18:58.805+03	9	1005	\N	f	\N
107	V Pina Colada	\N	Other	55.00	/uploads/drink-1777635616160.webp	t	120	\N	food-pastry	2026-04-29 18:22:33.076081+03	2026-05-03 13:36:50.639+03	10	703	\N	f	\N
85	V 60	v60	Hot Coffee	175.00	/uploads/drink-1777063983948.webp	t	132	320	food-pastry	2026-04-23 18:20:17.094037+02	2026-05-03 12:24:38.06+03	1	140	300	t	\N
75	Hazelnut Flat White	\N	Hot Coffee	165.00	/uploads/drink-1776883737611.webp	t	180	196	hot-bar	2026-04-22 20:48:57.486555+02	2026-05-03 12:12:03.328+03	1	120	\N	t	1
76	Almond Flat White	\N	Hot Coffee	175.00	/uploads/drink-1776884271214.webp	t	180	206	hot-bar	2026-04-22 20:57:51.089774+02	2026-05-03 12:12:36.573+03	1	122	298	t	1
45	Latte Frappe	Latte Frappe	Frappe	150.00	/uploads/drink-1776865710020.webp	t	180	326	cold-bar-test	2026-04-21 16:51:18.23622+02	2026-05-05 17:37:20.465+03	6	209	302	t	2
12	Iced Caramel Macchiato OLD	Cold espresso with vanilla and caramel over milk	Cold Coffee	175.00	/uploads/drink-1776469513061.webp	f	150	\N	cold	2026-04-17 00:56:14.298422+02	2026-05-07 22:20:48.156+03	3	0	\N	t	\N
9	Iced Latte OLD	Espresso with cold milk over ice	Cold Coffee	140.00	/uploads/drink-1776469492324.webp	f	120	\N	cold	2026-04-17 00:56:14.298422+02	2026-05-07 22:20:59.472+03	3	0	\N	t	\N
10	Matcha Latte OLD	Ceremonial matcha with steamed milk	Specialty	170.00	/uploads/drink-1776469536354.webp	f	210	\N	main	2026-04-17 00:56:14.298422+02	2026-05-07 22:21:07.233+03	4	0	\N	t	1
120	Cold Brew OLD	\N	Cold Coffee	0.00	\N	f	120	400	turkish-bar	2026-05-03 15:34:16.496073+03	2026-05-07 22:21:25.516+03	3	169	302	t	\N
94	Latte	\N	Hot Coffee	150.00	/uploads/drink-1777060111961.webp	t	180	316	hot-bar	2026-04-24 22:48:19.017561+03	2026-05-03 12:14:25.664+03	1	124	300	t	1
88	Mocha	Mocha	Hot Coffee	175.00	/uploads/drink-1777064256434.webp	t	120	316	hot-bar	2026-04-23 19:05:48.121043+02	2026-05-03 12:20:01.995+03	1	134	300	t	1
84	Double Turkish Coffee	Double Turkish Coffee	Hot Coffee	135.00	/uploads/drink-1777062992370.webp	t	120	\N	turkish-bar	2026-04-23 17:12:42.95559+02	2026-05-03 12:25:45.262+03	1	143	298	t	3
130	Mango Juice	\N	Other	95.00	/uploads/drink-1777905461000.webp	t	120	\N	food-pastry	2026-05-04 17:37:40.866018+03	2026-05-04 17:38:36.057+03	10	712	\N	f	\N
119	Dark Chocolate Plain  70%	\N	Snacks	65.00	/uploads/drink-1777886729040.png	t	120	\N	food-pastry	2026-05-02 18:30:44.48867+03	2026-05-04 12:25:29.042+03	9	1009	\N	f	\N
81	English Breakfast	English Breakfast	Hot Drinks	70.00	/uploads/drink-1777063165320.webp	t	120	\N	hot-bar	2026-04-23 16:44:14.904634+02	2026-05-02 18:56:20.292+03	2	502	\N	t	1
115	Dark Chocolate Almond	\N	Snacks	65.00	/uploads/drink-1777886740248.png	t	120	\N	food-pastry	2026-05-02 18:27:37.078111+03	2026-05-04 12:25:40.251+03	9	1005	\N	f	\N
121	Almond Cashew Cranberry	\N	Snacks	55.00	/uploads/drink-1777890508356.png	t	120	\N	food-pastry	2026-05-03 17:44:34.284244+03	2026-05-04 13:28:28.36+03	9	1010	\N	f	\N
80	Green Tea	Green Tea	Hot Drinks	70.00	/uploads/drink-1777063109695.webp	t	120	0	hot-bar	2026-04-23 16:29:14.879424+02	2026-05-02 18:56:20.292+03	2	504	\N	t	1
11	 Macchiato	Espresso with a splash of milk	Hot Coffee	120.00	/uploads/drink-1776539640677.webp	t	180	120	hot-bar	2026-04-17 00:56:14.298422+02	2026-05-03 11:38:24.736+03	1	102	297	t	1
17	Espresso Con Panna	\N	Hot Coffee	130.00	/uploads/drink-1776603853111.webp	t	180	120	hot-bar	2026-04-19 14:33:29.928418+02	2026-05-03 11:39:22.25+03	1	103	298	t	1
99	Arabian Coffee	\N	Hot Coffee	145.00	/uploads/drink-1777203276360.webp	t	120	\N	turkish-bar	2026-04-26 14:34:36.286382+03	2026-05-03 13:28:14.322+03	1	144	297	t	3
112	Butter Biscuits Box	\N	Snacks	200.00	/uploads/drink-1777895985671.png	t	120	\N	food-pastry	2026-05-01 14:32:17.387643+03	2026-05-04 16:05:56.875+03	9	1403	\N	f	\N
101	Wunder Sugar Free Belgian Strawberry Milk 	\N	Snacks	75.00	/uploads/drink-1777636100179.webp	t	120	\N	food-pastry	2026-04-27 19:54:21.416642+03	2026-05-04 16:06:52.891+03	9	1000	\N	f	\N
102	Wunder Suger Free Belgian Mint Green	Wunder Suger Free Mint Green	Snacks	75.00	/uploads/drink-1777392587326.webp	t	120	\N	food-pastry	2026-04-28 19:09:47.251411+03	2026-05-04 16:08:24.446+03	9	1002	\N	f	\N
108	V Gold Pinapple	\N	Other	55.00	/uploads/drink-1777635598999.webp	t	120	\N	food-pastry	2026-04-29 18:27:11.932602+03	2026-05-03 13:36:47.988+03	10	704	\N	f	\N
122	Almond Cashew Coconut	\N	Snacks	55.00	/uploads/drink-1777886840660.png	t	120	\N	food-pastry	2026-05-04 11:59:37.046345+03	2026-05-04 16:23:48.704+03	9	1011	\N	f	\N
129	Tiramisu Cake	\N	Food/Pastry	200.00	/uploads/drink-1777898902865.png	t	120	\N	food-pastry	2026-05-04 15:48:21.225156+03	2026-05-04 16:36:40.099+03	5	1301	\N	f	\N
131	Strawberry Juice	\N	Other	95.00	/uploads/drink-1777905660269.webp	t	120	\N	food-pastry	2026-05-04 17:41:00.125522+03	2026-05-04 17:41:59.562+03	10	715	\N	f	\N
116	Dark Chocolate Honeycomb	\N	Snacks	65.00	/uploads/drink-1777886065542.webp	t	120	\N	food-pastry	2026-05-02 18:28:39.357172+03	2026-05-04 12:14:25.543+03	9	1007	\N	f	\N
103	Orange Juice	\N	Other	95.00	/uploads/drink-1777905958295.webp	t	120	\N	food-pastry	2026-04-28 21:13:29.496433+03	2026-05-04 17:45:58.297+03	10	710	\N	f	\N
105	Can Cake Triple Chocolate	\N	Food/Pastry	200.00	/uploads/drink-1777892107241.png	t	120	\N	food-pastry	2026-04-28 22:26:43.953703+03	2026-05-04 13:55:07.243+03	5	1301	\N	f	\N
20	Cortado	\N	Hot Coffee	120.00	/uploads/drink-1776612258765.webp	t	180	145	hot-bar	2026-04-19 17:24:18.676893+02	2026-05-03 12:08:00.291+03	1	112	298	t	1
90	Spanish Latte	Spanish Latte	Hot Coffee	175.00	/uploads/drink-1777061189413.webp	t	120	326	hot-bar	2026-04-23 19:26:41.24493+02	2026-05-03 12:18:31.773+03	1	130	\N	t	1
113	Wunder Sugar Free Belgian Coffe Dark Chocolate 	\N	Snacks	75.00	/uploads/drink-1777636300040.webp	t	120	\N	food-pastry	2026-05-01 14:51:38.733613+03	2026-05-04 16:09:54.648+03	9	1003	\N	f	\N
123	Cashew Almond Pumpkin	\N	Snacks	55.00	/uploads/drink-1777886886561.png	t	120	\N	food-pastry	2026-05-04 12:01:14.295791+03	2026-05-04 16:35:30.355+03	9	1012	\N	f	\N
109	V Pomegranate	\N	Other	55.00	/uploads/drink-1777635583922.webp	t	120	\N	food-pastry	2026-04-29 18:32:15.240256+03	2026-05-03 13:36:44.733+03	10	706	\N	f	\N
97	V Cola	\N	Other	55.00	/uploads/drink-1777065316850.webp	t	120	\N	food-pastry	2026-04-25 00:15:16.624171+03	2026-05-03 13:37:01.639+03	10	701	\N	f	\N
98	Water	\N	Other	25.00	/uploads/drink-1777065361923.webp	t	5	\N	food-pastry	2026-04-25 00:16:01.77904+03	2026-05-03 13:37:09.421+03	10	699	\N	f	\N
78	Hot Chocolate	Hot Chocolate	Hot Drinks	160.00	/uploads/drink-1777061974677.webp	t	120	341	hot-bar	2026-04-23 15:56:11.79441+02	2026-05-03 15:25:48.278+03	2	501	\N	t	1
117	Dark Chocolate Cranberry	\N	Snacks	65.00	/uploads/drink-1777886075245.webp	t	120	\N	food-pastry	2026-05-02 18:29:30.391507+03	2026-05-04 12:14:35.247+03	9	1008	\N	f	\N
132	Juava Juice	\N	Other	95.00	/uploads/drink-1777905779305.webp	t	120	\N	food-pastry	2026-05-04 17:42:58.900932+03	2026-05-04 17:44:06.803+03	10	717	\N	f	\N
93	Blueberry Mojito	Blueberry Mojito	Chillers	95.00	/uploads/drink-1777048338131.webp	t	120	\N	main-bar	2026-04-24 19:32:18.012923+03	2026-05-02 18:56:09.968+03	7	407	\N	t	\N
86	White Mocha	White Mocha	Hot Coffee	190.00	/uploads/drink-1777064974501.webp	t	180	326	hot-bar	2026-04-23 18:37:19.282201+02	2026-05-03 12:22:29.947+03	1	136	\N	t	1
89	Lotus Spanish Latte	Lotus Spanish Latte	Hot Coffee	185.00	/uploads/drink-1777061552571.webp	t	180	346	hot-bar	2026-04-23 19:17:05.222964+02	2026-05-03 12:19:02.514+03	1	132	\N	t	1
87	Mocha Toffee Nut	Mocha Toffee Nut	Hot Coffee	190.00	/uploads/drink-1777064800581.webp	t	180	336	hot-bar	2026-04-23 18:53:03.737594+02	2026-05-03 12:23:46.27+03	1	138	300	t	1
82	Early Gray 	Early Gray 	Hot Drinks	70.00	/uploads/drink-1777063180376.webp	t	120	\N	hot-bar	2026-04-23 16:46:31.540705+02	2026-05-02 20:01:11.812+03	2	503	\N	t	1
92	Aero press	\N	Hot Coffee	175.00	/uploads/drink-1777064082005.webp	t	179	300	turkish-bar	2026-04-23 23:35:26.352369+02	2026-05-03 12:24:50.962+03	1	141	300	t	3
79	Single Turkish Coffee	Single Turkish Coffee	Hot Coffee	85.00	/uploads/drink-1777062474172.webp	t	120	\N	turkish-bar	2026-04-23 16:24:27.969584+02	2026-05-03 12:25:29.63+03	1	142	297	t	3
4	Americano	Espresso diluted with hot water	Hot Coffee	110.00	/uploads/drink-1776539806813.webp	t	180	186	hot-bar	2026-04-17 00:56:14.298422+02	2026-05-03 11:42:13.197+03	1	106	298	t	1
64	Green Apple Redbull	\N	Chillers	200.00	/uploads/drink-1776870183464.webp	t	120	442	cold-bar-test	2026-04-22 17:03:03.324339+02	2026-05-05 17:37:20.465+03	7	408	\N	t	2
104	Sparkling Water	\N	Other	55.00	/uploads/drink-1777886542851.png	t	120	\N	food-pastry	2026-04-28 22:20:12.066018+03	2026-05-11 16:04:55.634+03	10	700	\N	f	\N
95	Salted Vanilla Latte 	\N	Hot Coffee	180.00	/uploads/drink-1777060641366.webp	t	180	321	hot-bar	2026-04-24 22:56:10.811333+03	2026-04-30 23:23:32.786+03	1	126	\N	t	1
72	Salted Caramel Cortado	Salted Caramel Cortado	Hot Coffee	135.00	/uploads/drink-1776882844507.webp	t	120	155	hot-bar	2026-04-22 20:17:02.760283+02	2026-05-03 12:09:16.563+03	1	114	298	t	1
73	Pistachio Flat White	\N	Hot Coffee	175.00	/uploads/drink-1776882814202.webp	t	180	216	hot-bar	2026-04-22 20:26:47.24347+02	2026-05-03 12:11:15.075+03	1	118	298	t	1
18	Red Eye	\N	Hot Coffee	205.00	/uploads/drink-1776604172685.webp	t	120	200	hot-bar	2026-04-19 15:09:32.601751+02	2026-05-03 12:14:46.056+03	1	105	300	t	1
96	Pistachio Latte	\N	Hot Coffee	215.00	/uploads/drink-1777060983934.webp	t	120	326	hot-bar	2026-04-24 23:03:03.828041+03	2026-05-03 12:17:52.883+03	1	128	300	t	1
124	Wuder Sugar Free Belgian Dark Chocolate  70%	\N	Snacks	75.00	/uploads/drink-1777897518286.jpeg	t	120	\N	food-pastry	2026-05-04 15:14:51.682105+03	2026-05-04 16:11:16.388+03	9	1004	\N	f	\N
83	Matcha Latte	Matcha Latte	Matcha	190.00	/uploads/drink-1777064140295.webp	t	180	320	hot-bar	2026-04-23 17:04:53.1351+02	2026-05-03 15:26:19.473+03	8	301	305	t	1
15	Espresso	Bold and bright. Red fruit up front, sharp acidity, intense finish	Hot Coffee	95.00	/uploads/drink-1776598492814.webp	t	120	80	hot-bar	2026-04-19 13:34:52.689696+02	2026-05-05 14:45:47.687+03	1	101	297	t	2
22	Iced Cortado	\N	Cold Coffee	130.00	/uploads/drink-1776621277882.webp	t	180	225	cold-bar-test	2026-04-19 19:54:37.814383+02	2026-05-05 17:37:20.465+03	3	154	305	t	2
23	Iced Salted Caramel Cortado	\N	Cold Coffee	160.00	/uploads/drink-1776673259684.webp	t	180	240	cold-bar-test	2026-04-20 10:20:59.311017+02	2026-05-05 17:37:20.465+03	3	155	305	t	2
28	Iced Flat White 	\N	Cold Coffee	135.00	/uploads/drink-1776768957647.webp	t	180	316	cold-bar-test	2026-04-21 12:52:51.263025+02	2026-05-05 17:37:20.465+03	3	156	305	t	2
47	Salted Vanilla Latte Frappe	Salted Vanilla Latte Frappe	Frappe	180.00	/uploads/drink-1776865681286.webp	t	179	351	cold-bar-test	2026-04-21 17:04:56.671743+02	2026-05-05 17:37:20.465+03	6	210	302	t	2
39	Iced Pistachio Latte 	\N	Cold Coffee	215.00	/uploads/drink-1776778998129.webp	t	180	386	cold-bar-test	2026-04-21 15:43:18.05558+02	2026-05-05 17:37:20.465+03	3	163	302	t	2
27	Pistachio Latte  Frappe	\N	Frappe	230.00	/uploads/drink-1776766530555.webp	t	180	386	cold-bar-test	2026-04-21 12:14:14.658762+02	2026-05-05 17:37:20.465+03	6	211	302	t	2
67	Peach Ice Tea	\N	Chillers	120.00	/uploads/drink-1776874328517.webp	t	120	480	cold-bar-test	2026-04-22 18:12:08.446017+02	2026-05-05 17:37:20.465+03	7	402	302	t	2
29	Cortado Frappe	Cortado	Frappe	155.00	/uploads/drink-1776847766237.webp	t	180	235	cold-bar-test	2026-04-21 13:28:21.108891+02	2026-05-05 17:37:20.465+03	6	203	305	t	2
60	Iced Chocolate  Frappe	Iced Chocolate Frappe	Frappe	160.00	/uploads/drink-1776865634872.webp	t	180	380	cold-bar-test	2026-04-22 15:20:23.319218+02	2026-05-05 17:37:20.465+03	6	219	302	t	2
34	Flat White Frappe	Flat white Frappe	Frappe	155.00	/uploads/drink-1776850808907.webp	t	180	276	cold-bar-test	2026-04-21 14:40:29.073305+02	2026-05-05 17:37:20.465+03	6	205	305	t	2
68	Pina Colada	\N	Chillers	115.00	/uploads/drink-1776880394136.webp	t	180	480	cold-bar-test	2026-04-22 19:39:23.947201+02	2026-05-05 17:37:20.465+03	7	403	302	t	2
35	Pistachio Flat White Frappe	Pistachio Flat white Frappe	Frappe	220.00	/uploads/drink-1776851583550.webp	t	180	356	cold-bar-test	2026-04-21 14:52:16.383287+02	2026-05-05 17:37:20.465+03	6	206	305	t	2
38	Hazelnut Flat White Frappe	Hazelnut Flat white Frappe	Frappe	175.00	/uploads/drink-1777200365620.webp	t	180	341	cold-bar-test	2026-04-21 15:35:30.992901+02	2026-05-05 17:37:20.465+03	6	207	305	t	2
43	Almond Flat White Frappe	Almond Flat white Frappe	Frappe	220.00	/uploads/drink-1776865773113.webp	t	180	358	cold-bar-test	2026-04-21 16:31:38.124632+02	2026-05-05 17:37:20.465+03	6	208	305	t	2
37	Iced Salted Vanilla Latte	\N	Cold Coffee	180.00	/uploads/drink-1776777269270.webp	t	180	386	cold-bar-test	2026-04-21 15:14:29.204767+02	2026-05-05 17:37:20.465+03	3	162	\N	t	2
40	Iced Spanish Latte	\N	Cold Coffee	175.00	/uploads/drink-1776779467529.webp	t	180	401	cold-bar-test	2026-04-21 15:51:07.465885+02	2026-05-05 17:37:20.465+03	3	164	302	t	2
41	Iced Lotus Spanish Latte	\N	Cold Coffee	185.00	/uploads/drink-1776780668361.webp	t	180	406	cold-bar-test	2026-04-21 16:11:08.291641+02	2026-05-05 17:37:20.465+03	3	165	305	t	2
24	Iced Mocha Toffy Nut	\N	Cold Coffee	190.00	/uploads/drink-1776768680886.webp	t	180	406	cold-bar-test	2026-04-20 12:04:24.991179+02	2026-05-05 17:37:20.465+03	3	168	302	t	2
31	Salted Caramel Cortado Frappe	Salted Caramel Cortado Frappe	Frappe	170.00	/uploads/drink-1776850078710.webp	t	180	250	cold-bar-test	2026-04-21 14:18:53.859746+02	2026-05-05 17:37:20.465+03	6	204	305	t	2
65	Blue Passion Redbull	\N	Chillers	200.00	/uploads/drink-1776871366600.webp	t	180	447	cold-bar-test	2026-04-22 17:22:46.462689+02	2026-05-05 17:37:20.465+03	7	409	\N	t	2
42	Iced Mocha	\N	Cold Coffee	180.00	/uploads/drink-1776781418189.webp	t	180	396	cold-bar-test	2026-04-21 16:23:38.123158+02	2026-05-05 17:37:20.465+03	3	166	302	t	2
53	Lotus Spanish Frappe	Lotus Spanish Latte Frappe	Frappe	195.00	/uploads/drink-1776865792324.webp	t	180	386	cold-bar-test	2026-04-21 19:21:31.680396+02	2026-05-05 17:37:20.465+03	6	213	302	t	2
59	Peanut Butter Frappe	Peanut Butter Frappe	Frappe	240.00	/uploads/drink-1776865646797.webp	t	180	410	cold-bar-test	2026-04-22 14:19:29.987366+02	2026-05-05 17:37:20.465+03	6	217	302	t	2
58	Nutty Fudge	Nutty Fadge	Frappe	230.00	/uploads/drink-1776865617341.webp	t	180	390	cold-bar-test	2026-04-22 14:03:09.237619+02	2026-05-05 17:37:20.465+03	6	218	302	t	2
57	Purple Mango	Purple Mango	Chillers	105.00	/uploads/drink-1776865866270.webp	t	180	445	cold-bar-test	2026-04-21 20:49:55.636558+02	2026-05-05 17:37:20.465+03	7	404	302	t	2
48	Iced Strawberry Matcha  	\N	Matcha	200.00	/uploads/drink-1776784211926.webp	t	180	410	cold-bar-test	2026-04-21 17:09:57.901542+02	2026-05-05 17:37:20.465+03	8	302	302	t	2
33	Iced Almond Flat White	\N	Cold Coffee	185.00	/uploads/drink-1776775175937.webp	t	185	306	cold-bar-test	2026-04-21 14:39:35.809292+02	2026-05-05 17:37:20.465+03	3	159	\N	t	2
61	Green Apple Mojito	\N	Chillers	105.00	/uploads/drink-1776868531124.webp	t	120	381	cold-bar-test	2026-04-22 15:52:03.079181+02	2026-05-05 17:37:20.465+03	7	405	\N	t	2
14	Cappuccino 	\N	Hot Coffee	130.00	/uploads/drink-1776594692815.webp	t	180	286	cold-bar-test	2026-04-18 22:55:06.672696+02	2026-05-05 17:37:20.465+03	1	108	300	t	2
66	Blueberry Redbull	\N	Chillers	200.00	/uploads/drink-1776872272368.webp	t	120	442	cold-bar-test	2026-04-22 17:31:38.875525+02	2026-05-05 17:37:20.465+03	7	410	\N	t	2
55	Mocha Toffeenut Frappe	Mocha Toffeenut Frappe	Frappe	250.00	/uploads/drink-1776865825129.webp	t	180	386	cold-bar-test	2026-04-21 19:58:08.945774+02	2026-05-05 17:37:20.465+03	6	215	\N	t	2
69	Iced Americano	\N	Cold Coffee	125.00	/uploads/drink-1776880778404.webp	t	180	166	cold-bar-test	2026-04-22 19:59:38.332656+02	2026-05-05 17:37:20.465+03	3	151	302	t	2
21	Iced Cappuccino	\N	Cold Coffee	135.00	/uploads/drink-1776620485955.webp	t	180	356	cold-bar-test	2026-04-19 18:27:26.264089+02	2026-05-05 17:37:20.465+03	3	152	302	t	2
56	White Mocha Frappe	White Mocha Frappe	Frappe	195.00	/uploads/drink-1776865848760.webp	t	180	376	cold-bar-test	2026-04-21 20:09:27.399558+02	2026-05-05 17:37:20.465+03	6	216	302	t	2
70	Iced Caramel Macchiato	\N	Cold Coffee	180.00	/uploads/drink-1776881568413.webp	t	180	396	cold-bar-test	2026-04-22 20:05:27.945046+02	2026-05-05 17:37:20.465+03	3	153	305	t	2
30	Iced Pistachio Flat White 	\N	Cold Coffee	175.00	/uploads/drink-1776772978556.webp	t	180	306	cold-bar-test	2026-04-21 14:02:58.107547+02	2026-05-05 17:37:20.465+03	3	157	305	t	2
32	Iced Hazelnut Flat White	\N	Cold Coffee	165.00	/uploads/drink-1776773970509.webp	t	180	296	cold-bar-test	2026-04-21 14:19:30.378586+02	2026-05-05 17:37:20.465+03	3	158	305	t	2
36	Iced Latte 	\N	Cold Coffee	150.00	/uploads/drink-1776775945227.webp	t	180	386	cold-bar-test	2026-04-21 14:52:25.160373+02	2026-05-05 17:37:20.465+03	3	161	302	t	2
46	Iced White Mocha 	\N	Cold Coffee	180.00	/uploads/drink-1776784061810.webp	t	180	406	cold-bar-test	2026-04-21 17:00:40.283097+02	2026-05-05 17:37:20.465+03	3	167	302	t	2
25	Cappuccino Frappe	Cappuccino Frappe	Frappe	175.00	/uploads/drink-1776768691663.webp	t	180	356	cold-bar-test	2026-04-20 16:57:51.071604+02	2026-05-05 17:37:20.465+03	6	201	302	t	2
26	Caramel Macchiato Frappe	Caramel Macchiato Frappe	Frappe	215.00	/uploads/drink-1776769064189.webp	t	180	401	cold-bar-test	2026-04-21 10:49:45.395702+02	2026-05-05 17:37:20.465+03	6	202	302	t	2
50	Spanish Frappe	Spanish Frappe	Frappe	180.00	/uploads/drink-1776865743671.webp	t	180	376	cold-bar-test	2026-04-21 17:30:13.309023+02	2026-05-05 17:37:20.465+03	6	212	302	t	2
51	Iced White Chocolate Matcha	\N	Matcha	200.00	/uploads/drink-1776786707364.webp	t	240	430	cold-bar-test	2026-04-21 17:51:47.226807+02	2026-05-05 17:37:20.465+03	8	303	302	t	2
54	Mocha Frappe	Mocha Frappe	Frappe	180.00	/uploads/drink-1776865806665.webp	t	180	371	cold-bar-test	2026-04-21 19:34:34.076977+02	2026-05-05 17:37:20.465+03	6	214	302	t	2
52	Iced Honey Matcha	\N	Matcha	200.00	/uploads/drink-1776787608337.webp	t	180	430	cold-bar-test	2026-04-21 18:06:48.208801+02	2026-05-05 17:37:20.465+03	8	304	302	t	2
100	Pink Lady	\N	Chillers	105.00	/uploads/drink-1777293843590.webp	t	120	420	cold-bar-test	2026-04-27 15:44:03.509723+03	2026-05-08 00:14:54.25+03	7	401	302	t	2
62	Blue Passion Mojito	\N	Chillers	105.00	/uploads/drink-1776869250752.webp	t	120	547	cold-bar-test	2026-04-22 16:37:05.10557+02	2026-05-11 17:31:31.296+03	7	406	\N	t	2
\.


--
-- Data for Name: ingredient_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_categories (id, name, sort_order, created_at) FROM stdin;
1	Coffee	0	2026-04-17 00:56:14.290913+02
2	Milk	1	2026-04-17 00:56:14.290913+02
3	Syrup	2	2026-04-17 00:56:14.290913+02
4	Sauce	3	2026-04-17 00:56:14.290913+02
5	Topping	4	2026-04-17 00:56:14.290913+02
6	Foam	5	2026-04-17 01:13:30.499323+02
7	Sweetner	6	2026-04-17 01:13:42.636801+02
8	Base/Powder	7	2026-04-17 01:14:18.428196+02
9	Garnish	8	2026-04-17 01:14:46.827373+02
10	Empty Type	9	2026-04-18 23:14:54.568576+02
12	None	10	2026-04-24 23:54:39.171856+03
\.


--
-- Data for Name: ingredient_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_options (id, ingredient_id, label, processed_qty, produced_qty, produced_unit, extra_cost, is_default, sort_order, linked_ingredient_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ingredient_type_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_type_volumes (id, ingredient_type_id, volume_id, processed_qty, produced_qty, unit, extra_cost, is_default, sort_order, is_active) FROM stdin;
139	51	10	20.0000	20.0000	\N	35.0000	f	0	t
49	19	9	15.0000	15.0000	\N	0.0000	f	0	t
50	19	10	30.0000	30.0000	\N	0.0000	f	1	t
97	56	18	30.0000	30.0000	\N	65.0000	f	0	t
98	56	19	45.0000	45.0000	\N	130.0000	f	0	t
144	95	20	1.0000	1.0000	\N	-0.0100	f	0	f
145	111	20	1.0000	1.0000	\N	0.0000	f	0	t
146	112	35	2.0000	2.0000	\N	0.0000	f	0	t
147	112	36	6.0000	6.0000	\N	0.0000	f	0	t
148	112	37	10.0000	10.0000	\N	0.0000	f	0	t
70	31	17	15.0000	15.0000	\N	35.0000	f	0	t
71	31	18	30.0000	30.0000	\N	70.0000	f	0	t
72	31	19	45.0000	45.0000	\N	105.0000	f	0	t
133	38	10	30.0000	30.0000	\N	0.0000	f	0	t
132	38	9	15.0000	15.0000	\N	55.0000	f	0	t
137	49	11	45.0000	45.0000	\N	75.0000	f	0	t
135	49	9	15.0000	15.0000	\N	30.0000	f	0	t
99	27	17	15.0000	15.0000	\N	0.0000	f	0	t
100	27	18	30.0000	30.0000	\N	0.0000	f	0	t
101	27	19	45.0000	45.0000	\N	0.0000	f	0	t
52	65	9	\N	\N	\N	0.0000	f	0	t
53	65	10	\N	\N	\N	0.0000	f	1	t
54	65	11	\N	\N	\N	0.0000	f	2	t
65	84	20	\N	\N	\N	0.0000	f	0	t
66	84	21	\N	\N	\N	0.0000	f	1	t
67	84	22	\N	\N	\N	0.0000	f	2	t
68	68	23	\N	\N	\N	0.0000	t	0	t
69	68	24	\N	\N	\N	0.0000	f	1	t
102	35	17	15.0000	15.0000	\N	30.0000	f	0	t
103	35	18	30.0000	30.0000	\N	55.0000	f	0	t
104	35	19	45.0000	45.0000	\N	75.0000	f	0	t
105	35	8	0.0000	0.0000	\N	0.0000	f	0	t
107	28	18	30.0000	30.0000	\N	55.0000	f	0	t
91	59	19	45.0000	45.0000	\N	0.0000	f	0	t
90	59	18	30.0000	30.0000	\N	0.0000	f	0	t
106	28	17	15.0000	15.0000	\N	0.0000	f	0	t
108	28	19	45.0000	45.0000	\N	0.0000	f	0	t
79	22	9	35.0000	35.0000	\N	35.0000	t	0	f
96	56	17	15.0000	15.0000	\N	0.0000	f	0	t
34	11	1	18.0000	18.0000	\N	0.0000	f	0	t
37	12	1	18.0000	18.0000	\N	0.0000	f	0	t
39	12	3	36.0000	54.0000	\N	65.0000	f	2	t
76	91	25	\N	\N	\N	0.0000	f	0	t
142	33	10	20.0000	20.0000	\N	35.0000	f	0	t
141	33	9	10.0000	10.0000	\N	0.0000	f	0	t
143	33	11	30.0000	30.0000	\N	70.0000	f	0	t
62	62	9	10.0000	10.0000	\N	35.0000	f	0	t
63	62	10	20.0000	20.0000	\N	70.0000	f	1	t
64	62	11	30.0000	30.0000	\N	105.0000	f	2	t
55	17	9	10.0000	10.0000	\N	0.0000	f	0	t
138	51	9	10.0000	10.0000	\N	0.0000	f	0	t
140	51	11	30.0000	30.0000	\N	70.0000	f	0	t
51	19	11	45.0000	45.0000	\N	55.0000	f	2	t
58	20	9	10.0000	10.0000	\N	35.0000	f	0	t
59	20	10	20.0000	20.0000	\N	70.0000	f	1	t
61	20	11	30.0000	30.0000	\N	105.0000	f	2	t
35	11	2	18.0000	36.0000	\N	0.0000	t	1	t
38	12	2	18.0000	36.0000	\N	0.0000	t	1	t
77	91	26	\N	\N	\N	0.0000	t	0	t
43	34	1	18.0000	18.0000	\N	0.0000	f	0	f
123	72	26	1.0000	1.0000	\N	0.0000	t	0	f
130	52	10	20.0000	20.0000	\N	55.0000	f	0	t
78	91	27	\N	\N	\N	0.0000	f	0	t
80	40	9	10.0000	10.0000	\N	0.0000	f	0	t
81	40	10	20.0000	20.0000	\N	0.0000	f	0	t
82	40	11	30.0000	30.0000	\N	0.0000	f	0	t
83	21	9	10.0000	10.0000	\N	0.0000	f	0	t
84	21	10	20.0000	20.0000	\N	0.0000	f	0	t
85	21	11	30.0000	30.0000	\N	0.0000	f	0	t
86	83	20	1.0000	1.0000	\N	0.0000	f	0	t
87	83	21	2.0000	2.0000	\N	0.0000	f	0	t
117	60	17	15.0000	15.0000	\N	0.0000	f	0	t
118	60	18	30.0000	30.0000	\N	0.0000	f	0	t
119	60	19	45.0000	45.0000	\N	0.0000	f	0	t
121	24	9	3.0000	70.0000	\N	0.0000	f	0	t
122	34	9	30.0000	30.0000	\N	0.0000	f	0	t
131	52	11	30.0000	30.0000	\N	75.0000	f	0	t
129	52	9	10.0000	10.0000	\N	30.0000	f	0	t
134	38	11	45.0000	45.0000	\N	75.0000	f	0	t
136	49	10	30.0000	30.0000	\N	55.0000	f	0	t
88	83	22	3.0000	3.0000	\N	0.0000	f	0	t
92	32	17	15.0000	15.0000	\N	0.0000	f	0	t
112	22	8	0.0000	0.0000	\N	0.0000	f	0	f
56	17	10	20.0000	20.0000	\N	35.0000	f	1	t
57	17	11	30.0000	30.0000	\N	70.0000	f	2	t
74	18	18	30.0000	30.0000	\N	0.0000	f	0	t
110	61	18	30.0000	30.0000	\N	55.0000	f	0	t
111	61	19	45.0000	45.0000	\N	75.0000	f	0	t
109	61	17	15.0000	15.0000	\N	30.0000	f	0	t
113	63	9	30.0000	30.0000	\N	0.0000	f	0	t
114	44	17	15.0000	15.0000	\N	0.0000	f	0	t
115	44	18	30.0000	30.0000	\N	0.0000	f	0	t
116	44	19	45.0000	45.0000	\N	0.0000	f	0	t
89	59	17	15.0000	15.0000	\N	0.0000	f	0	t
73	18	17	15.0000	15.0000	\N	0.0000	f	0	t
75	18	19	45.0000	45.0000	\N	0.0000	f	0	t
36	11	3	36.0000	54.0000	\N	65.0000	f	2	t
\.


--
-- Data for Name: ingredient_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_types (id, category_id, name, inventory_ingredient_id, is_active, sort_order, created_at, processed_qty, produced_qty, unit, affects_cup_size, color, extra_cost, pricing_mode) FROM stdin;
114	1	Arabic coffee	234	t	79	2026-05-03 12:31:37.409592+03	20.0000	20.0000	ml	t	#000000	0.0000	volume
55	8	Pistachio Beans	\N	t	0	2026-04-17 13:34:31.48809+02	0.0000	0.0000	ml	t	\N	0.0000	volume
34	1	Coffee Powder	268	t	0	2026-04-17 13:34:31.474428+02	0.0000	0.0000	ml	t	#000000	0.0000	volume
111	9	Wunder	\N	t	82	2026-04-27 19:53:28.638485+03	1.0000	1.0000	ml	t	#000000	0.0000	volume
97	1	Light Plain	230	t	74	2026-04-23 16:59:06.948472+02	0.0000	0.0000	ml	t	#6f6262	0.0000	volume
73	10	None	\N	t	62	2026-04-18 23:15:15.231578+02	0.0000	0.0000	ml	t	\N	0.0000	volume
75	6	Creamy Milk	\N	t	64	2026-04-19 10:37:47.946058+02	0.0000	40.0000	ml	t	\N	0.0000	volume
76	6	More Foam	\N	t	65	2026-04-19 10:37:59.200761+02	0.0000	70.0000	ml	t	\N	0.0000	volume
87	6	Steam Milk	\N	t	74	2026-04-19 14:24:16.460348+02	120.0000	40.0000	ml	t	\N	0.0000	volume
45	8	Mango Juice	\N	t	0	2026-04-17 13:34:31.481282+02	0.0000	0.0000	ml	t	#fb8a2d	0.0000	volume
91	8	Ice Cubes	\N	t	78	2026-04-19 18:35:21.282845+02	0.0000	0.0000	ml	t	#75caff	0.0000	volume
37	8	Earl Gray	\N	t	0	2026-04-17 13:34:31.476807+02	0.0000	0.0000	ml	t	#b18b8b	0.0000	volume
107	12	Pofana Water	\N	t	83	2026-04-25 01:34:17.281376+03	1.0000	1.0000	ml	f	#000000	0.0000	volume
85	10	Hot Water	\N	t	72	2026-04-19 14:01:24.666867+02	0.0000	0.0000	ml	t	#c7e9f0	0.0000	volume
110	8	Water	\N	t	84	2026-04-27 15:47:47.41281+03	0.0000	0.0000	ml	t	#c9dfe8	0.0000	volume
74	6	Light Foam	\N	t	63	2026-04-19 10:37:24.826197+02	0.0000	20.0000	ml	t	#ffffff	0.0000	volume
63	8	Vanilla	269	t	0	2026-04-17 13:34:31.493864+02	0.0000	0.0000	ml	t	#f0d794	0.0000	volume
12	1	Ethiobian	225	t	2	2026-04-17 02:08:45.387832+02	0.0000	0.0000	ml	t	#391919	0.0000	volume
11	1	Colombian	224	t	1	2026-04-17 01:45:16.545834+02	0.0000	0.0000	ml	t	#3c1515	0.0000	volume
98	1	Light Blend	231	t	75	2026-04-23 16:59:46.494449+02	0.0000	0.0000	ml	t	#6c5a5a	0.0000	volume
89	1	Ethiopia Sedamo	226	t	76	2026-04-19 15:06:26.078165+02	20.0000	300.0000	ml	t	#503030	0.0000	volume
99	1	Medium Blend	233	t	76	2026-04-23 17:00:34.836301+02	0.0000	0.0000	ml	f	#5b4d4d	0.0000	volume
90	1	Colombia Tres Dragons	229	t	77	2026-04-19 15:23:02.005365+02	20.0000	300.0000	ml	t	#816565	0.0000	volume
100	1	Medium Plain	232	t	77	2026-04-23 17:00:57.586555+02	0.0000	0.0000	ml	t	#4c3e3e	0.0000	volume
101	1	Ethiobian Sedama	226	t	78	2026-04-23 18:26:29.606799+02	0.0000	0.0000	ml	f	#543b3b	0.0000	volume
103	1	Colombia Lassbrinza	228	t	79	2026-04-23 18:29:54.275094+02	0.0000	0.0000	ml	t	#534646	0.0000	volume
109	1	Colombia Watermelon	227	t	84	2026-04-26 13:10:10.537201+03	0.0000	0.0000	ml	t	#684a4a	0.0000	volume
79	2	Lactos Free Milk	241	t	68	2026-04-19 10:58:33.295293+02	0.0000	0.0000	ml	t	#fff5f5	65.0000	unit
27	4	Almond Sauce	267	t	0	2026-04-17 13:34:31.470427+02	0.0000	0.0000	ml	t	#fffdf0	0.0000	volume
26	8	Almond Beans	266	t	0	2026-04-17 13:34:31.469802+02	2.0000	2.0000	ml	t	#f5e3bd	0.0000	volume
47	2	Skimmed Milk	236	t	0	2026-04-17 13:34:31.483315+02	0.0000	0.0000	ml	t	#faf4f4	0.1500	unit
14	2	Full Cream	235	t	0	2026-04-17 13:34:31.460785+02	0.0000	0.0000	ml	t	#ffffff	0.0000	unit
16	2	Almond Milk	239	t	0	2026-04-17 13:34:31.462472+02	0.0000	0.0000	ml	t	#ecdfdf	65.0000	unit
35	2	Condensed	242	t	0	2026-04-17 13:34:31.475476+02	0.0000	0.0000	ml	t	#f7f7f7	65.0000	unit
82	2	Coconut Milk	237	t	70	2026-04-19 11:01:23.842042+02	0.0000	0.0000	ml	t	#eee2e2	65.0000	unit
21	7	White Sugar	260	t	0	2026-04-17 13:34:31.466486+02	0.0000	0.0000	ml	t	#000000	0.0000	volume
80	2	Soay Milk	240	t	69	2026-04-19 10:58:53.117776+02	0.0000	0.0000	ml	t	#f3ecec	65.0000	unit
15	2	Oat	238	t	0	2026-04-17 13:34:31.46161+02	0.0000	0.0000	ml	t	#f3e2e2	65.0000	unit
81	2	Skimmed Milk	236	t	69	2026-04-19 11:00:35.26027+02	0.0000	0.0000	ml	t	#fafafa	0.0000	unit
88	2	Extra Macchiato Foam	235	t	75	2026-04-19 14:30:14.223934+02	120.0000	60.0000	ml	t	#ded9d9	0.5500	volume
20	3	Hazelnut	257	t	0	2026-04-17 13:34:31.465792+02	0.0000	0.0000	ml	t	#937b7b	0.0000	volume
29	3	Bluecuracao	253	t	0	2026-04-17 13:34:31.47154+02	0.0000	0.0000	ml	t	#94b8ff	0.0000	volume
62	3	Tofft Nut	256	t	0	2026-04-17 13:34:31.493107+02	0.0000	0.0000	ml	t	#d2bf60	0.0000	volume
33	3	Coconut	254	t	0	2026-04-17 13:34:31.473878+02	0.0000	0.0000	ml	t	#c5cbb9	0.0000	volume
17	3	Vanilla	259	t	0	2026-04-17 13:34:31.463261+02	0.0000	0.0000	ml	t	#fbedbc	0.0000	volume
51	3	Peach	255	t	0	2026-04-17 13:34:31.485552+02	0.0000	0.0000	ml	t	#da7e16	0.0000	volume
19	4	Chocolate	261	t	0	2026-04-17 13:34:31.46499+02	0.0000	0.0000	ml	t	#694949	0.0000	volume
60	4	Starwberry	252	t	0	2026-04-17 13:34:31.491628+02	0.0000	0.0000	ml	t	#e40c0c	0.0000	volume
28	4	Blueberry	249	t	0	2026-04-17 13:34:31.47094+02	0.0000	0.0000	ml	f	#584785	0.0000	volume
44	4	Lotus	265	t	0	2026-04-17 13:34:31.480702+02	0.0000	0.0000	ml	t	#dd9e73	0.0000	volume
18	4	Caramel	248	t	0	2026-04-17 13:34:31.464295+02	0.0000	0.0000	ml	t	#da882b	0.0000	volume
56	4	Pistachio	245	t	0	2026-04-17 13:34:31.488796+02	0.0000	0.0000	ml	t	#7bdd6e	0.0000	volume
59	4	Salted Caramel	264	t	0	2026-04-17 13:34:31.49058+02	0.0000	0.0000	ml	t	#bf6d36	0.0000	volume
49	8	Passion Fruit	250	t	0	2026-04-17 13:34:31.484356+02	0.0000	0.0000	ml	t	#ff9d2e	0.0000	volume
68	5	Ice Cream	243	t	0	2026-04-17 13:34:31.496973+02	0.0000	0.0000	ml	t	#eedddd	0.0000	volume
22	5	Whipped Cream	244	t	0	2026-04-17 13:34:31.467245+02	35.0000	35.0000	ml	t	#f5e5e5	0.0000	volume
86	6	Macchiato Foam	235	t	73	2026-04-19 14:23:40.814682+02	120.0000	40.0000	ml	t	#000000	0.0000	volume
40	7	Honey	283	t	0	2026-04-17 13:34:31.478427+02	0.0000	0.0000	ml	t	#e8d48c	0.0000	volume
65	4	White Chocolate	262	t	0	2026-04-17 13:34:31.4949+02	0.0000	0.0000	ml	t	#f9e6e6	0.0000	volume
83	7	Dite Suger	274	t	71	2026-04-19 11:19:26.410405+02	0.0000	0.0000	ml	t	#000000	0.0000	volume
84	7	Brown Suger	273	t	72	2026-04-19 11:20:52.165713+02	0.0000	0.0000	ml	t	#000000	0.0000	volume
112	7	Sugar	275	t	82	2026-04-29 12:20:21.178523+03	0.0000	0.0000	ml	t	#ffffff	0.0000	volume
41	8	Lemon Juice	284	t	0	2026-04-17 13:34:31.479008+02	0.0000	0.0000	ml	t	#6cd077	0.0000	volume
58	8	Redbull	280	t	0	2026-04-17 13:34:31.48999+02	0.0000	0.0000	ml	t	#eec58c	0.0000	volume
24	8	Matcha	271	t	0	2026-04-17 13:34:31.468648+02	3.0000	70.0000	ml	t	#449442	0.0000	volume
61	8	Strawberry Juice	327	t	0	2026-04-17 13:34:31.492421+02	0.0000	0.0000	ml	t	#e76f6f	0.0000	volume
52	8	Peanutbutter	246	t	0	2026-04-17 13:34:31.486137+02	0.0000	0.0000	ml	t	#f8f1be	0.0000	volume
32	8	Chocolate	270	t	0	2026-04-17 13:34:31.473283+02	0.0000	0.0000	ml	t	#5e5050	0.0000	volume
31	3	Caramel	258	t	0	2026-04-17 13:34:31.472644+02	0.0000	0.0000	ml	t	#b86228	0.0000	volume
38	4	Green Apple	251	t	0	2026-04-17 13:34:31.477315+02	0.0000	0.0000	ml	t	#90f56b	0.0000	volume
71	8	Tea Packet	278	t	0	2026-04-17 13:34:31.498607+02	0.0000	0.0000	ml	t	#927272	0.0000	volume
95	8	Green Tea Pack	277	t	72	2026-04-23 16:34:59.518157+02	1.0000	1.0000	ml	f	#a9e085	0.0000	volume
96	8	Early Gray Tea	276	t	73	2026-04-23 16:48:32.249274+02	1.0000	1.0000	ml	f	#978282	0.0000	volume
93	8	Sprite	279	t	77	2026-04-22 16:27:21.652809+02	0.0000	0.0000	ml	t	#a1f2b5	0.0000	volume
57	8	Rani Peach	281	t	0	2026-04-17 13:34:31.48929+02	240.0000	240.0000	ml	t	#f17b3b	0.0000	volume
94	8	Pinaple	282	t	75	2026-04-22 19:52:38.372292+02	0.0000	0.0000	ml	t	#edff61	0.0000	volume
72	9	Lemon Slices	284	t	0	2026-04-17 13:34:31.499256+02	0.0000	0.0000	ml	t	#a8e193	0.0000	volume
48	9	Mint Leaves	285	t	0	2026-04-17 13:34:31.483833+02	0.0000	0.0000	ml	t	#39ea8e	0.0000	volume
106	12	Pufana Water	318	t	82	2026-04-25 01:29:27.487606+03	0.0000	0.0000	ml	f	#000000	0.0000	volume
105	8	V Cola	320	t	81	2026-04-25 00:19:58.220487+03	0.0000	0.0000	ml	t	#f0f0f0	0.0000	volume
\.


--
-- Data for Name: ingredient_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_volumes (id, name, processed_qty, produced_qty, unit, sort_order, created_at) FROM stdin;
4	No Milk	0.0000	0.0000	ml	3	2026-04-17 00:56:14.294489+02
5	Small (100ml)	100.0000	100.0000	ml	4	2026-04-17 00:56:14.294489+02
6	Medium (150ml)	150.0000	150.0000	ml	5	2026-04-17 00:56:14.294489+02
7	Large (200ml)	200.0000	200.0000	ml	6	2026-04-17 00:56:14.294489+02
8	None	0.0000	0.0000	ml	7	2026-04-17 00:56:14.294489+02
11	3 Pumps	30.0000	30.0000	ml	10	2026-04-17 00:56:14.294489+02
12	No Sauce	0.0000	0.0000	ml	11	2026-04-17 00:56:14.294489+02
13	Light Drizzle	10.0000	10.0000	ml	12	2026-04-17 00:56:14.294489+02
14	Heavy Drizzle	20.0000	20.0000	ml	13	2026-04-17 00:56:14.294489+02
16	Add Cream	30.0000	30.0000	g	15	2026-04-17 00:56:14.294489+02
9	1 Pump	10.0000	10.0000	ml	8	2026-04-17 00:56:14.294489+02
15	Without Whipped Cream	0.0000	0.0000	g	14	2026-04-17 00:56:14.294489+02
21	2 Pack	2.0000	2.0000	ml	20	2026-04-19 11:22:14.40218+02
20	1 Pack	1.0000	1.0000	ml	19	2026-04-19 11:21:56.344915+02
22	3 Pack	3.0000	3.0000	ml	21	2026-04-19 11:22:37.834017+02
23	1 Ball	40.0000	40.0000	ml	22	2026-04-19 14:15:05.783311+02
24	2 Ball	80.0000	80.0000	ml	23	2026-04-19 14:15:16.759683+02
25	Less Cubes	110.0000	110.0000	ml	24	2026-04-19 18:36:14.599311+02
26	Standard	130.0000	130.0000	ml	25	2026-04-19 18:36:41.66452+02
27	More Cubes	150.0000	150.0000	ml	26	2026-04-19 18:36:57.20925+02
17	1 Pump	15.0000	15.0000	ml	16	2026-04-19 10:35:09.924036+02
10	2 Pumps	20.0000	20.0000	ml	9	2026-04-17 00:56:14.294489+02
18	2 Pumps	30.0000	30.0000	ml	17	2026-04-19 10:35:37.495427+02
19	3 Pumps	45.0000	45.0000	ml	18	2026-04-19 10:35:52.635051+02
1	Single	18.0000	18.0000	ml	0	2026-04-17 00:56:14.294489+02
2	Double	18.0000	36.0000	ml	1	2026-04-17 00:56:14.294489+02
3	Triple	36.0000	54.0000	ml	2	2026-04-17 00:56:14.294489+02
35	Light	2.0000	2.0000	ml	27	2026-04-29 12:09:20.739529+03
36	Medium	6.0000	6.0000	ml	28	2026-04-29 12:12:51.240417+03
37	Extra	10.0000	10.0000	ml	29	2026-04-29 12:13:51.602953+03
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, slug, ingredient_type, unit, cost_per_unit, is_active, created_at, updated_at) FROM stdin;
295	Cup Holder Printed	cup-holder-printed	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:07:17.865+03
293	cup Holder 2	cup-holder-2	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.815+03
264	salted caramel Davinci 2L	salted-caramel-davinci-2l	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.604+03
256	Toffee nut syrup	toffee-nut-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.61+03
260	Sugar syrup 700 ml	sugar-syrup-700-ml	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.618+03
284	Lemon	lemon	other	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.618+03
252	strawberry monin puree	strawberry-monin-puree	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.618+03
271	matcha powder 250 g	matcha-powder-250-g	base	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.628+03
261	Dark Chocolate Davinci 2L	dark-chocolate-davinci-2l	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:50:32.164+03
269	Vanilla powder	vanilla-powder	base	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.217+03
337	Belgian Milk Chocolate Caramel Dragees 70g	belgian-milk-chocolate-caramel-dragees-70g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-04 16:18:42.029+03
329	Dark Chocolate Almond  35g	dark-chocolate-almond-35g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.973+03
331	Dark Chocolate Mint   35g	dark-chocolate-mint-35g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 18:02:11.565+03
236	Milk Dina Farm skimed 850 ml	milk-dina-farm-skimed-850-ml	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 21:39:48.629+03
241	Lactose Free Milk	lactose-free-milk	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.596+03
229	Tres Dragones Colombia	tres-dragones-colombia	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.837+03
237	coconut milk	coconut-milk	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.629+03
232	Medium Turkish coffee 250 g	medium-turkish-coffee-250-g	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.631+03
246	Peanut butter	peanut-butter	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 23:10:03.308+03
230	light Turkish coffee 250 g	light-turkish-coffee-250-g	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:48:28.428+03
225	Coffee guji	coffee-guji	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:49:52.43+03
245	pistachio sauce	pistachio-sauce	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-02 14:13:09.227+03
235	Milk Dina Farm Full cream 850 ml	milk-dina-farm-full-cream-850-ml	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:50:32.164+03
224	Coffee Colombia	coffee-colombia	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.217+03
244	whipping cream	whipping-cream	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.217+03
233	muhwij Medium Turkish coffee 250 g	muhwij-medium-turkish-coffee-250-g	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.842+03
239	almond milk	almond-milk	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.218+03
231	muhwij light Turkish coffee 250 g	muhwij-light-turkish-coffee-250-g	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:11:52.888+03
234	Arabic coffee	arabic-coffee	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.843+03
240	Soya milk	soya-milk	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:50.453+03
243	ice Crem	ice-crem	other	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:40:59.775+03
263	Caramel Davinci 2L	caramel-davinci-2l	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 18:02:40.206+03
238	oat milk	oat-milk	milk	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.849+03
226	Coffee Sidama	coffee-sidama	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.832+03
227	Colombia water melon	colombia-water-melon	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.834+03
228	La Esperanza Colombia	la-esperanza-colombia	coffee	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.836+03
242	condensed milk 370 g	condensed-milk-370-g	milk	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.853+03
247	White Chocolate  monin 2L	white-chocolate-monin-2l	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.86+03
281	Rani Peach 240 ml	rani-peach-240-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-02 15:17:46.856+03
283	honey 500 g	honey-500-g	sweetener	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.61+03
273	Brown Sugar	brown-sugar	sweetener	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.625+03
275	white sugar	white-sugar	sweetener	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.632+03
278	Ahmad tea english breakfast	ahmad-tea-english-breakfast	tea	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:48:28.432+03
334	Cashew Almond Pumpkin BAR 40g	cashew-almond-pumpkin-bar-40g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-04 16:29:14.342+03
274	Diet Sugar	diet-sugar	sweetener	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.907+03
291	white sandwich paper large	white-sandwich-paper-large	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.76+03
296	Take Away Bag Spacca	take-away-bag-spacca	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.823+03
309	jumbo Napkin	jumbo-napkin	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.067+03
311	Hand Glaves	hand-glaves	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.137+03
339	Sugar free Belgian Milk Chocolate Bar 30g	sugar-free-belgian-milk-chocolate-bar-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.628+03
340	Sugar free Belgian Dark Chocolate Bar 30g	sugar-free-belgian-dark-chocolate-bar-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.63+03
341	Sugar free Belgian Milk Chocolate Bar with Hazelnut 30g	sugar-free-belgian-milk-chocolate-bar-with-hazelnut-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.658+03
342	Sugar free Belgian Dark Chocolate Bar with Almond 30g	sugar-free-belgian-dark-chocolate-bar-with-almond-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.675+03
272	white sugar packs	white-sugar-packs	sweetener	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.428+03
276	Ahmad tea earl grey	ahmad-tea-earl-grey	tea	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.556+03
277	Ahmad tea Green	ahmad-tea-green	tea	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.569+03
280	Red Bull 250 ml	red-bull-250-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.619+03
289	isi Charger	isi-charger	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.752+03
292	butter paper	butter-paper	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:51.814+03
282	Rani Pineapple 240 ml	rani-pineapple-240-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.914+03
310	Expire Label	expire-label	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.115+03
312	Hand Glaves Black	hand-glaves-black	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.175+03
313	white paper plates	white-paper-plates	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.202+03
315	visa roll	visa-roll	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.27+03
316	cash roll	cash-roll	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.271+03
320	V Cola 300 ml	v-cola-300-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.363+03
321	V Cola Diet  300 ml	v-cola-diet-300-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.384+03
322	V Pina Colada 300 ml	v-pina-colada-300-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.388+03
323	V Gold Pineapple 300 ml	v-gold-pineapple-300-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.391+03
324	V pomegranate 300 ml	v-pomegranate-300-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.406+03
330	Dark Chocolate Almond/Cranberry  35g	dark-chocolate-almond-cranberry-35g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.508+03
332	Dark Chocolate Honeycomb 35g	dark-chocolate-honeycomb-35g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.531+03
333	Dark Chocolate Plain-70% 35g	dark-chocolate-plain-70-35g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.547+03
335	Almond Cashew Cranberry BAR 40g	almond-cashew-cranberry-bar-40g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.57+03
336	Almond Cashew Coconut BAR 40g	almond-cashew-coconut-bar-40g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.594+03
338	Belgian Milk Chocolate Hazelnut Dragees 70g	belgian-milk-chocolate-hazelnut-dragees-70g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:35:52.61+03
248	Caramel monin 2L	caramel-monin-2l	sauce	ml	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.581+03
267	Almond sauce	almond-sauce	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.217+03
266	Almond Beans	almond-beans	topping	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 11:05:44.218+03
285	mint	mint	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.919+03
286	vanilla liquid	vanilla-liquid	base	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.921+03
287	Straw	straw	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.923+03
344	Sugar free Belgian Strawberry Milk Chocolate Bar 30g	sugar-free-belgian-strawberry-milk-chocolate-bar-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.37+03
343	Sugar free Belgian Dark Chocolate Mint Bar  30g	sugar-free-belgian-dark-chocolate-mint-bar-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.371+03
270	chocolate powder	chocolate-powder	base	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 23:10:03.308+03
346	Tiramisu Cake 175g	tiramisu-cake-175g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.432+03
347	Triple Chocolate Cake 170g	triple-chocolate-cake-170g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.432+03
348	Belgian Chocolate Sable Box	belgian-chocolate-sable-box	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.493+03
349	Chocolate Butter Biscuits Box	chocolate-butter-biscuits-box	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.495+03
350	Chocolate Éclair	chocolate-clair	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.495+03
351	Pistachio Éclair	pistachio-clair	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.558+03
352	Pecan Tart	pecan-tart	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.561+03
353	Plain Butter Croissant	plain-butter-croissant	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 22:20:50.268+03
354	Croissant Emmental	croissant-emmental	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.62+03
355	Pate Roumi Cheese	pate-roumi-cheese	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.624+03
356	Pain Suise	pain-suise	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.624+03
357	Pain white cheese with oliv	pain-white-cheese-with-oliv	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-04-30 17:38:54.626+03
249	Blueberry monin Puree	blueberry-monin-puree	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.864+03
250	passion fruit monin Puree	passion-fruit-monin-puree	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.866+03
251	Green apple monin puree	green-apple-monin-puree	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.868+03
253	Blue Curacao syrup	blue-curacao-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.87+03
254	Coconut syrup	coconut-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.873+03
258	caramel syrup	caramel-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.881+03
262	White Chocolate  Davinci 2L	white-chocolate-davinci-2l	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.89+03
265	Lotus 400 g	lotus-400-g	sauce	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.894+03
268	coffee powder	coffee-powder	base	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.898+03
279	sprite 400 ml	sprite-400-ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.912+03
288	Stirrer	stirrer	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.925+03
290	Sleeve	sleeve	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.928+03
294	Ciup Holder 4	ciup-holder-4	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.932+03
297	cup hot 4 oz	cup-hot-4-oz	cup	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.935+03
298	cup hot 8 oz	cup-hot-8-oz	cup	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.937+03
299	Lid hot 8 oz	lid-hot-8-oz	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.939+03
301	Lid hot 12 oz	lid-hot-12-oz	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.941+03
302	cup Cold 16 oz	cup-cold-16-oz	cup	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.943+03
303	Flat lid cold 16 oz	flat-lid-cold-16-oz	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.944+03
304	Dome lid cold 16 oz	dome-lid-cold-16-oz	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.946+03
305	Cup cold  12 oz	cup-cold-12-oz	cup	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.949+03
306	Filter	filter	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.95+03
307	Guest napkin	guest-napkin	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.952+03
308	coveir	coveir	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.953+03
314	white sandwich paper small	white-sandwich-paper-small	packing	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.958+03
317	Label 7*5 roll	label-7-5-roll	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.961+03
318	puvana water 600ml	puvana-water-600ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.962+03
319	Sparkling Water 250ml	sparkling-water-250ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.964+03
325	Orange Juice 270ml	orange-juice-270ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.968+03
326	Mango Juice 270ml	mango-juice-270ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.969+03
327	Strawberry Juice 270ml	strawberry-juice-270ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.97+03
328	Juava Juice  270ml	juava-juice-270ml	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.971+03
345	Sugar free Belgian Dark Coffee Chocolate Bar 30g	sugar-free-belgian-dark-coffee-chocolate-bar-30g	other	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-01 20:58:42.986+03
255	Peach syrup	peach-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-02 15:17:46.856+03
361	butter biscuits box 	butter-biscuits-box	other	pcs	0.0000	t	2026-05-01 14:56:28.626231+03	2026-05-01 22:19:06.218+03
300	cup hot 12 oz	cup-hot-12-oz	cup	pcs	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.581+03
257	huzellnute syrup	huzellnute-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.596+03
259	Vanilla syrup	vanilla-syrup	syrup	g	0.0000	t	2026-04-29 15:17:59.750191+03	2026-05-03 10:07:13.604+03
\.


--
-- Data for Name: kitchen_stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kitchen_stations (id, name, is_active, sort_order, created_at) FROM stdin;
1	Hot Bar	t	0	2026-04-21 10:54:37.627783+02
3	Turkish Bar	t	20	2026-04-21 10:55:17.008863+02
4	Food/Pastry	t	30	2026-04-21 10:56:51.874032+02
2	Cold Bar Test	t	10	2026-04-21 10:55:02.165222+02
\.


--
-- Data for Name: order_item_customizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item_customizations (id, order_item_id, ingredient_id, option_id, consumed_qty, added_cost, slot_label, option_label, created_at, type_volume_id, barista_sort_order, customer_sort_order, produced_qty) FROM stdin;
651	155	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 16:47:37.245065+03	38	1	1	25.0000
652	155	\N	\N	0.0000	0.0000	Syrap	None	2026-04-29 16:47:37.245065+03	\N	1	1	0.0000
653	155	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-29 16:47:37.245065+03	\N	5	5	20.0000
654	155	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 16:47:37.245065+03	\N	1	5	0.0000
655	155	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 16:47:37.245065+03	\N	6	6	0.0000
656	155	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-04-29 16:47:37.245065+03	\N	1	1	120.0000
657	156	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 17:01:42.910699+03	\N	1	7	0.0000
658	156	248	\N	20.0000	0.0000	Sauce	Caramel · 2 Pumps	2026-04-29 17:01:42.910699+03	74	2	3	20.0000
659	156	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-04-29 17:01:42.910699+03	55	3	2	10.0000
660	156	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-29 17:01:42.910699+03	35	4	1	36.0000
661	156	\N	\N	210.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-04-29 17:01:42.910699+03	78	5	4	210.0000
662	156	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 17:01:42.910699+03	\N	7	6	0.0000
663	156	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-04-29 17:01:42.910699+03	\N	6	5	120.0000
664	157	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-04-29 18:33:45.626999+03	38	1	1	36.0000
665	157	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-29 18:33:45.626999+03	\N	1	1	35.0000
666	158	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 18:41:07.962351+03	\N	1	7	0.0000
667	158	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 18:41:07.962351+03	103	3	2	30.0000
668	158	268	\N	30.0000	0.0000	Powder	Coffee Powder · 1 Pump	2026-04-29 18:41:07.962351+03	122	7	0	30.0000
669	158	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 18:41:07.962351+03	38	5	1	36.0000
670	158	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 18:41:07.962351+03	77	6	3	190.0000
671	158	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-29 18:41:07.962351+03	\N	8	5	35.0000
672	158	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-04-29 18:41:07.962351+03	\N	7	4	90.0000
673	159	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 18:41:20.51627+03	\N	1	7	0.0000
674	159	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 18:41:20.51627+03	103	3	2	30.0000
675	159	268	\N	30.0000	0.0000	Powder	Coffee Powder · 1 Pump	2026-04-29 18:41:20.51627+03	122	7	0	30.0000
676	159	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 18:41:20.51627+03	38	5	1	36.0000
677	159	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 18:41:20.51627+03	77	6	3	190.0000
678	159	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-29 18:41:20.51627+03	\N	8	5	35.0000
679	159	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-04-29 18:41:20.51627+03	\N	7	4	90.0000
680	160	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 18:41:28.463195+03	\N	1	7	0.0000
681	160	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 18:41:28.463195+03	103	3	2	30.0000
682	160	268	\N	30.0000	0.0000	Powder	Coffee Powder · 1 Pump	2026-04-29 18:41:28.463195+03	122	7	0	30.0000
683	160	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 18:41:28.463195+03	38	5	1	36.0000
684	160	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 18:41:28.463195+03	77	6	3	190.0000
685	160	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-29 18:41:28.463195+03	\N	8	5	35.0000
686	160	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-04-29 18:41:28.463195+03	\N	7	4	90.0000
687	161	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 18:42:24.062646+03	\N	1	7	0.0000
688	161	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 18:42:24.062646+03	103	3	2	30.0000
689	161	268	\N	30.0000	0.0000	Powder	Coffee Powder · 1 Pump	2026-04-29 18:42:24.062646+03	122	7	0	30.0000
690	161	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 18:42:24.062646+03	38	5	1	36.0000
691	161	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 18:42:24.062646+03	77	6	3	190.0000
692	161	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-29 18:42:24.062646+03	\N	8	5	35.0000
693	161	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-04-29 18:42:24.062646+03	\N	7	4	90.0000
694	163	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 20:49:20.779864+03	\N	1	6	0.0000
695	163	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 20:49:20.779864+03	103	2	2	30.0000
696	163	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-29 20:49:20.779864+03	35	3	1	36.0000
697	163	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 20:49:20.779864+03	77	4	3	190.0000
698	163	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 20:49:20.779864+03	\N	6	5	0.0000
699	163	236	\N	140.0000	21.0000	Milk	Skimmed Milk (140ml)	2026-04-29 20:49:20.779864+03	\N	5	4	140.0000
700	164	272	\N	10.0000	0.0000	Sweetner	White Sugar · 1 Pump	2026-04-29 20:49:20.779864+03	83	1	5	10.0000
701	164	\N	\N	0.0000	0.0000	Syrup	None	2026-04-29 20:49:20.779864+03	\N	2	2	0.0000
702	164	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 20:49:20.779864+03	38	3	1	36.0000
703	164	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-29 20:49:20.779864+03	\N	5	5	40.0000
704	164	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 20:49:20.779864+03	\N	6	6	0.0000
705	164	236	\N	150.0000	22.5000	Milk	Skimmed Milk (150ml)	2026-04-29 20:49:20.779864+03	\N	4	3	150.0000
706	165	272	\N	10.0000	0.0000	Sweetner	White Sugar · 1 Pump	2026-04-29 21:47:13.970185+03	83	1	5	10.0000
707	165	\N	\N	0.0000	0.0000	Syrup	None	2026-04-29 21:47:13.970185+03	\N	2	2	0.0000
708	165	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-29 21:47:13.970185+03	38	3	1	36.0000
709	165	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-29 21:47:13.970185+03	\N	5	5	40.0000
710	165	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 21:47:13.970185+03	\N	6	6	0.0000
711	165	235	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-04-29 21:47:13.970185+03	\N	4	3	150.0000
712	166	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-29 21:47:13.970185+03	\N	1	6	0.0000
713	166	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-29 21:47:13.970185+03	103	2	2	30.0000
714	166	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-29 21:47:13.970185+03	35	3	1	36.0000
715	166	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-29 21:47:13.970185+03	77	4	3	190.0000
716	166	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-29 21:47:13.970185+03	\N	6	5	0.0000
717	166	236	\N	140.0000	21.0000	Milk	Skimmed Milk (140ml)	2026-04-29 21:47:13.970185+03	\N	5	4	140.0000
718	167	\N	\N	1.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 12:15:11.496927+03	\N	1	1	1.0000
719	168	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 12:15:11.496927+03	\N	1	7	0.0000
720	168	259	\N	20.0000	70.0000	Syrup	Vanilla · 2 Pumps	2026-04-30 12:15:11.496927+03	56	2	2	20.0000
721	168	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 12:15:11.496927+03	35	3	1	36.0000
722	168	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 12:15:11.496927+03	77	5	4	150.0000
723	168	\N	\N	120.0000	0.0000	Foam	Light Foam (20ml)	2026-04-30 12:15:11.496927+03	\N	6	0	20.0000
724	168	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-30 12:15:11.496927+03	\N	7	5	35.0000
725	168	235	\N	95.0000	0.0000	Milk	Full Cream (95ml)	2026-04-30 12:15:11.496927+03	\N	7	7	95.0000
726	168	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-04-30 12:15:11.496927+03	\N	100	100	0.0000
727	169	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 12:16:06.055197+03	\N	1	7	0.0000
728	169	\N	\N	0.0000	0.0000	Syrup	None	2026-04-30 12:16:06.055197+03	\N	2	2	0.0000
729	169	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-04-30 12:16:06.055197+03	50	3	3	30.0000
730	169	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 12:16:06.055197+03	35	4	1	36.0000
731	169	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-30 12:16:06.055197+03	\N	6	5	40.0000
732	169	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 12:16:06.055197+03	\N	7	6	0.0000
733	169	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-04-30 12:16:06.055197+03	\N	5	4	250.0000
734	170	\N	\N	130.0000	0.0000	Water	Ice Cubes · Standard	2026-04-30 15:32:16.403556+03	77	2	2	130.0000
735	170	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 15:32:16.403556+03	35	1	1	36.0000
736	171	260	\N	10.0000	0.0000	Sweetner	White Sugar · 1 Pump	2026-04-30 15:35:49.502919+03	83	1	7	10.0000
737	171	\N	\N	0.0000	0.0000	Syrup	None	2026-04-30 15:35:49.502919+03	\N	2	2	0.0000
738	171	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-04-30 15:35:49.502919+03	50	3	3	30.0000
739	171	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 15:35:49.502919+03	35	4	1	36.0000
740	171	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-30 15:35:49.502919+03	\N	6	5	70.0000
741	171	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 15:35:49.502919+03	\N	7	6	0.0000
742	171	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-04-30 15:35:49.502919+03	\N	5	4	250.0000
743	172	249	\N	20.0000	0.0000	Sauce	Blueberry · 2 Pumps	2026-04-30 15:50:08.221522+03	107	1	1	20.0000
744	172	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 15:50:08.221522+03	77	2	2	170.0000
745	172	284	\N	5.0000	0.0000	Lemon Slices	Lemon Slices (5ml)	2026-04-30 15:50:08.221522+03	\N	4	4	5.0000
746	172	\N	\N	250.0000	0.0000	Mango	Mango Juice (250ml)	2026-04-30 15:50:08.221522+03	\N	3	3	250.0000
747	173	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 16:25:07.076808+03	\N	1	6	0.0000
748	173	259	\N	10.0000	35.0000	Syrup	Vanilla · 1 Pump	2026-04-30 16:25:07.076808+03	55	2	2	10.0000
749	173	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 16:25:07.076808+03	35	3	1	36.0000
750	173	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 16:25:07.076808+03	77	4	3	190.0000
751	173	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 16:25:07.076808+03	\N	6	5	0.0000
752	173	235	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-04-30 16:25:07.076808+03	\N	5	4	150.0000
753	174	\N	\N	1.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 16:25:07.076808+03	\N	1	1	1.0000
754	176	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 16:25:07.076808+03	35	1	1	36.0000
755	176	\N	\N	0.0000	0.0000	Syrup	None	2026-04-30 16:25:07.076808+03	\N	1	1	0.0000
756	176	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-30 16:25:07.076808+03	\N	1	1	70.0000
757	176	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 16:25:07.076808+03	\N	5	5	0.0000
758	176	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-04-30 16:25:07.076808+03	\N	6	6	250.0000
759	176	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-04-30 16:25:07.076808+03	\N	100	100	0.0000
760	177	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 18:55:06.02347+03	\N	1	4	0.0000
761	177	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-30 18:55:06.02347+03	38	4	1	36.0000
762	177	\N	\N	0.0000	0.0000	Syrup	None	2026-04-30 18:55:06.02347+03	\N	2	3	0.0000
763	177	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-04-30 18:55:06.02347+03	\N	3	0	150.0000
764	178	232	\N	10.0000	0.0000	Roasting Type	Medium Plain (10ml)	2026-04-30 18:55:06.02347+03	\N	1	1	10.0000
765	178	275	\N	6.0000	0.0000	Sweetner	Sugar · Medium	2026-04-30 18:55:06.02347+03	147	2	1	6.0000
766	179	235	\N	120.0000	0.0000	Foam	Macchiato Foam (40ml)	2026-04-30 20:12:20.849379+03	\N	1	1	40.0000
767	179	224	\N	18.0000	0.0000	Coffe Type	Colombian · Double	2026-04-30 20:12:20.849379+03	35	1	1	36.0000
768	180	\N	\N	1.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 20:12:20.849379+03	\N	1	1	1.0000
769	181	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 20:30:56.798296+03	\N	1	6	0.0000
770	181	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-30 20:30:56.798296+03	103	2	2	30.0000
771	181	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 20:30:56.798296+03	35	3	1	36.0000
772	181	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 20:30:56.798296+03	77	4	3	190.0000
773	181	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 20:30:56.798296+03	\N	6	5	0.0000
774	181	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-04-30 20:30:56.798296+03	\N	5	4	140.0000
775	182	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 20:44:32.603347+03	\N	1	6	0.0000
776	182	242	\N	15.0000	0.0000	Sauce	Condensed · 1 Pump	2026-04-30 20:44:32.603347+03	102	2	2	15.0000
777	182	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 20:44:32.603347+03	35	3	1	36.0000
778	182	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 20:44:32.603347+03	77	4	3	190.0000
779	182	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 20:44:32.603347+03	\N	6	5	0.0000
780	182	236	\N	155.0000	0.0000	Milk	Skimmed Milk (155ml)	2026-04-30 20:44:32.603347+03	\N	5	4	155.0000
781	183	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-04-30 20:44:32.603347+03	\N	5	0	330.0000
782	183	251	\N	30.0000	0.0000	Sauce	Green Apple · 2 Pumps	2026-04-30 20:44:32.603347+03	133	1	1	30.0000
783	183	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 20:44:32.603347+03	77	4	2	180.0000
784	183	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-04-30 20:44:32.603347+03	\N	2	3	1.0000
785	183	284	\N	5.0000	0.0000	Lemon Slice	Lemon Slices (5ml)	2026-04-30 20:44:32.603347+03	\N	3	4	5.0000
786	184	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-04-30 20:48:24.231106+03	\N	5	0	330.0000
787	184	249	\N	30.0000	0.0000	Sauce	Blueberry · 2 Pumps	2026-04-30 20:48:24.231106+03	107	2	2	30.0000
788	184	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 20:48:24.231106+03	77	3	3	180.0000
789	184	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-04-30 20:48:24.231106+03	\N	4	4	1.0000
790	184	284	\N	1.0000	0.0000	Lemon Slices	Lemon Slices (1ml)	2026-04-30 20:48:24.231106+03	\N	5	5	1.0000
791	185	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-04-30 20:48:24.231106+03	\N	5	0	330.0000
792	185	249	\N	30.0000	0.0000	Sauce	Blueberry · 2 Pumps	2026-04-30 20:48:24.231106+03	107	2	2	30.0000
793	185	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 20:48:24.231106+03	77	3	3	180.0000
794	185	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-04-30 20:48:24.231106+03	\N	4	4	1.0000
795	185	284	\N	1.0000	0.0000	Lemon Slices	Lemon Slices (1ml)	2026-04-30 20:48:24.231106+03	\N	5	5	1.0000
796	186	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:10:39.496483+03	\N	1	5	0.0000
797	186	245	\N	30.0000	0.0000	Sauce	Pistachio · 2 Pumps	2026-04-30 21:10:39.496483+03	97	2	2	30.0000
798	186	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-30 21:10:39.496483+03	38	3	1	36.0000
799	186	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-30 21:10:39.496483+03	\N	5	5	20.0000
800	186	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:10:39.496483+03	\N	6	6	0.0000
801	186	235	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-04-30 21:10:39.496483+03	\N	4	3	150.0000
802	187	\N	\N	1.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 21:10:39.496483+03	\N	1	1	1.0000
803	188	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:13:18.858148+03	\N	1	6	0.0000
804	188	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-30 21:13:18.858148+03	103	2	2	30.0000
805	188	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:13:18.858148+03	35	3	1	36.0000
806	188	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:13:18.858148+03	77	4	3	190.0000
807	188	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:13:18.858148+03	\N	6	5	0.0000
808	188	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-04-30 21:13:18.858148+03	\N	5	4	140.0000
809	189	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:13:22.543708+03	\N	1	6	0.0000
810	189	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-04-30 21:13:22.543708+03	89	2	2	15.0000
811	189	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:13:22.543708+03	35	3	1	25.0000
812	189	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:13:22.543708+03	77	4	3	120.0000
813	189	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:13:22.543708+03	\N	6	5	0.0000
814	189	235	\N	80.0000	0.0000	Milk	Full Cream (80ml)	2026-04-30 21:13:22.543708+03	\N	5	4	80.0000
815	190	274	\N	3.0000	0.0000	Sweetner	Dite Suger · 3 Pack	2026-04-30 21:13:31.565036+03	88	1	6	3.0000
816	190	264	\N	30.0000	0.0000	Sauce	Salted Caramel · 2 Pumps	2026-04-30 21:13:31.565036+03	90	3	2	30.0000
817	190	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-30 21:13:31.565036+03	113	4	0	30.0000
818	190	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:13:31.565036+03	35	5	1	36.0000
819	190	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 21:13:31.565036+03	76	6	3	150.0000
820	190	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-04-30 21:13:31.565036+03	\N	8	5	35.0000
821	190	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-04-30 21:13:31.565036+03	55	8	8	10.0000
822	190	235	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-04-30 21:13:31.565036+03	\N	7	4	100.0000
823	191	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:14:20.063723+03	\N	1	6	0.0000
824	191	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-04-30 21:14:20.063723+03	89	2	2	15.0000
825	191	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-30 21:14:20.063723+03	113	3	0	30.0000
826	191	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:14:20.063723+03	35	4	1	24.9000
827	191	\N	\N	130.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:14:20.063723+03	77	5	3	130.0000
828	191	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:14:20.063723+03	\N	7	5	0.0000
829	191	236	\N	50.1000	0.0000	Milk	Skimmed Milk (50ml)	2026-04-30 21:14:20.063723+03	\N	6	4	50.1000
830	192	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:14:29.464389+03	\N	1	6	0.0000
831	192	264	\N	30.0000	0.0000	Sauce	Salted Caramel · 2 Pumps	2026-04-30 21:14:29.464389+03	90	3	2	30.0000
832	192	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-30 21:14:29.464389+03	113	4	0	30.0000
833	192	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:14:29.464389+03	35	5	1	36.0000
834	192	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:14:29.464389+03	77	6	3	170.0000
835	192	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:14:29.464389+03	\N	8	5	0.0000
836	192	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-04-30 21:14:29.464389+03	55	8	8	10.0000
837	192	235	\N	80.0000	0.0000	Milk	Full Cream (80ml)	2026-04-30 21:14:29.464389+03	\N	7	4	80.0000
838	193	249	\N	20.0000	0.0000	Sauce	Blueberry · 2 Pumps	2026-04-30 21:15:28.649177+03	107	1	1	20.0000
839	193	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 21:15:28.649177+03	76	2	2	150.0000
840	193	284	\N	5.0000	0.0000	Lemon Slices	Lemon Slices (5ml)	2026-04-30 21:15:28.649177+03	\N	4	4	5.0000
841	193	\N	\N	270.0000	0.0000	Mango	Mango Juice (270ml)	2026-04-30 21:15:28.649177+03	\N	3	3	270.0000
842	194	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-04-30 21:15:28.649177+03	\N	5	0	330.0000
843	194	250	\N	30.0000	0.0000	Sauce	Passion Fruit · 2 Pumps	2026-04-30 21:15:28.649177+03	136	1	1	30.0000
844	194	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:15:28.649177+03	77	4	2	180.0000
845	194	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-04-30 21:15:28.649177+03	\N	2	3	1.0000
846	194	284	\N	5.0000	0.0000	Lemon Slice	Lemon Slices (5ml)	2026-04-30 21:15:28.649177+03	\N	3	4	5.0000
847	194	253	\N	5.0000	0.0000	Syrup	Bluecuracao (5ml)	2026-04-30 21:15:28.649177+03	\N	6	6	5.0000
848	195	260	\N	10.0000	0.0000	Sweetner	White Sugar · 1 Pump	2026-04-30 21:16:11.596609+03	83	1	6	10.0000
849	195	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-04-30 21:16:11.596609+03	89	2	2	15.0000
850	195	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:16:11.596609+03	35	3	1	25.0000
851	195	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:16:11.596609+03	77	4	3	120.0000
852	195	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:16:11.596609+03	\N	6	5	0.0000
853	195	235	\N	80.0000	0.0000	Milk	Full Cream (80ml)	2026-04-30 21:16:11.596609+03	\N	5	4	80.0000
854	196	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:17:09.188673+03	\N	1	6	0.0000
855	196	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-04-30 21:17:09.188673+03	89	2	2	15.0000
856	196	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:17:09.188673+03	35	3	1	25.0000
857	196	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:17:09.188673+03	77	4	3	120.0000
858	196	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:17:09.188673+03	\N	6	5	0.0000
859	196	236	\N	80.0000	0.0000	Milk	Skimmed Milk (80ml)	2026-04-30 21:17:09.188673+03	\N	5	4	80.0000
860	197	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-04-30 21:17:39.538973+03	\N	1	0	150.0000
861	197	283	\N	40.0000	0.0000	Sweetner	Honey · 2 Pumps	2026-04-30 21:17:39.538973+03	81	2	2	40.0000
862	197	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-04-30 21:17:39.538973+03	\N	3	3	30.0000
863	197	252	\N	10.0000	0.0000	Sauce	Starwberry · 1 Pump	2026-04-30 21:17:39.538973+03	117	4	4	10.0000
864	197	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:17:39.538973+03	77	5	5	180.0000
865	198	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-04-30 21:17:39.538973+03	\N	5	0	330.0000
866	198	250	\N	30.0000	0.0000	Sauce	Passion Fruit · 2 Pumps	2026-04-30 21:17:39.538973+03	136	1	1	30.0000
867	198	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:17:39.538973+03	77	4	2	180.0000
868	198	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-04-30 21:17:39.538973+03	\N	2	3	1.0000
869	198	284	\N	5.0000	0.0000	Lemon Slice	Lemon Slices (5ml)	2026-04-30 21:17:39.538973+03	\N	3	4	5.0000
870	198	253	\N	5.0000	0.0000	Syrup	Bluecuracao (5ml)	2026-04-30 21:17:39.538973+03	\N	6	6	5.0000
871	199	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Single	2026-04-30 21:30:00.625077+03	37	1	1	18.0000
872	200	230	\N	10.0000	0.0000	Roasting Type	Light Plain (10ml)	2026-04-30 21:30:00.625077+03	\N	1	1	10.0000
873	200	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:30:00.625077+03	\N	2	1	0.0000
874	201	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-04-30 21:41:46.560789+03	38	1	1	25.0000
875	201	\N	\N	0.0000	0.0000	Syrap	None	2026-04-30 21:41:46.560789+03	\N	1	1	0.0000
876	201	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-30 21:41:46.560789+03	\N	5	5	20.0000
877	201	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:41:46.560789+03	\N	1	5	0.0000
878	201	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:41:46.560789+03	\N	6	6	0.0000
879	201	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-04-30 21:41:46.560789+03	\N	6	6	120.0000
880	202	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 21:41:46.560789+03	\N	1	6	0.0000
881	202	245	\N	30.0000	0.0000	Sauce	Pistachio · 2 Pumps	2026-04-30 21:41:46.560789+03	97	2	2	30.0000
882	202	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-30 21:41:46.560789+03	113	3	0	30.0000
883	202	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 21:41:46.560789+03	35	4	1	36.0000
884	202	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 21:41:46.560789+03	77	5	3	180.0000
885	202	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 21:41:46.560789+03	\N	7	5	0.0000
886	202	235	\N	80.0000	0.0000	Milk	Full Cream (80ml)	2026-04-30 21:41:46.560789+03	\N	6	4	80.0000
887	203	254	\N	10.0000	0.0000	Syrap	Coconut · 1 Pump	2026-04-30 21:41:46.560789+03	141	1	1	10.0000
888	203	282	\N	0.0000	0.0000	Pinapple	Pinaple	2026-04-30 21:41:46.560789+03	\N	2	2	0.0000
889	203	235	\N	0.0000	0.0000	Milk	Full Cream	2026-04-30 21:41:46.560789+03	\N	3	3	0.0000
890	203	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 21:41:46.560789+03	76	4	4	180.0000
891	205	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 23:04:26.447093+03	\N	1	6	0.0000
892	205	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-04-30 23:04:26.447093+03	103	2	2	30.0000
893	205	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-04-30 23:04:26.447093+03	35	3	1	36.0000
894	205	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 23:04:26.447093+03	77	4	3	190.0000
895	205	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 23:04:26.447093+03	\N	6	5	0.0000
896	205	238	\N	140.0000	65.0000	Milk	Oat (140ml)	2026-04-30 23:04:26.447093+03	\N	5	4	140.0000
897	206	\N	\N	3.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 23:18:48.717738+03	\N	1	1	3.0000
898	207	271	\N	3.0000	0.0000	Powder	Matcha · 1 Pump	2026-04-30 23:22:08.241772+03	121	1	0	70.0000
899	207	283	\N	20.0000	0.0000	Sweetner	Honey · 2 Pumps	2026-04-30 23:22:08.241772+03	81	1	1	20.0000
900	207	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-30 23:22:08.241772+03	77	3	3	190.0000
901	207	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 23:22:08.241772+03	\N	5	5	0.0000
902	207	237	\N	150.0000	65.0000	Milk	Coconut Milk (150ml)	2026-04-30 23:22:08.241772+03	\N	4	4	150.0000
903	208	229	\N	60.0000	0.0000	Coffe	Colombia Tres Dragons (300ml)	2026-04-30 23:32:57.21301+03	\N	1	1	900.0000
904	209	\N	\N	1.0000	0.0000	Water	Pofana Water (1ml)	2026-04-30 23:39:54.220309+03	\N	1	1	1.0000
905	210	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 23:40:27.059615+03	\N	1	6	0.0000
906	210	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-04-30 23:40:27.059615+03	89	2	2	15.0000
907	210	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-04-30 23:40:27.059615+03	34	3	1	18.0000
908	210	\N	\N	100.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 23:40:27.059615+03	76	4	3	100.0000
909	210	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 23:40:27.059615+03	\N	6	5	0.0000
910	210	235	\N	107.0000	0.0000	Milk	Full Cream (107ml)	2026-04-30 23:40:27.059615+03	\N	5	4	107.0000
911	211	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-30 23:40:27.059615+03	\N	1	6	0.0000
912	211	257	\N	20.0000	0.0000	Syrup	Hazelnut · 2 Pumps	2026-04-30 23:40:27.059615+03	59	2	2	20.0000
913	211	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-04-30 23:40:27.059615+03	34	3	1	18.0000
914	211	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 23:40:27.059615+03	76	4	3	120.0000
915	211	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-30 23:40:27.059615+03	\N	6	5	0.0000
916	211	235	\N	138.0000	0.0000	Milk	Full Cream (138ml)	2026-04-30 23:40:27.059615+03	\N	5	4	138.0000
917	212	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-04-30 23:40:27.059615+03	\N	1	0	150.0000
918	212	283	\N	40.0000	0.0000	Sweetner	Honey · 2 Pumps	2026-04-30 23:40:27.059615+03	81	2	2	40.0000
919	212	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-04-30 23:40:27.059615+03	\N	3	3	30.0000
920	212	252	\N	10.0000	0.0000	Sauce	Starwberry · 1 Pump	2026-04-30 23:40:27.059615+03	117	4	4	10.0000
921	212	\N	\N	160.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-30 23:40:27.059615+03	76	5	5	160.0000
922	213	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 00:12:45.120959+03	\N	1	6	0.0000
923	213	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-05-01 00:12:45.120959+03	89	2	2	15.0000
924	213	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-05-01 00:12:45.120959+03	34	3	1	18.0000
925	213	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 00:12:45.120959+03	77	4	3	120.0000
926	213	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 00:12:45.120959+03	\N	6	5	0.0000
927	213	235	\N	87.0000	0.0000	Milk	Full Cream (87ml)	2026-05-01 00:12:45.120959+03	\N	5	4	87.0000
928	214	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 13:12:27.045908+03	\N	1	6	0.0000
929	214	242	\N	30.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-05-01 13:12:27.045908+03	103	2	2	30.0000
930	214	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 13:12:27.045908+03	35	3	1	36.0000
931	214	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 13:12:27.045908+03	77	4	3	190.0000
932	214	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 13:12:27.045908+03	\N	6	5	0.0000
933	214	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-01 13:12:27.045908+03	\N	5	4	140.0000
934	216	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 15:35:00.361657+03	\N	1	7	0.0000
935	216	\N	\N	0.0000	0.0000	Syrup	None	2026-05-01 15:35:00.361657+03	\N	2	2	0.0000
936	216	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 15:35:00.361657+03	35	3	1	36.0000
937	216	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-01 15:35:00.361657+03	\N	5	4	20.0000
938	216	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 15:35:00.361657+03	\N	6	6	0.0000
939	216	237	\N	280.0000	65.0000	Milk	Coconut Milk (280ml)	2026-05-01 15:35:00.361657+03	\N	4	3	280.0000
940	217	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 20:14:53.761241+03	35	1	1	36.0000
941	217	\N	\N	0.0000	0.0000	Syrup	None	2026-05-01 20:14:53.761241+03	\N	1	1	0.0000
942	217	\N	\N	0.0000	0.0000	Foam	None	2026-05-01 20:14:53.761241+03	\N	1	1	0.0000
943	217	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 20:14:53.761241+03	\N	5	5	0.0000
944	217	236	\N	250.0000	65.0000	Milk	Skimmed Milk (250ml)	2026-05-01 20:14:53.761241+03	\N	6	6	250.0000
945	217	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-01 20:14:53.761241+03	\N	100	100	0.0000
946	218	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 20:14:53.761241+03	\N	1	7	0.0000
947	218	\N	\N	0.0000	0.0000	Syrup	None	2026-05-01 20:14:53.761241+03	\N	2	2	0.0000
948	218	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-05-01 20:14:53.761241+03	34	3	1	18.0000
949	218	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-01 20:14:53.761241+03	\N	5	4	20.0000
950	218	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 20:14:53.761241+03	\N	6	6	0.0000
951	218	236	\N	298.0000	0.0000	Milk	Skimmed Milk (298ml)	2026-05-01 20:14:53.761241+03	\N	4	3	298.0000
952	219	271	\N	3.0000	0.0000	Matcha	Matcha · 1 Pump	2026-05-01 21:39:48.609623+03	121	1	0	70.0000
953	219	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 21:39:48.609623+03	\N	2	6	0.0000
954	219	252	\N	50.0000	0.0000	Sauce	Starwberry · 2 Pumps	2026-05-01 21:39:48.609623+03	118	3	1	50.0000
955	219	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 21:39:48.609623+03	77	4	3	190.0000
956	219	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 21:39:48.609623+03	\N	6	5	0.0000
957	219	237	\N	100.0000	65.0000	Milk	Coconut Milk (100ml)	2026-05-01 21:39:48.609623+03	\N	5	4	100.0000
958	220	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 21:39:48.609623+03	\N	1	1	0.0000
959	220	271	\N	3.0000	0.0000	Powder	Matcha · 1 Pump	2026-05-01 21:39:48.609623+03	121	3	0	70.0000
960	220	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 21:39:48.609623+03	\N	4	4	0.0000
961	220	236	\N	250.0000	0.0000	Milk	Skimmed Milk (250ml)	2026-05-01 21:39:48.609623+03	\N	3	3	250.0000
962	221	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-01 21:58:01.305626+03	50	1	1	30.0000
963	221	245	\N	10.0000	0.0000	Sauce	Pistachio · 1 Pump	2026-05-01 21:58:01.305626+03	96	2	2	10.0000
964	221	246	\N	10.0000	0.0000	Sauce	Peanutbutter · 1 Pump	2026-05-01 21:58:01.305626+03	129	4	4	10.0000
965	221	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-01 21:58:01.305626+03	92	4	0	30.0000
966	221	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 21:58:01.305626+03	77	5	5	190.0000
967	221	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-01 21:58:01.305626+03	\N	7	7	35.0000
968	221	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-05-01 21:58:01.305626+03	\N	6	6	120.0000
969	222	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 22:02:34.447903+03	\N	1	6	0.0000
970	222	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-01 22:02:34.447903+03	89	2	2	15.0000
971	222	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-01 22:02:34.447903+03	113	3	0	30.0000
972	222	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 22:02:34.447903+03	35	4	1	24.9000
973	222	\N	\N	130.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 22:02:34.447903+03	77	5	3	130.0000
974	222	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 22:02:34.447903+03	\N	7	5	0.0000
975	222	235	\N	50.1000	0.0000	Milk	Full Cream (50ml)	2026-05-01 22:02:34.447903+03	\N	6	4	50.1000
976	223	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 22:18:18.374567+03	\N	1	1	0.0000
977	223	230	\N	12.0000	0.0000	Roasting Type	Light Plain (12ml)	2026-05-01 22:18:18.374567+03	\N	2	2	12.0000
978	224	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 22:20:06.86246+03	\N	1	7	0.0000
979	224	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-01 22:20:06.86246+03	89	2	2	15.0000
980	224	259	\N	15.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-01 22:20:06.86246+03	55	3	3	15.0000
981	224	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 22:20:06.86246+03	35	4	1	36.0000
982	224	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 22:20:06.86246+03	77	5	4	180.0000
983	224	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 22:20:06.86246+03	\N	7	6	0.0000
984	224	239	\N	140.0000	65.0000	Milk	Almond Milk (140ml)	2026-05-01 22:20:06.86246+03	\N	6	5	140.0000
985	225	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 22:21:03.011402+03	\N	1	7	0.0000
986	225	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-01 22:21:03.011402+03	89	2	2	15.0000
987	225	259	\N	15.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-01 22:21:03.011402+03	55	3	3	15.0000
988	225	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-01 22:21:03.011402+03	35	4	1	36.0000
989	225	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 22:21:03.011402+03	77	5	4	180.0000
990	225	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 22:21:03.011402+03	\N	7	6	0.0000
991	225	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-01 22:21:03.011402+03	\N	6	5	140.0000
992	226	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-05-01 22:22:08.31307+03	\N	1	0	150.0000
993	226	283	\N	40.0000	0.0000	Sweetner	Honey · 2 Pumps	2026-05-01 22:22:08.31307+03	81	2	2	40.0000
994	226	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-05-01 22:22:08.31307+03	\N	3	3	30.0000
995	226	252	\N	20.0000	0.0000	Sauce	Starwberry · 2 Pumps	2026-05-01 22:22:08.31307+03	118	4	4	20.0000
996	226	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 22:22:08.31307+03	77	5	5	180.0000
997	227	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-01 23:08:49.610135+03	50	1	1	30.0000
998	227	245	\N	10.0000	0.0000	Sauce	Pistachio · 1 Pump	2026-05-01 23:08:49.610135+03	96	2	2	10.0000
999	227	246	\N	10.0000	0.0000	Sauce	Peanutbutter · 1 Pump	2026-05-01 23:08:49.610135+03	129	4	4	10.0000
1000	227	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-01 23:08:49.610135+03	92	4	0	30.0000
1001	227	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 23:08:49.610135+03	77	5	5	190.0000
1002	227	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 23:08:49.610135+03	\N	7	7	0.0000
1003	227	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-05-01 23:08:49.610135+03	\N	6	6	120.0000
1004	228	278	\N	1.0000	0.0000	Tea	Tea Packet (1ml)	2026-05-01 23:10:03.265068+03	\N	1	0	1.0000
1005	228	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-01 23:10:03.265068+03	\N	2	2	0.0000
1006	229	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-01 23:10:03.265068+03	50	1	1	30.0000
1007	229	245	\N	10.0000	0.0000	Sauce	Pistachio · 1 Pump	2026-05-01 23:10:03.265068+03	96	2	2	10.0000
1008	229	246	\N	10.0000	0.0000	Sauce	Peanutbutter · 1 Pump	2026-05-01 23:10:03.265068+03	129	4	4	10.0000
1009	229	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-01 23:10:03.265068+03	92	4	0	30.0000
1010	229	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-01 23:10:03.265068+03	77	5	5	190.0000
1011	229	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-01 23:10:03.265068+03	\N	7	7	0.0000
1012	229	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-05-01 23:10:03.265068+03	\N	6	6	120.0000
1013	231	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-02 14:13:09.175699+03	\N	1	6	0.0000
1014	231	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-02 14:13:09.175699+03	55	2	2	10.0000
1015	231	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-02 14:13:09.175699+03	89	3	3	15.0000
1016	231	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-05-02 14:13:09.175699+03	34	4	1	18.0000
1017	231	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-02 14:13:09.175699+03	\N	6	5	40.0000
1018	231	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-02 14:13:09.175699+03	\N	7	7	0.0000
1019	231	235	\N	278.0000	0.0000	Milk	Full Cream (278ml)	2026-05-02 14:13:09.175699+03	\N	5	4	278.0000
1020	232	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-02 14:13:09.175699+03	\N	1	6	0.0000
1021	232	245	\N	30.0000	0.0000	Sauce	Pistachio · 2 Pumps	2026-05-02 14:13:09.175699+03	97	2	2	30.0000
1022	232	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-02 14:13:09.175699+03	76	5	3	170.0000
1023	232	224	\N	18.0000	0.0000	Coffee	Colombian · Single	2026-05-02 14:13:09.175699+03	34	4	1	18.0000
1024	232	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-02 14:13:09.175699+03	113	3	0	30.0000
1025	232	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-02 14:13:09.175699+03	\N	7	5	0.0000
1026	232	235	\N	128.0000	0.0000	Milk	Full Cream (128ml)	2026-05-02 14:13:09.175699+03	\N	6	4	128.0000
1027	233	\N	\N	70.0000	0.0000	Hot Water	Hot Water (70ml)	2026-05-02 15:17:46.845875+03	\N	1	0	70.0000
1028	233	278	\N	1.0000	0.0000	Pack Tea	Tea Packet (1ml)	2026-05-02 15:17:46.845875+03	\N	2	0	1.0000
1029	233	281	\N	240.0000	0.0000	Rani Peach	Rani Peach (240ml)	2026-05-02 15:17:46.845875+03	\N	5	0	240.0000
1030	233	255	\N	20.0000	0.0000	Syrup	Peach · 2 Pumps	2026-05-02 15:17:46.845875+03	139	3	1	20.0000
1031	233	\N	\N	130.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-02 15:17:46.845875+03	76	4	2	130.0000
1032	234	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-02 15:50:22.679165+03	\N	1	7	0.0000
1033	234	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-02 15:50:22.679165+03	50	2	2	30.0000
1034	234	\N	\N	0.0000	0.0000	Syrup	None	2026-05-02 15:50:22.679165+03	\N	3	3	0.0000
1035	234	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-02 15:50:22.679165+03	35	4	1	36.0000
1036	234	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-02 15:50:22.679165+03	77	5	4	190.0000
1037	234	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-02 15:50:22.679165+03	\N	7	6	0.0000
1038	234	239	\N	140.0000	65.0000	Milk	Almond Milk (140ml)	2026-05-02 15:50:22.679165+03	\N	6	5	140.0000
1039	235	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-02 15:50:22.679165+03	\N	1	7	0.0000
1040	235	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-02 15:50:22.679165+03	50	2	2	30.0000
1041	235	\N	\N	0.0000	0.0000	Syrup	None	2026-05-02 15:50:22.679165+03	\N	3	3	0.0000
1042	235	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-02 15:50:22.679165+03	35	4	1	36.0000
1043	235	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-02 15:50:22.679165+03	77	5	4	190.0000
1044	235	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-02 15:50:22.679165+03	\N	7	6	0.0000
1045	235	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-02 15:50:22.679165+03	\N	6	5	140.0000
1046	236	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-02 17:26:06.846086+03	\N	1	6	0.0000
1047	236	\N	\N	0.0000	0.0000	Syrup	None	2026-05-02 17:26:06.846086+03	\N	2	2	0.0000
1048	236	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-02 17:26:06.846086+03	35	3	1	36.0000
1049	236	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-02 17:26:06.846086+03	77	4	3	190.0000
1050	236	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-02 17:26:06.846086+03	\N	6	5	0.0000
1051	236	237	\N	160.0000	65.0000	Milk	Coconut Milk (160ml)	2026-05-02 17:26:06.846086+03	\N	5	4	160.0000
1052	241	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Single	2026-05-02 18:53:58.567619+03	37	1	1	18.0000
1053	242	283	\N	30.0000	75.0000	Sweetner	Honey · 3 Pumps	2026-05-03 10:07:13.559905+03	82	1	6	30.0000
1054	242	248	\N	30.0000	55.0000	Sauce	Caramel · 3 Pumps	2026-05-03 10:07:13.559905+03	75	2	2	30.0000
1055	242	259	\N	30.0000	70.0000	Syrup	Vanilla · 3 Pumps	2026-05-03 10:07:13.559905+03	57	3	3	30.0000
1056	242	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 10:07:13.559905+03	36	4	1	54.0000
1057	242	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 10:07:13.559905+03	\N	6	5	40.0000
1058	242	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 10:07:13.559905+03	\N	8	8	35.0000
1059	242	241	\N	207.0000	65.0000	Milk	Lactos Free Milk (207ml)	2026-05-03 10:07:13.559905+03	\N	5	4	207.0000
1060	242	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-03 10:07:13.559905+03	\N	100	100	0.0000
1061	243	283	\N	30.0000	75.0000	Sweetner	Honey · 3 Pumps	2026-05-03 10:07:13.559905+03	82	1	5	30.0000
1062	243	267	\N	45.0000	55.0000	Sauce	Almond Sauce · 3 Pumps	2026-05-03 10:07:13.559905+03	101	2	2	45.0000
1063	243	225	\N	36.0000	65.0000	Coffee	Ethiobian · Triple	2026-05-03 10:07:13.559905+03	39	3	1	54.0000
1064	243	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-03 10:07:13.559905+03	\N	5	5	20.0000
1065	243	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 10:07:13.559905+03	\N	6	6	35.0000
1066	243	241	\N	107.0000	65.0000	Milk	Lactos Free Milk (107ml)	2026-05-03 10:07:13.559905+03	\N	4	3	107.0000
1067	244	283	\N	30.0000	75.0000	Sweetner	Honey · 3 Pumps	2026-05-03 10:07:13.559905+03	82	1	7	30.0000
1068	244	257	\N	30.0000	70.0000	Syrup	Hazelnut · 3 Pumps	2026-05-03 10:07:13.559905+03	61	2	2	30.0000
1069	244	261	\N	15.0000	0.0000	Sauce	Chocolate · 1 Pump	2026-05-03 10:07:13.559905+03	49	3	3	15.0000
1070	244	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 10:07:13.559905+03	36	4	1	54.0000
1071	244	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 10:07:13.559905+03	\N	6	5	40.0000
1072	244	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 10:07:13.559905+03	\N	7	6	35.0000
1073	244	241	\N	227.0000	65.0000	Milk	Lactos Free Milk (227ml)	2026-05-03 10:07:13.559905+03	\N	5	4	227.0000
1074	245	283	\N	30.0000	75.0000	Sweetner	Honey · 3 Pumps	2026-05-03 10:07:13.559905+03	82	1	7	30.0000
1075	245	264	\N	45.0000	110.0000	Sauce	Salted Caramel · 3 Pumps	2026-05-03 10:07:13.559905+03	91	2	2	45.0000
1076	245	259	\N	35.0000	70.0000	Syrup	Vanilla · 3 Pumps	2026-05-03 10:07:13.559905+03	57	3	3	35.0000
1077	245	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 10:07:13.559905+03	36	4	1	54.0000
1078	245	\N	\N	160.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-03 10:07:13.559905+03	76	5	4	160.0000
1079	245	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 10:07:13.559905+03	\N	7	6	35.0000
1080	245	237	\N	92.0000	65.0000	Milk	Coconut Milk (92ml)	2026-05-03 10:07:13.559905+03	\N	6	5	92.0000
1081	246	283	\N	30.0000	75.0000	Sweetner	Honey · 3 Pumps	2026-05-03 10:07:13.559905+03	82	1	7	30.0000
1082	246	256	\N	30.0000	70.0000	Syrup	Tofft Nut · 3 Pumps	2026-05-03 10:07:13.559905+03	64	2	3	30.0000
1083	246	261	\N	45.0000	55.0000	Sauce	Chocolate · 3 Pumps	2026-05-03 10:07:13.559905+03	51	3	2	45.0000
1084	246	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 10:07:13.559905+03	113	4	0	30.0000
1085	246	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 10:07:13.559905+03	36	5	1	54.0000
1086	246	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-03 10:07:13.559905+03	76	6	4	170.0000
1087	246	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 10:07:13.559905+03	\N	8	6	35.0000
1088	246	239	\N	57.0000	65.0000	Milk	Almond Milk (57ml)	2026-05-03 10:07:13.559905+03	\N	7	5	57.0000
1089	247	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-05-03 10:07:13.559905+03	\N	1	0	150.0000
1090	247	260	\N	50.0000	0.0000	Sweetner	White Sugar · 3 Pumps	2026-05-03 10:07:13.559905+03	85	2	2	50.0000
1091	247	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-05-03 10:07:13.559905+03	\N	3	3	30.0000
1092	247	252	\N	30.0000	55.0000	Sauce	Starwberry · 3 Pumps	2026-05-03 10:07:13.559905+03	119	4	4	30.0000
1167	299	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:28:21.727167+03	\N	7	6	0.0000
1093	247	\N	\N	200.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-05-03 10:07:13.559905+03	78	5	5	200.0000
1094	253	278	\N	1.0000	0.0000	Tea	Tea Packet (1ml)	2026-05-03 10:07:13.559905+03	\N	1	0	1.0000
1095	253	273	\N	2.0000	0.0000	Sweetner	Brown Suger · 2 Pack	2026-05-03 10:07:13.559905+03	66	2	2	2.0000
1096	254	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:07:13.559905+03	\N	1	1	0.0000
1097	254	271	\N	3.0000	0.0000	Powder	Matcha · 1 Pump	2026-05-03 10:07:13.559905+03	121	3	0	70.0000
1098	254	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 10:07:13.559905+03	\N	4	4	0.0000
1099	254	237	\N	250.0000	65.0000	Milk	Coconut Milk (250ml)	2026-05-03 10:07:13.559905+03	\N	3	3	250.0000
1100	255	232	\N	10.0000	0.0000	Roasting Type	Medium Plain (10ml)	2026-05-03 10:07:13.559905+03	\N	1	1	10.0000
1101	255	275	\N	2.0000	0.0000	Sweetner	Sugar · Light	2026-05-03 10:07:13.559905+03	146	2	1	2.0000
1102	256	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:45:17.830488+03	\N	1	7	0.0000
1103	256	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 10:45:17.830488+03	\N	2	2	0.0000
1104	256	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-03 10:45:17.830488+03	50	3	3	30.0000
1105	256	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 10:45:17.830488+03	35	4	1	36.0000
1106	256	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 10:45:17.830488+03	\N	6	5	40.0000
1107	256	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 10:45:17.830488+03	\N	7	6	0.0000
1108	256	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-03 10:45:17.830488+03	\N	5	4	250.0000
1109	257	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:46:45.736978+03	\N	1	7	0.0000
1110	257	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 10:46:45.736978+03	\N	2	2	0.0000
1111	257	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-03 10:46:45.736978+03	50	3	3	30.0000
1112	257	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 10:46:45.736978+03	35	4	1	36.0000
1113	257	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 10:46:45.736978+03	\N	6	5	40.0000
1114	257	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 10:46:45.736978+03	\N	7	6	0.0000
1115	257	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-03 10:46:45.736978+03	\N	5	4	250.0000
1116	258	230	\N	10.0000	0.0000	Roasting Type	Light Plain (10ml)	2026-05-03 10:48:28.420506+03	\N	1	1	10.0000
1117	258	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:48:28.420506+03	\N	2	1	0.0000
1118	259	278	\N	1.0000	0.0000	Tea	Tea Packet (1ml)	2026-05-03 10:48:28.420506+03	\N	1	0	1.0000
1119	259	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:48:28.420506+03	\N	2	2	0.0000
1120	261	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-05-03 10:49:52.419733+03	38	1	1	36.0000
1121	262	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 10:50:32.153283+03	\N	1	7	0.0000
1122	262	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 10:50:32.153283+03	\N	2	2	0.0000
1123	262	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-03 10:50:32.153283+03	50	3	3	30.0000
1124	262	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 10:50:32.153283+03	35	4	1	36.0000
1125	262	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 10:50:32.153283+03	\N	6	5	40.0000
1126	262	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 10:50:32.153283+03	\N	7	6	0.0000
1127	262	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-03 10:50:32.153283+03	\N	5	4	250.0000
1128	263	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 11:05:44.206376+03	\N	1	6	0.0000
1129	263	267	\N	45.0000	55.0000	Sauce	Almond Sauce · 3 Pumps	2026-05-03 11:05:44.206376+03	101	2	2	45.0000
1130	263	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 11:05:44.206376+03	113	3	0	30.0000
1131	263	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 11:05:44.206376+03	36	4	1	54.0000
1132	263	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 11:05:44.206376+03	77	5	3	180.0000
1133	263	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 11:05:44.206376+03	\N	7	5	35.0000
1134	263	266	\N	2.0000	0.0000	Almond Beans	Almond Beans (2ml)	2026-05-03 11:05:44.206376+03	\N	8	0	2.0000
1135	263	239	\N	47.0000	65.0000	Milk	Almond Milk (47ml)	2026-05-03 11:05:44.206376+03	\N	6	4	47.0000
1136	293	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:12:11.993448+03	\N	2	5	0.0000
1137	293	262	\N	20.0000	0.0000	Sauce	White Chocolate · 2 Pumps	2026-05-03 13:12:11.993448+03	53	3	1	20.0000
1138	293	271	\N	3.0000	0.0000	Powder	Matcha · 1 Pump	2026-05-03 13:12:11.993448+03	121	1	0	70.0000
1139	293	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:12:11.993448+03	77	4	2	190.0000
1140	293	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:12:11.993448+03	\N	6	4	0.0000
1141	293	235	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-05-03 13:12:11.993448+03	\N	5	3	150.0000
1142	295	224	\N	18.0000	0.0000	Coffe Type	Colombian · Single	2026-05-03 13:28:21.727167+03	34	1	1	18.0000
1143	295	\N	\N	120.0000	0.0000	Foam	Steam Milk (40ml)	2026-05-03 13:28:21.727167+03	\N	1	1	40.0000
1144	295	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-03 13:28:21.727167+03	\N	100	100	0.0000
1145	296	274	\N	3.0000	0.0000	Sweetner	Dite Suger · 3 Pack	2026-05-03 13:28:21.727167+03	88	1	5	3.0000
1146	296	267	\N	45.0000	55.0000	Sauce	Almond Sauce · 3 Pumps	2026-05-03 13:28:21.727167+03	101	2	2	45.0000
1147	296	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 13:28:21.727167+03	36	3	1	54.0000
1148	296	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-03 13:28:21.727167+03	\N	5	5	40.0000
1149	296	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 13:28:21.727167+03	\N	6	6	35.0000
1150	296	239	\N	107.0000	65.0000	Milk	Almond Milk (107ml)	2026-05-03 13:28:21.727167+03	\N	4	3	107.0000
1151	296	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 13:28:21.727167+03	\N	100	100	0.0000
1152	297	275	\N	15.0000	0.0000	Sweetner	Sugar · Extra	2026-05-03 13:28:21.727167+03	148	1	1	15.0000
1153	297	231	\N	12.0000	0.0000	Roasting Type	Light Blend (12ml)	2026-05-03 13:28:21.727167+03	\N	2	2	12.0000
1154	297	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 13:28:21.727167+03	\N	100	100	0.0000
1155	298	260	\N	20.0000	0.0000	Sweetner	White Sugar · 2 Pumps	2026-05-03 13:28:21.727167+03	84	1	7	20.0000
1156	298	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-03 13:28:21.727167+03	89	2	2	15.0000
1157	298	259	\N	35.0000	70.0000	Syrup	Vanilla · 3 Pumps	2026-05-03 13:28:21.727167+03	57	3	3	35.0000
1158	298	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 13:28:21.727167+03	36	4	1	54.0000
1159	298	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:28:21.727167+03	77	5	4	180.0000
1160	298	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 13:28:21.727167+03	\N	7	6	35.0000
1161	298	241	\N	102.0000	65.0000	Milk	Lactos Free Milk (102ml)	2026-05-03 13:28:21.727167+03	\N	6	5	102.0000
1162	299	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:28:21.727167+03	\N	1	7	0.0000
1163	299	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 13:28:21.727167+03	\N	2	3	0.0000
1164	299	262	\N	40.0000	0.0000	Sauce	White Chocolate · 2 Pumps	2026-05-03 13:28:21.727167+03	53	3	2	40.0000
1165	299	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 13:28:21.727167+03	35	4	1	36.0000
1166	299	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:28:21.727167+03	77	5	4	190.0000
1168	299	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-03 13:28:21.727167+03	\N	6	5	140.0000
1169	300	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:28:21.727167+03	\N	1	6	0.0000
1170	300	245	\N	30.0000	0.0000	Sauce	Pistachio · 2 Pumps	2026-05-03 13:28:21.727167+03	97	2	2	30.0000
1171	300	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:28:21.727167+03	77	5	3	190.0000
1172	300	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 13:28:21.727167+03	35	4	1	36.0000
1173	300	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 13:28:21.727167+03	113	3	0	30.0000
1174	300	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:28:21.727167+03	\N	7	5	0.0000
1175	300	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-05-03 13:28:21.727167+03	\N	6	4	90.0000
1176	301	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:28:21.727167+03	\N	2	5	0.0000
1177	301	262	\N	10.0000	0.0000	Sauce	White Chocolate · 1 Pump	2026-05-03 13:28:21.727167+03	52	3	1	10.0000
1178	301	271	\N	3.0000	0.0000	Powder	Matcha · 1 Pump	2026-05-03 13:28:21.727167+03	121	1	0	70.0000
1179	301	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:28:21.727167+03	77	4	2	190.0000
1180	301	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:28:21.727167+03	\N	6	4	0.0000
1181	301	235	\N	160.0000	0.0000	Milk	Full Cream (160ml)	2026-05-03 13:28:21.727167+03	\N	5	3	160.0000
1182	302	279	\N	330.0000	0.0000	Soda	Sprite (330ml)	2026-05-03 13:28:21.727167+03	\N	5	0	330.0000
1183	302	250	\N	30.0000	0.0000	Sauce	Passion Fruit · 2 Pumps	2026-05-03 13:28:21.727167+03	136	1	1	30.0000
1184	302	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:28:21.727167+03	77	4	2	180.0000
1185	302	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-05-03 13:28:21.727167+03	\N	2	3	1.0000
1186	302	284	\N	5.0000	0.0000	Lemon Slice	Lemon Slices (5ml)	2026-05-03 13:28:21.727167+03	\N	3	4	5.0000
1187	302	253	\N	5.0000	0.0000	Syrup	Bluecuracao (5ml)	2026-05-03 13:28:21.727167+03	\N	6	6	5.0000
1188	303	278	\N	1.0000	0.0000	Tea	Tea Packet (1ml)	2026-05-03 13:28:21.727167+03	\N	1	0	1.0000
1189	303	260	\N	30.0000	0.0000	Sweetner	White Sugar · 3 Pumps	2026-05-03 13:28:21.727167+03	85	2	2	30.0000
1190	312	234	\N	20.0000	0.0000	Coffee Arabian	Arabic coffee (20ml)	2026-05-03 13:28:21.727167+03	\N	1	1	20.0000
1191	312	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-03 13:28:21.727167+03	\N	100	100	0.0000
1192	313	234	\N	20.0000	0.0000	Coffee Arabian	Arabic coffee (20ml)	2026-05-03 13:28:21.727167+03	\N	1	1	20.0000
1193	313	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-03 13:28:21.727167+03	\N	100	100	0.0000
1194	314	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:29:11.511771+03	\N	1	5	0.0000
1195	314	267	\N	30.0000	0.0000	Sauce	Almond Sauce · 2 Pumps	2026-05-03 13:29:11.511771+03	100	2	2	30.0000
1196	314	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 13:29:11.511771+03	35	3	1	36.0000
1197	314	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-03 13:29:11.511771+03	\N	5	5	20.0000
1198	314	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:29:11.511771+03	\N	6	6	0.0000
1199	314	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-03 13:29:11.511771+03	\N	4	3	140.0000
1200	314	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 13:29:11.511771+03	\N	100	100	0.0000
1201	315	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:29:11.511771+03	\N	1	4	0.0000
1202	315	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-05-03 13:29:11.511771+03	38	4	1	36.0000
1203	315	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 13:29:11.511771+03	\N	2	3	0.0000
1204	315	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-05-03 13:29:11.511771+03	\N	3	0	150.0000
1205	315	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 13:29:11.511771+03	\N	100	100	0.0000
1206	316	280	\N	250.0000	0.0000	RedBull	Redbull (250ml)	2026-05-03 13:29:11.511771+03	\N	5	0	250.0000
1207	316	251	\N	30.0000	0.0000	Sauce	Green Apple · 2 Pumps	2026-05-03 13:29:11.511771+03	133	1	1	30.0000
1208	316	\N	\N	160.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 13:29:11.511771+03	77	4	4	160.0000
1209	316	285	\N	1.0000	0.0000	Mint Leaves	Mint Leaves (1ml)	2026-05-03 13:29:11.511771+03	\N	2	2	1.0000
1210	316	284	\N	5.0000	0.0000	Lemon Slices	Lemon Slices (5ml)	2026-05-03 13:29:11.511771+03	\N	3	3	5.0000
1211	317	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:34:04.140472+03	\N	1	7	0.0000
1212	317	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 13:34:04.140472+03	\N	2	2	0.0000
1213	317	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 13:34:04.140472+03	35	3	1	36.0000
1214	317	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-03 13:34:04.140472+03	\N	5	4	20.0000
1215	317	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:34:04.140472+03	\N	6	6	0.0000
1216	317	235	\N	280.0000	0.0000	Milk	Full Cream (280ml)	2026-05-03 13:34:04.140472+03	\N	4	3	280.0000
1217	317	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-03 13:34:04.140472+03	\N	100	100	0.0000
1218	318	233	\N	10.0000	0.0000	Roasting Type	Medium Blend (10ml)	2026-05-03 13:34:04.140472+03	\N	1	1	10.0000
1219	318	275	\N	2.0000	0.0000	Sweetner	Sugar · Light	2026-05-03 13:34:04.140472+03	146	2	1	2.0000
1220	318	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-03 13:34:04.140472+03	\N	100	100	0.0000
1221	319	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 13:58:11.590116+03	\N	1	6	0.0000
1222	319	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 13:58:11.590116+03	\N	2	2	0.0000
1223	319	224	\N	36.0000	65.0000	Coffee	Colombian · Triple	2026-05-03 13:58:11.590116+03	36	3	1	54.0000
1224	319	\N	\N	120.0000	0.0000	Ices Cubes	Ice Cubes · Standard	2026-05-03 13:58:11.590116+03	77	4	3	120.0000
1225	319	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:58:11.590116+03	\N	6	5	0.0000
1226	319	235	\N	51.0000	0.0000	Milk	Full Cream (51ml)	2026-05-03 13:58:11.590116+03	\N	5	4	51.0000
1227	319	305	\N	1.0000	0.0000	Packaging	Cup cold  12 oz	2026-05-03 13:58:11.590116+03	\N	100	100	0.0000
1228	320	260	\N	30.0000	0.0000	Sweetner	White Sugar · 3 Pumps	2026-05-03 13:58:11.590116+03	85	1	7	30.0000
1229	320	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 13:58:11.590116+03	\N	2	2	0.0000
1230	320	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 13:58:11.590116+03	35	3	1	36.0000
1231	320	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-03 13:58:11.590116+03	\N	5	4	20.0000
1232	320	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 13:58:11.590116+03	\N	6	6	0.0000
1233	320	235	\N	280.0000	0.0000	Milk	Full Cream (280ml)	2026-05-03 13:58:11.590116+03	\N	4	3	280.0000
1234	320	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-03 13:58:11.590116+03	\N	100	100	0.0000
1235	321	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 14:24:20.962485+03	35	1	1	36.0000
1236	321	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 14:24:20.962485+03	\N	1	1	0.0000
1237	321	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-05-03 14:24:20.962485+03	\N	1	1	70.0000
1238	321	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 14:24:20.962485+03	\N	5	5	0.0000
1239	321	237	\N	250.0000	65.0000	Milk	Coconut Milk (250ml)	2026-05-03 14:24:20.962485+03	\N	6	6	250.0000
1240	321	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-03 14:24:20.962485+03	\N	100	100	0.0000
1241	323	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-03 14:41:41.609455+03	50	1	1	30.0000
1242	323	245	\N	10.0000	0.0000	Sauce	Pistachio · 1 Pump	2026-05-03 14:41:41.609455+03	96	2	2	10.0000
1243	323	246	\N	10.0000	0.0000	Sauce	Peanutbutter · 1 Pump	2026-05-03 14:41:41.609455+03	129	4	4	10.0000
1244	323	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-03 14:41:41.609455+03	92	4	0	30.0000
1245	323	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-03 14:41:41.609455+03	76	5	5	170.0000
1246	323	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 14:41:41.609455+03	\N	7	7	35.0000
1247	323	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-03 14:41:41.609455+03	\N	6	6	140.0000
1248	324	261	\N	15.0000	0.0000	Sauce	Chocolate · 1 Pump	2026-05-03 14:43:35.987566+03	49	1	1	15.0000
1249	324	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-03 14:43:35.987566+03	92	2	0	30.0000
1250	324	\N	\N	160.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-05-03 14:43:35.987566+03	76	3	2	160.0000
1251	324	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 14:43:35.987566+03	\N	5	4	0.0000
1252	324	270	\N	1.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-03 14:43:35.987566+03	92	6	0	1.0000
1253	324	235	\N	175.0000	0.0000	Milk	Full Cream (175ml)	2026-05-03 14:43:35.987566+03	\N	4	3	175.0000
1254	325	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:20:55.193493+03	\N	1	7	0.0000
1255	325	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-03 15:20:55.193493+03	89	2	2	15.0000
1256	325	259	\N	15.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-03 15:20:55.193493+03	55	3	3	15.0000
1257	325	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:20:55.193493+03	35	4	1	36.0000
1258	325	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:20:55.193493+03	77	5	4	180.0000
1259	325	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:20:55.193493+03	\N	7	6	0.0000
1260	325	236	\N	140.0000	0.0000	Milk	Skimmed Milk (140ml)	2026-05-03 15:20:55.193493+03	\N	6	5	140.0000
1261	326	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:23:43.731605+03	\N	1	7	0.0000
1262	326	264	\N	15.0000	0.0000	Sauce	Salted Caramel · 1 Pump	2026-05-03 15:23:43.731605+03	89	2	2	15.0000
1263	326	259	\N	15.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-03 15:23:43.731605+03	55	3	3	15.0000
1264	326	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:23:43.731605+03	35	4	1	36.0000
1265	326	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:23:43.731605+03	77	5	4	180.0000
1266	326	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:23:43.731605+03	\N	7	6	0.0000
1267	326	236	\N	140.0000	0.0000	Milk	Skimmed Milk (140ml)	2026-05-03 15:23:43.731605+03	\N	6	5	140.0000
1268	327	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:27:35.011268+03	35	1	1	25.0000
1269	327	\N	\N	0.0000	0.0000	Syrap	None	2026-05-03 15:27:35.011268+03	\N	1	1	0.0000
1270	327	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-05-03 15:27:35.011268+03	\N	5	5	70.0000
1271	327	260	\N	30.0000	0.0000	Sweetner	White Sugar · 3 Pumps	2026-05-03 15:27:35.011268+03	85	1	5	30.0000
1272	327	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 15:27:35.011268+03	\N	6	6	35.0000
1273	327	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-05-03 15:27:35.011268+03	\N	6	6	120.0000
1274	327	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 15:27:35.011268+03	\N	100	100	0.0000
1275	328	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:34:47.567941+03	35	5	1	36.0000
1276	328	248	\N	35.0000	0.0000	Sauce	Caramel · 2 Pumps	2026-05-03 15:34:47.567941+03	74	3	2	35.0000
1277	328	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-03 15:34:47.567941+03	55	2	3	10.0000
1278	328	\N	\N	190.0000	0.0000	Cubes	Ice Cubes · Standard	2026-05-03 15:34:47.567941+03	77	6	4	190.0000
1279	328	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 15:34:47.567941+03	\N	6	6	35.0000
1280	328	\N	\N	0.0000	0.0000	Sweetener	None	2026-05-03 15:34:47.567941+03	\N	1	7	0.0000
1281	328	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 15:34:47.567941+03	113	8	0	30.0000
1282	328	235	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-05-03 15:34:47.567941+03	\N	7	5	100.0000
1283	328	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 15:34:47.567941+03	\N	100	100	0.0000
1284	329	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:34:47.567941+03	\N	1	6	0.0000
1285	329	257	\N	20.0000	0.0000	Syrup	Hazelnut · 2 Pumps	2026-05-03 15:34:47.567941+03	59	2	2	20.0000
1286	329	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:34:47.567941+03	35	3	1	36.0000
1287	329	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:34:47.567941+03	77	4	3	140.0000
1288	329	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:34:47.567941+03	\N	6	5	0.0000
1289	329	235	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-05-03 15:34:47.567941+03	\N	5	4	100.0000
1290	329	305	\N	1.0000	0.0000	Packaging	Cup cold  12 oz	2026-05-03 15:34:47.567941+03	\N	100	100	0.0000
1291	330	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:34:47.567941+03	\N	1	6	0.0000
1292	330	264	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump	2026-05-03 15:34:47.567941+03	89	2	2	15.0000
1293	330	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:34:47.567941+03	35	3	1	25.0000
1294	330	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:34:47.567941+03	77	4	3	120.0000
1295	330	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:34:47.567941+03	\N	6	5	0.0000
1296	330	235	\N	80.0000	0.0000	Milk	Full Cream (80ml)	2026-05-03 15:34:47.567941+03	\N	5	4	80.0000
1297	330	305	\N	1.0000	0.0000	Packaging	Cup cold  12 oz	2026-05-03 15:34:47.567941+03	\N	100	100	0.0000
1298	331	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:34:47.567941+03	\N	1	6	0.0000
1299	331	267	\N	30.0000	0.0000	Sauce	Almond Sauce · 2 Pumps	2026-05-03 15:34:47.567941+03	100	2	2	30.0000
1300	331	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:34:47.567941+03	35	3	1	36.0000
1301	331	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:34:47.567941+03	77	4	3	140.0000
1302	331	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:34:47.567941+03	\N	6	5	0.0000
1303	331	235	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-05-03 15:34:47.567941+03	\N	5	4	100.0000
1304	332	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:40:32.982435+03	\N	1	6	0.0000
1305	332	264	\N	25.0000	0.0000	Sauce	Salted Caramel · 2 Pumps	2026-05-03 15:40:32.982435+03	90	3	2	25.0000
1306	332	269	\N	25.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 15:40:32.982435+03	113	4	0	25.0000
1307	332	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:40:32.982435+03	35	5	1	36.0000
1308	332	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:40:32.982435+03	77	6	3	170.0000
1309	332	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:40:32.982435+03	\N	8	5	0.0000
1310	332	248	\N	5.0000	0.0000	Sauce	Caramel · 1 Pump	2026-05-03 15:40:32.982435+03	73	8	0	5.0000
1311	332	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-05-03 15:40:32.982435+03	\N	7	4	90.0000
1312	332	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 15:40:32.982435+03	\N	100	100	0.0000
1313	333	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 15:44:46.957388+03	\N	1	6	0.0000
1314	333	264	\N	25.0000	0.0000	Sauce	Salted Caramel · 2 Pumps	2026-05-03 15:44:46.957388+03	90	3	2	25.0000
1315	333	269	\N	25.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 15:44:46.957388+03	113	4	0	25.0000
1316	333	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 15:44:46.957388+03	35	5	1	36.0000
1317	333	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 15:44:46.957388+03	77	6	3	170.0000
1318	333	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 15:44:46.957388+03	\N	8	5	0.0000
1319	333	248	\N	5.0000	0.0000	Sauce	Caramel · 1 Pump	2026-05-03 15:44:46.957388+03	73	8	0	5.0000
1320	333	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-05-03 15:44:46.957388+03	\N	7	4	90.0000
1321	333	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 15:44:46.957388+03	\N	100	100	0.0000
1322	334	\N	\N	0.0000	0.0000	Syrup	None	2026-05-03 17:35:09.39786+03	\N	2	2	0.0000
1323	334	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 17:35:09.39786+03	35	4	1	36.0000
1324	334	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 17:35:09.39786+03	77	5	3	170.0000
1325	334	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 17:35:09.39786+03	113	3	0	30.0000
1326	334	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 17:35:09.39786+03	\N	1	6	0.0000
1327	334	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 17:35:09.39786+03	\N	7	5	35.0000
1328	334	235	\N	90.0000	0.0000	Milk	Full Cream (90ml)	2026-05-03 17:35:09.39786+03	\N	6	4	90.0000
1329	334	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 17:35:09.39786+03	\N	100	100	0.0000
1330	336	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 19:13:52.13228+03	\N	1	6	0.0000
1331	336	242	\N	35.0000	0.0000	Sauce	Condensed · 2 Pumps	2026-05-03 19:13:52.13228+03	103	2	2	35.0000
1332	336	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 19:13:52.13228+03	35	3	1	36.0000
1333	336	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 19:13:52.13228+03	77	4	3	190.0000
1334	336	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 19:13:52.13228+03	\N	6	5	0.0000
1335	336	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-03 19:13:52.13228+03	\N	5	4	140.0000
1336	336	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 19:13:52.13228+03	\N	100	100	0.0000
1337	337	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 20:01:42.048794+03	\N	1	6	0.0000
1338	337	245	\N	60.0000	0.0000	Sauce	Pistachio · 2 Pumps	2026-05-03 20:01:42.048794+03	97	2	2	60.0000
1339	337	\N	\N	380.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-03 20:01:42.048794+03	77	5	3	380.0000
1340	337	224	\N	36.0000	0.0000	Coffee	Colombian · Double	2026-05-03 20:01:42.048794+03	35	4	1	72.0000
1341	337	269	\N	60.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-03 20:01:42.048794+03	113	3	0	60.0000
1342	337	244	\N	70.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-03 20:01:42.048794+03	\N	7	5	70.0000
1343	337	235	\N	200.0000	0.0000	Milk	Full Cream (100ml)	2026-05-03 20:01:42.048794+03	\N	6	4	200.0000
1344	337	302	\N	2.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 20:01:42.048794+03	\N	100	100	0.0000
1345	338	225	\N	18.0000	0.0000	Coffee	Ethiobian · Double	2026-05-03 20:01:42.048794+03	38	1	1	25.0000
1346	338	\N	\N	0.0000	0.0000	Syrap	None	2026-05-03 20:01:42.048794+03	\N	1	1	0.0000
1347	338	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-05-03 20:01:42.048794+03	\N	5	5	20.0000
1348	338	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-03 20:01:42.048794+03	\N	1	5	0.0000
1349	338	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-03 20:01:42.048794+03	\N	6	6	0.0000
1350	338	235	\N	120.0000	0.0000	Milk	Full Cream (120ml)	2026-05-03 20:01:42.048794+03	\N	6	6	120.0000
1351	338	298	\N	1.0000	0.0000	Packaging	cup hot 8 oz	2026-05-03 20:01:42.048794+03	\N	100	100	0.0000
1352	339	\N	\N	130.0000	0.0000	Water	Ice Cubes · Standard	2026-05-03 20:01:42.048794+03	77	2	2	130.0000
1353	339	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-03 20:01:42.048794+03	35	1	1	36.0000
1354	339	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-03 20:01:42.048794+03	\N	100	100	0.0000
1355	340	\N	\N	130.0000	0.0000	Water	Ice Cubes · Standard	2026-05-04 11:26:13.456561+03	77	2	2	130.0000
1356	340	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-04 11:26:13.456561+03	35	1	1	36.0000
1357	340	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-04 11:26:13.456561+03	\N	100	100	0.0000
1358	341	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-05-04 11:32:24.909654+03	38	1	1	36.0000
1359	341	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-04 11:32:24.909654+03	\N	100	100	0.0000
1360	342	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-04 11:32:24.909654+03	\N	1	7	0.0000
1361	342	\N	\N	0.0000	0.0000	Syrup	None	2026-05-04 11:32:24.909654+03	\N	2	2	0.0000
1362	342	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-04 11:32:24.909654+03	50	3	3	30.0000
1363	342	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-04 11:32:24.909654+03	35	4	1	36.0000
1364	342	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-04 11:32:24.909654+03	\N	6	5	40.0000
1365	342	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-04 11:32:24.909654+03	\N	7	6	0.0000
1366	342	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-04 11:32:24.909654+03	\N	5	4	250.0000
1367	342	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-04 11:32:24.909654+03	\N	100	100	0.0000
1368	343	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-05-04 11:40:32.787741+03	38	1	1	36.0000
1369	343	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-04 11:40:32.787741+03	\N	100	100	0.0000
1370	344	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-04 11:43:36.426373+03	35	1	1	36.0000
1371	344	258	\N	15.0000	35.0000	Syrup	Caramel · 1 Pump	2026-05-04 11:43:36.426373+03	70	1	1	15.0000
1372	344	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-05-04 11:43:36.426373+03	\N	1	1	70.0000
1373	344	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-04 11:43:36.426373+03	\N	5	5	0.0000
1374	344	237	\N	235.0000	65.0000	Milk	Coconut Milk (235ml)	2026-05-04 11:43:36.426373+03	\N	6	6	235.0000
1375	344	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-04 11:43:36.426373+03	\N	100	100	0.0000
1376	346	261	\N	90.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-04 16:21:08.81146+03	50	1	1	90.0000
1377	346	270	\N	90.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-04 16:21:08.81146+03	92	2	0	90.0000
1378	346	\N	\N	540.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-04 16:21:08.81146+03	77	3	2	540.0000
1379	346	244	\N	105.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-04 16:21:08.81146+03	\N	5	4	105.0000
1380	346	235	\N	420.0000	0.0000	Milk	Full Cream (140ml)	2026-05-04 16:21:08.81146+03	\N	4	3	420.0000
1381	346	302	\N	3.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-04 16:21:08.81146+03	\N	100	100	0.0000
1382	347	261	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-05-04 16:32:57.067715+03	50	1	1	30.0000
1383	347	270	\N	30.0000	0.0000	Powder	Chocolate · 1 Pump	2026-05-04 16:32:57.067715+03	92	2	0	30.0000
1384	347	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-04 16:32:57.067715+03	77	3	2	180.0000
1385	347	244	\N	35.0000	35.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-04 16:32:57.067715+03	\N	5	4	35.0000
1386	347	235	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-05-04 16:32:57.067715+03	\N	4	3	140.0000
1387	347	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-04 16:32:57.067715+03	\N	100	100	0.0000
1388	348	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-05-05 17:34:44.37287+03	\N	1	0	150.0000
1389	348	260	\N	40.0000	0.0000	Sweetner	White Sugar · 2 Pumps	2026-05-05 17:34:44.37287+03	84	2	2	40.0000
1390	348	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-05-05 17:34:44.37287+03	\N	3	3	30.0000
1391	348	252	\N	20.0000	0.0000	Sauce	Starwberry · 2 Pumps	2026-05-05 17:34:44.37287+03	118	4	4	20.0000
1392	348	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-05 17:34:44.37287+03	77	5	5	180.0000
1393	348	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-05 17:34:44.37287+03	\N	100	100	0.0000
1451	360	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-05-10 20:57:39.842065+03	38	1	1	36.0000
1452	360	235	\N	120.0000	0.0000	Foam	Macchiato Foam (40ml)	2026-05-10 20:57:39.842065+03	\N	1	1	40.0000
1453	360	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-10 20:57:39.842065+03	\N	100	100	0.0000
1394	349	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-05-05 17:38:16.682724+03	\N	1	0	150.0000
1395	349	260	\N	40.0000	0.0000	Sweetner	White Sugar · 2 Pumps	2026-05-05 17:38:16.682724+03	84	2	2	40.0000
1396	349	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-05-05 17:38:16.682724+03	\N	3	3	30.0000
1397	349	252	\N	20.0000	0.0000	Sauce	Starwberry · 2 Pumps	2026-05-05 17:38:16.682724+03	118	4	4	20.0000
1398	349	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-05 17:38:16.682724+03	77	5	5	180.0000
1399	349	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-05 17:38:16.682724+03	\N	100	100	0.0000
1400	350	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-05 17:43:10.323259+03	\N	1	7	0.0000
1401	350	\N	\N	0.0000	0.0000	Syrup	None	2026-05-05 17:43:10.323259+03	\N	2	2	0.0000
1402	350	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-05 17:43:10.323259+03	35	3	1	36.0000
1403	350	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-05 17:43:10.323259+03	77	5	4	150.0000
1404	350	\N	\N	20.0000	0.0000	Foam	Light Foam (20ml)	2026-05-05 17:43:10.323259+03	\N	6	0	20.0000
1405	350	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-05 17:43:10.323259+03	\N	7	5	0.0000
1406	350	235	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-05-05 17:43:10.323259+03	\N	7	7	150.0000
1407	350	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-05 17:43:10.323259+03	\N	100	100	0.0000
1408	351	225	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-05-05 17:43:10.323259+03	38	1	1	36.0000
1409	351	235	\N	120.0000	0.0000	Foam	Macchiato Foam (40ml)	2026-05-05 17:43:10.323259+03	\N	1	1	40.0000
1410	351	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-05 17:43:10.323259+03	\N	100	100	0.0000
1411	352	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-05 18:00:21.220397+03	\N	1	6	0.0000
1412	352	248	\N	20.0000	0.0000	Sauce	Caramel · 2 Pumps	2026-05-05 18:00:21.220397+03	74	2	2	20.0000
1413	352	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-05 18:00:21.220397+03	55	3	3	10.0000
1414	352	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-05 18:00:21.220397+03	35	4	1	36.0000
1415	352	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-05-05 18:00:21.220397+03	\N	6	5	40.0000
1416	352	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-05 18:00:21.220397+03	\N	8	8	0.0000
1417	352	248	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump	2026-05-05 18:00:21.220397+03	73	8	0	10.0000
1418	352	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-05 18:00:21.220397+03	\N	5	4	250.0000
1419	352	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-05 18:00:21.220397+03	\N	100	100	0.0000
1420	353	\N	\N	150.0000	0.0000	Water	Water (150ml)	2026-05-05 18:00:21.220397+03	\N	1	0	150.0000
1421	353	260	\N	40.0000	0.0000	Sweetner	White Sugar · 2 Pumps	2026-05-05 18:00:21.220397+03	84	2	2	40.0000
1422	353	284	\N	30.0000	0.0000	Lemon Juice	Lemon Juice (30ml)	2026-05-05 18:00:21.220397+03	\N	3	3	30.0000
1423	353	252	\N	20.0000	0.0000	Sauce	Starwberry · 2 Pumps	2026-05-05 18:00:21.220397+03	118	4	4	20.0000
1424	353	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-05-05 18:00:21.220397+03	77	5	5	180.0000
1425	353	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-05 18:00:21.220397+03	\N	100	100	0.0000
1426	354	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-07 23:36:01.866622+03	35	1	1	36.0000
1427	354	\N	\N	0.0000	0.0000	Syrup	None	2026-05-07 23:36:01.866622+03	\N	1	1	0.0000
1428	354	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-05-07 23:36:01.866622+03	\N	1	1	70.0000
1429	354	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-05-07 23:36:01.866622+03	\N	5	5	0.0000
1430	354	235	\N	250.0000	0.0000	Milk	Full Cream (250ml)	2026-05-07 23:36:01.866622+03	\N	6	6	250.0000
1431	354	300	\N	1.0000	0.0000	Packaging	cup hot 12 oz	2026-05-07 23:36:01.866622+03	\N	100	100	0.0000
1432	355	224	\N	18.0000	0.0000	Coffee	Colombian · Double	2026-05-07 23:36:01.866622+03	35	5	1	36.0000
1433	355	248	\N	35.0000	0.0000	Sauce	Caramel · 2 Pumps	2026-05-07 23:36:01.866622+03	74	3	2	35.0000
1434	355	259	\N	10.0000	0.0000	Syrup	Vanilla · 1 Pump	2026-05-07 23:36:01.866622+03	55	2	3	10.0000
1435	355	\N	\N	190.0000	0.0000	Cubes	Ice Cubes · Standard	2026-05-07 23:36:01.866622+03	77	6	4	190.0000
1436	355	244	\N	35.0000	0.0000	Whipped Cream	Whipped Cream (35ml)	2026-05-07 23:36:01.866622+03	\N	6	6	35.0000
1437	355	\N	\N	0.0000	0.0000	Sweetener	None	2026-05-07 23:36:01.866622+03	\N	1	7	0.0000
1438	355	269	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-05-07 23:36:01.866622+03	113	8	0	30.0000
1439	355	235	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-05-07 23:36:01.866622+03	\N	7	5	100.0000
1440	355	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-07 23:36:01.866622+03	\N	100	100	0.0000
1441	357	277	\N	1.0000	0.0000	Green Tea	Green Tea Pack (1ml)	2026-05-07 23:36:01.866622+03	\N	1	0	1.0000
1442	357	\N	\N	0.0000	0.0000	Sweetner	None	2026-05-07 23:36:01.866622+03	\N	2	2	0.0000
1443	358	225	\N	36.0000	65.0000	Coffe Type	Ethiobian · Triple	2026-05-08 22:23:15.461905+03	39	1	1	54.0000
1444	358	\N	\N	120.0000	0.0000	Foam	Steam Milk (40ml)	2026-05-08 22:23:15.461905+03	\N	1	1	40.0000
1445	358	297	\N	1.0000	0.0000	Packaging	cup hot 4 oz	2026-05-08 22:23:15.461905+03	\N	100	100	0.0000
1446	359	254	\N	20.0000	35.0000	Syrap	Coconut · 2 Pumps	2026-05-08 22:23:15.461905+03	142	1	1	20.0000
1447	359	282	\N	0.0000	0.0000	Pinapple	Pinaple	2026-05-08 22:23:15.461905+03	\N	2	2	0.0000
1448	359	241	\N	30.0000	65.0000	Milk	Lactos Free Milk (30ml)	2026-05-08 22:23:15.461905+03	\N	3	3	30.0000
1449	359	\N	\N	200.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-05-08 22:23:15.461905+03	78	4	4	200.0000
1450	359	302	\N	1.0000	0.0000	Packaging	cup Cold 16 oz	2026-05-08 22:23:15.461905+03	\N	100	100	0.0000
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, drink_id, drink_name, quantity, unit_price, line_total, special_notes, created_at, updated_at, kitchen_station, status, ready_at, kitchen_station_id) FROM stdin;
293	191	51	Iced White Chocolate Matcha	1	200.00	200.00	\N	2026-05-03 13:12:11.993448+03	2026-05-03 13:13:45.18+03	cold-bar	ready	2026-05-03 13:13:45.18+03	2
294	191	98	Water	1	25.00	25.00	\N	2026-05-03 13:12:11.993448+03	2026-05-03 13:14:10.932+03	food-pastry	ready	2026-05-03 13:14:10.932+03	\N
320	195	94	Latte	1	150.00	150.00	\N	2026-05-03 13:58:11.590116+03	2026-05-03 14:02:40.703+03	hot-bar	ready	2026-05-03 14:02:40.702+03	1
319	195	22	Iced Cortado	1	195.00	195.00	\N	2026-05-03 13:58:11.590116+03	2026-05-03 14:02:43.006+03	cold-bar	ready	2026-05-03 14:02:43.006+03	2
325	199	37	Iced Salted Vanilla Latte	1	180.00	180.00	\N	2026-05-03 15:20:55.193493+03	2026-05-03 15:20:55.193493+03	cold-bar	pending	\N	2
332	203	47	Salted Vanilla Latte Frappe	1	180.00	180.00	\N	2026-05-03 15:40:32.982435+03	2026-05-03 15:45:31.408+03	cold-bar	ready	2026-05-03 15:45:31.408+03	2
336	207	40	Iced Spanish Latte	1	175.00	175.00	\N	2026-05-03 19:13:52.13228+03	2026-05-03 19:24:50.142+03	cold-bar	ready	2026-05-03 19:24:50.142+03	2
341	210	15	Espresso	1	95.00	95.00	\N	2026-05-04 11:32:24.909654+03	2026-05-04 11:39:28.775+03	cold-bar	ready	2026-05-04 11:39:28.775+03	2
344	212	14	Cappuccino 	1	230.00	230.00	\N	2026-05-04 11:43:36.426373+03	2026-05-04 11:46:33.669+03	cold-bar	ready	2026-05-04 11:46:33.669+03	2
342	210	88	Mocha	1	175.00	175.00	\N	2026-05-04 11:32:24.909654+03	2026-05-04 11:49:32.199+03	hot-bar	ready	2026-05-04 11:49:32.199+03	1
184	142	93	Blueberry Mojito	1	95.00	95.00	\N	2026-04-30 20:48:24.231106+03	2026-04-30 21:08:50.644+03	main-bar	ready	2026-04-30 21:08:50.644+03	\N
185	142	93	Blueberry Mojito	1	95.00	95.00	\N	2026-04-30 20:48:24.231106+03	2026-04-30 21:08:51.478+03	main-bar	ready	2026-04-30 21:08:51.478+03	\N
155	122	20	Cortado	1	120.00	120.00	\N	2026-04-29 16:47:37.245065+03	2026-04-29 16:52:39.464+03	hot-bar	ready	2026-04-29 16:52:39.463+03	1
311	192	106	V Cola Dite	1	55.00	55.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:05.609+03	food/pastry	ready	2026-05-03 13:31:05.609+03	4
302	192	62	Blue Passion Mojito	1	105.00	105.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:11.112+03	cold-bar	ready	2026-05-03 13:31:11.112+03	2
301	192	51	Iced White Chocolate Matcha	1	200.00	200.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:11.538+03	cold-bar	ready	2026-05-03 13:31:11.538+03	2
300	192	27	Pistachio Latte  Frappe	1	230.00	230.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:13.438+03	cold-bar	ready	2026-05-03 13:31:13.438+03	2
299	192	46	Iced White Mocha 	1	180.00	180.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:14.009+03	cold-bar	ready	2026-05-03 13:31:14.008+03	2
298	192	37	Iced Salted Vanilla Latte	1	415.00	415.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:15.264+03	cold-bar	ready	2026-05-03 13:31:15.264+03	2
295	192	11	 Macchiato	1	120.00	120.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:20.147+03	hot-bar	ready	2026-05-03 13:31:20.146+03	1
296	192	76	Almond Flat White	1	395.00	395.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:21.072+03	hot-bar	ready	2026-05-03 13:31:21.072+03	1
303	192	81	English Breakfast	1	70.00	70.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:22.201+03	hot-bar	ready	2026-05-03 13:31:22.201+03	1
297	192	84	Double Turkish Coffee	1	135.00	135.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:27.825+03	turkish-bar	ready	2026-05-03 13:31:27.825+03	3
312	192	99	Arabian Coffee	1	145.00	145.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:28.923+03	turkish-bar	ready	2026-05-03 13:31:28.923+03	3
313	192	99	Arabian Coffee	1	145.00	145.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:31:29.817+03	turkish-bar	ready	2026-05-03 13:31:29.817+03	3
304	192	110	Belgain Chocolate Sable Box	1	350.00	350.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:08.333+03	food-pastry	ready	2026-05-03 13:32:08.333+03	\N
305	192	111	Chocolate Butter Biscuits Box	1	240.00	240.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:09.142+03	food-pastry	ready	2026-05-03 13:32:09.142+03	\N
306	192	112	Butter Biscuits Box	1	200.00	200.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:09.848+03	food-pastry	ready	2026-05-03 13:32:09.848+03	\N
307	192	114	Wunder Sugar Free Belgian Milk Chocolate	1	75.00	75.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:10.517+03	food-pastry	ready	2026-05-03 13:32:10.517+03	\N
308	192	119	Dark Chocolate Plain  70%	1	65.00	65.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:11.231+03	food-pastry	ready	2026-05-03 13:32:11.231+03	\N
309	192	107	V Pina Colada	1	55.00	55.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:11.986+03	food-pastry	ready	2026-05-03 13:32:11.985+03	\N
310	192	108	V Gold Pinapple	1	55.00	55.00	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:32:12.752+03	food-pastry	ready	2026-05-03 13:32:12.752+03	\N
321	196	14	Cappuccino 	1	195.00	195.00	\N	2026-05-03 14:24:20.962485+03	2026-05-03 14:31:27.908+03	cold-bar	ready	2026-05-03 14:31:27.908+03	2
322	196	98	Water	1	25.00	25.00	\N	2026-05-03 14:24:20.962485+03	2026-05-03 14:31:28.796+03	food-pastry	ready	2026-05-03 14:31:28.796+03	\N
339	208	69	Iced Americano	1	125.00	125.00	\N	2026-05-03 20:01:42.048794+03	2026-05-03 20:10:49.661+03	cold-bar	ready	2026-05-03 20:10:49.66+03	2
343	211	15	Espresso	1	95.00	95.00	\N	2026-05-04 11:40:32.787741+03	2026-05-04 11:40:32.787741+03	hot-bar	pending	\N	2
346	213	60	Iced Chocolate  Frappe	3	195.00	585.00	\N	2026-05-04 16:21:08.81146+03	2026-05-04 16:21:08.81146+03	cold-bar	pending	\N	2
326	200	37	Iced Salted Vanilla Latte	1	180.00	180.00	\N	2026-05-03 15:23:43.731605+03	2026-05-03 15:27:45.231+03	cold-bar	ready	2026-05-03 15:27:45.231+03	2
333	204	47	Salted Vanilla Latte Frappe	1	180.00	180.00	\N	2026-05-03 15:44:46.957388+03	2026-05-03 15:47:06.567+03	cold-bar	ready	2026-05-03 15:47:06.567+03	2
337	208	27	Pistachio Latte  Frappe	2	230.00	460.00	\N	2026-05-03 20:01:42.048794+03	2026-05-03 20:10:48.111+03	cold-bar	ready	2026-05-03 20:10:48.111+03	2
338	208	20	Cortado	1	120.00	120.00	\N	2026-05-03 20:01:42.048794+03	2026-05-03 20:10:48.864+03	hot-bar	ready	2026-05-03 20:10:48.864+03	1
264	189	98	Water	1	25.00	25.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:51.157+03	food-pastry	ready	2026-05-03 11:23:51.156+03	\N
265	189	104	Sparkling Water	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:53.331+03	food-pastry	ready	2026-05-03 11:23:53.331+03	\N
266	189	97	V Cola	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:53.934+03	food-pastry	ready	2026-05-03 11:23:53.934+03	\N
268	189	107	V Pina Colada	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:54.946+03	food-pastry	ready	2026-05-03 11:23:54.946+03	\N
269	189	108	V Gold Pinapple	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:55.294+03	food-pastry	ready	2026-05-03 11:23:55.294+03	\N
270	189	109	V Pomegranate	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:55.644+03	food-pastry	ready	2026-05-03 11:23:55.644+03	\N
271	189	103	Orange Juice	1	95.00	95.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:55.984+03	food-pastry	ready	2026-05-03 11:23:55.984+03	\N
273	189	102	Wunder Suger Free Belgian Mint Green	1	75.00	75.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:06.277+03	food-pastry	ready	2026-05-03 11:24:06.277+03	\N
272	189	101	Wunder Sugar Free Belgian Strawberry Milk 	1	75.00	75.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:03.336+03	food-pastry	ready	2026-05-03 11:24:03.336+03	\N
274	189	114	Wunder Sugar Free Belgian Milk Chocolate	1	75.00	75.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:06.829+03	food-pastry	ready	2026-05-03 11:24:06.829+03	\N
217	166	14	Cappuccino 	1	195.00	195.00	\N	2026-05-01 20:14:53.761241+03	2026-05-01 20:50:40.688+03	cold-bar	ready	2026-05-01 20:50:40.687+03	2
275	189	115	Dark Chocolate Almond	1	65.00	65.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:07.704+03	food-pastry	ready	2026-05-03 11:24:07.704+03	\N
219	167	48	Iced Strawberry Matcha  	1	265.00	265.00	\N	2026-05-01 21:39:48.609623+03	2026-05-01 21:47:17.18+03	cold-bar	ready	2026-05-01 21:47:17.179+03	2
220	167	83	Matcha Latte	1	190.00	190.00	\N	2026-05-01 21:39:48.609623+03	2026-05-01 21:47:18.105+03	hot-bar	ready	2026-05-01 21:47:18.104+03	1
276	189	116	Dark Chocolate Honeycomb	1	65.00	65.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:09.811+03	food-pastry	ready	2026-05-03 11:24:09.811+03	\N
277	189	117	Dark Chocolate Cranberry	1	65.00	65.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:10.332+03	food-pastry	ready	2026-05-03 11:24:10.332+03	\N
278	189	118	Dark Chocolate Mint 	1	65.00	65.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:11.657+03	food-pastry	ready	2026-05-03 11:24:11.657+03	\N
279	189	119	Dark Chocolate Plain  70%	1	65.00	65.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:12.171+03	food-pastry	ready	2026-05-03 11:24:12.171+03	\N
283	189	112	Butter Biscuits Box	1	200.00	200.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:13.999+03	food-pastry	ready	2026-05-03 11:24:13.999+03	\N
282	189	111	Chocolate Butter Biscuits Box	1	240.00	240.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:14.802+03	food-pastry	ready	2026-05-03 11:24:14.802+03	\N
281	189	110	Belgain Chocolate Sable Box	1	350.00	350.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:15.905+03	food-pastry	ready	2026-05-03 11:24:15.905+03	\N
280	189	105	Can Cake Triple Chocolate	1	200.00	200.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:24:17.257+03	food-pastry	ready	2026-05-03 11:24:17.257+03	\N
156	123	70	Iced Caramel Macchiato	1	180.00	180.00	\N	2026-04-29 17:01:42.910699+03	2026-04-29 17:03:22.823+03	cold-bar	ready	2026-04-29 17:03:22.823+03	2
157	124	17	Espresso Conpana	1	130.00	130.00	\N	2026-04-29 18:33:45.626999+03	2026-04-29 18:33:45.626999+03	hot-bar	pending	\N	1
158	125	50	Spanish Frappe	1	180.00	180.00	\N	2026-04-29 18:41:07.962351+03	2026-04-29 18:41:07.962351+03	cold-bar	pending	\N	2
159	126	50	Spanish Frappe	1	180.00	180.00	\N	2026-04-29 18:41:20.51627+03	2026-04-29 18:41:20.51627+03	cold-bar	pending	\N	2
160	127	50	Spanish Frappe	1	180.00	180.00	\N	2026-04-29 18:41:28.463195+03	2026-04-29 18:41:28.463195+03	cold-bar	pending	\N	2
161	128	50	Spanish Frappe	1	180.00	180.00	\N	2026-04-29 18:42:24.062646+03	2026-04-29 18:42:24.062646+03	cold-bar	pending	\N	2
162	129	108	V Gold Pinapple	1	55.00	55.00	\N	2026-04-29 20:19:27.279614+03	2026-04-29 20:19:27.279614+03	food/pastry	pending	\N	4
163	130	40	Iced Spanish Latte	1	196.00	196.00	\N	2026-04-29 20:49:20.779864+03	2026-04-29 20:49:20.779864+03	cold-bar	pending	\N	2
164	130	71	FlatWhite 	1	147.50	147.50	\N	2026-04-29 20:49:20.779864+03	2026-04-29 20:49:20.779864+03	hot-bar	pending	\N	1
165	131	71	FlatWhite 	1	125.00	125.00	\N	2026-04-29 21:47:13.970185+03	2026-04-29 21:58:54.625+03	hot-bar	ready	2026-04-29 21:58:54.623+03	1
166	131	40	Iced Spanish Latte	1	196.00	196.00	\N	2026-04-29 21:47:13.970185+03	2026-04-29 21:58:55.78+03	cold-bar	ready	2026-04-29 21:58:55.78+03	2
167	132	98	Water	1	25.00	25.00	\N	2026-04-30 12:15:11.496927+03	2026-04-30 15:18:36.633+03	food/pastry	ready	2026-04-30 15:18:36.633+03	4
168	132	21	Iced Cappuccino	1	240.00	240.00	\N	2026-04-30 12:15:11.496927+03	2026-04-30 15:18:37.811+03	cold-bar	ready	2026-04-30 15:18:37.81+03	2
169	133	88	Mocha	1	175.00	175.00	\N	2026-04-30 12:16:06.055197+03	2026-04-30 15:18:39.904+03	hot-bar	ready	2026-04-30 15:18:39.904+03	1
170	134	69	Iced Americano	1	125.00	125.00	\N	2026-04-30 15:32:16.403556+03	2026-04-30 15:36:58.819+03	cold-bar	ready	2026-04-30 15:36:58.819+03	2
171	135	88	Mocha	1	175.00	175.00	\N	2026-04-30 15:35:49.502919+03	2026-04-30 15:39:23.601+03	hot-bar	ready	2026-04-30 15:39:23.601+03	1
172	136	57	Purple Mango	1	105.00	105.00	\N	2026-04-30 15:50:08.221522+03	2026-04-30 16:03:50.638+03	cold-bar	ready	2026-04-30 16:03:50.638+03	2
173	137	36	Iced Latte 	1	185.00	185.00	\N	2026-04-30 16:25:07.076808+03	2026-04-30 16:27:38.018+03	cold-bar	ready	2026-04-30 16:27:38.017+03	2
175	137	103	Juice	1	95.00	95.00	\N	2026-04-30 16:25:07.076808+03	2026-04-30 16:27:39.052+03	food/pastry	ready	2026-04-30 16:27:39.052+03	4
174	137	98	Water	1	25.00	25.00	\N	2026-04-30 16:25:07.076808+03	2026-04-30 16:27:39.511+03	food/pastry	ready	2026-04-30 16:27:39.511+03	4
176	137	14	Cappuccino 	1	130.00	130.00	\N	2026-04-30 16:25:07.076808+03	2026-04-30 16:27:40.219+03	cold-bar	ready	2026-04-30 16:27:40.219+03	2
178	138	79	Single Turkish Coffee	1	85.00	85.00	\N	2026-04-30 18:55:06.02347+03	2026-04-30 18:59:11.035+03	turkish-bar	ready	2026-04-30 18:59:11.035+03	3
177	138	4	Americano	1	110.00	110.00	\N	2026-04-30 18:55:06.02347+03	2026-04-30 19:06:50.075+03	hot-bar	ready	2026-04-30 19:06:50.075+03	1
179	139	11	 Macchiato	1	120.00	120.00	\N	2026-04-30 20:12:20.849379+03	2026-04-30 20:34:09.297+03	hot-bar	ready	2026-04-30 20:34:09.297+03	1
180	139	98	Water	1	25.00	25.00	\N	2026-04-30 20:12:20.849379+03	2026-04-30 20:34:10.288+03	food/pastry	ready	2026-04-30 20:34:10.288+03	4
181	140	40	Iced Spanish Latte	1	175.00	175.00	\N	2026-04-30 20:30:56.798296+03	2026-04-30 20:43:30.259+03	cold-bar	ready	2026-04-30 20:43:30.259+03	2
182	141	40	Iced Spanish Latte	1	175.00	175.00	\N	2026-04-30 20:44:32.603347+03	2026-04-30 21:08:04.812+03	cold-bar	ready	2026-04-30 21:08:04.812+03	2
183	141	61	Green Apple Mojito	1	105.00	105.00	\N	2026-04-30 20:44:32.603347+03	2026-04-30 21:08:05.835+03	cold-bar	ready	2026-04-30 21:08:05.835+03	2
186	143	73	Pistachio Flat White	1	175.00	175.00	\N	2026-04-30 21:10:39.496483+03	2026-04-30 21:11:42.016+03	hot-bar	ready	2026-04-30 21:11:42.015+03	1
187	143	98	Water	1	25.00	25.00	\N	2026-04-30 21:10:39.496483+03	2026-04-30 21:11:45.503+03	food/pastry	ready	2026-04-30 21:11:45.503+03	4
192	148	47	Salted Vanilla Latte Frappe	1	180.00	180.00	\N	2026-04-30 21:14:29.464389+03	2026-04-30 21:14:29.464389+03	cold-bar	pending	\N	2
188	144	40	Iced Spanish Latte	1	175.00	175.00	\N	2026-04-30 21:13:18.858148+03	2026-04-30 21:16:11.469+03	cold-bar	ready	2026-04-30 21:16:11.468+03	2
196	151	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-04-30 21:17:09.188673+03	2026-04-30 21:17:09.188673+03	cold-bar	pending	\N	2
189	145	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-04-30 21:13:22.543708+03	2026-04-30 21:17:37.231+03	cold-bar	ready	2026-04-30 21:17:37.231+03	2
190	146	47	Salted Vanilla Latte Frappe	1	180.00	180.00	\N	2026-04-30 21:13:31.565036+03	2026-04-30 21:26:12.989+03	cold-bar	ready	2026-04-30 21:26:12.989+03	2
191	147	31	Salted Caramel Cortado Frappe	1	170.00	170.00	\N	2026-04-30 21:14:20.063723+03	2026-04-30 21:28:12.699+03	cold-bar	ready	2026-04-30 21:28:12.699+03	2
292	190	116	Dark Chocolate Honeycomb	1	65.00	65.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:15.748+03	food-pastry	ready	2026-05-03 13:01:15.747+03	\N
291	190	115	Dark Chocolate Almond	1	65.00	65.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:26.197+03	food-pastry	ready	2026-05-03 13:01:26.196+03	\N
290	190	114	Wunder Sugar Free Belgian Milk Chocolate	1	75.00	75.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:27.061+03	food-pastry	ready	2026-05-03 13:01:27.06+03	\N
289	190	102	Wunder Suger Free Belgian Mint Green	1	75.00	75.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:27.938+03	food-pastry	ready	2026-05-03 13:01:27.938+03	\N
288	190	101	Wunder Sugar Free Belgian Strawberry Milk 	1	75.00	75.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:28.862+03	food-pastry	ready	2026-05-03 13:01:28.862+03	\N
286	190	109	V Pomegranate	1	55.00	55.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:30.035+03	food-pastry	ready	2026-05-03 13:01:30.035+03	\N
285	190	108	V Gold Pinapple	1	55.00	55.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:30.73+03	food-pastry	ready	2026-05-03 13:01:30.73+03	\N
287	190	103	Orange Juice	1	95.00	95.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:31.01+03	food-pastry	ready	2026-05-03 13:01:31.01+03	\N
284	190	107	V Pina Colada	1	55.00	55.00	\N	2026-05-03 11:48:28.035074+03	2026-05-03 13:01:31.237+03	food-pastry	ready	2026-05-03 13:01:31.236+03	\N
314	193	76	Almond Flat White	1	175.00	175.00	\N	2026-05-03 13:29:11.511771+03	2026-05-03 13:32:15.557+03	hot-bar	ready	2026-05-03 13:32:15.557+03	1
315	193	4	Americano	1	110.00	110.00	\N	2026-05-03 13:29:11.511771+03	2026-05-03 13:32:16.439+03	hot-bar	ready	2026-05-03 13:32:16.439+03	1
316	193	64	Green Apple Redbull	1	200.00	200.00	\N	2026-05-03 13:29:11.511771+03	2026-05-03 13:32:17.366+03	cold-bar	ready	2026-05-03 13:32:17.366+03	2
323	197	58	Nutty Fudge	1	230.00	230.00	\N	2026-05-03 14:41:41.609455+03	2026-05-03 14:41:41.609455+03	cold-bar	pending	\N	2
327	201	20	Cortado	1	155.00	155.00	\N	2026-05-03 15:27:35.011268+03	2026-05-03 15:30:47.701+03	hot-bar	ready	2026-05-03 15:30:47.7+03	1
334	205	45	Latte Frappe	1	150.00	150.00	\N	2026-05-03 17:35:09.39786+03	2026-05-03 18:06:15.84+03	cold-bar	ready	2026-05-03 18:06:15.839+03	2
193	149	57	Purple Mango	1	105.00	105.00	\N	2026-04-30 21:15:28.649177+03	2026-04-30 21:28:16.731+03	cold-bar	ready	2026-04-30 21:28:16.731+03	2
194	149	62	Blue Passion Mojito	1	105.00	105.00	\N	2026-04-30 21:15:28.649177+03	2026-04-30 21:28:18.671+03	cold-bar	ready	2026-04-30 21:28:18.67+03	2
195	150	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-04-30 21:16:11.596609+03	2026-04-30 21:28:20.026+03	cold-bar	ready	2026-04-30 21:28:20.026+03	2
197	152	100	Pink Lady	1	105.00	105.00	\N	2026-04-30 21:17:39.538973+03	2026-04-30 21:28:22.698+03	cold-bar	ready	2026-04-30 21:28:22.698+03	2
198	152	62	Blue Passion Mojito	1	105.00	105.00	\N	2026-04-30 21:17:39.538973+03	2026-04-30 21:28:23.747+03	cold-bar	ready	2026-04-30 21:28:23.747+03	2
199	153	15	Espresso	1	95.00	95.00	\N	2026-04-30 21:30:00.625077+03	2026-04-30 21:39:40.518+03	cold-bar	ready	2026-04-30 21:39:40.516+03	2
200	153	79	Single Turkish Coffee	1	85.00	85.00	\N	2026-04-30 21:30:00.625077+03	2026-04-30 21:39:42.911+03	turkish-bar	ready	2026-04-30 21:39:42.911+03	3
201	154	20	Cortado	1	120.00	120.00	\N	2026-04-30 21:41:46.560789+03	2026-04-30 21:49:49.721+03	hot-bar	ready	2026-04-30 21:49:49.721+03	1
202	154	35	Pistachio Flat White Frappe	1	220.00	220.00	\N	2026-04-30 21:41:46.560789+03	2026-04-30 21:50:09.731+03	cold-bar	ready	2026-04-30 21:50:09.73+03	2
203	154	68	Pina Colada	1	115.00	115.00	\N	2026-04-30 21:41:46.560789+03	2026-04-30 21:50:12.466+03	cold-bar	ready	2026-04-30 21:50:12.466+03	2
204	155	103	Juice	1	95.00	95.00	\N	2026-04-30 22:42:17.987438+03	2026-04-30 22:43:28.36+03	food/pastry	ready	2026-04-30 22:43:28.36+03	4
205	156	40	Iced Spanish Latte	1	240.00	240.00	\N	2026-04-30 23:04:26.447093+03	2026-04-30 23:05:14.158+03	cold-bar	ready	2026-04-30 23:05:14.157+03	2
206	157	98	Water	3	25.00	75.00	\N	2026-04-30 23:18:48.717738+03	2026-04-30 23:19:49.253+03	food/pastry	ready	2026-04-30 23:19:49.252+03	4
207	158	52	Iced Honey Matcha	1	265.00	265.00	\N	2026-04-30 23:22:08.241772+03	2026-04-30 23:22:43.322+03	cold-bar	ready	2026-04-30 23:22:43.322+03	2
208	159	85	v60	3	175.00	525.00	\N	2026-04-30 23:32:57.21301+03	2026-04-30 23:34:59.115+03	turkish-bar	ready	2026-04-30 23:34:59.115+03	3
209	160	98	Water	1	25.00	25.00	\N	2026-04-30 23:39:54.220309+03	2026-04-30 23:41:27.946+03	food/pastry	ready	2026-04-30 23:41:27.946+03	4
210	161	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-04-30 23:40:27.059615+03	2026-04-30 23:44:55.288+03	cold-bar	ready	2026-04-30 23:44:55.288+03	2
212	161	100	Pink Lady	1	105.00	105.00	\N	2026-04-30 23:40:27.059615+03	2026-05-01 00:02:47.862+03	cold-bar	ready	2026-05-01 00:02:47.861+03	2
211	161	32	Iced Hazelnut Flat White	1	165.00	165.00	\N	2026-04-30 23:40:27.059615+03	2026-04-30 23:50:24.743+03	cold-bar	ready	2026-04-30 23:50:24.742+03	2
213	162	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-05-01 00:12:45.120959+03	2026-05-01 00:21:33.098+03	cold-bar	ready	2026-05-01 00:21:33.098+03	2
214	163	40	Iced Spanish Latte	1	175.00	175.00	\N	2026-05-01 13:12:27.045908+03	2026-05-01 13:18:30.812+03	cold-bar	ready	2026-05-01 13:18:30.811+03	2
215	164	112	Butter Biscuits Box	1	200.00	200.00	\N	2026-05-01 15:01:07.494278+03	2026-05-01 15:04:20.83+03	food/pastry	ready	2026-05-01 15:04:20.83+03	4
216	165	94	Latte	1	215.00	215.00	\N	2026-05-01 15:35:00.361657+03	2026-05-01 15:35:18.734+03	hot-bar	ready	2026-05-01 15:35:18.733+03	1
218	166	94	Latte	1	150.00	150.00	Extra hot	2026-05-01 20:14:53.761241+03	2026-05-01 20:50:41.596+03	hot-bar	ready	2026-05-01 20:50:41.596+03	1
221	168	58	Nutty Fudge	1	230.00	230.00	\N	2026-05-01 21:58:01.305626+03	2026-05-01 22:03:27.093+03	cold-bar	ready	2026-05-01 22:03:27.093+03	2
222	169	31	Salted Caramel Cortado Frappe	1	170.00	170.00	\N	2026-05-01 22:02:34.447903+03	2026-05-01 22:07:10.974+03	cold-bar	ready	2026-05-01 22:07:10.974+03	2
224	171	37	Iced Salted Vanilla Latte	1	245.00	245.00	\N	2026-05-01 22:20:06.86246+03	2026-05-01 22:20:06.86246+03	cold-bar	pending	\N	2
223	170	84	Double Turkish Coffee	1	135.00	135.00	\N	2026-05-01 22:18:18.374567+03	2026-05-01 22:27:58.605+03	turkish-bar	ready	2026-05-01 22:27:58.604+03	3
225	172	37	Iced Salted Vanilla Latte	1	180.00	180.00	\N	2026-05-01 22:21:03.011402+03	2026-05-01 22:28:00.511+03	cold-bar	ready	2026-05-01 22:28:00.511+03	2
226	173	100	Pink Lady	1	105.00	105.00	\N	2026-05-01 22:22:08.31307+03	2026-05-01 22:28:02.023+03	cold-bar	ready	2026-05-01 22:28:02.023+03	2
227	174	58	Nutty Fudge	1	230.00	230.00	\N	2026-05-01 23:08:49.610135+03	2026-05-01 23:08:49.610135+03	cold-bar	pending	\N	2
228	175	81	English Breakfast	1	70.00	70.00	\N	2026-05-01 23:10:03.265068+03	2026-05-01 23:14:18.937+03	hot-bar	ready	2026-05-01 23:14:18.936+03	1
229	175	58	Nutty Fudge	1	230.00	230.00	\N	2026-05-01 23:10:03.265068+03	2026-05-01 23:22:26.789+03	cold-bar	ready	2026-05-01 23:22:26.789+03	2
230	176	98	Water	1	25.00	25.00	\N	2026-05-01 23:21:07.659069+03	2026-05-01 23:29:14.013+03	food/pastry	ready	2026-05-01 23:29:14.012+03	4
231	177	95	Salted Vanilla Latte 	1	180.00	180.00	\N	2026-05-02 14:13:09.175699+03	2026-05-02 14:18:58.723+03	hot-bar	ready	2026-05-02 14:18:58.722+03	1
232	177	27	Pistachio Latte  Frappe	1	230.00	230.00	\N	2026-05-02 14:13:09.175699+03	2026-05-02 14:18:59.799+03	cold-bar	ready	2026-05-02 14:18:59.799+03	2
233	178	67	Peach Ice Tea	1	120.00	120.00	\N	2026-05-02 15:17:46.845875+03	2026-05-02 15:23:09.316+03	cold-bar	ready	2026-05-02 15:23:09.316+03	2
234	179	42	Iced Mocha	1	245.00	245.00	\N	2026-05-02 15:50:22.679165+03	2026-05-02 15:56:01.521+03	cold-bar	ready	2026-05-02 15:56:01.52+03	2
235	179	42	Iced Mocha	1	180.00	180.00	\N	2026-05-02 15:50:22.679165+03	2026-05-02 15:56:04.511+03	cold-bar	ready	2026-05-02 15:56:04.511+03	2
237	180	101	Wunder Sugar Free Belgian Strawberry Milk 	2	75.00	150.00	\N	2026-05-02 17:26:06.846086+03	2026-05-02 17:26:45.203+03	food/pastry	ready	2026-05-02 17:26:45.202+03	4
238	180	114	Wunder Sugar Free Belgian Milk Chocolate	1	75.00	75.00	\N	2026-05-02 17:26:06.846086+03	2026-05-02 17:27:09.31+03	food/pastry	ready	2026-05-02 17:27:09.31+03	4
236	180	36	Iced Latte 	1	215.00	215.00	\N	2026-05-02 17:26:06.846086+03	2026-05-02 17:28:23.657+03	cold-bar	ready	2026-05-02 17:28:23.657+03	2
239	181	115	Dark Chocolate Almond	1	65.00	65.00	\N	2026-05-02 18:53:58.567619+03	2026-05-02 18:55:54.142+03	food/pastry	ready	2026-05-02 18:55:54.142+03	4
240	181	98	Water	1	25.00	25.00	\N	2026-05-02 18:53:58.567619+03	2026-05-02 18:55:55.027+03	food/pastry	ready	2026-05-02 18:55:55.027+03	4
241	181	15	Espresso	1	95.00	95.00	\N	2026-05-02 18:53:58.567619+03	2026-05-02 18:55:55.794+03	cold-bar	ready	2026-05-02 18:55:55.794+03	2
255	182	79	Single Turkish Coffee	1	85.00	85.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:26.763+03	turkish-bar	ready	2026-05-03 10:10:26.763+03	3
242	182	19	Caramel Macchiato	1	545.00	545.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:27.906+03	hot-bar	ready	2026-05-03 10:10:27.906+03	1
243	182	76	Almond Flat White	1	470.00	470.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:28.803+03	hot-bar	ready	2026-05-03 10:10:28.803+03	1
244	182	87	Mocha Toffee Nut	1	500.00	500.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:29.605+03	hot-bar	ready	2026-05-03 10:10:29.604+03	1
245	182	37	Iced Salted Vanilla Latte	1	600.00	600.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:30.367+03	cold-bar	ready	2026-05-03 10:10:30.367+03	2
246	182	55	Mocha Toffeenut Frappe	1	580.00	580.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:31.149+03	cold-bar	ready	2026-05-03 10:10:31.149+03	2
247	182	100	Pink Lady	1	160.00	160.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:10:33.945+03	cold-bar	ready	2026-05-03 10:10:33.945+03	2
248	182	97	V Cola	1	55.00	55.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:37.938+03	cold-bar	ready	2026-05-03 10:11:37.938+03	2
249	182	97	V Cola	1	55.00	55.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:39.456+03	cold-bar	ready	2026-05-03 10:11:39.456+03	2
250	182	117	Dark Chocolate Cranberry	1	65.00	65.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:40.72+03	food/pastry	ready	2026-05-03 10:11:40.719+03	4
251	182	110	Belgain Chocolate Sable Box	1	350.00	350.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:41.513+03	food/pastry	ready	2026-05-03 10:11:41.513+03	4
252	182	113	Wunder Sugar Free Belgian Dark Chocolate 	1	75.00	75.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:42.543+03	food/pastry	ready	2026-05-03 10:11:42.542+03	4
253	182	81	English Breakfast	1	70.00	70.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:44.027+03	hot-bar	ready	2026-05-03 10:11:44.027+03	1
254	182	83	Matcha Latte	1	255.00	255.00	\N	2026-05-03 10:07:13.559905+03	2026-05-03 10:11:44.909+03	hot-bar	ready	2026-05-03 10:11:44.909+03	1
256	183	88	Mocha	1	175.00	175.00	\N	2026-05-03 10:45:17.830488+03	2026-05-03 10:45:17.830488+03	hot-bar	pending	\N	1
257	184	88	Mocha	1	175.00	175.00	\N	2026-05-03 10:46:45.736978+03	2026-05-03 10:46:45.736978+03	hot-bar	pending	\N	1
258	185	79	Single Turkish Coffee	1	85.00	85.00	\N	2026-05-03 10:48:28.420506+03	2026-05-03 10:50:01.834+03	turkish-bar	ready	2026-05-03 10:50:01.829+03	3
259	185	81	English Breakfast	1	70.00	70.00	\N	2026-05-03 10:48:28.420506+03	2026-05-03 10:50:04.003+03	hot-bar	ready	2026-05-03 10:50:04.003+03	1
260	185	98	Water	1	25.00	25.00	\N	2026-05-03 10:48:28.420506+03	2026-05-03 10:50:04.914+03	food/pastry	ready	2026-05-03 10:50:04.913+03	4
262	187	88	Mocha	1	175.00	175.00	\N	2026-05-03 10:50:32.153283+03	2026-05-03 10:51:13.463+03	hot-bar	ready	2026-05-03 10:51:13.463+03	1
261	186	15	Espresso	1	95.00	95.00	\N	2026-05-03 10:49:52.419733+03	2026-05-03 10:52:45.707+03	cold-bar	ready	2026-05-03 10:52:45.707+03	2
263	188	43	Almond Flat White Frappe	1	405.00	405.00	\N	2026-05-03 11:05:44.206376+03	2026-05-03 11:05:44.206376+03	cold-bar	pending	\N	2
267	189	106	V Cola Dite	1	55.00	55.00	\N	2026-05-03 11:19:41.883593+03	2026-05-03 11:23:54.407+03	food/pastry	ready	2026-05-03 11:23:54.407+03	4
317	194	94	Latte	1	150.00	150.00	\N	2026-05-03 13:34:04.140472+03	2026-05-03 13:37:12.677+03	hot-bar	ready	2026-05-03 13:37:12.677+03	1
318	194	79	Single Turkish Coffee	1	85.00	85.00	\N	2026-05-03 13:34:04.140472+03	2026-05-03 13:37:50.508+03	turkish-bar	ready	2026-05-03 13:37:50.508+03	3
324	198	60	Iced Chocolate  	1	160.00	160.00	\N	2026-05-03 14:43:35.987566+03	2026-05-03 14:45:09.285+03	cold-bar	ready	2026-05-03 14:45:09.285+03	2
328	202	26	Caramel Macchiato Frappe	1	215.00	215.00	\N	2026-05-03 15:34:47.567941+03	2026-05-03 15:37:01.789+03	cold-bar	ready	2026-05-03 15:37:01.788+03	2
329	202	32	Iced Hazelnut Flat White	1	165.00	165.00	\N	2026-05-03 15:34:47.567941+03	2026-05-03 15:37:02.464+03	cold-bar	ready	2026-05-03 15:37:02.464+03	2
331	202	33	Iced Almond Flat White	1	185.00	185.00	\N	2026-05-03 15:34:47.567941+03	2026-05-03 15:37:03.419+03	cold-bar	ready	2026-05-03 15:37:03.419+03	2
330	202	23	Iced Salted Caramel Cortado	1	160.00	160.00	\N	2026-05-03 15:34:47.567941+03	2026-05-03 15:37:04.077+03	cold-bar	ready	2026-05-03 15:37:04.077+03	2
335	206	121	Almond Cashew Cranberry	1	55.00	55.00	\N	2026-05-03 18:04:47.426221+03	2026-05-03 18:06:15.238+03	food-pastry	ready	2026-05-03 18:06:15.237+03	\N
340	209	69	Iced Americano	1	125.00	125.00	\N	2026-05-04 11:26:13.456561+03	2026-05-04 11:26:30.944+03	cold-bar	ready	2026-05-04 11:26:30.944+03	2
345	212	98	Water	1	25.00	25.00	\N	2026-05-04 11:43:36.426373+03	2026-05-04 11:49:48.467+03	food-pastry	ready	2026-05-04 11:49:48.467+03	\N
347	214	60	Iced Chocolate  Frappe	1	195.00	195.00	\N	2026-05-04 16:32:57.067715+03	2026-05-04 16:32:57.067715+03	cold-bar	pending	\N	2
348	215	100	Pink Lady	1	105.00	105.00	\N	2026-05-05 17:34:44.37287+03	2026-05-07 23:32:44.584+03	cold-bar	ready	2026-05-07 23:32:44.584+03	2
349	216	100	Pink Lady	1	105.00	105.00	\N	2026-05-05 17:38:16.682724+03	2026-05-07 23:32:46.167+03	cold-bar-test	ready	2026-05-07 23:32:46.167+03	2
350	217	21	Iced Cappuccino	1	135.00	135.00	\N	2026-05-05 17:43:10.323259+03	2026-05-07 23:32:47.97+03	cold-bar-test	ready	2026-05-07 23:32:47.97+03	2
351	217	11	 Macchiato	1	120.00	120.00	\N	2026-05-05 17:43:10.323259+03	2026-05-07 23:32:49.464+03	hot-bar	ready	2026-05-07 23:32:49.464+03	1
352	218	19	Caramel Macchiato	1	180.00	180.00	\N	2026-05-05 18:00:21.220397+03	2026-05-07 23:32:50.988+03	hot-bar	ready	2026-05-07 23:32:50.988+03	1
353	218	100	Pink Lady	1	105.00	105.00	\N	2026-05-05 18:00:21.220397+03	2026-05-07 23:32:52.523+03	cold-bar-test	ready	2026-05-07 23:32:52.522+03	2
359	220	68	Pina Colada	1	215.00	215.00	\N	2026-05-08 22:23:15.461905+03	2026-05-08 22:24:34.907+03	cold-bar-test	ready	2026-05-08 22:24:34.907+03	2
357	219	80	Green Tea	1	70.00	70.00	\N	2026-05-07 23:36:01.866622+03	2026-05-08 22:24:41.221+03	hot-bar	ready	2026-05-08 22:24:41.221+03	1
356	219	129	Tiramisu Cake	1	200.00	200.00	\N	2026-05-07 23:36:01.866622+03	2026-05-08 22:24:46.41+03	food-pastry	ready	2026-05-08 22:24:46.41+03	\N
354	219	14	Cappuccino 	1	130.00	130.00	\N	2026-05-07 23:36:01.866622+03	2026-05-08 22:24:51.211+03	cold-bar-test	ready	2026-05-08 22:24:51.211+03	2
355	219	26	Caramel Macchiato Frappe	1	215.00	215.00	\N	2026-05-07 23:36:01.866622+03	2026-05-08 22:24:53.408+03	cold-bar-test	ready	2026-05-08 22:24:53.407+03	2
358	220	11	 Macchiato	1	185.00	185.00	\N	2026-05-08 22:23:15.461905+03	2026-05-08 22:24:58.727+03	hot-bar	ready	2026-05-08 22:24:58.726+03	1
360	221	11	 Macchiato	1	120.00	120.00	\N	2026-05-10 20:57:39.842065+03	2026-05-10 20:57:39.842065+03	hot-bar	pending	\N	1
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, barista_id, status, customer_name, subtotal, discount, total, payment_method, amount_tendered, change_due, notes, created_at, updated_at, discount_id, discount_code, discount_value, discount_type, cashier_id, paid_at, ready_at, completed_at, cancelled_at, branch_id) FROM stdin;
191	123010	1	completed	\N	225.00	0.00	225.00	card	\N	\N	\N	2026-05-03 13:12:11.993448+03	2026-05-03 13:26:31.79+03	\N	\N	\N	\N	5	2026-05-03 13:12:51.833+03	2026-05-03 13:14:10.939+03	2026-05-03 13:26:31.79+03	\N	1
194	123013	1	completed	Ms	235.00	0.00	235.00	card	\N	\N	\N	2026-05-03 13:34:04.140472+03	2026-05-03 13:48:12.63+03	\N	\N	\N	\N	5	2026-05-03 13:34:08.821+03	2026-05-03 13:37:50.513+03	2026-05-03 13:48:12.629+03	\N	1
197	123016	1	cancelled	\N	230.00	0.00	230.00	cash	\N	\N	\N	2026-05-03 14:41:41.609455+03	2026-05-03 14:42:13.059+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 14:42:13.058+03	1
200	123019	1	completed	Mahitab moamen	180.00	78.95	101.05	cash	\N	\N	\N	2026-05-03 15:23:43.731605+03	2026-05-03 15:27:56.222+03	2	PREM50	50.00	percentage	5	2026-05-03 15:23:47.979+03	2026-05-03 15:27:43.519+03	2026-05-03 15:27:56.222+03	\N	1
203	123022	1	completed	Lujain	180.00	0.00	180.00	cash	\N	\N	\N	2026-05-03 15:40:32.982435+03	2026-05-03 15:48:48.853+03	\N	\N	\N	\N	5	2026-05-03 15:40:38.278+03	2026-05-03 15:45:31.418+03	2026-05-03 15:48:48.852+03	\N	1
206	123025	1	completed	\N	55.00	0.00	55.00	card	\N	\N	\N	2026-05-03 18:04:47.426221+03	2026-05-03 18:06:22.798+03	\N	\N	\N	\N	5	2026-05-03 18:05:14.849+03	2026-05-03 18:06:15.243+03	2026-05-03 18:06:22.798+03	\N	1
124	119003	1	cancelled	Wael ziada	130.00	0.00	130.00	card	\N	\N	\N	2026-04-29 18:33:45.626999+03	2026-04-29 21:10:43.749+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-29 21:10:43.749+03	1
213	124005	1	cancelled	Ju	585.00	0.00	585.00	cash	\N	\N	\N	2026-05-04 16:21:08.81146+03	2026-05-04 17:07:39.447+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-04 17:07:39.446+03	1
192	123011	1	refunded	\N	3235.00	0.00	3235.00	card	\N	\N	\N	2026-05-03 13:28:21.727167+03	2026-05-03 13:43:05.72+03	\N	\N	\N	\N	5	2026-05-03 13:30:12.259+03	2026-05-03 13:32:12.756+03	2026-05-03 13:32:34.268+03	2026-05-03 13:43:05.72+03	1
195	123014	1	completed	\N	345.00	0.00	345.00	cash	\N	\N	\N	2026-05-03 13:58:11.590116+03	2026-05-03 14:07:27.773+03	\N	\N	\N	\N	5	2026-05-03 13:58:17.473+03	2026-05-03 14:02:43.016+03	2026-05-03 14:07:27.772+03	\N	1
198	123017	1	completed	\N	160.00	0.00	160.00	card	\N	\N	\N	2026-05-03 14:43:35.987566+03	2026-05-03 15:00:28.48+03	\N	\N	\N	\N	5	2026-05-03 14:44:03.231+03	2026-05-03 14:45:09.309+03	2026-05-03 15:00:28.48+03	\N	1
138	120007	1	completed	Abdelrahman kamal	195.00	0.00	195.00	card	\N	\N	\N	2026-04-30 18:55:06.02347+03	2026-04-30 19:06:53.124+03	\N	\N	\N	\N	5	2026-04-30 18:55:09.839+03	2026-04-30 19:06:50.082+03	2026-04-30 19:06:53.123+03	\N	1
122	119001	1	completed	\N	120.00	0.00	120.00	card	\N	\N	\N	2026-04-29 16:47:37.245065+03	2026-04-29 16:52:46.219+03	\N	\N	\N	\N	5	2026-04-29 16:51:48.466+03	2026-04-29 16:52:39.468+03	2026-04-29 16:52:46.218+03	\N	1
177	122001	1	completed	Jing	410.00	0.00	410.00	cash	\N	\N	\N	2026-05-02 14:13:09.175699+03	2026-05-02 16:04:14.947+03	\N	\N	\N	\N	5	2026-05-02 14:13:17.858+03	2026-05-02 14:18:59.803+03	2026-05-02 16:04:14.947+03	\N	1
123	119002	1	refunded	\N	180.00	78.95	101.05	card	\N	\N	\N	2026-04-29 17:01:42.910699+03	2026-04-29 17:04:03.744+03	2	PREM50	50.00	percentage	5	2026-04-29 17:02:13.13+03	2026-04-29 17:03:22.828+03	2026-04-29 17:03:34.031+03	2026-04-29 17:04:03.744+03	1
125	119004	1	cancelled	Abdalla shaban	180.00	0.00	180.00	card	\N	\N	\N	2026-04-29 18:41:07.962351+03	2026-04-29 21:10:46.1+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-29 21:10:46.1+03	1
126	119005	1	cancelled	Abdalla shaban	180.00	0.00	180.00	cash	\N	\N	\N	2026-04-29 18:41:20.51627+03	2026-04-29 21:10:49.381+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-29 21:10:49.38+03	1
127	119006	1	cancelled	Abdalla shaban	180.00	0.00	180.00	card	\N	\N	\N	2026-04-29 18:41:28.463195+03	2026-04-29 21:10:51.124+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-29 21:10:51.124+03	1
128	119007	1	cancelled	Abdalla	180.00	78.95	101.05	card	\N	\N	\N	2026-04-29 18:42:24.062646+03	2026-04-29 21:11:14.149+03	2	PREM50	50.00	percentage	\N	\N	\N	\N	2026-04-29 21:11:14.149+03	1
129	119008	1	cancelled	Abdalla	55.00	24.12	30.88	cash	\N	\N	\N	2026-04-29 20:19:27.279614+03	2026-04-29 21:11:24.212+03	2	PREM50	50.00	percentage	\N	\N	\N	\N	2026-04-29 21:11:24.212+03	1
130	119009	1	cancelled	Abdalrhman	343.50	0.00	343.50	cash	\N	\N	\N	2026-04-29 20:49:20.779864+03	2026-04-29 21:11:51.013+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-29 21:11:51.012+03	1
151	120020	1	cancelled	\N	160.00	0.00	160.00	cash	\N	\N	\N	2026-04-30 21:17:09.188673+03	2026-04-30 21:27:01.767+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-30 21:27:01.767+03	1
139	120008	1	completed	Fahmy	145.00	0.00	145.00	card	\N	\N	\N	2026-04-30 20:12:20.849379+03	2026-04-30 20:43:38.841+03	\N	\N	\N	\N	5	2026-04-30 20:12:27.833+03	2026-04-30 20:34:10.292+03	2026-04-30 20:43:38.841+03	\N	1
140	120009	1	completed	Basma 	175.00	0.00	175.00	cash	\N	\N	\N	2026-04-30 20:30:56.798296+03	2026-04-30 20:43:42.248+03	\N	\N	\N	\N	5	2026-04-30 20:31:00.467+03	2026-04-30 20:43:30.265+03	2026-04-30 20:43:42.248+03	\N	1
131	119010	1	completed	\N	321.00	0.00	321.00	cash	\N	\N	\N	2026-04-29 21:47:13.970185+03	2026-04-30 12:33:05.294+03	\N	\N	\N	\N	5	2026-04-29 21:47:20.948+03	2026-04-29 21:58:55.788+03	2026-04-30 12:33:05.293+03	\N	1
133	120002	1	completed	\N	175.00	76.75	98.25	card	\N	\N	\N	2026-04-30 12:16:06.055197+03	2026-04-30 15:18:43.305+03	2	PREM50	50.00	percentage	5	2026-04-30 12:16:15.321+03	2026-04-30 15:18:39.908+03	2026-04-30 15:18:43.305+03	\N	1
132	120001	1	completed	\N	265.00	0.00	265.00	card	\N	\N	\N	2026-04-30 12:15:11.496927+03	2026-04-30 15:18:43.865+03	\N	\N	\N	\N	5	2026-04-30 12:15:34.968+03	2026-04-30 15:18:37.814+03	2026-04-30 15:18:43.865+03	\N	1
160	120029	1	completed	T	25.00	0.00	25.00	card	\N	\N	\N	2026-04-30 23:39:54.220309+03	2026-04-30 23:46:40.626+03	\N	\N	\N	\N	5	2026-04-30 23:39:57.612+03	2026-04-30 23:41:27.949+03	2026-04-30 23:46:40.626+03	\N	1
159	120028	1	completed	\N	525.00	230.26	294.74	card	\N	\N	\N	2026-04-30 23:32:57.21301+03	2026-04-30 23:55:45.541+03	2	PREM50	50.00	percentage	5	2026-04-30 23:33:21.781+03	2026-04-30 23:34:59.12+03	2026-04-30 23:55:45.541+03	\N	1
134	120003	1	completed	\N	125.00	0.00	125.00	card	\N	\N	\N	2026-04-30 15:32:16.403556+03	2026-04-30 15:39:21.247+03	\N	\N	\N	\N	5	2026-04-30 15:32:20.414+03	2026-04-30 15:36:58.823+03	2026-04-30 15:39:21.247+03	\N	1
161	120030	1	completed	Sana 	430.00	0.00	430.00	card	\N	\N	\N	2026-04-30 23:40:27.059615+03	2026-05-01 00:02:54.527+03	\N	\N	\N	\N	5	2026-04-30 23:41:17.687+03	2026-05-01 00:02:47.866+03	2026-05-01 00:02:54.527+03	\N	1
135	120004	1	completed	\N	175.00	76.75	98.25	cash	100.00	1.75	\N	2026-04-30 15:35:49.502919+03	2026-04-30 15:39:24.868+03	2	PREM50	50.00	percentage	5	2026-04-30 15:36:04.456+03	2026-04-30 15:39:23.605+03	2026-04-30 15:39:24.868+03	\N	1
141	120010	1	completed	Omar shebl	280.00	0.00	280.00	card	\N	\N	\N	2026-04-30 20:44:32.603347+03	2026-04-30 21:09:16.04+03	\N	\N	\N	\N	5	2026-04-30 21:07:56.521+03	2026-04-30 21:08:05.838+03	2026-04-30 21:09:16.04+03	\N	1
136	120005	1	completed	 	105.00	0.00	105.00	card	\N	\N	\N	2026-04-30 15:50:08.221522+03	2026-04-30 16:07:25.621+03	\N	\N	\N	\N	5	2026-04-30 15:50:23.715+03	2026-04-30 16:03:50.643+03	2026-04-30 16:07:25.621+03	\N	1
142	120011	1	completed	\N	190.00	0.00	190.00	card	\N	\N	\N	2026-04-30 20:48:24.231106+03	2026-04-30 21:09:17.906+03	\N	\N	\N	\N	5	2026-04-30 21:08:35.96+03	2026-04-30 21:08:51.481+03	2026-04-30 21:09:17.906+03	\N	1
184	123003	1	cancelled	Mansy	175.00	0.00	175.00	card	\N	\N	\N	2026-05-03 10:46:45.736978+03	2026-05-03 10:47:33.236+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 10:47:33.235+03	1
137	120006	1	completed	\N	435.00	0.00	435.00	card	\N	\N	\N	2026-04-30 16:25:07.076808+03	2026-04-30 16:42:00.734+03	\N	\N	\N	\N	5	2026-04-30 16:25:19.174+03	2026-04-30 16:27:40.223+03	2026-04-30 16:42:00.733+03	\N	1
162	120031	1	completed	Sssss	160.00	0.00	160.00	card	\N	\N	\N	2026-05-01 00:12:45.120959+03	2026-05-01 00:28:21.099+03	\N	\N	\N	\N	5	2026-05-01 00:12:52.984+03	2026-05-01 00:21:33.105+03	2026-05-01 00:28:21.098+03	\N	1
143	120012	1	completed	\N	200.00	0.00	200.00	card	\N	\N	\N	2026-04-30 21:10:39.496483+03	2026-04-30 21:12:27.942+03	\N	\N	\N	\N	5	2026-04-30 21:11:04.856+03	2026-04-30 21:11:45.506+03	2026-04-30 21:12:27.942+03	\N	1
178	122002	1	completed	\N	120.00	0.00	120.00	card	\N	\N	\N	2026-05-02 15:17:46.845875+03	2026-05-02 16:04:16.106+03	\N	\N	\N	\N	5	2026-05-02 15:17:53.78+03	2026-05-02 15:23:09.32+03	2026-05-02 16:04:16.106+03	\N	1
179	122003	1	completed	\N	425.00	0.00	425.00	card	\N	\N	\N	2026-05-02 15:50:22.679165+03	2026-05-02 16:04:17.004+03	\N	\N	\N	\N	5	2026-05-02 15:50:50.898+03	2026-05-02 15:56:04.514+03	2026-05-02 16:04:17.004+03	\N	1
180	122004	1	completed	\N	440.00	0.00	440.00	card	\N	\N	\N	2026-05-02 17:26:06.846086+03	2026-05-02 17:28:30.031+03	\N	\N	\N	\N	5	2026-05-02 17:26:11.22+03	2026-05-02 17:28:23.661+03	2026-05-02 17:28:30.031+03	\N	1
181	122005	1	completed	T	185.00	0.00	185.00	card	\N	\N	\N	2026-05-02 18:53:58.567619+03	2026-05-02 18:56:15.049+03	\N	\N	\N	\N	5	2026-05-02 18:54:11.913+03	2026-05-02 18:55:55.798+03	2026-05-02 18:56:15.049+03	\N	1
183	123002	1	cancelled	Mansy	175.00	76.75	98.25	cash	\N	\N	\N	2026-05-03 10:45:17.830488+03	2026-05-03 10:45:57.242+03	2	PREM50	50.00	percentage	\N	\N	\N	\N	2026-05-03 10:45:57.242+03	1
187	123006	1	completed	Pr	175.00	76.75	98.25	card	\N	\N	\N	2026-05-03 10:50:32.153283+03	2026-05-03 10:52:36.5+03	2	PREM50	50.00	percentage	5	2026-05-03 10:50:39.485+03	2026-05-03 10:51:13.468+03	2026-05-03 10:52:36.5+03	\N	1
185	123004	1	completed	\N	180.00	0.00	180.00	card	\N	\N	\N	2026-05-03 10:48:28.420506+03	2026-05-03 10:52:37.131+03	\N	\N	\N	\N	5	2026-05-03 10:48:33.876+03	2026-05-03 10:50:04.918+03	2026-05-03 10:52:37.131+03	\N	1
190	123009	1	refunded	A	615.00	0.00	615.00	cash	\N	\N	\N	2026-05-03 11:48:28.035074+03	2026-05-03 17:45:53.5+03	\N	\N	\N	\N	5	2026-05-03 11:48:55.676+03	2026-05-03 13:01:31.24+03	2026-05-03 13:14:56.999+03	2026-05-03 17:45:53.5+03	1
188	123007	1	cancelled	\N	405.00	0.00	405.00	card	\N	\N	\N	2026-05-03 11:05:44.206376+03	2026-05-03 11:06:01.446+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 11:06:01.445+03	1
186	123005	1	completed	\N	95.00	41.67	53.33	card	\N	\N	\N	2026-05-03 10:49:52.419733+03	2026-05-03 11:08:29.399+03	2	PREM50	50.00	percentage	5	2026-05-03 10:50:06.272+03	2026-05-03 10:52:45.711+03	2026-05-03 11:08:29.399+03	\N	1
201	123020	1	refunded	\N	155.00	0.00	155.00	card	\N	\N	\N	2026-05-03 15:27:35.011268+03	2026-05-03 18:43:21.769+03	\N	\N	\N	\N	5	2026-05-03 15:27:53.184+03	2026-05-03 15:30:47.706+03	2026-05-03 15:30:50.955+03	2026-05-03 18:43:21.768+03	1
204	123023	1	completed	Aya	180.00	0.00	180.00	card	\N	\N	\N	2026-05-03 15:44:46.957388+03	2026-05-03 15:48:49.688+03	\N	\N	\N	\N	5	2026-05-03 15:44:57.628+03	2026-05-03 15:47:06.572+03	2026-05-03 15:48:49.687+03	\N	1
189	123008	1	refunded	Ab	1990.00	0.00	1990.00	cash	\N	\N	\N	2026-05-03 11:19:41.883593+03	2026-05-03 17:42:47.869+03	\N	\N	\N	\N	5	2026-05-03 11:20:00.001+03	2026-05-03 11:24:17.259+03	2026-05-03 11:30:46.133+03	2026-05-03 17:42:47.868+03	1
182	123001	1	refunded	Testing flow	3865.00	0.00	3865.00	cash	\N	\N	\N	2026-05-03 10:07:13.559905+03	2026-05-03 17:43:39.312+03	\N	\N	\N	\N	5	2026-05-03 10:09:14.433+03	2026-05-03 10:11:44.912+03	2026-05-03 10:52:37.838+03	2026-05-03 17:43:39.312+03	1
212	124004	1	completed	Hhh	255.00	0.00	255.00	card	\N	\N	\N	2026-05-04 11:43:36.426373+03	2026-05-07 23:35:00.053+03	\N	\N	\N	\N	5	2026-05-04 11:43:55.025+03	2026-05-04 11:49:48.471+03	2026-05-07 23:35:00.053+03	\N	1
207	123026	1	completed	Basma	175.00	0.00	175.00	card	\N	\N	\N	2026-05-03 19:13:52.13228+03	2026-05-03 19:24:55.732+03	\N	\N	\N	\N	5	2026-05-03 19:13:55.469+03	2026-05-03 19:24:50.148+03	2026-05-03 19:24:55.732+03	\N	1
163	121001	1	completed	Basma	175.00	0.00	175.00	card	\N	\N	\N	2026-05-01 13:12:27.045908+03	2026-05-01 13:30:59.057+03	\N	\N	\N	\N	5	2026-05-01 13:12:40.089+03	2026-05-01 13:18:30.816+03	2026-05-01 13:30:59.056+03	\N	1
164	121002	1	completed	Samman	200.00	0.00	200.00	card	\N	\N	\N	2026-05-01 15:01:07.494278+03	2026-05-01 15:04:27.996+03	\N	\N	\N	\N	5	2026-05-01 15:01:29.544+03	2026-05-01 15:04:20.837+03	2026-05-01 15:04:27.996+03	\N	1
165	121003	1	completed	\N	215.00	0.00	215.00	cash	\N	\N	\N	2026-05-01 15:35:00.361657+03	2026-05-01 16:48:10.243+03	\N	\N	\N	\N	5	2026-05-01 15:35:03.445+03	2026-05-01 15:35:18.736+03	2026-05-01 16:48:10.243+03	\N	1
166	121004	1	completed	\N	345.00	0.00	345.00	card	\N	\N	\N	2026-05-01 20:14:53.761241+03	2026-05-01 20:52:06.571+03	\N	\N	\N	\N	5	2026-05-01 20:15:02.02+03	2026-05-01 20:50:41.601+03	2026-05-01 20:52:06.571+03	\N	1
144	120013	1	completed	Farah	175.00	0.00	175.00	card	\N	\N	\N	2026-04-30 21:13:18.858148+03	2026-04-30 21:18:45.712+03	\N	\N	\N	\N	5	2026-04-30 21:14:02.017+03	2026-04-30 21:16:11.473+03	2026-04-30 21:18:45.711+03	\N	1
148	120017	1	cancelled	\N	180.00	0.00	180.00	cash	\N	\N	\N	2026-04-30 21:14:29.464389+03	2026-04-30 21:19:04.328+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-30 21:19:04.328+03	1
167	121005	1	completed	shadalaramostafa	455.00	0.00	455.00	card	\N	\N	\N	2026-05-01 21:39:48.609623+03	2026-05-01 21:49:14.925+03	\N	\N	\N	\N	5	2026-05-01 21:39:57.328+03	2026-05-01 21:47:18.108+03	2026-05-01 21:49:14.925+03	\N	1
145	120014	1	completed	\N	160.00	0.00	160.00	card	\N	\N	\N	2026-04-30 21:13:22.543708+03	2026-04-30 21:30:42.43+03	\N	\N	\N	\N	5	2026-04-30 21:15:25.715+03	2026-04-30 21:17:37.235+03	2026-04-30 21:30:42.43+03	\N	1
146	120015	1	completed	\N	180.00	0.00	180.00	card	\N	\N	\N	2026-04-30 21:13:31.565036+03	2026-04-30 21:30:45.344+03	\N	\N	\N	\N	5	2026-04-30 21:17:12.391+03	2026-04-30 21:26:12.992+03	2026-04-30 21:30:45.344+03	\N	1
147	120016	1	completed	\N	170.00	0.00	170.00	cash	\N	\N	\N	2026-04-30 21:14:20.063723+03	2026-04-30 21:30:49.577+03	\N	\N	\N	\N	5	2026-04-30 21:18:01.275+03	2026-04-30 21:28:12.705+03	2026-04-30 21:30:49.577+03	\N	1
150	120019	1	completed	\N	160.00	0.00	160.00	cash	\N	\N	\N	2026-04-30 21:16:11.596609+03	2026-04-30 21:31:51.945+03	\N	\N	\N	\N	5	2026-04-30 21:23:58.63+03	2026-04-30 21:28:20.029+03	2026-04-30 21:31:51.945+03	\N	1
153	120022	1	completed	Sara	180.00	0.00	180.00	card	\N	\N	\N	2026-04-30 21:30:00.625077+03	2026-04-30 21:39:46.987+03	\N	\N	\N	\N	5	2026-04-30 21:30:11.003+03	2026-04-30 21:39:42.914+03	2026-04-30 21:39:46.987+03	\N	1
149	120018	1	completed	\N	210.00	0.00	210.00	cash	\N	\N	\N	2026-04-30 21:15:28.649177+03	2026-04-30 21:40:47.2+03	\N	\N	\N	\N	5	2026-04-30 21:21:49.134+03	2026-04-30 21:28:18.674+03	2026-04-30 21:40:47.2+03	\N	1
152	120021	1	completed	\N	210.00	0.00	210.00	cash	\N	\N	\N	2026-04-30 21:17:39.538973+03	2026-04-30 21:40:48.276+03	\N	\N	\N	\N	5	2026-04-30 21:27:28.164+03	2026-04-30 21:28:23.75+03	2026-04-30 21:40:48.276+03	\N	1
168	121006	1	completed	\N	230.00	0.00	230.00	card	\N	\N	\N	2026-05-01 21:58:01.305626+03	2026-05-01 22:07:14.333+03	\N	\N	\N	\N	5	2026-05-01 21:58:28.62+03	2026-05-01 22:03:27.112+03	2026-05-01 22:07:14.333+03	\N	1
169	121007	1	completed	\N	170.00	0.00	170.00	cash	\N	\N	\N	2026-05-01 22:02:34.447903+03	2026-05-01 22:07:14.849+03	\N	\N	\N	\N	5	2026-05-01 22:02:45.593+03	2026-05-01 22:07:10.978+03	2026-05-01 22:07:14.849+03	\N	1
154	120023	1	completed	\N	455.00	199.56	255.44	card	\N	\N	\N	2026-04-30 21:41:46.560789+03	2026-04-30 21:50:38.311+03	2	PREM50	50.00	percentage	5	2026-04-30 21:42:56.862+03	2026-04-30 21:50:12.47+03	2026-04-30 21:50:38.311+03	\N	1
155	120024	1	completed	Erf	95.00	0.00	95.00	card	\N	\N	\N	2026-04-30 22:42:17.987438+03	2026-04-30 22:46:34.035+03	\N	\N	\N	\N	5	2026-04-30 22:42:52.131+03	2026-04-30 22:43:28.364+03	2026-04-30 22:46:34.035+03	\N	1
171	121009	1	cancelled	\N	245.00	0.00	245.00	cash	\N	\N	\N	2026-05-01 22:20:06.86246+03	2026-05-01 22:20:57.222+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-01 22:20:57.222+03	1
156	120025	1	completed	Abdelghny	240.00	0.00	240.00	card	\N	\N	\N	2026-04-30 23:04:26.447093+03	2026-04-30 23:05:18.838+03	\N	\N	\N	\N	5	2026-04-30 23:04:30.225+03	2026-04-30 23:05:14.164+03	2026-04-30 23:05:18.838+03	\N	1
170	121008	1	completed	\N	135.00	0.00	135.00	cash	\N	\N	\N	2026-05-01 22:18:18.374567+03	2026-05-01 22:28:07.241+03	\N	\N	\N	\N	5	2026-05-01 22:19:00.387+03	2026-05-01 22:27:58.608+03	2026-05-01 22:28:07.24+03	\N	1
157	120026	1	completed	\N	75.00	0.00	75.00	card	\N	\N	\N	2026-04-30 23:18:48.717738+03	2026-04-30 23:22:49.789+03	\N	\N	\N	\N	5	2026-04-30 23:19:09.967+03	2026-04-30 23:19:49.256+03	2026-04-30 23:22:49.788+03	\N	1
158	120027	1	completed	Rgh	265.00	0.00	265.00	card	\N	\N	\N	2026-04-30 23:22:08.241772+03	2026-04-30 23:22:50.395+03	\N	\N	\N	\N	5	2026-04-30 23:22:12.843+03	2026-04-30 23:22:43.325+03	2026-04-30 23:22:50.395+03	\N	1
172	121010	1	completed	\N	180.00	0.00	180.00	cash	\N	\N	\N	2026-05-01 22:21:03.011402+03	2026-05-01 22:28:11.923+03	\N	\N	\N	\N	5	2026-05-01 22:21:23.555+03	2026-05-01 22:28:00.517+03	2026-05-01 22:28:11.923+03	\N	1
173	121011	1	completed	\N	105.00	0.00	105.00	card	\N	\N	\N	2026-05-01 22:22:08.31307+03	2026-05-01 22:28:12.721+03	\N	\N	\N	\N	5	2026-05-01 22:22:35.855+03	2026-05-01 22:28:02.034+03	2026-05-01 22:28:12.721+03	\N	1
174	121012	1	cancelled	\N	230.00	0.00	230.00	card	\N	\N	\N	2026-05-01 23:08:49.610135+03	2026-05-01 23:09:05.44+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-01 23:09:05.439+03	1
175	121013	1	completed	Seif	300.00	0.00	300.00	card	\N	\N	\N	2026-05-01 23:10:03.265068+03	2026-05-01 23:22:51.337+03	\N	\N	\N	\N	5	2026-05-01 23:10:06.305+03	2026-05-01 23:22:26.793+03	2026-05-01 23:22:51.337+03	\N	1
176	121014	1	completed	Omar El Degwi	25.00	0.00	25.00	card	\N	\N	\N	2026-05-01 23:21:07.659069+03	2026-05-01 23:29:16.072+03	\N	\N	\N	\N	5	2026-05-01 23:25:05.307+03	2026-05-01 23:29:14.017+03	2026-05-01 23:29:16.071+03	\N	1
211	124003	1	cancelled	Abdalhameed 	95.00	41.67	53.33	card	\N	\N	\N	2026-05-04 11:40:32.787741+03	2026-05-04 11:42:19.437+03	2	PREM50	50.00	percentage	\N	\N	\N	\N	2026-05-04 11:42:19.436+03	1
214	124006	1	cancelled	G	195.00	0.00	195.00	cash	\N	\N	\N	2026-05-04 16:32:57.067715+03	2026-05-04 17:07:53.844+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-04 17:07:53.844+03	1
193	123012	1	refunded	Test	485.00	0.00	485.00	card	\N	\N	\N	2026-05-03 13:29:11.511771+03	2026-05-03 13:44:09.664+03	\N	\N	\N	\N	5	2026-05-03 13:32:00.023+03	2026-05-03 13:32:17.371+03	2026-05-03 13:32:33.123+03	2026-05-03 13:44:09.664+03	1
196	123015	1	completed	\N	220.00	0.00	220.00	card	\N	\N	\N	2026-05-03 14:24:20.962485+03	2026-05-03 14:33:50.555+03	\N	\N	\N	\N	5	2026-05-03 14:24:42.462+03	2026-05-03 14:31:28.801+03	2026-05-03 14:33:50.554+03	\N	1
199	123018	1	cancelled	\N	180.00	0.00	180.00	card	\N	\N	\N	2026-05-03 15:20:55.193493+03	2026-05-03 15:22:10.177+03	\N	\N	\N	\N	\N	\N	\N	\N	2026-05-03 15:22:10.176+03	1
202	123021	1	refunded	Jjj	725.00	0.00	725.00	cash	\N	\N	\N	2026-05-03 15:34:47.567941+03	2026-05-03 17:45:04.087+03	\N	\N	\N	\N	5	2026-05-03 15:35:02.149+03	2026-05-03 15:37:04.08+03	2026-05-03 15:43:38.875+03	2026-05-03 17:45:04.087+03	1
205	123024	1	completed	\N	150.00	65.79	84.21	card	\N	\N	\N	2026-05-03 17:35:09.39786+03	2026-05-03 18:06:22.568+03	2	PREM50	50.00	percentage	5	2026-05-03 17:35:15.553+03	2026-05-03 18:06:15.844+03	2026-05-03 18:06:22.568+03	\N	1
208	123027	1	completed	Mohamed fathy	705.00	309.21	395.79	card	\N	\N	\N	2026-05-03 20:01:42.048794+03	2026-05-03 20:10:51.965+03	2	PREM50	50.00	percentage	5	2026-05-03 20:01:47.678+03	2026-05-03 20:10:49.665+03	2026-05-03 20:10:51.965+03	\N	1
209	124001	1	completed	\N	125.00	0.00	125.00	card	\N	\N	\N	2026-05-04 11:26:13.456561+03	2026-05-07 23:34:54.029+03	\N	\N	\N	\N	5	2026-05-04 11:26:28.137+03	2026-05-04 11:26:30.947+03	2026-05-07 23:34:54.029+03	\N	1
210	124002	1	completed	Abdalhameed 	270.00	118.42	151.58	card	\N	\N	\N	2026-05-04 11:32:24.909654+03	2026-05-07 23:34:58.573+03	2	PREM50	50.00	percentage	5	2026-05-04 11:33:09.52+03	2026-05-04 11:49:32.205+03	2026-05-07 23:34:58.572+03	\N	1
215	125001	8	completed	\N	105.00	0.00	105.00	card	\N	\N	\N	2026-05-05 17:34:44.37287+03	2026-05-07 23:35:01.765+03	\N	\N	\N	\N	5	2026-05-05 17:35:12.983+03	2026-05-07 23:32:44.589+03	2026-05-07 23:35:01.764+03	\N	1
216	125002	8	completed	\N	105.00	0.00	105.00	card	\N	\N	\N	2026-05-05 17:38:16.682724+03	2026-05-07 23:35:03.201+03	\N	\N	\N	\N	5	2026-05-05 17:38:35.336+03	2026-05-07 23:32:46.18+03	2026-05-07 23:35:03.201+03	\N	1
217	125003	8	completed	\N	255.00	0.00	255.00	card	\N	\N	\N	2026-05-05 17:43:10.323259+03	2026-05-07 23:35:05.155+03	\N	\N	\N	\N	5	2026-05-05 17:43:16.64+03	2026-05-07 23:32:49.47+03	2026-05-07 23:35:05.154+03	\N	1
218	125004	8	completed	\N	285.00	0.00	285.00	card	\N	\N	\N	2026-05-05 18:00:21.220397+03	2026-05-07 23:35:06.616+03	\N	\N	\N	\N	5	2026-05-05 18:00:26.977+03	2026-05-07 23:32:52.526+03	2026-05-07 23:35:06.616+03	\N	1
219	127001	8	completed	\N	615.00	0.00	615.00	card	\N	\N	\N	2026-05-07 23:36:01.866622+03	2026-05-08 22:25:05.381+03	\N	\N	\N	\N	5	2026-05-07 23:36:52.178+03	2026-05-08 22:24:53.412+03	2026-05-08 22:25:05.38+03	\N	1
220	128001	8	completed	\N	400.00	175.44	224.56	card	500.00	275.44	\N	2026-05-08 22:23:15.461905+03	2026-05-08 22:25:07.516+03	2	PREM50	50.00	percentage	5	2026-05-08 22:23:48.999+03	2026-05-08 22:24:58.731+03	2026-05-08 22:25:07.516+03	\N	1
221	130001	1	pending	Sameh Tohamy	120.00	52.63	67.37	cash	\N	\N	\N	2026-05-10 20:57:39.842065+03	2026-05-10 20:57:39.842065+03	2	PREM50	50.00	percentage	\N	\N	\N	\N	\N	1
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, key, description, created_at) FROM stdin;
1	admin:view_logs	View system activity logs	2026-04-29 19:30:43.825946+03
2	admin:manage_permissions	Manage roles and permissions	2026-04-29 19:30:43.832814+03
7	orders:view	View order history	2026-04-29 19:30:43.840676+03
9	catalog:edit	Manage menu, categories, and pricing	2026-04-29 19:30:43.842863+03
11	inventory:edit	Adjust stock and restock items	2026-04-29 19:30:43.845075+03
43	orders:pickup	Access the pickup/collection interface	2026-05-04 12:26:59.472808+03
32	pos:view	Open the Point of Sale terminal	2026-05-04 12:26:59.447954+03
215	pos:create_order	Place new orders in the system	2026-05-04 16:50:50.175599+03
33	kitchen:view	View and manage the kitchen production queue	2026-05-04 12:26:59.450368+03
216	kitchen:mark_ready	Mark order items as ready for pickup	2026-05-04 16:50:50.18081+03
217	cashier:view	Access the cashier dashboard and order list	2026-05-04 16:50:50.182479+03
218	cashier:approve_order	Finalize and approve orders for payment	2026-05-04 16:50:50.18388+03
219	cashier:cancel_order	Void or cancel pending orders	2026-05-04 16:50:50.185861+03
220	cashier:refund_order	Process refunds for completed orders	2026-05-04 16:50:50.187468+03
221	cashier:close_session	End a cashier shift and close the session	2026-05-04 16:50:50.188806+03
222	cashier:view_reports	View shift summaries and performance	2026-05-04 16:50:50.190344+03
223	pos:apply_discount	Apply manual or coupon discounts to orders	2026-05-04 16:50:50.192653+03
8	catalog:view	Browse drinks and categories	2026-04-29 19:30:43.841744+03
35	catalog:manage	Create and edit drinks and categories	2026-05-04 12:26:59.455851+03
10	inventory:view	Check stock levels and ingredients	2026-04-29 19:30:43.843989+03
37	inventory:manage	Update stock levels and restock	2026-05-04 12:26:59.461612+03
12	reports:view	Access sales and performance reports	2026-04-29 19:30:43.846021+03
39	discounts:view	View active discount codes	2026-05-04 12:26:59.466435+03
40	discounts:manage	Create and edit discount codes	2026-05-04 12:26:59.468662+03
41	branches:manage	Add and edit branch locations	2026-05-04 12:26:59.47008+03
42	settings:manage	Change system-wide configurations	2026-05-04 12:26:59.471204+03
25	admin:view	Access the administrative dashboard	2026-05-04 12:26:59.421965+03
3	users:view	List and view user details	2026-04-29 19:30:43.83518+03
4	users:create	Add new staff members	2026-04-29 19:30:43.836977+03
5	users:update	Edit staff details and permissions	2026-04-29 19:30:43.838487+03
6	users:delete	Remove staff members	2026-04-29 19:30:43.83962+03
30	roles:view	List and view role details	2026-05-04 12:26:59.44412+03
31	roles:manage	Create, update and delete roles	2026-05-04 12:26:59.445962+03
\.


--
-- Data for Name: predefined_slot_type_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predefined_slot_type_options (id, predefined_slot_id, ingredient_type_id, is_default, sort_order, processed_qty, produced_qty, unit, extra_cost, pricing_mode) FROM stdin;
1962	8	63	f	16	\N	\N	\N	\N	\N
1963	8	34	f	1	\N	\N	\N	\N	\N
1482	10	22	f	3	\N	\N	\N	\N	\N
1725	7	28	f	3	\N	\N	\N	\N	\N
1726	7	59	f	8	\N	\N	\N	\N	\N
1727	7	60	f	9	\N	\N	\N	\N	\N
1728	7	35	f	9	\N	\N	\N	\N	\N
1729	7	19	f	9	\N	\N	\N	\N	\N
1730	7	44	f	9	\N	\N	\N	\N	\N
1731	7	65	f	10	\N	\N	\N	\N	\N
1732	7	27	f	19	\N	\N	\N	\N	\N
1733	7	56	f	22	\N	\N	\N	\N	\N
222	3	11	f	5	\N	\N	\N	\N	\N
223	3	12	f	6	\N	\N	\N	\N	\N
168	6	40	t	0	\N	\N	\N	\N	\N
169	6	83	f	1	\N	\N	\N	\N	\N
170	6	84	f	2	\N	\N	\N	\N	\N
171	6	21	f	3	\N	\N	\N	\N	\N
194	5	17	t	0	\N	\N	\N	\N	\N
195	5	20	f	1	\N	\N	\N	\N	\N
196	5	62	f	7	\N	\N	\N	\N	\N
1973	11	75	t	0	\N	\N	\N	\N	\N
1974	11	76	f	1	\N	\N	\N	\N	\N
1975	11	74	f	4	\N	\N	\N	\N	\N
1984	4	15	t	0	\N	\N	\N	\N	\N
1985	4	16	f	1	\N	\N	\N	\N	\N
1986	4	79	f	3	\N	\N	\N	\N	\N
1987	4	80	f	4	\N	\N	\N	\N	\N
1988	4	81	f	5	\N	\N	\N	\N	\N
1989	4	82	f	6	\N	\N	\N	\N	\N
1990	4	14	f	8	\N	\N	\N	\N	\N
1034	9	91	f	20	\N	\N	\N	\N	\N
\.


--
-- Data for Name: predefined_slot_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predefined_slot_volumes (id, predefined_slot_id, type_volume_id, processed_qty, produced_qty, unit, extra_cost, is_default, is_enabled, sort_order) FROM stdin;
485	8	111	45.0000	45.0000	\N	75.0000	f	t	0
486	8	76	\N	\N	\N	0.0000	f	t	0
487	8	77	\N	\N	\N	0.0000	f	t	1
488	8	110	30.0000	30.0000	\N	55.0000	f	t	1
489	8	78	\N	\N	\N	0.0000	f	t	2
490	8	109	15.0000	15.0000	\N	30.0000	f	t	2
491	8	92	15.0000	15.0000	\N	0.0000	f	t	3
492	8	113	30.0000	30.0000	\N	0.0000	f	t	3
493	8	121	3.0000	70.0000	\N	0.0000	f	t	4
494	8	122	30.0000	30.0000	\N	0.0000	f	t	9
1135	3	34	18.0000	18.0000	\N	0.0000	f	t	3
1136	3	43	\N	\N	\N	0.0000	f	t	4
1137	3	36	36.0000	54.0000	\N	65.0000	f	t	7
1138	3	35	18.0000	36.0000	\N	0.0000	f	t	6
1139	3	38	18.0000	36.0000	\N	0.0000	f	t	8
1140	3	37	18.0000	18.0000	\N	0.0000	f	t	9
1141	3	39	36.0000	54.0000	\N	65.0000	f	t	9
1166	6	65	1.0000	1.0000	\N	0.0000	f	t	0
1167	6	66	2.0000	2.0000	\N	0.0000	f	t	1
1168	6	67	3.0000	3.0000	\N	0.0000	f	t	2
1169	6	80	10.0000	10.0000	\N	25.0000	f	t	3
1170	6	81	20.0000	20.0000	\N	50.0000	f	t	4
1171	6	82	30.0000	30.0000	\N	75.0000	f	t	5
1172	6	83	10.0000	10.0000	\N	0.0000	f	t	6
1173	6	84	20.0000	20.0000	\N	0.0000	f	t	7
1174	6	85	30.0000	30.0000	\N	0.0000	f	t	8
1175	6	86	1.0000	1.0000	\N	0.0000	f	t	9
1176	6	87	2.0000	2.0000	\N	0.0000	f	t	10
1177	6	88	3.0000	3.0000	\N	0.0000	f	t	11
1018	5	58	10.0000	10.0000	\N	35.0000	f	t	0
1019	5	62	10.0000	10.0000	\N	35.0000	f	t	1
1020	5	55	10.0000	10.0000	\N	35.0000	f	t	2
1021	5	59	20.0000	20.0000	\N	70.0000	f	t	3
1022	5	61	30.0000	30.0000	\N	105.0000	f	t	4
1023	5	56	20.0000	20.0000	\N	70.0000	f	t	5
1024	5	63	20.0000	20.0000	\N	70.0000	f	t	6
1025	5	70	\N	\N	\N	0.0000	f	t	9
1026	5	64	30.0000	30.0000	\N	105.0000	f	t	8
1027	5	71	\N	\N	\N	0.0000	f	t	10
1028	5	57	30.0000	30.0000	\N	105.0000	f	t	10
1029	5	72	\N	\N	\N	0.0000	f	t	11
350	9	92	15.0000	15.0000	\N	0.0000	f	t	3
351	9	110	30.0000	30.0000	\N	55.0000	f	t	4
352	9	111	45.0000	45.0000	\N	75.0000	f	t	5
353	9	109	15.0000	15.0000	\N	30.0000	f	t	6
354	9	113	30.0000	30.0000	\N	0.0000	f	t	7
355	9	76	110.0000	110.0000	\N	0.0000	f	t	7
356	9	77	130.0000	130.0000	\N	0.0000	f	t	7
357	9	78	150.0000	150.0000	\N	0.0000	f	t	7
1200	7	49	15.0000	15.0000	\N	30.0000	f	t	0
1201	7	50	30.0000	30.0000	\N	55.0000	f	t	1
1202	7	51	45.0000	45.0000	\N	75.0000	f	t	4
1203	7	73	\N	\N	\N	0.0000	f	t	5
1204	7	74	\N	\N	\N	0.0000	f	t	6
1205	7	75	45.0000	45.0000	\N	75.0000	f	t	11
1206	7	99	15.0000	15.0000	\N	30.0000	f	t	12
1207	7	100	30.0000	30.0000	\N	55.0000	f	t	13
1208	7	89	15.0000	15.0000	\N	35.0000	f	t	14
1209	7	101	45.0000	45.0000	\N	75.0000	f	t	14
1210	7	90	30.0000	30.0000	\N	55.0000	f	t	14
1211	7	91	45.0000	45.0000	\N	75.0000	f	t	14
1212	7	116	45.0000	45.0000	\N	0.0000	f	t	15
1213	7	114	15.0000	15.0000	\N	0.0000	f	t	16
1214	7	115	30.0000	30.0000	\N	0.0000	f	t	17
1215	7	52	15.0000	15.0000	\N	30.0000	f	t	17
1216	7	53	30.0000	30.0000	\N	55.0000	f	t	17
1217	7	54	45.0000	45.0000	\N	75.0000	f	t	17
1218	7	96	15.0000	15.0000	\N	0.0000	f	t	18
1219	7	98	45.0000	45.0000	\N	130.0000	f	t	19
1220	7	97	30.0000	30.0000	\N	65.0000	f	t	20
1221	7	102	15.0000	15.0000	\N	30.0000	f	f	21
\.


--
-- Data for Name: predefined_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predefined_slots (id, name, slot_label, is_required, is_dynamic, affects_cup_size, created_at, updated_at) FROM stdin;
3	Coffee Espresso	Coffee	t	f	t	2026-04-21 10:21:12.615326+02	2026-04-21 10:21:12.615326+02
4	Milk	Milk	t	t	\N	2026-04-21 10:27:49.497174+02	2026-04-21 10:27:49.497174+02
5	All Syrup (V-TO-HZ)	Syrup	t	f	\N	2026-04-21 10:30:50.80663+02	2026-04-21 10:34:25.216+02
8	Powder	Powder	t	f	t	2026-04-21 11:23:52.450872+02	2026-04-21 11:23:52.450872+02
7	Sauce	Sauce	t	f	t	2026-04-21 11:22:57.547403+02	2026-04-21 11:43:26.335+02
6	Sweetner	Sweetner	t	f	f	2026-04-21 10:30:59.166362+02	2026-04-21 14:17:53.899+02
10	Whipped Cream	Whipped Cream	t	f	f	2026-04-21 14:55:47.446826+02	2026-04-21 14:55:47.446826+02
11	Foam	Foam	t	f	f	2026-04-24 22:44:34.71932+03	2026-04-24 22:44:34.71932+03
9	Ice Cubes	Ice Cubes	t	f	t	2026-04-21 14:55:21.570642+02	2026-04-24 22:46:11.218+03
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, permission_key, created_at, role_key) FROM stdin;
1	admin:view	2026-05-04 12:26:59.482825+03	admin
2	users:view	2026-05-04 12:26:59.490209+03	admin
3	users:create	2026-05-04 12:26:59.491779+03	admin
4	users:update	2026-05-04 12:26:59.493241+03	admin
5	users:delete	2026-05-04 12:26:59.494359+03	admin
6	roles:view	2026-05-04 12:26:59.495852+03	admin
7	roles:manage	2026-05-04 12:26:59.497414+03	admin
8	pos:view	2026-05-04 12:26:59.498544+03	admin
9	kitchen:view	2026-05-04 12:26:59.50049+03	admin
10	catalog:view	2026-05-04 12:26:59.50452+03	admin
11	catalog:manage	2026-05-04 12:26:59.506623+03	admin
12	inventory:view	2026-05-04 12:26:59.508437+03	admin
13	inventory:manage	2026-05-04 12:26:59.510246+03	admin
14	reports:view	2026-05-04 12:26:59.513371+03	admin
15	discounts:view	2026-05-04 12:26:59.51623+03	admin
16	discounts:manage	2026-05-04 12:26:59.51815+03	admin
17	branches:manage	2026-05-04 12:26:59.520938+03	admin
18	settings:manage	2026-05-04 12:26:59.522362+03	admin
19	orders:pickup	2026-05-04 12:26:59.525079+03	admin
20	pos:view	2026-05-04 12:26:59.528729+03	barista
21	kitchen:view	2026-05-04 12:26:59.531325+03	barista
22	inventory:view	2026-05-04 12:26:59.533328+03	barista
23	orders:view	2026-05-04 12:31:38.85728+03	finance
24	admin:view	2026-05-04 12:31:38.85728+03	finance
25	catalog:view	2026-05-04 12:31:38.85728+03	finance
26	inventory:view	2026-05-04 12:31:38.85728+03	finance
27	reports:view	2026-05-04 12:31:38.85728+03	finance
28	discounts:view	2026-05-04 12:31:38.85728+03	finance
29	discounts:manage	2026-05-04 12:31:38.85728+03	finance
30	admin:view	2026-05-04 12:58:24.733681+03	admin
31	users:view	2026-05-04 12:58:24.737828+03	admin
32	users:create	2026-05-04 12:58:24.740889+03	admin
33	users:update	2026-05-04 12:58:24.742437+03	admin
34	users:delete	2026-05-04 12:58:24.744923+03	admin
35	roles:view	2026-05-04 12:58:24.748424+03	admin
36	roles:manage	2026-05-04 12:58:24.749962+03	admin
37	pos:view	2026-05-04 12:58:24.751429+03	admin
38	kitchen:view	2026-05-04 12:58:24.753455+03	admin
39	catalog:view	2026-05-04 12:58:24.755197+03	admin
40	catalog:manage	2026-05-04 12:58:24.757876+03	admin
41	inventory:view	2026-05-04 12:58:24.759313+03	admin
42	inventory:manage	2026-05-04 12:58:24.760954+03	admin
43	reports:view	2026-05-04 12:58:24.762849+03	admin
44	discounts:view	2026-05-04 12:58:24.763979+03	admin
45	discounts:manage	2026-05-04 12:58:24.76508+03	admin
46	branches:manage	2026-05-04 12:58:24.766238+03	admin
47	settings:manage	2026-05-04 12:58:24.767346+03	admin
48	orders:pickup	2026-05-04 12:58:24.76869+03	admin
49	pos:view	2026-05-04 12:58:24.770326+03	finance
50	kitchen:view	2026-05-04 12:58:24.771351+03	finance
51	admin:view	2026-05-04 12:58:24.772213+03	finance
52	reports:view	2026-05-04 12:58:24.773095+03	finance
53	inventory:view	2026-05-04 12:58:24.774155+03	finance
54	branches:manage	2026-05-04 12:58:24.775061+03	finance
55	pos:view	2026-05-04 12:58:24.776337+03	barista
56	kitchen:view	2026-05-04 12:58:24.777266+03	barista
57	inventory:view	2026-05-04 12:58:24.778169+03	barista
58	admin:view	2026-05-04 13:13:24.184089+03	admin
59	users:view	2026-05-04 13:13:24.187469+03	admin
60	users:create	2026-05-04 13:13:24.188638+03	admin
61	users:update	2026-05-04 13:13:24.18968+03	admin
62	users:delete	2026-05-04 13:13:24.19071+03	admin
63	roles:view	2026-05-04 13:13:24.191678+03	admin
64	roles:manage	2026-05-04 13:13:24.192679+03	admin
65	pos:view	2026-05-04 13:13:24.193586+03	admin
66	kitchen:view	2026-05-04 13:13:24.194397+03	admin
67	catalog:view	2026-05-04 13:13:24.195307+03	admin
68	catalog:manage	2026-05-04 13:13:24.19624+03	admin
69	inventory:view	2026-05-04 13:13:24.197053+03	admin
70	inventory:manage	2026-05-04 13:13:24.197889+03	admin
71	reports:view	2026-05-04 13:13:24.198761+03	admin
72	discounts:view	2026-05-04 13:13:24.199978+03	admin
73	discounts:manage	2026-05-04 13:13:24.20116+03	admin
74	branches:manage	2026-05-04 13:13:24.202057+03	admin
75	settings:manage	2026-05-04 13:13:24.202896+03	admin
76	orders:pickup	2026-05-04 13:13:24.203763+03	admin
77	pos:view	2026-05-04 13:13:24.204715+03	finance
78	kitchen:view	2026-05-04 13:13:24.205625+03	finance
79	admin:view	2026-05-04 13:13:24.206564+03	finance
80	reports:view	2026-05-04 13:13:24.207634+03	finance
81	inventory:view	2026-05-04 13:13:24.208547+03	finance
82	branches:manage	2026-05-04 13:13:24.209518+03	finance
83	pos:view	2026-05-04 13:13:24.210705+03	barista
84	kitchen:view	2026-05-04 13:13:24.213279+03	barista
85	inventory:view	2026-05-04 13:13:24.214199+03	barista
86	admin:view	2026-05-04 13:19:01.931425+03	admin
87	users:view	2026-05-04 13:19:01.946346+03	admin
88	users:create	2026-05-04 13:19:01.948835+03	admin
89	users:update	2026-05-04 13:19:01.957667+03	admin
90	users:delete	2026-05-04 13:19:01.963931+03	admin
91	roles:view	2026-05-04 13:19:01.966496+03	admin
92	roles:manage	2026-05-04 13:19:01.971276+03	admin
93	pos:view	2026-05-04 13:19:01.973541+03	admin
94	kitchen:view	2026-05-04 13:19:01.975704+03	admin
95	catalog:view	2026-05-04 13:19:01.978187+03	admin
96	catalog:manage	2026-05-04 13:19:01.980098+03	admin
97	inventory:view	2026-05-04 13:19:01.982544+03	admin
98	inventory:manage	2026-05-04 13:19:01.98517+03	admin
99	reports:view	2026-05-04 13:19:01.988912+03	admin
100	discounts:view	2026-05-04 13:19:01.990539+03	admin
101	discounts:manage	2026-05-04 13:19:01.992397+03	admin
102	branches:manage	2026-05-04 13:19:01.994164+03	admin
103	settings:manage	2026-05-04 13:19:01.995635+03	admin
104	orders:pickup	2026-05-04 13:19:01.997033+03	admin
105	pos:view	2026-05-04 13:19:02.001958+03	finance
106	kitchen:view	2026-05-04 13:19:02.008468+03	finance
107	admin:view	2026-05-04 13:19:02.015806+03	finance
108	reports:view	2026-05-04 13:19:02.018599+03	finance
109	inventory:view	2026-05-04 13:19:02.022475+03	finance
110	branches:manage	2026-05-04 13:19:02.024339+03	finance
111	pos:view	2026-05-04 13:19:02.028352+03	barista
112	kitchen:view	2026-05-04 13:19:02.032385+03	barista
113	inventory:view	2026-05-04 13:19:02.035878+03	barista
114	admin:view	2026-05-04 13:38:24.204552+03	admin
115	users:view	2026-05-04 13:38:24.208851+03	admin
116	users:create	2026-05-04 13:38:24.20992+03	admin
117	users:update	2026-05-04 13:38:24.211224+03	admin
118	users:delete	2026-05-04 13:38:24.212687+03	admin
119	roles:view	2026-05-04 13:38:24.213696+03	admin
120	roles:manage	2026-05-04 13:38:24.21477+03	admin
121	pos:view	2026-05-04 13:38:24.216144+03	admin
122	kitchen:view	2026-05-04 13:38:24.217859+03	admin
123	catalog:view	2026-05-04 13:38:24.2189+03	admin
124	catalog:manage	2026-05-04 13:38:24.219846+03	admin
125	inventory:view	2026-05-04 13:38:24.221294+03	admin
126	inventory:manage	2026-05-04 13:38:24.222637+03	admin
127	reports:view	2026-05-04 13:38:24.223921+03	admin
128	discounts:view	2026-05-04 13:38:24.224955+03	admin
129	discounts:manage	2026-05-04 13:38:24.225967+03	admin
130	branches:manage	2026-05-04 13:38:24.227428+03	admin
131	settings:manage	2026-05-04 13:38:24.228372+03	admin
132	orders:pickup	2026-05-04 13:38:24.229325+03	admin
133	pos:view	2026-05-04 13:38:24.23118+03	finance
134	kitchen:view	2026-05-04 13:38:24.232142+03	finance
135	admin:view	2026-05-04 13:38:24.23334+03	finance
136	reports:view	2026-05-04 13:38:24.234902+03	finance
137	inventory:view	2026-05-04 13:38:24.235865+03	finance
138	branches:manage	2026-05-04 13:38:24.237136+03	finance
139	pos:view	2026-05-04 13:38:24.238946+03	barista
140	kitchen:view	2026-05-04 13:38:24.240608+03	barista
141	inventory:view	2026-05-04 13:38:24.241852+03	barista
142	admin:view	2026-05-04 16:11:04.073139+03	admin
143	users:view	2026-05-04 16:11:04.083523+03	admin
144	users:create	2026-05-04 16:11:04.085407+03	admin
145	users:update	2026-05-04 16:11:04.086878+03	admin
146	users:delete	2026-05-04 16:11:04.088659+03	admin
147	roles:view	2026-05-04 16:11:04.090455+03	admin
148	roles:manage	2026-05-04 16:11:04.091632+03	admin
149	pos:view	2026-05-04 16:11:04.092442+03	admin
150	kitchen:view	2026-05-04 16:11:04.094232+03	admin
151	catalog:view	2026-05-04 16:11:04.095652+03	admin
152	catalog:manage	2026-05-04 16:11:04.096922+03	admin
153	inventory:view	2026-05-04 16:11:04.098092+03	admin
154	inventory:manage	2026-05-04 16:11:04.099016+03	admin
155	reports:view	2026-05-04 16:11:04.09998+03	admin
156	discounts:view	2026-05-04 16:11:04.100974+03	admin
157	discounts:manage	2026-05-04 16:11:04.1019+03	admin
158	branches:manage	2026-05-04 16:11:04.103492+03	admin
159	settings:manage	2026-05-04 16:11:04.104673+03	admin
160	orders:pickup	2026-05-04 16:11:04.105734+03	admin
161	pos:view	2026-05-04 16:11:04.107221+03	finance
162	kitchen:view	2026-05-04 16:11:04.108267+03	finance
163	admin:view	2026-05-04 16:11:04.109207+03	finance
164	reports:view	2026-05-04 16:11:04.110222+03	finance
165	inventory:view	2026-05-04 16:11:04.112057+03	finance
166	branches:manage	2026-05-04 16:11:04.113532+03	finance
167	pos:view	2026-05-04 16:11:04.115247+03	barista
168	kitchen:view	2026-05-04 16:11:04.11646+03	barista
169	inventory:view	2026-05-04 16:11:04.11743+03	barista
170	admin:view	2026-05-04 16:20:49.089414+03	admin
171	users:view	2026-05-04 16:20:49.093914+03	admin
172	users:create	2026-05-04 16:20:49.095916+03	admin
173	users:update	2026-05-04 16:20:49.09758+03	admin
174	users:delete	2026-05-04 16:20:49.099034+03	admin
175	roles:view	2026-05-04 16:20:49.10026+03	admin
176	roles:manage	2026-05-04 16:20:49.10167+03	admin
177	pos:view	2026-05-04 16:20:49.102751+03	admin
178	kitchen:view	2026-05-04 16:20:49.103592+03	admin
179	catalog:view	2026-05-04 16:20:49.105465+03	admin
180	catalog:manage	2026-05-04 16:20:49.107844+03	admin
181	inventory:view	2026-05-04 16:20:49.109413+03	admin
182	inventory:manage	2026-05-04 16:20:49.110514+03	admin
183	reports:view	2026-05-04 16:20:49.111591+03	admin
184	discounts:view	2026-05-04 16:20:49.112534+03	admin
185	discounts:manage	2026-05-04 16:20:49.114176+03	admin
186	branches:manage	2026-05-04 16:20:49.115402+03	admin
187	settings:manage	2026-05-04 16:20:49.116272+03	admin
188	orders:pickup	2026-05-04 16:20:49.118274+03	admin
189	pos:view	2026-05-04 16:20:49.119494+03	finance
190	kitchen:view	2026-05-04 16:20:49.121475+03	finance
191	admin:view	2026-05-04 16:20:49.122451+03	finance
192	reports:view	2026-05-04 16:20:49.123579+03	finance
193	inventory:view	2026-05-04 16:20:49.124357+03	finance
194	branches:manage	2026-05-04 16:20:49.125294+03	finance
195	pos:view	2026-05-04 16:20:49.126627+03	barista
196	kitchen:view	2026-05-04 16:20:49.129415+03	barista
197	inventory:view	2026-05-04 16:20:49.13045+03	barista
198	admin:view	2026-05-04 16:36:00.967243+03	admin
199	users:view	2026-05-04 16:36:00.97192+03	admin
200	users:create	2026-05-04 16:36:00.973774+03	admin
201	users:update	2026-05-04 16:36:00.975262+03	admin
202	users:delete	2026-05-04 16:36:00.977598+03	admin
203	roles:view	2026-05-04 16:36:00.978767+03	admin
204	roles:manage	2026-05-04 16:36:00.981205+03	admin
205	pos:view	2026-05-04 16:36:00.982814+03	admin
206	kitchen:view	2026-05-04 16:36:00.984517+03	admin
207	catalog:view	2026-05-04 16:36:00.985887+03	admin
208	catalog:manage	2026-05-04 16:36:00.987337+03	admin
209	inventory:view	2026-05-04 16:36:00.988874+03	admin
210	inventory:manage	2026-05-04 16:36:00.990163+03	admin
211	reports:view	2026-05-04 16:36:00.9913+03	admin
212	discounts:view	2026-05-04 16:36:00.992975+03	admin
213	discounts:manage	2026-05-04 16:36:00.994916+03	admin
214	branches:manage	2026-05-04 16:36:00.996547+03	admin
215	settings:manage	2026-05-04 16:36:00.998316+03	admin
216	orders:pickup	2026-05-04 16:36:01.001577+03	admin
217	pos:view	2026-05-04 16:36:01.006324+03	finance
218	kitchen:view	2026-05-04 16:36:01.016814+03	finance
219	admin:view	2026-05-04 16:36:01.022393+03	finance
220	reports:view	2026-05-04 16:36:01.024764+03	finance
221	inventory:view	2026-05-04 16:36:01.026856+03	finance
222	branches:manage	2026-05-04 16:36:01.031431+03	finance
223	pos:view	2026-05-04 16:36:01.042047+03	barista
224	kitchen:view	2026-05-04 16:36:01.047526+03	barista
225	inventory:view	2026-05-04 16:36:01.052817+03	barista
226	admin:view	2026-05-04 16:39:52.201583+03	admin
227	users:view	2026-05-04 16:39:52.209565+03	admin
228	users:create	2026-05-04 16:39:52.210488+03	admin
229	users:update	2026-05-04 16:39:52.211422+03	admin
230	users:delete	2026-05-04 16:39:52.212193+03	admin
231	roles:view	2026-05-04 16:39:52.213033+03	admin
232	roles:manage	2026-05-04 16:39:52.213905+03	admin
233	pos:view	2026-05-04 16:39:52.21483+03	admin
234	kitchen:view	2026-05-04 16:39:52.216675+03	admin
235	catalog:view	2026-05-04 16:39:52.217943+03	admin
236	catalog:manage	2026-05-04 16:39:52.218956+03	admin
237	inventory:view	2026-05-04 16:39:52.220331+03	admin
238	inventory:manage	2026-05-04 16:39:52.221484+03	admin
239	reports:view	2026-05-04 16:39:52.222361+03	admin
240	discounts:view	2026-05-04 16:39:52.223499+03	admin
241	discounts:manage	2026-05-04 16:39:52.224364+03	admin
242	branches:manage	2026-05-04 16:39:52.225256+03	admin
243	settings:manage	2026-05-04 16:39:52.226082+03	admin
244	orders:pickup	2026-05-04 16:39:52.22682+03	admin
245	pos:view	2026-05-04 16:39:52.228064+03	finance
246	kitchen:view	2026-05-04 16:39:52.229491+03	finance
247	admin:view	2026-05-04 16:39:52.230634+03	finance
248	reports:view	2026-05-04 16:39:52.23196+03	finance
249	inventory:view	2026-05-04 16:39:52.232848+03	finance
250	branches:manage	2026-05-04 16:39:52.233901+03	finance
251	pos:view	2026-05-04 16:39:52.235771+03	barista
252	kitchen:view	2026-05-04 16:39:52.236594+03	barista
253	inventory:view	2026-05-04 16:39:52.23732+03	barista
254	admin:view	2026-05-04 16:50:49.745961+03	admin
255	users:view	2026-05-04 16:50:49.748024+03	admin
256	users:create	2026-05-04 16:50:49.748957+03	admin
257	users:update	2026-05-04 16:50:49.750249+03	admin
258	users:delete	2026-05-04 16:50:49.751091+03	admin
259	roles:view	2026-05-04 16:50:49.751836+03	admin
260	roles:manage	2026-05-04 16:50:49.752667+03	admin
261	pos:view	2026-05-04 16:50:49.753734+03	admin
262	kitchen:view	2026-05-04 16:50:49.754594+03	admin
263	catalog:view	2026-05-04 16:50:49.755503+03	admin
264	catalog:manage	2026-05-04 16:50:49.756313+03	admin
265	inventory:view	2026-05-04 16:50:49.757028+03	admin
266	inventory:manage	2026-05-04 16:50:49.757824+03	admin
267	reports:view	2026-05-04 16:50:49.758588+03	admin
268	discounts:view	2026-05-04 16:50:49.759432+03	admin
269	discounts:manage	2026-05-04 16:50:49.762723+03	admin
270	branches:manage	2026-05-04 16:50:49.763897+03	admin
271	settings:manage	2026-05-04 16:50:49.764695+03	admin
272	orders:pickup	2026-05-04 16:50:49.765745+03	admin
273	pos:view	2026-05-04 16:50:49.766932+03	finance
274	kitchen:view	2026-05-04 16:50:49.767827+03	finance
275	admin:view	2026-05-04 16:50:49.768723+03	finance
276	reports:view	2026-05-04 16:50:49.770409+03	finance
277	inventory:view	2026-05-04 16:50:49.771224+03	finance
278	branches:manage	2026-05-04 16:50:49.773514+03	finance
279	pos:view	2026-05-04 16:50:49.774608+03	barista
280	kitchen:view	2026-05-04 16:50:49.775496+03	barista
281	inventory:view	2026-05-04 16:50:49.776624+03	barista
282	pos:create_order	2026-05-04 16:50:50.225769+03	admin
283	kitchen:mark_ready	2026-05-04 16:50:50.229256+03	admin
284	cashier:view	2026-05-04 16:50:50.231311+03	admin
285	cashier:approve_order	2026-05-04 16:50:50.233137+03	admin
286	cashier:cancel_order	2026-05-04 16:50:50.234644+03	admin
287	cashier:refund_order	2026-05-04 16:50:50.236165+03	admin
288	cashier:close_session	2026-05-04 16:50:50.237776+03	admin
289	cashier:view_reports	2026-05-04 16:50:50.239041+03	admin
290	pos:apply_discount	2026-05-04 16:50:50.240393+03	admin
291	pos:view	2026-05-04 16:50:50.246875+03	cashier
292	pos:create_order	2026-05-04 16:50:50.248624+03	cashier
293	cashier:view	2026-05-04 16:50:50.25168+03	cashier
294	cashier:approve_order	2026-05-04 16:50:50.25334+03	cashier
295	cashier:cancel_order	2026-05-04 16:50:50.255542+03	cashier
296	cashier:refund_order	2026-05-04 16:50:50.257137+03	cashier
297	cashier:close_session	2026-05-04 16:50:50.258621+03	cashier
298	cashier:view_reports	2026-05-04 16:50:50.260122+03	cashier
299	pos:apply_discount	2026-05-04 16:50:50.261783+03	cashier
300	catalog:view	2026-05-04 16:50:50.263246+03	cashier
301	inventory:view	2026-05-04 16:50:50.264681+03	cashier
302	kitchen:mark_ready	2026-05-04 16:50:50.26724+03	barista
303	catalog:view	2026-05-04 16:50:50.268793+03	barista
304	cashier:view_reports	2026-05-04 16:50:50.272574+03	finance
305	admin:view	2026-05-04 16:55:50.775129+03	admin
306	users:view	2026-05-04 16:55:50.783121+03	admin
307	users:create	2026-05-04 16:55:50.784288+03	admin
308	users:update	2026-05-04 16:55:50.785352+03	admin
309	users:delete	2026-05-04 16:55:50.786359+03	admin
310	roles:view	2026-05-04 16:55:50.78725+03	admin
311	roles:manage	2026-05-04 16:55:50.788142+03	admin
312	pos:view	2026-05-04 16:55:50.788867+03	admin
313	kitchen:view	2026-05-04 16:55:50.789624+03	admin
314	catalog:view	2026-05-04 16:55:50.790435+03	admin
315	catalog:manage	2026-05-04 16:55:50.791257+03	admin
316	inventory:view	2026-05-04 16:55:50.792036+03	admin
317	inventory:manage	2026-05-04 16:55:50.792955+03	admin
318	reports:view	2026-05-04 16:55:50.793822+03	admin
319	discounts:view	2026-05-04 16:55:50.794798+03	admin
320	discounts:manage	2026-05-04 16:55:50.795723+03	admin
321	branches:manage	2026-05-04 16:55:50.796562+03	admin
322	settings:manage	2026-05-04 16:55:50.797481+03	admin
323	orders:pickup	2026-05-04 16:55:50.798266+03	admin
324	pos:view	2026-05-04 16:55:50.799239+03	finance
325	kitchen:view	2026-05-04 16:55:50.800039+03	finance
326	admin:view	2026-05-04 16:55:50.800779+03	finance
327	reports:view	2026-05-04 16:55:50.80152+03	finance
328	inventory:view	2026-05-04 16:55:50.802383+03	finance
329	branches:manage	2026-05-04 16:55:50.803547+03	finance
330	pos:view	2026-05-04 16:55:50.804873+03	barista
331	kitchen:view	2026-05-04 16:55:50.805908+03	barista
332	inventory:view	2026-05-04 16:55:50.806852+03	barista
333	admin:view	2026-05-04 18:16:50.488346+03	admin
334	users:view	2026-05-04 18:16:50.492326+03	admin
335	users:create	2026-05-04 18:16:50.493284+03	admin
336	users:update	2026-05-04 18:16:50.494616+03	admin
337	users:delete	2026-05-04 18:16:50.495512+03	admin
338	roles:view	2026-05-04 18:16:50.496351+03	admin
339	roles:manage	2026-05-04 18:16:50.497201+03	admin
340	pos:view	2026-05-04 18:16:50.497982+03	admin
341	kitchen:view	2026-05-04 18:16:50.499035+03	admin
342	catalog:view	2026-05-04 18:16:50.500472+03	admin
343	catalog:manage	2026-05-04 18:16:50.501304+03	admin
344	inventory:view	2026-05-04 18:16:50.502239+03	admin
345	inventory:manage	2026-05-04 18:16:50.503626+03	admin
346	reports:view	2026-05-04 18:16:50.504484+03	admin
347	discounts:view	2026-05-04 18:16:50.505291+03	admin
348	discounts:manage	2026-05-04 18:16:50.506127+03	admin
349	branches:manage	2026-05-04 18:16:50.50693+03	admin
350	settings:manage	2026-05-04 18:16:50.507695+03	admin
351	orders:pickup	2026-05-04 18:16:50.508428+03	admin
352	pos:view	2026-05-04 18:16:50.509366+03	finance
353	kitchen:view	2026-05-04 18:16:50.510391+03	finance
354	admin:view	2026-05-04 18:16:50.511213+03	finance
355	reports:view	2026-05-04 18:16:50.511946+03	finance
356	inventory:view	2026-05-04 18:16:50.512837+03	finance
357	branches:manage	2026-05-04 18:16:50.513693+03	finance
358	pos:view	2026-05-04 18:16:50.514683+03	barista
359	kitchen:view	2026-05-04 18:16:50.51598+03	barista
360	inventory:view	2026-05-04 18:16:50.516884+03	barista
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, key, name, description, created_at) FROM stdin;
1	admin	Administrator	Full system access	2026-05-01 17:52:15.560757+03
2	barista	Barista	Kitchen and order management	2026-05-01 17:52:15.560757+03
3	frontdesk	Front Desk	POS and customer management	2026-05-01 17:52:15.560757+03
4	cashier	Cashier	Payment processing	2026-05-01 17:52:15.560757+03
5	pickup	Pick-up Staff	Order completion	2026-05-01 17:52:15.560757+03
6	stockcontrol	Stock Control	Inventory auditing	2026-05-01 17:52:15.560757+03
7	finance	Finance Department	A role for finance department to view and audit	2026-05-04 12:31:38.85728+03
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
BEEaSqjzs3FyoAtIuQrSXfwXsa0a_uE6	{"cookie":{"originalMaxAge":86400000,"expires":"2026-05-12T13:03:46.276Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":8,"branchId":1,"role":"admin"}	2026-05-12 18:00:32
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, scope, user_id, key, value, updated_at) FROM stdin;
2	global	\N	autoPrintAgent	false	2026-04-27 23:34:44.356+03
1	global	\N	autoPrintCustomer	false	2026-05-03 11:25:14.436+03
3	global	\N	allowNoStockSell	false	2026-05-11 16:03:52.503+03
\.


--
-- Data for Name: stock_audit_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_audit_items (id, audit_id, ingredient_id, expected_quantity, actual_quantity, final_quantity, notes) FROM stdin;
31	3	224	13842.0000	13981.0000	\N	\N
32	3	225	7990.0000	7551.0000	\N	\N
33	3	226	2849.0000	2841.2000	\N	\N
34	3	227	0.7980	743.0000	\N	\N
35	3	228	1670.0000	1672.0000	\N	\N
36	3	229	1321.0000	1370.0000	\N	\N
37	3	230	1445.0000	1455.0000	\N	\N
38	3	231	1161.0000	1161.0000	\N	\N
39	3	232	0.0000	847.0000	\N	\N
40	3	233	1020.0000	1022.0000	\N	\N
41	3	234	0.4500	475.0000	\N	\N
42	3	235	11838.0000	11542.0000	\N	\N
43	3	236	6816.9000	7562.0000	\N	\N
44	3	237	1242.0000	779.0000	\N	\N
45	3	238	5099.0000	4948.0000	\N	\N
46	3	239	6249.0000	6242.0000	\N	\N
47	3	240	6000.0000	6000.0000	\N	\N
48	3	241	0.0000	0.0000	\N	\N
49	3	242	6592.0000	6559.0000	\N	\N
50	3	243	0.0000	0.0000	\N	\N
51	3	244	6316.0000	6350.0000	\N	\N
52	3	245	2860.0000	2895.0000	\N	\N
53	3	246	1704.0000	1700.0000	\N	\N
54	3	247	0.3800	380.0000	\N	\N
55	3	248	0.5000	500.0000	\N	\N
56	3	249	4979.0000	4715.0000	\N	\N
57	3	250	4622.0000	4403.0000	\N	\N
58	3	251	5130.0000	4932.0000	\N	\N
59	3	252	4980.0000	4760.0000	\N	\N
60	3	253	4770.0000	4674.0000	\N	\N
61	3	254	3690.0000	3681.0000	\N	\N
62	3	255	3960.0000	3996.0000	\N	\N
63	3	256	6000.0000	6007.0000	\N	\N
64	3	257	1930.0000	1922.0000	\N	\N
65	3	258	5665.0000	3681.0000	\N	\N
66	3	259	2898.0000	2876.0000	\N	\N
67	3	260	4370.0000	6077.0000	\N	\N
68	3	261	2580.0000	2579.0000	\N	\N
69	3	262	5100.0000	380.0000	\N	\N
70	3	263	5100.0000	5100.0000	\N	\N
71	3	264	3690.0000	3723.0000	\N	\N
72	3	265	1655.0000	1645.0000	\N	\N
73	3	266	0.3150	300.0000	\N	\N
74	3	267	0.2850	277.0000	\N	\N
75	3	268	4494.0000	4493.0000	\N	\N
76	3	269	1080.0000	1062.0000	\N	\N
77	3	270	4980.0000	4983.0000	\N	\N
78	3	271	0.0000	131.0000	\N	\N
79	3	272	120.0000	120.0000	\N	\N
80	3	273	954.0000	954.0000	\N	\N
81	3	274	147.0000	145.0000	\N	\N
82	3	275	2994.0000	3.0000	\N	\N
83	3	276	69.0000	69.0000	\N	\N
84	3	277	46.0000	46.0000	\N	\N
85	3	278	140.0000	140.0000	\N	\N
86	3	279	0.0000	17.0000	\N	\N
87	3	280	26.0000	26.0000	\N	\N
88	3	281	11.0000	11.0000	\N	\N
89	3	282	19.0000	18.0000	\N	\N
90	3	283	3697.0000	3790.0000	\N	\N
91	3	284	0.0000	245.0000	\N	\N
92	3	285	0.0000	1.0000	\N	\N
93	3	286	0.0700	0.7000	\N	\N
94	3	287	1332.0000	1300.0000	\N	\N
95	3	288	820.0000	812.0000	\N	\N
96	3	289	127.0000	127.0000	\N	\N
97	3	290	50.0000	49.0000	\N	\N
98	3	291	138.0000	138.0000	\N	\N
99	3	292	1950.0000	1950.0000	\N	\N
100	3	293	200.0000	200.0000	\N	\N
101	3	294	150.0000	200.0000	\N	\N
102	3	295	100.0000	100.0000	\N	\N
103	3	296	300.0000	300.0000	\N	\N
104	3	297	371.0000	361.0000	\N	\N
105	3	298	695.0000	685.0000	\N	\N
106	3	299	200.0000	283.0000	\N	\N
107	3	300	623.9900	620.0000	\N	\N
108	3	301	375.0000	326.0000	\N	\N
109	3	302	96.0000	75.0000	\N	\N
110	3	303	460.0000	435.0000	\N	\N
111	3	304	895.0000	890.0000	\N	\N
112	3	305	625.0000	732.0000	\N	\N
113	3	306	950.0000	945.0000	\N	\N
114	3	307	50.0000	57.0000	\N	\N
115	3	308	1515.0000	1507.0000	\N	\N
116	3	309	2.0000	2.0000	\N	\N
117	3	310	3.0000	3.0000	\N	\N
118	3	311	30.0000	30.0000	\N	\N
119	3	312	3.0000	3.0000	\N	\N
120	3	313	1000.0000	1000.0000	\N	\N
121	3	314	485.0000	486.0000	\N	\N
122	3	315	0.0000	0.0000	\N	\N
123	3	316	45.0000	45.0000	\N	\N
124	3	317	130.0000	3.0000	\N	\N
125	3	318	357.0000	349.0000	\N	\N
126	3	319	68.0000	70.0000	\N	\N
127	3	320	45.0000	45.0000	\N	\N
128	3	321	48.0000	48.0000	\N	\N
129	3	322	24.0000	24.0000	\N	\N
130	3	323	23.0000	23.0000	\N	\N
131	3	324	24.0000	24.0000	\N	\N
132	3	325	15.0000	14.0000	\N	\N
133	3	326	9.0000	8.0000	\N	\N
134	3	327	2.0000	0.0000	\N	\N
135	3	328	2.0000	0.0000	\N	\N
136	3	329	35.0000	47.0000	\N	\N
137	3	330	47.0000	47.0000	\N	\N
138	3	331	47.0000	47.0000	\N	\N
139	3	332	47.0000	47.0000	\N	\N
140	3	333	47.0000	47.0000	\N	\N
141	3	334	28.0000	28.0000	\N	\N
142	3	335	34.0000	34.0000	\N	\N
143	3	336	34.0000	34.0000	\N	\N
144	3	337	47.0000	21.0000	\N	\N
145	3	338	21.0000	21.0000	\N	\N
146	3	339	41.0000	41.0000	\N	\N
147	3	340	48.0000	48.0000	\N	\N
148	3	341	47.0000	47.0000	\N	\N
149	3	342	47.0000	47.0000	\N	\N
150	3	343	46.0000	46.0000	\N	\N
151	3	344	46.0000	46.0000	\N	\N
152	3	345	47.0000	48.0000	\N	\N
153	3	346	0.0000	0.0000	\N	\N
154	3	347	0.0000	0.0000	\N	\N
155	3	348	3.0000	3.0000	\N	\N
156	3	349	4.0000	4.0000	\N	\N
157	3	350	0.0000	0.0000	\N	\N
158	3	351	0.0000	0.0000	\N	\N
159	3	352	0.0000	0.0000	\N	\N
160	3	353	0.0000	2.0000	\N	\N
161	3	354	0.0000	0.0000	\N	\N
162	3	355	0.0000	0.0000	\N	\N
163	3	356	0.0000	0.0000	\N	\N
164	3	357	0.0000	0.0000	\N	\N
165	3	361	3.0000	2.0000	\N	\N
166	4	256	6012.0000	23.0000	\N	\N
167	4	260	4138.0000	23.0000	\N	\N
168	4	264	3547.0000	50.0000	\N	\N
169	4	284	86.0000	20.0000	\N	\N
170	4	293	200.0000	100.0000	\N	\N
171	4	295	100.0000	100.0000	\N	\N
172	5	264	3547.0000	35.0000	\N	كنت ناسي دولاب
\.


--
-- Data for Name: stock_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_audits (id, status, created_by, approved_by, notes, created_at, approved_at, branch_id) FROM stdin;
3	approved	1	1		2026-05-01 20:44:39.774546+03	2026-05-01 20:58:42.998+03	\N
4	pending	8	\N		2026-05-05 11:26:13.70316+03	\N	1
5	pending	8	\N		2026-05-05 11:27:23.095883+03	\N	1
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, ingredient_id, order_id, movement_type, quantity, quantity_after, note, created_by, created_at, branch_id) FROM stdin;
682	225	122	sale	-18.0000	0.0000	Order 119001	1	2026-04-29 16:47:37.245065+03	\N
683	235	122	sale	-120.0000	0.0000	Order 119001	1	2026-04-29 16:47:37.245065+03	\N
684	248	123	sale	-20.0000	0.0000	Order 119002	1	2026-04-29 17:01:42.910699+03	\N
685	259	123	sale	-10.0000	0.0000	Order 119002	1	2026-04-29 17:01:42.910699+03	\N
686	224	123	sale	-18.0000	0.0000	Order 119002	1	2026-04-29 17:01:42.910699+03	\N
687	235	123	sale	-120.0000	0.0000	Order 119002	1	2026-04-29 17:01:42.910699+03	\N
688	225	124	sale	-18.0000	0.0000	Order 119003	1	2026-04-29 18:33:45.626999+03	\N
689	244	124	sale	-35.0000	0.0000	Order 119003	1	2026-04-29 18:33:45.626999+03	\N
690	242	125	sale	-30.0000	0.0000	Order 119004	1	2026-04-29 18:41:07.962351+03	\N
691	268	125	sale	-30.0000	0.0000	Order 119004	1	2026-04-29 18:41:07.962351+03	\N
692	225	125	sale	-18.0000	0.0000	Order 119004	1	2026-04-29 18:41:07.962351+03	\N
693	244	125	sale	-35.0000	0.0000	Order 119004	1	2026-04-29 18:41:07.962351+03	\N
694	235	125	sale	-90.0000	0.0000	Order 119004	1	2026-04-29 18:41:07.962351+03	\N
695	242	126	sale	-30.0000	0.0000	Order 119005	1	2026-04-29 18:41:20.51627+03	\N
696	268	126	sale	-30.0000	0.0000	Order 119005	1	2026-04-29 18:41:20.51627+03	\N
697	225	126	sale	-18.0000	0.0000	Order 119005	1	2026-04-29 18:41:20.51627+03	\N
698	244	126	sale	-35.0000	0.0000	Order 119005	1	2026-04-29 18:41:20.51627+03	\N
699	235	126	sale	-90.0000	0.0000	Order 119005	1	2026-04-29 18:41:20.51627+03	\N
700	242	127	sale	-30.0000	0.0000	Order 119006	1	2026-04-29 18:41:28.463195+03	\N
701	268	127	sale	-30.0000	0.0000	Order 119006	1	2026-04-29 18:41:28.463195+03	\N
702	225	127	sale	-18.0000	0.0000	Order 119006	1	2026-04-29 18:41:28.463195+03	\N
703	244	127	sale	-35.0000	0.0000	Order 119006	1	2026-04-29 18:41:28.463195+03	\N
704	235	127	sale	-90.0000	0.0000	Order 119006	1	2026-04-29 18:41:28.463195+03	\N
705	242	128	sale	-30.0000	0.0000	Order 119007	1	2026-04-29 18:42:24.062646+03	\N
706	268	128	sale	-30.0000	0.0000	Order 119007	1	2026-04-29 18:42:24.062646+03	\N
707	225	128	sale	-18.0000	0.0000	Order 119007	1	2026-04-29 18:42:24.062646+03	\N
708	244	128	sale	-35.0000	0.0000	Order 119007	1	2026-04-29 18:42:24.062646+03	\N
709	235	128	sale	-90.0000	0.0000	Order 119007	1	2026-04-29 18:42:24.062646+03	\N
710	242	130	sale	-30.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
711	224	130	sale	-18.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
712	236	130	sale	-140.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
713	272	130	sale	-10.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
714	225	130	sale	-18.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
715	236	130	sale	-150.0000	0.0000	Order 119009	1	2026-04-29 20:49:20.779864+03	\N
716	272	131	sale	-10.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
717	225	131	sale	-18.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
718	235	131	sale	-150.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
719	242	131	sale	-30.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
720	224	131	sale	-18.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
721	236	131	sale	-140.0000	0.0000	Order 119010	1	2026-04-29 21:47:13.970185+03	\N
722	259	132	sale	-20.0000	0.0000	Order 120001	1	2026-04-30 12:15:11.496927+03	\N
723	224	132	sale	-18.0000	0.0000	Order 120001	1	2026-04-30 12:15:11.496927+03	\N
724	244	132	sale	-35.0000	0.0000	Order 120001	1	2026-04-30 12:15:11.496927+03	\N
725	235	132	sale	-95.0000	0.0000	Order 120001	1	2026-04-30 12:15:11.496927+03	\N
726	302	132	sale	-1.0000	0.0000	Order 120001	1	2026-04-30 12:15:11.496927+03	\N
727	261	133	sale	-30.0000	0.0000	Order 120002	1	2026-04-30 12:16:06.055197+03	\N
728	224	133	sale	-18.0000	0.0000	Order 120002	1	2026-04-30 12:16:06.055197+03	\N
729	235	133	sale	-250.0000	0.0000	Order 120002	1	2026-04-30 12:16:06.055197+03	\N
730	224	134	sale	-18.0000	0.0000	Order 120003	1	2026-04-30 15:32:16.403556+03	\N
731	260	135	sale	-10.0000	0.0000	Order 120004	1	2026-04-30 15:35:49.502919+03	\N
732	261	135	sale	-30.0000	0.0000	Order 120004	1	2026-04-30 15:35:49.502919+03	\N
733	224	135	sale	-18.0000	0.0000	Order 120004	1	2026-04-30 15:35:49.502919+03	\N
734	235	135	sale	-250.0000	0.0000	Order 120004	1	2026-04-30 15:35:49.502919+03	\N
735	249	136	sale	-20.0000	0.0000	Order 120005	1	2026-04-30 15:50:08.221522+03	\N
736	284	136	sale	-5.0000	0.0000	Order 120005	1	2026-04-30 15:50:08.221522+03	\N
737	259	137	sale	-10.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
738	224	137	sale	-18.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
739	235	137	sale	-150.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
740	224	137	sale	-18.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
741	235	137	sale	-250.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
742	300	137	sale	-1.0000	0.0000	Order 120006	1	2026-04-30 16:25:07.076808+03	\N
743	229	\N	restock	1381.0000	1381.0000	Opening / startup stock entry	1	2026-04-30 17:07:17.84653+03	\N
744	227	\N	restock	0.7980	0.7980	Opening / startup stock entry	1	2026-04-30 17:07:17.845031+03	\N
745	260	\N	restock	4380.0000	4380.0000	Opening / startup stock entry	1	2026-04-30 17:07:17.856864+03	\N
746	228	\N	restock	1670.0000	1670.0000	Opening / startup stock entry	1	2026-04-30 17:07:17.85805+03	\N
747	295	\N	restock	100.0000	100.0000	Opening / startup stock entry	1	2026-04-30 17:07:17.862057+03	\N
748	337	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:07:17.920479+03	\N
749	247	\N	restock	0.3800	0.3800	Opening / startup stock entry	1	2026-04-30 17:08:27.806841+03	\N
750	262	\N	restock	5100.0000	5100.0000	Opening / startup stock entry	1	2026-04-30 17:08:27.807364+03	\N
751	252	\N	restock	5000.0000	5000.0000	Opening / startup stock entry	1	2026-04-30 17:08:27.807916+03	\N
752	225	\N	restock	8062.0000	8062.0000	Opening / startup stock entry	1	2026-04-30 17:10:31.178157+03	\N
753	263	\N	restock	5100.0000	5100.0000	Opening / startup stock entry	1	2026-04-30 17:10:31.180188+03	\N
754	264	\N	restock	3840.0000	3840.0000	Opening / startup stock entry	1	2026-04-30 17:10:31.186333+03	\N
755	265	\N	restock	1655.0000	1655.0000	Opening / startup stock entry	1	2026-04-30 17:10:31.188703+03	\N
756	226	\N	restock	2819.0000	2819.0000	Opening / startup stock entry	1	2026-04-30 17:11:52.864771+03	\N
757	233	\N	restock	1020.0000	1020.0000	Opening / startup stock entry	1	2026-04-30 17:11:52.874354+03	\N
758	230	\N	restock	1455.0000	1455.0000	Opening / startup stock entry	1	2026-04-30 17:11:52.885638+03	\N
759	231	\N	restock	1161.0000	1161.0000	Opening / startup stock entry	1	2026-04-30 17:11:52.885981+03	\N
760	232	\N	restock	0.3660	0.3660	Opening / startup stock entry	1	2026-04-30 17:11:52.887468+03	\N
761	234	\N	restock	0.4500	0.4500	Opening / startup stock entry	1	2026-04-30 17:14:08.383557+03	\N
762	266	\N	restock	0.3150	0.3150	Opening / startup stock entry	1	2026-04-30 17:14:08.393859+03	\N
763	242	\N	restock	6727.0000	6727.0000	Opening / startup stock entry	1	2026-04-30 17:14:08.399172+03	\N
764	261	\N	restock	2580.0000	2580.0000	Opening / startup stock entry	1	2026-04-30 17:14:08.401009+03	\N
765	263	\N	restock	0.0000	5100.0000	Opening / startup stock entry	1	2026-04-30 17:14:08.402863+03	\N
766	269	\N	restock	1200.0000	1200.0000	Opening / startup stock entry	1	2026-04-30 17:14:08.45014+03	\N
767	271	\N	restock	0.1420	0.1420	Opening / startup stock entry	1	2026-04-30 17:14:08.458517+03	\N
768	224	\N	restock	14184.0000	14184.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.270875+03	\N
769	226	\N	restock	-2819.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.271181+03	\N
770	235	\N	restock	13400.0000	13400.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.334895+03	\N
771	236	\N	restock	7650.0000	7650.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.359183+03	\N
772	237	\N	restock	1672.0000	1672.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.384684+03	\N
773	238	\N	restock	5239.0000	5239.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.392173+03	\N
774	239	\N	restock	6249.0000	6249.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.420671+03	\N
775	240	\N	restock	6000.0000	6000.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.452555+03	\N
776	241	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.481507+03	\N
777	243	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.544136+03	\N
778	244	\N	restock	6351.0000	6351.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.604726+03	\N
779	245	\N	restock	2920.0000	2920.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.675374+03	\N
780	246	\N	restock	1704.0000	1704.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.712851+03	\N
781	248	\N	restock	0.5000	0.5000	Opening / startup stock entry	1	2026-04-30 17:35:50.737145+03	\N
782	249	\N	restock	5059.0000	5059.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.778296+03	\N
783	250	\N	restock	4682.0000	4682.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.840192+03	\N
784	251	\N	restock	5160.0000	5160.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.908511+03	\N
785	253	\N	restock	4780.0000	4780.0000	Opening / startup stock entry	1	2026-04-30 17:35:50.972849+03	\N
786	254	\N	restock	3700.0000	3700.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.038241+03	\N
787	255	\N	restock	3960.0000	3960.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.064498+03	\N
788	256	\N	restock	6000.0000	6000.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.126718+03	\N
789	257	\N	restock	1950.0000	1950.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.189118+03	\N
790	258	\N	restock	5665.0000	5665.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.242934+03	\N
791	259	\N	restock	2918.0000	2918.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.248451+03	\N
792	267	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.363619+03	\N
795	272	\N	restock	120.0000	120.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.42722+03	\N
796	273	\N	restock	954.0000	954.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.48907+03	\N
799	275	\N	restock	120.0000	120.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.556122+03	\N
800	277	\N	restock	46.0000	46.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.568243+03	\N
801	278	\N	restock	140.0000	140.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.574744+03	\N
802	279	\N	restock	20.0000	20.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.618313+03	\N
807	285	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.686927+03	\N
809	287	\N	restock	1332.0000	1332.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.696448+03	\N
810	288	\N	restock	820.0000	820.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.746792+03	\N
811	289	\N	restock	127.0000	127.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.7515+03	\N
812	290	\N	restock	50.0000	50.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.755958+03	\N
815	293	\N	restock	200.0000	200.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.813795+03	\N
816	294	\N	restock	150.0000	150.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.822667+03	\N
820	299	\N	restock	200.0000	200.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.886252+03	\N
821	301	\N	restock	375.0000	375.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.935508+03	\N
822	302	\N	restock	96.0000	96.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.943626+03	\N
826	306	\N	restock	743.0000	743.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.005525+03	\N
827	307	\N	restock	490.0000	490.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.054418+03	\N
828	308	\N	restock	1515.0000	1515.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.066333+03	\N
836	316	\N	restock	45.0000	45.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.270057+03	\N
837	317	\N	restock	130.0000	130.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.298762+03	\N
838	318	\N	restock	357.0000	357.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.329193+03	\N
842	322	\N	restock	24.0000	24.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.387355+03	\N
793	268	\N	restock	4494.0000	4494.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.365204+03	\N
794	270	\N	restock	4980.0000	4980.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.426775+03	\N
797	274	\N	restock	150.0000	150.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.48944+03	\N
798	276	\N	restock	69.0000	69.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.555824+03	\N
803	280	\N	restock	26.0000	26.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.61864+03	\N
804	281	\N	restock	11.0000	11.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.627218+03	\N
805	282	\N	restock	19.0000	19.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.63184+03	\N
806	283	\N	restock	3797.0000	3797.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.684256+03	\N
808	286	\N	restock	0.0700	0.0700	Opening / startup stock entry	1	2026-04-30 17:35:51.695885+03	\N
813	291	\N	restock	138.0000	138.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.759696+03	\N
814	292	\N	restock	1950.0000	1950.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.813381+03	\N
817	296	\N	restock	300.0000	300.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.822978+03	\N
818	297	\N	restock	371.0000	371.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.87265+03	\N
819	298	\N	restock	695.0000	695.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.883014+03	\N
823	303	\N	restock	460.0000	460.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.943896+03	\N
824	304	\N	restock	895.0000	895.0000	Opening / startup stock entry	1	2026-04-30 17:35:51.99403+03	\N
825	305	\N	restock	625.0000	625.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.000945+03	\N
829	309	\N	restock	2.0000	2.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.0667+03	\N
830	310	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.114375+03	\N
831	311	\N	restock	30.0000	30.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.136661+03	\N
832	312	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.174418+03	\N
833	313	\N	restock	1000.0000	1000.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.201398+03	\N
834	314	\N	restock	485.0000	485.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.236705+03	\N
835	315	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.269682+03	\N
839	319	\N	restock	68.0000	68.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.332377+03	\N
840	320	\N	restock	45.0000	45.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.36224+03	\N
841	321	\N	restock	48.0000	48.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.383314+03	\N
843	323	\N	restock	23.0000	23.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.389184+03	\N
844	324	\N	restock	24.0000	24.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.403591+03	\N
845	325	\N	restock	15.0000	15.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.421693+03	\N
846	326	\N	restock	9.0000	9.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.445232+03	\N
847	327	\N	restock	2.0000	2.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.447554+03	\N
848	328	\N	restock	2.0000	2.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.470338+03	\N
849	329	\N	restock	35.0000	35.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.487754+03	\N
850	330	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.507222+03	\N
851	331	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.507475+03	\N
852	332	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.530577+03	\N
853	333	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.54646+03	\N
854	334	\N	restock	28.0000	28.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.566068+03	\N
855	335	\N	restock	34.0000	34.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.56891+03	\N
856	336	\N	restock	34.0000	34.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.59284+03	\N
857	338	\N	restock	21.0000	21.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.608533+03	\N
858	339	\N	restock	41.0000	41.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.627103+03	\N
859	340	\N	restock	48.0000	48.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.629363+03	\N
860	341	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.656599+03	\N
861	342	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:35:52.6743+03	\N
862	275	\N	restock	2880.0000	3000.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.365297+03	\N
863	343	\N	restock	46.0000	46.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.368277+03	\N
864	344	\N	restock	46.0000	46.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.368451+03	\N
865	345	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.428606+03	\N
866	346	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.431419+03	\N
867	347	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.431649+03	\N
868	348	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.492331+03	\N
869	349	\N	restock	4.0000	4.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.493861+03	\N
870	350	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.494185+03	\N
871	351	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.556684+03	\N
872	352	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.560309+03	\N
873	353	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.561261+03	\N
874	354	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.61785+03	\N
875	355	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.622265+03	\N
876	356	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.623173+03	\N
877	357	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:38:54.625047+03	\N
878	267	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:40:59.770011+03	\N
879	243	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:40:59.77074+03	\N
880	284	\N	restock	0.1500	0.1500	Opening / startup stock entry	1	2026-04-30 17:40:59.772725+03	\N
881	226	\N	restock	2849.0000	2849.0000	Opening / startup stock entry	1	2026-04-30 17:40:59.77818+03	\N
882	285	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-04-30 17:40:59.781675+03	\N
883	300	\N	restock	624.9900	624.9900	Opening / startup stock entry	1	2026-04-30 17:40:59.833233+03	\N
884	267	\N	restock	0.2850	0.2850	Opening / startup stock entry	1	2026-04-30 18:35:38.854443+03	\N
885	306	\N	restock	207.0000	950.0000	Opening / startup stock entry	1	2026-04-30 18:36:58.02179+03	\N
886	307	\N	restock	-440.0000	50.0000	Opening / startup stock entry	1	2026-04-30 18:36:58.022198+03	\N
887	225	138	sale	-18.0000	8044.0000	Order 120007	1	2026-04-30 18:55:06.02347+03	\N
888	232	138	sale	-10.0000	0.0000	Order 120007	1	2026-04-30 18:55:06.02347+03	\N
889	275	138	sale	-6.0000	2994.0000	Order 120007	1	2026-04-30 18:55:06.02347+03	\N
890	235	139	sale	-120.0000	13280.0000	Order 120008	1	2026-04-30 20:12:20.849379+03	\N
891	224	139	sale	-18.0000	14166.0000	Order 120008	1	2026-04-30 20:12:20.849379+03	\N
892	242	140	sale	-30.0000	6697.0000	Order 120009	1	2026-04-30 20:30:56.798296+03	\N
893	224	140	sale	-18.0000	14148.0000	Order 120009	1	2026-04-30 20:30:56.798296+03	\N
894	235	140	sale	-140.0000	13140.0000	Order 120009	1	2026-04-30 20:30:56.798296+03	\N
895	242	141	sale	-15.0000	6682.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
896	224	141	sale	-18.0000	14130.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
897	236	141	sale	-155.0000	7495.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
898	279	141	sale	-330.0000	0.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
899	251	141	sale	-30.0000	5130.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
900	285	141	sale	-1.0000	0.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
901	284	141	sale	-5.0000	0.0000	Order 120010	1	2026-04-30 20:44:32.603347+03	\N
902	279	142	sale	-330.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
903	249	142	sale	-30.0000	5029.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
904	285	142	sale	-1.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
905	284	142	sale	-1.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
906	279	142	sale	-330.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
907	249	142	sale	-30.0000	4999.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
908	285	142	sale	-1.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
909	284	142	sale	-1.0000	0.0000	Order 120011	1	2026-04-30 20:48:24.231106+03	\N
910	245	143	sale	-30.0000	2890.0000	Order 120012	1	2026-04-30 21:10:39.496483+03	\N
911	225	143	sale	-18.0000	8026.0000	Order 120012	1	2026-04-30 21:10:39.496483+03	\N
912	235	143	sale	-150.0000	12990.0000	Order 120012	1	2026-04-30 21:10:39.496483+03	\N
913	242	144	sale	-30.0000	6652.0000	Order 120013	1	2026-04-30 21:13:18.858148+03	\N
914	224	144	sale	-18.0000	14112.0000	Order 120013	1	2026-04-30 21:13:18.858148+03	\N
915	235	144	sale	-140.0000	12850.0000	Order 120013	1	2026-04-30 21:13:18.858148+03	\N
916	264	145	sale	-15.0000	3825.0000	Order 120014	1	2026-04-30 21:13:22.543708+03	\N
917	224	145	sale	-18.0000	14094.0000	Order 120014	1	2026-04-30 21:13:22.543708+03	\N
918	235	145	sale	-80.0000	12770.0000	Order 120014	1	2026-04-30 21:13:22.543708+03	\N
919	274	146	sale	-3.0000	147.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
920	264	146	sale	-30.0000	3795.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
921	269	146	sale	-30.0000	1170.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
922	224	146	sale	-18.0000	14076.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
923	244	146	sale	-35.0000	6316.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
924	259	146	sale	-10.0000	2908.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
925	235	146	sale	-100.0000	12670.0000	Order 120015	1	2026-04-30 21:13:31.565036+03	\N
926	264	147	sale	-15.0000	3780.0000	Order 120016	1	2026-04-30 21:14:20.063723+03	\N
927	269	147	sale	-30.0000	1140.0000	Order 120016	1	2026-04-30 21:14:20.063723+03	\N
928	224	147	sale	-18.0000	14058.0000	Order 120016	1	2026-04-30 21:14:20.063723+03	\N
929	236	147	sale	-50.1000	7444.9000	Order 120016	1	2026-04-30 21:14:20.063723+03	\N
930	264	148	sale	-30.0000	3750.0000	Order 120017	1	2026-04-30 21:14:29.464389+03	\N
931	269	148	sale	-30.0000	1110.0000	Order 120017	1	2026-04-30 21:14:29.464389+03	\N
932	224	148	sale	-18.0000	14040.0000	Order 120017	1	2026-04-30 21:14:29.464389+03	\N
933	259	148	sale	-10.0000	2898.0000	Order 120017	1	2026-04-30 21:14:29.464389+03	\N
934	235	148	sale	-80.0000	12590.0000	Order 120017	1	2026-04-30 21:14:29.464389+03	\N
935	249	149	sale	-20.0000	4979.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
936	284	149	sale	-5.0000	0.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
937	279	149	sale	-330.0000	0.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
938	250	149	sale	-30.0000	4652.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
939	285	149	sale	-1.0000	0.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
940	284	149	sale	-5.0000	0.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
941	253	149	sale	-5.0000	4775.0000	Order 120018	1	2026-04-30 21:15:28.649177+03	\N
942	260	150	sale	-10.0000	4370.0000	Order 120019	1	2026-04-30 21:16:11.596609+03	\N
943	264	150	sale	-15.0000	3735.0000	Order 120019	1	2026-04-30 21:16:11.596609+03	\N
944	224	150	sale	-18.0000	14022.0000	Order 120019	1	2026-04-30 21:16:11.596609+03	\N
945	235	150	sale	-80.0000	12510.0000	Order 120019	1	2026-04-30 21:16:11.596609+03	\N
946	264	151	sale	-15.0000	3720.0000	Order 120020	1	2026-04-30 21:17:09.188673+03	\N
947	224	151	sale	-18.0000	14004.0000	Order 120020	1	2026-04-30 21:17:09.188673+03	\N
948	236	151	sale	-80.0000	7364.9000	Order 120020	1	2026-04-30 21:17:09.188673+03	\N
949	283	152	sale	-40.0000	3757.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
950	284	152	sale	-30.0000	0.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
951	252	152	sale	-10.0000	4990.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
952	279	152	sale	-330.0000	0.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
953	250	152	sale	-30.0000	4622.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
954	285	152	sale	-1.0000	0.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
955	284	152	sale	-5.0000	0.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
956	253	152	sale	-5.0000	4770.0000	Order 120021	1	2026-04-30 21:17:39.538973+03	\N
957	225	153	sale	-18.0000	8008.0000	Order 120022	1	2026-04-30 21:30:00.625077+03	\N
958	230	153	sale	-10.0000	1445.0000	Order 120022	1	2026-04-30 21:30:00.625077+03	\N
959	225	154	sale	-18.0000	7990.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
960	235	154	sale	-120.0000	12390.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
961	245	154	sale	-30.0000	2860.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
962	269	154	sale	-30.0000	1080.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
963	224	154	sale	-18.0000	13986.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
964	235	154	sale	-80.0000	12310.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
965	254	154	sale	-10.0000	3690.0000	Order 120023	1	2026-04-30 21:41:46.560789+03	\N
966	242	156	sale	-30.0000	6622.0000	Order 120025	1	2026-04-30 23:04:26.447093+03	\N
967	224	156	sale	-18.0000	13968.0000	Order 120025	1	2026-04-30 23:04:26.447093+03	\N
968	238	156	sale	-140.0000	5099.0000	Order 120025	1	2026-04-30 23:04:26.447093+03	\N
969	271	158	sale	-3.0000	0.0000	Order 120027	1	2026-04-30 23:22:08.241772+03	\N
970	283	158	sale	-20.0000	3737.0000	Order 120027	1	2026-04-30 23:22:08.241772+03	\N
971	237	158	sale	-150.0000	1522.0000	Order 120027	1	2026-04-30 23:22:08.241772+03	\N
972	229	159	sale	-60.0000	1321.0000	Order 120028	1	2026-04-30 23:32:57.21301+03	\N
973	264	161	sale	-15.0000	3705.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
974	224	161	sale	-18.0000	13950.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
975	235	161	sale	-107.0000	12203.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
976	257	161	sale	-20.0000	1930.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
977	224	161	sale	-18.0000	13932.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
978	235	161	sale	-138.0000	12065.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
979	283	161	sale	-40.0000	3697.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
980	284	161	sale	-30.0000	0.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
981	252	161	sale	-10.0000	4980.0000	Order 120030	1	2026-04-30 23:40:27.059615+03	\N
982	264	162	sale	-15.0000	3690.0000	Order 120031	1	2026-05-01 00:12:45.120959+03	\N
983	224	162	sale	-18.0000	13914.0000	Order 120031	1	2026-05-01 00:12:45.120959+03	\N
984	235	162	sale	-87.0000	11978.0000	Order 120031	1	2026-05-01 00:12:45.120959+03	\N
985	242	163	sale	-30.0000	6592.0000	Order 121001	1	2026-05-01 13:12:27.045908+03	\N
986	224	163	sale	-18.0000	13896.0000	Order 121001	1	2026-05-01 13:12:27.045908+03	\N
987	235	163	sale	-140.0000	11838.0000	Order 121001	1	2026-05-01 13:12:27.045908+03	\N
988	361	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-05-01 15:02:48.728677+03	\N
989	224	165	sale	-18.0000	13878.0000	Order 121003	1	2026-05-01 15:35:00.361657+03	\N
990	237	165	sale	-280.0000	1242.0000	Order 121003	1	2026-05-01 15:35:00.361657+03	\N
991	224	166	sale	-18.0000	13860.0000	Order 121004	1	2026-05-01 20:14:53.761241+03	\N
992	236	166	sale	-250.0000	7114.9000	Order 121004	1	2026-05-01 20:14:53.761241+03	\N
993	300	166	sale	-1.0000	623.9900	Order 121004	1	2026-05-01 20:14:53.761241+03	\N
994	224	166	sale	-18.0000	13842.0000	Order 121004	1	2026-05-01 20:14:53.761241+03	\N
995	236	166	sale	-298.0000	6816.9000	Order 121004	1	2026-05-01 20:14:53.761241+03	\N
996	224	\N	adjustment	139.0000	13981.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
997	225	\N	adjustment	-439.0000	7551.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
998	226	\N	adjustment	-7.8000	2841.2000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
999	227	\N	adjustment	742.2020	743.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1000	228	\N	adjustment	2.0000	1672.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1001	229	\N	adjustment	49.0000	1370.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1002	230	\N	adjustment	10.0000	1455.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1003	232	\N	adjustment	847.0000	847.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1004	233	\N	adjustment	2.0000	1022.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1005	234	\N	adjustment	474.5500	475.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1006	235	\N	adjustment	-296.0000	11542.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1007	236	\N	adjustment	745.1000	7562.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1008	237	\N	adjustment	-463.0000	779.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1009	238	\N	adjustment	-151.0000	4948.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1010	239	\N	adjustment	-7.0000	6242.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1011	242	\N	adjustment	-33.0000	6559.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1012	244	\N	adjustment	34.0000	6350.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1013	245	\N	adjustment	35.0000	2895.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1014	246	\N	adjustment	-4.0000	1700.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1015	247	\N	adjustment	379.6200	380.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1016	248	\N	adjustment	499.5000	500.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1017	249	\N	adjustment	-264.0000	4715.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1018	250	\N	adjustment	-219.0000	4403.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1019	251	\N	adjustment	-198.0000	4932.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1020	252	\N	adjustment	-220.0000	4760.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1021	253	\N	adjustment	-96.0000	4674.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1022	254	\N	adjustment	-9.0000	3681.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1023	255	\N	adjustment	36.0000	3996.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1024	256	\N	adjustment	7.0000	6007.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1025	257	\N	adjustment	-8.0000	1922.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1026	258	\N	adjustment	-1984.0000	3681.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1027	259	\N	adjustment	-22.0000	2876.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1028	260	\N	adjustment	1707.0000	6077.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1029	261	\N	adjustment	-1.0000	2579.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1030	262	\N	adjustment	-4720.0000	380.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1031	264	\N	adjustment	33.0000	3723.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1032	265	\N	adjustment	-10.0000	1645.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1033	266	\N	adjustment	299.6850	300.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1034	267	\N	adjustment	276.7150	277.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1035	268	\N	adjustment	-1.0000	4493.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1036	269	\N	adjustment	-18.0000	1062.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1037	270	\N	adjustment	3.0000	4983.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1038	271	\N	adjustment	131.0000	131.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1039	274	\N	adjustment	-2.0000	145.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1040	275	\N	adjustment	-2991.0000	3.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1041	279	\N	adjustment	17.0000	17.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1042	282	\N	adjustment	-1.0000	18.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1043	283	\N	adjustment	93.0000	3790.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1044	284	\N	adjustment	245.0000	245.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1045	285	\N	adjustment	1.0000	1.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1046	286	\N	adjustment	0.6300	0.7000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1047	287	\N	adjustment	-32.0000	1300.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1048	288	\N	adjustment	-8.0000	812.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1049	290	\N	adjustment	-1.0000	49.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1050	294	\N	adjustment	50.0000	200.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1051	297	\N	adjustment	-10.0000	361.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1052	298	\N	adjustment	-10.0000	685.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1053	299	\N	adjustment	83.0000	283.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1054	300	\N	adjustment	-3.9900	620.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1055	301	\N	adjustment	-49.0000	326.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1056	302	\N	adjustment	-21.0000	75.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1057	303	\N	adjustment	-25.0000	435.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1058	304	\N	adjustment	-5.0000	890.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1059	305	\N	adjustment	107.0000	732.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1060	306	\N	adjustment	-5.0000	945.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1061	307	\N	adjustment	7.0000	57.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1062	308	\N	adjustment	-8.0000	1507.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1063	314	\N	adjustment	1.0000	486.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1064	317	\N	adjustment	-127.0000	3.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1065	318	\N	adjustment	-8.0000	349.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1066	319	\N	adjustment	2.0000	70.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1067	325	\N	adjustment	-1.0000	14.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1068	326	\N	adjustment	-1.0000	8.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1069	327	\N	adjustment	-2.0000	0.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1070	328	\N	adjustment	-2.0000	0.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1071	329	\N	adjustment	12.0000	47.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1072	337	\N	adjustment	-26.0000	21.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1073	345	\N	adjustment	1.0000	48.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1074	353	\N	adjustment	2.0000	2.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1075	361	\N	adjustment	-1.0000	2.0000	Approved Audit #3	1	2026-05-01 20:58:42.821497+03	\N
1076	271	167	sale	-3.0000	128.0000	Order 121005	1	2026-05-01 21:39:48.609623+03	\N
1077	252	167	sale	-50.0000	4710.0000	Order 121005	1	2026-05-01 21:39:48.609623+03	\N
1078	237	167	sale	-100.0000	679.0000	Order 121005	1	2026-05-01 21:39:48.609623+03	\N
1079	271	167	sale	-3.0000	125.0000	Order 121005	1	2026-05-01 21:39:48.609623+03	\N
1080	236	167	sale	-250.0000	7312.0000	Order 121005	1	2026-05-01 21:39:48.609623+03	\N
1081	261	168	sale	-30.0000	2549.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1082	245	168	sale	-10.0000	2885.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1083	246	168	sale	-10.0000	1690.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1084	270	168	sale	-30.0000	4953.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1085	244	168	sale	-35.0000	6315.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1086	235	168	sale	-120.0000	11422.0000	Order 121006	1	2026-05-01 21:58:01.305626+03	\N
1087	264	169	sale	-15.0000	3708.0000	Order 121007	1	2026-05-01 22:02:34.447903+03	\N
1088	269	169	sale	-30.0000	1032.0000	Order 121007	1	2026-05-01 22:02:34.447903+03	\N
1089	224	169	sale	-18.0000	13963.0000	Order 121007	1	2026-05-01 22:02:34.447903+03	\N
1090	235	169	sale	-50.1000	11371.9000	Order 121007	1	2026-05-01 22:02:34.447903+03	\N
1091	230	170	sale	-12.0000	1443.0000	Order 121008	1	2026-05-01 22:18:18.374567+03	\N
1092	264	171	sale	-15.0000	3693.0000	Order 121009	1	2026-05-01 22:20:06.86246+03	\N
1093	259	171	sale	-15.0000	2861.0000	Order 121009	1	2026-05-01 22:20:06.86246+03	\N
1094	224	171	sale	-18.0000	13945.0000	Order 121009	1	2026-05-01 22:20:06.86246+03	\N
1095	239	171	sale	-140.0000	6102.0000	Order 121009	1	2026-05-01 22:20:06.86246+03	\N
1096	264	172	sale	-15.0000	3678.0000	Order 121010	1	2026-05-01 22:21:03.011402+03	\N
1097	259	172	sale	-15.0000	2846.0000	Order 121010	1	2026-05-01 22:21:03.011402+03	\N
1098	224	172	sale	-18.0000	13927.0000	Order 121010	1	2026-05-01 22:21:03.011402+03	\N
1099	235	172	sale	-140.0000	11231.9000	Order 121010	1	2026-05-01 22:21:03.011402+03	\N
1100	283	173	sale	-40.0000	3750.0000	Order 121011	1	2026-05-01 22:22:08.31307+03	\N
1101	284	173	sale	-30.0000	215.0000	Order 121011	1	2026-05-01 22:22:08.31307+03	\N
1102	252	173	sale	-20.0000	4690.0000	Order 121011	1	2026-05-01 22:22:08.31307+03	\N
1103	261	174	sale	-30.0000	2519.0000	Order 121012	1	2026-05-01 23:08:49.610135+03	\N
1104	245	174	sale	-10.0000	2875.0000	Order 121012	1	2026-05-01 23:08:49.610135+03	\N
1105	246	174	sale	-10.0000	1680.0000	Order 121012	1	2026-05-01 23:08:49.610135+03	\N
1106	270	174	sale	-30.0000	4923.0000	Order 121012	1	2026-05-01 23:08:49.610135+03	\N
1107	235	174	sale	-120.0000	11111.9000	Order 121012	1	2026-05-01 23:08:49.610135+03	\N
1108	278	175	sale	-1.0000	139.0000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1109	261	175	sale	-30.0000	2489.0000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1110	245	175	sale	-10.0000	2865.0000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1111	246	175	sale	-10.0000	1670.0000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1112	270	175	sale	-30.0000	4893.0000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1113	235	175	sale	-120.0000	10991.9000	Order 121013	1	2026-05-01 23:10:03.265068+03	\N
1114	259	177	sale	-10.0000	2836.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1115	264	177	sale	-15.0000	3663.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1116	224	177	sale	-18.0000	13909.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1117	235	177	sale	-278.0000	10713.9000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1118	245	177	sale	-30.0000	2835.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1119	224	177	sale	-18.0000	13891.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1120	269	177	sale	-30.0000	1002.0000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1121	235	177	sale	-128.0000	10585.9000	Order 122001	1	2026-05-02 14:13:09.175699+03	\N
1122	278	178	sale	-1.0000	138.0000	Order 122002	1	2026-05-02 15:17:46.845875+03	\N
1123	281	178	sale	-240.0000	0.0000	Order 122002	1	2026-05-02 15:17:46.845875+03	\N
1124	255	178	sale	-20.0000	3976.0000	Order 122002	1	2026-05-02 15:17:46.845875+03	\N
1125	261	179	sale	-30.0000	2459.0000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1126	224	179	sale	-18.0000	13873.0000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1127	239	179	sale	-140.0000	5962.0000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1128	261	179	sale	-30.0000	2429.0000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1129	224	179	sale	-18.0000	13855.0000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1130	235	179	sale	-140.0000	10445.9000	Order 122003	1	2026-05-02 15:50:22.679165+03	\N
1131	224	180	sale	-18.0000	13837.0000	Order 122004	1	2026-05-02 17:26:06.846086+03	\N
1132	237	180	sale	-160.0000	519.0000	Order 122004	1	2026-05-02 17:26:06.846086+03	\N
1133	225	181	sale	-18.0000	7533.0000	Order 122005	1	2026-05-02 18:53:58.567619+03	\N
1134	283	182	sale	-30.0000	3720.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1135	248	182	sale	-30.0000	470.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1136	259	182	sale	-30.0000	2806.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1137	224	182	sale	-36.0000	13801.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1138	244	182	sale	-35.0000	6280.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1139	241	182	sale	-207.0000	0.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1140	300	182	sale	-1.0000	619.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1141	283	182	sale	-30.0000	3690.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1142	267	182	sale	-45.0000	232.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1143	225	182	sale	-36.0000	7497.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1144	244	182	sale	-35.0000	6245.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1145	241	182	sale	-107.0000	0.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1146	283	182	sale	-30.0000	3660.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1147	257	182	sale	-30.0000	1892.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1148	261	182	sale	-15.0000	2414.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1149	224	182	sale	-36.0000	13765.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1150	244	182	sale	-35.0000	6210.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1151	241	182	sale	-227.0000	0.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1152	283	182	sale	-30.0000	3630.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1153	264	182	sale	-45.0000	3618.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1154	259	182	sale	-35.0000	2771.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1155	224	182	sale	-36.0000	13729.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1156	244	182	sale	-35.0000	6175.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1157	237	182	sale	-92.0000	427.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1158	283	182	sale	-30.0000	3600.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1159	256	182	sale	-30.0000	5977.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1160	261	182	sale	-45.0000	2369.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1161	269	182	sale	-30.0000	972.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1162	224	182	sale	-36.0000	13693.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1163	244	182	sale	-35.0000	6140.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1164	239	182	sale	-57.0000	5905.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1165	260	182	sale	-50.0000	6027.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1166	284	182	sale	-30.0000	185.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1167	252	182	sale	-30.0000	4660.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1168	278	182	sale	-1.0000	137.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1169	273	182	sale	-2.0000	952.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1170	271	182	sale	-3.0000	122.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1171	237	182	sale	-250.0000	177.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1172	232	182	sale	-10.0000	837.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1173	275	182	sale	-2.0000	1.0000	Order 123001	1	2026-05-03 10:07:13.559905+03	\N
1174	261	183	sale	-30.0000	2339.0000	Order 123002	1	2026-05-03 10:45:17.830488+03	\N
1175	224	183	sale	-18.0000	13675.0000	Order 123002	1	2026-05-03 10:45:17.830488+03	\N
1176	235	183	sale	-250.0000	10195.9000	Order 123002	1	2026-05-03 10:45:17.830488+03	\N
1177	261	184	sale	-30.0000	2309.0000	Order 123003	1	2026-05-03 10:46:45.736978+03	\N
1178	224	184	sale	-18.0000	13657.0000	Order 123003	1	2026-05-03 10:46:45.736978+03	\N
1179	235	184	sale	-250.0000	9945.9000	Order 123003	1	2026-05-03 10:46:45.736978+03	\N
1180	230	185	sale	-10.0000	1433.0000	Order 123004	1	2026-05-03 10:48:28.420506+03	\N
1181	278	185	sale	-1.0000	136.0000	Order 123004	1	2026-05-03 10:48:28.420506+03	\N
1182	225	186	sale	-18.0000	7479.0000	Order 123005	1	2026-05-03 10:49:52.419733+03	\N
1183	261	187	sale	-30.0000	2279.0000	Order 123006	1	2026-05-03 10:50:32.153283+03	\N
1184	224	187	sale	-18.0000	13639.0000	Order 123006	1	2026-05-03 10:50:32.153283+03	\N
1185	235	187	sale	-250.0000	9695.9000	Order 123006	1	2026-05-03 10:50:32.153283+03	\N
1186	267	188	sale	-45.0000	187.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1187	269	188	sale	-30.0000	942.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1188	224	188	sale	-36.0000	13603.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1189	244	188	sale	-35.0000	6105.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1190	266	188	sale	-2.0000	298.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1191	239	188	sale	-47.0000	5858.0000	Order 123007	1	2026-05-03 11:05:44.206376+03	\N
1192	262	191	sale	-20.0000	0.0000	Order 123010	1	2026-05-03 13:12:11.993448+03	1
1193	271	191	sale	-3.0000	0.0000	Order 123010	1	2026-05-03 13:12:11.993448+03	1
1194	235	191	sale	-150.0000	0.0000	Order 123010	1	2026-05-03 13:12:11.993448+03	1
1195	224	192	sale	-18.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1196	297	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1197	274	192	sale	-3.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1198	267	192	sale	-45.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1199	224	192	sale	-36.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1200	244	192	sale	-35.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1201	239	192	sale	-107.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1202	298	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1203	275	192	sale	-15.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1204	231	192	sale	-12.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1205	298	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1206	260	192	sale	-20.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1207	264	192	sale	-15.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1208	259	192	sale	-35.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1209	224	192	sale	-36.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1210	244	192	sale	-35.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1211	241	192	sale	-102.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1212	262	192	sale	-40.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1213	224	192	sale	-18.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1214	235	192	sale	-140.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1215	245	192	sale	-30.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1216	224	192	sale	-18.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1217	269	192	sale	-30.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1218	235	192	sale	-90.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1219	262	192	sale	-10.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1220	271	192	sale	-3.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1221	235	192	sale	-160.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1222	279	192	sale	-330.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1223	250	192	sale	-30.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1224	285	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1225	284	192	sale	-5.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1226	253	192	sale	-5.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1227	278	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1228	260	192	sale	-30.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1229	234	192	sale	-20.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1230	297	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1231	234	192	sale	-20.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1232	297	192	sale	-1.0000	0.0000	Order 123011	1	2026-05-03 13:28:21.727167+03	1
1233	267	193	sale	-30.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1234	224	193	sale	-18.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1235	235	193	sale	-140.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1236	298	193	sale	-1.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1237	225	193	sale	-18.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1238	298	193	sale	-1.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1239	280	193	sale	-250.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1240	251	193	sale	-30.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1241	285	193	sale	-1.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1242	284	193	sale	-5.0000	0.0000	Order 123012	1	2026-05-03 13:29:11.511771+03	1
1243	224	194	sale	-18.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1244	235	194	sale	-280.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1245	300	194	sale	-1.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1246	233	194	sale	-10.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1247	275	194	sale	-2.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1248	297	194	sale	-1.0000	0.0000	Order 123013	1	2026-05-03 13:34:04.140472+03	1
1249	224	195	sale	-36.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1250	235	195	sale	-51.0000	89.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1251	305	195	sale	-1.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1252	260	195	sale	-30.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1253	224	195	sale	-18.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1254	235	195	sale	-280.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1255	300	195	sale	-1.0000	0.0000	Order 123014	1	2026-05-03 13:58:11.590116+03	1
1256	224	196	sale	-18.0000	0.0000	Order 123015	1	2026-05-03 14:24:20.962485+03	1
1257	237	196	sale	-250.0000	0.0000	Order 123015	1	2026-05-03 14:24:20.962485+03	1
1258	300	196	sale	-1.0000	0.0000	Order 123015	1	2026-05-03 14:24:20.962485+03	1
1259	261	197	sale	-30.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1260	245	197	sale	-10.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1261	246	197	sale	-10.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1262	270	197	sale	-30.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1263	244	197	sale	-35.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1264	235	197	sale	-140.0000	0.0000	Order 123016	1	2026-05-03 14:41:41.609455+03	1
1265	261	198	sale	-15.0000	0.0000	Order 123017	1	2026-05-03 14:43:35.987566+03	1
1266	270	198	sale	-30.0000	0.0000	Order 123017	1	2026-05-03 14:43:35.987566+03	1
1267	270	198	sale	-1.0000	0.0000	Order 123017	1	2026-05-03 14:43:35.987566+03	1
1268	235	198	sale	-175.0000	0.0000	Order 123017	1	2026-05-03 14:43:35.987566+03	1
1269	264	199	sale	-15.0000	0.0000	Order 123018	1	2026-05-03 15:20:55.193493+03	1
1270	259	199	sale	-15.0000	0.0000	Order 123018	1	2026-05-03 15:20:55.193493+03	1
1271	224	199	sale	-18.0000	0.0000	Order 123018	1	2026-05-03 15:20:55.193493+03	1
1272	236	199	sale	-140.0000	0.0000	Order 123018	1	2026-05-03 15:20:55.193493+03	1
1273	264	200	sale	-15.0000	0.0000	Order 123019	1	2026-05-03 15:23:43.731605+03	1
1274	259	200	sale	-15.0000	0.0000	Order 123019	1	2026-05-03 15:23:43.731605+03	1
1275	224	200	sale	-18.0000	0.0000	Order 123019	1	2026-05-03 15:23:43.731605+03	1
1276	236	200	sale	-140.0000	0.0000	Order 123019	1	2026-05-03 15:23:43.731605+03	1
1277	224	201	sale	-18.0000	0.0000	Order 123020	1	2026-05-03 15:27:35.011268+03	1
1278	260	201	sale	-30.0000	0.0000	Order 123020	1	2026-05-03 15:27:35.011268+03	1
1279	244	201	sale	-35.0000	0.0000	Order 123020	1	2026-05-03 15:27:35.011268+03	1
1280	235	201	sale	-120.0000	0.0000	Order 123020	1	2026-05-03 15:27:35.011268+03	1
1281	298	201	sale	-1.0000	1.0000	Order 123020	1	2026-05-03 15:27:35.011268+03	1
1282	224	202	sale	-18.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1283	248	202	sale	-35.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1284	259	202	sale	-10.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1285	244	202	sale	-35.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1286	269	202	sale	-30.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1287	235	202	sale	-100.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1288	302	202	sale	-1.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1289	257	202	sale	-20.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1290	224	202	sale	-18.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1291	235	202	sale	-100.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1292	305	202	sale	-1.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1293	264	202	sale	-15.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1294	224	202	sale	-18.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1295	235	202	sale	-80.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1296	305	202	sale	-1.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1297	267	202	sale	-30.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1298	224	202	sale	-18.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1299	235	202	sale	-100.0000	0.0000	Order 123021	1	2026-05-03 15:34:47.567941+03	1
1300	264	203	sale	-25.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1301	269	203	sale	-25.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1302	224	203	sale	-18.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1303	248	203	sale	-5.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1304	235	203	sale	-90.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1305	302	203	sale	-1.0000	0.0000	Order 123022	1	2026-05-03 15:40:32.982435+03	1
1306	264	204	sale	-25.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1307	269	204	sale	-25.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1308	224	204	sale	-18.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1309	248	204	sale	-5.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1310	235	204	sale	-90.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1311	302	204	sale	-1.0000	0.0000	Order 123023	1	2026-05-03 15:44:46.957388+03	1
1312	224	205	sale	-18.0000	0.0000	Order 123024	1	2026-05-03 17:35:09.39786+03	1
1313	269	205	sale	-30.0000	0.0000	Order 123024	1	2026-05-03 17:35:09.39786+03	1
1314	244	205	sale	-35.0000	0.0000	Order 123024	1	2026-05-03 17:35:09.39786+03	1
1315	235	205	sale	-90.0000	0.0000	Order 123024	1	2026-05-03 17:35:09.39786+03	1
1316	302	205	sale	-1.0000	0.0000	Order 123024	1	2026-05-03 17:35:09.39786+03	1
1317	242	207	sale	-35.0000	0.0000	Order 123026	1	2026-05-03 19:13:52.13228+03	1
1318	224	207	sale	-18.0000	216.0000	Order 123026	1	2026-05-03 19:13:52.13228+03	1
1319	235	207	sale	-140.0000	360.0000	Order 123026	1	2026-05-03 19:13:52.13228+03	1
1320	302	207	sale	-1.0000	0.0000	Order 123026	1	2026-05-03 19:13:52.13228+03	1
1321	245	208	sale	-60.0000	0.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1322	224	208	sale	-36.0000	180.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1323	269	208	sale	-60.0000	0.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1324	244	208	sale	-70.0000	175.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1325	235	208	sale	-200.0000	160.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1326	302	208	sale	-2.0000	0.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1327	225	208	sale	-18.0000	36.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1328	235	208	sale	-120.0000	40.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1329	298	208	sale	-1.0000	1.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1330	224	208	sale	-18.0000	162.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1331	302	208	sale	-1.0000	0.0000	Order 123027	1	2026-05-03 20:01:42.048794+03	1
1332	224	209	sale	-18.0000	144.0000	Order 124001	1	2026-05-04 11:26:13.456561+03	1
1333	302	209	sale	-1.0000	0.0000	Order 124001	1	2026-05-04 11:26:13.456561+03	1
1334	225	210	sale	-18.0000	18.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1335	297	210	sale	-1.0000	0.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1336	261	210	sale	-30.0000	30.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1337	224	210	sale	-18.0000	126.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1338	235	210	sale	-250.0000	0.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1339	300	210	sale	-1.0000	0.0000	Order 124002	1	2026-05-04 11:32:24.909654+03	1
1340	225	211	sale	-18.0000	0.0000	Order 124003	1	2026-05-04 11:40:32.787741+03	1
1341	297	211	sale	-1.0000	0.0000	Order 124003	1	2026-05-04 11:40:32.787741+03	1
1342	224	212	sale	-18.0000	108.0000	Order 124004	1	2026-05-04 11:43:36.426373+03	1
1343	258	212	sale	-15.0000	0.0000	Order 124004	1	2026-05-04 11:43:36.426373+03	1
1344	237	212	sale	-235.0000	107.0000	Order 124004	1	2026-05-04 11:43:36.426373+03	1
1345	300	212	sale	-1.0000	0.0000	Order 124004	1	2026-05-04 11:43:36.426373+03	1
1346	261	213	sale	-90.0000	0.0000	Order 124005	1	2026-05-04 16:21:08.81146+03	1
1347	270	213	sale	-90.0000	0.0000	Order 124005	1	2026-05-04 16:21:08.81146+03	1
1348	244	213	sale	-105.0000	70.0000	Order 124005	1	2026-05-04 16:21:08.81146+03	1
1349	235	213	sale	-420.0000	0.0000	Order 124005	1	2026-05-04 16:21:08.81146+03	1
1350	302	213	sale	-3.0000	0.0000	Order 124005	1	2026-05-04 16:21:08.81146+03	1
1351	261	214	sale	-30.0000	0.0000	Order 124006	1	2026-05-04 16:32:57.067715+03	1
1352	270	214	sale	-30.0000	0.0000	Order 124006	1	2026-05-04 16:32:57.067715+03	1
1353	244	214	sale	-35.0000	35.0000	Order 124006	1	2026-05-04 16:32:57.067715+03	1
1354	235	214	sale	-140.0000	0.0000	Order 124006	1	2026-05-04 16:32:57.067715+03	1
1355	302	214	sale	-1.0000	0.0000	Order 124006	1	2026-05-04 16:32:57.067715+03	1
1356	224	\N	restock	12881.0000	12989.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.49012+03	1
1357	225	\N	restock	6990.0000	6990.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.492973+03	1
1358	227	\N	restock	743.0000	743.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.511966+03	1
1359	228	\N	restock	1658.0000	1658.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.514137+03	1
1360	226	\N	restock	3090.0000	3090.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.528327+03	1
1361	229	\N	restock	1370.0000	1370.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.563807+03	1
1362	230	\N	restock	1455.0000	1455.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.564155+03	1
1363	231	\N	restock	1150.0000	1150.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.583541+03	1
1364	232	\N	restock	797.0000	797.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.583804+03	1
1365	233	\N	restock	1002.0000	1002.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.603856+03	1
1366	235	\N	restock	12750.0000	12750.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.63649+03	1
1367	234	\N	restock	475.0000	475.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.637626+03	1
1368	236	\N	restock	5100.0000	5100.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.656469+03	1
1369	237	\N	restock	398.0000	505.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.658083+03	1
1370	238	\N	restock	4220.0000	4220.0000	Opening / startup stock entry	1	2026-05-04 17:12:33.667592+03	1
1371	240	\N	restock	6000.0000	6000.0000	Opening / startup stock entry	1	2026-05-04 17:12:34.564895+03	1
1372	239	\N	restock	6030.0000	6087.0000	Opening / startup stock entry	1	2026-05-04 17:12:34.565659+03	1
1373	241	\N	restock	309.0000	850.0000	Opening / startup stock entry	1	2026-05-04 17:12:36.124432+03	1
1374	242	\N	restock	6482.0000	6482.0000	Opening / startup stock entry	1	2026-05-04 17:12:36.317165+03	1
1375	243	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-05-04 17:12:36.350839+03	1
1376	244	\N	restock	5715.0000	5750.0000	Opening / startup stock entry	1	2026-05-04 17:12:44.648814+03	1
1377	245	\N	restock	2700.0000	2700.0000	Opening / startup stock entry	1	2026-05-04 17:12:44.653549+03	1
1378	246	\N	restock	1645.0000	1645.0000	Opening / startup stock entry	1	2026-05-04 17:12:48.804498+03	1
1379	247	\N	restock	380.0000	380.0000	Opening / startup stock entry	1	2026-05-04 17:12:49.002784+03	1
1380	248	\N	restock	435.0000	500.0000	Opening / startup stock entry	1	2026-05-04 17:12:49.115528+03	1
1381	249	\N	restock	4787.0000	4787.0000	Opening / startup stock entry	1	2026-05-04 17:12:59.662349+03	1
1382	250	\N	restock	4564.0000	4564.0000	Opening / startup stock entry	1	2026-05-04 17:12:59.664922+03	1
1383	251	\N	restock	5074.0000	5104.0000	Opening / startup stock entry	1	2026-05-04 17:13:04.819903+03	1
1384	252	\N	restock	4795.0000	4795.0000	Opening / startup stock entry	1	2026-05-04 17:13:05.107165+03	1
1385	253	\N	restock	4738.0000	4738.0000	Opening / startup stock entry	1	2026-05-04 17:13:05.45669+03	1
1386	254	\N	restock	3613.0000	3613.0000	Opening / startup stock entry	1	2026-05-04 17:13:11.900531+03	1
1387	255	\N	restock	3978.0000	3978.0000	Opening / startup stock entry	1	2026-05-04 17:13:11.90414+03	1
1388	256	\N	restock	6012.0000	6012.0000	Opening / startup stock entry	1	2026-05-04 17:13:14.367922+03	1
1389	257	\N	restock	1868.0000	1918.0000	Opening / startup stock entry	1	2026-05-04 17:13:14.54313+03	1
1390	258	\N	restock	5663.0000	5663.0000	Opening / startup stock entry	1	2026-05-04 17:13:14.922141+03	1
1391	259	\N	restock	2750.0000	2825.0000	Opening / startup stock entry	1	2026-05-04 17:13:21.684258+03	1
1392	260	\N	restock	4058.0000	4138.0000	Opening / startup stock entry	1	2026-05-04 17:13:21.6848+03	1
1393	261	\N	restock	2348.0000	2348.0000	Opening / startup stock entry	1	2026-05-04 17:13:25.676645+03	1
1394	262	\N	restock	5100.0000	5100.0000	Opening / startup stock entry	1	2026-05-04 17:13:26.079789+03	1
1395	263	\N	restock	5100.0000	5100.0000	Opening / startup stock entry	1	2026-05-04 17:13:26.41268+03	1
1396	264	\N	restock	3487.0000	3547.0000	Opening / startup stock entry	1	2026-05-04 17:13:41.071326+03	1
1397	265	\N	restock	1645.0000	1645.0000	Opening / startup stock entry	1	2026-05-04 17:13:41.074781+03	1
1398	266	\N	restock	300.0000	300.0000	Opening / startup stock entry	1	2026-05-04 17:13:48.344778+03	1
1399	267	\N	restock	202.0000	277.0000	Opening / startup stock entry	1	2026-05-04 17:13:49.106815+03	1
1400	268	\N	restock	4493.0000	4493.0000	Opening / startup stock entry	1	2026-05-04 17:13:49.80813+03	1
1401	269	\N	restock	824.0000	824.0000	Opening / startup stock entry	1	2026-05-04 17:14:11.638031+03	1
1402	270	\N	restock	4845.0000	4845.0000	Opening / startup stock entry	1	2026-05-04 17:14:11.648636+03	1
1403	271	\N	restock	112.0000	115.0000	Opening / startup stock entry	1	2026-05-04 17:14:20.241655+03	1
1404	272	\N	restock	111.0000	111.0000	Opening / startup stock entry	1	2026-05-04 17:14:20.991736+03	1
1405	273	\N	restock	943.0000	943.0000	Opening / startup stock entry	1	2026-05-04 17:14:21.757877+03	1
1406	274	\N	restock	150.0000	150.0000	Opening / startup stock entry	1	2026-05-04 17:14:33.264863+03	1
1407	275	\N	restock	298.0000	300.0000	Opening / startup stock entry	1	2026-05-04 17:14:33.268629+03	1
1408	276	\N	restock	63.0000	63.0000	Opening / startup stock entry	1	2026-05-04 17:14:38.380264+03	1
1409	277	\N	restock	46.0000	46.0000	Opening / startup stock entry	1	2026-05-04 17:14:38.844606+03	1
1410	278	\N	restock	136.0000	137.0000	Opening / startup stock entry	1	2026-05-04 17:14:39.426389+03	1
1411	280	\N	restock	-224.0000	26.0000	Opening / startup stock entry	1	2026-05-04 17:14:51.01965+03	1
1412	279	\N	restock	11.0000	11.0000	Opening / startup stock entry	1	2026-05-04 17:14:51.020178+03	1
1413	281	\N	restock	10.0000	10.0000	Opening / startup stock entry	1	2026-05-04 17:14:57.557579+03	1
1414	282	\N	restock	14.0000	14.0000	Opening / startup stock entry	1	2026-05-04 17:14:58.075185+03	1
1415	283	\N	restock	3729.0000	3729.0000	Opening / startup stock entry	1	2026-05-04 17:14:59.093867+03	1
1416	284	\N	restock	51.0000	86.0000	Opening / startup stock entry	1	2026-05-04 17:15:24.459073+03	1
1417	285	\N	restock	0.0000	1.0000	Opening / startup stock entry	1	2026-05-04 17:15:24.459982+03	1
1418	286	\N	restock	700.0000	700.0000	Opening / startup stock entry	1	2026-05-04 17:15:35.957502+03	1
1419	287	\N	restock	1282.0000	1282.0000	Opening / startup stock entry	1	2026-05-04 17:15:37.194118+03	1
1420	288	\N	restock	809.0000	809.0000	Opening / startup stock entry	1	2026-05-04 17:15:38.584482+03	1
1421	289	\N	restock	127.0000	127.0000	Opening / startup stock entry	1	2026-05-04 17:16:07.933018+03	1
1425	293	\N	restock	200.0000	200.0000	Opening / startup stock entry	1	2026-05-04 17:16:21.338728+03	1
1430	298	\N	restock	682.0000	683.0000	Opening / startup stock entry	1	2026-05-04 17:16:51.968241+03	1
1432	300	\N	restock	606.0000	606.0000	Opening / startup stock entry	1	2026-05-04 17:17:04.629117+03	1
1434	302	\N	restock	186.0000	186.0000	Opening / startup stock entry	1	2026-05-04 17:17:10.728539+03	1
1438	306	\N	restock	945.0000	945.0000	Opening / startup stock entry	1	2026-05-04 17:17:30.821355+03	1
1440	308	\N	restock	1507.0000	1507.0000	Opening / startup stock entry	1	2026-05-04 17:17:32.55693+03	1
1441	309	\N	restock	2.0000	2.0000	Opening / startup stock entry	1	2026-05-04 17:17:56.341289+03	1
1442	310	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-05-04 17:17:56.343422+03	1
1422	290	\N	restock	47.0000	47.0000	Opening / startup stock entry	1	2026-05-04 17:16:07.934014+03	1
1423	291	\N	restock	138.0000	138.0000	Opening / startup stock entry	1	2026-05-04 17:16:19.118214+03	1
1424	292	\N	restock	1950.0000	1950.0000	Opening / startup stock entry	1	2026-05-04 17:16:20.024843+03	1
1426	294	\N	restock	150.0000	150.0000	Opening / startup stock entry	1	2026-05-04 17:16:41.673528+03	1
1433	301	\N	restock	321.0000	321.0000	Opening / startup stock entry	1	2026-05-04 17:17:10.271456+03	1
1436	305	\N	restock	723.0000	725.0000	Opening / startup stock entry	1	2026-05-04 17:17:23.934131+03	1
1439	307	\N	restock	55.0000	55.0000	Opening / startup stock entry	1	2026-05-04 17:17:31.637088+03	1
1447	315	\N	restock	0.0000	0.0000	Opening / startup stock entry	1	2026-05-04 17:18:37.009593+03	1
1427	295	\N	restock	100.0000	100.0000	Opening / startup stock entry	1	2026-05-04 17:16:41.678891+03	1
1431	299	\N	restock	282.0000	282.0000	Opening / startup stock entry	1	2026-05-04 17:17:04.627251+03	1
1435	303	\N	restock	550.0000	550.0000	Opening / startup stock entry	1	2026-05-04 17:17:11.323477+03	1
1444	312	\N	restock	3.0000	3.0000	Opening / startup stock entry	1	2026-05-04 17:18:11.182936+03	1
1428	296	\N	restock	300.0000	300.0000	Opening / startup stock entry	1	2026-05-04 17:16:50.346618+03	1
1437	304	\N	restock	872.0000	872.0000	Opening / startup stock entry	1	2026-05-04 17:17:23.936139+03	1
1443	311	\N	restock	30.0000	30.0000	Opening / startup stock entry	1	2026-05-04 17:18:09.991585+03	1
1445	313	\N	restock	1000.0000	1000.0000	Opening / startup stock entry	1	2026-05-04 17:18:12.427745+03	1
1429	297	\N	restock	358.0000	358.0000	Opening / startup stock entry	1	2026-05-04 17:16:51.096511+03	1
1446	314	\N	restock	486.0000	486.0000	Opening / startup stock entry	1	2026-05-04 17:18:37.007601+03	1
1448	260	215	sale	-40.0000	4098.0000	Order 125001	8	2026-05-05 17:34:44.37287+03	1
1449	284	215	sale	-30.0000	56.0000	Order 125001	8	2026-05-05 17:34:44.37287+03	1
1450	252	215	sale	-20.0000	4775.0000	Order 125001	8	2026-05-05 17:34:44.37287+03	1
1451	302	215	sale	-1.0000	185.0000	Order 125001	8	2026-05-05 17:34:44.37287+03	1
1488	225	221	sale	-18.0000	6918.0000	Order 130001	1	2026-05-10 20:57:39.842065+03	1
1489	235	221	sale	-120.0000	11760.0000	Order 130001	1	2026-05-10 20:57:39.842065+03	1
1490	297	221	sale	-1.0000	355.0000	Order 130001	1	2026-05-10 20:57:39.842065+03	1
1452	260	216	sale	-40.0000	4058.0000	Order 125002	8	2026-05-05 17:38:16.682724+03	1
1453	284	216	sale	-30.0000	26.0000	Order 125002	8	2026-05-05 17:38:16.682724+03	1
1454	252	216	sale	-20.0000	4755.0000	Order 125002	8	2026-05-05 17:38:16.682724+03	1
1455	302	216	sale	-1.0000	184.0000	Order 125002	8	2026-05-05 17:38:16.682724+03	1
1491	319	\N	restock	100.0000	100.0000	Test movement	8	2026-05-11 16:08:38.494602+03	1
1456	224	217	sale	-18.0000	12971.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1457	235	217	sale	-150.0000	12600.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1458	302	217	sale	-1.0000	183.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1459	225	217	sale	-18.0000	6972.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1460	235	217	sale	-120.0000	12480.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1461	297	217	sale	-1.0000	357.0000	Order 125003	8	2026-05-05 17:43:10.323259+03	1
1492	318	\N	restock	50.0000	50.0000	\N	8	2026-05-11 16:35:13.350585+03	1
1462	248	218	sale	-20.0000	480.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1463	259	218	sale	-10.0000	2815.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1464	224	218	sale	-18.0000	12953.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1465	248	218	sale	-10.0000	470.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1466	235	218	sale	-250.0000	12230.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1467	300	218	sale	-1.0000	605.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1468	260	218	sale	-40.0000	4018.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1469	284	218	sale	-30.0000	0.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1470	252	218	sale	-20.0000	4735.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1471	302	218	sale	-1.0000	182.0000	Order 125004	8	2026-05-05 18:00:21.220397+03	1
1493	279	\N	restock	100.0000	111.0000	\N	8	2026-05-11 17:01:00.850237+03	1
1472	224	219	sale	-18.0000	12935.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1473	235	219	sale	-250.0000	11980.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1474	300	219	sale	-1.0000	604.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1475	224	219	sale	-18.0000	12917.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1476	248	219	sale	-35.0000	435.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1477	259	219	sale	-10.0000	2805.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1478	244	219	sale	-35.0000	5715.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1479	269	219	sale	-30.0000	794.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1480	235	219	sale	-100.0000	11880.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1481	302	219	sale	-1.0000	181.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1482	277	219	sale	-1.0000	45.0000	Order 127001	8	2026-05-07 23:36:01.866622+03	1
1494	284	\N	restock	50.0000	50.0000	Opening / startup stock entry	8	2026-05-11 17:08:10.566272+03	1
1483	225	220	sale	-36.0000	6936.0000	Order 128001	8	2026-05-08 22:23:15.461905+03	1
1484	297	220	sale	-1.0000	356.0000	Order 128001	8	2026-05-08 22:23:15.461905+03	1
1485	254	220	sale	-20.0000	3593.0000	Order 128001	8	2026-05-08 22:23:15.461905+03	1
1486	241	220	sale	-30.0000	820.0000	Order 128001	8	2026-05-08 22:23:15.461905+03	1
1487	302	220	sale	-1.0000	180.0000	Order 128001	8	2026-05-08 22:23:15.461905+03	1
1495	285	\N	restock	24.0000	25.0000	Opening / startup stock entry	8	2026-05-11 17:08:10.56673+03	1
1496	279	\N	restock	500.0000	611.0000	\N	8	2026-05-11 17:09:49.384132+03	1
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (id, user_id, permission_key, granted, created_at) FROM stdin;
1	10	orders:view	t	2026-05-02 14:46:51.178647+03
2	10	catalog:view	t	2026-05-02 14:46:51.178647+03
3	10	inventory:view	t	2026-05-02 14:46:51.178647+03
14	5	orders:pickup	t	2026-05-04 16:53:11.353936+03
15	5	pos:view	t	2026-05-04 16:53:11.353936+03
16	5	orders:view	t	2026-05-04 16:53:11.353936+03
17	5	cashier:view_reports	t	2026-05-04 16:53:11.353936+03
18	5	cashier:close_session	t	2026-05-04 16:53:11.353936+03
19	5	cashier:refund_order	t	2026-05-04 16:53:11.353936+03
20	5	cashier:cancel_order	t	2026-05-04 16:53:11.353936+03
21	5	cashier:approve_order	t	2026-05-04 16:53:11.353936+03
22	5	cashier:view	t	2026-05-04 16:53:11.353936+03
29	12	admin:view	t	2026-05-05 11:42:00.170878+03
30	12	pos:view	t	2026-05-05 11:42:00.170878+03
31	12	inventory:view	t	2026-05-05 11:42:00.170878+03
32	12	reports:view	t	2026-05-05 11:42:00.170878+03
33	12	discounts:view	t	2026-05-05 11:42:00.170878+03
34	12	orders:view	t	2026-05-05 11:42:00.170878+03
35	12	cashier:view	t	2026-05-05 11:42:00.170878+03
38	6	orders:view	t	2026-05-07 23:34:48.64756+03
39	6	orders:pickup	t	2026-05-07 23:34:48.64756+03
40	6	cashier:view	t	2026-05-07 23:34:48.64756+03
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, role, pin, created_at, updated_at, username, password_hash, is_active, branch_id) FROM stdin;
7	Spacca Admin	admin	121234	2026-04-26 19:41:28.491031+03	2026-04-26 19:41:28.491031+03	\N	\N	t	1
9	System Admin	admin	123456	2026-04-29 19:39:15.026199+03	2026-04-29 19:51:05.271+03	admin	$2b$10$FYUttvmJGl/8DNcEnvbbme7bK8jQdPqK0dQ/SKuUE.AlxUfMGJJPC	t	1
8	System Admin	admin	123456	2026-04-29 19:38:58.244715+03	2026-04-29 19:53:33.663+03	admin1	$2b$10$Jh8A.GKfBQmLXPwvzzi2oOrHYlmK/3..y9AaOQtXYgwNSvo4isJk.	t	1
5	Hale Town Cashier	cashier	369741	2026-04-21 16:23:33.021966+02	2026-04-29 19:55:20.458+03	cashier	$2b$10$caysX1xgM5byDMBDpsXDiOVcctkmVxGi2lqnLjKhPkJk1axkFQnrm	t	1
3	Adam	barista	222222	2026-04-17 00:56:14.276428+02	2026-04-29 19:55:59.263+03	barista1	$2b$10$sRolu4Fvb7yIpMR1GxaMReAzSN/sPoJxynwzVoEW/Rbm6r/z/SUXG	t	1
2	Cold Barista	barista	111111	2026-04-17 00:56:14.276428+02	2026-04-29 19:56:48.761+03	barista2	$2b$10$Upkr/.OmcHYkVQfAql0zf.gDYAwMrjvOpZov9ZHs10r.hNInGkyuu	t	1
1	Admin User	admin	132465	2026-04-17 00:56:14.276428+02	2026-04-29 23:05:42.925+03	admin_1	$2b$10$GCsVi2qtGCHZrTpsDMa4V.esW3TQ0EjVRxxlcNTeXfAB.FLECV0AW	t	1
6	Hale Town Pickup	pickup	147963	2026-04-21 16:23:48.242314+02	2026-04-30 10:14:12.481+03	pickup1	$2b$10$q75VakFstaws1s3FKvTkduBekkOwwATapxkZxt64kxxiHGu0N8hqe	t	1
10	Finance Department	finance	\N	2026-05-02 14:39:55.692648+03	2026-05-04 12:34:07.768+03	spacca_fin	$2b$10$V6KAA9n2gfNa2h02vJTvLepN2b5x8OZp44zA2pjq8GGsJt8ttLOnW	t	\N
4	Spacca POS	frontdesk	999999	2026-04-17 00:56:14.276428+02	2026-05-04 12:51:18.58+03	spacca_pos	$2b$10$vsfSKwxzavaor6qwByYVUOre7V358O2RMoNQ8bbeue20AsAYs6Knu	t	1
12	Finance Department	finance	\N	2026-05-04 12:53:34.228664+03	2026-05-04 12:53:34.228664+03	spacca_fina	$2b$10$8E5X7woWuN1IzIzCyoXUC.lMhnMEv0w7JC/SYkvrXToz1iimmt6hi	t	1
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 6, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 261, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 2, true);


--
-- Name: cashier_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cashier_sessions_id_seq', 37, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discounts_id_seq', 4, true);


--
-- Name: drink_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_categories_id_seq', 11, true);


--
-- Name: drink_ingredient_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_ingredient_slots_id_seq', 7065, true);


--
-- Name: drink_slot_type_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_type_options_id_seq', 20573, true);


--
-- Name: drink_slot_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_volumes_id_seq', 27503, true);


--
-- Name: drinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drinks_id_seq', 132, true);


--
-- Name: ingredient_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_categories_id_seq', 12, true);


--
-- Name: ingredient_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_options_id_seq', 47, true);


--
-- Name: ingredient_type_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_type_volumes_id_seq', 148, true);


--
-- Name: ingredient_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_types_id_seq', 114, true);


--
-- Name: ingredient_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_volumes_id_seq', 37, true);


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 361, true);


--
-- Name: kitchen_stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kitchen_stations_id_seq', 4, true);


--
-- Name: order_item_customizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_customizations_id_seq', 1453, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 360, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 221, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 261, true);


--
-- Name: predefined_slot_type_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slot_type_options_id_seq', 1990, true);


--
-- Name: predefined_slot_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slot_volumes_id_seq', 1221, true);


--
-- Name: predefined_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slots_id_seq', 11, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 360, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 7, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 3, true);


--
-- Name: stock_audit_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_audit_items_id_seq', 172, true);


--
-- Name: stock_audits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_audits_id_seq', 5, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1496, true);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_permissions_id_seq', 40, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: branch_stock branch_stock_branch_id_ingredient_id_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_stock
    ADD CONSTRAINT branch_stock_branch_id_ingredient_id_pk PRIMARY KEY (branch_id, ingredient_id);


--
-- Name: branches branches_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_unique UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: cashier_sessions cashier_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_sessions
    ADD CONSTRAINT cashier_sessions_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_unique UNIQUE (code);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: drink_categories drink_categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_categories
    ADD CONSTRAINT drink_categories_name_unique UNIQUE (name);


--
-- Name: drink_categories drink_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_categories
    ADD CONSTRAINT drink_categories_pkey PRIMARY KEY (id);


--
-- Name: drink_ingredient_slots drink_ingredient_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots
    ADD CONSTRAINT drink_ingredient_slots_pkey PRIMARY KEY (id);


--
-- Name: drink_slot_type_options drink_slot_type_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_type_options
    ADD CONSTRAINT drink_slot_type_options_pkey PRIMARY KEY (id);


--
-- Name: drink_slot_volumes drink_slot_volumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_volumes
    ADD CONSTRAINT drink_slot_volumes_pkey PRIMARY KEY (id);


--
-- Name: drinks drinks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_pkey PRIMARY KEY (id);


--
-- Name: ingredient_categories ingredient_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_categories
    ADD CONSTRAINT ingredient_categories_pkey PRIMARY KEY (id);


--
-- Name: ingredient_options ingredient_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_options
    ADD CONSTRAINT ingredient_options_pkey PRIMARY KEY (id);


--
-- Name: ingredient_type_volumes ingredient_type_volumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_type_volumes
    ADD CONSTRAINT ingredient_type_volumes_pkey PRIMARY KEY (id);


--
-- Name: ingredient_types ingredient_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_types
    ADD CONSTRAINT ingredient_types_pkey PRIMARY KEY (id);


--
-- Name: ingredient_volumes ingredient_volumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_volumes
    ADD CONSTRAINT ingredient_volumes_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_slug_unique UNIQUE (slug);


--
-- Name: kitchen_stations kitchen_stations_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_stations
    ADD CONSTRAINT kitchen_stations_name_unique UNIQUE (name);


--
-- Name: kitchen_stations kitchen_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kitchen_stations
    ADD CONSTRAINT kitchen_stations_pkey PRIMARY KEY (id);


--
-- Name: order_item_customizations order_item_customizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_customizations
    ADD CONSTRAINT order_item_customizations_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_key_unique UNIQUE (key);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: predefined_slot_type_options predefined_slot_type_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_type_options
    ADD CONSTRAINT predefined_slot_type_options_pkey PRIMARY KEY (id);


--
-- Name: predefined_slot_volumes predefined_slot_volumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_volumes
    ADD CONSTRAINT predefined_slot_volumes_pkey PRIMARY KEY (id);


--
-- Name: predefined_slots predefined_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slots
    ADD CONSTRAINT predefined_slots_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_key_key UNIQUE (key);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_audit_items stock_audit_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_pkey PRIMARY KEY (id);


--
-- Name: stock_audits stock_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audits
    ADD CONSTRAINT stock_audits_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: drink_ingredient_slots_drink_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drink_ingredient_slots_drink_id_idx ON public.drink_ingredient_slots USING btree (drink_id);


--
-- Name: drink_slot_type_options_slot_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drink_slot_type_options_slot_id_idx ON public.drink_slot_type_options USING btree (slot_id);


--
-- Name: drink_slot_volumes_slot_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drink_slot_volumes_slot_id_idx ON public.drink_slot_volumes USING btree (slot_id);


--
-- Name: drinks_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drinks_category_id_idx ON public.drinks USING btree (category_id);


--
-- Name: drinks_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX drinks_is_active_idx ON public.drinks USING btree (is_active);


--
-- Name: global_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX global_key_idx ON public.settings USING btree (key) WHERE (scope = 'global'::text);


--
-- Name: order_item_customizations_item_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_item_customizations_item_id_idx ON public.order_item_customizations USING btree (order_item_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: user_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_key_idx ON public.settings USING btree (user_id, key) WHERE (scope = 'user'::text);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: branch_stock branch_stock_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_stock
    ADD CONSTRAINT branch_stock_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_stock branch_stock_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branch_stock
    ADD CONSTRAINT branch_stock_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: cashier_sessions cashier_sessions_cashier_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cashier_sessions
    ADD CONSTRAINT cashier_sessions_cashier_id_users_id_fk FOREIGN KEY (cashier_id) REFERENCES public.users(id);


--
-- Name: drink_ingredient_slots drink_ingredient_slots_default_option_id_ingredient_options_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots
    ADD CONSTRAINT drink_ingredient_slots_default_option_id_ingredient_options_id_ FOREIGN KEY (default_option_id) REFERENCES public.ingredient_options(id) ON DELETE SET NULL;


--
-- Name: drink_ingredient_slots drink_ingredient_slots_drink_id_drinks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots
    ADD CONSTRAINT drink_ingredient_slots_drink_id_drinks_id_fk FOREIGN KEY (drink_id) REFERENCES public.drinks(id) ON DELETE CASCADE;


--
-- Name: drink_ingredient_slots drink_ingredient_slots_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots
    ADD CONSTRAINT drink_ingredient_slots_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: drink_ingredient_slots drink_ingredient_slots_ingredient_type_id_ingredient_types_id_f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_ingredient_slots
    ADD CONSTRAINT drink_ingredient_slots_ingredient_type_id_ingredient_types_id_f FOREIGN KEY (ingredient_type_id) REFERENCES public.ingredient_types(id) ON DELETE SET NULL;


--
-- Name: drink_slot_type_options drink_slot_type_options_ingredient_type_id_ingredient_types_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_type_options
    ADD CONSTRAINT drink_slot_type_options_ingredient_type_id_ingredient_types_id_ FOREIGN KEY (ingredient_type_id) REFERENCES public.ingredient_types(id) ON DELETE CASCADE;


--
-- Name: drink_slot_type_options drink_slot_type_options_slot_id_drink_ingredient_slots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_type_options
    ADD CONSTRAINT drink_slot_type_options_slot_id_drink_ingredient_slots_id_fk FOREIGN KEY (slot_id) REFERENCES public.drink_ingredient_slots(id) ON DELETE CASCADE;


--
-- Name: drink_slot_volumes drink_slot_volumes_slot_id_drink_ingredient_slots_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_volumes
    ADD CONSTRAINT drink_slot_volumes_slot_id_drink_ingredient_slots_id_fk FOREIGN KEY (slot_id) REFERENCES public.drink_ingredient_slots(id) ON DELETE CASCADE;


--
-- Name: drink_slot_volumes drink_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drink_slot_volumes
    ADD CONSTRAINT drink_slot_volumes_type_volume_id_ingredient_type_volumes_id_fk FOREIGN KEY (type_volume_id) REFERENCES public.ingredient_type_volumes(id);


--
-- Name: drinks drinks_category_id_drink_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_category_id_drink_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.drink_categories(id);


--
-- Name: drinks drinks_cup_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_cup_ingredient_id_ingredients_id_fk FOREIGN KEY (cup_ingredient_id) REFERENCES public.ingredients(id) ON DELETE SET NULL;


--
-- Name: drinks drinks_kitchen_station_id_kitchen_stations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drinks
    ADD CONSTRAINT drinks_kitchen_station_id_kitchen_stations_id_fk FOREIGN KEY (kitchen_station_id) REFERENCES public.kitchen_stations(id);


--
-- Name: ingredient_options ingredient_options_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_options
    ADD CONSTRAINT ingredient_options_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: ingredient_options ingredient_options_linked_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_options
    ADD CONSTRAINT ingredient_options_linked_ingredient_id_ingredients_id_fk FOREIGN KEY (linked_ingredient_id) REFERENCES public.ingredients(id) ON DELETE SET NULL;


--
-- Name: ingredient_type_volumes ingredient_type_volumes_ingredient_type_id_ingredient_types_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_type_volumes
    ADD CONSTRAINT ingredient_type_volumes_ingredient_type_id_ingredient_types_id_ FOREIGN KEY (ingredient_type_id) REFERENCES public.ingredient_types(id) ON DELETE CASCADE;


--
-- Name: ingredient_type_volumes ingredient_type_volumes_volume_id_ingredient_volumes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_type_volumes
    ADD CONSTRAINT ingredient_type_volumes_volume_id_ingredient_volumes_id_fk FOREIGN KEY (volume_id) REFERENCES public.ingredient_volumes(id);


--
-- Name: ingredient_types ingredient_types_category_id_ingredient_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_types
    ADD CONSTRAINT ingredient_types_category_id_ingredient_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.ingredient_categories(id);


--
-- Name: ingredient_types ingredient_types_inventory_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredient_types
    ADD CONSTRAINT ingredient_types_inventory_ingredient_id_ingredients_id_fk FOREIGN KEY (inventory_ingredient_id) REFERENCES public.ingredients(id) ON DELETE SET NULL;


--
-- Name: order_item_customizations order_item_customizations_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_customizations
    ADD CONSTRAINT order_item_customizations_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: order_item_customizations order_item_customizations_option_id_ingredient_options_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_customizations
    ADD CONSTRAINT order_item_customizations_option_id_ingredient_options_id_fk FOREIGN KEY (option_id) REFERENCES public.ingredient_options(id) ON DELETE SET NULL;


--
-- Name: order_item_customizations order_item_customizations_order_item_id_order_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_customizations
    ADD CONSTRAINT order_item_customizations_order_item_id_order_items_id_fk FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_drink_id_drinks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_drink_id_drinks_id_fk FOREIGN KEY (drink_id) REFERENCES public.drinks(id);


--
-- Name: order_items order_items_kitchen_station_id_kitchen_stations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_kitchen_station_id_kitchen_stations_id_fk FOREIGN KEY (kitchen_station_id) REFERENCES public.kitchen_stations(id);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_barista_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_barista_id_users_id_fk FOREIGN KEY (barista_id) REFERENCES public.users(id);


--
-- Name: orders orders_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: orders orders_cashier_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cashier_id_users_id_fk FOREIGN KEY (cashier_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: orders orders_discount_id_discounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_discount_id_discounts_id_fk FOREIGN KEY (discount_id) REFERENCES public.discounts(id);


--
-- Name: predefined_slot_type_options predefined_slot_type_options_ingredient_type_id_ingredient_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_type_options
    ADD CONSTRAINT predefined_slot_type_options_ingredient_type_id_ingredient_type FOREIGN KEY (ingredient_type_id) REFERENCES public.ingredient_types(id) ON DELETE CASCADE;


--
-- Name: predefined_slot_type_options predefined_slot_type_options_predefined_slot_id_predefined_slot; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_type_options
    ADD CONSTRAINT predefined_slot_type_options_predefined_slot_id_predefined_slot FOREIGN KEY (predefined_slot_id) REFERENCES public.predefined_slots(id) ON DELETE CASCADE;


--
-- Name: predefined_slot_volumes predefined_slot_volumes_predefined_slot_id_predefined_slots_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_volumes
    ADD CONSTRAINT predefined_slot_volumes_predefined_slot_id_predefined_slots_id_ FOREIGN KEY (predefined_slot_id) REFERENCES public.predefined_slots(id) ON DELETE CASCADE;


--
-- Name: predefined_slot_volumes predefined_slot_volumes_type_volume_id_ingredient_type_volumes_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predefined_slot_volumes
    ADD CONSTRAINT predefined_slot_volumes_type_volume_id_ingredient_type_volumes_ FOREIGN KEY (type_volume_id) REFERENCES public.ingredient_type_volumes(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_key_permissions_key_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_key_permissions_key_fk FOREIGN KEY (permission_key) REFERENCES public.permissions(key);


--
-- Name: role_permissions role_permissions_role_key_roles_key_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_key_roles_key_fk FOREIGN KEY (role_key) REFERENCES public.roles(key);


--
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stock_audit_items stock_audit_items_audit_id_stock_audits_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_audit_id_stock_audits_id_fk FOREIGN KEY (audit_id) REFERENCES public.stock_audits(id) ON DELETE CASCADE;


--
-- Name: stock_audit_items stock_audit_items_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audit_items
    ADD CONSTRAINT stock_audit_items_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: stock_audits stock_audits_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audits
    ADD CONSTRAINT stock_audits_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: stock_audits stock_audits_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audits
    ADD CONSTRAINT stock_audits_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: stock_audits stock_audits_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_audits
    ADD CONSTRAINT stock_audits_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: stock_movements stock_movements_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: stock_movements stock_movements_ingredient_id_ingredients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_ingredient_id_ingredients_id_fk FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id);


--
-- Name: stock_movements stock_movements_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: user_permissions user_permissions_permission_key_permissions_key_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_key_permissions_key_fk FOREIGN KEY (permission_key) REFERENCES public.permissions(key);


--
-- Name: user_permissions user_permissions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_branch_id_branches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict P6Ib0zO1S7R7K6u3y9Ogu34njrWbY3ewaeWAXrmihqlBT08dnj3A2kY4WpGjmkp

