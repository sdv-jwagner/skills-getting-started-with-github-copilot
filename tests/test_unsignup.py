def test_unsignup_removes_student_from_activity(client):
    response = client.delete(
        "/activities/Chess%20Club/signup",
        params={"email": "michael@mergington.edu"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "message": "Removed michael@mergington.edu from Chess Club"
    }

    activities_response = client.get("/activities")
    participants = activities_response.json()["Chess Club"]["participants"]

    assert "michael@mergington.edu" not in participants


def test_unsignup_returns_404_for_unknown_activity(client):
    response = client.delete(
        "/activities/Unknown%20Club/signup",
        params={"email": "student@mergington.edu"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}


def test_unsignup_returns_400_when_student_is_not_signed_up(client):
    response = client.delete(
        "/activities/Chess%20Club/signup",
        params={"email": "unknown@mergington.edu"},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Student is not signed up for this activity"
    }