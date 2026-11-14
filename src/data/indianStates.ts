export interface StateOption {
  code: string;
  name: string;
  isUT?: boolean;
}

export const INDIAN_STATES_AND_UTS: StateOption[] = [
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' },
  { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'KL', name: 'Kerala' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'OD', name: 'Odisha' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'TR', name: 'Tripura' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'WB', name: 'West Bengal' },
  // 8 Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', isUT: true },
  { code: 'CH', name: 'Chandigarh', isUT: true },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', isUT: true },
  { code: 'DL', name: 'Delhi (NCT)', isUT: true },
  { code: 'JK', name: 'Jammu and Kashmir', isUT: true },
  { code: 'LA', name: 'Ladakh', isUT: true },
  { code: 'LD', name: 'Lakshadweep', isUT: true },
  { code: 'PY', name: 'Puducherry', isUT: true },
];
