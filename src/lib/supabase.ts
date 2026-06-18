import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Goal } from '../types';
import { goalToRow, rowToGoal, type GoalRow } from './goalMapper';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function fetchAllGoals(): Promise<Goal[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as GoalRow[]).map(rowToGoal);
}

export async function insertGoal(goal: Goal): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('goals').insert(goalToRow(goal));
  if (error) throw error;
}

export async function updateGoalInDb(goal: Goal): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('goals')
    .update(goalToRow(goal))
    .eq('id', goal.id);

  if (error) throw error;
}

export async function deleteGoalFromDb(id: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

export async function testConnection(): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('goals').select('id').limit(1);
  return !error;
}
