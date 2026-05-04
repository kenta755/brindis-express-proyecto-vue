import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket server...');
    
    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Register user for status notifications
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (user.email) {
        this.register(user.email);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('⚠️ Max reconnection attempts reached, giving up');
        this.socket?.disconnect();
      }
    });

    // Handle status change notifications
    this.socket.on('statusChanged', (data: {
      email: string;
      isActive: boolean;
      timestamp: string;
      message: string;
    }) => {
      console.log('🔔 Status change notification received:', data);
      
      if (!data.isActive) {
        // User was deactivated - force logout
        console.log('🚫 User deactivated - forcing logout');
        alert(data.message || 'Tu cuenta ha sido desactivada. Serás redirigido al login.');
        
        // Clear session
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        localStorage.removeItem('user');
        localStorage.removeItem('googleLogin');
        
        // Redirect to login
        window.location.href = '/login';
      } else {
        // User was reactivated - show notification
        console.log('✅ User activated - notification shown');
        alert(data.message || 'Tu cuenta ha sido activada. Puedes continuar usando el sistema.');
      }
    });

    // Handle user status updates (for admin panel)
    this.socket.on('userStatusUpdated', (data: {
      email: string;
      isActive: boolean;
      timestamp: string;
    }) => {
      console.log('📊 User status updated (admin notification):', data);
      // This can be used to refresh the admin user list
    });

    this.socket.on('registered', (data: { success: boolean; email: string }) => {
      console.log('📝 Registration confirmation:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      // Unregister before disconnecting
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (user.email) {
        this.unregister(user.email);
      }
      
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  register(email: string) {
    if (this.socket?.connected) {
      this.socket.emit('register', email);
      console.log('📝 Registered for status notifications:', email);
    }
  }

  unregister(email: string) {
    if (this.socket?.connected) {
      this.socket.emit('unregister', email);
      console.log('📝 Unregistered from status notifications:', email);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
