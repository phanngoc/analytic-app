package handlers

import (
	"analytic-app/internal/models"
	"analytic-app/internal/services"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now
	},
}

type WebSocketHandler struct {
	hub          *Hub
	adminService *services.AdminService
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	projectID uuid.UUID
}

type WebSocketMessage struct {
	Type      string      `json:"type"`
	ProjectID string      `json:"project_id,omitempty"`
	Event     interface{} `json:"event,omitempty"`
	Timestamp string      `json:"timestamp"`
}

func NewWebSocketHandler(adminService *services.AdminService) *WebSocketHandler {
	hub := &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}

	go hub.run()

	return &WebSocketHandler{
		hub:          hub,
		adminService: adminService,
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("WebSocket client connected for project %s", client.projectID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				h.mu.Unlock()
				log.Printf("WebSocket client disconnected for project %s", client.projectID)
			} else {
				h.mu.Unlock()
			}

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					delete(h.clients, client)
					close(client.send)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastEvent sends an event to all connected clients for a specific project
func (h *WebSocketHandler) BroadcastEvent(event *models.Event) {
	if event.ProjectID == nil {
		return
	}

	message := WebSocketMessage{
		Type:      "new_event",
		ProjectID: event.ProjectID.String(),
		Event:     event,
		Timestamp: event.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling WebSocket message: %v", err)
		return
	}

	// Send to specific project clients
	h.hub.mu.RLock()
	for client := range h.hub.clients {
		if client.projectID == *event.ProjectID {
			select {
			case client.send <- data:
			default:
				delete(h.hub.clients, client)
				close(client.send)
			}
		}
	}
	h.hub.mu.RUnlock()
}

// HandleWebSocket handles WebSocket connections for real-time events
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		hub:       h.hub,
		conn:      conn,
		send:      make(chan []byte, 256),
		projectID: projectID,
	}

	client.hub.register <- client

	// Start goroutines for handling the connection
	go client.writePump()
	go client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetPongHandler(func(string) error {
		return nil
	})

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}
