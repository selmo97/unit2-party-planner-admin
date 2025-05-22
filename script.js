/*
  step 1: add the form ui via js
  step 2: build AddPartyForm() component
  step 3: add delete button to SelectedParty()

  side note: $ in variable names is a visual cue to make code more readable
             and to indicate that the element is a DOM element.

             keeps logic and UI variables separated!
  another side note: Pascal Casing for functions to mimic React componenet based approach
*/


// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2503-ftb-et-web-pt/";
const COHORT = ""; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="deleteBtn">Delete party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  //DELETE API call
  $party.querySelector("#deleteBtn").addEventListener("click", async () => {
  try {
    await fetch(API + "/events/" + selectedParty.id, {
      method: "DELETE"
    });
    selectedParty = null;
    await getParties();
  } catch (e) {
    console.error("Failed to delete party:", e);
  }
});

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function AddPartyForm() {
  const $form = document.createElement("form");

  $form.innerHTML = `
    <input name="name" placeholder="Name" required />
    <input name="description" placeholder="Description" required />
    <input name="date" type="date" required />
    <input name="location" placeholder="Location" required />
    <button>Add party</button>
  `;

  $form.addEventListener("submit", async (event) => {
    event.preventDefault(); //prevents the page from refressing
    const formData = new FormData($form);

    const newParty = {
      name: formData.get("name"),
      description: formData.get("description"),
      date: new Date(formData.get("date")).toISOString(),
      location: formData.get("location")
    };

    try {
      const response = await fetch(API + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParty)
      });
      const result = await response.json();
      await getParties(); // Refresh list
    } catch (e) {
      console.error("Failed to add party:", e);
    }
  });

  return $form;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>

                <!-- adding form ui -->
      <section> 
        <h2>Add a new party</h2> 
        <AddPartyForm></AddPartyForm>
      </section> 

      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("AddPartyForm").replaceWith(AddPartyForm()); //selecting the AddPartyForm and replacing entire element with the AddPartForm() function
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();