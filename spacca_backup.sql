--
-- PostgreSQL database dump
--

\restrict yZYCcQ0FRmjsZlwda9revM7Xe1nbAk39DUiQ2kvg9uGjeqYJhVQoBwT3oinW9O6

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

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
    extra_cost numeric(8,4)
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
    sort_order integer DEFAULT 0 NOT NULL
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
    extra_cost numeric(8,4) DEFAULT '0'::numeric NOT NULL
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
    stock_quantity numeric(12,4) DEFAULT '0'::numeric NOT NULL,
    low_stock_threshold numeric(12,4) DEFAULT '500'::numeric NOT NULL,
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
    customer_sort_order integer DEFAULT 1 NOT NULL
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
    status text DEFAULT 'pending'::text NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    extra_cost numeric(8,4)
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
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'barista'::text NOT NULL,
    pin character varying(6),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: drink_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_categories (id, name, sort_order, is_active, created_at) FROM stdin;
1	Hot Coffee	0	t	2026-04-17 23:04:52.256353+00
5	Food/Pastry	40	t	2026-04-20 22:26:32.239454+00
6	Frappe	6	t	2026-04-21 08:39:16.11275+00
3	Cold Coffee	5	t	2026-04-17 23:04:52.26665+00
2	Turkish Coffee	2	t	2026-04-17 23:04:52.265807+00
4	Specialty	7	f	2026-04-17 23:04:52.267289+00
\.


--
-- Data for Name: drink_ingredient_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_ingredient_slots (id, drink_id, ingredient_id, ingredient_type_id, slot_label, is_required, default_option_id, is_dynamic, sort_order, created_at, updated_at, barista_sort_order, customer_sort_order, affects_cup_size, predefined_slot_id) FROM stdin;
328	23	\N	\N	Sweetner	t	\N	f	0	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	1	6	f	\N
329	23	\N	\N	Salted Caramel	t	\N	f	1	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	2	2	t	\N
330	23	\N	\N	Coffee	t	\N	f	2	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	3	1	t	\N
331	23	\N	\N	Ice Cubes	t	\N	f	3	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	4	3	t	\N
332	23	86	\N	Milk	t	38	t	4	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	1	5	\N	\N
333	23	\N	\N	Whipped Cream	t	\N	f	5	2026-04-20 10:08:12.297916+00	2026-04-20 10:08:12.297916+00	6	5	f	\N
14	6	7	\N	Chocolate Sauce	t	\N	f	2	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
341	24	\N	\N	Sweetner	t	\N	f	0	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
342	24	\N	\N	Syrup	t	\N	f	1	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
343	24	\N	\N	Sauce	t	\N	f	2	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
190	20	\N	\N	Coffee	t	\N	f	0	2026-04-19 15:42:36.505392+00	2026-04-19 15:42:36.505392+00	1	1	\N	\N
191	20	\N	\N	Milk	t	\N	t	1	2026-04-19 15:42:36.505392+00	2026-04-19 15:42:36.505392+00	1	1	\N	\N
192	20	\N	\N	Syrap	t	\N	f	2	2026-04-19 15:42:36.505392+00	2026-04-19 15:42:36.505392+00	1	1	\N	\N
193	20	\N	\N	Foam	t	\N	f	3	2026-04-19 15:42:36.505392+00	2026-04-19 15:42:36.505392+00	1	0	\N	\N
344	24	\N	\N	Ice Cubes	t	\N	f	3	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
345	24	\N	\N	Coffee	t	\N	f	4	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
346	24	86	\N	Milk	t	\N	t	5	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	\N	\N
347	24	\N	\N	Whipped Cream	t	\N	f	6	2026-04-20 10:27:41.835542+00	2026-04-20 10:27:41.835542+00	1	1	f	\N
990	25	\N	\N	Sweetner	t	\N	f	0	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	1	6	f	\N
991	25	\N	\N	Syrup	t	\N	f	1	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	2	2	t	\N
992	25	\N	\N	Coffee	t	\N	f	2	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	3	1	t	\N
993	25	\N	\N	Ice Cubes	t	\N	f	3	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	4	3	t	\N
994	25	\N	\N	Chocolate Powder	t	\N	f	4	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	5	0	t	\N
995	25	\N	\N	Milk	t	\N	t	5	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	6	4	t	\N
510	30	\N	\N	Sweetner	t	\N	f	0	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	1	6	f	6
511	30	\N	\N	Sauce	t	\N	f	1	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	2	2	t	7
512	30	\N	\N	Coffee	t	\N	f	2	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	3	1	t	3
513	30	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	4	3	\N	\N
514	30	\N	\N	Milk	t	\N	t	4	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	5	4	\N	4
515	30	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 12:15:36.601409+00	2026-04-21 12:15:36.601409+00	6	5	f	\N
996	25	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 08:38:54.015308+00	2026-04-22 08:38:54.015308+00	7	5	f	\N
1013	26	\N	\N	Coffee	t	\N	f	0	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	5	1	t	\N
1014	26	\N	\N	Sauce	t	\N	f	1	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	3	2	t	\N
1015	26	\N	\N	Syrup	t	\N	f	2	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	2	3	t	\N
5	3	1	\N	Espresso	t	2	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
7	3	5	\N	Syrup	f	15	f	2	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
12	6	1	\N	Espresso	t	2	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
1016	26	\N	\N	Cubes	t	\N	f	3	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	6	4	t	\N
15	7	1	\N	Espresso	t	2	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
17	7	5	\N	Vanilla Syrup	t	16	f	2	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
18	8	11	\N	Cold Brew	t	\N	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
19	9	1	\N	Espresso	t	2	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
21	10	12	\N	Matcha	t	30	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
26	12	1	\N	Espresso	t	2	f	0	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
28	12	5	\N	Vanilla Syrup	f	16	f	2	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
29	12	6	\N	Caramel Drizzle	f	20	f	3	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
6	3	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
1017	26	\N	\N	Milk	t	\N	t	4	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	7	5	t	\N
1018	26	\N	\N	Whipped Cream	t	\N	f	5	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	6	6	f	\N
551	32	\N	\N	Sweetner	t	\N	f	0	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	1	6	f	6
383	19	\N	\N	Coffee	t	\N	f	0	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	1	1	\N	\N
13	6	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
384	19	\N	\N	Milk	t	\N	t	1	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	2	2	\N	\N
16	7	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
385	19	\N	\N	Syrup	t	\N	f	2	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	3	3	\N	\N
386	19	\N	\N	Sauce	t	\N	f	3	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	4	4	\N	\N
27	12	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
387	19	\N	\N	Sauce Garnish	t	\N	f	4	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	5	0	\N	\N
20	9	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
22	10	13	\N	Milk	t	\N	f	1	2026-04-16 22:56:14.300655+00	2026-04-16 22:56:14.300655+00	1	1	\N	\N
35	1	\N	\N	Coffee	t	\N	f	0	2026-04-17 00:10:55.814252+00	2026-04-17 00:10:55.814252+00	1	1	\N	\N
36	1	13	\N	Milk	t	\N	f	1	2026-04-17 00:10:55.814252+00	2026-04-17 00:10:55.814252+00	1	1	\N	\N
48	13	\N	\N	Coffee	t	\N	f	0	2026-04-18 01:25:48.500517+00	2026-04-18 01:25:48.500517+00	1	1	\N	\N
49	13	\N	\N	Sauce	t	\N	f	1	2026-04-18 01:25:48.500517+00	2026-04-18 01:25:48.500517+00	1	1	\N	\N
50	13	\N	\N	Milk	t	\N	f	2	2026-04-18 01:25:48.500517+00	2026-04-18 01:25:48.500517+00	1	1	\N	\N
51	13	\N	\N	Sweetner	t	\N	f	3	2026-04-18 01:25:48.500517+00	2026-04-18 01:25:48.500517+00	1	1	\N	\N
126	17	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 12:52:50.782143+00	2026-04-19 12:52:50.782143+00	1	1	\N	\N
388	19	\N	\N	Foam	t	\N	f	5	2026-04-20 22:06:58.30182+00	2026-04-20 22:06:58.30182+00	6	6	f	\N
1019	26	\N	\N	Sweetener	t	\N	f	6	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	1	7	f	\N
1020	26	\N	\N	Powder	t	\N	f	7	2026-04-22 08:47:37.288231+00	2026-04-22 08:47:37.288231+00	8	0	\N	\N
552	32	\N	\N	Syrup	t	\N	f	1	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	2	2	\N	5
553	32	\N	\N	Coffee	t	\N	f	2	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	3	1	t	3
554	32	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	4	3	\N	\N
555	32	\N	\N	Milk	t	\N	t	4	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	5	4	\N	4
556	32	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 12:36:47.472604+00	2026-04-21 12:36:47.472604+00	6	5	f	\N
1154	38	\N	\N	Sweetner	t	\N	f	0	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	1	6	f	6
1155	38	\N	\N	Syrup	t	\N	f	1	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	2	2	\N	5
1156	38	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	3	0	\N	\N
1157	38	\N	\N	Coffee	t	\N	f	3	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	4	1	t	3
1158	38	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	5	3	t	9
1159	38	\N	\N	Milk	t	\N	t	5	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	6	4	\N	4
1160	38	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 09:55:54.930401+00	2026-04-22 09:55:54.930401+00	7	5	f	10
614	36	\N	\N	Sweetner	t	\N	f	0	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	1	6	f	6
615	36	\N	\N	Syrup	t	\N	f	1	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	2	2	\N	5
616	36	\N	\N	Coffee	t	\N	f	2	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	3	1	t	3
127	17	\N	\N	Whipped Cream	t	\N	f	1	2026-04-19 12:52:50.782143+00	2026-04-19 12:52:50.782143+00	1	1	\N	\N
138	18	\N	\N	Specialty coffee	t	\N	f	0	2026-04-19 13:23:51.851089+00	2026-04-19 13:23:51.851089+00	1	1	\N	\N
139	18	\N	\N	Coffee Type	t	\N	f	1	2026-04-19 13:23:51.851089+00	2026-04-19 13:23:51.851089+00	1	1	\N	\N
143	5	1	\N	Espresso	t	2	f	0	2026-04-19 13:55:18.654457+00	2026-04-19 13:55:18.654457+00	1	1	\N	\N
144	5	13	\N	Milk	t	\N	f	1	2026-04-19 13:55:18.654457+00	2026-04-19 13:55:18.654457+00	1	1	\N	\N
145	5	6	\N	Caramel Sauce	t	20	f	2	2026-04-19 13:55:18.654457+00	2026-04-19 13:55:18.654457+00	1	1	\N	\N
91	14	\N	\N	Coffee	t	\N	f	0	2026-04-19 10:28:46.280326+00	2026-04-19 10:28:46.280326+00	1	1	\N	\N
92	14	\N	\N	Syrup	t	\N	f	1	2026-04-19 10:28:46.280326+00	2026-04-19 10:28:46.280326+00	1	1	\N	\N
93	14	\N	\N	Milk	t	\N	f	2	2026-04-19 10:28:46.280326+00	2026-04-19 10:28:46.280326+00	1	1	\N	\N
94	14	\N	\N	Foam	t	\N	f	3	2026-04-19 10:28:46.280326+00	2026-04-19 10:28:46.280326+00	1	1	\N	\N
96	15	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 11:46:07.019209+00	2026-04-19 11:46:07.019209+00	1	1	\N	\N
101	16	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 12:17:31.448007+00	2026-04-19 12:17:31.448007+00	1	1	\N	\N
112	11	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 12:32:20.625529+00	2026-04-19 12:32:20.625529+00	1	1	\N	\N
113	11	\N	\N	Foam	t	\N	f	1	2026-04-19 12:32:20.625529+00	2026-04-19 12:32:20.625529+00	1	1	\N	\N
1489	54	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	1	7	f	6
1140	35	\N	\N	Sweetner	t	\N	f	0	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	1	6	f	6
1141	35	\N	\N	Sauce	t	\N	f	1	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	2	2	t	7
1142	35	\N	\N	Powder	t	\N	f	2	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	3	0	t	8
1143	35	\N	\N	Coffee	t	\N	f	3	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	4	1	t	3
1144	35	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	5	3	\N	\N
1145	35	\N	\N	Milk	t	\N	t	5	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	6	4	t	4
1146	35	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 09:47:17.791323+00	2026-04-22 09:47:17.791323+00	7	5	f	\N
1490	54	\N	\N	Syrup	t	\N	f	1	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	2	3	\N	5
1491	54	\N	\N	Sauce	t	\N	f	2	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	3	2	t	7
1492	54	\N	\N	Powder	t	\N	f	3	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	4	0	t	8
1493	54	\N	\N	Coffee	t	\N	f	4	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	5	1	t	3
1494	54	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	6	4	t	9
1495	54	\N	\N	Milk	t	\N	t	6	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	7	5	\N	4
1496	54	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	8	6	f	10
1497	54	\N	\N	Garnish	t	\N	f	8	2026-04-22 11:52:27.693251+00	2026-04-22 11:52:27.693251+00	9	0	\N	\N
1514	55	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	1	7	f	6
1515	55	\N	\N	Syrup	t	\N	f	1	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	2	3	\N	5
1516	55	\N	\N	Sauce	t	\N	f	2	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	3	2	t	7
1517	55	\N	\N	Powder	t	\N	f	3	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	4	0	t	8
1289	45	\N	\N	Syrup	t	\N	f	0	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	2	2	\N	5
1290	45	\N	\N	Coffee	t	\N	f	1	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	4	1	t	3
1291	45	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	5	3	t	9
1292	45	\N	\N	Milk	t	\N	t	3	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	6	4	\N	4
1293	45	\N	\N	Powder	t	\N	f	4	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	3	0	t	8
1294	45	\N	\N	Sweetner	t	\N	f	5	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	1	6	f	6
1295	45	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:02:44.114371+00	2026-04-22 11:02:44.114371+00	7	5	f	10
1303	47	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	1	6	f	6
1304	47	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	3	2	t	7
1305	47	\N	\N	Powder	t	\N	f	2	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	4	0	t	8
1306	47	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	5	1	t	3
1307	47	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	6	3	t	9
393	22	\N	\N	Coffee	t	\N	f	0	2026-04-21 09:57:14.576745+00	2026-04-21 09:57:14.576745+00	1	1	\N	\N
394	22	86	\N	Milk Type	t	38	t	1	2026-04-21 09:57:14.576745+00	2026-04-21 09:57:14.576745+00	1	1	\N	\N
395	22	\N	\N	Syrup	t	\N	f	2	2026-04-21 09:57:14.576745+00	2026-04-21 09:57:14.576745+00	2	2	\N	\N
396	22	\N	\N	Whipped Cream	t	\N	f	3	2026-04-21 09:57:14.576745+00	2026-04-21 09:57:14.576745+00	3	3	\N	\N
397	22	\N	\N	Ices Cubes	t	\N	f	4	2026-04-21 09:57:14.576745+00	2026-04-21 09:57:14.576745+00	1	1	\N	\N
1308	47	\N	\N	Milk	t	\N	t	5	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	7	4	\N	4
1309	47	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:05:01.475559+00	2026-04-22 11:05:01.475559+00	8	5	f	10
420	28	\N	\N	Sweetner	t	\N	f	0	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	1	6	f	\N
421	28	\N	\N	Syrap	t	\N	f	1	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	2	2	t	\N
422	28	\N	\N	Coffee	t	\N	f	2	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	3	1	\N	\N
423	28	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	4	3	\N	\N
424	28	\N	\N	Milk	t	\N	t	4	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	5	4	\N	\N
425	28	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 11:35:21.504249+00	2026-04-21 11:35:21.504249+00	6	5	f	\N
1105	34	\N	\N	Sweetner	t	\N	f	0	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	1	6	f	6
1106	34	\N	\N	Syrup	t	\N	f	1	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	2	3	\N	5
1107	34	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	3	0	\N	\N
583	33	\N	\N	Sweetner	t	\N	f	0	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	1	6	f	6
584	33	\N	\N	Sauce	t	\N	f	1	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	2	2	t	7
585	33	\N	\N	Coffee	t	\N	f	2	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	3	1	t	3
586	33	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	4	3	\N	\N
587	33	\N	\N	Milk	t	\N	t	4	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	5	4	\N	4
588	33	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 12:51:44.903355+00	2026-04-21 12:51:44.903355+00	6	5	f	\N
1108	34	\N	\N	Coffee	t	\N	f	3	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	4	1	t	3
1109	34	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	5	4	\N	\N
1110	34	\N	\N	Milk	t	\N	t	5	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	6	5	\N	4
1111	34	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 09:39:19.478238+00	2026-04-22 09:39:19.478238+00	7	6	f	10
617	36	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	4	3	\N	\N
618	36	\N	\N	Milk	t	\N	t	4	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	5	4	\N	4
619	36	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 13:22:20.447576+00	2026-04-21 13:22:20.447576+00	6	5	\N	\N
627	37	\N	\N	Sweetner	t	\N	f	0	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	1	7	f	6
628	37	\N	\N	Sauce	t	\N	f	1	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	2	2	t	7
629	37	\N	\N	Syrup	t	\N	f	2	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	3	3	\N	5
630	37	\N	\N	Coffee	t	\N	f	3	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	4	1	t	3
631	37	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	5	4	t	9
632	37	\N	\N	Milk	t	\N	t	5	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	6	5	\N	4
633	37	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 13:41:46.928413+00	2026-04-21 13:41:46.928413+00	7	6	f	10
640	39	\N	\N	Sweetner	t	\N	f	0	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	1	6	f	6
641	39	\N	\N	Sauce	t	\N	f	1	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	2	2	t	7
642	39	\N	\N	Coffee	t	\N	f	2	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	3	1	t	3
643	39	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	4	3	t	9
644	39	\N	\N	Milk	t	\N	t	4	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	5	4	\N	4
645	39	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 13:49:25.408793+00	2026-04-21 13:49:25.408793+00	6	5	f	10
652	40	\N	\N	Sweetner	t	\N	f	0	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	1	6	f	6
653	40	\N	\N	Sauce	t	\N	f	1	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	2	2	t	7
654	40	\N	\N	Coffee	t	\N	f	2	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	3	1	t	3
655	40	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	4	3	t	9
656	40	\N	\N	Milk	t	\N	t	4	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	5	4	\N	4
657	40	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 14:08:03.66932+00	2026-04-21 14:08:03.66932+00	6	5	f	10
678	41	\N	\N	Sweetner	t	\N	f	0	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	1	7	f	6
679	41	\N	\N	Sauce	t	\N	f	1	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	2	2	t	7
680	41	\N	\N	Sauce	t	\N	f	2	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	3	3	t	7
681	41	\N	\N	Coffee	t	\N	f	3	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	4	1	t	3
682	41	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	5	4	t	9
683	41	\N	\N	Milk	t	\N	t	5	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	6	5	\N	4
684	41	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 14:22:01.981071+00	2026-04-21 14:22:01.981071+00	7	6	f	10
1518	55	\N	\N	Coffee	t	\N	f	4	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	5	1	t	3
1519	55	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	6	4	t	9
1520	55	\N	\N	Milk	t	\N	t	6	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	7	5	\N	4
1521	55	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 11:55:44.318929+00	2026-04-22 11:55:44.318929+00	8	6	f	10
1401	50	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	1	7	f	6
1402	50	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	3	2	t	7
1403	50	\N	\N	Powder	t	\N	f	2	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	7	0	t	8
1404	50	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	5	1	t	3
1405	50	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	6	3	t	9
1406	50	\N	\N	Milk	t	\N	t	5	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	7	4	\N	4
1407	50	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:37:16.761328+00	2026-04-22 11:37:16.761328+00	8	5	f	10
699	42	\N	\N	Sweetner	t	\N	f	0	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	6	6	f	6
700	42	\N	\N	Sauce	t	\N	f	1	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	2	2	t	7
701	42	\N	\N	Coffee	t	\N	f	2	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	3	1	t	3
702	42	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	4	3	t	9
703	42	\N	\N	Milk	t	\N	t	4	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	5	4	\N	4
704	42	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 14:33:06.872195+00	2026-04-21 14:33:06.872195+00	6	5	f	10
1538	57	\N	\N	Sauce	t	\N	f	0	2026-04-22 12:02:25.950591+00	2026-04-22 12:02:25.950591+00	1	1	t	7
1539	57	\N	\N	Ice Cubes	t	\N	f	1	2026-04-22 12:02:25.950591+00	2026-04-22 12:02:25.950591+00	2	2	t	9
1540	57	\N	\N	Mango	t	\N	t	2	2026-04-22 12:02:25.950591+00	2026-04-22 12:02:25.950591+00	3	3	\N	\N
1541	57	\N	\N	Lemon Slices	t	\N	f	3	2026-04-22 12:02:25.950591+00	2026-04-22 12:02:25.950591+00	4	4	t	\N
720	44	\N	\N	Sweetner	t	\N	f	0	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	1	7	f	6
721	44	\N	\N	Syrup	t	\N	f	1	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	2	2	\N	5
722	44	\N	\N	Sauce	t	\N	f	2	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	3	3	t	7
723	44	\N	\N	Coffee	t	\N	f	3	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	4	1	t	3
724	44	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	5	4	t	9
725	44	\N	\N	Milk	t	\N	t	5	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	6	5	\N	4
726	44	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 14:59:26.885581+00	2026-04-21 14:59:26.885581+00	7	6	f	10
1570	58	\N	\N	Sauce	t	\N	f	0	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	1	1	t	7
1571	58	\N	\N	Sauce	t	\N	f	1	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	2	2	t	7
1572	58	\N	\N	Sauce	t	\N	f	2	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	4	4	\N	\N
1573	58	\N	\N	Powder	t	\N	f	3	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	4	0	t	\N
1574	58	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	5	5	t	9
1575	58	\N	\N	Milk	t	\N	t	5	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	6	6	\N	4
1576	58	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 12:16:25.196403+00	2026-04-22 12:16:25.196403+00	7	7	f	10
740	46	\N	\N	Sweetner	t	\N	f	0	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	1	6	f	6
741	46	\N	\N	Sauce	t	\N	f	1	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	2	2	t	7
742	46	\N	\N	Coffee	t	\N	f	2	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	3	1	t	3
743	46	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	4	3	t	9
744	46	\N	\N	Milk	t	\N	t	4	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	5	4	\N	4
745	46	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 15:08:55.89762+00	2026-04-21 15:08:55.89762+00	6	5	f	10
764	49	\N	\N	Sweetner	t	\N	f	0	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	1	6	f	6
765	49	\N	\N	Sauce	t	\N	f	1	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	3	2	t	7
766	49	\N	\N	Powder	t	\N	f	2	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	4	0	t	8
767	49	\N	\N	Coffee	t	\N	f	3	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	5	1	t	3
768	49	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	6	3	t	9
769	49	\N	\N	Milk	t	\N	t	5	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	7	4	\N	4
770	49	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 15:27:11.764443+00	2026-04-21 15:27:11.764443+00	8	5	f	10
777	48	\N	\N	Matcha	t	\N	f	0	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	1	0	\N	\N
778	48	\N	\N	Sweetner	t	\N	f	1	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	2	2	f	6
779	48	\N	\N	Sauce	t	\N	f	2	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	3	1	\N	\N
780	48	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	4	3	t	9
781	48	\N	\N	Milk	t	\N	t	4	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	5	4	\N	4
782	48	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 15:48:00.864026+00	2026-04-21 15:48:00.864026+00	6	5	f	10
790	51	\N	\N	Sweetner	t	\N	f	0	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	2	5	f	6
791	51	\N	\N	Sauce	t	\N	f	1	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	3	1	t	7
792	51	\N	\N	Powder	t	\N	f	2	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	1	0	t	8
793	51	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	4	2	t	9
794	51	\N	\N	Milk	t	\N	t	4	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	5	3	\N	4
795	51	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 16:04:12.262975+00	2026-04-21 16:04:12.262975+00	6	4	f	10
1238	4	\N	\N	Coffee	t	\N	f	0	2026-04-22 10:42:13.569018+00	2026-04-22 10:42:13.569018+00	1	1	\N	\N
1239	4	\N	\N	Base	t	\N	t	1	2026-04-22 10:42:13.569018+00	2026-04-22 10:42:13.569018+00	1	0	\N	\N
1366	27	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	1	6	f	6
1367	27	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	2	2	t	7
1368	27	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	5	3	t	9
1369	27	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	4	1	t	3
1370	27	\N	\N	Powder	t	\N	f	4	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	3	0	t	8
1371	27	\N	\N	Milk	t	\N	t	5	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	6	4	\N	4
1372	27	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:15:07.350153+00	2026-04-22 11:15:07.350153+00	7	5	f	10
930	52	\N	\N	Powder	t	\N	f	0	2026-04-22 08:27:37.378413+00	2026-04-22 08:27:37.378413+00	1	0	t	8
931	52	\N	\N	Sweetner	t	\N	f	1	2026-04-22 08:27:37.378413+00	2026-04-22 08:27:37.378413+00	1	1	f	6
932	52	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 08:27:37.378413+00	2026-04-22 08:27:37.378413+00	3	3	t	9
1522	56	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	1	7	f	6
1523	56	\N	\N	Syrup	t	\N	f	1	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	2	3	\N	5
933	52	\N	\N	Milk	t	\N	t	3	2026-04-22 08:27:37.378413+00	2026-04-22 08:27:37.378413+00	4	4	\N	4
934	52	\N	\N	Whipped Cream	t	\N	f	4	2026-04-22 08:27:37.378413+00	2026-04-22 08:27:37.378413+00	5	5	f	10
1524	56	\N	\N	Sauce	t	\N	f	2	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	3	2	t	7
1525	56	\N	\N	Powder	t	\N	f	3	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	4	0	t	8
1526	56	\N	\N	Coffee	t	\N	f	4	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	5	1	t	3
1527	56	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	6	4	t	9
1528	56	\N	\N	Milk	t	\N	t	6	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	7	5	\N	4
1529	56	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 11:57:11.632587+00	2026-04-22 11:57:11.632587+00	8	6	f	10
1070	31	\N	\N	Sweetner	t	\N	f	0	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	1	6	f	6
1071	31	\N	\N	Sauce	t	\N	f	1	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	2	2	t	7
1072	31	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	3	0	t	\N
1073	31	\N	\N	Coffee	t	\N	f	3	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	4	1	t	3
1074	31	\N	\N	Ice cubes	t	\N	f	4	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	5	3	\N	\N
1075	31	\N	\N	Milk	t	\N	t	5	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	6	4	\N	4
1076	31	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 09:36:09.837697+00	2026-04-22 09:36:09.837697+00	7	5	f	\N
1456	53	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	1	6	f	6
1457	53	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	2	2	t	7
1458	53	\N	\N	Sauce	t	\N	f	2	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	3	3	t	7
1459	53	\N	\N	Powder	t	\N	f	3	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	5	0	t	8
1460	53	\N	\N	Coffee	t	\N	f	4	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	4	1	t	3
1461	53	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	6	4	t	9
1216	43	\N	\N	Sweetner	t	\N	f	0	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	1	6	f	6
1217	43	\N	\N	Sauce	t	\N	f	1	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	2	2	t	7
1462	53	\N	\N	Milk	t	\N	t	6	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	7	5	t	4
1463	53	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 11:47:33.259972+00	2026-04-22 11:47:33.259972+00	8	6	f	10
952	29	\N	\N	Vanilla Powder	t	\N	f	0	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	4	0	\N	\N
953	29	\N	\N	Coffee	t	\N	f	1	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	5	1	\N	\N
954	29	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	6	4	\N	\N
955	29	\N	\N	Milk	t	\N	t	3	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	7	5	\N	4
956	29	\N	\N	Whipped Cream	t	\N	f	4	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	8	6	f	\N
957	29	\N	\N	Sweetner	t	\N	f	5	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	1	7	f	6
958	29	\N	\N	Syrup	t	\N	f	6	2026-04-22 08:32:31.851147+00	2026-04-22 08:32:31.851147+00	2	3	\N	5
1218	43	\N	\N	Powder	t	\N	f	2	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	3	0	t	8
1219	43	\N	\N	Coffee	t	\N	f	3	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	4	1	t	3
1220	43	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	5	3	t	9
1221	43	\N	\N	Milk	t	\N	t	5	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	6	4	\N	4
1222	43	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	7	5	f	10
1223	43	\N	\N	Almond Beans	t	\N	f	7	2026-04-22 10:09:40.36141+00	2026-04-22 10:09:40.36141+00	8	0	t	\N
977	21	\N	\N	Coffee	t	\N	f	0	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	1	1	t	3
978	21	\N	\N	Milk	t	\N	t	1	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	1	1	\N	\N
979	21	\N	\N	Syrup	t	\N	f	2	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	1	1	\N	\N
980	21	\N	\N	Ice Cubes	t	\N	f	3	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	1	1	\N	\N
981	21	\N	\N	Foam	t	\N	f	4	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	20	120	\N	\N
982	21	\N	\N	Whipped Cream	t	\N	f	5	2026-04-22 08:36:57.126683+00	2026-04-22 08:36:57.126683+00	1	1	\N	\N
\.


--
-- Data for Name: drink_slot_type_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_slot_type_options (id, slot_id, ingredient_type_id, is_default, sort_order, processed_qty, produced_qty, unit, extra_cost) FROM stdin;
3	35	10	t	0	\N	\N	\N	\N
4	35	11	f	1	\N	\N	\N	\N
5	35	12	f	2	\N	\N	\N	\N
34	48	10	t	0	\N	\N	\N	\N
35	48	11	f	1	\N	\N	\N	\N
36	48	12	f	2	\N	\N	\N	\N
37	49	19	t	0	\N	\N	\N	\N
38	49	65	f	1	\N	\N	\N	\N
39	50	14	t	0	\N	\N	\N	\N
40	50	15	f	1	\N	\N	\N	\N
41	50	16	f	2	\N	\N	\N	\N
42	51	21	t	0	\N	\N	\N	\N
43	51	40	f	1	\N	\N	\N	\N
1316	551	40	f	0	\N	\N	\N	\N
1317	551	83	f	1	\N	\N	\N	\N
198	96	12	t	0	\N	\N	\N	\N
199	96	11	f	1	\N	\N	\N	\N
1318	551	84	f	2	\N	\N	\N	\N
1319	551	21	f	3	\N	\N	\N	\N
869	393	11	t	0	\N	\N	\N	\N
870	393	12	f	1	\N	\N	\N	\N
871	395	17	f	0	\N	\N	\N	\N
1320	551	73	t	4	\N	\N	\N	\N
1321	552	20	t	0	\N	\N	\N	\N
872	395	20	f	1	\N	\N	\N	\N
208	101	11	t	0	\N	\N	\N	\N
209	101	12	f	1	\N	\N	\N	\N
210	101	68	f	2	\N	\N	\N	\N
873	395	62	f	2	\N	\N	\N	\N
874	395	73	t	3	\N	\N	\N	\N
875	396	22	f	0	\N	\N	\N	\N
876	396	73	t	1	\N	\N	\N	\N
877	397	91	t	0	\N	\N	\N	\N
1322	553	11	t	0	\N	\N	\N	\N
1323	553	12	f	1	\N	\N	\N	\N
1324	554	91	t	0	\N	\N	\N	\N
1325	555	15	f	0	\N	\N	\N	\N
1326	555	16	f	1	\N	\N	\N	\N
1327	555	79	f	2	\N	\N	\N	\N
1328	555	80	f	3	\N	\N	\N	\N
1329	555	81	f	4	\N	\N	\N	\N
1330	555	82	f	5	\N	\N	\N	\N
1331	555	14	t	6	\N	\N	\N	\N
231	112	12	t	0	\N	\N	\N	\N
232	112	11	f	1	\N	\N	\N	\N
233	113	86	t	0	\N	\N	\N	\N
234	113	87	f	1	\N	\N	\N	\N
235	113	88	f	2	\N	\N	\N	\N
406	190	12	t	0	\N	\N	\N	\N
407	190	11	f	1	\N	\N	\N	\N
408	191	14	t	0	\N	\N	\N	\N
409	191	82	f	1	\N	\N	\N	\N
410	191	81	f	2	\N	\N	\N	\N
411	191	15	f	3	\N	\N	\N	\N
412	191	79	f	4	\N	\N	\N	\N
413	191	80	f	5	\N	\N	\N	\N
414	191	16	f	6	\N	\N	\N	\N
415	192	17	f	0	\N	\N	\N	\N
416	192	20	f	1	\N	\N	\N	\N
417	192	62	f	2	\N	\N	\N	\N
418	192	73	t	3	\N	\N	\N	\N
419	193	74	t	0	\N	\N	\N	\N
255	126	11	f	0	\N	\N	\N	\N
179	91	12	f	0	\N	\N	\N	\N
180	91	11	t	1	\N	\N	\N	\N
181	92	17	f	0	\N	\N	\N	\N
182	92	20	f	1	\N	\N	\N	\N
183	92	62	f	2	\N	\N	\N	\N
184	92	73	t	3	\N	\N	\N	\N
256	126	12	t	1	\N	\N	\N	\N
257	127	22	t	0	\N	\N	\N	\N
420	193	75	f	1	\N	\N	\N	\N
421	193	76	f	2	\N	\N	\N	\N
185	93	14	t	0	\N	\N	\N	\N
186	93	16	f	1	\N	\N	\N	\N
187	93	15	f	2	\N	\N	\N	\N
188	93	80	f	3	\N	\N	\N	\N
189	93	82	f	4	\N	\N	\N	\N
190	93	81	f	5	\N	\N	\N	\N
191	93	79	f	6	\N	\N	\N	\N
192	94	74	f	0	\N	\N	\N	\N
193	94	75	f	1	\N	\N	\N	\N
194	94	76	t	2	\N	\N	\N	\N
195	94	73	f	3	\N	\N	\N	\N
703	328	21	f	0	\N	\N	\N	\N
273	138	89	t	0	\N	\N	\N	\N
274	138	90	f	1	\N	\N	\N	\N
275	139	12	t	0	\N	\N	\N	\N
276	139	11	f	1	\N	\N	\N	\N
704	328	84	f	1	\N	\N	\N	\N
705	328	83	f	2	\N	\N	\N	\N
706	328	40	f	3	\N	\N	\N	\N
3024	1105	40	f	0	\N	\N	\N	\N
3025	1105	83	f	1	\N	\N	\N	\N
3026	1105	84	f	2	\N	\N	\N	\N
3027	1105	21	f	3	\N	\N	\N	\N
3028	1105	73	t	4	\N	\N	\N	\N
3029	1106	17	f	0	\N	\N	\N	\N
3030	1106	20	f	1	\N	\N	\N	\N
3031	1106	62	f	2	\N	\N	\N	\N
3032	1106	73	t	3	\N	\N	\N	\N
3033	1107	63	t	0	\N	\N	\N	\N
3034	1108	11	t	0	\N	\N	\N	\N
3035	1108	12	f	1	\N	\N	\N	\N
3036	1109	91	t	0	\N	\N	\N	\N
3037	1110	15	f	0	\N	\N	\N	\N
1332	556	22	f	0	\N	\N	\N	\N
1333	556	73	t	1	\N	\N	\N	\N
3038	1110	16	f	1	\N	\N	\N	\N
3039	1110	79	f	2	\N	\N	\N	\N
3040	1110	80	f	3	\N	\N	\N	\N
707	328	73	t	4	\N	\N	\N	\N
708	329	59	t	0	\N	\N	\N	\N
709	330	11	t	0	\N	\N	\N	\N
710	330	12	f	1	\N	\N	\N	\N
711	331	91	t	0	\N	\N	\N	\N
712	333	22	f	0	\N	\N	\N	\N
713	333	73	t	1	\N	\N	\N	\N
726	341	21	f	0	\N	\N	\N	\N
727	341	83	f	1	\N	\N	\N	\N
728	341	40	f	2	\N	\N	\N	\N
729	341	84	f	3	\N	\N	\N	\N
730	341	73	t	4	\N	\N	\N	\N
731	342	62	t	0	\N	\N	\N	\N
732	343	19	t	0	\N	\N	\N	\N
733	344	91	t	0	\N	\N	\N	\N
734	345	11	t	0	\N	\N	\N	\N
735	345	12	f	1	\N	\N	\N	\N
736	347	22	f	0	\N	\N	\N	\N
737	347	73	t	1	\N	\N	\N	\N
3594	1303	40	f	0	\N	\N	\N	\N
3595	1303	83	f	1	\N	\N	\N	\N
3596	1303	84	f	2	\N	\N	\N	\N
3162	1154	40	f	0	\N	\N	\N	\N
3163	1154	83	f	1	\N	\N	\N	\N
3164	1154	84	f	2	\N	\N	\N	\N
3165	1154	21	f	3	\N	\N	\N	\N
3166	1154	73	t	4	\N	\N	\N	\N
3167	1155	17	f	0	\N	\N	\N	\N
3168	1155	20	t	1	\N	\N	\N	\N
3169	1156	63	t	0	\N	\N	\N	\N
3170	1157	11	t	0	\N	\N	\N	\N
3171	1157	12	f	1	\N	\N	\N	\N
3172	1158	91	t	0	\N	\N	\N	\N
3173	1159	15	f	0	\N	\N	\N	\N
3174	1159	16	f	1	\N	\N	\N	\N
3175	1159	79	f	2	\N	\N	\N	\N
3176	1159	80	f	3	\N	\N	\N	\N
3177	1159	81	f	4	\N	\N	\N	\N
3178	1159	82	f	5	\N	\N	\N	\N
3179	1159	14	t	6	\N	\N	\N	\N
3180	1160	22	f	0	\N	\N	\N	\N
3181	1160	73	t	1	\N	\N	\N	\N
3597	1303	21	f	3	\N	\N	\N	\N
3598	1303	73	t	4	\N	\N	\N	\N
3041	1110	81	f	4	\N	\N	\N	\N
3042	1110	82	f	5	\N	\N	\N	\N
3043	1110	14	t	6	\N	\N	\N	\N
3044	1111	22	f	0	\N	\N	\N	\N
3045	1111	73	t	1	\N	\N	\N	\N
3599	1304	59	t	0	\N	\N	\N	\N
3600	1305	63	t	0	\N	\N	\N	\N
3601	1306	11	t	0	\N	\N	\N	\N
3602	1306	12	f	1	\N	\N	\N	\N
3603	1307	91	t	0	\N	\N	\N	\N
3604	1308	15	f	0	\N	\N	\N	\N
3605	1308	16	f	1	\N	\N	\N	\N
3606	1308	79	f	2	\N	\N	\N	\N
3607	1308	80	f	3	\N	\N	\N	\N
3608	1308	81	f	4	\N	\N	\N	\N
3609	1308	82	f	5	\N	\N	\N	\N
3610	1308	14	t	6	\N	\N	\N	\N
3611	1309	22	f	0	\N	\N	\N	\N
3612	1309	73	t	1	\N	\N	\N	\N
848	383	11	t	0	\N	\N	\N	\N
849	383	12	f	1	\N	\N	\N	\N
850	384	14	t	0	\N	\N	\N	\N
851	384	81	f	1	\N	\N	\N	\N
852	384	79	f	2	\N	\N	\N	\N
853	384	16	f	3	\N	\N	\N	\N
854	384	80	f	4	\N	\N	\N	\N
855	384	82	f	5	\N	\N	\N	\N
856	384	15	f	6	\N	\N	\N	\N
857	385	17	t	0	\N	\N	\N	\N
858	386	18	t	0	\N	\N	\N	\N
859	387	18	t	0	\N	\N	\N	\N
860	388	74	f	0	\N	\N	\N	\N
861	388	75	t	1	\N	\N	\N	\N
862	388	76	f	2	\N	\N	\N	\N
4024	1456	40	f	0	\N	\N	\N	\N
940	420	21	f	0	\N	\N	\N	\N
941	420	40	f	1	\N	\N	\N	\N
942	420	84	f	2	\N	\N	\N	\N
943	420	83	f	3	\N	\N	\N	\N
944	420	73	t	4	\N	\N	\N	\N
945	421	20	t	0	\N	\N	\N	\N
946	421	17	f	1	\N	\N	\N	\N
947	421	62	f	2	\N	\N	\N	\N
948	422	11	t	0	\N	\N	\N	\N
949	422	12	f	1	\N	\N	\N	\N
950	423	91	t	0	\N	\N	\N	\N
951	424	14	t	0	\N	\N	\N	\N
952	424	79	f	1	\N	\N	\N	\N
953	424	47	f	2	\N	\N	\N	\N
954	424	16	f	3	\N	\N	\N	\N
955	424	15	f	4	\N	\N	\N	\N
956	424	80	f	5	\N	\N	\N	\N
957	424	82	f	6	\N	\N	\N	\N
958	425	22	f	0	\N	\N	\N	\N
959	425	73	t	1	\N	\N	\N	\N
4025	1456	83	f	1	\N	\N	\N	\N
4026	1456	84	f	2	\N	\N	\N	\N
4027	1456	21	f	3	\N	\N	\N	\N
4028	1456	73	t	4	\N	\N	\N	\N
4029	1457	44	t	0	\N	\N	\N	\N
4030	1458	35	t	0	\N	\N	\N	\N
4031	1459	34	t	0	\N	\N	\N	\N
4032	1460	11	f	0	\N	\N	\N	\N
4033	1460	12	f	1	\N	\N	\N	\N
4034	1461	91	t	0	\N	\N	\N	\N
4035	1462	15	f	0	\N	\N	\N	\N
4036	1462	16	f	1	\N	\N	\N	\N
4037	1462	79	f	2	\N	\N	\N	\N
4038	1462	80	f	3	\N	\N	\N	\N
4039	1462	81	f	4	\N	\N	\N	\N
4040	1462	82	f	5	\N	\N	\N	\N
4041	1462	14	t	6	\N	\N	\N	\N
4042	1463	22	f	0	\N	\N	\N	\N
4043	1463	73	t	1	\N	\N	\N	\N
4178	1514	40	f	0	\N	\N	\N	\N
4179	1514	83	f	1	\N	\N	\N	\N
4180	1514	84	f	2	\N	\N	\N	\N
4181	1514	21	f	3	\N	\N	\N	\N
4182	1514	73	t	4	\N	\N	\N	\N
4183	1515	62	t	0	\N	\N	\N	\N
4184	1516	19	t	0	\N	\N	\N	\N
4185	1517	63	f	0	\N	\N	\N	\N
4186	1518	11	t	0	\N	\N	\N	\N
4187	1518	12	f	1	\N	\N	\N	\N
4188	1519	91	t	0	\N	\N	\N	\N
4189	1520	15	f	0	\N	\N	\N	\N
4190	1520	16	f	1	\N	\N	\N	\N
4191	1520	79	f	2	\N	\N	\N	\N
4192	1520	80	f	3	\N	\N	\N	\N
4193	1520	81	f	4	\N	\N	\N	\N
4194	1520	82	f	5	\N	\N	\N	\N
4195	1520	14	t	6	\N	\N	\N	\N
4196	1521	22	f	0	\N	\N	\N	\N
4197	1521	73	t	1	\N	\N	\N	\N
1181	510	40	f	0	\N	\N	\N	\N
1182	510	83	f	1	\N	\N	\N	\N
1183	510	84	f	2	\N	\N	\N	\N
1184	510	21	f	3	\N	\N	\N	\N
1185	510	73	t	4	\N	\N	\N	\N
1186	511	56	t	0	\N	\N	\N	\N
1187	512	11	t	0	\N	\N	\N	\N
1188	512	12	f	1	\N	\N	\N	\N
1189	513	91	t	0	\N	\N	\N	\N
1190	514	15	f	0	\N	\N	\N	\N
1191	514	16	f	1	\N	\N	\N	\N
1192	514	79	f	2	\N	\N	\N	\N
1193	514	80	f	3	\N	\N	\N	\N
1194	514	81	f	4	\N	\N	\N	\N
1195	514	82	f	5	\N	\N	\N	\N
1196	514	14	t	6	\N	\N	\N	\N
1197	514	47	f	7	\N	\N	\N	\N
1198	514	35	f	8	\N	\N	\N	\N
1199	515	22	f	0	\N	\N	\N	\N
1200	515	73	t	1	\N	\N	\N	\N
3392	1238	12	t	0	\N	\N	\N	\N
3393	1238	11	f	1	\N	\N	\N	\N
1556	627	40	f	0	\N	\N	\N	\N
1557	627	83	f	1	\N	\N	\N	\N
1558	627	84	f	2	\N	\N	\N	\N
1559	627	21	f	3	\N	\N	\N	\N
1560	627	73	t	4	\N	\N	\N	\N
1561	628	59	t	0	\N	\N	\N	\N
1562	629	17	t	0	\N	\N	\N	\N
1563	630	11	t	0	\N	\N	\N	\N
1564	630	12	f	1	\N	\N	\N	\N
1565	631	91	t	0	\N	\N	\N	\N
1566	632	15	f	0	\N	\N	\N	\N
1567	632	16	f	1	\N	\N	\N	\N
1568	632	79	f	2	\N	\N	\N	\N
1569	632	80	f	3	\N	\N	\N	\N
1570	632	81	f	4	\N	\N	\N	\N
1571	632	82	f	5	\N	\N	\N	\N
1572	632	14	t	6	\N	\N	\N	\N
1573	633	22	f	0	\N	\N	\N	\N
1574	633	73	t	1	\N	\N	\N	\N
3394	1239	85	t	0	\N	\N	\N	\N
4229	1538	28	t	0	\N	\N	\N	\N
4230	1539	91	t	0	\N	\N	\N	\N
4231	1540	45	t	0	\N	\N	\N	\N
4232	1541	72	t	0	\N	\N	\N	\N
1593	640	40	f	0	\N	\N	\N	\N
1594	640	83	f	1	\N	\N	\N	\N
1595	640	84	f	2	\N	\N	\N	\N
1596	640	21	f	3	\N	\N	\N	\N
1597	640	73	t	4	\N	\N	\N	\N
1598	641	56	t	0	\N	\N	\N	\N
1599	642	11	t	0	\N	\N	\N	\N
1600	642	12	f	1	\N	\N	\N	\N
1601	643	91	t	0	\N	\N	\N	\N
1602	644	15	f	0	\N	\N	\N	\N
1603	644	16	f	1	\N	\N	\N	\N
1604	644	79	f	2	\N	\N	\N	\N
1605	644	80	f	3	\N	\N	\N	\N
1606	644	81	f	4	\N	\N	\N	\N
1607	644	82	f	5	\N	\N	\N	\N
1608	644	14	t	6	\N	\N	\N	\N
1609	645	22	f	0	\N	\N	\N	\N
1610	645	73	t	1	\N	\N	\N	\N
1416	583	40	f	0	\N	\N	\N	\N
1417	583	83	f	1	\N	\N	\N	\N
1418	583	84	f	2	\N	\N	\N	\N
1419	583	21	f	3	\N	\N	\N	\N
1420	583	73	t	4	\N	\N	\N	\N
1421	584	27	t	0	\N	\N	\N	\N
1422	585	11	t	0	\N	\N	\N	\N
1423	585	12	f	1	\N	\N	\N	\N
1424	586	91	t	0	\N	\N	\N	\N
1425	587	15	f	0	\N	\N	\N	\N
1426	587	16	f	1	\N	\N	\N	\N
1427	587	79	f	2	\N	\N	\N	\N
1428	587	80	f	3	\N	\N	\N	\N
1429	587	82	f	4	\N	\N	\N	\N
1430	587	47	f	5	\N	\N	\N	\N
1431	587	14	t	6	\N	\N	\N	\N
1432	588	22	f	0	\N	\N	\N	\N
1433	588	73	t	1	\N	\N	\N	\N
4198	1522	40	f	0	\N	\N	\N	\N
4199	1522	83	f	1	\N	\N	\N	\N
4200	1522	84	f	2	\N	\N	\N	\N
4201	1522	21	f	3	\N	\N	\N	\N
4202	1522	73	t	4	\N	\N	\N	\N
4203	1523	17	f	0	\N	\N	\N	\N
4204	1523	20	f	1	\N	\N	\N	\N
4205	1523	62	f	2	\N	\N	\N	\N
4206	1523	73	t	3	\N	\N	\N	\N
4207	1524	19	t	0	\N	\N	\N	\N
4208	1525	63	f	0	\N	\N	\N	\N
4209	1526	11	t	0	\N	\N	\N	\N
4210	1526	12	f	1	\N	\N	\N	\N
4211	1527	91	t	0	\N	\N	\N	\N
4212	1528	15	f	0	\N	\N	\N	\N
4213	1528	16	f	1	\N	\N	\N	\N
1629	652	40	f	0	\N	\N	\N	\N
1630	652	83	f	1	\N	\N	\N	\N
1631	652	84	f	2	\N	\N	\N	\N
1632	652	21	f	3	\N	\N	\N	\N
1633	652	73	t	4	\N	\N	\N	\N
1634	653	35	t	0	\N	\N	\N	\N
1635	654	11	t	0	\N	\N	\N	\N
1636	654	12	f	1	\N	\N	\N	\N
1637	655	91	t	0	\N	\N	\N	\N
1638	656	15	f	0	\N	\N	\N	\N
1639	656	16	f	1	\N	\N	\N	\N
1640	656	79	f	2	\N	\N	\N	\N
1641	656	80	f	3	\N	\N	\N	\N
1642	656	81	f	4	\N	\N	\N	\N
1643	656	82	f	5	\N	\N	\N	\N
1644	656	14	t	6	\N	\N	\N	\N
4214	1528	79	f	2	\N	\N	\N	\N
4215	1528	80	f	3	\N	\N	\N	\N
4216	1528	81	f	4	\N	\N	\N	\N
4217	1528	82	f	5	\N	\N	\N	\N
4218	1528	14	t	6	\N	\N	\N	\N
4219	1529	22	f	0	\N	\N	\N	\N
4220	1529	73	t	1	\N	\N	\N	\N
1516	614	40	f	0	\N	\N	\N	\N
1517	614	83	f	1	\N	\N	\N	\N
1518	614	84	f	2	\N	\N	\N	\N
1519	614	21	f	3	\N	\N	\N	\N
1520	614	73	t	4	\N	\N	\N	\N
1521	615	17	f	0	\N	\N	\N	\N
1522	615	20	f	1	\N	\N	\N	\N
1523	615	62	f	2	\N	\N	\N	\N
1524	615	73	t	3	\N	\N	\N	\N
1525	616	11	t	0	\N	\N	\N	\N
1526	616	12	f	1	\N	\N	\N	\N
1527	617	91	t	0	\N	\N	\N	\N
1528	618	15	f	0	\N	\N	\N	\N
1529	618	16	f	1	\N	\N	\N	\N
1530	618	79	f	2	\N	\N	\N	\N
1531	618	80	f	3	\N	\N	\N	\N
1532	618	81	f	4	\N	\N	\N	\N
1533	618	82	f	5	\N	\N	\N	\N
1534	618	14	t	6	\N	\N	\N	\N
1535	619	22	f	0	\N	\N	\N	\N
1536	619	73	t	1	\N	\N	\N	\N
1645	657	22	f	0	\N	\N	\N	\N
1646	657	73	t	1	\N	\N	\N	\N
1818	699	40	f	0	\N	\N	\N	\N
1819	699	83	f	1	\N	\N	\N	\N
1820	699	84	f	2	\N	\N	\N	\N
1821	699	21	f	3	\N	\N	\N	\N
1822	699	73	t	4	\N	\N	\N	\N
1823	700	19	t	0	\N	\N	\N	\N
1824	701	11	t	0	\N	\N	\N	\N
1825	701	12	f	1	\N	\N	\N	\N
1826	702	91	t	0	\N	\N	\N	\N
1827	703	15	t	0	\N	\N	\N	\N
1828	703	16	f	1	\N	\N	\N	\N
1829	703	79	f	2	\N	\N	\N	\N
1830	703	80	f	3	\N	\N	\N	\N
1831	703	81	f	4	\N	\N	\N	\N
1832	703	82	f	5	\N	\N	\N	\N
1833	703	14	f	6	\N	\N	\N	\N
1834	704	22	f	0	\N	\N	\N	\N
1835	704	73	t	1	\N	\N	\N	\N
2763	1013	11	t	0	\N	\N	\N	\N
2764	1013	12	f	1	\N	\N	\N	\N
2765	1014	18	t	0	\N	\N	\N	\N
2766	1015	17	t	0	\N	\N	\N	\N
2767	1015	20	f	1	\N	\N	\N	\N
2768	1016	91	t	0	\N	\N	\N	\N
2769	1017	16	f	0	\N	\N	\N	\N
2770	1017	15	f	1	\N	\N	\N	\N
2771	1017	47	f	2	\N	\N	\N	\N
2772	1017	14	t	3	\N	\N	\N	\N
2773	1017	79	f	4	\N	\N	\N	\N
2774	1017	80	f	5	\N	\N	\N	\N
2775	1017	82	f	6	\N	\N	\N	\N
2776	1018	22	f	0	\N	\N	\N	\N
2777	1018	73	t	1	\N	\N	\N	\N
2778	1019	73	t	0	\N	\N	\N	\N
2779	1019	84	f	1	\N	\N	\N	\N
2780	1019	83	f	2	\N	\N	\N	\N
1876	720	40	f	0	\N	\N	\N	\N
1877	720	83	f	1	\N	\N	\N	\N
1878	720	84	f	2	\N	\N	\N	\N
1879	720	21	f	3	\N	\N	\N	\N
1880	720	73	t	4	\N	\N	\N	\N
1881	721	62	t	0	\N	\N	\N	\N
1882	722	19	t	0	\N	\N	\N	\N
1883	723	11	t	0	\N	\N	\N	\N
1884	723	12	f	1	\N	\N	\N	\N
1885	724	91	f	0	\N	\N	\N	\N
1886	725	15	f	0	\N	\N	\N	\N
1887	725	16	f	1	\N	\N	\N	\N
1888	725	79	f	2	\N	\N	\N	\N
1889	725	80	f	3	\N	\N	\N	\N
1890	725	81	f	4	\N	\N	\N	\N
1891	725	82	f	5	\N	\N	\N	\N
1892	725	14	t	6	\N	\N	\N	\N
1893	726	22	f	0	\N	\N	\N	\N
1894	726	73	t	1	\N	\N	\N	\N
1752	678	40	f	0	\N	\N	\N	\N
1753	678	83	f	1	\N	\N	\N	\N
1754	678	84	f	2	\N	\N	\N	\N
1755	678	21	f	3	\N	\N	\N	\N
1756	678	73	t	4	\N	\N	\N	\N
1757	679	35	t	0	\N	\N	\N	\N
1758	679	73	f	1	\N	\N	\N	\N
1759	680	44	t	0	\N	\N	\N	\N
1760	681	11	t	0	\N	\N	\N	\N
1761	681	12	f	1	\N	\N	\N	\N
1762	682	91	t	0	\N	\N	\N	\N
1763	683	15	f	0	\N	\N	\N	\N
1764	683	16	f	1	\N	\N	\N	\N
1765	683	79	f	2	\N	\N	\N	\N
1766	683	80	f	3	\N	\N	\N	\N
1767	683	81	f	4	\N	\N	\N	\N
1768	683	82	f	5	\N	\N	\N	\N
1769	683	14	t	6	\N	\N	\N	\N
1770	684	22	f	0	\N	\N	\N	\N
1771	684	73	t	1	\N	\N	\N	\N
1936	740	40	f	0	\N	\N	\N	\N
1937	740	83	f	1	\N	\N	\N	\N
1938	740	84	f	2	\N	\N	\N	\N
1939	740	21	f	3	\N	\N	\N	\N
1940	740	73	t	4	\N	\N	\N	\N
1941	741	65	t	0	\N	\N	\N	\N
1942	742	11	t	0	\N	\N	\N	\N
1943	742	12	f	1	\N	\N	\N	\N
1944	743	91	f	0	\N	\N	\N	\N
1945	744	15	f	0	\N	\N	\N	\N
1946	744	16	f	1	\N	\N	\N	\N
1947	744	79	f	2	\N	\N	\N	\N
1948	744	80	f	3	\N	\N	\N	\N
1949	744	81	f	4	\N	\N	\N	\N
1950	744	82	f	5	\N	\N	\N	\N
1951	744	14	t	6	\N	\N	\N	\N
1952	745	22	f	0	\N	\N	\N	\N
1953	745	73	t	1	\N	\N	\N	\N
3867	1401	40	f	0	\N	\N	\N	\N
3868	1401	83	f	1	\N	\N	\N	\N
3869	1401	84	f	2	\N	\N	\N	\N
3870	1401	21	f	3	\N	\N	\N	\N
2781	1019	40	f	3	\N	\N	\N	\N
2782	1019	21	f	4	\N	\N	\N	\N
2783	1020	63	t	0	\N	\N	\N	\N
3871	1401	73	t	4	\N	\N	\N	\N
3872	1402	35	t	0	\N	\N	\N	\N
3873	1403	34	t	0	\N	\N	\N	\N
3874	1404	11	t	0	\N	\N	\N	\N
3875	1404	12	f	1	\N	\N	\N	\N
3876	1405	91	t	0	\N	\N	\N	\N
3877	1406	15	f	0	\N	\N	\N	\N
3878	1406	16	f	1	\N	\N	\N	\N
3879	1406	79	f	2	\N	\N	\N	\N
3880	1406	80	f	3	\N	\N	\N	\N
3881	1406	81	f	4	\N	\N	\N	\N
3882	1406	82	f	5	\N	\N	\N	\N
2587	952	63	t	0	\N	\N	\N	\N
2588	953	11	t	0	\N	\N	\N	\N
2589	953	12	f	1	\N	\N	\N	\N
2590	954	91	t	0	\N	\N	\N	\N
2591	955	15	f	0	\N	\N	\N	\N
2592	955	16	f	1	\N	\N	\N	\N
2593	955	79	f	2	\N	\N	\N	\N
2594	955	80	f	3	\N	\N	\N	\N
2595	955	81	f	4	\N	\N	\N	\N
2596	955	82	f	5	\N	\N	\N	\N
2597	955	14	t	6	\N	\N	\N	\N
2598	956	22	f	0	\N	\N	\N	\N
2599	956	73	t	1	\N	\N	\N	\N
2600	957	40	f	0	\N	\N	\N	\N
2601	957	83	f	1	\N	\N	\N	\N
2602	957	84	f	2	\N	\N	\N	\N
2603	957	21	f	3	\N	\N	\N	\N
2604	957	73	t	4	\N	\N	\N	\N
2605	958	17	f	0	\N	\N	\N	\N
2606	958	20	f	1	\N	\N	\N	\N
2607	958	62	f	2	\N	\N	\N	\N
2608	958	73	t	3	\N	\N	\N	\N
2021	764	40	f	0	\N	\N	\N	\N
2022	764	83	f	1	\N	\N	\N	\N
2023	764	84	f	2	\N	\N	\N	\N
2024	764	21	f	3	\N	\N	\N	\N
2025	764	73	t	4	\N	\N	\N	\N
2026	765	56	t	0	\N	\N	\N	\N
2027	766	63	f	0	\N	\N	\N	\N
2028	767	11	f	0	\N	\N	\N	\N
2029	767	12	f	1	\N	\N	\N	\N
2030	768	91	f	0	\N	\N	\N	\N
2031	769	15	f	0	\N	\N	\N	\N
2032	769	16	f	1	\N	\N	\N	\N
2033	769	79	f	2	\N	\N	\N	\N
2034	769	80	f	3	\N	\N	\N	\N
2035	769	81	f	4	\N	\N	\N	\N
2036	769	82	f	5	\N	\N	\N	\N
2037	769	35	f	6	\N	\N	\N	\N
2038	769	14	t	7	\N	\N	\N	\N
2039	770	22	f	0	\N	\N	\N	\N
2040	770	73	t	1	\N	\N	\N	\N
2058	777	24	t	0	\N	\N	\N	\N
2059	778	40	f	0	\N	\N	\N	\N
2060	778	83	f	1	\N	\N	\N	\N
2061	778	84	f	2	\N	\N	\N	\N
2062	778	21	f	3	\N	\N	\N	\N
2063	778	73	t	4	\N	\N	\N	\N
2064	779	60	t	0	\N	\N	\N	\N
2065	780	91	f	0	\N	\N	\N	\N
2066	781	15	f	0	\N	\N	\N	\N
2067	781	16	f	1	\N	\N	\N	\N
2068	781	79	f	2	\N	\N	\N	\N
2069	781	80	f	3	\N	\N	\N	\N
2070	781	81	f	4	\N	\N	\N	\N
2071	781	82	f	5	\N	\N	\N	\N
2072	781	14	t	6	\N	\N	\N	\N
2073	782	22	f	0	\N	\N	\N	\N
2074	782	73	t	1	\N	\N	\N	\N
2095	790	40	f	0	\N	\N	\N	\N
2096	790	83	f	1	\N	\N	\N	\N
2097	790	84	f	2	\N	\N	\N	\N
2098	790	21	f	3	\N	\N	\N	\N
2099	790	73	t	4	\N	\N	\N	\N
2100	791	65	t	0	\N	\N	\N	\N
2101	792	24	t	0	\N	\N	\N	\N
2102	793	91	f	0	\N	\N	\N	\N
2103	794	15	f	0	\N	\N	\N	\N
2104	794	16	f	1	\N	\N	\N	\N
2105	794	79	f	2	\N	\N	\N	\N
2106	794	80	f	3	\N	\N	\N	\N
2107	794	81	f	4	\N	\N	\N	\N
2108	794	82	f	5	\N	\N	\N	\N
2109	794	14	t	6	\N	\N	\N	\N
2110	795	22	f	0	\N	\N	\N	\N
2111	795	73	t	1	\N	\N	\N	\N
3883	1406	14	t	6	\N	\N	\N	\N
3884	1407	22	f	0	\N	\N	\N	\N
3885	1407	73	t	1	\N	\N	\N	\N
2699	990	21	f	0	\N	\N	\N	\N
2700	990	84	f	1	\N	\N	\N	\N
2701	990	40	f	2	\N	\N	\N	\N
2702	990	83	f	3	\N	\N	\N	\N
2703	990	73	t	4	\N	\N	\N	\N
2704	991	17	f	0	\N	\N	\N	\N
2705	991	62	f	1	\N	\N	\N	\N
2706	991	20	f	2	\N	\N	\N	\N
2707	991	73	t	3	\N	\N	\N	\N
2708	992	11	t	0	\N	\N	\N	\N
2709	992	12	f	1	\N	\N	\N	\N
2710	993	91	t	0	\N	\N	\N	\N
2711	994	32	t	0	\N	\N	\N	\N
2712	995	14	t	0	\N	\N	\N	\N
2713	995	47	f	1	\N	\N	\N	\N
2714	995	15	f	2	\N	\N	\N	\N
2715	995	16	f	3	\N	\N	\N	\N
2716	995	79	f	4	\N	\N	\N	\N
2717	995	80	f	5	\N	\N	\N	\N
2718	995	82	f	6	\N	\N	\N	\N
2719	996	22	f	0	\N	\N	\N	\N
2720	996	73	t	1	\N	\N	\N	\N
4345	1570	19	t	0	\N	\N	\N	\N
4346	1571	56	t	0	\N	\N	\N	\N
4347	1572	52	t	0	\N	\N	\N	\N
4348	1573	32	t	0	\N	\N	\N	\N
4349	1574	91	t	0	\N	\N	\N	\N
4350	1575	15	f	0	\N	\N	\N	\N
4351	1575	16	f	1	\N	\N	\N	\N
4352	1575	79	f	2	\N	\N	\N	\N
4353	1575	80	f	3	\N	\N	\N	\N
4354	1575	81	f	4	\N	\N	\N	\N
4355	1575	82	f	5	\N	\N	\N	\N
4356	1575	47	f	6	\N	\N	\N	\N
4357	1575	14	t	7	\N	\N	\N	\N
4358	1576	22	f	0	\N	\N	\N	\N
4359	1576	73	t	1	\N	\N	\N	\N
4114	1489	40	f	0	\N	\N	\N	\N
4115	1489	83	f	1	\N	\N	\N	\N
4116	1489	84	f	2	\N	\N	\N	\N
4117	1489	21	f	3	\N	\N	\N	\N
4118	1489	73	t	4	\N	\N	\N	\N
4119	1490	17	f	0	\N	\N	\N	\N
4120	1490	20	f	1	\N	\N	\N	\N
4121	1490	62	f	2	\N	\N	\N	\N
4122	1490	73	t	3	\N	\N	\N	\N
4123	1491	19	t	0	\N	\N	\N	\N
4124	1492	34	t	0	\N	\N	\N	\N
3770	1366	40	f	0	\N	\N	\N	\N
3553	1289	17	f	0	\N	\N	\N	\N
3554	1289	20	f	1	\N	\N	\N	\N
3555	1289	62	f	2	\N	\N	\N	\N
3556	1289	73	t	3	\N	\N	\N	\N
3557	1290	12	f	0	\N	\N	\N	\N
3558	1290	11	t	1	\N	\N	\N	\N
3559	1291	91	f	0	\N	\N	\N	\N
3560	1292	15	f	0	\N	\N	\N	\N
3561	1292	16	f	1	\N	\N	\N	\N
3562	1292	79	f	2	\N	\N	\N	\N
3563	1292	80	f	3	\N	\N	\N	\N
3564	1292	81	f	4	\N	\N	\N	\N
3565	1292	82	f	5	\N	\N	\N	\N
3566	1292	14	t	6	\N	\N	\N	\N
3567	1293	63	f	0	\N	\N	\N	\N
3568	1294	40	f	0	\N	\N	\N	\N
3569	1294	83	f	1	\N	\N	\N	\N
3570	1294	84	f	2	\N	\N	\N	\N
3571	1294	21	f	3	\N	\N	\N	\N
3572	1294	73	t	4	\N	\N	\N	\N
3573	1295	22	f	0	\N	\N	\N	\N
3574	1295	73	f	1	\N	\N	\N	\N
3771	1366	83	f	1	\N	\N	\N	\N
3772	1366	84	f	2	\N	\N	\N	\N
3773	1366	21	f	3	\N	\N	\N	\N
3774	1366	73	t	4	\N	\N	\N	\N
3775	1367	56	t	0	\N	\N	\N	\N
2660	977	11	f	0	\N	\N	\N	\N
2661	977	12	f	1	\N	\N	\N	\N
2662	978	14	t	0	\N	\N	\N	\N
2663	978	79	f	1	\N	\N	\N	\N
2664	978	81	f	2	\N	\N	\N	\N
2665	978	80	f	3	\N	\N	\N	\N
2666	978	33	f	4	\N	\N	\N	\N
2667	978	16	f	5	\N	\N	\N	\N
2668	978	82	f	6	\N	\N	\N	\N
2669	979	17	f	0	\N	\N	\N	\N
2670	979	20	f	1	\N	\N	\N	\N
2671	979	62	f	2	\N	\N	\N	\N
2672	979	73	t	3	\N	\N	\N	\N
2673	980	91	t	0	\N	\N	\N	\N
2674	981	74	t	0	\N	\N	\N	\N
2675	982	22	f	0	\N	\N	\N	\N
2676	982	73	t	1	\N	\N	\N	\N
3776	1368	91	t	0	\N	\N	\N	\N
3777	1369	11	f	0	\N	\N	\N	\N
3778	1369	12	f	1	\N	\N	\N	\N
3779	1370	63	f	0	\N	\N	\N	\N
3780	1371	15	f	0	\N	\N	\N	\N
3781	1371	16	f	1	\N	\N	\N	\N
3782	1371	79	f	2	\N	\N	\N	\N
3783	1371	80	f	3	\N	\N	\N	\N
3784	1371	81	f	4	\N	\N	\N	\N
3785	1371	82	f	5	\N	\N	\N	\N
3786	1371	14	t	6	\N	\N	\N	\N
3787	1372	22	f	0	\N	\N	\N	\N
3788	1372	73	t	1	\N	\N	\N	\N
4125	1493	11	t	0	\N	\N	\N	\N
4126	1493	12	f	1	\N	\N	\N	\N
4127	1494	91	t	0	\N	\N	\N	\N
4128	1495	15	f	0	\N	\N	\N	\N
4129	1495	16	f	1	\N	\N	\N	\N
4130	1495	79	f	2	\N	\N	\N	\N
4131	1495	80	f	3	\N	\N	\N	\N
4132	1495	81	f	4	\N	\N	\N	\N
4133	1495	82	f	5	\N	\N	\N	\N
4134	1495	14	t	6	\N	\N	\N	\N
4135	1496	22	f	0	\N	\N	\N	\N
4136	1496	73	t	1	\N	\N	\N	\N
4137	1497	19	t	0	\N	\N	\N	\N
3328	1216	40	f	0	\N	\N	\N	\N
3329	1216	83	f	1	\N	\N	\N	\N
3330	1216	84	f	2	\N	\N	\N	\N
3331	1216	21	f	3	\N	\N	\N	\N
3332	1216	73	t	4	\N	\N	\N	\N
3333	1217	27	t	0	\N	\N	\N	\N
3334	1218	63	t	0	\N	\N	\N	\N
3335	1219	11	t	0	\N	\N	\N	\N
3336	1219	12	f	1	\N	\N	\N	\N
3337	1220	91	f	0	\N	\N	\N	\N
3338	1221	15	f	0	\N	\N	\N	\N
3339	1221	16	f	1	\N	\N	\N	\N
3340	1221	79	f	2	\N	\N	\N	\N
3341	1221	80	f	3	\N	\N	\N	\N
3342	1221	81	f	4	\N	\N	\N	\N
3343	1221	82	f	5	\N	\N	\N	\N
3344	1221	14	t	6	\N	\N	\N	\N
3345	1222	22	f	0	\N	\N	\N	\N
2918	1070	40	f	0	\N	\N	\N	\N
2919	1070	83	f	1	\N	\N	\N	\N
2515	930	24	t	0	\N	\N	\N	\N
2516	931	40	t	0	\N	\N	\N	\N
2517	932	91	f	0	\N	\N	\N	\N
2518	933	15	f	0	\N	\N	\N	\N
2519	933	16	f	1	\N	\N	\N	\N
2520	933	79	f	2	\N	\N	\N	\N
2521	933	80	f	3	\N	\N	\N	\N
2522	933	81	f	4	\N	\N	\N	\N
2523	933	82	f	5	\N	\N	\N	\N
2524	933	14	t	6	\N	\N	\N	\N
2525	934	22	f	0	\N	\N	\N	\N
2920	1070	84	f	2	\N	\N	\N	\N
2921	1070	21	f	3	\N	\N	\N	\N
2922	1070	73	t	4	\N	\N	\N	\N
2923	1071	59	t	0	\N	\N	\N	\N
2924	1072	63	t	0	\N	\N	\N	\N
2925	1073	11	t	0	\N	\N	\N	\N
2926	1073	12	f	1	\N	\N	\N	\N
2927	1074	91	t	0	\N	\N	\N	\N
2928	1075	15	f	0	\N	\N	\N	\N
2929	1075	16	f	1	\N	\N	\N	\N
2930	1075	79	f	2	\N	\N	\N	\N
2931	1075	80	f	3	\N	\N	\N	\N
2932	1075	82	f	4	\N	\N	\N	\N
2933	1075	14	t	5	\N	\N	\N	\N
2934	1075	47	f	6	\N	\N	\N	\N
2935	1076	22	f	0	\N	\N	\N	\N
2936	1076	73	t	1	\N	\N	\N	\N
3346	1222	73	t	1	\N	\N	\N	\N
3347	1223	26	t	0	\N	\N	\N	\N
3122	1140	40	f	0	\N	\N	\N	\N
3123	1140	83	f	1	\N	\N	\N	\N
3124	1140	84	f	2	\N	\N	\N	\N
3125	1140	21	f	3	\N	\N	\N	\N
3126	1140	73	t	4	\N	\N	\N	\N
3127	1141	56	t	0	\N	\N	\N	\N
3128	1142	63	t	0	\N	\N	\N	\N
3129	1143	11	t	0	\N	\N	\N	\N
3130	1143	12	f	1	\N	\N	\N	\N
3131	1144	91	t	0	\N	\N	\N	\N
3132	1145	15	f	0	\N	\N	\N	\N
3133	1145	16	f	1	\N	\N	\N	\N
3134	1145	79	f	2	\N	\N	\N	\N
3135	1145	80	f	3	\N	\N	\N	\N
3136	1145	81	f	4	\N	\N	\N	\N
3137	1145	82	f	5	\N	\N	\N	\N
3138	1145	14	t	6	\N	\N	\N	\N
3139	1146	22	f	0	\N	\N	\N	\N
3140	1146	73	t	1	\N	\N	\N	\N
\.


--
-- Data for Name: drink_slot_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_slot_volumes (id, slot_id, type_volume_id, processed_qty, produced_qty, unit, extra_cost, is_default, is_enabled, sort_order) FROM stdin;
7	35	30	18.0000	18.0000	ml	0.0000	f	t	0
8	35	31	18.0000	36.0000	ml	0.0000	t	t	0
9	35	33	36.0000	54.0000	ml	0.0000	f	t	0
10	35	34	9.0000	18.0000	ml	0.0000	f	t	0
11	35	35	18.0000	36.0000	ml	0.0000	f	t	0
12	35	36	27.0000	54.0000	ml	0.0000	f	t	0
13	35	37	18.0000	18.0000	ml	0.1000	f	t	0
14	35	38	18.0000	36.0000	ml	0.2000	f	t	0
15	35	39	36.0000	54.0000	ml	0.5000	f	t	0
69	48	30	18.0000	18.0000	ml	0.0000	f	t	0
70	48	31	18.0000	36.0000	ml	0.0000	t	t	0
71	48	33	36.0000	54.0000	ml	65.0000	f	t	0
72	48	34	18.0000	18.0000	ml	-5.0000	f	t	0
73	48	35	18.0000	36.0000	ml	0.0000	t	t	0
74	48	36	36.0000	54.0000	ml	55.0000	f	t	0
75	48	37	18.0000	18.0000	ml	-10.0000	f	t	0
76	48	38	18.0000	36.0000	ml	0.0000	t	t	0
77	48	39	36.0000	54.0000	ml	75.0000	f	f	0
78	49	49	10.0000	10.0000	ml	0.0000	f	t	0
79	49	50	20.0000	20.0000	ml	0.0000	t	t	0
80	49	51	30.0000	30.0000	ml	0.0000	f	t	0
81	49	52	10.0000	10.0000	ml	0.0000	f	t	0
82	49	53	20.0000	20.0000	ml	0.0000	t	t	0
83	49	54	30.0000	30.0000	ml	0.0000	f	t	0
1248	383	34	18.0000	18.0000	ml	-10.0000	f	t	0
1249	383	35	18.0000	36.0000	ml	0.0000	t	t	0
1250	383	36	36.0000	54.0000	ml	35.0000	f	t	0
1251	383	37	18.0000	18.0000	ml	-5.0000	f	t	0
1252	383	38	18.0000	36.0000	ml	0.0000	f	t	0
1253	383	39	36.0000	54.0000	ml	40.0000	f	t	0
231	96	37	18.0000	18.0000	ml	-5.0000	f	t	0
232	96	38	18.0000	36.0000	ml	0.0000	t	t	0
233	96	39	36.0000	54.0000	ml	40.0000	f	t	0
1254	385	55	10.0000	10.0000	ml	10.0000	t	t	0
1255	385	56	20.0000	20.0000	ml	20.0000	f	t	0
1256	385	57	30.0000	30.0000	ml	30.0000	f	t	0
1257	386	73	10.0000	10.0000	ml	0.0000	t	t	0
1258	386	74	20.0000	20.0000	ml	0.0000	f	t	0
1259	386	75	30.0000	30.0000	ml	0.0000	f	t	0
1260	387	73	10.0000	10.0000	ml	0.0000	t	t	0
1261	387	74	30.0000	30.0000	ml	0.0000	f	t	0
1262	387	75	45.0000	45.0000	ml	0.0000	f	t	0
1275	393	34	18.0000	18.0000	ml	-10.0000	f	t	0
1276	393	35	18.0000	25.0000	ml	0.0000	t	t	0
1277	393	36	36.0000	54.0000	ml	35.0000	f	t	0
1278	393	37	18.0000	18.0000	ml	-5.0000	f	t	0
1279	393	38	18.0000	25.0000	ml	0.0000	t	t	0
337	126	34	18.0000	18.0000	ml	-10.0000	f	t	0
338	126	35	18.0000	36.0000	ml	0.0000	t	t	0
339	126	36	36.0000	54.0000	ml	35.0000	f	t	0
340	126	37	18.0000	18.0000	ml	-5.0000	f	t	0
255	101	34	18.0000	18.0000	ml	-10.0000	f	t	0
256	101	35	18.0000	36.0000	ml	0.0000	t	t	0
257	101	36	36.0000	54.0000	ml	0.0000	f	t	0
258	101	37	18.0000	18.0000	ml	-5.0000	f	t	0
259	101	38	18.0000	36.0000	ml	0.0000	t	t	0
260	101	39	36.0000	54.0000	ml	0.5000	f	t	0
261	101	68	40.0000	40.0000	ml	0.0000	t	t	0
262	101	69	80.0000	80.0000	ml	35.0000	f	t	0
341	126	38	18.0000	36.0000	ml	0.0000	t	t	0
342	126	39	36.0000	54.0000	ml	40.0000	f	t	0
1280	393	39	36.0000	54.0000	ml	40.0000	f	t	0
1281	395	55	10.0000	10.0000	ml	30.0000	f	t	0
1282	395	56	20.0000	20.0000	ml	45.0000	f	t	0
1283	395	57	30.0000	30.0000	ml	55.0000	f	t	0
1284	395	58	10.0000	10.0000	ml	30.0000	f	t	0
210	91	37	18.0000	18.0000	ml	-5.0000	f	t	0
211	91	38	18.0000	36.0000	ml	10.0000	t	t	0
212	91	39	36.0000	54.0000	ml	45.0000	f	t	0
213	91	34	18.0000	18.0000	ml	-10.0000	f	t	0
214	91	35	18.0000	36.0000	ml	0.0000	t	t	0
215	91	36	36.0000	54.0000	ml	30.0000	f	t	0
216	92	55	10.0000	10.0000	ml	20.0000	f	t	0
217	92	56	20.0000	20.0000	ml	30.0000	f	t	0
218	92	57	30.0000	30.0000	ml	40.0000	f	t	0
219	92	58	10.0000	10.0000	ml	20.0000	f	t	0
220	92	59	20.0000	20.0000	ml	30.0000	f	t	0
221	92	61	30.0000	30.0000	ml	40.0000	f	t	0
222	92	62	10.0000	10.0000	ml	20.0000	f	t	0
223	92	63	20.0000	20.0000	ml	30.0000	f	t	0
224	92	64	30.0000	30.0000	ml	40.0000	f	t	0
1285	395	59	20.0000	20.0000	ml	45.0000	f	t	0
1286	395	61	30.0000	30.0000	ml	55.0000	f	t	0
1287	395	62	10.0000	10.0000	ml	30.0000	f	t	0
1288	395	63	20.0000	20.0000	ml	45.0000	f	t	0
1289	395	64	30.0000	30.0000	ml	55.0000	f	t	0
1290	396	79	35.0000	35.0000	ml	0.0000	f	t	0
1291	397	76	100.0000	100.0000	ml	0.0000	f	t	0
1292	397	77	120.0000	120.0000	ml	0.0000	t	t	0
1293	397	78	140.0000	140.0000	ml	0.0000	f	t	0
3805	952	113	30.0000	30.0000	ml	0.0000	f	t	0
3806	953	34	18.0000	18.0000	ml	30.0000	f	t	0
3807	953	35	18.0000	25.0000	ml	40.0000	t	t	0
3808	953	36	36.0000	54.0000	ml	60.0000	f	t	0
3809	953	37	18.0000	18.0000	ml	35.0000	f	t	0
3810	953	38	18.0000	36.0000	ml	45.0000	t	t	0
3811	953	39	36.0000	54.0000	ml	65.0000	f	t	0
3812	954	76	110.0000	110.0000	ml	0.0000	f	t	0
3813	954	77	130.0000	130.0000	ml	0.0000	t	t	0
369	139	37	18.0000	18.0000	ml	-5.0000	f	t	0
370	139	38	18.0000	36.0000	ml	0.0000	t	t	0
293	112	37	18.0000	18.0000	ml	-5.0000	f	t	0
294	112	38	18.0000	36.0000	ml	0.0000	t	t	0
295	112	39	36.0000	54.0000	ml	40.0000	f	t	0
296	112	34	18.0000	18.0000	ml	-10.0000	f	t	0
297	112	35	18.0000	36.0000	ml	0.0000	t	t	0
298	112	36	36.0000	54.0000	ml	35.0000	f	t	0
371	139	39	36.0000	54.0000	ml	0.5000	f	t	0
372	139	34	18.0000	18.0000	ml	-10.0000	f	t	0
373	139	35	18.0000	36.0000	ml	0.0000	t	t	0
374	139	36	36.0000	54.0000	ml	0.0000	f	t	0
3814	954	78	150.0000	150.0000	ml	0.0000	f	t	0
3815	956	112	0.0000	0.0000	ml	0.0000	f	f	0
3816	956	79	35.0000	35.0000	ml	0.0000	t	t	0
3817	957	80	10.0000	10.0000	ml	0.0000	f	t	0
3818	957	81	20.0000	20.0000	ml	0.0000	f	t	0
3819	957	82	30.0000	30.0000	ml	0.0000	f	t	0
3820	957	86	1.0000	1.0000	ml	0.0000	f	t	0
3821	957	87	2.0000	2.0000	ml	0.0000	f	t	0
3822	957	88	3.0000	3.0000	ml	0.0000	f	t	0
3823	957	65	0.0000	0.0000	ml	0.0000	f	t	0
3824	957	66	0.0000	0.0000	ml	0.0000	f	t	0
3825	957	67	0.0000	0.0000	ml	0.0000	f	t	0
3826	957	83	10.0000	10.0000	ml	0.0000	f	t	0
3827	957	84	20.0000	20.0000	ml	0.0000	f	t	0
3828	957	85	30.0000	30.0000	ml	0.0000	f	t	0
3829	958	55	0.0000	0.0000	ml	10.0000	f	t	0
3830	958	56	0.0000	0.0000	ml	20.0000	f	t	0
3831	958	57	30.0000	30.0000	ml	75.0000	f	t	0
3832	958	58	10.0000	10.0000	ml	15.0000	f	t	0
3833	958	59	20.0000	20.0000	ml	55.0000	f	t	0
3834	958	61	30.0000	30.0000	ml	75.0000	f	t	0
3835	958	62	10.0000	10.0000	ml	25.0000	f	t	0
3836	958	63	20.0000	20.0000	ml	55.0000	f	t	0
3837	958	64	30.0000	30.0000	ml	75.0000	f	t	0
512	190	37	18.0000	18.0000	ml	-5.0000	f	t	0
513	190	38	18.0000	25.0000	ml	0.0000	f	t	0
514	190	39	36.0000	54.0000	ml	40.0000	f	t	0
515	190	34	18.0000	18.0000	ml	-10.0000	f	t	0
516	190	35	18.0000	25.0000	ml	0.0000	f	t	0
517	190	36	36.0000	54.0000	ml	35.0000	f	t	0
518	192	55	10.0000	10.0000	ml	15.0000	t	t	0
519	192	56	20.0000	20.0000	ml	25.0000	f	t	0
520	192	57	30.0000	30.0000	ml	30.0000	f	f	0
521	192	58	10.0000	10.0000	ml	15.0000	t	t	0
522	192	59	20.0000	20.0000	ml	25.0000	f	t	0
523	192	61	30.0000	30.0000	ml	45.0000	f	f	0
524	192	62	10.0000	10.0000	ml	15.0000	t	t	0
525	192	63	20.0000	20.0000	ml	25.0000	f	t	0
526	192	64	30.0000	30.0000	ml	50.0000	f	f	0
4564	1140	80	10.0000	10.0000	ml	0.0000	f	t	0
4565	1140	81	20.0000	20.0000	ml	0.0000	f	t	0
4566	1140	82	30.0000	30.0000	ml	0.0000	f	t	0
4567	1140	86	1.0000	1.0000	ml	0.0000	f	t	0
4568	1140	87	2.0000	2.0000	ml	0.0000	f	t	0
4569	1140	88	3.0000	3.0000	ml	0.0000	f	t	0
4570	1140	65	0.0000	0.0000	ml	0.0000	f	t	0
4571	1140	66	0.0000	0.0000	ml	0.0000	f	t	0
4572	1140	67	0.0000	0.0000	ml	0.0000	f	t	0
4573	1140	83	10.0000	10.0000	ml	0.0000	f	t	0
4574	1140	84	20.0000	20.0000	ml	0.0000	f	t	0
4575	1140	85	30.0000	30.0000	ml	0.0000	f	t	0
4576	1141	96	25.0000	25.0000	ml	30.0000	f	t	0
4577	1141	97	35.0000	35.0000	ml	55.0000	t	t	0
4578	1141	98	45.0000	45.0000	ml	75.0000	f	t	0
4294	1076	112	0.0000	0.0000	ml	0.0000	f	t	0
4295	1076	79	35.0000	35.0000	ml	0.0000	t	t	0
4579	1142	113	30.0000	30.0000	ml	0.0000	t	t	0
4580	1143	34	18.0000	18.0000	ml	30.0000	f	t	0
4581	1143	35	18.0000	36.0000	ml	55.0000	t	t	0
4582	1143	36	36.0000	54.0000	ml	75.0000	f	t	0
4583	1143	37	18.0000	18.0000	ml	35.0000	f	t	0
4584	1143	38	18.0000	36.0000	ml	45.0000	f	t	0
4585	1143	39	36.0000	54.0000	ml	65.0000	f	t	0
4586	1144	76	160.0000	160.0000	ml	0.0000	f	t	0
4587	1144	77	180.0000	180.0000	ml	0.0000	t	t	0
4588	1144	78	200.0000	200.0000	ml	0.0000	f	t	0
4589	1146	112	0.0000	0.0000	ml	0.0000	f	f	0
4590	1146	79	35.0000	35.0000	ml	35.0000	f	f	0
5272	1303	80	10.0000	10.0000	ml	0.0000	f	t	0
5273	1303	81	20.0000	20.0000	ml	0.0000	f	t	0
1011	328	83	10.0000	10.0000	ml	0.0000	f	t	0
1012	328	84	20.0000	20.0000	ml	0.0000	f	t	0
1013	328	85	30.0000	30.0000	ml	0.0000	f	t	0
1014	328	65	1.0000	1.0000	ml	0.0000	t	t	0
1015	328	66	2.0000	2.0000	ml	0.0000	f	t	0
1016	328	67	3.0000	3.0000	ml	0.0000	f	t	0
1017	328	86	1.0000	1.0000	ml	0.0000	f	t	0
1018	328	87	2.0000	2.0000	ml	0.0000	f	t	0
1019	328	88	3.0000	3.0000	ml	0.0000	f	t	0
1020	328	80	10.0000	10.0000	ml	0.0000	f	t	0
1021	328	81	20.0000	20.0000	ml	0.0000	f	t	0
1022	328	82	30.0000	30.0000	ml	0.0000	f	t	0
1023	329	89	15.0000	15.0000	ml	0.0000	t	t	0
1024	329	90	30.0000	30.0000	ml	35.0000	f	t	0
1025	329	91	45.0000	45.0000	ml	45.0000	f	t	0
1026	330	34	18.0000	18.0000	ml	-10.0000	f	t	0
1027	330	35	18.0000	25.0000	ml	0.0000	t	t	0
1028	330	36	36.0000	54.0000	ml	35.0000	f	t	0
1029	330	37	18.0000	18.0000	ml	-5.0000	f	t	0
1030	330	38	18.0000	25.0000	ml	0.0000	t	t	0
1031	330	39	36.0000	54.0000	ml	40.0000	f	t	0
1032	331	76	100.0000	100.0000	ml	0.0000	f	t	0
1033	331	77	120.0000	120.0000	ml	0.0000	t	t	0
1034	331	78	140.0000	140.0000	ml	0.0000	f	t	0
1035	333	79	35.0000	35.0000	ml	35.0000	f	t	0
5274	1303	82	30.0000	30.0000	ml	0.0000	f	t	0
5275	1303	86	1.0000	1.0000	ml	0.0000	f	t	0
5276	1303	87	2.0000	2.0000	ml	0.0000	f	t	0
5277	1303	88	3.0000	3.0000	ml	0.0000	f	t	0
4424	1105	80	10.0000	10.0000	ml	0.0000	f	t	0
4425	1105	81	20.0000	20.0000	ml	0.0000	f	t	0
4426	1105	82	30.0000	30.0000	ml	0.0000	f	t	0
4427	1105	86	1.0000	1.0000	ml	0.0000	f	t	0
4428	1105	87	2.0000	2.0000	ml	0.0000	f	t	0
4429	1105	88	3.0000	3.0000	ml	0.0000	f	t	0
4430	1105	65	0.0000	0.0000	ml	0.0000	f	t	0
4431	1105	66	0.0000	0.0000	ml	0.0000	f	t	0
4432	1105	67	0.0000	0.0000	ml	0.0000	f	t	0
4433	1105	83	10.0000	10.0000	ml	0.0000	f	t	0
4434	1105	84	20.0000	20.0000	ml	0.0000	f	t	0
4435	1105	85	30.0000	30.0000	ml	0.0000	f	t	0
4436	1106	55	0.0000	0.0000	ml	10.0000	f	t	0
4437	1106	56	0.0000	0.0000	ml	20.0000	f	t	0
4438	1106	57	30.0000	30.0000	ml	75.0000	f	t	0
4439	1106	58	10.0000	10.0000	ml	15.0000	f	t	0
4440	1106	59	20.0000	20.0000	ml	55.0000	f	t	0
4441	1106	61	30.0000	30.0000	ml	75.0000	f	t	0
4442	1106	62	10.0000	10.0000	ml	25.0000	f	t	0
4443	1106	63	20.0000	20.0000	ml	55.0000	f	t	0
4444	1106	64	30.0000	30.0000	ml	75.0000	f	t	0
4445	1107	113	30.0000	30.0000	ml	0.0000	t	t	0
4446	1108	34	18.0000	18.0000	ml	30.0000	f	t	0
4447	1108	35	18.0000	36.0000	ml	55.0000	t	t	0
1064	341	83	10.0000	10.0000	ml	0.0000	t	t	0
1065	341	84	20.0000	20.0000	ml	0.0000	f	t	0
1066	341	85	30.0000	30.0000	ml	0.0000	f	t	0
1067	341	86	1.0000	1.0000	ml	0.0000	t	t	0
1068	341	87	2.0000	2.0000	ml	0.0000	f	t	0
1069	341	88	3.0000	3.0000	ml	0.0000	f	t	0
1070	341	80	10.0000	10.0000	ml	0.0000	t	t	0
1071	341	81	20.0000	20.0000	ml	0.0000	f	t	0
1072	341	82	30.0000	30.0000	ml	0.0000	f	t	0
1073	341	65	1.0000	1.0000	ml	0.0000	t	t	0
1074	341	66	2.0000	2.0000	ml	0.0000	f	t	0
1075	341	67	3.0000	3.0000	ml	0.0000	f	t	0
1076	342	62	10.0000	10.0000	ml	30.0000	t	t	0
1077	342	63	20.0000	20.0000	ml	55.0000	f	t	0
1078	342	64	30.0000	30.0000	ml	75.0000	f	t	0
1079	343	49	15.0000	15.0000	ml	30.0000	f	t	0
1080	343	50	30.0000	30.0000	ml	55.0000	t	t	0
1081	343	51	45.0000	45.0000	ml	75.0000	f	t	0
1082	344	76	120.0000	120.0000	ml	0.0000	f	t	0
1083	344	77	140.0000	140.0000	ml	0.0000	t	t	0
1084	344	78	160.0000	160.0000	ml	0.0000	f	t	0
1085	345	34	18.0000	18.0000	ml	30.0000	f	t	0
1086	345	35	18.0000	36.0000	ml	40.0000	t	t	0
1087	345	36	36.0000	54.0000	ml	60.0000	f	t	0
1088	345	37	18.0000	18.0000	ml	35.0000	f	t	0
1089	345	38	18.0000	36.0000	ml	45.0000	t	t	0
1090	345	39	36.0000	54.0000	ml	65.0000	f	t	0
1091	347	79	35.0000	35.0000	ml	0.0000	f	t	0
4448	1108	36	36.0000	54.0000	ml	75.0000	f	t	0
4449	1108	37	18.0000	18.0000	ml	35.0000	f	t	0
4450	1108	38	18.0000	36.0000	ml	45.0000	f	t	0
4451	1108	39	36.0000	54.0000	ml	65.0000	f	t	0
4452	1109	76	110.0000	110.0000	ml	0.0000	f	t	0
4453	1109	77	130.0000	130.0000	ml	0.0000	t	t	0
4454	1109	78	150.0000	150.0000	ml	0.0000	f	t	0
4455	1111	112	0.0000	0.0000	ml	0.0000	f	f	0
4456	1111	79	35.0000	35.0000	ml	35.0000	t	t	0
5278	1303	65	0.0000	0.0000	ml	0.0000	f	t	0
5279	1303	66	0.0000	0.0000	ml	0.0000	f	t	0
5280	1303	67	0.0000	0.0000	ml	0.0000	f	t	0
5281	1303	83	10.0000	10.0000	ml	0.0000	f	t	0
5282	1303	84	20.0000	20.0000	ml	0.0000	f	t	0
5283	1303	85	30.0000	30.0000	ml	0.0000	f	t	0
5284	1304	91	45.0000	45.0000	ml	75.0000	f	t	0
5285	1304	90	30.0000	30.0000	ml	55.0000	t	t	0
5286	1304	89	15.0000	15.0000	ml	35.0000	f	t	0
5287	1305	113	30.0000	30.0000	ml	0.0000	t	t	0
5288	1306	34	18.0000	18.0000	ml	30.0000	f	t	0
5289	1306	35	18.0000	36.0000	ml	55.0000	t	t	0
5290	1306	36	36.0000	54.0000	ml	75.0000	f	t	0
5291	1306	37	18.0000	18.0000	ml	35.0000	f	t	0
5292	1306	38	18.0000	36.0000	ml	45.0000	f	t	0
5293	1306	39	36.0000	54.0000	ml	65.0000	f	t	0
5294	1307	76	150.0000	150.0000	ml	0.0000	f	t	0
1397	420	83	10.0000	10.0000	ml	0.0000	t	t	0
1398	420	84	20.0000	20.0000	ml	0.0000	f	t	0
1399	420	85	30.0000	30.0000	ml	0.0000	f	t	0
1400	420	80	10.0000	10.0000	ml	0.0000	t	t	0
1401	420	81	20.0000	20.0000	ml	0.0000	f	t	0
1402	420	82	30.0000	30.0000	ml	0.0000	f	t	0
1403	420	65	1.0000	1.0000	ml	0.0000	t	t	0
1404	420	66	2.0000	2.0000	ml	0.0000	f	t	0
1405	420	67	3.0000	3.0000	ml	0.0000	f	t	0
1406	420	86	1.0000	1.0000	ml	0.0000	t	t	0
1407	420	87	2.0000	2.0000	ml	0.0000	f	t	0
1408	420	88	3.0000	3.0000	ml	0.0000	f	t	0
1409	421	58	10.0000	10.0000	ml	30.0000	f	t	0
1410	421	59	20.0000	20.0000	ml	55.0000	f	t	0
1411	421	61	30.0000	30.0000	ml	75.0000	f	t	0
1412	421	55	10.0000	10.0000	ml	30.0000	f	t	0
1413	421	56	20.0000	20.0000	ml	55.0000	f	t	0
1414	421	57	30.0000	30.0000	ml	75.0000	f	t	0
1415	421	62	10.0000	10.0000	ml	30.0000	f	t	0
1416	421	63	20.0000	20.0000	ml	55.0000	f	t	0
1417	421	64	30.0000	30.0000	ml	75.0000	f	t	0
1418	422	34	18.0000	18.0000	ml	30.0000	f	t	0
1419	422	35	18.0000	36.0000	ml	40.0000	f	t	0
1420	422	36	36.0000	54.0000	ml	60.0000	f	t	0
1421	422	37	18.0000	18.0000	ml	35.0000	f	t	0
1422	422	38	18.0000	36.0000	ml	45.0000	f	t	0
1423	422	39	36.0000	54.0000	ml	65.0000	f	t	0
1424	423	76	120.0000	120.0000	ml	0.0000	f	t	0
1425	423	77	140.0000	140.0000	ml	0.0000	t	t	0
1426	423	78	160.0000	160.0000	ml	0.0000	f	t	0
1427	425	79	35.0000	35.0000	ml	0.0000	f	t	0
1428	425	112	0.0000	0.0000	ml	0.0000	t	t	0
5295	1307	77	170.0000	170.0000	ml	0.0000	t	t	0
5296	1307	78	190.0000	190.0000	ml	0.0000	f	t	0
5297	1309	112	0.0000	0.0000	ml	0.0000	f	f	0
5298	1309	79	35.0000	35.0000	ml	35.0000	f	f	0
6204	1514	80	10.0000	10.0000	ml	0.0000	f	t	0
6205	1514	81	20.0000	20.0000	ml	0.0000	f	t	0
6206	1514	82	30.0000	30.0000	ml	0.0000	f	t	0
6207	1514	86	1.0000	1.0000	ml	0.0000	f	t	0
6208	1514	87	2.0000	2.0000	ml	0.0000	f	t	0
6209	1514	88	3.0000	3.0000	ml	0.0000	f	t	0
6210	1514	65	0.0000	0.0000	ml	0.0000	f	t	0
6211	1514	66	0.0000	0.0000	ml	0.0000	f	t	0
6212	1514	67	0.0000	0.0000	ml	0.0000	f	t	0
4867	1216	80	10.0000	10.0000	ml	0.0000	f	t	0
4868	1216	81	20.0000	20.0000	ml	0.0000	f	t	0
4869	1216	82	30.0000	30.0000	ml	0.0000	f	t	0
4870	1216	86	1.0000	1.0000	ml	0.0000	f	t	0
4871	1216	87	2.0000	2.0000	ml	0.0000	f	t	0
4872	1216	88	3.0000	3.0000	ml	0.0000	f	t	0
4873	1216	65	0.0000	0.0000	ml	0.0000	f	t	0
4874	1216	66	0.0000	0.0000	ml	0.0000	f	t	0
4875	1216	67	0.0000	0.0000	ml	0.0000	f	t	0
4876	1216	83	10.0000	10.0000	ml	0.0000	f	t	0
4877	1216	84	20.0000	20.0000	ml	0.0000	f	t	0
4878	1216	85	30.0000	30.0000	ml	0.0000	f	t	0
4879	1217	99	15.0000	15.0000	ml	30.0000	f	t	0
4880	1217	100	30.0000	30.0000	ml	55.0000	t	t	0
4881	1217	101	45.0000	45.0000	ml	75.0000	f	t	0
4882	1218	113	30.0000	30.0000	ml	0.0000	t	t	0
4883	1219	34	18.0000	18.0000	ml	30.0000	f	t	0
4884	1219	35	18.0000	36.0000	ml	55.0000	t	t	0
4885	1219	36	36.0000	54.0000	ml	75.0000	f	t	0
4886	1219	37	18.0000	18.0000	ml	35.0000	f	t	0
4887	1219	38	18.0000	36.0000	ml	45.0000	f	t	0
4888	1219	39	36.0000	54.0000	ml	65.0000	f	t	0
4889	1220	76	160.0000	160.0000	ml	0.0000	f	t	0
4890	1220	77	180.0000	180.0000	ml	0.0000	t	t	0
4891	1220	78	200.0000	200.0000	ml	0.0000	f	t	0
4957	1238	37	18.0000	18.0000	ml	-5.0000	f	t	0
1776	510	80	10.0000	10.0000	ml	0.0000	f	t	0
1777	510	81	20.0000	20.0000	ml	0.0000	f	t	0
1778	510	82	30.0000	30.0000	ml	0.0000	f	t	0
1779	510	86	1.0000	1.0000	ml	0.0000	f	t	0
1780	510	87	2.0000	2.0000	ml	0.0000	f	t	0
1781	510	88	3.0000	3.0000	ml	0.0000	f	t	0
1782	510	65	0.0000	0.0000	ml	0.0000	f	t	0
1783	510	66	0.0000	0.0000	ml	0.0000	f	t	0
1784	510	67	0.0000	0.0000	ml	0.0000	f	t	0
1785	510	83	10.0000	10.0000	ml	0.0000	f	t	0
1786	510	84	20.0000	20.0000	ml	0.0000	f	t	0
1787	510	85	30.0000	30.0000	ml	0.0000	f	t	0
1788	511	96	15.0000	15.0000	ml	30.0000	f	t	0
1789	511	97	30.0000	30.0000	ml	55.0000	t	t	0
1790	511	98	45.0000	45.0000	ml	75.0000	f	t	0
1791	512	34	18.0000	18.0000	ml	0.0000	f	t	0
1792	512	35	18.0000	36.0000	ml	40.0000	t	t	0
1793	512	36	36.0000	54.0000	ml	75.0000	f	t	0
1794	512	37	18.0000	18.0000	ml	35.0000	f	t	0
1795	512	38	18.0000	36.0000	ml	45.0000	t	t	0
1796	512	39	36.0000	54.0000	ml	65.0000	f	t	0
1797	513	76	120.0000	120.0000	ml	0.0000	f	t	0
1798	513	77	140.0000	140.0000	ml	0.0000	t	t	0
1799	513	78	160.0000	160.0000	ml	0.0000	f	t	0
1800	514	102	15.0000	15.0000	ml	30.0000	f	t	0
4958	1238	38	18.0000	36.0000	ml	0.0000	t	t	0
4959	1238	39	36.0000	54.0000	ml	40.0000	f	t	0
4960	1238	34	18.0000	18.0000	ml	-10.0000	f	t	0
4961	1238	35	18.0000	36.0000	ml	0.0000	t	t	0
6213	1514	83	10.0000	10.0000	ml	0.0000	f	t	0
6214	1514	84	20.0000	20.0000	ml	0.0000	f	t	0
6215	1514	85	30.0000	30.0000	ml	0.0000	f	t	0
6216	1515	62	10.0000	10.0000	ml	25.0000	t	t	0
6217	1515	63	20.0000	20.0000	ml	55.0000	f	t	0
1801	514	103	30.0000	30.0000	ml	55.0000	f	t	0
4962	1238	36	36.0000	54.0000	ml	35.0000	f	t	0
1802	514	104	45.0000	45.0000	ml	75.0000	f	t	0
1803	514	105	0.0000	0.0000	ml	0.0000	f	t	0
1804	515	79	35.0000	35.0000	ml	0.0000	t	t	0
2134	583	80	10.0000	10.0000	ml	0.0000	t	t	0
2135	583	81	20.0000	20.0000	ml	0.0000	f	t	0
2136	583	82	30.0000	30.0000	ml	0.0000	f	t	0
2137	583	86	1.0000	1.0000	ml	0.0000	t	t	0
2138	583	87	2.0000	2.0000	ml	0.0000	f	t	0
2139	583	88	3.0000	3.0000	ml	0.0000	f	t	0
2140	583	65	0.0000	0.0000	ml	0.0000	t	t	0
2141	583	66	0.0000	0.0000	ml	0.0000	f	t	0
2142	583	67	0.0000	0.0000	ml	0.0000	f	t	0
2143	583	83	10.0000	10.0000	ml	0.0000	t	t	0
2144	583	84	20.0000	20.0000	ml	0.0000	f	t	0
2145	583	85	30.0000	30.0000	ml	0.0000	f	t	0
2146	584	99	15.0000	15.0000	ml	30.0000	f	t	0
2147	584	100	30.0000	30.0000	ml	55.0000	t	t	0
2148	584	101	45.0000	45.0000	ml	75.0000	f	t	0
2149	585	34	18.0000	18.0000	ml	0.0000	f	t	0
2150	585	35	18.0000	36.0000	ml	40.0000	t	t	0
2151	585	36	36.0000	54.0000	ml	75.0000	f	t	0
2152	585	37	18.0000	18.0000	ml	35.0000	f	t	0
2153	585	38	18.0000	36.0000	ml	45.0000	t	t	0
2154	585	39	36.0000	54.0000	ml	65.0000	f	t	0
2155	586	76	120.0000	120.0000	ml	0.0000	f	t	0
2156	586	77	140.0000	140.0000	ml	0.0000	t	t	0
2157	586	78	160.0000	160.0000	ml	0.0000	f	t	0
2158	588	112	0.0000	0.0000	ml	0.0000	f	t	0
2159	588	79	35.0000	35.0000	ml	35.0000	f	t	0
6218	1515	64	30.0000	30.0000	ml	75.0000	f	t	0
6219	1516	49	20.0000	20.0000	ml	0.0000	f	t	0
6220	1516	50	30.0000	30.0000	ml	0.0000	t	t	0
6221	1516	51	40.0000	40.0000	ml	0.0000	f	t	0
6222	1517	113	30.0000	30.0000	ml	0.0000	t	t	0
6223	1518	34	18.0000	18.0000	ml	30.0000	f	t	0
6224	1518	35	18.0000	36.0000	ml	40.0000	t	t	0
6225	1518	36	36.0000	54.0000	ml	60.0000	f	t	0
6226	1518	37	18.0000	18.0000	ml	35.0000	f	t	0
6227	1518	38	18.0000	36.0000	ml	45.0000	t	t	0
6228	1518	39	36.0000	54.0000	ml	65.0000	f	t	0
6229	1519	76	170.0000	170.0000	ml	0.0000	f	t	0
6230	1519	77	190.0000	190.0000	ml	0.0000	t	t	0
6231	1519	78	210.0000	210.0000	ml	0.0000	f	t	0
6232	1521	112	0.0000	0.0000	ml	0.0000	f	f	0
6233	1521	79	35.0000	35.0000	ml	35.0000	f	f	0
4625	1154	80	10.0000	10.0000	ml	0.0000	f	t	0
4626	1154	81	20.0000	20.0000	ml	0.0000	f	t	0
4627	1154	82	30.0000	30.0000	ml	0.0000	f	t	0
4628	1154	86	1.0000	1.0000	ml	0.0000	f	t	0
4629	1154	87	2.0000	2.0000	ml	0.0000	f	t	0
1987	551	80	10.0000	10.0000	ml	0.0000	f	t	0
1988	551	81	20.0000	20.0000	ml	0.0000	f	t	0
1989	551	82	30.0000	30.0000	ml	0.0000	f	t	0
1990	551	86	1.0000	1.0000	ml	0.0000	f	t	0
1991	551	87	2.0000	2.0000	ml	0.0000	f	t	0
1992	551	88	3.0000	3.0000	ml	0.0000	f	t	0
1993	551	65	0.0000	0.0000	ml	0.0000	f	t	0
1994	551	66	0.0000	0.0000	ml	0.0000	f	t	0
1995	551	67	0.0000	0.0000	ml	0.0000	f	t	0
1996	551	83	10.0000	10.0000	ml	0.0000	f	t	0
1997	551	84	20.0000	20.0000	ml	0.0000	f	t	0
1998	551	85	30.0000	30.0000	ml	0.0000	f	t	0
1999	552	58	10.0000	10.0000	ml	15.0000	f	t	0
2000	552	59	20.0000	20.0000	ml	55.0000	t	t	0
2001	552	61	30.0000	30.0000	ml	75.0000	f	t	0
2002	553	34	18.0000	18.0000	ml	0.0000	f	t	0
2003	553	35	18.0000	36.0000	ml	40.0000	t	t	0
2004	553	36	36.0000	54.0000	ml	75.0000	f	t	0
2005	553	37	18.0000	18.0000	ml	35.0000	f	t	0
2006	553	38	18.0000	36.0000	ml	45.0000	t	t	0
2007	553	39	36.0000	54.0000	ml	65.0000	f	t	0
2008	554	76	110.0000	110.0000	ml	0.0000	f	t	0
2009	554	77	130.0000	130.0000	ml	0.0000	f	t	0
2010	554	78	150.0000	150.0000	ml	0.0000	f	t	0
2011	556	79	35.0000	35.0000	ml	0.0000	t	t	0
4630	1154	88	3.0000	3.0000	ml	0.0000	f	t	0
4631	1154	65	1.0000	1.0000	ml	0.0000	f	t	0
4632	1154	66	2.0000	2.0000	ml	0.0000	f	t	0
4633	1154	67	3.0000	2.9000	ml	0.0000	f	t	0
4634	1154	83	10.0000	10.0000	ml	0.0000	f	t	0
4635	1154	84	20.0000	20.0000	ml	0.0000	f	t	0
4636	1154	85	30.0000	30.0000	ml	0.0000	f	t	0
4637	1155	55	0.0000	0.0000	ml	30.0000	f	t	0
4638	1155	56	0.0000	0.0000	ml	55.0000	f	t	0
4639	1155	57	30.0000	30.0000	ml	75.0000	f	t	0
4640	1155	58	15.0000	15.0000	ml	30.0000	t	t	0
4641	1155	59	20.0000	20.0000	ml	55.0000	f	t	0
4642	1155	61	25.0000	25.0000	ml	75.0000	f	t	0
4643	1156	113	30.0000	30.0000	ml	0.0000	t	t	0
4644	1157	34	18.0000	18.0000	ml	30.0000	f	t	0
4645	1157	35	18.0000	36.0000	ml	40.0000	t	t	0
4646	1157	36	36.0000	54.0000	ml	75.0000	f	t	0
4647	1157	37	18.0000	18.0000	ml	35.0000	f	t	0
4648	1157	38	18.0000	36.0000	ml	45.0000	f	t	0
4649	1157	39	36.0000	54.0000	ml	65.0000	f	t	0
4650	1158	76	160.0000	160.0000	ml	0.0000	f	t	0
4651	1158	77	180.0000	180.0000	ml	0.0000	t	t	0
4652	1158	78	200.0000	200.0000	ml	0.0000	f	t	0
2449	652	80	10.0000	10.0000	ml	0.0000	f	t	0
2450	652	81	20.0000	20.0000	ml	0.0000	f	t	0
2451	652	82	30.0000	30.0000	ml	0.0000	f	t	0
2452	652	86	1.0000	1.0000	ml	0.0000	f	t	0
2453	652	87	2.0000	2.0000	ml	0.0000	f	t	0
2454	652	88	3.0000	3.0000	ml	0.0000	f	t	0
2455	652	65	0.0000	0.0000	ml	0.0000	f	t	0
2456	652	66	0.0000	0.0000	ml	0.0000	f	t	0
2457	652	67	0.0000	0.0000	ml	0.0000	f	t	0
2458	652	83	10.0000	10.0000	ml	0.0000	f	t	0
2459	652	84	20.0000	20.0000	ml	0.0000	f	t	0
2460	652	85	30.0000	30.0000	ml	0.0000	f	t	0
2461	653	102	15.0000	15.0000	ml	30.0000	f	t	0
2462	653	103	30.0000	30.0000	ml	55.0000	t	t	0
2463	653	104	45.0000	45.0000	ml	75.0000	f	t	0
2464	654	34	18.0000	18.0000	ml	0.0000	f	t	0
2465	654	35	18.0000	36.0000	ml	40.0000	t	t	0
2466	654	36	36.0000	54.0000	ml	75.0000	f	t	0
2467	654	37	18.0000	18.0000	ml	35.0000	f	t	0
2468	654	38	18.0000	36.0000	ml	45.0000	t	t	0
2469	654	39	36.0000	54.0000	ml	65.0000	f	t	0
2470	655	76	170.0000	170.0000	ml	0.0000	f	t	0
2471	655	77	190.0000	190.0000	ml	0.0000	t	t	0
2472	655	78	210.0000	210.0000	ml	0.0000	f	t	0
2473	657	79	35.0000	35.0000	ml	35.0000	t	t	0
6234	1522	80	10.0000	10.0000	ml	0.0000	f	t	0
6235	1522	81	20.0000	20.0000	ml	0.0000	f	t	0
6236	1522	82	30.0000	30.0000	ml	0.0000	f	t	0
6237	1522	86	1.0000	1.0000	ml	0.0000	f	t	0
6238	1522	87	2.0000	2.0000	ml	0.0000	f	t	0
6239	1522	88	3.0000	3.0000	ml	0.0000	f	t	0
2576	678	80	10.0000	10.0000	ml	0.0000	f	t	0
2577	678	81	20.0000	20.0000	ml	0.0000	f	t	0
2578	678	82	30.0000	30.0000	ml	0.0000	f	t	0
2579	678	86	1.0000	1.0000	ml	0.0000	f	t	0
2580	678	87	2.0000	2.0000	ml	0.0000	f	t	0
2581	678	88	3.0000	3.0000	ml	0.0000	f	t	0
2582	678	65	0.0000	0.0000	ml	0.0000	f	t	0
2583	678	66	0.0000	0.0000	ml	0.0000	f	t	0
2584	678	67	0.0000	0.0000	ml	0.0000	f	t	0
2585	678	83	10.0000	10.0000	ml	0.0000	f	t	0
2586	678	84	20.0000	20.0000	ml	0.0000	f	t	0
2587	678	85	30.0000	30.0000	ml	0.0000	f	t	0
2588	679	102	10.0000	10.0000	ml	30.0000	f	t	0
2589	679	103	20.0000	20.0000	ml	55.0000	t	t	0
2590	679	104	30.0000	30.0000	ml	75.0000	f	t	0
2591	679	105	0.0000	0.0000	ml	0.0000	f	t	0
2592	680	114	10.0000	10.0000	ml	0.0000	f	t	0
2593	680	115	20.0000	20.0000	ml	0.0000	t	t	0
2594	680	116	30.0000	30.0000	ml	0.0000	f	t	0
2595	681	34	18.0000	18.0000	ml	0.0000	f	t	0
2596	681	35	18.0000	36.0000	ml	40.0000	t	t	0
2597	681	36	36.0000	54.0000	ml	75.0000	f	t	0
2598	681	37	18.0000	18.0000	ml	35.0000	f	t	0
2599	681	38	18.0000	36.0000	ml	45.0000	t	t	0
2600	681	39	36.0000	54.0000	ml	65.0000	f	t	0
2601	682	76	170.0000	170.0000	ml	0.0000	f	t	0
2602	682	77	190.0000	190.0000	ml	0.0000	t	t	0
2603	682	78	210.0000	210.0000	ml	0.0000	f	t	0
2604	684	79	35.0000	35.0000	ml	35.0000	t	t	0
6240	1522	65	0.0000	0.0000	ml	0.0000	f	t	0
6106	1489	80	10.0000	10.0000	ml	0.0000	f	t	0
6107	1489	81	20.0000	20.0000	ml	0.0000	f	t	0
6108	1489	82	30.0000	30.0000	ml	0.0000	f	t	0
6109	1489	86	1.0000	1.0000	ml	0.0000	f	t	0
6110	1489	87	2.0000	2.0000	ml	0.0000	f	t	0
6111	1489	88	3.0000	3.0000	ml	0.0000	f	t	0
6112	1489	65	0.0000	0.0000	ml	0.0000	f	t	0
6113	1489	66	0.0000	0.0000	ml	0.0000	f	t	0
6114	1489	67	0.0000	0.0000	ml	0.0000	f	t	0
6115	1489	83	10.0000	10.0000	ml	0.0000	f	t	0
6116	1489	84	20.0000	20.0000	ml	0.0000	f	t	0
6117	1489	85	30.0000	30.0000	ml	0.0000	f	t	0
5219	1289	63	20.0000	20.0000	ml	55.0000	f	t	0
5220	1289	64	30.0000	30.0000	ml	75.0000	f	t	0
5221	1290	37	18.0000	18.0000	ml	35.0000	f	t	0
5222	1290	38	18.0000	36.0000	ml	45.0000	f	t	0
5223	1290	39	36.0000	54.0000	ml	65.0000	f	t	0
5224	1290	34	18.0000	18.0000	ml	30.0000	f	t	0
5225	1290	35	18.0000	36.0000	ml	55.0000	t	t	0
5226	1290	36	36.0000	54.0000	ml	75.0000	f	t	0
5227	1291	76	150.0000	150.0000	ml	0.0000	f	t	0
5228	1291	77	170.0000	170.0000	ml	0.0000	t	t	0
5229	1291	78	190.0000	190.0000	ml	0.0000	f	t	0
5230	1293	113	30.0000	30.0000	ml	0.0000	t	t	0
5231	1294	80	10.0000	10.0000	ml	0.0000	f	t	0
5232	1294	81	20.0000	20.0000	ml	0.0000	f	t	0
5233	1294	82	30.0000	30.0000	ml	0.0000	f	t	0
5234	1294	86	1.0000	1.0000	ml	0.0000	f	t	0
5235	1294	87	2.0000	2.0000	ml	0.0000	f	t	0
5236	1294	88	3.0000	3.0000	ml	0.0000	f	t	0
5237	1294	65	1.0000	1.0000	ml	0.0000	f	t	0
5238	1294	66	2.0000	2.0000	ml	0.0000	f	t	0
5239	1294	67	3.0000	3.0000	ml	0.0000	f	t	0
5240	1294	83	10.0000	10.0000	ml	0.0000	f	t	0
5241	1294	84	20.0000	20.0000	ml	0.0000	f	t	0
5242	1294	85	30.0000	30.0000	ml	0.0000	f	t	0
5243	1295	112	0.0000	0.0000	ml	0.0000	f	t	0
5244	1295	79	35.0000	35.0000	ml	35.0000	t	t	0
6118	1490	55	0.0000	0.0000	ml	10.0000	f	t	0
6119	1490	56	0.0000	0.0000	ml	20.0000	f	t	0
6120	1490	57	30.0000	30.0000	ml	75.0000	f	t	0
6121	1490	58	10.0000	10.0000	ml	15.0000	f	t	0
6122	1490	59	20.0000	20.0000	ml	55.0000	f	t	0
6123	1490	61	30.0000	30.0000	ml	75.0000	f	t	0
6124	1490	62	10.0000	10.0000	ml	25.0000	f	t	0
6125	1490	63	20.0000	20.0000	ml	55.0000	f	t	0
6126	1490	64	30.0000	30.0000	ml	75.0000	f	t	0
6241	1522	66	0.0000	0.0000	ml	0.0000	f	t	0
5963	1456	80	10.0000	10.0000	ml	0.0000	f	t	0
5964	1456	81	20.0000	20.0000	ml	0.0000	f	t	0
5965	1456	82	30.0000	30.0000	ml	0.0000	f	t	0
5966	1456	86	1.0000	1.0000	ml	0.0000	f	t	0
5967	1456	87	2.0000	2.0000	ml	0.0000	f	t	0
5968	1456	88	3.0000	3.0000	ml	0.0000	f	t	0
5969	1456	65	0.0000	0.0000	ml	0.0000	f	t	0
5970	1456	66	0.0000	0.0000	ml	0.0000	f	t	0
5971	1456	67	0.0000	0.0000	ml	0.0000	f	t	0
2282	614	80	10.0000	10.0000	ml	0.0000	f	t	0
2283	614	81	20.0000	20.0000	ml	0.0000	f	t	0
2284	614	82	30.0000	30.0000	ml	0.0000	f	t	0
2285	614	86	1.0000	1.0000	ml	0.0000	f	t	0
2286	614	87	2.0000	2.0000	ml	0.0000	f	t	0
2287	614	88	3.0000	3.0000	ml	0.0000	f	t	0
2288	614	65	0.0000	0.0000	ml	0.0000	f	t	0
2289	614	66	0.0000	0.0000	ml	0.0000	f	t	0
2290	614	67	0.0000	0.0000	ml	0.0000	f	t	0
2291	614	83	10.0000	10.0000	ml	0.0000	f	t	0
2292	614	84	20.0000	20.0000	ml	0.0000	f	t	0
2293	614	85	30.0000	30.0000	ml	0.0000	f	t	0
2294	615	55	0.0000	0.0000	ml	10.0000	f	t	0
2295	615	56	0.0000	0.0000	ml	20.0000	f	t	0
2296	615	57	30.0000	30.0000	ml	75.0000	f	t	0
2297	615	58	10.0000	10.0000	ml	15.0000	f	t	0
2298	615	59	20.0000	20.0000	ml	55.0000	f	t	0
2299	615	61	30.0000	30.0000	ml	75.0000	f	t	0
2300	615	62	10.0000	10.0000	ml	25.0000	f	t	0
2301	615	63	20.0000	20.0000	ml	55.0000	f	t	0
2302	615	64	30.0000	30.0000	ml	75.0000	f	t	0
2303	616	34	18.0000	18.0000	ml	0.0000	f	t	0
2304	616	35	18.0000	36.0000	ml	40.0000	t	t	0
2305	616	36	36.0000	54.0000	ml	75.0000	f	t	0
2306	616	37	18.0000	18.0000	ml	35.0000	f	t	0
2307	616	38	18.0000	36.0000	ml	45.0000	t	t	0
2308	616	39	36.0000	54.0000	ml	65.0000	f	t	0
2309	617	76	170.0000	170.0000	ml	0.0000	f	t	0
2310	617	77	190.0000	190.0000	ml	0.0000	t	t	0
2311	617	78	210.0000	2100.0000	ml	0.0000	f	t	0
2312	619	112	0.0000	0.0000	ml	0.0000	f	t	0
2313	619	79	35.0000	35.0000	ml	35.0000	t	t	0
5972	1456	83	10.0000	10.0000	ml	0.0000	f	t	0
2855	740	80	10.0000	10.0000	ml	0.0000	f	t	0
2856	740	81	20.0000	20.0000	ml	0.0000	f	t	0
2857	740	82	30.0000	30.0000	ml	0.0000	f	t	0
2858	740	86	1.0000	1.0000	ml	0.0000	f	t	0
2859	740	87	2.0000	2.0000	ml	0.0000	f	t	0
2860	740	88	3.0000	3.0000	ml	0.0000	f	t	0
2861	740	65	0.0000	0.0000	ml	0.0000	f	t	0
2862	740	66	0.0000	0.0000	ml	0.0000	f	t	0
2863	740	67	0.0000	0.0000	ml	0.0000	f	t	0
2864	740	83	10.0000	10.0000	ml	0.0000	f	t	0
2865	740	84	20.0000	20.0000	ml	0.0000	f	t	0
2866	740	85	30.0000	30.0000	ml	0.0000	f	t	0
2867	741	52	20.0000	20.0000	ml	30.0000	f	t	0
2868	741	53	40.0000	40.0000	ml	55.0000	t	t	0
2869	741	54	60.0000	60.0000	ml	75.0000	f	t	0
2870	742	34	18.0000	18.0000	ml	0.0000	f	t	0
2871	742	35	18.0000	36.0000	ml	40.0000	t	t	0
2872	742	36	36.0000	54.0000	ml	75.0000	f	t	0
2873	742	37	18.0000	18.0000	ml	35.0000	f	t	0
2874	742	38	18.0000	36.0000	ml	45.0000	t	t	0
2875	742	39	36.0000	54.0000	ml	65.0000	f	t	0
2876	743	76	170.0000	170.0000	ml	0.0000	f	t	0
2877	743	77	190.0000	190.0000	ml	0.0000	t	t	0
2878	743	78	210.0000	210.0000	ml	0.0000	f	t	0
2879	745	79	35.0000	35.0000	ml	35.0000	t	t	0
5973	1456	84	20.0000	20.0000	ml	0.0000	f	t	0
5974	1456	85	30.0000	30.0000	ml	0.0000	f	t	0
5975	1457	114	10.0000	10.0000	ml	0.0000	f	t	0
2343	627	80	10.0000	10.0000	ml	0.0000	f	t	0
2344	627	81	20.0000	20.0000	ml	0.0000	f	t	0
2345	627	82	30.0000	30.0000	ml	0.0000	f	t	0
2346	627	86	1.0000	1.0000	ml	0.0000	f	t	0
2347	627	87	2.0000	2.0000	ml	0.0000	f	t	0
2348	627	88	3.0000	3.0000	ml	0.0000	f	t	0
2349	627	65	0.0000	0.0000	ml	0.0000	f	t	0
2350	627	66	0.0000	0.0000	ml	0.0000	f	t	0
2351	627	67	0.0000	0.0000	ml	0.0000	f	t	0
2352	627	83	10.0000	10.0000	ml	0.0000	f	t	0
2353	627	84	20.0000	20.0000	ml	0.0000	f	t	0
2354	627	85	30.0000	30.0000	ml	0.0000	f	t	0
2355	628	91	45.0000	45.0000	ml	75.0000	f	t	0
2356	628	90	30.0000	30.0000	ml	55.0000	f	t	0
2357	628	89	15.0000	15.0000	ml	35.0000	t	t	0
2358	629	55	15.0000	15.0000	ml	10.0000	t	t	0
2359	629	56	25.0000	25.0000	ml	20.0000	f	t	0
2360	629	57	35.0000	35.0000	ml	75.0000	f	t	0
5976	1457	115	20.0000	20.0000	ml	0.0000	t	t	0
5977	1457	116	30.0000	30.0000	ml	0.0000	f	t	0
5978	1458	102	10.0000	10.0000	ml	30.0000	f	t	0
2364	630	37	18.0000	18.0000	ml	35.0000	f	t	0
2365	630	38	18.0000	36.0000	ml	45.0000	t	t	0
2366	630	39	36.0000	54.0000	ml	65.0000	f	t	0
2367	631	76	160.0000	160.0000	ml	0.0000	f	t	0
2368	631	77	180.0000	180.0000	ml	0.0000	t	t	0
2369	631	78	200.0000	200.0000	ml	0.0000	f	t	0
2370	633	79	35.0000	35.0000	ml	35.0000	t	t	0
5979	1458	103	20.0000	20.0000	ml	55.0000	t	t	0
5980	1458	104	30.0000	30.0000	ml	75.0000	f	t	0
5981	1458	105	0.0000	0.0000	ml	0.0000	f	t	0
5982	1459	43	18.0000	18.0000	ml	0.0000	f	f	0
5983	1459	122	30.0000	30.0000	ml	0.0000	t	t	0
5984	1460	34	18.0000	18.0000	ml	30.0000	f	t	0
5985	1460	35	18.0000	36.0000	ml	40.0000	t	t	0
5986	1460	36	36.0000	54.0000	ml	60.0000	f	t	0
5987	1460	37	18.0000	18.0000	ml	35.0000	f	t	0
5988	1460	38	18.0000	36.0000	ml	45.0000	f	t	0
5989	1460	39	36.0000	54.0000	ml	65.0000	f	t	0
5990	1461	76	170.0000	170.0000	ml	0.0000	f	t	0
5991	1461	77	190.0000	190.0000	ml	0.0000	t	t	0
5992	1461	78	210.0000	210.0000	ml	0.0000	f	t	0
5993	1463	112	0.0000	0.0000	ml	0.0000	f	f	0
5994	1463	79	35.0000	35.0000	ml	35.0000	f	f	0
6127	1491	49	20.0000	20.0000	ml	0.0000	f	t	0
6128	1491	50	30.0000	30.0000	ml	0.0000	t	t	0
6129	1491	51	40.0000	40.0000	ml	0.0000	f	t	0
6130	1492	43	18.0000	18.0000	ml	0.0000	f	f	0
6131	1492	122	20.0000	20.0000	ml	0.0000	t	t	0
6132	1493	34	18.0000	18.0000	ml	0.0000	f	t	0
6133	1493	35	18.0000	36.0000	ml	40.0000	t	t	0
6134	1493	36	36.0000	54.0000	ml	75.0000	f	t	0
6135	1493	37	18.0000	18.0000	ml	35.0000	f	t	0
6136	1493	38	18.0000	36.0000	ml	45.0000	f	t	0
2397	640	80	10.0000	10.0000	ml	0.0000	f	t	0
2398	640	81	20.0000	20.0000	ml	0.0000	f	t	0
2399	640	82	30.0000	30.0000	ml	0.0000	f	t	0
2400	640	86	1.0000	1.0000	ml	0.0000	f	t	0
2401	640	87	2.0000	2.0000	ml	0.0000	f	t	0
2402	640	88	3.0000	3.0000	ml	0.0000	f	t	0
2403	640	65	0.0000	0.0000	ml	0.0000	f	t	0
2404	640	66	0.0000	0.0000	ml	0.0000	f	t	0
2405	640	67	0.0000	0.0000	ml	0.0000	f	t	0
2406	640	83	10.0000	10.0000	ml	0.0000	f	t	0
2407	640	84	20.0000	20.0000	ml	0.0000	f	t	0
2408	640	85	30.0000	30.0000	ml	0.0000	f	t	0
2409	641	96	15.0000	15.0000	ml	30.0000	f	t	0
2410	641	97	30.0000	30.0000	ml	55.0000	t	t	0
2411	641	98	45.0000	45.0000	ml	75.0000	f	t	0
6137	1493	39	36.0000	54.0000	ml	65.0000	f	t	0
6138	1494	76	170.0000	170.0000	ml	0.0000	f	t	0
6139	1494	77	190.0000	190.0000	ml	0.0000	t	t	0
2415	642	37	18.0000	18.0000	ml	35.0000	f	t	0
2416	642	38	18.0000	36.0000	ml	45.0000	t	t	0
2417	642	39	36.0000	54.0000	ml	65.0000	f	t	0
2418	643	76	170.0000	170.0000	ml	0.0000	f	t	0
2419	643	77	190.0000	190.0000	ml	0.0000	t	t	0
2420	643	78	210.0000	210.0000	ml	0.0000	f	t	0
2421	645	79	35.0000	35.0000	ml	35.0000	t	t	0
6140	1494	78	210.0000	210.0000	ml	0.0000	f	t	0
6141	1496	79	35.0000	35.0000	ml	35.0000	f	f	0
3949	990	83	10.0000	10.0000	ml	0.0000	f	t	0
3950	990	84	20.0000	20.0000	ml	0.0000	f	t	0
3951	990	85	30.0000	30.0000	ml	0.0000	f	t	0
3952	990	65	1.0000	1.0000	ml	0.0000	f	t	0
3953	990	66	2.0000	2.0000	ml	0.0000	f	t	0
3954	990	67	3.0000	3.0000	ml	0.0000	f	t	0
3955	990	80	10.0000	10.0000	ml	0.0000	f	t	0
3956	990	81	20.0000	20.0000	ml	0.0000	f	t	0
3957	990	82	30.0000	30.0000	ml	0.0000	f	t	0
3958	990	86	1.0000	1.0000	ml	0.0000	f	t	0
3959	990	87	2.0000	2.0000	ml	0.0000	f	t	0
3960	990	88	3.0000	3.0000	ml	0.0000	f	t	0
3961	991	55	10.0000	10.0000	ml	30.0000	f	t	0
3962	991	56	20.0000	20.0000	ml	55.0000	f	t	0
3963	991	57	30.0000	30.0000	ml	75.0000	f	t	0
3964	991	62	10.0000	10.0000	ml	30.0000	f	t	0
3965	991	63	20.0000	20.0000	ml	55.0000	f	t	0
3966	991	64	30.0000	30.0000	ml	75.0000	f	t	0
3967	991	58	10.0000	10.0000	ml	30.0000	f	t	0
6242	1522	67	0.0000	0.0000	ml	0.0000	f	t	0
6243	1522	83	10.0000	10.0000	ml	0.0000	f	t	0
6244	1522	84	20.0000	20.0000	ml	0.0000	f	t	0
6245	1522	85	30.0000	30.0000	ml	0.0000	f	t	0
6246	1523	55	0.0000	0.0000	ml	10.0000	f	t	0
6247	1523	56	0.0000	0.0000	ml	20.0000	f	t	0
6248	1523	57	30.0000	30.0000	ml	75.0000	f	t	0
6249	1523	58	10.0000	10.0000	ml	15.0000	f	t	0
6250	1523	59	20.0000	20.0000	ml	55.0000	f	t	0
6251	1523	61	30.0000	30.0000	ml	75.0000	f	t	0
6252	1523	62	10.0000	10.0000	ml	25.0000	f	t	0
6253	1523	63	20.0000	20.0000	ml	55.0000	f	t	0
5568	1368	77	190.0000	190.0000	ml	0.0000	t	t	0
5569	1368	78	210.0000	210.0000	ml	0.0000	f	t	0
5570	1369	34	18.0000	18.0000	ml	30.0000	f	t	0
2678	699	80	10.0000	10.0000	ml	0.0000	f	t	0
2679	699	81	20.0000	20.0000	ml	0.0000	f	t	0
2680	699	82	30.0000	30.0000	ml	0.0000	f	t	0
2681	699	86	1.0000	1.0000	ml	0.0000	f	t	0
2682	699	87	2.0000	2.0000	ml	0.0000	f	t	0
2683	699	88	3.0000	3.0000	ml	0.0000	f	t	0
2684	699	65	0.0000	0.0000	ml	0.0000	f	t	0
2685	699	66	0.0000	0.0000	ml	0.0000	f	t	0
2686	699	67	0.0000	0.0000	ml	0.0000	f	t	0
2687	699	83	10.0000	10.0000	ml	0.0000	f	t	0
2688	699	84	20.0000	20.0000	ml	0.0000	f	t	0
2689	699	85	30.0000	30.0000	ml	0.0000	f	t	0
2690	700	49	15.0000	15.0000	ml	0.0000	f	t	0
2691	700	50	30.0000	30.0000	ml	0.0000	t	t	0
2692	700	51	45.0000	45.0000	ml	0.0000	f	t	0
5571	1369	35	18.0000	36.0000	ml	55.0000	t	t	0
5572	1369	36	36.0000	54.0000	ml	75.0000	f	t	0
5573	1369	37	18.0000	18.0000	ml	35.0000	f	t	0
2696	701	37	18.0000	18.0000	ml	35.0000	f	t	0
2697	701	38	18.0000	36.0000	ml	45.0000	t	t	0
2698	701	39	36.0000	54.0000	ml	65.0000	f	t	0
2699	702	76	170.0000	170.0000	ml	0.0000	f	t	0
2700	702	77	190.0000	190.0000	ml	0.0000	t	t	0
2701	702	78	210.0000	210.0000	ml	0.0000	f	t	0
2702	704	112	0.0000	0.0000	ml	0.0000	f	f	0
2703	704	79	35.0000	35.0000	ml	35.0000	t	t	0
5574	1369	38	18.0000	36.0000	ml	45.0000	f	t	0
5575	1369	39	36.0000	54.0000	ml	65.0000	f	t	0
5576	1370	113	30.0000	30.0000	ml	0.0000	f	t	0
5577	1372	112	0.0000	0.0000	ml	0.0000	f	f	0
5578	1372	79	35.0000	35.0000	ml	35.0000	f	f	0
5694	1401	80	10.0000	10.0000	ml	0.0000	f	t	0
5695	1401	81	20.0000	20.0000	ml	0.0000	f	t	0
5696	1401	82	30.0000	30.0000	ml	0.0000	f	t	0
5697	1401	86	1.0000	1.0000	ml	0.0000	f	t	0
5698	1401	87	2.0000	2.0000	ml	0.0000	f	t	0
5699	1401	88	3.0000	3.0000	ml	0.0000	f	t	0
5700	1401	65	0.0000	0.0000	ml	0.0000	f	t	0
5701	1401	66	0.0000	0.0000	ml	0.0000	f	t	0
5702	1401	67	0.0000	0.0000	ml	0.0000	f	t	0
5703	1401	83	10.0000	10.0000	ml	0.0000	f	t	0
5704	1401	84	20.0000	20.0000	ml	0.0000	f	t	0
2764	720	80	10.0000	10.0000	ml	0.0000	f	t	0
2765	720	81	20.0000	20.0000	ml	0.0000	f	t	0
2766	720	82	30.0000	30.0000	ml	0.0000	f	t	0
2767	720	86	1.0000	1.0000	ml	0.0000	f	t	0
2768	720	87	2.0000	2.0000	ml	0.0000	f	t	0
2769	720	88	3.0000	3.0000	ml	0.0000	f	t	0
2770	720	65	0.0000	0.0000	ml	0.0000	f	t	0
2771	720	66	0.0000	0.0000	ml	0.0000	f	t	0
2772	720	67	0.0000	0.0000	ml	0.0000	f	t	0
2773	720	83	10.0000	10.0000	ml	0.0000	f	t	0
2774	720	84	20.0000	20.0000	ml	0.0000	f	t	0
2775	720	85	30.0000	30.0000	ml	0.0000	f	t	0
2776	721	62	10.0000	10.0000	ml	25.0000	t	t	0
2777	721	63	20.0000	20.0000	ml	55.0000	f	t	0
2778	721	64	30.0000	30.0000	ml	75.0000	f	t	0
2779	722	49	15.0000	15.0000	ml	30.0000	f	t	0
2780	722	50	30.0000	30.0000	ml	55.0000	t	t	0
2781	722	51	45.0000	45.0000	ml	75.0000	f	t	0
2782	723	34	18.0000	18.0000	ml	0.0000	f	t	0
2783	723	35	18.0000	36.0000	ml	40.0000	t	t	0
2784	723	36	36.0000	54.0000	ml	75.0000	f	t	0
2785	723	37	18.0000	18.0000	ml	35.0000	f	t	0
2786	723	38	18.0000	36.0000	ml	45.0000	t	t	0
2787	723	39	36.0000	54.0000	ml	65.0000	f	t	0
2788	724	76	170.0000	170.0000	ml	0.0000	f	t	0
2789	724	77	190.0000	190.0000	ml	0.0000	t	t	0
2790	724	78	210.0000	210.0000	ml	0.0000	f	t	0
2791	726	79	35.0000	35.0000	ml	35.0000	t	t	0
5705	1401	85	30.0000	30.0000	ml	0.0000	f	t	0
5706	1402	102	15.0000	15.0000	ml	30.0000	f	t	0
5707	1402	103	30.0000	30.0000	ml	55.0000	t	t	0
5708	1402	104	45.0000	45.0000	ml	75.0000	f	t	0
5709	1402	105	0.0000	0.0000	ml	0.0000	f	t	0
5710	1403	43	18.0000	18.0000	ml	0.0000	f	f	0
5711	1403	122	30.0000	30.0000	ml	0.0000	t	t	0
5712	1404	34	18.0000	18.0000	ml	30.0000	f	t	0
5713	1404	35	18.0000	36.0000	ml	40.0000	t	t	0
5714	1404	36	36.0000	54.0000	ml	75.0000	f	t	0
5715	1404	37	18.0000	18.0000	ml	35.0000	f	t	0
5716	1404	38	18.0000	36.0000	ml	45.0000	f	t	0
5717	1404	39	36.0000	54.0000	ml	65.0000	f	t	0
5718	1405	76	170.0000	170.0000	ml	0.0000	f	t	0
5719	1405	77	190.0000	190.0000	ml	0.0000	t	t	0
5720	1405	78	210.0000	210.0000	ml	0.0000	f	t	0
6254	1523	64	30.0000	30.0000	ml	75.0000	f	t	0
6255	1524	49	15.0000	15.0000	ml	0.0000	f	t	0
6256	1524	50	30.0000	30.0000	ml	0.0000	t	t	0
6257	1524	51	45.0000	45.0000	ml	0.0000	f	t	0
6258	1525	113	30.0000	30.0000	ml	0.0000	t	t	0
6259	1526	34	18.0000	18.0000	ml	30.0000	f	t	0
6260	1526	35	18.0000	36.0000	ml	40.0000	t	t	0
6261	1526	36	36.0000	54.0000	ml	60.0000	f	t	0
6262	1526	37	18.0000	18.0000	ml	35.0000	f	t	0
6263	1526	38	18.0000	36.0000	ml	45.0000	t	t	0
6264	1526	39	36.0000	54.0000	ml	65.0000	f	t	0
6265	1527	76	170.0000	170.0000	ml	0.0000	f	t	0
6266	1527	77	190.0000	190.0000	ml	0.0000	t	t	0
6267	1527	78	210.0000	210.0000	ml	0.0000	f	t	0
6268	1529	112	0.0000	0.0000	ml	0.0000	f	f	0
6269	1529	79	35.0000	35.0000	ml	35.0000	f	f	0
2936	764	80	10.0000	10.0000	ml	0.0000	f	t	0
2937	764	81	20.0000	20.0000	ml	0.0000	f	t	0
2938	764	82	30.0000	30.0000	ml	0.0000	f	t	0
2939	764	86	1.0000	1.0000	ml	0.0000	f	t	0
2940	764	87	2.0000	2.0000	ml	0.0000	f	t	0
2941	764	88	3.0000	3.0000	ml	0.0000	f	t	0
2942	764	65	0.0000	0.0000	ml	0.0000	f	t	0
2943	764	66	0.0000	0.0000	ml	0.0000	f	t	0
2944	764	67	0.0000	0.0000	ml	0.0000	f	t	0
2945	764	83	10.0000	10.0000	ml	0.0000	f	t	0
2946	764	84	20.0000	20.0000	ml	0.0000	f	t	0
2947	764	85	30.0000	30.0000	ml	0.0000	f	t	0
2948	765	96	20.0000	20.0000	ml	30.0000	f	t	0
2949	765	97	40.0000	40.0000	ml	55.0000	t	t	0
2950	765	98	60.0000	60.0000	ml	75.0000	f	t	0
2951	766	113	30.0000	30.0000	ml	0.0000	t	t	0
2955	767	37	18.0000	18.0000	ml	35.0000	f	t	0
2956	767	38	18.0000	36.0000	ml	45.0000	f	t	0
2957	767	39	36.0000	54.0000	ml	65.0000	f	t	0
2958	768	76	170.0000	170.0000	ml	0.0000	f	t	0
2959	768	77	190.0000	190.0000	ml	0.0000	t	t	0
2960	768	78	210.0000	210.0000	ml	0.0000	f	t	0
2961	769	102	15.0000	15.0000	ml	30.0000	f	t	0
2962	769	103	30.0000	30.0000	ml	55.0000	f	t	0
2963	769	104	45.0000	45.0000	ml	75.0000	f	t	0
2964	769	105	0.0000	0.0000	ml	0.0000	f	t	0
2965	770	112	0.0000	0.0000	ml	0.0000	f	f	0
2966	770	79	30.0000	30.0000	ml	35.0000	t	t	0
6142	1497	49	5.0000	5.0000	ml	0.0000	t	t	0
6143	1497	50	20.0000	20.0000	ml	0.0000	f	f	0
6144	1497	51	15.0000	15.0000	ml	0.0000	f	f	0
2988	777	121	3.0000	70.0000	ml	50.0000	f	t	0
2989	778	80	10.0000	10.0000	ml	0.0000	f	t	0
2990	778	81	20.0000	20.0000	ml	0.0000	f	t	0
2991	778	82	30.0000	30.0000	ml	0.0000	f	t	0
2992	778	86	1.0000	1.0000	ml	0.0000	f	t	0
2993	778	87	2.0000	2.0000	ml	0.0000	f	t	0
2994	778	88	3.0000	3.0000	ml	0.0000	f	t	0
2995	778	65	0.0000	0.0000	ml	0.0000	f	t	0
2996	778	66	0.0000	0.0000	ml	0.0000	f	t	0
2997	778	67	0.0000	0.0000	ml	0.0000	f	t	0
2998	778	83	10.0000	10.0000	ml	0.0000	f	t	0
2999	778	84	20.0000	20.0000	ml	0.0000	f	t	0
3000	778	85	30.0000	30.0000	ml	0.0000	f	t	0
3001	779	117	30.0000	30.0000	ml	55.0000	f	t	0
3002	779	118	50.0000	50.0000	ml	75.0000	t	t	0
3003	779	119	60.0000	60.0000	ml	95.0000	f	t	0
3004	780	76	170.0000	170.0000	ml	0.0000	f	t	0
3005	780	77	190.0000	190.0000	ml	0.0000	t	t	0
3006	780	78	210.0000	210.0000	ml	0.0000	f	t	0
3007	782	79	35.0000	35.0000	ml	35.0000	t	t	0
3042	790	80	10.0000	10.0000	ml	0.0000	f	t	0
3043	790	81	20.0000	20.0000	ml	0.0000	f	t	0
3044	790	82	30.0000	30.0000	ml	0.0000	f	t	0
3045	790	86	1.0000	1.0000	ml	0.0000	f	t	0
3046	790	87	2.0000	2.0000	ml	0.0000	f	t	0
3047	790	88	3.0000	3.0000	ml	0.0000	f	t	0
3048	790	65	0.0000	0.0000	ml	0.0000	f	t	0
3049	790	66	0.0000	0.0000	ml	0.0000	f	t	0
3050	790	67	0.0000	0.0000	ml	0.0000	f	t	0
3051	790	83	10.0000	10.0000	ml	0.0000	f	t	0
3052	790	84	20.0000	20.0000	ml	0.0000	f	t	0
3053	790	85	30.0000	30.0000	ml	0.0000	f	t	0
3054	791	52	10.0000	10.0000	ml	30.0000	f	t	0
3055	791	53	20.0000	20.0000	ml	55.0000	t	t	0
3056	791	54	30.0000	30.0000	ml	75.0000	f	t	0
3057	792	121	3.0000	70.0000	ml	0.0000	f	t	0
3058	793	76	170.0000	170.0000	ml	0.0000	f	t	0
3059	793	77	190.0000	190.0000	ml	0.0000	t	t	0
3060	793	78	210.0000	210.0000	ml	0.0000	f	t	0
3061	795	112	0.0000	0.0000	ml	0.0000	f	f	0
3062	795	79	35.0000	35.0000	ml	35.0000	t	t	0
3968	991	59	20.0000	20.0000	ml	55.0000	f	t	0
3969	991	61	30.0000	30.0000	ml	75.0000	f	t	0
3973	992	37	18.0000	18.0000	ml	35.0000	f	t	0
3974	992	38	18.0000	36.0000	ml	45.0000	t	t	0
3975	992	39	36.0000	54.0000	ml	65.0000	f	t	0
3976	993	76	170.0000	170.0000	ml	0.0000	f	t	0
3977	993	77	190.0000	190.0000	ml	0.0000	t	t	0
3978	993	78	190.0000	190.0000	ml	0.0000	f	t	0
3979	994	92	30.0000	30.0000	ml	0.0000	t	t	0
3980	996	112	0.0000	0.0000	ml	0.0000	f	f	0
3981	996	79	35.0000	35.0000	ml	0.0000	t	t	0
4269	1070	80	10.0000	10.0000	ml	0.0000	t	t	0
4270	1070	81	20.0000	20.0000	ml	0.0000	f	t	0
4271	1070	82	30.0000	30.0000	ml	0.0000	f	t	0
4272	1070	86	1.0000	1.0000	ml	0.0000	t	t	0
4273	1070	87	2.0000	2.0000	ml	0.0000	f	t	0
4274	1070	88	3.0000	3.0000	ml	0.0000	f	t	0
4275	1070	65	0.0000	0.0000	ml	0.0000	t	t	0
4276	1070	66	0.0000	0.0000	ml	0.0000	f	t	0
5552	1366	80	10.0000	10.0000	ml	0.0000	f	t	0
5553	1366	81	20.0000	20.0000	ml	0.0000	f	t	0
5554	1366	82	30.0000	30.0000	ml	0.0000	f	t	0
5555	1366	86	1.0000	1.0000	ml	0.0000	f	t	0
5556	1366	87	2.0000	2.0000	ml	0.0000	f	t	0
5557	1366	88	3.0000	3.0000	ml	0.0000	f	t	0
5558	1366	65	1.0000	1.0000	ml	0.0000	t	t	0
5559	1366	66	2.0000	2.0000	ml	0.0000	f	t	0
5560	1366	67	3.0000	3.0000	ml	0.0000	f	t	0
5561	1366	83	10.0000	10.0000	ml	0.0000	f	t	0
5562	1366	84	20.0000	20.0000	ml	0.0000	f	t	0
5563	1366	85	30.0000	30.0000	ml	0.0000	f	t	0
5564	1367	96	15.0000	15.0000	ml	30.0000	f	t	0
5565	1367	97	30.0000	30.0000	ml	55.0000	t	t	0
5566	1367	98	45.0000	45.0000	ml	75.0000	f	t	0
5567	1368	76	170.0000	170.0000	ml	0.0000	f	t	0
4277	1070	67	0.0000	0.0000	ml	0.0000	f	t	0
4278	1070	83	10.0000	10.0000	ml	0.0000	t	t	0
4279	1070	84	20.0000	20.0000	ml	0.0000	f	t	0
4280	1070	85	30.0000	30.0000	ml	0.0000	f	t	0
4281	1071	91	45.0000	45.0000	ml	75.0000	f	t	0
4282	1071	90	30.0000	30.0000	ml	55.0000	f	t	0
4283	1071	89	15.0000	15.0000	ml	30.0000	t	t	0
4284	1072	113	30.0000	30.0000	ml	0.0000	t	t	0
4285	1073	34	18.0000	18.0000	ml	30.0000	f	t	0
4286	1073	35	18.0000	36.0000	ml	40.0000	t	t	0
4287	1073	36	36.0000	54.0000	ml	60.0000	f	t	0
4288	1073	37	18.0000	18.0000	ml	35.0000	f	t	0
4289	1073	38	18.0000	36.0000	ml	45.0000	f	t	0
4290	1073	39	36.0000	54.0000	ml	65.0000	f	t	0
4291	1074	76	110.0000	110.0000	ml	0.0000	f	t	0
4292	1074	77	130.0000	130.0000	ml	0.0000	t	t	0
4293	1074	78	150.0000	150.0000	ml	0.0000	f	t	0
6282	1538	106	10.0000	10.0000	ml	30.0000	f	t	0
6283	1538	107	20.0000	20.0000	ml	55.0000	t	t	0
6284	1538	108	30.0000	30.0000	ml	75.0000	f	t	0
6285	1539	76	150.0000	150.0000	ml	0.0000	f	t	0
6286	1539	77	170.0000	170.0000	ml	0.0000	t	t	0
6287	1539	78	190.0000	190.0000	ml	0.0000	f	t	0
6288	1541	123	5.0000	5.0000	ml	0.0000	t	t	0
6621	1570	49	15.0000	15.0000	ml	30.0000	f	t	0
6622	1570	50	30.0000	30.0000	ml	55.0000	t	t	0
6623	1570	51	45.0000	45.0000	ml	75.0000	f	t	0
6624	1571	96	10.0000	10.0000	ml	30.0000	t	t	0
6625	1571	97	20.0000	20.0000	ml	55.0000	f	t	0
6626	1571	98	30.0000	30.0000	ml	75.0000	f	t	0
6627	1572	130	20.0000	20.0000	ml	55.0000	f	t	0
3897	977	34	18.0000	18.0000	ml	0.0000	f	t	0
3898	977	35	18.0000	36.0000	ml	40.0000	t	t	0
3899	977	36	36.0000	54.0000	ml	75.0000	f	t	0
3900	977	37	18.0000	18.0000	ml	35.0000	f	t	0
3901	977	38	18.0000	36.0000	ml	45.0000	f	t	0
3902	977	39	36.0000	54.0000	ml	65.0000	f	t	0
3903	979	55	10.0000	10.0000	ml	25.0000	f	t	0
3904	979	56	20.0000	20.0000	ml	35.0000	f	t	0
3905	979	57	30.0000	30.0000	ml	45.0000	f	t	0
3906	979	58	10.0000	10.0000	ml	25.0000	f	t	0
3907	979	59	20.0000	20.0000	ml	35.0000	f	t	0
3908	979	61	30.0000	30.0000	ml	45.0000	f	t	0
3909	979	62	10.0000	10.0000	ml	25.0000	f	t	0
3910	979	63	20.0000	20.0000	ml	35.0000	f	t	0
3911	979	64	30.0000	30.0000	ml	45.0000	f	t	0
3912	980	76	130.0000	130.0000	ml	0.0000	f	t	0
3913	980	77	150.0000	150.0000	ml	0.0000	t	t	0
3914	980	78	170.0000	170.0000	ml	0.0000	f	t	0
3915	982	79	35.0000	35.0000	ml	0.0000	f	t	0
6628	1572	131	30.0000	30.0000	ml	75.0000	f	t	0
6629	1572	129	10.0000	10.0000	ml	30.0000	t	t	0
6630	1573	92	30.0000	30.0000	ml	0.0000	t	t	0
6631	1574	76	170.0000	170.0000	ml	0.0000	f	t	0
6632	1574	77	190.0000	190.0000	ml	0.0000	t	t	0
6633	1574	78	210.0000	210.0000	ml	0.0000	f	t	0
6634	1576	112	0.0000	0.0000	ml	0.0000	f	f	0
5212	1289	55	0.0000	0.0000	ml	30.0000	f	t	0
5213	1289	56	0.0000	0.0000	ml	55.0000	f	t	0
5214	1289	57	30.0000	30.0000	ml	75.0000	f	t	0
5215	1289	58	10.0000	10.0000	ml	30.0000	f	t	0
5216	1289	59	20.0000	20.0000	ml	55.0000	f	t	0
5217	1289	61	30.0000	30.0000	ml	75.0000	f	t	0
5218	1289	62	10.0000	10.0000	ml	30.0000	f	t	0
6635	1576	79	35.0000	35.0000	ml	35.0000	f	f	0
3688	930	121	3.0000	70.0000	ml	0.0000	t	t	0
3689	931	80	10.0000	10.0000	ml	0.0000	f	t	0
3690	931	81	20.0000	20.0000	ml	0.0000	t	t	0
3691	931	82	30.0000	30.0000	ml	0.0000	f	t	0
3692	932	76	170.0000	170.0000	ml	0.0000	f	t	0
3693	932	77	190.0000	190.0000	ml	0.0000	t	t	0
3694	932	78	210.0000	210.0000	ml	0.0000	f	t	0
3695	934	112	0.0000	0.0000	ml	0.0000	t	t	0
3696	934	79	35.0000	35.0000	ml	35.0000	f	t	0
4046	1013	34	18.0000	18.0000	ml	30.0000	f	t	0
4047	1013	35	18.0000	36.0000	ml	40.0000	t	t	0
4048	1013	36	36.0000	54.0000	ml	60.0000	f	t	0
4049	1013	37	18.0000	18.0000	ml	35.0000	f	t	0
4050	1013	38	18.0000	36.0000	ml	45.0000	t	t	0
4051	1013	39	36.0000	54.0000	ml	65.0000	f	t	0
4052	1014	73	15.0000	15.0000	ml	30.0000	f	t	0
4053	1014	74	35.0000	35.0000	ml	55.0000	t	t	0
4054	1014	75	45.0000	45.0000	ml	75.0000	f	t	0
4055	1015	55	10.0000	10.0000	ml	30.0000	t	t	0
4056	1015	56	20.0000	20.0000	ml	55.0000	f	t	0
4057	1015	57	30.0000	30.0000	ml	75.0000	f	t	0
4058	1015	58	10.0000	10.0000	ml	30.0000	t	t	0
4059	1015	59	20.0000	20.0000	ml	55.0000	f	t	0
4060	1015	61	30.0000	30.0000	ml	75.0000	f	t	0
4061	1016	76	170.0000	170.0000	ml	0.0000	f	t	0
4062	1016	77	190.0000	190.0000	ml	0.0000	t	t	0
4063	1016	78	210.0000	210.0000	ml	0.0000	f	t	0
4064	1018	112	0.0000	0.0000	ml	0.0000	f	f	0
4065	1018	79	35.0000	35.0000	ml	0.0000	f	t	0
4066	1019	65	1.0000	1.0000	ml	0.0000	f	t	0
4067	1019	66	2.0000	2.0000	ml	0.0000	f	t	0
4068	1019	67	3.0000	3.0000	ml	0.0000	f	t	0
4069	1019	86	1.0000	1.0000	ml	0.0000	f	t	0
4070	1019	87	2.0000	2.0000	ml	0.0000	f	t	0
4071	1019	88	3.0000	3.0000	ml	0.0000	f	t	0
4072	1019	80	10.0000	10.0000	ml	0.0000	f	t	0
4073	1019	81	20.0000	20.0000	ml	0.0000	f	t	0
4074	1019	82	30.0000	30.0000	ml	0.0000	f	t	0
4075	1019	83	10.0000	10.0000	ml	0.0000	f	t	0
4076	1019	84	20.0000	20.0000	ml	0.0000	f	t	0
4077	1019	85	30.0000	30.0000	ml	0.0000	f	t	0
4078	1020	113	30.0000	30.0000	ml	0.0000	f	t	0
\.


--
-- Data for Name: drinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drinks (id, name, description, category, base_price, image_url, is_active, prep_time_seconds, cup_size_ml, kitchen_station, created_at, updated_at, category_id, sort_order) FROM stdin;
7	Vanilla Latte	Latte with vanilla syrup	Hot Coffee	155.00	/uploads/drink-1776539794759.webp	f	180	\N	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:26.674+00	1	0
8	Cold Brew	Smooth cold brew concentrate over ice	Cold Brew	140.00	\N	f	60	\N	cold	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:35.322+00	2	0
9	Iced Latte	Espresso with cold milk over ice	Cold Coffee	140.00	/uploads/drink-1776469492324.webp	f	120	\N	cold	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:55.468+00	3	0
12	Iced Caramel Macchiato	Cold espresso with vanilla and caramel over milk	Cold Coffee	175.00	/uploads/drink-1776469513061.webp	f	150	\N	cold	2026-04-16 22:56:14.298422+00	2026-04-19 15:44:01.307+00	3	0
10	Matcha Latte	Ceremonial matcha with steamed milk	Specialty	170.00	/uploads/drink-1776469536354.webp	f	210	\N	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:44:07.034+00	4	0
47	Salted Vanilla Frappe	Salted Vanilla Frappe	Frappe	0.00	\N	t	180	356	cold-bar	2026-04-21 15:04:56.671743+00	2026-04-22 11:05:01.453+00	\N	0
17	Espresso Conpana	\N	Hot Coffee	130.00	/uploads/drink-1776603853111.webp	t	180	300	hot-bar	2026-04-19 12:33:29.928418+00	2026-04-21 09:28:44.107+00	\N	0
18	Red Eye	\N	Hot Coffee	205.00	/uploads/drink-1776604172685.webp	t	120	\N	hot-bar	2026-04-19 13:09:32.601751+00	2026-04-21 09:28:51.421+00	\N	0
25	Cappucino Frappe	\N	Frappe	0.00	/uploads/drink-1776768691663.webp	t	180	356	cold-bar	2026-04-20 14:57:51.071604+00	2026-04-22 10:01:15.241+00	6	0
23	Iced Salted Cortado	\N	Cold Coffee	160.00	/uploads/drink-1776673259684.webp	t	180	240	cold-bar	2026-04-20 08:20:59.311017+00	2026-04-21 09:31:09.454+00	\N	0
14	Cappuccino 	\N	Hot Coffee	130.00	/uploads/drink-1776594692815.webp	t	180	286	cold-bar	2026-04-18 20:55:06.672696+00	2026-04-21 09:31:25.424+00	\N	0
21	Iced Cappuccino	\N	Cold Coffee	135.00	/uploads/drink-1776620485955.webp	t	180	356	cold-bar	2026-04-19 16:27:26.264089+00	2026-04-22 08:36:57.119+00	\N	0
41	Iced Louts Spanish Latte	\N	Cold Coffee	0.00	/uploads/drink-1776780668361.webp	t	180	406	cold-bar	2026-04-21 14:11:08.291641+00	2026-04-21 14:22:01.973+00	3	0
15	Espresso	\N	Hot Coffee	95.00	/uploads/drink-1776598492814.webp	t	120	120	cold-bar	2026-04-19 11:34:52.689696+00	2026-04-21 09:31:50.826+00	\N	0
37	Iced Salted Vanilla Latte	\N	Cold Coffee	0.00	/uploads/drink-1776777269270.webp	t	180	386	cold-bar	2026-04-21 13:14:29.204767+00	2026-04-21 13:41:46.919+00	3	0
30	Iced Flat White Pistachio	\N	Cold Coffee	0.00	/uploads/drink-1776772978556.webp	t	180	306	cold-bar	2026-04-21 12:02:58.107547+00	2026-04-21 12:15:36.594+00	3	0
16	Espresso Affogato	\N	Hot Coffee	130.00	/uploads/drink-1776600487320.webp	t	180	\N	hot-bar	2026-04-19 12:08:07.228452+00	2026-04-21 09:32:09.596+00	\N	0
19	Caramel Macchiato	\N	Hot Coffee	185.00	/uploads/drink-1776611461789.webp	t	180	326	hot-bar	2026-04-19 13:25:00.948506+00	2026-04-21 09:32:15.219+00	\N	0
20	Cortado	\N	Hot Coffee	120.00	/uploads/drink-1776612258765.webp	t	180	145	hot-bar	2026-04-19 15:24:18.676893+00	2026-04-21 09:32:19.759+00	\N	0
34	Flat white Frappe	Flat white Frappe	Frappe	0.00	/uploads/drink-1776850808907.webp	t	180	276	cold-bar	2026-04-21 12:40:29.073305+00	2026-04-22 09:58:17.664+00	6	4
28	Iced Flat White 	\N	Cold Coffee	0.00	/uploads/drink-1776768957647.webp	t	180	316	cold-bar	2026-04-21 10:52:51.263025+00	2026-04-21 11:35:21.496+00	3	0
6	Espresso Chocolate	Espresso with chocolate sauce and steamed milk	Hot Coffee	155.00	/uploads/drink-1776539745460.webp	f	200	\N	main	2026-04-16 22:56:14.298422+00	2026-04-19 11:47:26.739+00	1	0
35	Pistachio Flat white Frappe	Pistachio Flat white Frappe	Frappe	0.00	/uploads/drink-1776851583550.webp	t	180	361	cold-bar	2026-04-21 12:52:16.383287+00	2026-04-22 09:58:23.257+00	6	5
33	Iced Almond Flat White	\N	coffee	0.00	/uploads/drink-1776775175937.webp	t	180	306	cold-bar	2026-04-21 12:39:35.809292+00	2026-04-21 12:51:44.896+00	\N	0
22	Iced Cortado	\N	Cold Coffee	130.00	/uploads/drink-1776621277882.webp	t	180	225	cold-bar	2026-04-19 17:54:37.814383+00	2026-04-21 09:57:14.57+00	\N	0
5	Caramel Latte	Latte with caramel sauce and syrup	Hot Coffee	175.00	/uploads/drink-1776540267914.webp	f	200	\N	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:04.747+00	1	0
1	Flat White Test	Smooth espresso with silky steamed milk	Hot Coffee	150.00	/uploads/drink-1776540031536.webp	f	180	350	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:14.841+00	1	0
3	Latte	Espresso with generous steamed milk	Hot Coffee	130.00	/uploads/drink-1776540292294.webp	f	180	\N	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:18.29+00	1	0
13	White Mocha	Espresso with White chocolate sauce and steamed milk	Hot Coffee	160.00	/uploads/drink-1776540336688.webp	f	120	340	main	2026-04-16 22:56:14.298422+00	2026-04-19 15:43:21.61+00	1	0
32	Iced Hazenut Flat White	\N	coffee	0.00	/uploads/drink-1776773970509.webp	t	180	296	cold-bar	2026-04-21 12:19:30.378586+00	2026-04-21 12:36:47.465+00	\N	0
4	Americano	Espresso diluted with hot water	Hot Coffee	110.00	/uploads/drink-1776539806813.webp	t	180	186	hot-bar	2026-04-16 22:56:14.298422+00	2026-04-22 10:42:13.546+00	1	0
29	Cortado Frappe	Cortado	Frappe	0.00	/uploads/drink-1776847766237.webp	t	180	235	cold-bar	2026-04-21 11:28:21.108891+00	2026-04-22 09:58:03.403+00	6	2
40	Iced Spanish Latte	\N	Cold Coffee	0.00	/uploads/drink-1776779467529.webp	t	180	396	cold-bar	2026-04-21 13:51:07.465885+00	2026-04-21 14:08:03.663+00	3	0
11	Espresso Macchiato	Espresso with hazelnut syrup and a splash of milk	Hot Coffee	120.00	/uploads/drink-1776539640677.webp	t	180	\N	hot-bar	2026-04-16 22:56:14.298422+00	2026-04-21 09:28:17.01+00	1	0
24	Iced Mocha Toffy Nut	\N	Cold Coffee	0.00	/uploads/drink-1776768680886.webp	t	180	406	cold-bar	2026-04-20 10:04:24.991179+00	2026-04-21 10:51:20.89+00	\N	0
38	Hazelnut Flat white Frappe	Hazelnut Flat white Frappe	Frappe	0.00	/uploads/drink-1776851726545.webp	t	180	341	cold-bar	2026-04-21 13:35:30.992901+00	2026-04-22 09:58:32.632+00	6	6
39	Iced Pistachio Latte 	\N	Cold Coffee	0.00	/uploads/drink-1776778998129.webp	t	180	386	cold-bar	2026-04-21 13:43:18.05558+00	2026-04-21 13:49:25.401+00	3	0
36	Iced Latte 	\N	coffee	0.00	/uploads/drink-1776775945227.webp	t	180	386	cold-bar	2026-04-21 12:52:25.160373+00	2026-04-21 13:22:20.439+00	\N	0
42	Iced Mocha	\N	Cold Coffee	0.00	/uploads/drink-1776781418189.webp	t	180	396	cold-bar	2026-04-21 14:23:38.123158+00	2026-04-21 14:33:06.869+00	\N	0
26	Caramel Macchiato Frappe	Caramel Macchiato Frappe	Frappe	0.00	/uploads/drink-1776769064189.webp	t	180	401	cold-bar	2026-04-21 08:49:45.395702+00	2026-04-22 09:58:38.672+00	\N	0
27	Pistachio Latte  Frappe	\N	Frappe	0.00	/uploads/drink-1776766530555.webp	t	180	376	cold-bar	2026-04-21 10:14:14.658762+00	2026-04-22 11:15:07.321+00	6	0
44	Iced Toffy Nut Mocha 	\N	Cold Coffee	0.00	/uploads/drink-1776782636078.webp	t	120	406	cold-bar	2026-04-21 14:43:28.002656+00	2026-04-21 14:59:26.878+00	\N	0
46	Iced White Mocha 	\N	Cold Coffee	0.00	/uploads/drink-1776784061810.webp	t	180	406	cold-bar	2026-04-21 15:00:40.283097+00	2026-04-21 15:08:55.893+00	\N	0
45	Latte Frappe	Latte Frappe	Frappe	0.00	\N	t	180	326	cold-bar	2026-04-21 14:51:18.23622+00	2026-04-22 11:02:44.106+00	\N	0
49	Pistachio Frappe	Pistachio Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 15:20:00.258274+00	2026-04-21 15:27:11.759+00	\N	0
48	Stawberry Matcha Latte 	\N	Cold Coffee	0.00	/uploads/drink-1776784211926.webp	t	180	410	cold-bar	2026-04-21 15:09:57.901542+00	2026-04-21 15:48:00.853+00	\N	0
50	Spanish Frappe	Spanish Frappe	Frappe	0.00	\N	t	180	376	cold-bar	2026-04-21 15:30:13.309023+00	2026-04-22 11:37:16.74+00	\N	0
43	Almond Flat white Frappe	Almond Flat white Frappe	Frappe	0.00	\N	t	180	358	cold-bar	2026-04-21 14:31:38.124632+00	2026-04-22 10:09:40.344+00	\N	0
51	Iced White Chocolate Matcha	\N	coffee	0.00	/uploads/drink-1776786707364.webp	t	240	430	cold-bar	2026-04-21 15:51:47.226807+00	2026-04-21 16:04:12.259+00	\N	0
52	Iced Honey Matcha Latte	\N	Cold Coffee	0.00	/uploads/drink-1776787608337.webp	t	180	430	cold-bar	2026-04-21 16:06:48.208801+00	2026-04-22 08:27:37.356+00	\N	0
31	Cortado Salted Caramel Frappe	Cortado Salted Caramel Frappe	Frappe	0.00	/uploads/drink-1776850078710.webp	t	180	261	cold-bar	2026-04-21 12:18:53.859746+00	2026-04-22 09:58:11.531+00	6	3
53	Lotus Spanish Frappe	Lotus Spanish Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 17:21:31.680396+00	2026-04-22 11:47:33.241+00	\N	0
54	Mocha Frappe	Mocha Frappe	Frappe	0.00	\N	t	180	371	cold-bar	2026-04-21 17:34:34.076977+00	2026-04-22 11:52:27.67+00	\N	0
55	Mocha Toffeenut Frappe	Mocha Toffeenut Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 17:58:08.945774+00	2026-04-22 11:55:44.3+00	\N	0
56	White Mocha Frappe	White Mocha Frappe	Frappe	0.00	\N	t	180	376	cold-bar	2026-04-21 18:09:27.399558+00	2026-04-22 11:57:11.624+00	\N	0
57	Purple Mango	Purple Mango	Frappe	0.00	\N	t	180	445	cold-bar	2026-04-21 18:49:55.636558+00	2026-04-22 12:02:25.943+00	\N	0
58	Nutty Fadge	Nutty Fadge	Frappe	0.00	\N	t	180	390	cold-bar	2026-04-22 12:03:09.237619+00	2026-04-22 12:16:25.185+00	6	0
59	Peanutbutter Frappe	Peanutbutter Frappe	Frappe	0.00	\N	t	180	\N	cold-bar	2026-04-22 12:19:29.987366+00	2026-04-22 12:19:29.987366+00	6	0
\.


--
-- Data for Name: ingredient_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_categories (id, name, sort_order, created_at) FROM stdin;
1	Coffee	0	2026-04-16 22:56:14.290913+00
2	Milk	1	2026-04-16 22:56:14.290913+00
3	Syrup	2	2026-04-16 22:56:14.290913+00
4	Sauce	3	2026-04-16 22:56:14.290913+00
5	Topping	4	2026-04-16 22:56:14.290913+00
6	Foam	5	2026-04-16 23:13:30.499323+00
7	Sweetner	6	2026-04-16 23:13:42.636801+00
8	Base/Powder	7	2026-04-16 23:14:18.428196+00
9	Garnish	8	2026-04-16 23:14:46.827373+00
10	Empty Type	9	2026-04-18 21:14:54.568576+00
\.


--
-- Data for Name: ingredient_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_options (id, ingredient_id, label, processed_qty, produced_qty, produced_unit, extra_cost, is_default, sort_order, linked_ingredient_id, created_at, updated_at) FROM stdin;
1	1	Single Shot	9.0000	18.0000	ml	0.0000	f	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
2	1	Double Shot	18.0000	36.0000	ml	0.0000	t	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
3	1	Triple Shot	27.0000	54.0000	ml	10.0000	f	2	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
15	5	No Syrup	0.0000	0.0000	ml	0.0000	t	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
16	5	1 Pump	10.0000	10.0000	ml	10.0000	f	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
17	5	2 Pumps	20.0000	20.0000	ml	15.0000	f	2	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
18	5	3 Pumps	30.0000	30.0000	ml	20.0000	f	3	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
19	6	No Sauce	0.0000	0.0000	ml	0.0000	t	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
20	6	Light Drizzle	10.0000	10.0000	ml	10.0000	f	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
21	6	Heavy Drizzle	20.0000	20.0000	ml	15.0000	f	2	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
24	7	Heavy Drizzle	20.0000	20.0000	ml	15.0000	f	2	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
25	8	No Syrup	0.0000	0.0000	ml	0.0000	t	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
26	8	1 Pump	10.0000	10.0000	ml	10.0000	f	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
27	8	2 Pumps	20.0000	20.0000	ml	15.0000	f	2	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
28	10	No Cream	0.0000	0.0000	g	0.0000	t	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
29	10	Add Whipped Cream	30.0000	30.0000	g	15.0000	f	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
30	12	Single Scoop	3.0000	3.0000	g	0.0000	t	0	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
31	12	Double Scoop	6.0000	6.0000	g	10.0000	f	1	\N	2026-04-16 22:56:14.288056+00	2026-04-16 22:56:14.288056+00
35	85	Less Cubes	110.0000	110.0000	g	0.0000	f	0	\N	2026-04-19 16:25:01.027223+00	2026-04-19 16:25:01.027223+00
36	85	Standard	130.0000	130.0000	g	0.0000	f	1	\N	2026-04-19 16:25:47.505749+00	2026-04-19 16:25:47.505749+00
37	85	More Cubes	150.0000	150.0000	g	0.0000	f	2	\N	2026-04-19 16:26:26.638021+00	2026-04-19 16:26:26.638021+00
38	86	Full Cream	1.0000	1.0000	g	0.0000	t	0	2	2026-04-19 17:43:37.783716+00	2026-04-19 17:43:37.783716+00
39	86	Skimmed 	1.0000	1.0000	g	0.0000	f	1	42	2026-04-19 17:44:38.265352+00	2026-04-19 17:44:38.265352+00
40	86	Coconut	1.0000	1.0000	g	0.0000	f	2	73	2026-04-19 17:45:36.618928+00	2026-04-19 17:45:36.618928+00
41	86	Soay Milk	1.0000	1.0000	g	0.0000	f	3	72	2026-04-19 17:48:03.94021+00	2026-04-19 17:48:03.94021+00
42	86	Free Lactos	1.0000	1.0000	g	0.0000	f	4	74	2026-04-19 17:49:21.348991+00	2026-04-19 17:49:21.348991+00
45	86	Almond	1.0000	1.0000	g	0.4500	f	6	4	2026-04-20 08:42:42.416944+00	2026-04-20 08:42:42.416944+00
46	86	Oat	1.0000	1.0000	g	0.4500	f	6	3	2026-04-20 08:43:28.245664+00	2026-04-20 08:43:28.245664+00
47	86	Oat Milk	1.0000	1.0000	g	45.0000	f	6	3	2026-04-20 09:10:44.726577+00	2026-04-20 09:11:42.439+00
\.


--
-- Data for Name: ingredient_type_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_type_volumes (id, ingredient_type_id, volume_id, processed_qty, produced_qty, unit, extra_cost, is_default, sort_order, is_active) FROM stdin;
30	10	1	\N	\N	\N	0.0000	f	0	t
31	10	2	\N	\N	\N	0.0000	t	1	t
33	10	3	\N	\N	\N	0.0000	f	2	t
46	66	1	\N	\N	\N	0.0000	f	0	t
47	66	2	\N	\N	\N	0.0000	f	1	t
48	66	3	\N	\N	\N	0.0000	f	2	t
49	19	9	\N	\N	\N	0.0000	f	0	t
50	19	10	\N	\N	\N	0.0000	f	1	t
52	65	9	\N	\N	\N	0.0000	f	0	t
53	65	10	\N	\N	\N	0.0000	f	1	t
54	65	11	\N	\N	\N	0.0000	f	2	t
65	84	20	\N	\N	\N	0.0000	f	0	t
66	84	21	\N	\N	\N	0.0000	f	1	t
67	84	22	\N	\N	\N	0.0000	f	2	t
68	68	23	\N	\N	\N	0.0000	t	0	t
69	68	24	\N	\N	\N	0.0000	f	1	t
70	31	17	\N	\N	\N	0.0000	f	0	t
71	31	18	\N	\N	\N	0.0000	f	0	t
72	31	19	\N	\N	\N	0.0000	f	0	t
76	91	25	\N	\N	\N	0.0000	f	0	t
77	91	26	\N	\N	\N	0.0000	f	0	t
78	91	27	\N	\N	\N	0.0000	f	0	t
80	40	9	10.0000	10.0000	\N	0.0000	f	0	t
81	40	10	20.0000	20.0000	\N	0.0000	f	0	t
82	40	11	30.0000	30.0000	\N	0.0000	f	0	t
83	21	9	10.0000	10.0000	\N	0.0000	f	0	t
84	21	10	20.0000	20.0000	\N	0.0000	f	0	t
85	21	11	30.0000	30.0000	\N	0.0000	f	0	t
86	83	20	1.0000	1.0000	\N	0.0000	f	0	t
87	83	21	2.0000	2.0000	\N	0.0000	f	0	t
88	83	22	3.0000	3.0000	\N	0.0000	f	0	t
51	19	11	15.0000	15.0000	\N	0.0000	f	2	t
92	32	17	15.0000	15.0000	\N	0.0000	f	0	t
55	17	9	10.0000	10.0000	\N	30.0000	f	0	t
38	12	2	18.0000	36.0000	\N	45.0000	f	1	t
37	12	1	18.0000	18.0000	\N	35.0000	f	0	t
39	12	3	36.0000	54.0000	\N	65.0000	f	2	t
64	62	11	30.0000	30.0000	\N	75.0000	f	2	t
63	62	10	20.0000	20.0000	\N	55.0000	f	1	t
62	62	9	10.0000	10.0000	\N	30.0000	f	0	t
61	20	11	30.0000	30.0000	\N	75.0000	f	2	t
59	20	10	20.0000	20.0000	\N	55.0000	f	1	t
58	20	9	10.0000	10.0000	\N	30.0000	f	0	t
96	56	17	15.0000	15.0000	\N	30.0000	f	0	t
97	56	18	30.0000	30.0000	\N	55.0000	f	0	t
98	56	19	45.0000	45.0000	\N	75.0000	f	0	t
99	27	17	15.0000	15.0000	\N	30.0000	f	0	t
100	27	18	30.0000	30.0000	\N	55.0000	f	0	t
101	27	19	45.0000	45.0000	\N	75.0000	f	0	t
102	35	17	15.0000	15.0000	\N	30.0000	f	0	t
103	35	18	30.0000	30.0000	\N	55.0000	f	0	t
104	35	19	45.0000	45.0000	\N	75.0000	f	0	t
105	35	8	0.0000	0.0000	\N	0.0000	f	0	t
91	59	19	45.0000	45.0000	\N	75.0000	f	0	t
90	59	18	30.0000	30.0000	\N	55.0000	f	0	t
106	28	17	15.0000	15.0000	\N	30.0000	f	0	t
107	28	18	30.0000	30.0000	\N	55.0000	f	0	t
108	28	19	45.0000	45.0000	\N	75.0000	f	0	t
110	61	18	30.0000	30.0000	\N	55.0000	f	0	t
111	61	19	45.0000	45.0000	\N	75.0000	f	0	t
109	61	17	15.0000	15.0000	\N	30.0000	f	0	t
36	11	3	36.0000	54.0000	\N	60.0000	f	2	t
73	18	17	15.0000	15.0000	\N	30.0000	f	0	t
89	59	17	15.0000	15.0000	\N	30.0000	f	0	t
113	63	9	30.0000	30.0000	\N	0.0000	f	0	t
74	18	18	30.0000	30.0000	\N	55.0000	f	0	t
75	18	19	45.0000	45.0000	\N	75.0000	f	0	t
57	17	11	30.0000	30.0000	\N	75.0000	f	2	t
56	17	10	20.0000	20.0000	\N	55.0000	f	1	t
114	44	17	15.0000	15.0000	\N	0.0000	f	0	t
115	44	18	30.0000	30.0000	\N	0.0000	f	0	t
116	44	19	45.0000	45.0000	\N	0.0000	f	0	t
117	60	17	15.0000	15.0000	\N	0.0000	f	0	t
118	60	18	30.0000	30.0000	\N	0.0000	f	0	t
119	60	19	45.0000	45.0000	\N	0.0000	f	0	t
121	24	9	3.0000	70.0000	\N	0.0000	f	0	t
43	34	1	18.0000	18.0000	\N	0.0000	f	0	t
34	11	1	18.0000	18.0000	\N	30.0000	f	0	t
35	11	2	18.0000	36.0000	\N	40.0000	f	1	t
122	34	9	30.0000	30.0000	\N	0.0000	f	0	t
123	72	26	5.0000	5.0000	\N	0.0000	f	0	t
130	52	10	20.0000	20.0000	\N	55.0000	f	0	t
131	52	11	30.0000	30.0000	\N	75.0000	f	0	t
129	52	9	10.0000	10.0000	\N	30.0000	f	0	t
112	22	8	0.0000	0.0000	\N	0.0000	f	0	f
79	22	9	35.0000	35.0000	\N	35.0000	t	0	f
\.


--
-- Data for Name: ingredient_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_types (id, category_id, name, inventory_ingredient_id, is_active, sort_order, created_at, processed_qty, produced_qty, unit, affects_cup_size, color, extra_cost) FROM stdin;
15	2	Oat	3	t	0	2026-04-17 11:34:31.46161+00	0.0000	0.0000	ml	t	\N	0.0000
16	2	Almond	4	t	0	2026-04-17 11:34:31.462472+00	0.0000	0.0000	ml	t	\N	0.0000
17	3	Vanilla	5	t	0	2026-04-17 11:34:31.463261+00	0.0000	0.0000	ml	t	\N	0.0000
18	4	Caramel	6	t	0	2026-04-17 11:34:31.464295+00	0.0000	0.0000	ml	t	\N	0.0000
19	4	Chocolate	7	t	0	2026-04-17 11:34:31.46499+00	0.0000	0.0000	ml	t	\N	0.0000
20	3	Hazelnut	8	t	0	2026-04-17 11:34:31.465792+00	0.0000	0.0000	ml	t	\N	0.0000
23	1	Cold Brew Concentrate	11	t	0	2026-04-17 11:34:31.46797+00	0.0000	0.0000	ml	t	\N	0.0000
27	4	Almond	17	t	0	2026-04-17 11:34:31.470427+00	0.0000	0.0000	ml	t	\N	0.0000
28	4	Blueberry	18	t	0	2026-04-17 11:34:31.47094+00	0.0000	0.0000	ml	t	\N	0.0000
29	3	Bluecuracao	19	t	0	2026-04-17 11:34:31.47154+00	0.0000	0.0000	ml	t	\N	0.0000
30	3	Butter Scotch	20	t	0	2026-04-17 11:34:31.472038+00	0.0000	0.0000	ml	t	\N	0.0000
31	3	Caramel	22	t	0	2026-04-17 11:34:31.472644+00	0.0000	0.0000	ml	t	\N	0.0000
32	8	Chocolate	23	t	0	2026-04-17 11:34:31.473283+00	0.0000	0.0000	ml	t	\N	0.0000
33	3	Coconut	25	t	0	2026-04-17 11:34:31.473878+00	0.0000	0.0000	ml	t	\N	0.0000
36	4	Dulce Delche	28	t	0	2026-04-17 11:34:31.476272+00	0.0000	0.0000	ml	t	\N	0.0000
37	8	Earl Gray	29	t	0	2026-04-17 11:34:31.476807+00	0.0000	0.0000	ml	t	\N	0.0000
38	8	Green Apple	31	t	0	2026-04-17 11:34:31.477315+00	0.0000	0.0000	ml	t	\N	0.0000
39	8	Hazelnut Beans	32	t	0	2026-04-17 11:34:31.477824+00	0.0000	0.0000	ml	t	\N	0.0000
40	7	Honey	34	t	0	2026-04-17 11:34:31.478427+00	0.0000	0.0000	ml	t	\N	0.0000
41	8	Lemon Juice	35	t	0	2026-04-17 11:34:31.479008+00	0.0000	0.0000	ml	t	\N	0.0000
43	5	Lotus Biscuits	37	t	0	2026-04-17 11:34:31.480119+00	0.0000	0.0000	ml	t	\N	0.0000
44	4	Lotus	38	t	0	2026-04-17 11:34:31.480702+00	0.0000	0.0000	ml	t	\N	0.0000
48	9	Mint Leaves	43	t	0	2026-04-17 11:34:31.483833+00	0.0000	0.0000	ml	t	\N	0.0000
49	8	Passion Fruit	45	t	0	2026-04-17 11:34:31.484356+00	0.0000	0.0000	ml	t	\N	0.0000
50	8	Passiont Fruit	46	t	0	2026-04-17 11:34:31.485003+00	0.0000	0.0000	ml	t	\N	0.0000
51	3	Peach	47	t	0	2026-04-17 11:34:31.485552+00	0.0000	0.0000	ml	t	\N	0.0000
53	8	Pecan Beans	49	t	0	2026-04-17 11:34:31.486605+00	0.0000	0.0000	ml	t	\N	0.0000
54	4	Pecan	50	t	0	2026-04-17 11:34:31.487316+00	0.0000	0.0000	ml	t	\N	0.0000
55	8	Pistachio Beans	51	t	0	2026-04-17 11:34:31.48809+00	0.0000	0.0000	ml	t	\N	0.0000
57	8	Rani Peacj	53	t	0	2026-04-17 11:34:31.48929+00	0.0000	0.0000	ml	t	\N	0.0000
58	8	Redbull	54	t	0	2026-04-17 11:34:31.48999+00	0.0000	0.0000	ml	t	\N	0.0000
59	4	Salted Caramel	55	t	0	2026-04-17 11:34:31.49058+00	0.0000	0.0000	ml	t	\N	0.0000
61	8	Strawberry Juice	57	t	0	2026-04-17 11:34:31.492421+00	0.0000	0.0000	ml	t	\N	0.0000
62	3	Tofft Nut	59	t	0	2026-04-17 11:34:31.493107+00	0.0000	0.0000	ml	t	\N	0.0000
63	8	Vanilla	60	t	0	2026-04-17 11:34:31.493864+00	0.0000	0.0000	ml	t	\N	0.0000
64	8	White Chocolate	63	t	0	2026-04-17 11:34:31.494422+00	0.0000	0.0000	ml	t	\N	0.0000
65	4	White Chocolate	64	t	0	2026-04-17 11:34:31.4949+00	0.0000	0.0000	ml	t	\N	0.0000
66	1	Coffee Kintamani	66	t	0	2026-04-17 11:34:31.495498+00	0.0000	0.0000	ml	t	\N	0.0000
67	4	Dulce De Leche	67	t	0	2026-04-17 11:34:31.496161+00	0.0000	0.0000	ml	t	\N	0.0000
68	5	Ice Cream	68	t	0	2026-04-17 11:34:31.496973+00	0.0000	0.0000	ml	t	\N	0.0000
69	5	Lotus	69	t	0	2026-04-17 11:34:31.497473+00	0.0000	0.0000	ml	t	\N	0.0000
70	5	Lotus Biscuit	70	t	0	2026-04-17 11:34:31.498037+00	0.0000	0.0000	ml	t	\N	0.0000
71	8	Tea Packet	14	t	0	2026-04-17 11:34:31.498607+00	0.0000	0.0000	ml	t	\N	0.0000
72	9	Lemon Slices	15	t	0	2026-04-17 11:34:31.499256+00	0.0000	0.0000	ml	t	\N	0.0000
34	1	Coffee Powder	26	t	0	2026-04-17 11:34:31.474428+00	0.0000	0.0000	ml	t	\N	0.0000
73	10	None	\N	t	62	2026-04-18 21:15:15.231578+00	0.0000	0.0000	ml	t	\N	0.0000
79	2	Free Lactos Milk	74	t	68	2026-04-19 08:58:33.295293+00	0.0000	0.0000	ml	t	\N	0.0000
80	2	Soay Milk	72	t	69	2026-04-19 08:58:53.117776+00	0.0000	0.0000	ml	t	\N	0.0000
81	2	Skimmed Milk	42	t	69	2026-04-19 09:00:35.26027+00	0.0000	0.0000	ml	t	\N	0.0000
82	2	Coconut Milk	73	t	70	2026-04-19 09:01:23.842042+00	0.0000	0.0000	ml	t	\N	0.0000
83	7	Dite Suger	75	t	71	2026-04-19 09:19:26.410405+00	0.0000	0.0000	ml	t	\N	0.0000
84	7	Brown Suger	76	t	72	2026-04-19 09:20:52.165713+00	0.0000	0.0000	ml	t	\N	0.0000
21	7	White Sugar	9	t	0	2026-04-17 11:34:31.466486+00	0.0000	0.0000	ml	t	\N	0.0000
47	2	Skimmed Milk	42	t	0	2026-04-17 11:34:31.483315+00	0.0000	0.0000	ml	t	\N	0.0000
88	2	Extra Macchiato Foam	2	t	75	2026-04-19 12:30:14.223934+00	120.0000	60.0000	ml	t	\N	0.0000
14	2	Full Cream	2	t	0	2026-04-17 11:34:31.460785+00	0.0000	0.0000	ml	t	\N	0.0000
24	8	Matcha	12	t	0	2026-04-17 11:34:31.468648+00	3.0000	70.0000	ml	t	#449442	0.0000
60	4	Starwberry	56	t	0	2026-04-17 11:34:31.491628+00	0.0000	0.0000	ml	t	#e40c0c	0.0000
56	4	Pistachio	52	t	0	2026-04-17 11:34:31.488796+00	0.0000	0.0000	ml	t	#7bdd6e	0.0000
75	6	Creamy Milk	\N	t	64	2026-04-19 08:37:47.946058+00	0.0000	40.0000	ml	t	\N	0.0000
76	6	More Foam	\N	t	65	2026-04-19 08:37:59.200761+00	0.0000	70.0000	ml	t	\N	0.0000
85	10	Hot Water	\N	t	72	2026-04-19 12:01:24.666867+00	0.0000	0.0000	ml	t	\N	0.0000
86	6	Macchiato Foam	2	t	73	2026-04-19 12:23:40.814682+00	120.0000	40.0000	ml	t	\N	0.0000
87	6	Steam Milk	2	t	74	2026-04-19 12:24:16.460348+00	120.0000	40.0000	ml	t	\N	0.0000
74	6	Light Foam	\N	t	63	2026-04-19 08:37:24.826197+00	0.0000	20.0000	ml	t	\N	0.0000
26	8	Almond Beans	16	t	0	2026-04-17 11:34:31.469802+00	2.0000	2.0000	ml	t	#000000	0.0000
45	8	Mango Juice	39	t	0	2026-04-17 11:34:31.481282+00	0.0000	0.0000	ml	t	#fb8a2d	0.0000
52	8	Peanutbutter	48	t	0	2026-04-17 11:34:31.486137+00	0.0000	0.0000	ml	t	#000000	0.0000
90	1	Colombia Tres Dragons	84	t	77	2026-04-19 13:23:02.005365+00	20.0000	300.0000	ml	t	\N	0.0000
92	2	Test Multi Option	\N	t	79	2026-04-20 09:15:36.08076+00	0.0000	0.0000	ml	t	\N	0.0000
10	1	Brazilian	30	t	0	2026-04-16 23:44:15.351466+00	0.0000	0.0000	ml	t	#583737	0.0000
11	1	Colombian	65	t	1	2026-04-16 23:45:16.545834+00	0.0000	0.0000	ml	t	#3c1515	0.0000
12	1	Ethiobian	71	t	2	2026-04-17 00:08:45.387832+00	0.0000	0.0000	ml	t	#391919	0.0000
89	1	Colombia Sedama	83	t	76	2026-04-19 13:06:26.078165+00	20.0000	300.0000	ml	t	#503030	0.0000
22	5	Whipped Cream	10	t	0	2026-04-17 11:34:31.467245+00	35.0000	35.0000	ml	t	#000000	0.0000
91	8	Ice Cubes	\N	t	78	2026-04-19 16:35:21.282845+00	0.0000	0.0000	ml	t	#75caff	0.0000
35	2	Condensed	27	t	0	2026-04-17 11:34:31.475476+00	0.0000	0.0000	ml	t	#f7f7f7	0.0000
\.


--
-- Data for Name: ingredient_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_volumes (id, name, processed_qty, produced_qty, unit, sort_order, created_at) FROM stdin;
4	No Milk	0.0000	0.0000	ml	3	2026-04-16 22:56:14.294489+00
5	Small (100ml)	100.0000	100.0000	ml	4	2026-04-16 22:56:14.294489+00
6	Medium (150ml)	150.0000	150.0000	ml	5	2026-04-16 22:56:14.294489+00
7	Large (200ml)	200.0000	200.0000	ml	6	2026-04-16 22:56:14.294489+00
8	None	0.0000	0.0000	ml	7	2026-04-16 22:56:14.294489+00
10	2 Pumps	20.0000	20.0000	ml	9	2026-04-16 22:56:14.294489+00
11	3 Pumps	30.0000	30.0000	ml	10	2026-04-16 22:56:14.294489+00
12	No Sauce	0.0000	0.0000	ml	11	2026-04-16 22:56:14.294489+00
13	Light Drizzle	10.0000	10.0000	ml	12	2026-04-16 22:56:14.294489+00
14	Heavy Drizzle	20.0000	20.0000	ml	13	2026-04-16 22:56:14.294489+00
16	Add Cream	30.0000	30.0000	g	15	2026-04-16 22:56:14.294489+00
3	Triple Shot	36.0000	54.0000	ml	2	2026-04-16 22:56:14.294489+00
9	1 Pump	10.0000	10.0000	ml	8	2026-04-16 22:56:14.294489+00
17	1 Pump Sauce	15.0000	15.0000	ml	16	2026-04-19 08:35:09.924036+00
18	2 Pump Sauce	30.0000	30.0000	ml	17	2026-04-19 08:35:37.495427+00
19	3 Pump Sauce	45.0000	45.0000	ml	18	2026-04-19 08:35:52.635051+00
15	Without Whipped Cream	0.0000	0.0000	g	14	2026-04-16 22:56:14.294489+00
21	2 Pack	2.0000	2.0000	ml	20	2026-04-19 09:22:14.40218+00
20	1 Pack	1.0000	1.0000	ml	19	2026-04-19 09:21:56.344915+00
22	3 Pack	3.0000	3.0000	ml	21	2026-04-19 09:22:37.834017+00
23	1 Ball	40.0000	40.0000	ml	22	2026-04-19 12:15:05.783311+00
24	2 Ball	80.0000	80.0000	ml	23	2026-04-19 12:15:16.759683+00
25	Less Cubes	110.0000	110.0000	ml	24	2026-04-19 16:36:14.599311+00
26	Standard	130.0000	130.0000	ml	25	2026-04-19 16:36:41.66452+00
27	More Cubes	150.0000	150.0000	ml	26	2026-04-19 16:36:57.20925+00
1	Single Shot	18.0000	18.0000	ml	0	2026-04-16 22:56:14.294489+00
2	Double Shot	18.0000	36.0000	ml	1	2026-04-16 22:56:14.294489+00
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, slug, ingredient_type, unit, cost_per_unit, stock_quantity, low_stock_threshold, is_active, created_at, updated_at) FROM stdin;
27	Condensed Milk	condensed-milk	milk	g	0.5500	99935.0000	500.0000	t	2026-04-16 23:35:29.43109+00	2026-04-21 17:19:26.428+00
83	Colmbia Sedama Beans	colmbia-sedama-beans	coffee	g	0.0000	0.0000	500.0000	t	2026-04-19 13:05:24.69405+00	2026-04-21 19:11:52.319+00
71	Ethiobian Espresso Beans	ethiobian-espresso-beans	coffee	g	0.1000	100657.9900	500.0000	t	2026-04-17 00:07:44.964438+00	2026-04-21 19:11:52.319+00
9	Sugar Syrup	sugar-syrup	sweetener	ml	0.1000	1500.0000	300.0000	t	2026-04-16 22:56:14.284852+00	2026-04-16 22:56:14.284852+00
11	Cold Brew Concentrate	cold-brew-concentrate	coffee	ml	0.4000	1500.0000	400.0000	t	2026-04-16 22:56:14.284852+00	2026-04-16 22:56:14.284852+00
12	Matcha Powder	matcha-powder	base	g	1.8000	400.0000	100.0000	t	2026-04-16 22:56:14.284852+00	2026-04-16 22:56:14.284852+00
13	Condenced Milk	condenced-milk	milk	ml	0.0000	9999.0000	500.0000	t	2026-04-16 22:56:14.284852+00	2026-04-16 23:04:02.73+00
59	Tofft Nut Syrap	tofft-nut-syrap	syrup	ml	1.0000	99950.0000	500.0000	t	2026-04-16 23:35:29.441743+00	2026-04-21 19:12:46.792+00
1	Espresso Beans	espresso-beans	coffee	g	0.5000	1973.0000	500.0000	t	2026-04-16 22:56:14.284852+00	2026-04-18 22:11:43.664+00
16	Almond Beans	almond-beans	base	g	3.5000	10000.0000	500.0000	t	2026-04-16 23:35:29.42699+00	2026-04-19 09:13:58.184+00
52	Pistachio Sauce	pistachio-sauce	sauce	g	1.7500	99905.0000	500.0000	t	2026-04-16 23:35:29.439738+00	2026-04-21 19:11:52.326+00
67	Dulce De Leche Sauce	dulce-de-leche-sauce	sauce	g	1.3500	10000000.0000	500.0000	t	2026-04-16 23:35:29.444308+00	2026-04-19 09:13:58.757+00
73	Coconut Milk	coconut-milk	milk	g	0.0000	999760.0000	500.0000	t	2026-04-19 08:56:14.824532+00	2026-04-19 15:35:22.622+00
4	Almond Milk	almond-milk	milk	ml	0.0400	1484.0000	500.0000	t	2026-04-16 22:56:14.284852+00	2026-04-20 09:06:25.58+00
14	Tea Packet	tea-packet	base	g	0.0000	1000000.0000	500.0000	t	2026-04-16 23:35:29.415979+00	2026-04-19 09:13:58.188+00
15	Lemon Slices	lemon-slices	other	ml	0.0000	1000000.0000	500.0000	t	2026-04-16 23:35:29.426598+00	2026-04-19 09:13:58.189+00
18	Blueberry Sauce	blueberry-sauce	sauce	g	2.1000	100000.0000	500.0000	t	2026-04-16 23:35:29.42786+00	2026-04-19 09:13:58.19+00
17	Almond Sauce	almond-sauce	sauce	g	0.9000	10000.0000	500.0000	t	2026-04-16 23:35:29.427374+00	2026-04-19 09:13:58.192+00
19	Bluecuracao	bluecuracao	syrup	g	1.3500	100000.0000	500.0000	t	2026-04-16 23:35:29.428164+00	2026-04-19 09:13:58.257+00
20	Butter Scotch Syrup	butter-scotch-syrup	syrup	ml	0.0000	1000000.0000	500.0000	t	2026-04-16 23:35:29.428546+00	2026-04-19 09:13:58.261+00
22	Caramel Syrup	caramel-syrup	syrup	g	2.0000	100000.0000	500.0000	t	2026-04-16 23:35:29.429245+00	2026-04-19 09:13:58.262+00
23	Chocolate Powder	chocolate-powder	base	g	3.7000	99999.9900	500.0000	t	2026-04-16 23:35:29.429753+00	2026-04-19 09:13:58.262+00
26	Coffee Powder	coffee-powder	coffee	g	2.0000	99999.9800	500.0000	t	2026-04-16 23:35:29.430724+00	2026-04-19 09:13:58.322+00
28	Dulce Delche Sauce	dulce-delche-sauce	sauce	g	1.2500	100000.0000	500.0000	t	2026-04-16 23:35:29.431417+00	2026-04-19 09:13:58.334+00
29	Earl Gray	earl-gray	base	g	22.7500	10000000.0000	500.0000	t	2026-04-16 23:35:29.431791+00	2026-04-19 09:13:58.336+00
30	Brazilian Espresso Beans	brazilian-espresso-beans	coffee	g	4.0000	10000000.0000	500.0000	t	2026-04-16 23:35:29.432211+00	2026-04-19 09:13:58.336+00
31	Green Apple	green-apple	base	g	2.2500	100000.0000	500.0000	t	2026-04-16 23:35:29.432523+00	2026-04-19 09:13:58.383+00
32	Hazelnut Beans	hazelnut-beans	base	g	2.5500	100000.0000	500.0000	t	2026-04-16 23:35:29.432904+00	2026-04-19 09:13:58.385+00
34	Honey	honey	sweetener	g	1.6500	1000000.0000	500.0000	t	2026-04-16 23:35:29.433504+00	2026-04-19 09:13:58.398+00
35	Lemon Juice	lemon-juice	base	g	0.5000	100000.0000	500.0000	t	2026-04-16 23:35:29.433913+00	2026-04-19 09:13:58.401+00
36	Lemon Slice	lemon-slice	other	g	1.7500	10000.0000	500.0000	t	2026-04-16 23:35:29.434256+00	2026-04-19 09:13:58.401+00
60	Vanilla Powder	vanilla-powder	base	g	1.8000	999940.0000	500.0000	t	2026-04-16 23:35:29.442079+00	2026-04-21 19:11:52.326+00
37	Lotus Biscuits	lotus-biscuits	topping	g	2.8500	10000.0000	500.0000	t	2026-04-16 23:35:29.434717+00	2026-04-19 09:13:58.446+00
39	Mango Juice	mango-juice	base	g	0.3500	100000.0000	500.0000	t	2026-04-16 23:35:29.43539+00	2026-04-19 09:13:58.454+00
40	Matcha	matcha	base	g	37.5000	1000000.0000	500.0000	t	2026-04-16 23:35:29.435771+00	2026-04-19 09:13:58.459+00
42	Skimmed Milk	skimmed-milk	milk	g	0.2000	1000000.0000	500.0000	t	2026-04-16 23:35:29.436338+00	2026-04-19 09:13:58.462+00
43	Mint Leaves	mint-leaves	other	g	1.7500	100000.0000	500.0000	t	2026-04-16 23:35:29.436685+00	2026-04-19 09:13:58.505+00
45	Passion Fruit	passion-fruit	base	g	3.0000	100000.0000	500.0000	t	2026-04-16 23:35:29.437179+00	2026-04-19 09:13:58.506+00
46	Passiont Fruit	passiont-fruit	base	g	1.5000	1000000.0000	500.0000	t	2026-04-16 23:35:29.43744+00	2026-04-19 09:13:58.516+00
47	Peach Syrup	peach-syrup	syrup	g	3.0000	1000000.0000	500.0000	t	2026-04-16 23:35:29.437827+00	2026-04-19 09:13:58.521+00
48	Peanutbutter	peanutbutter	base	g	0.3500	10000.0000	500.0000	t	2026-04-16 23:35:29.438205+00	2026-04-19 09:13:58.523+00
49	Pecan Beans	pecan-beans	base	g	4.8500	100000.0000	500.0000	t	2026-04-16 23:35:29.438685+00	2026-04-19 09:13:58.566+00
50	Pecan Sauce	pecan-sauce	sauce	g	1.2500	1000000.0000	500.0000	t	2026-04-16 23:35:29.439038+00	2026-04-19 09:13:58.566+00
51	Pistachio Beans	pistachio-beans	base	g	3.4500	100000.0000	500.0000	t	2026-04-16 23:35:29.439416+00	2026-04-19 09:13:58.578+00
7	Chocolate Sauce	chocolate-sauce	sauce	ml	0.0000	585.0000	150.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 19:12:46.796+00
53	Rani Peacj	rani-peacj	base	g	130.0500	100000.0000	500.0000	t	2026-04-16 23:35:29.440005+00	2026-04-19 09:13:58.592+00
10	Whipped Cream	whipped-cream	topping	g	0.3000	290.0000	100.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 19:11:52.326+00
54	Redbull	redbull	base	g	126.0000	100000.0000	500.0000	t	2026-04-16 23:35:29.440397+00	2026-04-19 09:13:58.628+00
56	Starwberry Sauce	starwberry-sauce	sauce	g	6.0000	10000000.0000	500.0000	t	2026-04-16 23:35:29.44097+00	2026-04-19 09:13:58.634+00
3	Oat Milk	oat-milk	milk	ml	0.0400	2773.0000	800.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 19:12:46.797+00
63	White Chocolate Powder	white-chocolate-powder	base	g	2.5000	100000.0000	500.0000	t	2026-04-16 23:35:29.44292+00	2026-04-19 09:13:58.691+00
64	White Chocolate Sauce	white-chocolate-sauce	sauce	g	1.2000	1000000.0000	500.0000	t	2026-04-16 23:35:29.443291+00	2026-04-19 09:13:58.692+00
66	Coffee Kintamani	coffee-kintamani	coffee	g	4.2500	1000000.0000	500.0000	t	2026-04-16 23:35:29.443978+00	2026-04-19 09:13:58.719+00
69	Lotus	lotus	topping	g	0.6000	10000000.0000	500.0000	t	2026-04-16 23:35:29.444962+00	2026-04-19 09:13:58.759+00
70	Lotus Biscuit	lotus-biscuit	topping	g	3.2000	1000000.0000	500.0000	t	2026-04-16 23:35:29.445347+00	2026-04-19 09:13:58.778+00
57	Strawberry Juice	strawberry-juice	base	g	0.3500	1000.0000	500.0000	t	2026-04-16 23:35:29.441166+00	2026-04-19 09:14:26.902+00
72	Soay Milk	soay-milk	milk	g	0.0000	1000000.0000	500.0000	t	2026-04-19 08:54:19.141925+00	2026-04-19 09:13:58.813+00
25	Coconut Syrup	coconut-syrup	syrup	g	2.2500	1000.0000	500.0000	t	2026-04-16 23:35:29.430303+00	2026-04-19 09:14:26.904+00
68	Ice Cream	ice-cream	topping	g	0.3500	1000.0000	500.0000	t	2026-04-16 23:35:29.444684+00	2026-04-19 09:14:26.918+00
75	Dite Suger	dite-suger	sweetener	g	0.0000	0.0000	500.0000	t	2026-04-19 09:17:37.328192+00	2026-04-19 09:19:50.58+00
76	Brown Suger	brown-suger	coffee	g	0.0000	0.0000	500.0000	t	2026-04-19 09:20:13.775212+00	2026-04-19 09:20:13.775212+00
8	Hazelnut Syrup	hazelnut-syrup	syrup	ml	0.2200	510.0000	100.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 09:20:44.604+00
82	Whipped Cream 1	whipped-cream-1	topping	g	0.0000	0.0000	500.0000	t	2026-04-19 12:38:55.151573+00	2026-04-19 12:38:55.151573+00
55	Salted Caramel Sauce	salted-caramel-sauce	sauce	g	0.4500	999940.0000	500.0000	t	2026-04-16 23:35:29.44072+00	2026-04-20 14:58:57.992+00
74	Free Lactos Milk	free-lactos-milk	milk	g	0.0000	9925.0000	500.0000	t	2026-04-19 08:57:38.614366+00	2026-04-21 09:20:44.604+00
38	Lotus Sauce	lotus-sauce	sauce	g	0.7500	9980.0000	500.0000	t	2026-04-16 23:35:29.43501+00	2026-04-21 14:32:09.259+00
84	Colombia Tres Dragons	colombia-tres-dragons	coffee	g	0.0000	0.0000	500.0000	t	2026-04-19 13:22:30.10589+00	2026-04-19 13:22:30.10589+00
5	Vanilla Syrup	vanilla-syrup	syrup	ml	0.2000	890.0000	200.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 14:36:30.623+00
6	Caramel Sauce	caramel-sauce	sauce	ml	0.2500	605.0000	150.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 14:36:30.623+00
85	Ice Cubes	ice-cubes	base	g	0.0000	0.0000	500.0000	t	2026-04-19 16:23:02.508562+00	2026-04-19 16:26:31.111+00
2	Full Cream	full-cream	milk	ml	0.0000	1898.0000	1000.0000	t	2026-04-16 22:56:14.284852+00	2026-04-21 19:11:52.33+00
86	Milk Type	milk-type	milk	g	0.0000	0.0000	500.0000	t	2026-04-19 17:42:40.464545+00	2026-04-21 19:12:46.792+00
65	Colombian Espresso Beans	colombian-espresso-beans	coffee	g	0.1000	99406.0000	500.0000	t	2026-04-16 23:35:29.443588+00	2026-04-21 19:12:46.797+00
\.


--
-- Data for Name: kitchen_stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kitchen_stations (id, name, is_active, sort_order, created_at) FROM stdin;
1	Hot Bar	t	0	2026-04-21 08:54:37.627783+00
3	Turkish Bar	t	20	2026-04-21 08:55:17.008863+00
2	Cold Bar	t	10	2026-04-21 08:55:02.165222+00
4	Food/Pastry	t	30	2026-04-21 08:56:51.874032+00
\.


--
-- Data for Name: order_item_customizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item_customizations (id, order_item_id, ingredient_id, option_id, consumed_qty, added_cost, slot_label, option_label, created_at, type_volume_id, barista_sort_order, customer_sort_order) FROM stdin;
1	5	1	3	27.0000	10.0000	Espresso	Triple Shot	2026-04-18 22:11:43.653883+00	\N	0	1
2	5	7	24	20.0000	15.0000	Chocolate Sauce	Heavy Drizzle	2026-04-18 22:11:43.653883+00	\N	0	1
3	9	65	\N	36.0000	30.0000	Coffee	Colombian · Triple Shot	2026-04-18 23:13:09.418669+00	36	0	1
4	9	8	\N	0.0000	30.0000	Syrup	Hazelnut · 2 Pumps	2026-04-18 23:13:09.418669+00	59	0	1
5	9	2	\N	0.0000	0.0000	Milk	Whole	2026-04-18 23:13:09.418669+00	\N	0	1
6	10	65	\N	36.0000	30.0000	Coffee	Colombian · Triple Shot	2026-04-18 23:17:57.007922+00	36	0	1
7	10	8	\N	20.0000	30.0000	Syrup	Hazelnut · 2 Pumps	2026-04-18 23:17:57.007922+00	59	0	1
8	10	2	\N	0.0000	0.0000	Milk	Whole	2026-04-18 23:17:57.007922+00	\N	0	1
9	11	65	\N	36.0000	30.0000	Coffee		2026-04-18 23:34:10.402373+00	36	0	1
10	11	8	\N	20.0000	30.0000	Syrup		2026-04-18 23:34:10.402373+00	59	0	1
11	12	65	\N	36.0000	30.0000	Coffee		2026-04-18 23:39:50.645309+00	36	0	1
12	12	8	\N	30.0000	45.0000	Syrup		2026-04-18 23:39:50.645309+00	61	0	1
13	13	65	\N	36.0000	30.0000	Coffee	Colombian · Triple Shot	2026-04-19 00:20:39.943303+00	36	0	1
14	13	5	\N	20.0000	20.0000	Syrup	Vanilla · 2 Pumps	2026-04-19 00:20:39.943303+00	56	0	1
15	13	4	\N	276.0000	11.0400	Milk	Almond (276ml)	2026-04-19 00:20:39.943303+00	\N	0	1
16	14	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-19 11:26:27.589348+00	35	0	1
17	14	\N	\N	0.0000	0.0000	Syrup	None	2026-04-19 11:26:27.589348+00	\N	0	1
18	14	2	\N	0.0000	0.0000	Milk	Full Cream	2026-04-19 11:26:27.589348+00	\N	0	1
19	14	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-19 11:26:27.589348+00	\N	0	1
20	15	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-19 15:26:56.731527+00	35	1	1
21	15	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-19 15:26:56.731527+00	55	3	1
22	15	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-19 15:26:56.731527+00	73	4	1
23	15	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-19 15:26:56.731527+00	73	5	1
24	15	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-19 15:26:56.731527+00	\N	6	1
25	15	2	\N	220.0000	0.0000	Milk Type	Full Cream (220ml)	2026-04-19 15:26:56.731527+00	\N	2	1
26	16	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-19 15:35:22.610195+00	35	1	1
27	16	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-19 15:35:22.610195+00	55	3	1
28	16	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-19 15:35:22.610195+00	73	4	1
29	16	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-19 15:35:22.610195+00	73	5	1
30	16	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-19 15:35:22.610195+00	\N	6	1
31	16	73	\N	240.0000	0.0000	Milk Type	Coconut Milk (240ml)	2026-04-19 15:35:22.610195+00	\N	2	1
32	17	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-19 15:43:48.537814+00	35	1	1
33	17	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-19 15:43:48.537814+00	55	3	1
34	17	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-19 15:43:48.537814+00	73	4	1
35	17	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-19 15:43:48.537814+00	73	5	1
36	17	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-19 15:43:48.537814+00	\N	6	1
37	17	4	\N	240.0000	9.6000	Milk Type	Almond (240ml)	2026-04-19 15:43:48.537814+00	\N	2	1
38	18	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-19 16:02:49.396825+00	35	1	1
39	18	2	\N	0.0000	0.0000	Milk Type	Full Cream	2026-04-19 16:02:49.396825+00	\N	2	1
40	18	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-19 16:02:49.396825+00	55	3	1
41	18	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-19 16:02:49.396825+00	73	4	1
42	18	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-19 16:02:49.396825+00	73	5	1
43	18	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-19 16:02:49.396825+00	\N	6	1
44	19	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-19 16:22:36.257153+00	35	1	1
45	19	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-19 16:22:36.257153+00	55	3	1
46	19	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-19 16:22:36.257153+00	73	4	1
47	19	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-19 16:22:36.257153+00	73	5	1
48	19	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-19 16:22:36.257153+00	\N	6	1
49	19	2	\N	260.0000	0.0000	Milk Type	Full Cream (260ml)	2026-04-19 16:22:36.257153+00	\N	2	1
50	20	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-20 09:07:49.689864+00	\N	1	1
51	20	55	\N	15.0000	0.0000	Salted Caramel	Salted Caramel · 1 Pump Sauce	2026-04-20 09:07:49.689864+00	89	2	1
52	20	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-20 09:07:49.689864+00	35	3	1
53	20	\N	\N	120.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-20 09:07:49.689864+00	77	4	1
54	20	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-20 09:07:49.689864+00	\N	6	1
55	20	86	46	80.0000	0.0000	Milk	Dynamic (80ml)	2026-04-20 09:07:49.689864+00	\N	1	1
56	21	65	\N	36.0000	35.0000	Coffe Type	Colombian · Triple Shot	2026-04-20 14:58:57.971224+00	36	1	1
57	21	10	\N	35.0000	0.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-20 14:58:57.971224+00	79	1	1
58	22	71	\N	18.0000	-5.0000	Coffe Type	Ethiobian · Single Shot	2026-04-20 14:58:57.971224+00	37	1	1
59	23	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-20 14:58:57.971224+00	\N	1	1
60	23	55	\N	45.0000	45.0000	Salted Caramel	Salted Caramel · 3 Pump Sauce	2026-04-20 14:58:57.971224+00	91	2	1
61	23	71	\N	36.0000	40.0000	Coffee	Ethiobian · Triple Shot	2026-04-20 14:58:57.971224+00	39	3	1
62	23	\N	\N	100.0000	0.0000	Ice Cubes	Ice Cubes · Less Cubes	2026-04-20 14:58:57.971224+00	76	4	1
63	23	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-20 14:58:57.971224+00	\N	6	1
64	23	86	42	41.0000	0.0000	Milk	Dynamic (41ml)	2026-04-20 14:58:57.971224+00	\N	1	1
65	24	65	\N	18.0000	0.0000	Coffee Type	Colombian · Double Shot	2026-04-20 22:04:46.351225+00	35	1	1
66	24	5	\N	10.0000	10.0000	Syrap Type	Vanilla · 1 Pump	2026-04-20 22:04:46.351225+00	55	3	1
67	24	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-20 22:04:46.351225+00	73	4	1
68	24	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-20 22:04:46.351225+00	73	5	1
69	24	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-20 22:04:46.351225+00	\N	6	1
70	24	2	\N	260.0000	0.0000	Milk Type	Full Cream (260ml)	2026-04-20 22:04:46.351225+00	\N	2	1
71	25	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 08:58:48.70103+00	35	1	1
72	25	5	\N	10.0000	10.0000	Syrup	Vanilla · 1 Pump	2026-04-21 08:58:48.70103+00	55	3	1
73	25	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-21 08:58:48.70103+00	73	4	1
74	25	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-21 08:58:48.70103+00	73	5	1
75	25	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-21 08:58:48.70103+00	\N	6	1
76	25	2	\N	260.0000	0.0000	Milk	Full Cream (260ml)	2026-04-21 08:58:48.70103+00	\N	2	1
77	26	65	\N	36.0000	35.0000	Coffe Type	Colombian · Triple Shot	2026-04-21 09:15:10.794654+00	36	1	1
78	26	10	\N	35.0000	0.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-21 09:15:10.794654+00	79	1	1
79	27	71	\N	36.0000	40.0000	Coffe Type	Ethiobian · Triple Shot	2026-04-21 09:16:03.484102+00	39	1	1
80	28	71	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double Shot	2026-04-21 09:17:45.05291+00	38	1	1
81	29	83	\N	20.0000	0.0000	Specialty coffee	Colombia Sedama (300ml)	2026-04-21 09:20:44.58978+00	\N	1	1
82	29	65	\N	36.0000	0.0000	Coffee Type	Colombian · Triple Shot	2026-04-21 09:20:44.58978+00	36	1	1
83	30	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 09:20:44.58978+00	35	1	1
84	30	8	\N	20.0000	35.0000	Syrup	Hazelnut · 2 Pumps	2026-04-21 09:20:44.58978+00	59	1	1
85	30	\N	\N	170.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-04-21 09:20:44.58978+00	78	1	1
86	30	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-21 09:20:44.58978+00	\N	20	1
87	30	10	\N	35.0000	0.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-21 09:20:44.58978+00	79	1	1
88	30	74	\N	75.0000	0.0000	Milk	Free Lactos Milk (75ml)	2026-04-21 09:20:44.58978+00	\N	1	1
89	31	71	\N	18.0000	0.0000	Coffee	Ethiobian · Double Shot	2026-04-21 09:28:48.572625+00	38	1	1
90	31	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-04-21 09:28:48.572625+00	\N	1	1
91	32	71	\N	18.0000	0.0000	Coffee	Ethiobian · Double Shot	2026-04-21 10:48:47.079995+00	38	1	1
92	32	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-04-21 10:48:47.079995+00	\N	1	1
93	33	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 10:48:47.079995+00	35	1	1
94	33	\N	\N	0.0000	0.0000	Syrup	None	2026-04-21 10:48:47.079995+00	\N	1	1
95	33	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 10:48:47.079995+00	77	1	1
96	33	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-21 10:48:47.079995+00	\N	20	1
97	33	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 10:48:47.079995+00	\N	1	1
98	33	2	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-04-21 10:48:47.079995+00	\N	1	1
99	34	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 11:07:34.376674+00	35	1	1
100	34	\N	\N	0.0000	0.0000	Syrup	None	2026-04-21 11:07:34.376674+00	\N	1	1
101	34	2	\N	0.0000	0.0000	Milk	Full Cream	2026-04-21 11:07:34.376674+00	\N	1	1
102	34	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-21 11:07:34.376674+00	\N	1	1
103	35	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 13:29:39.689309+00	35	1	1
104	35	\N	\N	0.0000	0.0000	Syrup	None	2026-04-21 13:29:39.689309+00	\N	1	1
105	35	2	\N	0.0000	0.0000	Milk	Full Cream	2026-04-21 13:29:39.689309+00	\N	1	1
106	35	\N	\N	0.0000	0.0000	Foam	More Foam (70ml)	2026-04-21 13:29:39.689309+00	\N	1	1
107	36	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 14:32:09.242622+00	\N	1	1
108	36	52	\N	30.0000	55.0000	Sauce	Pistachio · 2 Pump Sauce	2026-04-21 14:32:09.242622+00	97	2	1
109	36	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:32:09.242622+00	35	3	1
110	36	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 14:32:09.242622+00	77	4	1
111	36	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:32:09.242622+00	\N	6	1
112	36	2	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-04-21 14:32:09.242622+00	\N	5	1
113	37	71	\N	36.0000	40.0000	Coffe Type	Ethiobian · Triple Shot	2026-04-21 14:32:09.242622+00	39	1	1
114	38	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 14:32:09.242622+00	\N	1	1
115	38	27	\N	20.0000	55.0000	Sauce	Condensed · 2 Pump Sauce	2026-04-21 14:32:09.242622+00	103	2	1
116	38	38	\N	20.0000	0.0000	Sauce	Lotus · 2 Pump Sauce	2026-04-21 14:32:09.242622+00	115	3	1
117	38	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:32:09.242622+00	35	4	1
118	38	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 14:32:09.242622+00	77	5	1
119	38	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:32:09.242622+00	\N	7	1
120	38	2	\N	140.0000	0.0000	Milk	Full Cream (140ml)	2026-04-21 14:32:09.242622+00	\N	6	1
121	39	65	\N	18.0000	0.0000	Coffe Type	Colombian · Double Shot	2026-04-21 14:32:09.242622+00	35	1	1
122	40	83	\N	20.0000	0.0000	Specialty coffee	Colombia Sedama (300ml)	2026-04-21 14:32:09.242622+00	\N	1	1
123	40	71	\N	18.0000	0.0000	Coffee Type	Ethiobian · Double Shot	2026-04-21 14:32:09.242622+00	38	1	1
124	41	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:32:09.242622+00	35	5	1
125	41	6	\N	35.0000	55.0000	Sauce	Caramel · 2 Pump Sauce	2026-04-21 14:32:09.242622+00	74	3	1
126	41	5	\N	10.0000	30.0000	Syrup	Vanilla · 1 Pump	2026-04-21 14:32:09.242622+00	55	2	1
127	41	\N	\N	190.0000	0.0000	Cubes	Ice Cubes · Standard	2026-04-21 14:32:09.242622+00	77	6	1
128	41	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:32:09.242622+00	\N	6	1
129	41	\N	\N	0.0000	0.0000	Sweetener	None	2026-04-21 14:32:09.242622+00	\N	1	1
130	41	60	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-21 14:32:09.242622+00	113	8	1
131	41	2	\N	95.0000	0.0000	Milk	Full Cream (95ml)	2026-04-21 14:32:09.242622+00	\N	7	1
132	42	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 14:35:17.172778+00	\N	1	1
133	42	59	\N	10.0000	30.0000	Syrup	Tofft Nut · 1 Pump	2026-04-21 14:35:17.172778+00	62	1	1
134	42	7	\N	30.0000	55.0000	Sauce	Chocolate · 2 Pumps	2026-04-21 14:35:17.172778+00	50	1	1
135	42	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 14:35:17.172778+00	77	1	1
136	42	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:35:17.172778+00	35	1	1
137	42	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:35:17.172778+00	\N	1	1
138	42	86	38	190.0000	0.0000	Milk	Dynamic (190ml)	2026-04-21 14:35:17.172778+00	\N	1	1
139	43	71	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double Shot	2026-04-21 14:35:17.172778+00	38	1	1
140	43	10	\N	35.0000	35.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-21 14:35:17.172778+00	79	1	1
141	44	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 14:36:30.615449+00	\N	1	1
142	44	59	\N	10.0000	30.0000	Syrup	Tofft Nut · 1 Pump	2026-04-21 14:36:30.615449+00	62	1	1
143	44	7	\N	45.0000	75.0000	Sauce	Chocolate · 3 Pumps	2026-04-21 14:36:30.615449+00	51	1	1
144	44	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 14:36:30.615449+00	77	1	1
145	44	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:36:30.615449+00	35	1	1
146	44	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:36:30.615449+00	\N	1	1
147	44	86	38	175.0000	0.0000	Milk	Dynamic (175ml)	2026-04-21 14:36:30.615449+00	\N	1	1
148	45	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 14:36:30.615449+00	35	1	1
149	45	5	\N	10.0000	10.0000	Syrup	Vanilla · 1 Pump	2026-04-21 14:36:30.615449+00	55	3	1
150	45	6	\N	10.0000	0.0000	Sauce	Caramel · 1 Pump Sauce	2026-04-21 14:36:30.615449+00	73	4	1
151	45	6	\N	10.0000	0.0000	Sauce Garnish	Caramel · 1 Pump Sauce	2026-04-21 14:36:30.615449+00	73	5	1
152	45	\N	\N	0.0000	0.0000	Foam	Creamy Milk (40ml)	2026-04-21 14:36:30.615449+00	\N	6	1
153	45	2	\N	260.0000	0.0000	Milk	Full Cream (260ml)	2026-04-21 14:36:30.615449+00	\N	2	1
154	46	71	\N	18.0000	0.0000	Coffee	Ethiobian · Double Shot	2026-04-21 14:37:55.453798+00	38	1	1
155	46	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-04-21 14:37:55.453798+00	\N	1	1
156	47	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 14:49:10.594103+00	\N	1	1
157	47	59	\N	10.0000	30.0000	Syrup	Tofft Nut · 1 Pump	2026-04-21 14:49:10.594103+00	62	1	1
158	47	7	\N	30.0000	55.0000	Sauce	Chocolate · 2 Pumps	2026-04-21 14:49:10.594103+00	50	1	1
159	47	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 14:49:10.594103+00	77	1	1
160	47	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 14:49:10.594103+00	35	1	1
161	47	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 14:49:10.594103+00	\N	1	1
162	47	86	38	190.0000	0.0000	Milk	Dynamic (190ml)	2026-04-21 14:49:10.594103+00	\N	1	1
163	48	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 16:10:18.550759+00	\N	1	1
164	48	52	\N	30.0000	55.0000	Sauce	Pistachio · 2 Pump Sauce	2026-04-21 16:10:18.550759+00	97	2	1
165	48	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 16:10:18.550759+00	35	3	1
166	48	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 16:10:18.550759+00	77	4	1
167	48	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 16:10:18.550759+00	\N	6	1
168	48	2	\N	100.0000	0.0000	Milk	Full Cream (100ml)	2026-04-21 16:10:18.550759+00	\N	5	1
169	49	71	\N	18.0000	0.0000	Coffee	Ethiobian · Double Shot	2026-04-21 16:10:18.550759+00	38	1	1
170	49	\N	\N	150.0000	0.0000	Base	Hot Water (150ml)	2026-04-21 16:10:18.550759+00	\N	1	1
171	50	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 17:19:26.420448+00	\N	1	1
172	50	27	\N	45.0000	75.0000	Sauce	Condensed · 3 Pump Sauce	2026-04-21 17:19:26.420448+00	104	2	1
173	50	71	\N	36.0000	65.0000	Coffee	Ethiobian · Triple Shot	2026-04-21 17:19:26.420448+00	39	3	1
174	50	\N	\N	210.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-04-21 17:19:26.420448+00	78	4	1
175	50	10	\N	35.0000	35.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-21 17:19:26.420448+00	79	6	1
176	50	3	\N	87.0000	3.4800	Milk	Oat (87ml)	2026-04-21 17:19:26.420448+00	\N	5	1
177	51	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 19:10:05.806955+00	\N	1	1
178	51	59	\N	10.0000	30.0000	Syrup	Tofft Nut · 1 Pump	2026-04-21 19:10:05.806955+00	62	1	1
179	51	7	\N	30.0000	55.0000	Sauce	Chocolate · 2 Pumps	2026-04-21 19:10:05.806955+00	50	1	1
180	51	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 19:10:05.806955+00	77	1	1
181	51	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 19:10:05.806955+00	35	1	1
182	51	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 19:10:05.806955+00	\N	1	1
183	51	86	38	190.0000	0.0000	Milk	Dynamic (190ml)	2026-04-21 19:10:05.806955+00	\N	1	1
184	52	71	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double Shot	2026-04-21 19:10:05.806955+00	38	1	1
185	53	71	\N	18.0000	-5.0000	Coffee	Ethiobian · Single Shot	2026-04-21 19:10:05.806955+00	37	1	1
186	53	\N	\N	0.0000	0.0000	Syrap	None	2026-04-21 19:10:05.806955+00	\N	1	1
187	53	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-21 19:10:05.806955+00	\N	1	1
188	53	2	\N	107.0000	0.0000	Milk	Full Cream (107ml)	2026-04-21 19:10:05.806955+00	\N	1	1
189	54	83	\N	20.0000	0.0000	Specialty coffee	Colombia Sedama (300ml)	2026-04-21 19:11:52.31301+00	\N	1	1
190	54	71	\N	18.0000	0.0000	Coffee Type	Ethiobian · Double Shot	2026-04-21 19:11:52.31301+00	38	1	1
191	55	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 19:11:52.31301+00	\N	1	1
192	55	52	\N	35.0000	55.0000	Sauce	Pistachio · 2 Pump Sauce	2026-04-21 19:11:52.31301+00	97	2	1
193	55	60	\N	30.0000	0.0000	Powder	Vanilla · 1 Pump	2026-04-21 19:11:52.31301+00	113	3	1
194	55	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 19:11:52.31301+00	35	4	1
195	55	\N	\N	180.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 19:11:52.31301+00	77	5	1
196	55	10	\N	35.0000	35.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-21 19:11:52.31301+00	79	7	1
197	56	65	\N	18.0000	0.0000	Coffee	Colombian · Double Shot	2026-04-21 19:11:52.31301+00	35	1	1
198	56	\N	\N	0.0000	0.0000	Syrup	None	2026-04-21 19:11:52.31301+00	\N	1	1
199	56	\N	\N	150.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 19:11:52.31301+00	77	1	1
200	56	\N	\N	0.0000	0.0000	Foam	Light Foam (20ml)	2026-04-21 19:11:52.31301+00	\N	20	1
201	56	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 19:11:52.31301+00	\N	1	1
202	56	2	\N	150.0000	0.0000	Milk	Full Cream (150ml)	2026-04-21 19:11:52.31301+00	\N	1	1
203	57	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 19:12:46.78138+00	\N	1	1
204	57	59	\N	10.0000	30.0000	Syrup	Tofft Nut · 1 Pump	2026-04-21 19:12:46.78138+00	62	1	1
205	57	7	\N	30.0000	55.0000	Sauce	Chocolate · 2 Pumps	2026-04-21 19:12:46.78138+00	50	1	1
206	57	\N	\N	140.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 19:12:46.78138+00	77	1	1
207	57	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 19:12:46.78138+00	35	1	1
208	57	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 19:12:46.78138+00	\N	1	1
209	57	86	38	190.0000	0.0000	Milk	Dynamic (190ml)	2026-04-21 19:12:46.78138+00	\N	1	1
210	58	\N	\N	0.0000	0.0000	Sweetner	None	2026-04-21 19:12:46.78138+00	\N	6	1
211	58	7	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-04-21 19:12:46.78138+00	50	2	1
212	58	65	\N	18.0000	40.0000	Coffee	Colombian · Double Shot	2026-04-21 19:12:46.78138+00	35	3	1
213	58	\N	\N	190.0000	0.0000	Ice Cubes	Ice Cubes · Standard	2026-04-21 19:12:46.78138+00	77	4	1
214	58	\N	\N	0.0000	0.0000	Whipped Cream	None	2026-04-21 19:12:46.78138+00	\N	6	1
215	58	3	\N	140.0000	5.6000	Milk	Oat (140ml)	2026-04-21 19:12:46.78138+00	\N	5	1
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, drink_id, drink_name, quantity, unit_price, line_total, special_notes, created_at, updated_at, kitchen_station, status) FROM stdin;
1	1	1	Flat White Test	1	150.00	150.00	\N	2026-04-18 20:36:50.029019+00	2026-04-18 20:36:50.029019+00	main	pending
2	2	13	White Mocha	1	160.00	160.00	\N	2026-04-18 20:38:35.402795+00	2026-04-18 20:38:35.402795+00	main	pending
3	3	14	Cappuccino 	1	130.00	130.00	\N	2026-04-18 21:23:12.797078+00	2026-04-18 21:23:12.797078+00	main	pending
4	4	13	White Mocha	1	160.00	160.00	\N	2026-04-18 22:10:57.854106+00	2026-04-18 22:10:57.854106+00	main	pending
5	5	6	Espresso Chocolate	1	180.00	180.00	\N	2026-04-18 22:11:43.653883+00	2026-04-18 22:11:43.653883+00	main	pending
6	6	14	Cappuccino 	1	130.00	130.00	\N	2026-04-18 22:14:00.396018+00	2026-04-18 22:14:00.396018+00	main	pending
7	7	14	Cappuccino 	1	130.00	130.00	\N	2026-04-18 22:31:12.84036+00	2026-04-18 22:31:12.84036+00	main	pending
8	8	14	Cappuccino 	1	130.00	130.00	\N	2026-04-18 22:40:07.32794+00	2026-04-18 22:40:07.32794+00	main	pending
9	9	14	Cappuccino 	1	190.00	190.00	\N	2026-04-18 23:13:09.418669+00	2026-04-18 23:13:09.418669+00	main	pending
10	10	14	Cappuccino 	1	190.00	190.00	Less milk	2026-04-18 23:17:57.007922+00	2026-04-18 23:17:57.007922+00	main	pending
11	11	14	Cappuccino 	1	190.00	190.00	\N	2026-04-18 23:34:10.402373+00	2026-04-18 23:34:10.402373+00	main	pending
12	12	14	Cappuccino 	1	205.00	205.00	\N	2026-04-18 23:39:50.645309+00	2026-04-18 23:39:50.645309+00	main	pending
13	13	14	Cappuccino 	1	191.04	191.04	\N	2026-04-19 00:20:39.943303+00	2026-04-19 00:20:39.943303+00	main	pending
14	14	14	Cappuccino 	1	130.00	130.00	\N	2026-04-19 11:26:27.589348+00	2026-04-19 11:26:27.589348+00	main	pending
15	15	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-19 15:26:56.731527+00	2026-04-19 15:26:56.731527+00	main	pending
16	16	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-19 15:35:22.610195+00	2026-04-19 15:35:22.610195+00	main	pending
17	17	19	Caramel Macchiato	1	204.60	204.60	\N	2026-04-19 15:43:48.537814+00	2026-04-19 15:43:48.537814+00	main	pending
18	18	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-19 16:02:49.396825+00	2026-04-19 16:02:49.396825+00	main	pending
19	19	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-19 16:22:36.257153+00	2026-04-19 16:22:36.257153+00	main	pending
20	20	23	Iced Salted Cortado	1	160.00	160.00	\N	2026-04-20 09:07:49.689864+00	2026-04-20 09:07:49.689864+00	main	pending
21	21	17	Espresso Conpana	1	165.00	165.00	\N	2026-04-20 14:58:57.971224+00	2026-04-20 14:58:57.971224+00	main	pending
22	21	16	Espresso Affogato	1	125.00	125.00	so5n	2026-04-20 14:58:57.971224+00	2026-04-20 14:58:57.971224+00	main	pending
23	21	23	Iced Salted Cortado	1	245.00	245.00	\N	2026-04-20 14:58:57.971224+00	2026-04-20 14:58:57.971224+00	main	pending
24	22	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-20 22:04:46.351225+00	2026-04-20 22:04:46.351225+00	main	pending
25	23	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-21 08:58:48.70103+00	2026-04-21 08:58:48.70103+00	main	pending
26	24	17	Espresso Conpana	1	165.00	165.00	Extra sauce	2026-04-21 09:15:10.794654+00	2026-04-21 09:15:10.794654+00	espresso	pending
27	25	15	Espresso	1	135.00	135.00	Best 	2026-04-21 09:16:03.484102+00	2026-04-21 09:16:03.484102+00	main	pending
28	26	15	Espresso	1	95.00	95.00	\N	2026-04-21 09:17:45.05291+00	2026-04-21 09:17:45.05291+00	main	pending
29	27	18	Red Eye	1	205.00	205.00	\N	2026-04-21 09:20:44.58978+00	2026-04-21 09:20:44.58978+00	espresso	pending
30	27	21	Iced Cappuccino	1	170.00	170.00	\N	2026-04-21 09:20:44.58978+00	2026-04-21 09:20:44.58978+00	cold	pending
31	28	4	Americano	1	110.00	110.00	Milk	2026-04-21 09:28:48.572625+00	2026-04-21 09:28:48.572625+00	hot-bar	pending
32	29	4	Americano	1	110.00	110.00	\N	2026-04-21 10:48:47.079995+00	2026-04-21 10:48:47.079995+00	hot-bar	pending
33	29	21	Iced Cappuccino	1	135.00	135.00	\N	2026-04-21 10:48:47.079995+00	2026-04-21 10:48:47.079995+00	cold-bar	pending
34	30	14	Cappuccino 	1	130.00	130.00	\N	2026-04-21 11:07:34.376674+00	2026-04-21 14:34:28.055+00	cold-bar	ready
36	32	30	Iced Flat White Pistachio	1	95.00	95.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:29.141+00	cold-bar	ready
37	32	15	Espresso	1	135.00	135.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:30.105+00	cold-bar	ready
39	32	16	Espresso Affogato	1	130.00	130.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:31.029+00	hot-bar	ready
38	32	41	Iced Louts Spanish Latte	1	95.00	95.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:31.336+00	cold-bar	ready
35	31	14	Cappuccino 	1	130.00	130.00	\N	2026-04-21 13:29:39.689309+00	2026-04-21 14:34:31.811+00	cold-bar	ready
40	32	18	Red Eye	1	205.00	205.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:32.944+00	hot-bar	ready
41	32	26	Caramel Macchiato Frappe	1	125.00	125.00	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:33.888+00	cold-bar	ready
48	37	30	Iced Flat White Pistachio	1	95.00	95.00	\N	2026-04-21 16:10:18.550759+00	2026-04-21 16:10:18.550759+00	cold-bar	pending
49	37	4	Americano	1	110.00	110.00	\N	2026-04-21 16:10:18.550759+00	2026-04-21 16:10:18.550759+00	hot-bar	pending
43	33	17	Espresso Conpana	1	165.00	165.00	\N	2026-04-21 14:35:17.172778+00	2026-04-21 14:35:55.811+00	hot-bar	ready
50	38	40	Iced Spanish Latte	1	178.48	178.48	\N	2026-04-21 17:19:26.420448+00	2026-04-21 17:19:26.420448+00	cold-bar	pending
51	39	24	Iced Mocha Toffy Nut	1	125.00	125.00	\N	2026-04-21 19:10:05.806955+00	2026-04-21 19:10:05.806955+00	cold-bar	pending
52	39	15	Espresso	1	95.00	95.00	\N	2026-04-21 19:10:05.806955+00	2026-04-21 19:10:05.806955+00	cold-bar	pending
53	39	20	Cortado	1	115.00	115.00	\N	2026-04-21 19:10:05.806955+00	2026-04-21 19:10:05.806955+00	hot-bar	pending
54	40	18	Red Eye	1	205.00	205.00	\N	2026-04-21 19:11:52.31301+00	2026-04-21 19:11:52.31301+00	hot-bar	pending
42	33	24	Iced Mocha Toffy Nut	1	125.00	125.00	\N	2026-04-21 14:35:17.172778+00	2026-04-21 14:35:58.897+00	cold-bar	ready
44	34	24	Iced Mocha Toffy Nut	1	145.00	145.00	\N	2026-04-21 14:36:30.615449+00	2026-04-21 14:49:47.945+00	cold-bar	ready
45	34	19	Caramel Macchiato	1	195.00	195.00	\N	2026-04-21 14:36:30.615449+00	2026-04-21 14:49:50.819+00	hot-bar	ready
46	35	4	Americano	1	110.00	110.00	\N	2026-04-21 14:37:55.453798+00	2026-04-21 14:49:53.166+00	hot-bar	ready
47	36	24	Iced Mocha Toffy Nut	1	125.00	125.00	\N	2026-04-21 14:49:10.594103+00	2026-04-21 14:49:56.513+00	cold-bar	ready
55	40	35	Pistachio Flat white Frappe	1	130.00	130.00	\N	2026-04-21 19:11:52.31301+00	2026-04-21 19:11:52.31301+00	cold-bar	pending
56	40	21	Iced Cappuccino	1	135.00	135.00	\N	2026-04-21 19:11:52.31301+00	2026-04-21 19:11:52.31301+00	cold-bar	pending
57	41	24	Iced Mocha Toffy Nut	1	125.00	125.00	\N	2026-04-21 19:12:46.78138+00	2026-04-21 19:12:46.78138+00	cold-bar	pending
58	41	42	Iced Mocha	1	45.60	45.60	\N	2026-04-21 19:12:46.78138+00	2026-04-21 19:12:46.78138+00	cold-bar	pending
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, barista_id, status, customer_name, subtotal, discount, total, payment_method, amount_tendered, change_due, notes, created_at, updated_at) FROM stdin;
26	111004	4	ready	\N	95.00	0.00	95.00	cash	\N	\N	\N	2026-04-21 09:17:45.05291+00	2026-04-21 09:26:14.899+00
27	111005	4	ready	\N	375.00	0.00	375.00	card	\N	\N	\N	2026-04-21 09:20:44.58978+00	2026-04-21 09:27:21.205+00
4	108004	1	ready	\N	160.00	0.00	160.00	card	\N	\N	\N	2026-04-18 22:10:57.854106+00	2026-04-18 22:11:13.813+00
25	111003	4	ready	\N	135.00	0.00	135.00	cash	\N	\N	\N	2026-04-21 09:16:03.484102+00	2026-04-21 09:27:23.404+00
6	108006	1	ready	\N	130.00	0.00	130.00	cash	\N	\N	\N	2026-04-18 22:14:00.396018+00	2026-04-18 22:36:13.202+00
24	111002	4	ready	\N	165.00	0.00	165.00	cash	\N	\N	\N	2026-04-21 09:15:10.794654+00	2026-04-21 09:27:27.534+00
7	108007	1	ready	\N	130.00	0.00	130.00	card	\N	\N	\N	2026-04-18 22:31:12.84036+00	2026-04-18 22:36:15.589+00
8	108008	1	ready	\N	130.00	0.00	130.00	card	\N	\N	\N	2026-04-18 22:40:07.32794+00	2026-04-18 23:13:23.328+00
5	108005	1	ready	\N	180.00	0.00	180.00	cash	\N	\N	\N	2026-04-18 22:11:43.653883+00	2026-04-18 23:13:26.017+00
28	111006	4	ready	\N	110.00	0.00	110.00	card	\N	\N	\N	2026-04-21 09:28:48.572625+00	2026-04-21 09:34:55.852+00
11	108011	1	ready	\N	190.00	0.00	190.00	card	\N	\N	\N	2026-04-18 23:34:10.402373+00	2026-04-19 00:20:06.143+00
12	108012	1	ready	\N	205.00	0.00	205.00	card	\N	\N	\N	2026-04-18 23:39:50.645309+00	2026-04-19 00:20:08.087+00
10	108010	1	ready	\N	190.00	0.00	190.00	card	\N	\N	\N	2026-04-18 23:17:57.007922+00	2026-04-19 00:20:10.668+00
9	108009	1	ready	\N	190.00	0.00	190.00	card	\N	\N	\N	2026-04-18 23:13:09.418669+00	2026-04-19 00:20:13.721+00
29	111007	1	ready	Sameh	245.00	0.00	245.00	card	\N	\N	\N	2026-04-21 10:48:47.079995+00	2026-04-21 11:31:05.654+00
13	109001	1	ready	\N	191.04	0.00	191.04	card	\N	\N	\N	2026-04-19 00:20:39.943303+00	2026-04-19 16:00:23.084+00
16	109004	1	ready	\N	195.00	0.00	195.00	card	\N	\N	\N	2026-04-19 15:35:22.610195+00	2026-04-19 16:00:31.918+00
15	109003	1	ready	\N	195.00	0.00	195.00	card	\N	\N	\N	2026-04-19 15:26:56.731527+00	2026-04-19 16:22:59.845+00
17	109005	1	ready	\N	204.60	0.00	204.60	card	\N	\N	\N	2026-04-19 15:43:48.537814+00	2026-04-19 16:23:04.205+00
18	109006	1	ready	\N	195.00	0.00	195.00	card	\N	\N	\N	2026-04-19 16:02:49.396825+00	2026-04-19 16:23:07.043+00
14	109002	1	ready	00	130.00	0.00	130.00	card	\N	\N	\N	2026-04-19 11:26:27.589348+00	2026-04-20 15:02:33.937+00
30	111008	4	ready	\N	130.00	0.00	130.00	card	\N	\N	\N	2026-04-21 11:07:34.376674+00	2026-04-21 14:34:28.058+00
31	111009	4	ready	\N	130.00	0.00	130.00	card	\N	\N	\N	2026-04-21 13:29:39.689309+00	2026-04-21 14:34:31.814+00
21	110002	1	ready	\N	535.00	0.00	535.00	cash	\N	\N	\N	2026-04-20 14:58:57.971224+00	2026-04-20 15:03:19.494+00
20	110001	1	ready	\N	160.00	0.00	160.00	card	\N	\N	\N	2026-04-20 09:07:49.689864+00	2026-04-20 15:03:20.909+00
19	109007	1	ready	\N	195.00	0.00	195.00	card	\N	\N	\N	2026-04-19 16:22:36.257153+00	2026-04-20 15:03:22.073+00
32	111010	5	ready	\N	785.00	0.00	785.00	card	\N	\N	\N	2026-04-21 14:32:09.242622+00	2026-04-21 14:34:33.891+00
22	110003	1	ready	\N	195.00	0.00	195.00	card	\N	\N	\N	2026-04-20 22:04:46.351225+00	2026-04-20 22:28:16.227+00
1	108001	4	completed	Adam Sameh	150.00	0.00	150.00	card	\N	\N	\N	2026-04-18 20:36:50.029019+00	2026-04-21 14:34:39.991+00
23	111001	1	ready	Sameh	195.00	0.00	195.00	card	\N	\N	\N	2026-04-21 08:58:48.70103+00	2026-04-21 09:10:13.112+00
2	108002	1	completed	\N	160.00	0.00	160.00	card	\N	\N	\N	2026-04-18 20:38:35.402795+00	2026-04-21 14:34:40.826+00
3	108003	1	completed	\N	130.00	0.00	130.00	card	\N	\N	\N	2026-04-18 21:23:12.797078+00	2026-04-21 14:34:41.395+00
33	111011	5	ready	\N	290.00	0.00	290.00	cash	\N	\N	\N	2026-04-21 14:35:17.172778+00	2026-04-21 14:35:54.597+00
34	111012	5	ready	\N	340.00	0.00	340.00	cash	\N	\N	\N	2026-04-21 14:36:30.615449+00	2026-04-21 14:49:50.822+00
35	111013	5	ready	\N	110.00	0.00	110.00	cash	\N	\N	\N	2026-04-21 14:37:55.453798+00	2026-04-21 14:49:53.17+00
36	111014	5	ready	\N	125.00	0.00	125.00	card	\N	\N	\N	2026-04-21 14:49:10.594103+00	2026-04-21 14:49:56.517+00
37	111015	1	pending	\N	205.00	0.00	205.00	card	\N	\N	\N	2026-04-21 16:10:18.550759+00	2026-04-21 16:10:18.550759+00
38	111016	1	pending	Kok	178.48	0.00	178.48	card	\N	\N	\N	2026-04-21 17:19:26.420448+00	2026-04-21 17:19:26.420448+00
39	111017	1	pending	Adam	335.00	0.00	335.00	cash	400.00	65.00	\N	2026-04-21 19:10:05.806955+00	2026-04-21 19:10:05.806955+00
40	111018	1	pending	\N	470.00	0.00	470.00	cash	\N	\N	\N	2026-04-21 19:11:52.31301+00	2026-04-21 19:11:52.31301+00
41	111019	1	pending	\N	170.60	0.00	170.60	cash	200.00	29.40	\N	2026-04-21 19:12:46.78138+00	2026-04-21 19:12:46.78138+00
\.


--
-- Data for Name: predefined_slot_type_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predefined_slot_type_options (id, predefined_slot_id, ingredient_type_id, is_default, sort_order, processed_qty, produced_qty, unit, extra_cost) FROM stdin;
1962	8	63	f	16	\N	\N	\N	\N
1963	8	34	f	1	\N	\N	\N	\N
1482	10	22	f	3	\N	\N	\N	\N
1725	7	28	f	3	\N	\N	\N	\N
1726	7	59	f	8	\N	\N	\N	\N
1727	7	60	f	9	\N	\N	\N	\N
1728	7	35	f	9	\N	\N	\N	\N
1729	7	19	f	9	\N	\N	\N	\N
1730	7	44	f	9	\N	\N	\N	\N
1731	7	65	f	10	\N	\N	\N	\N
1732	7	27	f	19	\N	\N	\N	\N
1733	7	56	f	22	\N	\N	\N	\N
222	3	11	f	5	\N	\N	\N	\N
223	3	12	f	6	\N	\N	\N	\N
168	6	40	t	0	\N	\N	\N	\N
169	6	83	f	1	\N	\N	\N	\N
170	6	84	f	2	\N	\N	\N	\N
171	6	21	f	3	\N	\N	\N	\N
194	5	17	t	0	\N	\N	\N	\N
195	5	20	f	1	\N	\N	\N	\N
196	5	62	f	7	\N	\N	\N	\N
124	4	15	t	0	\N	\N	\N	\N
125	4	16	f	1	\N	\N	\N	\N
126	4	79	f	3	\N	\N	\N	\N
127	4	80	f	4	\N	\N	\N	\N
128	4	81	f	5	\N	\N	\N	\N
129	4	82	f	6	\N	\N	\N	\N
130	4	47	f	7	\N	\N	\N	\N
131	4	35	f	7	\N	\N	\N	\N
132	4	14	f	8	\N	\N	\N	\N
1034	9	91	f	20	\N	\N	\N	\N
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
544	7	49	15.0000	15.0000	\N	30.0000	f	t	0
545	7	50	30.0000	30.0000	\N	55.0000	f	t	1
546	7	73	\N	\N	\N	0.0000	f	t	5
547	7	74	\N	\N	\N	0.0000	f	t	6
548	7	51	45.0000	45.0000	\N	75.0000	f	t	4
549	7	75	45.0000	45.0000	\N	75.0000	f	t	11
142	5	58	\N	\N	\N	15.0000	f	t	3
143	5	62	\N	\N	\N	25.0000	f	t	6
144	5	70	\N	\N	\N	0.0000	f	t	9
145	5	71	\N	\N	\N	0.0000	f	t	10
146	5	72	\N	\N	\N	0.0000	f	t	11
147	5	57	30.0000	30.0000	\N	75.0000	f	t	11
58	6	65	\N	\N	\N	0.0000	f	t	0
59	6	66	\N	\N	\N	0.0000	f	t	1
60	6	67	\N	\N	\N	0.0000	f	t	2
61	6	80	10.0000	10.0000	\N	0.0000	f	t	3
62	6	81	20.0000	20.0000	\N	0.0000	f	t	4
63	6	82	30.0000	30.0000	\N	0.0000	f	t	5
64	6	83	10.0000	10.0000	\N	0.0000	f	t	6
65	6	84	20.0000	20.0000	\N	0.0000	f	t	7
66	6	85	30.0000	30.0000	\N	0.0000	f	t	8
67	6	86	1.0000	1.0000	\N	0.0000	f	t	9
68	6	87	2.0000	2.0000	\N	0.0000	f	t	10
69	6	88	3.0000	3.0000	\N	0.0000	f	t	11
148	5	56	0.0000	0.0000	\N	20.0000	f	t	11
149	5	55	0.0000	0.0000	\N	10.0000	f	t	11
150	5	59	20.0000	20.0000	\N	55.0000	f	t	11
151	5	61	30.0000	30.0000	\N	75.0000	f	t	11
152	5	63	20.0000	20.0000	\N	55.0000	f	t	11
153	5	64	30.0000	30.0000	\N	75.0000	f	t	11
550	7	99	15.0000	15.0000	\N	30.0000	f	t	12
551	7	100	30.0000	30.0000	\N	55.0000	f	t	13
552	7	101	45.0000	45.0000	\N	75.0000	f	t	14
553	7	89	15.0000	15.0000	\N	35.0000	f	t	14
554	7	90	30.0000	30.0000	\N	55.0000	f	t	14
555	7	91	45.0000	45.0000	\N	75.0000	f	t	14
350	9	92	15.0000	15.0000	\N	0.0000	f	t	3
351	9	110	30.0000	30.0000	\N	55.0000	f	t	4
352	9	111	45.0000	45.0000	\N	75.0000	f	t	5
353	9	109	15.0000	15.0000	\N	30.0000	f	t	6
354	9	113	30.0000	30.0000	\N	0.0000	f	t	7
355	9	76	110.0000	110.0000	\N	0.0000	f	t	7
356	9	77	130.0000	130.0000	\N	0.0000	f	t	7
357	9	78	150.0000	150.0000	\N	0.0000	f	t	7
495	3	30	\N	\N	\N	0.0000	f	t	0
496	3	31	\N	\N	\N	0.0000	t	t	1
497	3	33	\N	\N	\N	0.0000	f	t	2
498	3	34	18.0000	18.0000	\N	30.0000	f	t	3
499	3	43	\N	\N	\N	0.0000	f	t	4
500	3	46	\N	\N	\N	0.0000	f	t	7
501	3	47	\N	\N	\N	0.0000	f	t	8
502	3	48	\N	\N	\N	0.0000	f	t	9
503	3	38	18.0000	36.0000	\N	45.0000	f	t	10
504	3	39	36.0000	54.0000	\N	65.0000	f	t	12
505	3	35	18.0000	36.0000	\N	40.0000	f	t	13
506	3	37	18.0000	18.0000	\N	35.0000	f	t	14
507	3	36	36.0000	54.0000	\N	60.0000	f	t	12
556	7	116	45.0000	45.0000	\N	0.0000	f	t	15
557	7	114	15.0000	15.0000	\N	0.0000	f	t	16
558	7	115	30.0000	30.0000	\N	0.0000	f	t	17
559	7	52	15.0000	15.0000	\N	30.0000	f	t	17
560	7	53	30.0000	30.0000	\N	55.0000	f	t	17
561	7	54	45.0000	45.0000	\N	75.0000	f	t	17
\.


--
-- Data for Name: predefined_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predefined_slots (id, name, slot_label, is_required, is_dynamic, affects_cup_size, created_at, updated_at) FROM stdin;
3	Coffee Espresso	Coffee	t	f	t	2026-04-21 08:21:12.615326+00	2026-04-21 08:21:12.615326+00
4	Milk	Milk	t	t	\N	2026-04-21 08:27:49.497174+00	2026-04-21 08:27:49.497174+00
5	All Syrup (V-TO-HZ)	Syrup	t	f	\N	2026-04-21 08:30:50.80663+00	2026-04-21 08:34:25.216+00
8	Powder	Powder	t	f	t	2026-04-21 09:23:52.450872+00	2026-04-21 09:23:52.450872+00
7	Sauce	Sauce	t	f	t	2026-04-21 09:22:57.547403+00	2026-04-21 09:43:26.335+00
6	Sweetner	Sweetner	t	f	f	2026-04-21 08:30:59.166362+00	2026-04-21 12:17:53.899+00
9	Ice Cubes	Ice Cubes	t	f	t	2026-04-21 12:55:21.570642+00	2026-04-21 12:55:21.570642+00
10	Whipped Cream	Whipped Cream	t	f	f	2026-04-21 12:55:47.446826+00	2026-04-21 12:55:47.446826+00
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, scope, user_id, key, value, updated_at) FROM stdin;
1	global	\N	autoPrintCustomer	true	2026-04-21 19:11:23.615+00
2	global	\N	autoPrintAgent	true	2026-04-21 19:11:25.368+00
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, ingredient_id, order_id, movement_type, quantity, quantity_after, note, created_by, created_at) FROM stdin;
1	1	5	sale	-27.0000	1973.0000	Order 108005	1	2026-04-18 22:11:43.653883+00
2	7	5	sale	-20.0000	780.0000	Order 108005	1	2026-04-18 22:11:43.653883+00
3	65	9	sale	-36.0000	0.0000	Order 108009	1	2026-04-18 23:13:09.418669+00
4	65	10	sale	-36.0000	0.0000	Order 108010	1	2026-04-18 23:17:57.007922+00
5	8	10	sale	-20.0000	580.0000	Order 108010	1	2026-04-18 23:17:57.007922+00
6	65	11	sale	-36.0000	0.0000	Order 108011	1	2026-04-18 23:34:10.402373+00
7	8	11	sale	-20.0000	560.0000	Order 108011	1	2026-04-18 23:34:10.402373+00
8	65	12	sale	-36.0000	0.0000	Order 108012	1	2026-04-18 23:39:50.645309+00
9	8	12	sale	-30.0000	530.0000	Order 108012	1	2026-04-18 23:39:50.645309+00
10	65	13	sale	-36.0000	0.0000	Order 109001	1	2026-04-19 00:20:39.943303+00
11	5	13	sale	-20.0000	980.0000	Order 109001	1	2026-04-19 00:20:39.943303+00
12	4	13	sale	-276.0000	1724.0000	Order 109001	1	2026-04-19 00:20:39.943303+00
13	14	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.17873+00
14	16	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.178984+00
15	15	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.187234+00
16	18	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.187643+00
17	17	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.189563+00
18	19	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.255968+00
19	20	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.258438+00
20	22	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.259972+00
21	23	\N	restock	99999.9900	99999.9900	Opening / startup stock entry	1	2026-04-19 09:13:58.261549+00
22	26	\N	restock	99999.9800	99999.9800	Opening / startup stock entry	1	2026-04-19 09:13:58.320231+00
23	27	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.322971+00
24	28	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.333159+00
25	29	\N	restock	10000000.0000	10000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.334968+00
26	30	\N	restock	10000000.0000	10000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.335377+00
27	31	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.381795+00
28	32	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.384204+00
29	34	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.397336+00
30	35	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.399742+00
31	36	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.400848+00
33	38	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.444004+00
32	37	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.443716+00
34	39	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.453773+00
35	40	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.458403+00
36	42	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.460873+00
37	43	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.503892+00
38	45	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.504377+00
39	46	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.514837+00
40	47	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.519872+00
41	48	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.522191+00
42	49	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.564964+00
43	50	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.565252+00
44	51	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.577056+00
45	52	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.590566+00
46	53	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.591001+00
47	55	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.62749+00
48	54	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.627837+00
49	56	\N	restock	10000000.0000	10000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.633932+00
50	59	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.655286+00
51	60	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.688367+00
52	63	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.688608+00
53	64	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.691758+00
54	65	\N	restock	100000.0000	100000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.71821+00
55	66	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.718473+00
56	67	\N	restock	10000000.0000	10000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.756235+00
57	69	\N	restock	10000000.0000	10000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.758076+00
58	70	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.778016+00
59	71	\N	restock	999.9900	999.9900	Opening / startup stock entry	1	2026-04-19 09:13:58.778366+00
60	72	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.812857+00
61	73	\N	restock	1000000.0000	1000000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.813183+00
62	74	\N	restock	10000.0000	10000.0000	Opening / startup stock entry	1	2026-04-19 09:13:58.828815+00
63	71	\N	restock	100000.0000	100999.9900	Opening / startup stock entry	1	2026-04-19 09:14:20.795215+00
64	57	\N	restock	1000.0000	1000.0000	Opening / startup stock entry	1	2026-04-19 09:14:26.901799+00
65	25	\N	restock	1000.0000	1000.0000	Opening / startup stock entry	1	2026-04-19 09:14:26.901385+00
66	68	\N	restock	1000.0000	1000.0000	Opening / startup stock entry	1	2026-04-19 09:14:26.91618+00
67	65	14	sale	-18.0000	99982.0000	Order 109002	1	2026-04-19 11:26:27.589348+00
68	65	15	sale	-18.0000	99964.0000	Order 109003	1	2026-04-19 15:26:56.731527+00
69	5	15	sale	-10.0000	970.0000	Order 109003	1	2026-04-19 15:26:56.731527+00
70	6	15	sale	-10.0000	790.0000	Order 109003	1	2026-04-19 15:26:56.731527+00
71	6	15	sale	-10.0000	780.0000	Order 109003	1	2026-04-19 15:26:56.731527+00
72	2	15	sale	-220.0000	3780.0000	Order 109003	1	2026-04-19 15:26:56.731527+00
73	65	16	sale	-18.0000	99946.0000	Order 109004	1	2026-04-19 15:35:22.610195+00
74	5	16	sale	-10.0000	960.0000	Order 109004	1	2026-04-19 15:35:22.610195+00
75	6	16	sale	-10.0000	770.0000	Order 109004	1	2026-04-19 15:35:22.610195+00
76	6	16	sale	-10.0000	760.0000	Order 109004	1	2026-04-19 15:35:22.610195+00
77	73	16	sale	-240.0000	999760.0000	Order 109004	1	2026-04-19 15:35:22.610195+00
78	65	17	sale	-18.0000	99928.0000	Order 109005	1	2026-04-19 15:43:48.537814+00
79	5	17	sale	-10.0000	950.0000	Order 109005	1	2026-04-19 15:43:48.537814+00
80	6	17	sale	-10.0000	750.0000	Order 109005	1	2026-04-19 15:43:48.537814+00
81	6	17	sale	-10.0000	740.0000	Order 109005	1	2026-04-19 15:43:48.537814+00
82	4	17	sale	-240.0000	1484.0000	Order 109005	1	2026-04-19 15:43:48.537814+00
83	65	18	sale	-18.0000	99910.0000	Order 109006	1	2026-04-19 16:02:49.396825+00
84	5	18	sale	-10.0000	940.0000	Order 109006	1	2026-04-19 16:02:49.396825+00
85	6	18	sale	-10.0000	730.0000	Order 109006	1	2026-04-19 16:02:49.396825+00
86	6	18	sale	-10.0000	720.0000	Order 109006	1	2026-04-19 16:02:49.396825+00
87	65	19	sale	-18.0000	99892.0000	Order 109007	1	2026-04-19 16:22:36.257153+00
88	5	19	sale	-10.0000	930.0000	Order 109007	1	2026-04-19 16:22:36.257153+00
89	6	19	sale	-10.0000	710.0000	Order 109007	1	2026-04-19 16:22:36.257153+00
90	6	19	sale	-10.0000	700.0000	Order 109007	1	2026-04-19 16:22:36.257153+00
91	2	19	sale	-260.0000	3520.0000	Order 109007	1	2026-04-19 16:22:36.257153+00
92	55	20	sale	-15.0000	999985.0000	Order 110001	1	2026-04-20 09:07:49.689864+00
93	65	20	sale	-18.0000	99874.0000	Order 110001	1	2026-04-20 09:07:49.689864+00
94	86	20	sale	-80.0000	0.0000	Order 110001	1	2026-04-20 09:07:49.689864+00
95	65	21	sale	-36.0000	99838.0000	Order 110002	1	2026-04-20 14:58:57.971224+00
96	10	21	sale	-35.0000	465.0000	Order 110002	1	2026-04-20 14:58:57.971224+00
97	71	21	sale	-18.0000	100981.9900	Order 110002	1	2026-04-20 14:58:57.971224+00
98	55	21	sale	-45.0000	999940.0000	Order 110002	1	2026-04-20 14:58:57.971224+00
99	71	21	sale	-36.0000	100945.9900	Order 110002	1	2026-04-20 14:58:57.971224+00
100	86	21	sale	-41.0000	0.0000	Order 110002	1	2026-04-20 14:58:57.971224+00
101	65	22	sale	-18.0000	99820.0000	Order 110003	1	2026-04-20 22:04:46.351225+00
102	5	22	sale	-10.0000	920.0000	Order 110003	1	2026-04-20 22:04:46.351225+00
103	6	22	sale	-10.0000	690.0000	Order 110003	1	2026-04-20 22:04:46.351225+00
104	6	22	sale	-10.0000	680.0000	Order 110003	1	2026-04-20 22:04:46.351225+00
105	2	22	sale	-260.0000	3260.0000	Order 110003	1	2026-04-20 22:04:46.351225+00
106	65	23	sale	-18.0000	99802.0000	Order 111001	1	2026-04-21 08:58:48.70103+00
107	5	23	sale	-10.0000	910.0000	Order 111001	1	2026-04-21 08:58:48.70103+00
108	6	23	sale	-10.0000	670.0000	Order 111001	1	2026-04-21 08:58:48.70103+00
109	6	23	sale	-10.0000	660.0000	Order 111001	1	2026-04-21 08:58:48.70103+00
110	2	23	sale	-260.0000	3000.0000	Order 111001	1	2026-04-21 08:58:48.70103+00
111	65	24	sale	-36.0000	99766.0000	Order 111002	4	2026-04-21 09:15:10.794654+00
112	10	24	sale	-35.0000	430.0000	Order 111002	4	2026-04-21 09:15:10.794654+00
113	71	25	sale	-36.0000	100909.9900	Order 111003	4	2026-04-21 09:16:03.484102+00
114	71	26	sale	-18.0000	100891.9900	Order 111004	4	2026-04-21 09:17:45.05291+00
115	83	27	sale	-20.0000	0.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
116	65	27	sale	-36.0000	99730.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
117	65	27	sale	-18.0000	99712.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
118	8	27	sale	-20.0000	510.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
119	10	27	sale	-35.0000	395.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
120	74	27	sale	-75.0000	9925.0000	Order 111005	4	2026-04-21 09:20:44.58978+00
121	71	28	sale	-18.0000	100873.9900	Order 111006	4	2026-04-21 09:28:48.572625+00
122	71	29	sale	-18.0000	100855.9900	Order 111007	1	2026-04-21 10:48:47.079995+00
123	65	29	sale	-18.0000	99694.0000	Order 111007	1	2026-04-21 10:48:47.079995+00
124	2	29	sale	-150.0000	2850.0000	Order 111007	1	2026-04-21 10:48:47.079995+00
125	65	30	sale	-18.0000	99676.0000	Order 111008	4	2026-04-21 11:07:34.376674+00
126	65	31	sale	-18.0000	99658.0000	Order 111009	4	2026-04-21 13:29:39.689309+00
127	52	32	sale	-30.0000	99970.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
128	65	32	sale	-18.0000	99640.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
129	2	32	sale	-100.0000	2750.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
130	71	32	sale	-36.0000	100819.9900	Order 111010	5	2026-04-21 14:32:09.242622+00
131	27	32	sale	-20.0000	99980.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
132	38	32	sale	-20.0000	9980.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
133	65	32	sale	-18.0000	99622.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
134	2	32	sale	-140.0000	2610.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
135	65	32	sale	-18.0000	99604.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
136	83	32	sale	-20.0000	0.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
137	71	32	sale	-18.0000	100801.9900	Order 111010	5	2026-04-21 14:32:09.242622+00
138	65	32	sale	-18.0000	99586.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
139	6	32	sale	-35.0000	625.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
140	5	32	sale	-10.0000	900.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
141	60	32	sale	-30.0000	999970.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
142	2	32	sale	-95.0000	2515.0000	Order 111010	5	2026-04-21 14:32:09.242622+00
143	59	33	sale	-10.0000	99990.0000	Order 111011	5	2026-04-21 14:35:17.172778+00
144	7	33	sale	-30.0000	750.0000	Order 111011	5	2026-04-21 14:35:17.172778+00
145	65	33	sale	-18.0000	99568.0000	Order 111011	5	2026-04-21 14:35:17.172778+00
146	86	33	sale	-190.0000	0.0000	Order 111011	5	2026-04-21 14:35:17.172778+00
147	71	33	sale	-18.0000	100783.9900	Order 111011	5	2026-04-21 14:35:17.172778+00
148	10	33	sale	-35.0000	360.0000	Order 111011	5	2026-04-21 14:35:17.172778+00
149	59	34	sale	-10.0000	99980.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
150	7	34	sale	-45.0000	705.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
151	65	34	sale	-18.0000	99550.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
152	86	34	sale	-175.0000	0.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
153	65	34	sale	-18.0000	99532.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
154	5	34	sale	-10.0000	890.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
155	6	34	sale	-10.0000	615.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
156	6	34	sale	-10.0000	605.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
157	2	34	sale	-260.0000	2255.0000	Order 111012	5	2026-04-21 14:36:30.615449+00
158	71	35	sale	-18.0000	100765.9900	Order 111013	5	2026-04-21 14:37:55.453798+00
159	59	36	sale	-10.0000	99970.0000	Order 111014	5	2026-04-21 14:49:10.594103+00
160	7	36	sale	-30.0000	675.0000	Order 111014	5	2026-04-21 14:49:10.594103+00
161	65	36	sale	-18.0000	99514.0000	Order 111014	5	2026-04-21 14:49:10.594103+00
162	86	36	sale	-190.0000	0.0000	Order 111014	5	2026-04-21 14:49:10.594103+00
163	52	37	sale	-30.0000	99940.0000	Order 111015	1	2026-04-21 16:10:18.550759+00
164	65	37	sale	-18.0000	99496.0000	Order 111015	1	2026-04-21 16:10:18.550759+00
165	2	37	sale	-100.0000	2155.0000	Order 111015	1	2026-04-21 16:10:18.550759+00
166	71	37	sale	-18.0000	100747.9900	Order 111015	1	2026-04-21 16:10:18.550759+00
167	27	38	sale	-45.0000	99935.0000	Order 111016	1	2026-04-21 17:19:26.420448+00
168	71	38	sale	-36.0000	100711.9900	Order 111016	1	2026-04-21 17:19:26.420448+00
169	10	38	sale	-35.0000	325.0000	Order 111016	1	2026-04-21 17:19:26.420448+00
170	3	38	sale	-87.0000	2913.0000	Order 111016	1	2026-04-21 17:19:26.420448+00
171	59	39	sale	-10.0000	99960.0000	Order 111017	1	2026-04-21 19:10:05.806955+00
172	7	39	sale	-30.0000	645.0000	Order 111017	1	2026-04-21 19:10:05.806955+00
173	65	39	sale	-18.0000	99478.0000	Order 111017	1	2026-04-21 19:10:05.806955+00
174	86	39	sale	-190.0000	0.0000	Order 111017	1	2026-04-21 19:10:05.806955+00
175	71	39	sale	-18.0000	100693.9900	Order 111017	1	2026-04-21 19:10:05.806955+00
176	71	39	sale	-18.0000	100675.9900	Order 111017	1	2026-04-21 19:10:05.806955+00
177	2	39	sale	-107.0000	2048.0000	Order 111017	1	2026-04-21 19:10:05.806955+00
178	83	40	sale	-20.0000	0.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
179	71	40	sale	-18.0000	100657.9900	Order 111018	1	2026-04-21 19:11:52.31301+00
180	52	40	sale	-35.0000	99905.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
181	60	40	sale	-30.0000	999940.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
182	65	40	sale	-18.0000	99460.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
183	10	40	sale	-35.0000	290.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
184	65	40	sale	-18.0000	99442.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
185	2	40	sale	-150.0000	1898.0000	Order 111018	1	2026-04-21 19:11:52.31301+00
186	59	41	sale	-10.0000	99950.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
187	7	41	sale	-30.0000	615.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
188	65	41	sale	-18.0000	99424.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
189	86	41	sale	-190.0000	0.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
190	7	41	sale	-30.0000	585.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
191	65	41	sale	-18.0000	99406.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
192	3	41	sale	-140.0000	2773.0000	Order 111019	1	2026-04-21 19:12:46.78138+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, role, pin, created_at, updated_at) FROM stdin;
1	Admin User	admin	000000	2026-04-16 22:56:14.276428+00	2026-04-16 22:56:14.276428+00
2	Sarah	barista	111111	2026-04-16 22:56:14.276428+00	2026-04-16 22:56:14.276428+00
4	Spacca POS	frontdesk	999999	2026-04-16 22:56:14.276428+00	2026-04-16 22:56:14.276428+00
3	Adam	barista	222222	2026-04-16 22:56:14.276428+00	2026-04-16 22:56:14.276428+00
5	Hale Town Cashier	cashier	369741	2026-04-21 14:23:33.021966+00	2026-04-21 14:23:33.021966+00
6	Hale Town Pickup	barista	147963	2026-04-21 14:23:48.242314+00	2026-04-21 14:23:48.242314+00
\.


--
-- Name: drink_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_categories_id_seq', 6, true);


--
-- Name: drink_ingredient_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_ingredient_slots_id_seq', 1576, true);


--
-- Name: drink_slot_type_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_type_options_id_seq', 4359, true);


--
-- Name: drink_slot_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_volumes_id_seq', 6635, true);


--
-- Name: drinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drinks_id_seq', 59, true);


--
-- Name: ingredient_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_categories_id_seq', 11, true);


--
-- Name: ingredient_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_options_id_seq', 47, true);


--
-- Name: ingredient_type_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_type_volumes_id_seq', 131, true);


--
-- Name: ingredient_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_types_id_seq', 92, true);


--
-- Name: ingredient_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredient_volumes_id_seq', 34, true);


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 86, true);


--
-- Name: kitchen_stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kitchen_stations_id_seq', 4, true);


--
-- Name: order_item_customizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_customizations_id_seq', 215, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 62, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 45, true);


--
-- Name: predefined_slot_type_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slot_type_options_id_seq', 1963, true);


--
-- Name: predefined_slot_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slot_volumes_id_seq', 561, true);


--
-- Name: predefined_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.predefined_slots_id_seq', 10, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 2, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 192, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


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
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: global_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX global_key_idx ON public.settings USING btree (key) WHERE (scope = 'global'::text);


--
-- Name: user_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_key_idx ON public.settings USING btree (user_id, key) WHERE (scope = 'user'::text);


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
-- Name: settings settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict yZYCcQ0FRmjsZlwda9revM7Xe1nbAk39DUiQ2kvg9uGjeqYJhVQoBwT3oinW9O6

