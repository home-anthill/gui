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
        const device: Device = Object.assign({}, arg);
        const deviceWithValue: DeviceWithValuesResponse = {
          ...device,
          features: [],
        };
        const deviceFeatures = device.features
          .filter((feature: Feature) => feature)
          // order by 'order'
          .sort(
            (a: { order: number }, b: { order: number }) => a.order - b.order
          )
          .map((feature: Feature) => {
            const featureValue: FeatureValue = Object.assign(
              {},
              feature
            ) as unknown as FeatureValue;
            const value: Value | undefined = response.find(
              (v: Value) => v && v.featureUuid === feature.uuid
            );
            if (!value) {
              // TODO manage this error in the right way!
              return feature as unknown as FeatureValue;
            }
            featureValue.type = value.type;
            featureValue.featureUuid = value.featureUuid;
            featureValue.value = value.value;
            featureValue.createdAt = value.createdAt;
            featureValue.modifiedAt = value.modifiedAt;
            return featureValue;
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
      // FIXME every element of the list should be tagged one by one, not like this
      providesTags: ['Values'],
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
      invalidatesTags: ['Values'],
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
