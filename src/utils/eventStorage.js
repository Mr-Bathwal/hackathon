// Local storage utilities for caching event data
const STORAGE_KEYS = {
  EVENTS: 'ticketverse_events',
  USER_EVENTS: 'ticketverse_user_events',
  FAVORITES: 'ticketverse_favorites',
  CACHE_TIMESTAMP: 'ticketverse_cache_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const saveEventsToStorage = (events) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Failed to save events to storage:', error);
  }
};

export const getEventsFromStorage = () => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
    if (!timestamp || Date.now() - parseInt(timestamp) > CACHE_DURATION) {
      return null; // Cache expired
    }
    
    const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return events ? JSON.parse(events) : null;
  } catch (error) {
    console.error('Failed to get events from storage:', error);
    return null;
  }
};

export const saveUserEventsToStorage = (userAddress, events) => {
  try {
    const userEvents = getUserEventsFromStorage() || {};
    userEvents[userAddress] = events;
    localStorage.setItem(STORAGE_KEYS.USER_EVENTS, JSON.stringify(userEvents));
  } catch (error) {
    console.error('Failed to save user events to storage:', error);
  }
};

export const getUserEventsFromStorage = (userAddress = null) => {
  try {
    const userEvents = localStorage.getItem(STORAGE_KEYS.USER_EVENTS);
    const parsed = userEvents ? JSON.parse(userEvents) : {};
    return userAddress ? parsed[userAddress] || [] : parsed;
  } catch (error) {
    console.error('Failed to get user events from storage:', error);
    return userAddress ? [] : {};
  }
};

export const addToFavorites = (eventAddress) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(eventAddress)) {
      favorites.push(eventAddress);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to add to favorites:', error);
  }
};

export const removeFromFavorites = (eventAddress) => {
  try {
    const favorites = getFavorites();
    const index = favorites.indexOf(eventAddress);
    if (index > -1) {
      favorites.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
  }
};

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Failed to get favorites from storage:', error);
    return [];
  }
};

export const isFavorite = (eventAddress) => {
  return getFavorites().includes(eventAddress);
};

export const clearCache = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};
