// services/transactionService.js
import { API_URL } from '../config';

const API_BASE = API_URL;

/**
 * Transaction Details Service
 * Handles all API operations for transaction methods
 */
class TransactionService {
  
  /**
   * Fetch all transaction methods
   * @returns {Promise<Array>} Array of transaction methods
   */
  static async fetchTransactionMethods() {
    try {
      const response = await fetch(`${API_BASE}/transaction-details`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction methods');
      }

      // Ensure we return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching transaction methods:', error);
      throw new Error(`Failed to fetch transaction methods: ${error.message}`);
    }
  }

  /**
   * Fetch a single transaction method by ID
   * @param {string|number} id - Transaction method ID
   * @returns {Promise<Object>} Transaction method object
   */
  static async fetchTransactionMethod(id) {
    try {
      const response = await fetch(`${API_BASE}/transaction-details/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction method');
      }

      return data;
    } catch (error) {
      console.error('Error fetching transaction method:', error);
      throw new Error(`Failed to fetch transaction method: ${error.message}`);
    }
  }

  /**
   * Create a new transaction method
   * @param {Object} transactionData - Transaction method data
   * @returns {Promise<Object>} Created transaction method
   */
  static async createTransactionMethod(transactionData) {
    try {
      const formData = this._prepareFormData(transactionData);
      
      const response = await fetch(`${API_BASE}/transaction-details`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create transaction method');
      }

      return result;
    } catch (error) {
      console.error('Error creating transaction method:', error);
      throw new Error(`Failed to create transaction method: ${error.message}`);
    }
  }

  /**
   * Update an existing transaction method
   * @param {string|number} id - Transaction method ID
   * @param {Object} transactionData - Updated transaction method data
   * @returns {Promise<Object>} Updated transaction method
   */
  static async updateTransactionMethod(id, transactionData) {
    try {
      const formData = this._prepareFormData(transactionData);
      
      const response = await fetch(`${API_BASE}/transaction-details/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update transaction method');
      }

      return result;
    } catch (error) {
      console.error('Error updating transaction method:', error);
      throw new Error(`Failed to update transaction method: ${error.message}`);
    }
  }

  /**
   * Delete a transaction method
   * @param {string|number} id - Transaction method ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  static async deleteTransactionMethod(id) {
    try {
      const response = await fetch(`${API_BASE}/transaction-details/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete transaction method');
      }

      return result;
    } catch (error) {
      console.error('Error deleting transaction method:', error);
      throw new Error(`Failed to delete transaction method: ${error.message}`);
    }
  }

  /**
   * Fetch transaction methods by type
   * @param {string} type - Transaction type (bank_transfer, paypal, local_merchant)
   * @returns {Promise<Array>} Filtered transaction methods
   */
  static async fetchTransactionMethodsByType(type) {
    try {
      const response = await fetch(`${API_BASE}/transaction-details?type=${encodeURIComponent(type)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction methods by type');
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching transaction methods by type:', error);
      throw new Error(`Failed to fetch transaction methods by type: ${error.message}`);
    }
  }

  /**
   * Fetch transaction methods by country
   * @param {string} country - Country name
   * @returns {Promise<Array>} Filtered transaction methods
   */
  static async fetchTransactionMethodsByCountry(country) {
    try {
      const response = await fetch(`${API_BASE}/transaction-details?country=${encodeURIComponent(country)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transaction methods by country');
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching transaction methods by country:', error);
      throw new Error(`Failed to fetch transaction methods by country: ${error.message}`);
    }
  }

  /**
   * Validate transaction method data
   * @param {Object} data - Transaction method data
   * @returns {Object} Validation result { isValid: boolean, errors: Array }
   */
  static validateTransactionData(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push('Name is required');
    }

    if (!data.type) {
      errors.push('Transaction type is required');
    }

    if (data.is_country_specific && !data.country) {
      errors.push('Country is required for country-specific payment methods');
    }

    if (data.type === 'paypal') {
      const donationLink = data.fields?.find(f => f.label === 'Donation Link')?.value;
      const paypalEmail = data.fields?.find(f => f.label === 'PayPal Email')?.value;
      
      if (!donationLink || !donationLink.trim()) {
        errors.push('PayPal donation link is required');
      }
      if (!paypalEmail || !paypalEmail.trim()) {
        errors.push('PayPal email is required');
      }
    } else {
      const hasValidField = data.fields?.some(field => 
        field.label && field.label.trim() && field.value && field.value.trim()
      );
      if (!hasValidField) {
        errors.push('At least one complete field (label and value) is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare FormData for API submission
   * @private
   * @param {Object} data - Transaction method data
   * @returns {FormData} Prepared form data
   */
  static _prepareFormData(data) {
    const formData = new FormData();
    
    formData.append('type', data.type);
    formData.append('name', data.name.trim());
    formData.append('is_country_specific', data.is_country_specific);
    
    if (data.is_country_specific && data.country) {
      formData.append('country', data.country);
    }

    // Prepare fields based on type
    let fieldsToSend;
    if (data.type === 'paypal') {
      fieldsToSend = [
        { 
          label: 'Donation Link', 
          value: data.fields.find(f => f.label === 'Donation Link')?.value || '' 
        },
        { 
          label: 'PayPal Email', 
          value: data.fields.find(f => f.label === 'PayPal Email')?.value || '' 
        }
      ].filter(field => field.value.trim());
    } else {
      fieldsToSend = data.fields.filter(field => 
        field.label && field.label.trim() && field.value && field.value.trim()
      );
    }

    formData.append('fields', JSON.stringify(fieldsToSend));

    // Add logo file for local merchants
    if (data.type === 'local_merchant' && data.logo_file) {
      formData.append('logo', data.logo_file);
    }

    return formData;
  }

  /**
   * Process logo URL for display
   * @param {Object} method - Transaction method object
   * @param {string} staticUrl - Static URL base
   * @returns {string|null} Processed logo URL
   */
  static processLogoUrl(method, staticUrl) {
    if (!method.logo_url) return null;

    if (method.logo_url.startsWith('http') || method.logo_url.startsWith('/uploads/')) {
      return method.logo_url.startsWith('http') 
        ? method.logo_url 
        : `${staticUrl}${method.logo_url}`;
    } else if (method.logo_url.startsWith('/')) {
      return `${staticUrl}${method.logo_url}`;
    } else {
      return `${staticUrl}/transaction-logos/${method.logo_url}`;
    }
  }

  /**
   * Get transaction type label
   * @param {string} type - Transaction type value
   * @returns {string} Human-readable label
   */
  static getTypeLabel(type) {
    const types = {
      'bank_transfer': 'Bank Transfer',
      'paypal': 'PayPal Donate',
      'local_merchant': 'Local Transfer & Other Merchants'
    };
    return types[type] || type;
  }
}

export default TransactionService;

// Export individual functions for easier importing
export const {
  fetchTransactionMethods,
  fetchTransactionMethod,
  createTransactionMethod,
  updateTransactionMethod,
  deleteTransactionMethod,
  fetchTransactionMethodsByType,
  fetchTransactionMethodsByCountry,
  validateTransactionData,
  processLogoUrl,
  getTypeLabel
} = TransactionService;