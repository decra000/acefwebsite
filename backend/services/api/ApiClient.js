// services/api/ApiClient.js
const axios = require('axios');

class ApiClient {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.timeout = 15000;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000;
  }

  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  setCached(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) this.cache.delete(key);
    }
  }

  async request(endpoint, method = 'GET', body = null, options = {}) {
    try {
      const config = {
        method,
        url: `${this.apiBase}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        },
        timeout: options.timeout || this.timeout,
        ...(body && { data: body }),
        ...(options.params && { params: options.params })
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || `HTTP ${error.response.status}`);
      }
      throw error;
    }
  }

  async get(endpoint, params = {}, useCache = true) {
    const cacheKey = this.getCacheKey(endpoint, params);
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }
    const data = await this.request(endpoint, 'GET', null, { params });
    if (useCache) this.setCached(cacheKey, data);
    return data;
  }

  async post(endpoint, body) {
    const data = await this.request(endpoint, 'POST', body);
    this.clearCache(endpoint.split('/')[1]);
    return data;
  }
}

module.exports = ApiClient;