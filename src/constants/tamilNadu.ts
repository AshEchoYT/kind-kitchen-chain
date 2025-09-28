export const tamilNaduAreas = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Tiruppur', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet',
  'Sivaganga', 'Karur', 'Udhagamandalam', 'Hosur', 'Tambaram', 'Avadi',
  'Tirupathur', 'Erode', 'Nagercoil', 'Theni', 'Pollachi', 'Rajapalayam',
  'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam', 'Viluppuram',
  'Tiruvallur', 'Kancheepuram', 'Kanyakumari', 'Dharmapuri', 'Namakkal',
  'Cuddalore', 'Krishnagiri', 'Perambalur', 'Ariyalur', 'Kalakurichi',
  'Tiruvannamalai', 'Nilgiris', 'Tenkasi'
];

export const popularCities = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'
];

export const getRandomCities = (count: number = 6) => {
  const shuffled = [...tamilNaduAreas].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};