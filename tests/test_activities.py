def test_get_activities_returns_all_defined_activities(client):
    response = client.get("/activities")

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 9
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_get_activities_returns_expected_activity_shape(client):
    response = client.get("/activities")

    assert response.status_code == 200
    activity = response.json()["Chess Club"]

    assert activity["description"]
    assert activity["schedule"]
    assert activity["max_participants"] == 12
    assert activity["participants"] == [
        "michael@mergington.edu",
        "daniel@mergington.edu",
    ]