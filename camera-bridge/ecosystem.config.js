module.exports = {
  apps: [
    {
      name: 'camera-bridge',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
    },
    {
      name: 'camera-bridge-control',
      script: 'control-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        CONTROL_PORT: '3003',
        CAMERA_BRIDGE_CONTROL_TOKEN: process.env.CAMERA_BRIDGE_CONTROL_TOKEN || 'change-me-in-production',
      },
      error_file: './logs/control-err.log',
      out_file: './logs/control-out.log',
      log_file: './logs/control-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};

