-- Database: sw_planets

DROP DATABASE sw_planets;

CREATE DATABASE sw_planets
    WITH OWNER = andras
        ENCODING = 'UTF8'
        TABLESPACE = pg_default
        LC_COLLATE = 'en_US.UTF-8'
        LC_CTYPE = 'en_US.UTF-8'
        CONNECTION LIMIT = -1;

CREATE SEQUENCE public.planet_votes_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 232
    CACHE 1;

CREATE TABLE public.planet_votes
(
    id integer NOT NULL DEFAULT nextval('planet_votes_id_seq'::regclass),
    planet_id integer,
    user_id integer,
    submission_time timestamp without time zone,
    CONSTRAINT planet_votes_pkey PRIMARY KEY (id),
    CONSTRAINT planet_votes_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.sw_users (id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
)

CREATE SEQUENCE public.sw_users_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 18
    CACHE 1;

CREATE TABLE public.sw_users
(
    id integer NOT NULL DEFAULT nextval('sw_users_id_seq'::regclass),
    username character varying(30),
    password text,
    CONSTRAINT sw_users_pkey PRIMARY KEY (id),
    CONSTRAINT sw_users_username_key UNIQUE (username)
)