/**
 * RingCentral Click-to-Dial URL generation
 * Uses RingCentral's built-in click-to-dial functionality
 *
 * Formats: rcmobile://dial?number=+1234567890
 */

export interface ClickToDialOptions {
  phoneNumber: string;
  displayName?: string;
  autoCall?: boolean;
}

/**
 * Generate a click-to-dial URL for RingCentral
 */
export const generateRingCentralDialURL = (options: ClickToDialOptions): string => {
  const { phoneNumber, displayName, autoCall = true } = options;

  // Normalize phone number - remove non-numeric characters except leading +
  const normalizedNumber = phoneNumber.replace(/[^\d+]/g, '');

  // Ensure it starts with +
  const formattedNumber = normalizedNumber.startsWith('+') ? normalizedNumber : `+${normalizedNumber}`;

  // Build the URL based on platform
  // RingCentral supports multiple URL schemes:
  // 1. rcmobile:// - for mobile apps
  // 2. tel: - standard tel protocol
  // 3. sip: - for SIP clients

  // Primary: rcmobile for RingCentral app
  const url = `rcmobile://dial?number=${encodeURIComponent(formattedNumber)}`;

  return url;
};

/**
 * Generate a tel: link as fallback
 */
export const generateTelLink = (phoneNumber: string): string => {
  const normalizedNumber = phoneNumber.replace(/[^\d+]/g, '');
  const formattedNumber = normalizedNumber.startsWith('+') ? normalizedNumber : `+${normalizedNumber}`;
  return `tel:${formattedNumber}`;
};

/**
 * Open click-to-dial with RingCentral
 */
export const openClickToDial = (phoneNumber: string, displayName?: string) => {
  const url = generateRingCentralDialURL({ phoneNumber, displayName });

  // Try to open the RingCentral URL scheme
  // If not available, fallback to tel protocol
  try {
    // For web, we need to check if RingCentral is available
    if (typeof window !== 'undefined') {
      // Open the rcmobile URL
      window.location.href = url;

      // Fallback after 2 seconds if app not available
      setTimeout(() => {
        const telUrl = generateTelLink(phoneNumber);
        window.location.href = telUrl;
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to initiate click-to-dial:', error);
    // Fallback to tel protocol
    if (typeof window !== 'undefined') {
      window.location.href = generateTelLink(phoneNumber);
    }
  }
};

/**
 * Check if RingCentral app is available
 */
export const isRingCentralAppAvailable = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Try to open a test URL and see if it succeeds
    const testUrl = 'rcmobile://ping';
    const timeout = setTimeout(() => {
      resolve(false);
    }, 1500);

    try {
      window.location.href = testUrl;
      clearTimeout(timeout);
      resolve(true);
    } catch {
      clearTimeout(timeout);
      resolve(false);
    }
  });
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except leading +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If starts with +, keep it and format the rest
  if (cleaned.startsWith('+')) {
    const number = cleaned.slice(1);
    if (number.length === 10) {
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    if (number.length === 11 && number.startsWith('1')) {
      return `+1 (${number.slice(1, 4)}) ${number.slice(4, 7)}-${number.slice(7)}`;
    }
    return `+${number}`;
  }

  // Format US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const number = cleaned.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }

  return cleaned;
};
