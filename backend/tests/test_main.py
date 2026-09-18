from fastapi.testclient import TestClient
from app.main import app

# Create a fake client to send requests to our app
client = TestClient(app)

def test_health_check():
    """
    Test that the /api/health endpoint returns a 200 OK
    and the correct JSON structure.
    """
    response = client.get("/api/health")
    
    # 1. Check that the HTTP status code is 200 (Success)
    assert response.status_code == 200
    
    # 2. Check the JSON payload
    data = response.json()
    assert data["status"] == "healthy"
    assert "project" in data
    assert "version" in data
