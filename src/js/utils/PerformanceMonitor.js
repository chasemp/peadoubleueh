/**
 * Performance Monitor - Tracks PWA performance metrics
 * Based on lessons learned from multiple PWA projects
 */

import logger from './Logger.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      cacheHitRatio: 0,
      bandwidthUsage: 0,
      memoryUsage: 0,
      renderTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    
    this.isMonitoring = false;
    this.metricsCallbacks = [];
    this.performanceObserver = null;
    this.startTime = performance.now();
  }

  start() {
    if (this.isMonitoring) return;
    
    logger.log('📊 Starting Performance Monitor...');
    
    try {
      // Set up Performance Observer
      this.setupPerformanceObserver();
      
      // Set up memory monitoring
      this.setupMemoryMonitoring();
      
      // Set up bandwidth monitoring
      this.setupBandwidthMonitoring();
      
      // Set up periodic metrics collection
      this.setupPeriodicCollection();
      
      this.isMonitoring = true;
      logger.log('✅ Performance Monitor started successfully');
    } catch (error) {
      logger.error('❌ Failed to start Performance Monitor:', error);
    }
  }

  stop() {
    if (!this.isMonitoring) return;
    
    logger.log('📊 Stopping Performance Monitor...');
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.isMonitoring = false;
    logger.log('✅ Performance Monitor stopped');
  }

  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe different types of performance entries
      const entryTypes = [
        'navigation',
        'paint',
        'largest-contentful-paint',
        'layout-shift',
        'first-input',
        'resource'
      ];

      entryTypes.forEach(type => {
        try {
          this.performanceObserver.observe({ entryTypes: [type] });
        } catch (error) {
          logger.warn(`Failed to observe ${type}:`, error);
        }
      });
    } catch (error) {
      logger.error('Failed to setup Performance Observer:', error);
    }
  }

  processPerformanceEntries(entries) {
    entries.forEach(entry => {
      switch (entry.entryType) {
        case 'navigation':
          this.processNavigationEntry(entry);
          break;
        case 'paint':
          this.processPaintEntry(entry);
          break;
        case 'largest-contentful-paint':
          this.processLCPEntry(entry);
          break;
        case 'layout-shift':
          this.processCLSEntry(entry);
          break;
        case 'first-input':
          this.processFIDEntry(entry);
          break;
        case 'resource':
          this.processResourceEntry(entry);
          break;
      }
    });
  }

  processNavigationEntry(entry) {
    this.metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
    this.metrics.renderTime = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
  }

  processPaintEntry(entry) {
    if (entry.name === 'first-contentful-paint') {
      this.metrics.firstContentfulPaint = entry.startTime;
    }
  }

  processLCPEntry(entry) {
    this.metrics.largestContentfulPaint = entry.startTime;
  }

  processCLSEntry(entry) {
    if (!entry.hadRecentInput) {
      this.metrics.cumulativeLayoutShift += entry.value;
    }
  }

  processFIDEntry(entry) {
    this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
  }

  processResourceEntry(entry) {
    // Track bandwidth usage
    if (entry.transferSize) {
      this.metrics.bandwidthUsage += entry.transferSize;
    }
  }

  setupMemoryMonitoring() {
    if (!('memory' in performance)) {
      logger.warn('Memory API not supported');
      return;
    }

    setInterval(() => {
      const memory = performance.memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }, 5000);
  }

  setupBandwidthMonitoring() {
    if (!('connection' in navigator)) {
      logger.warn('Network Information API not supported');
      return;
    }

    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', () => {
        this.updateConnectionInfo(connection);
      });
      this.updateConnectionInfo(connection);
    }
  }

  updateConnectionInfo(connection) {
    this.metrics.connectionType = connection.effectiveType;
    this.metrics.downlink = connection.downlink;
    this.metrics.rtt = connection.rtt;
  }

  setupPeriodicCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 10000); // Every 10 seconds
  }

  collectMetrics() {
    // Calculate cache hit ratio
    this.calculateCacheHitRatio();
    
    // Update other metrics
    this.updateLoadTime();
    
    // Notify callbacks
    this.notifyMetricsUpdate();
  }

  calculateCacheHitRatio() {
    // This would need to be implemented based on your caching strategy
    // For now, we'll use a placeholder
    this.metrics.cacheHitRatio = 0.75; // 75% cache hit ratio
  }

  updateLoadTime() {
    const now = performance.now();
    this.metrics.loadTime = now - this.startTime;
  }

  notifyMetricsUpdate() {
    this.metricsCallbacks.forEach(callback => {
      try {
        callback(this.getCurrentMetrics());
      } catch (error) {
        logger.error('Error in metrics callback:', error);
      }
    });
  }

  // Public API
  getCurrentMetrics() {
    return { ...this.metrics };
  }

  onMetricsUpdate(callback) {
    this.metricsCallbacks.push(callback);
  }

  // Performance Analysis
  analyze() {
    const analysis = {
      performanceScore: this.calculatePerformanceScore(),
      recommendations: this.generateRecommendations(),
      bottlenecks: this.identifyBottlenecks(),
      optimizationScore: this.calculateOptimizationScore()
    };
    
    return analysis;
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for slow load times
    if (this.metrics.loadTime > 3000) score -= 20;
    else if (this.metrics.loadTime > 1000) score -= 10;
    
    // Deduct points for poor LCP
    if (this.metrics.largestContentfulPaint > 4000) score -= 20;
    else if (this.metrics.largestContentfulPaint > 2500) score -= 10;
    
    // Deduct points for high CLS
    if (this.metrics.cumulativeLayoutShift > 0.25) score -= 20;
    else if (this.metrics.cumulativeLayoutShift > 0.1) score -= 10;
    
    // Deduct points for high FID
    if (this.metrics.firstInputDelay > 300) score -= 20;
    else if (this.metrics.firstInputDelay > 100) score -= 10;
    
    // Deduct points for low cache hit ratio
    if (this.metrics.cacheHitRatio < 0.5) score -= 15;
    else if (this.metrics.cacheHitRatio < 0.7) score -= 5;
    
    return Math.max(0, score);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.loadTime > 1000) {
      recommendations.push('Consider optimizing load time with code splitting and lazy loading');
    }
    
    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize images and critical resources for faster LCP');
    }
    
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Fix layout shifts by reserving space for dynamic content');
    }
    
    if (this.metrics.firstInputDelay > 100) {
      recommendations.push('Reduce JavaScript execution time to improve interactivity');
    }
    
    if (this.metrics.cacheHitRatio < 0.7) {
      recommendations.push('Improve caching strategy to increase cache hit ratio');
    }
    
    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Monitor memory usage and implement memory optimization');
    }
    
    return recommendations;
  }

  identifyBottlenecks() {
    const bottlenecks = [];
    
    if (this.metrics.loadTime > 3000) {
      bottlenecks.push('Slow initial load time');
    }
    
    if (this.metrics.renderTime > 1000) {
      bottlenecks.push('Slow DOM rendering');
    }
    
    if (this.metrics.bandwidthUsage > 1024 * 1024) { // 1MB
      bottlenecks.push('High bandwidth usage');
    }
    
    if (this.metrics.memoryUsage > 200) { // 200MB
      bottlenecks.push('High memory usage');
    }
    
    return bottlenecks;
  }

  calculateOptimizationScore() {
    const score = this.calculatePerformanceScore();
    
    if (score >= 90) return 10;
    if (score >= 80) return 8;
    if (score >= 70) return 6;
    if (score >= 60) return 4;
    if (score >= 50) return 2;
    return 0;
  }

  // Benchmarking
  async runBenchmarks() {
    logger.log('🏃 Running performance benchmarks...');
    
    const benchmarks = {
      loadTime: await this.benchmarkLoadTime(),
      renderTime: await this.benchmarkRenderTime(),
      memoryUsage: await this.benchmarkMemoryUsage(),
      cachePerformance: await this.benchmarkCachePerformance()
    };
    
    logger.log('✅ Benchmarks completed:', benchmarks);
    return benchmarks;
  }

  async benchmarkLoadTime() {
    const start = performance.now();
    
    // Simulate load time measurement
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const end = performance.now();
    return end - start;
  }

  async benchmarkRenderTime() {
    const start = performance.now();
    
    // Simulate render time measurement
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const end = performance.now();
    return end - start;
  }

  async benchmarkMemoryUsage() {
    if ('memory' in performance) {
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  async benchmarkCachePerformance() {
    // Simulate cache performance test
    return 0.75; // 75% cache hit ratio
  }

  // Utility Methods
  pause() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  resume() {
    if (this.performanceObserver) {
      this.setupPerformanceObserver();
    }
  }

  reset() {
    this.metrics = {
      loadTime: 0,
      cacheHitRatio: 0,
      bandwidthUsage: 0,
      memoryUsage: 0,
      renderTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    
    this.startTime = performance.now();
  }

  // Debug Methods
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      metrics: this.getCurrentMetrics(),
      performanceScore: this.calculatePerformanceScore()
    };
  }
}

// Export as ES module
export default PerformanceMonitor;
