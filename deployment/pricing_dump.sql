--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10
-- Dumped by pg_dump version 15.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing (
    id bigint NOT NULL,
    birthday_discount double precision NOT NULL,
    discount11to15people double precision NOT NULL,
    discount1to2people double precision NOT NULL,
    discount3to5people double precision NOT NULL,
    discount6to10people double precision NOT NULL,
    discount_frequent double precision NOT NULL,
    discount_non_frequent double precision NOT NULL,
    discount_regular double precision NOT NULL,
    discount_very_frequent double precision NOT NULL,
    holiday_discount double precision NOT NULL,
    holyday_rise double precision NOT NULL,
    iva double precision NOT NULL,
    price10laps double precision NOT NULL,
    price15laps double precision NOT NULL,
    price20laps double precision NOT NULL,
    weekend_discount double precision NOT NULL,
    weekend_rise double precision NOT NULL
);


ALTER TABLE public.pricing OWNER TO postgres;

--
-- Name: pricing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pricing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pricing_id_seq OWNER TO postgres;

--
-- Name: pricing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pricing_id_seq OWNED BY public.pricing.id;


--
-- Name: pricing id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing ALTER COLUMN id SET DEFAULT nextval('public.pricing_id_seq'::regclass);


--
-- Data for Name: pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing (id, birthday_discount, discount11to15people, discount1to2people, discount3to5people, discount6to10people, discount_frequent, discount_non_frequent, discount_regular, discount_very_frequent, holiday_discount, holyday_rise, iva, price10laps, price15laps, price20laps, weekend_discount, weekend_rise) FROM stdin;
1	0.5	0.3	0	0.1	0.2	0.2	0	0.1	0.3	0.15	0.25	0.19	15000	20000	25000	0.1	0.15
\.


--
-- Name: pricing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_id_seq', 1, false);


--
-- Name: pricing pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing
    ADD CONSTRAINT pricing_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

