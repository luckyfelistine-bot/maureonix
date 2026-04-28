// ═══════════════════════════════════════════════════════════════════════════
//   🦊 MAUREONIX REAL-TIME DIAGNOSTICS DASHBOARD v1.0 — "THE ALL-SEEING EYE"
//   Live System Monitoring · Performance Metrics · Health Reports
//   Predictive Alerts · Anomaly Detection · Resource Optimization
//   Created for Maureonix by Infinite Vybeflix
// ═══════════════════════════════════════════════════════════════════════════

const os = require('os');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
//   METRICS COLLECTOR — Gathers system data continuously
// ═══════════════════════════════════════════════════════════════════════════
class MetricsCollector {
    constructor() {
        this.metrics = {
            cpu: [],
            memory: [],
            latency: [],
            errors: [],
            requests: [],
            modelUsage: {},
            keyHealth: {},
            userActivity: {},
            groupActivity: {},
        };
        this.maxHistory = 1000; // Keep last 1000 data points
        this.collectionInterval = null;
    }

    startCollection(intervalMs = 5000) {
        this.collectionInterval = setInterval(() => {
            this.collect();
        }, intervalMs);
    }

    stopCollection() {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }

    collect() {
        const timestamp = Date.now();

        // CPU usage
        const cpuUsage = process.cpuUsage();
        this.metrics.cpu.push({
            timestamp,
            user: cpuUsage.user,
            system: cpuUsage.system,
            percent: this.calculateCPUPercent(),
        });

        // Memory usage
        const memUsage = process.memoryUsage();
        this.metrics.memory.push({
            timestamp,
            rss: memUsage.rss,
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            systemFree: os.freemem(),
            systemTotal: os.totalmem(),
        });

        // Trim history
        if (this.metrics.cpu.length > this.maxHistory) this.metrics.cpu.shift();
        if (this.metrics.memory.length > this.maxHistory) this.metrics.memory.shift();
    }

    calculateCPUPercent() {
        const usage = process.cpuUsage();
        // Rough estimate: (user + system) / elapsed time
        return ((usage.user + usage.system) / 1000000).toFixed(2);
    }

    recordLatency(latencyMs, model, endpoint) {
        this.metrics.latency.push({
            timestamp: Date.now(),
            value: latencyMs,
            model,
            endpoint,
        });
        if (this.metrics.latency.length > this.maxHistory) this.metrics.latency.shift();
    }

    recordError(error, context) {
        this.metrics.errors.push({
            timestamp: Date.now(),
            message: error.message || error,
            stack: error.stack || '',
            context,
        });
        if (this.metrics.errors.length > this.maxHistory) this.metrics.errors.shift();
    }

    recordRequest(userId, command, success, latency) {
        this.metrics.requests.push({
            timestamp: Date.now(),
            userId: userId ? userId.split('@')[0] : 'unknown',
            command,
            success,
            latency,
        });
        if (this.metrics.requests.length > this.maxHistory) this.metrics.requests.shift();

        // Track user activity
        if (userId) {
            const shortId = userId.split('@')[0];
            if (!this.metrics.userActivity[shortId]) {
                this.metrics.userActivity[shortId] = { count: 0, lastSeen: Date.now(), commands: {} };
            }
            this.metrics.userActivity[shortId].count++;
            this.metrics.userActivity[shortId].lastSeen = Date.now();
            this.metrics.userActivity[shortId].commands[command] = (this.metrics.userActivity[shortId].commands[command] || 0) + 1;
        }
    }

    recordModelUsage(model) {
        this.metrics.modelUsage[model] = (this.metrics.modelUsage[model] || 0) + 1;
    }

    recordKeyHealth(keyShort, health) {
        this.metrics.keyHealth[keyShort] = health;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   ANOMALY DETECTOR — Identifies unusual patterns
// ═══════════════════════════════════════════════════════════════════════════
class AnomalyDetector {
    constructor(metricsCollector) {
        this.metrics = metricsCollector;
        this.baselines = new Map();
        this.thresholds = {
            latency: { warning: 3000, critical: 8000 },
            errorRate: { warning: 0.05, critical: 0.15 },
            cpu: { warning: 70, critical: 90 },
            memory: { warning: 80, critical: 95 },
        };
    }

    detect() {
        const anomalies = [];
        const now = Date.now();
        const recentWindow = 60000; // Last minute

        // Check latency anomalies
        const recentLatencies = this.metrics.metrics.latency.filter(l => now - l.timestamp < recentWindow);
        if (recentLatencies.length > 5) {
            const avgLatency = recentLatencies.reduce((s, l) => s + l.value, 0) / recentLatencies.length;
            const maxLatency = Math.max(...recentLatencies.map(l => l.value));

            if (avgLatency > this.thresholds.latency.critical) {
                anomalies.push({
                    type: 'latency_critical',
                    severity: 'critical',
                    message: `Average latency critically high: ${avgLatency.toFixed(0)}ms`,
                    value: avgLatency,
                    threshold: this.thresholds.latency.critical,
                });
            } else if (avgLatency > this.thresholds.latency.warning) {
                anomalies.push({
                    type: 'latency_warning',
                    severity: 'warning',
                    message: `Average latency elevated: ${avgLatency.toFixed(0)}ms`,
                    value: avgLatency,
                    threshold: this.thresholds.latency.warning,
                });
            }

            // Spike detection
            const latencies = recentLatencies.map(l => l.value);
            const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
            const stdDev = Math.sqrt(latencies.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / latencies.length);
            const spikes = recentLatencies.filter(l => l.value > mean + 3 * stdDev);
            if (spikes.length > 0) {
                anomalies.push({
                    type: 'latency_spike',
                    severity: 'warning',
                    message: `${spikes.length} latency spike(s) detected (max: ${Math.max(...spikes.map(s => s.value))}ms)`,
                    value: spikes.length,
                });
            }
        }

        // Check error rate
        const recentRequests = this.metrics.metrics.requests.filter(r => now - r.timestamp < recentWindow);
        const recentErrors = this.metrics.metrics.errors.filter(e => now - e.timestamp < recentWindow);
        if (recentRequests.length > 10) {
            const errorRate = recentErrors.length / recentRequests.length;
            if (errorRate > this.thresholds.errorRate.critical) {
                anomalies.push({
                    type: 'error_rate_critical',
                    severity: 'critical',
                    message: `Error rate critically high: ${(errorRate * 100).toFixed(1)}%`,
                    value: errorRate,
                });
            } else if (errorRate > this.thresholds.errorRate.warning) {
                anomalies.push({
                    type: 'error_rate_warning',
                    severity: 'warning',
                    message: `Error rate elevated: ${(errorRate * 100).toFixed(1)}%`,
                    value: errorRate,
                });
            }
        }

        // Check memory
        const recentMemory = this.metrics.metrics.memory.slice(-1)[0];
        if (recentMemory) {
            const memPercent = (recentMemory.heapUsed / recentMemory.heapTotal) * 100;
            if (memPercent > this.thresholds.memory.critical) {
                anomalies.push({
                    type: 'memory_critical',
                    severity: 'critical',
                    message: `Heap usage critically high: ${memPercent.toFixed(1)}%`,
                    value: memPercent,
                });
            } else if (memPercent > this.thresholds.memory.warning) {
                anomalies.push({
                    type: 'memory_warning',
                    severity: 'warning',
                    message: `Heap usage elevated: ${memPercent.toFixed(1)}%`,
                    value: memPercent,
                });
            }
        }

        // Check for repeated errors (same error pattern)
        const errorPatterns = {};
        for (const err of recentErrors) {
            const pattern = err.message.split(':')[0];
            errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
        }
        for (const [pattern, count] of Object.entries(errorPatterns)) {
            if (count >= 5) {
                anomalies.push({
                    type: 'repeated_error',
                    severity: 'warning',
                    message: `Repeated error pattern "${pattern}": ${count} times in last minute`,
                    value: count,
                });
            }
        }

        return anomalies;
    }

    generateRecommendations(anomalies) {
        const recommendations = [];

        for (const anomaly of anomalies) {
            switch (anomaly.type) {
                case 'latency_critical':
                case 'latency_warning':
                    recommendations.push('Switch to faster models (instant/flash tier)');
                    recommendations.push('Enable response caching for common queries');
                    recommendations.push('Check API key health and rotate if needed');
                    break;
                case 'error_rate_critical':
                case 'error_rate_warning':
                    recommendations.push('Review recent error logs for patterns');
                    recommendations.push('Check external API availability');
                    recommendations.push('Verify command handlers are not throwing');
                    break;
                case 'memory_critical':
                case 'memory_warning':
                    recommendations.push('Run memory compression on HyperMemory');
                    recommendations.push('Clear old conversation histories');
                    recommendations.push('Restart process if heap continues growing');
                    break;
                case 'latency_spike':
                    recommendations.push('Investigate specific endpoints causing spikes');
                    recommendations.push('Add timeout handling to slow operations');
                    break;
                case 'repeated_error':
                    recommendations.push('Fix root cause of repeated error pattern');
                    recommendations.push('Add error handling for specific failure mode');
                    break;
            }
        }

        // Deduplicate
        return [...new Set(recommendations)];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   DIAGNOSTICS REPORT GENERATOR — Creates beautiful reports
// ═══════════════════════════════════════════════════════════════════════════
class DiagnosticsReport {
    constructor(metricsCollector, anomalyDetector) {
        this.metrics = metricsCollector;
        this.anomalyDetector = anomalyDetector;
    }

    generateFullReport() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;

        const recentLatencies = this.metrics.metrics.latency.filter(l => l.timestamp > oneHourAgo);
        const recentRequests = this.metrics.metrics.requests.filter(r => r.timestamp > oneHourAgo);
        const recentErrors = this.metrics.metrics.errors.filter(e => e.timestamp > oneHourAgo);
        const recentMemory = this.metrics.metrics.memory.filter(m => m.timestamp > oneHourAgo);

        // Calculate statistics
        const avgLatency = recentLatencies.length > 0 
            ? recentLatencies.reduce((s, l) => s + l.value, 0) / recentLatencies.length 
            : 0;
        const p95Latency = recentLatencies.length > 0
            ? recentLatencies.sort((a, b) => a.value - b.value)[Math.floor(recentLatencies.length * 0.95)]?.value || 0
            : 0;
        const maxLatency = recentLatencies.length > 0
            ? Math.max(...recentLatencies.map(l => l.value))
            : 0;

        const totalRequests = recentRequests.length;
        const successRate = totalRequests > 0
            ? (recentRequests.filter(r => r.success).length / totalRequests * 100).toFixed(2)
            : 0;
        const errorRate = totalRequests > 0
            ? (recentErrors.length / totalRequests * 100).toFixed(2)
            : 0;

        const currentMemory = recentMemory.length > 0 ? recentMemory[recentMemory.length - 1] : null;
        const avgMemory = recentMemory.length > 0
            ? recentMemory.reduce((s, m) => s + m.heapUsed, 0) / recentMemory.length
            : 0;

        const anomalies = this.anomalyDetector.detect();
        const recommendations = this.anomalyDetector.generateRecommendations(anomalies);

        // Top commands
        const commandCounts = {};
        for (const req of recentRequests) {
            commandCounts[req.command] = (commandCounts[req.command] || 0) + 1;
        }
        const topCommands = Object.entries(commandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        // Top users
        const topUsers = Object.entries(this.metrics.metrics.userActivity)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([id, data]) => ({ id, count: data.count, lastSeen: data.lastSeen }));

        // Model distribution
        const modelDistribution = this.metrics.metrics.modelUsage;

        // Key health
        const keyHealth = this.metrics.metrics.keyHealth;

        return {
            generatedAt: new Date(now).toISOString(),
            period: 'Last 1 hour',
            performance: {
                avgLatency: `${avgLatency.toFixed(0)}ms`,
                p95Latency: `${p95Latency}ms`,
                maxLatency: `${maxLatency}ms`,
                totalRequests,
                successRate: `${successRate}%`,
                errorRate: `${errorRate}%`,
            },
            resources: {
                heapUsed: currentMemory ? `${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB` : 'N/A',
                heapTotal: currentMemory ? `${(currentMemory.heapTotal / 1024 / 1024).toFixed(2)} MB` : 'N/A',
                rss: currentMemory ? `${(currentMemory.rss / 1024 / 1024).toFixed(2)} MB` : 'N/A',
                systemFree: currentMemory ? `${(currentMemory.systemFree / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A',
                systemTotal: currentMemory ? `${(currentMemory.systemTotal / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A',
                avgHeapUsed: `${(avgMemory / 1024 / 1024).toFixed(2)} MB`,
            },
            anomalies: anomalies.map(a => ({
                type: a.type,
                severity: a.severity,
                message: a.message,
            })),
            recommendations,
            topCommands: topCommands.map(([cmd, count]) => ({ command: cmd, count })),
            topUsers,
            modelDistribution,
            keyHealth,
            uptime: this.formatUptime(process.uptime()),
        };
    }

    generateCompactReport() {
        const full = this.generateFullReport();
        return {
            status: full.anomalies.some(a => a.severity === 'critical') ? 'CRITICAL' 
                : full.anomalies.some(a => a.severity === 'warning') ? 'WARNING' 
                : 'HEALTHY',
            avgLatency: full.performance.avgLatency,
            successRate: full.performance.successRate,
            errorRate: full.performance.errorRate,
            heapUsed: full.resources.heapUsed,
            anomalies: full.anomalies.length,
            uptime: full.uptime,
        };
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${mins}m ${secs}s`;
    }

    formatForWhatsApp(report) {
        let msg = `📊 *Maureonix System Diagnostics*

`;
        msg += `⏱️ *Uptime:* ${report.uptime}
`;
        msg += `⚡ *Latency:* ${report.performance.avgLatency} (p95: ${report.performance.p95Latency})
`;
        msg += `📈 *Requests:* ${report.performance.totalRequests} | ✅ ${report.performance.successRate} | ❌ ${report.performance.errorRate}
`;
        msg += `💾 *Memory:* ${report.resources.heapUsed} / ${report.resources.heapTotal}

`;

        if (report.anomalies.length > 0) {
            msg += `🚨 *Anomalies (${report.anomalies.length}):*
`;
            for (const a of report.anomalies.slice(0, 5)) {
                const emoji = a.severity === 'critical' ? '🔴' : '🟡';
                msg += `${emoji} ${a.message}
`;
            }
            msg += `
`;
        }

        if (report.recommendations.length > 0) {
            msg += `💡 *Recommendations:*
`;
            for (const r of report.recommendations.slice(0, 5)) {
                msg += `• ${r}
`;
            }
            msg += `
`;
        }

        msg += `🏆 *Top Commands:*
`;
        for (const cmd of report.topCommands.slice(0, 5)) {
            msg += `• ${cmd.command}: ${cmd.count}
`;
        }

        return msg;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   PREDICTIVE ALERTS — Warns before problems happen
// ═══════════════════════════════════════════════════════════════════════════
class PredictiveAlerts {
    constructor(metricsCollector) {
        this.metrics = metricsCollector;
        this.alertHistory = [];
        this.predictionModels = new Map();
    }

    predict() {
        const alerts = [];
        const now = Date.now();

        // Predict memory exhaustion
        const memHistory = this.metrics.metrics.memory.slice(-20);
        if (memHistory.length >= 10) {
            const trend = this.calculateTrend(memHistory.map(m => m.heapUsed));
            const currentHeap = memHistory[memHistory.length - 1].heapTotal;
            const projectedTime = this.projectExhaustion(
                memHistory[memHistory.length - 1].heapUsed,
                currentHeap,
                trend
            );
            if (projectedTime && projectedTime < 300000) { // Less than 5 minutes
                alerts.push({
                    type: 'memory_exhaustion_predicted',
                    severity: 'critical',
                    message: `Memory exhaustion predicted in ${(projectedTime / 60000).toFixed(1)} minutes`,
                    projectedTime,
                    action: 'Restart process or clear memory immediately',
                });
            }
        }

        // Predict API key failure
        const keyHealth = this.metrics.metrics.keyHealth;
        for (const [key, health] of Object.entries(keyHealth)) {
            if (health.failures >= 2 && health.failures < 5) {
                alerts.push({
                    type: 'key_degradation',
                    severity: 'warning',
                    message: `API key ${key} showing signs of degradation (${health.failures} failures)`,
                    action: 'Monitor closely, prepare fallback',
                });
            }
        }

        // Predict user churn (inactive users)
        const inactiveUsers = Object.entries(this.metrics.metrics.userActivity)
            .filter(([_, data]) => now - data.lastSeen > 86400000 * 7) // 7 days
            .map(([id, _]) => id);
        if (inactiveUsers.length > 10) {
            alerts.push({
                type: 'user_churn',
                severity: 'warning',
                message: `${inactiveUsers.length} users inactive for 7+ days`,
                action: 'Consider re-engagement campaign',
            });
        }

        // Predict command overload
        const recentRequests = this.metrics.metrics.requests.filter(r => now - r.timestamp < 60000);
        if (recentRequests.length > 100) {
            const rate = recentRequests.length; // per minute
            if (rate > 200) {
                alerts.push({
                    type: 'rate_spike',
                    severity: 'warning',
                    message: `Request rate spike: ${rate}/min`,
                    action: 'Enable rate limiting or scale resources',
                });
            }
        }

        this.alertHistory.push(...alerts.map(a => ({ ...a, timestamp: now })));
        return alerts;
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        const n = values.length;
        const sumX = values.reduce((s, _, i) => s + i, 0);
        const sumY = values.reduce((s, v) => s + v, 0);
        const sumXY = values.reduce((s, v, i) => s + i * v, 0);
        const sumX2 = values.reduce((s, _, i) => s + i * i, 0);

        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    projectExhaustion(current, limit, trend) {
        if (trend <= 0) return null;
        const remaining = limit - current;
        return (remaining / trend) * 5000; // Convert to ms (approximate)
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//   INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════
const metricsCollector = new MetricsCollector();
const anomalyDetector = new AnomalyDetector(metricsCollector);
const diagnosticsReport = new DiagnosticsReport(metricsCollector, anomalyDetector);
const predictiveAlerts = new PredictiveAlerts(metricsCollector);

// Start collection
metricsCollector.startCollection(10000); // Every 10 seconds

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
module.exports = {
    MetricsCollector,
    AnomalyDetector,
    DiagnosticsReport,
    PredictiveAlerts,
    metricsCollector,
    anomalyDetector,
    diagnosticsReport,
    predictiveAlerts,
};