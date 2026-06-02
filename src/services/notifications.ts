import { NotificationsResponse } from '../models/notification';
import { commonApi } from './common';

export const notificationsApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query() {
        return {
          url: 'notifications',
        };
      },
      transformResponse: (response: NotificationsResponse) => ({
        notifications: [...(response.notifications ?? [])].sort(
          (a, b) => b.sentAt - a.sentAt,
        ),
      }),
      providesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationsApi;
