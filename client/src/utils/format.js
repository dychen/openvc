const truncateString = function(s, limit) {
  limit = limit || 50;
  return (s && s.length > limit - 3) ? s.slice(0, limit-3) + '...' : s;
};

export {truncateString};
