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

export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!email.includes('@')) return 'Invalid email format';
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return 'Invalid email format';
  
  if (BLOCKED_DOMAINS.includes(domain)) {
    return 'Please use your company email address';
  }
  
  return null;
}; 