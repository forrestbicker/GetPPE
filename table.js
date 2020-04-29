var map = L.map('mapid', { zoomControl: false, }).setView([38, -96], 3.5);
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.dragging.disable();
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw&addlayer', {

    maxZoom: 18,
    // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    //     '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    //     'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
}).addTo(map);
var mapMarkers = L.layerGroup().addTo(map);
var ppeIDs = ["N95s", "Surgical Masks", "Face Shields", "Safety Goggles", "Gowns", "Gloves", "Hair Bonnets", "Hand Sanitizers", "Spray Bottles", "Shoecovers"]

var inputs = setupInputs(ppeIDs);

function setupInputs(inputIDs) {
    var htmlStr = "";

    for (const id of inputIDs) {
        htmlStr += `
    <td class="distributor">
        <input id="${id}" type="checkbox">
            <br>
                ${id}
        </td>`
    }

    document.getElementById('checkboxes').innerHTML = htmlStr;

    var inputDict = {}
    for (const id of inputIDs) {
        inputDict[id] = document.getElementById(id);
        inputDict[id].checked = true;
        inputDict[id].onclick = function () { updateTable() }; // TODO:
    }
    return inputDict
}
