// Dashboard JavaScript
let eventsChart, eventTypesChart;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    loadDashboard();
    setInterval(loadDashboard, 30000); // Refresh every 30 seconds
});

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString();
}

async function loadDashboard() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadEventsChart(),
            loadEventTypesChart(),
            loadTopPages(),
            loadTopCountries(),
            loadRecentEvents()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/v1/dashboard');
        const data = await response.json();
        
        document.getElementById('total-events').textContent = formatNumber(data.total_events);
        document.getElementById('total-sessions').textContent = formatNumber(data.total_sessions);
        document.getElementById('total-users').textContent = formatNumber(data.total_users);
        document.getElementById('today-events').textContent = formatNumber(data.today_events);
        document.getElementById('today-sessions').textContent = formatNumber(data.today_sessions);
        document.getElementById('today-users').textContent = formatNumber(data.today_users);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadEventsChart() {
    try {
        const response = await fetch('/api/v1/analytics/events-by-day?days=7');
        const result = await response.json();
        const data = result.data || [];
        
        const ctx = document.getElementById('events-chart').getContext('2d');
        
        if (eventsChart) {
            eventsChart.destroy();
        }
        
        eventsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => formatDate(item.date)),
                datasets: [{
                    label: 'Events',
                    data: data.map(item => item.count),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading events chart:', error);
    }
}

async function loadEventTypesChart() {
    try {
        const response = await fetch('/api/v1/analytics/top-event-types?limit=5');
        const result = await response.json();
        const data = result.data || [];
        
        const ctx = document.getElementById('event-types-chart').getContext('2d');
        
        if (eventTypesChart) {
            eventTypesChart.destroy();
        }
        
        eventTypesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.event_type),
                datasets: [{
                    data: data.map(item => item.count),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading event types chart:', error);
    }
}

async function loadTopPages() {
    try {
        const response = await fetch('/api/v1/analytics/top-pages?limit=10');
        const result = await response.json();
        const data = result.data || [];
        
        const tbody = document.getElementById('top-pages-table');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">No data available</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="text-truncate" style="max-width: 300px; display: inline-block;" title="${item.page_url}">${item.page_url || 'Unknown'}</span></td>
                <td><span class="badge bg-primary">${formatNumber(item.count)}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading top pages:', error);
    }
}

async function loadTopCountries() {
    try {
        const response = await fetch('/api/v1/analytics/top-countries?limit=10');
        const result = await response.json();
        const data = result.data || [];
        
        const tbody = document.getElementById('top-countries-table');
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center">No data available</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.country || 'Unknown'}</td>
                <td><span class="badge bg-success">${formatNumber(item.count)}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading top countries:', error);
    }
}

async function loadRecentEvents() {
    try {
        const response = await fetch('/api/v1/events?limit=20');
        const result = await response.json();
        const events = result.events || [];
        
        const tbody = document.getElementById('recent-events-table');
        tbody.innerHTML = '';
        
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No events found</td></tr>';
            return;
        }
        
        events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><small>${formatDateTime(event.created_at)}</small></td>
                <td><span class="badge bg-info">${event.event_type}</span></td>
                <td>${event.event_name}</td>
                <td><span class="text-truncate" style="max-width: 200px; display: inline-block;" title="${event.page_url || ''}">${event.page_url || '-'}</span></td>
                <td>${event.country || '-'}</td>
                <td><small><code>${event.session_id.substring(0, 8)}...</code></small></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading recent events:', error);
    }
}

function refreshRecentEvents() {
    loadRecentEvents();
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
