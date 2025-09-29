--
-- PostgreSQL database dump
--

\restrict 3FquYKlfGy5gYC9b9LoJ3Ld4zmVvoq8gzEBqePphcxOMtmrdnS8MXPjicLvI0Jh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-26 01:54:08

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
-- TOC entry 2 (class 3079 OID 16408)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 16477)
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    article_id integer NOT NULL,
    article_title character varying(255) NOT NULL,
    content text NOT NULL,
    article_url character varying(255) NOT NULL,
    source_name character varying(255) NOT NULL,
    publication_date date,
    result_id integer
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16476)
-- Name: articles_article_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_article_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_article_id_seq OWNER TO postgres;

--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 228
-- Name: articles_article_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_article_id_seq OWNED BY public.articles.article_id;


--
-- TOC entry 227 (class 1259 OID 16463)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    search_id integer,
    entity_text character varying(255) NOT NULL,
    entity_label character varying(255) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16462)
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO postgres;

--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 226
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- TOC entry 223 (class 1259 OID 16433)
-- Name: conversationHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."conversationHistory" (
    chat_id integer NOT NULL,
    user_id integer,
    query_text text NOT NULL,
    response_text text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."conversationHistory" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16432)
-- Name: chats_chat_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_chat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_chat_id_seq OWNER TO postgres;

--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 222
-- Name: chats_chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_chat_id_seq OWNED BY public."conversationHistory".chat_id;


--
-- TOC entry 233 (class 1259 OID 16513)
-- Name: credibilityscore; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credibilityscore (
    credible_id integer NOT NULL,
    user_id integer NOT NULL,
    article_id integer NOT NULL,
    result_id integer NOT NULL,
    credibilityscorefull double precision NOT NULL,
    true_score double precision NOT NULL,
    false_score double precision NOT NULL,
    inconclusive_score double precision NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.credibilityscore OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16512)
-- Name: credibilityscore_credible_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credibilityscore_credible_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credibilityscore_credible_id_seq OWNER TO postgres;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 232
-- Name: credibilityscore_credible_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credibilityscore_credible_id_seq OWNED BY public.credibilityscore.credible_id;


--
-- TOC entry 219 (class 1259 OID 16399)
-- Name: search_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.search_results (
    result_id integer NOT NULL,
    query text NOT NULL,
    results jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.search_results OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16398)
-- Name: search_results_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.search_results_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.search_results_result_id_seq OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 218
-- Name: search_results_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.search_results_result_id_seq OWNED BY public.search_results.result_id;


--
-- TOC entry 225 (class 1259 OID 16448)
-- Name: searches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.searches (
    search_id integer NOT NULL,
    account_id integer,
    query_text text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.searches OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16447)
-- Name: searches_search_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.searches_search_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.searches_search_id_seq OWNER TO postgres;

--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.searches_search_id_seq OWNED BY public.searches.search_id;


--
-- TOC entry 235 (class 1259 OID 16536)
-- Name: userreview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userreview (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    result_id integer NOT NULL,
    rating double precision NOT NULL,
    review_text character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.userreview OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16535)
-- Name: userreview_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userreview_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userreview_review_id_seq OWNER TO postgres;

--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 234
-- Name: userreview_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userreview_review_id_seq OWNED BY public.userreview.review_id;


--
-- TOC entry 221 (class 1259 OID 16420)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4(),
    hashed_password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16419)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 231 (class 1259 OID 16493)
-- Name: usersummaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usersummaries (
    summary_id integer NOT NULL,
    user_id integer NOT NULL,
    result_id integer NOT NULL,
    summary_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usersummaries OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16492)
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usersummaries_summary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usersummaries_summary_id_seq OWNER TO postgres;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usersummaries_summary_id_seq OWNED BY public.usersummaries.summary_id;


--
-- TOC entry 4803 (class 2604 OID 16480)
-- Name: articles article_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN article_id SET DEFAULT nextval('public.articles_article_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 16466)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16436)
-- Name: conversationHistory chat_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory" ALTER COLUMN chat_id SET DEFAULT nextval('public.chats_chat_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 16516)
-- Name: credibilityscore credible_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credibilityscore ALTER COLUMN credible_id SET DEFAULT nextval('public.credibilityscore_credible_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16402)
-- Name: search_results result_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_results ALTER COLUMN result_id SET DEFAULT nextval('public.search_results_result_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 16451)
-- Name: searches search_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches ALTER COLUMN search_id SET DEFAULT nextval('public.searches_search_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 16539)
-- Name: userreview review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview ALTER COLUMN review_id SET DEFAULT nextval('public.userreview_review_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 16423)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16496)
-- Name: usersummaries summary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries ALTER COLUMN summary_id SET DEFAULT nextval('public.usersummaries_summary_id_seq'::regclass);


--
-- TOC entry 4999 (class 0 OID 16477)
-- Dependencies: 229
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (article_id, article_title, content, article_url, source_name, publication_date, result_id) FROM stdin;
\.


--
-- TOC entry 4997 (class 0 OID 16463)
-- Dependencies: 227
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, search_id, entity_text, entity_label) FROM stdin;
\.


--
-- TOC entry 4993 (class 0 OID 16433)
-- Dependencies: 223
-- Data for Name: conversationHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."conversationHistory" (chat_id, user_id, query_text, response_text, "timestamp") FROM stdin;
\.


--
-- TOC entry 5003 (class 0 OID 16513)
-- Dependencies: 233
-- Data for Name: credibilityscore; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credibilityscore (credible_id, user_id, article_id, result_id, credibilityscorefull, true_score, false_score, inconclusive_score, created_at) FROM stdin;
\.


--
-- TOC entry 4989 (class 0 OID 16399)
-- Dependencies: 219
-- Data for Name: search_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_results (result_id, query, results, created_at) FROM stdin;
\.


--
-- TOC entry 4995 (class 0 OID 16448)
-- Dependencies: 225
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.searches (search_id, account_id, query_text, "timestamp") FROM stdin;
\.


--
-- TOC entry 5005 (class 0 OID 16536)
-- Dependencies: 235
-- Data for Name: userreview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userreview (review_id, user_id, result_id, rating, review_text, created_at) FROM stdin;
\.


--
-- TOC entry 4991 (class 0 OID 16420)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, uuid, hashed_password, role, created_at) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 16493)
-- Dependencies: 231
-- Data for Name: usersummaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usersummaries (summary_id, user_id, result_id, summary_text, created_at) FROM stdin;
\.


--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 228
-- Name: articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_article_id_seq', 1, false);


--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 226
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 1, false);


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 222
-- Name: chats_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_chat_id_seq', 1, false);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 232
-- Name: credibilityscore_credible_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credibilityscore_credible_id_seq', 1, false);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 218
-- Name: search_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_results_result_id_seq', 1, false);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.searches_search_id_seq', 1, false);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 234
-- Name: userreview_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userreview_review_id_seq', 1, false);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usersummaries_summary_id_seq', 1, false);


--
-- TOC entry 4823 (class 2606 OID 16486)
-- Name: articles articles_article_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_article_url_key UNIQUE (article_url);


--
-- TOC entry 4825 (class 2606 OID 16484)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (article_id);


--
-- TOC entry 4821 (class 2606 OID 16470)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4817 (class 2606 OID 16441)
-- Name: conversationHistory chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_pkey PRIMARY KEY (chat_id);


--
-- TOC entry 4829 (class 2606 OID 16519)
-- Name: credibilityscore credibilityscore_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credibilityscore
    ADD CONSTRAINT credibilityscore_pkey PRIMARY KEY (credible_id);


--
-- TOC entry 4811 (class 2606 OID 16407)
-- Name: search_results search_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_results
    ADD CONSTRAINT search_results_pkey PRIMARY KEY (result_id);


--
-- TOC entry 4819 (class 2606 OID 16456)
-- Name: searches searches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_pkey PRIMARY KEY (search_id);


--
-- TOC entry 4831 (class 2606 OID 16542)
-- Name: userreview userreview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4813 (class 2606 OID 16429)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4815 (class 2606 OID 16431)
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- TOC entry 4827 (class 2606 OID 16501)
-- Name: usersummaries usersummaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_pkey PRIMARY KEY (summary_id);


--
-- TOC entry 4835 (class 2606 OID 16487)
-- Name: articles articles_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4834 (class 2606 OID 16471)
-- Name: categories categories_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_search_id_fkey FOREIGN KEY (search_id) REFERENCES public.searches(search_id);


--
-- TOC entry 4832 (class 2606 OID 16442)
-- Name: conversationHistory chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4838 (class 2606 OID 16525)
-- Name: credibilityscore credibilityscore_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credibilityscore
    ADD CONSTRAINT credibilityscore_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(article_id);


--
-- TOC entry 4839 (class 2606 OID 16530)
-- Name: credibilityscore credibilityscore_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credibilityscore
    ADD CONSTRAINT credibilityscore_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4840 (class 2606 OID 16520)
-- Name: credibilityscore credibilityscore_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credibilityscore
    ADD CONSTRAINT credibilityscore_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4833 (class 2606 OID 16457)
-- Name: searches searches_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.users(user_id);


--
-- TOC entry 4841 (class 2606 OID 16548)
-- Name: userreview userreview_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4842 (class 2606 OID 16543)
-- Name: userreview userreview_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4836 (class 2606 OID 16507)
-- Name: usersummaries usersummaries_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4837 (class 2606 OID 16502)
-- Name: usersummaries usersummaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2025-09-26 01:54:08

--
-- PostgreSQL database dump complete
--

\unrestrict 3FquYKlfGy5gYC9b9LoJ3Ld4zmVvoq8gzEBqePphcxOMtmrdnS8MXPjicLvI0Jh

