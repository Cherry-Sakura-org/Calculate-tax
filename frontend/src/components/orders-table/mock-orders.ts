import type { Order } from '../../types/order';

const states = ['CA', 'NY', 'TX', 'FL', 'WA', 'OR', 'NV', 'AZ', 'CO', 'IL'];
const counties = ['Los Angeles', 'San Francisco', 'King', 'Maricopa', 'Cook', 'Harris', 'Miami-Dade', 'Clark', 'Denver', 'Brooklyn'];
const cities = ['Los Angeles', 'San Francisco', 'Seattle', 'Phoenix', 'Chicago', 'Houston', 'Miami', 'Las Vegas', 'Denver', 'New York'];

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function generateOrder(index: number): Order {
    const r = (offset: number) => seededRandom(index * 13 + offset);

    const latitude = 25 + r(1) * 23;
    const longitude = -125 + r(2) * 55;
    const subtotal = Math.round((10 + r(3) * 490) * 100) / 100;
    const stateRate = 0.04 + r(4) * 0.06;
    const countyRate = r(5) * 0.02;
    const cityRate = r(6) * 0.03;
    const specialRates = r(7) * 0.01;
    const compositeRate = stateRate + countyRate + cityRate + specialRates;
    const taxAmount = Math.round(subtotal * compositeRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    const stateIdx = Math.floor(r(8) * states.length);
    const countyIdx = Math.floor(r(9) * counties.length);
    const cityIdx = Math.floor(r(10) * cities.length);

    const date = new Date(2025, 0, 1 + Math.floor(r(11) * 400));

    return {
        id: `mock-${String(index + 1).padStart(4, '0')}-abcd-efgh-ijkl-${String(index).padStart(12, '0')}`,
        latitude,
        longitude,
        subtotal,
        tax_amount: taxAmount,
        total,
        composite_rate: compositeRate,
        state_rate: stateRate,
        county_rate: countyRate,
        city_rate: cityRate,
        special_rates: specialRates,
        jurisdictions: [states[stateIdx], counties[countyIdx], cities[cityIdx]],
        created_at: date.toISOString(),
    };
}

export const mockOrders: Order[] = Array.from({ length: 200 }, (_, i) => generateOrder(i));
