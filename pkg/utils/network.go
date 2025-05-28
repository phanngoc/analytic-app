package utils

import (
	"net"
	"net/http"
	"strings"
)

// GetRealIP extracts the real IP address from the request
func GetRealIP(r *http.Request) string {
	// Check X-Forwarded-For header
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		// Take the first IP in the list
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if isValidIP(ip) {
				return ip
			}
		}
	}

	// Check X-Real-IP header
	xri := r.Header.Get("X-Real-IP")
	if xri != "" && isValidIP(xri) {
		return xri
	}

	// Fallback to RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// isValidIP checks if the given string is a valid IP address
func isValidIP(ip string) bool {
	return net.ParseIP(ip) != nil
}

// GenerateSessionID generates a simple session ID
func GenerateSessionID(userAgent, ip string) string {
	// In a real implementation, you might want to use a more sophisticated method
	// For now, we'll use a simple approach
	return ip + "-" + userAgent[:min(10, len(userAgent))]
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
