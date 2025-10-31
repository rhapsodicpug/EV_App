/**
 * Mumbai Locations Database
 * Predefined locations in Mumbai for trip planning
 */

export interface MumbaiLocation {
  id: number;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const MUMBAI_LOCATIONS: MumbaiLocation[] = [
  // South Mumbai (Extended)
  { id: 1, name: 'Colaba', area: 'South Mumbai', lat: 18.9067, lng: 72.8147 },
  { id: 2, name: 'Fort', area: 'South Mumbai', lat: 18.9392, lng: 72.8347 },
  { id: 3, name: 'Marine Lines', area: 'South Mumbai', lat: 18.9467, lng: 72.8233 },
  { id: 4, name: 'Churchgate', area: 'South Mumbai', lat: 18.9322, lng: 72.8264 },
  { id: 5, name: 'Nariman Point', area: 'South Mumbai', lat: 18.9253, lng: 72.8242 },
  { id: 6, name: 'Grant Road', area: 'South Mumbai', lat: 18.9640, lng: 72.8153 },
  { id: 7, name: 'Girgaon', area: 'South Mumbai', lat: 18.9530, lng: 72.8133 },
  { id: 8, name: 'Tardeo', area: 'South Mumbai', lat: 18.9688, lng: 72.8147 },
  { id: 9, name: 'Worli', area: 'South Mumbai', lat: 19.0176, lng: 72.8170 },
  { id: 10, name: 'Prabhadevi', area: 'Central', lat: 19.0144, lng: 72.8303 },
  
  // Central Mumbai
  { id: 11, name: 'Dadar West', area: 'Central', lat: 19.0176, lng: 72.8433 },
  { id: 12, name: 'Dadar East', area: 'Central', lat: 19.0189, lng: 72.8478 },
  { id: 13, name: 'Matunga', area: 'Central', lat: 19.0270, lng: 72.8553 },
  { id: 14, name: 'Mahim', area: 'Central', lat: 19.0410, lng: 72.8410 },
  { id: 15, name: 'Sion', area: 'Central', lat: 19.0432, lng: 72.8622 },
  { id: 16, name: 'Wadala', area: 'Central', lat: 19.0176, lng: 72.8561 },
  { id: 17, name: 'Lower Parel', area: 'Central', lat: 18.9984, lng: 72.8311 },
  { id: 18, name: 'Parel', area: 'Central', lat: 19.0095, lng: 72.8384 },
  { id: 19, name: 'Sewri', area: 'Central', lat: 18.9968, lng: 72.8564 },
  
  // Western Suburbs (South to North)
  { id: 20, name: 'Bandra West', area: 'Western Suburbs', lat: 19.0596, lng: 72.8295 },
  { id: 21, name: 'Bandra East', area: 'Western Suburbs', lat: 19.0544, lng: 72.8412 },
  { id: 22, name: 'Khar', area: 'Western Suburbs', lat: 19.0728, lng: 72.8345 },
  { id: 23, name: 'Santacruz West', area: 'Western Suburbs', lat: 19.0825, lng: 72.8355 },
  { id: 24, name: 'Santacruz East', area: 'Western Suburbs', lat: 19.0810, lng: 72.8410 },
  { id: 25, name: 'Vile Parle West', area: 'Western Suburbs', lat: 19.1014, lng: 72.8356 },
  { id: 26, name: 'Vile Parle East', area: 'Western Suburbs', lat: 19.1014, lng: 72.8456 },
  { id: 27, name: 'Juhu', area: 'Western Suburbs', lat: 19.0990, lng: 72.8265 },
  { id: 28, name: 'Andheri West', area: 'Western Suburbs', lat: 19.1136, lng: 72.8697 },
  { id: 29, name: 'Andheri East', area: 'Western Suburbs', lat: 19.1197, lng: 72.8697 },
  { id: 30, name: 'Versova', area: 'Western Suburbs', lat: 19.1310, lng: 72.8113 },
  { id: 31, name: 'Oshiwara', area: 'Western Suburbs', lat: 19.1499, lng: 72.8382 },
  { id: 32, name: 'Jogeshwari West', area: 'Western Suburbs', lat: 19.1363, lng: 72.8425 },
  { id: 33, name: 'Jogeshwari East', area: 'Western Suburbs', lat: 19.1404, lng: 72.8511 },
  { id: 34, name: 'Goregaon West', area: 'Western Suburbs', lat: 19.1631, lng: 72.8354 },
  { id: 35, name: 'Goregaon East', area: 'Western Suburbs', lat: 19.1631, lng: 72.8493 },
  { id: 36, name: 'Malad West', area: 'Western Suburbs', lat: 19.1864, lng: 72.8321 },
  { id: 37, name: 'Malad East', area: 'Western Suburbs', lat: 19.1864, lng: 72.8493 },
  { id: 38, name: 'Kandivali West', area: 'Western Suburbs', lat: 19.2074, lng: 72.8319 },
  { id: 39, name: 'Kandivali East', area: 'Western Suburbs', lat: 19.2074, lng: 72.8479 },
  { id: 40, name: 'Borivali West', area: 'Western Suburbs', lat: 19.2403, lng: 72.8354 },
  { id: 41, name: 'Borivali East', area: 'Western Suburbs', lat: 19.2403, lng: 72.8565 },
  { id: 42, name: 'Dahisar', area: 'Western Suburbs', lat: 19.2544, lng: 72.8622 },
  { id: 43, name: 'Mira Road', area: 'Extended Western', lat: 19.2812, lng: 72.8581 },
  { id: 44, name: 'Bhayandar', area: 'Extended Western', lat: 19.3016, lng: 72.8514 },
  { id: 45, name: 'Vasai', area: 'Extended Western', lat: 19.4612, lng: 72.8097 },
  { id: 46, name: 'Virar', area: 'Extended Western', lat: 19.4559, lng: 72.8113 },
  
  // Eastern Suburbs (South to North)
  { id: 47, name: 'Kurla West', area: 'Eastern Suburbs', lat: 19.0688, lng: 72.8790 },
  { id: 48, name: 'Kurla East', area: 'Eastern Suburbs', lat: 19.0759, lng: 72.8813 },
  { id: 49, name: 'Chembur', area: 'Eastern Suburbs', lat: 19.0633, lng: 72.8997 },
  { id: 50, name: 'Govandi', area: 'Eastern Suburbs', lat: 19.0541, lng: 72.9120 },
  { id: 51, name: 'Mankhurd', area: 'Eastern Suburbs', lat: 19.0434, lng: 72.9301 },
  { id: 52, name: 'Ghatkopar West', area: 'Eastern Suburbs', lat: 19.0860, lng: 72.9000 },
  { id: 53, name: 'Ghatkopar East', area: 'Eastern Suburbs', lat: 19.0860, lng: 72.9081 },
  { id: 54, name: 'Vikhroli West', area: 'Eastern Suburbs', lat: 19.1050, lng: 72.9258 },
  { id: 55, name: 'Vikhroli East', area: 'Eastern Suburbs', lat: 19.1114, lng: 72.9258 },
  { id: 56, name: 'Kanjurmarg', area: 'Eastern Suburbs', lat: 19.1290, lng: 72.9325 },
  { id: 57, name: 'Bhandup West', area: 'Eastern Suburbs', lat: 19.1444, lng: 72.9354 },
  { id: 58, name: 'Bhandup East', area: 'Eastern Suburbs', lat: 19.1482, lng: 72.9378 },
  { id: 59, name: 'Nahur', area: 'Eastern Suburbs', lat: 19.1503, lng: 72.9475 },
  { id: 60, name: 'Mulund West', area: 'Eastern Suburbs', lat: 19.1726, lng: 72.9465 },
  { id: 61, name: 'Mulund East', area: 'Eastern Suburbs', lat: 19.1726, lng: 72.9565 },
  { id: 62, name: 'Powai', area: 'Eastern Suburbs', lat: 19.1197, lng: 72.9059 },
  
  // Thane & Extended
  { id: 63, name: 'Thane West', area: 'Thane', lat: 19.2183, lng: 72.9781 },
  { id: 64, name: 'Thane East', area: 'Thane', lat: 19.1972, lng: 72.9722 },
  { id: 65, name: 'Dombivli', area: 'Extended Central', lat: 19.2183, lng: 73.0867 },
  { id: 66, name: 'Kalyan', area: 'Extended Central', lat: 19.2403, lng: 73.1350 },
  { id: 67, name: 'Ulhasnagar', area: 'Extended Central', lat: 19.2183, lng: 73.1544 },
  
  // Navi Mumbai (Complete)
  { id: 68, name: 'Vashi', area: 'Navi Mumbai', lat: 19.0768, lng: 72.9979 },
  { id: 69, name: 'Koparkhairane', area: 'Navi Mumbai', lat: 19.1006, lng: 73.0000 },
  { id: 70, name: 'Ghansoli', area: 'Navi Mumbai', lat: 19.1200, lng: 73.0080 },
  { id: 71, name: 'Turbhe', area: 'Navi Mumbai', lat: 19.0696, lng: 73.0141 },
  { id: 72, name: 'Airoli', area: 'Navi Mumbai', lat: 19.1507, lng: 72.9969 },
  { id: 73, name: 'Nerul', area: 'Navi Mumbai', lat: 19.0330, lng: 73.0197 },
  { id: 74, name: 'Seawoods', area: 'Navi Mumbai', lat: 19.0203, lng: 73.0208 },
  { id: 75, name: 'Belapur', area: 'Navi Mumbai', lat: 19.0176, lng: 73.0322 },
  { id: 76, name: 'Kharghar', area: 'Navi Mumbai', lat: 19.0433, lng: 73.0677 },
  { id: 77, name: 'Panvel', area: 'Navi Mumbai', lat: 18.9894, lng: 73.1178 },
  
  // Mumbai Airport Area
  { id: 78, name: 'Mumbai Airport T1', area: 'Airport', lat: 19.0896, lng: 72.8656 },
  { id: 79, name: 'Mumbai Airport T2', area: 'Airport', lat: 19.0886, lng: 72.8678 },
];

/**
 * Get location by ID
 */
export const getLocationById = (id: number): MumbaiLocation | undefined => {
  return MUMBAI_LOCATIONS.find(loc => loc.id === id);
};

/**
 * Get location by name (case-insensitive)
 */
export const getLocationByName = (name: string): MumbaiLocation | undefined => {
  return MUMBAI_LOCATIONS.find(
    loc => loc.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Search locations by query
 */
export const searchLocations = (query: string): MumbaiLocation[] => {
  const lowerQuery = query.toLowerCase();
  return MUMBAI_LOCATIONS.filter(
    loc => 
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.area.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get all unique areas
 */
export const getAreas = (): string[] => {
  return [...new Set(MUMBAI_LOCATIONS.map(loc => loc.area))];
};

