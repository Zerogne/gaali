/**
 * Scale Bridge Server for Electron App
 * 
 * This module connects to a weight scale device running in TCP server mode
 * and exposes a WebSocket interface for the frontend to receive weight data.
 * 
 * Usage in Electron:
 * const ScaleBridge = require('./electron-scale-bridge');
 * const bridge = new ScaleBridge({
 *   scaleHost: '192.168.1.100',
 *   scalePort: 4001,
 *   wsPort: 9000
 * });
 * await bridge.start();
 */

const { WebSocketServer } = require('ws');
const net = require('net');
const http = require('http');

class ScaleBridge {
  constructor(options = {}) {
    // Scale device TCP server configuration
    this.scaleHost = options.scaleHost || process.env.SCALE_HOST || '192.168.1.100';
    this.scalePort = options.scalePort || parseInt(process.env.SCALE_PORT || '4001', 10);
    
    // WebSocket server configuration
    this.wsPort = options.wsPort || parseInt(process.env.SCALE_WS_PORT || '9000', 10);
    
    // Connection settings
    this.reconnectDelay = options.reconnectDelay || 3000; // 3 seconds
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.tcpTimeout = options.tcpTimeout || 30000; // 30 seconds
    
    // Internal state
    this.server = null;
    this.wss = null;
    this.tcpClient = null;
    this.wsClients = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.isShuttingDown = false;
    
    // Data parsing options
    this.dataEncoding = options.dataEncoding || 'utf8';
    this.dataDelimiter = options.dataDelimiter || '\n'; // Common delimiters: \n, \r\n, \r
    this.parseWeightRegex = options.parseWeightRegex || null; // Optional regex to extract weight
    
    // Event handlers
    this.onWeightReceived = options.onWeightReceived || null;
    this.onScaleConnected = options.onScaleConnected || null;
    this.onScaleDisconnected = options.onScaleDisconnected || null;
    this.onError = options.onError || null;
  }

  /**
   * Start the WebSocket server and connect to scale device
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Create HTTP server for WebSocket
        this.server = http.createServer();
        
        // Create WebSocket server
        this.wss = new WebSocketServer({
          server: this.server,
          verifyClient: (info) => {
            const url = info.req.url || "";
            if (url.startsWith("/service") || url === "/" || url === "") {
              console.log(`✅ WebSocket connection attempt: ${url}`);
              return true;
            }
            console.log(`❌ Rejected WebSocket connection: ${url}`);
            return false;
          }
        });

        this.wss.on('connection', (ws, req) => {
          this.handleWebSocketConnection(ws, req);
        });

        // Start HTTP server
        this.server.listen(this.wsPort, '0.0.0.0', () => {
          console.log(`🚀 Scale bridge WebSocket server started on port ${this.wsPort}`);
          console.log(`🔌 WebSocket endpoint: ws://localhost:${this.wsPort}/service`);
          
          // Connect to scale device
          this.connectToScale();
          resolve();
        });

        this.server.on('error', (error) => {
          console.error('❌ Scale bridge server error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Connect to the scale device TCP server
   */
  connectToScale() {
    if (this.isShuttingDown) return;
    
    if (this.tcpClient && !this.tcpClient.destroyed) {
      console.log('⚠️ TCP client already exists, closing it first...');
      this.tcpClient.destroy();
    }

    console.log(`📡 Connecting to scale device at ${this.scaleHost}:${this.scalePort}...`);
    
    this.tcpClient = new net.Socket();
    this.tcpClient.setTimeout(this.tcpTimeout);
    this.tcpClient.setEncoding(this.dataEncoding);

    // Connection established
    this.tcpClient.on('connect', () => {
      console.log(`✅ Connected to scale device at ${this.scaleHost}:${this.scalePort}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      if (this.onScaleConnected) {
        this.onScaleConnected();
      }
    });

    // Data received from scale
    this.tcpClient.on('data', (data) => {
      this.handleScaleData(data);
    });

    // Connection closed
    this.tcpClient.on('close', (hadError) => {
      console.log(`🔌 Scale device connection closed${hadError ? ' (with error)' : ''}`);
      this.isConnected = false;
      
      if (this.onScaleDisconnected) {
        this.onScaleDisconnected(hadError);
      }
      
      // Attempt to reconnect if not shutting down
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    });

    // Connection error
    this.tcpClient.on('error', (error) => {
      console.error(`❌ Scale device connection error:`, error.message);
      this.isConnected = false;
      
      if (this.onError) {
        this.onError(error);
      }
      
      // Attempt to reconnect if not shutting down
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    });

    // Timeout
    this.tcpClient.on('timeout', () => {
      console.warn(`⚠️ Scale device connection timeout`);
      this.tcpClient.destroy();
    });

    // Connect to scale device
    try {
      this.tcpClient.connect(this.scalePort, this.scaleHost);
    } catch (error) {
      console.error(`❌ Failed to initiate connection to scale device:`, error);
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Handle data received from scale device
   */
  handleScaleData(data) {
    try {
      const dataString = data.toString(this.dataEncoding);
      console.log(`📊 Received data from scale:`, dataString.trim());
      
      // Split by delimiter if multiple messages in one packet
      const messages = dataString.split(this.dataDelimiter).filter(msg => msg.trim());
      
      for (const message of messages) {
        const trimmed = message.trim();
        if (!trimmed) continue;
        
        // Parse weight from message
        const weightData = this.parseWeight(trimmed);
        
        if (weightData) {
          // Broadcast to all WebSocket clients
          this.broadcastWeight(weightData);
          
          // Call custom handler if provided
          if (this.onWeightReceived) {
            this.onWeightReceived(weightData);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error handling scale data:`, error);
    }
  }

  /**
   * Parse weight from scale device message
   * Supports various formats: JSON, plain number, formatted string
   */
  parseWeight(message) {
    try {
      // Try parsing as JSON first
      try {
        const json = JSON.parse(message);
        if (json.weight !== undefined) {
          return {
            weight: parseFloat(json.weight),
            unit: json.unit || 'kg',
            raw: message,
            timestamp: new Date().toISOString()
          };
        }
        if (json.value !== undefined) {
          return {
            weight: parseFloat(json.value),
            unit: json.unit || 'kg',
            raw: message,
            timestamp: new Date().toISOString()
          };
        }
      } catch (e) {
        // Not JSON, continue
      }
      
      // Try custom regex if provided
      if (this.parseWeightRegex) {
        const match = message.match(this.parseWeightRegex);
        if (match && match[1]) {
          return {
            weight: parseFloat(match[1]),
            unit: 'kg',
            raw: message,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Try extracting number from string (handles formats like "Weight: 1500.5 kg")
      const numberMatch = message.match(/(\d+\.?\d*)/);
      if (numberMatch) {
        const weight = parseFloat(numberMatch[1]);
        if (!isNaN(weight) && weight > 0) {
          // Check for unit in message
          const unitMatch = message.match(/(kg|g|lb|lbs|ton)/i);
          return {
            weight: weight,
            unit: unitMatch ? unitMatch[1].toLowerCase() : 'kg',
            raw: message,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // If message is just a number
      const directNumber = parseFloat(message);
      if (!isNaN(directNumber) && directNumber > 0) {
        return {
          weight: directNumber,
          unit: 'kg',
          raw: message,
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn(`⚠️ Could not parse weight from message: ${message}`);
      return null;
    } catch (error) {
      console.error(`❌ Error parsing weight:`, error);
      return null;
    }
  }

  /**
   * Broadcast weight data to all connected WebSocket clients
   */
  broadcastWeight(weightData) {
    if (this.wsClients.size === 0) {
      return; // No clients connected
    }

    const message = JSON.stringify({
      type: 'weight',
      ...weightData
    });

    let sentCount = 0;
    let errorCount = 0;
    
    this.wsClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error(`❌ Error sending weight to WebSocket client:`, error);
          this.wsClients.delete(client);
          errorCount++;
        }
      } else {
        // Client not open, remove it
        this.wsClients.delete(client);
      }
    });

    if (sentCount > 0) {
      console.log(`📤 Broadcasted weight ${weightData.weight} ${weightData.unit} to ${sentCount} client(s)`);
    }
  }

  /**
   * Handle new WebSocket connection from frontend
   */
  handleWebSocketConnection(ws, req) {
    const clientIp = req.socket?.remoteAddress || 'unknown';
    console.log(`✅ WebSocket client connected from ${clientIp} (total: ${this.wsClients.size + 1})`);
    
    this.wsClients.add(ws);

    // Send welcome message with current connection status
    try {
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to scale bridge',
        scaleConnected: this.isConnected,
        scaleHost: this.scaleHost,
        scalePort: this.scalePort,
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      console.error(`❌ Error sending welcome message:`, err);
    }

    // Handle disconnect
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket client disconnected from ${clientIp} (code: ${code})`);
      this.wsClients.delete(ws);
      console.log(`📊 Remaining WebSocket clients: ${this.wsClients.size}`);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error from ${clientIp}:`, error);
      this.wsClients.delete(ws);
    });

    ws.on('message', (message) => {
      // Handle messages from frontend if needed
      // For example, request current weight, change settings, etc.
      try {
        const parsed = JSON.parse(message.toString());
        console.log(`📨 Received message from WebSocket client:`, parsed);
        
        // Example: Handle "request_weight" message
        if (parsed.type === 'request_weight') {
          // Could trigger a request to scale device if it supports commands
          // For now, just acknowledge
          ws.send(JSON.stringify({
            type: 'ack',
            message: 'Weight request received',
            scaleConnected: this.isConnected
          }));
        }
      } catch (e) {
        // Not JSON, ignore
      }
    });
  }

  /**
   * Schedule reconnection to scale device
   */
  scheduleReconnect() {
    if (this.isShuttingDown) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached. Stopping reconnection.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts; // Exponential backoff
    
    console.log(`⏳ Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isShuttingDown) {
        this.connectToScale();
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      scaleConnected: this.isConnected,
      scaleHost: this.scaleHost,
      scalePort: this.scalePort,
      wsPort: this.wsPort,
      wsClients: this.wsClients.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Stop the bridge and close all connections
   */
  async stop() {
    this.isShuttingDown = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Close TCP connection to scale
    if (this.tcpClient && !this.tcpClient.destroyed) {
      console.log('🔌 Closing scale device connection...');
      this.tcpClient.destroy();
      this.tcpClient = null;
    }

    // Close all WebSocket connections
    if (this.wss) {
      this.wsClients.forEach((client) => {
        if (client.readyState === 1) {
          client.close();
        }
      });
      this.wsClients.clear();

      // Close WebSocket server
      return new Promise((resolve) => {
        this.wss.close(() => {
          console.log('🔌 WebSocket server closed');
          if (this.server) {
            this.server.close(() => {
              console.log('🔌 HTTP server closed');
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    }

    return Promise.resolve();
  }

  /**
   * Add health check endpoint (optional)
   */
  addHealthEndpoint() {
    if (!this.server) return;

    this.server.on('request', (req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        const health = {
          status: 'ok',
          scale: {
            connected: this.isConnected,
            host: this.scaleHost,
            port: this.scalePort
          },
          websocket: {
            port: this.wsPort,
            clients: this.wsClients.size
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
      }
    });
  }
}

module.exports = ScaleBridge;

// If running directly (for testing)
if (require.main === module) {
  const bridge = new ScaleBridge({
    scaleHost: process.env.SCALE_HOST || '192.168.1.100',
    scalePort: parseInt(process.env.SCALE_PORT || '4001', 10),
    wsPort: parseInt(process.env.SCALE_WS_PORT || '9000', 10)
  });
  
  bridge.addHealthEndpoint();
  
  bridge.start().then(() => {
    console.log('✅ Scale bridge started. Test with: curl http://localhost:9000/health');
    console.log('📡 Make sure your scale device is configured as TCP server and is running.');
  }).catch((error) => {
    console.error('❌ Failed to start scale bridge:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down scale bridge...');
    await bridge.stop();
    process.exit(0);
  });
}
