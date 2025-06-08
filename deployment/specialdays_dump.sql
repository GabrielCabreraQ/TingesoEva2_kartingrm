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
-- Name: specialdays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialdays (
    id bigint NOT NULL,
    date date,
    description character varying(255)
);


ALTER TABLE public.specialdays OWNER TO postgres;

--
-- Name: specialdays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialdays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.specialdays_id_seq OWNER TO postgres;

--
-- Name: specialdays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialdays_id_seq OWNED BY public.specialdays.id;


--
-- Name: specialdays id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialdays ALTER COLUMN id SET DEFAULT nextval('public.specialdays_id_seq'::regclass);


--
-- Data for Name: specialdays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialdays (id, date, description) FROM stdin;
1	2025-05-01	Día nacional del trabajo
2	2025-05-21	Día de las glorias navales
3	2025-06-20	Día nacional de los pueblos indígenas
4	2025-06-29	Día de las elecciones Primarias
5	2025-06-30	Día del Karting
6	2025-07-16	Dia de la virgen
7	2025-09-18	Independencia Nacional
8	2025-07-07	Super día del alza
9	2025-07-17	Día del tatuaje
10	2025-04-18	Viernes Santo
11	2025-04-19	Sábado Santo
12	2025-09-18	Independencia Nacional
13	2025-09-19	Día de las Glorias del Ejercito
\.


--
-- Name: specialdays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specialdays_id_seq', 13, true);


--
-- Name: specialdays specialdays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialdays
    ADD CONSTRAINT specialdays_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

