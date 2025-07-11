/**
 * Analytics Tracking Library
 * Simple JavaScript library for tracking events to the analytics server
 */

class AnalyticsTracker {
    constructor(options = {}) {
        this.endpoint = options.endpoint || '/api/v1/track';
        this.apiKey = options.apiKey || null;
        this.sessionId = this.getOrCreateSessionId();
        this.userId = options.userId || null;
        this.autoTrack = options.autoTrack !== false; // Default true
        if (this.autoTrack) {
            this.initAutoTracking();
        }
    }

    // Helper: Get or create session id in cookie, expire after 30 min
    getOrCreateSessionId() {
        const cookieName = 'analytics_session_id';
        const expiresName = 'analytics_session_expires';
        const now = Date.now();
        const expiresInMs = 30 * 60 * 1000; // 30 minutes
        const getCookie = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };
        const setCookie = (name, value, ms) => {
            const expires = new Date(Date.now() + ms).toUTCString();
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
        };
        let sessionId = getCookie(cookieName);
        let expiresAt = parseInt(getCookie(expiresName), 10);
        if (!sessionId || !expiresAt || now > expiresAt) {
            sessionId = this.generateSessionId();
            expiresAt = now + expiresInMs;
            setCookie(cookieName, sessionId, expiresInMs);
            setCookie(expiresName, expiresAt, expiresInMs);
        }
        this._sessionExpiresAt = expiresAt;
        this._cookieName = cookieName;
        this._expiresName = expiresName;
        this._expiresInMs = expiresInMs;
        return sessionId;
    }

    generateSessionId() {
        // Generate a simple session ID based on timestamp and random
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    async track(eventData) {
        // Check if session expired, if yes, generate new session id and update cookie
        const now = Date.now();
        if (now > this._sessionExpiresAt) {
            this.sessionId = this.generateSessionId();
            const expiresAt = now + this._expiresInMs;
            // Update cookies
            document.cookie = `${this._cookieName}=${encodeURIComponent(this.sessionId)}; expires=${new Date(expiresAt).toUTCString()}; path=/`;
            document.cookie = `${this._expiresName}=${expiresAt}; expires=${new Date(expiresAt).toUTCString()}; path=/`;
            this._sessionExpiresAt = expiresAt;
        }
        const payload = {
            session_id: this.sessionId,
            user_id: this.userId,
            ip_address: '', // Will be auto-detected by server
            ...eventData,
            // Auto-detect browser info
            user_agent: navigator.userAgent,
            screen_width: screen.width,
            screen_height: screen.height,
            language: navigator.language,
            platform: navigator.platform
        };

        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            // Add API key to headers if available
            if (this.apiKey) {
                headers['X-API-Key'] = this.apiKey;
            }

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.warn('Analytics tracking failed:', response.statusText);
            }
        } catch (error) {
            console.warn('Analytics tracking error:', error);
        }
    }

    // Track page view
    trackPageView(customData = {}) {
        return this.track({
            event_type: 'page_view',
            event_name: 'Page View',
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer || null,
            properties: customData
        });
    }

    // Track click events
    trackClick(element, customData = {}) {
        const elementName = element.textContent?.trim() || 
                           element.getAttribute('aria-label') || 
                           element.className || 
                           'Unknown Element';
        
        return this.track({
            event_type: 'click',
            event_name: `Click: ${elementName}`,
            page_url: window.location.href,
            properties: {
                element_tag: element.tagName,
                element_class: element.className,
                element_id: element.id,
                ...customData
            }
        });
    }

    // Track form submissions
    trackFormSubmit(form, customData = {}) {
        const formName = form.getAttribute('name') || 
                        form.getAttribute('id') || 
                        'Unknown Form';
        
        return this.track({
            event_type: 'form_submit',
            event_name: `Form Submit: ${formName}`,
            page_url: window.location.href,
            properties: {
                form_name: formName,
                form_id: form.id,
                ...customData
            }
        });
    }

    // Track custom events
    trackCustomEvent(eventName, eventType = 'custom', customData = {}) {
        return this.track({
            event_type: eventType,
            event_name: eventName,
            page_url: window.location.href,
            properties: customData
        });
    }

    // Track scroll events (throttled)
    trackScroll(customData = {}) {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        return this.track({
            event_type: 'scroll',
            event_name: 'Page Scroll',
            page_url: window.location.href,
            properties: {
                scroll_percent: scrollPercent,
                scroll_position: window.scrollY,
                ...customData
            }
        });
    }

    // Set user ID
    setUserId(userId) {
        this.userId = userId;
    }

    // Initialize automatic tracking
    initAutoTracking() {
        // Track page view on load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.trackPageView());
        } else {
            this.trackPageView();
        }

        // Track clicks on buttons and links
        document.addEventListener('click', (event) => {
            const element = event.target;
            if (element.tagName === 'BUTTON' || 
                element.tagName === 'A' || 
                element.getAttribute('role') === 'button') {
                this.trackClick(element);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            this.trackFormSubmit(event.target);
        });

        // Track scroll events (throttled)
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
                scrollTimeout = null;
            }, 1000); // Throttle to once per second
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackCustomEvent('Page Unload', 'navigation');
        });
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}
