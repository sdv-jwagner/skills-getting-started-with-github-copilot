document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.dataset.activity = name;

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">${details.participants.map(p => `<li><span>${p}</span><button class="remove-btn" title="Retirer ce participant" data-activity="${name}" data-email="${p}">&times;</button></li>`).join("")}</ul>`
          : `<p class="no-participants">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <details class="participants-details">
            <summary><strong>Participants</strong> (${details.participants.length}/${details.max_participants})</summary>
            ${participantsList}
          </details>
        `;

        // Handle remove participant buttons
      activityCard.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const activity = btn.dataset.activity;
          const email = btn.dataset.email;
          try {
            const res = await fetch(
              `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
              { method: "DELETE" }
            );
            if (res.ok) {
              const li = btn.closest("li");
              const ul = li.closest("ul");
              const detailsEl = li.closest("details");
              const summaryEl = detailsEl.querySelector("summary");
              li.remove();
              const remaining = ul.querySelectorAll("li").length;
              const maxMatch = summaryEl.textContent.match(/\/(\d+)/);
              const max = maxMatch ? maxMatch[1] : "?";
              summaryEl.innerHTML = `<strong>Participants</strong> (${remaining}/${max})`;
              if (remaining === 0) {
                ul.replaceWith(Object.assign(document.createElement("p"), {
                  className: "no-participants",
                  textContent: "No participants yet"
                }));
              }
              // Update availability text
              const availP = activityCard.querySelectorAll("p")[2];
              if (availP) availP.innerHTML = `<strong>Availability:</strong> ${details.max_participants - remaining} spots left`;
            } else {
              const err = await res.json();
              alert(err.detail || "Erreur lors de la suppression");
            }
          } catch (e) {
            alert("Erreur réseau");
          }
        });
      });

      activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        await fetchActivities();
        const updatedCard = Array.from(activitiesList.querySelectorAll(".activity-card"))
          .find((card) => card.dataset.activity === activity);
        if (updatedCard) {
          const participantsDetails = updatedCard.querySelector(".participants-details");
          if (participantsDetails) {
            participantsDetails.open = true;
          }
        }
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
