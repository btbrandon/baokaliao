import { createClient } from '@/lib/supabase/server';
import { CreateFoodToTryInput, FoodToTry } from '@/types/food-to-try';

export async function getFoodToTryItems(userId: string): Promise<FoodToTry[]> {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('food_to_try')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Convert latitude and longitude from strings to numbers if needed
  return (items || []).map((item) => ({
    ...item,
    latitude: item.latitude ? Number(item.latitude) : undefined,
    longitude: item.longitude ? Number(item.longitude) : undefined,
  }));
}

export async function getFoodToTryItem(id: string, userId: string): Promise<FoodToTry> {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('food_to_try')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  // Convert latitude and longitude from strings to numbers if needed
  return {
    ...item,
    latitude: item.latitude ? Number(item.latitude) : undefined,
    longitude: item.longitude ? Number(item.longitude) : undefined,
  };
}

export async function createFoodToTryItem(
  input: CreateFoodToTryInput,
  userId: string
): Promise<FoodToTry> {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('food_to_try')
    .insert({
      ...input,
      status: input.status || 'to_try', // Default to 'to_try' if not specified
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // Convert latitude and longitude from strings to numbers if needed
  return {
    ...item,
    latitude: item.latitude ? Number(item.latitude) : undefined,
    longitude: item.longitude ? Number(item.longitude) : undefined,
  };
}

export async function updateFoodToTryItem(
  id: string,
  updates: Partial<CreateFoodToTryInput>,
  userId: string
): Promise<FoodToTry> {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from('food_to_try')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Convert latitude and longitude from strings to numbers if needed
  return {
    ...item,
    latitude: item.latitude ? Number(item.latitude) : undefined,
    longitude: item.longitude ? Number(item.longitude) : undefined,
  };
}

export async function deleteFoodToTryItem(id: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('food_to_try').delete().eq('id', id).eq('user_id', userId);

  if (error) throw error;
}
