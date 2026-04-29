--
-- PostgreSQL database dump
--

\restrict bPoG0rGlVwyfV6uzwdMuv1erunqwNJmoZVbd8KPGoCTisfIIJ4PtEhbkFPDUUoh

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
-- Name: cashier_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cashier_sessions (
    id integer NOT NULL,
    cashier_id integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    notes text
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
    sort_order integer DEFAULT 0 NOT NULL,
    cup_ingredient_id integer,
    is_customizable boolean DEFAULT true NOT NULL
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
    ready_at timestamp with time zone
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
    cancelled_at timestamp with time zone
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
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role text NOT NULL,
    permission_key character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username character varying(50),
    password_hash text,
    is_active boolean DEFAULT true NOT NULL
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
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


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
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, details, created_at) FROM stdin;
1	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 12:55:36.472387+03
2	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 12:57:34.733915+03
3	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 13:18:16.053343+03
4	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 13:21:35.376051+03
5	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 14:35:25.179834+03
6	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 14:45:46.013087+03
7	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 14:48:31.707245+03
8	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 16:38:39.072348+03
9	1	LOGIN	user	1	{"ip": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"}	2026-04-29 20:41:56.143421+03
\.


--
-- Data for Name: cashier_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cashier_sessions (id, cashier_id, started_at, ended_at, notes) FROM stdin;
1	5	2026-04-27 18:03:20.638058+03	2026-04-27 18:27:48.462+03	\N
2	1	2026-04-27 18:27:58.155006+03	\N	\N
3	5	2026-04-27 22:22:22.960787+03	2026-04-27 22:40:59.839+03	\N
4	5	2026-04-27 22:40:59.855594+03	2026-04-28 14:19:19.873+03	\N
5	5	2026-04-28 14:19:19.88402+03	2026-04-28 14:38:06.5+03	\N
6	5	2026-04-28 14:38:06.514462+03	2026-04-28 15:10:26.057+03	\N
7	5	2026-04-28 15:10:26.078567+03	2026-04-28 19:58:01.343+03	\N
8	5	2026-04-28 19:58:01.370177+03	2026-04-28 20:12:50.015+03	\N
9	5	2026-04-28 20:12:50.024818+03	2026-04-29 10:35:45.416+03	\N
10	5	2026-04-29 10:35:45.43053+03	2026-04-29 13:51:59.474+03	\N
11	5	2026-04-29 13:51:59.497975+03	2026-04-29 18:05:13.682+03	\N
12	5	2026-04-29 18:05:13.700522+03	\N	\N
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
1	SUMMER10	percentage	10.00	t	2026-04-24 14:54:18.194439+03	2026-04-24 14:54:18.194439+03
2	SAVE50	fixed	50.00	t	2026-04-24 14:54:18.194439+03	2026-04-24 14:54:18.194439+03
3	WELCOME20	percentage	20.00	t	2026-04-24 14:54:18.194439+03	2026-04-24 14:54:18.194439+03
\.


--
-- Data for Name: drink_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_categories (id, name, sort_order, is_active, created_at) FROM stdin;
5	Food/Pastry	40	t	2026-04-21 00:26:32.239454+02
6	Frappe	6	t	2026-04-21 10:39:16.11275+02
4	Specialty	7	f	2026-04-18 01:04:52.267289+02
7	Coffee	60	t	2026-04-26 01:18:27.474401+03
1	Hot	0	t	2026-04-18 01:04:52.256353+02
2	Turkish	2	t	2026-04-18 01:04:52.265807+02
3	Cold	5	t	2026-04-18 01:04:52.26665+02
\.


--
-- Data for Name: drink_ingredient_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drink_ingredient_slots (id, drink_id, ingredient_id, ingredient_type_id, slot_label, is_required, default_option_id, is_dynamic, sort_order, created_at, updated_at, barista_sort_order, customer_sort_order, affects_cup_size, predefined_slot_id) FROM stdin;
1624	33	\N	\N	Sweetner	t	\N	f	0	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	1	6	f	6
1625	33	\N	\N	Sauce	t	\N	f	1	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	2	2	t	7
1626	33	\N	\N	Coffee	t	\N	f	2	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	3	1	t	3
1627	33	\N	\N	Ice Cubes	t	\N	f	3	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	4	3	\N	\N
1628	33	\N	\N	Milk	t	\N	t	4	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	5	4	\N	4
1629	33	\N	\N	Whipped Cream	t	\N	f	5	2026-04-29 20:39:43.582631+03	2026-04-29 20:39:43.582631+03	6	5	f	\N
328	23	\N	\N	Sweetner	t	\N	f	0	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	1	6	f	\N
329	23	\N	\N	Salted Caramel	t	\N	f	1	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	2	2	t	\N
330	23	\N	\N	Coffee	t	\N	f	2	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	3	1	t	\N
331	23	\N	\N	Ice Cubes	t	\N	f	3	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	4	3	t	\N
333	23	\N	\N	Whipped Cream	t	\N	f	5	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	6	5	f	\N
144	5	\N	\N	Milk	t	\N	f	1	2026-04-19 15:55:18.654457+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
91	14	\N	\N	Coffee	t	\N	f	0	2026-04-19 12:28:46.280326+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
92	14	\N	\N	Syrup	t	\N	f	1	2026-04-19 12:28:46.280326+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
93	14	\N	\N	Milk	t	\N	f	2	2026-04-19 12:28:46.280326+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
94	14	\N	\N	Foam	t	\N	f	3	2026-04-19 12:28:46.280326+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
657	40	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	6	5	f	10
678	41	\N	\N	Sweetner	t	\N	f	0	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	1	7	f	6
679	41	\N	\N	Sauce	t	\N	f	1	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	2	2	t	7
680	41	\N	\N	Sauce	t	\N	f	2	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	3	3	t	7
681	41	\N	\N	Coffee	t	\N	f	3	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	4	1	t	3
682	41	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	5	4	t	9
1528	56	\N	\N	Milk	t	\N	t	6	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	7	5	\N	4
1529	56	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	8	6	f	10
1070	31	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	1	6	f	6
1071	31	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	2	2	t	7
1072	31	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	3	0	t	\N
1073	31	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	4	1	t	3
1074	31	\N	\N	Ice cubes	t	\N	f	4	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	5	3	\N	\N
1075	31	\N	\N	Milk	t	\N	t	5	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	6	4	\N	4
1076	31	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:36:09.837697+02	2026-04-28 19:56:09.875+03	7	5	f	\N
1456	53	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	1	6	f	6
1457	53	\N	\N	Sauce	t	\N	f	1	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	2	2	t	7
1458	53	\N	\N	Sauce	t	\N	f	2	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	3	3	t	7
1459	53	\N	\N	Powder	t	\N	f	3	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	5	0	t	8
1460	53	\N	\N	Coffee	t	\N	f	4	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	4	1	t	3
1461	53	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	6	4	t	9
1216	43	\N	\N	Sweetner	t	\N	f	0	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	1	6	f	6
1217	43	\N	\N	Sauce	t	\N	f	1	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	2	2	t	7
1462	53	\N	\N	Milk	t	\N	t	6	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	7	5	t	4
1463	53	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 13:47:33.259972+02	2026-04-28 19:56:09.875+03	8	6	f	10
952	29	\N	\N	Vanilla Powder	t	\N	f	0	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	4	0	\N	\N
953	29	\N	\N	Coffee	t	\N	f	1	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	5	1	\N	\N
954	29	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	6	4	\N	\N
955	29	\N	\N	Milk	t	\N	t	3	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	7	5	\N	4
956	29	\N	\N	Whipped Cream	t	\N	f	4	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	8	6	f	\N
957	29	\N	\N	Sweetner	t	\N	f	5	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	1	7	f	6
958	29	\N	\N	Syrup	t	\N	f	6	2026-04-22 10:32:31.851147+02	2026-04-28 19:56:09.875+03	2	3	\N	5
1218	43	\N	\N	Powder	t	\N	f	2	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	3	0	t	8
1219	43	\N	\N	Coffee	t	\N	f	3	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	4	1	t	3
14	6	\N	\N	Chocolate Sauce	t	\N	f	2	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
341	24	\N	\N	Sweetner	t	\N	f	0	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
342	24	\N	\N	Syrup	t	\N	f	1	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
343	24	\N	\N	Sauce	t	\N	f	2	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
190	20	\N	\N	Coffee	t	\N	f	0	2026-04-19 17:42:36.505392+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
191	20	\N	\N	Milk	t	\N	t	1	2026-04-19 17:42:36.505392+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
192	20	\N	\N	Syrap	t	\N	f	2	2026-04-19 17:42:36.505392+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
193	20	\N	\N	Foam	t	\N	f	3	2026-04-19 17:42:36.505392+02	2026-04-28 19:56:09.875+03	1	0	\N	\N
344	24	\N	\N	Ice Cubes	t	\N	f	3	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
345	24	\N	\N	Coffee	t	\N	f	4	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
346	24	\N	\N	Milk	t	\N	t	5	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
347	24	\N	\N	Whipped Cream	t	\N	f	6	2026-04-20 12:27:41.835542+02	2026-04-28 19:56:09.875+03	1	1	f	\N
990	25	\N	\N	Sweetner	t	\N	f	0	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	1	6	f	\N
991	25	\N	\N	Syrup	t	\N	f	1	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	2	2	t	\N
992	25	\N	\N	Coffee	t	\N	f	2	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	3	1	t	\N
993	25	\N	\N	Ice Cubes	t	\N	f	3	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	4	3	t	\N
994	25	\N	\N	Chocolate Powder	t	\N	f	4	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	5	0	t	\N
995	25	\N	\N	Milk	t	\N	t	5	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	6	4	t	\N
996	25	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 10:38:54.015308+02	2026-04-28 19:56:09.875+03	7	5	f	\N
1013	26	\N	\N	Coffee	t	\N	f	0	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	5	1	t	\N
1014	26	\N	\N	Sauce	t	\N	f	1	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	3	2	t	\N
1015	26	\N	\N	Syrup	t	\N	f	2	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	2	3	t	\N
1016	26	\N	\N	Cubes	t	\N	f	3	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	6	4	t	\N
18	8	\N	\N	Cold Brew	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
6	3	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
1017	26	\N	\N	Milk	t	\N	t	4	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	7	5	t	\N
1018	26	\N	\N	Whipped Cream	t	\N	f	5	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	6	6	f	\N
551	32	\N	\N	Sweetner	t	\N	f	0	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	1	6	f	6
383	19	\N	\N	Coffee	t	\N	f	0	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
13	6	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
384	19	\N	\N	Milk	t	\N	t	1	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	2	2	\N	\N
16	7	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
385	19	\N	\N	Syrup	t	\N	f	2	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	3	3	\N	\N
386	19	\N	\N	Sauce	t	\N	f	3	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	4	4	\N	\N
27	12	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
387	19	\N	\N	Sauce Garnish	t	\N	f	4	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	5	0	\N	\N
20	9	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
22	10	\N	\N	Milk	t	\N	f	1	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
35	1	\N	\N	Coffee	t	\N	f	0	2026-04-17 02:10:55.814252+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
36	1	\N	\N	Milk	t	\N	f	1	2026-04-17 02:10:55.814252+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
48	13	\N	\N	Coffee	t	\N	f	0	2026-04-18 03:25:48.500517+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
49	13	\N	\N	Sauce	t	\N	f	1	2026-04-18 03:25:48.500517+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
50	13	\N	\N	Milk	t	\N	f	2	2026-04-18 03:25:48.500517+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
51	13	\N	\N	Sweetner	t	\N	f	3	2026-04-18 03:25:48.500517+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
126	17	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 14:52:50.782143+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
388	19	\N	\N	Foam	t	\N	f	5	2026-04-21 00:06:58.30182+02	2026-04-28 19:56:09.875+03	6	6	f	\N
1019	26	\N	\N	Sweetener	t	\N	f	6	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	1	7	f	\N
1020	26	\N	\N	Powder	t	\N	f	7	2026-04-22 10:47:37.288231+02	2026-04-28 19:56:09.875+03	8	0	\N	\N
552	32	\N	\N	Syrup	t	\N	f	1	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	2	2	\N	5
553	32	\N	\N	Coffee	t	\N	f	2	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	3	1	t	3
554	32	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	4	3	\N	\N
555	32	\N	\N	Milk	t	\N	t	4	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	5	4	\N	4
556	32	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 14:36:47.472604+02	2026-04-28 19:56:09.875+03	6	5	f	\N
1154	38	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	1	6	f	6
1155	38	\N	\N	Syrup	t	\N	f	1	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	2	2	\N	5
1156	38	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	3	0	\N	\N
1157	38	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	4	1	t	3
1158	38	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	5	3	t	9
1159	38	\N	\N	Milk	t	\N	t	5	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	6	4	\N	4
1160	38	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:55:54.930401+02	2026-04-28 19:56:09.875+03	7	5	f	10
614	36	\N	\N	Sweetner	t	\N	f	0	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	1	6	f	6
615	36	\N	\N	Syrup	t	\N	f	1	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	2	2	\N	5
616	36	\N	\N	Coffee	t	\N	f	2	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	3	1	t	3
127	17	\N	\N	Whipped Cream	t	\N	f	1	2026-04-19 14:52:50.782143+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
138	18	\N	\N	Specialty coffee	t	\N	f	0	2026-04-19 15:23:51.851089+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
139	18	\N	\N	Coffee Type	t	\N	f	1	2026-04-19 15:23:51.851089+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
96	15	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 13:46:07.019209+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
101	16	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 14:17:31.448007+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
112	11	\N	\N	Coffe Type	t	\N	f	0	2026-04-19 14:32:20.625529+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
113	11	\N	\N	Foam	t	\N	f	1	2026-04-19 14:32:20.625529+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
1489	54	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	1	7	f	6
1140	35	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	1	6	f	6
1141	35	\N	\N	Sauce	t	\N	f	1	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	2	2	t	7
1142	35	\N	\N	Powder	t	\N	f	2	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	3	0	t	8
1143	35	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	4	1	t	3
1144	35	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	5	3	\N	\N
1145	35	\N	\N	Milk	t	\N	t	5	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	6	4	t	4
1146	35	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:47:17.791323+02	2026-04-28 19:56:09.875+03	7	5	f	\N
1490	54	\N	\N	Syrup	t	\N	f	1	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	2	3	\N	5
1491	54	\N	\N	Sauce	t	\N	f	2	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	3	2	t	7
1492	54	\N	\N	Powder	t	\N	f	3	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	4	0	t	8
1493	54	\N	\N	Coffee	t	\N	f	4	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	5	1	t	3
1494	54	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	6	4	t	9
1495	54	\N	\N	Milk	t	\N	t	6	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	7	5	\N	4
1496	54	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	8	6	f	10
1497	54	\N	\N	Garnish	t	\N	f	8	2026-04-22 13:52:27.693251+02	2026-04-28 19:56:09.875+03	9	0	\N	\N
1514	55	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	1	7	f	6
1515	55	\N	\N	Syrup	t	\N	f	1	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	2	3	\N	5
1516	55	\N	\N	Sauce	t	\N	f	2	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	3	2	t	7
1517	55	\N	\N	Powder	t	\N	f	3	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	4	0	t	8
1289	45	\N	\N	Syrup	t	\N	f	0	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	2	2	\N	5
1290	45	\N	\N	Coffee	t	\N	f	1	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	4	1	t	3
1291	45	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	5	3	t	9
1292	45	\N	\N	Milk	t	\N	t	3	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	6	4	\N	4
1293	45	\N	\N	Powder	t	\N	f	4	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	3	0	t	8
1294	45	\N	\N	Sweetner	t	\N	f	5	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	1	6	f	6
1295	45	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 13:02:44.114371+02	2026-04-28 19:56:09.875+03	7	5	f	10
1303	47	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	1	6	f	6
1304	47	\N	\N	Sauce	t	\N	f	1	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	3	2	t	7
1305	47	\N	\N	Powder	t	\N	f	2	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	4	0	t	8
1306	47	\N	\N	Coffee	t	\N	f	3	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	5	1	t	3
1307	47	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	6	3	t	9
393	22	\N	\N	Coffee	t	\N	f	0	2026-04-21 11:57:14.576745+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
395	22	\N	\N	Syrup	t	\N	f	2	2026-04-21 11:57:14.576745+02	2026-04-28 19:56:09.875+03	2	2	\N	\N
396	22	\N	\N	Whipped Cream	t	\N	f	3	2026-04-21 11:57:14.576745+02	2026-04-28 19:56:09.875+03	3	3	\N	\N
397	22	\N	\N	Ices Cubes	t	\N	f	4	2026-04-21 11:57:14.576745+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
1308	47	\N	\N	Milk	t	\N	t	5	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	7	4	\N	4
1309	47	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 13:05:01.475559+02	2026-04-28 19:56:09.875+03	8	5	f	10
1105	34	\N	\N	Sweetner	t	\N	f	0	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	1	6	f	6
1106	34	\N	\N	Syrup	t	\N	f	1	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	2	3	\N	5
1107	34	\N	\N	Vanilla Powder	t	\N	f	2	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	3	0	\N	\N
1108	34	\N	\N	Coffee	t	\N	f	3	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	4	1	t	3
1109	34	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	5	4	\N	\N
1110	34	\N	\N	Milk	t	\N	t	5	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	6	5	\N	4
1111	34	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 11:39:19.478238+02	2026-04-28 19:56:09.875+03	7	6	f	10
617	36	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	4	3	\N	\N
618	36	\N	\N	Milk	t	\N	t	4	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	5	4	\N	4
619	36	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 15:22:20.447576+02	2026-04-28 19:56:09.875+03	6	5	\N	\N
627	37	\N	\N	Sweetner	t	\N	f	0	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	1	7	f	6
628	37	\N	\N	Sauce	t	\N	f	1	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	2	2	t	7
629	37	\N	\N	Syrup	t	\N	f	2	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	3	3	\N	5
630	37	\N	\N	Coffee	t	\N	f	3	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	4	1	t	3
631	37	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	5	4	t	9
632	37	\N	\N	Milk	t	\N	t	5	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	6	5	\N	4
633	37	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 15:41:46.928413+02	2026-04-28 19:56:09.875+03	7	6	f	10
640	39	\N	\N	Sweetner	t	\N	f	0	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	1	6	f	6
641	39	\N	\N	Sauce	t	\N	f	1	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	2	2	t	7
642	39	\N	\N	Coffee	t	\N	f	2	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	3	1	t	3
643	39	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	4	3	t	9
644	39	\N	\N	Milk	t	\N	t	4	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	5	4	\N	4
645	39	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 15:49:25.408793+02	2026-04-28 19:56:09.875+03	6	5	f	10
652	40	\N	\N	Sweetner	t	\N	f	0	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	1	6	f	6
653	40	\N	\N	Sauce	t	\N	f	1	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	2	2	t	7
654	40	\N	\N	Coffee	t	\N	f	2	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	3	1	t	3
655	40	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	4	3	t	9
656	40	\N	\N	Milk	t	\N	t	4	2026-04-21 16:08:03.66932+02	2026-04-28 19:56:09.875+03	5	4	\N	4
683	41	\N	\N	Milk	t	\N	t	5	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	6	5	\N	4
684	41	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 16:22:01.981071+02	2026-04-28 19:56:09.875+03	7	6	f	10
1518	55	\N	\N	Coffee	t	\N	f	4	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	5	1	t	3
1519	55	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	6	4	t	9
1520	55	\N	\N	Milk	t	\N	t	6	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	7	5	\N	4
1521	55	\N	\N	Whipped Cream	t	\N	f	7	2026-04-22 13:55:44.318929+02	2026-04-28 19:56:09.875+03	8	6	f	10
1401	50	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	1	7	f	6
1402	50	\N	\N	Sauce	t	\N	f	1	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	3	2	t	7
1403	50	\N	\N	Powder	t	\N	f	2	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	7	0	t	8
1404	50	\N	\N	Coffee	t	\N	f	3	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	5	1	t	3
1405	50	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	6	3	t	9
1406	50	\N	\N	Milk	t	\N	t	5	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	7	4	\N	4
1407	50	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 13:37:16.761328+02	2026-04-28 19:56:09.875+03	8	5	f	10
699	42	\N	\N	Sweetner	t	\N	f	0	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	6	6	f	6
700	42	\N	\N	Sauce	t	\N	f	1	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	2	2	t	7
701	42	\N	\N	Coffee	t	\N	f	2	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	3	1	t	3
702	42	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	4	3	t	9
703	42	\N	\N	Milk	t	\N	t	4	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	5	4	\N	4
704	42	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 16:33:06.872195+02	2026-04-28 19:56:09.875+03	6	5	f	10
1538	57	\N	\N	Sauce	t	\N	f	0	2026-04-22 14:02:25.950591+02	2026-04-28 19:56:09.875+03	1	1	t	7
1539	57	\N	\N	Ice Cubes	t	\N	f	1	2026-04-22 14:02:25.950591+02	2026-04-28 19:56:09.875+03	2	2	t	9
1540	57	\N	\N	Mango	t	\N	t	2	2026-04-22 14:02:25.950591+02	2026-04-28 19:56:09.875+03	3	3	\N	\N
1541	57	\N	\N	Lemon Slices	t	\N	f	3	2026-04-22 14:02:25.950591+02	2026-04-28 19:56:09.875+03	4	4	t	\N
720	44	\N	\N	Sweetner	t	\N	f	0	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	1	7	f	6
721	44	\N	\N	Syrup	t	\N	f	1	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	2	2	\N	5
722	44	\N	\N	Sauce	t	\N	f	2	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	3	3	t	7
723	44	\N	\N	Coffee	t	\N	f	3	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	4	1	t	3
724	44	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	5	4	t	9
725	44	\N	\N	Milk	t	\N	t	5	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	6	5	\N	4
726	44	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 16:59:26.885581+02	2026-04-28 19:56:09.875+03	7	6	f	10
1570	58	\N	\N	Sauce	t	\N	f	0	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	1	1	t	7
1571	58	\N	\N	Sauce	t	\N	f	1	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	2	2	t	7
1572	58	\N	\N	Sauce	t	\N	f	2	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	4	4	\N	\N
1573	58	\N	\N	Powder	t	\N	f	3	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	4	0	t	\N
1574	58	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	5	5	t	9
1575	58	\N	\N	Milk	t	\N	t	5	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	6	6	\N	4
1576	58	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 14:16:25.196403+02	2026-04-28 19:56:09.875+03	7	7	f	10
740	46	\N	\N	Sweetner	t	\N	f	0	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	1	6	f	6
741	46	\N	\N	Sauce	t	\N	f	1	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	2	2	t	7
742	46	\N	\N	Coffee	t	\N	f	2	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	3	1	t	3
743	46	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	4	3	t	9
744	46	\N	\N	Milk	t	\N	t	4	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	5	4	\N	4
745	46	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 17:08:55.89762+02	2026-04-28 19:56:09.875+03	6	5	f	10
764	49	\N	\N	Sweetner	t	\N	f	0	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	1	6	f	6
765	49	\N	\N	Sauce	t	\N	f	1	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	3	2	t	7
766	49	\N	\N	Powder	t	\N	f	2	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	4	0	t	8
767	49	\N	\N	Coffee	t	\N	f	3	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	5	1	t	3
768	49	\N	\N	Ice Cubes	t	\N	f	4	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	6	3	t	9
769	49	\N	\N	Milk	t	\N	t	5	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	7	4	\N	4
770	49	\N	\N	Whipped Cream	t	\N	f	6	2026-04-21 17:27:11.764443+02	2026-04-28 19:56:09.875+03	8	5	f	10
777	48	\N	\N	Matcha	t	\N	f	0	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	1	0	\N	\N
778	48	\N	\N	Sweetner	t	\N	f	1	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	2	2	f	6
779	48	\N	\N	Sauce	t	\N	f	2	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	3	1	\N	\N
780	48	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	4	3	t	9
781	48	\N	\N	Milk	t	\N	t	4	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	5	4	\N	4
782	48	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 17:48:00.864026+02	2026-04-28 19:56:09.875+03	6	5	f	10
790	51	\N	\N	Sweetner	t	\N	f	0	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	2	5	f	6
791	51	\N	\N	Sauce	t	\N	f	1	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	3	1	t	7
792	51	\N	\N	Powder	t	\N	f	2	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	1	0	t	8
793	51	\N	\N	Ice Cubes	t	\N	f	3	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	4	2	t	9
794	51	\N	\N	Milk	t	\N	t	4	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	5	3	\N	4
795	51	\N	\N	Whipped Cream	t	\N	f	5	2026-04-21 18:04:12.262975+02	2026-04-28 19:56:09.875+03	6	4	f	10
1366	27	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	1	6	f	6
1367	27	\N	\N	Sauce	t	\N	f	1	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	2	2	t	7
1368	27	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	5	3	t	9
1369	27	\N	\N	Coffee	t	\N	f	3	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	4	1	t	3
1370	27	\N	\N	Powder	t	\N	f	4	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	3	0	t	8
1371	27	\N	\N	Milk	t	\N	t	5	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	6	4	\N	4
1372	27	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 13:15:07.350153+02	2026-04-28 19:56:09.875+03	7	5	f	10
1522	56	\N	\N	Sweetner	t	\N	f	0	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	1	7	f	6
1523	56	\N	\N	Syrup	t	\N	f	1	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	2	3	\N	5
1524	56	\N	\N	Sauce	t	\N	f	2	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	3	2	t	7
1525	56	\N	\N	Powder	t	\N	f	3	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	4	0	t	8
1526	56	\N	\N	Coffee	t	\N	f	4	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	5	1	t	3
1527	56	\N	\N	Ice Cubes	t	\N	f	5	2026-04-22 13:57:11.632587+02	2026-04-28 19:56:09.875+03	6	4	t	9
1220	43	\N	\N	Ice Cubes	t	\N	f	4	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	5	3	t	9
1221	43	\N	\N	Milk	t	\N	t	5	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	6	4	\N	4
1222	43	\N	\N	Whipped Cream	t	\N	f	6	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	7	5	f	10
1223	43	\N	\N	Almond Beans	t	\N	f	7	2026-04-22 12:09:40.36141+02	2026-04-28 19:56:09.875+03	8	0	t	\N
977	21	\N	\N	Coffee	t	\N	f	0	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	1	1	t	3
978	21	\N	\N	Milk	t	\N	t	1	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
979	21	\N	\N	Syrup	t	\N	f	2	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
980	21	\N	\N	Ice Cubes	t	\N	f	3	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
981	21	\N	\N	Foam	t	\N	f	4	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	20	120	\N	\N
982	21	\N	\N	Whipped Cream	t	\N	f	5	2026-04-22 10:36:57.126683+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
1589	52	\N	\N	Powder	t	\N	f	0	2026-04-22 21:12:47.613419+02	2026-04-28 19:56:09.875+03	1	0	t	8
1590	52	\N	\N	Sweetner	t	\N	f	1	2026-04-22 21:12:47.613419+02	2026-04-28 19:56:09.875+03	1	1	f	6
1591	52	\N	\N	Ice Cubes	t	\N	f	2	2026-04-22 21:12:47.613419+02	2026-04-28 19:56:09.875+03	3	3	t	9
1592	52	\N	\N	Milk	t	\N	t	3	2026-04-22 21:12:47.613419+02	2026-04-28 19:56:09.875+03	4	4	\N	4
1593	52	\N	\N	Whipped Cream	t	\N	f	4	2026-04-22 21:12:47.613419+02	2026-04-28 19:56:09.875+03	5	5	f	10
1597	4	\N	\N	Coffee	t	\N	f	0	2026-04-26 00:52:11.46969+03	2026-04-28 19:56:09.875+03	1	1	\N	\N
1598	4	\N	\N	Base	t	\N	t	1	2026-04-26 00:52:11.46969+03	2026-04-28 19:56:09.875+03	1	0	\N	\N
1599	4	\N	\N	CUSTOM MILK LABEL	t	\N	t	2	2026-04-26 00:52:11.46969+03	2026-04-28 19:56:09.875+03	3	3	\N	4
1606	28	\N	\N	Sweetner	t	\N	f	0	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	1	6	f	\N
1607	28	\N	\N	Syrap	t	\N	f	1	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	2	2	t	\N
1608	28	\N	\N	Coffee	t	\N	f	2	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	3	1	\N	\N
1609	28	\N	\N	Ice Cubes	t	\N	f	3	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	4	3	\N	\N
1610	28	\N	\N	Milk	t	\N	t	4	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	5	4	\N	\N
1611	28	\N	\N	Whipped Cream	t	\N	f	5	2026-04-26 01:09:00.013518+03	2026-04-28 19:56:09.875+03	6	5	f	\N
1618	30	\N	\N	Sweetner	t	\N	f	0	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	1	6	f	6
1619	30	\N	\N	Sauce	t	\N	f	1	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	2	2	t	7
1620	30	\N	\N	Coffee	t	\N	f	2	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	3	1	t	3
1621	30	\N	\N	Ice Cubes	t	\N	f	3	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	4	3	\N	\N
1622	30	\N	\N	Milk	t	\N	t	4	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	5	4	\N	4
1623	30	\N	\N	Whipped Cream	t	\N	f	5	2026-04-26 12:16:02.787128+03	2026-04-28 19:56:09.875+03	6	5	f	\N
5	3	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
12	6	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
15	7	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
19	9	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
26	12	\N	\N	Espresso	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
143	5	\N	\N	Espresso	t	\N	f	0	2026-04-19 15:55:18.654457+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
7	3	\N	\N	Syrup	f	\N	f	2	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
17	7	\N	\N	Vanilla Syrup	t	\N	f	2	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
28	12	\N	\N	Vanilla Syrup	f	\N	f	2	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
145	5	\N	\N	Caramel Sauce	t	\N	f	2	2026-04-19 15:55:18.654457+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
29	12	\N	\N	Caramel Drizzle	f	\N	f	3	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
21	10	\N	\N	Matcha	t	\N	f	0	2026-04-17 00:56:14.300655+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
332	23	\N	\N	Milk	t	\N	t	4	2026-04-20 12:08:12.297916+02	2026-04-28 19:56:09.875+03	1	5	\N	\N
394	22	\N	\N	Milk Type	t	\N	t	1	2026-04-21 11:57:14.576745+02	2026-04-28 19:56:09.875+03	1	1	\N	\N
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
4400	1589	24	t	0	3.0000	70.0000	ml	0.0000
4401	1590	40	t	0	0.0000	0.0000	ml	0.0000
4402	1591	91	f	0	0.0000	0.0000	ml	0.0000
4403	1592	15	f	0	0.0000	0.0000	ml	0.5500
4404	1592	16	f	1	0.0000	0.0000	ml	0.6000
4405	1592	79	f	2	0.0000	0.0000	ml	0.0000
4406	1592	80	f	3	0.0000	0.0000	ml	0.0000
4407	1592	81	f	4	0.0000	0.0000	ml	0.0000
4408	1592	82	f	5	0.0000	0.0000	ml	0.0000
4409	1592	14	t	6	0.0000	0.0000	ml	0.1500
4410	1593	22	f	0	35.0000	35.0000	ml	0.0000
4423	1597	12	t	0	0.0000	0.0000	ml	0.0000
4424	1597	11	f	1	0.0000	0.0000	ml	0.0000
4425	1598	85	t	0	0.0000	0.0000	ml	0.0000
4426	1599	15	f	0	0.0000	123.0000	ml	0.5500
4427	1599	16	t	1	0.0000	0.0000	ml	0.6000
4428	1599	79	f	2	0.0000	0.0000	ml	0.0000
4429	1599	80	f	3	0.0000	0.0000	ml	0.0000
4430	1599	81	f	4	0.0000	0.0000	ml	0.0000
4431	1599	82	f	5	0.0000	0.0000	ml	0.0000
4432	1599	47	f	6	0.0000	0.0000	ml	0.0000
4433	1599	35	f	7	0.0000	0.0000	ml	0.0000
4434	1599	14	f	8	0.0000	0.0000	ml	0.1500
4455	1606	21	f	0	0.0000	0.0000	ml	0.0000
4456	1606	40	f	1	0.0000	0.0000	ml	0.0000
4457	1606	84	f	2	0.0000	0.0000	ml	0.0000
4458	1606	83	f	3	0.0000	0.0000	ml	0.0000
4459	1606	73	t	4	0.0000	0.0000	ml	0.0000
4460	1607	20	f	0	0.0000	0.0000	ml	0.0000
4461	1607	17	f	1	0.0000	0.0000	ml	0.0000
4462	1607	62	t	2	0.0000	0.0000	ml	0.0000
4463	1608	11	t	0	0.0000	0.0000	ml	0.0000
4464	1608	12	f	1	0.0000	0.0000	ml	0.0000
4465	1609	91	t	0	0.0000	0.0000	ml	0.0000
4466	1610	14	t	0	0.0000	0.0000	ml	0.1500
4467	1610	79	f	1	0.0000	0.0000	ml	0.0000
4468	1610	47	f	2	0.0000	0.0000	ml	0.0000
4469	1610	16	f	3	0.0000	0.0000	ml	0.6000
4470	1610	15	f	4	0.0000	0.0000	ml	0.5500
4471	1610	80	f	5	0.0000	0.0000	ml	0.0000
4472	1610	82	f	6	0.0000	0.0000	ml	0.0000
4473	1611	22	f	0	35.0000	35.0000	ml	0.0000
4474	1611	73	t	1	0.0000	0.0000	ml	0.0000
4501	1618	21	f	0	0.0000	0.0000	ml	0.0000
4502	1618	73	t	1	0.0000	0.0000	ml	0.0000
4503	1619	56	t	0	0.0000	0.0000	ml	0.0000
4504	1620	11	t	0	0.0000	0.0000	ml	0.0000
4505	1620	12	f	1	0.0000	0.0000	ml	0.0000
4506	1621	91	t	0	0.0000	0.0000	ml	0.0000
4507	1622	15	f	0	0.0000	0.0000	ml	0.5500
4508	1622	16	f	1	0.0000	0.0000	ml	0.6000
4509	1622	79	f	2	0.0000	0.0000	ml	0.0000
4510	1622	80	f	3	0.0000	0.0000	ml	0.0000
4511	1622	81	f	4	0.0000	0.0000	ml	0.0000
4512	1622	82	f	5	0.0000	0.0000	ml	0.0000
4513	1622	14	t	6	0.0000	0.0000	ml	0.0000
4514	1622	47	f	7	0.0000	0.0000	ml	0.0000
4515	1622	35	f	8	0.0000	0.0000	ml	0.0000
4516	1623	22	f	0	35.0000	35.0000	ml	0.0000
4517	1623	73	t	1	0.0000	0.0000	ml	0.0000
4518	1624	40	f	0	0.0000	0.0000	ml	0.0000
4519	1624	83	f	1	0.0000	0.0000	ml	0.0000
4520	1624	84	f	2	0.0000	0.0000	ml	0.0000
4521	1624	21	f	3	0.0000	0.0000	ml	0.0000
4522	1624	73	t	4	0.0000	0.0000	ml	0.0000
4523	1625	27	t	0	0.0000	0.0000	ml	0.0000
4524	1626	11	t	0	0.0000	0.0000	ml	0.0000
4525	1626	12	f	1	0.0000	0.0000	ml	0.0000
4526	1627	91	t	0	0.0000	0.0000	ml	0.0000
4527	1628	15	f	0	0.0000	0.0000	ml	65.0000
4528	1628	16	f	1	0.0000	0.0000	ml	0.6000
4529	1628	79	f	2	0.0000	0.0000	ml	0.0000
4530	1628	80	f	3	0.0000	0.0000	ml	0.0000
4531	1628	82	f	4	0.0000	0.0000	ml	0.0000
4532	1628	47	f	5	0.0000	0.0000	ml	0.0000
4533	1628	14	t	6	0.0000	0.0000	ml	0.1500
4534	1629	22	f	0	35.0000	35.0000	ml	0.0000
4535	1629	73	t	1	0.0000	0.0000	ml	0.0000
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
6213	1514	83	10.0000	10.0000	ml	0.0000	f	t	0
6214	1514	84	20.0000	20.0000	ml	0.0000	f	t	0
6215	1514	85	30.0000	30.0000	ml	0.0000	f	t	0
6216	1515	62	10.0000	10.0000	ml	25.0000	t	t	0
6217	1515	63	20.0000	20.0000	ml	55.0000	f	t	0
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
6859	1624	80	10.0000	10.0000	ml	0.0000	t	t	0
6860	1624	81	20.0000	20.0000	ml	0.0000	f	t	0
6861	1624	82	30.0000	30.0000	ml	0.0000	f	t	0
6862	1624	86	1.0000	1.0000	ml	0.0000	t	t	0
6863	1624	87	2.0000	2.0000	ml	0.0000	f	t	0
6864	1624	88	3.0000	3.0000	ml	0.0000	f	t	0
6865	1624	65	0.0000	0.0000	ml	0.0000	t	t	0
6866	1624	66	0.0000	0.0000	ml	0.0000	f	t	0
6867	1624	67	0.0000	0.0000	ml	0.0000	f	t	0
6868	1624	83	10.0000	10.0000	ml	0.0000	t	t	0
6869	1624	84	20.0000	20.0000	ml	0.0000	f	t	0
6870	1624	85	30.0000	30.0000	ml	0.0000	f	t	0
6871	1625	99	15.0000	15.0000	ml	30.0000	f	t	0
6872	1625	100	30.0000	30.0000	ml	55.0000	t	t	0
6873	1625	101	45.0000	45.0000	ml	75.0000	f	t	0
6874	1626	34	18.0000	18.0000	ml	0.0000	f	t	0
6875	1626	35	18.0000	36.0000	ml	40.0000	t	t	0
6876	1626	36	36.0000	54.0000	ml	75.0000	f	t	0
6877	1626	37	18.0000	18.0000	ml	35.0000	f	t	0
6878	1626	38	18.0000	36.0000	ml	45.0000	t	t	0
6879	1626	39	36.0000	54.0000	ml	65.0000	f	t	0
6880	1627	76	120.0000	120.0000	ml	0.0000	f	t	0
6881	1627	77	140.0000	140.0000	ml	0.0000	t	t	0
6882	1627	78	160.0000	160.0000	ml	0.0000	f	t	0
6883	1629	79	35.0000	35.0000	ml	35.0000	f	t	0
6884	1629	112	0.0000	0.0000	ml	0.0000	f	t	0
6715	1597	37	18.0000	18.0000	ml	-5.0000	f	t	0
6716	1597	38	18.0000	36.0000	ml	0.0000	t	t	0
6717	1597	39	36.0000	54.0000	ml	40.0000	f	t	0
6718	1597	34	18.0000	18.0000	ml	-10.0000	f	t	0
6719	1597	35	18.0000	36.0000	ml	0.0000	t	t	0
6720	1597	36	36.0000	54.0000	ml	35.0000	f	t	0
6721	1599	105	0.0000	0.0000	ml	0.0000	f	t	0
6722	1599	102	15.0000	15.0000	ml	30.0000	f	t	0
6723	1599	103	30.0000	30.0000	ml	55.0000	t	t	0
6724	1599	104	45.0000	45.0000	ml	75.0000	f	t	0
6838	1618	83	10.0000	10.0000	ml	0.0000	f	t	0
6839	1618	84	20.0000	20.0000	ml	0.0000	f	t	0
6840	1618	85	30.0000	30.0000	ml	0.0000	f	t	0
6841	1619	96	15.0000	15.0000	ml	30.0000	f	t	0
6842	1619	97	30.0000	30.0000	ml	55.0000	t	t	0
6843	1619	98	45.0000	45.0000	ml	75.0000	f	t	0
6844	1620	34	18.0000	18.0000	ml	0.0000	f	t	0
6845	1620	35	18.0000	36.0000	ml	40.0000	t	t	0
6846	1620	36	36.0000	54.0000	ml	75.0000	f	t	0
6847	1620	37	18.0000	18.0000	ml	35.0000	f	t	0
6848	1620	38	18.0000	36.0000	ml	45.0000	t	t	0
6849	1620	39	36.0000	54.0000	ml	65.0000	f	t	0
6850	1621	76	120.0000	120.0000	ml	0.0000	f	t	0
6851	1621	77	140.0000	140.0000	ml	0.0000	t	t	0
6852	1621	78	160.0000	160.0000	ml	0.0000	f	t	0
6853	1622	105	0.0000	0.0000	ml	0.0000	f	t	0
6854	1622	102	15.0000	15.0000	ml	30.0000	f	t	0
6855	1622	103	30.0000	30.0000	ml	55.0000	f	t	0
6856	1622	104	45.0000	45.0000	ml	75.0000	f	t	0
6857	1623	112	0.0000	0.0000	ml	0.0000	f	t	0
6858	1623	79	35.0000	35.0000	ml	0.0000	t	t	0
6696	1589	121	3.0000	70.0000	ml	0.0000	t	t	0
6697	1590	80	10.0000	10.0000	ml	0.0000	f	t	0
6698	1590	81	20.0000	20.0000	ml	0.0000	t	t	0
6699	1590	82	30.0000	30.0000	ml	0.0000	f	t	0
6700	1591	76	170.0000	170.0000	ml	0.0000	f	t	0
6701	1591	77	190.0000	190.0000	ml	0.0000	t	t	0
6702	1591	78	210.0000	210.0000	ml	0.0000	f	t	0
6703	1593	112	0.0000	0.0000	ml	0.0000	t	t	0
6704	1593	79	35.0000	35.0000	ml	35.0000	f	t	0
6757	1606	83	10.0000	10.0000	ml	0.0000	t	t	0
6758	1606	84	20.0000	20.0000	ml	0.0000	f	t	0
6759	1606	85	30.0000	30.0000	ml	0.0000	f	t	0
6760	1606	80	10.0000	10.0000	ml	0.0000	t	t	0
6761	1606	81	20.0000	20.0000	ml	0.0000	f	t	0
6762	1606	82	30.0000	30.0000	ml	0.0000	f	t	0
6763	1606	65	1.0000	1.0000	ml	0.0000	t	t	0
6764	1606	66	2.0000	2.0000	ml	0.0000	f	t	0
6765	1606	67	3.0000	3.0000	ml	0.0000	f	t	0
6766	1606	86	1.0000	1.0000	ml	0.0000	t	t	0
6767	1606	87	2.0000	2.0000	ml	0.0000	f	t	0
6768	1606	88	3.0000	3.0000	ml	0.0000	f	t	0
6769	1607	58	10.0000	10.0000	ml	30.0000	f	t	0
6770	1607	59	20.0000	20.0000	ml	45.0000	t	t	0
6771	1607	61	30.0000	30.0000	ml	75.0000	f	t	0
6772	1607	55	10.0000	10.0000	ml	30.0000	f	t	0
6773	1607	56	20.0000	20.0000	ml	55.0000	f	t	0
6774	1607	57	30.0000	30.0000	ml	75.0000	t	t	0
6775	1607	62	10.0000	10.0000	ml	30.0000	f	t	0
6776	1607	63	20.0000	20.0000	ml	55.0000	t	t	0
6777	1607	64	30.0000	30.0000	ml	75.0000	f	t	0
6778	1608	34	18.0000	18.0000	ml	30.0000	f	t	0
6779	1608	35	18.0000	36.0000	ml	40.0000	t	t	0
6780	1608	36	36.0000	54.0000	ml	60.0000	f	t	0
6781	1608	37	18.0000	18.0000	ml	35.0000	f	t	0
6782	1608	38	18.0000	36.0000	ml	45.0000	f	t	0
6783	1608	39	36.0000	54.0000	ml	65.0000	t	t	0
6784	1609	76	120.0000	120.0000	ml	0.0000	f	t	0
6785	1609	77	140.0000	140.0000	ml	0.0000	t	t	0
6786	1609	78	160.0000	160.0000	ml	0.0000	f	t	0
6787	1611	112	0.0000	0.0000	ml	0.0000	f	t	0
6788	1611	79	35.0000	35.0000	ml	0.0000	t	t	0
\.


--
-- Data for Name: drinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drinks (id, name, description, category, base_price, image_url, is_active, prep_time_seconds, cup_size_ml, kitchen_station, created_at, updated_at, category_id, sort_order, cup_ingredient_id, is_customizable) FROM stdin;
10	Matcha Latte	Ceremonial matcha with steamed milk	Specialty	170.00	/uploads/drink-1776469536354.webp	f	210	\N	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	4	0	\N	t
47	Salted Vanilla Frappe	Salted Vanilla Frappe	Frappe	0.00	\N	t	180	356	cold-bar	2026-04-21 17:04:56.671743+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
17	Espresso Conpana	\N	Hot Coffee	130.00	/uploads/drink-1776603853111.webp	t	180	300	hot-bar	2026-04-19 14:33:29.928418+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
18	Red Eye	\N	Hot Coffee	205.00	/uploads/drink-1776604172685.webp	t	120	\N	hot-bar	2026-04-19 15:09:32.601751+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
25	Cappucino Frappe	\N	Frappe	0.00	/uploads/drink-1776768691663.webp	t	180	356	cold-bar	2026-04-20 16:57:51.071604+02	2026-04-28 19:56:09.865+03	6	0	\N	t
23	Iced Salted Cortado	\N	Cold Coffee	160.00	/uploads/drink-1776673259684.webp	t	180	240	cold-bar	2026-04-20 10:20:59.311017+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
14	Cappuccino 	\N	Hot Coffee	130.00	/uploads/drink-1776594692815.webp	t	180	286	cold-bar	2026-04-18 22:55:06.672696+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
21	Iced Cappuccino	\N	Cold Coffee	135.00	/uploads/drink-1776620485955.webp	t	180	356	cold-bar	2026-04-19 18:27:26.264089+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
15	Espresso	\N	Hot Coffee	95.00	/uploads/drink-1776598492814.webp	t	120	120	cold-bar	2026-04-19 13:34:52.689696+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
19	Caramel Macchiato	\N	Hot Coffee	185.00	/uploads/drink-1776611461789.webp	t	180	326	hot-bar	2026-04-19 15:25:00.948506+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
33	Almond FlatWhite	\N	Coffee	0.00	/uploads/drink-1776775175937.webp	t	180	306	cold-bar	2026-04-21 14:39:35.809292+02	2026-04-29 20:39:43.456+03	7	0	\N	t
20	Cortado	\N	Hot Coffee	120.00	/uploads/drink-1776612258765.webp	t	180	145	hot-bar	2026-04-19 17:24:18.676893+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
34	Flat white Frappe	Flat white Frappe	Frappe	0.00	/uploads/drink-1776850808907.webp	t	180	276	cold-bar	2026-04-21 14:40:29.073305+02	2026-04-28 19:56:09.865+03	6	4	\N	t
35	Pistachio Flat white Frappe	Pistachio Flat white Frappe	Frappe	0.00	/uploads/drink-1776851583550.webp	t	180	361	cold-bar	2026-04-21 14:52:16.383287+02	2026-04-28 19:56:09.865+03	6	5	\N	t
22	Iced Cortado	\N	Cold Coffee	130.00	/uploads/drink-1776621277882.webp	t	180	225	cold-bar	2026-04-19 19:54:37.814383+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
32	Iced Hazenut Flat White	\N	coffee	0.00	/uploads/drink-1776773970509.webp	t	180	296	cold-bar	2026-04-21 14:19:30.378586+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
29	Cortado Frappe	Cortado	Frappe	0.00	/uploads/drink-1776847766237.webp	t	180	235	cold-bar	2026-04-21 13:28:21.108891+02	2026-04-28 19:56:09.865+03	6	2	\N	t
24	Iced Mocha Toffy Nut	\N	Cold Coffee	0.00	/uploads/drink-1776768680886.webp	t	180	406	cold-bar	2026-04-20 12:04:24.991179+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
38	Hazelnut Flat white Frappe	Hazelnut Flat white Frappe	Frappe	0.00	/uploads/drink-1776851726545.webp	t	180	341	cold-bar	2026-04-21 15:35:30.992901+02	2026-04-28 19:56:09.865+03	6	6	\N	t
36	Iced Latte 	\N	coffee	0.00	/uploads/drink-1776775945227.webp	t	180	386	cold-bar	2026-04-21 14:52:25.160373+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
42	Iced Mocha	\N	Cold Coffee	0.00	/uploads/drink-1776781418189.webp	t	180	396	cold-bar	2026-04-21 16:23:38.123158+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
26	Caramel Macchiato Frappe	Caramel Macchiato Frappe	Frappe	0.00	/uploads/drink-1776769064189.webp	t	180	401	cold-bar	2026-04-21 10:49:45.395702+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
27	Pistachio Latte  Frappe	\N	Frappe	0.00	/uploads/drink-1776766530555.webp	t	180	376	cold-bar	2026-04-21 12:14:14.658762+02	2026-04-28 19:56:09.865+03	6	0	\N	t
44	Iced Toffy Nut Mocha 	\N	Cold Coffee	0.00	/uploads/drink-1776782636078.webp	t	120	406	cold-bar	2026-04-21 16:43:28.002656+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
46	Iced White Mocha 	\N	Cold Coffee	0.00	/uploads/drink-1776784061810.webp	t	180	406	cold-bar	2026-04-21 17:00:40.283097+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
45	Latte Frappe	Latte Frappe	Frappe	0.00	\N	t	180	326	cold-bar	2026-04-21 16:51:18.23622+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
49	Pistachio Frappe	Pistachio Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 17:20:00.258274+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
48	Stawberry Matcha Latte 	\N	Cold Coffee	0.00	/uploads/drink-1776784211926.webp	t	180	410	cold-bar	2026-04-21 17:09:57.901542+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
50	Spanish Frappe	Spanish Frappe	Frappe	0.00	\N	t	180	376	cold-bar	2026-04-21 17:30:13.309023+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
43	Almond Flat white Frappe	Almond Flat white Frappe	Frappe	0.00	\N	t	180	358	cold-bar	2026-04-21 16:31:38.124632+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
51	Iced White Chocolate Matcha	\N	coffee	0.00	/uploads/drink-1776786707364.webp	t	240	430	cold-bar	2026-04-21 17:51:47.226807+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
52	Iced Honey Matcha Latte	\N	Cold Coffee	0.00	/uploads/drink-1776787608337.webp	t	180	430	cold-bar	2026-04-21 18:06:48.208801+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
16	Espresso Affogato	\N	Hot Coffee	130.00	/uploads/drink-1776600487320.webp	t	180	\N	hot-bar	2026-04-19 14:08:07.228452+02	2026-04-28 19:56:09.865+03	\N	99	\N	t
7	Vanilla Latte	Latte with vanilla syrup	Hot	155.00	/uploads/drink-1776539794759.webp	f	180	\N	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
8	Cold Brew	Smooth cold brew concentrate over ice	Turkish	140.00	\N	f	60	\N	cold	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	2	0	\N	t
9	Iced Latte	Espresso with cold milk over ice	Cold	140.00	/uploads/drink-1776469492324.webp	f	120	\N	cold	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	3	0	\N	t
12	Iced Caramel Macchiato	Cold espresso with vanilla and caramel over milk	Cold	175.00	/uploads/drink-1776469513061.webp	f	150	\N	cold	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	3	0	\N	t
41	Iced Louts Spanish Latte	\N	Cold	0.00	/uploads/drink-1776780668361.webp	t	180	406	cold-bar	2026-04-21 16:11:08.291641+02	2026-04-28 19:56:09.865+03	3	0	\N	t
37	Iced Salted Vanilla Latte	\N	Cold	0.00	/uploads/drink-1776777269270.webp	t	180	386	cold-bar	2026-04-21 15:14:29.204767+02	2026-04-28 19:56:09.865+03	3	0	\N	t
40	Iced Spanish Latte	\N	Cold	0.00	/uploads/drink-1776779467529.webp	t	180	396	cold-bar	2026-04-21 15:51:07.465885+02	2026-04-28 19:56:09.865+03	3	0	\N	t
39	Iced Pistachio Latte 	\N	Cold	0.00	/uploads/drink-1776778998129.webp	t	180	386	cold-bar	2026-04-21 15:43:18.05558+02	2026-04-28 19:56:09.865+03	3	0	\N	t
28	Iced Flat White 	\N	Cold	0.00	/uploads/drink-1776768957647.webp	t	180	316	cold-bar	2026-04-21 12:52:51.263025+02	2026-04-28 19:56:09.865+03	3	0	\N	t
53	Lotus Spanish Frappe	Lotus Spanish Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 19:21:31.680396+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
31	Cortado Salted Caramel Frappe	Cortado Salted Caramel Frappe	Frappe	0.00	/uploads/drink-1776850078710.webp	t	180	261	cold-bar	2026-04-21 14:18:53.859746+02	2026-04-28 19:56:09.865+03	6	3	\N	t
54	Mocha Frappe	Mocha Frappe	Frappe	0.00	\N	t	180	371	cold-bar	2026-04-21 19:34:34.076977+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
55	Mocha Toffeenut Frappe	Mocha Toffeenut Frappe	Frappe	0.00	\N	t	180	386	cold-bar	2026-04-21 19:58:08.945774+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
56	White Mocha Frappe	White Mocha Frappe	Frappe	0.00	\N	t	180	376	cold-bar	2026-04-21 20:09:27.399558+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
57	Purple Mango	Purple Mango	Frappe	0.00	\N	t	180	445	cold-bar	2026-04-21 20:49:55.636558+02	2026-04-28 19:56:09.865+03	\N	0	\N	t
58	Nutty Fadge	Nutty Fadge	Frappe	0.00	\N	t	180	390	cold-bar	2026-04-22 14:03:09.237619+02	2026-04-28 19:56:09.865+03	6	0	\N	t
59	Peanutbutter Frappe	Peanutbutter Frappe	Frappe	0.00	\N	t	180	\N	cold-bar	2026-04-22 14:19:29.987366+02	2026-04-28 19:56:09.865+03	6	0	\N	t
60	FlatWhite	\N	Coffee	100.00	\N	t	120	\N	main-bar	2026-04-26 01:20:34.127316+03	2026-04-28 19:56:09.865+03	7	0	\N	t
62	FlatWhite	\N	Coffee	100.00	\N	t	120	\N	main-bar	2026-04-26 01:29:07.450837+03	2026-04-28 19:56:09.865+03	7	0	\N	t
61	FlatWhiteAlmond FlatWhite	\N	Coffee	100.00	\N	t	120	\N	main-bar	2026-04-26 01:21:25.051818+03	2026-04-28 19:56:09.865+03	7	0	\N	t
6	Espresso Chocolate	Espresso with chocolate sauce and steamed milk	Hot	155.00	/uploads/drink-1776539745460.webp	f	200	\N	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
5	Caramel Latte	Latte with caramel sauce and syrup	Hot	175.00	/uploads/drink-1776540267914.webp	f	200	\N	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
1	Flat White Test	Smooth espresso with silky steamed milk	Hot	150.00	/uploads/drink-1776540031536.webp	f	180	350	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
3	Latte	Espresso with generous steamed milk	Hot	130.00	/uploads/drink-1776540292294.webp	f	180	\N	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
13	White Mocha	Espresso with White chocolate sauce and steamed milk	Hot	160.00	/uploads/drink-1776540336688.webp	f	120	340	main	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
11	Espresso Macchiato	Espresso with hazelnut syrup and a splash of milk	Hot	120.00	/uploads/drink-1776539640677.webp	t	180	\N	hot-bar	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
4	Americano	Espresso diluted with hot water	Hot	110.00	/uploads/drink-1776539806813.webp	t	180	186	hot-bar	2026-04-17 00:56:14.298422+02	2026-04-28 19:56:09.865+03	1	0	\N	t
30	Iced Flat White Pistachio	\N	Cold	0.00	/uploads/drink-1776772978556.webp	t	180	306	cold-bar	2026-04-21 14:02:58.107547+02	2026-04-28 19:56:09.865+03	3	0	\N	t
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
105	35	8	0.0000	0.0000	\N	0.0000	f	0	t
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
112	22	8	0.0000	0.0000	\N	0.0000	f	0	t
79	22	9	35.0000	35.0000	\N	35.0000	t	0	t
\.


--
-- Data for Name: ingredient_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredient_types (id, category_id, name, inventory_ingredient_id, is_active, sort_order, created_at, processed_qty, produced_qty, unit, affects_cup_size, color, extra_cost) FROM stdin;
17	3	Vanilla	\N	t	0	2026-04-17 13:34:31.463261+02	0.0000	0.0000	ml	t	\N	0.0000
18	4	Caramel	\N	t	0	2026-04-17 13:34:31.464295+02	0.0000	0.0000	ml	t	\N	0.0000
19	4	Chocolate	\N	t	0	2026-04-17 13:34:31.46499+02	0.0000	0.0000	ml	t	\N	0.0000
20	3	Hazelnut	\N	t	0	2026-04-17 13:34:31.465792+02	0.0000	0.0000	ml	t	\N	0.0000
23	1	Cold Brew Concentrate	\N	t	0	2026-04-17 13:34:31.46797+02	0.0000	0.0000	ml	t	\N	0.0000
27	4	Almond	\N	t	0	2026-04-17 13:34:31.470427+02	0.0000	0.0000	ml	t	\N	0.0000
28	4	Blueberry	\N	t	0	2026-04-17 13:34:31.47094+02	0.0000	0.0000	ml	t	\N	0.0000
29	3	Bluecuracao	\N	t	0	2026-04-17 13:34:31.47154+02	0.0000	0.0000	ml	t	\N	0.0000
30	3	Butter Scotch	\N	t	0	2026-04-17 13:34:31.472038+02	0.0000	0.0000	ml	t	\N	0.0000
31	3	Caramel	\N	t	0	2026-04-17 13:34:31.472644+02	0.0000	0.0000	ml	t	\N	0.0000
32	8	Chocolate	\N	t	0	2026-04-17 13:34:31.473283+02	0.0000	0.0000	ml	t	\N	0.0000
33	3	Coconut	\N	t	0	2026-04-17 13:34:31.473878+02	0.0000	0.0000	ml	t	\N	0.0000
36	4	Dulce Delche	\N	t	0	2026-04-17 13:34:31.476272+02	0.0000	0.0000	ml	t	\N	0.0000
37	8	Earl Gray	\N	t	0	2026-04-17 13:34:31.476807+02	0.0000	0.0000	ml	t	\N	0.0000
38	8	Green Apple	\N	t	0	2026-04-17 13:34:31.477315+02	0.0000	0.0000	ml	t	\N	0.0000
39	8	Hazelnut Beans	\N	t	0	2026-04-17 13:34:31.477824+02	0.0000	0.0000	ml	t	\N	0.0000
40	7	Honey	\N	t	0	2026-04-17 13:34:31.478427+02	0.0000	0.0000	ml	t	\N	0.0000
41	8	Lemon Juice	\N	t	0	2026-04-17 13:34:31.479008+02	0.0000	0.0000	ml	t	\N	0.0000
43	5	Lotus Biscuits	\N	t	0	2026-04-17 13:34:31.480119+02	0.0000	0.0000	ml	t	\N	0.0000
44	4	Lotus	\N	t	0	2026-04-17 13:34:31.480702+02	0.0000	0.0000	ml	t	\N	0.0000
48	9	Mint Leaves	\N	t	0	2026-04-17 13:34:31.483833+02	0.0000	0.0000	ml	t	\N	0.0000
49	8	Passion Fruit	\N	t	0	2026-04-17 13:34:31.484356+02	0.0000	0.0000	ml	t	\N	0.0000
50	8	Passiont Fruit	\N	t	0	2026-04-17 13:34:31.485003+02	0.0000	0.0000	ml	t	\N	0.0000
51	3	Peach	\N	t	0	2026-04-17 13:34:31.485552+02	0.0000	0.0000	ml	t	\N	0.0000
53	8	Pecan Beans	\N	t	0	2026-04-17 13:34:31.486605+02	0.0000	0.0000	ml	t	\N	0.0000
54	4	Pecan	\N	t	0	2026-04-17 13:34:31.487316+02	0.0000	0.0000	ml	t	\N	0.0000
55	8	Pistachio Beans	\N	t	0	2026-04-17 13:34:31.48809+02	0.0000	0.0000	ml	t	\N	0.0000
57	8	Rani Peacj	\N	t	0	2026-04-17 13:34:31.48929+02	0.0000	0.0000	ml	t	\N	0.0000
58	8	Redbull	\N	t	0	2026-04-17 13:34:31.48999+02	0.0000	0.0000	ml	t	\N	0.0000
59	4	Salted Caramel	\N	t	0	2026-04-17 13:34:31.49058+02	0.0000	0.0000	ml	t	\N	0.0000
61	8	Strawberry Juice	\N	t	0	2026-04-17 13:34:31.492421+02	0.0000	0.0000	ml	t	\N	0.0000
62	3	Tofft Nut	\N	t	0	2026-04-17 13:34:31.493107+02	0.0000	0.0000	ml	t	\N	0.0000
63	8	Vanilla	\N	t	0	2026-04-17 13:34:31.493864+02	0.0000	0.0000	ml	t	\N	0.0000
64	8	White Chocolate	\N	t	0	2026-04-17 13:34:31.494422+02	0.0000	0.0000	ml	t	\N	0.0000
65	4	White Chocolate	\N	t	0	2026-04-17 13:34:31.4949+02	0.0000	0.0000	ml	t	\N	0.0000
66	1	Coffee Kintamani	\N	t	0	2026-04-17 13:34:31.495498+02	0.0000	0.0000	ml	t	\N	0.0000
67	4	Dulce De Leche	\N	t	0	2026-04-17 13:34:31.496161+02	0.0000	0.0000	ml	t	\N	0.0000
68	5	Ice Cream	\N	t	0	2026-04-17 13:34:31.496973+02	0.0000	0.0000	ml	t	\N	0.0000
69	5	Lotus	\N	t	0	2026-04-17 13:34:31.497473+02	0.0000	0.0000	ml	t	\N	0.0000
70	5	Lotus Biscuit	\N	t	0	2026-04-17 13:34:31.498037+02	0.0000	0.0000	ml	t	\N	0.0000
71	8	Tea Packet	\N	t	0	2026-04-17 13:34:31.498607+02	0.0000	0.0000	ml	t	\N	0.0000
72	9	Lemon Slices	\N	t	0	2026-04-17 13:34:31.499256+02	0.0000	0.0000	ml	t	\N	0.0000
34	1	Coffee Powder	\N	t	0	2026-04-17 13:34:31.474428+02	0.0000	0.0000	ml	t	\N	0.0000
73	10	None	\N	t	62	2026-04-18 23:15:15.231578+02	0.0000	0.0000	ml	t	\N	0.0000
83	7	Dite Suger	\N	t	71	2026-04-19 11:19:26.410405+02	0.0000	0.0000	ml	t	\N	0.0000
84	7	Brown Suger	\N	t	72	2026-04-19 11:20:52.165713+02	0.0000	0.0000	ml	t	\N	0.0000
21	7	White Sugar	\N	t	0	2026-04-17 13:34:31.466486+02	0.0000	0.0000	ml	t	\N	0.0000
88	2	Extra Macchiato Foam	\N	t	75	2026-04-19 14:30:14.223934+02	120.0000	60.0000	ml	t	\N	0.0000
24	8	Matcha	\N	t	0	2026-04-17 13:34:31.468648+02	3.0000	70.0000	ml	t	#449442	0.0000
60	4	Starwberry	\N	t	0	2026-04-17 13:34:31.491628+02	0.0000	0.0000	ml	t	#e40c0c	0.0000
56	4	Pistachio	\N	t	0	2026-04-17 13:34:31.488796+02	0.0000	0.0000	ml	t	#7bdd6e	0.0000
76	6	More Foam	\N	t	65	2026-04-19 10:37:59.200761+02	0.0000	70.0000	ml	t	\N	0.0000
85	10	Hot Water	\N	t	72	2026-04-19 14:01:24.666867+02	0.0000	0.0000	ml	t	\N	0.0000
86	6	Macchiato Foam	\N	t	73	2026-04-19 14:23:40.814682+02	120.0000	40.0000	ml	t	\N	0.0000
26	8	Almond Beans	\N	t	0	2026-04-17 13:34:31.469802+02	2.0000	2.0000	ml	t	#000000	0.0000
45	8	Mango Juice	\N	t	0	2026-04-17 13:34:31.481282+02	0.0000	0.0000	ml	t	#fb8a2d	0.0000
52	8	Peanutbutter	\N	t	0	2026-04-17 13:34:31.486137+02	0.0000	0.0000	ml	t	#000000	0.0000
90	1	Colombia Tres Dragons	\N	t	77	2026-04-19 15:23:02.005365+02	20.0000	300.0000	ml	t	\N	0.0000
92	2	Test Multi Option	\N	t	79	2026-04-20 11:15:36.08076+02	0.0000	0.0000	ml	t	\N	0.0000
10	1	Brazilian	\N	t	0	2026-04-17 01:44:15.351466+02	0.0000	0.0000	ml	t	#583737	0.0000
11	1	Colombian	\N	t	1	2026-04-17 01:45:16.545834+02	0.0000	0.0000	ml	t	#3c1515	0.0000
12	1	Ethiobian	\N	t	2	2026-04-17 02:08:45.387832+02	0.0000	0.0000	ml	t	#391919	0.0000
89	1	Colombia Sedama	\N	t	76	2026-04-19 15:06:26.078165+02	20.0000	300.0000	ml	t	#503030	0.0000
91	8	Ice Cubes	\N	t	78	2026-04-19 18:35:21.282845+02	0.0000	0.0000	ml	t	#75caff	0.0000
35	2	Condensed	\N	t	0	2026-04-17 13:34:31.475476+02	0.0000	0.0000	ml	t	#f7f7f7	0.0000
16	2	Almond	\N	t	0	2026-04-17 13:34:31.462472+02	0.0000	0.0000	ml	t	#000000	0.6000
47	2	Skimmed Milk	\N	t	0	2026-04-17 13:34:31.483315+02	0.0000	0.0000	ml	t	#f4f0f0	0.0000
79	2	Free Lactos Milk	\N	t	68	2026-04-19 10:58:33.295293+02	0.0000	0.0000	ml	t	#dedede	0.0000
80	2	Soay Milk	\N	t	69	2026-04-19 10:58:53.117776+02	0.0000	0.0000	ml	t	#f7eded	0.0000
81	2	Skimmed Milk	\N	t	69	2026-04-19 11:00:35.26027+02	0.0000	0.0000	ml	t	#fafafa	0.0000
82	2	Coconut Milk	\N	t	70	2026-04-19 11:01:23.842042+02	0.0000	0.0000	ml	t	#d2d1d1	0.0000
75	6	Creamy Milk	\N	t	64	2026-04-19 10:37:47.946058+02	0.0000	40.0000	ml	t	#f4e7e7	0.0000
87	6	Steam Milk	\N	t	74	2026-04-19 14:24:16.460348+02	120.0000	40.0000	ml	t	#d6d6d6	0.0000
14	2	Full Cream	\N	t	0	2026-04-17 13:34:31.460785+02	0.0000	0.0000	ml	t	#ffffff	0.1500
74	6	Light Foam	\N	t	63	2026-04-19 10:37:24.826197+02	0.0000	20.0000	ml	t	#ffffff	0.0000
22	5	Whipped Cream	\N	t	0	2026-04-17 13:34:31.467245+02	35.0000	35.0000	ml	t	#f9dddd	0.0000
15	2	Oat	\N	t	0	2026-04-17 13:34:31.46161+02	0.0000	0.0000	ml	t	#000000	0.5500
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
10	2 Pumps	20.0000	20.0000	ml	9	2026-04-17 00:56:14.294489+02
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
17	1 Pump/s	15.0000	15.0000	ml	16	2026-04-19 10:35:09.924036+02
18	2 Pump/s	30.0000	30.0000	ml	17	2026-04-19 10:35:37.495427+02
19	3 Pump/s	45.0000	45.0000	ml	18	2026-04-19 10:35:52.635051+02
1	Single	18.0000	18.0000	ml	0	2026-04-17 00:56:14.294489+02
2	Double	18.0000	36.0000	ml	1	2026-04-17 00:56:14.294489+02
3	Triple	36.0000	54.0000	ml	2	2026-04-17 00:56:14.294489+02
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ingredients (id, name, slug, ingredient_type, unit, cost_per_unit, stock_quantity, low_stock_threshold, is_active, created_at, updated_at) FROM stdin;
266	Coffee Colombia	coffee-colombia	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
267	Coffee guji	coffee-guji	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
268	Coffee Sidama	coffee-sidama	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
269	Colombia water melon	colombia-water-melon	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
270	La Esperanza Colombia	la-esperanza-colombia	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
271	Tres Dragones Colombia	tres-dragones-colombia	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
272	light Turkish coffee 250 g	light-turkish-coffee-250-g	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
273	muhwij light Turkish coffee 250 g	muhwij-light-turkish-coffee-250-g	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
274	Medium Turkish coffee 250 g	medium-turkish-coffee-250-g	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
275	muhwij Medium Turkish coffee 250 g	muhwij-medium-turkish-coffee-250-g	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
276	Arabic coffee	arabic-coffee	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
277	Milk Dina Farm Full cream 850 ml	milk-dina-farm-full-cream-850-ml	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
278	Milk Dina Farm skimed 850 ml	milk-dina-farm-skimed-850-ml	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
279	coconut milk	coconut-milk	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
280	oat milk	oat-milk	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
281	almond milk	almond-milk	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
282	Soya milk	soya-milk	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
283	Lactose Free Milk	lactose-free-milk	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
284	condensed milk 370 g	condensed-milk-370-g	milk	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
285	ice Crem	ice-crem	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
286	whipping cream	whipping-cream	milk	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
287	pistachio sauce	pistachio-sauce	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
288	Peanut butter	peanut-butter	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
289	White Chocoate  monin 2L	white-chocoate-monin-2l	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
290	Caramel monin 2L	caramel-monin-2l	other	ml	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
291	Blueberry monin Puree	blueberry-monin-puree	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
292	passion fruit monin Puree	passion-fruit-monin-puree	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
293	Green apple monin puree	green-apple-monin-puree	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
294	strawberry monin puree	strawberry-monin-puree	packing	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
295	Blue Curacao syrup	blue-curacao-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
296	Coconut syrup	coconut-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
297	Peach syrup	peach-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
298	Toffee nut syrup	toffee-nut-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
299	huzellnute syrup	huzellnute-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
300	caramel syrup	caramel-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
301	vanilia syrup	vanilia-syrup	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
302	Suger syrup 700 ml	suger-syrup-700-ml	syrup	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
303	Dark Chocolate Davinci 2L	dark-chocolate-davinci-2l	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
304	White Chocoate  Davinci 2L	white-chocoate-davinci-2l	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
305	Caramel Davinci 2L	caramel-davinci-2l	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
306	salted caramel Davinci 2L	salted-caramel-davinci-2l	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
307	Lotus 400 g	lotus-400-g	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
308	Almond	almond	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
309	Almond sauce	almond-sauce	sauce	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
310	coffee powder	coffee-powder	coffee	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
311	vanilia pawder	vanilia-pawder	base	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
312	chocolate powder	chocolate-powder	base	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
313	matcha pawder 250 g	matcha-pawder-250-g	base	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
314	white suger	white-suger	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
315	Brown Suger	brown-suger	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
316	Diet Suger	diet-suger	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
317	white suger	white-suger-g	sweetener	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
318	Ahmad tea earl grey	ahmad-tea-earl-grey	tea	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
319	Ahmad tea Green	ahmad-tea-green	tea	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
320	Ahmad tea english breakfast	ahmad-tea-english-breakfast	tea	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
321	sprite 330 ml	sprite-330-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
322	Red Bull 250 ml	red-bull-250-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
323	Rani Peach 240 ml	rani-peach-240-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
324	Rani Pineapple 240 ml	rani-pineapple-240-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
325	honey 500 g	honey-500-g	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
326	Lemon	lemon	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
327	mint	mint	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
328	vainilla liquida	vainilla-liquida	other	g	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
329	Straw	straw	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
330	Stirrer	stirrer	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
331	isi Charger	isi-charger	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
332	Sleeve	sleeve	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
333	white sandwich paper large	white-sandwich-paper-large	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
334	butter paper	butter-paper	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
335	cup Holder 2	cup-holder-2	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
336	Ciup Holder 4	ciup-holder-4	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
337	Cup Holder Printing	cup-holder-printing	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
338	Take Away Bag Spacca	take-away-bag-spacca	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
339	cup hot 4 oz	cup-hot-4-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
340	cup hot 8 oz	cup-hot-8-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
341	Lid hot 8 oz	lid-hot-8-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
342	cup hot 12 oz	cup-hot-12-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
343	Lid hot 12 oz	lid-hot-12-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
344	cup Cold 16 oz	cup-cold-16-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
345	Flat lid cold 16 oz	flat-lid-cold-16-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
346	Dome lid cold 16 oz	dome-lid-cold-16-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
347	Cup cold  12 oz	cup-cold-12-oz	cup	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
348	Filter	filter	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
349	Guest napkin	guest-napkin	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
350	coveir	coveir	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
351	jumbo Napkin	jumbo-napkin	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
352	Expire Label	expire-label	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
353	Hand Glaves	hand-glaves	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
354	Hand Glaves Black	hand-glaves-black	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
355	white paper plates	white-paper-plates	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
356	white sandwich paper small	white-sandwich-paper-small	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
357	visa roll	visa-roll	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
358	cash roll	cash-roll	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
359	Label 7*5 roll	label-7-5-roll	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
360	puvana water 600ml	puvana-water-600ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
361	Sparkling Water 250ml	sparkling-water-250ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
362	V Cola 300 ml	v-cola-300-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
363	V Cola Diet  300 ml	v-cola-diet-300-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
364	V Pina Colada 300 ml	v-pina-colada-300-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
365	V Gold Pineapple 300 ml	v-gold-pineapple-300-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
366	V pomegranate 300 ml	v-pomegranate-300-ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
367	Orange Juice 270ml	orange-juice-270ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
368	Mango Juice 270ml	mango-juice-270ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
369	Strawberry Juice 270ml	strawberry-juice-270ml	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
370	Juava Juice  270ml	juava-juice-270ml	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
371	Dark Chocolate Almond  35g	dark-chocolate-almond-35g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
372	Dark Chocolate Almond/Cranberry  35g	dark-chocolate-almond-cranberry-35g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
373	Dark Chocolate Mint   35g	dark-chocolate-mint-35g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
374	Dark Chocolate Honeycomb 35g	dark-chocolate-honeycomb-35g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
375	Dark Chocolate Plain-70% 35g	dark-chocolate-plain-70-35g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
376	Cashew Almond Pumpkin BAR 40g	cashew-almond-pumpkin-bar-40g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
377	Almond Cashew Cranberry BAR 40g	almond-cashew-cranberry-bar-40g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
378	Almond Cashew Coconut BAR 40g	almond-cashew-coconut-bar-40g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
379	Belgian Milk Chocolate Almond Dragees 70g	belgian-milk-chocolate-almond-dragees-70g	milk	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
380	Belgian Milk Chocolate Hazelnut Dragees 70g	belgian-milk-chocolate-hazelnut-dragees-70g	milk	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
381	Sugar free Belgian Milk Chocolate Bar 30g	sugar-free-belgian-milk-chocolate-bar-30g	milk	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
382	Sugar free Belgian Dark Chocolate Bar 30g	sugar-free-belgian-dark-chocolate-bar-30g	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
383	Sugar free Belgian Milk Chocolate Bar with Hazelnut 30g	sugar-free-belgian-milk-chocolate-bar-with-hazelnut-30g	milk	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
384	Sugar free Belgian Dark Chocolate Bar with Almond 30g	sugar-free-belgian-dark-chocolate-bar-with-almond-30g	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
385	Sugar free Belgian Dark Chocolate Mint Bar  30g	sugar-free-belgian-dark-chocolate-mint-bar-30g	sweetener	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
386	Sugar free Belgian Strawberry Milk Chocolate Bar 30g	sugar-free-belgian-strawberry-milk-chocolate-bar-30g	packing	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
387	Sugar free Belgian Dark Coffee Chocolate Bar 30g	sugar-free-belgian-dark-coffee-chocolate-bar-30g	coffee	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
388	Tiramisu Cake 175g	tiramisu-cake-175g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
389	Triple Chocolate Cake 170g	triple-chocolate-cake-170g	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
390	Belgian Chocolate Sable Box	belgian-chocolate-sable-box	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
391	Chocolate Butter Biscuits Box	chocolate-butter-biscuits-box	sauce	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
392	Chocolate Éclair	chocolate-clair	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
393	Pistachio Éclair	pistachio-clair	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
394	Pecan Tart	pecan-tart	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
395	Plain Butter Croissant	plain-butter-croissant	sauce	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
396	Croissant Emmental	croissant-emmental	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
397	Pate Roumi Cheese	pate-roumi-cheese	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
398	Pain Suise	pain-suise	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
399	Pain white cheese with oliv	pain-white-cheese-with-oliv	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
400	Morning Manager:-                        Morning T M:	morning-manager-morning-t-m	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
401	The waste Checked By :	the-waste-checked-by	other	pcs	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
402	Manager	manager	other	april 25	0.0000	0.0000	100.0000	t	2026-04-28 19:56:09.863818+03	2026-04-28 19:56:09.863818+03
\.


--
-- Data for Name: kitchen_stations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kitchen_stations (id, name, is_active, sort_order, created_at) FROM stdin;
1	Hot Bar	t	0	2026-04-21 10:54:37.627783+02
3	Turkish Bar	t	20	2026-04-21 10:55:17.008863+02
2	Cold Bar	t	10	2026-04-21 10:55:02.165222+02
4	Food/Pastry	t	30	2026-04-21 10:56:51.874032+02
\.


--
-- Data for Name: order_item_customizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item_customizations (id, order_item_id, ingredient_id, option_id, consumed_qty, added_cost, slot_label, option_label, created_at, type_volume_id, barista_sort_order, customer_sort_order, produced_qty) FROM stdin;
270	71	\N	\N	18.0000	0.0000	Coffe Type	Ethiobian · Double	2026-04-29 11:53:22.706991+03	38	1	1	36.0000
271	72	\N	\N	36.0000	40.0000	Coffe Type	Ethiobian · Triple	2026-04-29 18:04:49.743504+03	39	1	1	54.0000
272	73	\N	\N	20.0000	0.0000	Sweetner	Honey · 2 Pumps	2026-04-29 18:06:51.422506+03	81	6	6	20.0000
273	73	\N	\N	30.0000	0.0000	Sauce	Chocolate · 2 Pumps	2026-04-29 18:06:51.422506+03	50	2	2	30.0000
274	73	\N	\N	36.0000	60.0000	Coffee	Colombian · Triple	2026-04-29 18:06:51.422506+03	36	3	1	54.0000
275	73	\N	\N	210.0000	0.0000	Ice Cubes	Ice Cubes · More Cubes	2026-04-29 18:06:51.422506+03	78	4	3	210.0000
276	73	\N	\N	35.0000	35.0000	Whipped Cream	Whipped Cream · 1 Pump	2026-04-29 18:06:51.422506+03	79	6	5	35.0000
277	73	\N	\N	102.0000	15.3000	Milk	Full Cream (102ml)	2026-04-29 18:06:51.422506+03	\N	5	4	102.0000
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, drink_id, drink_name, quantity, unit_price, line_total, special_notes, created_at, updated_at, kitchen_station, status, ready_at) FROM stdin;
71	53	15	Espresso	1	95.00	95.00	\N	2026-04-29 11:53:22.706991+03	2026-04-29 11:53:22.706991+03	cold-bar	pending	\N
72	54	15	Espresso	1	135.00	135.00	\N	2026-04-29 18:04:49.743504+03	2026-04-29 18:04:49.743504+03	cold-bar	pending	\N
73	55	42	Iced Mocha	1	110.30	110.30	\N	2026-04-29 18:06:51.422506+03	2026-04-29 18:06:51.422506+03	cold-bar	pending	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, barista_id, status, customer_name, subtotal, discount, total, payment_method, amount_tendered, change_due, notes, created_at, updated_at, discount_id, discount_code, discount_value, discount_type, cashier_id, paid_at, ready_at, completed_at, cancelled_at) FROM stdin;
53	119001	1	refunded	\N	95.00	0.00	95.00	card	\N	\N	\N	2026-04-29 11:53:22.706991+03	2026-04-29 13:53:11.128+03	\N	\N	\N	\N	5	2026-04-29 13:52:55.201+03	\N	\N	2026-04-29 13:53:11.128+03
54	119002	1	paid	\N	135.00	0.00	135.00	card	\N	\N	\N	2026-04-29 18:04:49.743504+03	2026-04-29 18:05:18.055+03	\N	\N	\N	\N	5	2026-04-29 18:05:18.055+03	\N	\N	\N
55	119003	1	paid	\N	110.30	0.00	110.30	card	\N	\N	\N	2026-04-29 18:06:51.422506+03	2026-04-29 18:06:56.469+03	\N	\N	\N	\N	5	2026-04-29 18:06:56.469+03	\N	\N	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, key, description, created_at) FROM stdin;
1	admin:view_logs	View system activity logs	2026-04-29 16:40:57.757459+03
2	admin:manage_permissions	Manage roles and permissions	2026-04-29 16:40:57.766132+03
3	users:view	View staff list	2026-04-29 16:40:57.766874+03
4	users:create	Add new staff members	2026-04-29 16:40:57.767326+03
5	users:update	Edit staff details and PINs	2026-04-29 16:40:57.767799+03
6	users:delete	Remove staff members	2026-04-29 16:40:57.768192+03
7	orders:view	View order history	2026-04-29 16:40:57.768558+03
8	catalog:view	View menu and ingredients	2026-04-29 16:40:57.768986+03
9	catalog:edit	Manage menu, categories, and pricing	2026-04-29 16:40:57.769369+03
10	inventory:view	View stock levels	2026-04-29 16:40:57.769888+03
11	inventory:edit	Adjust stock and restock items	2026-04-29 16:40:57.770291+03
12	reports:view	Access sales and performance reports	2026-04-29 16:40:57.770591+03
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
3	Coffee Espresso	Coffee	t	f	t	2026-04-21 10:21:12.615326+02	2026-04-21 10:21:12.615326+02
4	Milk	Milk	t	t	\N	2026-04-21 10:27:49.497174+02	2026-04-21 10:27:49.497174+02
5	All Syrup (V-TO-HZ)	Syrup	t	f	\N	2026-04-21 10:30:50.80663+02	2026-04-21 10:34:25.216+02
8	Powder	Powder	t	f	t	2026-04-21 11:23:52.450872+02	2026-04-21 11:23:52.450872+02
7	Sauce	Sauce	t	f	t	2026-04-21 11:22:57.547403+02	2026-04-21 11:43:26.335+02
6	Sweetner	Sweetner	t	f	f	2026-04-21 10:30:59.166362+02	2026-04-21 14:17:53.899+02
9	Ice Cubes	Ice Cubes	t	f	t	2026-04-21 14:55:21.570642+02	2026-04-21 14:55:21.570642+02
10	Whipped Cream	Whipped Cream	t	f	f	2026-04-21 14:55:47.446826+02	2026-04-21 14:55:47.446826+02
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role, permission_key, created_at) FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, scope, user_id, key, value, updated_at) FROM stdin;
1	global	\N	autoPrintCustomer	false	2026-04-28 12:23:20.035+03
2	global	\N	autoPrintAgent	false	2026-04-28 12:23:21.806+03
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, ingredient_id, order_id, movement_type, quantity, quantity_after, note, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, role, pin, created_at, updated_at, username, password_hash, is_active) FROM stdin;
1	Admin User	admin	000000	2026-04-17 00:56:14.276428+02	2026-04-29 12:07:22.705+03	admin_user1	$2b$10$gzy.bRLJBRMHzoBepcj9vuyqLaKfqHk953P9dPDt8/pWY8FBYgkh2	t
2	Sarah	barista	111111	2026-04-17 00:56:14.276428+02	2026-04-29 12:07:22.779+03	sarah2	$2b$10$kmFqNxFeZDtn/AlsliMXTOV7xysYsMafQ/QpMYrFT/KEVCVv.pTBq	t
3	Adam	barista	222222	2026-04-17 00:56:14.276428+02	2026-04-29 12:07:22.912+03	adam3	$2b$10$lIS3AnhWnUj6bpwZplkEjeZIPO7c8ITpj4.wD4v4frjF5YM0AY92y	t
7	Spacca Admin	admin	121234	2026-04-26 19:42:57.598526+03	2026-04-29 12:07:23.045+03	spacca_admin7	$2b$10$tWq8pOKbKX4rrZuPnZDc/eBj2KGV5V1ggwTZDN1KKKYj4vmrwxyEK	t
5	Hale Town Cashier	cashier	369741	2026-04-21 16:23:33.021966+02	2026-04-29 14:37:59.304+03	hale_town_cashier	$2b$10$gkZGvosona6GUa63uIzao.FSIHipnrA0LNogNMglHCw9.YRms5siC	t
6	Hale Town Pickup	pickup	147963	2026-04-21 16:23:48.242314+02	2026-04-29 14:45:23.755+03	hale_town_pickup	$2b$10$spcODIDgQfUut/bEpprZ0extV3QQslHndh355NJ7SXFmcz/ZMEdIW	t
4	Spacca POS	frontdesk	999999	2026-04-17 00:56:14.276428+02	2026-04-29 14:46:15.557+03	spacca_front	$2b$10$Vhw/1fwgCsImP.1oGs2UVOzYciKt2EtUp9cbv6E3nFC3KP7Kbexvq	t
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 9, true);


--
-- Name: cashier_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cashier_sessions_id_seq', 12, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discounts_id_seq', 3, true);


--
-- Name: drink_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_categories_id_seq', 7, true);


--
-- Name: drink_ingredient_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_ingredient_slots_id_seq', 1629, true);


--
-- Name: drink_slot_type_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_type_options_id_seq', 4535, true);


--
-- Name: drink_slot_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drink_slot_volumes_id_seq', 6884, true);


--
-- Name: drinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drinks_id_seq', 62, true);


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

SELECT pg_catalog.setval('public.ingredients_id_seq', 402, true);


--
-- Name: kitchen_stations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kitchen_stations_id_seq', 4, true);


--
-- Name: order_item_customizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_customizations_id_seq', 277, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 73, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 55, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 12, true);


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
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 1, false);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 2, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 222, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


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
-- Name: permissions permissions_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_key_key UNIQUE (key);


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
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: global_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX global_key_idx ON public.settings USING btree (key) WHERE (scope = 'global'::text);


--
-- Name: user_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_key_idx ON public.settings USING btree (user_id, key) WHERE (scope = 'user'::text);


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


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
-- Name: role_permissions role_permissions_permission_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_key_fkey FOREIGN KEY (permission_key) REFERENCES public.permissions(key);


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

\unrestrict bPoG0rGlVwyfV6uzwdMuv1erunqwNJmoZVbd8KPGoCTisfIIJ4PtEhbkFPDUUoh

