import api from './api';

const searchService = {
  globalSearch: (query, config = {}) => {
    return api.get('/search', { params: { q: query }, ...config });
  },
};

export default searchService;
