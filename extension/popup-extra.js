/* Blanks — le bouton des notifications de bureau (alertes de prix onglet ferme).
   La permission est optionnelle : Chrome la demande seulement si on clique ici. */
(function () {
  "use strict";
  const b = document.getElementById("notif");
  if (!b || !chrome.permissions) return;
  const P = { permissions: ["notifications"] };
  const upd = () =>
    chrome.permissions.contains(P, (ok) => {
      b.hidden = false;
      b.textContent = ok ? "Desktop alerts on · click to turn off" : "Enable desktop alerts";
      b.title = ok ? "Price alerts reach you even with every tab closed" : "Lets price alerts reach you even with every Terminal / Axiom tab closed";
      b.classList.toggle("on", !!ok);
    });
  b.onclick = () =>
    chrome.permissions.contains(P, (ok) => {
      ok ? chrome.permissions.remove(P, upd) : chrome.permissions.request(P, upd);
    });
  upd();
})();
