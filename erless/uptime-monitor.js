// Uptime monitoring script for Erlessed Healthcare Platform
const https = require('https');
const http = require('http');

class UptimeMonitor {
  constructor(config) {
    this.config = {
      interval: 60000, // 1 minute
      timeout: 10000,  // 10 seconds
      retries: 3,
      ...config
    };
    this.services = [
      {
        name: 'Main Application',
        url: `${this.config.baseUrl}/health`,
        critical: true
      },
      {
        name: 'HMS Integration',
        url: `${this.config.baseUrl}:8001/health`,
        critical: false
      },
      {
        name: 'API Endpoints',
        url: `${this.config.baseUrl}/api/user`,
        critical: true,
        expectedStatus: [200, 401] // 401 is expected for unauthenticated requests
      }
    ];
    this.alerts = [];
  }

  async checkService(service) {
    return new Promise((resolve) => {
      const url = new URL(service.url);
      const client = url.protocol === 'https:' ? https : http;
      
      const startTime = Date.now();
      
      const req = client.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        timeout: this.config.timeout,
        headers: {
          'User-Agent': 'Erlessed-Monitor/1.0'
        }
      }, (res) => {
        const responseTime = Date.now() - startTime;
        const expectedStatuses = service.expectedStatus || [200];
        const isHealthy = expectedStatuses.includes(res.statusCode);
        
        resolve({
          service: service.name,
          url: service.url,
          status: isHealthy ? 'UP' : 'DOWN',
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date().toISOString(),
          critical: service.critical
        });
      });

      req.on('error', (error) => {
        resolve({
          service: service.name,
          url: service.url,
          status: 'DOWN',
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          critical: service.critical
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          service: service.name,
          url: service.url,
          status: 'DOWN',
          error: 'Request timeout',
          responseTime: this.config.timeout,
          timestamp: new Date().toISOString(),
          critical: service.critical
        });
      });

      req.end();
    });
  }

  async start() {
    console.log(`Starting uptime monitoring for Erlessed Healthcare Platform`);
    console.log(`Monitoring ${this.services.length} services every ${this.config.interval/1000}s`);
    
    const previousStates = new Map();
    
    const check = async () => {
      try {
        const results = await this.checkAllServices();
        
        for (const result of results) {
          const previousState = previousStates.get(result.service);
          const statusIcon = result.status === 'UP' ? '✅' : '❌';
          console.log(`${statusIcon} ${result.service}: ${result.status} (${result.responseTime}ms)`);
          
          if (previousState && previousState !== result.status) {
            await this.sendAlert(result, result.status);
          }
          
          previousStates.set(result.service, result.status);
        }
        
        const upServices = results.filter(r => r.status === 'UP').length;
        console.log(`Overall Status: ${upServices}/${results.length} services up\n`);
        
      } catch (error) {
        console.error('Monitoring error:', error);
      }
      
      setTimeout(check, this.config.interval);
    };
    
    check();
  }

  async checkAllServices() {
    const results = [];
    
    for (const service of this.services) {
      let attempts = 0;
      let result;
      
      while (attempts < this.config.retries) {
        result = await this.checkService(service);
        if (result.status === 'UP') break;
        attempts++;
        if (attempts < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      results.push({ ...result, attempts: attempts + 1 });
    }
    
    return results;
  }

  async sendAlert(service, status) {
    const alert = {
      service: service.service,
      status,
      timestamp: new Date().toISOString(),
      critical: service.critical
    };

    console.error(`ALERT: ${service.service} is ${status}`, alert);
    this.alerts.push(alert);
    
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }
}

module.exports = UptimeMonitor;

if (require.main === module) {
  const monitor = new UptimeMonitor({
    baseUrl: process.env.MONITOR_URL || 'http://localhost:5000'
  });
  
  monitor.start();
}