// The notes key built into the page: written by `siue-music keys init|rotate`
// from music/keys/public.json (a unit test keeps them equal). Not secret.
import type { BuiltInKey } from './seal.ts';

export const PUBLIC_KEY: BuiltInKey | null = {"fingerprint":"a74b463f4ce454fa0374025a3b8c3186e892d852938b531ed541de5bdba04406","spki":"MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAj0Py8gNZ5SMDR5OZ4ARSoydCA+Ef8Dr5rWH8f0wrw6VceHokhjZqfyRsXvSTLkXWMh1CsOWwTayUa+bx+4VhPSgx9HLBU0TqNwGtZy68rIooDkB3F0zfPtoNt1PcnzianBxGWuR40m/HSVRMm4a+uyZfv6VjJ7BdD6OqNi8A+ZVoQXn4FrwWkVVkJqOyoUR6BochExAjJwrUHW5UNYXlvwpucyggi8FJO59WHzBoOWWp41DK4LvS2ASkEGPqLL9MOWA32WgMBUxIwYotXfb7DIN8pzvldoaU3P1IPpRjWooMjj+C+CqA4YWbXwmyxskLJEUEkQBNLOXaB3qGjdtACvb2rftrw8QuIzF4o0xsE+qEKg2itIlNUJ5IUgmJofKzyAMzdjL4vGFdg/U1X/e5b039dx59BWyirZwBuAHeD5iXJsvpooNaSqc7f99bKl+9LT3cL5zoaI38zVgpf1KAgeOF03r/g6ROIDSBUVSddP+C6xMuHg5Z6RJ5vKUJIjepVqI4S9OFXKNpDulTPUg46Bti/N35GNrxd10vi0cTxOHZH5MTh2AMj+eEsz/laFOBWEAtRSjk6s4GydQpRYJrmj4zDgc8beCOb1v38jeMzpPaIuL0N43Uf8f8sS0ijX+6FQrJ3hQyt/q5yCiYzOR4En3U1IlIzEnC6RFBYTgpbTMCAwEAAQ=="};
export const PREVIOUS_KEYS: readonly BuiltInKey[] = [];
