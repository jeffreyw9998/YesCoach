create table public.users { ID seriel primary key,
username character varying(200) not null,
password character varying(200) not null,
height integer not null,
weight double not null,
age integer not null }