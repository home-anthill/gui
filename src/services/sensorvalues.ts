import { commonApi } from './common';
import { FeatureValue, SensorWithValue, Value } from '../models/value';
import { Device, Feature } from '../models/device';

export const sensorValuesApi = commonApi.injectEndpoints({
  endpoints: builder => ({
    getSensorValues: builder.query<SensorWithValue, Device>({
      query(device: Device) {
        return {
          url: `devices/${device.id}/values`
        }
      },
      transformResponse: (response: Value[], _meta, arg: Device) => {
        // TODO create a better object to show more info on the UI
        const sensorObj: SensorWithValue = Object.assign({}, arg) as SensorWithValue;
        sensorObj.features = sensorObj.features
          .filter((feature: Feature) => feature)
          // order by 'order'
          .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
          .map((feature: Feature) => {
            const featureValue: FeatureValue = Object.assign({}, feature) as FeatureValue;
            const sensorValue: Value | undefined = response.find((v: Value) => v && v.uuid === feature.uuid);
            if (!sensorValue) {
              // TODO manage this error in the right way!
              return feature as FeatureValue;
            }
            featureValue.value = sensorValue.value;
            featureValue.createdAt = sensorValue.createdAt;
            featureValue.modifiedAt = sensorValue.modifiedAt;
            return featureValue;
          });
        return sensorObj;
      },
      // FIXME every element of the list should be tagged one by one, not like this
      providesTags: ['SensorValues']
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetSensorValuesQuery
} = sensorValuesApi
