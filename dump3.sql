--
-- PostgreSQL database dump
--

\restrict 1hAYLIC3W88G4Jeqxu8SiEricbONHLanRuTPoys31AZAlH9hiqsB2uOmxjAV6nA

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    recipient_id integer,
    user_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    message text NOT NULL,
    link character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipients (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100),
    phone character varying(50),
    city character varying(100),
    organization character varying(100),
    specialization character varying(100),
    comment text,
    extra jsonb,
    imported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recipients OWNER TO postgres;

--
-- Name: recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipients_id_seq OWNER TO postgres;

--
-- Name: recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recipients_id_seq OWNED BY public.recipients.id;


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reminders (
    id integer NOT NULL,
    recipient_id integer,
    recipient_email character varying(255),
    reminder_date timestamp without time zone NOT NULL,
    message text,
    is_completed boolean DEFAULT false,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reminders OWNER TO postgres;

--
-- Name: reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reminders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reminders_id_seq OWNER TO postgres;

--
-- Name: reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reminders_id_seq OWNED BY public.reminders.id;


--
-- Name: send_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.send_logs (
    id integer NOT NULL,
    recipient_email character varying(255) NOT NULL,
    sender_id integer,
    subject character varying(255),
    body_preview text,
    status character varying(50),
    error_message text,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.send_logs OWNER TO postgres;

--
-- Name: send_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.send_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.send_logs_id_seq OWNER TO postgres;

--
-- Name: send_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.send_logs_id_seq OWNED BY public.send_logs.id;


--
-- Name: senders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.senders (
    id integer NOT NULL,
    name character varying(100),
    email character varying(255) NOT NULL,
    host character varying(100),
    port integer,
    secure integer DEFAULT 1,
    password character varying(255),
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.senders OWNER TO postgres;

--
-- Name: senders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.senders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.senders_id_seq OWNER TO postgres;

--
-- Name: senders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.senders_id_seq OWNED BY public.senders.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'todo'::character varying,
    assigned_to integer,
    deadline timestamp without time zone,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name character varying(100),
    subject character varying(255),
    body text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.templates OWNER TO postgres;

--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.templates_id_seq OWNER TO postgres;

--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: recipients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients ALTER COLUMN id SET DEFAULT nextval('public.recipients_id_seq'::regclass);


--
-- Name: reminders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders ALTER COLUMN id SET DEFAULT nextval('public.reminders_id_seq'::regclass);


--
-- Name: send_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.send_logs ALTER COLUMN id SET DEFAULT nextval('public.send_logs_id_seq'::regclass);


--
-- Name: senders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senders ALTER COLUMN id SET DEFAULT nextval('public.senders_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, recipient_id, user_id, comment, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, message, link, is_read, created_at) FROM stdin;
1	1	task_done	Задача "олдвыа" выполнена	/app/dashboard	t	2026-08-24 14:14:06.517277
2	1	task_done	Задача "олдвыа" выполнена	/app/dashboard	t	2026-08-24 14:20:52.898072
3	1	task_done	Задача "олдвыа" выполнена	/app/dashboard	t	2026-08-24 14:30:23.806816
4	1	task_done	Задача "олдвыа" выполнена	/app/dashboard	t	2026-08-24 14:34:34.836499
5	1	task_done	Задача "рпрпрп" выполнена	/app/dashboard	t	2026-08-24 16:59:29.249099
\.


--
-- Data for Name: recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recipients (id, email, name, phone, city, organization, specialization, comment, extra, imported_at) FROM stdin;
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reminders (id, recipient_id, recipient_email, reminder_date, message, is_completed, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: send_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.send_logs (id, recipient_email, sender_id, subject, body_preview, status, error_message, sent_at) FROM stdin;
\.


--
-- Data for Name: senders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.senders (id, name, email, host, port, secure, password, user_id, created_at) FROM stdin;
1	Моя почта	stas21kom12@gmail.com	smtp.gmail.com	465	1	pxkr hpfx pift gybn	1	2026-08-24 13:10:23.449928
2	Корпоративная почта	IgoshinaDA@ieml.ru	smtp.yandex.ru	587	0	hlpscnofdopaqkaf	1	2026-08-25 13:50:12.886531
3	Корпоративная почта	IgoshinaDA@ieml.ru	smtp.yandex.ru	587	0	hlpscnofdopaqkaf	38	2026-08-26 10:50:41.302039
4	Корпоративная почта	MylnikovaAA@ieml.ru	smtp.yandex.ru	587	0	eacjjrkdeeawtzui	30	2026-08-26 10:58:23.649845
5	Корпоративная почта	muhamethanova@ieml.ru	smtp.yandex.ru	587	0	ayhzvpqesujbbepv	31	2026-08-26 11:00:25.550955
6	Корпоративная почта	azinaaa@ieml.ru	smtp.yandex.ru	587	0	lvyefdqsvjpwqwrl	32	2026-08-26 11:01:53.90858
7	Корпоративная почта	gimadievaai3@ieml.ru	smtp.yandex.ru	587	0	ocpvorahowfafzoh	33	2026-08-26 11:04:00.299802
8	Корпоративная почта	PetukhovaAK@ieml.ru	smtp.yandex.ru	587	0	rmuguqkokuenqabl	34	2026-08-26 11:06:04.958082
9	Корпоративная почта	aapakova@ieml.ru	smtp.yandex.ru	587	0	uilvmumidcsjrtho	35	2026-08-26 11:07:20.530674
10	Корпоративная почта	tovkalevaao@ieml.ru	smtp.yandex.ru	587	0	chvyvcnqevjnyyal	39	2026-08-27 11:43:06.091203
11	Корпоративная почта	bakhshalievin@ieml.ru	smtp.yandex.ru	587	0	uraikjcibrvyvltd	40	2026-08-27 11:44:03.492742
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, status, assigned_to, deadline, user_id, created_at, updated_at) FROM stdin;
1	олдвыа	выааыв	todo	1	\N	1	2026-08-24 14:03:00.005951	2026-08-25 09:03:38.139395
3	fef	erttr	todo	1	\N	1	2026-08-25 09:28:58.366728	2026-08-25 09:28:58.366728
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.templates (id, name, subject, body, created_at) FROM stdin;
1	Приветствие	Привет, {name}!	<h1>Здравствуйте, {name}!</h1><p>Рады видеть вас на нашем курсе возможно.</p>	2026-08-24 13:20:15.689138
2	Основной шаблон	Курс по {specialization} для {name}	<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset=\\"UTF-8\\">\\n  <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n  <style>\\n    body { font-family: Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }\\n    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }\\n    .header { text-align: center; border-bottom: 2px solid #4a90d9; padding-bottom: 20px; }\\n    .header h1 { color: #2c3e50; font-size: 24px; margin: 0; }\\n    .content { padding: 20px 0; line-height: 1.6; color: #333; }\\n    .content p { margin: 15px 0; }\\n    .cta-button { display: inline-block; background: #4a90d9; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }\\n    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }\\n  </style>\\n</head>\\n<body> \\n  <div class=\\"container\\">\\n    <div class=\\"header\\">\\n      <h1>🎓 Образовательный центр</h1>\\n    </div>\\n    <div class=\\"content\\">\\n      <p><strong>Здравствуйте, {name}!</strong></p>\\n      <p>Мы знаем, что вы интересуетесь направлением <strong>«{specialization}»</strong> и живёте в городе <strong>{city}</strong>.</p>\\n      <p>Именно для таких специалистов, как вы, мы запустили новый курс <strong>«Мастерство в {specialization}»</strong> – практическое обучение с реальными кейсами и поддержкой наставников.</p>\\n      <p><strong>Что вас ждёт:</strong></p>\\n      <ul>\\n        <li>✅ 10 модулей с видеоуроками и домашними заданиями</li>\\n        <li>✅ Живые вебинары с экспертами</li>\\n        <li>✅ Чат с кураторами и участниками</li>\\n        <li>✅ Сертификат по окончании</li>\\n      </ul>\\n      <p style=\\"text-align: center;\\">\\n        <a href=\\"https://your-course-link.com\\" class=\\"cta-button\\">Узнать подробнее и записаться</a>\\n      </p>\\n      <p>До 31 августа действует скидка 20% по промокоду <strong>CRM2026</strong>.</p>\\n      <p>Если у вас есть вопросы – просто ответьте на это письмо, мы всегда на связи.</p>\\n      <p>С уважением,<br>Команда Образовательного центра</p>\\n    </div>\\n    <div class=\\"footer\\">\\n      <p>Вы получили это письмо, потому что подписаны на наши обновления. <a href=\\"#\\">Отписаться</a></p>\\n      <p>© 2026 Образовательный центр. Все права защищены.</p>\\n    </div>\\n  </div>\\n</body>\\n</html>	2026-08-24 13:20:40.549192
3	Приветствие22	Курс по {specialization} для {name}	<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body { font-family: Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }\n    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; }\n    .header { text-align: center; border-bottom: 2px solid #4a90d9; padding-bottom: 20px; }\n    .header h1 { color: #2c3e50; font-size: 24px; margin: 0; }\n    .content { padding: 20px 0; line-height: 1.6; color: #333; }\n    .content p { margin: 15px 0; }\n    .cta-button { display: inline-block; background: #4a90d9; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }\n    .footer { text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="header">\n      <h1>🎓 Образовательный центр</h1>\n    </div>\n    <div class="content">\n      <p><strong>Здравствуйте, {name}!</strong></p>\n      <p>Мы знаем, что вы интересуетесь направлением <strong>«{specialization}»</strong> и живёте в городе <strong>{city}</strong>.</p>\n      <p>Именно для таких специалистов, как вы, мы запустили новый курс <strong>«Мастерство в {specialization}»</strong> – практическое обучение с реальными кейсами и поддержкой наставников.</p>\n      <p><strong>Что вас ждёт:</strong></p>\n      <ul>\n        <li>✅ 10 модулей с видеоуроками и домашними заданиями</li>\n        <li>✅ Живые вебинары с экспертами</li>\n        <li>✅ Чат с кураторами и участниками</li>\n        <li>✅ Сертификат по окончании</li>\n      </ul>\n      <p style="text-align: center;">\n        <a href="https://your-course-link.com" class="cta-button">Узнать подробнее и записаться</a>\n      </p>\n      <p>До 31 августа действует скидка 20% по промокоду <strong>CRM2026</strong>.</p>\n      <p>Если у вас есть вопросы – просто ответьте на это письмо, мы всегда на связи.</p>\n      <p>С уважением,<br>Команда Образовательного центра</p>\n    </div>\n    <div class="footer">\n      <p>Вы получили это письмо, потому что подписаны на наши обновления. <a href="#">Отписаться</a></p>\n      <p>© 2026 Образовательный центр. Все права защищены.</p>\n    </div>\n  </div>\n</body>\n</html>	2026-08-24 15:35:06.709121
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, role, created_at) FROM stdin;
1	admin@example.com	$2b$10$MrCgl5Ll8pHvB2pVa3P7iOioqrH3B9JfptLq.G6VFFp3H8ajRtg5a	Администратор	admin	2026-08-24 12:35:27.11546
28	stuska@gmail.com	$2b$10$S5I29Ej9n/kYA.zz8lrvUO5ns16WMqOS3uYAujKeRMk6RJb7gsfXO	Stasiska	user	2026-08-25 11:15:12.408272
38	IgoshinaDA@ieml.ru	$2b$10$TnS6kYcCof/RWwqsMcnSvOK7HTEbTwcDCo1sr.pyXTgcVMuJb9BUO	Галиева Дарья	user	2026-08-26 10:48:21.847984
30	MylnikovaAA@ieml.ru	$2b$10$VKfDoqGk9Q3dHnPafG2oi.5UIBoyLXjep4ioQoAuOz8DNyKcWkspe	Мыльникова Анна	user	2026-08-26 10:19:32.499085
31	muhamethanova@ieml.ru	$2b$10$iqpcbLsNH8oeIyrrWngQ8ukTxksoAGKQaWe/E4RtO205BJ/Xv8bl6	Мухаметханова Неля	manager	2026-08-26 10:35:31.029704
32	azinaaa@ieml.ru	$2b$10$zy62c0wnJKK2x70AJZkJduvjsfgYn9BxuOgAPn.K2aDNuWpEukFxu	Азина Альмира	user	2026-08-26 10:36:12.332902
39	tovkalevaao@ieml.ru	$2b$10$a/d7xXtiQYGZkjpQf82BiOJej9Xapyy64WDxE25BY8fXbYqytYfuu	Товкалёва Анастасия	user	2026-08-27 11:37:06.197152
33	gimadievaai3@ieml.ru	$2b$10$efLt2jwjPVJE1vRXvjQz..0TEpc1OQiaelaPxskc61O6u7Se1nkoq	Гимадиева Аделя	user	2026-08-26 10:36:45.48965
40	bakhshalievin@ieml.ru	$2b$10$b2dlUFodcKUC9.c2KJsdyu2riGMnNWmr9PcwnBrgwYE2aTOuyv7cK	Бахшалиев Исмаил	user	2026-08-27 11:37:56.723195
34	PetukhovaAK@ieml.ru	$2b$10$iaRNdFByw4gcgxicyGWnOOvo1wgc0GHBMP8FkuzI6Hkn6mkq5h7SG	Петухова Анастасия	user	2026-08-26 10:37:20.34275
35	aapakova@ieml.ru	$2b$10$5xgl9uPIGFeWlwlP2WgFz.g50p0gWjZRCpBiD1rPSlKEdEXoYKTiO	Загриева Альбина	user	2026-08-26 10:38:09.797878
36	agalieva@ieml.ru	$2b$10$GxtyujkL7kXSVw37IHEv8ej94xE/2pmlH77eP22mdzCIfLPqEPxnq	Галиева Альбина	manager	2026-08-26 10:38:34.798872
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 8, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 5, true);


--
-- Name: recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recipients_id_seq', 75, true);


--
-- Name: reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reminders_id_seq', 13, true);


--
-- Name: send_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.send_logs_id_seq', 32, true);


--
-- Name: senders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.senders_id_seq', 11, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 3, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.templates_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 52, true);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: recipients recipients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_email_key UNIQUE (email);


--
-- Name: recipients recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: send_logs send_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.send_logs
    ADD CONSTRAINT send_logs_pkey PRIMARY KEY (id);


--
-- Name: senders senders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senders
    ADD CONSTRAINT senders_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_recipients_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_recipients_email ON public.recipients USING btree (email);


--
-- Name: idx_reminders_reminder_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reminders_reminder_date ON public.reminders USING btree (reminder_date);


--
-- Name: idx_send_logs_sender_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_send_logs_sender_id ON public.send_logs USING btree (sender_id);


--
-- Name: idx_send_logs_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_send_logs_sent_at ON public.send_logs USING btree (sent_at);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_tasks_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_user_id ON public.tasks USING btree (user_id);


--
-- Name: comments comments_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.recipients(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reminders reminders_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.recipients(id) ON DELETE CASCADE;


--
-- Name: reminders reminders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: send_logs send_logs_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.send_logs
    ADD CONSTRAINT send_logs_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.senders(id) ON DELETE SET NULL;


--
-- Name: senders senders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.senders
    ADD CONSTRAINT senders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 1hAYLIC3W88G4Jeqxu8SiEricbONHLanRuTPoys31AZAlH9hiqsB2uOmxjAV6nA

