import { supabase } from '../config/supabase';
import { Week, CreateWeekData, UpdateWeekData, WeekWithDetails } from '../types/week';
import { errorLogger } from '../utils/errorLogger';

export class WeekService {
  // Generate next week ID (WK1, WK2, WK3...)
  private async generateNextWeekId(): Promise<string> {
    const { data, error } = await supabase
      .from('weeks')
      .select('week_id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last week ID:', error);
      return 'WK1';
    }

    if (!data || data.length === 0) {
      return 'WK1';
    }

    const lastId = data[0].week_id;
    const numericPart = parseInt(lastId.replace('WK', ''));
    return `WK${numericPart + 1}`;
  }

  // Create new week
  async createWeek(weekData: CreateWeekData): Promise<Week> {
    const week_id = await this.generateNextWeekId();

    try {
      const { data, error } = await supabase
        .from('weeks')
        .insert([
          {
            week_id,
            ...weekData
          }
        ])
        .select()
        .single();

      if (error) {
        errorLogger.logApiError('weeks', 'POST', new Error(error.message), undefined, error);
        throw new Error(`Error creating week: ${error.message}`);
      }

      return data;
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'createWeek', weekData });
      throw err;
    }
  }

  // Get all weeks with menu details
  async getWeeks(): Promise<WeekWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('weeks')
        .select(`
          *,
          weekly_menus!inner(menu_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        errorLogger.logApiError('weeks', 'GET', new Error(error.message), undefined, error);
        throw new Error(`Error fetching weeks: ${error.message}`);
      }

      // Transform the data to include menu name
      return (data || []).map(item => ({
        ...item,
        menu_name: item.weekly_menus?.menu_name
      }));
    } catch (err) {
      errorLogger.logError(err as Error, null, { operation: 'getWeeks' });
      throw err;
    }
  }

  // Get single week by ID
  async getWeekById(id: string): Promise<Week | null> {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error fetching week: ${error.message}`);
    }

    return data;
  }

  // Update week
  async updateWeek(id: string, updateData: UpdateWeekData): Promise<Week> {
    const { data, error } = await supabase
      .from('weeks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating week: ${error.message}`);
    }

    return data;
  }

  // Delete week
  async deleteWeek(id: string): Promise<void> {
    const { error } = await supabase
      .from('weeks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting week: ${error.message}`);
    }
  }

  // Get available weekly menus for dropdown
  async getAvailableMenus(): Promise<Array<{ menu_id: string; menu_name: string }>> {
    const { data, error } = await supabase
      .from('weekly_menus')
      .select('menu_id, menu_name')
      .order('menu_name');

    if (error) {
      console.error('Error fetching weekly menus:', error);
      throw new Error(`Error fetching weekly menus: ${error.message}`);
    }

    return data || [];
  }
}

export const weekService = new WeekService();