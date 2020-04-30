console.log(Date.now())
var responseDatabase;
$.getJSON("https://raw.githubusercontent.com/forrestbicker/GetPPE/master/USCities.json", function (zipcodedata) {
    $.getJSON("http://gsx2json.com/api?id=1FKx19MJpmANmBKCha47LFOm2RDwH57JGPKvHJJ1iRMo&columns=false&sheet=2").then(function (data) {
        console.log(Date.now())
        responseDatabase = data.rows;
        for (const row of responseDatabase) {
            row.location = zipcodedata[row.zipcode]
        }
        updateTable();
    });
});

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

// create markers


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
function updateTable() {
    var htmlStr = "";
    mapMarkers.clearLayers();

    for (const row of responseDatabase) {
        if (passesFilter(row)) {
            var marker = new MyCustomMarker([row.location.latitude, row.location.longitude]);

            marker.bindPopup(`${titleCase(row.location.city)}, ${row.location.state} - ${row.name}`, { showOnMouseOver: true })

            // marker.on('mouseover', function (event) {
            //     marker.openPopup();
            //     console.log(this);
            // });
            // marker.on('mouseout', function (event) {
            //     marker.closePopup();
            // });

            marker.addTo(mapMarkers);;
            htmlStr +=
                `
                <div>
                    <h1>${titleCase(row.location.city)}, ${row.location.state} - ${row.name}</h1>
                    <h3>${row.organization}</h3>
                    <table>
                        <tr>
                            <td class="borderless">
                                <h3><u>Request</u></h3>`;
            for (const ppe of ppeIDs) {
                var ppeQuantity = row[ppe.toLowerCase()]
                if (ppeQuantity > 0) {
                    htmlStr += `<li>${ppe}: ${ppeQuantity}</li>`;
                }
            }
            htmlStr += `
                            </td>
                            <td class="borderless">
                                <h3><u>Contact</u></h3>
                                <li>Email: ${row.email}</li>
                                <li>Phone: ${row.phone}</li>
                                <h3><u>Notes</u></h3>
                                <li>${row.notes}</li>
                            </td>
                        </tr>
                    </table>
                </div>
                <hr>`;
        }
        document.getElementById('listing').innerHTML = htmlStr;
    }
}

function passesFilter(row) {
    for (const ppe in inputs) {
        if (inputs[ppe].checked && row[ppe.toLowerCase()] > 0) {
            return true;
        }
    }
    return false;
}

function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}


var MyCustomMarker = L.Marker.extend({

    bindPopup: function (htmlContent, options) {

        if (options && options.showOnMouseOver) {

            // call the super method
            L.Marker.prototype.bindPopup.apply(this, [htmlContent, options]);

            // unbind the click event
            this.off("click", this.openPopup, this);

            // bind to mouse over
            this.on("mouseover", function (e) {

                // get the element that the mouse hovered onto
                var target = e.originalEvent.fromElement || e.originalEvent.relatedTarget;
                var parent = this._getParent(target, "leaflet-popup");

                // check to see if the element is a popup, and if it is this marker's popup
                if (parent == this._popup._container)
                    return true;

                // show the popup
                this.openPopup();

            }, this);

            // and mouse out
            this.on("mouseout", function (e) {

                // get the element that the mouse hovered onto
                var target = e.originalEvent.toElement || e.originalEvent.relatedTarget;

                // check to see if the element is a popup
                if (this._getParent(target, "leaflet-popup")) {

                    L.DomEvent.on(this._popup._container, "mouseout", this._popupMouseOut, this);
                    return true;

                }

                // hide the popup
                this.closePopup();

            }, this);

        }

    },

    _popupMouseOut: function (e) {

        // detach the event
        L.DomEvent.off(this._popup, "mouseout", this._popupMouseOut, this);

        // get the element that the mouse hovered onto
        var target = e.toElement || e.relatedTarget;

        // check to see if the element is a popup
        if (this._getParent(target, "leaflet-popup"))
            return true;

        // check to see if the marker was hovered back onto
        if (target == this._icon)
            return true;

        // hide the popup
        this.closePopup();

    },

    _getParent: function (element, className) {


        var parent = element.parentNode;

        while (parent != null) {
            if (parent.className && L.DomUtil.hasClass(parent, className))
                return parent;

            parent = parent.parentNode;

        }

        return false;

    }

});

function parseGSJSON(json) {
    var out = [];
    var keys = []
    var i = 0;
    while (json["feed"]["entry"][i]["gs$cell"]["row"] === "1") {
        keys.push(json["feed"]["entry"][i]["gs$cell"]["$t"]);
        i++;
    }
    while (i < json["feed"]["entry"].length) {
        var data = json["feed"]["entry"][i]["gs$cell"];
        var row = data["row"] - 2;
        var col = keys[data["col"] - 1];
        if (out[row] === undefined) {
            out[row] = {};
        }
        var cellValue = data["$t"];
        if (isNaN(cellValue)) {
            out[row][col] = data["$t"];
        } else {
            out[row][col] = parseFloat(data["$t"]);
        }
        i++;
    }
    // for (const cell in json["feed"]["entry"]) {
    //     var data = json["feed"]["entry"][cell]["gs$cell"]
    //     if (data["row"] === "1") {
    //         keys.push(data["$t"]);
    //     } else {
    //         var dict = {}
    //         dict[key] =
    //             out[keys[data["col"] - 1]].push(data["$t"]);
    //     }
    // }
    return out;
}