import sys
import os
import socket

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def main():
    host = "0.0.0.0"
    port = 8000
    
    # Try importing uvicorn
    try:
        import uvicorn
    except ImportError:
        print("[CivicPulse Backend] ERROR: uvicorn is not installed in the active Python environment.")
        print("[CivicPulse Backend] Please run: pip install -r requirements.txt")
        sys.exit(1)

    print(f"[CivicPulse Backend] Starting FastAPI Server on http://{host}:{port} with live reload...")
    try:
        uvicorn.run("app.main:app", host=host, port=port, reload=True)
    except OSError as e:
        if getattr(e, 'errno', None) == 98 or "address already in use" in str(e).lower():
            print(f"[CivicPulse Backend] ERROR: Port {port} is already in use by another process.")
            print("[CivicPulse Backend] You can release it or terminate the existing process, then re-run.")
        raise

if __name__ == "__main__":
    main()
