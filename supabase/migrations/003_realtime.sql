-- Migration: 003_realtime.sql
-- Description: Enable Supabase Realtime on the scores table for live leaderboard updates
-- Dependencies: 001_initial_schema.sql

-- Enable realtime publication for the scores table.
-- The leaderboard on the challenge detail page subscribes to new validated scores.
-- Unsubscribe on component unmount to avoid memory leaks (handled in frontend hooks).
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
