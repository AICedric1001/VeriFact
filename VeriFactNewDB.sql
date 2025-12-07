--
-- PostgreSQL database dump
--

\restrict EeY9PhZhdWgJSV8Rhlx2beBPepFYEYnv2M19QH7352xibw9iCFL9LPSjpH7JZQ0

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-07 22:19:20

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
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 235 (class 1259 OID 16948)
-- Name: articlecount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articlecount (
    count_id integer NOT NULL,
    result_id integer NOT NULL,
    count integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.articlecount OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16947)
-- Name: articlecount_count_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articlecount_count_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articlecount_count_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 234
-- Name: articlecount_count_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articlecount_count_id_seq OWNED BY public.articlecount.count_id;


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
-- TOC entry 5030 (class 0 OID 0)
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
-- TOC entry 5031 (class 0 OID 0)
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
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    search_id integer
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
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 222
-- Name: chats_chat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_chat_id_seq OWNED BY public."conversationHistory".chat_id;


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
-- TOC entry 5033 (class 0 OID 0)
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
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.searches_search_id_seq OWNED BY public.searches.search_id;


--
-- TOC entry 237 (class 1259 OID 16979)
-- Name: trusted_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trusted_sources (
    source_id integer NOT NULL,
    domain character varying(255) NOT NULL,
    source_name character varying(255),
    trust_status character varying(20) NOT NULL,
    reason text,
    is_global boolean DEFAULT false,
    added_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trusted_sources_trust_status_check CHECK (((trust_status)::text = ANY ((ARRAY['trusted'::character varying, 'blocked'::character varying, 'neutral'::character varying])::text[])))
);


ALTER TABLE public.trusted_sources OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16978)
-- Name: trusted_sources_source_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trusted_sources_source_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trusted_sources_source_id_seq OWNER TO postgres;

--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 236
-- Name: trusted_sources_source_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trusted_sources_source_id_seq OWNED BY public.trusted_sources.source_id;


--
-- TOC entry 233 (class 1259 OID 16536)
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
-- TOC entry 232 (class 1259 OID 16535)
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
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 232
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    username character varying(150) NOT NULL
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
-- TOC entry 5037 (class 0 OID 0)
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
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usersummaries_summary_id_seq OWNED BY public.usersummaries.summary_id;


--
-- TOC entry 4813 (class 2604 OID 16951)
-- Name: articlecount count_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount ALTER COLUMN count_id SET DEFAULT nextval('public.articlecount_count_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 16480)
-- Name: articles article_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN article_id SET DEFAULT nextval('public.articles_article_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 16466)
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 16436)
-- Name: conversationHistory chat_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory" ALTER COLUMN chat_id SET DEFAULT nextval('public.chats_chat_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16402)
-- Name: search_results result_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_results ALTER COLUMN result_id SET DEFAULT nextval('public.search_results_result_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 16451)
-- Name: searches search_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches ALTER COLUMN search_id SET DEFAULT nextval('public.searches_search_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 16982)
-- Name: trusted_sources source_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trusted_sources ALTER COLUMN source_id SET DEFAULT nextval('public.trusted_sources_source_id_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 16539)
-- Name: userreview review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview ALTER COLUMN review_id SET DEFAULT nextval('public.userreview_review_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 16423)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 16496)
-- Name: usersummaries summary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries ALTER COLUMN summary_id SET DEFAULT nextval('public.usersummaries_summary_id_seq'::regclass);


--
-- TOC entry 5020 (class 0 OID 16948)
-- Dependencies: 235
-- Data for Name: articlecount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articlecount (count_id, result_id, count, created_at) FROM stdin;
1	21	0	2025-12-06 16:45:47.767965
2	22	1	2025-12-07 19:11:36.498066
3	23	1	2025-12-07 19:13:53.692288
4	24	1	2025-12-07 19:16:10.535708
5	25	3	2025-12-07 19:48:08.862331
\.


--
-- TOC entry 5014 (class 0 OID 16477)
-- Dependencies: 229
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (article_id, article_title, content, article_url, source_name, publication_date, result_id) FROM stdin;
87	Power to the People: My Time at the Trillion Peso March	“The power of the people is much stronger than the people in power.”\n\n– Wael Ghonim\n\nThe Trillion Peso March was a huge wave of protests that swept across the Philippines on September 21, 2025. People from all walks of life – including church groups, student organizations, labor unions, civic groups, and political movements – came together to speak out against the massive corruption in government flood control projects. What sparked this event were the reports that out of the ₱1.9 trillion supposedly spent on these projects over the past 15 years, more than half may have been pocketed by corrupt officials. The protesters were fed up and wanted answers, demanding accountability for what they saw as a shocking crime in the misuse of public funds.\n\nWhat made the protests even more powerful was the date itself, because September 21 also marks the anniversary of the declaration of Martial Law and is closely tied to the spirit of the EDSA People Power Revolution. For many, marching in the streets on that day wasn’t just about the present corruption scandal; it was also a symbolic act, a way of honoring the country’s history of standing up to abuse of power and fighting for democracy.\n\nReports, infographics, and exposés about the purported corruption in the government’s flood control infrastructure projects were widely circulated on social media and in news outlets in the days preceding the Trillion Peso March. After assembling documents and budget breakdowns, it was discovered that the nation’s flooding issues had not significantly improved despite nearly ₱1.9 trillion being spent on flood control. More than half of that money may have been lost to kickbacks, ghost projects, and overpriced contracts. Public indignation rose over these revelations, which swiftly went viral online and fueled calls for protests across the country.\n\nAccording to reports, an estimated 60,000 souls took to the streets, many of them carrying placards that showcased causes they are passionate about; cameras to document a momentous event; and a burning desire to give justice to all Filipinos.\n\nMy friends (including fellow HAPIsko Kelly Kim Sepida) and I were among those who marched in the Bacolod protests: we walked from Provincial Lagoon to Public Plaza where the event culminated, and where various speakers from different sectors, including the youth, lawyers, transport groups, religious sectors, and various organizations took to the stage and spoke words that all the protesters echoed.\n\nThe Trillion Peso March trended all over social media, showing the power of people coming together to call out injustices and crimes by people in positions of power.\n\nShouting and walking together with other Filipinos from various walks of life is an empowering feeling. It leaves a sense of hope and a spark of change. But the real challenge would be the things that will come after it, after the elation and noise of the protest, what would we do next?\n\nWe have to never forget about the anger, keep ourselves informed about what is happening in these countless hearings and speeches that these accused are preaching about. When the time comes to be present in the streets again, we’ll be much more powerful.	https://hapihumanist.org/2025/10/07/power-to-the-people-my-time-at-the-trillion-peso-march/	hapihumanist.org	\N	21
88	Trillion Peso March rejects corruption, calls for defence of ...	Protesters during the Trillion Peso March on November 30. Photo: RVA News/Ang Pahayagang Plaridel\n\nMANILA (LiCAS News/RVA News): “We are here at the EDSA People Power Monument because we do not want quick fixes. We do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society,” said Pablo Virgilio Cardinal David of Kalookan in remarks after Mass on November 30, addressing thousands who joined the expanded “Trillion Peso March” actions across the country.\n\nCardinal David invoked the legacy of the 1986 EDSA Uprising on Sunday as he defended the decision to gather protesters at the People Power Monument, in Quezon City, saying the movement sought to uphold democratic principles and reject any path toward violent or unconstitutional change.\n\nThe cardinal noted that Luneta was not chosen as the main venue since protesters there have “a call that we do not yet agree with,” adding that the Church-led anti-corruption rally respects other protest groups “who have already come to that call because they are tired of a corrupt system.”\n\nHe observed, “We are tired too. But if it is ‘resign all’ immediately, what is the alternative? What comes after?”\n\nWe do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society Cardinal David\n\nHe said organisers also avoided Mendiola [near Malacañang Palace] because of its history of tension and the presence of groups intent on confrontation.\n\n“We do not want violence and disorder. We are disciples of democracy. Who would not be afraid to go to Mendiola when your companions there are people covering their faces, inciting anger, beating the police, destroying traffic lights, and throwing Molotov cocktails?” he asked.\n\nCardinal David said the protests firmly oppose any push for military intervention, a revolutionary government, a transitional council, or a junta.\n\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions.\n\nThe cardinal also thanked uniformed personnel at the rally for upholding their oaths, noting their presence at EDSA and their assistance to participants. He said the troops demonstrated fidelity to the Constitution and expressed gratitude for their role in defending democratic values.\n\nAdvertisements As we celebrate the 500 years of Christianity in the Philippines. The Chaplaincy to Filipino Migrants organises an on-line talk every Tuesday at 9.00pm. You can join us at: https://www.Facebook.com/CFM-Gifted-to-give-101039001847033\n\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions\n\nFrom this stance, he said the protests aim to restore transparency and strengthen oversight mechanisms that have “failed,” allowing corruption to spread unchecked.\n\nHe noted that pork barrel [discretionary funds] practices declared unconstitutional years ago continue to reappear in the national budget through “hundreds of billions of pesos of flood control and other infrastructure projects,” many of which he described as “ghosts.”\n\nThe cardinal noted, “Those ghosts are very expensive. Ghosts that fatten the pockets of politicians with no shame.”\n\nHe warned that patronage politics and political dynasties continue to entrench inequality, calling them “a very serious cancer” that weakens national life.\n\nCardinal David called on lawmakers to pass long-delayed reforms, including the anti-political dynasty law, the Budget Transparency Act, the Freedom of Information Act, party development reforms, and reviews of the party-list system and Local Government Code.\n\nWe do not want a government that kills. We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist Cardinal David\n\nAddressing the president, Ferdinand Marcos Jr., the cardinal reminded him of his constitutional duty. “You swore to the 1987 Constitution,” he said, adding, alluding to mounting budget controversies, “Because you yourself said it in your State of the Nation Address—have some shame.”\n\nHe called on the president to show full political will in addressing corruption, urging him to continue the effort he began and to allow a fully transparent investigation that would hold wrongdoers accountable based on evidence.\n\nCardinal David also denounced the return of authoritarian impulses and condemned past extrajudicial killings linked to anti-drug operations.\n\n“We do not want a government that kills,” he said. “We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist.”\n\nare starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent Catriona Gray\n\nThe cardinal called on Filipinos to reclaim democratic values and continue the unfinished work of nation-building.\n\n“We dream of a country that is prosperous, peaceful, and fair to all,” he said, “a country united in heart and spirit for the common good.”\n\nSpeaking at the rally, former Miss Universe Catriona Gray, was reported by RVA News warning that “every time we stay quiet, corruption wins” as she urged for cases to be filed over missing public funds.\n\nShe said that Filipinos are “tired of watching corruption steal food from our tables, steal medicines from our hospitals, classrooms from our children, and safety from our communities.”\n\nGray added that what scares her most is that many “are starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent.”\n\nShe asked how many more floods, scandals and stolen funds it would take “before we finally say, enough!”\n\nSome 92,00 people took part in at least 119 peaceful demonstrations across the country, in locations including, Antipolo, Cebu, Metro Manila, Legazpi City, and other locations.\n\n___________________________________________________________________________	https://www.examiner.org.hk/2025/12/05/trillion-peso-march-rejects-corruption-calls-for-defence-of-democracy-demands-change/news/	www.examiner.org.hk	\N	21
89	Thousands march in Philippines, demanding Marcos ...	Claims that President Ferdinand Marcos Jr took kickbacks from infrastructure projects cause outrage in the Philippines.\n\nManila, Philippines – Tens of thousands of people have marched in the Philippine capital, Manila, demanding President Ferdinand Marcos Jr’s resignation over a corruption scandal linked to government spending on flood-control infrastructure.\n\nThe rally, organised by the Kilusang Bayan Kontra-Kurakot or the People’s Movement Against Corruption (KBKK), began at the Luneta National Park in Manila on Sunday, with protesters marching on to the presidential palace.\n\nSome carried an effigy of Marcos and Vice President Sara Duterte, depicting the politicians as crocodiles and dubbed the “corrupt-codile”, while others held signs that read “Marcos Resign” and “All corrupt politicians must be held accountable”.\n\nOrganisers said they estimated the crowd to be more than 20,000.\n\nIt is the last display of public anger over the “Trillion-Peso” scandal, in which powerful politicians, including Marcos’s allies, are accused of pocketing billions of pesos in bribes for contracts on flood-control infrastructure that ended up being defective or were never built at all.\n\nExtensive damage from two recent powerful typhoons, which killed more than 250 people, has spurred public outrage.\n\nTwo cabinet ministers have resigned over the scandal, while a former lawmaker accused in the case, Zaldy Co, has alleged that Marcos directed him to add $1.7bn to the budget for “dubious public works” while he headed an appropriations committee.\n\nThe president has denied the claims.\n\n‘They keep treating us like fools’\n\nAmong those at Sunday’s protest was 21-year-old student Matt Wovi Villanueva, who also took part in a similar protest at the presidential palace in September. That protest turned violent with the police arresting some 300 people.\n\nAdvertisement\n\nVillanueva said he was beaten and detained for five days then.\n\n“Compared to September, we have more reasons to go back to the streets now,” Villanueva told Al Jazeera. “They keep treating us like fools. If we want real justice, we need Marcos and [Vice President Sara] Duterte to resign.”\n\nDuterte, the daughter of former President Rodrigo Duterte, who has fallen out with Marcos, is facing separate allegations over the misuse of government funds.\n\nMeanwhile, mainstream opposition forces, backed by the Catholic Church, organised a separate “Trillion Peso March” along the historic EDSA Avenue. The group said they are only urging Duterte to resign as they wait for more concrete evidence of criminal activity by Marcos.\n\nSome 5,000 people attended that rally.\n\nThe police force said it deployed more than 12,000 officers to Manila for the protests, and barricaded all roads leading to the Malacanang presidential palace with barbed wire and container vans, stopping the KBKK protesters about a block away from its gates.\n\nThe protesters tore down the effigy in front of the barricades, cursing the Marcos government and chanting “Jail all the corrupt!”\n\nEarlier this month, Co, the former lawmaker, claimed that Marcos obtained more than 50 billion pesos ($852m) in kickbacks from infrastructure projects since 2022, and ordered the insertion of 100 billion pesos ($1.7bn) for so-called “ghost projects” in the 2025 budget.\n\nCo also claimed that in 2024 he personally delivered suitcases containing a billion pesos (US$17m) in cash to the Marcos residence.\n\nCo himself is accused of pocketing billions from the same projects and has been a fugitive since July, with Japan being his last known location.\n\n“Anyone can go online and make all kinds of claims,” Marcos said in response. “For it to mean something, he should come home,” the president added.\n\nWith or without Co’s accusations, Raymond Palatino of the Bagong Alyansang Makabayan (New Patriotic Alliance) or Bayan, one of the groups in the KBKK, said the president bears an undeniable responsibility for fraudulent public spending.\n\n“He feigns surprise over the extent of corruption, but he drafted, signed, and implemented the budget, a budget infested with pork barrel projects and anomalous insertions,” Palatino told Al Jazeera.\n\nPalatino called the heavy police presence “overkill” and a “waste of public resources”. He said both Marcos and Duterte must step aside “so the nation can begin to heal and rebuild”.\n\nAdvertisement\n\nFollowing their removal, Palatino urged the formation of a civilian-led transition council, a temporary entity to guide the country towards political renewal.\n\nPresidential press officer Claire Castro, however, has dismissed calls to remove the president, saying they are unconstitutional and come from “vested interests”.\n\n‘Bleeding out credibility’\n\nMarcos raised alarm over the scandal in July, during his State of the Nation address to Congress. In September, he formed the Independent Commission for Infrastructure (ICI) tasked with investigating officials linked to corruption.\n\nSome 9,855 flood-control projects, worth more than 545 billion pesos ($9bn) are under investigation.\n\nThe Senate and House also conducted their own hearings into the case.\n\nFinance Secretary told lawmakers in September that up to 118.5 billion pesos ($2bn) for flood control projects may have been lost to corruption since 2023.\n\nAmong those implicated are Marcos’s cousin and key ally, Martin Romualdez, who has denied any involvement but has stepped down as the House of Representatives speaker.\n\nThe ICI, meanwhile, has yet to look into allegations of misconduct by the president.\n\n“The ICI investigations have not inoculated him from accusations of wrongdoing,” said political science Professor Sol Iglesias from the University of the Philippines.\n\nShe said the “Marcos administration has been bleeding out its credibility” following the September protest and the police crackdown.\n\n“It would stretch the imagination that the president’s hands are clean, although we still haven’t seen the equivalent of a smoking gun,” Iglesias told Al Jazeera.	https://www.aljazeera.com/news/2025/11/30/thousands-rally-in-philippines-demanding-marcos-resign-over-graft-scandal	www.aljazeera.com	\N	21
90	Trillion Peso March | Events	Ateneo, Stand for Truth and Accountability!\n\nAteneo de Manila, through the Mission Integration Cluster, invites all Ateneo students, employees, and alumni to join the\n\nTrillion Peso March Movement\n\nin a peaceful rally against corruption and political dynasties.\n\nDate: Sunday, 30 November 2025\n\nVenue: EDSA People Power Monument\n\nAssembly at Ateneo: 7:15 AM\n\nDeparture from Ateneo: 8:00 AM\n\nAteneo Meeting Point: Zen Garden/Quad, College Complex, Loyola Heights Campus\n\nWear a white shirt; Bring Food and Drink (there may be limited food vendors in the area) and umbrella / hat\n\nSign up here:\n\nhttps://go.ateneo.edu/tpm-nov30-signup (ateneo.edu users)\n\nhttps://go.ateneo.edu/tpm-nov30-signup-alumni (alumni)\n\nA confirmation email will be sent to you upon successful registration.\n\nSign-ups will close on Thursday, 27 November 2025, at 8:00 PM.\n\nLet us continue to live out our Ignatian mission: to be persons for and with others, to speak truth to power, and to stand for justice and accountability.\n\nSama-sama tayong manindigan para sa katotohanan at para sa pananagutan!	http://www.ateneo.edu/events/2025-11-30-trillion-peso-march	www.ateneo.edu	\N	21
91	Google touts Gemini 3's improved reasoning, 'Antigravity' ...	ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.	https://www.abs-cbn.com/news/technology/2025/11/21/google-touts-gemini-3-s-improved-reasoning-antigravity-agentic-coding-capabilities-1611	www.abs-cbn.com	\N	22
94	Trillion Peso March 2.0 ends peacefully; organizers open ...	ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.	https://www.abs-cbn.com/news/nation/2025/11/30/trillion-peso-march-2-0-ends-peacefully-organizers-open-to-possible-part-3-2100	www.abs-cbn.com	\N	25
95	Third Trillion Peso March eyed amid 'tentative' corruption ...	Third Trillion Peso March eyed amid 'tentative' corruption probes\n\nA protester holds a chain linked to an effigy of a crocodile, which represents corrupt officials, during anti-corruption rally along Epifanio de los Santos Avenue, or EDSA, in Quezon City, Metro Manila on November 30, 2025.\n\nMANILA, Philippines (Updated 9:50 a.m.) — Organizers of the second Trillion Peso March on Sunday, November 30, are preparing for a possible third nationwide protest, saying another mobilization is likely if government investigations into the multibillion-peso flood control scandal continue to skirt accountability for senior officials.\n\nKiko Aquino Dee, one of the organizers, said on ANC’s Headstart on Monday, December 1, that the group is “definitely” open to a third mass action if the current pace of the probe remains “tentative” when it comes to high-ranking officials.\n\nDee noted that while cases are expected to be filed before the December deadline, inquiries so far have centered on minor officials and contractors. He cited what he described as inconsistent signals from government on the alleged involvement of Speaker Martin Romualdez.\n\n"Three weeks ago, the president (Ferdinand Marcos Jr) said there was no evidence. Two weeks ago, suddenly there was evidence according to the DPWH. Last week, the ICI seemed to be backtracking," Dee said.\n\n"It’s a little worrisome when it comes to these big fish, the government seems to be tentative as far as their committment to investigating them, so if that sort of attitude continues, then it is right to have the third edition," he added.\n\nOrganizers will need to discuss their next steps but stressed they remain committed to continued mobilizations “for as long as the issue remains unresolved.”\n\nCrowd estimate, protest goals\n\nDee said crowd numbers ranged between 30,000 and 55,000, though organizers still need to reconcile their estimate with the 5,000-person figure cited by the Philippine National Police.\n\nHe added that matching the size of the Iglesia ni Cristo rally at Luneta in early November was never a target, noting that INC has a "significant capacity for mobilization."\n\nAFP/Jam Sta Rosa Protesters take part in an anti-corruption rally along Epifanio de los Santos Avenue, or EDSA, in Quezon City, Metro Manila on November 30, 2025.\n\nThe second Trillion Peso March centered on five demands:\n\nTransparency ("Ilantad ang katotohanan") Forfeiture of stolen funds ("Ibalik ang nakaw na yaman") Jailing the corrupt ("Ikulong ang mga kurakot") Respecting the Constitution, including rejecting any form of military intervention in presidential succession ("Igalang ang Constitution") Ending political dynasties ("Ipanalo ang taong bayan laban sa dinastiya")\n\nDee said the organizers barred no calls for the resignation of President Ferdinand Marcos Jr, Vice President Sara Duterte or both top officials, provided messages remained within constitutional bounds.\n\nInvited participants included opposition lawmakers Rep. Chel Diokno (Akbayan party-list), Rep. Leila de Lima (ML party-list), and Rep. Percy Saldaña (Akbyan). Dee said they deliberately kept senatorial incumbents, who already have their own platforms as politicians, from dominating the stage.\n\nOn the main stage, Miss Universe 2018 Catriona Gray, who is among the top taxpayers listed by the Bureau of Internal Revenue, addressed protesters, saying she fears the public's concerns will soon be forgetten.\n\nFormer chief justice Maria Lourdes Sereno, as a leading evangelic figure, led the interfaith prayer. Catholic bishops conference head Cardinal Pablo Virgilio David called for fast-tracked cases, while Cubao Bishop Elias Ayuban hoped that the Advent season would serve as a "massive wake-up call" for political leaders not to compromise on the nation's future.\n\nFormer vice president Leni Robredo joined mobilizations in Naga as part of her duties as mayor. — Camille Diola	https://www.philstar.com/headlines/2025/12/01/2491131/third-trillion-peso-march-eyed-amid-tentative-corruption-probes	www.philstar.com	\N	25
96	End political dynasties, say protesters at second Trillion ...	This is AI generated summarization, which may have errors. For context, always refer to the full article.\n\nMARCH. Members of various civil society and religious groups walk under the intense heat as they participate in the 2nd Trillion Peso March movement from the EDSA Shrine to the People Power Monument in Quezon City on Sunday, November 30, 2025.\n\nAside from calling for an end to political dynasties, the groups also want the government to strengthen the powers of the independent commission investigating the flood control and infrastructure projects\n\nMANILA, Philippines – The Trillion Peso March Movement gathered for the second time at the People Power Monument in Quezon City on Sunday, November 30, with a call to end political dynasties.\n\nSeveral groups marched from the EDSA Shrine to the People Power Monument to stage the protest, which coincided with the 162nd birth anniversary of Philippine hero Andres Bonifacio.\n\nProtesters reiterated their appeal to hold accountable the government officials involved in anomalous flood control projects and further demanded to stop political dynasties.\n\nPlay Video\n\n“Sa lalong madaling panahon, inaasahan natin na dapat panindigan din ng gobyerno na kanilang i-certify as urgent ang ating anti-political dynasty bill. Alam naman nating itong korapsyon, mahigpit ang pagkatali sa usapin ng mga dynasty sa Pilipinas,” Akbayan Representative Perci Cendana said.\n\n(We expect that the government will certify the anti-political dynasty bill as urgent as soon as possible. We know that corruption is tightly tied to the issue of dynasties in the Philippines.)\n\n“Pinakamalaki sigurong utang nito (government), ‘yung utang nila sa anti-political dynasty bill. Papayag ba tayo na hindi maisasabatas ‘yan? Sisingilin at sisingilin natin ang mga ‘yan hanggang bayaran nila ang utang nila sa sambayanang Pilipino,” Akbayan Representative Chel Diokno said.\n\n(The government’s largest debt is the anti-political dynasty bill. Will we allow that it would not be passed into a law? We will not stop charging them until they pay their debts to the Filipino people.)\n\nCatholic priest Fr. Flavie Villanueva, who also shared the same appeal, said their call grew louder as almost all dioceses in the country were with him.\n\n“Panawagan natin: Patuloy paigtingin ang paghahanap ng katotohanan; ikulong ang lahat ng korap; ibalik ang salapi; patuloy ipasa at ipatupad ang anti-dynasty law; at pinakamahalaga para sa’kin, ibalik natin ‘yung dangal bilang Pilipino,” Villanueva said.\n\n(Our appeal: Continue strengthening the search for truth; jail the corrupt; pass and implement the anti-dynasty bill; and the most important for me, restore our dignity as a Filipino.)\n\nAside from calling for an end to political dynasties, the groups also wants the government to strengthen the powers of the independent commission investigating flood control and infrastructure projects.\n\nA bill on the creation of an Independent Commission Against Infrastructure Corruption (ICAIC) has been filed at the House of Representatives as the authors noted the lack of power in the executive-formed Independent Commission for Infrastructure (ICI).\n\n“Itutulad n’yo ba ‘yan (ICAIC bill) sa anti-dynasty na inabot ng ilang dekada? Walang dahilan para patagalin pa ang mga batas na ‘yan pwera na lang kung kayo mismo ang may ayaw at natatakot na maisabatas ang mga ‘yan. Hindi lalabas ang katotohanan kung patago ang mga galawan, kung patingi-tingi ang diskarte,” Mamamayang Liberal Representative Leila de Lima, one of the ICAIC bill authors, said.\n\n(Are you putting the ICAIC bill in the same fate as that of the anti-dynasty bill which reached decades? There is no reason to prolong the enactment into law of those bills, except if you do not like or are scared of those. The truth will not come out if the actions are hidden, if the strategy is slow.)\n\n“The current ICI can continue doing its work but it’s important the mandate no longer comes from the president but from Congress, so it can act independently,” said Kiko Dee, political scientist and co-organizer of the Trillion Peso March.\n\nWhile the public see “positive steps” against alleged corrupt officials, Dee said they will continue mounting protests until Filipinos achieve justice.\n\nThe first Trillion Peso March was held on September 21, the anniversary of the late dictator Ferdinand Marcos Sr.’s declaration of martial law. – Rappler.com	https://www.rappler.com/philippines/end-political-dynasties-trillion-peso-march-november-2025/	www.rappler.com	\N	25
\.


--
-- TOC entry 5012 (class 0 OID 16463)
-- Dependencies: 227
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, search_id, entity_text, entity_label) FROM stdin;
75	30	march	SEARCH_KEYWORD
76	30	peso	SEARCH_KEYWORD
\.


--
-- TOC entry 5008 (class 0 OID 16433)
-- Dependencies: 223
-- Data for Name: conversationHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."conversationHistory" (chat_id, user_id, query_text, response_text, "timestamp", search_id) FROM stdin;
12382	32	Trillion Peso March	Response\n⚠️ Summarized from unverified sources: In the Phi...\nSummary:\n\n⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors.\n\nSource Coverage\nundefined/10\n\n❌ No verified sources found	2025-12-07 19:11:06.789859	\N
12384	32	What is the lates GeminiAPI model?	Response\nSummarized from verified sources: ⚠️ Failed to ge...\nSummary:\n\nSummarized from verified sources: ⚠️ Failed to generate summary due to technical error.\n\nSource Coverage\nundefined/10\n\nSource coverage based on article count	2025-12-07 19:13:30.572239	\N
12385	32	Trillion Peso March	Response\n\nResponse ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 19:13:30.572239	\N
12420	32	What is the lates GeminiAPI model?	Response\n\nResponse Response Response Summarized from verified sources: ⚠️ Failed to ge... Summary: Summarized from verified sources: ⚠️ Failed to generate summary due to technical error. Source Coverage undefined/10 Source coverage based on article count	2025-12-07 20:25:13.755645	\N
12387	32	Latest Gemini API model	Response\nLatest Gemini API model\nSummary:\n\nSummarized from verified sources: ⚠️ Failed to generate summary due to technical error.\n\nSource Coverage\n1/10\n\n1 verified source found\n\n1 verified source analyzed	2025-12-07 19:15:34.972121	\N
12421	32	Trillion Peso March	Response\n\nResponse Response Response Response ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 20:25:13.755645	\N
12422	32	Can gemini 3 scrape contents inside?	Response\n\nResponse Response The context confirms that the latest model, **Gemini 3 Pro**, features comprehensive multimodal understanding, enabling it to process various input types including Text, Image, Video, Audio, and **PDF inputs**. While the context does not specifically use the term "scrape" or confirm general web browsing capabilities, the ability to accept and process PDF documents indicates the model can access and process contents stored *inside* files. These capabilities, optimized for "complex agentic workflows," were reported by the source "Google touts Gemini 3's improved reasoning..."	2025-12-07 20:25:13.755645	\N
12423	32	But can it snoop in some other websites?	Response\n\nResponse Response The provided stored summary describes the core features and input modalities of the latest model, **Gemini 3 Pro**, but does not specify its ability to browse or access external websites (i.e., "snoop in some other websites"). The context, which references the article "Google touts Gemini 3's improved reasoning," confirms that the model is optimized for complex workflows and accepts inputs including Text, Image, Video, Audio, and PDF. However, information regarding whether Gemini 3 Pro has real-time web-browsing capabilities or can retrieve external data is not detailed here. If you need to verify its internet access features, please rerun a fresh search.	2025-12-07 20:25:13.755645	\N
12424	32	Oh okay, can you list down some of the important key features of Gemini 3 in bulleted?	Response\n\nResponse Response Based on the summary compiled from verified sources, including the article "Google touts Gemini 3's improved reasoning...", the Gemini 3 Pro model—the latest version available via the API—is presented with several key features: * **Advanced Reasoning:** Categorized as Google’s "latest reasoning-first model" with state-of-the-art reasoning capabilities. * **Comprehensive Multimodality:** Features comprehensive multimodal understanding, accepting Text, Image, Video, Audio, and PDF inputs. * **Workflow Optimization:** Specifically optimized for handling complex agentic workflows and autonomous coding tasks. * **Large Context Window:** Supports a massive context window, handling up to 1,048,576 input tokens. * **Image Capabilities:** A corresponding version, Gemini 3 Pro Image, is available for high-fidelity image generation and complex image editing.	2025-12-07 20:25:13.755645	\N
12399	32	Trillion Peso March 2025	The sources do not confirm the specific claim. They mention related topics but not the exact information requested.\n\nThe search results verify details regarding the *second* "Trillion Peso March," which occurred on November 30, 2025. Organizers of this anti-corruption rally expressed openness to a *third* mass action should government investigations fail to hold senior officials accountable for alleged corruption.\n\nAlthough the sources confirm discussions about planning a future (third) protest following the November 2025 event, neither source provides any information, scheduling, or discussion related to a "Trillion Peso March" specifically dated or planned for March 2025.	2025-12-07 19:47:58.8534	30
12400	32	Latest Gemini API model	Response\nSummarized from verified sources: The sources con...\nSummary:\n\nSummarized from verified sources: The sources confirm the specific claim by identifying the newest generation model available through the API. The latest model available through the Gemini API is **Gemini 3 Pro**. This model is presented as the highest version currently released, categorized as Google’s "most intelligent model" and "latest reasoning-first model." Gemini 3 Pro is currently accessible as a preview model, identified by the code `gemini-3-pro-preview`. Key features include state-of-the-art reasoning, comprehensive multimodal understanding (accepting Text, Image, Video, Audio, and PDF inputs), and optimization for complex agentic workflows and autonomous coding tasks. It features a large context window, supporting up to 1,048,576 input tokens. A corresponding multimodal version, Gemini 3 Pro Image, is also available in preview, offering high-fidelity image generation and complex image editing capabilities.\n\nSource Coverage\n1/10\n\n1 verified sources found out of 10	2025-12-07 19:54:30.081658	\N
12401	32	Can gemini 3 scrape contents inside?	Response\n\nThe context confirms that the latest model, **Gemini 3 Pro**, features comprehensive multimodal understanding, enabling it to process various input types including Text, Image, Video, Audio, and **PDF inputs**. While the context does not specifically use the term "scrape" or confirm general web browsing capabilities, the ability to accept and process PDF documents indicates the model can access and process contents stored *inside* files. These capabilities, optimized for "complex agentic workflows," were reported by the source "Google touts Gemini 3's improved reasoning..."	2025-12-07 19:54:30.081658	\N
12402	32	But can it snoop in some other websites?	Response\n\nThe provided stored summary describes the core features and input modalities of the latest model, **Gemini 3 Pro**, but does not specify its ability to browse or access external websites (i.e., "snoop in some other websites"). The context, which references the article "Google touts Gemini 3's improved reasoning," confirms that the model is optimized for complex workflows and accepts inputs including Text, Image, Video, Audio, and PDF. However, information regarding whether Gemini 3 Pro has real-time web-browsing capabilities or can retrieve external data is not detailed here. If you need to verify its internet access features, please rerun a fresh search.	2025-12-07 19:54:30.081658	\N
12403	32	Oh okay, can you list down some of the important key features of Gemini 3 in bulleted?	Response\n\nBased on the summary compiled from verified sources, including the article "Google touts Gemini 3's improved reasoning...", the Gemini 3 Pro model—the latest version available via the API—is presented with several key features: * **Advanced Reasoning:** Categorized as Google’s "latest reasoning-first model" with state-of-the-art reasoning capabilities. * **Comprehensive Multimodality:** Features comprehensive multimodal understanding, accepting Text, Image, Video, Audio, and PDF inputs. * **Workflow Optimization:** Specifically optimized for handling complex agentic workflows and autonomous coding tasks. * **Large Context Window:** Supports a massive context window, handling up to 1,048,576 input tokens. * **Image Capabilities:** A corresponding version, Gemini 3 Pro Image, is available for high-fidelity image generation and complex image editing.	2025-12-07 19:54:30.081658	\N
12404	32	Trillion Peso March	Response\n\nResponse Response ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 19:54:30.081658	\N
12405	32	What is the lates GeminiAPI model?	Response\n\nResponse Response Summarized from verified sources: ⚠️ Failed to ge... Summary: Summarized from verified sources: ⚠️ Failed to generate summary due to technical error. Source Coverage undefined/10 Source coverage based on article count	2025-12-07 19:54:30.081658	\N
12406	32	Trillion Peso March	Response\n\nResponse Response Response ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 19:54:30.081658	\N
12407	32	Can gemini 3 scrape contents inside?	Response\n\nResponse The context confirms that the latest model, **Gemini 3 Pro**, features comprehensive multimodal understanding, enabling it to process various input types including Text, Image, Video, Audio, and **PDF inputs**. While the context does not specifically use the term "scrape" or confirm general web browsing capabilities, the ability to accept and process PDF documents indicates the model can access and process contents stored *inside* files. These capabilities, optimized for "complex agentic workflows," were reported by the source "Google touts Gemini 3's improved reasoning..."	2025-12-07 19:54:30.081658	\N
12408	32	But can it snoop in some other websites?	Response\n\nResponse The provided stored summary describes the core features and input modalities of the latest model, **Gemini 3 Pro**, but does not specify its ability to browse or access external websites (i.e., "snoop in some other websites"). The context, which references the article "Google touts Gemini 3's improved reasoning," confirms that the model is optimized for complex workflows and accepts inputs including Text, Image, Video, Audio, and PDF. However, information regarding whether Gemini 3 Pro has real-time web-browsing capabilities or can retrieve external data is not detailed here. If you need to verify its internet access features, please rerun a fresh search.	2025-12-07 19:54:30.081658	\N
12409	32	Oh okay, can you list down some of the important key features of Gemini 3 in bulleted?	Response\n\nResponse Based on the summary compiled from verified sources, including the article "Google touts Gemini 3's improved reasoning...", the Gemini 3 Pro model—the latest version available via the API—is presented with several key features: * **Advanced Reasoning:** Categorized as Google’s "latest reasoning-first model" with state-of-the-art reasoning capabilities. * **Comprehensive Multimodality:** Features comprehensive multimodal understanding, accepting Text, Image, Video, Audio, and PDF inputs. * **Workflow Optimization:** Specifically optimized for handling complex agentic workflows and autonomous coding tasks. * **Large Context Window:** Supports a massive context window, handling up to 1,048,576 input tokens. * **Image Capabilities:** A corresponding version, Gemini 3 Pro Image, is available for high-fidelity image generation and complex image editing.	2025-12-07 19:54:30.081658	\N
12410	32	Trillion Peso March 2025	Response\nThe sources do not confirm the specific claim. The...\nSummary:\n\nThe sources do not confirm the specific claim. They mention related topics but not the exact information requested. The search results verify details regarding the *second* "Trillion Peso March," which occurred on November 30, 2025. Organizers of this anti-corruption rally expressed openness to a *third* mass action should government investigations fail to hold senior officials accountable for alleged corruption. Although the sources confirm discussions about planning a future (third) protest following the November 2025 event, neither source provides any information, scheduling, or discussion related to a "Trillion Peso March" specifically dated or planned for March 2025.\n\nSource Coverage\n3/10\n\n3 verified sources found\n\nSource coverage analysis	2025-12-07 20:25:13.755645	\N
12411	32	Trillion Peso March	Response\n\nResponse ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 20:25:13.755645	\N
12412	32	What is the lates GeminiAPI model?	Response\n\nResponse Summarized from verified sources: ⚠️ Failed to ge... Summary: Summarized from verified sources: ⚠️ Failed to generate summary due to technical error. Source Coverage undefined/10 Source coverage based on article count	2025-12-07 20:25:13.755645	\N
12413	32	Trillion Peso March	Response\n\nResponse Response ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 20:25:13.755645	\N
12414	32	Latest Gemini API model	Response\n\nResponse Latest Gemini API model Summary: Summarized from verified sources: ⚠️ Failed to generate summary due to technical error. Source Coverage 1/10 1 verified source found 1 verified source analyzed	2025-12-07 20:25:13.755645	\N
12415	32	Latest Gemini API model	Response\n\nResponse Summarized from verified sources: The sources con... Summary: Summarized from verified sources: The sources confirm the specific claim by identifying the newest generation model available through the API. The latest model available through the Gemini API is **Gemini 3 Pro**. This model is presented as the highest version currently released, categorized as Google’s "most intelligent model" and "latest reasoning-first model." Gemini 3 Pro is currently accessible as a preview model, identified by the code `gemini-3-pro-preview`. Key features include state-of-the-art reasoning, comprehensive multimodal understanding (accepting Text, Image, Video, Audio, and PDF inputs), and optimization for complex agentic workflows and autonomous coding tasks. It features a large context window, supporting up to 1,048,576 input tokens. A corresponding multimodal version, Gemini 3 Pro Image, is also available in preview, offering high-fidelity image generation and complex image editing capabilities. Source Coverage 1/10 1 verified sources found out of 10	2025-12-07 20:25:13.755645	\N
12416	32	Can gemini 3 scrape contents inside?	Response\n\nResponse The context confirms that the latest model, **Gemini 3 Pro**, features comprehensive multimodal understanding, enabling it to process various input types including Text, Image, Video, Audio, and **PDF inputs**. While the context does not specifically use the term "scrape" or confirm general web browsing capabilities, the ability to accept and process PDF documents indicates the model can access and process contents stored *inside* files. These capabilities, optimized for "complex agentic workflows," were reported by the source "Google touts Gemini 3's improved reasoning..."	2025-12-07 20:25:13.755645	\N
12417	32	But can it snoop in some other websites?	Response\n\nResponse The provided stored summary describes the core features and input modalities of the latest model, **Gemini 3 Pro**, but does not specify its ability to browse or access external websites (i.e., "snoop in some other websites"). The context, which references the article "Google touts Gemini 3's improved reasoning," confirms that the model is optimized for complex workflows and accepts inputs including Text, Image, Video, Audio, and PDF. However, information regarding whether Gemini 3 Pro has real-time web-browsing capabilities or can retrieve external data is not detailed here. If you need to verify its internet access features, please rerun a fresh search.	2025-12-07 20:25:13.755645	\N
12418	32	Oh okay, can you list down some of the important key features of Gemini 3 in bulleted?	Response\n\nResponse Based on the summary compiled from verified sources, including the article "Google touts Gemini 3's improved reasoning...", the Gemini 3 Pro model—the latest version available via the API—is presented with several key features: * **Advanced Reasoning:** Categorized as Google’s "latest reasoning-first model" with state-of-the-art reasoning capabilities. * **Comprehensive Multimodality:** Features comprehensive multimodal understanding, accepting Text, Image, Video, Audio, and PDF inputs. * **Workflow Optimization:** Specifically optimized for handling complex agentic workflows and autonomous coding tasks. * **Large Context Window:** Supports a massive context window, handling up to 1,048,576 input tokens. * **Image Capabilities:** A corresponding version, Gemini 3 Pro Image, is available for high-fidelity image generation and complex image editing.	2025-12-07 20:25:13.755645	\N
12419	32	Trillion Peso March	Response\n\nResponse Response Response ⚠️ Summarized from unverified sources: In the Phi... Summary: ⚠️ Summarized from unverified sources: In the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors. Source Coverage undefined/10 ❌ No verified sources found	2025-12-07 20:25:13.755645	\N
\.


--
-- TOC entry 5004 (class 0 OID 16399)
-- Dependencies: 219
-- Data for Name: search_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_results (result_id, query, results, created_at) FROM stdin;
21	Trillion Peso March	[{"url": "https://hapihumanist.org/2025/10/07/power-to-the-people-my-time-at-the-trillion-peso-march/", "title": "Power to the People: My Time at the Trillion Peso March", "content": "“The power of the people is much stronger than the people in power.”\\n\\n– Wael Ghonim\\n\\nThe Trillion Peso March was a huge wave of protests that swept across the Philippines on September 21, 2025. People from all walks of life – including church groups, student organizations, labor unions, civic groups, and political movements – came together to speak out against the massive corruption in government flood control projects. What sparked this event were the reports that out of the ₱1.9 trillion supposedly spent on these projects over the past 15 years, more than half may have been pocketed by corrupt officials. The protesters were fed up and wanted answers, demanding accountability for what they saw as a shocking crime in the misuse of public funds.\\n\\nWhat made the protests even more powerful was the date itself, because September 21 also marks the anniversary of the declaration of Martial Law and is closely tied to the spirit of the EDSA People Power Revolution. For many, marching in the streets on that day wasn’t just about the present corruption scandal; it was also a symbolic act, a way of honoring the country’s history of standing up to abuse of power and fighting for democracy.\\n\\nReports, infographics, and exposés about the purported corruption in the government’s flood control infrastructure projects were widely circulated on social media and in news outlets in the days preceding the Trillion Peso March. After assembling documents and budget breakdowns, it was discovered that the nation’s flooding issues had not significantly improved despite nearly ₱1.9 trillion being spent on flood control. More than half of that money may have been lost to kickbacks, ghost projects, and overpriced contracts. Public indignation rose over these revelations, which swiftly went viral online and fueled calls for protests across the country.\\n\\nAccording to reports, an estimated 60,000 souls took to the streets, many of them carrying placards that showcased causes they are passionate about; cameras to document a momentous event; and a burning desire to give justice to all Filipinos.\\n\\nMy friends (including fellow HAPIsko Kelly Kim Sepida) and I were among those who marched in the Bacolod protests: we walked from Provincial Lagoon to Public Plaza where the event culminated, and where various speakers from different sectors, including the youth, lawyers, transport groups, religious sectors, and various organizations took to the stage and spoke words that all the protesters echoed.\\n\\nThe Trillion Peso March trended all over social media, showing the power of people coming together to call out injustices and crimes by people in positions of power.\\n\\nShouting and walking together with other Filipinos from various walks of life is an empowering feeling. It leaves a sense of hope and a spark of change. But the real challenge would be the things that will come after it, after the elation and noise of the protest, what would we do next?\\n\\nWe have to never forget about the anger, keep ourselves informed about what is happening in these countless hearings and speeches that these accused are preaching about. When the time comes to be present in the streets again, we’ll be much more powerful.", "entities": [["Wael Ghonim", "PERSON"], ["March", "DATE"], ["Philippines", "GPE"], ["September 21, 2025", "DATE"], ["₱1.9 trillion", "MONEY"], ["the past 15 years", "DATE"], ["more than half", "CARDINAL"], ["September 21", "DATE"], ["Martial Law", "PERSON"], ["the EDSA People Power Revolution", "ORG"], ["that day", "DATE"], ["the days", "DATE"], ["the Trillion Peso", "ORG"], ["March", "DATE"], ["More than half", "CARDINAL"], ["an estimated 60,000", "CARDINAL"], ["Filipinos", "NORP"], ["Kelly Kim Sepida", "PERSON"], ["Bacolod", "ORG"], ["Provincial Lagoon", "FAC"], ["The Trillion Peso", "ORG"], ["March", "DATE"], ["Filipinos", "NORP"]], "verified": false, "is_trusted": false}, {"url": "https://www.examiner.org.hk/2025/12/05/trillion-peso-march-rejects-corruption-calls-for-defence-of-democracy-demands-change/news/", "title": "Trillion Peso March rejects corruption, calls for defence of ...", "content": "Protesters during the Trillion Peso March on November 30. Photo: RVA News/Ang Pahayagang Plaridel\\n\\nMANILA (LiCAS News/RVA News): “We are here at the EDSA People Power Monument because we do not want quick fixes. We do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society,” said Pablo Virgilio Cardinal David of Kalookan in remarks after Mass on November 30, addressing thousands who joined the expanded “Trillion Peso March” actions across the country.\\n\\nCardinal David invoked the legacy of the 1986 EDSA Uprising on Sunday as he defended the decision to gather protesters at the People Power Monument, in Quezon City, saying the movement sought to uphold democratic principles and reject any path toward violent or unconstitutional change.\\n\\nThe cardinal noted that Luneta was not chosen as the main venue since protesters there have “a call that we do not yet agree with,” adding that the Church-led anti-corruption rally respects other protest groups “who have already come to that call because they are tired of a corrupt system.”\\n\\nHe observed, “We are tired too. But if it is ‘resign all’ immediately, what is the alternative? What comes after?”\\n\\nWe do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society Cardinal David\\n\\nHe said organisers also avoided Mendiola [near Malacañang Palace] because of its history of tension and the presence of groups intent on confrontation.\\n\\n“We do not want violence and disorder. We are disciples of democracy. Who would not be afraid to go to Mendiola when your companions there are people covering their faces, inciting anger, beating the police, destroying traffic lights, and throwing Molotov cocktails?” he asked.\\n\\nCardinal David said the protests firmly oppose any push for military intervention, a revolutionary government, a transitional council, or a junta.\\n\\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions.\\n\\nThe cardinal also thanked uniformed personnel at the rally for upholding their oaths, noting their presence at EDSA and their assistance to participants. He said the troops demonstrated fidelity to the Constitution and expressed gratitude for their role in defending democratic values.\\n\\nAdvertisements As we celebrate the 500 years of Christianity in the Philippines. The Chaplaincy to Filipino Migrants organises an on-line talk every Tuesday at 9.00pm. You can join us at: https://www.Facebook.com/CFM-Gifted-to-give-101039001847033\\n\\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions\\n\\nFrom this stance, he said the protests aim to restore transparency and strengthen oversight mechanisms that have “failed,” allowing corruption to spread unchecked.\\n\\nHe noted that pork barrel [discretionary funds] practices declared unconstitutional years ago continue to reappear in the national budget through “hundreds of billions of pesos of flood control and other infrastructure projects,” many of which he described as “ghosts.”\\n\\nThe cardinal noted, “Those ghosts are very expensive. Ghosts that fatten the pockets of politicians with no shame.”\\n\\nHe warned that patronage politics and political dynasties continue to entrench inequality, calling them “a very serious cancer” that weakens national life.\\n\\nCardinal David called on lawmakers to pass long-delayed reforms, including the anti-political dynasty law, the Budget Transparency Act, the Freedom of Information Act, party development reforms, and reviews of the party-list system and Local Government Code.\\n\\nWe do not want a government that kills. We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist Cardinal David\\n\\nAddressing the president, Ferdinand Marcos Jr., the cardinal reminded him of his constitutional duty. “You swore to the 1987 Constitution,” he said, adding, alluding to mounting budget controversies, “Because you yourself said it in your State of the Nation Address—have some shame.”\\n\\nHe called on the president to show full political will in addressing corruption, urging him to continue the effort he began and to allow a fully transparent investigation that would hold wrongdoers accountable based on evidence.\\n\\nCardinal David also denounced the return of authoritarian impulses and condemned past extrajudicial killings linked to anti-drug operations.\\n\\n“We do not want a government that kills,” he said. “We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist.”\\n\\nare starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent Catriona Gray\\n\\nThe cardinal called on Filipinos to reclaim democratic values and continue the unfinished work of nation-building.\\n\\n“We dream of a country that is prosperous, peaceful, and fair to all,” he said, “a country united in heart and spirit for the common good.”\\n\\nSpeaking at the rally, former Miss Universe Catriona Gray, was reported by RVA News warning that “every time we stay quiet, corruption wins” as she urged for cases to be filed over missing public funds.\\n\\nShe said that Filipinos are “tired of watching corruption steal food from our tables, steal medicines from our hospitals, classrooms from our children, and safety from our communities.”\\n\\nGray added that what scares her most is that many “are starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent.”\\n\\nShe asked how many more floods, scandals and stolen funds it would take “before we finally say, enough!”\\n\\nSome 92,00 people took part in at least 119 peaceful demonstrations across the country, in locations including, Antipolo, Cebu, Metro Manila, Legazpi City, and other locations.\\n\\n___________________________________________________________________________", "entities": [["the Trillion Peso", "FAC"], ["March", "DATE"], ["November 30", "DATE"], ["RVA News/Ang Pahayagang Plaridel", "ORG"], ["the EDSA People Power Monument", "ORG"], ["Kalookan", "NORP"], ["November 30", "DATE"], ["thousands", "CARDINAL"], ["Trillion Peso", "WORK_OF_ART"], ["March", "DATE"], ["David", "PERSON"], ["1986", "DATE"], ["EDSA Uprising", "ORG"], ["Sunday", "DATE"], ["the People Power Monument", "ORG"], ["Quezon City", "GPE"], ["Luneta", "PERSON"], ["Church", "ORG"], ["Mendiola", "ORG"], ["Malacañang Palace", "FAC"], ["Mendiola", "ORG"], ["Cardinal David", "PERSON"], ["Church", "ORG"], ["EDSA", "ORG"], ["Constitution", "LAW"], ["the 500 years", "DATE"], ["Christianity", "NORP"], ["Philippines", "GPE"], ["Filipino", "LANGUAGE"], ["9.00pm", "CARDINAL"], ["Church", "ORG"], ["years ago", "DATE"], ["hundreds of billions", "MONEY"], ["David", "PERSON"], ["the Budget Transparency Act", "LAW"], ["the Freedom of Information Act", "LAW"], ["Local Government Code", "ORG"], ["Cardinal David", "PERSON"], ["Ferdinand Marcos Jr.", "PERSON"], ["the 1987 Constitution", "EVENT"], ["the Nation Address", "ORG"], ["Cardinal David", "PERSON"], ["Catriona Gray", "PERSON"], ["Filipinos", "NORP"], ["democratic", "NORP"], ["Universe", "PERSON"], ["Catriona Gray", "PERSON"], ["RVA News", "ORG"], ["Filipinos", "NORP"], ["at least 119", "CARDINAL"], ["Antipolo", "GPE"], ["Cebu", "GPE"], ["Legazpi City", "GPE"]], "verified": false, "is_trusted": false}, {"url": "https://www.aljazeera.com/news/2025/11/30/thousands-rally-in-philippines-demanding-marcos-resign-over-graft-scandal", "title": "Thousands march in Philippines, demanding Marcos ...", "content": "Claims that President Ferdinand Marcos Jr took kickbacks from infrastructure projects cause outrage in the Philippines.\\n\\nManila, Philippines – Tens of thousands of people have marched in the Philippine capital, Manila, demanding President Ferdinand Marcos Jr’s resignation over a corruption scandal linked to government spending on flood-control infrastructure.\\n\\nThe rally, organised by the Kilusang Bayan Kontra-Kurakot or the People’s Movement Against Corruption (KBKK), began at the Luneta National Park in Manila on Sunday, with protesters marching on to the presidential palace.\\n\\nSome carried an effigy of Marcos and Vice President Sara Duterte, depicting the politicians as crocodiles and dubbed the “corrupt-codile”, while others held signs that read “Marcos Resign” and “All corrupt politicians must be held accountable”.\\n\\nOrganisers said they estimated the crowd to be more than 20,000.\\n\\nIt is the last display of public anger over the “Trillion-Peso” scandal, in which powerful politicians, including Marcos’s allies, are accused of pocketing billions of pesos in bribes for contracts on flood-control infrastructure that ended up being defective or were never built at all.\\n\\nExtensive damage from two recent powerful typhoons, which killed more than 250 people, has spurred public outrage.\\n\\nTwo cabinet ministers have resigned over the scandal, while a former lawmaker accused in the case, Zaldy Co, has alleged that Marcos directed him to add $1.7bn to the budget for “dubious public works” while he headed an appropriations committee.\\n\\nThe president has denied the claims.\\n\\n‘They keep treating us like fools’\\n\\nAmong those at Sunday’s protest was 21-year-old student Matt Wovi Villanueva, who also took part in a similar protest at the presidential palace in September. That protest turned violent with the police arresting some 300 people.\\n\\nAdvertisement\\n\\nVillanueva said he was beaten and detained for five days then.\\n\\n“Compared to September, we have more reasons to go back to the streets now,” Villanueva told Al Jazeera. “They keep treating us like fools. If we want real justice, we need Marcos and [Vice President Sara] Duterte to resign.”\\n\\nDuterte, the daughter of former President Rodrigo Duterte, who has fallen out with Marcos, is facing separate allegations over the misuse of government funds.\\n\\nMeanwhile, mainstream opposition forces, backed by the Catholic Church, organised a separate “Trillion Peso March” along the historic EDSA Avenue. The group said they are only urging Duterte to resign as they wait for more concrete evidence of criminal activity by Marcos.\\n\\nSome 5,000 people attended that rally.\\n\\nThe police force said it deployed more than 12,000 officers to Manila for the protests, and barricaded all roads leading to the Malacanang presidential palace with barbed wire and container vans, stopping the KBKK protesters about a block away from its gates.\\n\\nThe protesters tore down the effigy in front of the barricades, cursing the Marcos government and chanting “Jail all the corrupt!”\\n\\nEarlier this month, Co, the former lawmaker, claimed that Marcos obtained more than 50 billion pesos ($852m) in kickbacks from infrastructure projects since 2022, and ordered the insertion of 100 billion pesos ($1.7bn) for so-called “ghost projects” in the 2025 budget.\\n\\nCo also claimed that in 2024 he personally delivered suitcases containing a billion pesos (US$17m) in cash to the Marcos residence.\\n\\nCo himself is accused of pocketing billions from the same projects and has been a fugitive since July, with Japan being his last known location.\\n\\n“Anyone can go online and make all kinds of claims,” Marcos said in response. “For it to mean something, he should come home,” the president added.\\n\\nWith or without Co’s accusations, Raymond Palatino of the Bagong Alyansang Makabayan (New Patriotic Alliance) or Bayan, one of the groups in the KBKK, said the president bears an undeniable responsibility for fraudulent public spending.\\n\\n“He feigns surprise over the extent of corruption, but he drafted, signed, and implemented the budget, a budget infested with pork barrel projects and anomalous insertions,” Palatino told Al Jazeera.\\n\\nPalatino called the heavy police presence “overkill” and a “waste of public resources”. He said both Marcos and Duterte must step aside “so the nation can begin to heal and rebuild”.\\n\\nAdvertisement\\n\\nFollowing their removal, Palatino urged the formation of a civilian-led transition council, a temporary entity to guide the country towards political renewal.\\n\\nPresidential press officer Claire Castro, however, has dismissed calls to remove the president, saying they are unconstitutional and come from “vested interests”.\\n\\n‘Bleeding out credibility’\\n\\nMarcos raised alarm over the scandal in July, during his State of the Nation address to Congress. In September, he formed the Independent Commission for Infrastructure (ICI) tasked with investigating officials linked to corruption.\\n\\nSome 9,855 flood-control projects, worth more than 545 billion pesos ($9bn) are under investigation.\\n\\nThe Senate and House also conducted their own hearings into the case.\\n\\nFinance Secretary told lawmakers in September that up to 118.5 billion pesos ($2bn) for flood control projects may have been lost to corruption since 2023.\\n\\nAmong those implicated are Marcos’s cousin and key ally, Martin Romualdez, who has denied any involvement but has stepped down as the House of Representatives speaker.\\n\\nThe ICI, meanwhile, has yet to look into allegations of misconduct by the president.\\n\\n“The ICI investigations have not inoculated him from accusations of wrongdoing,” said political science Professor Sol Iglesias from the University of the Philippines.\\n\\nShe said the “Marcos administration has been bleeding out its credibility” following the September protest and the police crackdown.\\n\\n“It would stretch the imagination that the president’s hands are clean, although we still haven’t seen the equivalent of a smoking gun,” Iglesias told Al Jazeera.", "entities": [["Ferdinand Marcos Jr", "PERSON"], ["Philippines", "GPE"], ["Manila", "GPE"], ["Philippines", "GPE"], ["Tens of thousands", "CARDINAL"], ["Philippine", "NORP"], ["Manila", "GPE"], ["Ferdinand Marcos Jr’s", "PERSON"], ["the Kilusang Bayan Kontra-Kurakot", "ORG"], ["the People’s Movement Against Corruption", "ORG"], ["KBKK", "ORG"], ["the Luneta National Park", "FAC"], ["Manila", "GPE"], ["Sunday", "DATE"], ["Marcos", "PERSON"], ["Sara Duterte", "PERSON"], ["Marcos Resign", "WORK_OF_ART"], ["more than 20,000", "CARDINAL"], ["the “Trillion-Peso", "ORG"], ["Marcos", "PERSON"], ["billions", "CARDINAL"], ["two", "CARDINAL"], ["more than 250", "CARDINAL"], ["Two", "CARDINAL"], ["Zaldy Co", "PERSON"], ["Marcos", "PERSON"], ["1.7bn", "MONEY"], ["Sunday", "DATE"], ["21-year-old", "DATE"], ["Matt Wovi Villanueva", "PERSON"], ["September", "DATE"], ["some 300", "CARDINAL"], ["Villanueva", "ORG"], ["five days", "DATE"], ["September", "DATE"], ["Villanueva", "ORG"], ["Al Jazeera", "ORG"], ["Marcos", "PERSON"], ["Rodrigo Duterte", "PERSON"], ["Marcos", "PERSON"], ["the Catholic Church", "ORG"], ["Trillion Peso", "WORK_OF_ART"], ["March", "DATE"], ["EDSA Avenue", "ORG"], ["Duterte", "ORG"], ["Marcos", "PERSON"], ["Some 5,000", "CARDINAL"], ["more than 12,000", "CARDINAL"], ["Manila", "GPE"], ["Malacanang", "PERSON"], ["KBKK", "ORG"], ["Marcos", "PERSON"], ["Earlier this month", "DATE"], ["Co", "ORG"], ["Marcos", "PERSON"], ["more than 50 billion", "MONEY"], ["852", "MONEY"], ["2022", "DATE"], ["100 billion", "MONEY"], ["1.7bn", "MONEY"], ["2025", "DATE"], ["2024", "DATE"], ["US$17m", "MONEY"], ["Marcos", "PERSON"], ["billions", "CARDINAL"], ["July", "DATE"], ["Japan", "GPE"], ["Marcos", "PERSON"], ["Co", "ORG"], ["Raymond Palatino", "PERSON"], ["the Bagong Alyansang Makabayan", "ORG"], ["New Patriotic Alliance", "ORG"], ["Bayan", "NORP"], ["one", "CARDINAL"], ["KBKK", "ORG"], ["Palatino", "PERSON"], ["Al Jazeera", "ORG"], ["Palatino", "LOC"], ["Marcos", "PERSON"], ["Palatino", "LOC"], ["Claire Castro", "PERSON"], ["Marcos", "PERSON"], ["July", "DATE"], ["State of the Nation", "ORG"], ["Congress", "ORG"], ["September", "DATE"], ["the Independent Commission for Infrastructure", "ORG"], ["ICI", "ORG"], ["Some 9,855", "CARDINAL"], ["more than 545 billion", "MONEY"], ["9bn", "MONEY"], ["Senate", "ORG"], ["House", "ORG"], ["September", "DATE"], ["118.5 billion", "CARDINAL"], ["2bn", "MONEY"], ["2023", "DATE"], ["Marcos", "PERSON"], ["Martin Romualdez", "PERSON"], ["the House of Representatives", "ORG"], ["ICI", "ORG"], ["ICI", "ORG"], ["Sol Iglesias", "PERSON"], ["the University of the Philippines", "ORG"], ["Marcos", "PERSON"], ["September", "DATE"], ["Iglesias", "PERSON"], ["Al Jazeera", "ORG"]], "verified": false, "is_trusted": false}, {"url": "http://www.ateneo.edu/events/2025-11-30-trillion-peso-march", "title": "Trillion Peso March | Events", "content": "Ateneo, Stand for Truth and Accountability!\\n\\nAteneo de Manila, through the Mission Integration Cluster, invites all Ateneo students, employees, and alumni to join the\\n\\nTrillion Peso March Movement\\n\\nin a peaceful rally against corruption and political dynasties.\\n\\nDate: Sunday, 30 November 2025\\n\\nVenue: EDSA People Power Monument\\n\\nAssembly at Ateneo: 7:15 AM\\n\\nDeparture from Ateneo: 8:00 AM\\n\\nAteneo Meeting Point: Zen Garden/Quad, College Complex, Loyola Heights Campus\\n\\nWear a white shirt; Bring Food and Drink (there may be limited food vendors in the area) and umbrella / hat\\n\\nSign up here:\\n\\nhttps://go.ateneo.edu/tpm-nov30-signup (ateneo.edu users)\\n\\nhttps://go.ateneo.edu/tpm-nov30-signup-alumni (alumni)\\n\\nA confirmation email will be sent to you upon successful registration.\\n\\nSign-ups will close on Thursday, 27 November 2025, at 8:00 PM.\\n\\nLet us continue to live out our Ignatian mission: to be persons for and with others, to speak truth to power, and to stand for justice and accountability.\\n\\nSama-sama tayong manindigan para sa katotohanan at para sa pananagutan!", "entities": [["Stand for Truth", "ORG"], ["the Mission Integration Cluster", "ORG"], ["Ateneo", "ORG"], ["the\\n\\nTrillion Peso March Movement\\n\\n", "ORG"], ["Sunday", "DATE"], ["30", "CARDINAL"], ["November 2025", "DATE"], ["7:15 AM\\n\\n", "TIME"], ["Ateneo", "ORG"], ["8:00 AM", "TIME"], ["Loyola Heights Campus\\n\\nWear", "ORG"], ["Bring Food and Drink", "ORG"], ["Thursday", "DATE"], ["27 November 2025", "DATE"], ["8:00 PM", "TIME"], ["Ignatian", "NORP"], ["Sama", "GPE"], ["tayong manindigan", "PERSON"], ["para sa", "FAC"], ["katotohanan", "GPE"], ["para sa pananagutan", "FAC"]], "verified": false, "is_trusted": false}]	2025-12-06 16:45:47.767965
22	What is the lates GeminiAPI model?	[{"url": "https://www.abs-cbn.com/news/technology/2025/11/21/google-touts-gemini-3-s-improved-reasoning-antigravity-agentic-coding-capabilities-1611", "title": "Google touts Gemini 3's improved reasoning, 'Antigravity' ...", "content": "ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.", "entities": [["Philippines", "GPE"], ["Filipino", "LANGUAGE"]], "verified": true, "is_trusted": true}]	2025-12-07 19:11:36.498066
23	Latest Gemini API model	[{"url": "https://www.abs-cbn.com/news/technology/2025/11/21/google-touts-gemini-3-s-improved-reasoning-antigravity-agentic-coding-capabilities-1611", "title": "Google touts Gemini 3's improved reasoning, 'Antigravity' ...", "content": "ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.", "entities": [["Philippines", "GPE"], ["Filipino", "LANGUAGE"]], "verified": true, "is_trusted": true}]	2025-12-07 19:13:53.692288
24	Latest Gemini API model	[{"url": "https://www.abs-cbn.com/news/technology/2025/11/21/google-touts-gemini-3-s-improved-reasoning-antigravity-agentic-coding-capabilities-1611", "title": "Google touts Gemini 3's improved reasoning, 'Antigravity' ...", "content": "ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.", "entities": [["Philippines", "GPE"], ["Filipino", "LANGUAGE"]], "verified": true, "is_trusted": true}]	2025-12-07 19:16:10.535708
25	Trillion Peso March 2025	[{"url": "https://www.abs-cbn.com/news/nation/2025/11/30/trillion-peso-march-2-0-ends-peacefully-organizers-open-to-possible-part-3-2100", "title": "Trillion Peso March 2.0 ends peacefully; organizers open ...", "content": "ABS-CBN is the leading media and entertainment company in the Philippines, offering quality content across TV, radio, digital, and film. Committed to public service and promoting Filipino values, ABS-CBN continues to inspire and connect audiences worldwide.", "entities": [["Philippines", "GPE"], ["Filipino", "LANGUAGE"]], "verified": true, "is_trusted": true}, {"url": "https://www.philstar.com/headlines/2025/12/01/2491131/third-trillion-peso-march-eyed-amid-tentative-corruption-probes", "title": "Third Trillion Peso March eyed amid 'tentative' corruption ...", "content": "Third Trillion Peso March eyed amid 'tentative' corruption probes\\n\\nA protester holds a chain linked to an effigy of a crocodile, which represents corrupt officials, during anti-corruption rally along Epifanio de los Santos Avenue, or EDSA, in Quezon City, Metro Manila on November 30, 2025.\\n\\nMANILA, Philippines (Updated 9:50 a.m.) — Organizers of the second Trillion Peso March on Sunday, November 30, are preparing for a possible third nationwide protest, saying another mobilization is likely if government investigations into the multibillion-peso flood control scandal continue to skirt accountability for senior officials.\\n\\nKiko Aquino Dee, one of the organizers, said on ANC’s Headstart on Monday, December 1, that the group is “definitely” open to a third mass action if the current pace of the probe remains “tentative” when it comes to high-ranking officials.\\n\\nDee noted that while cases are expected to be filed before the December deadline, inquiries so far have centered on minor officials and contractors. He cited what he described as inconsistent signals from government on the alleged involvement of Speaker Martin Romualdez.\\n\\n\\"Three weeks ago, the president (Ferdinand Marcos Jr) said there was no evidence. Two weeks ago, suddenly there was evidence according to the DPWH. Last week, the ICI seemed to be backtracking,\\" Dee said.\\n\\n\\"It’s a little worrisome when it comes to these big fish, the government seems to be tentative as far as their committment to investigating them, so if that sort of attitude continues, then it is right to have the third edition,\\" he added.\\n\\nOrganizers will need to discuss their next steps but stressed they remain committed to continued mobilizations “for as long as the issue remains unresolved.”\\n\\nCrowd estimate, protest goals\\n\\nDee said crowd numbers ranged between 30,000 and 55,000, though organizers still need to reconcile their estimate with the 5,000-person figure cited by the Philippine National Police.\\n\\nHe added that matching the size of the Iglesia ni Cristo rally at Luneta in early November was never a target, noting that INC has a \\"significant capacity for mobilization.\\"\\n\\nAFP/Jam Sta Rosa Protesters take part in an anti-corruption rally along Epifanio de los Santos Avenue, or EDSA, in Quezon City, Metro Manila on November 30, 2025.\\n\\nThe second Trillion Peso March centered on five demands:\\n\\nTransparency (\\"Ilantad ang katotohanan\\") Forfeiture of stolen funds (\\"Ibalik ang nakaw na yaman\\") Jailing the corrupt (\\"Ikulong ang mga kurakot\\") Respecting the Constitution, including rejecting any form of military intervention in presidential succession (\\"Igalang ang Constitution\\") Ending political dynasties (\\"Ipanalo ang taong bayan laban sa dinastiya\\")\\n\\nDee said the organizers barred no calls for the resignation of President Ferdinand Marcos Jr, Vice President Sara Duterte or both top officials, provided messages remained within constitutional bounds.\\n\\nInvited participants included opposition lawmakers Rep. Chel Diokno (Akbayan party-list), Rep. Leila de Lima (ML party-list), and Rep. Percy Saldaña (Akbyan). Dee said they deliberately kept senatorial incumbents, who already have their own platforms as politicians, from dominating the stage.\\n\\nOn the main stage, Miss Universe 2018 Catriona Gray, who is among the top taxpayers listed by the Bureau of Internal Revenue, addressed protesters, saying she fears the public's concerns will soon be forgetten.\\n\\nFormer chief justice Maria Lourdes Sereno, as a leading evangelic figure, led the interfaith prayer. Catholic bishops conference head Cardinal Pablo Virgilio David called for fast-tracked cases, while Cubao Bishop Elias Ayuban hoped that the Advent season would serve as a \\"massive wake-up call\\" for political leaders not to compromise on the nation's future.\\n\\nFormer vice president Leni Robredo joined mobilizations in Naga as part of her duties as mayor. — Camille Diola", "entities": [["March", "DATE"], ["Epifanio de los Santos Avenue", "PERSON"], ["EDSA", "ORG"], ["Quezon City", "GPE"], ["November 30, 2025", "DATE"], ["MANILA", "GPE"], ["Philippines", "GPE"], ["9:50 a.m.", "TIME"], ["second", "ORDINAL"], ["Trillion Peso", "ORG"], ["March", "DATE"], ["Sunday, November 30", "DATE"], ["third", "ORDINAL"], ["multibillion", "CARDINAL"], ["Kiko Aquino Dee", "PERSON"], ["ANC", "ORG"], ["Headstart", "GPE"], ["Monday, December 1", "DATE"], ["third", "ORDINAL"], ["Dee", "PERSON"], ["December", "DATE"], ["Martin Romualdez", "PERSON"], ["Three weeks ago", "DATE"], ["Ferdinand Marcos Jr", "PERSON"], ["Two weeks ago", "DATE"], ["DPWH", "ORG"], ["Last week", "DATE"], ["ICI", "ORG"], ["Dee", "PERSON"], ["third", "ORDINAL"], ["Dee", "PERSON"], ["between 30,000 and 55,000", "CARDINAL"], ["5,000", "CARDINAL"], ["the Philippine National Police", "ORG"], ["the Iglesia ni Cristo", "ORG"], ["Luneta", "ORG"], ["early November", "DATE"], ["INC", "ORG"], ["Epifanio de los Santos Avenue", "PERSON"], ["EDSA", "ORG"], ["Quezon City", "GPE"], ["November 30, 2025", "DATE"], ["second", "ORDINAL"], ["Trillion Peso", "ORG"], ["March", "DATE"], ["five", "CARDINAL"], ["katotohanan", "GPE"], ["Ikulong", "PERSON"], ["Respecting the Constitution", "WORK_OF_ART"], ["Igalang ang Constitution", "WORK_OF_ART"], ["Ipanalo ang taong bayan laban sa", "WORK_OF_ART"], ["Dee", "PERSON"], ["Ferdinand Marcos Jr", "PERSON"], ["Sara Duterte", "PERSON"], ["Chel Diokno", "PERSON"], ["Akbayan", "NORP"], ["Leila de Lima", "PERSON"], ["ML", "ORG"], ["Percy Saldaña", "PERSON"], ["Dee", "PERSON"], ["Universe", "PERSON"], ["2018", "DATE"], ["Catriona Gray", "PERSON"], ["the Bureau of Internal Revenue", "ORG"], ["Maria Lourdes Sereno", "PERSON"], ["Catholic", "NORP"], ["Virgilio David", "PERSON"], ["Cubao Bishop Elias Ayuban", "PERSON"], ["the Advent season", "DATE"], ["Leni Robredo", "PERSON"], ["Naga", "PERSON"], ["Camille Diola", "PERSON"]], "verified": true, "is_trusted": true}, {"url": "https://www.rappler.com/philippines/end-political-dynasties-trillion-peso-march-november-2025/", "title": "End political dynasties, say protesters at second Trillion ...", "content": "This is AI generated summarization, which may have errors. For context, always refer to the full article.\\n\\nMARCH. Members of various civil society and religious groups walk under the intense heat as they participate in the 2nd Trillion Peso March movement from the EDSA Shrine to the People Power Monument in Quezon City on Sunday, November 30, 2025.\\n\\nAside from calling for an end to political dynasties, the groups also want the government to strengthen the powers of the independent commission investigating the flood control and infrastructure projects\\n\\nMANILA, Philippines – The Trillion Peso March Movement gathered for the second time at the People Power Monument in Quezon City on Sunday, November 30, with a call to end political dynasties.\\n\\nSeveral groups marched from the EDSA Shrine to the People Power Monument to stage the protest, which coincided with the 162nd birth anniversary of Philippine hero Andres Bonifacio.\\n\\nProtesters reiterated their appeal to hold accountable the government officials involved in anomalous flood control projects and further demanded to stop political dynasties.\\n\\nPlay Video\\n\\n“Sa lalong madaling panahon, inaasahan natin na dapat panindigan din ng gobyerno na kanilang i-certify as urgent ang ating anti-political dynasty bill. Alam naman nating itong korapsyon, mahigpit ang pagkatali sa usapin ng mga dynasty sa Pilipinas,” Akbayan Representative Perci Cendana said.\\n\\n(We expect that the government will certify the anti-political dynasty bill as urgent as soon as possible. We know that corruption is tightly tied to the issue of dynasties in the Philippines.)\\n\\n“Pinakamalaki sigurong utang nito (government), ‘yung utang nila sa anti-political dynasty bill. Papayag ba tayo na hindi maisasabatas ‘yan? Sisingilin at sisingilin natin ang mga ‘yan hanggang bayaran nila ang utang nila sa sambayanang Pilipino,” Akbayan Representative Chel Diokno said.\\n\\n(The government’s largest debt is the anti-political dynasty bill. Will we allow that it would not be passed into a law? We will not stop charging them until they pay their debts to the Filipino people.)\\n\\nCatholic priest Fr. Flavie Villanueva, who also shared the same appeal, said their call grew louder as almost all dioceses in the country were with him.\\n\\n“Panawagan natin: Patuloy paigtingin ang paghahanap ng katotohanan; ikulong ang lahat ng korap; ibalik ang salapi; patuloy ipasa at ipatupad ang anti-dynasty law; at pinakamahalaga para sa’kin, ibalik natin ‘yung dangal bilang Pilipino,” Villanueva said.\\n\\n(Our appeal: Continue strengthening the search for truth; jail the corrupt; pass and implement the anti-dynasty bill; and the most important for me, restore our dignity as a Filipino.)\\n\\nAside from calling for an end to political dynasties, the groups also wants the government to strengthen the powers of the independent commission investigating flood control and infrastructure projects.\\n\\nA bill on the creation of an Independent Commission Against Infrastructure Corruption (ICAIC) has been filed at the House of Representatives as the authors noted the lack of power in the executive-formed Independent Commission for Infrastructure (ICI).\\n\\n“Itutulad n’yo ba ‘yan (ICAIC bill) sa anti-dynasty na inabot ng ilang dekada? Walang dahilan para patagalin pa ang mga batas na ‘yan pwera na lang kung kayo mismo ang may ayaw at natatakot na maisabatas ang mga ‘yan. Hindi lalabas ang katotohanan kung patago ang mga galawan, kung patingi-tingi ang diskarte,” Mamamayang Liberal Representative Leila de Lima, one of the ICAIC bill authors, said.\\n\\n(Are you putting the ICAIC bill in the same fate as that of the anti-dynasty bill which reached decades? There is no reason to prolong the enactment into law of those bills, except if you do not like or are scared of those. The truth will not come out if the actions are hidden, if the strategy is slow.)\\n\\n“The current ICI can continue doing its work but it’s important the mandate no longer comes from the president but from Congress, so it can act independently,” said Kiko Dee, political scientist and co-organizer of the Trillion Peso March.\\n\\nWhile the public see “positive steps” against alleged corrupt officials, Dee said they will continue mounting protests until Filipinos achieve justice.\\n\\nThe first Trillion Peso March was held on September 21, the anniversary of the late dictator Ferdinand Marcos Sr.’s declaration of martial law. – Rappler.com", "entities": [["AI", "ORG"], ["MARCH", "PERSON"], ["2nd", "ORDINAL"], ["Trillion Peso", "ORG"], ["March", "DATE"], ["the EDSA Shrine", "ORG"], ["the People Power Monument", "ORG"], ["Quezon City", "GPE"], ["Sunday, November 30, 2025", "DATE"], ["MANILA", "GPE"], ["Philippines", "GPE"], ["The Trillion Peso March Movement", "ORG"], ["second", "ORDINAL"], ["the People Power Monument", "ORG"], ["Quezon City", "GPE"], ["Sunday, November 30", "DATE"], ["the EDSA Shrine", "ORG"], ["the People Power Monument", "ORG"], ["162nd", "FAC"], ["Philippine", "NORP"], ["Andres Bonifacio", "PERSON"], ["dapat", "ORG"], ["din ng gobyerno", "PERSON"], ["kanilang", "GPE"], ["Alam", "PERSON"], ["itong korapsyon", "PERSON"], ["mahigpit ang", "PERSON"], ["pagkatali sa usapin ng mga dynasty", "ORG"], ["Pilipinas", "GPE"], ["Akbayan Representative Perci Cendana", "ORG"], ["Philippines", "GPE"], ["Pinakamalaki", "LOC"], ["yung utang nila", "PERSON"], ["Papayag", "PERSON"], ["Sisingilin", "PERSON"], ["sisingilin natin", "FAC"], ["yan hanggang", "PERSON"], ["nila", "ORG"], ["utang nila", "ORG"], ["sambayanang Pilipino", "ORG"], ["Akbayan Representative", "PERSON"], ["Chel Diokno", "PERSON"], ["Filipino", "NORP"], ["Catholic", "NORP"], ["Fr", "PERSON"], ["Flavie Villanueva", "PERSON"], ["Panawagan", "PERSON"], ["paghahanap", "ORG"], ["katotohanan", "ORG"], ["ikulong ang", "PERSON"], ["para sa’kin", "PERSON"], ["Pilipino", "LANGUAGE"], ["Villanueva", "ORG"], ["Filipino", "LANGUAGE"], ["an Independent Commission Against Infrastructure Corruption (ICAIC", "ORG"], ["the House of Representatives", "ORG"], ["Independent Commission for Infrastructure", "ORG"], ["ICI", "ORG"], ["ICAIC", "ORG"], ["Walang", "GPE"], ["patagalin pa ang", "PERSON"], ["mga batas", "FAC"], ["Hindi lalabas", "PERSON"], ["katotohanan", "GPE"], ["mga galawan", "PERSON"], ["kung patingi-tingi", "PERSON"], ["Mamamayang Liberal", "ORG"], ["Leila de Lima", "PERSON"], ["one", "CARDINAL"], ["ICAIC", "ORG"], ["ICAIC", "ORG"], ["decades", "DATE"], ["ICI", "ORG"], ["Congress", "ORG"], ["Kiko Dee", "PERSON"], ["the Trillion Peso", "ORG"], ["March", "DATE"], ["Dee", "PERSON"], ["Filipinos", "NORP"], ["first", "ORDINAL"], ["March", "DATE"], ["September 21", "DATE"], ["Ferdinand Marcos Sr.", "PERSON"], ["Rappler.com", "ORG"]], "verified": true, "is_trusted": true}]	2025-12-07 19:48:08.862331
\.


--
-- TOC entry 5010 (class 0 OID 16448)
-- Dependencies: 225
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.searches (search_id, account_id, query_text, "timestamp") FROM stdin;
30	32	Trillion Peso March 2025	2025-12-07 19:47:58.8534
\.


--
-- TOC entry 5022 (class 0 OID 16979)
-- Dependencies: 237
-- Data for Name: trusted_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trusted_sources (source_id, domain, source_name, trust_status, reason, is_global, added_date) FROM stdin;
1	https://www.reddit.com/	Reddit	blocked	Reddit is not a good site for News articles	f	2025-12-07 22:09:40.824211
\.


--
-- TOC entry 5018 (class 0 OID 16536)
-- Dependencies: 233
-- Data for Name: userreview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userreview (review_id, user_id, result_id, rating, review_text, created_at) FROM stdin;
\.


--
-- TOC entry 5006 (class 0 OID 16420)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, uuid, hashed_password, role, created_at, username) FROM stdin;
32	648921c4-fd94-4298-a31b-208524823dad	scrypt:32768:8:1$y9Nc3T3u4iUUIkcY$667a72c60c76a8e8d4100a3314c75ff7a21a8a31c0529f9c2319dfb785e63b8d54de9b66d4cdf28d37599036c3ce4d905c8fac0b6223166f80e8e4e6ab0e6dc9	user	2025-12-06 15:57:16.500215	Daddd
\.


--
-- TOC entry 5016 (class 0 OID 16493)
-- Dependencies: 231
-- Data for Name: usersummaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usersummaries (summary_id, user_id, result_id, summary_text, created_at) FROM stdin;
23	32	21	⚠️ Summarized from unverified sources:\n\nIn the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors.	2025-12-06 16:45:47.767965
24	32	22	Summarized from verified sources:\n\n⚠️ Failed to generate summary due to technical error.	2025-12-07 19:11:36.498066
25	32	23	Summarized from verified sources:\n\n⚠️ Failed to generate summary due to technical error.	2025-12-07 19:13:53.692288
26	32	24	Summarized from verified sources:\n\nThe sources confirm the specific claim by identifying the newest generation model available through the API.\n\nThe latest model available through the Gemini API is **Gemini 3 Pro**. This model is presented as the highest version currently released, categorized as Google’s "most intelligent model" and "latest reasoning-first model."\n\nGemini 3 Pro is currently accessible as a preview model, identified by the code `gemini-3-pro-preview`. Key features include state-of-the-art reasoning, comprehensive multimodal understanding (accepting Text, Image, Video, Audio, and PDF inputs), and optimization for complex agentic workflows and autonomous coding tasks. It features a large context window, supporting up to 1,048,576 input tokens. A corresponding multimodal version, Gemini 3 Pro Image, is also available in preview, offering high-fidelity image generation and complex image editing capabilities.	2025-12-07 19:16:10.535708
27	32	25	The sources do not confirm the specific claim. They mention related topics but not the exact information requested.\n\nThe search results verify details regarding the *second* "Trillion Peso March," which occurred on November 30, 2025. Organizers of this anti-corruption rally expressed openness to a *third* mass action should government investigations fail to hold senior officials accountable for alleged corruption.\n\nAlthough the sources confirm discussions about planning a future (third) protest following the November 2025 event, neither source provides any information, scheduling, or discussion related to a "Trillion Peso March" specifically dated or planned for March 2025.	2025-12-07 19:48:08.862331
\.


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 234
-- Name: articlecount_count_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articlecount_count_id_seq', 5, true);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 228
-- Name: articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_article_id_seq', 96, true);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 226
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 76, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 222
-- Name: chats_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_chat_id_seq', 12424, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 218
-- Name: search_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_results_result_id_seq', 25, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.searches_search_id_seq', 30, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 236
-- Name: trusted_sources_source_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trusted_sources_source_id_seq', 1, true);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 232
-- Name: userreview_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userreview_review_id_seq', 1, false);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 36, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usersummaries_summary_id_seq', 27, true);


--
-- TOC entry 4843 (class 2606 OID 16954)
-- Name: articlecount articlecount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount
    ADD CONSTRAINT articlecount_pkey PRIMARY KEY (count_id);


--
-- TOC entry 4835 (class 2606 OID 16486)
-- Name: articles articles_article_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_article_url_key UNIQUE (article_url);


--
-- TOC entry 4837 (class 2606 OID 16484)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (article_id);


--
-- TOC entry 4833 (class 2606 OID 16470)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4828 (class 2606 OID 16441)
-- Name: conversationHistory chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_pkey PRIMARY KEY (chat_id);


--
-- TOC entry 4820 (class 2606 OID 16407)
-- Name: search_results search_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_results
    ADD CONSTRAINT search_results_pkey PRIMARY KEY (result_id);


--
-- TOC entry 4831 (class 2606 OID 16456)
-- Name: searches searches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_pkey PRIMARY KEY (search_id);


--
-- TOC entry 4847 (class 2606 OID 16989)
-- Name: trusted_sources trusted_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trusted_sources
    ADD CONSTRAINT trusted_sources_pkey PRIMARY KEY (source_id);


--
-- TOC entry 4841 (class 2606 OID 16542)
-- Name: userreview userreview_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4822 (class 2606 OID 16429)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4824 (class 2606 OID 16556)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4826 (class 2606 OID 16431)
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- TOC entry 4839 (class 2606 OID 16501)
-- Name: usersummaries usersummaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_pkey PRIMARY KEY (summary_id);


--
-- TOC entry 4829 (class 1259 OID 16634)
-- Name: idx_conversation_search_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_search_id ON public."conversationHistory" USING btree (search_id);


--
-- TOC entry 4844 (class 1259 OID 16997)
-- Name: idx_trusted_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trusted_domain ON public.trusted_sources USING btree (domain);


--
-- TOC entry 4845 (class 1259 OID 16999)
-- Name: idx_trusted_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trusted_status ON public.trusted_sources USING btree (trust_status);


--
-- TOC entry 4857 (class 2606 OID 16955)
-- Name: articlecount articlecount_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount
    ADD CONSTRAINT articlecount_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4852 (class 2606 OID 16487)
-- Name: articles articles_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4851 (class 2606 OID 16471)
-- Name: categories categories_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_search_id_fkey FOREIGN KEY (search_id) REFERENCES public.searches(search_id);


--
-- TOC entry 4848 (class 2606 OID 16442)
-- Name: conversationHistory chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4849 (class 2606 OID 16557)
-- Name: conversationHistory conversationHistory_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT "conversationHistory_search_id_fkey" FOREIGN KEY (search_id) REFERENCES public.searches(search_id);


--
-- TOC entry 4850 (class 2606 OID 16457)
-- Name: searches searches_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.users(user_id);


--
-- TOC entry 4855 (class 2606 OID 16548)
-- Name: userreview userreview_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4856 (class 2606 OID 16543)
-- Name: userreview userreview_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4853 (class 2606 OID 16507)
-- Name: usersummaries usersummaries_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4854 (class 2606 OID 16502)
-- Name: usersummaries usersummaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2025-12-07 22:19:20

--
-- PostgreSQL database dump complete
--

\unrestrict EeY9PhZhdWgJSV8Rhlx2beBPepFYEYnv2M19QH7352xibw9iCFL9LPSjpH7JZQ0

