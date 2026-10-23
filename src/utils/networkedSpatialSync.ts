/**
 * Networked-AFrame style Multiplayer WebAR Synchronization for iPhone Safari
 * Synchronizes multi-user 3D presence, object manipulation, and air drawing in real-time.
 */

export interface SpatialPeer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  lastSeen: number;
}

export interface NetworkedObjectState {
  id: string;
  glb?: string;
  label?: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  scale: number;
}

export type NetworkedEvent =
  | { type: 'presence'; peer: SpatialPeer }
  | { type: 'object_update'; object: NetworkedObjectState }
  | { type: 'object_remove'; id: string }
  | { type: 'air_stroke'; points: Array<{ x: number; y: number; z: number }>; color: string };

class NetworkedSpatialSync {
  private channel: BroadcastChannel | null = null;
  public localPeerId = `user-${Math.floor(Math.random() * 899 + 100)}`;
  public localPeerName = `Visitor ${this.localPeerId.replace('user-', '#')}`;
  public localPeerColor = ['#00f5d4', '#ff007f', '#fbbf24', '#a855f7', '#38bdf8'][
    Math.floor(Math.random() * 5)
  ];
  public peers = new Map<string, SpatialPeer>();
  private listeners: Array<(event: NetworkedEvent) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('visionos-spatial-multiplayer');
        this.channel.onmessage = (e) => {
          this.handleIncoming(e.data as NetworkedEvent);
        };
      } catch {
        // Fallback if BroadcastChannel unavailable
      }
    }
  }

  private handleIncoming(ev: NetworkedEvent) {
    if (!ev || !ev.type) return;

    if (ev.type === 'presence' && ev.peer.id !== this.localPeerId) {
      this.peers.set(ev.peer.id, { ...ev.peer, lastSeen: Date.now() });
    }

    this.listeners.forEach((cb) => cb(ev));
  }

  public subscribe(cb: (event: NetworkedEvent) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public broadcastPresence(pose: { x: number; y: number; z: number; yaw: number; pitch: number }) {
    const peer: SpatialPeer = {
      id: this.localPeerId,
      name: this.localPeerName,
      color: this.localPeerColor,
      x: pose.x,
      y: pose.y,
      z: pose.z,
      yaw: pose.yaw,
      pitch: pose.pitch,
      lastSeen: Date.now(),
    };
    this.channel?.postMessage({ type: 'presence', peer });
  }

  public broadcastObjectUpdate(obj: NetworkedObjectState) {
    this.channel?.postMessage({ type: 'object_update', object: obj });
  }

  public broadcastObjectRemove(id: string) {
    this.channel?.postMessage({ type: 'object_remove', id });
  }

  public broadcastAirStroke(points: Array<{ x: number; y: number; z: number }>, color: string) {
    this.channel?.postMessage({ type: 'air_stroke', points, color });
  }
}

export const networkedSync = new NetworkedSpatialSync();
