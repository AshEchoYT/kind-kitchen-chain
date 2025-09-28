// Tamil Nadu districts and major areas for EllarukumFood
export const tamilNaduAreas = [
  // Major Cities
  { id: 'chennai', name: 'Chennai', district: 'Chennai', type: 'city' },
  { id: 'coimbatore', name: 'Coimbatore', district: 'Coimbatore', type: 'city' },
  { id: 'madurai', name: 'Madurai', district: 'Madurai', type: 'city' },
  { id: 'tiruchirappalli', name: 'Tiruchirappalli (Trichy)', district: 'Tiruchirappalli', type: 'city' },
  { id: 'salem', name: 'Salem', district: 'Salem', type: 'city' },
  { id: 'tirunelveli', name: 'Tirunelveli', district: 'Tirunelveli', type: 'city' },
  { id: 'erode', name: 'Erode', district: 'Erode', type: 'city' },
  { id: 'vellore', name: 'Vellore', district: 'Vellore', type: 'city' },
  { id: 'thoothukudi', name: 'Thoothukudi (Tuticorin)', district: 'Thoothukudi', type: 'city' },
  { id: 'thanjavur', name: 'Thanjavur', district: 'Thanjavur', type: 'city' },
  
  // Chennai Areas
  { id: 'chennai_central', name: 'Chennai Central', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'chennai_north', name: 'Chennai North', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'chennai_south', name: 'Chennai South', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 't_nagar', name: 'T. Nagar', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'anna_nagar', name: 'Anna Nagar', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'velachery', name: 'Velachery', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'tambaram', name: 'Tambaram', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'adyar', name: 'Adyar', district: 'Chennai', parent: 'chennai', type: 'area' },
  { id: 'mylapore', name: 'Mylapore', district: 'Chennai', parent: 'chennai', type: 'area' },
  
  // Coimbatore Areas
  { id: 'coimbatore_central', name: 'Coimbatore Central', district: 'Coimbatore', parent: 'coimbatore', type: 'area' },
  { id: 'rs_puram', name: 'R.S. Puram', district: 'Coimbatore', parent: 'coimbatore', type: 'area' },
  { id: 'peelamedu', name: 'Peelamedu', district: 'Coimbatore', parent: 'coimbatore', type: 'area' },
  { id: 'gandhipuram', name: 'Gandhipuram', district: 'Coimbatore', parent: 'coimbatore', type: 'area' },
  
  // Madurai Areas
  { id: 'madurai_central', name: 'Madurai Central', district: 'Madurai', parent: 'madurai', type: 'area' },
  { id: 'anna_nagar_madurai', name: 'Anna Nagar', district: 'Madurai', parent: 'madurai', type: 'area' },
  { id: 'thirumalai_nagar', name: 'Thirumalai Nagar', district: 'Madurai', parent: 'madurai', type: 'area' },
  
  // Other Districts
  { id: 'kanchipuram', name: 'Kanchipuram', district: 'Kanchipuram', type: 'city' },
  { id: 'tiruvallur', name: 'Tiruvallur', district: 'Tiruvallur', type: 'city' },
  { id: 'cuddalore', name: 'Cuddalore', district: 'Cuddalore', type: 'city' },
  { id: 'villupuram', name: 'Villupuram', district: 'Villupuram', type: 'city' },
  { id: 'tiruvannamalai', name: 'Tiruvannamalai', district: 'Tiruvannamalai', type: 'city' },
  { id: 'krishnagiri', name: 'Krishnagiri', district: 'Krishnagiri', type: 'city' },
  { id: 'dharmapuri', name: 'Dharmapuri', district: 'Dharmapuri', type: 'city' },
  { id: 'namakkal', name: 'Namakkal', district: 'Namakkal', type: 'city' },
  { id: 'karur', name: 'Karur', district: 'Karur', type: 'city' },
  { id: 'dindigul', name: 'Dindigul', district: 'Dindigul', type: 'city' },
  { id: 'theni', name: 'Theni', district: 'Theni', type: 'city' },
  { id: 'virudhunagar', name: 'Virudhunagar', district: 'Virudhunagar', type: 'city' },
  { id: 'sivaganga', name: 'Sivaganga', district: 'Sivaganga', type: 'city' },
  { id: 'ramanathapuram', name: 'Ramanathapuram', district: 'Ramanathapuram', type: 'city' },
  { id: 'pudukkottai', name: 'Pudukkottai', district: 'Pudukkottai', type: 'city' },
  { id: 'nagapattinam', name: 'Nagapattinam', district: 'Nagapattinam', type: 'city' },
  { id: 'thiruvarur', name: 'Thiruvarur', district: 'Thiruvarur', type: 'city' },
  { id: 'ariyalur', name: 'Ariyalur', district: 'Ariyalur', type: 'city' },
  { id: 'perambalur', name: 'Perambalur', district: 'Perambalur', type: 'city' },
  { id: 'kallakurichi', name: 'Kallakurichi', district: 'Kallakurichi', type: 'city' },
  { id: 'tirupattur', name: 'Tirupattur', district: 'Tirupattur', type: 'city' },
  { id: 'ranipet', name: 'Ranipet', district: 'Ranipet', type: 'city' },
  { id: 'tenkasi', name: 'Tenkasi', district: 'Tenkasi', type: 'city' },
  { id: 'kanyakumari', name: 'Kanyakumari', district: 'Kanyakumari', type: 'city' },
  { id: 'nilgiris', name: 'Nilgiris (Ooty)', district: 'Nilgiris', type: 'city' }
];

export const getAreasByDistrict = (district: string) => {
  return tamilNaduAreas.filter(area => area.district === district);
};

export const getCities = () => {
  return tamilNaduAreas.filter(area => area.type === 'city');
};

export const getAreasByCity = (cityId: string) => {
  return tamilNaduAreas.filter(area => area.parent === cityId);
};

export default tamilNaduAreas;