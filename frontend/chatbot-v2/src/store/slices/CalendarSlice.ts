import { createSlice } from "@reduxjs/toolkit";
import {
  createCalendarEvent,
  fetchCalendarEvents,
} from "../thunks/calendarThunks.ts";
import type { CalendarState } from "../types.ts";

/**
 * Initial calendar state
 */
const initialState: CalendarState = {
  events: [],
  isLoading: false,
  error: null,
};

/**
 * Calendar state slice for managing calendar integration state
 *
 *  This slice handles:
 * - Calendar connection status
 * - Event management
 * - Loading states and error handling
 *
 * @author Margarita Kattsyna
 */
const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    clearCalendarData: (state) => {
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCalendarEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCalendarEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.push(action.payload.eventDetails);
        state.error = null;
      })
      .addCase(createCalendarEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCalendarData } = calendarSlice.actions;
export default calendarSlice.reducer;
