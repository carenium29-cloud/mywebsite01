from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
app = FastAPI(title="Carenium AI Engine")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Handle stale connections
                pass

manager = ConnectionManager()

def analyze_risk(vitals: Dict) -> Dict:
    """
    Threshold Logic:
    HR > 120 (Tachycardia)
    SpO2 < 90 (Hypoxia)
    Temp > 38.5 (High Fever)
    """
    hr = vitals.get("heart_rate", 0)
    spo2 = vitals.get("spo2", 100)
    temp = vitals.get("temperature", 37.0)
    
    is_critical = False
    alerts = []
    
    if hr > 120:
        is_critical = True
        alerts.append("Tachycardia Detected")
    if spo2 < 90:
        is_critical = True
        alerts.append("Hypoxia Warning")
    if temp > 38.5:
        is_critical = True
        alerts.append("Hyperthermia Detected")
        
    return {
        "is_critical": is_critical,
        "risk_level": "CRITICAL" if is_critical else "STABLE",
        "alerts": alerts
    }

@app.get("/")
async def root():
    return {"status": "AI Engine Online", "version": "1.0.0"}

@app.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive real-time vitals from bedside simulation
            data = await websocket.receive_text()
            vitals = json.loads(data)
            
            analysis = analyze_risk(vitals)
            
            if analysis["is_critical"]:
                payload = {
                    "type": "CRITICAL_ALERT",
                    "patient_id": vitals.get("patient_id"),
                    "vitals": vitals,
                    "analysis": analysis
                }
                await manager.broadcast(payload)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket)

@app.post("/ai/analyze")
async def manual_analyze(vitals: Dict):
    return analyze_risk(vitals)
