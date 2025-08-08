export interface Week {
  id: string;
  week_id: string;
  week_name: string;
  weekly_menu: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWeekData {
  week_name: string;
  weekly_menu: string;
}

export interface UpdateWeekData {
  week_name?: string;
  weekly_menu?: string;
}

// Extended interface with menu name for display
export interface WeekWithDetails extends Week {
  menu_name?: string;
}