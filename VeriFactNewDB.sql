--
-- PostgreSQL database dump
--

\restrict MFLesgfKJHoBs6RnhaAWzlUXWa97xu6KhJNrVVykB2NYGtXnTaVBiIN01IMCJs2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-06 17:07:46

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
-- TOC entry 5013 (class 0 OID 0)
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
-- TOC entry 5014 (class 0 OID 0)
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
-- TOC entry 5015 (class 0 OID 0)
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
-- TOC entry 5016 (class 0 OID 0)
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
-- TOC entry 5017 (class 0 OID 0)
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
-- TOC entry 5018 (class 0 OID 0)
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
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.searches_search_id_seq OWNED BY public.searches.search_id;


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
-- TOC entry 5020 (class 0 OID 0)
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
-- TOC entry 5021 (class 0 OID 0)
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
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usersummaries_summary_id_seq OWNED BY public.usersummaries.summary_id;


--
-- TOC entry 4808 (class 2604 OID 16951)
-- Name: articlecount count_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount ALTER COLUMN count_id SET DEFAULT nextval('public.articlecount_count_id_seq'::regclass);


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
-- TOC entry 4806 (class 2604 OID 16539)
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
-- TOC entry 5007 (class 0 OID 16948)
-- Dependencies: 235
-- Data for Name: articlecount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articlecount (count_id, result_id, count, created_at) FROM stdin;
1	21	0	2025-12-06 16:45:47.767965
\.


--
-- TOC entry 5001 (class 0 OID 16477)
-- Dependencies: 229
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (article_id, article_title, content, article_url, source_name, publication_date, result_id) FROM stdin;
87	Power to the People: My Time at the Trillion Peso March	“The power of the people is much stronger than the people in power.”\n\n– Wael Ghonim\n\nThe Trillion Peso March was a huge wave of protests that swept across the Philippines on September 21, 2025. People from all walks of life – including church groups, student organizations, labor unions, civic groups, and political movements – came together to speak out against the massive corruption in government flood control projects. What sparked this event were the reports that out of the ₱1.9 trillion supposedly spent on these projects over the past 15 years, more than half may have been pocketed by corrupt officials. The protesters were fed up and wanted answers, demanding accountability for what they saw as a shocking crime in the misuse of public funds.\n\nWhat made the protests even more powerful was the date itself, because September 21 also marks the anniversary of the declaration of Martial Law and is closely tied to the spirit of the EDSA People Power Revolution. For many, marching in the streets on that day wasn’t just about the present corruption scandal; it was also a symbolic act, a way of honoring the country’s history of standing up to abuse of power and fighting for democracy.\n\nReports, infographics, and exposés about the purported corruption in the government’s flood control infrastructure projects were widely circulated on social media and in news outlets in the days preceding the Trillion Peso March. After assembling documents and budget breakdowns, it was discovered that the nation’s flooding issues had not significantly improved despite nearly ₱1.9 trillion being spent on flood control. More than half of that money may have been lost to kickbacks, ghost projects, and overpriced contracts. Public indignation rose over these revelations, which swiftly went viral online and fueled calls for protests across the country.\n\nAccording to reports, an estimated 60,000 souls took to the streets, many of them carrying placards that showcased causes they are passionate about; cameras to document a momentous event; and a burning desire to give justice to all Filipinos.\n\nMy friends (including fellow HAPIsko Kelly Kim Sepida) and I were among those who marched in the Bacolod protests: we walked from Provincial Lagoon to Public Plaza where the event culminated, and where various speakers from different sectors, including the youth, lawyers, transport groups, religious sectors, and various organizations took to the stage and spoke words that all the protesters echoed.\n\nThe Trillion Peso March trended all over social media, showing the power of people coming together to call out injustices and crimes by people in positions of power.\n\nShouting and walking together with other Filipinos from various walks of life is an empowering feeling. It leaves a sense of hope and a spark of change. But the real challenge would be the things that will come after it, after the elation and noise of the protest, what would we do next?\n\nWe have to never forget about the anger, keep ourselves informed about what is happening in these countless hearings and speeches that these accused are preaching about. When the time comes to be present in the streets again, we’ll be much more powerful.	https://hapihumanist.org/2025/10/07/power-to-the-people-my-time-at-the-trillion-peso-march/	hapihumanist.org	\N	21
88	Trillion Peso March rejects corruption, calls for defence of ...	Protesters during the Trillion Peso March on November 30. Photo: RVA News/Ang Pahayagang Plaridel\n\nMANILA (LiCAS News/RVA News): “We are here at the EDSA People Power Monument because we do not want quick fixes. We do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society,” said Pablo Virgilio Cardinal David of Kalookan in remarks after Mass on November 30, addressing thousands who joined the expanded “Trillion Peso March” actions across the country.\n\nCardinal David invoked the legacy of the 1986 EDSA Uprising on Sunday as he defended the decision to gather protesters at the People Power Monument, in Quezon City, saying the movement sought to uphold democratic principles and reject any path toward violent or unconstitutional change.\n\nThe cardinal noted that Luneta was not chosen as the main venue since protesters there have “a call that we do not yet agree with,” adding that the Church-led anti-corruption rally respects other protest groups “who have already come to that call because they are tired of a corrupt system.”\n\nHe observed, “We are tired too. But if it is ‘resign all’ immediately, what is the alternative? What comes after?”\n\nWe do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society Cardinal David\n\nHe said organisers also avoided Mendiola [near Malacañang Palace] because of its history of tension and the presence of groups intent on confrontation.\n\n“We do not want violence and disorder. We are disciples of democracy. Who would not be afraid to go to Mendiola when your companions there are people covering their faces, inciting anger, beating the police, destroying traffic lights, and throwing Molotov cocktails?” he asked.\n\nCardinal David said the protests firmly oppose any push for military intervention, a revolutionary government, a transitional council, or a junta.\n\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions.\n\nThe cardinal also thanked uniformed personnel at the rally for upholding their oaths, noting their presence at EDSA and their assistance to participants. He said the troops demonstrated fidelity to the Constitution and expressed gratitude for their role in defending democratic values.\n\nAdvertisements As we celebrate the 500 years of Christianity in the Philippines. The Chaplaincy to Filipino Migrants organises an on-line talk every Tuesday at 9.00pm. You can join us at: https://www.Facebook.com/CFM-Gifted-to-give-101039001847033\n\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions\n\nFrom this stance, he said the protests aim to restore transparency and strengthen oversight mechanisms that have “failed,” allowing corruption to spread unchecked.\n\nHe noted that pork barrel [discretionary funds] practices declared unconstitutional years ago continue to reappear in the national budget through “hundreds of billions of pesos of flood control and other infrastructure projects,” many of which he described as “ghosts.”\n\nThe cardinal noted, “Those ghosts are very expensive. Ghosts that fatten the pockets of politicians with no shame.”\n\nHe warned that patronage politics and political dynasties continue to entrench inequality, calling them “a very serious cancer” that weakens national life.\n\nCardinal David called on lawmakers to pass long-delayed reforms, including the anti-political dynasty law, the Budget Transparency Act, the Freedom of Information Act, party development reforms, and reviews of the party-list system and Local Government Code.\n\nWe do not want a government that kills. We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist Cardinal David\n\nAddressing the president, Ferdinand Marcos Jr., the cardinal reminded him of his constitutional duty. “You swore to the 1987 Constitution,” he said, adding, alluding to mounting budget controversies, “Because you yourself said it in your State of the Nation Address—have some shame.”\n\nHe called on the president to show full political will in addressing corruption, urging him to continue the effort he began and to allow a fully transparent investigation that would hold wrongdoers accountable based on evidence.\n\nCardinal David also denounced the return of authoritarian impulses and condemned past extrajudicial killings linked to anti-drug operations.\n\n“We do not want a government that kills,” he said. “We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist.”\n\nare starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent Catriona Gray\n\nThe cardinal called on Filipinos to reclaim democratic values and continue the unfinished work of nation-building.\n\n“We dream of a country that is prosperous, peaceful, and fair to all,” he said, “a country united in heart and spirit for the common good.”\n\nSpeaking at the rally, former Miss Universe Catriona Gray, was reported by RVA News warning that “every time we stay quiet, corruption wins” as she urged for cases to be filed over missing public funds.\n\nShe said that Filipinos are “tired of watching corruption steal food from our tables, steal medicines from our hospitals, classrooms from our children, and safety from our communities.”\n\nGray added that what scares her most is that many “are starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent.”\n\nShe asked how many more floods, scandals and stolen funds it would take “before we finally say, enough!”\n\nSome 92,00 people took part in at least 119 peaceful demonstrations across the country, in locations including, Antipolo, Cebu, Metro Manila, Legazpi City, and other locations.\n\n___________________________________________________________________________	https://www.examiner.org.hk/2025/12/05/trillion-peso-march-rejects-corruption-calls-for-defence-of-democracy-demands-change/news/	www.examiner.org.hk	\N	21
89	Thousands march in Philippines, demanding Marcos ...	Claims that President Ferdinand Marcos Jr took kickbacks from infrastructure projects cause outrage in the Philippines.\n\nManila, Philippines – Tens of thousands of people have marched in the Philippine capital, Manila, demanding President Ferdinand Marcos Jr’s resignation over a corruption scandal linked to government spending on flood-control infrastructure.\n\nThe rally, organised by the Kilusang Bayan Kontra-Kurakot or the People’s Movement Against Corruption (KBKK), began at the Luneta National Park in Manila on Sunday, with protesters marching on to the presidential palace.\n\nSome carried an effigy of Marcos and Vice President Sara Duterte, depicting the politicians as crocodiles and dubbed the “corrupt-codile”, while others held signs that read “Marcos Resign” and “All corrupt politicians must be held accountable”.\n\nOrganisers said they estimated the crowd to be more than 20,000.\n\nIt is the last display of public anger over the “Trillion-Peso” scandal, in which powerful politicians, including Marcos’s allies, are accused of pocketing billions of pesos in bribes for contracts on flood-control infrastructure that ended up being defective or were never built at all.\n\nExtensive damage from two recent powerful typhoons, which killed more than 250 people, has spurred public outrage.\n\nTwo cabinet ministers have resigned over the scandal, while a former lawmaker accused in the case, Zaldy Co, has alleged that Marcos directed him to add $1.7bn to the budget for “dubious public works” while he headed an appropriations committee.\n\nThe president has denied the claims.\n\n‘They keep treating us like fools’\n\nAmong those at Sunday’s protest was 21-year-old student Matt Wovi Villanueva, who also took part in a similar protest at the presidential palace in September. That protest turned violent with the police arresting some 300 people.\n\nAdvertisement\n\nVillanueva said he was beaten and detained for five days then.\n\n“Compared to September, we have more reasons to go back to the streets now,” Villanueva told Al Jazeera. “They keep treating us like fools. If we want real justice, we need Marcos and [Vice President Sara] Duterte to resign.”\n\nDuterte, the daughter of former President Rodrigo Duterte, who has fallen out with Marcos, is facing separate allegations over the misuse of government funds.\n\nMeanwhile, mainstream opposition forces, backed by the Catholic Church, organised a separate “Trillion Peso March” along the historic EDSA Avenue. The group said they are only urging Duterte to resign as they wait for more concrete evidence of criminal activity by Marcos.\n\nSome 5,000 people attended that rally.\n\nThe police force said it deployed more than 12,000 officers to Manila for the protests, and barricaded all roads leading to the Malacanang presidential palace with barbed wire and container vans, stopping the KBKK protesters about a block away from its gates.\n\nThe protesters tore down the effigy in front of the barricades, cursing the Marcos government and chanting “Jail all the corrupt!”\n\nEarlier this month, Co, the former lawmaker, claimed that Marcos obtained more than 50 billion pesos ($852m) in kickbacks from infrastructure projects since 2022, and ordered the insertion of 100 billion pesos ($1.7bn) for so-called “ghost projects” in the 2025 budget.\n\nCo also claimed that in 2024 he personally delivered suitcases containing a billion pesos (US$17m) in cash to the Marcos residence.\n\nCo himself is accused of pocketing billions from the same projects and has been a fugitive since July, with Japan being his last known location.\n\n“Anyone can go online and make all kinds of claims,” Marcos said in response. “For it to mean something, he should come home,” the president added.\n\nWith or without Co’s accusations, Raymond Palatino of the Bagong Alyansang Makabayan (New Patriotic Alliance) or Bayan, one of the groups in the KBKK, said the president bears an undeniable responsibility for fraudulent public spending.\n\n“He feigns surprise over the extent of corruption, but he drafted, signed, and implemented the budget, a budget infested with pork barrel projects and anomalous insertions,” Palatino told Al Jazeera.\n\nPalatino called the heavy police presence “overkill” and a “waste of public resources”. He said both Marcos and Duterte must step aside “so the nation can begin to heal and rebuild”.\n\nAdvertisement\n\nFollowing their removal, Palatino urged the formation of a civilian-led transition council, a temporary entity to guide the country towards political renewal.\n\nPresidential press officer Claire Castro, however, has dismissed calls to remove the president, saying they are unconstitutional and come from “vested interests”.\n\n‘Bleeding out credibility’\n\nMarcos raised alarm over the scandal in July, during his State of the Nation address to Congress. In September, he formed the Independent Commission for Infrastructure (ICI) tasked with investigating officials linked to corruption.\n\nSome 9,855 flood-control projects, worth more than 545 billion pesos ($9bn) are under investigation.\n\nThe Senate and House also conducted their own hearings into the case.\n\nFinance Secretary told lawmakers in September that up to 118.5 billion pesos ($2bn) for flood control projects may have been lost to corruption since 2023.\n\nAmong those implicated are Marcos’s cousin and key ally, Martin Romualdez, who has denied any involvement but has stepped down as the House of Representatives speaker.\n\nThe ICI, meanwhile, has yet to look into allegations of misconduct by the president.\n\n“The ICI investigations have not inoculated him from accusations of wrongdoing,” said political science Professor Sol Iglesias from the University of the Philippines.\n\nShe said the “Marcos administration has been bleeding out its credibility” following the September protest and the police crackdown.\n\n“It would stretch the imagination that the president’s hands are clean, although we still haven’t seen the equivalent of a smoking gun,” Iglesias told Al Jazeera.	https://www.aljazeera.com/news/2025/11/30/thousands-rally-in-philippines-demanding-marcos-resign-over-graft-scandal	www.aljazeera.com	\N	21
90	Trillion Peso March | Events	Ateneo, Stand for Truth and Accountability!\n\nAteneo de Manila, through the Mission Integration Cluster, invites all Ateneo students, employees, and alumni to join the\n\nTrillion Peso March Movement\n\nin a peaceful rally against corruption and political dynasties.\n\nDate: Sunday, 30 November 2025\n\nVenue: EDSA People Power Monument\n\nAssembly at Ateneo: 7:15 AM\n\nDeparture from Ateneo: 8:00 AM\n\nAteneo Meeting Point: Zen Garden/Quad, College Complex, Loyola Heights Campus\n\nWear a white shirt; Bring Food and Drink (there may be limited food vendors in the area) and umbrella / hat\n\nSign up here:\n\nhttps://go.ateneo.edu/tpm-nov30-signup (ateneo.edu users)\n\nhttps://go.ateneo.edu/tpm-nov30-signup-alumni (alumni)\n\nA confirmation email will be sent to you upon successful registration.\n\nSign-ups will close on Thursday, 27 November 2025, at 8:00 PM.\n\nLet us continue to live out our Ignatian mission: to be persons for and with others, to speak truth to power, and to stand for justice and accountability.\n\nSama-sama tayong manindigan para sa katotohanan at para sa pananagutan!	http://www.ateneo.edu/events/2025-11-30-trillion-peso-march	www.ateneo.edu	\N	21
\.


--
-- TOC entry 4999 (class 0 OID 16463)
-- Dependencies: 227
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, search_id, entity_text, entity_label) FROM stdin;
56	24	march	SEARCH_KEYWORD
57	24	perso	SEARCH_KEYWORD
58	25	march	SEARCH_KEYWORD
59	25	peso	SEARCH_KEYWORD
60	26	march	SEARCH_KEYWORD
61	26	peso	SEARCH_KEYWORD
\.


--
-- TOC entry 4995 (class 0 OID 16433)
-- Dependencies: 223
-- Data for Name: conversationHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."conversationHistory" (chat_id, user_id, query_text, response_text, "timestamp", search_id) FROM stdin;
12379	32	Trillion Perso March 2025		2025-12-06 15:57:36.562463	24
12380	32	Trillion Peso March 2025		2025-12-06 16:42:03.546825	25
12381	32	Trillion Peso March		2025-12-06 16:45:37.791001	26
\.


--
-- TOC entry 4991 (class 0 OID 16399)
-- Dependencies: 219
-- Data for Name: search_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.search_results (result_id, query, results, created_at) FROM stdin;
21	Trillion Peso March	[{"url": "https://hapihumanist.org/2025/10/07/power-to-the-people-my-time-at-the-trillion-peso-march/", "title": "Power to the People: My Time at the Trillion Peso March", "content": "“The power of the people is much stronger than the people in power.”\\n\\n– Wael Ghonim\\n\\nThe Trillion Peso March was a huge wave of protests that swept across the Philippines on September 21, 2025. People from all walks of life – including church groups, student organizations, labor unions, civic groups, and political movements – came together to speak out against the massive corruption in government flood control projects. What sparked this event were the reports that out of the ₱1.9 trillion supposedly spent on these projects over the past 15 years, more than half may have been pocketed by corrupt officials. The protesters were fed up and wanted answers, demanding accountability for what they saw as a shocking crime in the misuse of public funds.\\n\\nWhat made the protests even more powerful was the date itself, because September 21 also marks the anniversary of the declaration of Martial Law and is closely tied to the spirit of the EDSA People Power Revolution. For many, marching in the streets on that day wasn’t just about the present corruption scandal; it was also a symbolic act, a way of honoring the country’s history of standing up to abuse of power and fighting for democracy.\\n\\nReports, infographics, and exposés about the purported corruption in the government’s flood control infrastructure projects were widely circulated on social media and in news outlets in the days preceding the Trillion Peso March. After assembling documents and budget breakdowns, it was discovered that the nation’s flooding issues had not significantly improved despite nearly ₱1.9 trillion being spent on flood control. More than half of that money may have been lost to kickbacks, ghost projects, and overpriced contracts. Public indignation rose over these revelations, which swiftly went viral online and fueled calls for protests across the country.\\n\\nAccording to reports, an estimated 60,000 souls took to the streets, many of them carrying placards that showcased causes they are passionate about; cameras to document a momentous event; and a burning desire to give justice to all Filipinos.\\n\\nMy friends (including fellow HAPIsko Kelly Kim Sepida) and I were among those who marched in the Bacolod protests: we walked from Provincial Lagoon to Public Plaza where the event culminated, and where various speakers from different sectors, including the youth, lawyers, transport groups, religious sectors, and various organizations took to the stage and spoke words that all the protesters echoed.\\n\\nThe Trillion Peso March trended all over social media, showing the power of people coming together to call out injustices and crimes by people in positions of power.\\n\\nShouting and walking together with other Filipinos from various walks of life is an empowering feeling. It leaves a sense of hope and a spark of change. But the real challenge would be the things that will come after it, after the elation and noise of the protest, what would we do next?\\n\\nWe have to never forget about the anger, keep ourselves informed about what is happening in these countless hearings and speeches that these accused are preaching about. When the time comes to be present in the streets again, we’ll be much more powerful.", "entities": [["Wael Ghonim", "PERSON"], ["March", "DATE"], ["Philippines", "GPE"], ["September 21, 2025", "DATE"], ["₱1.9 trillion", "MONEY"], ["the past 15 years", "DATE"], ["more than half", "CARDINAL"], ["September 21", "DATE"], ["Martial Law", "PERSON"], ["the EDSA People Power Revolution", "ORG"], ["that day", "DATE"], ["the days", "DATE"], ["the Trillion Peso", "ORG"], ["March", "DATE"], ["More than half", "CARDINAL"], ["an estimated 60,000", "CARDINAL"], ["Filipinos", "NORP"], ["Kelly Kim Sepida", "PERSON"], ["Bacolod", "ORG"], ["Provincial Lagoon", "FAC"], ["The Trillion Peso", "ORG"], ["March", "DATE"], ["Filipinos", "NORP"]], "verified": false, "is_trusted": false}, {"url": "https://www.examiner.org.hk/2025/12/05/trillion-peso-march-rejects-corruption-calls-for-defence-of-democracy-demands-change/news/", "title": "Trillion Peso March rejects corruption, calls for defence of ...", "content": "Protesters during the Trillion Peso March on November 30. Photo: RVA News/Ang Pahayagang Plaridel\\n\\nMANILA (LiCAS News/RVA News): “We are here at the EDSA People Power Monument because we do not want quick fixes. We do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society,” said Pablo Virgilio Cardinal David of Kalookan in remarks after Mass on November 30, addressing thousands who joined the expanded “Trillion Peso March” actions across the country.\\n\\nCardinal David invoked the legacy of the 1986 EDSA Uprising on Sunday as he defended the decision to gather protesters at the People Power Monument, in Quezon City, saying the movement sought to uphold democratic principles and reject any path toward violent or unconstitutional change.\\n\\nThe cardinal noted that Luneta was not chosen as the main venue since protesters there have “a call that we do not yet agree with,” adding that the Church-led anti-corruption rally respects other protest groups “who have already come to that call because they are tired of a corrupt system.”\\n\\nHe observed, “We are tired too. But if it is ‘resign all’ immediately, what is the alternative? What comes after?”\\n\\nWe do not need to burn the whole house down when what we want is to catch and hold accountable the cockroaches and rats in our society Cardinal David\\n\\nHe said organisers also avoided Mendiola [near Malacañang Palace] because of its history of tension and the presence of groups intent on confrontation.\\n\\n“We do not want violence and disorder. We are disciples of democracy. Who would not be afraid to go to Mendiola when your companions there are people covering their faces, inciting anger, beating the police, destroying traffic lights, and throwing Molotov cocktails?” he asked.\\n\\nCardinal David said the protests firmly oppose any push for military intervention, a revolutionary government, a transitional council, or a junta.\\n\\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions.\\n\\nThe cardinal also thanked uniformed personnel at the rally for upholding their oaths, noting their presence at EDSA and their assistance to participants. He said the troops demonstrated fidelity to the Constitution and expressed gratitude for their role in defending democratic values.\\n\\nAdvertisements As we celebrate the 500 years of Christianity in the Philippines. The Chaplaincy to Filipino Migrants organises an on-line talk every Tuesday at 9.00pm. You can join us at: https://www.Facebook.com/CFM-Gifted-to-give-101039001847033\\n\\nHe emphasised that Church leaders have no role in political power or governance and that their responsibility lies in providing moral and spiritual leadership, not occupying government positions\\n\\nFrom this stance, he said the protests aim to restore transparency and strengthen oversight mechanisms that have “failed,” allowing corruption to spread unchecked.\\n\\nHe noted that pork barrel [discretionary funds] practices declared unconstitutional years ago continue to reappear in the national budget through “hundreds of billions of pesos of flood control and other infrastructure projects,” many of which he described as “ghosts.”\\n\\nThe cardinal noted, “Those ghosts are very expensive. Ghosts that fatten the pockets of politicians with no shame.”\\n\\nHe warned that patronage politics and political dynasties continue to entrench inequality, calling them “a very serious cancer” that weakens national life.\\n\\nCardinal David called on lawmakers to pass long-delayed reforms, including the anti-political dynasty law, the Budget Transparency Act, the Freedom of Information Act, party development reforms, and reviews of the party-list system and Local Government Code.\\n\\nWe do not want a government that kills. We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist Cardinal David\\n\\nAddressing the president, Ferdinand Marcos Jr., the cardinal reminded him of his constitutional duty. “You swore to the 1987 Constitution,” he said, adding, alluding to mounting budget controversies, “Because you yourself said it in your State of the Nation Address—have some shame.”\\n\\nHe called on the president to show full political will in addressing corruption, urging him to continue the effort he began and to allow a fully transparent investigation that would hold wrongdoers accountable based on evidence.\\n\\nCardinal David also denounced the return of authoritarian impulses and condemned past extrajudicial killings linked to anti-drug operations.\\n\\n“We do not want a government that kills,” he said. “We do not believe that society can be fixed through shortcuts, especially through the use of an iron fist.”\\n\\nare starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent Catriona Gray\\n\\nThe cardinal called on Filipinos to reclaim democratic values and continue the unfinished work of nation-building.\\n\\n“We dream of a country that is prosperous, peaceful, and fair to all,” he said, “a country united in heart and spirit for the common good.”\\n\\nSpeaking at the rally, former Miss Universe Catriona Gray, was reported by RVA News warning that “every time we stay quiet, corruption wins” as she urged for cases to be filed over missing public funds.\\n\\nShe said that Filipinos are “tired of watching corruption steal food from our tables, steal medicines from our hospitals, classrooms from our children, and safety from our communities.”\\n\\nGray added that what scares her most is that many “are starting to forget why we are angry. People have gone silent not because they do not care, but because they have lost the belief that change will ever come. And while our nation grows exhausted, our leaders remain silent.”\\n\\nShe asked how many more floods, scandals and stolen funds it would take “before we finally say, enough!”\\n\\nSome 92,00 people took part in at least 119 peaceful demonstrations across the country, in locations including, Antipolo, Cebu, Metro Manila, Legazpi City, and other locations.\\n\\n___________________________________________________________________________", "entities": [["the Trillion Peso", "FAC"], ["March", "DATE"], ["November 30", "DATE"], ["RVA News/Ang Pahayagang Plaridel", "ORG"], ["the EDSA People Power Monument", "ORG"], ["Kalookan", "NORP"], ["November 30", "DATE"], ["thousands", "CARDINAL"], ["Trillion Peso", "WORK_OF_ART"], ["March", "DATE"], ["David", "PERSON"], ["1986", "DATE"], ["EDSA Uprising", "ORG"], ["Sunday", "DATE"], ["the People Power Monument", "ORG"], ["Quezon City", "GPE"], ["Luneta", "PERSON"], ["Church", "ORG"], ["Mendiola", "ORG"], ["Malacañang Palace", "FAC"], ["Mendiola", "ORG"], ["Cardinal David", "PERSON"], ["Church", "ORG"], ["EDSA", "ORG"], ["Constitution", "LAW"], ["the 500 years", "DATE"], ["Christianity", "NORP"], ["Philippines", "GPE"], ["Filipino", "LANGUAGE"], ["9.00pm", "CARDINAL"], ["Church", "ORG"], ["years ago", "DATE"], ["hundreds of billions", "MONEY"], ["David", "PERSON"], ["the Budget Transparency Act", "LAW"], ["the Freedom of Information Act", "LAW"], ["Local Government Code", "ORG"], ["Cardinal David", "PERSON"], ["Ferdinand Marcos Jr.", "PERSON"], ["the 1987 Constitution", "EVENT"], ["the Nation Address", "ORG"], ["Cardinal David", "PERSON"], ["Catriona Gray", "PERSON"], ["Filipinos", "NORP"], ["democratic", "NORP"], ["Universe", "PERSON"], ["Catriona Gray", "PERSON"], ["RVA News", "ORG"], ["Filipinos", "NORP"], ["at least 119", "CARDINAL"], ["Antipolo", "GPE"], ["Cebu", "GPE"], ["Legazpi City", "GPE"]], "verified": false, "is_trusted": false}, {"url": "https://www.aljazeera.com/news/2025/11/30/thousands-rally-in-philippines-demanding-marcos-resign-over-graft-scandal", "title": "Thousands march in Philippines, demanding Marcos ...", "content": "Claims that President Ferdinand Marcos Jr took kickbacks from infrastructure projects cause outrage in the Philippines.\\n\\nManila, Philippines – Tens of thousands of people have marched in the Philippine capital, Manila, demanding President Ferdinand Marcos Jr’s resignation over a corruption scandal linked to government spending on flood-control infrastructure.\\n\\nThe rally, organised by the Kilusang Bayan Kontra-Kurakot or the People’s Movement Against Corruption (KBKK), began at the Luneta National Park in Manila on Sunday, with protesters marching on to the presidential palace.\\n\\nSome carried an effigy of Marcos and Vice President Sara Duterte, depicting the politicians as crocodiles and dubbed the “corrupt-codile”, while others held signs that read “Marcos Resign” and “All corrupt politicians must be held accountable”.\\n\\nOrganisers said they estimated the crowd to be more than 20,000.\\n\\nIt is the last display of public anger over the “Trillion-Peso” scandal, in which powerful politicians, including Marcos’s allies, are accused of pocketing billions of pesos in bribes for contracts on flood-control infrastructure that ended up being defective or were never built at all.\\n\\nExtensive damage from two recent powerful typhoons, which killed more than 250 people, has spurred public outrage.\\n\\nTwo cabinet ministers have resigned over the scandal, while a former lawmaker accused in the case, Zaldy Co, has alleged that Marcos directed him to add $1.7bn to the budget for “dubious public works” while he headed an appropriations committee.\\n\\nThe president has denied the claims.\\n\\n‘They keep treating us like fools’\\n\\nAmong those at Sunday’s protest was 21-year-old student Matt Wovi Villanueva, who also took part in a similar protest at the presidential palace in September. That protest turned violent with the police arresting some 300 people.\\n\\nAdvertisement\\n\\nVillanueva said he was beaten and detained for five days then.\\n\\n“Compared to September, we have more reasons to go back to the streets now,” Villanueva told Al Jazeera. “They keep treating us like fools. If we want real justice, we need Marcos and [Vice President Sara] Duterte to resign.”\\n\\nDuterte, the daughter of former President Rodrigo Duterte, who has fallen out with Marcos, is facing separate allegations over the misuse of government funds.\\n\\nMeanwhile, mainstream opposition forces, backed by the Catholic Church, organised a separate “Trillion Peso March” along the historic EDSA Avenue. The group said they are only urging Duterte to resign as they wait for more concrete evidence of criminal activity by Marcos.\\n\\nSome 5,000 people attended that rally.\\n\\nThe police force said it deployed more than 12,000 officers to Manila for the protests, and barricaded all roads leading to the Malacanang presidential palace with barbed wire and container vans, stopping the KBKK protesters about a block away from its gates.\\n\\nThe protesters tore down the effigy in front of the barricades, cursing the Marcos government and chanting “Jail all the corrupt!”\\n\\nEarlier this month, Co, the former lawmaker, claimed that Marcos obtained more than 50 billion pesos ($852m) in kickbacks from infrastructure projects since 2022, and ordered the insertion of 100 billion pesos ($1.7bn) for so-called “ghost projects” in the 2025 budget.\\n\\nCo also claimed that in 2024 he personally delivered suitcases containing a billion pesos (US$17m) in cash to the Marcos residence.\\n\\nCo himself is accused of pocketing billions from the same projects and has been a fugitive since July, with Japan being his last known location.\\n\\n“Anyone can go online and make all kinds of claims,” Marcos said in response. “For it to mean something, he should come home,” the president added.\\n\\nWith or without Co’s accusations, Raymond Palatino of the Bagong Alyansang Makabayan (New Patriotic Alliance) or Bayan, one of the groups in the KBKK, said the president bears an undeniable responsibility for fraudulent public spending.\\n\\n“He feigns surprise over the extent of corruption, but he drafted, signed, and implemented the budget, a budget infested with pork barrel projects and anomalous insertions,” Palatino told Al Jazeera.\\n\\nPalatino called the heavy police presence “overkill” and a “waste of public resources”. He said both Marcos and Duterte must step aside “so the nation can begin to heal and rebuild”.\\n\\nAdvertisement\\n\\nFollowing their removal, Palatino urged the formation of a civilian-led transition council, a temporary entity to guide the country towards political renewal.\\n\\nPresidential press officer Claire Castro, however, has dismissed calls to remove the president, saying they are unconstitutional and come from “vested interests”.\\n\\n‘Bleeding out credibility’\\n\\nMarcos raised alarm over the scandal in July, during his State of the Nation address to Congress. In September, he formed the Independent Commission for Infrastructure (ICI) tasked with investigating officials linked to corruption.\\n\\nSome 9,855 flood-control projects, worth more than 545 billion pesos ($9bn) are under investigation.\\n\\nThe Senate and House also conducted their own hearings into the case.\\n\\nFinance Secretary told lawmakers in September that up to 118.5 billion pesos ($2bn) for flood control projects may have been lost to corruption since 2023.\\n\\nAmong those implicated are Marcos’s cousin and key ally, Martin Romualdez, who has denied any involvement but has stepped down as the House of Representatives speaker.\\n\\nThe ICI, meanwhile, has yet to look into allegations of misconduct by the president.\\n\\n“The ICI investigations have not inoculated him from accusations of wrongdoing,” said political science Professor Sol Iglesias from the University of the Philippines.\\n\\nShe said the “Marcos administration has been bleeding out its credibility” following the September protest and the police crackdown.\\n\\n“It would stretch the imagination that the president’s hands are clean, although we still haven’t seen the equivalent of a smoking gun,” Iglesias told Al Jazeera.", "entities": [["Ferdinand Marcos Jr", "PERSON"], ["Philippines", "GPE"], ["Manila", "GPE"], ["Philippines", "GPE"], ["Tens of thousands", "CARDINAL"], ["Philippine", "NORP"], ["Manila", "GPE"], ["Ferdinand Marcos Jr’s", "PERSON"], ["the Kilusang Bayan Kontra-Kurakot", "ORG"], ["the People’s Movement Against Corruption", "ORG"], ["KBKK", "ORG"], ["the Luneta National Park", "FAC"], ["Manila", "GPE"], ["Sunday", "DATE"], ["Marcos", "PERSON"], ["Sara Duterte", "PERSON"], ["Marcos Resign", "WORK_OF_ART"], ["more than 20,000", "CARDINAL"], ["the “Trillion-Peso", "ORG"], ["Marcos", "PERSON"], ["billions", "CARDINAL"], ["two", "CARDINAL"], ["more than 250", "CARDINAL"], ["Two", "CARDINAL"], ["Zaldy Co", "PERSON"], ["Marcos", "PERSON"], ["1.7bn", "MONEY"], ["Sunday", "DATE"], ["21-year-old", "DATE"], ["Matt Wovi Villanueva", "PERSON"], ["September", "DATE"], ["some 300", "CARDINAL"], ["Villanueva", "ORG"], ["five days", "DATE"], ["September", "DATE"], ["Villanueva", "ORG"], ["Al Jazeera", "ORG"], ["Marcos", "PERSON"], ["Rodrigo Duterte", "PERSON"], ["Marcos", "PERSON"], ["the Catholic Church", "ORG"], ["Trillion Peso", "WORK_OF_ART"], ["March", "DATE"], ["EDSA Avenue", "ORG"], ["Duterte", "ORG"], ["Marcos", "PERSON"], ["Some 5,000", "CARDINAL"], ["more than 12,000", "CARDINAL"], ["Manila", "GPE"], ["Malacanang", "PERSON"], ["KBKK", "ORG"], ["Marcos", "PERSON"], ["Earlier this month", "DATE"], ["Co", "ORG"], ["Marcos", "PERSON"], ["more than 50 billion", "MONEY"], ["852", "MONEY"], ["2022", "DATE"], ["100 billion", "MONEY"], ["1.7bn", "MONEY"], ["2025", "DATE"], ["2024", "DATE"], ["US$17m", "MONEY"], ["Marcos", "PERSON"], ["billions", "CARDINAL"], ["July", "DATE"], ["Japan", "GPE"], ["Marcos", "PERSON"], ["Co", "ORG"], ["Raymond Palatino", "PERSON"], ["the Bagong Alyansang Makabayan", "ORG"], ["New Patriotic Alliance", "ORG"], ["Bayan", "NORP"], ["one", "CARDINAL"], ["KBKK", "ORG"], ["Palatino", "PERSON"], ["Al Jazeera", "ORG"], ["Palatino", "LOC"], ["Marcos", "PERSON"], ["Palatino", "LOC"], ["Claire Castro", "PERSON"], ["Marcos", "PERSON"], ["July", "DATE"], ["State of the Nation", "ORG"], ["Congress", "ORG"], ["September", "DATE"], ["the Independent Commission for Infrastructure", "ORG"], ["ICI", "ORG"], ["Some 9,855", "CARDINAL"], ["more than 545 billion", "MONEY"], ["9bn", "MONEY"], ["Senate", "ORG"], ["House", "ORG"], ["September", "DATE"], ["118.5 billion", "CARDINAL"], ["2bn", "MONEY"], ["2023", "DATE"], ["Marcos", "PERSON"], ["Martin Romualdez", "PERSON"], ["the House of Representatives", "ORG"], ["ICI", "ORG"], ["ICI", "ORG"], ["Sol Iglesias", "PERSON"], ["the University of the Philippines", "ORG"], ["Marcos", "PERSON"], ["September", "DATE"], ["Iglesias", "PERSON"], ["Al Jazeera", "ORG"]], "verified": false, "is_trusted": false}, {"url": "http://www.ateneo.edu/events/2025-11-30-trillion-peso-march", "title": "Trillion Peso March | Events", "content": "Ateneo, Stand for Truth and Accountability!\\n\\nAteneo de Manila, through the Mission Integration Cluster, invites all Ateneo students, employees, and alumni to join the\\n\\nTrillion Peso March Movement\\n\\nin a peaceful rally against corruption and political dynasties.\\n\\nDate: Sunday, 30 November 2025\\n\\nVenue: EDSA People Power Monument\\n\\nAssembly at Ateneo: 7:15 AM\\n\\nDeparture from Ateneo: 8:00 AM\\n\\nAteneo Meeting Point: Zen Garden/Quad, College Complex, Loyola Heights Campus\\n\\nWear a white shirt; Bring Food and Drink (there may be limited food vendors in the area) and umbrella / hat\\n\\nSign up here:\\n\\nhttps://go.ateneo.edu/tpm-nov30-signup (ateneo.edu users)\\n\\nhttps://go.ateneo.edu/tpm-nov30-signup-alumni (alumni)\\n\\nA confirmation email will be sent to you upon successful registration.\\n\\nSign-ups will close on Thursday, 27 November 2025, at 8:00 PM.\\n\\nLet us continue to live out our Ignatian mission: to be persons for and with others, to speak truth to power, and to stand for justice and accountability.\\n\\nSama-sama tayong manindigan para sa katotohanan at para sa pananagutan!", "entities": [["Stand for Truth", "ORG"], ["the Mission Integration Cluster", "ORG"], ["Ateneo", "ORG"], ["the\\n\\nTrillion Peso March Movement\\n\\n", "ORG"], ["Sunday", "DATE"], ["30", "CARDINAL"], ["November 2025", "DATE"], ["7:15 AM\\n\\n", "TIME"], ["Ateneo", "ORG"], ["8:00 AM", "TIME"], ["Loyola Heights Campus\\n\\nWear", "ORG"], ["Bring Food and Drink", "ORG"], ["Thursday", "DATE"], ["27 November 2025", "DATE"], ["8:00 PM", "TIME"], ["Ignatian", "NORP"], ["Sama", "GPE"], ["tayong manindigan", "PERSON"], ["para sa", "FAC"], ["katotohanan", "GPE"], ["para sa pananagutan", "FAC"]], "verified": false, "is_trusted": false}]	2025-12-06 16:45:47.767965
\.


--
-- TOC entry 4997 (class 0 OID 16448)
-- Dependencies: 225
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.searches (search_id, account_id, query_text, "timestamp") FROM stdin;
24	32	Trillion Perso March 2025	2025-12-06 15:57:36.562463
25	32	Trillion Peso March 2025	2025-12-06 16:42:03.546825
26	32	Trillion Peso March	2025-12-06 16:45:37.791001
\.


--
-- TOC entry 5005 (class 0 OID 16536)
-- Dependencies: 233
-- Data for Name: userreview; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userreview (review_id, user_id, result_id, rating, review_text, created_at) FROM stdin;
\.


--
-- TOC entry 4993 (class 0 OID 16420)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, uuid, hashed_password, role, created_at, username) FROM stdin;
32	648921c4-fd94-4298-a31b-208524823dad	scrypt:32768:8:1$y9Nc3T3u4iUUIkcY$667a72c60c76a8e8d4100a3314c75ff7a21a8a31c0529f9c2319dfb785e63b8d54de9b66d4cdf28d37599036c3ce4d905c8fac0b6223166f80e8e4e6ab0e6dc9	user	2025-12-06 15:57:16.500215	Daddd
\.


--
-- TOC entry 5003 (class 0 OID 16493)
-- Dependencies: 231
-- Data for Name: usersummaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usersummaries (summary_id, user_id, result_id, summary_text, created_at) FROM stdin;
23	32	21	⚠️ Summarized from unverified sources:\n\nIn the Philippines, mass demonstrations known as the Trillion Peso March took place on September 21 and November 30, 2025, organized by various groups including church organizations, student unions, and political coalitions. The protests were prompted by allegations of widespread corruption in government flood control infrastructure projects, with reports suggesting that over ₱1.9 trillion (US$33 billion) had been spent in the last 15 years, a significant portion allegedly lost to corruption. Protesters demanded transparency, accountability, and stronger anti-corruption measures, with rallies occurring in Metro Manila and other cities. On September 21, some demonstrators clashed with police, resulting in injuries and arrests, while the November 30 protests were reported as peaceful. The Philippine National Police increased security in response, and President Marcos expressed support for peaceful protests, while authorities warned against potential exploitation of the situation by certain actors.	2025-12-06 16:45:47.767965
\.


--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 234
-- Name: articlecount_count_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articlecount_count_id_seq', 1, true);


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 228
-- Name: articles_article_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_article_id_seq', 90, true);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 226
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 61, true);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 222
-- Name: chats_chat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_chat_id_seq', 12381, true);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 218
-- Name: search_results_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.search_results_result_id_seq', 21, true);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 224
-- Name: searches_search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.searches_search_id_seq', 26, true);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 232
-- Name: userreview_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userreview_review_id_seq', 1, false);


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 220
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 32, true);


--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 230
-- Name: usersummaries_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usersummaries_summary_id_seq', 23, true);


--
-- TOC entry 4834 (class 2606 OID 16954)
-- Name: articlecount articlecount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount
    ADD CONSTRAINT articlecount_pkey PRIMARY KEY (count_id);


--
-- TOC entry 4826 (class 2606 OID 16486)
-- Name: articles articles_article_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_article_url_key UNIQUE (article_url);


--
-- TOC entry 4828 (class 2606 OID 16484)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (article_id);


--
-- TOC entry 4824 (class 2606 OID 16470)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 4819 (class 2606 OID 16441)
-- Name: conversationHistory chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_pkey PRIMARY KEY (chat_id);


--
-- TOC entry 4811 (class 2606 OID 16407)
-- Name: search_results search_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.search_results
    ADD CONSTRAINT search_results_pkey PRIMARY KEY (result_id);


--
-- TOC entry 4822 (class 2606 OID 16456)
-- Name: searches searches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_pkey PRIMARY KEY (search_id);


--
-- TOC entry 4832 (class 2606 OID 16542)
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
-- TOC entry 4815 (class 2606 OID 16556)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4817 (class 2606 OID 16431)
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- TOC entry 4830 (class 2606 OID 16501)
-- Name: usersummaries usersummaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_pkey PRIMARY KEY (summary_id);


--
-- TOC entry 4820 (class 1259 OID 16634)
-- Name: idx_conversation_search_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversation_search_id ON public."conversationHistory" USING btree (search_id);


--
-- TOC entry 4844 (class 2606 OID 16955)
-- Name: articlecount articlecount_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articlecount
    ADD CONSTRAINT articlecount_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4839 (class 2606 OID 16487)
-- Name: articles articles_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4838 (class 2606 OID 16471)
-- Name: categories categories_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_search_id_fkey FOREIGN KEY (search_id) REFERENCES public.searches(search_id);


--
-- TOC entry 4835 (class 2606 OID 16442)
-- Name: conversationHistory chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4836 (class 2606 OID 16557)
-- Name: conversationHistory conversationHistory_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."conversationHistory"
    ADD CONSTRAINT "conversationHistory_search_id_fkey" FOREIGN KEY (search_id) REFERENCES public.searches(search_id);


--
-- TOC entry 4837 (class 2606 OID 16457)
-- Name: searches searches_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT searches_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.users(user_id);


--
-- TOC entry 4842 (class 2606 OID 16548)
-- Name: userreview userreview_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4843 (class 2606 OID 16543)
-- Name: userreview userreview_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userreview
    ADD CONSTRAINT userreview_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 4840 (class 2606 OID 16507)
-- Name: usersummaries usersummaries_result_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_result_id_fkey FOREIGN KEY (result_id) REFERENCES public.search_results(result_id);


--
-- TOC entry 4841 (class 2606 OID 16502)
-- Name: usersummaries usersummaries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersummaries
    ADD CONSTRAINT usersummaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


-- Completed on 2025-12-06 17:07:47

--
-- PostgreSQL database dump complete
--

\unrestrict MFLesgfKJHoBs6RnhaAWzlUXWa97xu6KhJNrVVykB2NYGtXnTaVBiIN01IMCJs2

