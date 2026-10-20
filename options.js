// Saves the user's name for the new tab greeting. chrome.storage.sync keeps it
// in the browser profile, so it follows the user to their other signed-in devices.
const form = document.forms[0];

const { name = "" } = await chrome.storage.sync.get("name");
form.name.value = name;

form.onsubmit = async (e) => {
  e.preventDefault();
  await chrome.storage.sync.set({ name: form.name.value.trim() });
  // Drop the saved cat so the next tab greets with the new name, not the old one
  await caches.delete("cats");
  form.querySelector("output").textContent = "Saved!";
};
