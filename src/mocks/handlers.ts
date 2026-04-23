import { http, HttpResponse } from 'msw';
import {
  mockHome,
  mockDevice,
  mockDevice2,
  mockProfile,
  mockOnlineNow,
} from '../test-fixtures';

// Raw Value[] as returned by GET /api/devices/:id/values
const rawValues = [
  {
    featureUuid: 'f1',
    type: 'sensor',
    name: 'temperature',
    value: 22.5,
    createdAt: 1705318245000,
    modifiedAt: 1705318245000,
  },
];

export const handlers = [
  // ── Homes ────────────────────────────────────────────────────────────────
  http.get('/api/homes', () => HttpResponse.json([mockHome])),
  http.post('/api/homes', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...mockHome, ...body }, { status: 201 });
  }),
  http.delete('/api/homes/:id', () =>
    HttpResponse.json({ message: 'deleted' }),
  ),
  http.put('/api/homes/:id', () => HttpResponse.json({ message: 'updated' })),

  // ── Rooms ─────────────────────────────────────────────────────────────────
  http.post('/api/homes/:homeId/rooms', () =>
    HttpResponse.json({ message: 'created' }),
  ),
  http.delete('/api/homes/:homeId/rooms/:roomId', () =>
    HttpResponse.json({ message: 'deleted' }),
  ),
  http.put('/api/homes/:homeId/rooms/:roomId', () =>
    HttpResponse.json({ message: 'updated' }),
  ),

  // ── Devices ──────────────────────────────────────────────────────────────
  http.get('/api/devices', () => HttpResponse.json([mockDevice, mockDevice2])),
  http.put('/api/devices/:deviceId', () =>
    HttpResponse.json({ message: 'assigned' }),
  ),
  http.delete('/api/devices/:deviceId', () =>
    HttpResponse.json({ message: 'deleted' }),
  ),

  // ── Values ───────────────────────────────────────────────────────────────
  http.get('/api/devices/:deviceId/values', () => HttpResponse.json(rawValues)),
  http.post('/api/devices/:deviceId/values', () =>
    HttpResponse.json({ message: 'ok' }),
  ),

  // ── Profile ──────────────────────────────────────────────────────────────
  http.get('/api/profile', () => HttpResponse.json(mockProfile)),
  http.post('/api/profiles/:id/tokens', () =>
    HttpResponse.json({ apiToken: 'new-api-token' }),
  ),

  // ── Online ───────────────────────────────────────────────────────────────
  http.get('/api/online/:id', () => HttpResponse.json(mockOnlineNow)),

  // ── OAuth ────────────────────────────────────────────────────────────────
  http.post('/api/oauth/refresh', () =>
    HttpResponse.json({ token: 'refreshed-token' }),
  ),
  http.post('/api/oauth/logout', () => new HttpResponse(null, { status: 204 })),
];
