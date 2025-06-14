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
-- Name: groupdiscount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groupdiscount (
    id bigint NOT NULL
);


ALTER TABLE public.groupdiscount OWNER TO postgres;

--
-- Name: groupdiscount_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groupdiscount_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.groupdiscount_id_seq OWNER TO postgres;

--
-- Name: groupdiscount_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groupdiscount_id_seq OWNED BY public.groupdiscount.id;


--
-- Name: groupdiscount id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupdiscount ALTER COLUMN id SET DEFAULT nextval('public.groupdiscount_id_seq'::regclass);


--
-- Data for Name: groupdiscount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groupdiscount (id) FROM stdin;
\.


--
-- Name: groupdiscount_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groupdiscount_id_seq', 1, false);


--
-- Name: groupdiscount groupdiscount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupdiscount
    ADD CONSTRAINT groupdiscount_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

