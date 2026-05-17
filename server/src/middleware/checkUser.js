const AuditLog = require('../models/AuditLog');

function getActionFromMethod(method) {
  if (method === 'POST') return 'create';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  if (method === 'DELETE') return 'delete';
  return method.toLowerCase();
}

function getResourceName(baseUrl = '') {
  return baseUrl.replace('/api/', '').replace(/^\//, '').replace(/\//g, '.');
}

function checkUser(req, res, next) {
  if (!req.user) return next();

  const method = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next();

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseBody = null;

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.send = (body) => {
    responseBody = body;
    return originalSend(body);
  };

  res.on('finish', async () => {
    try {
      await AuditLog.create({
        user: req.user._id,
        userName: req.user.username || req.user.name || 'unknown',
        method,
        path: req.originalUrl,
        resource: getResourceName(req.baseUrl),
        resourceId: req.params.id || req.params.partnerId || '',
        action: getActionFromMethod(method),
        statusCode: res.statusCode,
        requestBody: req.body ?? null,
        params: req.params ?? null,
        query: req.query ?? null,
        responseBody: responseBody ?? null,
        ip: req.ip || '',
        userAgent: req.get('user-agent') || '',
        success: res.statusCode < 400,
      });
    } catch (error) {
      console.error('Audit log write failed:', error);
    }
  });

  next();
}

module.exports = { checkUser };
