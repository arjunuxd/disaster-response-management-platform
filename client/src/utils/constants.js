export const REPORT_TYPES = [];

export const SEVERITY_LEVELS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

export const REPORT_STATUSES = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

export const PRIORITY_LEVELS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Emergency', label: 'Emergency' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const REPORTS_PER_PAGE = 10;

export const ADMIN_PER_PAGE = 10;

export const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

export const RISK_LEVELS = [
  { value: 'Low', label: 'Low' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

export const STATE_DISTRICTS = {
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
    'Erode', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri',
    'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
    'Pudukkottai', 'Ramanathapuram', 'Salem', 'Sivaganga', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tiruvallur',
    'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar',
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram',
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
  ],
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru',
    'Hubli-Dharwad', 'Belagavi', 'Gulbarga', 'Ballari', 'Davangere',
    'Shimoga', 'Uttara Kannada', 'Dakshina Kannada', 'Udupi',
    'Hassan', 'Mandya', 'Tumakuru', 'Chikkamagaluru', 'Kodagu',
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada',
    'Rajahmundry', 'Nellore', 'Kurnool', 'Anantapur', 'Chittoor',
    'Kadapa', 'Prakasam', 'Srikakulam', 'Vizianagaram', 'West Godavari',
    'East Godavari', 'Krishna', 'Guntur', 'NTR',
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Nalgonda', 'Mahbubnagar', 'Rangareddy', 'Medak', 'Adilabad',
    'Nizamabad', 'Mahabubnagar', 'Siddipet', 'Mancherial', 'Mulugu',
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad',
    'Solapur', 'Kolhapur', 'Sangli', 'Satara', 'Ratnagiri',
    'Raigad', 'Palghar', 'Nanded', 'Amravati', 'Akola', 'Jalgaon',
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
    'Jamnagar', 'Bhavnagar', 'Junagadh', 'Anand', 'Mehsana',
    'Bharuch', 'Valsad', 'Navsari', 'Patan', 'Kutch',
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol',
    'Durgapur', 'Bardhaman', 'Kharagpur', 'Haldia', 'Midnapore',
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
    'Puri', 'Balasore', 'Mayurbhanj', 'Jajpur', 'Kendrapara',
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga',
    'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Purnia',
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Prayagraj',
    'Meerut', 'Ghaziabad', 'Noida', 'Agra', 'Jhansi', 'Gorakhpur',
    'Bareilly', 'Aligarh', 'Moradabad',
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner',
    'Alwar', 'Bharatpur', 'Jaisalmer', 'Barmer', 'Chittorgarh',
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar',
    'Satna', 'Rewa', 'Bhind', 'Dewas',
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda',
    'Hoshiarpur', 'Kapurthala', 'Sangrur', 'Moga', 'Pathankot',
  ],
  'Haryana': [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal',
    'Sonipat', 'Hisar', 'Rohtak', 'Kurukshetra', 'Sirsa',
  ],
  'Delhi': [
    'New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi',
    'East Delhi', 'West Delhi', 'Shahdara', 'Dwarka', 'Rohini',
  ],
};

export const SHELTER_STATUSES = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
];

export const API_BASE_URL = '/api';
