/**
 * Shows a div matching the "nav-" id. All other divs with a "nav-" id prefix
 * will be hidden.
 */
function showNavDiv(divId, display = "block") {
    const divs = document.querySelectorAll("div[id^='nav-']");
    divs.forEach(div => { div.style.display = "none"; });
    document.getElementById(`nav-${divId}`).style.display = display;
}
