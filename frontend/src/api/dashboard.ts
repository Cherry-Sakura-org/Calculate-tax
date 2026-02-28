import { apiClient } from './client';
import type { DashboardResponse } from '../types/dashboard';
import type { FeatureCollection } from 'geojson';

export const dashboardApi = {
    get: async (): Promise<DashboardResponse> => {
        const response = await apiClient.get<DashboardResponse>('/dashboard');
        return response.data;
    },

    getCountyBoundaries: async (): Promise<FeatureCollection> => {
        const response = await apiClient.get<FeatureCollection>('/map/boundaries/counties');
        return response.data;
    },
};
