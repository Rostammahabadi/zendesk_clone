const BLOCKED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'aol.com',
  'outlook.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'live.com',
  'msn.com',
];

type UserType = 'customer' | 'agent' | 'admin';

export const getEmailError = (email: string, userType: UserType = 'customer'): string | null => {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Invalid email format';
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'Invalid email format';
  
  // Only check for company email if user is an agent or admin
  if (userType === 'agent' || userType === 'admin') {
    if (BLOCKED_DOMAINS.includes(domain)) {
      return 'Please use your company email address';
    }
  }
  
  // Basic email format validation for all user types
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};