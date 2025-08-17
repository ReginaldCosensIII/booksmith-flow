-- Fix security warnings by setting proper search_path for functions

-- Update update_timestamp function
create or replace function public.update_timestamp() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; 
$$ language plpgsql
security definer
set search_path = public;

-- Update word_count_of function  
create or replace function public.word_count_of(text) 
returns int as $$
  select coalesce(array_length(regexp_split_to_array(trim($1), '\s+'), 1), 0);
$$ language sql 
immutable
security definer
set search_path = public;

-- Update refresh_chapter_word_count function
create or replace function public.refresh_chapter_word_count() 
returns trigger as $$
begin
  new.word_count = public.word_count_of(new.content);
  new.updated_at = now();
  return new;
end; 
$$ language plpgsql
security definer
set search_path = public;

-- Update is_owner function
create or replace function public.is_owner(uid uuid, pid uuid) 
returns boolean as $$
  select exists(
    select 1 from public.projects p
    where p.id = pid and p.user_id = uid
  );
$$ language sql 
stable
security definer
set search_path = public;