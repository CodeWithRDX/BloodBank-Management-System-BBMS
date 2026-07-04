/**
 * sseManager.js
 * Centralized Server-Sent Events (SSE) manager.
 * Stores open client response objects and handles targeted broadcasts.
 */

let clients = [];

/**
 * Register a new SSE client connection
 * @param {Object} req Express request containing req.user
 * @param {Object} res Express response
 */
export const addClient = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Tell Nginx reverse proxy not to buffer stream chunks
  });

  // Send initial connection payload
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  const client = {
    id: Math.random().toString(36).substr(2, 9),
    userId: req.user._id ? req.user._id.toString() : req.user.id.toString(),
    role: req.user.role,
    branchId: req.user.branchId ? req.user.branchId.toString() : null,
    res,
  };

  clients.push(client);
  console.log(`📡 [SSE] Client connected: ${client.id} (User: ${client.userId}, Role: ${client.role})`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== client.id);
    console.log(`📡 [SSE] Client disconnected: ${client.id}`);
  });
};

/**
 * Emit an SSE event to a specific user
 */
export const sendToUser = (userId, event, data) => {
  const targetId = userId ? userId.toString() : '';
  clients.forEach(c => {
    if (c.userId === targetId) {
      c.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  });
};

/**
 * Emit an SSE event to all connected admin clients
 */
export const sendToAdmins = (event, data) => {
  clients.forEach(c => {
    if (c.role === 'admin') {
      c.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  });
};

/**
 * Emit an SSE event to staff/admins inside a specific branch
 */
export const sendToBranch = (branchId, event, data) => {
  const targetBranchId = branchId ? branchId.toString() : '';
  clients.forEach(c => {
    if (c.branchId === targetBranchId || c.role === 'admin') {
      c.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  });
};

/**
 * Emit an SSE event to all connected clients
 */
export const sendToAll = (event, data) => {
  clients.forEach(c => {
    c.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
};

// ─── Connection Heartbeat (Ping) ─────────────────────────────────────────────
// Keeps connections alive through proxies (Nginx/Cloudflare) every 20 seconds.
setInterval(() => {
  clients.forEach(c => {
    c.res.write(': ping\n\n');
  });
}, 20000);
