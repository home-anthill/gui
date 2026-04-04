import { commonApi } from './common';
import {
  FeatureValue,
  DeviceWithValuesResponse,
  Value,
  SetValueRequest,
  SetValueResponse,
} from '../models/value';
import { Device, Feature } from '../models/device';

export const valuesApi = commonApi.injectEndpoints({
  endpoints: (builder) => ({
    getValues: builder.query<DeviceWithValuesResponse, Device>({
      query(device: Device) {
        return {
          url: `devices/${device.id}/values`,
        };
      },
      transformResponse: (response: Value[], _meta, arg: Device) => {
        const deviceWithValue: DeviceWithValuesResponse = {
          ...arg,
          features: [],
        };
        const deviceFeatures = arg.features
          .filter((feature: Feature) => feature)
          // order by 'order'
          .sort(
            (a: { order: number }, b: { order: number }) => a.order - b.order
          )
          .map((feature: Feature): FeatureValue => {
            const value: Value | undefined = response.find(
              (v: Value) => v && v.featureUuid === feature.uuid
            );
            if (!value) {
              return {
                featureUuid: feature.uuid,
                name: feature.name,
                type: feature.type,
                unit: feature.unit,
                order: feature.order,
                enable: feature.enable,
                value: 0,
                createdAt: 0,
                modifiedAt: 0,
              };
            }
            return {
              featureUuid: value.featureUuid,
              name: feature.name,
              type: value.type,
              unit: feature.unit,
              order: feature.order,
              enable: feature.enable,
              value: value.value,
              createdAt: value.createdAt,
              modifiedAt: value.modifiedAt,
            };
          });
        // order first all sensors and next controllers
        deviceWithValue.features = [
          ...deviceFeatures.filter((f: FeatureValue) => f.type === 'sensor'),
          ...deviceFeatures.filter(
            (f: FeatureValue) => f.type === 'controller'
          ),
        ];
        return deviceWithValue;
      },
      providesTags: (_result, _error, arg) => [{ type: 'Values' as const, id: arg.id }],
    }),
    setValues: builder.mutation<
      SetValueResponse,
      { deviceId: string; setValuesRequest: SetValueRequest[] }
    >({
      query(data: { deviceId: string; setValuesRequest: SetValueRequest[] }) {
        const { deviceId, setValuesRequest } = data;
        return {
          url: `devices/${deviceId}/values`,
          method: 'POST',
          body: setValuesRequest,
        };
      },
      invalidatesTags: (_result, _error, arg) => [{ type: 'Values', id: arg.deviceId }],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetValuesQuery,
  useLazyGetValuesQuery,
  useSetValuesMutation,
} = valuesApi;
